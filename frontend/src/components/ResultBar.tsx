import React from 'react';
import { VoteData } from '../types';

interface ResultBarProps {
  data: VoteData;
}

export const ResultBar: React.FC<ResultBarProps> = ({ data }) => {
  const { cat, dog, total, catPercentage, dogPercentage } = data;

  const isTie = cat === dog;
  const isCatLeader = cat > dog;

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl">
      {/* Current Leader Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
          CURRENT RESULTS
        </span>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold flex items-center justify-center gap-3">
          {isTie ? (
            <span className="text-slate-200 flex items-center gap-2">
              <span className="text-3xl">🤝</span> IT'S A TIE
            </span>
          ) : isCatLeader ? (
            <span className="text-cyan-400 flex items-center gap-2">
              <span className="text-3xl">🐱</span> CAT IS LEADING ({catPercentage}%)
            </span>
          ) : (
            <span className="text-orange-400 flex items-center gap-2">
              <span className="text-3xl">🐶</span> DOG IS LEADING ({dogPercentage}%)
            </span>
          )}
        </div>
      </div>

      {/* Duel Animated Percentage Bar */}
      <div className="relative mb-6">
        <div className="flex justify-between text-sm font-bold font-mono mb-2">
          <span className="text-cyan-400 flex items-center gap-1.5">
            🐱 CAT {catPercentage}% ({cat.toLocaleString()})
          </span>
          <span className="text-orange-400 flex items-center gap-1.5">
            ({dog.toLocaleString()}) {dogPercentage}% DOG 🐶
          </span>
        </div>

        {/* Bar Track */}
        <div className="h-6 w-full rounded-full bg-slate-950 p-1 flex overflow-hidden border border-slate-800 shadow-inner">
          <div
            style={{ width: `${catPercentage}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          />
          <div
            style={{ width: `${dogPercentage}%` }}
            className="h-full bg-gradient-to-l from-orange-500 to-amber-500 rounded-r-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)]"
          />
        </div>
      </div>

      {/* Total Votes Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE CLUSTER SYNC</span>
        </div>
        <div className="text-sm">
          Total Votes: <span className="font-bold text-white text-base">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
