import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/transactions', (req, res) => paymentController.getTransactions(req, res));
router.get('/refunds', (req, res) => paymentController.getRefunds(req, res));
router.post('/refunds/process', (req, res) => paymentController.processRefund(req, res));

export default router;
