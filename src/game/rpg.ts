import type { RelicId, RpgStats } from './types';

export const RELIC_INFO: Record<
  RelicId,
  { name: string; effect: string; color: string }
> = {
  swift_boots: {
    name: 'Windstrider Boots',
    effect: '+16% Run Speed',
    color: '#38bdf8',
  },
  iron_cloak: {
    name: 'Ironweave Cloak',
    effect: '-1 Incoming Damage (min 1)',
    color: '#94a3b8',
  },
  sunstone: {
    name: 'Sunstone Sigil',
    effect: '+2 Stomp & Bolt Damage',
    color: '#f59e0b',
  },
};

export function xpNeededForLevel(level: number): number {
  return 40 + (level - 1) * 30;
}

export function createInitialRpgStats(): RpgStats {
  return {
    level: 1,
    xp: 0,
    xpToNext: xpNeededForLevel(1),
    hp: 7,
    maxHp: 7,
    baseAttack: 2,
    gold: 0,
    potions: 2,
    relics: [],
    enemiesDefeated: 0,
  };
}

export function grantXp(
  current: RpgStats,
  amount: number
): { stats: RpgStats; leveledUp: boolean; levelsGained: number } {
  if (amount <= 0) {
    return { stats: current, leveledUp: false, levelsGained: 0 };
  }

  let level = current.level;
  let xp = current.xp + amount;
  let xpToNext = current.xpToNext;
  let maxHp = current.maxHp;
  let hp = current.hp;
  let baseAttack = current.baseAttack;
  let levelsGained = 0;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    levelsGained += 1;
    xpToNext = xpNeededForLevel(level);
    maxHp = Math.min(12, maxHp + 1);
    hp = maxHp; // full heal on level up
    baseAttack += level % 2 === 0 ? 1 : 0;
  }

  return {
    stats: {
      ...current,
      level,
      xp,
      xpToNext,
      hp,
      maxHp,
      baseAttack,
    },
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

export function applyDamageToStats(
  current: RpgStats,
  rawDamage: number
): { stats: RpgStats; actualDamage: number; defeated: boolean } {
  const hasCloak = current.relics.includes('iron_cloak');
  const reduced = hasCloak ? Math.max(1, rawDamage - 1) : Math.max(1, rawDamage);
  const nextHp = Math.max(0, current.hp - reduced);
  return {
    stats: {
      ...current,
      hp: nextHp,
    },
    actualDamage: reduced,
    defeated: nextHp <= 0,
  };
}

export function usePotion(current: RpgStats): {
  stats: RpgStats;
  healed: number;
  used: boolean;
} {
  if (current.potions <= 0 || current.hp >= current.maxHp) {
    return { stats: current, healed: 0, used: false };
  }
  const healAmount = 3;
  const nextHp = Math.min(current.maxHp, current.hp + healAmount);
  return {
    stats: {
      ...current,
      hp: nextHp,
      potions: current.potions - 1,
    },
    healed: nextHp - current.hp,
    used: true,
  };
}

export function grantRelic(
  current: RpgStats,
  relic: RelicId
): { stats: RpgStats; isNew: boolean } {
  if (current.relics.includes(relic)) {
    return {
      stats: { ...current, gold: current.gold + 25 },
      isNew: false,
    };
  }
  return {
    stats: {
      ...current,
      relics: [...current.relics, relic],
    },
    isNew: true,
  };
}

export function getMoveSpeed(stats: RpgStats): number {
  const base = 245;
  return stats.relics.includes('swift_boots') ? Math.round(base * 1.16) : base;
}

export function getStompDamage(stats: RpgStats): number {
  return stats.baseAttack + (stats.relics.includes('sunstone') ? 2 : 0);
}

export function getBoltDamage(stats: RpgStats): number {
  return Math.max(1, stats.baseAttack - 1) + (stats.relics.includes('sunstone') ? 2 : 0);
}
