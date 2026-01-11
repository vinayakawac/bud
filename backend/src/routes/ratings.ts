import { Router } from 'express';
import { strictLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { ratingSchema } from '../schemas';
import { createRating } from '../controllers/ratings';

const router = Router();

router.post('/', strictLimiter, validate(ratingSchema), createRating);

export default router;
