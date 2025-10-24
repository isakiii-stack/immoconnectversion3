import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      propertyType, 
      listingType, 
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
    if (listingType) where.listingType = listingType;
    if (minPrice) where.price = { ...where.price, gte: Number(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };
    if (minSurface) where.surface = { ...where.surface, gte: Number(minSurface) };
    if (maxSurface) where.surface = { ...where.surface, lte: Number(maxSurface) };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };

    const listings = await prisma.listing.findMany({
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
      },
      orderBy: { [sortBy as string]: sortOrder },
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
    logger.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
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
        photos: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            favorites: true,
            messages: true
          }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    logger.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      surface,
      rooms,
      bedrooms,
      bathrooms,
      propertyType,
      listingType,
      address,
      city,
      country,
      latitude,
      longitude
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: Number(price),
        surface: Number(surface),
        rooms: Number(rooms),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        propertyType,
        listingType,
        address,
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
        },
        photos: true
      }
    });

    logger.info(`New listing created: ${listing.id} by ${req.user!.email}`);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: { listing }
    });
  } catch (error) {
    logger.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findFirst({
      where: { id, userId }
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or you do not have permission to update it'
      });
    }

    const updatedListing = await prisma.listing.update({
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
        },
        photos: true
      }
    });

    logger.info(`Listing updated: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing: updatedListing }
    });
  } catch (error) {
    logger.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findFirst({
      where: { id, userId }
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or you do not have permission to delete it'
      });
    }

    await prisma.listing.delete({
      where: { id }
    });

    logger.info(`Listing deleted: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    logger.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.listing.update({
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

export const getFeaturedListings = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;

    const listings = await prisma.listing.findMany({
      where: { 
        status: 'ACTIVE',
        isPremium: true
      },
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
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json({
      success: true,
      data: { listings }
    });
  } catch (error) {
    logger.error('Get featured listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const searchListings = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      page = 1, 
      limit = 12,
      propertyType,
      listingType,
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
        { address: { contains: q as string, mode: 'insensitive' } },
        { city: { contains: q as string, mode: 'insensitive' } }
      ];
    }

    // Filters
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (minPrice) where.price = { ...where.price, gte: Number(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };
    if (minSurface) where.surface = { ...where.surface, gte: Number(minSurface) };
    if (maxSurface) where.surface = { ...where.surface, lte: Number(maxSurface) };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };

    const listings = await prisma.listing.findMany({
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
    logger.error('Search listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
