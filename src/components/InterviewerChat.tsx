import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, FileCheck, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface InterviewerChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGeneratingMessage: boolean;
  onEndChat: () => void;
  isSynthesizingReport: boolean;
}

export const InterviewerChat: React.FC<InterviewerChatProps> = ({
  messages,
  onSendMessage,
  isGeneratingMessage,
  onEndChat,
  isSynthesizingReport,
}) => {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGeneratingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGeneratingMessage) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestedClick = (suggestedText: string) => {
    if (isGeneratingMessage) return;
    onSendMessage(suggestedText);
  };

  const suggestedReplies = [
    "The Poseidon wave CGI at 0:25 was insane! Loved the scale.",
    "The dark fight scene around 0:58 was a bit hard to follow.",
    "I'm definitely going to see this on opening night in IMAX!"
  ];

  return (
    <div id="interviewer-chat-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4 min-h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="interviewer-title" className="text-sm font-semibold text-slate-100">AI Observer Interviewer</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full">
                gpt-5.6-luna
              </span>
            </div>
            <p className="text-xs text-slate-400">Referencing video transcript & webcam reaction timestamps</p>
          </div>
        </div>

        <button
          id="end-chat-btn"
          onClick={onEndChat}
          disabled={isSynthesizingReport}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
        >
          {isSynthesizingReport ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-3.5 h-3.5" />
              <span>End Chat & Synthesis</span>
            </>
          )}
        </button>
      </div>

      {/* Message List Stream */}
      <div id="chat-messages-container" className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 overflow-y-auto max-h-[360px] flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse self-end' : 'self-start'
            } max-w-[85%]`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isGeneratingMessage && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 p-2.5 rounded-xl w-fit animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>AI Interviewer is analyzing reactions & writing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Replies */}
      <div id="suggested-replies-bar" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] text-slate-500 font-medium shrink-0">Quick reply:</span>
        {suggestedReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => handleSuggestedClick(reply)}
            disabled={isGeneratingMessage}
            className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form id="chat-input-form" onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Answer the interviewer about what you liked or disliked..."
          disabled={isGeneratingMessage}
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <button
          id="send-chat-msg-btn"
          type="submit"
          disabled={!input.trim() || isGeneratingMessage}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
