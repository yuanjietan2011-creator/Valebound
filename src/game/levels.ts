import type {
  BiomeId,
  BiomePalette,
  EnemySpawn,
  MovingPlatformDef,
  PickupSpawn,
  RelicId,
  StageDefinition,
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

  addPlatform(startX: number, endX: number, row: number, ch: 'S' | 'B' | '=' | '~' | '#' = 'S'): this {
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

function buildStage1(): StageDefinition {
  const b = new GridBuilder(76);
  b.fillGround(0, 75, 13)
    .addPit(18, 19)
    .addPit(42, 44)
    .addPit(58, 59);

  // Intro bricks & chest
  b.addPlatform(10, 14, 9, 'B')
    .addChest(12, 9, 'xp_gem')
    .addCoinLine(10, 5, 8);

  // First pit jump arc
  b.addCoinArc(18.5, 9, 3);

  // Elevated wooden bridge + relic chest
  b.addPlatform(23, 28, 10, '=')
    .addChest(25, 6, 'relic', 'swift_boots')
    .addPlatform(24, 26, 6, 'B');

  // Second meadow section
  b.addStairs(33, 3, 12, 1)
    .addPlatform(36, 39, 10, 'S')
    .addChest(37, 6, 'potion')
    .addCoinArc(43, 9, 3);

  // East approach
  b.addPlatform(48, 53, 9, 'B')
    .addChest(50, 9, 'xp_gem')
    .addPickup('xp_gem', 51, 8)
    .addStairs(61, 4, 12, 1)
    .addPlatform(65, 66, 9, 'S')
    .addCoinLine(65, 2, 8);

  b.addEnemy('slime', 15, 12, 11, 17)
    .addEnemy('slime', 30, 12, 24, 32)
    .addEnemy('hopper', 50, 12, 46, 56);

  return {
    index: 0,
    name: 'Whispering Meadow',
    subtitle: 'Sunlit outskirts of the first shrine',
    biome: 'meadow',
    weather: 'clouds',
    palette: BIOME_PALETTES.meadow,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 71, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage2(): StageDefinition {
  const b = new GridBuilder(82);
  b.fillGround(0, 81, 13)
    .addPit(14, 16)
    .addPit(27, 30)
    .addPit(46, 48)
    .addPit(61, 64);

  // Aqueduct piers and bridges
  b.addPlatform(9, 12, 10, 'S')
    .addChest(11, 6, 'xp_gem')
    .addPlatform(17, 25, 11, '=')
    .addCoinLine(18, 5, 10)
    .addPlatform(28, 29, 10, 'S')
    .addCoinArc(28.5, 7, 3);

  // Mid aqueduct arch
  b.addPlatform(34, 41, 9, 'B')
    .addChest(37, 9, 'potion')
    .addChest(39, 9, 'xp_gem')
    .addPlatform(36, 40, 5, '=')
    .addPickup('xp_gem', 38, 4);

  // Hopper gap & Wisp lookout
  b.addPlatform(51, 57, 10, 'S')
    .addChest(54, 6, 'coin')
    .addPlatform(62, 63, 10, '=')
    .addStairs(67, 3, 12, 1)
    .addCoinLine(71, 4, 11);

  b.addEnemy('slime', 21, 10, 17, 24)
    .addEnemy('hopper', 36, 12, 32, 44)
    .addEnemy('wisp', 48, 7, 45, 52)
    .addEnemy('slime', 54, 9, 51, 57)
    .addEnemy('hopper', 70, 12, 69, 75);

  return {
    index: 1,
    name: 'Mossy Aqueduct',
    subtitle: 'Weathered stone arches above the reservoir',
    biome: 'aqueduct',
    weather: 'rain',
    palette: BIOME_PALETTES.aqueduct,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 77, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage3(): StageDefinition {
  const b = new GridBuilder(86);
  b.fillGround(0, 85, 13)
    .addPit(20, 22)
    .addPit(42, 44)
    .addPit(63, 66);

  // Thorn bramble floor hazards
  b.addSpikes(12, 13, 12)
    .addPlatform(11, 14, 9, '=')
    .addCoinLine(11, 4, 8);

  // Canopy branch path with Ironweave Cloak
  b.addPlatform(24, 30, 10, '=')
    .addPlatform(27, 33, 6, '=')
    .addChest(30, 3, 'relic', 'iron_cloak')
    .addSpikes(32, 34, 12)
    .addPlatform(35, 39, 9, 'B')
    .addChest(37, 9, 'potion');

  // Mid hollow
  b.addPlatform(46, 52, 10, 'S')
    .addChest(49, 6, 'xp_gem')
    .addSpikes(55, 57, 12)
    .addPlatform(54, 58, 9, '=')
    .addCoinArc(56, 6, 3);

  // Final climb
  b.addPlatform(64, 65, 10, '=')
    .addStairs(69, 4, 12, 1)
    .addPickup('xp_gem', 72, 8);

  b.addEnemy('slime', 8, 12, 6, 11)
    .addEnemy('hopper', 26, 12, 23, 31)
    .addEnemy('wisp', 43, 7, 40, 46)
    .addEnemy('hopper', 49, 9, 46, 52)
    .addEnemy('slime', 60, 12, 58, 62)
    .addEnemy('hopper', 75, 12, 73, 79);

  return {
    index: 2,
    name: 'Bramble Hollow',
    subtitle: 'Briar thickets hiding ancient woodland wards',
    biome: 'bramble',
    weather: 'leaves',
    palette: BIOME_PALETTES.bramble,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 81, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage4(): StageDefinition {
  const b = new GridBuilder(88);
  b.fillGround(0, 87, 13)
    .addPit(15, 22)
    .addPit(38, 43)
    .addPit(60, 67);

  // Crumbling ruin bridge over first chasm
  b.addPlatform(16, 17, 11, '~')
    .addPlatform(19, 20, 10, '~')
    .addCoinArc(18, 7, 3);

  // Ruin sanctuary
  b.addPlatform(25, 32, 9, 'S')
    .addChest(28, 5, 'xp_gem')
    .addChest(30, 9, 'potion')
    .addPickup('xp_gem', 29, 8);

  // Second crumbling gap
  b.addPlatform(39, 41, 11, '~')
    .addCoinLine(39, 3, 9);

  // Sentinel courtyard
  b.addColumn(46, 10, 12, 'S')
    .addPlatform(48, 55, 9, 'B')
    .addChest(51, 9, 'xp_gem')
    .addSpikes(57, 58, 12);

  // Third chasm with crumbling steps
  b.addPlatform(61, 62, 11, '~')
    .addPlatform(64, 65, 9, '~')
    .addCoinArc(63, 6, 3)
    .addStairs(71, 3, 12, 1);

  b.addEnemy('slime', 10, 12, 7, 14)
    .addEnemy('sentinel', 28, 12, 24, 36)
    .addEnemy('wisp', 40, 7, 37, 44)
    .addEnemy('sentinel', 51, 12, 47, 56)
    .addEnemy('hopper', 75, 12, 74, 80);

  return {
    index: 3,
    name: 'Sunken Ruins',
    subtitle: 'Crumbling flagstones of the valley temples',
    biome: 'ruins',
    weather: 'mist',
    palette: BIOME_PALETTES.ruins,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 83, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage5(): StageDefinition {
  const b = new GridBuilder(90);
  b.fillGround(0, 89, 13)
    .addPit(16, 24)
    .addPit(43, 50)
    .addPit(68, 74);

  // Quarry scaffold + moving lift
  b.addPlatform(10, 14, 10, '=')
    .addChest(12, 6, 'xp_gem')
    .addMovingPlatform(18, 11, 3, 64, 0, 1.4)
    .addCoinLine(19, 3, 8);

  // Sunstone Sigil high quarry perch
  b.addPlatform(27, 36, 10, 'S')
    .addPlatform(30, 35, 6, '=')
    .addChest(32, 3, 'relic', 'sunstone')
    .addSpikes(38, 40, 12)
    .addPlatform(37, 41, 9, 'B')
    .addChest(39, 9, 'potion');

  // Vertical lift & mid chasm
  b.addMovingPlatform(45, 10, 3, 0, 44, 1.6)
    .addCoinArc(46, 6, 3);

  // Eastern excavation (Mid-Boss Courtyard)
  b.addPlatform(53, 62, 9, '=')
    .addChest(57, 5, 'xp_gem')
    .addPickup('potion', 51, 12)
    .addMovingPlatform(69, 11, 3, 56, 0, 1.5)
    .addStairs(77, 3, 12, 1);

  b.addEnemy('hopper', 11, 12, 7, 15)
    .addEnemy('sentinel', 31, 12, 26, 37)
    .addEnemy('wisp', 46, 6, 43, 50)
    .addEnemy('warden', 60, 11, 53, 66)
    .addEnemy('hopper', 81, 12, 80, 84);

  return {
    index: 4,
    name: 'Amber Quarry',
    subtitle: 'Terraced mine shafts and timber lifts',
    biome: 'quarry',
    weather: 'dust',
    palette: BIOME_PALETTES.quarry,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 85, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage6(): StageDefinition {
  const b = new GridBuilder(92);
  b.fillGround(0, 91, 13)
    .addPit(14, 24)
    .addPit(35, 45)
    .addPit(58, 69);

  // Causeway spans
  b.addPlatform(15, 18, 11, '=')
    .addPlatform(20, 23, 9, '=')
    .addCoinArc(19, 6, 3);

  // Stone watchtower
  b.addPlatform(27, 32, 9, 'S')
    .addChest(29, 5, 'potion')
    .addPickup('xp_gem', 31, 8);

  // Sky ferry
  b.addMovingPlatform(38, 10, 3, 70, 0, 1.5)
    .addCoinLine(38, 4, 7);

  // Causeway citadel arch
  b.addPlatform(48, 55, 10, 'B')
    .addChest(51, 10, 'xp_gem')
    .addSpikes(50, 52, 12);

  // Triple twilight span
  b.addPlatform(59, 61, 11, '~')
    .addPlatform(63, 65, 9, '=')
    .addPlatform(67, 68, 11, '~')
    .addChest(64, 5, 'xp_gem')
    .addCoinLine(72, 4, 11);

  b.addEnemy('wisp', 19, 6, 15, 24)
    .addEnemy('hopper', 29, 8, 27, 32)
    .addEnemy('wisp', 40, 6, 36, 45)
    .addEnemy('sentinel', 53, 12, 47, 57)
    .addEnemy('wisp', 64, 5, 59, 68)
    .addEnemy('sentinel', 76, 12, 71, 83);

  return {
    index: 5,
    name: 'Twilight Causeway',
    subtitle: 'Dusk-lit spans suspended over deep mist',
    biome: 'twilight',
    weather: 'fireflies',
    palette: BIOME_PALETTES.twilight,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 87, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage7(): StageDefinition {
  const b = new GridBuilder(94);
  b.fillGround(0, 93, 13)
    .addPit(21, 24)
    .addPit(46, 51)
    .addPit(70, 74);

  // Crypt vaulted ceiling blocks
  b.addPlatform(12, 20, 4, 'S')
    .addSpikes(14, 16, 12)
    .addPlatform(13, 17, 9, 'B')
    .addChest(15, 9, 'xp_gem');

  // Crypt floor & upper sanctum
  b.addPlatform(27, 36, 9, 'S')
    .addChest(31, 5, 'potion')
    .addSpikes(38, 41, 12)
    .addPlatform(37, 42, 9, '=');

  // Moving crypt slab
  b.addMovingPlatform(47, 10, 3, 40, 24, 1.6)
    .addCoinArc(48, 6, 3);

  // Dark guardian hall
  b.addPlatform(54, 65, 4, 'S')
    .addPlatform(56, 62, 9, 'B')
    .addChest(59, 9, 'xp_gem')
    .addSpikes(64, 66, 12);

  b.addPlatform(71, 73, 10, '~')
    .addStairs(77, 4, 12, 1)
    .addChest(80, 5, 'potion');

  b.addEnemy('sentinel', 11, 12, 7, 13)
    .addEnemy('hopper', 29, 8, 27, 36)
    .addEnemy('sentinel', 33, 12, 26, 37)
    .addEnemy('wisp', 48, 6, 45, 52)
    .addEnemy('sentinel', 58, 12, 53, 63)
    .addEnemy('hopper', 59, 8, 56, 62)
    .addEnemy('sentinel', 82, 12, 81, 86);

  return {
    index: 6,
    name: 'Obsidian Crypt',
    subtitle: 'Subterranean vaults lit by ember braziers',
    biome: 'crypt',
    weather: 'embers',
    palette: BIOME_PALETTES.crypt,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 89, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage8(): StageDefinition {
  const b = new GridBuilder(96);
  b.fillGround(0, 95, 13)
    .addPit(14, 24)
    .addPit(36, 47)
    .addPit(60, 73);

  // Stepping ice pillars
  b.addPlatform(15, 17, 11, '~')
    .addPlatform(19, 21, 9, 'S')
    .addChest(20, 5, 'xp_gem');

  // Alpine shelf
  b.addPlatform(27, 33, 10, '=')
    .addChest(30, 6, 'potion')
    .addSpikes(29, 31, 12);

  // Crumbling ridge & lift
  b.addPlatform(37, 39, 10, '~')
    .addMovingPlatform(42, 10, 3, 48, 0, 1.7)
    .addCoinArc(42, 6, 3);

  // High spire
  b.addPlatform(50, 57, 9, 'S')
    .addPlatform(52, 55, 5, '=')
    .addPickup('xp_gem', 53, 4)
    .addPickup('xp_gem', 54, 4);

  // Final frost chasm
  b.addPlatform(61, 63, 10, '~')
    .addPlatform(65, 67, 8, 'S')
    .addPlatform(69, 71, 10, '~')
    .addChest(66, 4, 'xp_gem')
    .addStairs(77, 3, 12, 1);

  b.addEnemy('hopper', 10, 12, 7, 13)
    .addEnemy('wisp', 20, 6, 15, 24)
    .addEnemy('sentinel', 28, 9, 27, 33)
    .addEnemy('wisp', 42, 6, 37, 47)
    .addEnemy('sentinel', 53, 12, 49, 58)
    .addEnemy('wisp', 66, 5, 61, 72)
    .addEnemy('hopper', 83, 12, 81, 88);

  return {
    index: 7,
    name: 'Frostspire Ridge',
    subtitle: 'Wind-scoured glacial ledges above the cloudline',
    biome: 'frost',
    weather: 'snow',
    palette: BIOME_PALETTES.frost,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 91, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage9(): StageDefinition {
  const b = new GridBuilder(100);
  b.fillGround(0, 99, 13)
    .addPit(15, 28)
    .addPit(41, 55)
    .addPit(68, 80);

  // Synchronized clockwork ferries
  b.addMovingPlatform(17, 11, 3, 56, 0, 1.8)
    .addPlatform(22, 24, 9, 'S')
    .addChest(23, 5, 'xp_gem')
    .addMovingPlatform(25, 10, 3, 0, 48, 1.6);

  // Gear deck
  b.addPlatform(31, 38, 9, 'B')
    .addChest(34, 9, 'potion')
    .addSpikes(33, 36, 12);

  // Twin brass platforms
  b.addMovingPlatform(43, 11, 3, 64, 0, 1.9)
    .addPlatform(48, 50, 8, '=')
    .addMovingPlatform(51, 10, 3, 56, 0, 1.7)
    .addCoinArc(49, 5, 3);

  // Bastion stronghold
  b.addPlatform(58, 65, 9, 'S')
    .addChest(61, 5, 'xp_gem')
    .addSpikes(60, 62, 12);

  // Final clockwork run
  b.addMovingPlatform(70, 11, 3, 64, 0, 1.8)
    .addPlatform(75, 77, 9, '~')
    .addStairs(83, 4, 12, 1)
    .addChest(86, 5, 'potion');

  b.addEnemy('sentinel', 10, 12, 7, 14)
    .addEnemy('wisp', 23, 5, 17, 27)
    .addEnemy('hopper', 34, 8, 31, 38)
    .addEnemy('wisp', 49, 5, 43, 54)
    .addEnemy('sentinel', 61, 8, 58, 65)
    .addEnemy('sentinel', 64, 12, 57, 67)
    .addEnemy('wisp', 74, 6, 70, 79)
    .addEnemy('hopper', 89, 12, 87, 92);

  return {
    index: 8,
    name: 'Clockwork Bastion',
    subtitle: 'Interlocking brass pendulums guarding the citadel',
    biome: 'clockwork',
    weather: 'steam',
    palette: BIOME_PALETTES.clockwork,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 95, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

function buildStage10(): StageDefinition {
  const b = new GridBuilder(104);
  b.fillGround(0, 103, 13)
    .addPit(16, 23)
    .addPit(39, 46)
    .addPit(60, 65);

  // Outer battlements
  b.addPlatform(10, 14, 9, 'B')
    .addChest(12, 9, 'potion')
    .addMovingPlatform(18, 11, 3, 56, 0, 1.7)
    .addCoinLine(18, 4, 8);

  // Inner keep
  b.addPlatform(27, 35, 9, 'S')
    .addChest(31, 5, 'xp_gem')
    .addSpikes(29, 32, 12)
    .addPlatform(40, 42, 10, '~')
    .addPlatform(43, 45, 9, '~');

  // Pre-boss supply shrine
  b.addPlatform(50, 56, 9, 'B')
    .addChest(53, 9, 'potion')
    .addPickup('xp_gem', 54, 8)
    .addMovingPlatform(61, 10, 3, 48, 0, 1.6);

  // Boss Arena (cols 68..96) with two raised vantage ledges & pre-boss potion
  b.addPickup('potion', 66, 12)
    .addColumn(67, 10, 12, 'S')
    .addPlatform(73, 77, 9, '=')
    .addPlatform(85, 89, 9, '=')
    .addColumn(97, 10, 12, 'S');

  b.addEnemy('sentinel', 11, 12, 7, 15)
    .addEnemy('wisp', 20, 6, 16, 23)
    .addEnemy('hopper', 30, 8, 27, 35)
    .addEnemy('sentinel', 52, 12, 48, 58)
    .addEnemy('wisp', 63, 6, 60, 65)
    // Stage 10 Final Boss (randomized variant on load)
    .addEnemy('warden', 84, 11, 69, 95);

  return {
    index: 9,
    name: 'Citadel of the Ash King',
    subtitle: 'The tenth shrine awaits beyond the Ash Warden',
    biome: 'citadel',
    weather: 'ash',
    palette: BIOME_PALETTES.citadel,
    grid: b.buildGrid(),
    spawnTile: { x: 3, y: 12 },
    goalTile: { x: 100, y: 12 },
    enemies: b.enemies,
    pickups: b.pickups,
    movingPlatforms: b.movingPlatforms,
    chestRewards: b.chestRewards,
    chestRelics: b.chestRelics,
  };
}

export const STAGES: StageDefinition[] = [
  buildStage1(),
  buildStage2(),
  buildStage3(),
  buildStage4(),
  buildStage5(),
  buildStage6(),
  buildStage7(),
  buildStage8(),
  buildStage9(),
  buildStage10(),
];

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
    errors.push(`Stage ${stage.index + 1}: expected ${GRID_ROWS} rows, got ${stage.grid.length}`);
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
