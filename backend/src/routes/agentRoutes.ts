import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.post('/chat', (req, res) => agentController.handleCopilotChat(req, res));

export default router;
