import React from 'react';
import { Settings, User } from 'lucide-react';

export const TopAppBar: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-4 max-w-[430px] left-1/2 -translate-x-1/2 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
          <User className="text-primary size-5" />
        </div>
        <h1 className="text-xl font-headline font-extrabold text-primary tracking-tighter italic uppercase">KINETIC PATH.</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95">
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  );
};

import { Music, Route, Gamepad2, Globe, MessageSquare } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavBarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, onScreenChange }) => {
  const navItems = [
    { id: 'music', label: 'Music', icon: Music },
    { id: 'roadmap', label: 'Roadmap', icon: Route },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'world', label: 'World', icon: Globe },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-lg rounded-t-2xl shadow-[0_-4px_20px_rgba(234,42,51,0.15)] max-w-[430px] left-1/2 -translate-x-1/2">
      <div className="flex justify-around items-center w-full px-2 pb-6 pt-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center justify-center transition-all active:scale-90 ${
                isActive 
                  ? 'text-primary font-bold scale-110 drop-shadow-[0_0_8px_rgba(234,42,51,0.6)]' 
                  : 'text-on-surface/50 hover:text-primary/80'
              }`}
            >
              <Icon className={`size-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="font-label text-[10px] uppercase tracking-widest mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
