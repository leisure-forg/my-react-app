import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { X, RotateCcw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

export const SnakeGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const gridSize = 20;
  const tileCount = 15;
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number>();

  const placeFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
    // Make sure food doesn't spawn on snake
    const onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
    if (onSnake) {
      return placeFood();
    }
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(placeFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, placeFood]);

  const changeDirection = useCallback((newDir: Position) => {
    // Prevent 180 degree turns
    if (direction.x + newDir.x === 0 && direction.y + newDir.y === 0) return;
    setDirection(newDir);
  }, [direction]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        changeDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        e.preventDefault();
        changeDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        changeDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        e.preventDefault();
        changeDirection({ x: 1, y: 0 });
        break;
      case ' ':
        e.preventDefault();
        setIsPaused(p => !p);
        break;
    }
  }, [changeDirection]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood({ x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) });
  };

  useEffect(() => {
    const savedBest = localStorage.getItem('snake-best');
    if (savedBest) setBestScore(parseInt(savedBest));
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('snake-best', score.toString());
    }
  }, [score, bestScore]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    gameLoopRef.current = window.setInterval(moveSnake, 100);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake]);

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection({ x: dx > 0 ? 1 : -1, y: 0 });
    } else {
      changeDirection({ x: 0, y: dy > 0 ? 1 : -1 });
    }

    touchStartRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white font-headline">Snake</h2>
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
          <button onClick={resetGame} className="bg-primary/20 p-3 rounded-xl hover:bg-primary/30">
            <RotateCcw className="text-primary size-5" />
          </button>
        </div>

        <div
          className="bg-surface-container p-2 rounded-2xl relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <svg width={gridSize * tileCount} height={gridSize * tileCount} className="mx-auto">
            {/* Grid */}
            {Array.from({ length: tileCount }).map((_, y) =>
              Array.from({ length: tileCount }).map((_, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={x * gridSize}
                  y={y * gridSize}
                  width={gridSize - 1}
                  height={gridSize - 1}
                  fill="rgba(255,255,255,0.03)"
                  rx="2"
                />
              ))
            )}

            {/* Food */}
            <motion.circle
              cx={food.x * gridSize + gridSize / 2}
              cy={food.y * gridSize + gridSize / 2}
              r={gridSize / 2 - 2}
              fill="#ea2a33"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />

            {/* Snake */}
            {snake.map((segment, i) => (
              <rect
                key={i}
                x={segment.x * gridSize + 1}
                y={segment.y * gridSize + 1}
                width={gridSize - 3}
                height={gridSize - 3}
                fill={i === 0 ? '#22c55e' : '#4ade80'}
                rx="3"
              />
            ))}
          </svg>

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <p className="text-2xl font-black text-white mb-2">Game Over!</p>
                <p className="text-on-surface-variant mb-4">Score: {score}</p>
                <button onClick={resetGame} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
              <p className="text-2xl font-black text-white">Paused</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => changeDirection({ x: 0, y: -1 })}
            className="bg-surface-container w-16 h-16 rounded-xl flex items-center justify-center active:bg-surface-container-high"
          >
            <span className="text-2xl">↑</span>
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => changeDirection({ x: -1, y: 0 })}
            className="bg-surface-container w-16 h-16 rounded-xl flex items-center justify-center active:bg-surface-container-high"
          >
            <span className="text-2xl">←</span>
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-surface-container w-16 h-16 rounded-xl flex items-center justify-center active:bg-surface-container-high"
          >
            <span className="text-sm font-bold">{isPaused ? '▶' : '⏸'}</span>
          </button>
          <button
            onClick={() => changeDirection({ x: 1, y: 0 })}
            className="bg-surface-container w-16 h-16 rounded-xl flex items-center justify-center active:bg-surface-container-high"
          >
            <span className="text-2xl">→</span>
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => changeDirection({ x: 0, y: 1 })}
            className="bg-surface-container w-16 h-16 rounded-xl flex items-center justify-center active:bg-surface-container-high"
          >
            <span className="text-2xl">↓</span>
          </button>
        </div>

        <p className="text-center text-on-surface-variant/60 text-sm mt-4">
          Use arrow keys, buttons, or swipe to control
        </p>
      </div>
    </div>
  );
};
