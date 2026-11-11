class_name CompendiumManager
extends RefCounted

## 《山海问道录·天衍棋局》山海万灵录 · 图鉴与神典系统 (Godot 4 Compendium)

const LORE_DATA: Dictionary = {
	"lingxu": {
		"name": "凌虚子",
		"title": "太虚剑仙",
		"realm": "金丹初期",
		"element": 0, # 金
		"origin": "《山海经·海内西经》：“昆仑之虚，方八百里，高万仞，面有九门，门有开明兽守之。”",
		"story": "凌虚子出身昆仑太虚剑宗，参悟昆仑天柱开明剑意，引九天太白庚金入剑。专斩大荒作乱凶煞。",
		"tactics": "【战术要诀】庚金克木！拥有全队最高的物理攻击与击退能力，善用【庚金破空剑】将敌方推撞入巨岩造成二次崩解壁击。"
	},
	"baiqian": {
		"name": "白浅",
		"title": "青丘天狐",
		"realm": "化灵期",
		"element": 1, # 木
		"origin": "《山海经·南山经》：“青丘之山，有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。”",
		"story": "青丘九尾神狐之后，身怀天道回天之术。以万木长生生机滋养大荒生灵，所至之处枯木逢春。",
		"tactics": "【战术要诀】万木生息克土！核心辅助与治疗枢纽，【万木逢春】驱散负面补满气血，【青丘狐魅】削弱强力 Boss 攻防。"
	},
	"bifang": {
		"name": "毕方",
		"title": "南山火鸟",
		"realm": "通玄天禽",
		"element": 3, # 火
		"origin": "《山海经·西山经》：“章莪之山，有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方。”",
		"story": "上古火神祝融之侍从神禽，独足踏云，翼展千里。见其现世，则凡尘讹火连绵，焚尽邪煞浊气。",
		"tactics": "【战术要诀】烈火纯阳克金！擅长中远程群攻轰炸，在【祝融火脉】地形上施展火法可额外获得 35% 恐怖增幅！"
	},
	"huodou": {
		"name": "祸斗",
		"title": "食火灾犬",
		"realm": "荒古狂妖",
		"element": 3, # 火
		"origin": "《山海经·海内南经》：“南方有厌火之国，食火灾犬名曰祸斗，形如黑犬而能喷火，所过之处烈焰焦黑。”",
		"story": "以烈火与岩浆为食的妖犬，常追随火神与火灾而现。双目赤红如熔岩，凶猛嗜血。",
		"tactics": "【弱点破除】火受水抑！水木法术可快速克制，注意分散站位以防被其烈焰撕咬。"
	},
	"gudiao": {
		"name": "蛊雕",
		"title": "鹿吴巨禽",
		"realm": "凶戾异兽",
		"element": 0, # 金
		"origin": "《山海经·南山经》：“鹿吴之山，泽更之水出焉……有兽焉，名曰蛊雕，其状如雕而有角，是食人。”",
		"story": "潜伏于鹿吴山幽潭绝壁的异禽，啼声如婴啼诱杀迷途之人，利爪铁角能裂精铁。",
		"tactics": "【弱点破除】金为火克！移动敏捷（4步），善于背刺与侧击，应由毕方以烈焰法术优先在远距离斩灭。"
	},
	"taowu": {
		"name": "梼杌",
		"title": "四凶撼岳",
		"realm": "太古四凶",
		"element": 4, # 土
		"origin": "《山海经·西山经》：“四凶之一梼杌，状如虎而犬毛，长二尺，人面，虎足，猪口牙，尾长一丈八尺。”",
		"story": "太古四凶之一！性傲狠刚愎，顽固不化。重盔撼地，一踏之下山川地脉崩碎。",
		"tactics": "【Boss机制】土受木克！防御力极高（22点护甲），且拥有【地脉崩裂】十字击退震飞。建议白浅施加【青丘狐魅】削弱后集火攻破！"
	},
	"xiangliu": {
		"name": "相柳",
		"title": "九首腐神",
		"realm": "太古邪神",
		"element": 2, # 水
		"origin": "《山海经·海外北经》：“共工之臣曰相柳氏，九首，以食于九山。相柳之所抵，厥为泽溪。”",
		"story": "九首蛇身之巨神魔，所过之处尽化腥臭毒沼，鸟兽绝迹。其毒入地，数万里不可稼穑。",
		"tactics": "【Boss机制】水受土克！【九首腐泽蚀魂】具有 2x2 范围群毒并大幅削减防御。不可全员扎堆！"
	},
	"qiongqi": {
		"name": "穷奇",
		"title": "黑翼凶虎",
		"realm": "太古四凶",
		"element": 0, # 金
		"origin": "《山海经·海内北经》：“穷奇状如虎，有翼，食人从首始，所食被发。惩善扬恶。”",
		"story": "四凶之二，飞翼黑虎！天性惩善扬恶，嗜饮强者之血，血煞狂风掠过，百里之内生灵涂炭。",
		"tactics": "【Boss机制】金为火克！【嗜血狂性】对气血低于 40% 的修士伤害提高 50%，若斩杀立即重置行动！"
	},
	"zhujiuyin": {
		"name": "烛九阴",
		"title": "钟山祖神",
		"realm": "太古至高祖神",
		"element": 3, # 火
		"origin": "《山海经·大荒北经》：“西北海之外，赤水之北，有章尾山。有神，人面蛇身而赤，直目正乘，是谓烛龙。”",
		"story": "大荒至高祖神之一！钟山之神，身长千里，掌控天道阴阳之枢纽！张目为昼，阖目为夜。",
		"tactics": "【至尊神机】张目为昼（金火暴击大幅提升）与闭目为夜（射程受抑、万木回生）交替轮转！"
	}
}

static func get_cultivators() -> Array[Dictionary]:
	var list: Array[Dictionary] = []
	for k in ["lingxu", "baiqian", "bifang"]:
		var d = LORE_DATA[k].duplicate()
		d["id"] = k
		list.append(d)
	return list

static func get_beasts() -> Array[Dictionary]:
	var list: Array[Dictionary] = []
	for k in ["huodou", "gudiao", "taowu", "xiangliu", "qiongqi", "zhujiuyin"]:
		var d = LORE_DATA[k].duplicate()
		d["id"] = k
		list.append(d)
	return list
