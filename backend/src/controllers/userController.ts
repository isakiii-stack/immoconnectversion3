import { Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        city: true,
        country: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, city, country, role } = req.body;
    const userId = req.user!.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(city && { city }),
        ...(country && { country }),
        ...(role && { role })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        city: true,
        country: true,
        role: true,
        isVerified: true,
        updatedAt: true
      }
    });

    logger.info(`User profile updated: ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    // In a real implementation, you would handle file upload here
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl: 'placeholder-avatar-url' }
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id: userId }
    });

    logger.info(`User account deleted: ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserListings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        photos: true,
        _count: {
          select: {
            messages: true,
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.listing.count({ where });

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserBuyerRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const buyerRequests = await prisma.buyerRequest.findMany({
      where,
      include: {
        _count: {
          select: {
            messages: true,
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.buyerRequest.count({ where });

    res.json({
      success: true,
      data: {
        buyerRequests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get user buyer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [
      listingsCount,
      buyerRequestsCount,
      messagesCount,
      favoritesCount
    ] = await Promise.all([
      prisma.listing.count({ where: { userId } }),
      prisma.buyerRequest.count({ where: { userId } }),
      prisma.message.count({ 
        where: { 
          OR: [
            { senderId: userId },
            { conversation: { OR: [{ user1Id: userId }, { user2Id: userId }] } }
          ]
        } 
      }),
      prisma.favorite.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: {
        listings: listingsCount,
        buyerRequests: buyerRequestsCount,
        messages: messagesCount,
        favorites: favoritesCount
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
