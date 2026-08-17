'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { StatsModal } from '@/components/StatsModal';
import { CrawlModal } from '@/components/CrawlModal';

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
];

export default function Home() {
  const {
    conversations,
    currentConversation,
    activeConversationId,
    isLoading,
    error,
    createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isCrawlOpen, setIsCrawlOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isMounted, setIsMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isMounted) {
      scrollToBottom();
    }
  }, [currentConversation?.messages, isMounted]);

  const messages = currentConversation?.messages || [];

  if (!isMounted) {
    return <div className="h-screen w-screen bg-[#060814]" />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060814] text-slate-100" suppressHydrationWarning>
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={createNewConversation}
        onDeleteConversation={deleteConversation}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenCrawlModal={() => setIsCrawlOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative" suppressHydrationWarning>
        {/* Header Bar */}
        <header className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-slate-950/60 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200 truncate">
                {currentConversation ? currentConversation.title : 'Wikipedia Intelligent Chat'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                RAG Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white/5 hover:bg-white/10 text-slate-200 text-xs rounded-lg px-2.5 py-1 border border-white/10 focus:outline-none focus:border-cyan-500/50 cursor-pointer font-sans"
              title="Select Wikipedia Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0b0f19] text-slate-200">
                  {lang.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsCrawlOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Index</span> Topic
            </button>

            <button
              onClick={() => setIsStatsOpen(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-purple-300 border border-white/10 transition-colors cursor-pointer"
              title="Vector Store Stats"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectPrompt={(prompt) => sendMessage(prompt, selectedLanguage)} />
          ) : (
            <div className="w-full max-w-4xl mx-auto space-y-4 my-auto">
              {messages.map((msg, index) => (
                <ChatMessage key={`${msg.id}_${index}`} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="px-4 py-2 bg-red-500/20 border-t border-red-500/30 text-red-300 text-xs text-center font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Footer Chat Input */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-[#060814] via-[#060814]/90 to-transparent shrink-0">
          <ChatInput onSendMessage={(query) => sendMessage(query, selectedLanguage)} isLoading={isLoading} />
        </div>
      </div>

      {/* Modals */}
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <CrawlModal isOpen={isCrawlOpen} onClose={() => setIsCrawlOpen(false)} />
    </div>
  );
}
