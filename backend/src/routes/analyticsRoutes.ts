import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res) => analyticsController.getExecutiveMetrics(req, res));

export default router;
