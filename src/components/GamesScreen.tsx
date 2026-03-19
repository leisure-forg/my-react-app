import React, { useState } from 'react';
import { Search, Star, Gamepad2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Game2048, SnakeGame, TicTacToe, MemoryGame } from './games';

interface PlayableGame {
  id: string;
  title: string;
  category: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  component: React.FC<{ onClose: () => void }>;
}

const PLAYABLE_GAMES: PlayableGame[] = [
  {
    id: '2048',
    title: '2048',
    category: 'Puzzle',
    description: 'Join tiles and get to 2048',
    color: 'from-amber-400 to-orange-500',
    icon: <span className="text-2xl font-black">2048</span>,
    component: Game2048,
  },
  {
    id: 'snake',
    title: 'Snake',
    category: 'Arcade',
    description: 'Classic snake game',
    color: 'from-green-400 to-emerald-600',
    icon: <span className="text-2xl">🐍</span>,
    component: SnakeGame,
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    category: 'Logic',
    description: 'Beat the CPU',
    color: 'from-blue-400 to-indigo-600',
    icon: <span className="text-2xl">⭕</span>,
    component: TicTacToe,
  },
  {
    id: 'memory',
    title: 'Memory Match',
    category: 'Puzzle',
    description: 'Find matching pairs',
    color: 'from-purple-400 to-pink-600',
    icon: <span className="text-2xl">🎴</span>,
    component: MemoryGame,
  },
];

export const GamesScreen: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<PlayableGame | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(PLAYABLE_GAMES.map(g => g.category)))];
  const filteredGames = selectedCategory === 'All'
    ? PLAYABLE_GAMES
    : PLAYABLE_GAMES.filter(g => g.category === selectedCategory);

  const GameComponent = selectedGame?.component;

  return (
    <>
      <div className="flex flex-col h-full bg-background-dark overflow-y-auto hide-scrollbar pb-32 pt-20">
        {/* Header */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg glow-shadow">
              <Gamepad2 className="text-white size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-headline">Arcade</h1>
              <p className="text-sm text-on-surface-variant">{PLAYABLE_GAMES.length} games available</p>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors size-5" />
            <input
              className="w-full h-12 pl-12 pr-4 rounded-2xl border-none bg-surface-container focus:ring-2 focus:ring-primary/50 text-base placeholder:text-on-surface-variant/50 transition-all"
              placeholder="Search games..."
              type="text"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 px-5 py-2 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat ? 'bg-primary text-white glow-shadow' : 'bg-surface-container text-on-surface-variant border border-transparent hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mx-5 mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-600/20 border border-primary/20">
          <div className="flex items-center gap-3">
            <Trophy className="text-primary size-8" />
            <div>
              <p className="text-sm font-bold text-white">Ready to Play?</p>
              <p className="text-xs text-on-surface-variant">Choose a game below to start</p>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <main className="flex-1 px-5 py-6">
          <h2 className="text-lg font-bold mb-4 font-headline uppercase tracking-wider text-on-surface">
            {selectedCategory === 'All' ? 'All Games' : selectedCategory}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredGames.map((game) => (
              <motion.button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-surface-container-low p-4 rounded-[1.5rem] border border-white/5 flex flex-col gap-3 transition-all hover:border-primary/40 text-left"
              >
                <div className={`aspect-square rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center relative overflow-hidden shadow-lg`}>
                  {game.icon}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div>
                  <h4 className="font-bold text-base truncate font-headline text-white">{game.title}</h4>
                  <p className="text-xs text-on-surface-variant truncate">{game.description}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded-full">
                    {game.category}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </main>
      </div>

      {/* Game Modal */}
      <AnimatePresence>
        {GameComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GameComponent onClose={() => setSelectedGame(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
