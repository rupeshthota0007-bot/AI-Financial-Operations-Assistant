import { AgentResult } from './types';
import { mockPaymentGateway } from '../services/mockPaymentGateway';
import { prisma } from '../database/db';

export class PaymentAgent {
  public async investigateTransaction(transactionId: string): Promise<AgentResult> {
    const startTime = Date.now();
    const tx = await mockPaymentGateway.getTransactionDetails(transactionId);

    if (!tx) {
      return {
        agentName: 'Payment Investigation Agent',
        status: 'FAILED',
        summary: `Transaction ${transactionId} could not be located in gateway archives.`,
        confidence: 0.1,
        evidence: [],
        data: null,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Check duplicate payment or settlement delay
    const duplicateTxs = await prisma.transactions.findMany({
      where: {
        customerId: tx.customerId,
        amount: tx.amount,
        id: { not: tx.id },
      },
    });

    const isDuplicate = duplicateTxs.length > 0;
    const previousRefunds = tx.refunds;

    let refundRecommendation = false;
    let refundEligibleAmount = tx.amount;
    let summary = `Inspected transaction ${tx.txCode} ($${tx.amount} ${tx.currency}). Status: ${tx.status}. Payment method: ${tx.paymentMethod}.`;

    if (tx.status === 'COMPLETED' || tx.status === 'SETTLED') {
      if (previousRefunds.length === 0) {
        refundRecommendation = true;
        summary += ` Fully eligible for refund. No previous refunds found.`;
      } else {
        summary += ` Warning: ${previousRefunds.length} previous refund requests logged.`;
      }
    } else if (tx.status === 'REFUNDED') {
      refundRecommendation = false;
      refundEligibleAmount = 0;
      summary += ` Transaction was ALREADY REFUNDED. Rejecting duplicate refund request.`;
    }

    if (isDuplicate) {
      summary += ` Potential duplicate charge detected on customer account!`;
    }

    return {
      agentName: 'Payment Investigation Agent',
      status: refundRecommendation ? 'SUCCESS' : 'WARNING',
      summary,
      confidence: 0.96,
      evidence: [
        { source: 'Payment Gateway Logs', content: `Tx ${tx.txCode} amount=$${tx.amount}, method=${tx.paymentMethod}, settlementDays=${tx.settlementDays}` },
        { source: 'Ledger Audit', content: `Previous Refunds count=${previousRefunds.length}` },
      ],
      data: {
        txCode: tx.txCode,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        paymentMethod: tx.paymentMethod,
        isDuplicate,
        refundRecommendation,
        refundEligibleAmount,
        settlementDays: tx.settlementDays,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const paymentAgent = new PaymentAgent();
