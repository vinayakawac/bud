import { Router } from 'express';
import { publicApiLimiter } from '../middleware/rateLimit';
import { 
  getProjects, 
  getProjectById 
} from '../controllers/projects';

const router = Router();

router.get('/', publicApiLimiter, getProjects);
router.get('/:id', publicApiLimiter, getProjectById);

export default router;
