import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Mic, Paperclip, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your personal portal assistant. Ready to help with your career roadmap, music picks, or just a quick game. How can I assist you today?",
      timestamp: '09:41 AM',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }],
        })).concat([{ role: 'user', parts: [{ text: input }] }]),
      });

      const text = response.text || "Sorry, I couldn't generate a response.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark">
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-20 pb-6 space-y-6 hide-scrollbar">
        <div className="flex justify-center">
          <span className="px-4 py-1 rounded-full bg-surface-container text-[10px] uppercase tracking-[0.2em] font-bold text-primary/70 font-label shadow-[0_0_10px_rgba(234,42,51,0.1)]">Today</span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end ml-auto max-w-[85%]' : 'max-w-[85%]'}`}
            >
              {msg.role === 'model' && (
                <div className="w-9 h-9 rounded-lg bg-surface-container border border-primary/20 shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(234,42,51,0.1)]">
                  <Bot className="text-primary size-5" />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
                <div className={`${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-[0_4px_15px_rgba(234,42,51,0.3)]' 
                    : 'bg-surface-container text-on-surface rounded-tl-none border border-primary/5'
                } px-4 py-3 rounded-2xl`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant/60 font-label">{msg.timestamp}</span>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(234,42,51,0.1)] bg-primary/10 flex items-center justify-center">
                  <User className="text-primary size-5" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container/50 border border-primary/10 shrink-0 flex items-center justify-center">
              <Bot className="text-primary/40 size-5" />
            </div>
            <div className="flex gap-1.5 bg-surface-container/50 px-4 py-3 rounded-2xl rounded-tl-none border border-primary/5">
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </main>

      <div className="px-4 pb-24 pt-2 bg-background-dark/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center bg-surface-container rounded-xl border border-primary/10 h-12">
            <button className="absolute left-3 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
              <Mic className="size-5" />
            </button>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 pl-11 pr-11 text-sm text-on-surface placeholder:text-on-surface-variant/50 font-body" 
              placeholder="Message AI Assistant..." 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="absolute right-3 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
              <Paperclip className="size-5" />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white shadow-[0_4px_15px_rgba(234,42,51,0.4)] active:scale-95 transition-transform disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
