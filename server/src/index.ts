import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './socket/roomManager';
import { checkWinner, isBoardFull } from 'engine';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4173",
  },
});

const roomManager = new RoomManager();

io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', ({ roomId, nickname }: { roomId?: string; nickname: string }) => {
    try {
      let room;
      if (roomId) {
        room = roomManager.joinOrCreateRoom(roomId, socket.id, nickname);
      } else {
        room = roomManager.joinRandomRoom(socket.id, nickname);
      }

      socket.join(room.id);

      if (room.players.length === 2) {
         io.to(room.id).emit('game_start', room);
      } else {
         io.to(room.id).emit('waiting_for_player', room);
      }
    } catch (e: any) {
      socket.emit('error', e.message);
    }
  });

  socket.on('make_move', (index: number) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    if (roomManager.makeMove(room.id, socket.id, index)) {
      io.to(room.id).emit('move_made', room);

      const winnerSymbol = checkWinner(room.board);
      if (winnerSymbol) {
        const winner = room.players.find(p => p.symbol === winnerSymbol);
        if (winner) {
            roomManager.incrementScore(room.id, winner.id);
        }
        io.to(room.id).emit('game_over', { winner: winner?.id, room });
      } else if (isBoardFull(room.board)) {
        io.to(room.id).emit('game_over', { winner: null, room });
      }
    }
  });

  socket.on('restart_game', () => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (room) {
      roomManager.resetRoomBoard(room.id);
      io.to(room.id).emit('game_start', room);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const room = roomManager.removePlayer(socket.id);
    if (room) {
      io.to(room.id).emit('player_disconnected', room);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
