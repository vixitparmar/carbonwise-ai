import { Router } from 'express';
import multer from 'multer';
import { aiController } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limit files to 5MB
  }
});

router.use(authMiddleware);

router.post('/chat', aiController.chat);
router.get('/chat/history', aiController.getChatHistory);
router.delete('/chat/history', aiController.clearChatHistory);
router.get('/coach-report', aiController.getCoachingReport);
router.post('/scan-bill', upload.single('file'), aiController.scanBill);
router.post('/scan-receipt', upload.single('file'), aiController.scanReceipt);

export default router;
