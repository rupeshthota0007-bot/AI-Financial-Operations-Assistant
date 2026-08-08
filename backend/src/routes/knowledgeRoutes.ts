import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledgeController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/documents', (req, res) => knowledgeController.getDocuments(req, res));
router.get('/search', (req, res) => knowledgeController.searchKnowledge(req, res));
router.post('/documents', (req, res) => knowledgeController.createDocument(req, res));

export default router;
