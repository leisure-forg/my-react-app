import React from 'react';
import { GAMES } from '../constants';
import { Search, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const GamesScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto hide-scrollbar pb-32 pt-20">
      <div className="px-5 py-2">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors size-5" />
          <input 
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-none bg-surface-container focus:ring-2 focus:ring-primary/50 text-base placeholder:text-on-surface-variant/50 transition-all" 
            placeholder="Find a game..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex gap-3 px-5 py-4 overflow-x-auto hide-scrollbar">
        {['All', 'Puzzle', 'Arcade', 'Logic', 'Strategy'].map((cat, idx) => (
          <button 
            key={cat}
            className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-sm font-semibold transition-all ${
              idx === 0 ? 'bg-primary text-white glow-shadow' : 'bg-surface-container text-on-surface-variant border border-transparent hover:border-primary/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-5">
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 font-headline uppercase tracking-wider">
            <Star className="text-primary size-5 fill-primary" />
            Featured Today
          </h2>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-orange-600 group shadow-lg"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest w-fit px-2 py-1 rounded mb-2">New Release</span>
              <h3 className="text-2xl font-black text-white leading-tight font-headline">Neon Runner: <br/>Infinite</h3>
              <div className="flex items-center justify-between mt-4">
                <p className="text-white/80 text-sm font-medium">1.2M Players this week</p>
                <button className="bg-white text-primary font-bold px-6 py-2 rounded-full shadow-lg active:scale-95 transition-transform">Play Now</button>
              </div>
            </div>
          </motion.div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 font-headline uppercase tracking-wider">All Mini-Games</h2>
          <div className="grid grid-cols-2 gap-4">
            {GAMES.map((game) => (
              <motion.div 
                key={game.id}
                whileHover={{ y: -5 }}
                className="bg-surface-container-low p-3 rounded-[2rem] border border-white/5 flex flex-col gap-3 group transition-all hover:border-primary/40"
              >
                <div className={`aspect-square rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-4xl font-black text-black/20 drop-shadow-sm font-headline">{game.title.split(' ')[0]}</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-base truncate font-headline">{game.title}</h4>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-[10px] font-bold text-primary uppercase">{game.stats.label}:</span>
                    <p className="text-[11px] font-bold text-on-surface-variant font-label tracking-tighter uppercase">{game.stats.value}</p>
                  </div>
                  <button className="w-full bg-primary py-2.5 rounded-xl text-white font-black text-sm active:scale-90 transition-all uppercase tracking-widest shadow-lg hover:shadow-primary/20">PLAY</button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
