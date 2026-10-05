import React from 'react';
import { VoteData } from '../types';

interface ArenaBalanceMeterProps {
  data: VoteData;
}

export const ArenaBalanceMeter: React.FC<ArenaBalanceMeterProps> = ({ data }) => {
  const { cat, dog, total, catPercentage, dogPercentage } = data;
  const isTie = cat === dog;
  const isCatLeader = cat > dog;

  // 20-segment precision dot-matrix balance indicator
  const totalDots = 20;
  const catDots = Math.round((catPercentage / 100) * totalDots);
  const dogDots = totalDots - catDots;

  return (
    <div className="w-full max-w-xl mx-auto my-6 px-6 py-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl backdrop-blur-sm">
      {/* Current Leader Status */}
      <div className="text-center mb-4">
        <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
          CURRENT LEADER
        </span>
        <div className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-neutral-100 flex items-center justify-center gap-2">
          {isTie ? (
            <span className="text-neutral-300">
              IT'S A TIE <span className="font-mono text-sm text-neutral-400 font-normal">(50% — 50%)</span>
            </span>
          ) : isCatLeader ? (
            <span className="text-amber-200/90 flex items-center gap-2">
              <span>🐱</span> CAT <span className="font-mono text-sm text-neutral-300 font-normal">({catPercentage}%)</span>
            </span>
          ) : (
            <span className="text-orange-200/90 flex items-center gap-2">
              <span>🐶</span> DOG <span className="font-mono text-sm text-neutral-300 font-normal">({dogPercentage}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Duel Dot-Matrix Arena Balance */}
      <div className="py-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2.5">
          <span className="font-semibold text-neutral-300">CAT {catPercentage}%</span>
          <span className="text-[10px] tracking-widest text-neutral-400 uppercase">ARENA BALANCE</span>
          <span className="font-semibold text-neutral-300">{dogPercentage}% DOG</span>
        </div>

        {/* 20 Tactile Balance Pips */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}
          className="gap-1.5 p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80"
        >
          {Array.from({ length: totalDots }).map((_, i) => {
            const isCatSegment = i < catDots;
            return (
              <div
                key={i}
                className={`h-3 rounded-sm transition-all duration-500 ${
                  isCatSegment
                    ? 'bg-amber-600/80 shadow-[0_0_6px_rgba(217,119,6,0.3)]'
                    : 'bg-orange-700/80 shadow-[0_0_6px_rgba(194,65,12,0.3)]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Footer Info: Total Votes & Pulse */}
      <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-neutral-400">Live Consensus</span>
        </div>
        <div>
          Total Votes: <strong className="text-neutral-200 font-medium">{total.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};
