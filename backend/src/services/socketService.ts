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
    logger.info(`User connected: ${socket.user?.email} (${socket.id})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining conversation room
    socket.on('join-conversation', async (conversationId: string) => {
      try {
        // Verify user is part of this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { user1Id: socket.userId },
              { user2Id: socket.userId }
            ]
          }
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${socket.user?.email} joined conversation ${conversationId}`);
      } catch (error) {
        logger.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation room
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.user?.email} left conversation ${conversationId}`);
    });

    // Handle sending message
    socket.on('send-message', async (data: {
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
              { user1Id: socket.userId },
              { user2Id: socket.userId }
            ]
          },
          include: {
            user1: true,
            user2: true
          }
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            content,
            senderId: socket.userId!,
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
        const otherUserId = conversation.user1Id === socket.userId ? conversation.user2Id : conversation.user1Id;
        io.to(`user:${otherUserId}`).emit('message-notification', {
          message,
          conversationId,
          sender: socket.user
        });

        logger.info(`Message sent in conversation ${conversationId} by ${socket.user?.email}`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
        user: socket.user
      });
    });

    // Handle message read status
    socket.on('mark-as-read', async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: socket.userId },
            isRead: false
          },
          data: { isRead: true }
        });

        // Notify other user that messages were read
        socket.to(`conversation:${conversationId}`).emit('messages-read', {
          conversationId,
          readBy: socket.userId
        });

        logger.info(`Messages marked as read in conversation ${conversationId} by ${socket.user?.email}`);
      } catch (error) {
        logger.error('Mark as read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle online status
    socket.on('set-online', () => {
      socket.broadcast.emit('user-online', {
        userId: socket.userId,
        user: socket.user
      });
    });

    socket.on('set-offline', () => {
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        user: socket.user
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason: any) => {
      logger.info(`User disconnected: ${socket.user?.email} (${socket.id}) - ${reason}`);
      
      // Notify other users that this user went offline
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        user: socket.user
      });
    });

    // Handle errors
    socket.on('error', (error: any) => {
      logger.error(`Socket error for user ${socket.user?.email}:`, error);
    });
  });

  // Handle server errors
  io.on('error', (error: any) => {
    logger.error('Socket.IO server error:', error);
  });
};
