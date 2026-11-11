/**
 * 《山海问道录·天衍棋局》16-Bit 像素 UI 界面管理器 (全功能重构版)
 * 涵盖：主菜单路由器、五藏山经分岔舆图绘制、演武练习沙盒、万灵图鉴玉简、云笈存档管理、商行与灵泉道场
 */

class UIManager {
  constructor(game) {
    this.game = game;
    this.selectedSkill = null;
    this.currentView = 'MAIN_MENU'; // MAIN_MENU, MAP, BATTLE

    this.initDOMElements();
    this.bindEvents();
  }

  initDOMElements() {
    // 1. 三大视窗画面
    this.screenMainMenu = document.getElementById('screen-main-menu');
    this.screenMap = document.getElementById('screen-map');
    this.screenBattle = document.getElementById('screen-battle');

    // 2. 主菜单按钮
    this.btnMenuContinue = document.getElementById('btn-menu-continue');
    this.btnMenuRoguelike = document.getElementById('btn-menu-roguelike');
    this.btnMenuPractice = document.getElementById('btn-menu-practice');
    this.btnMenuCompendium = document.getElementById('btn-menu-compendium');
    this.btnMenuSaves = document.getElementById('btn-menu-saves');
    this.btnMenuSound = document.getElementById('btn-menu-sound');

    // 3. 舆图画面元素
    this.mapRealmBadge = document.getElementById('map-realm-badge');
    this.mapRealmName = document.getElementById('map-realm-name');
    this.mapPartyBar = document.getElementById('map-party-bar');
    this.mapStonesCount = document.getElementById('map-spirit-stones-count');
    this.mapRoutesSvg = document.getElementById('map-routes-svg');
    this.mapNodesGrid = document.getElementById('map-nodes-tier-grid');
    this.btnMapCompendium = document.getElementById('btn-map-compendium');
    this.btnMapSave = document.getElementById('btn-map-save');
    this.btnMapReturnMenu = document.getElementById('btn-map-return-menu');

    // 4. 战斗棋盘顶部栏
    this.chapterTitle = document.getElementById('chapter-title');
    this.turnIndicator = document.getElementById('turn-indicator');
    this.roundCounter = document.getElementById('round-counter');
    this.spiritStonesDisplay = document.getElementById('spirit-stones-count');
    this.btnEndTurn = document.getElementById('btn-end-turn');
    this.btnUndo = document.getElementById('btn-undo');
    this.btnBreakthrough = document.getElementById('btn-breakthrough');
    this.btnViewMap = document.getElementById('btn-view-map');
    this.btnReturnHome = document.getElementById('btn-return-home');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');

    // 5. 角色玉简详情与技能
    this.unitCard = document.getElementById('unit-card');
    this.unitAvatar = document.getElementById('unit-avatar');
    this.unitActionBadge = document.getElementById('unit-action-badge');
    this.unitName = document.getElementById('unit-name');
    this.unitTitle = document.getElementById('unit-title');
    this.unitRealm = document.getElementById('unit-realm');
    this.unitElement = document.getElementById('unit-element');
    this.unitStanceTip = document.getElementById('unit-stance-tip');
    this.unitHp = document.getElementById('unit-hp');
    this.unitHpBar = document.getElementById('unit-hp-bar');
    this.unitQi = document.getElementById('unit-qi');
    this.unitQiBar = document.getElementById('unit-qi-bar');
    this.unitAtk = document.getElementById('unit-atk');
    this.unitDef = document.getElementById('unit-def');
    this.unitMove = document.getElementById('unit-move');
    this.unitQuote = document.getElementById('unit-quote');
    this.relicsBox = document.getElementById('relics-box');
    this.relicsList = document.getElementById('relics-list');
    this.relicsCountTag = document.getElementById('relics-count-tag');
    this.skillsContainer = document.getElementById('skills-container');
    this.unitFloatingSkills = document.getElementById('unit-floating-skills');
    this.actionHubContainer = document.getElementById('action-hub-container');
    this.actionHubTitle = document.getElementById('action-hub-title');
    this.skillInspectionCard = document.getElementById('skill-inspection-card');
    this.skillActionStateTag = document.getElementById('skill-action-state-tag');
    this.combatLog = document.getElementById('combat-log');

    // 6. 弹窗 Modals
    this.modalPractice = document.getElementById('modal-practice');
    this.modalCompendium = document.getElementById('modal-compendium');
    this.modalSaves = document.getElementById('modal-saves');
    this.modalRest = document.getElementById('modal-rest');
    this.modalShop = document.getElementById('modal-shop');
    this.gameModal = document.getElementById('game-modal');
    this.chapterModal = document.getElementById('chapter-modal');
    this.relicModal = document.getElementById('relic-modal');
    this.eventModal = document.getElementById('event-modal');

    // 胜负弹窗元素
    this.modalTitle = document.getElementById('modal-title');
    this.modalDesc = document.getElementById('modal-desc');
    this.modalRating = document.getElementById('modal-rating');
    this.modalNextBtn = document.getElementById('modal-next-btn');
    this.modalRestartBtn = document.getElementById('modal-restart-btn');
    this.modalReturnMenuBtn = document.getElementById('modal-return-menu-btn');
  }

  bind25DParallax() {
    const card = document.getElementById('unit-card');
    if (!card) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${-y * 10 + 2}deg) rotateY(${x * 12}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(4deg) rotateY(-3deg) translateZ(0px)`;
    });
  }

  bindEvents() {
    this.bind25DParallax();

    // --- 1. 主菜单事件 ---
    if (this.btnMenuContinue) {
      this.btnMenuContinue.addEventListener('click', () => {
        window.sound.playSelect();
        const activeRun = window.saveManager.loadActiveRun();
        if (activeRun) {
          this.game.roguelike.resumeSavedRun(activeRun);
        }
      });
    }

    if (this.btnMenuRoguelike) {
      this.btnMenuRoguelike.addEventListener('click', () => {
        window.sound.playSelect();
        this.game.roguelike.startRun();
      });
    }

    if (this.btnMenuPractice) {
      this.btnMenuPractice.addEventListener('click', () => {
        window.sound.playSelect();
        this.showPracticeModal();
      });
    }

    if (this.btnMenuCompendium) {
      this.btnMenuCompendium.addEventListener('click', () => {
        window.sound.playSelect();
        this.showCompendiumModal();
      });
    }

    if (this.btnMenuSaves) {
      this.btnMenuSaves.addEventListener('click', () => {
        window.sound.playSelect();
        this.showSavesModal();
      });
    }

    if (this.btnMenuSound) {
      this.btnMenuSound.addEventListener('click', () => {
        const enabled = window.sound.toggleSound();
        this.btnMenuSound.innerText = enabled ? '🔊 灵音已启' : '🔇 灵音已阖';
        if (this.btnSoundToggle) {
          this.btnSoundToggle.innerText = enabled ? '🔊 灵音已启' : '🔇 灵音已阖';
        }
      });
    }

    // --- 2. 舆图画面事件 ---
    if (this.btnMapCompendium) {
      this.btnMapCompendium.addEventListener('click', () => {
        window.sound.playSelect();
        this.showCompendiumModal();
      });
    }
    if (this.btnMapSave) {
      this.btnMapSave.addEventListener('click', () => {
        window.sound.playSelect();
        this.showSavesModal();
      });
    }
    if (this.btnMapReturnMenu) {
      this.btnMapReturnMenu.addEventListener('click', () => {
        window.sound.playSelect();
        this.switchView('MAIN_MENU');
      });
    }

    // --- 3. 战斗棋盘顶部栏事件 ---
    this.btnEndTurn.addEventListener('click', () => {
      window.sound.playSelect();
      this.game.switchTurn(TEAM.ENEMY);
    });

    if (this.btnUndo) {
      this.btnUndo.addEventListener('click', () => {
        window.sound.playSelect();
        this.game.undoCurrentMove();
      });
    }

    if (this.btnBreakthrough) {
      this.btnBreakthrough.addEventListener('click', () => {
        window.sound.playSelect();
        this.game.doBreakthrough();
      });
    }

    if (this.btnViewMap) {
      this.btnViewMap.addEventListener('click', () => {
        window.sound.playSelect();
        this.switchView('MAP');
      });
    }

    if (this.btnReturnHome) {
      this.btnReturnHome.addEventListener('click', () => {
        window.sound.playSelect();
        if (this.game.roguelike.isActive) {
          this.game.roguelike.autoSave();
        }
        this.switchView('MAIN_MENU');
      });
    }

    this.btnSoundToggle.addEventListener('click', () => {
      const enabled = window.sound.toggleSound();
      this.btnSoundToggle.innerText = enabled ? '🔊 灵音已启' : '🔇 灵音已阖';
      if (this.btnMenuSound) {
        this.btnMenuSound.innerText = enabled ? '🔊 灵音已启' : '🔇 灵音已阖';
      }
    });

    // 终局弹窗按钮
    this.modalRestartBtn.addEventListener('click', () => {
      this.gameModal.style.display = 'none';
      if (this.game.roguelike.isActive) {
        this.game.roguelike.startRun();
      } else {
        this.game.restartCurrentChapter();
      }
    });

    if (this.modalNextBtn) {
      this.modalNextBtn.addEventListener('click', () => {
        this.gameModal.style.display = 'none';
        if (this.game.roguelike.isActive) {
          this.switchView('MAP');
        } else {
          this.game.nextChapter();
        }
      });
    }

    if (this.modalReturnMenuBtn) {
      this.modalReturnMenuBtn.addEventListener('click', () => {
        this.gameModal.style.display = 'none';
        this.switchView('MAIN_MENU');
      });
    }

    // 章节弹窗关闭
    const chClose = document.getElementById('chapter-modal-close');
    if (chClose) {
      chClose.addEventListener('click', () => {
        this.chapterModal.style.display = 'none';
      });
    }
  }

  // ========================================================================
  // 视窗画面切换路由器 (Screen View Router)
  // ========================================================================
  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));

    if (viewName === 'MAIN_MENU') {
      if (this.screenMainMenu) this.screenMainMenu.classList.add('active');
      this.updateMainMenuState();
    } else if (viewName === 'MAP') {
      if (this.screenMap) this.screenMap.classList.add('active');
      if (this.game.roguelike && this.game.roguelike.map) {
        this.renderMap(this.game.roguelike.map);
      }
    } else if (viewName === 'BATTLE') {
      if (this.screenBattle) this.screenBattle.classList.add('active');
      if (this.btnViewMap) {
        this.btnViewMap.style.display = (this.game.roguelike && this.game.roguelike.isActive) ? 'inline-block' : 'none';
      }
      this.game.renderer.initCanvasSize();
    }
  }

  updateMainMenuState() {
    const activeRunCard = document.getElementById('menu-active-run-card');
    const runInfoText = document.getElementById('menu-run-info-text');
    const hasRun = window.saveManager.hasActiveRun();
    if (hasRun) {
      const run = window.saveManager.loadActiveRun();
      if (activeRunCard) activeRunCard.style.display = 'block';
      if (this.btnMenuContinue) {
        this.btnMenuContinue.style.display = 'block';
        this.btnMenuContinue.innerText = `✦ 继续潜修 · 第 ${run.currentFloor} 层 · ${run.realmName || '大荒秘境'} (💎 ${run.spiritStones || 0}) ✦`;
      }
      if (runInfoText) {
        runInfoText.innerText = `第 ${run.currentFloor} 层 · ${run.realmName || '大荒秘境'} ｜ 💎 灵石: ${run.spiritStones || 0} ｜ 遗宝: ${run.relics ? run.relics.length : 0} 件`;
      }
    } else {
      if (activeRunCard) activeRunCard.style.display = 'none';
      if (this.btnMenuContinue) this.btnMenuContinue.style.display = 'none';
    }
  }

  // ========================================================================
  // 绘制大荒分岔舆图 (Render Five Mountains Route Map)
  // ========================================================================
  renderMap(mountainMap) {
    if (!mountainMap) return;
    const realm = mountainMap.realmConfig;

    // 1. 顶部状态
    if (this.mapRealmBadge) this.mapRealmBadge.innerText = `五藏山经 · 第 ${mountainMap.floor} 层`;
    if (this.mapRealmName) this.mapRealmName.innerText = realm.name;
    if (this.mapStonesCount) this.mapStonesCount.innerText = this.game.spiritStones;

    // 队伍血量小标
    if (this.mapPartyBar && this.game.roguelike) {
      this.mapPartyBar.innerHTML = '';
      this.game.roguelike.partyState.forEach(p => {
        const mini = document.createElement('div');
        mini.className = 'party-mini-card';
        const hpPct = Math.round((p.currentHp / p.maxHp) * 100);
        const tpl = UNIT_TEMPLATES[p.templateId];
        mini.innerHTML = `
          <img class="party-mini-avatar" src="${tpl.avatarImg}" alt="${p.name}">
          <div class="party-mini-info">
            <span class="party-mini-name">${p.name}</span>
            <div class="party-mini-hp-bar">
              <div class="party-mini-hp-fill" style="width:${hpPct}%; background:${hpPct > 30 ? '#22c55e' : '#ef4444'};"></div>
            </div>
          </div>
        `;
        this.mapPartyBar.appendChild(mini);
      });
    }

    // 2. 节点与网格生成
    if (!this.mapNodesGrid) return;
    this.mapNodesGrid.innerHTML = '';

    const availableNodes = mountainMap.getAvailableNodes();
    const availableIds = availableNodes.map(n => n.id);

    mountainMap.tiers.forEach((tierNodes, tierIdx) => {
      const col = document.createElement('div');
      col.className = 'map-tier-column';

      tierNodes.forEach(node => {
        const card = document.createElement('div');
        const isCurrent = mountainMap.currentNodeId === node.id;
        const isVisited = mountainMap.visitedNodeIds.includes(node.id);
        const isAvailable = availableIds.includes(node.id);

        let statusClass = 'node-locked';
        if (isCurrent) statusClass = 'node-current';
        else if (isVisited) statusClass = 'node-visited';
        else if (isAvailable) statusClass = 'node-available';

        card.className = `map-node-card ${statusClass}`;
        card.id = `el_${node.id}`;
        card.innerHTML = `
          <div class="node-icon-large">${node.icon}</div>
          <div class="node-title-text">${node.title}</div>
        `;
        card.title = `${node.title}: ${node.desc}`;

        if (isAvailable) {
          card.addEventListener('click', () => {
            window.sound.playSelect();
            this.game.roguelike.enterNode(node.id);
          });
        }

        col.appendChild(card);
      });

      this.mapNodesGrid.appendChild(col);
    });

    // 3. 延迟绘制 SVG 连线 (等 DOM 布局完成)
    setTimeout(() => this.drawMapConnections(mountainMap), 60);
  }

  drawMapConnections(mountainMap) {
    if (!this.mapRoutesSvg) return;
    this.mapRoutesSvg.innerHTML = '';
    const containerRect = this.mapRoutesSvg.getBoundingClientRect();
    if (containerRect.width === 0) return;

    mountainMap.tiers.forEach(tier => {
      tier.forEach(fromNode => {
        const fromEl = document.getElementById(`el_${fromNode.id}`);
        if (!fromEl) return;
        const fromRect = fromEl.getBoundingClientRect();
        const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;

        fromNode.connections.forEach(toId => {
          const toEl = document.getElementById(`el_${toId}`);
          if (!toEl) return;
          const toRect = toEl.getBoundingClientRect();
          const x2 = toRect.left + toRect.width / 2 - containerRect.left;
          const y2 = toRect.top + toRect.height / 2 - containerRect.top;

          // 贝塞尔曲线
          const dx = (x2 - x1) * 0.5;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          path.setAttribute('d', d);

          const isVisitedEdge = mountainMap.visitedNodeIds.includes(fromNode.id) && mountainMap.visitedNodeIds.includes(toId);
          if (isVisitedEdge) {
            path.setAttribute('stroke', '#22c55e');
            path.setAttribute('stroke-width', '3');
          } else {
            path.setAttribute('stroke', '#475569');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-dasharray', '4,4');
          }
          path.setAttribute('fill', 'none');
          this.mapRoutesSvg.appendChild(path);
        });
      });
    });
  }

  // ========================================================================
  // 演武道场 · 练习模式配置 Modal
  // ========================================================================
  showPracticeModal() {
    if (!this.modalPractice) return;
    const btnLaunch = document.getElementById('btn-practice-launch');
    const btnClose = document.getElementById('btn-practice-close');

    const handleLaunch = () => {
      window.sound.playSelect();
      const partyBoxes = document.querySelectorAll('#practice-party-select input:checked');
      const enemyBoxes = document.querySelectorAll('#practice-enemy-select input:checked');
      const realmVal = parseInt(document.getElementById('practice-realm-select').value, 10);
      const terrainVal = document.getElementById('practice-terrain-select').value;
      const infQi = document.getElementById('sandbox-infinite-qi').checked;
      const invin = document.getElementById('sandbox-invincible').checked;
      const dummy = document.getElementById('sandbox-dummy').checked;

      const playerUnits = Array.from(partyBoxes).map(b => b.value);
      const enemyUnits = Array.from(enemyBoxes).map(b => b.value);

      if (playerUnits.length === 0) {
        alert('请至少勾选一位参战修仙者！');
        return;
      }
      if (enemyUnits.length === 0) {
        alert('请至少勾选一位对阵凶兽！');
        return;
      }

      this.modalPractice.style.display = 'none';
      this.game.practice.startBattle({
        playerUnits,
        enemyUnits,
        playerRealmLevel: realmVal,
        terrainTheme: terrainVal,
        infiniteQi: infQi,
        invinciblePlayer: invin,
        dummyEnemy: dummy
      });
      this.switchView('BATTLE');
    };

    btnLaunch.onclick = handleLaunch;
    btnClose.onclick = () => { this.modalPractice.style.display = 'none'; };
    this.modalPractice.style.display = 'flex';
  }

  // ========================================================================
  // 山海万灵图鉴 Modal
  // ========================================================================
  showCompendiumModal() {
    if (!this.modalCompendium) return;
    const tabBtns = document.querySelectorAll('.comp-tab-btn');
    const itemList = document.getElementById('comp-item-list');
    const detailScroll = document.getElementById('comp-detail-scroll');
    const btnClose = document.getElementById('btn-compendium-close');

    let currentTab = 'CULTIVATORS';

    const renderTab = (tab) => {
      currentTab = tab;
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      itemList.innerHTML = '';

      if (tab === 'CULTIVATORS') {
        window.compendiumManager.getCultivatorsList().forEach(item => {
          const card = document.createElement('div');
          card.className = 'comp-item-card';
          card.innerHTML = `
            <img class="comp-item-avatar" src="${item.avatarImg}">
            <div>
              <div style="font-weight:bold;color:#e2e8f0;">${item.name}</div>
              <div style="font-size:11px;color:#a3e635;">${item.title}</div>
            </div>
          `;
          card.onclick = () => renderDetail(item.id);
          itemList.appendChild(card);
        });
        renderDetail('lingxu');
      } else if (tab === 'BEASTS') {
        window.compendiumManager.getBeastsList().forEach(item => {
          const card = document.createElement('div');
          card.className = 'comp-item-card';
          card.innerHTML = `
            <img class="comp-item-avatar" src="${item.avatarImg}">
            <div>
              <div style="font-weight:bold;color:#fca5a5;">${item.name}</div>
              <div style="font-size:11px;color:#94a3b8;">${item.title}</div>
            </div>
          `;
          card.onclick = () => renderDetail(item.id);
          itemList.appendChild(card);
        });
        renderDetail('huodou');
      } else if (tab === 'RELICS') {
        window.compendiumManager.getRelicsList().forEach(item => {
          const card = document.createElement('div');
          card.className = 'comp-item-card';
          card.innerHTML = `
            <div style="font-size:22px;">${item.icon}</div>
            <div>
              <div style="font-weight:bold;color:#ecc981;">${item.name}</div>
              <div style="font-size:11px;color:#64748b;">远古遗宝</div>
            </div>
          `;
          card.onclick = () => renderRelicDetail(item);
          itemList.appendChild(card);
        });
        renderRelicDetail(ROGUELIKE_RELICS[0]);
      } else if (tab === 'WHEEL') {
        renderWheelDetail();
      }
    };

    const renderDetail = (id) => {
      const item = window.compendiumManager.getItemDetail(id);
      if (!item) return;
      const t = item.data;
      const lore = item.lore;

      detailScroll.innerHTML = `
        <div class="detail-header-card">
          <img class="detail-large-avatar" src="${t.avatarImg}">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:10px;">
              <h2 style="color:#ecc981;font-size:20px;">${t.name}</h2>
              <span class="chapter-badge">${t.title}</span>
              <span class="elem-badge elem-${t.element.toLowerCase()}">${ELEMENT_INFO[t.element].name}行</span>
            </div>
            <div style="font-size:12px;color:#94a3b8;margin:6px 0;">境界声名：${t.realm}</div>
            <div style="font-size:12px;color:#cbd5e1;line-height:1.4;">“${t.quote}”</div>
            <div style="display:flex;gap:16px;margin-top:10px;font-size:12px;">
              <span>气血: <b style="color:#22c55e">${t.maxHp}</b></span>
              <span>真元: <b style="color:#38bdf8">${t.maxQi}</b></span>
              <span>攻伐: <b style="color:#f59e0b">${t.attack}</b></span>
              <span>守御: <b style="color:#94a3b8">${t.defense}</b></span>
              <span>步法: <b style="color:#a855f7">${t.moveRange}</b></span>
            </div>
          </div>
        </div>

        <div class="lore-quote-box">
          <div style="font-weight:bold;margin-bottom:4px;">📜 古籍山海出处：</div>
          <div>${lore.origin || '暂无详细古籍记述。'}</div>
          <div style="margin-top:6px;font-style:italic;">${lore.story || ''}</div>
        </div>

        <div class="tactics-guide-box">
          <div style="font-weight:bold;margin-bottom:4px;">🎯 战术推演要诀：</div>
          <div>${lore.tactics || '善用五行克制与走位拉扯。'}</div>
        </div>

        <div>
          <div style="font-weight:bold;color:#ecc981;margin-bottom:8px;">✦ 本命法术与奥义秘典：</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${t.skills.map(sk => `
              <div style="background:#17222c;border:1px solid #2e4354;padding:8px 12px;border-radius:2px;">
                <div style="display:flex;justify-content:space-between;color:#ecc981;font-size:13px;font-weight:bold;">
                  <span>【${sk.name}】</span>
                  <span style="color:#38bdf8">消耗真元: ${sk.costQi} ｜ 射程: ${sk.range}格</span>
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${sk.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderRelicDetail = (relic) => {
      detailScroll.innerHTML = `
        <div class="detail-header-card">
          <div style="font-size:54px;display:flex;align-items:center;">${relic.icon}</div>
          <div style="flex:1;">
            <h2 style="color:#ecc981;font-size:20px;">${relic.name}</h2>
            <div style="font-size:12px;color:#38bdf8;margin:6px 0;">品阶：荒古先天不灭至宝</div>
            <div style="font-size:13px;color:#cbd5e1;line-height:1.6;margin-top:8px;">${relic.desc}</div>
          </div>
        </div>
        <div class="lore-quote-box">
          <div style="font-weight:bold;margin-bottom:4px;">📜 遗宝传说：</div>
          <div>古修大能飞升破界或兵解时所遗留的大道真符残片，佩戴于道心神龛之中，可恒久激荡被动神通。</div>
        </div>
      `;
    };

    const renderWheelDetail = () => {
      itemList.innerHTML = `
        <div class="comp-item-card active"><div style="font-weight:bold;color:#ecc981;">五行生克奥妙</div></div>
        <div class="comp-item-card"><div style="font-weight:bold;color:#ecc981;">绝脉背刺必暴</div></div>
        <div class="comp-item-card"><div style="font-weight:bold;color:#ecc981;">撞墙崩解壁击</div></div>
        <div class="comp-item-card"><div style="font-weight:bold;color:#ecc981;">大荒同调合击</div></div>
      `;
      detailScroll.innerHTML = `
        <div style="background:#17222c;border:2px solid #ecc981;padding:16px;">
          <h2 style="color:#ecc981;margin-bottom:12px;">【大荒天衍 · 五行生克道盘】</h2>
          <div style="font-size:14px;line-height:1.8;color:#e2e8f0;">
            <p>✦ <b>五行克制规律</b>：金 →克→ 木 →克→ 土 →克→ 水 →克→ 火 →克→ 金。</p>
            <p>✦ <b>克制与受抑</b>：克制敌方造成 <b style="color:#ef4444">+35% 额外真伤</b>；若属性被敌方克制，则伤害受抑 <b style="color:#94a3b8">-25%</b>。</p>
            <p>✦ <b>绝脉背刺</b>：从敌方单位背后发起突袭，必定触发 <b style="color:#f59e0b">140% 暴击斩裂</b>！</p>
            <p>✦ <b>巨岩壁击</b>：使用具有【击退】的神通将敌人撞击至障碍或墙壁，触发 <b style="color:#38bdf8">35% 二次崩裂伤害</b>！</p>
            <p>✦ <b>大荒同调</b>：修士与契约神兽相邻（2格以内）时，协同出击触发 <b style="color:#a3e635">+25% 同调合击伤害</b>！</p>
          </div>
        </div>
      `;
    };

    tabBtns.forEach(b => {
      b.onclick = () => renderTab(b.dataset.tab);
    });
    btnClose.onclick = () => { this.modalCompendium.style.display = 'none'; };

    renderTab('CULTIVATORS');
    this.modalCompendium.style.display = 'flex';
  }

  // ========================================================================
  // 云笈天机 · 存档管理 Modal
  // ========================================================================
  showSavesModal() {
    if (!this.modalSaves) return;
    const slotsContainer = document.getElementById('save-slots-container');
    const btnExport = document.getElementById('btn-save-export');
    const btnImport = document.getElementById('btn-save-import');
    const btnReset = document.getElementById('btn-save-reset');
    const btnClose = document.getElementById('btn-save-close');

    const renderSlots = () => {
      slotsContainer.innerHTML = '';
      const slots = window.saveManager.getSlots();

      slots.forEach((slot, idx) => {
        const card = document.createElement('div');
        card.className = `save-slot-card ${slot ? 'has-data' : ''}`;

        if (slot) {
          card.innerHTML = `
            <div class="slot-info-group">
              <div class="slot-title">【道印槽位 ${idx + 1}】${slot.note || '手动封存'} · ${slot.realmName || '秘境'}</div>
              <div class="slot-desc">层阶: 第 ${slot.currentFloor} 层 ｜ 灵石: 💎 ${slot.spiritStones} ｜ 遗宝: ${slot.relics?.length || 0} 件</div>
              <div style="font-size:11px;color:#64748b;">封存时日: ${slot.saveTimeStr || '未知'}</div>
            </div>
            <div class="slot-actions">
              <button class="btn-pixel primary" id="btn-load-slot-${idx}">载入道果</button>
              <button class="btn-pixel" id="btn-save-slot-${idx}">覆盖封存</button>
              <button class="btn-pixel danger-btn" id="btn-del-slot-${idx}">销毁</button>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div class="slot-info-group">
              <div class="slot-title" style="color:#64748b;">【道印槽位 ${idx + 1}】尚未封存记录</div>
              <div class="slot-desc">可将当前探索成果铭刻于此槽位。</div>
            </div>
            <div class="slot-actions">
              <button class="btn-pixel primary" id="btn-save-slot-${idx}">封存当前进度</button>
            </div>
          `;
        }
        slotsContainer.appendChild(card);

        // 绑定按钮事件
        const btnSave = document.getElementById(`btn-save-slot-${idx}`);
        if (btnSave) {
          btnSave.onclick = () => {
            const runData = this.game.roguelike.isActive ? {
              isActive: true,
              currentFloor: this.game.roguelike.currentFloor,
              realmName: this.game.roguelike.getCurrentRealmConfig().name,
              spiritStones: this.game.spiritStones,
              partyState: this.game.roguelike.partyState,
              relics: this.game.roguelike.relics,
              starterBonusQi: this.game.roguelike.starterBonusQi,
              mapData: this.game.roguelike.map ? this.game.roguelike.map.serialize() : null
            } : null;

            if (!runData) {
              alert('当前没有进行中的肉鸽秘境冒险，无法封存！');
              return;
            }
            window.saveManager.saveToSlot(idx, runData, `五藏秘境第${runData.currentFloor}层`);
            alert(`已成功封存至【道印槽位 ${idx + 1}】！`);
            renderSlots();
          };
        }

        const btnLoad = document.getElementById(`btn-load-slot-${idx}`);
        if (btnLoad) {
          btnLoad.onclick = () => {
            const data = window.saveManager.loadFromSlot(idx);
            if (data) {
              this.modalSaves.style.display = 'none';
              this.game.roguelike.resumeSavedRun(data);
            }
          };
        }

        const btnDel = document.getElementById(`btn-del-slot-${idx}`);
        if (btnDel) {
          btnDel.onclick = () => {
            if (confirm(`确定要销毁【道印槽位 ${idx + 1}】的记录吗？`)) {
              window.saveManager.deleteSlot(idx);
              renderSlots();
            }
          };
        }
      });
    };

    btnExport.onclick = () => {
      const json = window.saveManager.exportAllSaveJSON();
      navigator.clipboard?.writeText(json);
      alert('已将归档符文 (JSON) 拷贝至剪贴板，可妥善保存备份！');
    };

    btnImport.onclick = () => {
      const input = prompt('请粘贴归档符文 (JSON) 字符串：');
      if (input) {
        const ok = window.saveManager.importAllSaveJSON(input);
        if (ok) {
          alert('导入归档成功！');
          renderSlots();
          this.updateMainMenuState();
        } else {
          alert('导入失败，请检查符文字符串完整性！');
        }
      }
    };

    btnReset.onclick = () => {
      if (confirm('【严重警示】此操作将清除所有活跃冒险与存档槽位，重归初始混沌！确定重置？')) {
        window.saveManager.resetAllData();
        alert('所有记录已归零。');
        renderSlots();
        this.updateMainMenuState();
      }
    };

    btnClose.onclick = () => { this.modalSaves.style.display = 'none'; };

    renderSlots();
    this.modalSaves.style.display = 'flex';
  }

  // ========================================================================
  // 灵泉道场 Modal
  // ========================================================================
  showRestSiteModal(callbacks) {
    if (!this.modalRest) return;
    const optHeal = document.getElementById('rest-opt-heal');
    const optUpgrade = document.getElementById('rest-opt-upgrade');
    const optQi = document.getElementById('rest-opt-qi');

    optHeal.onclick = () => {
      window.sound.playSelect();
      this.modalRest.style.display = 'none';
      if (callbacks.onHeal) callbacks.onHeal();
    };

    optUpgrade.onclick = () => {
      window.sound.playSelect();
      this.modalRest.style.display = 'none';
      if (callbacks.onUpgrade) callbacks.onUpgrade();
    };

    optQi.onclick = () => {
      window.sound.playSelect();
      this.modalRest.style.display = 'none';
      if (callbacks.onQiBoost) callbacks.onQiBoost();
    };

    this.modalRest.style.display = 'flex';
  }

  // ========================================================================
  // 多宝商行 Modal
  // ========================================================================
  showShopModal(shopData) {
    if (!this.modalShop) return;
    const stonesDisplay = document.getElementById('shop-stones-display');
    const itemsGrid = document.getElementById('shop-items-grid');
    const btnLeave = document.getElementById('btn-shop-leave');

    stonesDisplay.innerText = shopData.stones;
    itemsGrid.innerHTML = '';

    // 遗宝商品 (3 件)
    shopData.relics.forEach(relic => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      const cost = 160;
      card.innerHTML = `
        <div style="font-size:32px;">${relic.icon}</div>
        <div style="font-weight:bold;color:#ecc981;">${relic.name}</div>
        <div style="font-size:11px;color:#94a3b8;flex:1;">${relic.desc}</div>
        <div class="shop-item-price">💎 ${cost} 灵石</div>
        <button class="btn-pixel primary" style="width:100%;">购买古宝</button>
      `;
      const btn = card.querySelector('button');
      btn.onclick = () => {
        const ok = shopData.onBuyRelic(relic, cost);
        if (ok) {
          window.sound.playVictory();
          card.style.opacity = '0.35';
          btn.disabled = true;
          btn.innerText = '已结缘';
          stonesDisplay.innerText = this.game.spiritStones;
        } else {
          alert('天衍灵石不足！');
        }
      };
      itemsGrid.appendChild(card);
    });

    // 仙丹商品 (九转还魂丹)
    const pillCard = document.createElement('div');
    pillCard.className = 'shop-item-card';
    const pillCost = 100;
    pillCard.innerHTML = `
      <div style="font-size:32px;">💊</div>
      <div style="font-weight:bold;color:#65c27d;">九转还魂丹</div>
      <div style="font-size:11px;color:#94a3b8;flex:1;">大还丹灵液，瞬间将全队修士气血补至满盈！</div>
      <div class="shop-item-price">💎 ${pillCost} 灵石</div>
      <button class="btn-pixel primary" style="width:100%;">服丹回春</button>
    `;
    const pillBtn = pillCard.querySelector('button');
    pillBtn.onclick = () => {
      const ok = shopData.onHealPill(pillCost);
      if (ok) {
        window.sound.playVictory();
        pillCard.style.opacity = '0.35';
        pillBtn.disabled = true;
        pillBtn.innerText = '已服用';
        stonesDisplay.innerText = this.game.spiritStones;
      } else {
        alert('天衍灵石不足！');
      }
    };
    itemsGrid.appendChild(pillCard);

    btnLeave.onclick = () => {
      this.modalShop.style.display = 'none';
      if (shopData.onLeave) shopData.onLeave();
    };

    this.modalShop.style.display = 'flex';
  }

  // ========================================================================
  // 遗宝神龛与详情更新
  // ========================================================================
  updateRelicsBar(relics) {
    if (!this.relicsList) return;
    this.relicsList.innerHTML = '';
    if (this.relicsCountTag) {
      this.relicsCountTag.innerText = `已激活 ${relics.length} 件`;
    }
    if (relics.length === 0) {
      this.relicsList.innerHTML = '<span class="empty-relic-tip">暂无遗宝</span>';
      return;
    }
    relics.forEach(r => {
      const chip = document.createElement('div');
      chip.className = 'relic-chip';
      chip.title = `${r.name}: ${r.desc}`;
      chip.innerHTML = `<span>${r.icon}</span> <span>${r.name}</span>`;
      this.relicsList.appendChild(chip);
    });
  }

  showRelicSelectionModal(choices, onSelect) {
    if (!this.relicModal) return;
    const list = document.getElementById('relic-select-list');
    list.innerHTML = '';
    choices.forEach(relic => {
      const card = document.createElement('div');
      card.className = 'relic-card';
      card.innerHTML = `
        <div class="relic-icon-large">${relic.icon}</div>
        <div class="relic-name-large">${relic.name}</div>
        <div class="relic-desc-text">${relic.desc}</div>
      `;
      card.addEventListener('click', () => {
        window.sound.playVictory();
        this.relicModal.style.display = 'none';
        onSelect(relic);
      });
      list.appendChild(card);
    });
    this.relicModal.style.display = 'flex';
  }

  showEventModal(evt, onSelectOption) {
    if (!this.eventModal) return;
    document.getElementById('event-title').innerText = evt.title;
    document.getElementById('event-desc').innerText = evt.desc;
    const optsGroup = document.getElementById('event-options');
    optsGroup.innerHTML = '';

    const opts = [
      { key: 'optionA', data: evt.optionA },
      { key: 'optionB', data: evt.optionB }
    ];

    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'event-opt-btn';
      btn.innerText = `✦ ${o.data.text}`;
      btn.addEventListener('click', () => {
        window.sound.playSelect();
        this.eventModal.style.display = 'none';
        onSelectOption(o.key);
      });
      optsGroup.appendChild(btn);
    });

    this.eventModal.style.display = 'flex';
  }

  showRoguelikeCompleteModal() {
    this.gameModal.style.display = 'flex';
    window.sound.playVictory();
    this.modalTitle.innerText = '登临绝巅 · 五藏全通！';
    this.modalTitle.className = 'modal-title victory';
    this.modalDesc.innerText = '恭贺道友破灭大荒受蚀凶煞，诛绝相柳、穷奇，降服太古烛龙！道果圆满，飞升大罗至尊！';
    if (this.modalRating) {
      this.modalRating.innerText = '【战役评价：极道飞升 · 天下第一】';
    }
    if (this.modalNextBtn) this.modalNextBtn.style.display = 'none';
    this.modalRestartBtn.innerText = '再探秘境';
  }

  // ========================================================================
  // 战斗视窗更新
  // ========================================================================
  updateTurnDisplay(turn, round, chapter) {
    if (this.chapterTitle && chapter) {
      this.chapterTitle.innerText = chapter.title;
    }
    this.roundCounter.innerText = `第 ${round} 候`;
    if (turn === TEAM.PLAYER) {
      this.turnIndicator.innerText = '【太虚修士回合】';
      this.turnIndicator.className = 'turn-tag player-turn';
      this.btnEndTurn.disabled = false;
    } else {
      this.turnIndicator.innerText = '【荒古凶兽回合】';
      this.turnIndicator.className = 'turn-tag enemy-turn';
      this.btnEndTurn.disabled = true;
    }
  }

  updateSpiritStones(count) {
    if (this.spiritStonesDisplay) {
      this.spiritStonesDisplay.innerText = count;
    }
  }

  flashAvatarHit() {
    if (!this.unitAvatar) return;
    this.unitAvatar.classList.remove('hit-flash');
    void this.unitAvatar.offsetWidth;
    this.unitAvatar.classList.add('hit-flash');
    setTimeout(() => {
      if (this.unitAvatar) this.unitAvatar.classList.remove('hit-flash');
    }, 460);
  }

  flashAvatarCast() {
    if (!this.unitAvatar) return;
    this.unitAvatar.classList.remove('cast-aura');
    void this.unitAvatar.offsetWidth;
    this.unitAvatar.classList.add('cast-aura');
    setTimeout(() => {
      if (this.unitAvatar) this.unitAvatar.classList.remove('cast-aura');
    }, 660);
  }

  updateUnitCard(unit) {
    this.currentUnit = unit;
    if (!unit) {
      this.unitName.innerText = '未选定单位';
      this.unitTitle.innerText = '请凝神观棋';
      this.unitRealm.innerText = '---';
      this.unitElement.innerText = '---';
      this.unitHp.innerText = '0 / 0';
      this.unitHpBar.style.width = '0%';
      this.unitQi.innerText = '0 / 0';
      this.unitQiBar.style.width = '0%';
      this.unitAtk.innerText = '-';
      this.unitDef.innerText = '-';
      this.unitMove.innerText = '-';
      this.unitQuote.innerText = '轻点棋盘上的修仙者或凶兽，参看其本命真元与神通。';
      if (this.unitAvatar) {
        this.unitAvatar.classList.remove('low-hp', 'hit-flash', 'cast-aura');
        this.unitAvatar.innerText = '☯';
      }
      if (this.unitActionBadge) {
        this.unitActionBadge.innerText = '【🧘 待机吐纳】';
        this.unitActionBadge.style.color = '#4ade80';
        this.unitActionBadge.style.borderColor = '#22c55e';
      }
      if (this.unitStanceTip) {
        this.unitStanceTip.innerText = '✦ 气定神闲 · 轻点单位参看命盘';
      }
      this.skillsContainer.innerHTML = '';
      this.hideFloatingSkills();
      this.updateActionHubUI(null);
      this.resetSkillInspection();
      if (this.btnUndo) this.btnUndo.disabled = true;
      return;
    }

    if (this.btnUndo) {
      this.btnUndo.disabled = !(unit.team === TEAM.PLAYER && unit.hasMoved && !unit.hasActed);
    }

    this.unitName.innerText = unit.name;
    this.unitTitle.innerText = unit.title;
    this.unitRealm.innerText = unit.realm;

    const elem = ELEMENT_INFO[unit.element];
    this.unitElement.innerText = `${elem.name}行天命 (${elem.desc})`;
    this.unitElement.style.color = elem.color;

    this.unitHp.innerText = `${unit.hp} / ${unit.maxHp}`;
    this.unitHpBar.style.width = `${Math.round((unit.hp / unit.maxHp) * 100)}%`;

    this.unitQi.innerText = `${unit.qi} / ${unit.maxQi}`;
    this.unitQiBar.style.width = `${Math.round((unit.qi / unit.maxQi) * 100)}%`;

    this.unitAtk.innerText = unit.getEffectiveAttack();
    this.unitDef.innerText = unit.getEffectiveDefense();
    this.unitMove.innerText = unit.moveRange;
    this.unitQuote.innerText = `“${unit.quote}”`;

    // 动作状态徽章
    if (this.unitActionBadge) {
      const badge = unit.getActionBadge ? unit.getActionBadge() : { text: '【🧘 待机吐纳】', color: '#4ade80' };
      this.unitActionBadge.innerText = badge.text;
      this.unitActionBadge.style.color = badge.color;
      this.unitActionBadge.style.borderColor = badge.color;
    }

    // 动态战术身法提示
    if (this.unitStanceTip) {
      if (unit.team === TEAM.PLAYER) {
        if (unit.actionState === 'guard') {
          this.unitStanceTip.innerText = '🛡️ 已凝气御守：周身六芒护体罡气流转，防御大增！';
        } else if (unit.hasMoved && !unit.hasActed) {
          this.unitStanceTip.innerText = '🏃 已踏星移行：可释放神通，或鼠标右键撤销移动！';
        } else if (unit.isDone) {
          this.unitStanceTip.innerText = '✨ 本回合修持完毕，静待天衍星宿运转。';
        } else {
          this.unitStanceTip.innerText = '✦ 灵光内蕴：指点绿格移动，或点击神通蓄力施展！';
        }
      } else {
        this.unitStanceTip.innerText = '👹 荒古凶煞：警惕其嗜血狂性，巧用五行生克破敌！';
      }
    }

    if (this.unitAvatar) {
      if (unit.hp > 0 && unit.hp / unit.maxHp <= 0.35) {
        this.unitAvatar.classList.add('low-hp');
      } else {
        this.unitAvatar.classList.remove('low-hp');
      }

      if (unit.avatarImg || unit.templateId) {
        const action = unit.actionState || 'idle';
        const spriteSrc = `assets/sprites/${unit.templateId}_${action}.png`;
        this.unitAvatar.innerHTML = `
          <div class="avatar-25d-stage">
            <div class="avatar-25d-pedestal"></div>
            <div class="avatar-25d-ring"></div>
            <img src="${spriteSrc}" alt="${unit.name}" class="pixel-avatar-img avatar-25d-character" onerror="this.src='${unit.avatarImg}'">
          </div>
        `;
      } else {
        this.unitAvatar.innerText = unit.avatarFallback;
      }
    }

    this.updateSkillsUI(unit);
    if (unit.team === TEAM.PLAYER && !unit.hasActed) {
      this.showFloatingActionMenu(unit, this.currentFloatingMode || 'ACTION');
    } else {
      this.hideFloatingSkills();
    }
    this.resetSkillInspection();
  }

  getSkillIcon(skill) {
    if (!skill) return '⚔️';
    const iconMap = {
      SWORD_PIERCE: '🗡️',
      THOUSAND_SWORDS: '🌪️',
      SWORD_AURA_BURST: '⚡',
      WOOD_HEAL: '🌿',
      FOX_CHARM: '🌸',
      NINE_TAIL_RENEW: '🦊',
      BIFANG_FIRE: '🔥',
      BIFANG_HELLFIRE: '☄️',
      HUODOU_BITE: '🐺',
      GUDIAO_TALON: '🦅',
      DANGKANG_SLAM: '🐗',
      TAOWU_ROAR: '👹',
      XIANGLIU_POISON: '🐍',
      QIONGQI_DIVE: '🐅',
      ZHUJIUYIN_DAY_NIGHT: '🐉'
    };
    if (skill.icon) return skill.icon;
    if (iconMap[skill.id]) return iconMap[skill.id];
    if (skill.isHeal) return '🌿';
    if (skill.element === 'FIRE') return '🔥';
    if (skill.element === 'METAL') return '🗡️';
    if (skill.element === 'WOOD') return '🌸';
    if (skill.element === 'WATER') return '💧';
    if (skill.element === 'EARTH') return '⛰️';
    return '⚔️';
  }

  getSkillShortName(skill) {
    if (!skill) return '招式';
    const map = {
      SWORD_PIERCE: '破空剑',
      THOUSAND_SWORDS: '万剑阵',
      SWORD_AURA_BURST: '太白极刃',
      WOOD_HEAL: '逢春术',
      FOX_CHARM: '狐魅术',
      NINE_TAIL_RENEW: '九尾回天',
      BIFANG_FIRE: '赤羽焰',
      BIFANG_HELLFIRE: '讹火劫',
      HUODOU_BITE: '狂噬',
      GUDIAO_TALON: '铁角穿云',
      DANGKANG_SLAM: '撼地突',
      TAOWU_ROAR: '地脉裂',
      XIANGLIU_POISON: '九首腐泽',
      QIONGQI_DIVE: '嗜血扑杀',
      ZHUJIUYIN_DAY_NIGHT: '太古极光'
    };
    return map[skill.id] || (skill.name ? skill.name.slice(0, 4) : '秘术');
  }

  getSkillAreaTypeName(areaType) {
    const map = {
      SINGLE: '单体破袭',
      LINE: '直线穿透',
      AOE_CROSS: '十字剑阵',
      AOE_SQUARE: '九宫法相',
      ALL: '全屏覆盖'
    };
    return map[areaType] || '目标地格';
  }

  showFloatingActionMenu(unit, mode = 'ACTION') {
    if (!unit || unit.team !== TEAM.PLAYER || unit.hasActed || !unit.isAlive) {
      this.hideFloatingSkills();
      this.updateActionHubUI(null);
      return;
    }

    this.currentFloatingMode = mode;
    this.updateActionHubUI(unit, mode);

    if (!this.unitFloatingSkills) return;
    this.unitFloatingSkills.innerHTML = '';

    const isInfiniteQi = this.game.practice && this.game.practice.isActive && this.game.practice.config.infiniteQi;

    if (mode === 'ACTION') {
      const actionsGroup = document.createElement('div');
      actionsGroup.className = 'floating-actions-group';

      // 1. [🏃 移动] 或 [↶ 撤步]
      const moveBtn = document.createElement('button');
      if (unit.hasMoved) {
        moveBtn.className = 'floating-action-btn btn-undo';
        moveBtn.innerHTML = '<span class="btn-icon">↶</span><span class="btn-label">撤步</span>';
        moveBtn.addEventListener('mouseenter', () => this.inspectAction('UNDO', unit));
        moveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.game.undoCurrentMove();
        });
      } else {
        moveBtn.className = 'floating-action-btn btn-move';
        moveBtn.innerHTML = '<span class="btn-icon">🏃</span><span class="btn-label">移动</span>';
        moveBtn.addEventListener('mouseenter', () => this.inspectAction('MOVE', unit));
        moveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.game.startMoveSelection();
        });
      }
      moveBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
      actionsGroup.appendChild(moveBtn);

      // 2. [⚔️ 攻击] -> 点击切换为技能选择子弹窗
      const attackBtn = document.createElement('button');
      attackBtn.className = 'floating-action-btn btn-attack';
      attackBtn.innerHTML = '<span class="btn-icon">⚔️</span><span class="btn-label">攻击</span>';
      attackBtn.addEventListener('mouseenter', () => this.inspectAction('ATTACK', unit));
      attackBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
      attackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.sound.playSelect();
        this.showFloatingActionMenu(unit, 'SKILLS');
      });
      actionsGroup.appendChild(attackBtn);

      // 3. [🛡️ 防御] -> 凝气御守
      const guardBtn = document.createElement('button');
      guardBtn.className = 'floating-action-btn btn-guard';
      guardBtn.innerHTML = '<span class="btn-icon">🛡️</span><span class="btn-label">防御</span>';
      guardBtn.addEventListener('mouseenter', () => this.inspectGuard(unit));
      guardBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
      guardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.executeGuardAction();
      });
      actionsGroup.appendChild(guardBtn);

      this.unitFloatingSkills.appendChild(actionsGroup);
    } else if (mode === 'SKILLS') {
      const skillsGroup = document.createElement('div');
      skillsGroup.className = 'floating-skills-subgroup';

      // 1. [↶ 返回] 一级指令按钮
      const backBtn = document.createElement('div');
      backBtn.className = 'floating-skill-back-btn';
      backBtn.title = '返回行动抉择';
      backBtn.innerHTML = '<span class="back-icon">↶</span><span class="back-text">返回</span>';
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.sound.playSelect();
        this.showFloatingActionMenu(unit, 'ACTION');
      });
      skillsGroup.appendChild(backBtn);

      // 2. 主动神通图标
      unit.skills.forEach(skill => {
        const btn = document.createElement('div');
        const elemClass = (skill.element || 'metal').toLowerCase();
        const isSelected = this.selectedSkill === skill;
        const canCast = (unit.qi >= skill.costQi || isInfiniteQi) && !unit.hasActed;

        btn.className = `floating-skill-icon elem-${elemClass} ${isSelected ? 'active' : ''} ${!canCast ? 'disabled' : ''}`;
        btn.dataset = btn.dataset || {};
        btn.dataset.skillId = skill.id;

        btn.innerHTML = `
          <span class="skill-glyph">${this.getSkillIcon(skill)}</span>
          <span class="skill-mini-name">${this.getSkillShortName(skill)}</span>
          <span class="skill-qi-badge ${skill.costQi === 0 ? 'zero' : ''}">${skill.costQi}气</span>
        `;

        btn.addEventListener('mouseenter', () => {
          this.inspectSkill(skill, unit, this.selectedSkill === skill);
        });

        btn.addEventListener('mouseleave', () => {
          if (this.selectedSkill) {
            this.inspectSkill(this.selectedSkill, unit, true);
          } else {
            this.resetSkillInspection();
          }
        });

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!canCast) {
            window.sound.playBuzz();
            this.addLog(`【真元不足】施展【${skill.name}】需 ${skill.costQi} 点真元，当前仅有 ${unit.qi} 点！`);
            if (this.unitQiBar) {
              this.unitQiBar.style.boxShadow = '0 0 16px #ef4444';
              setTimeout(() => {
                if (this.unitQiBar) this.unitQiBar.style.boxShadow = '';
              }, 300);
            }
            return;
          }

          window.sound.playSelect();
          this.game.selectSkill(skill);
          this.highlightFloatingSkill(skill);
          this.updateActionHubUI(unit, 'SKILLS');
          this.inspectSkill(skill, unit, true);
        });

        skillsGroup.appendChild(btn);
      });

      this.unitFloatingSkills.appendChild(skillsGroup);
    }

    // 计算棋盘像素坐标定位 (居中锚定在角色头顶，加上父级 .canvas-wrapper 的 8px 内边距)
    const tileSize = this.game.renderer.tileSize || 45;
    const pad = 8;
    const ux = (unit.renderX !== undefined ? unit.renderX : unit.x);
    const uy = (unit.renderY !== undefined ? unit.renderY : unit.y);
    const charCenterX = pad + (ux + 0.5) * tileSize;
    const charTopY = pad + uy * tileSize;

    let barWidth = 240;
    if (mode === 'SKILLS') {
      barWidth = (unit.skills.length + 1) * 58 + 24;
    }

    let left = Math.round(charCenterX - barWidth / 2);
    const wrapperWidth = (tileSize * (this.game.grid ? this.game.grid.cols : 20)) + pad * 2;
    const maxLeft = wrapperWidth - barWidth - 8;
    left = Math.max(pad, Math.min(maxLeft, left));

    let top = Math.round(charTopY - 72);
    let isBelow = false;
    if (top < pad) {
      top = Math.round(charTopY + tileSize + 12);
      isBelow = true;
    }

    this.unitFloatingSkills.style.position = 'absolute';
    this.unitFloatingSkills.style.zIndex = '999';
    this.unitFloatingSkills.style.left = left + 'px';
    this.unitFloatingSkills.style.top = top + 'px';
    if (this.unitFloatingSkills.classList && this.unitFloatingSkills.classList.toggle) {
      this.unitFloatingSkills.classList.toggle('position-below', isBelow);
    }
    this.unitFloatingSkills.style.display = 'flex';
    this.unitFloatingSkills.style.visibility = 'visible';
    this.unitFloatingSkills.style.pointerEvents = 'auto';
  }

  // 右侧详情控制面板同步指令中枢 (Tactical Action Hub)
  updateActionHubUI(unit, mode = 'ACTION') {
    if (!this.actionHubContainer) return;

    if (!unit || unit.team !== TEAM.PLAYER || unit.hasActed || !unit.isAlive) {
      this.actionHubContainer.innerHTML = `
        <div class="action-hub-empty">
          <span>✦ 凝神观照大荒棋局 ｜ 点击我方修士即刻展开战术抉择</span>
        </div>
      `;
      if (this.actionHubTitle) this.actionHubTitle.innerText = '✦ 战术行动指令决策';
      return;
    }

    if (mode === 'ACTION') {
      if (this.actionHubTitle) {
        this.actionHubTitle.innerText = `✦ 战术行动抉择 · ${unit.name}`;
      }
      this.actionHubContainer.innerHTML = '';
      const bar = document.createElement('div');
      bar.className = 'action-hub-bar';

      // 1. [🏃 移动] 或 [↶ 撤步]
      const moveBtn = document.createElement('button');
      if (unit.hasMoved) {
        moveBtn.className = 'hub-btn hub-btn-undo';
        moveBtn.innerHTML = '<span>↶</span> 撤回步法';
        moveBtn.addEventListener('mouseenter', () => this.inspectAction('UNDO', unit));
        moveBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
        moveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.game.undoCurrentMove();
        });
      } else {
        moveBtn.className = 'hub-btn hub-btn-move';
        moveBtn.innerHTML = '<span>🏃</span> 踏星移行';
        moveBtn.addEventListener('mouseenter', () => this.inspectAction('MOVE', unit));
        moveBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
        moveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.game.startMoveSelection();
        });
      }
      bar.appendChild(moveBtn);

      // 2. [⚔️ 攻击]
      const attackBtn = document.createElement('button');
      attackBtn.className = 'hub-btn hub-btn-attack';
      attackBtn.innerHTML = '<span>⚔️</span> 破煞出招';
      attackBtn.addEventListener('mouseenter', () => this.inspectAction('ATTACK', unit));
      attackBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
      attackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.sound.playSelect();
        this.showFloatingActionMenu(unit, 'SKILLS');
      });
      bar.appendChild(attackBtn);

      // 3. [🛡️ 防御]
      const guardBtn = document.createElement('button');
      guardBtn.className = 'hub-btn hub-btn-guard';
      guardBtn.innerHTML = '<span>🛡️</span> 凝气御守';
      guardBtn.addEventListener('mouseenter', () => this.inspectGuard(unit));
      guardBtn.addEventListener('mouseleave', () => this.resetSkillInspection());
      guardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.executeGuardAction();
      });
      bar.appendChild(guardBtn);

      this.actionHubContainer.appendChild(bar);
    } else if (mode === 'SKILLS') {
      if (this.actionHubTitle) {
        this.actionHubTitle.innerText = `✦ 破煞本命绝学 · ${unit.name}`;
      }
      this.actionHubContainer.innerHTML = '';
      const skillsGrid = document.createElement('div');
      skillsGrid.className = 'hub-skills-grid';

      const backHeader = document.createElement('div');
      backHeader.className = 'hub-back-header';

      const backTitle = document.createElement('span');
      backTitle.style.fontSize = '11px';
      backTitle.style.color = '#ecc981';
      backTitle.innerText = '【点选绝学锁定目标】';
      backHeader.appendChild(backTitle);

      const backBtn = document.createElement('button');
      backBtn.className = 'hub-btn-back';
      backBtn.innerText = '↶ 返回行动抉择';
      backBtn.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        window.sound.playSelect();
        this.showFloatingActionMenu(unit, 'ACTION');
      });
      backHeader.appendChild(backBtn);
      skillsGrid.appendChild(backHeader);

      const isInfiniteQi = this.game.practice && this.game.practice.isActive && this.game.practice.config.infiniteQi;
      unit.skills.forEach(skill => {
        const canCast = (unit.qi >= skill.costQi || isInfiniteQi) && !unit.hasActed;
        const isSelected = this.selectedSkill === skill;
        const elem = ELEMENT_INFO[skill.element] || { name: '无', color: '#94a3b8' };

        const row = document.createElement('div');
        row.className = `hub-skill-row ${isSelected ? 'active' : ''} ${!canCast ? 'disabled' : ''}`;
        row.innerHTML = `
          <div class="hub-skill-name-col">
            <span style="font-size:15px;">${this.getSkillIcon(skill)}</span>
            <span>${skill.name}</span>
          </div>
          <div class="hub-skill-meta-col">
            <span style="color:#38bdf8;font-weight:bold;">💎 ${skill.costQi}气</span>
            <span style="color:#cbd5e1;">🎯 ${skill.range}格</span>
            <span style="color:${elem.color};border:1px solid ${elem.color};padding:0 3px;border-radius:2px;font-size:10px;">${elem.name}</span>
          </div>
        `;

        row.addEventListener('mouseenter', () => {
          this.inspectSkill(skill, unit, this.selectedSkill === skill);
        });
        row.addEventListener('mouseleave', () => {
          if (this.selectedSkill) {
            this.inspectSkill(this.selectedSkill, unit, true);
          } else {
            this.resetSkillInspection();
          }
        });
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!canCast) {
            window.sound.playBuzz();
            this.addLog(`【真元不足】施展【${skill.name}】需 ${skill.costQi} 点真元，当前仅有 ${unit.qi} 点！`);
            return;
          }
          window.sound.playSelect();
          this.game.selectSkill(skill);
          this.highlightFloatingSkill(skill);
          this.updateActionHubUI(unit, 'SKILLS');
          this.inspectSkill(skill, unit, true);
        });

        skillsGrid.appendChild(row);
      });

      this.actionHubContainer.appendChild(skillsGrid);
    }
  }

  showFloatingSkills(unit, mode = 'ACTION') {
    this.showFloatingActionMenu(unit, mode);
  }

  showActionMenu(unit) {
    this.showFloatingActionMenu(unit, 'ACTION');
  }

  showSkillMenu(unit) {
    this.showFloatingActionMenu(unit, 'SKILLS');
  }

  inspectAction(actionType, unit) {
    if (!this.skillInspectionCard) return;

    if (actionType === 'MOVE') {
      if (this.skillActionStateTag) {
        this.skillActionStateTag.innerText = '踏星步法';
        this.skillActionStateTag.style.color = '#86efac';
      }
      this.skillInspectionCard.innerHTML = `
        <div class="inspection-content">
          <div class="inspection-header">
            <div class="inspection-name-row">
              <span class="inspection-title">✦ 踏星移行 · 战术身法</span>
              <span class="inspection-choreo">[🏃 凌波踏虚]</span>
            </div>
            <div class="inspection-badges-row">
              <span class="insp-pill area">🏃 步法: ${unit.moveRange}格</span>
              <span class="insp-pill range">🎯 自由寻路</span>
              <span class="insp-pill qi">💎 真元: 0</span>
            </div>
          </div>
          <div class="inspection-desc">展开神行步法，在棋盘青绿高亮地格内飞身移行。若未施展攻击神通，随时可通过右键或撤步按钮原位回溯！</div>
          <div class="inspection-status-banner preview">【✦ 指令待发】点击 [移动] 按钮显示棋盘可行格</div>
        </div>
      `;
    } else if (actionType === 'UNDO') {
      if (this.skillActionStateTag) {
        this.skillActionStateTag.innerText = '步法回溯';
        this.skillActionStateTag.style.color = '#cbd5e1';
      }
      this.skillInspectionCard.innerHTML = `
        <div class="inspection-content">
          <div class="inspection-header">
            <div class="inspection-name-row">
              <span class="inspection-title">✦ 踏星回溯 · 撤销移行</span>
              <span class="inspection-choreo">[↶ 逆转步法]</span>
            </div>
            <div class="inspection-badges-row">
              <span class="insp-pill area">↶ 原位回退</span>
              <span class="insp-pill qi">💎 无损消耗</span>
            </div>
          </div>
          <div class="inspection-desc">取消本次踏星移行，角色原路回溯至移动前的站位，并重新恢复全部行动指令！</div>
          <div class="inspection-status-banner preview">【↶ 撤步指令】点击按钮或鼠标右键即可回溯站位</div>
        </div>
      `;
    } else if (actionType === 'ATTACK') {
      if (this.skillActionStateTag) {
        this.skillActionStateTag.innerText = '武道神通';
        this.skillActionStateTag.style.color = '#fca5a5';
      }
      const elem = ELEMENT_INFO[unit.element] || { name: '无' };
      this.skillInspectionCard.innerHTML = `
        <div class="inspection-content">
          <div class="inspection-header">
            <div class="inspection-name-row">
              <span class="inspection-title">✦ 武道神通 · 破煞出招</span>
              <span class="inspection-choreo">[⚔️ 绝学出招]</span>
            </div>
            <div class="inspection-badges-row">
              <span class="insp-pill damage">⚔️ 包含 ${unit.skills.length} 门神通</span>
              <span class="elem-badge elem-${(unit.element || 'metal').toLowerCase()}">${elem.name}行天命</span>
            </div>
          </div>
          <div class="inspection-desc">展开本命神通秘卷，抉择飞剑突刺、万剑大阵、仙霖妙法或奥义大招，锁定并惩戒敌对凶煞！</div>
          <div class="inspection-status-banner preview">【⚔️ 出招抉择】点击 [攻击] 按钮展开招式技能库</div>
        </div>
      `;
    }
  }

  hideFloatingSkills() {
    if (this.unitFloatingSkills) {
      this.unitFloatingSkills.style.display = 'none';
    }
  }

  highlightFloatingSkill(skill) {
    if (this.unitFloatingSkills) {
      const icons = this.unitFloatingSkills.querySelectorAll('.floating-skill-icon');
      icons.forEach(icon => {
        if (skill && icon.dataset && icon.dataset.skillId === skill.id) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      });
    }
    if (this.actionHubContainer) {
      const rows = this.actionHubContainer.querySelectorAll('.hub-skill-row');
      rows.forEach(row => {
        const titleEl = row.querySelector('.hub-skill-name-col span:last-child');
        if (skill && titleEl && titleEl.innerText === skill.name) {
          row.classList.add('active');
        } else {
          row.classList.remove('active');
        }
      });
    }
  }

  inspectSkill(skill, unit, isSelected = false) {
    if (!this.skillInspectionCard) return;

    if (this.skillActionStateTag) {
      if (isSelected) {
        this.skillActionStateTag.innerText = '⚡ 蓄力锁定';
        this.skillActionStateTag.style.color = '#4ade80';
      } else {
        this.skillActionStateTag.innerText = '✦ 神通真解';
        this.skillActionStateTag.style.color = '#fde047';
      }
    }

    const choreo = this.getSkillActionChoreography(skill);
    const elem = ELEMENT_INFO[skill.element] || { name: '无', color: '#94a3b8' };
    const isInfiniteQi = this.game.practice && this.game.practice.isActive && this.game.practice.config.infiniteQi;
    const canCast = unit ? (unit.qi >= skill.costQi || isInfiniteQi) : true;

    let statusBannerHtml = '';
    if (isSelected) {
      statusBannerHtml = `<div class="inspection-status-banner ready">【⚡ 蓄力锁定中】请在棋盘点击高亮目标施展 · 右键取消</div>`;
    } else if (!canCast && unit) {
      statusBannerHtml = `<div class="inspection-status-banner warn">【⚠️ 真元不足】当前真元 ${unit.qi}/${unit.maxQi}，无法催动此秘术</div>`;
    } else {
      statusBannerHtml = `<div class="inspection-status-banner preview">【✦ 悬停参悟中】点击棋盘悬浮图标进入施法蓄力</div>`;
    }

    this.skillInspectionCard.innerHTML = `
      <div class="inspection-content">
        <div class="inspection-header">
          <div class="inspection-name-row">
            <span class="inspection-title">✦ ${skill.name}</span>
            <span class="inspection-choreo">${choreo}</span>
          </div>
          <div class="inspection-badges-row">
            <span class="elem-badge elem-${(skill.element || 'metal').toLowerCase()}">${elem.name}行天命</span>
            <span class="insp-pill qi">💎 真元: ${skill.costQi}</span>
            <span class="insp-pill range">🎯 射程: ${skill.range}格</span>
            <span class="insp-pill area">📐 ${this.getSkillAreaTypeName(skill.areaType)}</span>
            ${skill.damageScale ? `<span class="insp-pill damage">💥 威力: ${Math.round(skill.damageScale * 100)}%</span>` : ''}
            ${skill.isHeal ? `<span class="insp-pill area">💖 治疗: ${skill.healAmount}</span>` : ''}
          </div>
        </div>
        <div class="inspection-desc">${skill.desc}</div>
        ${statusBannerHtml}
      </div>
    `;
  }

  inspectGuard(unit) {
    if (!this.skillInspectionCard) return;

    if (this.skillActionStateTag) {
      this.skillActionStateTag.innerText = '🛡️ 守御心法';
      this.skillActionStateTag.style.color = '#5eead4';
    }

    this.skillInspectionCard.innerHTML = `
      <div class="inspection-content">
        <div class="inspection-header">
          <div class="inspection-name-row">
            <span class="inspection-title">☯ 凝气御守 · 护体真罡</span>
            <span class="inspection-choreo">[🛡️ 凝罡御守架势]</span>
          </div>
          <div class="inspection-badges-row">
            <span class="elem-badge" style="background:#133935;color:#5eead4;border:1px solid #5eead4;">纯阳罡气</span>
            <span class="insp-pill qi" style="background:#064e3b;color:#a7f3d0;border-color:#10b981;">💎 真元: 0</span>
            <span class="insp-pill area">🧘 沉肩运化</span>
            <span class="insp-pill damage" style="background:#1e3a5f;color:#93c5fd;border-color:#3b82f6;">🛡️ 抵挡1次攻击</span>
          </div>
        </div>
        <div class="inspection-desc">原地沉肩调息，展开周天旋转金光/青碧六芒护体罡气，完全抵御下一次任意杀伐伤害并结束本候回合。</div>
        <div class="inspection-status-banner ready">【🛡️ 守御心法】点击棋盘悬浮御守图标即刻施展</div>
      </div>
    `;
  }

  resetSkillInspection() {
    if (!this.skillInspectionCard) return;

    if (this.selectedSkill && this.currentUnit) {
      this.inspectSkill(this.selectedSkill, this.currentUnit, true);
      return;
    }

    if (this.skillActionStateTag) {
      this.skillActionStateTag.innerText = this.currentUnit ? '待机调息' : '神识感应';
      this.skillActionStateTag.style.color = '#fde047';
    }

    if (this.currentUnit) {
      const isPlayer = this.currentUnit.team === TEAM.PLAYER;
      this.skillInspectionCard.innerHTML = `
        <div class="inspection-empty">
          <div class="inspection-empty-icon">${isPlayer ? '☯' : '👹'}</div>
          <div class="inspection-empty-title">✦ ${isPlayer ? '凝神入定 · 观照命盘' : '荒古凶兽 · 煞气感应'}</div>
          <div class="inspection-empty-desc">${isPlayer ? '请点击角色身旁【悬浮招式图标】蓄力施法，或悬停图标参悟绝学秘卷。' : '此凶兽残暴凶悍，请依五行生克推演战法破其破绽。'}</div>
        </div>
      `;
    } else {
      this.skillInspectionCard.innerHTML = `
        <div class="inspection-empty">
          <div class="inspection-empty-icon">📜</div>
          <div class="inspection-empty-title">✦ 大荒天衍 · 神通秘卷</div>
          <div class="inspection-empty-desc">轻点棋盘上的修仙同盟或凶兽，参看其本命真元与五行秘法。</div>
        </div>
      `;
    }
  }

  getSkillActionChoreography(skill) {
    const map = {
      SWORD_PIERCE: '[🗡️ 飞剑贯日·疾刺架势]',
      THOUSAND_SWORDS: '[🌪️ 万剑归宗·剑阵腾空]',
      SWORD_AURA_BURST: '[⚡ 太白极刃·人剑合一]',
      WOOD_HEAL: '[🌿 万木逢春·结印仙霖]',
      FOX_CHARM: '[🌸 青丘狐魅·幻影魅步]',
      NINE_TAIL_RENEW: '[🦊 九尾回天·天狐法相]',
      BIFANG_FIRE: '[🔥 赤羽神焰·吐火烈袭]',
      BIFANG_HELLFIRE: '[☄️ 讹火天劫·焚世展翼]',
      HUODOU_BITE: '[🐺 炎魔狂噬·撕咬扑杀]',
      GUDIAO_TALON: '[🦅 铁角穿云·极速俯冲]',
      DANGKANG_SLAM: '[🐗 撼地蛮突·地脉裂震]',
      TAOWU_ROAR: '[👹 地脉崩裂·重踏破封]',
      XIANGLIU_POISON: '[🐍 九首腐泽·狂喷毒沼]',
      QIONGQI_DIVE: '[🐅 嗜血扑杀·凶风爪击]',
      ZHUJIUYIN_DAY_NIGHT: '[🐉 太古睁暝·极光阴阳]'
    };
    return map[skill.id] || '[⚔️ 破煞杀伐·武道出招]';
  }

  updateSkillsUI(unit) {
    this.skillsContainer.innerHTML = '';
    if (unit.team !== TEAM.PLAYER) return;

    unit.skills.forEach(skill => {
      const btn = document.createElement('button');
      btn.className = `skill-btn ${this.selectedSkill === skill ? 'active' : ''}`;
      const canCast = unit.qi >= skill.costQi && !unit.hasActed;
      btn.disabled = !canCast;

      const choreo = this.getSkillActionChoreography(skill);
      const elem = ELEMENT_INFO[skill.element];

      btn.innerHTML = `
        <div class="skill-head">
          <span class="skill-name">✦ ${skill.name} <small style="color:#fde047;font-size:11px;">${choreo}</small></span>
          <span class="skill-cost" style="color:${elem ? elem.color : '#72b7f7'}">真元: ${skill.costQi} ｜ 射程: ${skill.range}</span>
        </div>
        <div class="skill-desc">${skill.desc}</div>
      `;

      btn.addEventListener('click', () => {
        window.sound.playSelect();
        this.game.selectSkill(skill);
      });
      this.skillsContainer.appendChild(btn);
    });

    if (!unit.hasActed) {
      const restBtn = document.createElement('button');
      restBtn.className = 'skill-btn rest-btn';
      restBtn.innerHTML = `
        <div class="skill-head">
          <span class="skill-name">☯ 凝气御守 · 护体真罡 <small style="color:#ecc981;font-size:11px;">[🛡️ 凝罡御守架势]</small></span>
          <span class="skill-cost" style="color:#5eead4;">真元: 0</span>
        </div>
        <div class="skill-desc">原地沉肩调息，展开旋转金光/青碧六芒护体罡气，抵挡下一次攻击并结束回合。</div>
      `;
      restBtn.addEventListener('click', () => {
        window.sound.playSelect();
        unit.hasActed = true;
        unit.hasMoved = true;
        unit.playAction('guard', 9999);
        this.game.vfx.spawnGuardBarrierVFX(
          (unit.x + 0.5) * this.game.renderer.tileSize,
          (unit.y + 0.5) * this.game.renderer.tileSize
        );
        this.game.addLog(`${unit.name} 凝气御守，吐纳周天，展开护体真罡金芒！`);
        this.updateUnitCard(unit);
        this.game.clearSelection();
        this.game.checkTurnComplete();
      });
      this.skillsContainer.appendChild(restBtn);
    }
  }

  addLog(msg) {
    if (!this.combatLog) return;
    const p = document.createElement('p');
    p.className = 'log-item';
    p.innerHTML = `<span class="log-dot">◆</span> ${msg}`;
    this.combatLog.appendChild(p);
    this.combatLog.scrollTop = this.combatLog.scrollHeight;
  }

  showGameOver(isVictory) {
    this.gameModal.style.display = 'flex';
    if (isVictory) {
      window.sound.playVictory();
      this.modalTitle.innerText = '道破混沌 · 大荒底定';
      this.modalTitle.className = 'modal-title victory';
      this.modalDesc.innerText = '恭贺道友涤荡受蚀凶煞，天衍星盘重焕清明！';
      if (this.modalRating) this.modalRating.innerText = '【战役评价：甲上 · 神机妙算】';
      if (this.modalNextBtn) this.modalNextBtn.innerText = '启程 · 继续探道';
      this.modalRestartBtn.innerText = '再探此局';
    } else {
      this.modalTitle.innerText = '道消身陨 · 轮回再起';
      this.modalTitle.className = 'modal-title defeat';
      this.modalDesc.innerText = '修仙向死而生，元神虽受创兵解，重聚灵气尚可逆天改命！';
      if (this.modalRating) this.modalRating.innerText = '【战役评价：受创兵解】';
      if (this.modalNextBtn) this.modalNextBtn.style.display = 'none';
      this.modalRestartBtn.innerText = '重聚元神 · 再战';
    }
  }
}

window.UIManager = UIManager;
