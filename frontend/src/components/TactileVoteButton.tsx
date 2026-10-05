import React from 'react';

interface TactileVoteButtonProps {
  type: 'cat' | 'dog';
  isVoting: boolean;
  disabled?: boolean;
  onClick: () => void;
  votes: number;
  percentage: number;
}

export const TactileVoteButton: React.FC<TactileVoteButtonProps> = ({
  type,
  isVoting,
  disabled = false,
  onClick,
  votes,
  percentage,
}) => {
  const isCat = type === 'cat';
  const label = isCat ? 'VOTE FOR CAT' : 'VOTE FOR DOG';
  const characterEmoji = isCat ? '🐱' : '🐶';
  const isBlocked = isVoting || disabled;

  return (
    <div className="flex flex-col items-center">
      {/* Vote CTA Button */}
      <button
        onClick={onClick}
        disabled={isBlocked}
        aria-label={label}
        className={`group relative w-56 sm:w-64 py-3.5 px-6 rounded-xl font-medium tracking-wide text-sm transition-all duration-200 select-none
          border border-neutral-700/80 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-200
          shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]
          ${!isBlocked ? 'hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(0,0,0,0.6)]' : ''}
          ${isCat ? 'hover:border-amber-600/50' : 'hover:border-orange-600/50'}
          ${isBlocked ? 'opacity-60 cursor-not-allowed grayscale-[30%]' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center justify-center gap-2.5">
          <span className="text-base" role="img" aria-hidden="true">
            {characterEmoji}
          </span>
          <span className="tracking-wider uppercase font-semibold text-xs sm:text-sm">
            {isVoting ? 'RECORDING...' : disabled ? 'ROUND OVER' : label}
          </span>
        </span>
      </button>

      {/* Understated Count & Percentage readout */}
      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-400">
        <span className="text-neutral-100 font-bold text-sm">{percentage}%</span>
        <span className="text-neutral-600">•</span>
        <span>{votes.toLocaleString()} votes</span>
      </div>
    </div>
  );
};
