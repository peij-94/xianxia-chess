/**
 * 《山海问道录·天衍棋局》山海万灵录 · 图鉴与神典系统 (Compendium System)
 * 涵盖：修仙同盟谱、山海异兽录、荒古遗宝志、五行天衍道盘
 */

const SHANHAI_LORE = {
  // 修仙者与神兽盟友
  lingxu: {
    origin: '《山海经·海内西经》：“昆仑之虚，方八百里，高万仞，面有九门，门有开明兽守之。”',
    story: '凌虚子出身昆仑太虚剑宗，参悟昆仑天柱开明剑意，引九天太白庚金入剑。一剑既出，霜寒十四州，专斩大荒作乱凶煞。',
    tactics: '【战术要诀】庚金克木！拥有全队最高的物理攻击与击退能力，善用【庚金破空剑】将敌方推撞入巨岩造成二次崩解壁击。突破后解锁【太白极刃】直线贯通轰杀。'
  },
  baiqian: {
    origin: '《山海经·南山经》：“青丘之山，有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。”',
    story: '青丘九尾神狐之后，身怀天道回天之术。生于建木之畔，以万木长生生机滋养大荒生灵，所至之处枯木逢春。',
    tactics: '【战术要诀】万木生息克土！核心辅助与治疗枢纽，【万木逢春】可跨射程驱散所有负面并补满伤员，【青丘狐魅】能大幅削弱强力 Boss 的攻击力。'
  },
  bifang: {
    origin: '《山海经·西山经》：“章莪之山，有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方，其鸣自叫也，见则其邑有讹火。”',
    story: '上古火神祝融之侍从神禽，独足踏云，翼展千里。见其现世，则凡尘讹火连绵，焚尽邪煞浊气。',
    tactics: '【战术要诀】烈火纯阳克金！擅长中远程群攻轰炸，【大荒讹火劫】覆盖大面积范围。在【祝融火脉】地形上施展火法可额外获得 35% 恐怖增幅！'
  },

  // 敌对凶兽与荒古古神
  huodou: {
    origin: '《山海经·海内南经》：“南方有厌火之国，食火灾犬名曰祸斗，形如黑犬而能喷火，所过之处烈焰焦黑。”',
    story: '以烈火与岩浆为食的妖犬，常追随火神与火灾而现。双目赤红如熔岩，凶猛嗜血。',
    tactics: '【弱点破除】火受水抑！白浅的水木法术或引水脉可快速剿灭，注意分散站位以防被其烈焰撕咬。'
  },
  gudiao: {
    origin: '《山海经·南山经》：“鹿吴之山，上无草木，泽更之水出焉……有兽焉，名曰蛊雕，其状如雕而有角，其音如婴儿之音，是食人。”',
    story: '潜伏于鹿吴山幽潭绝壁的异禽，啼声如婴啼诱杀迷途之人，利爪铁角能裂精铁。',
    tactics: '【弱点破除】金为火克！移动敏捷（4步），善于背刺与侧击，应由毕方以烈焰法术优先在远距离斩灭。'
  },
  dangkang: {
    origin: '《山海经·西山经》：“四凶之一梼杌，状如虎而犬毛，长二尺，人面，虎足，猪口牙，尾长一丈八尺，搅乱荒内。”',
    story: '太古四凶之一！性傲狠刚愎，顽固不化。重盔撼地，一踏之下山川地脉崩碎，凡俗莫能当。',
    tactics: '【Boss机制】土受木克！防御力极高（22点护甲），且拥有【地脉崩裂】十字击退震飞。建议白浅施加【青丘狐魅】削弱其攻防后集火攻破！'
  },
  xiangliu: {
    origin: '《山海经·海外北经》：“共工之臣曰相柳氏，九首，以食于九山。相柳之所抵，厥为泽溪。禹杀相柳，其血腥，不可以树谷种。”',
    story: '九首蛇身之巨神魔，所过之处尽化腥臭毒沼，鸟兽绝迹。其毒入地，数万里不可稼穑。',
    tactics: '【Boss机制】水受土克！【九首腐泽蚀魂】具有 2x2 范围群毒并大幅削减防御。不可全员扎堆！需利用走位拉扯，速战速决。'
  },
  qiongqi: {
    origin: '《山海经·海内北经》：“穷奇状如虎，有翼，食人从首始，所食被发。惩善扬恶，见人斗，辄食直者；见人忠信，辄食其鼻。”',
    story: '四凶之二，飞翼黑虎！天性惩善扬恶，嗜饮强者之血，血煞狂风掠过，百里之内生灵涂炭。',
    tactics: '【Boss机制】金为火克！【嗜血狂性】具有极度危险的斩杀再动——对气血低于 40% 的修士伤害提高 50%，若斩杀则立即重置行动！务必保持我方全员血线！'
  },
  zhujiuyin: {
    origin: '《山海经·大荒北经》：“西北海之外，赤水之北，有章尾山。有神，人面蛇身而赤，直目正乘，其瞑乃晦，其视乃明，不食不寝不息，风雨是竭。是烛九阴，是谓烛龙。”',
    story: '大荒至高祖神之一！钟山之神，身长千里，人面龙躯。张目为大荒之昼，阖目为九幽之夜，吹气为冬，呼气为夏，掌控天道阴阳之枢纽！',
    tactics: '【至尊神机】张目为昼（金火暴击大幅提升）与闭目为夜（射程受抑、万木回生）交替轮转！需根据昼夜天象灵活调整攻防节奏，顺天应道方能破阵！'
  }
};

class CompendiumManager {
  constructor() {
    this.currentTab = 'CULTIVATORS'; // CULTIVATORS, BEASTS, RELICS, WHEEL
    this.selectedItemId = 'lingxu';
  }

  // 获取所有条目数据
  getCultivatorsList() {
    return ['lingxu', 'baiqian', 'bifang'].map(id => UNIT_TEMPLATES[id]);
  }

  getBeastsList() {
    return ['huodou', 'gudiao', 'dangkang', 'xiangliu', 'qiongqi', 'zhujiuyin'].map(id => UNIT_TEMPLATES[id]);
  }

  getRelicsList() {
    return ROGUELIKE_RELICS;
  }

  getItemDetail(id) {
    if (UNIT_TEMPLATES[id]) {
      const template = UNIT_TEMPLATES[id];
      const lore = SHANHAI_LORE[id] || {};
      return {
        isUnit: true,
        data: template,
        lore
      };
    }
    const relic = ROGUELIKE_RELICS.find(r => r.id === id);
    if (relic) {
      return {
        isUnit: false,
        data: relic
      };
    }
    return null;
  }
}

window.compendiumManager = new CompendiumManager();
window.SHANHAI_LORE = SHANHAI_LORE;
