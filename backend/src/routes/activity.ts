import { Router } from 'express';
import { activityController } from '../controllers/activityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', activityController.logActivity);
router.get('/', activityController.getActivities);
router.get('/stats', activityController.getDashboardStats);
router.delete('/:id', activityController.deleteActivity);

export default router;
