import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { User } from './User';

const app = express();
const PORT = process.env.PORT || 8080;

// Optional HTTP route for health check
app.get('/', (_, res) => {
  res.send('WebSocket server is running');
});

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  const user = new User(ws);

  ws.on('error', console.error);

  ws.on('close', () => {
    if (user) {
      user.destroy();
    }
  });
});

// Start HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
