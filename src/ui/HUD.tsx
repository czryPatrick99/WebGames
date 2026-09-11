import React from 'react';
import { GameHUDData } from '../core/Game';
import { RotateCcw, Pause, Sparkles } from 'lucide-react';

interface HUDProps {
  data: GameHUDData | null;
  onRestart: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ data, onRestart, onPause }) => {
  if (!data) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const flowPercent = Math.round(data.flow);
  const isHighFlow = flowPercent >= 75;

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Level & Lesson Info */}
        <div className="flex flex-col gap-1 max-w-sm md:max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              LVL {data.currentLevel.toString().padStart(2, '0')} / 30
            </span>
            <h1 className="text-lg md:text-xl font-bold font-chakra text-white tracking-wide uppercase drop-shadow-md">
              {data.levelTitle}
            </h1>
          </div>
          <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 px-2.5 py-1 rounded backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{data.instruction}</span>
          </div>
        </div>

        {/* Timer, Ghost Delta & Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            {/* Quick Restart & Pause Buttons */}
            <button
              id="hud-restart-btn"
              onClick={onRestart}
              title="Restart at checkpoint (Key: R)"
              className="pointer-events-auto p-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-mono backdrop-blur-sm shadow-sm active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">R</span>
            </button>
            <button
              id="hud-pause-btn"
              onClick={onPause}
              title="Pause (Key: Esc)"
              className="pointer-events-auto p-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-mono backdrop-blur-sm shadow-sm active:scale-95"
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">ESC</span>
            </button>

            {/* Live Clock Display */}
            <div className="bg-slate-950/85 border border-cyan-500/40 px-3.5 py-1.5 rounded flex flex-col items-end backdrop-blur-sm shadow-lg">
              <span className="text-xs font-mono text-cyan-400/80 tracking-wider">TIME</span>
              <span className="text-xl md:text-2xl font-bold font-mono tracking-wider text-white">
                {formatTime(data.time)}
              </span>
            </div>
          </div>

          {/* Target Times & Ghost comparison */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            {data.ghostDelta !== null && (
              <span
                className={`px-2 py-0.5 rounded border font-semibold ${
                  data.ghostDelta < 0
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
                    : 'bg-rose-950/70 border-rose-500 text-rose-400'
                }`}
              >
                GHOST {data.ghostDelta < 0 ? '-' : '+'}
                {Math.abs(data.ghostDelta).toFixed(2)}s
              </span>
            )}
            <span className="bg-amber-950/50 border border-amber-600/40 text-amber-300 px-2 py-0.5 rounded">
              GOLD ≤ {data.goldTime}s
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Flow Meter, Speedometer & Collectibles */}
      <div className="flex items-end justify-between w-full">
        {/* Flow Meter & Multiplier */}
        <div className="flex flex-col gap-1.5 w-64 md:w-80">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1 font-bold tracking-wider text-white">
              <span className={isHighFlow ? 'text-amber-400 text-glow-gold' : 'text-cyan-400'}>FLOW STATE</span>
              {isHighFlow && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/40">OVERDRIVE</span>}
            </span>
            <span className="text-slate-300 font-mono">{flowPercent}%</span>
          </div>
          {/* Flow Bar Container */}
          <div className="h-2.5 w-full bg-slate-950/90 rounded-full border border-slate-800 p-0.5 overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isHighFlow
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-400 neon-glow-magenta'
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
              }`}
              style={{ width: `${flowPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Chain jumps, slides & wall-runs to maintain speed
          </span>
        </div>

        {/* Center: Data Fragments (Energy Cores) */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3.5 py-2 rounded-lg backdrop-blur-sm">
          <span className="text-xs font-mono text-slate-400 mr-1">CORES:</span>
          {data.fragments.map((collected, idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rotate-45 rounded-xs transition-all duration-300 flex items-center justify-center border ${
                collected
                  ? 'bg-cyan-400 border-cyan-200 neon-glow-cyan scale-110'
                  : 'bg-slate-900 border-slate-700 opacity-40'
              }`}
            />
          ))}
        </div>

        {/* Speedometer */}
        <div className="bg-slate-950/85 border border-slate-800 px-4 py-2 rounded-lg flex flex-col items-end backdrop-blur-sm">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">SPEED</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-bold font-mono text-white">
              {Math.round(data.speed)}
            </span>
            <span className="text-xs font-mono text-cyan-400">KM/H</span>
          </div>
        </div>
      </div>
    </div>
  );
};
