import express from 'express';
import { body, query } from 'express-validator';
import { 
  getConversations, 
  getConversation, 
  createConversation, 
  sendMessage, 
  markAsRead,
  deleteMessage,
  deleteConversation
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createConversationValidation = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('listingId').optional().notEmpty().withMessage('Listing ID must not be empty'),
  body('buyerRequestId').optional().notEmpty().withMessage('Buyer request ID must not be empty')
];

const sendMessageValidation = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('listingId').optional().notEmpty().withMessage('Listing ID must not be empty'),
  body('buyerRequestId').optional().notEmpty().withMessage('Buyer request ID must not be empty')
];

// Routes
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.post('/conversations', createConversationValidation, validate, createConversation);
router.post('/send', sendMessageValidation, validate, sendMessage);
router.put('/conversations/:id/read', markAsRead);
router.delete('/messages/:id', deleteMessage);
router.delete('/conversations/:id', deleteConversation);

export default router;
