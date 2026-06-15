import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Board } from './Board';
import type { BoardState } from 'engine';

describe('Board Component', () => {
  const emptyBoard: BoardState = Array(9).fill(null);

  it('renders a 3x3 grid of cells', () => {
    render(<Board board={emptyBoard} onCellClick={() => {}} disabled={false} />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
  });

  it('calls onCellClick when an empty cell is clicked', () => {
    const handleClick = vi.fn();
    render(<Board board={emptyBoard} onCellClick={handleClick} disabled={false} />);

    fireEvent.click(screen.getByTestId('cell-0'));
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('disables all cells when board is disabled', () => {
    render(<Board board={emptyBoard} onCellClick={() => {}} disabled={true} />);
    const cells = screen.getAllByRole('button');
    cells.forEach(cell => expect(cell).toBeDisabled());
  });

  it('displays X and O correctly', () => {
    const board: BoardState = ['X', 'O', null, null, null, null, null, null, null];
    render(<Board board={board} onCellClick={() => {}} disabled={false} />);

    expect(screen.getByTestId('cell-0')).toHaveTextContent('X');
    expect(screen.getByTestId('cell-1')).toHaveTextContent('O');
    expect(screen.getByTestId('cell-2')).toHaveTextContent('');
    expect(screen.getByTestId('cell-0')).toBeDisabled(); // already filled
  });
});
