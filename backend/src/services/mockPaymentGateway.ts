import { prisma } from '../database/db';

export interface ProcessRefundResult {
  success: boolean;
  refundId: string;
  refundCode: string;
  amount: number;
  status: string;
  gatewayReference: string;
  message: string;
}

export class MockPaymentGateway {
  /**
   * Retrieves transaction timeline and details
   */
  public async getTransactionDetails(txIdOrCode: string) {
    return await prisma.transactions.findFirst({
      where: {
        OR: [{ id: txIdOrCode }, { txCode: txIdOrCode }],
      },
      include: {
        customer: true,
        refunds: true,
        fraudCases: true,
      },
    });
  }

  /**
   * Processes refund directly via payment gateway (Stripe/Bank API)
   */
  public async executeRefund(transactionId: string, amount: number, reason: string, approvedByUserId: string): Promise<ProcessRefundResult> {
    const tx = await prisma.transactions.findUnique({
      where: { id: transactionId },
      include: { customer: true },
    });

    if (!tx) {
      throw new Error(`Transaction ${transactionId} not found in gateway.`);
    }

    const refundCode = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const refund = await prisma.refund.create({
      data: {
        refundCode,
        transactionId: tx.id,
        customerId: tx.customerId,
        amount,
        reason,
        status: 'PROCESSED',
        requestedBy: 'AI_ORCHESTRATOR',
        approvedBy: approvedByUserId,
      },
    });

    // Update Transaction status
    await prisma.transactions.update({
      where: { id: tx.id },
      data: { status: 'REFUNDED' },
    });

    // Log System Event
    const gatewayReference = `ch_stripe_${Math.random().toString(36).substring(2, 12)}`;
    await prisma.systemEvent.create({
      data: {
        eventType: 'PAYMENT_GATEWAY_REFUND_EXECUTED',
        source: 'Stripe Gateway Connector',
        payloadJson: JSON.stringify({
          refundCode,
          gatewayReference,
          amount,
          currency: tx.currency,
          transactionId: tx.id,
          timestamp: new Date(),
        }),
      },
    });

    return {
      success: true,
      refundId: refund.id,
      refundCode,
      amount,
      status: 'PROCESSED',
      gatewayReference,
      message: `Successfully settled refund of $${amount} to payment method ${tx.paymentMethod}`,
    };
  }
}

export const mockPaymentGateway = new MockPaymentGateway();
