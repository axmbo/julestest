import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from './roomManager';

describe('RoomManager', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  it('should create a room when joining via code if it does not exist', () => {
    const room = roomManager.joinOrCreateRoom('CODE123', 'socket-1', 'Player 1');
    expect(room.id).toBe('CODE123');
    expect(room.players.length).toBe(1);
    expect(room.players[0].id).toBe('socket-1');
  });

  it('should join an existing room via code if there is space', () => {
    roomManager.joinOrCreateRoom('CODE123', 'socket-1', 'Player 1');
    const room = roomManager.joinOrCreateRoom('CODE123', 'socket-2', 'Player 2');

    expect(room.players.length).toBe(2);
    expect(room.players[1].id).toBe('socket-2');
  });

  it('should throw an error if the room is full', () => {
    roomManager.joinOrCreateRoom('CODE123', 'socket-1', 'Player 1');
    roomManager.joinOrCreateRoom('CODE123', 'socket-2', 'Player 2');

    expect(() => {
      roomManager.joinOrCreateRoom('CODE123', 'socket-3', 'Player 3');
    }).toThrow('Room is full');
  });

  it('should match players randomly', () => {
    const room1 = roomManager.joinRandomRoom('socket-1', 'Player 1');
    expect(room1.players.length).toBe(1);

    const room2 = roomManager.joinRandomRoom('socket-2', 'Player 2');
    expect(room1.id).toBe(room2.id); // they should be placed in the exact same room
    expect(room2.players.length).toBe(2);
  });

  it('should remove a player and delete room if empty', () => {
    const room = roomManager.joinOrCreateRoom('CODE123', 'socket-1', 'Player 1');
    roomManager.removePlayer('socket-1');
    const existingRoom = roomManager.getRoom('CODE123');
    expect(existingRoom).toBeUndefined();
  });

  it('should process a valid move', () => {
    const room = roomManager.joinOrCreateRoom('CODE123', 'socket-1', 'Player 1');
    roomManager.joinOrCreateRoom('CODE123', 'socket-2', 'Player 2');

    const turn = room.currentTurn;
    const playerToMove = room.players.find(p => p.symbol === turn)!;

    const success = roomManager.makeMove(room.id, playerToMove.id, 0);
    expect(success).toBe(true);
    expect(room.board[0]).toBe(turn);
  });
});
