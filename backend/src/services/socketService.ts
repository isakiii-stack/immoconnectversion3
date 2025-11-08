import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const socketHandler = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    const authSocket = socket as any as AuthenticatedSocket;
    try {
      const token = authSocket.handshake.auth.token || authSocket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      authSocket.userId = user.id;
      authSocket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as any as AuthenticatedSocket;
    logger.info(`User connected: ${authSocket.user?.email} (${authSocket.id})`);

    // Join user to their personal room
    if (authSocket.userId) {
      authSocket.join(`user:${authSocket.userId}`);
    }

    // Handle joining conversation room
    authSocket.on('join-conversation', async (conversationId: string) => {
      try {
        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { user1Id: authSocket.userId },
              { user2Id: authSocket.userId }
            ]
          }
        });

        if (!conversation) {
          authSocket.emit('error', { message: 'Conversation not found' });
          return;
        }

        authSocket.join(`conversation:${conversationId}`);
        logger.info(`User ${authSocket.user?.email} joined conversation ${conversationId}`);
      } catch (error) {
        logger.error('Join conversation error:', error);
        authSocket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation room
    authSocket.on('leave-conversation', (conversationId: string) => {
      authSocket.leave(`conversation:${conversationId}`);
      logger.info(`User ${authSocket.user?.email} left conversation ${conversationId}`);
    });

    // Handle sending message
    authSocket.on('send-message', async (data: {
      conversationId: string;
      content: string;
      listingId?: string;
      buyerRequestId?: string;
    }) => {
      try {
        const { conversationId, content, listingId, buyerRequestId } = data;

        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { user1Id: authSocket.userId },
              { user2Id: authSocket.userId }
            ]
          },
          include: {
            user1: true,
            user2: true
          }
        });

        if (!conversation) {
          authSocket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            content,
            senderId: authSocket.userId!,
            conversationId,
            listingId: listingId || null,
            buyerRequestId: buyerRequestId || null
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            listing: {
              select: {
                id: true,
                title: true,
                price: true,
                photos: {
                  where: { isMain: true },
                  take: 1
                }
              }
            },
            buyerRequest: {
              select: {
                id: true,
                title: true,
                maxPrice: true
              }
            }
          }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Emit message to conversation room
        io.to(`conversation:${conversationId}`).emit('new-message', {
          message,
          conversationId
        });

        // Emit notification to other user's personal room
        const otherUserId = conversation.user1Id === authSocket.userId ? conversation.user2Id : conversation.user1Id;
        io.to(`user:${otherUserId}`).emit('message-notification', {
          message,
          conversationId,
          sender: authSocket.user
        });

        logger.info(`Message sent in conversation ${conversationId} by ${authSocket.user?.email}`);
      } catch (error) {
        logger.error('Send message error:', error);
        authSocket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    authSocket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      authSocket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId: authSocket.userId,
        isTyping: data.isTyping,
        user: authSocket.user
      });
    });

    // Handle message read status
    authSocket.on('mark-as-read', async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: authSocket.userId },
            isRead: false
          },
          data: { isRead: true }
        });

        // Notify other user that messages were read
        authSocket.to(`conversation:${conversationId}`).emit('messages-read', {
          conversationId,
          readBy: authSocket.userId
        });

        logger.info(`Messages marked as read in conversation ${conversationId} by ${authSocket.user?.email}`);
      } catch (error) {
        logger.error('Mark as read error:', error);
        authSocket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle online status
    authSocket.on('set-online', () => {
      authSocket.broadcast.emit('user-online', {
        userId: authSocket.userId,
        user: authSocket.user
      });
    });

    authSocket.on('set-offline', () => {
      authSocket.broadcast.emit('user-offline', {
        userId: authSocket.userId,
        user: authSocket.user
      });
    });

    // Handle disconnection
    authSocket.on('disconnect', (reason: any) => {
      logger.info(`User disconnected: ${authSocket.user?.email} (${authSocket.id}) - ${reason}`);
      
      // Notify other users that this user went offline
      authSocket.broadcast.emit('user-offline', {
        userId: authSocket.userId,
        user: authSocket.user
      });
    });

    // Handle errors
    authSocket.on('error', (error: any) => {
      logger.error(`Socket error for user ${authSocket.user?.email}:`, error);
    });
  });

  // Handle server errors
  io.on('error', (error: any) => {
    logger.error('Socket.IO server error:', error);
  });
};
