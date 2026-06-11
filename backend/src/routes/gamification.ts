import { Router } from 'express';
import { gamificationController } from '../controllers/gamificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/challenges', gamificationController.getChallenges);
router.post('/claim', gamificationController.claimChallenge);
router.get('/leaderboard', gamificationController.getLeaderboard);
router.get('/badges', gamificationController.getBadgesInfo);

export default router;
