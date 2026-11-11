/**
 * 《山海问道录·天衍棋局》16-Bit 像素战棋多关卡战役、角色突破与神通库
 */

// 神通秘术库
const SKILLS = {
  // --- 凌虚子 (金系) ---
  SWORD_PIERCE: {
    id: 'SWORD_PIERCE',
    name: '庚金破空剑',
    element: ELEMENT.METAL,
    costQi: 0,
    range: 2,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 1.0,
    knockback: 1,
    desc: '御使庚金本命飞剑，造成100%金系伤害并击退目标1格。'
  },
  THOUSAND_SWORDS: {
    id: 'THOUSAND_SWORDS',
    name: '万剑归宗',
    element: ELEMENT.METAL,
    costQi: 3,
    range: 3,
    minRange: 1,
    areaType: 'AOE_CROSS',
    damageScale: 1.75,
    knockback: 0,
    desc: '太虚剑阵奥义！万柄灵剑从天而降，对目标及十字相邻地格造成175%暴击伤害。'
  },
  SWORD_AURA_BURST: {
    id: 'SWORD_AURA_BURST',
    name: '天人合一·太白极刃',
    element: ELEMENT.METAL,
    costQi: 4,
    range: 4,
    minRange: 1,
    areaType: 'LINE',
    damageScale: 2.2,
    knockback: 2,
    desc: '【突破绝技】人剑合一化作一道百丈金色剑芒穿透直线所有敌人，必定暴击！'
  },

  // --- 白浅 (木系) ---
  WOOD_HEAL: {
    id: 'WOOD_HEAL',
    name: '万木逢春',
    element: ELEMENT.WOOD,
    costQi: 2,
    range: 3,
    minRange: 0,
    isHeal: true,
    areaType: 'SINGLE',
    healAmount: 48,
    desc: '引九畿建木长生灵息，为指定友军恢复48点气血并驱散一切负面状态。'
  },
  FOX_CHARM: {
    id: 'FOX_CHARM',
    name: '青丘狐魅',
    element: ELEMENT.WOOD,
    costQi: 1,
    range: 2,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 0.85,
    debuff: { type: 'WEAK', duration: 1, stat: 'attack', reduction: 0.4 },
    desc: '天狐灵魅之息，造成85%木系伤害，并使目标攻击力骤降40%，持续1回合。'
  },
  NINE_TAIL_RENEW: {
    id: 'NINE_TAIL_RENEW',
    name: '九尾回天大灵雨',
    element: ELEMENT.WOOD,
    costQi: 4,
    range: 3,
    isHeal: true,
    areaType: 'AOE_SQUARE',
    healAmount: 75,
    desc: '【突破绝技】展露九尾天狐法相，降下甘霖为范围内所有友方恢复75点巨量气血！'
  },

  // --- 毕方 (火系) ---
  BIFANG_FIRE: {
    id: 'BIFANG_FIRE',
    name: '独足赤羽焰',
    element: ELEMENT.FIRE,
    costQi: 0,
    range: 2,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 1.1,
    desc: '毕方喷吐三昧灵火，造成110%火系灼烧伤害。'
  },
  BIFANG_HELLFIRE: {
    id: 'BIFANG_HELLFIRE',
    name: '大荒讹火劫',
    element: ELEMENT.FIRE,
    costQi: 3,
    range: 3,
    minRange: 1,
    areaType: 'AOE_SQUARE',
    damageScale: 1.6,
    desc: '降下太古讹火神劫，对范围内所有敌人造成160%烈火焚世伤害！'
  },

  // --- 敌对凶兽技能 ---
  HUODOU_BITE: {
    id: 'HUODOU_BITE',
    name: '炎魔狂噬',
    element: ELEMENT.FIRE,
    costQi: 0,
    range: 1,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 1.15,
    desc: '凶兽恶犬猛扑撕咬，附带浓烈炽热炎息。'
  },
  GUDIAO_TALON: {
    id: 'GUDIAO_TALON',
    name: '穿云铁角刺',
    element: ELEMENT.METAL,
    costQi: 0,
    range: 1,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 1.3,
    desc: '凶禽自高空俯冲，以锐利铁角贯穿护甲。'
  },
  DANGKANG_SLAM: {
    id: 'DANGKANG_SLAM',
    name: '撼地蛮突',
    element: ELEMENT.EARTH,
    costQi: 1,
    range: 1,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 1.4,
    knockback: 1,
    desc: '借山岳巨力猛烈冲撞，震退敌人1格。'
  },
  TAOWU_ROAR: {
    id: 'TAOWU_ROAR',
    name: '荒古四凶·地脉崩裂',
    element: ELEMENT.EARTH,
    costQi: 2,
    range: 2,
    areaType: 'AOE_CROSS',
    damageScale: 1.8,
    knockback: 1,
    desc: '【Boss大招】梼杌重踏大地，引发十字地脉崩碎，震飞范围内的所有修士！'
  },
  TAOWU_ROAR: {
    id: 'TAOWU_ROAR',
    name: '荒古四凶·地脉崩裂',
    element: ELEMENT.EARTH,
    costQi: 2,
    range: 2,
    areaType: 'AOE_CROSS',
    damageScale: 1.8,
    knockback: 1,
    desc: '【Boss大招】梼杌重踏大地，引发十字地脉崩碎，震飞范围内的所有修士！'
  },

  // --- 新增荒古大能异兽技能 ---
  // 相柳
  XIANGLIU_POISON: {
    id: 'XIANGLIU_POISON',
    name: '九首腐泽蚀魂',
    element: ELEMENT.WATER,
    costQi: 1,
    range: 3,
    minRange: 1,
    areaType: 'AOE_SQUARE',
    damageScale: 1.35,
    debuff: { type: 'POISON', duration: 2, stat: 'defense', value: 6, name: '九首剧毒' },
    desc: '九首毒蛇狂喷墨绿毒沼，对2x2范围内所有敌人造成135%水毒伤害并大幅腐蚀护甲！'
  },
  // 穷奇
  QIONGQI_DIVE: {
    id: 'QIONGQI_DIVE',
    name: '凶风嗜血扑杀',
    element: ELEMENT.METAL,
    costQi: 1,
    range: 3,
    minRange: 1,
    areaType: 'SINGLE',
    damageScale: 1.6,
    desc: '黑翼恶虎自苍穹俯冲撕咬，造成160%金系暴击伤害！对残血目标伤害大幅加深！'
  },
  // 烛九阴
  ZHUJIUYIN_DAY_NIGHT: {
    id: 'ZHUJIUYIN_DAY_NIGHT',
    name: '太古睁暝·逆转阴阳',
    element: ELEMENT.FIRE,
    costQi: 2,
    range: 4,
    minRange: 0,
    areaType: 'AOE_CROSS',
    damageScale: 1.9,
    desc: '【祖神奥义】张目为昼，闭目为夜！逆转乾坤昼夜天象，引发阴阳太极天罚极光！'
  }
};

// 角色预设原型 (配备独立像素立绘图片)
const UNIT_TEMPLATES = {
  // 我方修仙同盟
  lingxu: {
    id: 'lingxu',
    name: '凌虚子',
    title: '太虚剑仙',
    realm: '金丹初期',
    avatarImg: 'assets/images/lingxu.png',
    avatarFallback: '⚔️',
    element: ELEMENT.METAL,
    team: TEAM.PLAYER,
    maxHp: 135,
    maxQi: 6,
    attack: 40,
    defense: 12,
    moveRange: 4,
    skills: [SKILLS.SWORD_PIERCE, SKILLS.THOUSAND_SWORDS],
    quote: '天地为炉，我为青锋。剑出昆仑，万邪辟易！'
  },
  baiqian: {
    id: 'baiqian',
    name: '白浅',
    title: '青丘天狐',
    realm: '化灵期',
    avatarImg: 'assets/images/baiqian.png',
    avatarFallback: '🦊',
    element: ELEMENT.WOOD,
    team: TEAM.PLAYER,
    maxHp: 145,
    maxQi: 7,
    attack: 28,
    defense: 15,
    moveRange: 3,
    skills: [SKILLS.WOOD_HEAL, SKILLS.FOX_CHARM],
    quote: '青丘有木，生生不灭。借得天道甘霖，抚我大荒生灵。'
  },
  bifang: {
    id: 'bifang',
    name: '毕方',
    title: '南山火鸟',
    realm: '通玄天禽',
    avatarImg: 'assets/images/bifang.png',
    avatarFallback: '🪶',
    element: ELEMENT.FIRE,
    team: TEAM.PLAYER,
    maxHp: 115,
    maxQi: 6,
    attack: 38,
    defense: 9,
    moveRange: 3,
    skills: [SKILLS.BIFANG_FIRE, SKILLS.BIFANG_HELLFIRE],
    quote: '独足踏云烟，双翼卷天火。见我者，大荒皆焚！'
  },

  // 敌对荒古凶兽与古神
  huodou: {
    id: 'huodou',
    name: '祸斗',
    title: '食火灾犬',
    realm: '荒古狂妖',
    avatarImg: 'assets/images/huodou.png',
    avatarFallback: '🐺',
    element: ELEMENT.FIRE,
    team: TEAM.ENEMY,
    maxHp: 125,
    maxQi: 4,
    attack: 34,
    defense: 10,
    moveRange: 3,
    skills: [SKILLS.HUODOU_BITE],
    quote: '嗷吼——！烈焰入骨，焚灭万物！'
  },
  gudiao: {
    id: 'gudiao',
    name: '蛊雕',
    title: '鹿吴巨禽',
    realm: '凶戾异兽',
    avatarImg: 'assets/images/gudiao.png',
    avatarFallback: '🦅',
    element: ELEMENT.METAL,
    team: TEAM.ENEMY,
    maxHp: 100,
    maxQi: 4,
    attack: 38,
    defense: 7,
    moveRange: 4,
    skills: [SKILLS.GUDIAO_TALON],
    quote: '桀桀——！啼若婴啼，利爪撕天！'
  },
  dangkang: {
    id: 'dangkang',
    name: '梼杌真身',
    title: '荒古四凶之一',
    realm: '凶神破封',
    avatarImg: 'assets/images/taowu.png',
    avatarFallback: '🐗',
    element: ELEMENT.EARTH,
    team: TEAM.ENEMY,
    maxHp: 240,
    maxQi: 6,
    attack: 38,
    defense: 22,
    moveRange: 2,
    skills: [SKILLS.DANGKANG_SLAM, SKILLS.TAOWU_ROAR],
    quote: '天地混沌，唯我独尊！人族宵小，受死！'
  },
  xiangliu: {
    id: 'xiangliu',
    name: '相柳',
    title: '九首水毒神魔',
    realm: '北山水患',
    avatarImg: 'assets/images/xiangliu.png',
    avatarFallback: '🐍',
    element: ELEMENT.WATER,
    team: TEAM.ENEMY,
    maxHp: 210,
    maxQi: 6,
    attack: 36,
    defense: 16,
    moveRange: 3,
    skills: [SKILLS.XIANGLIU_POISON],
    quote: '嘶嘶——！所经之山皆化毒泽，万灵皆为血食！'
  },
  qiongqi: {
    id: 'qiongqi',
    name: '穷奇',
    title: '荒古四凶之二',
    realm: '嗜血翼魔',
    avatarImg: 'assets/images/qiongqi.png',
    avatarFallback: '🐅',
    element: ELEMENT.METAL,
    team: TEAM.ENEMY,
    maxHp: 195,
    maxQi: 5,
    attack: 44,
    defense: 12,
    moveRange: 4,
    skills: [SKILLS.QIONGQI_DIVE],
    quote: '惩善扬恶，顺天灭道！血煞入魂，谁能挡我！'
  },
  zhujiuyin: {
    id: 'zhujiuyin',
    name: '烛九阴',
    title: '章尾大荒之神',
    realm: '无上至尊天祖',
    avatarImg: 'assets/images/zhujiuyin.png',
    avatarFallback: '🐉',
    element: ELEMENT.FIRE,
    team: TEAM.ENEMY,
    maxHp: 320,
    maxQi: 8,
    attack: 46,
    defense: 24,
    moveRange: 3,
    skills: [SKILLS.ZHUJIUYIN_DAY_NIGHT],
    quote: '我目张则为大荒之昼，我目闭则为九幽之夜。凡生，何敢逆天？'
  }
};

// Roguelike 随机秘境：远古遗宝词条库
const ROGUELIKE_RELICS = [
  {
    id: 'HETU_BOOK',
    name: '河图洛书残页',
    icon: '📜',
    desc: '开局推演天机，战斗伊始全员额外充盈 +2 点初始真元！'
  },
  {
    id: 'ZHURONG_TOKEN',
    name: '祝融烈焰神令',
    icon: '🔥',
    desc: '祝融炎灵庇佑，所有攻击与神通额外附加 18 点烈火真伤！'
  },
  {
    id: 'KUNLUN_JADE',
    name: '昆仑万剑灵髓',
    icon: '💎',
    desc: '受创时激荡护体剑意，向攻击者反震 25% 金系穿透反伤！'
  },
  {
    id: 'JIANMU_ROOT',
    name: '九畿建木灵根',
    icon: '🌿',
    desc: '生生不息！每个回合开始，我方全员自动恢复 20 点气血。'
  },
  {
    id: 'XINGTONG_AXE',
    name: '刑天不屈战戚',
    icon: '🪓',
    desc: '修仙向死而生！修士气血低于 50% 时，暴击率提升至 100%！'
  },
  {
    id: 'CHENGHUANG_FUR',
    name: '乘黄腾云吉光',
    icon: '☁️',
    desc: '御风千里，我方全员移动力永久 +1，闪避几率提升 20%！'
  }
];

// Roguelike 随机秘境：山海奇遇奇闻事件
const ROGUELIKE_EVENTS = [
  {
    id: 'EVENT_DANGKANG',
    title: '奇遇 · 偶遇瑞兽当康',
    desc: '行至云海深处，见一头通体生辉的小瑞兽当康正在啃食灵芝，鸣号若婴儿，见则天下大穰。',
    optionA: {
      text: '献出 40 灵石求取【后土丰稔】',
      cost: 40,
      rewardText: '当康欢喜摇尾，赠予修仙同盟一枚上古遗宝！',
      effect: 'GET_RELIC'
    },
    optionB: {
      text: '轻抚瑞兽，获得吉兆甘露',
      cost: 0,
      rewardText: '当康喷出一道祥瑞彩虹，我方全员气血补满！',
      effect: 'FULL_HEAL'
    }
  },
  {
    id: 'EVENT_SWORD_TOMB',
    title: '奇遇 · 昆仑断刃剑冢',
    desc: '荒草断壁间，数万柄太古灵剑斜插石缝，隐约传来远古剑仙遗留的不灭战意。',
    optionA: {
      text: '以身试剑，消耗 25 气血参悟剑心',
      costHp: 25,
      rewardText: '太白剑气淬体！凌虚子攻击力永久提升 8 点！',
      effect: 'BOOST_ATK'
    },
    optionB: {
      text: '收敛灵剑残骸中的灵石',
      cost: 0,
      rewardText: '收获天衍灵石 +80！',
      effect: 'GET_STONES_80'
    }
  },
  {
    id: 'EVENT_TIANCHI_SPA',
    title: '奇遇 · 瑶池仙境甘露',
    desc: '林深不知处，浮现一汪天池温润灵泉，水汽化作青莲朵朵。',
    optionA: {
      text: '阖目沐浴吐纳灵泉',
      cost: 0,
      rewardText: '涤荡尘滓！全员气血恢复 50 点，真元上限额外 +1！',
      effect: 'SPA_BUFF'
    },
    optionB: {
      text: '灌装天泉甘霖以备后用',
      cost: 0,
      rewardText: '获得灵石 +50，全员士气大振！',
      effect: 'GET_STONES_50'
    }
  }
];

// 三大山海经主线关卡战役配置
const CAMPAIGN_CHAPTERS = [
  {
    id: 1,
    title: '第一回：青丘之野 · 凶潮初现',
    desc: '大荒异变，食火恶犬【祸斗】与巨禽【蛊雕】侵扰青丘边界灵脉。太虚剑仙与天狐白浅联手御敌！',
    target: '全歼进犯的荒古凶兽',
    specialTerrain: '天池灵泉汇聚，有助吐纳回生',
    enemies: [
      { template: 'huodou', x: 16, y: 11 },
      { template: 'gudiao', x: 16, y: 8 }
    ],
    players: [
      { template: 'lingxu', x: 3, y: 9 },
      { template: 'baiqian', x: 3, y: 11 },
      { template: 'bifang', x: 2, y: 10 }
    ],
    gridObstacles: [[7, 7], [7, 13], [12, 7], [12, 13], [9, 10], [10, 10]],
    rewardSpiritStones: 120
  },
  {
    id: 2,
    title: '第二回：章莪之山 · 讹火连天',
    desc: '章莪山地火脉涌动，凶兽借祝融火灵之势狂暴，两只祸斗与蛊雕从火海突袭！善用五行克制方可破阵。',
    target: '突破火海阻截，歼灭凶兽先锋',
    specialTerrain: '祝融火脉密布，火系法术伤害暴增 35%',
    enemies: [
      { template: 'huodou', x: 15, y: 7 },
      { template: 'huodou', x: 16, y: 12 },
      { template: 'gudiao', x: 16, y: 9 }
    ],
    players: [
      { template: 'lingxu', x: 3, y: 8 },
      { template: 'baiqian', x: 2, y: 10 },
      { template: 'bifang', x: 3, y: 12 }
    ],
    gridObstacles: [[8, 6], [8, 14], [11, 8], [11, 12]],
    rewardSpiritStones: 200
  },
  {
    id: 3,
    title: '第三回：昆仑之渊 · 封魔决战',
    desc: '荒古四凶之一【梼杌】破印而出！重铠撼地，巨力崩山。修仙同盟必须背水一战，重新加固天衍封印！',
    target: '斩杀并封印【荒古巨兽 · 梼杌真身】',
    specialTerrain: '地脉碎裂，灵气与火煞交织，凶险万分',
    enemies: [
      { template: 'dangkang', x: 16, y: 10 }, // 梼杌 Boss
      { template: 'huodou', x: 15, y: 6 },
      { template: 'gudiao', x: 15, y: 13 }
    ],
    players: [
      { template: 'lingxu', x: 3, y: 9 },
      { template: 'baiqian', x: 3, y: 11 },
      { template: 'bifang', x: 2, y: 10 }
    ],
    gridObstacles: [[7, 6], [7, 14], [12, 7], [12, 13]],
    rewardSpiritStones: 360
  },
  {
    id: 4,
    title: '第四回：北山大泽 · 相柳毒沼',
    desc: '大禹斩共工臣相柳，血腥不可树谷！九首巨蟒盘踞恶臭死泽，喷吐九首腐毒，万灵皆枯。',
    target: '诛灭九头毒蟒【相柳】',
    specialTerrain: '九首水毒弥漫，水华灵泉被蚀化为毒泽',
    enemies: [
      { template: 'xiangliu', x: 16, y: 10 }, // 相柳 Boss
      { template: 'gudiao', x: 15, y: 7 },
      { template: 'gudiao', x: 15, y: 13 }
    ],
    players: [
      { template: 'lingxu', x: 3, y: 9 },
      { template: 'baiqian', x: 3, y: 11 },
      { template: 'bifang', x: 2, y: 10 }
    ],
    gridObstacles: [[6, 8], [8, 12], [11, 7], [13, 11]],
    rewardSpiritStones: 450
  },
  {
    id: 5,
    title: '第五回：邽山之阴 · 穷奇嗜风',
    desc: '四凶之二【穷奇】如虎生翼，惩善扬恶！血煞狂风撕裂天穹，嗜血飞扑必取残命。',
    target: '击溃嗜血凶翼【穷奇】',
    specialTerrain: '庚金杀气狂暴，金系与暴击伤害大涨',
    enemies: [
      { template: 'qiongqi', x: 16, y: 10 }, // 穷奇 Boss
      { template: 'huodou', x: 15, y: 7 },
      { template: 'huodou', x: 16, y: 13 }
    ],
    players: [
      { template: 'lingxu', x: 3, y: 8 },
      { template: 'baiqian', x: 2, y: 10 },
      { template: 'bifang', x: 3, y: 12 }
    ],
    gridObstacles: [[8, 7], [8, 13], [11, 8], [12, 5]],
    rewardSpiritStones: 560
  },
  {
    id: 6,
    title: '第六回：章尾之巅 · 烛龙定鼎',
    desc: '钟山之神，名曰烛阴！视为昼，瞑为夜，吹为冬，呼为夏。掌控大荒阴阳至高法则的无上巨神降世！',
    target: '迎战【章尾太古古神 · 烛九阴】',
    specialTerrain: '太古昼夜轮转，阴阳乾坤异象频现',
    enemies: [
      { template: 'zhujiuyin', x: 16, y: 10 }, // 烛九阴 至尊Boss
      { template: 'xiangliu', x: 15, y: 6 },  // 相柳
      { template: 'qiongqi', x: 15, y: 13 }   // 穷奇
    ],
    players: [
      { template: 'lingxu', x: 3, y: 9 },
      { template: 'baiqian', x: 3, y: 11 },
      { template: 'bifang', x: 2, y: 10 }
    ],
    gridObstacles: [[6, 6], [6, 14], [11, 8], [11, 12]],
    rewardSpiritStones: 888
  }
];
