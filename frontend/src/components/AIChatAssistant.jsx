import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { MessageSquare, X, Send, Compass, User, AlertCircle } from 'lucide-react';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Yo! I'm your TeamUp AI Assistant. Ask me anything like:\n\n• \"Find football matches near me\"\n• \"Recommend turf slots\"\n• \"How do I create a team?\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await API.post('/api/ai/chat', { message: userText });
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.data.response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 2,
        sender: 'ai',
        text: "Sorry, I couldn't reach the AI services. Please verify the backend is running.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-3d-glow flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-full shadow-2xl transition hover:scale-110 active:scale-95"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-800 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden relative glass-premium transition duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-650 to-emerald-650 text-white flex justify-between items-center border-b border-gray-150/10">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-teal-300 animate-spin-slow" />
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider">TeamUp AI Bot</h3>
                <span className="text-[9px] text-teal-200 font-bold">Online Assistance</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-slate-900/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                    msg.sender === 'user'
                      ? 'bg-primary-100 text-primary-750'
                      : 'bg-teal-100 dark:bg-slate-700 text-teal-700 dark:text-teal-400'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : '🤖'}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3 rounded-2xl max-w-[78%] text-[11px] leading-relaxed shadow-sm font-medium ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-slate-700 flex items-center justify-center text-xs">🤖</div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-800 flex space-x-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-800 flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-3 py-2 rounded-xl text-xs outline-none text-gray-800 dark:text-slate-250 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default AIChatAssistant;
