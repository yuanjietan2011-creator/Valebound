import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from './components/GameHud';
import { GameModal } from './components/GameModal';
import { StageSelectModal } from './components/StageSelectModal';
import { TitleOverlay } from './components/TitleOverlay';
import { soundEngine } from './game/audio';
import { STAGES } from './game/levels';
import { createWorld, stepWorld, type WorldState } from './game/physics';
import { renderWorld } from './game/renderer';
import { createInitialRpgStats } from './game/rpg';
import type {
  GamePhase,
  HudSnapshot,
  InputState,
  RpgStats,
  StageRecord,
} from './game/types';

const STORAGE_KEY = 'valebound_progress_v1';

interface SavedProgress {
  highestReachedStage: number;
  records: Record<number, StageRecord>;
}

function loadProgress(): SavedProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { highestReachedStage: 0, records: {} };
    const parsed = JSON.parse(raw) as SavedProgress;
    return {
      highestReachedStage: Math.max(
        0,
        Math.min(STAGES.length - 1, Number(parsed.highestReachedStage) || 0)
      ),
      records: parsed.records ?? {},
    };
  } catch {
    return { highestReachedStage: 0, records: {} };
  }
}

function saveProgress(data: SavedProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

function syncBodyState(phase: GamePhase) {
  if (phase === 'title') {
    document.body.dataset.state = 'title';
  } else if (phase === 'playing') {
    document.body.dataset.state = 'playing';
  } else if (phase === 'paused') {
    document.body.dataset.state = 'paused';
  } else {
    document.body.dataset.state = 'gameover';
  }
}

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const touchPts = (navigator.maxTouchPoints ?? 0) > 0;
  return coarse || touchPts || window.innerWidth <= 768;
}

function makeHudSnapshot(world: WorldState, phase: GamePhase): HudSnapshot {
  const boss = world.enemies.find((e) => e.type === 'warden' && e.state !== 'ko');
  return {
    phase,
    stageIndex: world.stage.index,
    stageName: world.stage.name,
    stageSubtitle: world.stage.subtitle,
    hp: world.stats.hp,
    maxHp: world.stats.maxHp,
    level: world.stats.level,
    xp: world.stats.xp,
    xpToNext: world.stats.xpToNext,
    gold: world.stats.gold,
    potions: world.stats.potions,
    relics: world.stats.relics,
    enemiesDefeated: world.stats.enemiesDefeated,
    elapsedSeconds: Math.floor(world.elapsedSeconds),
    bossHp: boss ? Math.max(0, boss.hp) : null,
    bossMaxHp: boss ? boss.maxHp : null,
    bossName: boss ? (boss.bossName ?? 'The Ash Warden') : null,
    bannerText: world.bannerText,
  };
}

export default function App() {
  const initialAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const initialProgress = loadProgress();
  const initialPhase: GamePhase = initialAutostart ? 'playing' : 'title';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<WorldState>(
    createWorld(STAGES[0], createInitialRpgStats())
  );
  const phaseRef = useRef<GamePhase>(initialPhase);
  const stageStatsSnapshotRef = useRef<RpgStats>(createInitialRpgStats());
  const keysHeldRef = useRef<Set<string>>(new Set());
  const jumpQueuedRef = useRef(false);
  const castQueuedRef = useRef(false);
  const potionQueuedRef = useRef(false);
  const touchStateRef = useRef({
    left: false,
    right: false,
    down: false,
    jump: false,
  });
  const stageModalOpenRef = useRef(false);

  const [phase, setPhase] = useState<GamePhase>(initialPhase);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() =>
    detectTouchDevice()
  );
  const [highestReachedStage, setHighestReachedStage] = useState(
    initialProgress.highestReachedStage
  );
  const highestReachedStageRef = useRef(initialProgress.highestReachedStage);
  const [records, setRecords] = useState<Record<number, StageRecord>>(
    initialProgress.records
  );
  const [hud, setHud] = useState<HudSnapshot>(() =>
    makeHudSnapshot(worldRef.current, initialPhase)
  );

  const setGamePhase = useCallback((next: GamePhase) => {
    phaseRef.current = next;
    syncBodyState(next);
    soundEngine.setBgmActive(next === 'playing');
    setPhase(next);
    setHud(makeHudSnapshot(worldRef.current, next));
  }, []);

  const loadStage = useCallback(
    (index: number, carryStats: RpgStats, targetPhase: GamePhase) => {
      const clampedIdx = Math.max(0, Math.min(STAGES.length - 1, index));
      stageStatsSnapshotRef.current = {
        ...carryStats,
        relics: [...carryStats.relics],
      };
      worldRef.current = createWorld(STAGES[clampedIdx], carryStats);
      keysHeldRef.current.clear();
      jumpQueuedRef.current = false;
      castQueuedRef.current = false;
      potionQueuedRef.current = false;
      touchStateRef.current = {
        left: false,
        right: false,
        down: false,
        jump: false,
      };
      setStageModalOpen(false);
      stageModalOpenRef.current = false;
      setGamePhase(targetPhase);
    },
    [setGamePhase]
  );

  const handleStartFromTitle = useCallback(() => {
    const fresh = createInitialRpgStats();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    loadStage(0, fresh, 'playing');
  }, [loadStage]);

  const handleRestartStage = useCallback(() => {
    const base = {
      ...stageStatsSnapshotRef.current,
      hp: stageStatsSnapshotRef.current.maxHp,
      relics: [...stageStatsSnapshotRef.current.relics],
    };
    loadStage(worldRef.current.stage.index, base, 'playing');
  }, [loadStage]);

  const handleNextStage = useCallback(() => {
    const nextIdx = worldRef.current.stage.index + 1;
    if (nextIdx >= STAGES.length) {
      loadStage(0, createInitialRpgStats(), 'playing');
    } else {
      loadStage(nextIdx, worldRef.current.stats, 'playing');
    }
  }, [loadStage]);

  const handleReturnTitle = useCallback(() => {
    loadStage(0, createInitialRpgStats(), 'title');
  }, [loadStage]);

  const handleToggleMute = useCallback(() => {
    soundEngine.muted = !soundEngine.muted;
    setMuted(soundEngine.muted);
  }, []);

  const handleTogglePause = useCallback(() => {
    if (phaseRef.current === 'playing') {
      keysHeldRef.current.clear();
      setGamePhase('paused');
    } else if (phaseRef.current === 'paused') {
      keysHeldRef.current.clear();
      setGamePhase('playing');
    }
  }, [setGamePhase]);

  const handleUsePotion = useCallback(() => {
    if (phaseRef.current === 'playing') {
      potionQueuedRef.current = true;
    }
  }, []);

  const handleOpenStages = useCallback(() => {
    if (phaseRef.current === 'playing') {
      keysHeldRef.current.clear();
      setGamePhase('paused');
    }
    stageModalOpenRef.current = true;
    setStageModalOpen(true);
  }, [setGamePhase]);

  const handleCloseStages = useCallback(() => {
    stageModalOpenRef.current = false;
    setStageModalOpen(false);
  }, []);

  const handleSelectStage = useCallback(
    (idx: number) => {
      const base =
        phaseRef.current === 'title'
          ? createInitialRpgStats()
          : {
              ...worldRef.current.stats,
              hp: worldRef.current.stats.maxHp,
              relics: [...worldRef.current.stats.relics],
            };
      loadStage(idx, base, 'playing');
    },
    [loadStage]
  );

  const handleToggleFullscreen = useCallback(() => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void>;
    };
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const active = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
    if (!active) {
      const req = root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.();
      if (req && typeof req.catch === 'function') {
        req.catch(() => {});
      }
    } else {
      const exit = document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.();
      if (exit && typeof exit.catch === 'function') {
        exit.catch(() => {});
      }
    }
  }, []);

  const handleJoystickChange = useCallback(
    (dir: { left: boolean; right: boolean; down: boolean }) => {
      touchStateRef.current.left = dir.left;
      touchStateRef.current.right = dir.right;
      touchStateRef.current.down = dir.down;
    },
    []
  );

  const handleTouchAction = useCallback(
    (action: 'jump' | 'cast' | 'potion', pressed: boolean) => {
      if (action === 'jump') {
        if (pressed && !touchStateRef.current.jump) {
          jumpQueuedRef.current = true;
        }
        touchStateRef.current.jump = pressed;
      } else if (action === 'cast' && pressed) {
        castQueuedRef.current = true;
      } else if (action === 'potion' && pressed) {
        potionQueuedRef.current = true;
      }
    },
    []
  );

  // Sync initial body dataset, touch detection, fullscreen listener, and BGM gesture unlock
  useEffect(() => {
    syncBodyState(phaseRef.current);

    const updateTouch = () => setIsTouchDevice(detectTouchDevice());
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };

    const resumeAudioOnGesture = () => {
      if (phaseRef.current === 'playing') {
        soundEngine.setBgmActive(true);
      }
    };

    window.addEventListener('resize', updateTouch);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    window.addEventListener('pointerdown', resumeAudioOnGesture, { once: true });
    window.addEventListener('keydown', resumeAudioOnGesture, { once: true });
    return () => {
      soundEngine.setBgmActive(false);
      window.removeEventListener('resize', updateTouch);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      window.removeEventListener('pointerdown', resumeAudioOnGesture);
      window.removeEventListener('keydown', resumeAudioOnGesture);
    };
  }, []);

  // Unified Keyboard Input Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (stageModalOpenRef.current) {
        if (e.code === 'Escape') {
          e.preventDefault();
          handleCloseStages();
        }
        return;
      }

      if (phaseRef.current === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartFromTitle();
        }
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (phaseRef.current === 'playing' || phaseRef.current === 'paused') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (e.code === 'KeyV') {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      if (e.code === 'KeyR' && phaseRef.current === 'playing') {
        e.preventDefault();
        handleRestartStage();
        return;
      }

      if (phaseRef.current === 'stage_clear' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        handleNextStage();
        return;
      }

      if (
        (phaseRef.current === 'gameover' || phaseRef.current === 'victory') &&
        (e.code === 'Enter' || e.code === 'Space')
      ) {
        e.preventDefault();
        if (phaseRef.current === 'victory') {
          loadStage(0, createInitialRpgStats(), 'playing');
        } else {
          handleRestartStage();
        }
        return;
      }

      if (phaseRef.current !== 'playing') return;

      const isJumpKey =
        e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space';
      const isCastKey = e.code === 'KeyF' || e.code === 'KeyJ';
      const isPotionKey = e.code === 'KeyQ' || e.code === 'KeyE';
      const isMoveKey =
        e.code === 'KeyA' ||
        e.code === 'KeyD' ||
        e.code === 'KeyS' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'ArrowDown';

      if (isJumpKey || isCastKey || isPotionKey || isMoveKey) {
        e.preventDefault();
      }

      if (isJumpKey && !e.repeat && !keysHeldRef.current.has(e.code)) {
        jumpQueuedRef.current = true;
      }
      if (isCastKey && !e.repeat) {
        castQueuedRef.current = true;
      }
      if (isPotionKey && !e.repeat) {
        potionQueuedRef.current = true;
      }
      keysHeldRef.current.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.code);
    };

    const clearInputs = () => {
      keysHeldRef.current.clear();
      touchStateRef.current = {
        left: false,
        right: false,
        down: false,
        jump: false,
      };
    };

    const onVisChange = () => {
      if (document.hidden) clearInputs();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [
    handleCloseStages,
    handleNextStage,
    handleRestartStage,
    handleStartFromTitle,
    handleToggleFullscreen,
    handleToggleMute,
    handleTogglePause,
    loadStage,
  ]);

  // Single Mounted Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(320, Math.round(rect.width * dpr));
      const targetH = Math.max(240, Math.round(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);

    let rafId = 0;
    let lastTime = performance.now();
    let lastHudSignature = '';
    let lastStaticRenderKey = '';

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const world = worldRef.current;
      const currentPhase = phaseRef.current;

      if (currentPhase === 'playing') {
        lastStaticRenderKey = '';
        const held = keysHeldRef.current;
        const touch = touchStateRef.current;
        const input: InputState = {
          left: held.has('KeyA') || held.has('ArrowLeft') || touch.left,
          right: held.has('KeyD') || held.has('ArrowRight') || touch.right,
          jumpHeld:
            held.has('KeyW') ||
            held.has('ArrowUp') ||
            held.has('Space') ||
            touch.jump,
          jumpJustPressed: jumpQueuedRef.current,
          down: held.has('KeyS') || held.has('ArrowDown') || touch.down,
          castJustPressed: castQueuedRef.current,
          potionJustPressed: potionQueuedRef.current,
        };
        jumpQueuedRef.current = false;
        castQueuedRef.current = false;
        potionQueuedRef.current = false;

        const events = stepWorld(world, input, rawDt);

        if (events.jumped) soundEngine.play('jump');
        if (events.landed) soundEngine.play('land');
        if (events.coin) soundEngine.play('coin');
        if (events.xp) soundEngine.play('xp');
        if (events.stomp) soundEngine.play('stomp');
        if (events.bolt) soundEngine.play('bolt');
        if (events.chest) soundEngine.play('chest');
        if (events.potion) soundEngine.play('potion');
        if (events.hurt) soundEngine.play('hurt');
        if (events.levelUp) soundEngine.play('level_up');

        if (events.stageClear) {
          soundEngine.play('stage_clear');
          const idx = world.stage.index;
          const isFinal = idx === STAGES.length - 1;
          const nextUnlocked = Math.min(
            STAGES.length - 1,
            Math.max(highestReachedStageRef.current, isFinal ? idx : idx + 1)
          );
          highestReachedStageRef.current = nextUnlocked;
          setHighestReachedStage(nextUnlocked);
          setRecords((prevRecs) => {
            const old = prevRecs[idx];
            const nextRecs: Record<number, StageRecord> = {
              ...prevRecs,
              [idx]: {
                cleared: true,
                bestTime:
                  old?.bestTime != null
                    ? Math.min(old.bestTime, world.elapsedSeconds)
                    : world.elapsedSeconds,
                bestGold: Math.max(old?.bestGold ?? 0, world.stats.gold),
              },
            };
            saveProgress({ highestReachedStage: nextUnlocked, records: nextRecs });
            return nextRecs;
          });
          setGamePhase(isFinal ? 'victory' : 'stage_clear');
        } else if (events.defeat) {
          soundEngine.play('defeat');
          setGamePhase('gameover');
        }

        // Throttled discrete HUD snapshot sync
        const boss = world.enemies.find(
          (e) => e.type === 'warden' && e.state !== 'ko'
        );
        const sig = `${world.stage.index}|${world.stats.hp}/${world.stats.maxHp}|${world.stats.level}|${world.stats.xp}|${world.stats.gold}|${world.stats.potions}|${world.stats.relics.length}|${Math.floor(world.elapsedSeconds)}|${boss ? boss.hp : -1}|${world.bannerText ?? ''}`;
        if (sig !== lastHudSignature) {
          lastHudSignature = sig;
          setHud(makeHudSnapshot(world, phaseRef.current));
        }

        renderWorld(
          ctx,
          world,
          canvas.width,
          canvas.height,
          now / 1000,
          false
        );
      } else {
        const staticKey = `${currentPhase}|${world.stage.index}|${canvas.width}x${canvas.height}`;
        if (staticKey !== lastStaticRenderKey) {
          lastStaticRenderKey = staticKey;
          renderWorld(
            ctx,
            world,
            canvas.width,
            canvas.height,
            now / 1000,
            currentPhase === 'title'
          );
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [setGamePhase]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d131a]">
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="block w-full h-full"
      />

      {phase === 'title' && (
        <TitleOverlay
          highestReachedStage={highestReachedStage}
          isFullscreen={isFullscreen}
          onStart={handleStartFromTitle}
          onOpenStages={handleOpenStages}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {phase !== 'title' && (
        <GameHud
          hud={hud}
          muted={muted}
          isFullscreen={isFullscreen}
          isTouchDevice={isTouchDevice}
          onUsePotion={handleUsePotion}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={handleToggleFullscreen}
          onPause={handleTogglePause}
          onRestart={handleRestartStage}
          onOpenStages={handleOpenStages}
          onJoystickChange={handleJoystickChange}
          onTouchAction={handleTouchAction}
        />
      )}

      {!stageModalOpen && (
        <GameModal
          phase={phase}
          hud={hud}
          onResume={handleTogglePause}
          onNextStage={handleNextStage}
          onRetry={
            phase === 'victory'
              ? () => loadStage(0, createInitialRpgStats(), 'playing')
              : handleRestartStage
          }
          onOpenStages={handleOpenStages}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {stageModalOpen && (
        <StageSelectModal
          currentStageIndex={hud.stageIndex}
          highestReachedStage={highestReachedStage}
          records={records}
          onSelectStage={handleSelectStage}
          onClose={handleCloseStages}
        />
      )}
    </main>
  );
}
