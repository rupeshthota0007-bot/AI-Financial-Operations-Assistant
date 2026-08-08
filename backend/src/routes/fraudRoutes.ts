import { Router } from 'express';
import { fraudController } from '../controllers/fraudController';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res) => fraudController.getFraudCases(req, res));
router.patch('/:id', requireRoles(['FRAUD_ANALYST', 'ADMIN', 'MANAGER']), (req, res) => fraudController.updateCaseStatus(req, res));

export default router;
