import { Router } from 'express';
import { approvalController } from '../controllers/approvalController';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res) => approvalController.getApprovals(req, res));
router.post('/:id/action', requireRoles(['MANAGER', 'FINANCE', 'COMPLIANCE_OFFICER', 'ADMIN']), (req, res) => approvalController.handleApprovalAction(req, res));

export default router;
