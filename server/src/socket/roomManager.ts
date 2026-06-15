import { BoardState, PlayerSymbol } from 'engine';

export interface Player {
  id: string; // socket.id
  nickname: string;
  symbol: PlayerSymbol;
}

export interface Room {
  id: string;
  players: Player[];
  board: BoardState;
  currentTurn: PlayerSymbol;
  scores: Record<string, number>;
  isRandom: boolean;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();

  private createRoom(id: string, isRandom: boolean = false): Room {
    const newRoom: Room = {
      id,
      players: [],
      board: Array(9).fill(null),
      currentTurn: Math.random() < 0.5 ? 'X' : 'O',
      scores: {},
      isRandom,
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  public joinOrCreateRoom(roomId: string, socketId: string, nickname: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    if (room.players.length >= 2) {
      throw new Error('Room is full');
    }

    const symbol: PlayerSymbol = room.players.length === 0 ? 'X' : 'O';
    const player: Player = { id: socketId, nickname: nickname || 'Anônimo', symbol };
    room.players.push(player);
    room.scores[socketId] = 0;
    this.socketToRoom.set(socketId, roomId);

    return room;
  }

  public joinRandomRoom(socketId: string, nickname: string): Room {
    for (const room of this.rooms.values()) {
      if (room.isRandom && room.players.length === 1) {
        return this.joinOrCreateRoom(room.id, socketId, nickname);
      }
    }

    const newRoomId = Math.random().toString(36).substring(2, 9);
    const newRoom = this.createRoom(newRoomId, true);
    return this.joinOrCreateRoom(newRoomId, socketId, nickname);
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getRoomBySocketId(socketId: string): Room | undefined {
    const roomId = this.socketToRoom.get(socketId);
    if (roomId) {
      return this.rooms.get(roomId);
    }
    return undefined;
  }

  public makeMove(roomId: string, socketId: string, index: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === socketId);
    if (!player) return false;

    if (room.currentTurn !== player.symbol) return false;
    if (room.board[index] !== null) return false;

    room.board[index] = player.symbol;
    room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
    return true;
  }

  public removePlayer(socketId: string): Room | undefined {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return undefined;

    const room = this.rooms.get(roomId);
    if (room) {
      room.players = room.players.filter(p => p.id !== socketId);
      this.socketToRoom.delete(socketId);

      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
      return room;
    }
    return undefined;
  }

  public resetRoomBoard(roomId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (room) {
      room.board = Array(9).fill(null);
      room.currentTurn = Math.random() < 0.5 ? 'X' : 'O';
      return room;
    }
    return undefined;
  }

  public incrementScore(roomId: string, socketId: string) {
      const room = this.rooms.get(roomId);
      if (room && room.scores[socketId] !== undefined) {
          room.scores[socketId]++;
      }
  }
}
