import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Flame, Timer, Award } from 'lucide-react';
import { VoteData } from '../types';

interface BattleTimerProps {
  timeLeft: number;
  isRoundActive: boolean;
  votes: VoteData;
  onRestartBattle: () => void;
  isResetting: boolean;
}

export const BattleTimer: React.FC<BattleTimerProps> = ({
  timeLeft,
  isRoundActive,
  votes,
  onRestartBattle,
  isResetting,
}) => {
  // Fire celebratory confetti when round finishes
  useEffect(() => {
    if (!isRoundActive && votes.total > 0) {
      const end = Date.now() + 1800;
      const colors = ['#f59e0b', '#38bdf8', '#10b981', '#ec4899', '#ffffff'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 65,
          origin: { x: 0.1, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 65,
          origin: { x: 0.9, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isRoundActive, votes.total]);

  // Determine Winner
  let winner: 'CAT' | 'DOG' | 'TIE' = 'TIE';
  if (votes.cat > votes.dog) winner = 'CAT';
  else if (votes.dog > votes.cat) winner = 'DOG';

  const isLowTime = isRoundActive && timeLeft <= 10;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Active Battle HUD Countdown Timer */}
      {isRoundActive ? (
        <div className="flex flex-col items-center mb-2">
          <div
            className={`flex items-center gap-2.5 px-5 py-2 rounded-full border transition-all duration-300 ${
              isLowTime
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-neutral-900/90 border-neutral-700/80 text-amber-300 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
            }`}
          >
            {isLowTime ? (
              <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
            ) : (
              <Timer className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-mono text-sm tracking-wider uppercase">
              {isLowTime ? 'FINAL SECONDS:' : 'BATTLE ROUND:'}
            </span>
            <span
              className={`font-mono text-lg font-black tracking-widest ${
                isLowTime ? 'text-rose-200' : 'text-amber-300'
              }`}
            >
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Micro Progress Bar for 30s Countdown */}
          <div className="w-48 h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isLowTime ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        /* Winner Declaration Announcement Banner */
        <div className="w-full my-3 p-5 sm:p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(245,158,11,0.2)] text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase mb-3">
            <Trophy className="w-3.5 h-3.5" />
            BATTLE ROUND COMPLETED
          </div>

          {/* Winner Title */}
          {winner === 'CAT' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-2 tracking-tight">
                <span>🐱</span>
                <span>CAT WINS THE BATTLE!</span>
                <span>🏆</span>
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Cat secured victory with <span className="text-neutral-100 font-bold">{votes.cat} votes</span> ({votes.catPercentage}%) vs Dog's {votes.dog} votes!
              </p>
            </div>
          )}

          {winner === 'DOG' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-orange-400 flex items-center justify-center gap-2 tracking-tight">
                <span>🐶</span>
                <span>DOG WINS THE BATTLE!</span>
                <span>🏆</span>
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Dog secured victory with <span className="text-neutral-100 font-bold">{votes.dog} votes</span> ({votes.dogPercentage}%) vs Cat's {votes.cat} votes!
              </p>
            </div>
          )}

          {winner === 'TIE' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-200 flex items-center justify-center gap-2 tracking-tight">
                <span>🤝</span>
                <span>IT'S A DEAD TIE!</span>
                <span>🤝</span>
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Both contenders finished with equal strength ({votes.cat} votes each, 50% / 50%)!
              </p>
            </div>
          )}

          {/* Action to Start New 30s Battle */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onRestartBattle}
              disabled={isResetting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-neutral-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'RESETTING...' : 'START NEW 30S BATTLE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
