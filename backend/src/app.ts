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

import { securityHeaders, e2eeEnvelopeHandler, rateLimiter } from './middleware/security';

dotenv.config();

export const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(securityHeaders);                             // Enterprise security headers + E2EE policy
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));              // Limit payload size

// ── E2EE Envelope Middleware (global — before all routes) ───────────────────
app.use(e2eeEnvelopeHandler);

// ── Rate Limiting ────────────────────────────────────────────────────────────
// Auth endpoints: stricter limit to prevent brute force
app.use('/api/auth', rateLimiter(20, 60_000));        // 20 req/min on auth
app.use('/api', rateLimiter(200, 60_000));             // 200 req/min globally

// ── API Module Routing ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// ── Health Check (with E2EE status) ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Agentic Financial Operations Assistant',
    version: '2.0.0',
    security: {
      e2ee: 'AES-256-GCM/PBKDF2-SHA-256',
      transport: 'TLS 1.3',
      rateLimit: 'Active',
      antiReplay: 'Active (5-min window)',
    },
    timestamp: new Date(),
  });
});

// ── Fallback Error Handler ───────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});
