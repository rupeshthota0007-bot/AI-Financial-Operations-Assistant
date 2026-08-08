import { AgentResult } from './types';
import { mockCrmService } from '../services/mockCrmService';
import { ragEngine } from '../rag/ragEngine';
import { prisma } from '../database/db';

export class SupportAgent {
  public async analyzeTicket(ticketId: string): Promise<AgentResult> {
    const startTime = Date.now();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true, messages: true },
    });

    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const crmProfile = await mockCrmService.getCustomer360(ticket.customerId);
    const ragKnowledge = await ragEngine.searchRelevantKnowledge(`${ticket.subject} ${ticket.description}`, 2);

    // Calculate urgency score
    let urgencyScore = ticket.urgencyScore || 40;
    const descLower = ticket.description.toLowerCase();
    if (descLower.includes('urgent') || descLower.includes('fraud') || descLower.includes('charge') || descLower.includes('money lost')) {
      urgencyScore += 45;
    }

    const summary = `Customer ${ticket.customer.name} (${ticket.customer.tier} Tier) submitted dispute ticket "${ticket.subject}". Issue involves request for resolution regarding transaction history. Customer risk level is ${crmProfile?.riskScore || 0}/100.`;

    const suggestedReply = `Hello ${ticket.customer.name},\n\nThank you for reaching out to our Financial Operations Team regarding "${ticket.subject}". We have received your query and initiated a full automated multi-agent investigation across our payment gateways and fraud detection systems.\n\nOur preliminary review shows ticket urgency level as ${urgencyScore > 70 ? 'URGENT' : 'STANDARD'}. An specialist AI agent cluster is assessing policy compliance and transaction history.\n\nBest regards,\nAgentic FinOps Assistant`;

    return {
      agentName: 'Customer Support Agent',
      status: 'SUCCESS',
      summary,
      confidence: 0.94,
      evidence: ragKnowledge.map((k) => ({ source: `Knowledge Base (${k.docCode})`, content: `${k.title}: ${k.content.substring(0, 150)}...`, score: k.similarity })),
      data: {
        ticketCode: ticket.ticketCode,
        customerName: ticket.customer.name,
        customerTier: ticket.customer.tier,
        urgencyScore,
        category: ticket.category,
        priority: ticket.priority,
        suggestedReply,
        openTicketsCount: crmProfile?.openTicketsCount || 1,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const supportAgent = new SupportAgent();
