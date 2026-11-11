/**
 * 《山海问道录·天衍棋局》演武演道 · 练习与沙盒研道系统 (Practice Sandbox Mode)
 * 支持：自定义我方队伍与境界、敌方凶兽组合自选、地貌天象切换、沙盒法则（无限真元/木桩靶标/无敌护体）
 */

class PracticeManager {
  constructor(game) {
    this.game = game;
    this.isActive = false;

    // 默认配置
    this.config = {
      playerUnits: ['lingxu', 'baiqian', 'bifang'],
      enemyUnits: ['huodou', 'gudiao'],
      playerRealmLevel: 0, // 0:金丹, 1:元婴, 2:化神
      terrainTheme: 'BALANCED', // BALANCED, FIRE, WATER, WOOD, STONE
      celestial: 'NORMAL', // NORMAL, DAY, NIGHT
      infiniteQi: false,
      invinciblePlayer: false,
      dummyEnemy: false
    };
  }

  // 启动演武练习战局
  startBattle(customConfig = null) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    this.isActive = true;
    this.game.roguelike.isActive = false;
    this.game.celestialCycle = this.config.celestial;

    // 1. 生成演武棋盘地脉
    this.setupPracticeGrid(this.config.terrainTheme);

    // 2. 放置我方修仙者 (20x20 演武战阵)
    this.game.units = [];
    const playerSlots = [
      { x: 3, y: 8 },
      { x: 3, y: 11 },
      { x: 2, y: 9 },
      { x: 2, y: 12 }
    ];

    this.config.playerUnits.forEach((tplId, idx) => {
      const template = UNIT_TEMPLATES[tplId];
      if (!template) return;
      const slot = playerSlots[idx % playerSlots.length];
      const unit = new Unit(template, slot.x, slot.y, TEAM.PLAYER);

      // 根据境界等级突破
      for (let r = 0; r < this.config.playerRealmLevel; r++) {
        unit.breakthroughRealm();
      }

      if (this.config.infiniteQi) {
        unit.maxQi = 99;
        unit.qi = 99;
      }

      this.game.units.push(unit);
    });

    // 3. 放置敌对凶兽
    const enemySlots = [
      { x: 16, y: 8 },
      { x: 16, y: 11 },
      { x: 15, y: 7 },
      { x: 15, y: 12 },
      { x: 17, y: 7 },
      { x: 17, y: 12 }
    ];

    this.config.enemyUnits.forEach((tplId, idx) => {
      const template = UNIT_TEMPLATES[tplId];
      if (!template) return;
      const slot = enemySlots[idx % enemySlots.length];
      const beast = new Unit(template, slot.x, slot.y, TEAM.ENEMY);
      this.game.units.push(beast);
    });

    this.game.currentTurn = TEAM.PLAYER;
    this.game.round = 1;
    this.game.isGameOver = false;
    this.game.clearSelection();

    // 更新界面
    this.game.ui.updateTurnDisplay(this.game.currentTurn, this.game.round, {
      title: '演武演道 · 战阵推演道场',
      target: '自由研习五行生克、背刺穿透与神通合击',
      specialTerrain: `沙盒法则：${this.config.infiniteQi ? '【无限真元】' : ''}${this.config.invinciblePlayer ? '【纯阳不灭】' : ''}${this.config.dummyEnemy ? '【木桩靶标】' : ''}`
    });
    this.game.ui.updateUnitCard(null);

    this.game.addLog('╔══════════════════════════════════════╗');
    this.game.addLog('║    演武道场启幕 · 研习天衍战阵！     ║');
    this.game.addLog('╚══════════════════════════════════════╝');
    this.game.addLog(`我方参战：${this.config.playerUnits.map(id => UNIT_TEMPLATES[id]?.name).join('、')} ｜ 假想敌：${this.config.enemyUnits.map(id => UNIT_TEMPLATES[id]?.name).join('、')}`);

    window.sound.playBell();
  }

  setupPracticeGrid(theme) {
    const grid = this.game.grid;
    grid.initBlankMap();

    if (theme === 'FIRE') {
      [[6, 6], [7, 7], [8, 8], [11, 11], [12, 12], [13, 13], [8, 12], [12, 8]].forEach(([x, y]) => {
        grid.setTerrain(x, y, TERRAIN_TYPE.FIRE_VEIN);
      });
      [[10, 9], [10, 10]].forEach(([x, y]) => {
        grid.setTerrain(x, y, TERRAIN_TYPE.STONE_WALL);
      });
    } else if (theme === 'WATER') {
      [[6, 8], [7, 8], [12, 11], [13, 11], [9, 14], [10, 5]].forEach(([x, y]) => {
        grid.setTerrain(x, y, TERRAIN_TYPE.WATER_SPRING);
      });
    } else if (theme === 'WOOD') {
      [[5, 5], [14, 5], [5, 14], [14, 14], [9, 8], [10, 11]].forEach(([x, y]) => {
        grid.setTerrain(x, y, TERRAIN_TYPE.WOOD_GROVE);
      });
    } else if (theme === 'STONE') {
      [[6, 6], [13, 6], [6, 13], [13, 13], [9, 9], [10, 10]].forEach(([x, y]) => {
        grid.setTerrain(x, y, TERRAIN_TYPE.STONE_WALL);
      });
    } else {
      // 均衡
      [[6, 7], [13, 12]].forEach(([x, y]) => grid.setTerrain(x, y, TERRAIN_TYPE.WATER_SPRING));
      [[8, 12], [11, 7]].forEach(([x, y]) => grid.setTerrain(x, y, TERRAIN_TYPE.FIRE_VEIN));
      [[7, 10], [12, 9]].forEach(([x, y]) => grid.setTerrain(x, y, TERRAIN_TYPE.WOOD_GROVE));
      [[9, 8], [10, 11], [8, 9], [11, 10]].forEach(([x, y]) => grid.setTerrain(x, y, TERRAIN_TYPE.STONE_WALL));
    }
  }

  // 沙盒逻辑拦截
  applySandboxRules(attacker, defender) {
    if (this.isActive) {
      if (this.config.infiniteQi && attacker.team === TEAM.PLAYER) {
        attacker.qi = attacker.maxQi;
      }
    }
  }
}

window.PracticeManager = PracticeManager;
