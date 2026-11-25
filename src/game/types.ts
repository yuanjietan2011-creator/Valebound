export type GamePhase =
  | 'title'
  | 'playing'
  | 'paused'
  | 'stage_clear'
  | 'victory'
  | 'gameover';

export type RelicId = 'swift_boots' | 'iron_cloak' | 'sunstone';

export interface RpgStats {
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  baseAttack: number;
  gold: number;
  potions: number;
  relics: RelicId[];
  enemiesDefeated: number;
}

export type TileKind =
  | 'empty'
  | 'ground'
  | 'stone'
  | 'brick'
  | 'chest'
  | 'chest_opened'
  | 'bridge'
  | 'spike'
  | 'crumble';

export type BiomeId =
  | 'meadow'
  | 'aqueduct'
  | 'bramble'
  | 'ruins'
  | 'quarry'
  | 'twilight'
  | 'crypt'
  | 'frost'
  | 'clockwork'
  | 'citadel';

export type WeatherKind =
  | 'clouds'
  | 'rain'
  | 'leaves'
  | 'mist'
  | 'dust'
  | 'fireflies'
  | 'embers'
  | 'snow'
  | 'steam'
  | 'ash';

export interface BiomePalette {
  skyTop: string;
  skyBottom: string;
  horizonHill: string;
  farSilhouette: string;
  groundFill: string;
  groundTop: string;
  stoneFill: string;
  brickFill: string;
  accent: string;
}

export type EnemyType = 'slime' | 'hopper' | 'wisp' | 'sentinel' | 'warden';

export type BossVariant = 'ash_warden' | 'frost_monarch' | 'brass_titan';

export type BossAttackKind = 'leap_slam' | 'volley' | 'charge';

export interface EnemySpawn {
  id: string;
  type: EnemyType;
  tileX: number;
  tileY: number;
  patrolMinX?: number;
  patrolMaxX?: number;
}

export interface MovingPlatformDef {
  id: string;
  tileX: number;
  tileY: number;
  widthTiles: number;
  rangeX: number;
  rangeY: number;
  speed: number;
}

export interface PickupSpawn {
  id: string;
  kind: 'coin' | 'xp_gem' | 'potion' | 'relic';
  tileX: number;
  tileY: number;
  relicId?: RelicId;
}

export interface StageDefinition {
  index: number; // 0..9
  name: string;
  subtitle: string;
  biome: BiomeId;
  weather: WeatherKind;
  palette: BiomePalette;
  grid: string[]; // rows of characters, fixed 16 rows
  spawnTile: { x: number; y: number };
  goalTile: { x: number; y: number };
  enemies: EnemySpawn[];
  pickups: PickupSpawn[];
  movingPlatforms: MovingPlatformDef[];
  chestRewards: Record<string, 'coin' | 'xp_gem' | 'potion' | 'relic'>;
  chestRelics?: Record<string, RelicId>;
}

export interface PlayerEntity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  onPlatformId: string | null;
  coyoteTimer: number;
  jumpBufferTimer: number;
  invulnTimer: number;
  hurtFlashTimer: number;
  castCooldown: number;
  walkDistance: number;
  crouching: boolean;
  lastSafeX: number;
  lastSafeY: number;
}

export type EnemyAiState = 'patrol' | 'windup' | 'attack' | 'recover' | 'ko';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  xpReward: number;
  goldReward: number;
  contactDamage: number;
  patrolMinX: number;
  patrolMaxX: number;
  anchorY: number;
  state: EnemyAiState;
  stateTimer: number;
  hurtFlashTimer: number;
  koTimer: number;
  grounded: boolean;
  phase: number; // used for boss phases or wisp hover
  bossVariant?: BossVariant;
  bossName?: string;
  bossAttack?: BossAttackKind;
}

export interface MovingPlatformEntity {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  originX: number;
  originY: number;
  rangeX: number;
  rangeY: number;
  speed: number;
  t: number;
  dx: number;
  dy: number;
}

export interface PickupEntity {
  id: string;
  kind: 'coin' | 'xp_gem' | 'potion' | 'relic';
  relicId?: RelicId;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  bobOffset: number;
  collected: boolean;
  fromChest: boolean;
}

export interface ProjectileEntity {
  id: string;
  fromPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  ttl: number;
  alive: boolean;
}

export interface CrumbleTileState {
  key: string; // "col,row"
  col: number;
  row: number;
  state: 'solid' | 'shaking' | 'gone';
  timer: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface ParticleSlot {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface HudSnapshot {
  phase: GamePhase;
  stageIndex: number;
  stageName: string;
  stageSubtitle: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  potions: number;
  relics: RelicId[];
  enemiesDefeated: number;
  elapsedSeconds: number;
  bossHp: number | null;
  bossMaxHp: number | null;
  bossName: string | null;
  bannerText: string | null;
}

export interface StageRecord {
  cleared: boolean;
  bestTime: number | null;
  bestGold: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  down: boolean;
  castJustPressed: boolean;
  potionJustPressed: boolean;
}
