import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

export const CopilotDrawer: React.FC = () => {
  const { isCopilotOpen, setCopilotOpen } = useStore();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string; evidence?: any[] }>>([
    {
      sender: 'AI',
      text: 'Hello Alex! I am your Enterprise Financial Operations Copilot. I have realtime access to your Salesforce CRM, Stripe Gateway, Sift Fraud Engine, and RAG SOPs. How can I assist your team today?',
    },
  ]);

  if (!isCopilotOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'USER', text: query }]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendCopilotChat(query);
      setMessages((prev) => [...prev, { sender: 'AI', text: res.reply, evidence: res.evidence }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { sender: 'AI', text: `Error processing query: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Summarize customer profile CUST-8910',
    'Why was refund REF-70291 created?',
    'Explain fraud risk score for TXN-99120',
    'Show SOP refund compliance guidelines',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Enterprise AI Copilot</h3>
            <p className="text-[10px] text-slate-400">Multi-Agent RAG Orchestrator</p>
          </div>
        </div>
        <button
          onClick={() => setCopilotOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[90%] p-3 rounded-xl text-xs leading-relaxed ${
                m.sender === 'USER'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                  : 'glass-card border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* RAG Citations */}
              {m.evidence && m.evidence.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-700/60 space-y-1">
                  <div className="text-[10px] font-semibold text-cyan-400 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Retrieved Knowledge Evidence:</span>
                  </div>
                  {m.evidence.map((e, eIdx) => (
                    <div key={eIdx} className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                      <span className="font-semibold text-slate-300">{e.title}</span> ({e.docCode})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 p-3 glass-card rounded-xl">
            <Bot className="w-4 h-4 animate-bounce" />
            <span>Coordinating agents (Support &rarr; Payment &rarr; Fraud &rarr; RAG)...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/30">
        <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase">Suggested Prompts</div>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[10px] px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 hover:text-white hover:bg-blue-600/30 border border-slate-700/60 transition text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Copilot or type command..."
          className="flex-1 px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputMessage.trim()}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
