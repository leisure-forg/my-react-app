import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';

interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export const Game2048: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const size = 4;
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGrid = () => {
    const newGrid = Array(size).fill(null).map(() => Array(size).fill(0));
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    addRandomTile(newGrid);
    addRandomTile(newGrid);
  };

  const addRandomTile = (currentGrid: number[][]) => {
    const emptyCells: [number, number][] = [];
    currentGrid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push([r, c]);
      });
    });
    if (emptyCells.length > 0) {
      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const slide = (row: number[]) => {
    const arr = row.filter(val => val !== 0);
    const merged: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
        const mergedVal = arr[i] * 2;
        merged.push(mergedVal);
        setScore(s => s + mergedVal);
        i++;
      } else {
        merged.push(arr[i]);
      }
    }
    while (merged.length < size) merged.push(0);
    return merged;
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;

    if (direction === 'left') {
      newGrid = newGrid.map(row => {
        const newRow = slide(row);
        if (newRow.join(',') !== row.join(',')) moved = true;
        return newRow;
      });
    } else if (direction === 'right') {
      newGrid = newGrid.map(row => {
        const newRow = slide(row.reverse()).reverse();
        if (newRow.join(',') !== row.join(',')) moved = true;
        return newRow;
      });
    } else if (direction === 'up') {
      for (let c = 0; c < size; c++) {
        const col = newGrid.map(row => row[c]);
        const newCol = slide(col);
        if (newCol.join(',') !== col.join(',')) moved = true;
        for (let r = 0; r < size; r++) newGrid[r][c] = newCol[r];
      }
    } else if (direction === 'down') {
      for (let c = 0; c < size; c++) {
        const col = newGrid.map(row => row[c]).reverse();
        const newCol = slide(col).reverse();
        if (newCol.join(',') !== col.reverse().join(',')) moved = true;
        for (let r = 0; r < size; r++) newGrid[r][c] = newCol[r];
      }
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      checkGameOver(newGrid);
    }
  };

  const checkGameOver = (currentGrid: number[][]) => {
    // Check for empty cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === 0) return;
      }
    }
    // Check for possible merges
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c < size - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return;
        if (r < size - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return;
      }
    }
    setGameOver(true);
  };

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      0: 'bg-surface-container-low',
      2: 'bg-amber-50 text-amber-900',
      4: 'bg-amber-100 text-amber-900',
      8: 'bg-amber-200 text-amber-900',
      16: 'bg-amber-300 text-amber-900',
      32: 'bg-orange-300 text-white',
      64: 'bg-orange-400 text-white',
      128: 'bg-orange-500 text-white',
      256: 'bg-red-500 text-white',
      512: 'bg-red-600 text-white',
      1024: 'bg-red-700 text-white',
      2048: 'bg-red-800 text-white',
    };
    return colors[value] || 'bg-red-900 text-white';
  };

  useEffect(() => {
    initGrid();
  }, []);

  useEffect(() => {
    const savedBest = localStorage.getItem('2048-best');
    if (savedBest) setBestScore(parseInt(savedBest));
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best', score.toString());
    }
  }, [score, bestScore]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      move(e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right');
    }
  }, [grid, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white font-headline">2048</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high">
            <X className="text-white size-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant font-label">Score</p>
            <p className="text-xl font-black text-white">{score}</p>
          </div>
          <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant font-label">Best</p>
            <p className="text-xl font-black text-white">{bestScore}</p>
          </div>
          <button onClick={initGrid} className="bg-primary/20 p-3 rounded-xl hover:bg-primary/30">
            <RotateCcw className="text-primary size-5" />
          </button>
        </div>

        <div className="bg-surface-container p-2 rounded-2xl">
          <div className="grid grid-cols-4 gap-2">
            {grid.map((row, r) => row.map((cell, c) => (
              <motion.div
                key={`${r}-${c}`}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`aspect-square rounded-xl flex items-center justify-center font-black text-xl ${getTileColor(cell)}`}
              >
                {cell > 0 && cell}
              </motion.div>
            )))}
          </div>
        </div>

        <p className="text-center text-on-surface-variant/60 text-sm mt-4">
          Use arrow keys or swipe to move tiles
        </p>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-10"
              onClick={initGrid}
            >
              <div className="bg-surface-container p-8 rounded-2xl text-center">
                <p className="text-2xl font-black text-white mb-2">Game Over!</p>
                <p className="text-on-surface-variant mb-4">Score: {score}</p>
                <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
