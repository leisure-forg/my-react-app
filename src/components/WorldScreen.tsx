import React from 'react';
import { POSTS } from '../constants';
import { Heart, MessageCircle, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export const WorldScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto hide-scrollbar pb-32 pt-20">
      <main className="max-w-2xl mx-auto px-4 relative vertical-spine">
        {POSTS.map((post) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 flex gap-4 mb-12"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface-container-low border border-outline/20">
              <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-headline font-bold text-primary tracking-tight">{post.author}</h3>
              <p className="mt-2 text-on-surface-variant leading-relaxed">{post.content}</p>
              
              {post.images && post.images.length > 0 && (
                <div className={`mt-4 ${post.images.length === 1 ? 'max-w-sm' : 'grid grid-cols-3 gap-2 aspect-square max-w-md'} rounded-xl overflow-hidden border border-outline/10 bg-surface-container-low`}>
                  {post.images.map((img, idx) => (
                    <div key={idx} className={post.images?.length === 1 ? '' : 'aspect-square rounded-lg overflow-hidden'}>
                      <img src={img} alt={`Post image ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="font-label text-xs uppercase tracking-widest text-outline">{post.timestamp}</span>
                <div className="flex items-center gap-4 text-outline">
                  <button className="hover:text-primary transition-colors flex items-center gap-1 active:scale-95">
                    <Heart className={`size-4 ${post.likes > 20 ? 'fill-primary text-primary' : ''}`} />
                    <span className={`font-label text-[10px] ${post.likes > 20 ? 'text-primary' : ''}`}>{post.likes}</span>
                  </button>
                  <button className="hover:text-primary transition-colors flex items-center gap-1 active:scale-95">
                    <MessageCircle className="size-4" />
                    <span className="font-label text-[10px]">{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </main>

      <button className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center glow-shadow active:scale-90 transition-transform z-40">
        <Plus className="size-8" />
      </button>
    </div>
  );
};
