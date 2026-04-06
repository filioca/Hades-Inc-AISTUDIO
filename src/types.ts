export type Position = { x: number; y: number };

export type EnemyType = 'comum' | 'rapida' | 'tanque' | 'especial';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  reward: number;
  invisible?: boolean;
  invisibleTimer?: number;
}

export type TowerType = 'caronte' | 'medusa' | 'cerbero' | 'sisifo';

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  level: number;
  cooldown: number;
  range: number;
  damage: number;
  fireRate: number; // frames between shots
  targetId: string | null;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  type: TowerType;
  aoe?: number;
  slow?: number;
}

export interface Wave {
  id: number;
  enemies: { type: EnemyType; count: number; interval: number }[];
}

export interface GameState {
  status: 'start' | 'briefing' | 'playing' | 'paused' | 'gameover' | 'victory';
  obolos: number;
  lives: number;
  wave: number;
  enemiesKilled: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  waveActive: boolean;
  waveTimer: number;
  pendingEnemies: { type: EnemyType; time: number }[];
  zeusPenalties: number;
}
