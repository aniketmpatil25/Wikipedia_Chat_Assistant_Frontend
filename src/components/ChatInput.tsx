'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto relative group">
      <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-900/80 border border-white/10 focus-within:border-cyan-500/50 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about Wikipedia articles... (Press Enter to send)"
          rows={1}
          disabled={isLoading}
          className="w-full px-3 py-2.5 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-40 font-sans"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
            input.trim() && !isLoading
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95'
              : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
          }`}
          title="Send message"
        >
          {isLoading ? (
            <svg className="w-5 h-5 text-cyan-300 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 mt-1.5 font-mono">
        <span>Shift + Enter for new line</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          RAG Pipeline Active
        </span>
      </div>
    </form>
  );
};
