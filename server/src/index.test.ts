import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client, { Socket as ClientSocket } from 'socket.io-client';

describe('Socket.IO server integration', () => {
  let io: Server;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let port: number;

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);

      httpServer.listen(() => {
        port = (httpServer.address() as any).port;

        clientSocket1 = Client(`http://localhost:${port}`);
        clientSocket1.on('connect', () => {
          clientSocket2 = Client(`http://localhost:${port}`);
          clientSocket2.on('connect', resolve);
        });
      });
    });
  });

  afterAll(() => {
    if (io) io.close();
    if (clientSocket1) clientSocket1.close();
    if (clientSocket2) clientSocket2.close();
  });

  it('should connect clients', () => {
    expect(clientSocket1.connected).toBe(true);
    expect(clientSocket2.connected).toBe(true);
  });
});
