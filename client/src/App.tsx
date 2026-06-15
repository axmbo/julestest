import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { checkWinner, isBoardFull, makeAIMove } from 'engine';
import type { BoardState, PlayerSymbol, Difficulty } from 'engine';
import { Board } from './components/Board';
import { io, Socket } from 'socket.io-client';

type GameMode = 'menu' | 'local-pvp' | 'local-pvc' | 'online-create' | 'online-join' | 'online-play';

interface Score {
  player1: number;
  player2: number;
}

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<GameMode>('menu');

  // Game state
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
  const [winner, setWinner] = useState<PlayerSymbol | 'Tie' | null>(null);

  // Players config
  const [nickname, setNickname] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [score, setScore] = useState<Score>({ player1: 0, player2: 0 });
  const [roomId, setRoomId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Online state
  const [mySymbol, setMySymbol] = useState<PlayerSymbol | null>(null);
  const [opponentName, setOpponentName] = useState('Oponente');
  const [waiting, setWaiting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetGame = (keepScore = false) => {
    setBoard(Array(9).fill(null));
    setCurrentTurn(Math.random() < 0.5 ? 'X' : 'O');
    setWinner(null);
    if (!keepScore) setScore({ player1: 0, player2: 0 });
  };

  // Fix: Handle AI move using an effect so it triggers automatically even if AI goes first
  useEffect(() => {
    if (mode === 'local-pvc' && currentTurn === 'O' && !winner) {
      const timeout = setTimeout(() => {
        const newBoard = [...board];
        const aiMove = makeAIMove(newBoard, difficulty, 'O');
        if (aiMove !== -1) {
          newBoard[aiMove] = 'O';
          setBoard(newBoard);

          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            setScore(s => ({ ...s, player2: s.player2 + 1 }));
          } else if (isBoardFull(newBoard)) {
            setWinner('Tie');
          } else {
            setCurrentTurn('X');
          }
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [mode, currentTurn, winner, board, difficulty]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    if (mode === 'local-pvp') {
      const newBoard = [...board];
      newBoard[index] = currentTurn;
      setBoard(newBoard);

      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setScore(s => ({ ...s, [gameWinner === 'X' ? 'player1' : 'player2']: s[gameWinner === 'X' ? 'player1' : 'player2'] + 1 }));
      } else if (isBoardFull(newBoard)) {
        setWinner('Tie');
      } else {
        setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
      }
    } else if (mode === 'local-pvc' && currentTurn === 'X') {
      const newBoard = [...board];
      newBoard[index] = 'X';
      setBoard(newBoard);

      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setScore(s => ({ ...s, player1: s.player1 + 1 }));
        return;
      } else if (isBoardFull(newBoard)) {
        setWinner('Tie');
        return;
      }

      setCurrentTurn('O');
    } else if (mode === 'online-play' && socket && mySymbol === currentTurn) {
      socket.emit('make_move', index);
    }
  };

  // Online logic setup
  useEffect(() => {
    if (mode === 'online-create' || mode === 'online-join') {
       const newSocket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/');
       setSocket(newSocket);

       newSocket.on('connect', () => {
         newSocket.emit('join_room', { roomId: mode === 'online-join' ? roomId : undefined, nickname });
       });

       newSocket.on('waiting_for_player', (room) => {
         setRoomId(room.id);
         setWaiting(true);
       });

       newSocket.on('game_start', (room) => {
         setWaiting(false);
         setMode('online-play');
         setBoard(room.board);
         setCurrentTurn(room.currentTurn);
         const me = room.players.find((p: any) => p.id === newSocket.id);
         const opp = room.players.find((p: any) => p.id !== newSocket.id);
         setMySymbol(me?.symbol || 'X');
         if (opp) setOpponentName(opp.nickname);
         setWinner(null);
       });

       newSocket.on('move_made', (room) => {
         setBoard(room.board);
         setCurrentTurn(room.currentTurn);
       });

       newSocket.on('game_over', ({ winner, room }) => {
         setBoard(room.board);
         if (winner) {
           const isMe = winner === newSocket.id;
           setWinner(isMe ? mySymbol : (mySymbol === 'X' ? 'O' : 'X'));
           if (isMe) setScore(s => ({ ...s, player1: s.player1 + 1 }));
           else setScore(s => ({ ...s, player2: s.player2 + 1 }));
         } else {
           setWinner('Tie');
         }
       });

       newSocket.on('player_disconnected', () => {
         alert('Oponente desconectou.');
         setMode('menu');
         newSocket.disconnect();
       });

       return () => { newSocket.disconnect(); };
    }
  }, [mode, roomId, nickname]);

  const renderMenu = () => (
    <div>
      <h1>Jogo da Velha PWA</h1>
      <div>
        <label>Seu Apelido: </label>
        <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Anônimo" />
      </div>
      <div>
        <label>Tema: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
          <option value="system">Sistema</option>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="high-contrast">Alto Contraste</option>
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Jogar Offline</h3>
        <button onClick={() => { setMode('local-pvp'); resetGame(); }}>Humano vs Humano (Local)</button>
        <div>
           <button onClick={() => { setMode('local-pvc'); resetGame(); }}>Humano vs Computador</button>
           <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
             <option value="easy">Fácil</option>
             <option value="medium">Médio</option>
             <option value="unbeatable">Imbatível</option>
           </select>
        </div>
      </div>

      {isOnline ? (
        <div style={{ marginTop: '20px' }}>
          <h3>Jogar Online</h3>
          <button onClick={() => setMode('online-create')}>Criar/Aleatório</button>
          <div>
            <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Código da sala" />
            <button onClick={() => setMode('online-join')} disabled={!roomId}>Entrar por Código</button>
          </div>
        </div>
      ) : (
        <p style={{ color: 'red' }}>Você está offline. Modos online desativados.</p>
      )}
    </div>
  );

  const renderGame = () => (
    <div>
      <h2>
        {mode === 'local-pvc' ? 'Você vs Computador' :
         mode === 'local-pvp' ? 'Jogador X vs Jogador O' :
         `Você (${mySymbol}) vs ${opponentName}`}
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
         <div>Placar P1/Você: {score.player1}</div>
         <div>Placar P2/Oponente: {score.player2}</div>
      </div>

      {waiting ? (
        <p>Aguardando oponente... Sala: {roomId}</p>
      ) : (
        <>
          <p>Turno: {currentTurn}</p>
          <Board
            board={board}
            onCellClick={handleCellClick}
            disabled={!!winner || (mode === 'local-pvc' && currentTurn === 'O') || (mode === 'online-play' && currentTurn !== mySymbol)}
          />

          {winner && (
            <div className="winner-msg">
              <h3>{winner === 'Tie' ? 'Empate!' : `Vencedor: ${winner}`}</h3>
              <button onClick={() => {
                if (mode === 'online-play') socket?.emit('restart_game');
                else resetGame(true);
              }}>Jogar Novamente</button>
              <button onClick={() => { setMode('menu'); socket?.disconnect(); }}>Sair</button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container">
      {mode === 'menu' ? renderMenu() : renderGame()}
    </div>
  );
};
export default App;
