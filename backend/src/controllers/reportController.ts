import { Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reason, description, listingId, buyerRequestId } = req.body;
    const reporterId = req.user!.id;

    // Validate that at least one ID is provided
    if (!listingId && !buyerRequestId) {
      return res.status(400).json({
        success: false,
        message: 'Either listingId or buyerRequestId must be provided'
      });
    }

    // Check if already reported by this user
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId,
        listingId: listingId || null,
        buyerRequestId: buyerRequestId || null
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Already reported this item'
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

    const report = await prisma.report.create({
      data: {
        reason,
        description: description || null,
        reporterId,
        listingId: listingId || null,
        buyerRequestId: buyerRequestId || null
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        buyerRequest: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    logger.info(`New report created: ${report.id} by ${req.user!.email}`);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report }
    });
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        buyerRequest: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.report.count({ where });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        buyerRequest: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    logger.info(`Report status updated: ${id} to ${status} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: { report: updatedReport }
    });
  } catch (error) {
    logger.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await prisma.report.delete({
      where: { id }
    });

    logger.info(`Report deleted: ${id} by ${req.user!.email}`);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
