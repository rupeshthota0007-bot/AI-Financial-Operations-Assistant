import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res) => auditController.getAuditLogs(req, res));
router.get('/:id', (req, res) => auditController.getAuditLogById(req, res));

export default router;
