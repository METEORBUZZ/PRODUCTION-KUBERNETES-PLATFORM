import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CatModel } from './CatModel';
import { DogModel } from './DogModel';
import confetti from 'canvas-confetti';

interface VotingCardProps {
  type: 'cat' | 'dog';
  votes: number;
  percentage: number;
  isLeading: boolean;
  isVoting: boolean;
  onVote: () => Promise<void>;
  reducedMotion?: boolean;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  type,
  votes,
  percentage,
  isLeading,
  isVoting,
  onVote,
  reducedMotion = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isCat = type === 'cat';
  const label = isCat ? 'CAT' : 'DOG';
  const emoji = isCat ? '🐱' : '🐶';
  const colorTheme = isCat ? 'cyan' : 'orange';

  // 3D Card tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleVoteClick = async () => {
    if (isVoting) return;

    // Trigger celebratory visual effects
    setIsVoted(true);

    if (!reducedMotion) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: isCat ? { x: 0.35, y: 0.6 } : { x: 0.65, y: 0.6 },
        colors: isCat ? ['#06b6d4', '#38bdf8', '#a5f3fc'] : ['#f97316', '#fb923c', '#fed7aa'],
      });
    }

    try {
      await onVote();
    } finally {
      setTimeout(() => {
        setIsVoted(false);
      }, 1200);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: reducedMotion
          ? 'none'
          : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className={`relative flex flex-col items-center w-full max-w-md p-6 rounded-3xl transition-all duration-300 backdrop-blur-xl border ${
        isCat
          ? 'bg-slate-900/60 border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]'
          : 'bg-slate-900/60 border-orange-500/30 hover:border-orange-400 hover:shadow-[0_0_40px_rgba(249,115,22,0.35)]'
      } ${isLeading ? 'ring-2 ring-offset-2 ring-offset-slate-950 ' + (isCat ? 'ring-cyan-400' : 'ring-orange-400') : ''}`}
    >
      {/* Glow highlight pill */}
      {isLeading && (
        <div
          className={`absolute -top-3 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-white shadow-lg ${
            isCat ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'
          }`}
        >
          ★ Current Leader
        </div>
      )}

      {/* 3D Model Viewport */}
      <div className="relative w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0.5, 3.2], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight
            position={isCat ? [-2, 2, 2] : [2, 2, 2]}
            color={isCat ? '#06b6d4' : '#f97316'}
            intensity={2}
          />
          {isCat ? (
            <CatModel isHovered={isHovered} isVoted={isVoted} reducedMotion={reducedMotion} />
          ) : (
            <DogModel isHovered={isHovered} isVoted={isVoted} reducedMotion={reducedMotion} />
          )}
        </Canvas>

        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase opacity-75">
            3D {label} • Interactive
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="w-full mt-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {label}
          </h2>
          <span className="text-3xl" role="img" aria-label={label}>
            {emoji}
          </span>
        </div>

        {/* Live Vote Share Percentage */}
        <div className="my-3">
          <div
            className={`text-5xl font-black tracking-tight font-mono ${
              isCat ? 'text-cyan-400' : 'text-orange-400'
            }`}
          >
            {percentage}%
          </div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">
            of total votes
          </div>
        </div>

        {/* Total Votes Count */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 mb-6 text-sm text-slate-300 font-mono">
          <span>Votes:</span>
          <span className="font-bold text-white">{votes.toLocaleString()}</span>
        </div>

        {/* Vote Button */}
        <button
          onClick={handleVoteClick}
          disabled={isVoting}
          aria-label={`Vote for ${label}`}
          className={`w-full py-4 px-6 rounded-2xl font-bold tracking-wider uppercase transition-all duration-200 transform active:scale-95 text-white shadow-lg ${
            isCat
              ? 'bg-gradient-to-r from-cyan-500 hover:from-cyan-400 to-blue-600 hover:to-blue-500 shadow-cyan-500/25 hover:shadow-cyan-500/40'
              : 'bg-gradient-to-r from-orange-500 hover:from-orange-400 to-rose-600 hover:to-rose-500 shadow-orange-500/25 hover:shadow-orange-500/40'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
        >
          {isVoting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              RECORDING...
            </span>
          ) : (
            `[ VOTE FOR ${label} ]`
          )}
        </button>
      </div>
    </div>
  );
};
