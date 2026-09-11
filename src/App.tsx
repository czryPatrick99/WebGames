/**
 * NEON ASCENT: 30 Levels of Parkour
 * High-performance 3D/2.5D browser parkour platformer built with Three.js & TypeScript.
 */

import { useEffect, useRef, useState } from 'react';
import { Game, GameHUDData } from './core/Game';
import { HUD } from './ui/HUD';
import { LevelComplete } from './ui/LevelComplete';
import { WorldSelect } from './ui/WorldSelect';
import { CustomizationModal } from './ui/CustomizationModal';
import { PauseModal } from './ui/PauseModal';
import { MobileControls } from './ui/MobileControls';
import { saveManager } from './save/SaveManager';
import { Play, Grid, Sparkles, Trophy, Zap, Shield } from 'lucide-react';

interface LevelFinishResult {
  levelId: number;
  time: number;
  bestTime: number;
  stars: number;
  flow: number;
  deaths: number;
  fragments: [boolean, boolean, boolean];
  score: number;
  isNewBest: boolean;
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [hudData, setHudData] = useState<GameHUDData | null>(null);
  const [finishResult, setFinishResult] = useState<LevelFinishResult | null>(null);
  const [showWorldSelect, setShowWorldSelect] = useState<boolean>(false);
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Initialize Game on Mount
  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Game(containerRef.current);
    gameRef.current = game;
    setCurrentLevelId(game.currentLevelId);

    game.setCallbacks(
      (data) => setHudData(data),
      (result) => {
        setFinishResult(result);
      }
    );

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    if (!gameRef.current) return;
    setGameStarted(true);
    gameRef.current.start();
  };

  const handleRestart = () => {
    if (!gameRef.current) return;
    setFinishResult(null);
    setIsPaused(false);
    gameRef.current.restartAtCheckpoint();
    gameRef.current.resume();
  };

  const handleNextLevel = () => {
    if (!gameRef.current) return;
    const nextId = Math.min(30, currentLevelId + 1);
    setCurrentLevelId(nextId);
    setFinishResult(null);
    setIsPaused(false);
    gameRef.current.loadLevel(nextId);
    gameRef.current.resume();
  };

  const handleSelectLevel = (levelId: number) => {
    if (!gameRef.current) return;
    setCurrentLevelId(levelId);
    setShowWorldSelect(false);
    setFinishResult(null);
    setIsPaused(false);
    gameRef.current.loadLevel(levelId);
    if (gameStarted) {
      gameRef.current.resume();
    } else {
      setGameStarted(true);
      gameRef.current.start();
    }
  };

  const handlePause = () => {
    if (!gameRef.current || !gameStarted) return;
    setIsPaused(true);
    gameRef.current.pause();
  };

  const handleResume = () => {
    if (!gameRef.current) return;
    setIsPaused(false);
    gameRef.current.resume();
  };

  const handleApplyCustomization = () => {
    if (gameRef.current) {
      gameRef.current.applyCustomization();
    }
  };

  const totalStars = saveManager.getTotalStars();
  const totalFragments = saveManager.getTotalFragments();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080811] select-none text-slate-100 font-rajdhani">
      {/* Three.js Canvas Container */}
      <div
        id="game-canvas-container"
        ref={containerRef}
        className="absolute inset-0 z-0 cursor-crosshair"
      />

      {/* Atmospheric Cyber Scanlines & Vignette */}
      <div className="absolute inset-0 pointer-events-none cyber-scanlines z-10 opacity-60" />

      {/* Active Game HUD */}
      {gameStarted && (
        <HUD
          data={hudData}
          onRestart={handleRestart}
          onPause={handlePause}
        />
      )}

      {/* Mobile Touch Controls */}
      {gameStarted && gameRef.current && (
        <MobileControls
          inputManager={gameRef.current.inputManager}
          currentLevelId={currentLevelId}
        />
      )}

      {/* Start Title Screen Overlay */}
      {!gameStarted && (
        <div
          id="title-screen"
          className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 md:p-12 bg-black/65 backdrop-blur-xs"
        >
          {/* Top Title Bar */}
          <div className="flex items-center justify-between w-full max-w-6xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse neon-glow-cyan" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                SYSTEM ACTIVE // v1.0.0
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1 text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                {totalStars} / 90 STARS
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                {totalFragments} / 90 CORES
              </span>
            </div>
          </div>

          {/* Central Logo & Play Call to Action */}
          <div className="flex flex-col items-center text-center max-w-2xl my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              30 Levels of Parkour
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-chakra tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              NEON ASCENT
            </h1>

            <p className="mt-3 text-base md:text-lg text-slate-300 max-w-lg font-medium">
              Run, slide, wall-run, dash, and grapple through 30 parkour lessons across 5 dystopian cyber-districts.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full max-w-md">
              <button
                id="start-ascent-btn"
                onClick={handleStartGame}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 py-4 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black font-chakra text-lg uppercase tracking-wider transition active:scale-95 shadow-xl neon-glow-cyan cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                START ASCENT
              </button>

              <button
                id="title-level-select-btn"
                onClick={() => setShowWorldSelect(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700 text-white font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <Grid className="w-4 h-4 text-amber-400" />
                LEVELS
              </button>

              <button
                id="title-customization-btn"
                onClick={() => setShowCustomization(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700 text-white font-bold font-chakra uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-pink-400" />
                LOCKER
              </button>
            </div>
          </div>

          {/* Bottom Keyboard Controls Legend */}
          <div className="w-full max-w-4xl bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 hidden md:flex items-center justify-between text-xs font-mono text-slate-400 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span className="text-white font-bold uppercase">CONTROLS:</span>
              <span><strong className="text-cyan-400">A / D</strong> Run</span>
              <span><strong className="text-cyan-400">Shift</strong> Sprint</span>
              <span><strong className="text-cyan-400">Space</strong> Jump</span>
              <span><strong className="text-cyan-400">C / Down</strong> Slide</span>
              <span><strong className="text-amber-400">E / J</strong> Dash (Lv 19)</span>
              <span><strong className="text-pink-400">Q / K</strong> Grapple (Lv 20)</span>
            </div>
            <span><strong className="text-slate-300">[R]</strong> Quick Restart</span>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {finishResult && (
        <LevelComplete
          levelId={finishResult.levelId}
          time={finishResult.time}
          bestTime={finishResult.bestTime}
          stars={finishResult.stars}
          flow={finishResult.flow}
          deaths={finishResult.deaths}
          fragments={finishResult.fragments}
          score={finishResult.score}
          isNewBest={finishResult.isNewBest}
          onRetry={handleRestart}
          onNextLevel={handleNextLevel}
          onLevelSelect={() => {
            setFinishResult(null);
            setShowWorldSelect(true);
          }}
        />
      )}

      {/* World & Level Select Modal */}
      {showWorldSelect && (
        <WorldSelect
          currentLevelId={currentLevelId}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowWorldSelect(false)}
        />
      )}

      {/* Customization Locker Modal */}
      {showCustomization && (
        <CustomizationModal
          onClose={() => setShowCustomization(false)}
          onApply={handleApplyCustomization}
        />
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenLevelSelect={() => {
            setIsPaused(false);
            setShowWorldSelect(true);
          }}
          onOpenCustomization={() => {
            setIsPaused(false);
            setShowCustomization(true);
          }}
        />
      )}
    </div>
  );
}
