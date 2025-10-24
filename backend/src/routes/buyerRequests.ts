import express from 'express';
import { body, query } from 'express-validator';
import { 
  getBuyerRequests, 
  getBuyerRequest, 
  createBuyerRequest, 
  updateBuyerRequest, 
  deleteBuyerRequest,
  incrementViews,
  searchBuyerRequests
} from '../controllers/buyerRequestController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const createBuyerRequestValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('maxPrice').isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  body('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  body('minSurface').optional().isFloat({ min: 0 }).withMessage('Min surface must be a positive number'),
  body('maxSurface').optional().isFloat({ min: 0 }).withMessage('Max surface must be a positive number'),
  body('minRooms').optional().isInt({ min: 0 }).withMessage('Min rooms must be a non-negative integer'),
  body('maxRooms').optional().isInt({ min: 0 }).withMessage('Max rooms must be a non-negative integer'),
  body('propertyType').optional().isIn(['APARTMENT', 'HOUSE', 'STUDIO', 'VILLA', 'OFFICE', 'COMMERCIAL', 'LAND', 'OTHER']).withMessage('Invalid property type'),
  body('city').trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('country').trim().isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
  body('latitude').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional().isFloat().withMessage('Longitude must be a valid number')
];

const updateBuyerRequestValidation = [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  body('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  body('minSurface').optional().isFloat({ min: 0 }).withMessage('Min surface must be a positive number'),
  body('maxSurface').optional().isFloat({ min: 0 }).withMessage('Max surface must be a positive number'),
  body('minRooms').optional().isInt({ min: 0 }).withMessage('Min rooms must be a non-negative integer'),
  body('maxRooms').optional().isInt({ min: 0 }).withMessage('Max rooms must be a non-negative integer'),
  body('propertyType').optional().isIn(['APARTMENT', 'HOUSE', 'STUDIO', 'VILLA', 'OFFICE', 'COMMERCIAL', 'LAND', 'OTHER']).withMessage('Invalid property type'),
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('country').optional().trim().isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
  body('latitude').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional().isFloat().withMessage('Longitude must be a valid number'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'FULFILLED']).withMessage('Invalid status')
];

// Public routes
router.get('/', optionalAuth, getBuyerRequests);
router.get('/search', optionalAuth, searchBuyerRequests);
router.get('/:id', optionalAuth, getBuyerRequest);
router.post('/:id/view', incrementViews);

// Protected routes
router.post('/', authenticate, createBuyerRequestValidation, validate, createBuyerRequest);
router.put('/:id', authenticate, updateBuyerRequestValidation, validate, updateBuyerRequest);
router.delete('/:id', authenticate, deleteBuyerRequest);

export default router;
