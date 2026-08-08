import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { mockPaymentGateway } from '../services/mockPaymentGateway';

export class PaymentController {
  public async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await prisma.transactions.findMany({
        include: { customer: true, refunds: true, fraudCases: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, count: transactions.length, transactions });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getRefunds(req: Request, res: Response) {
    try {
      const refunds = await prisma.refund.findMany({
        include: {
          transaction: true,
          customer: true,
          approval: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, count: refunds.length, refunds });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async processRefund(req: any, res: Response) {
    try {
      const { transactionId, amount, reason } = req.body;
      const result = await mockPaymentGateway.executeRefund(
        transactionId,
        amount,
        reason || 'Manual Ops Override Refund',
        req.user?.id || 'HUMAN_OPS'
      );
      return res.json({ success: true, result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const paymentController = new PaymentController();
