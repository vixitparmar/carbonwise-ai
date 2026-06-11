import { Router } from 'express';
import { goalController } from '../controllers/goalController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);

export default router;
