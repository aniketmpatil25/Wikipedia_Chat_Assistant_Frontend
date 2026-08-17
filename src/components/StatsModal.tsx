'use client';

import React, { useEffect, useState } from 'react';
import { CollectionStats } from '@/types';
import { fetchCollectionStats } from '@/lib/api';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchCollectionStats().then((data) => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Vector Database Stats</h3>
            <p className="text-xs text-slate-400 m-0 font-mono">ChromaDB Persistent Knowledge Base</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            Loading stats...
          </div>
        ) : stats ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-2xl font-bold text-cyan-400 font-mono">{stats.total_chunks}</span>
                <p className="text-[11px] text-slate-400 m-0 uppercase font-mono mt-1">Indexed Chunks</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-2xl font-bold text-purple-400 font-mono">{stats.total_articles}</span>
                <p className="text-[11px] text-slate-400 m-0 uppercase font-mono mt-1">Unique Articles</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Collection:</span>
                <span className="text-cyan-300">{stats.collection_name}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Embedding Model:</span>
                <span className="text-purple-300">all-MiniLM-L6-v2</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Similarity Metric:</span>
                <span className="text-slate-200">Cosine</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs">
            Could not connect to FastAPI backend on http://localhost:8000
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
