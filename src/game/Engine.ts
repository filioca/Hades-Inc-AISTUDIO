import { Enemy, GameState, Projectile, Tower, TowerType } from '../types';
import { CELL_SIZE, ENEMY_STATS, GRID_HEIGHT, GRID_WIDTH, PATH_PIXELS, PATH_CELLS, SCENERY, TOWER_STATS, WAVES } from '../constants';

class AssetManager {
  images: Record<string, HTMLImageElement> = {};
  loaded = false;

  load(urls: Record<string, string>, onProgress: (loaded: number, total: number) => void, onComplete: () => void) {
    let loadedCount = 0;
    const keys = Object.keys(urls);
    if (keys.length === 0) {
      this.loaded = true;
      onComplete();
      return;
    }

    keys.forEach(key => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        loadedCount++;
        onProgress(loadedCount, keys.length);
        if (loadedCount === keys.length) {
          this.loaded = true;
          onComplete();
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load asset: ${urls[key]}`);
        loadedCount++;
        onProgress(loadedCount, keys.length);
        if (loadedCount === keys.length) {
          this.loaded = true;
          onComplete();
        }
      };
      img.src = urls[key];
      this.images[key] = img;
    });
  }

  get(key: string) {
    return this.images[key];
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private selectedTowerId: string | null = null;
  private assets = new AssetManager();
  private assetsLoaded = false;
  private isDestroyed = false; // Trava de segurança contra o Loop Zumbi

  constructor(canvas: HTMLCanvasElement, onStateChange: (state: GameState) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;
    
    this.state = {
      status: 'start',
      obolos: 200,
      lives: 20,
      wave: 0,
      enemiesKilled: 0,
      enemies: [],
      towers: [],
      projectiles: [],
      waveActive: false,
      waveTimer: 0,
      pendingEnemies: [],
      zeusPenalties: 0,
    };
  }

  public setSelectedTower(id: string | null) {
    this.selectedTowerId = id;
    if (this.assetsLoaded && this.animationFrameId === null) {
      this.draw();
    }
  }

  public start(onProgress?: (loaded: number, total: number) => void) {
    this.state.status = 'playing';
    this.state.obolos = 200;
    this.state.lives = 20;
    this.state.wave = 0;
    this.state.enemiesKilled = 0;
    this.state.enemies = [];
    this.state.towers = [];
    this.state.projectiles = [];
    this.state.waveActive = false;
    this.state.pendingEnemies = [];
    this.state.zeusPenalties = 0;
    
    this.onStateChange({ ...this.state });
    
    if (!this.assetsLoaded) {
      this.assets.load({
        'bg_fundo': '[COLE_O_LINK_DO_FUNDO_AQUI]',
        'bg_caminho': '[COLE_O_LINK_DO_CAMINHO_AQUI]',
        'tower_caronte': 'https://i.imgur.com/EqAP9zX.png',
        'tower_medusa': 'https://i.imgur.com/HvWCKBR.png',
        'tower_cerbero': 'https://i.imgur.com/IzVaDZT.png',
        'tower_sisifo': 'https://i.imgur.com/voRGhA4.png',
        'enemy_comum': 'https://i.imgur.com/74nu9Qp.png',
        'enemy_rapida': 'https://i.imgur.com/LUUasZ6.png',
        'enemy_tanque': 'https://i.imgur.com/XNyQRbM.png',
        'enemy_especial': 'https://i.imgur.com/XNyQRbM.png',
      }, (loaded, total) => {
        if (onProgress) onProgress(loaded, total);
      }, () => {
        if (this.isDestroyed) return; // Se a engine foi morta enquanto carregava, aborte
        this.assetsLoaded = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
      });
    } else {
      if (onProgress) onProgress(1, 1);
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public stop() {
    this.isDestroyed = true; // Mata a engine permanentemente
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resumeLoop() {
    if (this.isDestroyed) return;
    if (this.animationFrameId === null && (this.state.status === 'playing' || this.state.status === 'paused') && this.assetsLoaded) {
      this.lastTime = performance.now();
      this.draw();
      this.loop(this.lastTime);
    }
  }

  public getState() {
    return this.state;
  }

  public pause() {
    if (this.state.status === 'playing') {
      this.state.status = 'paused' as any;
      this.onStateChange({ ...this.state });
    }
  }

  public resume() {
    if (this.state.status === 'paused' as any) {
      this.state.status = 'playing';
      this.lastTime = performance.now();
      this.onStateChange({ ...this.state });
    }
  }

  public startNextWave() {
    if (this.state.waveActive || this.state.wave >= WAVES.length) return;
    
    const waveData = WAVES[this.state.wave];
    this.state.wave++;
    this.state.waveActive = true;
    this.state.waveTimer = 0;
    
    this.state.pendingEnemies = [];
    let timeOffset = 0;
    
    for (const group of waveData.enemies) {
      for (let i = 0; i < group.count; i++) {
        timeOffset += group.interval;
        this.state.pendingEnemies.push({
          type: group.type,
          time: timeOffset,
        });
      }
    }
    
    this.onStateChange({ ...this.state });
  }

  public buildTower(type: TowerType, gridX: number, gridY: number) {
    const stats = TOWER_STATS[type];
    const cost = stats.cost[0];
    
    if (this.state.obolos < cost) return false;
    
    const px = gridX * CELL_SIZE + CELL_SIZE / 2;
    const py = gridY * CELL_SIZE + CELL_SIZE / 2;
    
    let onPath = false;
    for (let i = 0; i < PATH_PIXELS.length - 1; i++) {
      const p1 = PATH_PIXELS[i];
      const p2 = PATH_PIXELS[i+1];
      
      const l2 = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
      let t = ((px - p1.x) * (p2.x - p1.x) + (py - p1.y) * (p2.y - p1.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = p1.x + t * (p2.x - p1.x);
      const projY = p1.y + t * (p2.y - p1.y);
      const dist = Math.sqrt(Math.pow(px - projX, 2) + Math.pow(py - projY, 2));
      
      if (dist < CELL_SIZE) {
        onPath = true;
        break;
      }
    }
    
    if (onPath) return false;
    
    const onScenery = SCENERY.some(item => {
      if (item.type === 'pool') {
        const poolX = item.x * CELL_SIZE + CELL_SIZE / 2;
        const poolY = item.y * CELL_SIZE + CELL_SIZE / 2;
        const dist = Math.sqrt(Math.pow(px - poolX, 2) + Math.pow(py - poolY, 2));
        return dist < (item.radius || CELL_SIZE);
      }
      return item.x === gridX && item.y === gridY;
    });
    if (onScenery) return false;
    
    const occupied = this.state.towers.some(t => 
      Math.abs(t.x - px) < CELL_SIZE / 2 && Math.abs(t.y - py) < CELL_SIZE / 2
    );
    
    if (occupied) return false;
    
    this.state.obolos -= cost;
    this.state.towers.push({
      id: Math.random().toString(36).substring(2, 9),
      type,
      x: px,
      y: py,
      level: 0,
      cooldown: 0,
      range: stats.range[0],
      damage: stats.damage[0],
      fireRate: stats.fireRate[0],
      targetId: null,
    });
    
    this.onStateChange({ ...this.state });
    return true;
  }

  public upgradeTower(towerId: string) {
    const tower = this.state.towers.find(t => t.id === towerId);
    if (!tower || tower.level >= 2) return false;
    
    const stats = TOWER_STATS[tower.type];
    const cost = stats.cost[tower.level + 1] + (this.state.zeusPenalties * 10);
    
    if (this.state.obolos < cost) return false;
    
    this.state.obolos -= cost;
    tower.level++;
    tower.range = stats.range[tower.level];
    tower.damage = stats.damage[tower.level];
    tower.fireRate = stats.fireRate[tower.level];
    
    this.onStateChange({ ...this.state });
    return true;
  }

  public applyZeusPenalty() {
    this.state.zeusPenalties++;
    this.onStateChange({ ...this.state });
  }

  private loop = (time: number) => {
    if (this.isDestroyed) return; // Bloqueia loops órfãos
    if (this.state.status !== 'playing' && this.state.status !== 'paused') return;
    
    this.animationFrameId = requestAnimationFrame(this.loop);
    
    if (this.state.status === 'paused') {
      this.lastTime = time;
      this.draw();
      return;
    }
    
    const deltaTime = time - this.lastTime;
    if (deltaTime < 1000 / 60) return;
    
    this.lastTime = time;
    this.frameCount++;
    
    this.update();
    this.draw();
  };

  private update() {
    if (this.state.status !== 'playing') return;

    if (this.state.waveActive) {
      this.state.waveTimer++;
      
      while (this.state.pendingEnemies.length > 0 && this.state.pendingEnemies[0].time <= this.state.waveTimer) {
        const pending = this.state.pendingEnemies.shift()!;
        const stats = ENEMY_STATS[pending.type];
        
        this.state.enemies.push({
          id: Math.random().toString(36).substring(2, 9),
          type: pending.type,
          x: PATH_PIXELS[0].x,
          y: PATH_PIXELS[0].y,
          hp: stats.hp + (this.state.wave * stats.hp * 0.2),
          maxHp: stats.hp + (this.state.wave * stats.hp * 0.2),
          speed: stats.speed,
          pathIndex: 0,
          reward: stats.reward,
        });
      }
      
      if (this.state.pendingEnemies.length === 0 && this.state.enemies.length === 0) {
        this.state.waveActive = false;
        this.state.obolos += 50;
        this.onStateChange({ ...this.state });
        
        if (this.state.wave >= WAVES.length) {
          this.state.status = 'victory';
          this.onStateChange({ ...this.state });
        }
      }
    }

    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];
      
      if (enemy.invisibleTimer && enemy.invisibleTimer > 0) {
        enemy.invisibleTimer--;
        if (enemy.invisibleTimer <= 0) enemy.invisible = false;
      }
      
      let effectiveSpeed = enemy.speed;
      let isSlowed = false;
      for (const tower of this.state.towers) {
        if (tower.type === 'medusa') {
          const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
          if (dist <= tower.range) {
            isSlowed = true;
            break;
          }
        }
      }
      if (isSlowed) {
        effectiveSpeed *= 0.5;
      }
      
      const targetPoint = PATH_PIXELS[enemy.pathIndex + 1];
      if (!targetPoint) {
        this.state.lives--;
        this.state.enemies.splice(i, 1);
        this.onStateChange({ ...this.state });
        
        if (this.state.lives <= 0) {
          this.state.status = 'gameover';
          this.onStateChange({ ...this.state });
          return;
        }
        continue;
      }
      
      const dx = targetPoint.x - enemy.x;
      const dy = targetPoint.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= effectiveSpeed) {
        enemy.x = targetPoint.x;
        enemy.y = targetPoint.y;
        enemy.pathIndex++;
      } else {
        enemy.x += (dx / dist) * effectiveSpeed;
        enemy.y += (dy / dist) * effectiveSpeed;
      }
    }

    for (const tower of this.state.towers) {
      if (tower.type === 'medusa') {
        if (this.frameCount % 30 === 0) {
          for (const enemy of this.state.enemies) {
            if (enemy.invisible) continue;
            const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
            if (dist <= tower.range) {
              this.damageEnemy(enemy, tower.damage);
            }
          }
        }
        continue;
      }

      if (tower.cooldown > 0) {
        tower.cooldown--;
        continue;
      }
      
      let target: Enemy | null = null;
      let minPathDist = -1;
      
      for (const enemy of this.state.enemies) {
        if (enemy.invisible) continue;
        
        const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
        if (dist <= tower.range) {
          const nextPoint = PATH_PIXELS[enemy.pathIndex + 1];
          let pathDist = enemy.pathIndex * 1000;
          if (nextPoint) {
            pathDist += (1000 - Math.sqrt(Math.pow(nextPoint.x - enemy.x, 2) + Math.pow(nextPoint.y - enemy.y, 2)));
          }
          if (pathDist > minPathDist) {
            minPathDist = pathDist;
            target = enemy;
          }
        }
      }
      
      if (target) {
        tower.cooldown = tower.fireRate;
        
        this.state.projectiles.push({
          id: Math.random().toString(36).substring(2, 9),
          x: tower.x,
          y: tower.y,
          targetId: target.id,
          speed: 8,
          damage: tower.damage,
          type: tower.type,
          aoe: tower.type === 'sisifo' ? 60 : 0,
          slow: tower.type === 'medusa' ? 0.5 : 0,
        });
      }
    }

    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      const target = this.state.enemies.find(e => e.id === proj.targetId);
      
      if (!target) {
        this.state.projectiles.splice(i, 1);
        continue;
      }
      
      const dx = target.x - proj.x;
      const dy = target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= proj.speed) {
        this.state.projectiles.splice(i, 1);
        
        if (proj.aoe && proj.aoe > 0) {
          for (const enemy of this.state.enemies) {
            const edist = Math.sqrt(Math.pow(enemy.x - target.x, 2) + Math.pow(enemy.y - target.y, 2));
            if (edist <= proj.aoe) {
              this.damageEnemy(enemy, proj.damage, proj.slow);
            }
          }
        } else {
          this.damageEnemy(target, proj.damage, proj.slow);
        }
      } else {
        proj.x += (dx / dist) * proj.speed;
        proj.y += (dy / dist) * proj.speed;
      }
    }
    
    const deadEnemies = this.state.enemies.filter(e => e.hp <= 0);
    if (deadEnemies.length > 0) {
      for (const dead of deadEnemies) {
        this.state.obolos += dead.reward;
        this.state.enemiesKilled++;
      }
      this.state.enemies = this.state.enemies.filter(e => e.hp > 0);
      this.onStateChange({ ...this.state });
    }
  }

  private damageEnemy(enemy: Enemy, damage: number, slow?: number) {
    enemy.hp -= damage;
    if (enemy.type === 'especial' && enemy.hp > 0 && !enemy.invisible && Math.random() < 0.3) {
      enemy.invisible = true;
      enemy.invisibleTimer = 120;
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const bgFundo = this.assets.get('bg_fundo');
    if (bgFundo && bgFundo.complete && bgFundo.naturalWidth > 0) {
      this.ctx.drawImage(bgFundo, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#1c1917';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.fillStyle = '#292524';
    this.ctx.beginPath();
    this.ctx.arc(200, 150, 100, 0, Math.PI * 2);
    this.ctx.arc(600, 400, 150, 0, Math.PI * 2);
    this.ctx.arc(100, 500, 120, 0, Math.PI * 2);
    this.ctx.arc(700, 100, 80, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#292524';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.canvas.width; x += CELL_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += CELL_SIZE) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    for (const item of SCENERY) {
      if (item.type === 'pool') {
        const px = item.x * CELL_SIZE + CELL_SIZE / 2;
        const py = item.y * CELL_SIZE + CELL_SIZE / 2;
        
        const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, item.radius || CELL_SIZE);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.4, '#dc2626');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(px, py, item.radius || CELL_SIZE, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    const bgCaminho = this.assets.get('bg_caminho');
    if (bgCaminho && bgCaminho.complete && bgCaminho.naturalWidth > 0) {
      const pattern = this.ctx.createPattern(bgCaminho, 'repeat');
      this.ctx.strokeStyle = pattern || '#292524';
    } else {
      this.ctx.strokeStyle = '#292524';
    }
    this.ctx.lineWidth = CELL_SIZE + 4;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(PATH_PIXELS[0].x, PATH_PIXELS[0].y);
    for (let i = 1; i < PATH_PIXELS.length; i++) {
      this.ctx.lineTo(PATH_PIXELS[i].x, PATH_PIXELS[i].y);
    }
    this.ctx.stroke();

    this.ctx.strokeStyle = '#44403c';
    this.ctx.lineWidth = CELL_SIZE - 2;
    this.ctx.stroke();
    
    this.ctx.strokeStyle = '#57534e';
    this.ctx.lineWidth = CELL_SIZE - 10;
    this.ctx.setLineDash([15, 10]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    for (const item of SCENERY) {
      const px = item.x * CELL_SIZE + CELL_SIZE / 2;
      const py = item.y * CELL_SIZE + CELL_SIZE / 2;

      if (item.type === 'column') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 8, py + 8, 15, 8, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#d6d3d1';
        this.ctx.beginPath();
        this.ctx.arc(px, py, 14, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#a8a29e';
        this.ctx.beginPath();
        this.ctx.arc(px - 2, py - 2, 10, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (item.type === 'rock') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + 8, py + 8, 18, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#57534e';
        this.ctx.beginPath();
        this.ctx.moveTo(px - 15, py + 10);
        this.ctx.lineTo(px - 5, py - 15);
        this.ctx.lineTo(px + 10, py - 10);
        this.ctx.lineTo(px + 18, py + 5);
        this.ctx.lineTo(px + 5, py + 15);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#78716c';
        this.ctx.beginPath();
        this.ctx.moveTo(px - 10, py + 5);
        this.ctx.lineTo(px - 2, py - 10);
        this.ctx.lineTo(px + 8, py - 5);
        this.ctx.fill();
      }
    }

    if (this.selectedTowerId) {
      const tower = this.state.towers.find(t => t.id === this.selectedTowerId);
      if (tower) {
        const stats = TOWER_STATS[tower.type];
        const gradient = this.ctx.createRadialGradient(tower.x, tower.y, 0, tower.x, tower.y, tower.range);
        gradient.addColorStop(0, `${stats.color}80`);
        gradient.addColorStop(1, `${stats.color}00`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = `${stats.color}40`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }

    for (const tower of this.state.towers) {
      if (tower.type === 'medusa') {
        const stats = TOWER_STATS[tower.type];
        const pulse = Math.sin(this.frameCount * 0.05) * 0.2 + 0.8;
        const gradient = this.ctx.createRadialGradient(tower.x, tower.y, 0, tower.x, tower.y, tower.range * pulse);
        gradient.addColorStop(0, `${stats.color}40`); 
        gradient.addColorStop(1, `${stats.color}00`); 
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range * pulse, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    for (const tower of this.state.towers) {
      const stats = TOWER_STATS[tower.type];
      const img = this.assets.get(`tower_${tower.type}`);
      
      if (img && img.complete && img.naturalWidth > 0) {
        this.ctx.drawImage(img, tower.x - CELL_SIZE / 2, tower.y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
      } else {
        this.ctx.fillStyle = '#292524';
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#78716c';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        const gradient = this.ctx.createRadialGradient(tower.x, tower.y, 0, tower.x, tower.y, CELL_SIZE / 2 - 6);
        gradient.addColorStop(0, stats.color);
        gradient.addColorStop(1, '#1c1917');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, CELL_SIZE / 2 - 6, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      const romanLevels = ['I', 'II', 'III'];
      this.ctx.fillStyle = '#fef08a';
      this.ctx.font = 'bold 12px Cinzel, serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(romanLevels[tower.level], tower.x, tower.y + CELL_SIZE / 2 + 10);
    }

    for (const enemy of this.state.enemies) {
      if (enemy.invisible) {
        this.ctx.globalAlpha = 0.3;
      }
      
      const stats = ENEMY_STATS[enemy.type];
      const img = this.assets.get(`enemy_${enemy.type}`);
      
      if (img && img.complete && img.naturalWidth > 0) {
        this.ctx.drawImage(img, enemy.x - stats.radius, enemy.y - stats.radius, stats.radius * 2, stats.radius * 2);
      } else {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = stats.color;
        
        this.ctx.fillStyle = stats.color;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, stats.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.globalAlpha = 1.0;
      
      const hpPercent = enemy.hp / enemy.maxHp;
      this.ctx.fillStyle = '#7f1d1d';
      this.ctx.fillRect(enemy.x - 10, enemy.y - stats.radius - 8, 20, 3);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(enemy.x - 10, enemy.y - stats.radius - 8, 20 * hpPercent, 3);
    }

    for (const proj of this.state.projectiles) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = TOWER_STATS[proj.type].color;
      this.ctx.fillStyle = '#fef08a';
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }
}
