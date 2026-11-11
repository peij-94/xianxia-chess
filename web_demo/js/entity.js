/**
 * 《山海问道录·天衍棋局》16-Bit 战场实体单位 (修仙者 / 山海异兽)
 */

class Unit {
  constructor(template, x, y, customTeam = null) {
    this.id = template.id + '_' + Math.random().toString(36).substring(2, 7);
    this.templateId = template.id;
    this.name = template.name;
    this.title = template.title;
    this.realm = template.realm;
    this.avatarImg = template.avatarImg || null;
    this.avatarFallback = template.avatarFallback || '☯';
    this.element = template.element;
    this.team = customTeam || template.team;
    this.quote = template.quote;

    // 核心数值
    this.maxHp = template.maxHp;
    this.hp = template.maxHp;
    this.maxQi = template.maxQi;
    this.qi = Math.floor(template.maxQi * 0.5); // 开局拥有一半初始真元
    this.attack = template.attack;
    this.defense = template.defense;
    this.moveRange = template.moveRange;
    this.skills = [...template.skills];

    // 棋盘位置与状态
    this.x = x;
    this.y = y;
    this.prevX = x; // 悔棋回退点
    this.prevY = y;
    this.facing = this.team === TEAM.PLAYER ? 'EAST' : 'WEST';
    this.isAlive = true;
    this.hasMoved = false;
    this.hasActed = false;

    // 动作状态与动效计时器 ('idle', 'move', 'guard', 'attack1', 'attack2', 'hit')
    this.actionState = 'idle';
    this.actionTimer = 0;
    this.hitFlashTimer = 0;

    // 渲染平滑物理坐标与移动轨迹
    this.renderX = x;
    this.renderY = y;
    this.isMoving = false;
    this.movePath = [];
    this.currentPathIndex = 0;
    this.moveSpeed = 3.6; // 每秒移动约 3.6 格 (单格耗时约 280ms，展现行云流水且清晰可见的踏星移动过场)
    this.trailPositions = []; // 踏星轨迹点
    this.onMoveComplete = null;

    // 突破等级
    this.breakthroughLevel = 0;

    // 增益与减益
    this.statusEffects = [];
  }

  get isDone() {
    return this.hasMoved && this.hasActed;
  }

  // 播放特定动作姿势
  playAction(action, duration = 0.5) {
    this.actionState = action;
    this.actionTimer = duration;
  }

  // 帧更新动作计时器与平滑移动插值
  update(dt = 0.016) {
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }
    if (this.actionTimer > 0 && !this.isMoving) {
      this.actionTimer -= dt;
      if (this.actionTimer <= 0 && this.actionState !== 'guard') {
        this.actionState = 'idle';
      }
    }

    // 平滑路径行进更新
    if (this.isMoving && this.movePath && this.movePath.length > 0) {
      const target = this.movePath[this.currentPathIndex];
      if (target) {
        const dx = target.x - this.renderX;
        const dy = target.y - this.renderY;
        const dist = Math.hypot(dx, dy);

        // 动态根据横向行进朝向
        if (Math.abs(dx) > 0.05) {
          this.facing = dx > 0 ? 'EAST' : 'WEST';
        }

        // 记录踏星轨迹点
        if (!this.trailPositions) this.trailPositions = [];
        this.trailPositions.push({ x: this.renderX, y: this.renderY, alpha: 0.8 });
        if (this.trailPositions.length > 10) this.trailPositions.shift();

        const step = this.moveSpeed * dt;
        if (dist <= step) {
          // 到达当前路径节点
          this.renderX = target.x;
          this.renderY = target.y;
          this.x = target.x;
          this.y = target.y;
          this.currentPathIndex++;

          // 踩下路点，播放一步仙风踏星微音
          if (typeof window !== 'undefined' && window.sound && window.sound.playSelect) {
            window.sound.playSelect();
          }

          if (this.currentPathIndex >= this.movePath.length) {
            // 完整走完全部路径，顺利落位
            this.isMoving = false;
            this.renderX = this.x;
            this.renderY = this.y;
            this.playAction('idle', 0);
            const cb = this.onMoveComplete;
            this.onMoveComplete = null;
            if (cb) cb();
          } else {
            const nextTarget = this.movePath[this.currentPathIndex];
            if (nextTarget && Math.abs(nextTarget.x - this.x) > 0.05) {
              this.facing = nextTarget.x > this.x ? 'EAST' : 'WEST';
            }
          }
        } else {
          this.renderX += (dx / dist) * step;
          this.renderY += (dy / dist) * step;
        }
      } else {
        this.isMoving = false;
        this.renderX = this.x;
        this.renderY = this.y;
      }
    }

    // 衰减足迹残影透明度
    if (this.trailPositions && this.trailPositions.length > 0) {
      for (let i = this.trailPositions.length - 1; i >= 0; i--) {
        this.trailPositions[i].alpha -= dt * 2.8;
        if (this.trailPositions[i].alpha <= 0) {
          this.trailPositions.splice(i, 1);
        }
      }
    }
  }

  // 获取当前动作状态徽章
  getActionBadge() {
    switch (this.actionState) {
      case 'move': return { text: '【🏃 踏星移行】', color: '#38bdf8' };
      case 'guard': return { text: '【🛡️ 凝气御守】', color: '#ecc981' };
      case 'attack1': return { text: '【⚔️ 破煞杀伐】', color: '#f87171' };
      case 'attack2': return { text: '【⚡ 混元极意】', color: '#c084fc' };
      case 'hit': return { text: '【💥 破防受创】', color: '#fb7185' };
      case 'idle':
      default:
        return { text: '【🧘 待机吐纳】', color: '#4ade80' };
    }
  }

  // 沿指定网格路径平滑御风行进 (带移动动作精灵图与踏星轨迹)
  startPathMove(path, onComplete) {
    if (!path || path.length <= 1) {
      if (path && path.length === 1) {
        this.x = path[0].x;
        this.y = path[0].y;
        this.renderX = this.x;
        this.renderY = this.y;
      }
      this.hasMoved = true;
      if (onComplete) onComplete();
      return;
    }

    this.prevX = this.x;
    this.prevY = this.y;
    this.hasMoved = true;
    this.isMoving = true;
    this.movePath = [...path];
    this.currentPathIndex = 1;
    this.renderX = path[0].x;
    this.renderY = path[0].y;
    this.trailPositions = [];
    this.onMoveComplete = onComplete;

    // 初始朝向
    if (path[1].x > path[0].x) this.facing = 'EAST';
    else if (path[1].x < path[0].x) this.facing = 'WEST';

    // 立即激活移动姿态精灵图！
    this.playAction('move', 999);
  }

  // 记录移动历史 (兼容直接设点)
  recordMove(newX, newY) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = newX;
    this.y = newY;
    this.renderX = newX;
    this.renderY = newY;
    this.hasMoved = true;
    this.playAction('move', 0.45);
  }

  // 悔棋回退一步
  undoMove() {
    if (this.hasMoved && !this.hasActed) {
      this.x = this.prevX;
      this.y = this.prevY;
      this.renderX = this.prevX;
      this.renderY = this.prevY;
      this.hasMoved = false;
      this.isMoving = false;
      this.movePath = [];
      this.trailPositions = [];
      this.actionState = 'idle';
      this.actionTimer = 0;
      return true;
    }
    return false;
  }

  // 境界突破 (修仙问道)
  breakthroughRealm() {
    this.breakthroughLevel++;
    this.maxHp += 30;
    this.hp = this.maxHp;
    this.attack += 10;
    this.defense += 4;
    this.maxQi += 1;
    this.qi = this.maxQi;

    if (this.templateId === 'lingxu') {
      this.realm = '太虚元婴真君';
      if (!this.skills.some(s => s.id === 'SWORD_AURA_BURST')) {
        this.skills.push(SKILLS.SWORD_AURA_BURST);
      }
    } else if (this.templateId === 'baiqian') {
      this.realm = '青丘九尾真仙';
      if (!this.skills.some(s => s.id === 'NINE_TAIL_RENEW')) {
        this.skills.push(SKILLS.NINE_TAIL_RENEW);
      }
    } else if (this.templateId === 'bifang') {
      this.realm = '大荒纯阳神羽';
      this.attack += 12;
    }
  }

  startTurn(terrainType) {
    if (!this.isAlive) return;

    this.hasMoved = false;
    this.hasActed = false;
    this.actionState = 'idle';
    this.actionTimer = 0;
    this.prevX = this.x;
    this.prevY = this.y;

    // 吐纳自然恢复 1 点真元
    this.qi = Math.min(this.maxQi, this.qi + 1);

    // 地形加成判定
    if (terrainType === TERRAIN_TYPE.WATER_SPRING) {
      const healAmt = 25;
      const oldHp = this.hp;
      this.hp = Math.min(this.maxHp, this.hp + healAmt);
      this.qi = Math.min(this.maxQi, this.qi + 1);
      return {
        type: 'TERRAIN_BUFF',
        text: `【水华灵泉】吐纳滋润：气血+${this.hp - oldHp}，真元+1`
      };
    }

    // 结算负面状态
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      effect.duration -= 1;
      if (effect.duration <= 0) {
        this.statusEffects.splice(i, 1);
      }
    }

    return null;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.isAlive = false;
    } else {
      this.playAction('hit', 0.35);
      this.hitFlashTimer = 0.25;
    }
    return this.hp;
  }

  receiveHeal(amount) {
    const prev = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - prev;
  }

  consumeQi(amount) {
    if (this.qi >= amount) {
      this.qi -= amount;
      return true;
    }
    return false;
  }

  addStatus(status) {
    const existing = this.statusEffects.find(s => s.type === status.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, status.duration);
    } else {
      this.statusEffects.push({ ...status });
    }
  }

  getEffectiveDefense() {
    let def = this.defense;
    this.statusEffects.forEach(e => {
      if (e.stat === 'defense') def -= e.value;
    });
    return Math.max(0, def);
  }

  getEffectiveAttack() {
    let atk = this.attack;
    this.statusEffects.forEach(e => {
      if (e.stat === 'attack') atk *= (1 - e.reduction);
    });
    return Math.max(1, Math.round(atk));
  }
}
