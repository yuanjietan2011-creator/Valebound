import React from 'react';
import { STAGES } from '../game/levels';
import type { StageRecord } from '../game/types';

interface StageSelectModalProps {
  currentStageIndex: number;
  highestReachedStage: number;
  records: Record<number, StageRecord>;
  onSelectStage: (index: number) => void;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  currentStageIndex,
  highestReachedStage,
  records,
  onSelectStage,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#070b10]/82 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select Stage"
    >
      <div className="w-full max-w-3xl bg-[#111924] border border-slate-700 rounded-lg shadow-2xl p-6 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-100">
              The Ten Shrines
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Clear each shrine in sequence—every entry reshapes the terrain and encounters.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STAGES.map((stage, idx) => {
            const unlocked = idx <= highestReachedStage;
            const rec = records[idx];
            const isCurrent = idx === currentStageIndex;
            return (
              <button
                key={stage.index}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectStage(idx)}
                className={`text-left p-3.5 rounded-md border transition-colors flex items-center justify-between gap-3 ${
                  unlocked
                    ? isCurrent
                      ? 'bg-[#1a2838] border-amber-500/80 hover:bg-[#203042] cursor-pointer'
                      : 'bg-[#15202e] border-slate-700/80 hover:border-amber-500/60 hover:bg-[#1a2738] cursor-pointer'
                    : 'bg-[#0e141d] border-slate-800/80 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3 h-10 rounded-xs shrink-0"
                    style={{ backgroundColor: stage.palette.groundTop }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-mono-nums text-amber-400/90">
                      Stage {idx + 1} · {rec?.cleared ? 'Cleared' : unlocked ? 'Open' : 'Locked'}
                    </div>
                    <div className="font-display text-sm font-semibold text-slate-100 truncate mt-0.5">
                      {stage.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {stage.subtitle}
                    </div>
                  </div>
                </div>

                {rec?.bestTime != null && (
                  <div className="text-right font-mono-nums text-xs text-slate-300 shrink-0">
                    {Math.round(rec.bestTime)}s
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
