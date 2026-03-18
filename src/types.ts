export type Screen = 'music' | 'roadmap' | 'games' | 'world' | 'chat';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'current' | 'completed' | 'planned';
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  images?: string[];
}

export interface Game {
  id: string;
  title: string;
  category: string;
  stats: { label: string; value: string };
  color: string;
  icon: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
