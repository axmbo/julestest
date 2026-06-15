import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';

describe('App Component', () => {
  beforeEach(() => {
    vi.spyOn(globalThis.Math, 'random').mockReturnValue(0.1); // Always forces X to start
  });

  it('renders the menu initially', () => {
    render(<ThemeProvider><App /></ThemeProvider>);
    expect(screen.getByText('Jogo da Velha PWA')).toBeInTheDocument();
    expect(screen.getByText('Humano vs Humano (Local)')).toBeInTheDocument();
  });

  it('can start a local PvP game', () => {
    render(<ThemeProvider><App /></ThemeProvider>);
    fireEvent.click(screen.getByText('Humano vs Humano (Local)'));
    expect(screen.getByText('Jogador X vs Jogador O')).toBeInTheDocument();
  });

  it('updates board on click in local PvP', () => {
    render(<ThemeProvider><App /></ThemeProvider>);
    fireEvent.click(screen.getByText('Humano vs Humano (Local)'));

    const cells = screen.getAllByRole('button').filter(b => b.classList.contains('cell'));
    fireEvent.click(cells[0]); // X
    expect(cells[0]).toHaveTextContent('X');
    expect(screen.getByText('Turno: O')).toBeInTheDocument();

    fireEvent.click(cells[1]); // O
    expect(cells[1]).toHaveTextContent('O');
  });

  it('detects a win in local PvP', async () => {
    render(<ThemeProvider><App /></ThemeProvider>);
    fireEvent.click(screen.getByText('Humano vs Humano (Local)'));

    const cells = screen.getAllByRole('button').filter(b => b.classList.contains('cell'));
    fireEvent.click(cells[0]); // X
    fireEvent.click(cells[3]); // O
    fireEvent.click(cells[1]); // X
    fireEvent.click(cells[4]); // O
    fireEvent.click(cells[2]); // X wins

    await waitFor(() => {
      expect(screen.getByText('Vencedor: X')).toBeInTheDocument();
    });
  });
});
