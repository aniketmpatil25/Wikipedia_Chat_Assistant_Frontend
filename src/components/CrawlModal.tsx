'use client';

import React, { useState } from 'react';
import { crawlTopics } from '@/lib/api';
import { CrawlResponse } from '@/types';

interface CrawlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrawlModal: React.FC<CrawlModalProps> = ({ isOpen, onClose }) => {
  const [topicInput, setTopicInput] = useState('');
  const [maxArticles, setMaxArticles] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrawlResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isLoading) return;

    const topics = topicInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (topics.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await crawlTopics(topics, maxArticles);
      setResult(res);
      setTopicInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to crawl topic');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Index Wikipedia Topics</h3>
            <p className="text-xs text-slate-400 m-0 font-mono">Crawl & store articles in ChromaDB</p>
          </div>
        </div>

        <form onSubmit={handleCrawl} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Topics or Keywords (comma separated)
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Machine Learning, Space Exploration, Black Holes"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Max Articles Per Topic: <span className="text-cyan-400">{maxArticles}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={maxArticles}
              onChange={(e) => setMaxArticles(Number(e.target.value))}
              disabled={isLoading}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={!topicInput.trim() || isLoading}
            className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              topicInput.trim() && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Crawling & Indexing Wikipedia...</span>
              </>
            ) : (
              <span>Start Ingestion</span>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-slate-200 space-y-1 font-mono">
            <div className="text-cyan-400 font-bold">✓ Indexing Complete!</div>
            <div>Articles Crawled: <strong className="text-white">{result.articles_crawled}</strong></div>
            <div>Chunks Stored: <strong className="text-white">{result.chunks_stored}</strong></div>
            <div>Topics Processed: <span className="text-purple-300">{result.topics_processed.join(', ')}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};
