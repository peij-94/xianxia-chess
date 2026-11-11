class_name WeaponSystem
extends RefCounted

## 《山海问道录·天衍棋局》本命神兵法宝系统 (Xianxia Divine Weapon System)
## 定义武器神兵属性、专属被动法则、五行相性与战力加成

const WEAPONS: Dictionary = {
	"sword_taibai": {
		"id": "sword_taibai",
		"name": "太白青锋剑",
		"tier": "仙品",
		"tier_color": Color("#38bdf8"), # 仙品蔚蓝
		"elem": 0, # 金
		"icon": "res://assets/weapons/sword_taibai.png",
		"emoji": "🗡️",
		"atk_bonus": 12,
		"def_bonus": 2,
		"move_bonus": 0,
		"qi_bonus": 0,
		"crit_bonus": 0.15,
		"passive_name": "【太白庚金煞】",
		"passive_desc": "金系神通威能+20%；神通击退距离+1格，壁击造成目标眩晕震慑。",
		"flavor": "昆仑太虚剑宗镇派重宝，引九天太白金曜淬炼千载，剑出如雷霆贯日。"
	},
	"silk_nine_tail": {
		"id": "silk_nine_tail",
		"name": "九尾回天绫",
		"tier": "仙品",
		"tier_color": Color("#4ade80"), # 仙品碧翠
		"elem": 1, # 木
		"icon": "res://assets/weapons/silk_nine_tail.png",
		"emoji": "🌸",
		"atk_bonus": 6,
		"def_bonus": 8,
		"move_bonus": 0,
		"qi_bonus": 1,
		"crit_bonus": 0.0,
		"passive_name": "【青丘生息引】",
		"passive_desc": "回天治疗效果+30%；行动结束为周围2格内虚弱友军自愈回复10点气血。",
		"flavor": "青丘九尾天狐一族传承仙绫，以长生建木天蚕丝织就，流光溢彩生生不息。"
	},
	"zither_flame": {
		"id": "zither_flame",
		"name": "赤羽三昧琴",
		"tier": "仙品",
		"tier_color": Color("#f87171"), # 仙品赤炎
		"elem": 3, # 火
		"icon": "res://assets/weapons/zither_flame.png",
		"emoji": "🔥",
		"atk_bonus": 14,
		"def_bonus": 0,
		"move_bonus": 0,
		"qi_bonus": 0,
		"crit_bonus": 0.12,
		"passive_name": "【祝融焚世音】",
		"passive_desc": "火系神通威能+25%；出招暴击时引燃赤羽神焰，波及目标周围敌方附加灼烧。",
		"flavor": "以章莪山焦尾梧桐木与毕方真火天羽斫制，抚弦清啸，漫天皆为三昧神火。"
	},
	"halberd_abyss": {
		"id": "halberd_abyss",
		"name": "玄冥幽水戈",
		"tier": "灵品",
		"tier_color": Color("#67e8f9"), # 灵品幽蓝
		"elem": 2, # 水
		"icon": "res://assets/weapons/halberd_abyss.png",
		"emoji": "❄️",
		"atk_bonus": 10,
		"def_bonus": 6,
		"move_bonus": 0,
		"qi_bonus": 0,
		"crit_bonus": 0.05,
		"passive_name": "【九幽凝冰魄】",
		"passive_desc": "水系攻击伤害+20%；命中敌方时使其身形滞重，降低其1格步法。",
		"flavor": "北山大泽九幽寒铁铸就，锋芒所指凝冰结霜，触之气血停滞。"
	},
	"seal_fantian": {
		"id": "seal_fantian",
		"name": "番天镇岳印",
		"tier": "仙品",
		"tier_color": Color("#facc15"), # 仙品厚土金
		"elem": 4, # 土
		"icon": "res://assets/weapons/seal_fantian.png",
		"emoji": "⛰️",
		"atk_bonus": 8,
		"def_bonus": 14,
		"move_bonus": 0,
		"qi_bonus": 0,
		"crit_bonus": 0.0,
		"passive_name": "【厚土镇岳诀】",
		"passive_desc": "受到的伤害减免15%；受到近战攻击时反震崩裂伤害自身防御的50%。",
		"flavor": "上古大能采不周山半截残峰炼化，祭出时重如万岳泰山，可镇压大荒狂妖。"
	},
	"spear_chaos": {
		"id": "spear_chaos",
		"name": "开天乾坤枪",
		"tier": "神品",
		"tier_color": Color("#c084fc"), # 神品紫金
		"elem": -1, # 混沌全相
		"icon": "res://assets/weapons/spear_chaos.png",
		"emoji": "⚡",
		"atk_bonus": 20,
		"def_bonus": 8,
		"move_bonus": 1,
		"qi_bonus": 1,
		"crit_bonus": 0.20,
		"passive_name": "【太虚两仪碎】",
		"passive_desc": "攻击无视目标30%防御；五行相克伤害提升至160%，绝脉背刺必定崩解破甲！",
		"flavor": "混沌初开、鸿蒙未分时的天地本源灵枪，一枪破空，乾坤逆转，破灭万煞。"
	}
}

## 获取武器数据 (支持大小写容错与 icon/icon_path 互通)
static func get_weapon(id: String) -> Dictionary:
	var key = id.to_lower()
	if WEAPONS.has(key):
		var w = WEAPONS[key].duplicate()
		if not w.has("icon_path") and w.has("icon"):
			w["icon_path"] = w["icon"]
		return w
	return WEAPONS.get(id, {})

## 默认初始武器配置
static func get_default_weapon_id(unit_id: String) -> String:
	match unit_id:
		"lingxu": return "sword_taibai"
		"baiqian": return "silk_nine_tail"
		"bifang": return "zither_flame"
		_: return "sword_taibai"

## 获取可更换的武器库列表
static func get_all_weapon_ids() -> Array:
	return WEAPONS.keys()
