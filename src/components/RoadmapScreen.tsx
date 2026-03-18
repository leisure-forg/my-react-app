import React from 'react';
import { MILESTONES } from '../constants';
import { Share2 } from 'lucide-react';
import { motion } from 'motion/react';

export const RoadmapScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto hide-scrollbar pb-32">
      <section className="px-6 pt-24 pb-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Skills & Expertise</h2>
        <div className="space-y-4">
          <div className="group">
            <h3 className="text-4xl font-extrabold tracking-tight leading-none group-hover:text-primary transition-colors">Fullstack Development</h3>
            <p className="text-xs text-on-surface-variant mt-1">High-performance React & Node.js ecosystems</p>
          </div>
          <div className="group">
            <h3 className="text-4xl font-extrabold tracking-tight leading-none group-hover:text-primary transition-colors">React/Next.js Expert</h3>
            <p className="text-xs text-on-surface-variant mt-1">Server-side excellence & UI architecture</p>
          </div>
          <div className="group">
            <h3 className="text-4xl font-extrabold tracking-tight leading-none group-hover:text-primary transition-colors">Cloud Architecture</h3>
            <p className="text-xs text-on-surface-variant mt-1">Scalable AWS & Serverless infrastructures</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {['TypeScript', 'PostgreSQL', 'Docker', 'GraphQL'].map((skill) => (
            <span key={skill} className="px-3 py-1 rounded-full border border-border-muted text-[10px] font-bold uppercase tracking-wider bg-surface/50">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <main className="flex-1 px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Milestones</h2>
          <span className="text-[10px] font-bold text-on-surface-variant">2021 — PRESENT</span>
        </div>
        
        <div className="relative space-y-12">
          {/* Simple Vertical Line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-border-muted"></div>
          
          {MILESTONES.map((milestone) => (
            <motion.div 
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative pl-8 ${milestone.status === 'planned' ? 'opacity-40' : ''}`}
            >
              <div className={`absolute left-0 top-1.5 size-4 rounded-full border-4 border-background-dark ${
                milestone.status === 'current' ? 'bg-primary shadow-[0_0_10px_rgba(234,42,51,0.5)]' : 'bg-slate-300'
              }`}></div>
              <div>
                <span className={`text-[10px] font-bold uppercase ${milestone.status === 'current' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {milestone.date}
                </span>
                <h4 className="text-lg font-bold leading-tight mt-1">{milestone.title}</h4>
                <p className="text-sm text-on-surface-variant mt-1">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-32 right-6 z-40">
        <button className="bg-primary text-white size-12 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform glow-shadow">
          <Share2 className="size-6" />
        </button>
      </div>
    </div>
  );
};
