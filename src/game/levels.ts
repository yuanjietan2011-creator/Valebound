import type {
  BiomeId,
  BiomePalette,
  EnemySpawn,
  MovingPlatformDef,
  PickupSpawn,
  RelicId,
  StageDefinition,
  WeatherKind,
} from './types';

export const TILE_SIZE = 32;
export const GRID_ROWS = 16;

export const BIOME_PALETTES: Record<BiomeId, BiomePalette> = {
  meadow: {
    skyTop: '#2d5a7b',
    skyBottom: '#8ecae6',
    horizonHill: '#3b6e5c',
    farSilhouette: '#2a4d4c',
    groundFill: '#5c4033',
    groundTop: '#4d9e59',
    stoneFill: '#6c757d',
    brickFill: '#9c5a3c',
    accent: '#f59e0b',
  },
  aqueduct: {
    skyTop: '#1d4e68',
    skyBottom: '#78b8c8',
    horizonHill: '#35606e',
    farSilhouette: '#264552',
    groundFill: '#4f5d6b',
    groundTop: '#5ca388',
    stoneFill: '#7a8b99',
    brickFill: '#6b7d8c',
    accent: '#38bdf8',
  },
  bramble: {
    skyTop: '#183028',
    skyBottom: '#436e5b',
    horizonHill: '#244738',
    farSilhouette: '#162d24',
    groundFill: '#423329',
    groundTop: '#3e7a47',
    stoneFill: '#56635a',
    brickFill: '#6e4f3a',
    accent: '#84cc16',
  },
  ruins: {
    skyTop: '#2c3547',
    skyBottom: '#758296',
    horizonHill: '#3e485c',
    farSilhouette: '#2b3342',
    groundFill: '#494e59',
    groundTop: '#7a8c7e',
    stoneFill: '#6a7280',
    brickFill: '#7f7868',
    accent: '#eab308',
  },
  quarry: {
    skyTop: '#422a23',
    skyBottom: '#c97e4c',
    horizonHill: '#694333',
    farSilhouette: '#472c22',
    groundFill: '#5e3d2c',
    groundTop: '#b56e3f',
    stoneFill: '#7d6352',
    brickFill: '#965a38',
    accent: '#fb923c',
  },
  twilight: {
    skyTop: '#191836',
    skyBottom: '#5a4378',
    horizonHill: '#2d254a',
    farSilhouette: '#1f1936',
    groundFill: '#322b45',
    groundTop: '#64528a',
    stoneFill: '#4d4766',
    brickFill: '#684e7a',
    accent: '#c084fc',
  },
  crypt: {
    skyTop: '#101218',
    skyBottom: '#292e3b',
    horizonHill: '#1c2029',
    farSilhouette: '#13161d',
    groundFill: '#292d36',
    groundTop: '#4c5463',
    stoneFill: '#3f4654',
    brickFill: '#524448',
    accent: '#f97316',
  },
  frost: {
    skyTop: '#16324f',
    skyBottom: '#8cc5e3',
    horizonHill: '#355e7d',
    farSilhouette: '#23425c',
    groundFill: '#3b4e63',
    groundTop: '#cce7f5',
    stoneFill: '#5d768f',
    brickFill: '#4a6b82',
    accent: '#7dd3fc',
  },
  clockwork: {
    skyTop: '#241e1a',
    skyBottom: '#6b533b',
    horizonHill: '#3b3025',
    farSilhouette: '#292119',
    groundFill: '#3d342d',
    groundTop: '#9c7844',
    stoneFill: '#5c5248',
    brickFill: '#8a6236',
    accent: '#fbbf24',
  },
  citadel: {
    skyTop: '#1a0e12',
    skyBottom: '#5c2329',
    horizonHill: '#2e161b',
    farSilhouette: '#1f0f13',
    groundFill: '#2b2024',
    groundTop: '#6e353b',
    stoneFill: '#45373c',
    brickFill: '#5c2c31',
    accent: '#f43f5e',
  },
};

interface StageTheme {
  name: string;
  subtitle: string;
  biome: BiomeId;
  weatherPool: WeatherKind[];
  relicReward?: RelicId;
  hasBoss: boolean;
}

const STAGE_THEMES: StageTheme[] = [
  {
    name: 'Whispering Meadow',
    subtitle: 'Sunlit outskirts of the first shrine',
    biome: 'meadow',
    weatherPool: ['clouds', 'leaves', 'fireflies'],
    relicReward: 'swift_boots',
    hasBoss: false,
  },
  {
    name: 'Mossy Aqueduct',
    subtitle: 'Weathered stone arches above the reservoir',
    biome: 'aqueduct',
    weatherPool: ['rain', 'mist', 'clouds'],
    hasBoss: false,
  },
  {
    name: 'Bramble Hollow',
    subtitle: 'Briar thickets hiding ancient woodland wards',
    biome: 'bramble',
    weatherPool: ['leaves', 'fireflies', 'mist'],
    relicReward: 'iron_cloak',
    hasBoss: false,
  },
  {
    name: 'Sunken Ruins',
    subtitle: 'Crumbling flagstones of the valley temples',
    biome: 'ruins',
    weatherPool: ['mist', 'rain', 'dust'],
    hasBoss: false,
  },
  {
    name: 'Amber Quarry',
    subtitle: 'Terraced mine shafts and timber lifts',
    biome: 'quarry',
    weatherPool: ['dust', 'embers', 'clouds'],
    relicReward: 'sunstone',
    hasBoss: true,
  },
  {
    name: 'Twilight Causeway',
    subtitle: 'Dusk-lit spans suspended over deep mist',
    biome: 'twilight',
    weatherPool: ['fireflies', 'mist', 'leaves'],
    hasBoss: false,
  },
  {
    name: 'Obsidian Crypt',
    subtitle: 'Subterranean vaults lit by ember braziers',
    biome: 'crypt',
    weatherPool: ['embers', 'ash', 'mist'],
    hasBoss: false,
  },
  {
    name: 'Frostspire Ridge',
    subtitle: 'Wind-scoured glacial ledges above the cloudline',
    biome: 'frost',
    weatherPool: ['snow', 'mist', 'clouds'],
    hasBoss: false,
  },
  {
    name: 'Clockwork Bastion',
    subtitle: 'Interlocking brass pendulums guarding the citadel',
    biome: 'clockwork',
    weatherPool: ['steam', 'dust', 'embers'],
    hasBoss: false,
  },
  {
    name: 'Citadel of the Ash King',
    subtitle: 'The tenth shrine awaits beyond the Ash Warden',
    biome: 'citadel',
    weatherPool: ['ash', 'embers', 'steam'],
    hasBoss: true,
  },
];

function randFloat(): number {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return arr[0] / 0x100000000;
  }
  return Math.random();
}

function randInt(min: number, max: number): number {
  return min + Math.floor(randFloat() * (max - min + 1));
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(randFloat() * items.length)];
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(randFloat() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

class GridBuilder {
  private cells: string[][];
  readonly cols: number;
  readonly rows = GRID_ROWS;
  enemies: EnemySpawn[] = [];
  pickups: PickupSpawn[] = [];
  movingPlatforms: MovingPlatformDef[] = [];
  chestRewards: Record<string, 'coin' | 'xp_gem' | 'potion' | 'relic'> = {};
  chestRelics: Record<string, RelicId> = {};
  private idCounter = 0;

  constructor(cols: number) {
    this.cols = cols;
    this.cells = Array.from({ length: this.rows }, () =>
      Array.from({ length: cols }, () => '.')
    );
  }

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}_${this.idCounter}`;
  }

  setTile(x: number, y: number, ch: string): this {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.cells[y][x] = ch;
    }
    return this;
  }

  fillGround(startX: number, endX: number, topRow = 13): this {
    for (let x = startX; x <= endX; x++) {
      for (let y = topRow; y < this.rows; y++) {
        this.setTile(x, y, '#');
      }
    }
    return this;
  }

  addPit(startX: number, endX: number): this {
    for (let x = startX; x <= endX; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.setTile(x, y, '.');
      }
    }
    return this;
  }

  addPlatform(
    startX: number,
    endX: number,
    row: number,
    ch: 'S' | 'B' | '=' | '~' | '#' = 'S'
  ): this {
    for (let x = startX; x <= endX; x++) {
      this.setTile(x, row, ch);
    }
    return this;
  }

  addColumn(x: number, topRow: number, bottomRow = 12, ch = 'S'): this {
    for (let y = topRow; y <= bottomRow; y++) {
      this.setTile(x, y, ch);
    }
    return this;
  }

  addStairs(startX: number, steps: number, baseRow = 12, dir: 1 | -1 = 1): this {
    for (let i = 0; i < steps; i++) {
      const x = startX + i;
      const h = dir === 1 ? i + 1 : steps - i;
      for (let k = 0; k < h; k++) {
        this.setTile(x, baseRow - k, 'S');
      }
    }
    return this;
  }

  addChest(
    x: number,
    y: number,
    reward: 'coin' | 'xp_gem' | 'potion' | 'relic' = 'xp_gem',
    relicId?: RelicId
  ): this {
    this.setTile(x, y, '?');
    const key = `${x},${y}`;
    this.chestRewards[key] = reward;
    if (relicId) {
      this.chestRelics[key] = relicId;
    }
    return this;
  }

  addSpikes(startX: number, endX: number, row = 12): this {
    for (let x = startX; x <= endX; x++) {
      this.setTile(x, row, '^');
    }
    return this;
  }

  addPickup(
    kind: 'coin' | 'xp_gem' | 'potion' | 'relic',
    tileX: number,
    tileY: number,
    relicId?: RelicId
  ): this {
    this.pickups.push({
      id: this.nextId('pk'),
      kind,
      tileX,
      tileY,
      relicId,
    });
    return this;
  }

  addCoinLine(startX: number, count: number, row: number): this {
    for (let i = 0; i < count; i++) {
      this.addPickup('coin', startX + i, row);
    }
    return this;
  }

  addCoinArc(centerX: number, peakRow: number, width = 3): this {
    const half = Math.floor(width / 2);
    for (let dx = -half; dx <= half; dx++) {
      const drop = Math.abs(dx) === 0 ? 0 : 1;
      this.addPickup('coin', centerX + dx, peakRow + drop);
    }
    return this;
  }

  addEnemy(
    type: EnemySpawn['type'],
    tileX: number,
    tileY: number,
    patrolMinX?: number,
    patrolMaxX?: number
  ): this {
    this.enemies.push({
      id: this.nextId('en'),
      type,
      tileX,
      tileY,
      patrolMinX,
      patrolMaxX,
    });
    return this;
  }

  addMovingPlatform(
    tileX: number,
    tileY: number,
    widthTiles: number,
    rangeX: number,
    rangeY: number,
    speed = 1.4
  ): this {
    this.movingPlatforms.push({
      id: this.nextId('mp'),
      tileX,
      tileY,
      widthTiles,
      rangeX,
      rangeY,
      speed,
    });
    return this;
  }

  buildGrid(): string[] {
    return this.cells.map((row) => row.join(''));
  }
}

type GroundEnemyType = 'slime' | 'hopper' | 'sentinel';

function pickGroundEnemy(stageIndex: number): GroundEnemyType {
  if (stageIndex === 0) {
    return randFloat() < 0.7 ? 'slime' : 'hopper';
  }
  if (stageIndex <= 2) {
    return pick(['slime', 'hopper', 'hopper'] as const);
  }
  if (stageIndex <= 5) {
    return pick(['slime', 'hopper', 'sentinel'] as const);
  }
  return pick(['hopper', 'sentinel', 'sentinel'] as const);
}

function randomChestReward(
  relicForChunk?: RelicId
): { reward: 'coin' | 'xp_gem' | 'potion' | 'relic'; relicId?: RelicId } {
  if (relicForChunk) {
    return { reward: 'relic', relicId: relicForChunk };
  }
  const r = randFloat();
  if (r < 0.48) return { reward: 'xp_gem' };
  if (r < 0.78) return { reward: 'potion' };
  return { reward: 'coin' };
}

type ChunkKind =
  | 'brick_plaza'
  | 'pit_leap'
  | 'sky_bridge'
  | 'spike_bypass'
  | 'stair_tower'
  | 'moving_ferry'
  | 'crumble_dash'
  | 'dual_deck'
  | 'pillar_run'
  | 'vaulted_hall';

function buildRandomChunk(
  b: GridBuilder,
  startX: number,
  kind: ChunkKind,
  stageIndex: number,
  relicForChunk?: RelicId
): number {
  switch (kind) {
    case 'brick_plaza': {
      const width = randInt(10, 13);
      const platLen = randInt(4, 6);
      const platRow = pick([9, 10] as const);
      const platStart = startX + randInt(2, Math.max(2, width - platLen - 2));
      const platEnd = platStart + platLen - 1;
      const mat = pick(['B', 'S', '='] as const);
      b.fillGround(startX, startX + width - 1, 13);
      b.addPlatform(platStart, platEnd, platRow, mat);

      const chestX = randInt(platStart + 1, Math.max(platStart + 1, platEnd - 1));
      const { reward, relicId } = randomChestReward(relicForChunk);
      b.addChest(chestX, mat === 'B' ? platRow : platRow - 3, reward, relicId);

      if (randFloat() < 0.75) {
        b.addCoinLine(platStart, Math.min(4, platLen), platRow - 1);
      } else {
        b.addPickup('xp_gem', chestX, platRow - 1);
      }

      const enemyType = pickGroundEnemy(stageIndex);
      const ex = randInt(startX + 2, startX + width - 3);
      b.addEnemy(enemyType, ex, 12, startX + 1, startX + width - 2);
      return startX + width;
    }

    case 'pit_leap': {
      const pre = randInt(2, 3);
      const pitW = randInt(2, 3);
      const post = randInt(4, 5);
      const total = pre + pitW + post;
      const pitStart = startX + pre;
      const pitEnd = pitStart + pitW - 1;

      b.fillGround(startX, pitStart - 1, 13);
      b.fillGround(pitEnd + 1, startX + total - 1, 13);
      b.addCoinArc(pitStart + Math.floor(pitW / 2), randInt(8, 10), 3);

      if (relicForChunk) {
        const rx = pitEnd + 2;
        b.addPlatform(rx - 1, rx + 1, 9, 'B');
        b.addChest(rx, 9, 'relic', relicForChunk);
      } else if (randFloat() < 0.65) {
        const ex = pitEnd + randInt(1, post - 2);
        b.addEnemy(pickGroundEnemy(stageIndex), ex, 12, pitEnd + 1, startX + total - 1);
      }
      return startX + total;
    }

    case 'sky_bridge': {
      const pre = 2;
      const pitW = randInt(6, 8);
      const post = 3;
      const total = pre + pitW + post;
      const pitStart = startX + pre;
      const pitEnd = pitStart + pitW - 1;

      b.fillGround(startX, pitStart - 1, 13);
      b.fillGround(pitEnd + 1, startX + total - 1, 13);

      const h1 = randInt(10, 11);
      const h2 = randInt(9, 10);
      const mat1 = pick(['=', 'S'] as const);
      const mat2 = pick(['=', 'S'] as const);
      b.addPlatform(pitStart + 1, pitStart + 2, h1, mat1);
      b.addPlatform(pitStart + 4, pitEnd - 1, h2, mat2);

      if (relicForChunk) {
        b.addChest(pitStart + 5, h2 - 3, 'relic', relicForChunk);
      } else if (randFloat() < 0.7) {
        b.addCoinArc(pitStart + 3, Math.min(h1, h2) - 2, 3);
      } else {
        b.addPickup('xp_gem', pitStart + 5, h2 - 1);
      }

      if (stageIndex >= 1 && randFloat() < 0.75) {
        b.addEnemy('wisp', pitStart + 3, randInt(5, 7), pitStart, pitEnd);
      }
      return startX + total;
    }

    case 'spike_bypass': {
      const width = randInt(11, 14);
      const spikeW = randInt(2, 3);
      const spikeStart = startX + randInt(3, width - spikeW - 4);
      const spikeEnd = spikeStart + spikeW - 1;
      const bridgeRow = pick([9, 10] as const);
      const mat = pick(['=', 'B'] as const);

      b.fillGround(startX, startX + width - 1, 13);
      b.addSpikes(spikeStart, spikeEnd, 12);
      b.addPlatform(spikeStart - 1, spikeEnd + 1, bridgeRow, mat);

      if (relicForChunk) {
        b.addChest(spikeStart, mat === 'B' ? bridgeRow : bridgeRow - 3, 'relic', relicForChunk);
      } else if (randFloat() < 0.65) {
        const { reward, relicId } = randomChestReward();
        b.addChest(spikeStart + 1, mat === 'B' ? bridgeRow : bridgeRow - 3, reward, relicId);
      } else {
        b.addCoinLine(spikeStart - 1, spikeW + 2, bridgeRow - 1);
      }

      if (randFloat() < 0.75) {
        const afterStart = spikeEnd + 1;
        if (startX + width - afterStart >= 3) {
          b.addEnemy(
            pickGroundEnemy(stageIndex),
            afterStart + 1,
            12,
            afterStart,
            startX + width - 1
          );
        }
      }
      return startX + width;
    }

    case 'stair_tower': {
      const width = randInt(11, 14);
      const steps = randInt(2, 3);
      const stairStart = startX + 2;
      const deckStart = stairStart + steps;
      const deckEnd = deckStart + randInt(2, 4);
      const deckRow = 13 - steps;

      b.fillGround(startX, startX + width - 1, 13);
      b.addStairs(stairStart, steps, 12, 1);
      b.addPlatform(deckStart, deckEnd, deckRow, 'S');

      const chestX = randInt(deckStart, deckEnd);
      const { reward, relicId } = randomChestReward(relicForChunk);
      b.addChest(chestX, deckRow - 3, reward, relicId);
      b.addCoinLine(deckStart, deckEnd - deckStart + 1, deckRow - 1);

      if (deckEnd + 2 < startX + width - 1) {
        b.addEnemy(
          pickGroundEnemy(stageIndex),
          deckEnd + 2,
          12,
          deckEnd + 1,
          startX + width - 1
        );
      }
      return startX + width;
    }

    case 'moving_ferry': {
      const pre = 2;
      const pitW = randInt(7, 10);
      const post = 3;
      const total = pre + pitW + post;
      const pitStart = startX + pre;
      const pitEnd = pitStart + pitW - 1;

      b.fillGround(startX, pitStart - 1, 13);
      b.fillGround(pitEnd + 1, startX + total - 1, 13);

      const ferryRow = randInt(10, 11);
      const speed = Number((1.3 + randFloat() * 0.55).toFixed(2));
      b.addMovingPlatform(
        pitStart + 1,
        ferryRow,
        3,
        (pitW - 4) * TILE_SIZE,
        0,
        speed
      );
      b.addCoinArc(pitStart + Math.floor(pitW / 2), ferryRow - 3, 3);

      if (relicForChunk) {
        b.addPlatform(pitStart + 3, pitStart + 5, 7, '=');
        b.addChest(pitStart + 4, 4, 'relic', relicForChunk);
      }

      if (stageIndex >= 2 && randFloat() < 0.7) {
        b.addEnemy('wisp', pitStart + Math.floor(pitW / 2), 6, pitStart, pitEnd);
      }
      return startX + total;
    }

    case 'crumble_dash': {
      const pre = 2;
      const pitW = randInt(6, 9);
      const post = 3;
      const total = pre + pitW + post;
      const pitStart = startX + pre;
      const pitEnd = pitStart + pitW - 1;

      b.fillGround(startX, pitStart - 1, 13);
      b.fillGround(pitEnd + 1, startX + total - 1, 13);

      const h1 = randInt(10, 11);
      const h2 = randInt(9, 10);
      b.addPlatform(pitStart + 1, pitStart + 2, h1, '~');
      if (pitW >= 8) {
        b.addPlatform(pitStart + 4, pitStart + 5, h2, '~');
        b.addPlatform(pitStart + 7, pitEnd - 1, h1, '~');
      } else {
        b.addPlatform(pitStart + 4, pitEnd - 1, h2, '~');
      }
      b.addCoinArc(pitStart + Math.floor(pitW / 2), Math.min(h1, h2) - 2, 3);

      if (relicForChunk) {
        b.addChest(pitEnd + 2, 9, 'relic', relicForChunk);
      }
      if (stageIndex >= 2 && randFloat() < 0.65) {
        b.addEnemy('wisp', pitStart + 3, 6, pitStart, pitEnd);
      }
      return startX + total;
    }

    case 'dual_deck': {
      const width = randInt(12, 15);
      const midStart = startX + 3;
      const midEnd = startX + width - 4;
      const midRow = 10;
      const topRow = 6;
      const topStart = midStart + 1;
      const topEnd = Math.min(midEnd, topStart + 3);

      b.fillGround(startX, startX + width - 1, 13);
      b.addPlatform(midStart, midEnd, midRow, '=');
      b.addPlatform(topStart, topEnd, topRow, '=');

      const { reward, relicId } = randomChestReward(relicForChunk);
      b.addChest(topStart + 1, topRow - 3, reward, relicId);
      b.addPickup('xp_gem', topEnd, topRow - 1);
      b.addCoinLine(midStart, Math.min(4, midEnd - midStart + 1), midRow - 1);

      b.addEnemy(
        pickGroundEnemy(stageIndex),
        startX + Math.floor(width / 2),
        12,
        startX + 1,
        startX + width - 2
      );
      if (stageIndex >= 3 && randFloat() < 0.65) {
        b.addEnemy('hopper', midStart + 1, midRow - 1, midStart, midEnd);
      }
      return startX + width;
    }

    case 'pillar_run': {
      const width = randInt(12, 15);
      b.fillGround(startX, startX + width - 1, 13);

      const p1 = startX + 3;
      const p2 = startX + 7;
      const p3 = startX + 10;
      const h1 = randInt(10, 11);
      const h2 = randInt(9, 10);

      b.addColumn(p1, h1, 12, 'S');
      b.addPickup('coin', p1, h1 - 1);

      if (stageIndex >= 1) {
        b.addSpikes(p1 + 1, p2 - 1, 12);
      }
      b.addColumn(p2, h2, 12, 'S');
      b.addPickup('coin', p2, h2 - 1);

      if (p3 < startX + width - 2) {
        if (stageIndex >= 2) {
          b.addSpikes(p2 + 1, p3 - 1, 12);
        }
        b.addColumn(p3, h1, 12, 'S');
        if (relicForChunk) {
          b.addChest(p3, h1 - 3, 'relic', relicForChunk);
        } else {
          b.addPickup('xp_gem', p3, h1 - 1);
        }
      } else if (relicForChunk) {
        b.addChest(p2, h2 - 3, 'relic', relicForChunk);
      }

      if (stageIndex >= 2 && randFloat() < 0.6) {
        b.addEnemy('wisp', p2, 6, p1, p2 + 3);
      }
      return startX + width;
    }

    case 'vaulted_hall': {
      const width = randInt(13, 16);
      const hallStart = startX + 2;
      const hallEnd = startX + width - 3;
      const midStart = hallStart + 2;
      const midEnd = hallEnd - 2;

      b.fillGround(startX, startX + width - 1, 13);
      b.addPlatform(hallStart, hallEnd, 4, 'S');
      b.addPlatform(midStart, midEnd, 9, 'B');

      const chestX = randInt(midStart + 1, Math.max(midStart + 1, midEnd - 1));
      const { reward, relicId } = randomChestReward(relicForChunk);
      b.addChest(chestX, 9, reward, relicId);
      b.addCoinLine(midStart, Math.min(4, midEnd - midStart + 1), 8);

      b.addEnemy(
        pickGroundEnemy(stageIndex),
        startX + Math.floor(width / 2),
        12,
        startX + 1,
        startX + width - 2
      );
      if (stageIndex >= 4 && midEnd - midStart >= 3 && randFloat() < 0.65) {
        b.addEnemy('slime', midStart + 1, 8, midStart, midEnd);
      }
      return startX + width;
    }
  }
}

export function generateStage(index: number): StageDefinition {
  const clampedIdx = Math.max(0, Math.min(STAGE_THEMES.length - 1, index));
  const theme = STAGE_THEMES[clampedIdx];
  const weather = pick(theme.weatherPool);

  // Stage-appropriate pool of chunk types
  const chunkPool: ChunkKind[] =
    clampedIdx === 0
      ? [
          'brick_plaza',
          'pit_leap',
          'sky_bridge',
          'stair_tower',
          'dual_deck',
          'pillar_run',
          'spike_bypass',
        ]
      : clampedIdx <= 2
      ? [
          'brick_plaza',
          'pit_leap',
          'sky_bridge',
          'spike_bypass',
          'stair_tower',
          'dual_deck',
          'pillar_run',
          'vaulted_hall',
        ]
      : [
          'brick_plaza',
          'pit_leap',
          'sky_bridge',
          'spike_bypass',
          'stair_tower',
          'moving_ferry',
          'crumble_dash',
          'dual_deck',
          'pillar_run',
          'vaulted_hall',
        ];

  const chunkCount = (clampedIdx >= 5 ? 6 : 5) + randInt(0, 1);
  const chosenChunks: ChunkKind[] = [];
  let deck = shuffle(chunkPool);
  while (chosenChunks.length < chunkCount) {
    if (deck.length === 0) {
      deck = shuffle(chunkPool);
    }
    const next = deck.pop()!;
    // Avoid back-to-back identical chunks when possible
    if (chosenChunks.length > 0 && chosenChunks[chosenChunks.length - 1] === next && deck.length > 0) {
      chosenChunks.push(deck.pop()!);
      deck.unshift(next);
    } else {
      chosenChunks.push(next);
    }
  }

  // Randomize which chunk holds the stage's signature relic (if any)
  const relicChunkIdx = theme.relicReward ? randInt(1, chunkCount - 1) : -1;

  // Estimate generous buffer capacity then slice cleanly after building
  const maxCols = 160;
  const b = new GridBuilder(maxCols);

  // Safe flat opening runway (cols 0..8) so player is never harmed idle at spawn
  b.fillGround(0, 8, 13);
  let cursorX = 9;

  for (let i = 0; i < chosenChunks.length; i++) {
    const relicForChunk = i === relicChunkIdx ? theme.relicReward : undefined;
    cursorX = buildRandomChunk(b, cursorX, chosenChunks[i], clampedIdx, relicForChunk);
  }

  // Boss Arena (Stages 5 & 10) with randomized ledges and potion placement
  if (theme.hasBoss) {
    const preArena = randInt(3, 5);
    const arenaW = randInt(25, 29);
    const totalArenaSpan = preArena + arenaW;
    b.fillGround(cursorX, cursorX + totalArenaSpan - 1, 13);

    // Pre-boss supply potion at randomized approach tile
    b.addPickup('potion', cursorX + randInt(1, preArena - 1), 12);

    const gateL = cursorX + preArena;
    const gateR = gateL + arenaW - 2;
    b.addColumn(gateL, randInt(10, 11), 12, 'S');
    b.addColumn(gateR, randInt(10, 11), 12, 'S');

    // 2 randomized elevated vantage ledges inside the arena
    const ledge1X = gateL + randInt(4, 7);
    const ledge1W = randInt(3, 5);
    const ledge1Row = pick([9, 10] as const);
    b.addPlatform(ledge1X, ledge1X + ledge1W - 1, ledge1Row, '=');

    const ledge2X = gateR - randInt(8, 11);
    const ledge2W = randInt(3, 5);
    const ledge2Row = pick([9, 10] as const);
    b.addPlatform(ledge2X, ledge2X + ledge2W - 1, ledge2Row, '=');

    if (randFloat() < 0.7) {
      b.addPickup('xp_gem', ledge1X + 1, ledge1Row - 1);
    }

    const bossSpawnX = Math.floor((gateL + gateR) / 2);
    b.addEnemy('warden', bossSpawnX, 11, gateL + 2, gateR - 1);
    cursorX += totalArenaSpan;
  }

  // Goal Shrine landing zone (always solid & clear)
  const goalBuffer = randInt(7, 9);
  b.fillGround(cursorX, cursorX + goalBuffer - 1, 13);
  const goalX = cursorX + goalBuffer - 4;
  if (randFloat() < 0.65) {
    b.addCoinLine(cursorX + 1, 3, 12);
  }
  const finalCols = cursorX + goalBuffer;

  // Stage 1 always includes at least 2 slimes for approachable opening pacing
  if (clampedIdx === 0) {
    const slimeCount = b.enemies.filter((e) => e.type === 'slime').length;
    if (slimeCount === 0) {
      b.addEnemy('slime', cursorX + 2, 12, cursorX, cursorX + 4);
    }
  }

  // Trim built grid to exact `finalCols` width
  const rawGrid = b.buildGrid();
  const trimmedGrid = rawGrid.map((row) => row.slice(0, finalCols));

  const stage: StageDefinition = {
    index: clampedIdx,
    name: theme.name,
    subtitle: theme.subtitle,
    biome: theme.biome,
    weather,
    palette: BIOME_PALETTES[theme.biome],
    grid: trimmedGrid,
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: goalX, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };

  return stage;
}

export const STAGES: StageDefinition[] = Array.from(
  { length: STAGE_THEMES.length },
  (_, idx) => generateStage(idx)
);

export function isSolidChar(ch: string): boolean {
  return ch === '#' || ch === 'S' || ch === 'B' || ch === '?' || ch === 'U';
}

export function isOneWayChar(ch: string): boolean {
  return ch === '=';
}

export function validateStage(stage: StageDefinition): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (stage.grid.length !== GRID_ROWS) {
    errors.push(
      `Stage ${stage.index + 1}: expected ${GRID_ROWS} rows, got ${stage.grid.length}`
    );
  }
  const cols = stage.grid[0]?.length ?? 0;
  for (let r = 0; r < stage.grid.length; r++) {
    if (stage.grid[r].length !== cols) {
      errors.push(`Stage ${stage.index + 1}: row ${r} length mismatch`);
    }
  }
  const sx = stage.spawnTile.x;
  const sy = stage.spawnTile.y;
  if (sx < 1 || sx >= cols - 2 || sy < 2 || sy >= GRID_ROWS - 1) {
    errors.push(`Stage ${stage.index + 1}: invalid spawnTile`);
  } else {
    // Check 2-tile clear path & floor beneath spawn
    const floorChar = stage.grid[sy + 1]?.[sx];
    const spawnChar = stage.grid[sy]?.[sx];
    const aheadChar = stage.grid[sy]?.[sx + 1];
    if (!isSolidChar(floorChar)) {
      errors.push(`Stage ${stage.index + 1}: spawnTile has no solid floor underneath`);
    }
    if (spawnChar !== '.' || aheadChar !== '.') {
      errors.push(`Stage ${stage.index + 1}: spawnTile is obstructed`);
    }
  }

  const gx = stage.goalTile.x;
  const gy = stage.goalTile.y;
  if (!isSolidChar(stage.grid[gy + 1]?.[gx])) {
    errors.push(`Stage ${stage.index + 1}: goalTile has no solid floor underneath`);
  }
  if (stage.grid[gy]?.[gx] !== '.') {
    errors.push(`Stage ${stage.index + 1}: goalTile is obstructed`);
  }

  return { valid: errors.length === 0, errors };
}
