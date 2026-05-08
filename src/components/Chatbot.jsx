import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { saveMessages, loadMessages } from '../utils/storage';

const HF_TOKEN = import.meta.env.VITE_AI_TOKEN;
const HF_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

function buildContext(issData, newsData) {
  const pos = issData?.position;
  const people = issData?.astronauts?.people?.map((p) => p.name).join(', ') || 'Unknown';
  const techTitles = (newsData?.technology || []).map((a) => a.title).join(' | ');
  const sciTitles = (newsData?.science || []).map((a) => a.title).join(' | ');

  return `You are SpaceSync AI, a dashboard assistant. You ONLY answer questions using the data below. Do NOT use outside knowledge. If the answer is not in the data, say "I don't have that information in the current dashboard data."

=== DASHBOARD DATA ===
ISS Position: Lat ${pos?.lat?.toFixed(4) ?? 'N/A'}°, Lon ${pos?.lon?.toFixed(4) ?? 'N/A'}°
ISS Speed: ${issData?.speed?.toLocaleString() ?? 'N/A'} km/h
ISS Location: ${issData?.locationName ?? 'Unknown'}
People in Space: ${issData?.astronauts?.number ?? 0} (${people})
Positions Tracked: ${issData?.positions?.length ?? 0}

Technology News (${(newsData?.technology || []).length} articles):
${techTitles || 'No articles loaded'}

Science News (${(newsData?.science || []).length} articles):
${sciTitles || 'No articles loaded'}
=== END DATA ===`;
}

export default function Chatbot({ issData, newsData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || typing) return;
    const userMsg = { role: 'user', content: input.trim(), time: new Date().toLocaleTimeString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setTyping(true);

    try {
      const systemPrompt = buildContext(issData, newsData);
      const prompt = `<s>[INST] ${systemPrompt} [/INST] Answer only from the dashboard data above.</s>\n${newMessages
        .map((message) => `${message.role === 'user' ? '[INST]' : ''} ${message.content} ${message.role === 'user' ? '[/INST]' : ''}`)
        .join('\n')}`;

      const response = await axios.post(
        HF_URL,
        { inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.3, return_full_text: false } },
        { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
      );

      const raw = response.data?.[0]?.generated_text || 'I could not get a response.';
      const cleaned = raw.replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '').trim();

      setMessages((prev) => [...prev, { role: 'assistant', content: cleaned, time: new Date().toLocaleTimeString() }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.response?.status === 503
            ? 'Model is loading, please try again shortly.'
            : 'Failed to get AI response. Check your Hugging Face token.',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    saveMessages([]);
  };

  return (
    <>
      <button
        onClick={() => setOpen((openState) => !openState)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 text-slate-950 text-2xl shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        title="Open SpaceSync AI"
      >
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] glass-card flex flex-col shadow-2xl shadow-black/50 border-cyan-500/20">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">🤖</div>
              <div>
                <p className="font-display font-semibold text-white text-sm">SpaceSync AI</p>
                <p className="text-slate-500 text-xs">Dashboard-aware assistant</p>
              </div>
            </div>
            <button onClick={clearChat} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Clear</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8">
                <div className="text-3xl mb-2">🛸</div>
                <p>Ask about ISS location, speed, astronauts, or current news.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-cyan-500 text-slate-950 rounded-br-sm'
                      : 'bg-white/10 text-slate-200 rounded-bl-sm'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                    <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-cyan-950' : 'text-slate-500'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))
            )}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${index * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about ISS or news..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              disabled={typing}
            />
            <button
              onClick={sendMessage}
              disabled={typing || !input.trim()}
              className="btn-primary px-3 py-2 disabled:opacity-40"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
