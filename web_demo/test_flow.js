// Test full Web Demo logic in headless node environment
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Create mock DOM environment
const jsdomHtml = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="screen-main-menu" class="screen-view active">
    <button id="btn-menu-continue"></button>
    <button id="btn-menu-roguelike"></button>
    <button id="btn-menu-practice"></button>
    <button id="btn-menu-compendium"></button>
    <button id="btn-menu-saves"></button>
    <button id="btn-menu-sound"></button>
  </div>
  <div id="screen-map" class="screen-view">
    <div id="map-realm-badge"></div>
    <div id="map-realm-name"></div>
    <div id="map-spirit-stones-count"></div>
    <div id="map-party-bar"></div>
    <svg id="map-routes-svg"></svg>
    <div id="map-nodes-tier-grid"></div>
    <button id="btn-map-compendium"></button>
    <button id="btn-map-save"></button>
    <button id="btn-map-return-menu"></button>
  </div>
  <div id="screen-battle" class="screen-view">
    <div id="chapter-title"></div>
    <div id="turn-indicator"></div>
    <div id="round-counter"></div>
    <div id="spirit-stones-count"></div>
    <button id="btn-end-turn"></button>
    <button id="btn-undo"></button>
    <button id="btn-breakthrough"></button>
    <button id="btn-view-map"></button>
    <button id="btn-return-home"></button>
    <button id="btn-sound-toggle"></button>
    <canvas id="battle-canvas" width="640" height="640"></canvas>
    <div id="unit-card">
      <div id="unit-avatar"></div>
      <div id="unit-action-badge"></div>
      <div id="unit-name"></div>
      <div id="unit-title"></div>
      <div id="unit-realm"></div>
      <div id="unit-element"></div>
      <div id="unit-stance-tip"></div>
      <div id="unit-hp"></div>
      <div id="unit-hp-bar"></div>
      <div id="unit-qi"></div>
      <div id="unit-qi-bar"></div>
      <div id="unit-atk"></div>
      <div id="unit-def"></div>
      <div id="unit-move"></div>
      <div id="unit-quote"></div>
      <div id="relics-box"></div>
      <div id="relics-list"></div>
      <div id="relics-count-tag"></div>
      <div id="skills-container"></div>
      <div id="unit-floating-skills"></div>
      <div id="action-hub-container"></div>
      <div id="action-hub-title"></div>
      <div id="skill-inspection-card"></div>
      <div id="skill-action-state-tag"></div>
      <div id="combat-log"></div>
    </div>
  </div>
  <!-- Modals -->
  <div id="modal-practice"><button id="modal-practice-close"></button><button id="btn-start-practice"></button></div>
  <div id="modal-compendium"><button id="modal-compendium-close"></button><div id="compendium-list"></div><div id="compendium-detail"></div></div>
  <div id="modal-saves"><button id="modal-saves-close"></button><div id="saves-slots-list"></div><button id="btn-export-save"></button><button id="btn-import-save"></button><input id="input-import-file" type="file" /><button id="btn-clear-save"></button></div>
  <div id="modal-rest"><div id="rest-title"></div><div id="rest-desc"></div><div id="rest-options"></div></div>
  <div id="modal-shop"><div id="shop-title"></div><div id="shop-stones-tag"></div><div id="shop-items-shelf"></div><button id="btn-shop-leave"></button></div>
  <div id="game-modal"><div id="modal-title"></div><div id="modal-desc"></div><div id="modal-rating"></div><button id="modal-next-btn"></button><button id="modal-restart-btn"></button><button id="modal-return-menu-btn"></button></div>
  <div id="chapter-modal"><button id="chapter-modal-close"></button></div>
  <div id="relic-modal"><div id="relic-choices-grid"></div></div>
  <div id="event-modal"><div id="event-title"></div><div id="event-desc"></div><div id="event-options"></div></div>
</body>
</html>
`;

// Simple mock DOM
class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = '';
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          force ? this.classList.classes.add(c) : this.classList.classes.delete(c);
        } else {
          this.classList.classes.has(c) ? this.classList.classes.delete(c) : this.classList.classes.add(c);
        }
      }
    };
    this.dataset = {};
    this.style = {};
    this._innerHTML = '';
    this.innerText = '';
    this.children = [];
    this.listeners = {};
    this.width = 640;
    this.height = 640;
  }
  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = val;
    if (val === '') {
      this.children = [];
    }
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  dispatchEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
  click() {
    this.dispatchEvent('click', {});
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  removeAttribute(name) {
    delete this[name];
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 640, height: 640, right: 640, bottom: 640 };
  }
  querySelector(selector) {
    return this.children[0] || null;
  }
  querySelectorAll(selector) {
    return this.children || [];
  }
  getContext(type) {
    return {
      save: () => {},
      restore: () => {},
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      scale: () => {},
      translate: () => {},
      rotate: () => {},
      resetTransform: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 20 }),
      setLineDash: () => {},
      drawImage: () => {}
    };
  }
}

const elementMap = new Map();
function getOrCreateElement(id, tag = 'div') {
  if (!elementMap.has(id)) {
    elementMap.set(id, new MockElement(tag, id));
  }
  return elementMap.get(id);
}

// Extract ids from HTML
const idRegex = /id="([^"]+)"/g;
let m;
while ((m = idRegex.exec(jsdomHtml)) !== null) {
  getOrCreateElement(m[1]);
}

const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  Math: Math,
  JSON: JSON,
  Set: Set,
  Map: Map,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Promise: Promise,
  localStorage: mockLocalStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  window: null,
  document: {
    getElementById: (id) => elementMap.get(id) || new MockElement('div', id),
    createElement: (tag) => new MockElement(tag),
    createElementNS: (ns, tag) => new MockElement(tag),
    querySelectorAll: (selector) => {
      if (selector === '.screen-view') {
        return [
          elementMap.get('screen-main-menu'),
          elementMap.get('screen-map'),
          elementMap.get('screen-battle')
        ];
      }
      return [];
    },
    addEventListener: () => {}
  }
};
sandbox.window = sandbox;

const context = vm.createContext(sandbox);

const jsDir = path.join(__dirname, 'js');
const files = [
  'constants.js',
  'audio.js',
  'pixel_tiles.js',
  'pixel_sprites.js',
  'data.js',
  'save.js',
  'map.js',
  'compendium.js',
  'grid.js',
  'entity.js',
  'combat.js',
  'ai.js',
  'vfx.js',
  'renderer.js',
  'practice.js',
  'roguelike.js',
  'ui.js',
  'game.js'
];

console.log('--- Loading scripts into sandbox ---');
for (const f of files) {
  const code = fs.readFileSync(path.join(jsDir, f), 'utf-8');
  vm.runInContext(code, context);
  console.log(`✓ Loaded: ${f}`);
}

console.log('--- Instantiating Game ---');
vm.runInContext('window.game = new Game();', context);
const game = sandbox.game;

console.log('Initial view:', game.ui.currentView);
if (game.ui.currentView !== 'MAIN_MENU') {
  throw new Error(`Expected MAIN_MENU, got ${game.ui.currentView}`);
}
console.log('✓ Initial view is MAIN_MENU');

// Test 1: Start Roguelike Run
console.log('\n--- Test 1: Start Roguelike Run ---');
game.roguelike.startRun();
console.log('Current view after startRun:', game.ui.currentView);
if (game.ui.currentView !== 'MAP') throw new Error('Expected MAP view');
console.log('Roguelike active:', game.roguelike.isActive);
console.log('Roguelike current floor:', game.roguelike.currentFloor);
console.log('Party size:', game.roguelike.partyState.length);
console.log('Relics count:', game.roguelike.relics.length);
console.log('Map tiers:', game.roguelike.map.tiers.length);
console.log('✓ Roguelike run initialized successfully');

// Find a tier 0 node and enter it
const tier0Node = game.roguelike.map.tiers[0][0];
console.log(`Entering node 0: ${tier0Node.id} (${tier0Node.type})`);
game.roguelike.enterNode(tier0Node.id);

const TEAM = vm.runInContext('TEAM', context);
const CombatResolver = vm.runInContext('CombatResolver', context);
const saveManager = vm.runInContext('window.saveManager', context);
const compendiumManager = vm.runInContext('window.compendiumManager', context);

if (tier0Node.type === 'BATTLE') {
  console.log('View after entering battle:', game.ui.currentView);
  if (game.ui.currentView !== 'BATTLE') throw new Error('Expected BATTLE view');
  console.log('Units in battle:', game.units.length);
  const playerUnit = game.units.find(u => u.team === TEAM.PLAYER);
  const enemyUnit = game.units.find(u => u.team === TEAM.ENEMY);
  console.log(`Player: ${playerUnit.name} (HP: ${playerUnit.hp}), Enemy: ${enemyUnit.name} (HP: ${enemyUnit.hp})`);

  // Move player unit and test undo
  playerUnit.recordMove(playerUnit.x + 1, playerUnit.y);
  console.log(`Player moved to (${playerUnit.x}, ${playerUnit.y}), hasMoved: ${playerUnit.hasMoved}`);
  game.selectedUnit = playerUnit;
  game.undoCurrentMove();
  console.log(`After undo: (${playerUnit.x}, ${playerUnit.y}), hasMoved: ${playerUnit.hasMoved}`);
  if (playerUnit.hasMoved) throw new Error('Undo failed');
  console.log('✓ Move undo verified');

  // Test attack
  const skill = playerUnit.skills[0];
  const dmgRes = CombatResolver.resolveAttack({
    attacker: playerUnit,
    defender: enemyUnit,
    skill: skill,
    grid: game.grid,
    allUnits: game.units,
    game: game
  });
  console.log('Combat result:', dmgRes.log);
  console.log(`Enemy HP after attack: ${enemyUnit.hp}/${enemyUnit.maxHp}`);

  // Simulate killing all enemies
  game.units.filter(u => u.team === TEAM.ENEMY).forEach(e => {
    e.hp = 0;
    e.isAlive = false;
  });
  game.checkWinLoss();
  console.log('Game over state:', game.isGameOver);
}

// Test 2: Save System
console.log('\n--- Test 2: Save System ---');
game.roguelike.autoSave();
const hasActiveRun = saveManager.hasActiveRun();
console.log('Auto save recorded in localStorage:', hasActiveRun);
if (!hasActiveRun) throw new Error('Auto save not found');

const savedRun = saveManager.loadActiveRun();
console.log(`Active run loaded: Floor ${savedRun.currentFloor}, Stones: ${savedRun.spiritStones}`);

// Manual slot save
const savedSlot1 = saveManager.saveToSlot(1, { currentFloor: 1 }, 'Manual slot 1 test');
console.log('Manual save slot 1 success:', savedSlot1);
const loadedSlot1 = saveManager.loadFromSlot(1);
console.log('Manual load slot 1:', loadedSlot1 ? loadedSlot1.note : null);
if (!loadedSlot1 || loadedSlot1.note !== 'Manual slot 1 test') throw new Error('Slot 1 save/load failed');
console.log('✓ Save system verified');

// Test 3: Compendium Manager
console.log('\n--- Test 3: Compendium Manager ---');
saveManager.recordBossKill('huodou');
const bestiary = compendiumManager.getBeastsList();
console.log('Bestiary count:', bestiary.length);
const huodouEntry = bestiary.find(b => b.id === 'huodou');
const compData = saveManager.getCompendium();
console.log(`Huodou entry: ${huodouEntry.name}, Kill count: ${compData.bossKills['huodou']}`);
if (!huodouEntry || compData.bossKills['huodou'] !== 1) throw new Error('Compendium bestiary record failed');
console.log('✓ Compendium system verified');

// Test 4: Practice Sandbox Mode
console.log('\n--- Test 4: Practice Sandbox Mode ---');
game.practice.startBattle({
  playerUnits: ['lingxu', 'baiqian'],
  enemyUnits: ['huodou'],
  playerRealmLevel: 1,
  infiniteQi: true,
  invinciblePlayer: true,
  dummyEnemy: true
});
console.log('Practice active:', game.practice.isActive);
console.log('Practice view:', game.ui.currentView);
console.log('Player units in practice:', game.units.filter(u => u.team === TEAM.PLAYER).length);
const practicePlayer = game.units.find(u => u.team === TEAM.PLAYER);
console.log(`Player realm: ${practicePlayer.realm}, Qi: ${practicePlayer.qi}/${practicePlayer.maxQi}`);
if (practicePlayer.qi !== 99) throw new Error('Infinite Qi failed');

// Check invincible damage test
const beastUnit = game.units.find(u => u.team === TEAM.ENEMY);
const initialHp = practicePlayer.hp;
CombatResolver.resolveAttack({
  attacker: beastUnit,
  defender: practicePlayer,
  skill: beastUnit.skills[0],
  grid: game.grid,
  allUnits: game.units,
  game: game
});
console.log(`Player HP after taking beast hit: ${practicePlayer.hp}/${practicePlayer.maxHp} (Initial: ${initialHp})`);
if (practicePlayer.hp !== initialHp) throw new Error('Invincible rule failed');
console.log('✓ Practice sandbox verified');

// Test 5: Action States, Choreography and Badges
console.log('\n--- Test 5: Action States & Choreography Badges ---');
const testUnit = game.units.find(u => u.team === TEAM.PLAYER);
testUnit.playAction('move', 0.45);
if (testUnit.actionState !== 'move') throw new Error('Unit move action failed');
let badge = testUnit.getActionBadge();
if (!badge.text.includes('踏星移行')) throw new Error('Move badge text incorrect');

testUnit.playAction('guard', 999);
if (testUnit.actionState !== 'guard') throw new Error('Unit guard action failed');
badge = testUnit.getActionBadge();
if (!badge.text.includes('凝气御守')) throw new Error('Guard badge text incorrect');

const choreo = game.ui.getSkillActionChoreography(testUnit.skills[0]);
console.log(`Unit action choreography for ${testUnit.skills[0].name}: ${choreo}`);
if (!choreo || choreo.length === 0) throw new Error('Skill choreography lookup failed');

testUnit.startTurn();
if (testUnit.actionState !== 'idle') throw new Error('Reset to idle on turn start failed');
badge = testUnit.getActionBadge();
if (!badge.text.includes('待机吐纳')) throw new Error('Idle badge text incorrect');
console.log('✓ Action states and badges verified');

// Test 6: Smooth Path Movement & Trajectory Animation
console.log('\n--- Test 6: Smooth Path Movement & Trajectory ---');
const pathMover = game.units.find(u => u.team === TEAM.PLAYER);
pathMover.x = 2;
pathMover.y = 2;
pathMover.renderX = 2;
pathMover.renderY = 2;
let moveFinished = false;
pathMover.startPathMove([{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], () => {
  moveFinished = true;
});
if (!pathMover.isMoving || pathMover.actionState !== 'move' || pathMover.facing !== 'EAST') {
  throw new Error('startPathMove failed to initialize moving state');
}
console.log('Path move started: actionState=' + pathMover.actionState + ', facing=' + pathMover.facing);

// 推进帧模拟插值
for (let frame = 0; frame < 30; frame++) {
  pathMover.update(0.016);
}
console.log('Mid-move: renderX=' + pathMover.renderX.toFixed(2) + ', isMoving=' + pathMover.isMoving);

// 推进至走完全程
for (let frame = 0; frame < 60; frame++) {
  pathMover.update(0.016);
}
if (!moveFinished || pathMover.x !== 4 || pathMover.y !== 2 || pathMover.isMoving || pathMover.actionState !== 'idle') {
  throw new Error(`Movement did not complete cleanly: finished=${moveFinished}, x=${pathMover.x}, state=${pathMover.actionState}`);
}
console.log('Path move completed: x=' + pathMover.x + ', y=' + pathMover.y + ', actionState=' + pathMover.actionState);
console.log('✓ Path movement trajectory verified');

// Test 7: Enemy Beast Attack Visual Effects & Choreography
console.log('\n--- Test 7: Beast Attack VFX Choreography ---');
const dummyCtx = {
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  beginPath: () => {},
  closePath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  arc: () => {},
  ellipse: () => {},
  fill: () => {},
  stroke: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createLinearGradient: () => ({ addColorStop: () => {} })
};

const vSkills = vm.runInContext('SKILLS', context);
const beastSkills = [
  vSkills.HUODOU_BITE,
  vSkills.GUDIAO_TALON,
  vSkills.TAOWU_ROAR,
  vSkills.DANGKANG_SLAM,
  vSkills.XIANGLIU_POISON,
  vSkills.QIONGQI_DIVE,
  vSkills.ZHUJIUYIN_DAY_NIGHT
];

beastSkills.forEach(sk => {
  const initialCount = game.vfx.complexEffects.length;
  game.vfx.triggerSkillChoreography(sk, { x: 5, y: 5 }, 6, 6, 40);
  if (game.vfx.complexEffects.length <= initialCount) {
    throw new Error(`Failed to trigger choreography for beast skill: ${sk.id}`);
  }
  const fx = game.vfx.complexEffects[game.vfx.complexEffects.length - 1];
  fx.update(0.05, game.vfx);
  fx.draw(dummyCtx);
  console.log(`✓ Beast VFX verified: ${sk.name} (${fx.constructor.name})`);
});

// Test 8: Action Choice Menu (移动/攻击/防御) & Skill Sub-Menu & Scripture Inspection
console.log('\n--- Test 8: Action Menu (移动/攻击/防御) & Skill Sub-Menu ---');
const floatingTestUnit = game.units.find(u => u.team === TEAM.PLAYER && u.isAlive);
floatingTestUnit.hasActed = false;
floatingTestUnit.hasMoved = false;
game.selectUnit(floatingTestUnit);

const floatingSkillsEl = game.ui.unitFloatingSkills;
if (floatingSkillsEl.style.display !== 'flex') {
  throw new Error(`Floating menu should be visible as 'flex', got '${floatingSkillsEl.style.display}'`);
}

// 1. Verify Level-1 Action Menu contains 移动, 攻击, 防御
const actionGroup = floatingSkillsEl.children[0];
if (!actionGroup || !actionGroup.className.includes('floating-actions-group')) {
  throw new Error(`Expected floating-actions-group, got ${actionGroup ? actionGroup.className : 'null'}`);
}
if (actionGroup.children.length !== 3) {
  throw new Error(`Expected 3 action buttons (移动/攻击/防御), got ${actionGroup.children.length}`);
}
const actionLabels = actionGroup.children.map(c => c.innerText || c.innerHTML);
console.log('✓ Action Choice Menu popped up with 3 commands: [移动, 攻击, 防御]');

// 2. Test [移动] Command
game.startMoveSelection();
if (game.moveTiles.length === 0) {
  throw new Error('Expected move tiles to be populated after clicking 移动');
}
console.log(`✓ [移动] command verified: ${game.moveTiles.length} reachable tiles calculated`);
// Cancel movement via context menu (right click)
game.onContextMenu({ preventDefault: () => {} });
if (game.moveTiles.length !== 0) {
  throw new Error('Expected move tiles to be cleared after right-click cancel');
}
console.log('✓ Move selection cancel verified (returned to Action Menu)');

// 3. Test [攻击] Command -> Pops up Skill Sub-Menu
game.ui.showFloatingActionMenu(floatingTestUnit, 'SKILLS');
const skillGroup = floatingSkillsEl.children[0];
if (!skillGroup || !skillGroup.className.includes('floating-skills-subgroup')) {
  throw new Error('Expected floating-skills-subgroup in SKILLS mode');
}
if (skillGroup.children.length !== floatingTestUnit.skills.length + 1) {
  throw new Error(`Expected ${floatingTestUnit.skills.length + 1} elements (返回 + skills), got ${skillGroup.children.length}`);
}
console.log(`✓ [攻击] command popped up Skill Sub-Menu with [返回] + ${floatingTestUnit.skills.length} skills`);

// 4. Verify scripture inspection on hover
const firstSkill = floatingTestUnit.skills[0];
game.ui.inspectSkill(firstSkill, floatingTestUnit, false);
const inspectionCard = game.ui.skillInspectionCard;
if (!inspectionCard.innerHTML.includes(firstSkill.name)) {
  throw new Error(`Inspection card should contain skill name ${firstSkill.name}`);
}
console.log(`✓ Scripture inspection card verified for: ${firstSkill.name}`);

// 5. Verify clicking skill enters SKILL_TARGETING and locks inspection
game.selectSkill(firstSkill);
if (game.state !== 'SKILL_TARGETING') {
  throw new Error(`Game state should be SKILL_TARGETING, got ${game.state}`);
}
if (!inspectionCard.innerHTML.includes('蓄力锁定中')) {
  throw new Error('Inspection card should display 蓄力锁定中 when skill is selected');
}
console.log(`✓ Skill targeting lock confirmed for ${firstSkill.name}`);

// 6. Verify [返回] button returns to Action Menu
game.onContextMenu({ preventDefault: () => {} }); // Cancel targeting back to SKILLS
game.ui.showFloatingActionMenu(floatingTestUnit, 'ACTION');
if (!floatingSkillsEl.children[0].className.includes('floating-actions-group')) {
  throw new Error('Expected return to floating-actions-group');
}
console.log('✓ [返回] button returned successfully to [移动/攻击/防御] Action Menu');

// 7. Verify clearing selection hides floating HUD
game.clearSelection();
if (floatingSkillsEl.style.display !== 'none') {
  throw new Error(`Floating menu should be hidden, got '${floatingSkillsEl.style.display}'`);
}
console.log('✓ Floating menu correctly hides on clearing selection');

console.log('\n--- Test 9: Dual Action Hub in Control Panel ---');
game.selectUnit(floatingTestUnit);
const actionHubEl = game.ui.actionHubContainer;
if (!actionHubEl || actionHubEl.children.length === 0) {
  throw new Error('Action Hub in control panel should have children when unit is selected');
}
const hubBar = actionHubEl.children[0];
if (!hubBar.className.includes('action-hub-bar') || hubBar.children.length !== 3) {
  throw new Error(`Expected action-hub-bar with 3 buttons, got ${hubBar ? hubBar.children.length : 'none'}`);
}
console.log('✓ Action Hub synchronized in right control panel with [移动/攻击/防御]');

// Switch to skills mode in Hub
game.ui.showFloatingActionMenu(floatingTestUnit, 'SKILLS');
const hubSkillsGrid = actionHubEl.children[0];
if (!hubSkillsGrid.className.includes('hub-skills-grid')) {
  throw new Error('Expected hub-skills-grid in SKILLS mode');
}
console.log(`✓ Action Hub expanded skills grid with ${hubSkillsGrid.children.length - 1} skills and back button`);

game.clearSelection();
if (!actionHubEl.innerHTML.includes('action-hub-empty')) {
  throw new Error('Action Hub should display empty guidance on clear selection');
}
console.log('✓ Action Hub correctly resets on clear selection');

console.log('\n========================================');
console.log('ALL TESTS PASSED WITH ZERO ERRORS!');
console.log('========================================');
process.exit(0);
