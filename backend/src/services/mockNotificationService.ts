import { prisma } from '../database/db';
import { broadcastWebSocketMessage } from '../websocket/wsServer';

export interface NotificationPayload {
  userId?: string;
  title: string;
  message: string;
  type: 'APPROVAL_REQUEST' | 'FRAUD_ALERT' | 'TICKET_UPDATE' | 'SYSTEM_INFO';
  link?: string;
}

export class MockNotificationService {
  /**
   * Sends multi-channel notifications (In-app DB, WebSockets, Slack, MS Teams simulator)
   */
  public async dispatchNotification(payload: NotificationPayload) {
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId || null,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link: payload.link || null,
      },
    });

    // Broadcast over WebSocket to active enterprise dashboard clients
    broadcastWebSocketMessage({
      event: 'NOTIFICATION_RECEIVED',
      data: notification,
    });

    // Log to System Events for Slack / MS Teams webhook audit
    await prisma.systemEvent.create({
      data: {
        eventType: 'WEBHOOK_SLACK_TEAMS_SENT',
        source: 'Slack & MS Teams Integration',
        payloadJson: JSON.stringify({
          channel: '#finops-ops-alerts',
          title: payload.title,
          message: payload.message,
          timestamp: new Date(),
        }),
      },
    });

    return notification;
  }
}

export const mockNotificationService = new MockNotificationService();
