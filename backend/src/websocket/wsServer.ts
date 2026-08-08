import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('⚡ WebSockets: Enterprise Dashboard client connected');

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.event === 'PING') {
          ws.send(JSON.stringify({ event: 'PONG', timestamp: new Date() }));
        }
      } catch (err) {
        // Ignore non-json socket messages
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('⚡ WebSockets: Enterprise Dashboard client disconnected');
    });
  });

  return wss;
}

export function broadcastWebSocketMessage(data: any) {
  const payload = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}
