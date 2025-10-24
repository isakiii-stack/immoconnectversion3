import express from 'express';
import { body, query } from 'express-validator';
import { 
  getListings, 
  getListing, 
  createListing, 
  updateListing, 
  deleteListing,
  incrementViews,
  getFeaturedListings,
  searchListings
} from '../controllers/listingController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const createListingValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('surface').isFloat({ min: 0 }).withMessage('Surface must be a positive number'),
  body('rooms').isInt({ min: 0 }).withMessage('Rooms must be a non-negative integer'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('propertyType').isIn(['APARTMENT', 'HOUSE', 'STUDIO', 'VILLA', 'OFFICE', 'COMMERCIAL', 'LAND', 'OTHER']).withMessage('Invalid property type'),
  body('listingType').isIn(['SALE', 'RENT', 'BOTH']).withMessage('Invalid listing type'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('city').trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('country').trim().isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
  body('latitude').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional().isFloat().withMessage('Longitude must be a valid number')
];

const updateListingValidation = [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('surface').optional().isFloat({ min: 0 }).withMessage('Surface must be a positive number'),
  body('rooms').optional().isInt({ min: 0 }).withMessage('Rooms must be a non-negative integer'),
  body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('propertyType').optional().isIn(['APARTMENT', 'HOUSE', 'STUDIO', 'VILLA', 'OFFICE', 'COMMERCIAL', 'LAND', 'OTHER']).withMessage('Invalid property type'),
  body('listingType').optional().isIn(['SALE', 'RENT', 'BOTH']).withMessage('Invalid listing type'),
  body('address').optional().trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('country').optional().trim().isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
  body('latitude').optional().isFloat().withMessage('Latitude must be a valid number'),
  body('longitude').optional().isFloat().withMessage('Longitude must be a valid number'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SOLD', 'RENTED']).withMessage('Invalid status')
];

// Public routes
router.get('/', optionalAuth, getListings);
router.get('/featured', getFeaturedListings);
router.get('/search', optionalAuth, searchListings);
router.get('/:id', optionalAuth, getListing);
router.post('/:id/view', incrementViews);

// Protected routes
router.post('/', authenticate, createListingValidation, validate, createListing);
router.put('/:id', authenticate, updateListingValidation, validate, updateListing);
router.delete('/:id', authenticate, deleteListing);

export default router;
