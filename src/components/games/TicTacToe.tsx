import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

export const TicTacToe: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = useCallback((currentBoard: Board) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (!currentBoard.includes(null)) {
      return { winner: 'draw', line: null };
    }
    return null;
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({
        ...prev,
        [result.winner === 'draw' ? 'draws' : result.winner]: prev[result.winner === 'draw' ? 'draws' : result.winner] + 1,
      }));
    }

    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  const minimax = (currentBoard: Board, isMaximizing: boolean, depth: number = 0): number => {
    const result = checkWinner(currentBoard);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, false, depth + 1);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, true, depth + 1);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const cpuMove = () => {
    if (winner || !isXNext) return;

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = 'O';
        const score = minimax(newBoard, false);
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    if (bestMove !== -1) {
      handleClick(bestMove);
    }
  };

  // Auto CPU move when it's O's turn
  React.useEffect(() => {
    if (!isXNext && !winner) {
      const timer = setTimeout(cpuMove, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, board]);

  return (
    <div className="fixed inset-0 z-50 bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white font-headline">Tic Tac Toe</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high">
            <X className="text-white size-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-primary/20 rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-primary font-label">You (X)</p>
            <p className="text-xl font-black text-white">{scores.X}</p>
          </div>
          <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant font-label">Draws</p>
            <p className="text-xl font-black text-white">{scores.draws}</p>
          </div>
          <div className="flex-1 bg-blue-500/20 rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-blue-400 font-label">CPU (O)</p>
            <p className="text-xl font-black text-white">{scores.O}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={resetGame} className="bg-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/30">
            <RotateCcw className="text-primary size-4" />
            <span className="text-sm font-bold text-white">New Game</span>
          </button>
          <button onClick={resetScores} className="text-xs text-on-surface-variant hover:text-white">
            Reset All
          </button>
        </div>

        <div className="bg-surface-container p-4 rounded-2xl mb-4">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: cell ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner}
                className={`aspect-square rounded-xl flex items-center justify-center text-4xl font-black transition-all ${
                  winningLine?.includes(index)
                    ? 'bg-primary shadow-[0_0_20px_rgba(234,42,51,0.5)]'
                    : 'bg-surface-container-high'
                } ${
                  cell === 'X' ? 'text-primary' : cell === 'O' ? 'text-blue-400' : 'text-on-surface'
                } ${
                  !cell && !winner ? 'hover:bg-surface-container-high hover:shadow-lg' : ''
                }`}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>

        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-surface-container p-4 rounded-xl"
          >
            <p className="text-lg font-bold text-white">
              {winner === 'draw' ? "It's a Draw!" : winner === 'X' ? 'You Win!' : 'CPU Wins!'}
            </p>
          </motion.div>
        )}

        {!winner && (
          <div className="text-center">
            <p className="text-on-surface-variant text-sm">
              {isXNext ? "Your turn (X)" : "CPU thinking..."}
            </p>
          </div>
        )}

        <p className="text-center text-on-surface-variant/60 text-sm mt-4">
          Play as X against the CPU
        </p>
      </div>
    </div>
  );
};
