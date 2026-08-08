import http from 'http';
import { app } from './app';
import { initWebSocketServer } from './websocket/wsServer';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize WebSockets for real-time dashboard events
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Agentic Financial Operations Assistant Backend`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server active on ws://localhost:${PORT}/ws`);
  console.log(`====================================================`);
});
