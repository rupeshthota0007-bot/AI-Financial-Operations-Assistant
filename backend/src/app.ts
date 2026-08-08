import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import paymentRoutes from './routes/paymentRoutes';
import fraudRoutes from './routes/fraudRoutes';
import approvalRoutes from './routes/approvalRoutes';
import auditRoutes from './routes/auditRoutes';
import agentRoutes from './routes/agentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';

dotenv.config();

export const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// API Module Routing
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Agentic Financial Operations Assistant',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Fallback Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});
