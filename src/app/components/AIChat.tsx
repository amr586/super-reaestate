import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { streamChat } from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً! أنا مساعد إسكنك الذكي 🏠\nيمكنني مساعدتك في إيجاد العقار المناسب لك. أخبرني عن احتياجاتك (الموقع، السعر، عدد الغرف...)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    setStreaming('');

    let full = '';
    try {
      await streamChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        chunk => { full += chunk; setStreaming(full); },
        () => {
          setMessages(prev => [...prev, { role: 'assistant', content: full }]);
          setStreaming('');
          setLoading(false);
        }
      );
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' }]);
      setStreaming('');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 left-6 z-40 w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-full flex items-center justify-center shadow-2xl shadow-purple-400/40"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <Bot size={22} className="text-white" />
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-44 left-6 z-40 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl shadow-purple-200/50 flex flex-col overflow-hidden border border-purple-100"
            style={{ maxHeight: '70vh', height: 480 }}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">مساعد إسكنك الذكي</div>
                <div className="text-purple-200 text-xs">مدعوم بالذكاء الاصطناعي</div>
              </div>
              <button onClick={() => setOpen(false)} className="mr-auto text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-lg flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-gray-100 text-gray-800 rounded-tr-sm' : 'bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white rounded-tl-sm'
                  }`}>{m.content}</div>
                </motion.div>
              ))}
              {(loading || streaming) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-lg flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  {streaming ? (
                    <div className="max-w-[75%] bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{streaming}</div>
                  ) : (
                    <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="اكتب سؤالك..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#7C3AED] transition-all"
                  disabled={loading}
                />
                <button onClick={send} disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:opacity-90 transition-all flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">مساعد ذكي لتوصيات العقارات</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
