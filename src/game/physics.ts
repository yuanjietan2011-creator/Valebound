import { GRID_ROWS, isOneWayChar, isSolidChar, TILE_SIZE } from './levels';
import {
  applyDamageToStats,
  getBoltDamage,
  getMoveSpeed,
  getStompDamage,
  grantRelic,
  grantXp,
  usePotion,
} from './rpg';
import type {
  CrumbleTileState,
  EnemyEntity,
  EnemySpawn,
  FloatingText,
  InputState,
  MovingPlatformEntity,
  ParticleSlot,
  PickupEntity,
  PlayerEntity,
  ProjectileEntity,
  RpgStats,
  StageDefinition,
} from './types';

export const GRAVITY = 1440;
export const JUMP_VELOCITY = -630;
export const MAX_FALL_SPEED = 780;
export const COYOTE_TIME = 0.12;
export const JUMP_BUFFER_TIME = 0.14;
export const CAST_COOLDOWN = 0.36;
export const MAX_BOLT_AMMO = 5;
export const BOLT_RELOAD_TIME = 1.35;

export interface SimulationEvents {
  jumped?: boolean;
  landed?: boolean;
  stomp?: boolean;
  bolt?: boolean;
  reloaded?: boolean;
  emptyClick?: boolean;
  coin?: boolean;
  xp?: boolean;
  chest?: boolean;
  potion?: boolean;
  hurt?: boolean;
  levelUp?: boolean;
  stageClear?: boolean;
  defeat?: boolean;
}

export interface WorldState {
  stage: StageDefinition;
  grid: string[][];
  cols: number;
  player: PlayerEntity;
  stats: RpgStats;
  enemies: EnemyEntity[];
  pickups: PickupEntity[];
  projectiles: ProjectileEntity[];
  movingPlatforms: MovingPlatformEntity[];
  crumbles: Map<string, CrumbleTileState>;
  floatingTexts: FloatingText[];
  particles: ParticleSlot[];
  particleCursor: number;
  hitstopTimer: number;
  cameraX: number;
  elapsedSeconds: number;
  stageCleared: boolean;
  defeated: boolean;
  bannerText: string | null;
  bannerTimer: number;
  uidCounter: number;
}

const BOSS_VARIANTS: Array<{
  variant: 'ash_warden' | 'frost_monarch' | 'brass_titan';
  name: string;
  hpFinal: number;
  hpMid: number;
}> = [
  { variant: 'ash_warden', name: 'The Ash Warden', hpFinal: 44, hpMid: 22 },
  { variant: 'frost_monarch', name: 'The Frost Monarch', hpFinal: 42, hpMid: 20 },
  { variant: 'brass_titan', name: 'The Brass Titan', hpFinal: 48, hpMid: 24 },
];

export function createEnemyFromSpawn(
  spawn: EnemySpawn,
  stageIndex = 0
): EnemyEntity {
  const x = spawn.tileX * TILE_SIZE;
  const y = spawn.tileY * TILE_SIZE;
  const minX = (spawn.patrolMinX ?? Math.max(1, spawn.tileX - 3)) * TILE_SIZE;
  const maxX = (spawn.patrolMaxX ?? spawn.tileX + 3) * TILE_SIZE;

  switch (spawn.type) {
    case 'slime':
      return {
        id: spawn.id,
        type: 'slime',
        x,
        y: y + 10,
        w: 26,
        h: 22,
        vx: -52,
        vy: 0,
        facing: -1,
        hp: 2,
        maxHp: 2,
        xpReward: 12,
        goldReward: 5,
        contactDamage: 1,
        patrolMinX: minX,
        patrolMaxX: maxX,
        anchorY: y + 10,
        state: 'patrol',
        stateTimer: 0,
        hurtFlashTimer: 0,
        koTimer: 0,
        grounded: true,
        phase: 0,
      };
    case 'hopper':
      return {
        id: spawn.id,
        type: 'hopper',
        x,
        y: y + 6,
        w: 26,
        h: 26,
        vx: -48,
        vy: 0,
        facing: -1,
        hp: 3,
        maxHp: 3,
        xpReward: 18,
        goldReward: 8,
        contactDamage: 1,
        patrolMinX: minX,
        patrolMaxX: maxX,
        anchorY: y + 6,
        state: 'patrol',
        stateTimer: 1.1,
        hurtFlashTimer: 0,
        koTimer: 0,
        grounded: true,
        phase: 0,
      };
    case 'wisp':
      return {
        id: spawn.id,
        type: 'wisp',
        x,
        y,
        w: 24,
        h: 24,
        vx: 38,
        vy: 0,
        facing: -1,
        hp: 3,
        maxHp: 3,
        xpReward: 22,
        goldReward: 10,
        contactDamage: 1,
        patrolMinX: minX,
        patrolMaxX: maxX,
        anchorY: y,
        state: 'patrol',
        stateTimer: 1.5,
        hurtFlashTimer: 0,
        koTimer: 0,
        grounded: false,
        phase: 0,
      };
    case 'sentinel':
      return {
        id: spawn.id,
        type: 'sentinel',
        x,
        y: y + 2,
        w: 28,
        h: 30,
        vx: -46,
        vy: 0,
        facing: -1,
        hp: 5,
        maxHp: 5,
        xpReward: 28,
        goldReward: 14,
        contactDamage: 2,
        patrolMinX: minX,
        patrolMaxX: maxX,
        anchorY: y + 2,
        state: 'patrol',
        stateTimer: 0.6,
        hurtFlashTimer: 0,
        koTimer: 0,
        grounded: true,
        phase: 0,
      };
    case 'warden': {
      const pick =
        BOSS_VARIANTS[Math.floor(Math.random() * BOSS_VARIANTS.length)];
      const isFinal = stageIndex >= 9;
      const bossHp = isFinal ? pick.hpFinal : pick.hpMid;
      return {
        id: spawn.id,
        type: 'warden',
        x,
        y: y - 16,
        w: 44,
        h: 48,
        vx: -60,
        vy: 0,
        facing: -1,
        hp: bossHp,
        maxHp: bossHp,
        xpReward: isFinal ? 180 : 85,
        goldReward: isFinal ? 120 : 50,
        contactDamage: 1,
        patrolMinX: minX,
        patrolMaxX: maxX,
        anchorY: y - 16,
        state: 'patrol',
        stateTimer: 1.0,
        hurtFlashTimer: 0,
        koTimer: 0,
        grounded: true,
        phase: 1,
        bossVariant: pick.variant,
        bossName: isFinal ? pick.name : `${pick.name} (Vanguard)`,
        bossAttack: 'volley',
      };
    }
  }
}

export function createWorld(stage: StageDefinition, stats: RpgStats): WorldState {
  const grid = stage.grid.map((row) => row.split(''));
  const cols = grid[0]?.length ?? 0;

  const crumbles = new Map<string, CrumbleTileState>();
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '~') {
        const key = `${c},${r}`;
        crumbles.set(key, { key, col: c, row: r, state: 'solid', timer: 0 });
      }
    }
  }

  const player: PlayerEntity = {
    x: stage.spawnTile.x * TILE_SIZE + 4,
    y: stage.spawnTile.y * TILE_SIZE + 2,
    w: 22,
    h: 30,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    onPlatformId: null,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    invulnTimer: 0,
    hurtFlashTimer: 0,
    castCooldown: 0,
    walkDistance: 0,
    crouching: false,
    lastSafeX: stage.spawnTile.x * TILE_SIZE + 4,
    lastSafeY: stage.spawnTile.y * TILE_SIZE + 2,
    boltAmmo: MAX_BOLT_AMMO,
    reloadTimer: 0,
  };

  const particles: ParticleSlot[] = Array.from({ length: 96 }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 2,
    color: '#ffffff',
    life: 0,
    maxLife: 0.3,
  }));

  const movingPlatforms: MovingPlatformEntity[] = stage.movingPlatforms.map((mp) => ({
    id: mp.id,
    x: mp.tileX * TILE_SIZE,
    y: mp.tileY * TILE_SIZE,
    w: mp.widthTiles * TILE_SIZE,
    h: 14,
    originX: mp.tileX * TILE_SIZE,
    originY: mp.tileY * TILE_SIZE,
    rangeX: mp.rangeX,
    rangeY: mp.rangeY,
    speed: mp.speed,
    t: 0,
    dx: 0,
    dy: 0,
  }));

  const pickups: PickupEntity[] = stage.pickups.map((p, idx) => ({
    id: p.id,
    kind: p.kind,
    relicId: p.relicId,
    x: p.tileX * TILE_SIZE + 6,
    y: p.tileY * TILE_SIZE + 6,
    w: 20,
    h: 20,
    vy: 0,
    bobOffset: idx * 0.6,
    collected: false,
    fromChest: false,
  }));

  return {
    stage,
    grid,
    cols,
    player,
    stats: { ...stats, relics: [...stats.relics] },
    enemies: stage.enemies.map((sp) => createEnemyFromSpawn(sp, stage.index)),
    pickups,
    projectiles: [],
    movingPlatforms,
    crumbles,
    floatingTexts: [],
    particles,
    particleCursor: 0,
    hitstopTimer: 0,
    cameraX: 0,
    elapsedSeconds: 0,
    stageCleared: false,
    defeated: false,
    bannerText: `Stage ${stage.index + 1}: ${stage.name}`,
    bannerTimer: 2.2,
    uidCounter: 1,
  };
}

function spawnParticle(
  world: WorldState,
  x: number,
  y: number,
  vx: number,
  vy: number,
  color: string,
  size = 3,
  maxLife = 0.28
) {
  const slot = world.particles[world.particleCursor];
  slot.active = true;
  slot.x = x;
  slot.y = y;
  slot.vx = vx;
  slot.vy = vy;
  slot.size = size;
  slot.color = color;
  slot.life = maxLife;
  slot.maxLife = maxLife;
  world.particleCursor = (world.particleCursor + 1) % world.particles.length;
}

function addFloatingText(
  world: WorldState,
  x: number,
  y: number,
  text: string,
  color: string
) {
  world.floatingTexts.push({
    x,
    y,
    vy: -32,
    text,
    color,
    life: 0.75,
    maxLife: 0.75,
  });
}

function aabbOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function tileAt(world: WorldState, col: number, row: number): string {
  if (col < 0 || col >= world.cols) return '#';
  if (row < 0) return '.';
  if (row >= GRID_ROWS) return '.';
  const ch = world.grid[row][col];
  if (ch === '~') {
    const cr = world.crumbles.get(`${col},${row}`);
    if (cr && cr.state === 'gone') return '.';
  }
  return ch;
}

function isTileSolidForBody(world: WorldState, col: number, row: number): boolean {
  return isSolidChar(tileAt(world, col, row));
}

function isTilePlatformTop(world: WorldState, col: number, row: number): boolean {
  const ch = tileAt(world, col, row);
  return isOneWayChar(ch) || ch === '~';
}

function triggerBlockBump(
  world: WorldState,
  col: number,
  row: number,
  events: SimulationEvents
) {
  const ch = tileAt(world, col, row);
  if (ch === '?') {
    world.grid[row][col] = 'U';
    const key = `${col},${row}`;
    const reward = world.stage.chestRewards[key] ?? 'xp_gem';
    const relicId = world.stage.chestRelics?.[key];
    world.uidCounter += 1;
    world.pickups.push({
      id: `chest_pk_${world.uidCounter}`,
      kind: reward,
      relicId,
      x: col * TILE_SIZE + 6,
      y: (row - 1) * TILE_SIZE + 4,
      w: 20,
      h: 20,
      vy: -150,
      bobOffset: 0,
      collected: false,
      fromChest: true,
    });
    events.chest = true;
    for (let i = 0; i < 4; i++) {
      spawnParticle(
        world,
        col * TILE_SIZE + 16,
        row * TILE_SIZE,
        (i - 1.5) * 45,
        -90 - i * 15,
        '#fbbf24',
        3,
        0.3
      );
    }
  } else if (ch === 'B' && world.stats.level >= 2) {
    // At Lv 2+, strong head-butt shatters bricks for +2 gold
    world.grid[row][col] = '.';
    world.stats = { ...world.stats, gold: world.stats.gold + 2 };
    addFloatingText(world, col * TILE_SIZE + 16, row * TILE_SIZE, '+2g', '#fbbf24');
    events.chest = true;
    for (let i = 0; i < 4; i++) {
      spawnParticle(
        world,
        col * TILE_SIZE + 16,
        row * TILE_SIZE + 16,
        (i - 1.5) * 60,
        -110,
        world.stage.palette.brickFill,
        4,
        0.32
      );
    }
  }
}

function hurtPlayer(
  world: WorldState,
  rawDamage: number,
  knockDir: number,
  events: SimulationEvents
) {
  if (world.player.invulnTimer > 0 || world.stageCleared || world.defeated) return;
  const res = applyDamageToStats(world.stats, rawDamage);
  world.stats = res.stats;
  world.player.invulnTimer = 1.05;
  world.player.hurtFlashTimer = 0.08;
  world.player.vy = -260;
  world.player.vx = knockDir * 180;
  world.hitstopTimer = 0.045;
  events.hurt = true;

  addFloatingText(
    world,
    world.player.x + world.player.w / 2,
    world.player.y - 6,
    `-${res.actualDamage} HP`,
    '#fb7185'
  );

  for (let i = 0; i < 6; i++) {
    spawnParticle(
      world,
      world.player.x + world.player.w / 2,
      world.player.y + world.player.h / 2,
      (Math.random() - 0.5) * 180,
      -80 - Math.random() * 90,
      '#fda4af',
      3,
      0.32
    );
  }

  if (res.defeated) {
    world.defeated = true;
    events.defeat = true;
  }
}

function defeatEnemy(
  world: WorldState,
  enemy: EnemyEntity,
  events: SimulationEvents
) {
  enemy.state = 'ko';
  enemy.koTimer = 0.35;
  enemy.vy = -160;
  enemy.vx = 0;
  world.hitstopTimer = 0.04;

  const xpRes = grantXp(world.stats, enemy.xpReward);
  world.stats = {
    ...xpRes.stats,
    gold: xpRes.stats.gold + enemy.goldReward,
    enemiesDefeated: xpRes.stats.enemiesDefeated + 1,
  };

  addFloatingText(
    world,
    enemy.x + enemy.w / 2,
    enemy.y - 6,
    `+${enemy.xpReward} XP`,
    '#7dd3fc'
  );

  if (xpRes.leveledUp) {
    events.levelUp = true;
    world.bannerText = `Level ${world.stats.level} Reached!`;
    world.bannerTimer = 2.0;
    addFloatingText(
      world,
      world.player.x + world.player.w / 2,
      world.player.y - 20,
      `LEVEL ${world.stats.level}!`,
      '#fde047'
    );
  }

  for (let i = 0; i < 6; i++) {
    spawnParticle(
      world,
      enemy.x + enemy.w / 2,
      enemy.y + enemy.h / 2,
      (Math.random() - 0.5) * 160,
      -90 - Math.random() * 80,
      '#fde047',
      3,
      0.3
    );
  }
}

export function stepWorld(
  world: WorldState,
  input: InputState,
  rawDt: number
): SimulationEvents {
  const events: SimulationEvents = {};
  const dt = Math.min(Math.max(rawDt, 0), 0.05);

  if (world.stageCleared || world.defeated) {
    return events;
  }

  // Update visual timers even during hitstop
  if (world.bannerTimer > 0) {
    world.bannerTimer = Math.max(0, world.bannerTimer - dt);
    if (world.bannerTimer === 0) world.bannerText = null;
  }

  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) world.floatingTexts.splice(i, 1);
  }

  for (let i = 0; i < world.particles.length; i++) {
    const pt = world.particles[i];
    if (!pt.active) continue;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 320 * dt;
    pt.life -= dt;
    if (pt.life <= 0) pt.active = false;
  }

  if (world.hitstopTimer > 0) {
    world.hitstopTimer = Math.max(0, world.hitstopTimer - dt);
    return events;
  }

  world.elapsedSeconds += dt;

  // 1. Update Moving Platforms
  for (const mp of world.movingPlatforms) {
    const prevX = mp.x;
    const prevY = mp.y;
    mp.t += dt * mp.speed;
    const wave = (Math.sin(mp.t) + 1) * 0.5; // 0..1
    mp.x = mp.originX + mp.rangeX * wave;
    mp.y = mp.originY + mp.rangeY * wave;
    mp.dx = mp.x - prevX;
    mp.dy = mp.y - prevY;
  }

  // 2. Update Crumbling Tiles
  for (const cr of world.crumbles.values()) {
    if (cr.state === 'shaking') {
      cr.timer -= dt;
      if (cr.timer <= 0) {
        cr.state = 'gone';
        cr.timer = 2.6; // respawns after 2.6s
      }
    } else if (cr.state === 'gone') {
      cr.timer -= dt;
      if (cr.timer <= 0) {
        cr.state = 'solid';
        cr.timer = 0;
      }
    }
  }

  // 3. Potion use
  if (input.potionJustPressed) {
    const healRes = usePotion(world.stats);
    if (healRes.used) {
      world.stats = healRes.stats;
      events.potion = true;
      addFloatingText(
        world,
        world.player.x + world.player.w / 2,
        world.player.y - 10,
        `+${healRes.healed} HP`,
        '#4ade80'
      );
    }
  }

  // 4. Player Movement & Physics
  const p = world.player;
  if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  if (p.hurtFlashTimer > 0) p.hurtFlashTimer = Math.max(0, p.hurtFlashTimer - dt);
  if (p.castCooldown > 0) p.castCooldown = Math.max(0, p.castCooldown - dt);

  if (p.reloadTimer > 0) {
    p.reloadTimer = Math.max(0, p.reloadTimer - dt);
    if (p.reloadTimer === 0) {
      p.boltAmmo = MAX_BOLT_AMMO;
      events.reloaded = true;
      addFloatingText(
        world,
        p.x + p.w / 2,
        p.y - 10,
        'Reloaded!',
        '#fde047'
      );
    }
  } else if (input.reloadJustPressed && p.boltAmmo < MAX_BOLT_AMMO) {
    p.reloadTimer = BOLT_RELOAD_TIME;
    addFloatingText(
      world,
      p.x + p.w / 2,
      p.y - 10,
      'Reloading...',
      '#fbbf24'
    );
  }

  // Carry by moving platform
  if (p.grounded && p.onPlatformId) {
    const mp = world.movingPlatforms.find((m) => m.id === p.onPlatformId);
    if (mp) {
      p.x += mp.dx;
      p.y += mp.dy;
    }
  }

  const moveSpeed = getMoveSpeed(world.stats);
  let targetVx = 0;
  if (input.left && !input.right) {
    targetVx = -moveSpeed;
    p.facing = -1;
  } else if (input.right && !input.left) {
    targetVx = moveSpeed;
    p.facing = 1;
  }

  const accel = p.grounded ? 1900 : 1250;
  if (p.vx < targetVx) {
    p.vx = Math.min(targetVx, p.vx + accel * dt);
  } else if (p.vx > targetVx) {
    p.vx = Math.max(targetVx, p.vx - accel * dt);
  }

  p.crouching = p.grounded && input.down;

  // Coyote & Jump Buffer
  if (p.grounded) {
    p.coyoteTimer = COYOTE_TIME;
  } else {
    p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
  }

  if (input.jumpJustPressed) {
    p.jumpBufferTimer = JUMP_BUFFER_TIME;
  } else {
    p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
  }

  if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
    p.vy = JUMP_VELOCITY;
    p.grounded = false;
    p.onPlatformId = null;
    p.coyoteTimer = 0;
    p.jumpBufferTimer = 0;
    events.jumped = true;
    for (let i = 0; i < 3; i++) {
      spawnParticle(
        world,
        p.x + p.w / 2,
        p.y + p.h,
        (i - 1) * 35,
        -25,
        '#cbd5e1',
        2,
        0.2
      );
    }
  }

  // Cast Lantern Bolt (5-bullet magazine + reload)
  if (input.castJustPressed && p.castCooldown <= 0) {
    if (p.reloadTimer <= 0 && p.boltAmmo > 0) {
      p.castCooldown = CAST_COOLDOWN;
      p.boltAmmo -= 1;
      world.uidCounter += 1;
      world.projectiles.push({
        id: `bolt_${world.uidCounter}`,
        fromPlayer: true,
        x: p.x + (p.facing === 1 ? p.w + 2 : -2),
        y: p.y + 13,
        vx: p.facing * 420,
        vy: 0,
        radius: 5,
        damage: getBoltDamage(world.stats),
        ttl: 0.72,
        alive: true,
      });
      events.bolt = true;
      if (p.boltAmmo <= 0) {
        p.boltAmmo = 0;
        p.reloadTimer = BOLT_RELOAD_TIME;
        addFloatingText(
          world,
          p.x + p.w / 2,
          p.y - 10,
          'Reloading...',
          '#fbbf24'
        );
      }
    } else {
      if (p.boltAmmo <= 0 && p.reloadTimer <= 0) {
        p.reloadTimer = BOLT_RELOAD_TIME;
      }
      events.emptyClick = true;
    }
  }

  // Apply gravity (variable jump release + fast-fall if holding down)
  let gravScale = 1;
  if (!p.grounded && p.vy < 0 && !input.jumpHeld) {
    gravScale = 1.65;
  } else if (!p.grounded && input.down && p.vy > 0) {
    gravScale = 1.45;
  }
  p.vy = Math.min(MAX_FALL_SPEED, p.vy + GRAVITY * gravScale * dt);

  // Horizontal integration & tile collision
  const prevX = p.x;
  p.x += p.vx * dt;
  p.x = Math.max(0, Math.min(world.cols * TILE_SIZE - p.w, p.x));
  if (p.grounded && Math.abs(p.x - prevX) > 0.1) {
    p.walkDistance += Math.abs(p.x - prevX);
  }

  const topRowX = Math.floor((p.y + 3) / TILE_SIZE);
  const botRowX = Math.floor((p.y + p.h - 3) / TILE_SIZE);
  if (p.vx > 0) {
    const rightCol = Math.floor((p.x + p.w) / TILE_SIZE);
    for (let r = topRowX; r <= botRowX; r++) {
      if (isTileSolidForBody(world, rightCol, r)) {
        p.x = rightCol * TILE_SIZE - p.w - 0.01;
        p.vx = 0;
        break;
      }
    }
  } else if (p.vx < 0) {
    const leftCol = Math.floor(p.x / TILE_SIZE);
    for (let r = topRowX; r <= botRowX; r++) {
      if (isTileSolidForBody(world, leftCol, r)) {
        p.x = (leftCol + 1) * TILE_SIZE + 0.01;
        p.vx = 0;
        break;
      }
    }
  }

  // Vertical integration & collision
  const prevY = p.y;
  const wasGrounded = p.grounded;
  p.y += p.vy * dt;
  p.grounded = false;
  p.onPlatformId = null;

  const leftColY = Math.floor((p.x + 2) / TILE_SIZE);
  const rightColY = Math.floor((p.x + p.w - 2) / TILE_SIZE);

  if (p.vy >= 0) {
    const footRow = Math.floor((p.y + p.h) / TILE_SIZE);
    const prevFootRow = Math.floor((prevY + p.h - 1) / TILE_SIZE);
    for (let c = leftColY; c <= rightColY; c++) {
      const solid = isTileSolidForBody(world, c, footRow);
      const oneWay =
        isTilePlatformTop(world, c, footRow) && prevFootRow < footRow;
      if (solid || oneWay) {
        p.y = footRow * TILE_SIZE - p.h;
        if (!wasGrounded && p.vy > 180) {
          events.landed = true;
          spawnParticle(world, p.x + p.w / 2, p.y + p.h, -30, -20, '#cbd5e1', 2, 0.18);
          spawnParticle(world, p.x + p.w / 2, p.y + p.h, 30, -20, '#cbd5e1', 2, 0.18);
        }
        p.vy = 0;
        p.grounded = true;

        // Trigger crumble if standing on '~' or save safe respawn ledge
        const standTile = tileAt(world, c, footRow);
        if (standTile === '~') {
          const cr = world.crumbles.get(`${c},${footRow}`);
          if (cr && cr.state === 'solid') {
            cr.state = 'shaking';
            cr.timer = 0.45;
          }
        } else if (
          (standTile === '#' || standTile === 'S') &&
          tileAt(world, c, footRow - 1) !== '^'
        ) {
          p.lastSafeX = p.x;
          p.lastSafeY = p.y;
        }
        break;
      }
    }

    // Moving platforms (one-way top)
    if (!p.grounded) {
      for (const mp of world.movingPlatforms) {
        const horizOverlap = p.x + p.w > mp.x + 2 && p.x < mp.x + mp.w - 2;
        const prevFoot = prevY + p.h;
        const currFoot = p.y + p.h;
        if (horizOverlap && prevFoot <= mp.y + 8 && currFoot >= mp.y) {
          p.y = mp.y - p.h;
          p.vy = 0;
          p.grounded = true;
          p.onPlatformId = mp.id;
          break;
        }
      }
    }
  } else if (p.vy < 0) {
    const headRow = Math.floor(p.y / TILE_SIZE);
    for (let c = leftColY; c <= rightColY; c++) {
      if (isTileSolidForBody(world, c, headRow)) {
        p.y = (headRow + 1) * TILE_SIZE + 0.01;
        p.vy = 0;
        triggerBlockBump(world, c, headRow, events);
        break;
      }
    }
  }

  // Spike Hazard Check
  const bodyLeft = Math.floor((p.x + 4) / TILE_SIZE);
  const bodyRight = Math.floor((p.x + p.w - 4) / TILE_SIZE);
  const bodyTop = Math.floor((p.y + 4) / TILE_SIZE);
  const bodyBot = Math.floor((p.y + p.h - 2) / TILE_SIZE);
  for (let r = bodyTop; r <= bodyBot; r++) {
    for (let c = bodyLeft; c <= bodyRight; c++) {
      if (tileAt(world, c, r) === '^') {
        hurtPlayer(world, 1, p.facing * -1, events);
      }
    }
  }

  // Pit Fall Check (respawn on last safe ledge if HP > 0, or defeat)
  if (p.y > GRID_ROWS * TILE_SIZE + 28) {
    hurtPlayer(world, 1, 0, events);
    if (!world.defeated) {
      p.x = p.lastSafeX;
      p.y = p.lastSafeY;
      p.vx = 0;
      p.vy = 0;
    }
  }

  // 5. Pickups
  for (const pk of world.pickups) {
    if (pk.collected) continue;
    if (pk.fromChest && pk.y < (Math.floor(pk.y / TILE_SIZE) + 1) * TILE_SIZE) {
      pk.vy = Math.min(200, pk.vy + 500 * dt);
      pk.y += pk.vy * dt;
      const col = Math.floor((pk.x + pk.w / 2) / TILE_SIZE);
      const footRow = Math.floor((pk.y + pk.h) / TILE_SIZE);
      if (isTileSolidForBody(world, col, footRow) && pk.vy > 0) {
        pk.y = footRow * TILE_SIZE - pk.h;
        pk.vy = 0;
        pk.fromChest = false;
      }
    }

    if (aabbOverlap(p.x, p.y, p.w, p.h, pk.x, pk.y, pk.w, pk.h)) {
      pk.collected = true;
      if (pk.kind === 'coin') {
        world.stats = { ...world.stats, gold: world.stats.gold + 5 };
        const xpRes = grantXp(world.stats, 4);
        world.stats = xpRes.stats;
        events.coin = true;
        if (xpRes.leveledUp) events.levelUp = true;
        addFloatingText(world, pk.x + 10, pk.y - 4, '+5g', '#fbbf24');
      } else if (pk.kind === 'xp_gem') {
        const xpRes = grantXp(world.stats, 22);
        world.stats = xpRes.stats;
        events.xp = true;
        addFloatingText(world, pk.x + 10, pk.y - 4, '+22 XP', '#38bdf8');
        if (xpRes.leveledUp) {
          events.levelUp = true;
          world.bannerText = `Level ${world.stats.level} Reached!`;
          world.bannerTimer = 2.0;
        }
      } else if (pk.kind === 'potion') {
        world.stats = { ...world.stats, potions: world.stats.potions + 1 };
        events.potion = true;
        addFloatingText(world, pk.x + 10, pk.y - 4, '+1 Potion', '#4ade80');
      } else if (pk.kind === 'relic' && pk.relicId) {
        const relRes = grantRelic(world.stats, pk.relicId);
        world.stats = relRes.stats;
        events.levelUp = true;
        world.bannerText = relRes.isNew
          ? `Relic Found: ${pk.relicId.replace('_', ' ')}`
          : '+25 Gold';
        world.bannerTimer = 2.4;
      }
    }
  }

  // 6. Enemies (4+ distinct AI behaviors + Boss)
  for (let i = world.enemies.length - 1; i >= 0; i--) {
    const e = world.enemies[i];
    if (e.hurtFlashTimer > 0) e.hurtFlashTimer = Math.max(0, e.hurtFlashTimer - dt);

    if (e.state === 'ko') {
      e.koTimer -= dt;
      e.vy += 600 * dt;
      e.y += e.vy * dt;
      if (e.koTimer <= 0) {
        world.enemies.splice(i, 1);
      }
      continue;
    }

    const dxToPlayer = p.x + p.w / 2 - (e.x + e.w / 2);
    const dyToPlayer = p.y + p.h / 2 - (e.y + e.h / 2);
    const dist = Math.hypot(dxToPlayer, dyToPlayer);

    if (e.type === 'slime') {
      // Policy 1: Steady ledge patroller
      e.x += e.vx * dt;
      if (e.x <= e.patrolMinX) {
        e.x = e.patrolMinX;
        e.vx = Math.abs(e.vx);
        e.facing = 1;
      } else if (e.x + e.w >= e.patrolMaxX) {
        e.x = e.patrolMaxX - e.w;
        e.vx = -Math.abs(e.vx);
        e.facing = -1;
      }
    } else if (e.type === 'hopper') {
      // Policy 2: Periodic windup crouch -> directed leap
      if (e.state === 'patrol') {
        e.stateTimer -= dt;
        e.x += e.vx * 0.5 * dt;
        if (e.x <= e.patrolMinX) {
          e.x = e.patrolMinX;
          e.vx = Math.abs(e.vx);
        } else if (e.x + e.w >= e.patrolMaxX) {
          e.x = e.patrolMaxX - e.w;
          e.vx = -Math.abs(e.vx);
        }
        if (e.stateTimer <= 0 && dist < 280) {
          e.state = 'windup';
          e.stateTimer = 0.35;
          e.facing = dxToPlayer >= 0 ? 1 : -1;
        }
      } else if (e.state === 'windup') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'attack';
          e.vy = -340;
          e.vx = e.facing * 145;
          e.grounded = false;
        }
      } else if (e.state === 'attack') {
        e.vy = Math.min(MAX_FALL_SPEED, e.vy + GRAVITY * 0.85 * dt);
        e.x = Math.max(e.patrolMinX, Math.min(e.patrolMaxX - e.w, e.x + e.vx * dt));
        e.y += e.vy * dt;
        if (e.y >= e.anchorY) {
          e.y = e.anchorY;
          e.vy = 0;
          e.vx = e.facing * 45;
          e.grounded = true;
          e.state = 'patrol';
          e.stateTimer = 1.4;
        }
      }
    } else if (e.type === 'wisp') {
      // Policy 3: Hovering kiter that telegraphs & shoots ember orb
      e.phase += dt * 2.5;
      e.y = e.anchorY + Math.sin(e.phase) * 10;
      e.facing = dxToPlayer >= 0 ? 1 : -1;

      if (e.state === 'patrol') {
        e.x += e.vx * dt;
        if (e.x <= e.patrolMinX) {
          e.x = e.patrolMinX;
          e.vx = Math.abs(e.vx);
        } else if (e.x + e.w >= e.patrolMaxX) {
          e.x = e.patrolMaxX - e.w;
          e.vx = -Math.abs(e.vx);
        }
        e.stateTimer -= dt;
        if (e.stateTimer <= 0 && dist < 340) {
          e.state = 'windup';
          e.stateTimer = 0.55;
        }
      } else if (e.state === 'windup') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          const len = Math.max(1, dist);
          world.uidCounter += 1;
          world.projectiles.push({
            id: `ember_${world.uidCounter}`,
            fromPlayer: false,
            x: e.x + e.w / 2,
            y: e.y + e.h / 2,
            vx: (dxToPlayer / len) * 190,
            vy: (dyToPlayer / len) * 190,
            radius: 5,
            damage: 1,
            ttl: 2.0,
            alive: true,
          });
          e.state = 'patrol';
          e.stateTimer = 2.0;
        }
      }
    } else if (e.type === 'sentinel') {
      // Policy 4: Armored line-of-sight charger
      if (e.state === 'patrol') {
        e.x += e.vx * dt;
        if (e.x <= e.patrolMinX) {
          e.x = e.patrolMinX;
          e.vx = Math.abs(e.vx);
          e.facing = 1;
        } else if (e.x + e.w >= e.patrolMaxX) {
          e.x = e.patrolMaxX - e.w;
          e.vx = -Math.abs(e.vx);
          e.facing = -1;
        }
        e.stateTimer = Math.max(0, e.stateTimer - dt);
        if (
          e.stateTimer === 0 &&
          Math.abs(dyToPlayer) < 42 &&
          dist < 240
        ) {
          e.state = 'windup';
          e.stateTimer = 0.42;
          e.facing = dxToPlayer >= 0 ? 1 : -1;
        }
      } else if (e.state === 'windup') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'attack';
          e.stateTimer = 0.65;
          e.vx = e.facing * 205;
        }
      } else if (e.state === 'attack') {
        e.stateTimer -= dt;
        e.x = Math.max(e.patrolMinX, Math.min(e.patrolMaxX - e.w, e.x + e.vx * dt));
        if (e.stateTimer <= 0) {
          e.state = 'recover';
          e.stateTimer = 0.55;
          e.vx = 0;
        }
      } else if (e.state === 'recover') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'patrol';
          e.stateTimer = 0.9;
          e.vx = e.facing * 46;
        }
      }
    } else if (e.type === 'warden') {
      // Policy 5: Randomized Multi-Attack Boss (leap slam, targeted volley, telegraphed charge)
      e.phase = e.hp <= e.maxHp / 2 ? 2 : 1;
      const speedMult = e.phase === 2 ? 1.22 : 1.0;

      if (e.state === 'patrol') {
        e.facing = dxToPlayer >= 0 ? 1 : -1;
        e.x = Math.max(
          e.patrolMinX,
          Math.min(e.patrolMaxX - e.w, e.x + e.facing * 68 * speedMult * dt)
        );
        e.stateTimer -= dt;
        if (e.stateTimer <= 0 && dist < 480) {
          const attacks: Array<'leap_slam' | 'volley' | 'charge'> = [
            'leap_slam',
            'volley',
            'charge',
          ];
          e.bossAttack = attacks[Math.floor(Math.random() * attacks.length)];
          e.state = 'windup';
          e.stateTimer = 0.58;
        }
      } else if (e.state === 'windup') {
        e.facing = dxToPlayer >= 0 ? 1 : -1;
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          if (e.bossAttack === 'leap_slam') {
            e.state = 'attack';
            e.vy = -410;
            e.vx = e.facing * 195 * speedMult;
            e.grounded = false;
          } else if (e.bossAttack === 'charge') {
            e.state = 'attack';
            e.stateTimer = 0.62;
            e.vx = e.facing * 245 * speedMult;
            e.vy = 0;
            e.grounded = true;
          } else {
            // Aimed Volley (2 bolts in Phase 1, 3 bolts in Phase 2) at manageable speed
            const len = Math.max(1, dist);
            const baseVx = (dxToPlayer / len) * 195 * speedMult;
            const baseVy = (dyToPlayer / len) * 195 * speedMult;
            const offsets = e.phase === 2 ? [-38, 0, 38] : [-22, 22];
            for (const oy of offsets) {
              world.uidCounter += 1;
              world.projectiles.push({
                id: `boss_orb_${world.uidCounter}`,
                fromPlayer: false,
                x: e.x + e.w / 2,
                y: e.y + 18,
                vx: baseVx,
                vy: baseVy + oy,
                radius: 6,
                damage: 1,
                ttl: 2.3,
                alive: true,
              });
            }
            e.state = 'recover';
            e.stateTimer = 0.85;
          }
        }
      } else if (e.state === 'attack') {
        if (e.bossAttack === 'charge') {
          e.stateTimer -= dt;
          e.x = Math.max(
            e.patrolMinX,
            Math.min(e.patrolMaxX - e.w, e.x + e.vx * dt)
          );
          if (e.stateTimer <= 0) {
            e.vx = 0;
            e.state = 'recover';
            e.stateTimer = 0.85;
          }
        } else {
          // Leap slam arc
          e.vy = Math.min(MAX_FALL_SPEED, e.vy + GRAVITY * 0.9 * dt);
          e.x = Math.max(
            e.patrolMinX,
            Math.min(e.patrolMaxX - e.w, e.x + e.vx * dt)
          );
          e.y += e.vy * dt;
          if (e.y >= e.anchorY) {
            e.y = e.anchorY;
            e.vy = 0;
            e.vx = 0;
            e.grounded = true;
            // Ground shockwave orbs on landing
            for (const dir of [-1, 1] as const) {
              world.uidCounter += 1;
              world.projectiles.push({
                id: `boss_wave_${world.uidCounter}`,
                fromPlayer: false,
                x: e.x + e.w / 2,
                y: e.y + e.h - 10,
                vx: dir * 185 * speedMult,
                vy: 0,
                radius: 5,
                damage: 1,
                ttl: 1.5,
                alive: true,
              });
            }
            e.state = 'recover';
            e.stateTimer = 0.85;
          }
        }
      } else if (e.state === 'recover') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'patrol';
          e.stateTimer = e.phase === 2 ? 0.8 : 1.15;
        }
      }
    }

    // Player <-> Enemy collision (Stomp vs Contact Damage)
    if (aabbOverlap(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
      const playerBottomPrev = prevY + p.h;
      const isStomp = p.vy > 20 && playerBottomPrev <= e.y + e.h * 0.55;
      if (isStomp) {
        const dmg = getStompDamage(world.stats);
        e.hp -= dmg;
        e.hurtFlashTimer = 0.08;
        p.vy = -370;
        p.grounded = false;
        events.stomp = true;
        addFloatingText(
          world,
          e.x + e.w / 2,
          e.y - 6,
          `-${dmg}`,
          '#fde047'
        );
        if (e.hp <= 0) {
          defeatEnemy(world, e, events);
        }
      } else {
        const knockDir = p.x + p.w / 2 < e.x + e.w / 2 ? -1 : 1;
        hurtPlayer(world, e.contactDamage, knockDir, events);
      }
    }
  }

  // 7. Projectiles
  for (let i = world.projectiles.length - 1; i >= 0; i--) {
    const pr = world.projectiles[i];
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.ttl -= dt;

    if (pr.ttl <= 0) {
      world.projectiles.splice(i, 1);
      continue;
    }

    const pCol = Math.floor(pr.x / TILE_SIZE);
    const pRow = Math.floor(pr.y / TILE_SIZE);
    if (isTileSolidForBody(world, pCol, pRow)) {
      spawnParticle(
        world,
        pr.x,
        pr.y,
        -pr.vx * 0.15,
        -40,
        pr.fromPlayer ? '#fbbf24' : '#fb7185',
        3,
        0.2
      );
      world.projectiles.splice(i, 1);
      continue;
    }

    if (pr.fromPlayer) {
      let hit = false;
      for (const e of world.enemies) {
        if (e.state === 'ko') continue;
        if (
          aabbOverlap(
            pr.x - pr.radius,
            pr.y - pr.radius,
            pr.radius * 2,
            pr.radius * 2,
            e.x,
            e.y,
            e.w,
            e.h
          )
        ) {
          e.hp -= pr.damage;
          e.hurtFlashTimer = 0.07;
          events.stomp = true;
          addFloatingText(world, e.x + e.w / 2, e.y - 6, `-${pr.damage}`, '#fde047');
          if (e.hp <= 0) {
            defeatEnemy(world, e, events);
          }
          hit = true;
          break;
        }
      }
      if (hit) {
        world.projectiles.splice(i, 1);
      }
    } else {
      if (
        aabbOverlap(
          pr.x - pr.radius,
          pr.y - pr.radius,
          pr.radius * 2,
          pr.radius * 2,
          p.x,
          p.y,
          p.w,
          p.h
        )
      ) {
        const knockDir = pr.vx >= 0 ? 1 : -1;
        hurtPlayer(world, pr.damage, knockDir, events);
        world.projectiles.splice(i, 1);
      }
    }
  }

  // 8. Goal Shrine Check (require any active stage Boss defeated first)
  const gx = world.stage.goalTile.x * TILE_SIZE;
  const gy = world.stage.goalTile.y * TILE_SIZE;
  const bossAlive = world.enemies.some(
    (e) => e.type === 'warden' && e.state !== 'ko'
  );

  if (!bossAlive && aabbOverlap(p.x, p.y, p.w, p.h, gx - 6, gy - 32, 44, 64)) {
    world.stageCleared = true;
    events.stageClear = true;
  }

  return events;
}
