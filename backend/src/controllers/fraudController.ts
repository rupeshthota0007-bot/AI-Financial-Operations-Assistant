import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { mockCrmService } from '../services/mockCrmService';

export class FraudController {
  public async getFraudCases(req: Request, res: Response) {
    try {
      const fraudCases = await prisma.fraudCase.findMany({
        include: {
          customer: true,
          transaction: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, count: fraudCases.length, fraudCases });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateCaseStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;

      const fraudCase = await prisma.fraudCase.update({
        where: { id },
        data: { status, resolution },
        include: { customer: true },
      });

      if (status === 'BLOCKED') {
        await mockCrmService.updateCustomerStatus(fraudCase.customerId, 'FROZEN', 'Account blocked by Fraud Analyst');
      }

      return res.json({ success: true, fraudCase });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const fraudController = new FraudController();
