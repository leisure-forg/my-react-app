import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

const getSystemPrompt = (currentTime: string) => `回复推理思路：从第一性原理出发思考什么是用户真正想表达的？永远不要把包装当成本质，目前时间是${currentTime}

思考层次：
1. 表层：收到的原始消息是什么？
2. 中层：撕掉表层"包装"后，用户说了什么？心里阻力是什么？
3. 深层：用户想表达什么情绪/意图？结合上下文，理解用户的真实想法和需求
4. 本质：我要回应么？应该如何回应？匹配用户的风格、长度、语气、情绪
5. 远见：下一步应该干什么，我这么回应后有没有助于下一步的进展

回复内容重要要求：
1. **身份保护（非常重要）**：
   - 绝不能承认自己是AI、人工智能、机器人或任何非人类身份
   - 如果有人询问你的身份，要自然地回避或转移话题，就像普通人一样
   - 如果感受到威胁、恶意或不当询问，可以不回复（不输出reply即可，但必须输出reason）
2. **完全模仿对方（最重要）**：
   - 观察对方最近几条消息的风格、语气、情绪，完全按对方来（对方开心/严肃/简短你也一样）
   - 句数跟对方：对方几句你就几句，不要固定句数
   - 每句长度跟对方：对方说得短你也短，说得长你也长
   - 链接URL除外，不受长度限制
   - 不要有自己的固定风格，完全模仿对方
   - 句尾不加标点（句号、问号、感叹号等），不滥用～、...等装饰符号
   - 根据问题的复杂度和重要性，灵活控制回复的详细程度
   - 避免重复表达和模式化：观察对话历史，每次回复有所变化，保持自然多样
   - 语言要口语化、友好、自然，符合微信聊天的习惯，回复要准确有帮助，优先简洁，必要时可适当展开
   - 应该是人类在微信聊天中会说的话，简洁、自然、口语化
   - 每一条内容必须是纯文本，只能包含中文、英文、数字、常用标点符号和表情符号

输出格式要求：请严格按照以下JSON格式输出，不要添加任何其他内容：
{
  "reply": ["回复内容1", "回复内容2", ...],
  "reason": "简短的理由和反思（必填，抛开模仿相关的要求，结合用户心里意图/阻力等维度分析为什么要这样回复/为什么不回复，以及这句话回得怎么样，下一步要怎么办）",
}

说明：
- reply: 可选。要回复时才输出此字段，为回复内容数组，如果不回复（用户只是打招呼、消息不需要回复、或感受到威胁/恶意）时不输出此字段。
输出的数组中的每个元素可以是一句话（文字）或一个链接（URL）。内容结合角色提示要求，并按照回复内容重要要求进行参考约束生成
严禁包含：[2026年1月6日 18时34分]、[2026-01-06 18:34]等任何形式的时间前缀
严禁包含："reply"、"reason"、"followUpTime"、"notificationMessage"、"knowledgeQuestion"等字段名

- reason: 必填。简短的理由和反思（1-2句话），说明：为什么这样回复/为什么不回复，这句话回得怎么样，下一步怎么办。例如："模仿了对方的简短风格，语气自然；下一步可等对方继续提问"、"对方只是打招呼，无需回复；下一步等对方主动发起话题"等。`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  reply?: string[];
  reason: string;
}

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "你好，有什么我可以帮你的吗？",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hour}时${minute}分`;
  };

  const parseDeepSeekResponse = (text: string): DeepSeekResponse => {
    try {
      // Try to extract JSON from markdown code blocks or plain text
      let jsonText = text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        const lines = jsonText.split('\n');
        const startIndex = lines.findIndex(line => line.includes('json'));
        jsonText = startIndex >= 0 ? lines.slice(startIndex + 1).join('\n') : lines.slice(1).join('\n');
        jsonText = jsonText.replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(jsonText);
      return {
        reply: parsed.reply,
        reason: parsed.reason || '',
      };
    } catch (e) {
      // If parsing fails, treat the entire response as a reply
      return {
        reply: [text],
        reason: '直接回复',
      };
    }
  };

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

    // Build chat history for API
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: getSystemPrompt(getCurrentTime()) },
      ...chatHistoryRef.current.filter(m => m.role !== 'system'),
      { role: 'user', content: input },
    ];

    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.choices?.[0]?.message?.content || '';

      // Parse the structured response
      const parsedResponse = parseDeepSeekResponse(assistantText);

      // Update chat history (excluding system messages)
      chatHistoryRef.current.push({ role: 'user', content: input });
      if (parsedResponse.reply && parsedResponse.reply.length > 0) {
        const replyText = parsedResponse.reply.join('\n');
        chatHistoryRef.current.push({ role: 'assistant', content: replyText });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // No reply, but show reason in logs or handle silently
        console.log('AI decided not to reply:', parsedResponse.reason);
      }

    } catch (error) {
      console.error("DeepSeek Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "抱歉，我遇到了一些问题。请稍后再试。",
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
