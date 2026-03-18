import React, { useState } from 'react';
import { Heart, Shuffle, SkipBack, SkipForward, Pause, Play, ListMusic } from 'lucide-react';
import { motion } from 'motion/react';

export const MusicScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-hidden relative">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center blur-[60px] brightness-[0.4] scale-125"
        style={{ backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuAQUj8kjx1hTizXSaXJ845QW7-tsLSIUezhZX_im3JWRCSdskSSfb7S5Pkp_BlbXuKxnr5joqdmbUY1IPiTwrGg3JRrIceJy_2F8gFeCmk0CPDSSaoxr6JtpwtNPc1utxiiLE7OiCpnctWYaMJLWq2xi3VJe0j9o3Jbil0_fqsVaxexrvSowpivComIbumZVZIu47-QO63RlN9OdIlFyJJFxljKXPe3rHh9ebvZXsqG88TSPIzXYKySZrGZ-2soSGh208pWP4Cxmg)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0"></div>

      {/* Main Content: Vinyl Record */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pt-20">
        <div className="relative group">
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="size-72 md:size-80 rounded-full bg-[#0a0a0a] flex items-center justify-center shadow-[0_0_0_10px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden border-[6px] border-[#1a1a1a]"
          >
            <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-radial-gradient(circle, #333 0, #333 1px, transparent 1px, transparent 4px)' }}></div>
            <div className="size-48 rounded-full overflow-hidden border-4 border-[#121212] z-10 relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHFvtNDNK5_g8AEIJ20BG-bAPaoW5DGkwbQwUQP-5ipimq_x2ReYu6-uAMK_v_RGB-9mowsDKvl2VRoAvIbF3fECVemdo0k_QlSUx29YQfrbLBvrYmW-4jgSPEZRHvGacaLiXQyKPYV9H11zSDZq_O4fRnRkCG6uIp0DPES8sd9FIKs_hzl0QeJf7-MgPUE8vbBJJizLTC1950I_aVir4pC3j5ZcAgFDVOxJOmYdGUoAmh0j6P2001rrxD8leSr1lDY22cvbH74g" 
                alt="Album cover" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="size-4 bg-background-dark rounded-full border border-white/20"></div>
            </div>
          </motion.div>
        </div>

        {/* Lyric Teaser */}
        <div className="mt-12 text-center opacity-80 h-12 flex flex-col justify-center">
          <p className="text-lg font-light italic">"Waiting in a car, waiting for a ride in the dark..."</p>
        </div>
      </main>

      {/* Footer Controls Area */}
      <section className="relative z-20 bg-surface/40 backdrop-blur-3xl px-8 pt-8 pb-32 rounded-t-[2.5rem] border-t border-primary/10">
        {/* Song Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl font-bold tracking-tight">Midnight City</h2>
            <p className="text-primary font-medium opacity-90 mt-1">M83 • Hurry Up, We're Dreaming</p>
          </div>
          <button className="text-primary">
            <Heart className="size-8 fill-primary" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-[45%] bg-primary rounded-full"></div>
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-[11px] font-medium opacity-50">1:17</span>
            <span className="text-[11px] font-medium opacity-50">4:03</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <button className="text-on-surface opacity-60 hover:opacity-100 transition-opacity">
            <Shuffle className="size-6" />
          </button>
          <div className="flex items-center gap-8">
            <button className="text-on-surface">
              <SkipBack className="size-8 fill-current" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="size-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current ml-1" />}
            </button>
            <button className="text-on-surface">
              <SkipForward className="size-8 fill-current" />
            </button>
          </div>
          <button className="text-on-surface opacity-60 hover:opacity-100 transition-opacity">
            <ListMusic className="size-6" />
          </button>
        </div>
      </section>
    </div>
  );
};
