/**
 * 《山海问道录·天衍棋局》核心常量与五行定义
 */

// 东方五行体系
const ELEMENT = {
  METAL: 0, // 金
  WOOD: 1,  // 木
  WATER: 2, // 水
  FIRE: 3,  // 火
  EARTH: 4  // 土
};

const ELEMENT_INFO = {
  [ELEMENT.METAL]: {
    name: '金',
    desc: '庚金利刃，破煞无坚不摧',
    color: '#ECC981',
    darkColor: '#B08332',
    counter: ELEMENT.WOOD,     // 金克木
    generatedBy: ELEMENT.EARTH // 土生金
  },
  [ELEMENT.WOOD]: {
    name: '木',
    desc: '青木参天，生生不息逢春',
    color: '#65C27D',
    darkColor: '#2F7C44',
    counter: ELEMENT.EARTH,    // 木克土
    generatedBy: ELEMENT.WATER // 水生木
  },
  [ELEMENT.WATER]: {
    name: '水',
    desc: '玄水滔滔，至阴柔化万物',
    color: '#55A8F2',
    darkColor: '#2361A1',
    counter: ELEMENT.FIRE,     // 水克火
    generatedBy: ELEMENT.METAL // 金生水
  },
  [ELEMENT.FIRE]: {
    name: '火',
    desc: '三昧神火，焚尽大荒混沌',
    color: '#F25842',
    darkColor: '#B22514',
    counter: ELEMENT.METAL,    // 火克金
    generatedBy: ELEMENT.WOOD  // 木生火
  },
  [ELEMENT.EARTH]: {
    name: '土',
    desc: '息壤后土，厚德载物守御',
    color: '#D4A36A',
    darkColor: '#7A542A',
    counter: ELEMENT.WATER,    // 土克水
    generatedBy: ELEMENT.FIRE  // 火生土
  }
};

// 阵营划分
const TEAM = {
  PLAYER: 'PLAYER', // 我方修仙同盟
  ENEMY: 'ENEMY'    // 荒古混沌凶兽
};

// 地貌类型
const TERRAIN_TYPE = {
  PLAIN: 'PLAIN',               // 荒古平原 (无额外消耗)
  WATER_SPRING: 'WATER_SPRING', // 水华天泉 (回合初恢复气血与灵力)
  FIRE_VEIN: 'FIRE_VEIN',       // 祝融火脉 (火系神通威能+35%)
  WOOD_GROVE: 'WOOD_GROVE',     // 青木古林 (受击闪避+20%，木系消耗减半)
  STONE_WALL: 'STONE_WALL'      // 巨石绝壁 (不可通行阻碍)
};

const TERRAIN_CONFIG = {
  [TERRAIN_TYPE.PLAIN]: {
    name: '凡土平原',
    moveCost: 1,
    passable: true,
    color: '#1a1f1b',
    borderColor: '#2d382f',
    desc: '平凡开阔地表'
  },
  [TERRAIN_TYPE.WATER_SPRING]: {
    name: '水华灵泉',
    moveCost: 1,
    passable: true,
    color: '#122538',
    borderColor: '#2a5f8f',
    desc: '灵气喷涌，回合开始恢复 25 气血与 1 灵力'
  },
  [TERRAIN_TYPE.FIRE_VEIN]: {
    name: '祝融火脉',
    moveCost: 1,
    passable: true,
    color: '#341a16',
    borderColor: '#8d3224',
    desc: '地火升腾，火系神通伤害提升 35%'
  },
  [TERRAIN_TYPE.WOOD_GROVE]: {
    name: '建木遗林',
    moveCost: 1.5,
    passable: true,
    color: '#162e21',
    borderColor: '#316947',
    desc: '繁枝庇护，受击获得 20% 闪避率'
  },
  [TERRAIN_TYPE.STONE_WALL]: {
    name: '玄黄巨岩',
    moveCost: 999,
    passable: false,
    color: '#282522',
    borderColor: '#4d463e',
    desc: '天坠险石，无法通行与跨越'
  }
};
