import { Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isRead: false
          }
        });

        return {
          ...conversation,
          unreadCount
        };
      })
    );

    const total = await prisma.conversation.count({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        conversations: conversationsWithUnread,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
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
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.message.count({
      where: { conversationId: id }
    });

    res.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, listingId, buyerRequestId } = req.body;
    const senderId = req.user!.id;

    // Check if users are different
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId }
        ]
      }
    });

    if (existingConversation) {
      return res.json({
        success: true,
        message: 'Conversation already exists',
        data: { conversation: existingConversation }
      });
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: senderId,
        user2Id: receiverId
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`New conversation created: ${conversation.id} between ${senderId} and ${receiverId}`);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation }
    });
  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, conversationId, listingId, buyerRequestId } = req.body;
    const senderId = req.user!.id;

    // Check if conversation exists and user is part of it
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: senderId },
          { user2Id: senderId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
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

    logger.info(`New message sent: ${message.id} in conversation ${conversationId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if conversation exists and user is part of it
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Mark all messages in this conversation as read (except user's own messages)
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if message exists and user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: userId
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }

    await prisma.message.delete({
      where: { id }
    });

    logger.info(`Message deleted: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if conversation exists and user is part of it
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Delete conversation and all messages (cascade)
    await prisma.conversation.delete({
      where: { id }
    });

    logger.info(`Conversation deleted: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
