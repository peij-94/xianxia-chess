/**
 * 《山海问道录·天衍棋局》16-Bit 棋盘网格、多关卡地形与寻路系统
 */

class GridBoard {
  constructor(cols = 20, rows = 20) {
    this.cols = cols;
    this.rows = rows;
    this.terrain = [];
    this.initDefaultMap();
  }

  // 初始化空白平原
  initBlankMap() {
    this.terrain = [];
    for (let y = 0; y < this.rows; y++) {
      const row = [];
      for (let x = 0; x < this.cols; x++) {
        row.push(TERRAIN_TYPE.PLAIN);
      }
      this.terrain.push(row);
    }
  }

  // 加载指定章节的战役地图
  loadChapterMap(chapter) {
    this.initBlankMap();

    // 1. 设置障碍玄石
    if (chapter.gridObstacles) {
      chapter.gridObstacles.forEach(([ox, oy]) => {
        this.setTerrain(ox, oy, TERRAIN_TYPE.STONE_WALL);
      });
    }

    // 2. 根据章节主题布置山海地脉 (20x20 宏大战场)
    if (chapter.id === 1) {
      // 第一回：青丘之野 —— 灵泉甘霖与建木古林
      [[3, 6], [4, 6], [15, 14], [16, 14], [9, 10], [10, 10]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.WATER_SPRING);
      });
      [[7, 4], [8, 4], [7, 15], [8, 15], [11, 7], [12, 12], [4, 12], [15, 7]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.WOOD_GROVE);
      });
    } else if (chapter.id === 2) {
      // 第二回：章莪之山 —— 祝融火脉密布
      [[6, 5], [7, 5], [6, 14], [7, 14], [12, 6], [13, 6], [12, 13], [13, 13], [9, 9], [10, 10]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.FIRE_VEIN);
      });
      [[3, 10], [16, 10]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.WATER_SPRING);
      });
    } else if (chapter.id === 3) {
      // 第三回：昆仑之渊 —— 封魔鏖战，火水交织
      [[4, 5], [15, 14], [10, 5]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.WATER_SPRING);
      });
      [[8, 8], [9, 8], [11, 11], [12, 11], [14, 6], [5, 13]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.FIRE_VEIN);
      });
      [[6, 10], [7, 10], [12, 9], [13, 9]].forEach(([x, y]) => {
        this.setTerrain(x, y, TERRAIN_TYPE.WOOD_GROVE);
      });
    }
  }

  initDefaultMap() {
    this.loadChapterMap(CAMPAIGN_CHAPTERS[0]);
  }

  setTerrain(x, y, type) {
    if (this.isValid(x, y)) {
      this.terrain[y][x] = type;
    }
  }

  getTerrain(x, y) {
    if (!this.isValid(x, y)) return null;
    return this.terrain[y][x];
  }

  isValid(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  isPassable(x, y) {
    if (!this.isValid(x, y)) return false;
    const t = this.getTerrain(x, y);
    return TERRAIN_CONFIG[t].passable;
  }

  getDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  getReachableTiles(unit, unitsList) {
    const reachable = new Map();
    const startKey = `${unit.x},${unit.y}`;
    reachable.set(startKey, { x: unit.x, y: unit.y, cost: 0, path: [{ x: unit.x, y: unit.y }] });

    const queue = [{ x: unit.x, y: unit.y, cost: 0, path: [{ x: unit.x, y: unit.y }] }];

    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();

      for (const d of dirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        const key = `${nx},${ny}`;

        if (!this.isValid(nx, ny)) continue;
        if (!this.isPassable(nx, ny)) continue;

        const occUnit = unitsList.find(u => u.isAlive && u.x === nx && u.y === ny);
        if (occUnit && occUnit.team !== unit.team) {
          continue; // 敌方ZOC阻挡
        }

        const terrainType = this.getTerrain(nx, ny);
        const stepCost = TERRAIN_CONFIG[terrainType].moveCost;
        const totalCost = current.cost + stepCost;

        if (totalCost <= unit.moveRange) {
          if (!reachable.has(key) || reachable.get(key).cost > totalCost) {
            const newPath = [...current.path, { x: nx, y: ny }];
            const item = { x: nx, y: ny, cost: totalCost, path: newPath };
            reachable.set(key, item);
            queue.push(item);
          }
        }
      }
    }

    const validDestinations = [];
    reachable.forEach((val) => {
      const occupiedByOther = unitsList.some(u => u.isAlive && u.id !== unit.id && u.x === val.x && u.y === val.y);
      if (!occupiedByOther) {
        validDestinations.push(val);
      }
    });

    return validDestinations;
  }

  getSkillTargetTiles(unit, skill) {
    const targets = [];
    const minR = skill.minRange || 0;
    const maxR = skill.range;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const dist = this.getDistance(unit.x, unit.y, x, y);
        if (dist >= minR && dist <= maxR) {
          targets.push({ x, y });
        }
      }
    }
    return targets;
  }

  getAoeAffectedTiles(centerX, centerY, skill) {
    const affected = [{ x: centerX, y: centerY }];
    if (!skill.areaType || skill.areaType === 'SINGLE') {
      return affected;
    }

    if (skill.areaType === 'AOE_CROSS') {
      const offsets = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
      ];
      offsets.forEach(off => {
        const nx = centerX + off.dx;
        const ny = centerY + off.dy;
        if (this.isValid(nx, ny)) affected.push({ x: nx, y: ny });
      });
    } else if (skill.areaType === 'AOE_SQUARE') {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (Math.abs(dx) + Math.abs(dy) <= 2) {
            const nx = centerX + dx;
            const ny = centerY + dy;
            if (this.isValid(nx, ny)) affected.push({ x: nx, y: ny });
          }
        }
      }
    } else if (skill.areaType === 'LINE') {
      // 沿直线扩散
      for (let i = 1; i <= 3; i++) {
        affected.push({ x: centerX, y: centerY });
      }
    }

    return affected;
  }
}
