import React from 'react';
import type { BoardState } from 'engine';
import '../styles/Board.css';

interface BoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, onCellClick, disabled }) => {
  return (
    <div className="board" data-testid="board">
      {board.map((cell, index) => (
        <button
          key={index}
          className={`cell ${cell ? cell.toLowerCase() : ''}`}
          onClick={() => onCellClick(index)}
          disabled={disabled || cell !== null}
          data-testid={`cell-${index}`}
        >
          {cell}
        </button>
      ))}
    </div>
  );
};
