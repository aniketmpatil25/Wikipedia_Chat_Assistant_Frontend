'use client';

import React from 'react';
import { Source } from '@/types';

interface SourceCardProps {
  source: Source;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const scorePercent = Math.round((source.relevance_score || 0) * 100);
  
  // Format direct section anchor URL (e.g. https://en.wikipedia.org/wiki/Quantum_computing#Applications)
  const getSectionUrl = () => {
    if (!source.url) return '#';
    if (source.url.includes('#')) return source.url;
    if (!source.section || source.section === 'Full Article' || source.section === 'Introduction') {
      return source.url;
    }
    const anchor = source.section.replace(/\s+/g, '_');
    return `${source.url}#${anchor}`;
  };

  const finalUrl = getSectionUrl();

  return (
    <a
      href={finalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all duration-200 backdrop-blur-md cursor-pointer no-underline text-inherit shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656-5.656l-1.1 1.1" />
          </svg>
          <span className="font-semibold text-xs text-white/90 group-hover:text-cyan-300 truncate">
            {source.title}
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 shrink-0">
          {scorePercent}% match
        </span>
      </div>

      {source.section && source.section !== 'Full Article' && (
        <div className="text-[11px] text-purple-300/80 font-medium truncate flex items-center gap-1">
          <span>§</span> {source.section}
        </div>
      )}

      {source.snippet && (
        <p className="text-[11px] text-slate-400 line-clamp-2 m-0 leading-relaxed font-sans">
          {source.snippet}
        </p>
      )}

      <div className="flex items-center justify-end text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-medium mt-1">
        <span>Read Section on Wikipedia</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
};
