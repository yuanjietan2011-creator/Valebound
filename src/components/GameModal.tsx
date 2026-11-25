import React from 'react';
import { RELIC_INFO } from '../game/rpg';
import type { GamePhase, HudSnapshot } from '../game/types';

interface GameModalProps {
  phase: GamePhase;
  hud: HudSnapshot;
  onResume: () => void;
  onNextStage: () => void;
  onRetry: () => void;
  onNewRun: () => void;
  onOpenStages: () => void;
  onReturnTitle: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  phase,
  hud,
  onResume,
  onNextStage,
  onRetry,
  onNewRun,
  onOpenStages,
  onReturnTitle,
}) => {
  if (phase === 'title' || phase === 'playing') return null;

  const isPaused = phase === 'paused';
  const isStageClear = phase === 'stage_clear';
  const isVictory = phase === 'victory';
  const isGameOver = phase === 'gameover';

  let badge = 'Paused';
  let badgeClass = 'bg-slate-800 text-slate-300 border-slate-600/80';
  let heading = 'Journey Paused';
  let subline = `Stage ${hud.stageIndex + 1} of 10 · ${hud.stageName}`;

  if (isStageClear) {
    badge = 'Stage Clear';
    badgeClass = 'bg-amber-950/80 text-amber-300 border-amber-600/70';
    heading = 'Shrine Reached';
    subline = `${hud.stageName} cleared — next shrine awaits`;
  } else if (isVictory) {
    badge = 'Game Complete';
    badgeClass = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70';
    heading = 'All Ten Shrines Lit!';
    subline = 'The Citadel Guardian has fallen and the vale is restored.';
  } else if (isGameOver) {
    badge = 'Game Over';
    badgeClass = 'bg-rose-950/90 text-rose-300 border-rose-600/70';
    heading = 'Lantern Extinguished';
    subline = `Fallen in Stage ${hud.stageIndex + 1} · ${hud.stageName}`;
  }

  return (
    <div
      className="fixed inset-0 z-25 flex items-center justify-center bg-[#070b10]/82 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={badge}
      data-testid={`modal-${phase}`}
    >
      <div className="w-full max-w-md bg-[#111924] border border-slate-700 rounded-lg shadow-2xl p-6">
        <div className="flex justify-center mb-2">
          <span
            className={`px-2.5 py-0.5 text-[11px] font-mono-nums font-semibold uppercase tracking-widest rounded border ${badgeClass}`}
          >
            {badge}
          </span>
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-100 text-center">
          {heading}
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1">{subline}</p>

        {/* Mastery / Progress Metrics */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-[#172230] border border-slate-800 rounded-md p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Level
            </div>
            <div className="font-mono-nums text-base font-bold text-amber-300 mt-0.5">
              {hud.level}
            </div>
          </div>
          <div className="bg-[#172230] border border-slate-800 rounded-md p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Gold
            </div>
            <div className="font-mono-nums text-base font-bold text-amber-400 mt-0.5">
              {hud.gold}
            </div>
          </div>
          <div className="bg-[#172230] border border-slate-800 rounded-md p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Foes
            </div>
            <div className="font-mono-nums text-base font-bold text-sky-300 mt-0.5">
              {hud.enemiesDefeated}
            </div>
          </div>
          <div className="bg-[#172230] border border-slate-800 rounded-md p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Time
            </div>
            <div className="font-mono-nums text-base font-bold text-slate-100 mt-0.5">
              {Math.round(hud.elapsedSeconds)}s
            </div>
          </div>
        </div>

        {(isVictory || isGameOver) && hud.relics.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            {hud.relics.map((rid) => (
              <span
                key={rid}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#172230] border border-slate-700 rounded"
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs inline-block"
                  style={{ backgroundColor: RELIC_INFO[rid].color }}
                />
                {RELIC_INFO[rid].name}
              </span>
            ))}
          </div>
        )}

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
              {isVictory ? 'Play Again from Stage 1' : 'Try Stage Again (New Layout)'}
            </button>
          )}

          {isGameOver && (
            <button
              type="button"
              onClick={onNewRun}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm rounded-md transition-colors cursor-pointer"
            >
              Start Fresh Run (Stage 1)
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm rounded-md transition-colors cursor-pointer"
            >
              Restart Stage (New Layout)
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
