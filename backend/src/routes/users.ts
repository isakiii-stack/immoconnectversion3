import express from 'express';
import { body } from 'express-validator';
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  deleteAccount,
  getUserListings,
  getUserBuyerRequests,
  getUserStats
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
  body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters long'),
  body('country').optional().trim().isLength({ min: 2 }).withMessage('Country must be at least 2 characters long'),
  body('role').optional().isIn(['BUYER', 'SELLER', 'BOTH']).withMessage('Role must be BUYER, SELLER, or BOTH')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.post('/avatar', uploadAvatar);
router.delete('/account', deleteAccount);
router.get('/listings', getUserListings);
router.get('/buyer-requests', getUserBuyerRequests);
router.get('/stats', getUserStats);

export default router;
