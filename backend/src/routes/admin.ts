import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  loginSchema,
  updateContactSchema,
} from '../schemas';
import { login } from '../controllers/admin/auth';
import {
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/admin/projects';
import {
  getRatings,
  deleteRating,
} from '../controllers/admin/ratings';
import {
  updateContactInfo,
  getAnalytics,
} from '../controllers/admin/system';

const router = Router();

// Auth
router.post('/login', authLimiter, validate(loginSchema), login);

// Protected routes
router.use(authenticate);

// Projects
router.post('/projects', validate(createProjectSchema), createProject);
router.put('/projects/:id', validate(updateProjectSchema), updateProject);
router.delete('/projects/:id', deleteProject);

// Ratings
router.get('/ratings', getRatings);
router.delete('/ratings/:id', deleteRating);

// System
router.put('/contact', validate(updateContactSchema), updateContactInfo);
router.get('/analytics', getAnalytics);

export default router;
