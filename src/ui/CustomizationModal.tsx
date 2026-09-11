import React, { useState } from 'react';
import { saveManager, SKINS, TRAILS } from '../save/SaveManager';
import { X, Check, Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface CustomizationModalProps {
  onClose: () => void;
  onApply: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  onClose,
  onApply,
}) => {
  const saveData = saveManager.getData();
  const [activeSkin, setActiveSkin] = useState(saveData.customization.skin);
  const [activeTrail, setActiveTrail] = useState(saveData.customization.trail);

  const handleEquipSkin = (id: string) => {
    if (!saveData.unlockedSkins.includes(id)) return;
    setActiveSkin(id);
    saveManager.setCustomization({ skin: id });
    onApply();
  };

  const handleEquipTrail = (id: string) => {
    if (!saveData.unlockedTrails.includes(id)) return;
    setActiveTrail(id);
    saveManager.setCustomization({ trail: id });
    onApply();
  };

  return (
    <div
      id="customization-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6"
    >
      <div className="w-full max-w-2xl bg-[#090a12] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400">
              CYBERNETIC LOCKER // COSMETICS
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-chakra tracking-wider uppercase text-white mt-0.5">
              RUNNER CUSTOMIZATION
            </h2>
          </div>
          <button
            id="close-custom-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 py-4 flex flex-col gap-6">
          {/* Skins Section */}
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              RUNNER SUIT & VISOR
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SKINS.map((skin) => {
                const unlocked = saveData.unlockedSkins.includes(skin.id);
                const equipped = activeSkin === skin.id;

                return (
                  <button
                    key={skin.id}
                    id={`skin-btn-${skin.id}`}
                    disabled={!unlocked}
                    onClick={() => handleEquipSkin(skin.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      equipped
                        ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                        : unlocked
                        ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: skin.color }}
                      />
                      {equipped ? (
                        <Check className="w-4 h-4 text-cyan-400" />
                      ) : !unlocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : null}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-chakra text-white uppercase truncate">
                        {skin.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {unlocked ? (equipped ? 'EQUIPPED' : 'UNLOCKED') : skin.req}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kinetic Trails Section */}
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              KINETIC NEON TRAIL
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRAILS.map((trail) => {
                const unlocked = saveData.unlockedTrails.includes(trail.id);
                const equipped = activeTrail === trail.id;

                return (
                  <button
                    key={trail.id}
                    id={`trail-btn-${trail.id}`}
                    disabled={!unlocked}
                    onClick={() => handleEquipTrail(trail.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      equipped
                        ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400 shadow-md'
                        : unlocked
                        ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/30 border-slate-900 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: trail.color }}
                      />
                      {equipped ? (
                        <Check className="w-4 h-4 text-amber-400" />
                      ) : !unlocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : null}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-chakra text-white uppercase truncate">
                        {trail.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {unlocked ? (equipped ? 'EQUIPPED' : 'UNLOCKED') : trail.req}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prestige Badges Section */}
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-slate-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              PRESTIGE BADGES
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold font-chakra text-white uppercase">
                    GOLDEN RUNNER
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Earn 3 Gold Stars across all 30 Levels
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold font-chakra text-white uppercase">
                    THE ASCENDED
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Reach the summit and conquer Level 30
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="apply-custom-btn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
