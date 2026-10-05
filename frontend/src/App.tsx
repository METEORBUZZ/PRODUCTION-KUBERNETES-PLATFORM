import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Arena3D } from './components/Arena3D';
import { TactileVoteButton } from './components/TactileVoteButton';
import { ArenaBalanceMeter } from './components/ArenaBalanceMeter';
import { PlatformModal } from './components/PlatformModal';
import { BattleTimer } from './components/BattleTimer';
import { fetchVotes, voteForCat, voteForDog, resetVotes, fetchHealth, fetchVersion } from './api';
import { VoteData, SystemHealth, VersionInfo } from './types';

const ROUND_DURATION_SECONDS = 30;

export const App: React.FC = () => {
  const [votes, setVotes] = useState<VoteData>({
    cat: 0,
    dog: 0,
    total: 0,
    catPercentage: 50,
    dogPercentage: 50,
  });
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [isVotingCat, setIsVotingCat] = useState(false);
  const [isVotingDog, setIsVotingDog] = useState(false);
  const [catVotedAnim, setCatVotedAnim] = useState(false);
  const [dogVotedAnim, setDogVotedAnim] = useState(false);
  const [latencyMs, setLatencyMs] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 30-Second Battle Countdown State
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Device-aware settings
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 30s Countdown Interval Timer
  useEffect(() => {
    if (!isRoundActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRoundActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive]);

  const loadData = useCallback(async () => {
    const startTime = performance.now();
    try {
      const data = await fetchVotes();
      setVotes(data);
      setLatencyMs(Math.round(performance.now() - startTime) || 8);
    } catch {
      // Background retry
    }
  }, []);

  const loadMeta = useCallback(async () => {
    try {
      const [h, v] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchVersion().catch(() => null),
      ]);
      if (h) setHealth(h);
      if (v) setVersion(v);
    } catch {
      // Telemetry catch
    }
  }, []);

  useEffect(() => {
    loadData();
    loadMeta();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, [loadData, loadMeta]);

  const handleVoteCat = async () => {
    if (!isRoundActive || isVotingCat) return;
    setIsVotingCat(true);
    setCatVotedAnim(true);
    try {
      const updated = await voteForCat();
      setVotes(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVotingCat(false);
      setTimeout(() => setCatVotedAnim(false), 900);
    }
  };

  const handleVoteDog = async () => {
    if (!isRoundActive || isVotingDog) return;
    setIsVotingDog(true);
    setDogVotedAnim(true);
    try {
      const updated = await voteForDog();
      setVotes(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVotingDog(false);
      setTimeout(() => setDogVotedAnim(false), 900);
    }
  };

  const handleRestartBattle = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const zeroVotes = await resetVotes();
      setVotes(zeroVotes);
      setTimeLeft(ROUND_DURATION_SECONDS);
      setIsRoundActive(true);
    } catch (err) {
      console.error('Failed to reset battle round:', err);
      // Fallback local reset
      setVotes({ cat: 0, dog: 0, total: 0, catPercentage: 50, dogPercentage: 50 });
      setTimeLeft(ROUND_DURATION_SECONDS);
      setIsRoundActive(true);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0e0d0c] text-[#f2efe9] flex flex-col justify-between selection:bg-amber-600/30 font-sans">
      {/* Subtle Studio Vignette & Lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(45,40,35,0.45)_0%,rgba(14,13,12,0.95)_75%)]" />

      {/* Header */}
      <header className="relative z-10 w-full pt-6 pb-2 px-4 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400">
              PRODUCTION KUBERNETES PLATFORM
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-100 flex items-center justify-center gap-3">
            <span>CAT</span>
            <span className="text-2xl sm:text-3xl">🐱</span>
            <span className="text-neutral-500 text-2xl font-light">VS</span>
            <span>DOG</span>
            <span className="text-2xl sm:text-3xl">🐶</span>
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-neutral-400 font-light max-w-sm">
            {isRoundActive
              ? 'Vote in the live 30-second round! Winner declared when timer expires.'
              : 'Round complete! Winner announced below.'}
          </p>

          {/* 30-Second Countdown & Winner HUD */}
          <div className="mt-3 w-full">
            <BattleTimer
              timeLeft={timeLeft}
              isRoundActive={isRoundActive}
              votes={votes}
              onRestartBattle={handleRestartBattle}
              isResetting={isResetting}
            />
          </div>
        </div>
      </header>

      {/* Main 3D Hero Arena */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full px-4">
        {/* 3D Standalone Character Showcase Stage */}
        <Arena3D
          catVoted={catVotedAnim}
          dogVoted={dogVotedAnim}
          onCatClick={isRoundActive ? handleVoteCat : undefined}
          onDogClick={isRoundActive ? handleVoteDog : undefined}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
        />

        {/* Tactile Action Buttons positioned directly beneath characters */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 my-4">
          <TactileVoteButton
            type="cat"
            isVoting={isVotingCat}
            disabled={!isRoundActive}
            onClick={handleVoteCat}
            votes={votes.cat}
            percentage={votes.catPercentage}
          />

          <TactileVoteButton
            type="dog"
            isVoting={isVotingDog}
            disabled={!isRoundActive}
            onClick={handleVoteDog}
            votes={votes.dog}
            percentage={votes.dogPercentage}
          />
        </div>

        {/* Dynamic Dot-Matrix Arena Balance Meter */}
        <ArenaBalanceMeter data={votes} />
      </main>

      {/* Subtle, Discrete Footer */}
      <footer className="relative z-10 w-full py-4 px-6 border-t border-neutral-800/40 text-[11px] font-mono text-neutral-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-neutral-400 hover:text-neutral-200 underline decoration-neutral-700 underline-offset-4 transition"
          >
            Kubernetes Platform Architecture & Telemetry ↗
          </button>
          <span>•</span>
          <span>EKS 3/3 Replicas</span>
          <span>•</span>
          <button
            onClick={handleRestartBattle}
            className="text-amber-400 hover:text-amber-300 font-semibold transition"
          >
            Reset Round (0-0)
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className="hover:text-neutral-300 transition"
          >
            Motion: <span className="font-semibold text-neutral-300">{reducedMotion ? 'Reduced' : 'Standard'}</span>
          </button>
          <span>•</span>
          <span>Latency: {latencyMs}ms</span>
        </div>
      </footer>

      {/* Platform Telemetry Modal */}
      <PlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        health={health}
        version={version}
        latencyMs={latencyMs}
      />
    </div>
  );
};

export default App;
