import React from 'react';
import { RELIC_INFO } from '../game/rpg';
import type { HudSnapshot } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  onUsePotion: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenStages: () => void;
  onTouchKey: (key: 'left' | 'right' | 'jump' | 'cast', pressed: boolean) => void;
}

const HeartSocket: React.FC<{ state: 'full' | 'empty' }> = ({ state }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path
      d="M12 21s-7.2-4.6-9.4-8.8C1 9.1 2.7 5.2 6.5 4.6c2.2-.4 4.2.7 5.5 2.4 1.3-1.7 3.3-2.8 5.5-2.4 3.8.6 5.5 4.5 3.9 7.6C19.2 16.4 12 21 12 21z"
      fill={state === 'full' ? '#e11d48' : '#1e293b'}
      stroke="#090d14"
      strokeWidth="2"
    />
    {state === 'full' ? (
      <path
        d="M6.8 7.5c1-.7 2.2-.6 3 .1"
        stroke="#fda4af"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    ) : (
      <path
        d="M10 9l3 3-2 3"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    )}
  </svg>
);

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  muted,
  onUsePotion,
  onToggleMute,
  onPause,
  onRestart,
  onOpenStages,
  onTouchKey,
}) => {
  const xpPct = Math.min(100, Math.round((hud.xp / Math.max(1, hud.xpToNext)) * 100));
  const hearts = Array.from({ length: hud.maxHp }, (_, idx) =>
    idx < hud.hp ? 'full' : 'empty'
  );

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 md:p-5">
      {/* Top Perimeter Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left: Hero Vitality, Level, XP, Gold, Potion */}
        <div
          className="pointer-events-auto bg-[#0f1723]/90 border border-slate-700/80 rounded-md px-3.5 py-2.5 shadow-lg min-w-[235px]"
          aria-label="Hero status"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-amber-300 tracking-wide">
                LV {hud.level}
              </span>
              <span className="text-slate-500" aria-hidden="true">
                ·
              </span>
              <span
                className="font-mono-nums text-xs text-slate-200"
                data-testid="hud-hp"
              >
                HP {hud.hp}/{hud.maxHp}
              </span>
            </div>
            <span
              className="font-mono-nums text-xs font-bold text-amber-400"
              data-testid="hud-gold"
            >
              {hud.gold}g
            </span>
          </div>

          {/* Heart Sockets */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {hearts.map((st, i) => (
              <HeartSocket key={i} state={st} />
            ))}
          </div>

          {/* XP Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono-nums mb-1">
              <span>XP</span>
              <span data-testid="hud-xp">
                {hud.xp}/{hud.xpToNext}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-sm overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-[width] duration-150"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {/* Potion & Relics Row */}
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onUsePotion();
              }}
              disabled={hud.potions <= 0 || hud.hp >= hud.maxHp}
              className="px-2 py-1 rounded bg-emerald-950/90 hover:bg-emerald-900 disabled:opacity-45 border border-emerald-700/70 text-emerald-200 font-mono-nums text-[11px] transition-colors cursor-pointer disabled:cursor-default whitespace-nowrap shrink-0"
              title="Use Healing Potion [Q]"
            >
              Potion [Q]: {hud.potions}
            </button>

            {hud.relics.length > 0 && (
              <div className="flex items-center gap-1.5">
                {hud.relics.map((rid) => (
                  <span
                    key={rid}
                    title={`${RELIC_INFO[rid].name}: ${RELIC_INFO[rid].effect}`}
                    className="w-3 h-3 rounded-xs border border-slate-950 inline-block"
                    style={{ backgroundColor: RELIC_INFO[rid].color }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top-Center: Stage Title & Boss HP */}
        <div className="hidden sm:flex flex-col items-center gap-2">
          <div className="bg-[#0f1723]/88 border border-slate-700/80 rounded-md px-4 py-1.5 shadow-md text-center">
            <div
              className="text-xs font-semibold tracking-wider uppercase text-amber-300/95 font-mono-nums"
              data-testid="hud-stage"
            >
              Stage {hud.stageIndex + 1} / 10 · {hud.stageName}
            </div>
          </div>

          {hud.bossHp !== null && hud.bossMaxHp !== null && (
            <div className="bg-[#180d11]/92 border border-rose-800/80 rounded-md px-4 py-2 min-w-[260px] shadow-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-200 mb-1">
                <span className="font-display tracking-wide">
                  {hud.bossName ?? 'The Ash Warden'}
                </span>
                <span className="font-mono-nums">
                  {hud.bossHp}/{hud.bossMaxHp}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-[width] duration-100"
                  style={{
                    width: `${Math.max(0, Math.round((hud.bossHp / hud.bossMaxHp) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {hud.bannerText && (
            <div className="bg-[#0f1723]/92 border border-amber-500/70 rounded-md px-4 py-1.5 text-sm font-display font-semibold text-amber-200 shadow-md">
              {hud.bannerText}
            </div>
          )}
        </div>

        {/* Top-Right: Utility Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenStages();
            }}
            className="h-9 px-3 bg-[#0f1723]/90 hover:bg-[#1a2638] border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Open stage select"
          >
            Stages
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-9 h-9 flex items-center justify-center bg-[#0f1723]/90 hover:bg-[#1a2638] border border-slate-700/80 rounded-md text-slate-200 shadow-md transition-colors cursor-pointer"
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title="Mute [M]"
          >
            {muted ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M22 9l-6 6M16 9l6 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 010 7" />
              </svg>
            )}
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className="w-9 h-9 flex items-center justify-center bg-[#0f1723]/90 hover:bg-[#1a2638] border border-slate-700/80 rounded-md text-slate-200 shadow-md transition-colors cursor-pointer"
            aria-label="Restart stage"
            title="Restart Stage [R]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 103-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            className="w-9 h-9 flex items-center justify-center bg-[#0f1723]/90 hover:bg-[#1a2638] border border-slate-700/80 rounded-md text-slate-200 shadow-md transition-colors cursor-pointer"
            aria-label="Pause game"
            title="Pause [P]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Row: Mobile touch buttons (hidden on desktop) + quiet desktop key line */}
      <div className="flex items-end justify-between">
        <div className="hidden md:block text-[11px] text-slate-200/80 hud-stroke">
          WASD / Arrows Move &amp; Jump · F Bolt · Q Potion · P Pause
        </div>

        {/* Mobile Touch Controls */}
        <div className="flex md:hidden w-full items-center justify-between pointer-events-auto pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={() => onTouchKey('left', true)}
              onPointerUp={() => onTouchKey('left', false)}
              onPointerLeave={() => onTouchKey('left', false)}
              className="w-12 h-12 rounded-md bg-[#0f1723]/85 border border-slate-600 text-slate-100 font-bold text-base"
              aria-label="Move left"
            >
              ←
            </button>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={() => onTouchKey('right', true)}
              onPointerUp={() => onTouchKey('right', false)}
              onPointerLeave={() => onTouchKey('right', false)}
              className="w-12 h-12 rounded-md bg-[#0f1723]/85 border border-slate-600 text-slate-100 font-bold text-base"
              aria-label="Move right"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={() => onTouchKey('cast', true)}
              onPointerUp={() => onTouchKey('cast', false)}
              className="w-12 h-12 rounded-md bg-amber-950/90 border border-amber-600 text-amber-200 font-semibold text-xs"
              aria-label="Lantern bolt"
            >
              Bolt
            </button>
            <button
              type="button"
              tabIndex={-1}
              onPointerDown={() => onTouchKey('jump', true)}
              onPointerUp={() => onTouchKey('jump', false)}
              onPointerLeave={() => onTouchKey('jump', false)}
              className="w-14 h-12 rounded-md bg-amber-500 text-slate-950 font-bold text-xs"
              aria-label="Jump"
            >
              Jump
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
