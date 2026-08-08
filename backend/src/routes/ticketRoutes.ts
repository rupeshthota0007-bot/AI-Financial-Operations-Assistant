import { Router } from 'express';
import { ticketController } from '../controllers/ticketController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', (req, res) => ticketController.getTickets(req, res));
router.get('/:id', (req, res) => ticketController.getTicketById(req, res));
router.post('/', (req, res) => ticketController.createTicket(req, res));
router.post('/:id/orchestrate', (req, res) => ticketController.triggerAIAssistance(req, res));

export default router;
