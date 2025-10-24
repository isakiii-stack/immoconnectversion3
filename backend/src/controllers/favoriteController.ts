import { Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20, type } = req.query;

    const where: any = { userId };
    if (type === 'listing') {
      where.listingId = { not: null };
    } else if (type === 'buyer-request') {
      where.buyerRequestId = { not: null };
    }

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                city: true,
                country: true
              }
            },
            photos: {
              where: { isMain: true },
              take: 1
            },
            _count: {
              select: {
                favorites: true,
                messages: true
              }
            }
          }
        },
        buyerRequest: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                city: true,
                country: true
              }
            },
            _count: {
              select: {
                favorites: true,
                messages: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.favorite.count({ where });

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { listingId, buyerRequestId } = req.body;
    const userId = req.user!.id;

    // Validate that at least one ID is provided
    if (!listingId && !buyerRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Either listingId or buyerRequestId must be provided'
      });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        listingId: listingId || null,
        buyerRequestId: buyerRequestId || null
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Already added to favorites'
      });
    }

    // Verify listing or buyer request exists
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId }
      });
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found'
        });
      }
    }

    if (buyerRequestId) {
      const buyerRequest = await prisma.buyerRequest.findUnique({
        where: { id: buyerRequestId }
      });
      if (!buyerRequest) {
        return res.status(404).json({
          success: false,
          message: 'Buyer request not found'
        });
      }
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        listingId: listingId || null,
        buyerRequestId: buyerRequestId || null
      },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            photos: {
              where: { isMain: true },
              take: 1
            }
          }
        },
        buyerRequest: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    logger.info(`Favorite added: ${favorite.id} by ${req.user!.email}`);

    res.status(201).json({
      success: true,
      message: 'Added to favorites successfully',
      data: { favorite }
    });
  } catch (error) {
    logger.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const favorite = await prisma.favorite.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await prisma.favorite.delete({
      where: { id }
    });

    logger.info(`Favorite removed: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    logger.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { listingId, buyerRequestId } = req.query;
    const userId = req.user!.id;

    if (!listingId && !buyerRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Either listingId or buyerRequestId must be provided'
      });
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        listingId: listingId as string || null,
        buyerRequestId: buyerRequestId as string || null
      }
    });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite?.id || null
      }
    });
  } catch (error) {
    logger.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
