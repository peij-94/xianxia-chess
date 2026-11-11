class_name CombatResolver
extends RefCounted

## 五行枚举与生克关系
enum Element { METAL = 0, WOOD = 1, WATER = 2, FIRE = 3, EARTH = 4 }

## 五行相克映射: 金(0)->木(1)->土(4)->水(2)->火(3)->金(0)
const COUNTER_MAP = {
	Element.METAL: Element.WOOD,
	Element.WOOD: Element.EARTH,
	Element.EARTH: Element.WATER,
	Element.WATER: Element.FIRE,
	Element.FIRE: Element.METAL
}

## 检查五行生克倍率
static func get_element_multiplier(atk_elem: int, def_elem: int) -> float:
	if COUNTER_MAP.get(atk_elem) == def_elem:
		return 1.35 # 克制增伤 35%
	elif COUNTER_MAP.get(def_elem) == atk_elem:
		return 0.75 # 受抑减伤 25%
	return 1.0

## 检查站位朝向 (背刺/侧袭/正面)
static func get_orientation_multiplier(attacker_pos: Vector2i, defender_pos: Vector2i, defender_facing: String) -> Dictionary:
	var dx = attacker_pos.x - defender_pos.x
	var dy = attacker_pos.y - defender_pos.y
	var is_backstab = false
	var is_flank = false

	if defender_facing == "EAST" and dx < 0:
		is_backstab = true
	elif defender_facing == "WEST" and dx > 0:
		is_backstab = true
	elif defender_facing == "NORTH" and dy > 0:
		is_backstab = true
	elif defender_facing == "SOUTH" and dy < 0:
		is_backstab = true
	elif dx != 0 and dy != 0:
		is_flank = true

	if is_backstab:
		return { "type": "BACKSTAB", "mult": 1.4, "label": "绝脉背刺" }
	elif is_flank:
		return { "type": "FLANK", "mult": 1.15, "label": "侧翼夹击" }
	return { "type": "FRONT", "mult": 1.0, "label": "正面交锋" }

## 伤害结算核心公式
static func calculate_damage(atk_val: float, def_val: float, skill_scale: float, elem_mult: float, orient_mult: float, is_crit: bool) -> int:
	var base = maxf(8.0, (atk_val - def_val * 0.5) * skill_scale)
	var crit_mult = 1.5 if is_crit else 1.0
	var final_dmg = int(round(base * elem_mult * orient_mult * crit_mult))
	return maxi(1, final_dmg)
