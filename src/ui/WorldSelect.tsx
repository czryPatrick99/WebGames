import React, { useState } from 'react';
import { WORLDS, ALL_LEVELS } from '../levels/LevelData';
import { saveManager } from '../save/SaveManager';
import { Star, Lock, Play, X, KeyRound, Sparkles } from 'lucide-react';

interface WorldSelectProps {
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const WorldSelect: React.FC<WorldSelectProps> = ({
  currentLevelId,
  onSelectLevel,
  onClose,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<number>(
    Math.ceil(currentLevelId / 6) || 1
  );
  const [, setRerender] = useState(0);

  const saveData = saveManager.getData();
  const totalStars = saveManager.getTotalStars();
  const totalFragments = saveManager.getTotalFragments();

  const handleUnlockAll = () => {
    saveManager.unlockAllDev();
    setRerender((v) => v + 1);
  };

  const worldConfig = WORLDS.find((w) => w.id === selectedWorld) || WORLDS[0];
  const levelsInWorld = ALL_LEVELS.filter((l) => l.world === selectedWorld);

  const formatTime = (secs?: number) => {
    if (!secs) return '--:--.--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="world-select-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6"
    >
      <div className="w-full max-w-4xl bg-[#090a12] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-mono text-cyan-400">
                DISTRICT MAP // 30 LEVELS
              </span>
              <span className="text-xs font-mono text-slate-500">•</span>
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {totalStars} / 90 STARS
              </span>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1 ml-2">
                <Sparkles className="w-3.5 h-3.5" />
                {totalFragments} / 90 CORES
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-chakra tracking-wider uppercase text-white mt-1">
              SELECT PARKOUR CHALLENGE
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dev-unlock-all-btn"
              onClick={handleUnlockAll}
              title="Unlock all 30 levels for testing"
              className="text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">UNLOCK ALL</span>
            </button>
            <button
              id="close-world-select-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* World Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
          {WORLDS.map((w) => {
            const isSelected = w.id === selectedWorld;
            return (
              <button
                key={w.id}
                id={`world-tab-${w.id}`}
                onClick={() => setSelectedWorld(w.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/70 shadow-md'
                    : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  WORLD 0{w.id}
                </span>
                <span
                  className="text-xs font-bold font-chakra uppercase truncate"
                  style={{ color: isSelected ? w.color : '#e2e8f0' }}
                >
                  {w.name.replace('THE ', '')}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{w.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Selected World Description */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg mb-4 text-xs font-medium text-slate-300">
          <span className="font-bold text-white uppercase tracking-wider mr-2 font-chakra">
            {worldConfig.name}:
          </span>
          {worldConfig.desc}
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1">
          {levelsInWorld.map((lvl) => {
            const unlocked = saveManager.isLevelUnlocked(lvl.id);
            const record = saveData.records[lvl.id];
            const stars = record?.stars || 0;
            const fragments = record?.fragmentsCollected || [false, false, false];
            const isCurrent = lvl.id === currentLevelId;

            return (
              <div
                key={lvl.id}
                id={`level-card-${lvl.id}`}
                className={`p-4 rounded-xl border flex flex-col justify-between transition relative ${
                  !unlocked
                    ? 'bg-slate-950/30 border-slate-900 opacity-50'
                    : isCurrent
                    ? 'bg-slate-900/90 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                    : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-cyan-400">
                      LVL {lvl.id.toString().padStart(2, '0')}
                    </span>
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-chakra text-white uppercase truncate">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono line-clamp-1 mb-2">
                    {lvl.lesson}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex flex-col text-[10px] font-mono text-slate-400">
                    <span>BEST: {formatTime(record?.bestTime)}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span>CORES:</span>
                      {fragments.map((collected, ci) => (
                        <span
                          key={ci}
                          className={`w-2 h-2 rounded-full ${
                            collected ? 'bg-cyan-400' : 'bg-slate-850'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {unlocked ? (
                    <button
                      id={`play-level-btn-${lvl.id}`}
                      onClick={() => onSelectLevel(lvl.id)}
                      className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-chakra text-xs uppercase tracking-wider transition active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      PLAY
                    </button>
                  ) : (
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-600 flex items-center gap-1 text-[10px] font-mono">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
