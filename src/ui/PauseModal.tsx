import React, { useState } from 'react';
import { Play, RotateCcw, Grid, Volume2, Sparkles, X } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../save/SaveManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onOpenCustomization: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenLevelSelect,
  onOpenCustomization,
}) => {
  const saveData = saveManager.getData();
  const [sfxVol, setSfxVol] = useState(saveData.settings.soundVolume);
  const [musicVol, setMusicVol] = useState(saveData.settings.musicVolume);

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    audioManager.setVolumes(val, musicVol);
    saveManager.setSettings({ soundVolume: val });
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    audioManager.setVolumes(sfxVol, val);
    saveManager.setSettings({ musicVolume: val });
  };

  return (
    <div
      id="pause-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-[#090a14] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-black font-chakra tracking-wider uppercase text-white">
            GAME PAUSED
          </h2>
          <button
            id="pause-close-btn"
            onClick={onResume}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 my-6">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md neon-glow-cyan"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME RUN
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => {
              onRestart();
              onResume();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            RESTART AT CHECKPOINT (R)
          </button>

          <button
            id="pause-level-select-btn"
            onClick={onOpenLevelSelect}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-amber-400" />
            30 LEVELS MAP
          </button>

          <button
            id="pause-custom-btn"
            onClick={onOpenCustomization}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            RUNNER LOCKER & SKINS
          </button>
        </div>

        {/* Audio Volume Sliders */}
        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              SFX VOLUME
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className="w-32 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-pink-400" />
              SYNTHWAVE MUSIC
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVol}
              onChange={handleMusicChange}
              className="w-32 accent-pink-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Keybinds Reference */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-850 rounded-xl text-[11px] font-mono text-slate-400">
          <div className="text-slate-300 font-bold mb-1 uppercase">Movement Controls:</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span>A / D : Run</span>
            <span>Shift : Sprint</span>
            <span>Space : Jump</span>
            <span>C / Down : Slide / Roll</span>
            <span>E / J : Air Dash (Lv 19+)</span>
            <span>Q / K : Grapple (Lv 20+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
