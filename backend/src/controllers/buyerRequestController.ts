import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getBuyerRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      propertyType, 
      minPrice, 
      maxPrice, 
      minSurface, 
      maxSurface, 
      city, 
      country,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = { status: 'ACTIVE' };

    // Filters
    if (propertyType) where.propertyType = propertyType;
    if (minPrice) where.maxPrice = { ...where.maxPrice, gte: Number(minPrice) };
    if (maxPrice) where.minPrice = { ...where.minPrice, lte: Number(maxPrice) };
    if (minSurface) where.maxSurface = { ...where.maxSurface, gte: Number(minSurface) };
    if (maxSurface) where.minSurface = { ...where.minSurface, lte: Number(maxSurface) };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };

    const buyerRequests = await prisma.buyerRequest.findMany({
      where,
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
      },
      orderBy: { [sortBy as string]: sortOrder },
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
    logger.error('Get buyer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getBuyerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const buyerRequest = await prisma.buyerRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            city: true,
            country: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            favorites: true,
            messages: true
          }
        }
      }
    });

    if (!buyerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Buyer request not found'
      });
    }

    res.json({
      success: true,
      data: { buyerRequest }
    });
  } catch (error) {
    logger.error('Get buyer request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createBuyerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      maxPrice,
      minPrice,
      minSurface,
      maxSurface,
      minRooms,
      maxRooms,
      propertyType,
      city,
      country,
      latitude,
      longitude
    } = req.body;

    const buyerRequest = await prisma.buyerRequest.create({
      data: {
        title,
        description,
        maxPrice: Number(maxPrice),
        minPrice: minPrice ? Number(minPrice) : null,
        minSurface: minSurface ? Number(minSurface) : null,
        maxSurface: maxSurface ? Number(maxSurface) : null,
        minRooms: minRooms ? Number(minRooms) : null,
        maxRooms: maxRooms ? Number(maxRooms) : null,
        propertyType: propertyType || null,
        city,
        country,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        userId: req.user!.id
      },
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
    });

    logger.info(`New buyer request created: ${buyerRequest.id} by ${req.user!.email}`);

    res.status(201).json({
      success: true,
      message: 'Buyer request created successfully',
      data: { buyerRequest }
    });
  } catch (error) {
    logger.error('Create buyer request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateBuyerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if buyer request exists and belongs to user
    const existingBuyerRequest = await prisma.buyerRequest.findFirst({
      where: { id, userId }
    });

    if (!existingBuyerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Buyer request not found or you do not have permission to update it'
      });
    }

    const updatedBuyerRequest = await prisma.buyerRequest.update({
      where: { id },
      data: req.body,
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
    });

    logger.info(`Buyer request updated: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Buyer request updated successfully',
      data: { buyerRequest: updatedBuyerRequest }
    });
  } catch (error) {
    logger.error('Update buyer request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteBuyerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if buyer request exists and belongs to user
    const existingBuyerRequest = await prisma.buyerRequest.findFirst({
      where: { id, userId }
    });

    if (!existingBuyerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Buyer request not found or you do not have permission to delete it'
      });
    }

    await prisma.buyerRequest.delete({
      where: { id }
    });

    logger.info(`Buyer request deleted: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Buyer request deleted successfully'
    });
  } catch (error) {
    logger.error('Delete buyer request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.buyerRequest.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    logger.error('Increment views error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const searchBuyerRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      page = 1, 
      limit = 12,
      propertyType,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      city,
      country
    } = req.query;

    const where: any = { status: 'ACTIVE' };

    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { city: { contains: q as string, mode: 'insensitive' } }
      ];
    }

    // Filters
    if (propertyType) where.propertyType = propertyType;
    if (minPrice) where.maxPrice = { ...where.maxPrice, gte: Number(minPrice) };
    if (maxPrice) where.minPrice = { ...where.minPrice, lte: Number(maxPrice) };
    if (minSurface) where.maxSurface = { ...where.maxSurface, gte: Number(minSurface) };
    if (maxSurface) where.minSurface = { ...where.minSurface, lte: Number(maxSurface) };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };

    const buyerRequests = await prisma.buyerRequest.findMany({
      where,
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
    logger.error('Search buyer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
