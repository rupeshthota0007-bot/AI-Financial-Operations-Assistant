import { Request, Response } from 'express';
import { prisma } from '../database/db';

export class AuditController {
  public async getAuditLogs(req: Request, res: Response) {
    try {
      const { agentName, decision, search } = req.query;
      const where: any = {};

      if (agentName) where.agentName = agentName as string;
      if (decision) where.decision = decision as string;
      if (search) {
        where.OR = [
          { logCode: { contains: search as string } },
          { reason: { contains: search as string } },
          { action: { contains: search as string } },
        ];
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
      });

      return res.json({ success: true, count: logs.length, logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getAuditLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const log = await prisma.auditLog.findUnique({
        where: { id },
      });

      if (!log) {
        return res.status(404).json({ success: false, error: 'Audit log entry not found' });
      }

      return res.json({ success: true, log });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const auditController = new AuditController();
