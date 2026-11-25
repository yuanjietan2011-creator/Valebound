import React, { useRef, useState } from 'react';

interface TouchControlsProps {
  potions: number;
  canHeal: boolean;
  boltAmmo: number;
  maxBoltAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  onJoystickChange: (dir: { left: boolean; right: boolean; down: boolean }) => void;
  onActionButton: (
    action: 'jump' | 'cast' | 'potion' | 'reload',
    pressed: boolean
  ) => void;
}

const JOYSTICK_SIZE = 140;
const HALF_JOY = JOYSTICK_SIZE / 2;
const MAX_RADIUS = 48;
const DEAD_ZONE_X = 12;
const CROUCH_ZONE_Y = 28;
const EDGE_MARGIN = 44;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  potions,
  canHeal,
  boltAmmo,
  maxBoltAmmo,
  isReloading,
  reloadProgress,
  onJoystickChange,
  onActionButton,
}) => {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const startStick = (clientX: number, clientY: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const ox = clamp(clientX - rect.left, EDGE_MARGIN, rect.width - EDGE_MARGIN);
    const oy = clamp(clientY - rect.top, EDGE_MARGIN, rect.height - EDGE_MARGIN);
    const nextOrigin = { x: ox, y: oy };
    originRef.current = nextOrigin;
    setOrigin(nextOrigin);
    setKnob({ x: 0, y: 0 });
    onJoystickChange({ left: false, right: false, down: false });
  };

  const moveStick = (clientX: number, clientY: number) => {
    const zone = zoneRef.current;
    const curOrigin = originRef.current;
    if (!zone || !curOrigin) return;
    const rect = zone.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    let ox = curOrigin.x;
    let oy = curOrigin.y;
    let dx = localX - ox;
    let dy = localY - oy;
    let dist = Math.hypot(dx, dy);

    // Slide joystick base to follow finger within the movement area when dragged beyond outer rim
    if (dist > MAX_RADIUS) {
      ox = clamp(localX - (dx / dist) * MAX_RADIUS, EDGE_MARGIN, rect.width - EDGE_MARGIN);
      oy = clamp(localY - (dy / dist) * MAX_RADIUS, EDGE_MARGIN, rect.height - EDGE_MARGIN);
      const nextOrigin = { x: ox, y: oy };
      originRef.current = nextOrigin;
      setOrigin(nextOrigin);
      dx = localX - ox;
      dy = localY - oy;
      dist = Math.hypot(dx, dy);
    }

    const clamped = Math.min(MAX_RADIUS, dist);
    const kx = dist > 0 ? (dx / dist) * clamped : 0;
    const ky = dist > 0 ? (dy / dist) * clamped : 0;

    setKnob({ x: kx, y: ky });
    onJoystickChange({
      left: kx < -DEAD_ZONE_X,
      right: kx > DEAD_ZONE_X,
      down: ky > CROUCH_ZONE_Y,
    });
  };

  const resetStick = () => {
    activePointerRef.current = null;
    originRef.current = null;
    setOrigin(null);
    setKnob({ x: 0, y: 0 });
    onJoystickChange({ left: false, right: false, down: false });
  };

  const ringStyle: React.CSSProperties = origin
    ? {
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
        left: origin.x - HALF_JOY,
        top: origin.y - HALF_JOY,
      }
    : {
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
        left: 12,
        bottom: 12,
      };

  return (
    <div data-testid="mobile-touch-controls">
      {/* Left Floating / Follow-Finger Joystick Zone */}
      <div
        ref={zoneRef}
        data-testid="joystick-zone"
        aria-label="Joystick touch area"
        onPointerDown={(e) => {
          e.preventDefault();
          activePointerRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          startStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (activePointerRef.current === e.pointerId) {
            moveStick(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          if (activePointerRef.current === e.pointerId) {
            resetStick();
          }
        }}
        onPointerCancel={resetStick}
        className="fixed left-0 bottom-0 z-20 w-[42vw] max-w-[215px] h-[25vh] min-h-[164px] max-h-[212px] touch-none select-none border-t border-r border-slate-300/12 rounded-tr-3xl"
      >
        {/* Virtual Thumb Joystick (140px kept consistent) */}
        <div
          role="group"
          aria-label="Movement joystick"
          style={ringStyle}
          className="absolute rounded-full bg-[#0f1723]/70 border-2 border-slate-400/65 flex items-center justify-center shadow-lg pointer-events-none"
        >
          <div
            className="w-14 h-14 rounded-full bg-amber-400/92 border-2 border-slate-900 shadow-md"
            style={{
              transform: `translate(${knob.x}px, ${knob.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right-Hand Action Buttons (slightly larger for comfortable thumb taps) */}
      <div className="fixed right-2.5 bottom-3 z-20 pointer-events-auto flex items-end gap-2 touch-none">
        <button
          type="button"
          tabIndex={-1}
          disabled={potions <= 0 || !canHeal}
          onPointerDown={(e) => {
            e.preventDefault();
            onActionButton('potion', true);
          }}
          className="w-[54px] h-[54px] rounded-full bg-emerald-900/90 disabled:opacity-40 border border-emerald-500/80 text-emerald-100 font-semibold text-xs shadow-md"
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
          className={`relative w-16 h-16 rounded-full border-2 font-semibold text-[13px] shadow-md overflow-hidden flex flex-col items-center justify-center leading-tight ${
            isReloading
              ? 'bg-slate-900/90 border-amber-500/50 text-amber-300/85'
              : 'bg-amber-950/90 active:bg-amber-800 border-amber-500/80 text-amber-200'
          }`}
          aria-label={isReloading ? 'Reloading lantern bolts' : `Lantern bolt (${boltAmmo} of ${maxBoltAmmo})`}
        >
          {isReloading && (
            <span
              className="absolute inset-x-0 bottom-0 bg-amber-500/25 pointer-events-none"
              style={{ height: `${Math.round(reloadProgress * 100)}%` }}
            />
          )}
          <span className="relative z-10">{isReloading ? 'Reload' : 'Bolt'}</span>
          <span className="relative z-10 text-[10px] font-mono-nums opacity-90">
            {isReloading ? `${Math.round(reloadProgress * 100)}%` : `${boltAmmo}/${maxBoltAmmo}`}
          </span>
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
          className="w-[72px] h-[72px] rounded-full bg-amber-500 active:bg-amber-400 border-2 border-amber-200 text-slate-950 font-bold text-[15px] shadow-lg"
          aria-label="Jump"
        >
          Jump
        </button>
      </div>
    </div>
  );
};
