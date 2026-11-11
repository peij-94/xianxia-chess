/**
 * 《山海问道录·天衍棋局》五藏山经 · Roguelike 随机秘境核心架构 (Roguelike Core)
 * 具备：分岔舆图导航、修仙队伍血量继承、多宝商行、灵泉道场、随机奇遇、遗宝拾取与断点自动存盘
 */

const MOUNTAIN_REALMS = [
  {
    floor: 1,
    name: '南山之境 · 祝融遗火',
    subtitle: '招摇之山 · 狂焰初炽',
    desc: '招摇之山，祝融残焰不熄。烈火狂妖在此潜伏。',
    minions: ['huodou', 'gudiao'],
    boss: 'huodou',
    terrainFocus: TERRAIN_TYPE.FIRE_VEIN,
    stonesReward: 160
  },
  {
    floor: 2,
    name: '西山之境 · 崇阿金石',
    subtitle: '华山之首 · 凶神撼岳',
    desc: '华山之首，金石铮鸣。凶禽破空，恶兽守隘。',
    minions: ['gudiao', 'huodou'],
    boss: 'dangkang', // 梼杌
    terrainFocus: TERRAIN_TYPE.STONE_WALL,
    stonesReward: 240
  },
  {
    floor: 3,
    name: '北山之境 · 九首腐泽',
    subtitle: '诸山之汇 · 万毒噬生',
    desc: '诸山之汇，相柳毒雾封锁古道，步步皆是死泽。',
    minions: ['gudiao', 'huodou'],
    boss: 'xiangliu', // 相柳
    terrainFocus: TERRAIN_TYPE.WATER_SPRING,
    stonesReward: 320
  },
  {
    floor: 4,
    name: '中山之境 · 狂风嗜骨',
    subtitle: '荆山苍茫 · 黑翼恶虎',
    desc: '荆山苍茫，穷奇振翼掠食，杀生以奉凶恶。',
    minions: ['huodou', 'gudiao'],
    boss: 'qiongqi', // 穷奇
    terrainFocus: TERRAIN_TYPE.WOOD_GROVE,
    stonesReward: 450
  },
  {
    floor: 5,
    name: '章尾绝巅 · 烛龙阴阳',
    subtitle: '章尾神山 · 逆转乾坤',
    desc: '大荒极北，章尾神山！烛九阴张目为昼闭目为夜，乾坤逆乱！',
    minions: ['xiangliu', 'qiongqi'],
    boss: 'zhujiuyin', // 烛九阴
    terrainFocus: TERRAIN_TYPE.FIRE_VEIN,
    stonesReward: 888
  }
];

class RoguelikeManager {
  constructor(game) {
    this.game = game;
    this.isActive = false;
    this.currentFloor = 1;
    this.map = null; // MountainMap 实例
    this.currentNode = null;
    this.relics = []; // 激活的遗宝列表
    this.eventHistory = [];
    this.partyState = []; // 队伍跨战斗持久血量状态
    this.starterBonusQi = 0; // 灵泉淬炼增益
  }

  // 1. 开启全新肉鸽冒险
  startRun() {
    this.isActive = true;
    this.currentFloor = 1;
    this.relics = [];
    this.eventHistory = [];
    this.starterBonusQi = 0;
    this.game.spiritStones = 200; // 初始灵石

    // 初始化我方 3 人修仙队伍持久状态
    this.initPartyState();

    // 随机赠送一件初始遗宝
    const initialRelic = ROGUELIKE_RELICS[Math.floor(Math.random() * ROGUELIKE_RELICS.length)];
    this.addRelic(initialRelic);

    // 生成第 1 层地图
    this.map = new MountainMap(1);
    this.currentNode = null;

    this.game.addLog(`╔══════════════════════════════════════╗`);
    this.game.addLog(`║  启程【五藏山经·肉鸽秘境】潜修问道！  ║`);
    this.game.addLog(`╚══════════════════════════════════════╝`);
    this.game.addLog(`天道赐福，获初始遗宝【${initialRelic.name}】：${initialRelic.desc}`);

    // 保存存档并切换至舆图界面
    this.autoSave();
    this.game.switchView('MAP');
    window.sound.playBell();
  }

  initPartyState() {
    const defaultTemplates = ['lingxu', 'baiqian', 'bifang'];
    this.partyState = defaultTemplates.map(tplId => {
      const tpl = UNIT_TEMPLATES[tplId];
      return {
        templateId: tplId,
        name: tpl.name,
        title: tpl.title,
        realm: tpl.realm,
        element: tpl.element,
        maxHp: tpl.maxHp,
        currentHp: tpl.maxHp,
        maxQi: tpl.maxQi,
        attack: tpl.attack,
        defense: tpl.defense,
        moveRange: tpl.moveRange,
        breakthroughLevel: 0,
        isAlive: true
      };
    });
  }

  hasRelic(relicId) {
    return this.relics.some(r => r.id === relicId);
  }

  addRelic(relic) {
    if (!this.hasRelic(relic.id)) {
      this.relics.push(relic);
      window.saveManager.recordRelicUnlocked(relic.id);
      this.game.ui.updateRelicsBar(this.relics);
    }
  }

  getCurrentRealmConfig() {
    return MOUNTAIN_REALMS.find(r => r.floor === this.currentFloor) || MOUNTAIN_REALMS[0];
  }

  // 2. 玩家在舆图上点击节点前进
  enterNode(nodeId) {
    const node = this.map.moveToNode(nodeId);
    if (!node) return;
    this.currentNode = node;
    this.game.addLog(`--- 踏入【${node.title}】(${node.desc}) ---`);

    if (node.type === 'BATTLE') {
      this.startNodeBattle(false);
    } else if (node.type === 'ELITE') {
      this.startNodeBattle(true);
    } else if (node.type === 'BOSS') {
      this.startNodeBattle(false, true);
    } else if (node.type === 'EVENT') {
      this.triggerRandomEvent();
    } else if (node.type === 'REST') {
      this.triggerRestSite();
    } else if (node.type === 'SHOP') {
      this.triggerShopSite();
    }
    this.autoSave();
  }

  // 启动节点战斗 (普通战斗 / 精英战斗 / Boss战斗)
  startNodeBattle(isElite = false, isBoss = false) {
    const realm = this.getCurrentRealmConfig();
    this.game.currentChapterId = `ROGUELIKE_${this.currentFloor}`;
    this.game.celestialCycle = (this.currentFloor === 5) ? 'DAY' : 'NORMAL';

    // 1. 生成 20x20 随机秘境宏大战场
    this.generateProceduralGrid(realm);

    // 2. 放置玩家修仙者 (载入持久血量与属性)
    this.game.units = [];
    const playerPositions = [
      { x: 3, y: 9 },
      { x: 3, y: 11 },
      { x: 2, y: 10 }
    ];

    this.partyState.forEach((pState, idx) => {
      const template = UNIT_TEMPLATES[pState.templateId];
      const pos = playerPositions[idx % playerPositions.length];
      const unit = new Unit(template, pos.x, pos.y, TEAM.PLAYER);

      // 同步持久数值
      unit.maxHp = pState.maxHp;
      unit.hp = Math.max(1, pState.currentHp); // 确保只要在队伍中至少有气血
      unit.maxQi = pState.maxQi;
      unit.attack = pState.attack;
      unit.defense = pState.defense;
      unit.moveRange = pState.moveRange;
      unit.breakthroughLevel = pState.breakthroughLevel;
      unit.isAlive = pState.isAlive;

      // 遗宝修正
      if (this.hasRelic('CHENGHUANG_FUR')) {
        unit.moveRange += 1;
      }
      if (this.hasRelic('HETU_BOOK')) {
        unit.qi = Math.min(unit.maxQi, unit.qi + 2);
      }
      if (this.starterBonusQi > 0) {
        unit.qi = Math.min(unit.maxQi, unit.qi + this.starterBonusQi);
      }

      this.game.units.push(unit);
    });

    // 3. 动态生成敌方单位
    const enemies = this.generateNodeEnemies(realm, isElite, isBoss);
    enemies.forEach(e => {
      const template = UNIT_TEMPLATES[e.template];
      const unit = new Unit(template, e.x, e.y, TEAM.ENEMY);

      // 层数与精英阶梯加成
      if (isElite) {
        unit.maxHp = Math.round(unit.maxHp * 1.35);
        unit.hp = unit.maxHp;
        unit.attack += 6;
      }
      if (this.currentFloor > 2) {
        unit.maxHp += (this.currentFloor - 2) * 15;
        unit.hp = unit.maxHp;
        unit.attack += (this.currentFloor - 2) * 3;
      }

      this.game.units.push(unit);
    });

    this.game.currentTurn = TEAM.PLAYER;
    this.game.round = 1;
    this.game.isGameOver = false;
    this.game.clearSelection();

    // 更新界面与切换至棋盘视窗
    const battleTitle = isBoss ?
      `【境主决战】${realm.name} · ${UNIT_TEMPLATES[realm.boss]?.name}` :
      (isElite ? `【荒古精英】${realm.name}` : `【妖兽遭遇】${realm.name}`);

    this.game.ui.updateTurnDisplay(this.game.currentTurn, this.game.round, {
      title: battleTitle,
      target: isBoss ? `斩灭太古神魔【${UNIT_TEMPLATES[realm.boss]?.name}】！` : '荡平来犯凶煞！',
      specialTerrain: realm.desc
    });
    this.game.ui.updateUnitCard(null);
    this.game.ui.updateSpiritStones(this.game.spiritStones);

    this.game.switchView('BATTLE');
    window.sound.playBell();
  }

  generateProceduralGrid(realm) {
    const grid = this.game.grid;
    grid.initBlankMap();

    const obstacleCount = 14 + Math.floor(Math.random() * 8);
    let placedObs = 0;
    while (placedObs < obstacleCount) {
      const rx = 5 + Math.floor(Math.random() * 10);
      const ry = 2 + Math.floor(Math.random() * (grid.rows - 4));
      if (grid.getTerrain(rx, ry) === TERRAIN_TYPE.PLAIN) {
        grid.setTerrain(rx, ry, TERRAIN_TYPE.STONE_WALL);
        placedObs++;
      }
    }

    for (let i = 0; i < 5; i++) {
      const rx = 3 + Math.floor(Math.random() * (grid.cols - 6));
      const ry = 2 + Math.floor(Math.random() * (grid.rows - 4));
      if (grid.getTerrain(rx, ry) === TERRAIN_TYPE.PLAIN) {
        grid.setTerrain(rx, ry, TERRAIN_TYPE.WATER_SPRING);
      }
    }

    for (let i = 0; i < 8; i++) {
      const rx = 4 + Math.floor(Math.random() * (grid.cols - 8));
      const ry = 2 + Math.floor(Math.random() * (grid.rows - 4));
      if (grid.getTerrain(rx, ry) === TERRAIN_TYPE.PLAIN) {
        grid.setTerrain(rx, ry, realm.terrainFocus);
      }
    }
  }

  generateNodeEnemies(realm, isElite, isBoss) {
    const enemies = [];
    const usedPos = new Set();
    const getPos = () => {
      let x, y, k;
      do {
        x = 14 + Math.floor(Math.random() * 4);
        y = 5 + Math.floor(Math.random() * 10);
        k = `${x},${y}`;
      } while (usedPos.has(k));
      usedPos.add(k);
      return { x, y };
    };

    if (isBoss) {
      const p = getPos();
      enemies.push({ template: realm.boss, x: p.x, y: p.y });
      // Boss 护卫
      for (let i = 0; i < (this.currentFloor >= 4 ? 2 : 1); i++) {
        const mp = getPos();
        enemies.push({ template: realm.minions[i % realm.minions.length], x: mp.x, y: mp.y });
      }
    } else if (isElite) {
      const eliteTpl = (this.currentFloor >= 3) ? 'qiongqi' : 'dangkang';
      const ep = getPos();
      enemies.push({ template: eliteTpl, x: ep.x, y: ep.y });
      const mp = getPos();
      enemies.push({ template: realm.minions[0], x: mp.x, y: mp.y });
    } else {
      // 普通小怪 2~3 只
      const count = (this.currentFloor >= 3) ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const mp = getPos();
        enemies.push({ template: realm.minions[i % realm.minions.length], x: mp.x, y: mp.y });
      }
    }

    return enemies;
  }

  // 3. 战斗胜利结算
  onBattleVictory() {
    // 1. 同步当前战场队伍血量回持久状态
    this.syncPartyFromBattle();

    const isBoss = this.currentNode && this.currentNode.type === 'BOSS';
    const isElite = this.currentNode && this.currentNode.type === 'ELITE';
    const rewardStones = isBoss ? 350 : (isElite ? 220 : 120);

    this.game.spiritStones += rewardStones;
    this.game.ui.updateSpiritStones(this.game.spiritStones);
    this.game.addLog(`【伏妖大捷】斩获天衍灵石 +${rewardStones}！全员调息休整。`);

    if (isBoss) {
      // 首领击杀图鉴记录
      const realm = this.getCurrentRealmConfig();
      window.saveManager.recordBossKill(realm.boss);

      if (this.currentFloor >= 5) {
        // 通关全部五藏山经！
        window.saveManager.clearActiveRun();
        this.game.ui.showRoguelikeCompleteModal();
        return;
      }

      // 击破 Boss：三选一遗宝拾取，之后晋升下一山经
      this.triggerRelicReward(() => {
        this.currentFloor += 1;
        this.map = new MountainMap(this.currentFloor);
        this.currentNode = null;
        this.autoSave();
        this.game.switchView('MAP');
      });
    } else if (isElite) {
      // 精英战胜利：必得三选一遗宝拾取
      this.triggerRelicReward(() => {
        this.autoSave();
        this.game.switchView('MAP');
      });
    } else {
      // 普通战斗胜利：返回舆图
      this.autoSave();
      this.game.switchView('MAP');
    }
  }

  syncPartyFromBattle() {
    this.game.units.filter(u => u.team === TEAM.PLAYER).forEach(u => {
      const p = this.partyState.find(m => m.templateId === u.templateId);
      if (p) {
        p.currentHp = Math.max(1, u.hp); // 至少留 1 点生机
        p.isAlive = u.isAlive;
      }
    });
  }

  // 4. 三选一遗宝
  triggerRelicReward(onComplete = null) {
    const unowned = ROGUELIKE_RELICS.filter(r => !this.hasRelic(r.id));
    const pool = unowned.length >= 3 ? unowned : ROGUELIKE_RELICS;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);

    this.game.ui.showRelicSelectionModal(choices, (selectedRelic) => {
      this.addRelic(selectedRelic);
      this.game.addLog(`★ 祭炼古宝【${selectedRelic.name}】：${selectedRelic.desc}`);
      if (onComplete) onComplete();
    });
  }

  // 5. 随机奇遇
  triggerRandomEvent() {
    const unvisited = ROGUELIKE_EVENTS.filter(e => !this.eventHistory.includes(e.id));
    const evt = unvisited.length > 0 ? unvisited[Math.floor(Math.random() * unvisited.length)] : ROGUELIKE_EVENTS[0];
    this.eventHistory.push(evt.id);

    this.game.ui.showEventModal(evt, (chosenOptionKey) => {
      this.resolveEventOption(evt, chosenOptionKey);
      this.autoSave();
      this.game.switchView('MAP');
    });
  }

  resolveEventOption(evt, optionKey) {
    const opt = evt[optionKey];
    this.game.addLog(`【奇遇决断】${opt.text} ➜ ${opt.rewardText}`);

    if (opt.cost && this.game.spiritStones >= opt.cost) {
      this.game.spiritStones -= opt.cost;
      this.game.ui.updateSpiritStones(this.game.spiritStones);
    }

    if (opt.effect === 'GET_RELIC') {
      const unowned = ROGUELIKE_RELICS.filter(r => !this.hasRelic(r.id));
      if (unowned.length > 0) this.addRelic(unowned[0]);
    } else if (opt.effect === 'FULL_HEAL') {
      this.partyState.forEach(p => { p.currentHp = p.maxHp; });
      this.game.addLog('祥瑞甘霖普降，我方修仙队伍全员气血补满！');
    } else if (opt.effect === 'BOOST_ATK') {
      const lingxu = this.partyState.find(m => m.templateId === 'lingxu');
      if (lingxu) {
        lingxu.attack += 8;
        if (opt.costHp) lingxu.currentHp = Math.max(1, lingxu.currentHp - opt.costHp);
      }
    } else if (opt.effect === 'SPA_BUFF') {
      this.partyState.forEach(p => {
        p.currentHp = Math.min(p.maxHp, p.currentHp + 50);
        p.maxQi += 1;
      });
    } else if (opt.effect === 'GET_STONES_80') {
      this.game.spiritStones += 80;
      this.game.ui.updateSpiritStones(this.game.spiritStones);
    } else if (opt.effect === 'GET_STONES_50') {
      this.game.spiritStones += 50;
      this.game.ui.updateSpiritStones(this.game.spiritStones);
    }
  }

  // 6. 灵泉道场 (Rest Site)
  triggerRestSite() {
    this.game.ui.showRestSiteModal({
      onHeal: () => {
        this.partyState.forEach(p => {
          p.currentHp = Math.min(p.maxHp, Math.round(p.currentHp + p.maxHp * 0.45));
        });
        this.game.addLog('【灵泉沐浴】全员吐纳周天，气血恢复 45%！');
        this.autoSave();
        this.game.switchView('MAP');
      },
      onUpgrade: () => {
        // 队伍攻击力永久提升 5 点
        this.partyState.forEach(p => { p.attack += 5; });
        this.game.addLog('【坐忘悟道】参悟山海古经，全员攻击力永久提升 5 点！');
        this.autoSave();
        this.game.switchView('MAP');
      },
      onQiBoost: () => {
        this.starterBonusQi += 1;
        this.game.addLog('【法宝淬炼】祭炼本命神光，战斗伊始额外充盈 +1 点初始真元！');
        this.autoSave();
        this.game.switchView('MAP');
      }
    });
  }

  // 7. 多宝商行 (Shop Site)
  triggerShopSite() {
    const unownedRelics = ROGUELIKE_RELICS.filter(r => !this.hasRelic(r.id));
    const shopRelics = unownedRelics.slice(0, 3);

    this.game.ui.showShopModal({
      relics: shopRelics,
      stones: this.game.spiritStones,
      onBuyRelic: (relic, cost) => {
        if (this.game.spiritStones >= cost) {
          this.game.spiritStones -= cost;
          this.game.ui.updateSpiritStones(this.game.spiritStones);
          this.addRelic(relic);
          this.game.addLog(`【多宝阁交易】花费 ${cost} 灵石购得古宝【${relic.name}】！`);
          this.autoSave();
          return true;
        }
        return false;
      },
      onHealPill: (cost) => {
        if (this.game.spiritStones >= cost) {
          this.game.spiritStones -= cost;
          this.game.ui.updateSpiritStones(this.game.spiritStones);
          this.partyState.forEach(p => { p.currentHp = p.maxHp; });
          this.game.addLog(`【多宝阁交易】服用九转还魂丹，队伍气血全满！`);
          this.autoSave();
          return true;
        }
        return false;
      },
      onLeave: () => {
        this.autoSave();
        this.game.switchView('MAP');
      }
    });
  }

  // 8. 回合初遗宝生机结算
  onTurnStart() {
    if (this.hasRelic('JIANMU_ROOT')) {
      this.game.units.filter(u => u.isAlive && u.team === TEAM.PLAYER).forEach(u => {
        const healed = u.receiveHeal(20);
        if (healed > 0) {
          const px = (u.x + 0.5) * this.game.renderer.tileSize;
          const py = (u.y + 0.5) * this.game.renderer.tileSize;
          this.game.vfx.addText('+20 建木灵根', px, py - 20, '#65c27d', true);
        }
      });
      this.game.addLog('【遗宝生机】九畿建木灵根滋润，全员恢复 20 点气血！');
    }
  }

  // 9. 自动存盘
  autoSave() {
    if (!this.isActive) return;
    const runData = {
      isActive: this.isActive,
      currentFloor: this.currentFloor,
      realmName: this.getCurrentRealmConfig().name,
      spiritStones: this.game.spiritStones,
      partyState: this.partyState,
      relics: this.relics,
      eventHistory: this.eventHistory,
      starterBonusQi: this.starterBonusQi,
      mapData: this.map ? this.map.serialize() : null
    };
    window.saveManager.saveActiveRun(runData);
  }

  // 10. 从存档恢复肉鸽进度
  resumeSavedRun(savedData) {
    this.isActive = true;
    this.currentFloor = savedData.currentFloor || 1;
    this.game.spiritStones = savedData.spiritStones || 200;
    this.partyState = savedData.partyState || [];
    this.relics = savedData.relics || [];
    this.eventHistory = savedData.eventHistory || [];
    this.starterBonusQi = savedData.starterBonusQi || 0;

    if (savedData.mapData) {
      this.map = MountainMap.deserialize(savedData.mapData);
    } else {
      this.map = new MountainMap(this.currentFloor);
    }

    this.game.ui.updateRelicsBar(this.relics);
    this.game.ui.updateSpiritStones(this.game.spiritStones);
    this.game.addLog(`=== 继续【五藏山经·第 ${this.currentFloor} 层】潜修之行 ===`);

    this.game.switchView('MAP');
    window.sound.playBell();
  }
}

window.RoguelikeManager = RoguelikeManager;
window.MOUNTAIN_REALMS = MOUNTAIN_REALMS;
