import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.get('/me', authenticateJWT, (req, res) => authController.getProfile(req, res));
router.get('/users', authenticateJWT, (req, res) => authController.getAllUsers(req, res));

export default router;
