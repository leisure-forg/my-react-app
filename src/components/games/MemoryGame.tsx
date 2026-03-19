import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Trophy } from 'lucide-react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸', '🎹'];

export const MemoryGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const initGame = useCallback(() => {
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    const savedBest = localStorage.getItem('memory-best');
    if (savedBest) setBestMoves(parseInt(savedBest));
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (matches === emojis.length && bestMoves === null) {
      setBestMoves(moves);
      localStorage.setItem('memory-best', moves.toString());
    } else if (matches === emojis.length && moves < bestMoves!) {
      setBestMoves(moves);
      localStorage.setItem('memory-best', moves.toString());
    }
  }, [matches, moves, bestMoves]);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          setFlippedCards([]);
          setMatches(m => m + 1);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white font-headline">Memory Match</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high">
            <X className="text-white size-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant font-label">Moves</p>
            <p className="text-xl font-black text-white">{moves}</p>
          </div>
          <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant font-label">Pairs</p>
            <p className="text-xl font-black text-primary">{matches}/{emojis.length}</p>
          </div>
          <div className="flex-1 bg-surface-container rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase font-bold text-on-surface-variant font-label">Best</p>
            <p className="text-xl font-black text-white">{bestMoves || '-'}</p>
          </div>
          <button onClick={initGame} className="bg-primary/20 p-3 rounded-xl hover:bg-primary/30">
            <RotateCcw className="text-primary size-5" />
          </button>
        </div>

        <div className="bg-surface-container p-3 rounded-2xl">
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, index) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(index)}
                disabled={card.isFlipped || card.isMatched || isLocked}
                className="aspect-square"
              >
                <motion.div
                  className="w-full h-full rounded-xl flex items-center justify-center text-3xl"
                  animate={{
                    rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                    backgroundColor: card.isMatched ? 'rgba(34, 197, 94, 0.2)' : (card.isFlipped ? 'rgba(234, 42, 51, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.span
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0, opacity: card.isFlipped || card.isMatched ? 1 : 0 }}
                    transition={{ delay: card.isFlipped || card.isMatched ? 0.1 : 0 }}
                  >
                    {card.emoji}
                  </motion.span>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {matches === emojis.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-6 bg-gradient-to-br from-primary to-orange-600 p-6 rounded-2xl text-center"
            >
              <Trophy className="text-white size-12 mx-auto mb-2" />
              <p className="text-2xl font-black text-white mb-1">You Won!</p>
              <p className="text-white/80 text-sm">Completed in {moves} moves</p>
              {bestMoves === moves && (
                <p className="text-yellow-300 text-xs mt-1 font-bold">🏆 New Best Score!</p>
              )}
              <button
                onClick={initGame}
                className="mt-4 bg-white text-primary px-6 py-2 rounded-full font-bold"
              >
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-on-surface-variant/60 text-sm mt-4">
          Find all matching pairs
        </p>
      </div>
    </div>
  );
};
