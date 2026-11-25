import React from 'react';

interface TitleOverlayProps {
  highestReachedStage: number;
  isFullscreen: boolean;
  onStart: () => void;
  onOpenStages: () => void;
  onToggleFullscreen: () => void;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  highestReachedStage,
  isFullscreen,
  onStart,
  onOpenStages,
  onToggleFullscreen,
}) => {
  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between pointer-events-none px-6 py-8 md:px-14 md:py-10">
      {/* Top-left atmospheric title lockup sitting cleanly in sky negative space */}
      <div className="max-w-lg pointer-events-auto">
        <div className="flex items-center gap-3 mb-3">
          <svg
            viewBox="0 0 36 36"
            className="w-9 h-9 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M18 3L29 11V25L18 33L7 25V11L18 3Z"
              fill="#143f48"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <path
              d="M18 9L23 16L18 27L13 16L18 9Z"
              fill="#f59e0b"
            />
            <circle cx="18" cy="17" r="2.5" fill="#fef3c7" />
          </svg>
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-amber-200/90 hud-stroke">
            Ten-Shrine RPG Platformer
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-wide text-slate-50 hud-stroke leading-tight">
          Valebound
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-200/90 max-w-md hud-stroke leading-relaxed">
          Guide Vesper the Lantern Nomad across ten ever-shifting shrines. Every
          run reshapes the path, hazards, and guardians on the road to the Ash Citadel.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold text-sm md:text-base rounded-md shadow-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            {highestReachedStage > 0 ? 'Begin Journey' : 'Start Adventure'}
          </button>
          <button
            type="button"
            onClick={onOpenStages}
            className="px-5 py-3 bg-[#14202c]/90 hover:bg-[#1c2d3d] text-slate-100 border border-slate-600/70 font-medium text-sm md:text-base rounded-md shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            Select Stage ({Math.min(10, highestReachedStage + 1)}/10)
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="px-4 py-3 bg-[#14202c]/90 hover:bg-[#1c2d3d] text-slate-100 border border-slate-600/70 font-medium text-sm md:text-base rounded-md shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Bottom flat control hint */}
      <div className="text-xs md:text-sm text-slate-100/90 hud-stroke tracking-wide">
        WASD or Arrow Keys Move &amp; Jump · F Lantern Bolt · C Reload · Q Potion · V Fullscreen · P Pause
      </div>
    </div>
  );
};
