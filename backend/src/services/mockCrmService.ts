import { prisma } from '../database/db';

export interface CustomerProfile {
  id: string;
  customerCode: string;
  name: string;
  email: string;
  phone?: string | null;
  tier: string;
  riskScore: number;
  accountStatus: string;
  totalSpent: number;
  kycStatus: string;
  country: string;
  transactionCount: number;
  openTicketsCount: number;
}

export class MockCRMService {
  /**
   * Fetches unified customer view from Salesforce / HubSpot CRM simulator
   */
  public async getCustomer360(customerIdOrCode: string): Promise<CustomerProfile | null> {
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id: customerIdOrCode },
          { customerCode: customerIdOrCode },
          { email: customerIdOrCode },
        ],
      },
      include: {
        transactions: true,
        tickets: true,
      },
    });

    if (!customer) return null;

    return {
      id: customer.id,
      customerCode: customer.customerCode,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tier: customer.tier,
      riskScore: customer.riskScore,
      accountStatus: customer.accountStatus,
      totalSpent: customer.totalSpent,
      kycStatus: customer.kycStatus,
      country: customer.country,
      transactionCount: customer.transactions.length,
      openTicketsCount: customer.tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length,
    };
  }

  /**
   * Updates customer account status (e.g., Freeze, Unfreeze, Lock)
   */
  public async updateCustomerStatus(customerId: string, status: 'ACTIVE' | 'FROZEN' | 'UNDER_REVIEW' | 'CLOSED', reason: string) {
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: { accountStatus: status },
    });

    await prisma.systemEvent.create({
      data: {
        eventType: 'CRM_CUSTOMER_STATUS_UPDATED',
        source: 'Salesforce CRM Connector',
        payloadJson: JSON.stringify({ customerId, status, reason, timestamp: new Date() }),
      },
    });

    return updated;
  }
}

export const mockCrmService = new MockCRMService();
