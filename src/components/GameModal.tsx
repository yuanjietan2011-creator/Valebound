import React from 'react';
import type { GamePhase, HudSnapshot } from '../game/types';

interface GameModalProps {
  phase: GamePhase;
  hud: HudSnapshot;
  onResume: () => void;
  onNextStage: () => void;
  onRetry: () => void;
  onOpenStages: () => void;
  onReturnTitle: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  phase,
  hud,
  onResume,
  onNextStage,
  onRetry,
  onOpenStages,
  onReturnTitle,
}) => {
  if (phase === 'title' || phase === 'playing') return null;

  const isPaused = phase === 'paused';
  const isStageClear = phase === 'stage_clear';
  const isVictory = phase === 'victory';
  const isGameOver = phase === 'gameover';

  let heading = 'Paused';
  let subline = `Stage ${hud.stageIndex + 1} of 10 · ${hud.stageName}`;
  if (isStageClear) {
    heading = 'Shrine Reached';
    subline = `${hud.stageName} cleared`;
  } else if (isVictory) {
    heading = 'All Ten Shrines Lit';
    subline = 'The Ash Warden has fallen and the vale is restored.';
  } else if (isGameOver) {
    heading = 'Lantern Extinguished';
    subline = `Fallen in Stage ${hud.stageIndex + 1} · ${hud.stageName}`;
  }

  return (
    <div
      className="fixed inset-0 z-25 flex items-center justify-center bg-[#070b10]/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <div className="w-full max-w-md bg-[#111924] border border-slate-700 rounded-lg shadow-2xl p-6">
        <h2 className="font-display text-2xl font-bold text-slate-100 text-center">
          {heading}
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1">{subline}</p>

        {/* Mastery / Progress Metrics */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="bg-[#172230] border border-slate-800 rounded-md p-3 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Level
            </div>
            <div className="font-mono-nums text-lg font-bold text-amber-300 mt-0.5">
              {hud.level}
            </div>
          </div>
          <div className="bg-[#172230] border border-slate-800 rounded-md p-3 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Gold
            </div>
            <div className="font-mono-nums text-lg font-bold text-amber-400 mt-0.5">
              {hud.gold}
            </div>
          </div>
          <div className="bg-[#172230] border border-slate-800 rounded-md p-3 text-center">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Time
            </div>
            <div className="font-mono-nums text-lg font-bold text-slate-100 mt-0.5">
              {Math.round(hud.elapsedSeconds)}s
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {isPaused && (
            <button
              type="button"
              onClick={onResume}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-md transition-colors cursor-pointer"
            >
              Resume Journey
            </button>
          )}

          {isStageClear && (
            <button
              type="button"
              data-start="true"
              onClick={onNextStage}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-md transition-colors cursor-pointer"
            >
              Continue to Stage {hud.stageIndex + 2}
            </button>
          )}

          {(isGameOver || isVictory) && (
            <button
              type="button"
              data-start="true"
              onClick={onRetry}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-md transition-colors cursor-pointer"
            >
              {isVictory ? 'Play Again from Stage 1' : 'Try Stage Again'}
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm rounded-md transition-colors cursor-pointer"
            >
              Restart Stage
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenStages}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-md transition-colors cursor-pointer"
            >
              Select Stage
            </button>
            <button
              type="button"
              onClick={onReturnTitle}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-md transition-colors cursor-pointer"
            >
              Title Screen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
