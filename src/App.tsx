import { useState } from 'react';
import { Screen } from './types';
import { TopAppBar, BottomNavBar } from './components/Navigation';
import { RoadmapScreen } from './components/RoadmapScreen';
import { WorldScreen } from './components/WorldScreen';
import { GamesScreen } from './components/GamesScreen';
import { MusicScreen } from './components/MusicScreen';
import { ChatBot } from './components/ChatBot';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('roadmap');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'music':
        return <MusicScreen />;
      case 'roadmap':
        return <RoadmapScreen />;
      case 'games':
        return <GamesScreen />;
      case 'world':
        return <WorldScreen />;
      case 'chat':
        return <ChatBot />;
      default:
        return <RoadmapScreen />;
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background-dark border-x border-border-muted shadow-2xl overflow-hidden">
      <TopAppBar />
      
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNavBar 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen} 
      />

      {/* Dynamic Notch (iPhone feel) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-[60] pointer-events-none"></div>
    </div>
  );
}
