import React from 'react';
import { InputManager } from '../core/InputManager';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Zap, Anchor } from 'lucide-react';

interface MobileControlsProps {
  inputManager: InputManager;
  currentLevelId: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputManager,
  currentLevelId,
}) => {
  const showDash = currentLevelId >= 19;
  const showGrapple = currentLevelId >= 20;

  return (
    <div
      id="mobile-controls"
      className="absolute inset-x-0 bottom-0 pointer-events-none p-4 flex items-end justify-between select-none sm:hidden z-40 pb-6"
    >
      {/* Left: Directional buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          id="touch-left-btn"
          onTouchStart={() => {
            inputManager.touchMoveX = -1;
          }}
          onTouchEnd={() => {
            if (inputManager.touchMoveX === -1) inputManager.touchMoveX = 0;
          }}
          onMouseDown={() => {
            inputManager.touchMoveX = -1;
          }}
          onMouseUp={() => {
            if (inputManager.touchMoveX === -1) inputManager.touchMoveX = 0;
          }}
          className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-slate-700/80 active:bg-cyan-500/30 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          id="touch-right-btn"
          onTouchStart={() => {
            inputManager.touchMoveX = 1;
          }}
          onTouchEnd={() => {
            if (inputManager.touchMoveX === 1) inputManager.touchMoveX = 0;
          }}
          onMouseDown={() => {
            inputManager.touchMoveX = 1;
          }}
          onMouseUp={() => {
            if (inputManager.touchMoveX === 1) inputManager.touchMoveX = 0;
          }}
          className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-slate-700/80 active:bg-cyan-500/30 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Right: Parkour Action Buttons */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Grapple Button (Level 20+) */}
        {showGrapple && (
          <button
            id="touch-grapple-btn"
            onTouchStart={() => {
              inputManager.touchGrapplePressed = true;
              inputManager.touchGrappleHeld = true;
            }}
            onTouchEnd={() => {
              inputManager.touchGrappleHeld = false;
            }}
            className="w-12 h-12 rounded-xl bg-slate-900/85 border border-pink-500/60 active:bg-pink-500/40 text-pink-300 flex items-center justify-center backdrop-blur-md active:scale-95 transition"
          >
            <Anchor className="w-6 h-6" />
          </button>
        )}

        {/* Dash Button (Level 19+) */}
        {showDash && (
          <button
            id="touch-dash-btn"
            onTouchStart={() => {
              inputManager.touchDashPressed = true;
            }}
            className="w-12 h-12 rounded-xl bg-slate-900/85 border border-amber-500/60 active:bg-amber-500/40 text-amber-300 flex items-center justify-center backdrop-blur-md active:scale-95 transition"
          >
            <Zap className="w-6 h-6" />
          </button>
        )}

        {/* Slide Button */}
        <button
          id="touch-slide-btn"
          onTouchStart={() => {
            inputManager.touchSlidePressed = true;
            inputManager.touchSlideHeld = true;
          }}
          onTouchEnd={() => {
            inputManager.touchSlideHeld = false;
          }}
          className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-slate-700/80 active:bg-cyan-500/30 text-cyan-300 flex flex-col items-center justify-center backdrop-blur-md active:scale-95 transition"
        >
          <ArrowDown className="w-6 h-6" />
          <span className="text-[9px] font-mono tracking-tighter">SLIDE</span>
        </button>

        {/* Jump Button */}
        <button
          id="touch-jump-btn"
          onTouchStart={() => {
            inputManager.touchJumpPressed = true;
            inputManager.touchJumpHeld = true;
          }}
          onTouchEnd={() => {
            inputManager.touchJumpHeld = false;
          }}
          className="w-16 h-16 rounded-2xl bg-cyan-600/90 border border-cyan-400 active:bg-cyan-400 text-slate-950 flex flex-col items-center justify-center backdrop-blur-md active:scale-95 transition shadow-lg neon-glow-cyan font-bold"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span className="text-[10px] font-chakra tracking-wider">JUMP</span>
        </button>
      </div>
    </div>
  );
};
