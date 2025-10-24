import express from 'express';
import { body } from 'express-validator';
import { 
  createReport, 
  getReports, 
  updateReportStatus,
  deleteReport
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createReportValidation = [
  body('reason').trim().isLength({ min: 5, max: 200 }).withMessage('Reason must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('listingId').optional().notEmpty().withMessage('Listing ID must not be empty'),
  body('buyerRequestId').optional().notEmpty().withMessage('Buyer request ID must not be empty')
];

const updateReportStatusValidation = [
  body('status').isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Status must be PENDING, APPROVED, or REJECTED')
];

// Routes
router.post('/', createReportValidation, validate, createReport);
router.get('/', authorize('ADMIN'), getReports);
router.put('/:id/status', authorize('ADMIN'), updateReportStatusValidation, validate, updateReportStatus);
router.delete('/:id', authorize('ADMIN'), deleteReport);

export default router;
