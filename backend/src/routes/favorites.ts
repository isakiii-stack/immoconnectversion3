import express from 'express';
import { body, query } from 'express-validator';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite,
  checkFavorite
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const addFavoriteValidation = [
  body('listingId').optional().notEmpty().withMessage('Listing ID must not be empty'),
  body('buyerRequestId').optional().notEmpty().withMessage('Buyer request ID must not be empty')
];

// Routes
router.get('/', getFavorites);
router.post('/', addFavoriteValidation, validate, addFavorite);
router.delete('/:id', removeFavorite);
router.get('/check', checkFavorite);

export default router;
