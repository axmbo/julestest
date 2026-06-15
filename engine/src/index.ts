export type PlayerSymbol = 'X' | 'O';
export type BoardState = (PlayerSymbol | null)[];
export type Difficulty = 'easy' | 'medium' | 'unbeatable';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function checkWinner(board: BoardState): PlayerSymbol | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: BoardState): number[] {
  return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1);
}

function minimax(board: BoardState, depth: number, isMaximizing: boolean, aiSymbol: PlayerSymbol, humanSymbol: PlayerSymbol): number {
  const winner = checkWinner(board);
  if (winner === aiSymbol) return 10 - depth;
  if (winner === humanSymbol) return depth - 10;
  if (isBoardFull(board)) return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves) {
      board[move] = aiSymbol;
      const score = minimax(board, depth + 1, false, aiSymbol, humanSymbol);
      board[move] = null;
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of availableMoves) {
      board[move] = humanSymbol;
      const score = minimax(board, depth + 1, true, aiSymbol, humanSymbol);
      board[move] = null;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

export function makeAIMove(board: BoardState, difficulty: Difficulty, aiSymbol: PlayerSymbol): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  const humanSymbol: PlayerSymbol = aiSymbol === 'X' ? 'O' : 'X';

  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  if (difficulty === 'unbeatable' || difficulty === 'medium') {
    // Medium uses minimax but occasionally picks a random move instead
    if (difficulty === 'medium' && Math.random() < 0.3) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }

    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = aiSymbol;
      const score = minimax(board, 0, false, aiSymbol, humanSymbol);
      board[move] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  return availableMoves[0];
}
