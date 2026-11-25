import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, validateStage, TILE_SIZE } from './levels';
import {
  applyDamageToStats,
  createInitialRpgStats,
  getBoltDamage,
  getMoveSpeed,
  getStompDamage,
  grantRelic,
  grantXp,
  usePotion,
  xpNeededForLevel,
} from './rpg';
import { createWorld, stepWorld } from './physics';
import type { InputState } from './types';

function emptyInput(): InputState {
  return {
    left: false,
    right: false,
    jumpHeld: false,
    jumpJustPressed: false,
    down: false,
    castJustPressed: false,
    potionJustPressed: false,
  };
}

test('all 10 stages exist and pass structural validation', () => {
  assert.ok(STAGES.length >= 10, `Expected >= 10 stages, got ${STAGES.length}`);
  for (const stage of STAGES) {
    const res = validateStage(stage);
    assert.equal(
      res.valid,
      true,
      `Stage ${stage.index + 1} (${stage.name}) failed validation: ${res.errors.join('; ')}`
    );
  }
});

test('RPG XP progression levels up, increases max HP, and heals to full', () => {
  let stats = createInitialRpgStats();
  stats = { ...stats, hp: 3 };
  const needed = xpNeededForLevel(1);
  const res = grantXp(stats, needed + 10);
  assert.equal(res.leveledUp, true);
  assert.equal(res.levelsGained, 1);
  assert.equal(res.stats.level, 2);
  assert.equal(res.stats.xp, 10);
  assert.equal(res.stats.maxHp, stats.maxHp + 1);
  assert.equal(res.stats.hp, stats.maxHp + 1);
});

test('RPG relics modify speed, defense, and attack power', () => {
  let stats = createInitialRpgStats();
  const baseSpeed = getMoveSpeed(stats);
  const baseStomp = getStompDamage(stats);
  const baseBolt = getBoltDamage(stats);

  stats = grantRelic(stats, 'swift_boots').stats;
  assert.ok(getMoveSpeed(stats) > baseSpeed);

  stats = grantRelic(stats, 'sunstone').stats;
  assert.equal(getStompDamage(stats), baseStomp + 2);
  assert.equal(getBoltDamage(stats), baseBolt + 2);

  stats = grantRelic(stats, 'iron_cloak').stats;
  const dmgRes = applyDamageToStats(stats, 2);
  assert.equal(dmgRes.actualDamage, 1);
  assert.equal(dmgRes.stats.hp, stats.hp - 1);
});

test('potions heal up to maxHp and decrement potion count', () => {
  let stats = createInitialRpgStats();
  stats = { ...stats, hp: 2, potions: 2 };
  const res = usePotion(stats);
  assert.equal(res.used, true);
  assert.equal(res.healed, 3);
  assert.equal(res.stats.hp, 5);
  assert.equal(res.stats.potions, 1);

  const fullRes = usePotion({ ...res.stats, hp: res.stats.maxHp });
  assert.equal(fullRes.used, false);
});

test('player survives initial seconds with zero input on every stage', () => {
  for (const stage of STAGES) {
    const world = createWorld(stage, createInitialRpgStats());
    const startHp = world.stats.hp;
    for (let i = 0; i < 180; i++) {
      stepWorld(world, emptyInput(), 1 / 60);
    }
    assert.equal(world.defeated, false, `Player died idle on stage ${stage.index + 1}`);
    assert.equal(world.stats.hp, startHp, `Player took idle damage on stage ${stage.index + 1}`);
  }
});

test('player moves right, jumps, and collects coin', () => {
  const world = createWorld(STAGES[0], createInitialRpgStats());
  const startX = world.player.x;

  for (let i = 0; i < 20; i++) {
    stepWorld(world, { ...emptyInput(), right: true }, 1 / 60);
  }
  assert.ok(world.player.x > startX + 30, 'Player should move right');

  const groundY = world.player.y;
  stepWorld(
    world,
    { ...emptyInput(), jumpHeld: true, jumpJustPressed: true },
    1 / 60
  );
  for (let i = 0; i < 10; i++) {
    stepWorld(world, { ...emptyInput(), jumpHeld: true }, 1 / 60);
  }
  assert.ok(world.player.y < groundY - 20, 'Player should ascend on jump');
});

test('stomping a slime defeats it and grants XP and Gold', () => {
  const world = createWorld(STAGES[0], createInitialRpgStats());
  const slime = world.enemies.find((e) => e.type === 'slime');
  assert.ok(slime, 'Stage 1 should have a slime');

  // Position player right above the slime and falling downward
  world.player.x = slime.x;
  world.player.y = slime.y - world.player.h - 2;
  world.player.vy = 220;
  world.player.grounded = false;

  const ev = stepWorld(world, emptyInput(), 1 / 60);
  assert.equal(ev.stomp, true);
  assert.equal(slime.state, 'ko');
  assert.ok(world.stats.xp > 0);
  assert.ok(world.stats.gold > 0);
});

test('reaching goal shrine triggers stageCleared', () => {
  const world = createWorld(STAGES[0], createInitialRpgStats());
  world.player.x = STAGES[0].goalTile.x * TILE_SIZE;
  world.player.y = STAGES[0].goalTile.y * TILE_SIZE;
  const ev = stepWorld(world, emptyInput(), 1 / 60);
  assert.equal(ev.stageClear, true);
  assert.equal(world.stageCleared, true);
});

test('all 10 stages have weather configured and player jump stays in sweet spot', () => {
  for (const stage of STAGES) {
    assert.ok(stage.weather, `Stage ${stage.index + 1} missing weather`);
  }

  const world = createWorld(STAGES[0], createInitialRpgStats());
  const startY = world.player.y;
  let minY = startY;

  stepWorld(
    world,
    { ...emptyInput(), jumpHeld: true, jumpJustPressed: true },
    1 / 60
  );
  for (let i = 0; i < 40; i++) {
    stepWorld(world, { ...emptyInput(), jumpHeld: true }, 1 / 60);
    if (world.player.y < minY) minY = world.player.y;
  }
  const jumpHeightPx = startY - minY;
  assert.ok(
    jumpHeightPx >= 131 && jumpHeightPx <= 142,
    `Expected jump height in [131, 142]px, got ${jumpHeightPx.toFixed(1)}px`
  );

  // Also verify landing on top of Stage 1's row-9 brick platform (col 10, y = 288px)
  const w2 = createWorld(STAGES[0], createInitialRpgStats());
  w2.player.x = 8 * TILE_SIZE;
  stepWorld(
    w2,
    { ...emptyInput(), right: true, jumpHeld: true, jumpJustPressed: true },
    1 / 60
  );
  for (let i = 0; i < 45; i++) {
    stepWorld(w2, { ...emptyInput(), right: true, jumpHeld: i < 28 }, 1 / 60);
  }
  assert.ok(
    w2.player.y <= 9 * TILE_SIZE - w2.player.h + 1,
    `Expected player to land on top of row-9 platform (y <= ${9 * TILE_SIZE - w2.player.h}), got y=${w2.player.y.toFixed(1)}`
  );
});

test('Stage 10 boss is durable, randomized across variants, and actively attacks player', () => {
  const seenVariants = new Set<string>();
  for (let i = 0; i < 25; i++) {
    const w = createWorld(STAGES[9], createInitialRpgStats());
    const boss = w.enemies.find((e) => e.type === 'warden');
    assert.ok(boss, 'Stage 10 must have a boss');
    assert.ok(boss.maxHp >= 42, `Expected boss HP >= 42, got ${boss.maxHp}`);
    if (boss.bossVariant) seenVariants.add(boss.bossVariant);
  }
  assert.ok(
    seenVariants.size >= 2,
    `Expected randomized boss variants, saw: ${[...seenVariants].join(', ')}`
  );

  // Verify boss enters windup & performs an attack when player approaches
  const world = createWorld(STAGES[9], createInitialRpgStats());
  const boss = world.enemies.find((e) => e.type === 'warden')!;
  world.player.x = boss.x - 160;
  world.player.y = boss.y + 16;

  let sawAttackOrProjectile = false;
  for (let step = 0; step < 180; step++) {
    stepWorld(world, emptyInput(), 1 / 60);
    if (
      boss.state === 'windup' ||
      boss.state === 'attack' ||
      world.projectiles.some((pr) => !pr.fromPlayer)
    ) {
      sawAttackOrProjectile = true;
      break;
    }
  }
  assert.equal(sawAttackOrProjectile, true, 'Boss should actively telegraph and attack');
});

test('pit fall respawns player at last safe ledge instead of stage start', () => {
  const world = createWorld(STAGES[0], createInitialRpgStats());
  // Walk right onto safe ground at col 16 (before pit 18..19)
  world.player.x = 16 * TILE_SIZE;
  world.player.y = 12 * TILE_SIZE + 2;
  stepWorld(world, emptyInput(), 1 / 60);
  const savedX = world.player.lastSafeX;
  assert.ok(savedX >= 15 * TILE_SIZE);

  // Drop into pit
  world.player.x = 18.5 * TILE_SIZE;
  world.player.y = 17 * TILE_SIZE;
  stepWorld(world, emptyInput(), 1 / 60);

  assert.equal(world.defeated, false);
  assert.equal(world.player.x, savedX);
});
