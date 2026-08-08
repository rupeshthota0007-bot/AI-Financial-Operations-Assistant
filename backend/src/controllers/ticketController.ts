import { Request, Response } from 'express';
import { prisma } from '../database/db';
import { workflowOrchestrator } from '../agents/workflowOrchestrator';

export class TicketController {
  public async getTickets(req: Request, res: Response) {
    try {
      const { status, category, priority } = req.query;
      const where: any = {};
      if (status) where.status = status as string;
      if (category) where.category = category as string;
      if (priority) where.priority = priority as string;

      const tickets = await prisma.ticket.findMany({
        where,
        include: {
          customer: true,
          messages: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, count: tickets.length, tickets });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getTicketById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          customer: {
            include: { transactions: true, fraudCases: true, refunds: true },
          },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!ticket) {
        return res.status(404).json({ success: false, error: 'Ticket not found' });
      }

      return res.json({ success: true, ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createTicket(req: Request, res: Response) {
    try {
      const { customerId, subject, description, priority, category } = req.body;

      const ticketCode = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;

      const ticket = await prisma.ticket.create({
        data: {
          ticketCode,
          customerId,
          subject,
          description,
          priority: priority || 'MEDIUM',
          category: category || 'DISPUTE',
          status: 'OPEN',
          urgencyScore: priority === 'HIGH' || priority === 'URGENT' ? 85 : 45,
          messages: {
            create: {
              senderType: 'CUSTOMER',
              senderName: 'Customer Inquirer',
              message: description,
            },
          },
        },
        include: { customer: true, messages: true },
      });

      // Automatically trigger agent workflow background processing
      workflowOrchestrator.runFinOpsWorkflow(ticket.id).catch((err) => {
        console.error('Error running automated workflow:', err);
      });

      return res.status(201).json({ success: true, ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async triggerAIAssistance(req: any, res: Response) {
    try {
      const { id } = req.params;
      const workflowState = await workflowOrchestrator.runFinOpsWorkflow(id, req.user?.id);
      return res.json({ success: true, workflowState });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const ticketController = new TicketController();
