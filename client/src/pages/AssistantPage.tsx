import React, { useState, useRef, useEffect } from 'react';
import { Send, Train, Sparkles, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ASSISTANT_RESPONSES } from '../data/mockData';

const QUICK_PROMPTS = [
  'What is the best time for maintenance?',
  'Which requests can be combined?',
  'Why was this block scheduled at night?',
  'Show high-priority maintenance activities',
  'What conflicts have been detected?',
  'What is the current asset availability?',
];

function useTypewriter(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) { clearInterval(interval); return; }
      setDisplayed(text.slice(0, ++i));
    }, 12);
    return () => clearInterval(interval);
  }, [text, active]);
  return displayed;
}

function AssistantBubble({ content, isLatest }: { content: string; isLatest: boolean }) {
  const displayed = useTypewriter(content, isLatest);
  return (
    <div
      className="chat-bubble assistant"
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{
        __html: displayed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/🟢|🟡|🔴|⚠️|📊|🔹|📋|⛔|🤖|👤|⚙️|🎯|📍|⏰|🚆|🔧/g, (m) => m)
          .replace(/\n/g, '<br/>'),
      }}
    />
  );
}

function getAssistantResponse(query: string): string {
  for (const { pattern, response } of ASSISTANT_RESPONSES) {
    if (pattern.test(query)) return response;
  }
  return `I understand you're asking about **"${query}"**. 

As the RailAvail Assistant, I can help you with:
- 🔹 Optimal maintenance time windows
- 🔹 Identifying combinable requests  
- 🔹 Conflict analysis and resolution
- 🔹 High-priority activity tracking
- 🔹 Asset availability metrics

Could you rephrase your question? For example: *"What is the best time for maintenance?"* or *"Which requests can be combined?"*`;
}

export function AssistantPage() {
  const { chatMessages, addChatMessage, clearChat, user } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    setInput('');
    addChatMessage({ role: 'user', content: query });
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = getAssistantResponse(query);
    setIsTyping(false);
    addChatMessage({ role: 'assistant', content: response });
  };

  const lastAssistantIdx = chatMessages.reduce((acc, msg, i) => msg.role === 'assistant' ? i : acc, -1);

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #ff6b00, #2557a7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            RailAvail Assistant
          </h1>
          <p className="page-subtitle">Context-aware intelligent assistant for railway operations queries</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearChat}>
          <RotateCcw size={13} /> Clear Chat
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, minHeight: 0 }}>
        {/* Chat area */}
        <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b00, #2557a7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Train size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>RailAvail Assistant</div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981' }} />
                Online · Context-aware AI
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-muted)', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 4, padding: '2px 8px' }}>
              Pattern-matching AI · LLM-ready architecture
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles size={28} color="var(--color-accent)" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                  Hello, {user?.name?.split(' ')[0]}! 👋
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  I'm RailAvail Assistant, your AI-powered railway operations advisor.<br />
                  Ask me anything about maintenance planning, conflicts, or schedules.
                </div>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className={`chat-avatar ${msg.role}`}>
                  {msg.role === 'user' ? (user?.avatar || '?') : '🚂'}
                </div>
                {msg.role === 'assistant' ? (
                  <AssistantBubble content={msg.content} isLatest={idx === lastAssistantIdx} />
                ) : (
                  <div className="chat-bubble user">{msg.content}</div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="chat-message assistant">
                <div className="chat-avatar assistant">🚂</div>
                <div className="chat-bubble assistant" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '14px 16px' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-muted)', animation: `blink 1.2s ease-in-out ${i * 0.3}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              type="text"
              className="form-control"
              placeholder="Ask about maintenance planning, conflicts, schedules..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-accent" onClick={() => handleSend()} disabled={!input.trim() && !isTyping}>
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Quick prompts sidebar */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--color-accent)" /> Quick Queries
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} className="btn btn-ghost" style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12, padding: '8px 12px', whiteSpace: 'normal', lineHeight: 1.4 }} onClick={() => handleSend(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 10, fontSize: 12 }}>About RailAvail Assistant</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 6 }}>🤖 <strong style={{ color: 'var(--color-text-secondary)' }}>Current mode:</strong> Pattern-matching AI with railway domain knowledge</div>
              <div style={{ marginBottom: 6 }}>🔌 <strong style={{ color: 'var(--color-text-secondary)' }}>Future:</strong> Plug-in GPT-4/Gemini API for natural language responses</div>
              <div>📊 <strong style={{ color: 'var(--color-text-secondary)' }}>Context:</strong> Uses live app data (requests, blocks, conflicts)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
