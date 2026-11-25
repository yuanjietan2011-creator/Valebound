import React, { useRef, useState } from 'react';

interface TouchControlsProps {
  potions: number;
  canHeal: boolean;
  onJoystickChange: (dir: { left: boolean; right: boolean; down: boolean }) => void;
  onActionButton: (action: 'jump' | 'cast' | 'potion', pressed: boolean) => void;
}

const MAX_RADIUS = 38;
const DEAD_ZONE_X = 11;
const CROUCH_ZONE_Y = 24;

export const TouchControls: React.FC<TouchControlsProps> = ({
  potions,
  canHeal,
  onJoystickChange,
  onActionButton,
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateStick = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(MAX_RADIUS, dist);
    const angle = Math.atan2(dy, dx);
    const kx = dist > 0 ? Math.cos(angle) * clamped : 0;
    const ky = dist > 0 ? Math.sin(angle) * clamped : 0;

    setKnob({ x: kx, y: ky });
    onJoystickChange({
      left: kx < -DEAD_ZONE_X,
      right: kx > DEAD_ZONE_X,
      down: ky > CROUCH_ZONE_Y,
    });
  };

  const resetStick = () => {
    activePointerRef.current = null;
    setKnob({ x: 0, y: 0 });
    onJoystickChange({ left: false, right: false, down: false });
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 pointer-events-none flex items-end justify-between px-5 pb-5"
      data-testid="mobile-touch-controls"
    >
      {/* Virtual Thumb Joystick */}
      <div
        ref={baseRef}
        role="group"
        aria-label="Movement joystick"
        onPointerDown={(e) => {
          e.preventDefault();
          activePointerRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (activePointerRef.current === e.pointerId) {
            updateStick(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          if (activePointerRef.current === e.pointerId) {
            resetStick();
          }
        }}
        onPointerCancel={resetStick}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-[#0f1723]/80 border-2 border-slate-500/70 touch-none flex items-center justify-center shadow-lg"
      >
        <div
          className="w-11 h-11 rounded-full bg-amber-400/90 border-2 border-slate-900 shadow-md"
          style={{
            transform: `translate(${knob.x}px, ${knob.y}px)`,
          }}
        />
      </div>

      {/* Right-Hand Action Buttons */}
      <div className="pointer-events-auto flex items-end gap-3 touch-none">
        <button
          type="button"
          tabIndex={-1}
          disabled={potions <= 0 || !canHeal}
          onPointerDown={(e) => {
            e.preventDefault();
            onActionButton('potion', true);
          }}
          className="w-12 h-12 rounded-full bg-emerald-900/90 disabled:opacity-40 border border-emerald-500/80 text-emerald-100 font-semibold text-[11px] shadow-md"
          aria-label="Use potion"
        >
          Heal
        </button>

        <button
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.preventDefault();
            onActionButton('cast', true);
          }}
          onPointerUp={() => onActionButton('cast', false)}
          className="w-14 h-14 rounded-full bg-amber-950/90 active:bg-amber-800 border-2 border-amber-500/80 text-amber-200 font-semibold text-xs shadow-md"
          aria-label="Lantern bolt"
        >
          Bolt
        </button>

        <button
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.preventDefault();
            onActionButton('jump', true);
          }}
          onPointerUp={() => onActionButton('jump', false)}
          onPointerCancel={() => onActionButton('jump', false)}
          onPointerLeave={() => onActionButton('jump', false)}
          className="w-16 h-16 rounded-full bg-amber-500 active:bg-amber-400 border-2 border-amber-200 text-slate-950 font-bold text-sm shadow-lg"
          aria-label="Jump"
        >
          Jump
        </button>
      </div>
    </div>
  );
};
