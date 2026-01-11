import { Router } from 'express';
import { strictLimiter, publicApiLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { contactMessageSchema } from '../schemas';
import { createContactMessage, getContactInfo } from '../controllers/contact';

const router = Router();

router.get('/', publicApiLimiter, getContactInfo);
router.post('/', strictLimiter, validate(contactMessageSchema), createContactMessage);

export default router;
