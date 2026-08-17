'use client';

import React from 'react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Quantum Computing',
    desc: 'Explain quantum superposition and entanglement principles',
    query: 'What is quantum computing and how do qubits work?',
    icon: '⚡',
  },
  {
    title: 'James Webb Telescope',
    desc: 'Key scientific discoveries and orbit location at L2',
    query: 'What are the major discoveries of the James Webb Space Telescope?',
    icon: '🔭',
  },
  {
    title: 'Artificial Intelligence',
    desc: 'History of neural networks and transformer architecture',
    query: 'Can you summarize the evolution of neural networks in AI?',
    icon: '🧠',
  },
  {
    title: 'Solar System',
    desc: 'Planetary structures, moons, and outer Kuiper belt',
    query: 'What are the main characteristics of planets in our solar system?',
    icon: '🪐',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto my-auto animate-fade-in">
      {/* Icon & Glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-40 animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-white/15 p-[1px] shadow-2xl flex items-center justify-center backdrop-blur-xl">
          <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight font-sans">
        Wikipedia Intelligent Assistant
      </h1>
      <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed font-sans">
        Ask natural language questions to search and synthesize knowledge from Wikipedia articles using RAG & Vector Embeddings.
      </p>

      {/* Starter Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {STARTER_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.query)}
            className="group flex flex-col items-start p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all duration-200 backdrop-blur-xl shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                {item.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0 line-clamp-2 leading-relaxed">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
