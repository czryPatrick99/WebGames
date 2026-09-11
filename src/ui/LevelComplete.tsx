import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Award, Trophy } from 'lucide-react';
import { getLevelById } from '../levels/LevelData';

interface LevelCompleteProps {
  levelId: number;
  time: number;
  bestTime: number;
  stars: number;
  flow: number;
  deaths: number;
  fragments: [boolean, boolean, boolean];
  score: number;
  isNewBest: boolean;
  onRetry: () => void;
  onNextLevel: () => void;
  onLevelSelect: () => void;
}

export const LevelComplete: React.FC<LevelCompleteProps> = ({
  levelId,
  time,
  bestTime,
  stars,
  flow,
  deaths,
  fragments,
  score,
  isNewBest,
  onRetry,
  onNextLevel,
  onLevelSelect,
}) => {
  const currentConfig = getLevelById(levelId);
  const fragmentsCount = fragments.filter(Boolean).length;

  useEffect(() => {
    if (stars >= 2 || isNewBest) {
      confetti({
        particleCount: stars === 3 ? 90 : 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ec4899', '#f59e0b', '#ffffff'],
      });
    }
  }, [stars, isNewBest]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getRatingLabel = (s: number) => {
    if (s === 3) return 'GOLD RUNNER';
    if (s === 2) return 'SILVER RUNNER';
    return 'BRONZE FINISHER';
  };

  return (
    <div
      id="level-complete-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-[#0d0d17] border border-cyan-500/40 rounded-xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Neon top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500" />

        {/* Subtitle */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-400">
            LEVEL {levelId.toString().padStart(2, '0')} // {currentConfig.title}
          </span>
        </div>

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-black font-chakra tracking-wider uppercase text-white mb-4">
          LEVEL COMPLETE
        </h2>

        {/* Star Rating Display */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-full transition-transform duration-300 ${
                starIdx <= stars ? 'scale-110 text-amber-400' : 'text-slate-700 opacity-40'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  starIdx <= stars ? 'fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : ''
                }`}
              />
            </div>
          ))}
        </div>
        <span className="text-xs font-mono font-bold tracking-widest text-amber-300 mb-6 uppercase">
          RATING: {getRatingLabel(stars)}
        </span>

        {/* Stats Matrix */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-4 mb-6 font-mono text-xs md:text-sm">
          {/* Row 1: Time & Best Time */}
          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400">TIME</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base">{formatTime(time)}</span>
              {isNewBest && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  NEW BEST!
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <span className="text-slate-400">BEST TIME</span>
            <span className="text-slate-200 font-semibold">{formatTime(bestTime)}</span>
          </div>

          {/* Row 2: Flow & Deaths */}
          <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-800/80 text-center">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[11px]">FLOW</span>
              <span className="text-cyan-400 font-bold text-base">{flow}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[11px]">DEATHS</span>
              <span className="text-rose-400 font-bold text-base">{deaths}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[11px]">COLLECTIBLES</span>
              <span className="text-amber-400 font-bold text-base">{fragmentsCount}/3</span>
            </div>
          </div>

          {/* Row 3: Total Score */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              SCORE
            </span>
            <span className="text-xl font-black font-chakra text-amber-400 tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            id="modal-retry-btn"
            onClick={onRetry}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            RETRY
          </button>

          {levelId < 30 ? (
            <button
              id="modal-next-btn"
              onClick={onNextLevel}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg neon-glow-cyan"
            >
              NEXT LEVEL
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="modal-summit-btn"
              onClick={onLevelSelect}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg"
            >
              <Award className="w-4 h-4" />
              THE SUMMIT
            </button>
          )}
        </div>

        {/* Level Select Link */}
        <button
          id="modal-level-select-link"
          onClick={onLevelSelect}
          className="mt-4 text-xs font-mono text-slate-400 hover:text-cyan-400 transition underline underline-offset-4 cursor-pointer"
        >
          Return to Level Select
        </button>
      </div>
    </div>
  );
};
