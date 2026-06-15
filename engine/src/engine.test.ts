import { describe, it, expect } from 'vitest';
import { checkWinner, isBoardFull, makeAIMove } from './index';
import type { BoardState } from './index';

describe('Game Engine - checkWinner', () => {
  it('should return null for an empty board', () => {
    const board: BoardState = Array(9).fill(null);
    expect(checkWinner(board)).toBeNull();
  });

  it('should detect a winning row', () => {
    const board: BoardState = ['X', 'X', 'X', null, null, null, null, null, null];
    expect(checkWinner(board)).toBe('X');
  });

  it('should detect a winning column', () => {
    const board: BoardState = ['O', null, null, 'O', null, null, 'O', null, null];
    expect(checkWinner(board)).toBe('O');
  });

  it('should detect a winning diagonal', () => {
    const board: BoardState = ['X', null, null, null, 'X', null, null, null, 'X'];
    expect(checkWinner(board)).toBe('X');
  });
});

describe('Game Engine - isBoardFull', () => {
  it('should return false if there are empty spots', () => {
    const board: BoardState = ['X', 'O', null, 'X', null, null, null, null, null];
    expect(isBoardFull(board)).toBe(false);
  });

  it('should return true if the board is full', () => {
    const board: BoardState = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(isBoardFull(board)).toBe(true);
  });
});

describe('Game Engine - makeAIMove', () => {
  it('Easy: should pick a random available spot', () => {
    const board: BoardState = ['X', 'O', 'X', 'X', 'O', 'O', null, 'X', 'X'];
    const move = makeAIMove(board, 'easy', 'O');
    expect(move).toBe(6);
  });

  it('Unbeatable: should pick winning move if available', () => {
    const board: BoardState = ['O', 'O', null, 'X', 'X', null, null, null, null];
    const move = makeAIMove(board, 'unbeatable', 'O');
    expect(move).toBe(2);
  });

  it('Unbeatable: should block opponent winning move', () => {
    const board: BoardState = ['X', 'X', null, null, 'O', null, null, null, null];
    const move = makeAIMove(board, 'unbeatable', 'O');
    expect(move).toBe(2);
  });
});
