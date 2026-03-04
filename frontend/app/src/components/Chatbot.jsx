import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Send, X } from 'lucide-react';

const initialBotMessage = {
  id: 1,
  type: 'bot',
  text: 'Hi! I am OnThings Support. Ask me anything about orders, payments, or account help.'
};

const STORAGE_KEY = 'onthings_chatbot_user_id';

const generateChatSessionId = () =>
  `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([initialBotMessage]);
  const messagesEndRef = useRef(null);
  const userIdRef = useRef(null);

  const backendApiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const chatbotApiUrl = import.meta.env.VITE_CHATBOT_API_URL || `${backendApiBase}/chatbot/chat`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saved = generateChatSessionId();
      localStorage.setItem(STORAGE_KEY, saved);
    }
    userIdRef.current = saved;
  }, []);

  const resetChat = () => {
    setMessages([initialBotMessage]);
    setInput('');
    setIsLoading(false);
    const newSessionId = generateChatSessionId();
    localStorage.setItem(STORAGE_KEY, newSessionId);
    userIdRef.current = newSessionId;
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    const userMessage = { id: Date.now(), type: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(chatbotApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userIdRef.current || ''
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error || data.success === false) {
        throw new Error(data.error || data.message || 'Failed to get chatbot response.');
      }

      const payload = data.data || data;

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: payload.answer || 'I could not find a response.',
        source: payload.source || null,
        confidence: typeof payload.confidence_score === 'number' ? payload.confidence_score : null
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Chatbot is starting or temporarily unavailable. Please wait a few seconds and try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sourceLabel = (source) => {
    if (source === 'website') return 'Website';
    if (source === 'website_assisted') return 'Website';
    if (source === 'guardrail') return 'Website';
    if (source === 'faq') return 'Website';
    if (source === 'api') return 'AI';
    if (source === 'out_of_scope') return 'Scope';
    if (source === 'offline') return 'Offline';
    return source || '';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all transform ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
        } shadow-lg`}
        aria-label="Toggle chatbot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[420px] h-[560px] max-w-[calc(100vw-2rem)] max-h-[75vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">OnThings Support</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="hover:bg-blue-500 p-1 rounded-full transition-colors"
                aria-label="Reset chat"
                title="Reset chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-500 p-1 rounded-full transition-colors"
                aria-label="Close chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  {msg.type === 'bot' && msg.source && (
                    <p className="text-[11px] mt-1 opacity-80">
                      {sourceLabel(msg.source)}
                      {msg.confidence !== null ? ` (${Math.round(msg.confidence * 100)}%)` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg rounded-bl-none text-sm">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t p-3 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
