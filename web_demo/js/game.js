/**
 * 《山海问道录·天衍棋局》16-Bit 像素战棋游戏主循环与战役系统
 */

const GAME_STATE = {
  IDLE: 'IDLE',
  UNIT_SELECTED: 'UNIT_SELECTED',
  SKILL_TARGETING: 'SKILL_TARGETING',
  RESOLVING: 'RESOLVING'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('battle-canvas');
    this.grid = new GridBoard(20, 20);
    this.vfx = new PixelVFXManager();
    this.renderer = new BoardRenderer(this.canvas, this.grid, this.vfx);

    this.currentChapterId = 1;
    this.spiritStones = 150; // 初始拥有天衍灵石
    this.units = [];
    this.currentTurn = TEAM.PLAYER;
    this.round = 1;
    this.isGameOver = false;

    // 太古天象昼夜机制 ('NORMAL', 'DAY', 'NIGHT')
    this.celestialCycle = 'NORMAL';

    // Roguelike 秘境管理器与演武道场沙盒
    this.roguelike = new RoguelikeManager(this);
    this.practice = new PracticeManager(this);

    // 交互状态
    this.state = GAME_STATE.IDLE;
    this.selectedUnit = null;
    this.selectedSkill = null;
    this.moveTiles = [];
    this.skillTargets = [];
    this.aoeTiles = [];
    this.hoveredTile = null;

    this.ui = new UIManager(this);
    this.loadChapter(1);
    this.bindCanvasEvents();
    this.startLoop();

    // 默认进入天衍主菜单视窗
    this.switchView('MAIN_MENU');
  }

  // 视窗画面切换代理
  switchView(viewName) {
    if (this.ui) {
      this.ui.switchView(viewName);
    }
  }

  getCurrentChapter() {
    return CAMPAIGN_CHAPTERS.find(c => c.id === this.currentChapterId) || CAMPAIGN_CHAPTERS[0];
  }

  // 加载指定关卡章节
  loadChapter(chapterId) {
    this.currentChapterId = chapterId;
    this.roguelike.isActive = false;
    if (this.practice) this.practice.isActive = false;
    // 第六回烛龙之战默认开启太古白昼
    this.celestialCycle = (chapterId === 6) ? 'DAY' : 'NORMAL';

    const ch = this.getCurrentChapter();

    // 1. 初始化地形
    this.grid.loadChapterMap(ch);

    // 2. 放置角色与神兽
    this.units = [];
    // 玩家方
    ch.players.forEach(p => {
      const template = UNIT_TEMPLATES[p.template];
      const unit = new Unit(template, p.x, p.y, TEAM.PLAYER);
      this.units.push(unit);
    });
    // 敌方凶兽
    ch.enemies.forEach(e => {
      const template = UNIT_TEMPLATES[e.template];
      const unit = new Unit(template, e.x, e.y, TEAM.ENEMY);
      this.units.push(unit);
    });

    this.currentTurn = TEAM.PLAYER;
    this.round = 1;
    this.isGameOver = false;
    this.clearSelection();

    this.ui.updateTurnDisplay(this.currentTurn, this.round, ch);
    this.ui.updateUnitCard(null);
    this.ui.updateSpiritStones(this.spiritStones);

    this.addLog(`=== 开启 ${ch.title} ===`);
    this.addLog(`【目标】${ch.target} ｜ 地貌：${ch.specialTerrain}`);
    if (this.celestialCycle === 'DAY') {
      this.addLog('【太古天象】烛九阴真身盘踞！章尾神山金乌当空，烈阳普照！');
    }
    window.sound.playBell();
  }

  // 逆转昼夜太极天象 (烛九阴祖神奥义)
  toggleCelestialCycle() {
    if (this.celestialCycle === 'DAY') {
      this.celestialCycle = 'NIGHT';
      this.addLog('【太古睁暝】烛九阴瞑目为夜！大荒乾坤骤暗，九幽玄夜笼罩！');
      this.vfx.addText('【九幽玄夜】', 320, 200, '#38bdf8', true);
    } else {
      this.celestialCycle = 'DAY';
      this.addLog('【太古睁暝】烛九阴张目为昼！烈阳极光普照大荒，杀伐暴击大涨！');
      this.vfx.addText('【烈阳神昼】', 320, 200, '#facc15', true);
    }
    window.sound.playBell();
    this.vfx.shake(12, 16);
  }

  restartCurrentChapter() {
    this.loadChapter(this.currentChapterId);
  }

  nextChapter() {
    const nextId = this.currentChapterId + 1;
    if (nextId <= CAMPAIGN_CHAPTERS.length) {
      this.loadChapter(nextId);
    } else {
      this.loadChapter(1);
    }
  }

  // 悔棋回退一步
  undoCurrentMove() {
    if (!this.selectedUnit || this.selectedUnit.team !== TEAM.PLAYER) return;
    if (this.selectedUnit.hasMoved && !this.selectedUnit.hasActed) {
      this.selectedUnit.undoMove();
      this.selectedSkill = null;
      this.ui.selectedSkill = null;
      this.skillTargets = [];
      this.aoeTiles = [];
      this.moveTiles = [];
      this.state = GAME_STATE.UNIT_SELECTED;

      this.addLog(`${this.selectedUnit.name} 撤销移动，踏星步回溯至 (${this.selectedUnit.x + 1}, ${this.selectedUnit.y + 1})。`);
      window.sound.playSelect();

      this.ui.currentFloatingMode = 'ACTION';
      this.ui.updateUnitCard(this.selectedUnit);
      this.ui.showFloatingActionMenu(this.selectedUnit, 'ACTION');
    }
  }

  // 境界突破
  doBreakthrough() {
    const cost = 100;
    if (this.spiritStones < cost) {
      alert(`天衍灵石不足！突破需要 ${cost} 灵石，当前仅有 ${this.spiritStones}。`);
      return;
    }

    const alivePlayerUnits = this.units.filter(u => u.isAlive && u.team === TEAM.PLAYER);
    if (alivePlayerUnits.length === 0) return;

    this.spiritStones -= cost;
    this.ui.updateSpiritStones(this.spiritStones);

    alivePlayerUnits.forEach(u => u.breakthroughRealm());
    window.sound.playVictory();
    this.vfx.shake(8, 14);

    alivePlayerUnits.forEach(u => {
      this.vfx.spawnHealVFX(
        (u.x + 0.5) * this.renderer.tileSize,
        (u.y + 0.5) * this.renderer.tileSize
      );
      this.vfx.addText('【境界突破】', (u.x + 0.5) * this.renderer.tileSize, (u.y + 0.5) * this.renderer.tileSize - 24, '#ecc981', true);
    });

    this.addLog(`★ 灵石筑基，道法通玄！太虚同盟全体突破境界，气血攻御大涨，解锁突破奥义！`);
    if (this.selectedUnit) {
      this.ui.updateUnitCard(this.selectedUnit);
    }
  }

  bindCanvasEvents() {
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
  }

  // 鼠标右键处理：智能多级取消与撤回
  onContextMenu(e) {
    e.preventDefault(); // 阻止浏览器原生右键菜单
    if (this.state === GAME_STATE.RESOLVING || this.isGameOver) return;
    if (this.currentTurn !== TEAM.PLAYER) return;

    // 1. 若当前正在技能瞄准蓄力中，右键取消技能瞄准，退回技能选择菜单
    if (this.state === GAME_STATE.SKILL_TARGETING) {
      window.sound.playSelect();
      this.selectedSkill = null;
      this.ui.selectedSkill = null;
      this.skillTargets = [];
      this.aoeTiles = [];
      this.state = GAME_STATE.UNIT_SELECTED;
      this.ui.updateUnitCard(this.selectedUnit);
      this.ui.showFloatingActionMenu(this.selectedUnit, 'SKILLS');
      return;
    }

    // 2. 若正在显示移动高亮格 (玩家点击了[移动]，但尚未移动)，右键取消移动选择，返回行动指令菜单
    if (this.moveTiles && this.moveTiles.length > 0) {
      window.sound.playSelect();
      this.moveTiles = [];
      this.ui.showFloatingActionMenu(this.selectedUnit, 'ACTION');
      return;
    }

    // 3. 若处于技能选择子菜单，右键退回一级行动菜单 (移动/攻击/防御)
    if (this.state === GAME_STATE.UNIT_SELECTED && this.ui.currentFloatingMode === 'SKILLS') {
      window.sound.playSelect();
      this.ui.showFloatingActionMenu(this.selectedUnit, 'ACTION');
      return;
    }

    // 4. 若选中的单位已移动且尚未战斗攻击，右键撤销移动回到移动前的位置！
    if (this.selectedUnit && this.selectedUnit.team === TEAM.PLAYER && this.selectedUnit.hasMoved && !this.selectedUnit.hasActed) {
      this.undoCurrentMove();
      return;
    }

    // 5. 若单位尚未移动，右键取消选中
    if (this.state === GAME_STATE.UNIT_SELECTED) {
      window.sound.playSelect();
      this.clearSelection();
      return;
    }
  }

  getTileFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    const canvasLogicalWidth = this.canvas.width / dpr;
    const canvasLogicalHeight = this.canvas.height / dpr;
    const scaleX = canvasLogicalWidth / rect.width;
    const scaleY = canvasLogicalHeight / rect.height;
    const canvasX = clientX * scaleX;
    const canvasY = clientY * scaleY;
    const x = Math.floor(canvasX / this.renderer.tileSize);
    const y = Math.floor(canvasY / this.renderer.tileSize);
    if (this.grid.isValid(x, y)) {
      return { x, y };
    }
    return null;
  }

  onMouseMove(e) {
    if (this.state === GAME_STATE.RESOLVING || this.isGameOver) return;

    const tile = this.getTileFromEvent(e);
    this.hoveredTile = tile;

    if (this.state === GAME_STATE.SKILL_TARGETING && this.selectedSkill && tile) {
      const isTargetable = this.skillTargets.some(t => t.x === tile.x && t.y === tile.y);
      if (isTargetable) {
        this.aoeTiles = this.grid.getAoeAffectedTiles(tile.x, tile.y, this.selectedSkill);
      } else {
        this.aoeTiles = [];
      }
    } else {
      this.aoeTiles = [];
    }
  }

  onMouseLeave() {
    this.hoveredTile = null;
    this.aoeTiles = [];
  }

  onClick(e) {
    if (this.state === GAME_STATE.RESOLVING || this.isGameOver) return;
    if (this.currentTurn !== TEAM.PLAYER) return;

    const tile = this.getTileFromEvent(e);
    if (!tile) return;

    let clickedUnit = this.units.find(u => u.isAlive && u.x === tile.x && u.y === tile.y);
    if (!clickedUnit && tile.y + 1 < this.grid.rows) {
      // 容差检测：若点击在当前地格下方偏低区域，可能点中了正下方角色上挑的立绘与头顶血条
      const belowUnit = this.units.find(u => u.isAlive && u.x === tile.x && u.y === tile.y + 1);
      if (belowUnit) {
        const rect = this.canvas.getBoundingClientRect();
        const clientY = e.clientY - rect.top;
        const dpr = window.devicePixelRatio || 1;
        const canvasY = clientY * ((this.canvas.height / dpr) / rect.height);
        const inTileY = canvasY - tile.y * this.renderer.tileSize;
        if (inTileY >= this.renderer.tileSize * 0.55) {
          clickedUnit = belowUnit;
        }
      }
    }

    // 1. 技能瞄准中
    if (this.state === GAME_STATE.SKILL_TARGETING) {
      const isTargetable = this.skillTargets.some(t => t.x === tile.x && t.y === tile.y);
      if (isTargetable) {
        const isHeal = this.selectedSkill.isHeal;

        // 严格区分敌我阵营！
        if (isHeal) {
          if (!clickedUnit) {
            this.addLog('【施法提示】万木回春道法需指定我方同盟修仙者施展！');
            return;
          }
          if (clickedUnit.team !== this.selectedUnit.team) {
            this.addLog('【阵营冲突】不可为敌对凶兽施加治疗！');
            return;
          }
        } else {
          // 伤害类技能
          if (clickedUnit && clickedUnit.team === this.selectedUnit.team) {
            this.addLog('【同门相护】不可攻击我方修仙同盟！请攻击敌对凶兽。');
            return;
          }
          const isAoe = this.selectedSkill.areaType && this.selectedSkill.areaType !== 'SINGLE';
          if (!isAoe && !clickedUnit) {
            this.addLog('【未锁定目标】请点击敌对凶兽所在格子施展神通！');
            return;
          }
        }

        this.executePlayerSkill(this.selectedUnit, this.selectedSkill, tile.x, tile.y);
        return;
      } else {
        this.selectedSkill = null;
        this.ui.selectedSkill = null;
        this.skillTargets = [];
        this.aoeTiles = [];
        this.state = GAME_STATE.UNIT_SELECTED;
        this.ui.updateUnitCard(this.selectedUnit);
        return;
      }
    }

    // 2. 单位已选中
    if (this.state === GAME_STATE.UNIT_SELECTED) {
      const moveDest = this.moveTiles.find(t => t.x === tile.x && t.y === tile.y);
      if (moveDest && !this.selectedUnit.hasMoved && !this.selectedUnit.isMoving) {
        const u = this.selectedUnit;
        const path = moveDest.path || [{ x: u.x, y: u.y }, { x: moveDest.x, y: moveDest.y }];
        this.moveTiles = [];
        this.ui.hideFloatingSkills();
        this.state = GAME_STATE.RESOLVING; // 行进中锁定操作，防止误触竞态
        window.sound.playMove();

        u.startPathMove(path, () => {
          this.state = GAME_STATE.UNIT_SELECTED;
          this.vfx.spawnDashVFX(
            (moveDest.x + 0.5) * this.renderer.tileSize,
            (moveDest.y + 0.5) * this.renderer.tileSize,
            (moveDest.x + 0.5) * this.renderer.tileSize,
            (moveDest.y + 0.5) * this.renderer.tileSize
          );
          this.addLog(`${u.name} 踏星移行至 (${moveDest.x + 1}, ${moveDest.y + 1})。`);
          this.ui.currentFloatingMode = 'ACTION';
          this.ui.updateUnitCard(u);
          this.ui.showFloatingActionMenu(u, 'ACTION');
          this.checkUnitAutoDone(u);
        });
        return;
      }

      // 如果当前处于移动选择中 (显示绿格) 但点击的不是可移动目标格
      if (this.moveTiles && this.moveTiles.length > 0) {
        this.moveTiles = [];
        if (clickedUnit && clickedUnit === this.selectedUnit) {
          this.ui.showFloatingActionMenu(this.selectedUnit, 'ACTION');
          return;
        }
        if (clickedUnit && clickedUnit.team === TEAM.PLAYER) {
          window.sound.playSelect();
          this.selectUnit(clickedUnit);
          return;
        }
        if (clickedUnit && clickedUnit.team === TEAM.ENEMY) {
          window.sound.playSelect();
          this.ui.updateUnitCard(clickedUnit);
          return;
        }
        // 点击空地，取消移动模式并重显行动指令菜单
        this.ui.showFloatingActionMenu(this.selectedUnit, 'ACTION');
        return;
      }

      if (clickedUnit && clickedUnit.team === TEAM.PLAYER) {
        window.sound.playSelect();
        this.selectUnit(clickedUnit);
        return;
      }

      if (clickedUnit && clickedUnit.team === TEAM.ENEMY) {
        window.sound.playSelect();
        this.ui.updateUnitCard(clickedUnit);
        return;
      }

      this.clearSelection();
      return;
    }

    // 3. 初始空闲
    if (this.state === GAME_STATE.IDLE) {
      if (clickedUnit) {
        window.sound.playSelect();
        if (clickedUnit.team === TEAM.PLAYER) {
          this.selectUnit(clickedUnit);
        } else {
          this.ui.updateUnitCard(clickedUnit);
        }
      }
    }
  }

  selectUnit(unit) {
    this.selectedUnit = unit;
    this.selectedSkill = null;
    this.ui.selectedSkill = null;
    this.skillTargets = [];
    this.aoeTiles = [];
    this.moveTiles = []; // 按照指令流：选人弹出[移动/攻击/防御]按钮，点击[移动]才展示步法格

    this.state = GAME_STATE.UNIT_SELECTED;
    this.ui.currentFloatingMode = 'ACTION';
    this.ui.updateUnitCard(unit);
    this.ui.showFloatingActionMenu(unit, 'ACTION');
  }

  startMoveSelection() {
    if (!this.selectedUnit || this.selectedUnit.team !== TEAM.PLAYER) return;
    if (this.selectedUnit.hasMoved || this.selectedUnit.hasActed) return;
    window.sound.playSelect();
    this.moveTiles = this.grid.getReachableTiles(this.selectedUnit, this.units);
    this.ui.hideFloatingSkills();
    this.ui.inspectAction('MOVE', this.selectedUnit);
    this.addLog(`【步法展开】${this.selectedUnit.name} 准备踏星移行，请在棋盘上指点青绿地格！(右键取消)`);
  }

  executeGuardAction() {
    if (!this.selectedUnit || this.selectedUnit.team !== TEAM.PLAYER) return;
    if (this.selectedUnit.hasActed) return;
    window.sound.playSelect();
    const u = this.selectedUnit;
    u.hasActed = true;
    u.hasMoved = true;
    u.playAction('guard', 9999);
    this.vfx.spawnGuardBarrierVFX(
      (u.x + 0.5) * this.renderer.tileSize,
      (u.y + 0.5) * this.renderer.tileSize
    );
    this.addLog(`${u.name} 凝气御守，吐纳周天，展开旋转护体真罡金芒！`);
    this.ui.hideFloatingSkills();
    this.clearSelection();
    this.checkTurnComplete();
  }

  selectSkill(skill) {
    if (!this.selectedUnit) return;
    this.selectedSkill = skill;
    this.ui.selectedSkill = skill;
    this.moveTiles = [];

    this.skillTargets = this.grid.getSkillTargetTiles(this.selectedUnit, skill);
    this.state = GAME_STATE.SKILL_TARGETING;
    this.ui.updateUnitCard(this.selectedUnit);
    this.ui.highlightFloatingSkill(skill);
    this.ui.inspectSkill(skill, this.selectedUnit, true);
  }

  clearSelection() {
    this.selectedUnit = null;
    this.selectedSkill = null;
    this.ui.selectedSkill = null;
    this.moveTiles = [];
    this.skillTargets = [];
    this.aoeTiles = [];
    this.state = GAME_STATE.IDLE;
    this.ui.updateUnitCard(null);
    this.ui.hideFloatingSkills();
    this.ui.resetSkillInspection();
  }

  executePlayerSkill(attacker, skill, targetX, targetY) {
    if (this.practice && this.practice.isActive && this.practice.config.infiniteQi) {
      attacker.qi = attacker.maxQi;
    } else {
      attacker.consumeQi(skill.costQi);
    }
    attacker.hasActed = true;
    attacker.hasMoved = true;

    if (targetX > attacker.x) attacker.facing = 'EAST';
    else if (targetX < attacker.x) attacker.facing = 'WEST';
    else if (targetY > attacker.y) attacker.facing = 'SOUTH';
    else if (targetY < attacker.y) attacker.facing = 'NORTH';

    this.executeSkill(attacker, skill, targetX, targetY);

    this.clearSelection();
    this.checkTurnComplete();
  }

  executeSkill(attacker, skill, targetX, targetY) {
    const affectedTiles = this.grid.getAoeAffectedTiles(targetX, targetY, skill);

    // 触发攻击者动作编排 (普通神通 attack1 突刺 / 奥义大招 attack2 腾空)
    const isAoEorUlt = (skill.areaType && skill.areaType !== 'SINGLE') || skill.costQi >= 3 || skill.id === 'ZHUJIUYIN_DAY_NIGHT' || skill.id === 'BIFANG_HELLFIRE' || skill.id === 'THOUSAND_SWORDS';
    const skillAction = isAoEorUlt ? 'attack2' : 'attack1';
    attacker.playAction(skillAction, isAoEorUlt ? 0.75 : 0.55);

    // 触发玉简立绘释放大招神光回馈
    if (this.ui && (this.ui.currentUnit === attacker || this.selectedUnit === attacker)) {
      this.ui.flashAvatarCast();
    }

    // 触发全技能专属核心武学动作与战斗特效编排 (飞剑破空、八卦剑阵、太白极刃、万木玉莲、青丘魅狐、火鸟冲刺、炎魔巨颚、风刃、地裂、九首毒沼、血爪、太极阴阳)
    this.vfx.triggerSkillChoreography(skill, attacker, targetX, targetY, this.renderer.tileSize);

    // 烛九阴太古睁暝奥义：逆转昼夜太极
    if (skill.id === 'ZHUJIUYIN_DAY_NIGHT') {
      this.toggleCelestialCycle();
    }

    // 播放对应体系芯片音效
    if (skill.id === 'ZHUJIUYIN_DAY_NIGHT') {
      window.sound.playBell();
    } else if (skill.id === 'XIANGLIU_POISON') {
      if (window.sound.playBeastRoar) window.sound.playBeastRoar();
      else window.sound.playFireBurst();
    } else if (skill.id === 'TAOWU_ROAR' || skill.id === 'DANGKANG_SLAM') {
      if (window.sound.playEarthSlam) window.sound.playEarthSlam();
      else window.sound.playHit();
    } else if (skill.id === 'QIONGQI_DIVE') {
      if (window.sound.playClawSlash) window.sound.playClawSlash();
      else window.sound.playSwordSlash();
    } else if (skill.id === 'HUODOU_BITE') {
      window.sound.playFireBurst();
    } else if (skill.id === 'GUDIAO_TALON') {
      window.sound.playSwordSlash();
    } else if (skill.element === ELEMENT.METAL) {
      window.sound.playSwordSlash();
    } else if (skill.element === ELEMENT.FIRE) {
      window.sound.playFireBurst();
    } else if (skill.isHeal) {
      window.sound.playHeal();
    } else {
      window.sound.playHit();
    }

    // 结算受击
    affectedTiles.forEach(t => {
      const targetUnit = this.units.find(u => u.isAlive && u.x === t.x && u.y === t.y);
      if (!targetUnit) return;
      if (skill.isHeal && targetUnit.team !== attacker.team) return;
      if (!skill.isHeal && targetUnit.team === attacker.team) return;

      const result = CombatResolver.resolveAttack({
        attacker,
        defender: targetUnit,
        skill,
        grid: this.grid,
        allUnits: this.units,
        game: this
      });

      this.addLog(result.log);

      const px = (targetUnit.x + 0.5) * this.renderer.tileSize;
      const py = (targetUnit.y + 0.5) * this.renderer.tileSize;

      if (result.isHeal) {
        this.vfx.addText(`+${result.healAmount} 仙露`, px, py - 20, '#65c27d', true);
        if (this.ui && this.ui.currentUnit === targetUnit) {
          this.ui.updateUnitCard(targetUnit);
        }
      } else if (result.miss) {
        this.vfx.addText('闪避', px, py - 20, '#a8a29e');
      } else {
        // 受击者立绘与卡片实时响应
        if (this.ui && this.ui.currentUnit === targetUnit) {
          this.ui.flashAvatarHit();
          this.ui.updateUnitCard(targetUnit);
        }

        const isCounter = result.elemResult.relation === 'ADVANTAGE';
        let text = `-${result.damage}`;
        if (result.isCrit) text = `【暴击】${text}`;
        if (isCounter) text = `【相克】${text}`;

        this.vfx.addText(text, px, py - 20, isCounter || result.isCrit ? '#ef4444' : '#ecc981', result.isCrit);
        this.vfx.shake(result.isCrit ? 10 : 5);

        if (result.collisionInfo && result.collisionInfo.hitWall) {
          window.sound.playHit();
          this.vfx.spawnImpactVFX(px, py);
          this.vfx.addText(`壁击 -${result.collisionInfo.collisionDmg}`, px, py - 40, '#d4a36a', true);
        }
      }
    });

    this.checkWinLoss();
  }

  checkUnitAutoDone(unit) {
    const usable = unit.skills.some(s => unit.qi >= s.costQi);
    if (!usable) {
      unit.hasActed = true;
    }
  }

  checkTurnComplete() {
    const players = this.units.filter(u => u.isAlive && u.team === TEAM.PLAYER);
    const allDone = players.every(u => u.isDone);
    if (allDone) {
      setTimeout(() => {
        if (!this.isGameOver) {
          this.switchTurn(TEAM.ENEMY);
        }
      }, 500);
    }
  }

  switchTurn(newTurn) {
    this.currentTurn = newTurn;
    this.clearSelection();

    if (newTurn === TEAM.PLAYER) {
      this.round++;
      this.addLog(`--- 第 ${this.round} 候天象交替，灵脉吐纳 ---`);
      if (this.roguelike.isActive) {
        this.roguelike.onTurnStart();
      }
      if (this.practice && this.practice.isActive && this.practice.config.infiniteQi) {
        this.units.filter(u => u.isAlive && u.team === TEAM.PLAYER).forEach(u => {
          u.qi = u.maxQi;
        });
      }
    } else {
      this.addLog(`--- 荒古凶兽狂性大发，发起攻势！ ---`);
    }

    this.units.forEach(u => {
      if (u.isAlive && u.team === newTurn) {
        const terrain = this.grid.getTerrain(u.x, u.y);
        const res = u.startTurn(terrain);
        if (res) {
          this.addLog(`${u.name}: ${res.text}`);
        }
      }
    });

    let currentTitle;
    if (this.roguelike.isActive) {
      const realm = this.roguelike.getCurrentRealmConfig();
      currentTitle = {
        title: `五藏秘境 · 第 ${this.roguelike.currentFloor} 层`,
        target: '全歼荒古妖潮',
        specialTerrain: realm ? realm.desc : '五藏山经灵脉'
      };
    } else if (this.practice && this.practice.isActive) {
      currentTitle = {
        title: '演武演道 · 战阵推演道场',
        target: '自由研习五行生克、背刺穿透与神通合击',
        specialTerrain: `沙盒法则：${this.practice.config.infiniteQi ? '【无限真元】' : ''}${this.practice.config.invinciblePlayer ? '【纯阳不灭】' : ''}${this.practice.config.dummyEnemy ? '【木桩靶标】' : ''}`
      };
    } else {
      currentTitle = this.getCurrentChapter();
    }

    this.ui.updateTurnDisplay(this.currentTurn, this.round, currentTitle);
    window.sound.playBell();

    if (newTurn === TEAM.ENEMY) {
      BeastAI.runEnemyTurn(this);
    }
  }

  checkWinLoss() {
    const alivePlayers = this.units.filter(u => u.isAlive && u.team === TEAM.PLAYER);
    const aliveEnemies = this.units.filter(u => u.isAlive && u.team === TEAM.ENEMY);

    if (aliveEnemies.length === 0 && !this.isGameOver) {
      this.isGameOver = true;
      if (this.roguelike.isActive) {
        setTimeout(() => this.roguelike.onBattleVictory(), 800);
        return;
      }
      if (this.practice && this.practice.isActive) {
        this.addLog('【演武告捷】战阵推演功德圆满！可返回演道阁重置或返回主菜单。');
        setTimeout(() => this.ui.showGameOver(true), 800);
        return;
      }
      const ch = this.getCurrentChapter();
      this.spiritStones += ch.rewardSpiritStones;
      this.ui.updateSpiritStones(this.spiritStones);
      this.addLog(`【大捷】妖潮溃败！斩获天衍灵石 +${ch.rewardSpiritStones}！`);
      setTimeout(() => this.ui.showGameOver(true), 800);
      return;
    }

    if (alivePlayers.length === 0 && !this.isGameOver) {
      this.isGameOver = true;
      if (this.roguelike.isActive) {
        window.saveManager.clearActiveRun();
        this.addLog('【大败】修仙同盟全军溃灭，五藏山经探索终结，神魂兵解……');
      } else if (this.practice && this.practice.isActive) {
        this.addLog('【演武受挫】推演受创，请调整战阵再次尝试。');
      } else {
        this.addLog('【大败】修仙同盟全军溃灭，神魂兵解……');
      }
      setTimeout(() => this.ui.showGameOver(false), 800);
      return;
    }
  }

  startLoop() {
    let lastTime = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      this.units.forEach(u => u.update(dt));
      this.vfx.update();

      this.renderer.render({
        units: this.units,
        selectedUnit: this.selectedUnit,
        moveTiles: this.moveTiles,
        skillTargets: this.skillTargets,
        aoeTiles: this.aoeTiles,
        hoveredTile: this.hoveredTile,
        celestialCycle: this.celestialCycle
      });

      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(loop);
      }
    };
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(loop);
    }
  }

  addLog(msg) {
    this.ui.addLog(msg);
  }
}


window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
