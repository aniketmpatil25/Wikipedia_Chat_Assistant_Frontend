'use client';

import React, { useState } from 'react';
import { Message } from '@/types';
import { SourceCard } from './SourceCard';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format simple markdown (bold, links, lists) safely
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split by paragraphs
    const paragraphs = content.split('\n\n');

    return paragraphs.map((paragraph, pIdx) => {
      // Check for bullet list
      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        const items = paragraph.split('\n').filter((l) => l.trim());
        return (
          <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-2 pl-2">
            {items.map((item, iIdx) => {
              const cleanItem = item.replace(/^[-*]\s+/, '');
              return <li key={iIdx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(cleanItem) }} />;
            })}
          </ul>
        );
      }

      return (
        <p
          key={pIdx}
          className="mb-3 last:mb-0 leading-relaxed font-sans"
          dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }}
        />
      );
    });
  };

  const formatInline = (text: string) => {
    return text
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-cyan-200">$1</strong>')
      // Code `text`
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-xs border border-cyan-500/20">$1</code>')
      // Links [label](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">$1</a>');
  };

  return (
    <div className={`flex w-full gap-3 sm:gap-4 my-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for Assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] shrink-0 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      )}

      {/* Message Box */}
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 border transition-all ${
        isUser
          ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border-purple-500/30 text-slate-100 rounded-tr-none shadow-lg shadow-purple-500/10 backdrop-blur-md'
          : 'bg-slate-900/60 border-white/10 text-slate-200 rounded-tl-none shadow-xl backdrop-blur-xl'
      }`}>
        {/* Message Header */}
        <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/5 text-[11px] text-slate-400 font-mono">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            {isUser ? 'You' : 'WikiBot RAG'}
          </span>
          <div className="flex items-center gap-2">
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {!isUser && message.content && (
              <button
                onClick={handleCopy}
                className="hover:text-cyan-400 transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
                title="Copy message"
              >
                {copied ? (
                  <span className="text-cyan-400 text-[10px]">Copied!</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Message Body */}
        <div className="text-sm leading-relaxed">
          {message.content ? (
            renderFormattedContent(message.content)
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2 py-2 text-cyan-400 text-xs">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Searching Wikipedia & generating response...</span>
            </div>
          ) : (
            <span className="text-slate-500 italic text-xs">No content response</span>
          )}

          {/* Typing pulse indicator if streaming */}
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse rounded-sm align-middle" />
          )}
        </div>

        {/* Sources Grid */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Wikipedia Sources ({message.sources.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.sources.map((src, idx) => (
                <SourceCard key={idx} source={src} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px] shrink-0 shadow-lg shadow-purple-500/20">
          <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
