class_name MountainMap
extends RefCounted

## 《山海问道录·天衍棋局》五藏山经 · 分岔神途舆图生成器 (Godot 4 Mountain Map)
## 生成 6 阶拓扑连通节点：BATTLE, ELITE, EVENT, REST, SHOP, BOSS

enum NodeType { BATTLE, ELITE, EVENT, REST, SHOP, BOSS }

const TIER_CONFIG: Array[Dictionary] = [
	{ "tier": 0, "types": [NodeType.BATTLE], "min_nodes": 2, "max_nodes": 3 },
	{ "tier": 1, "types": [NodeType.BATTLE, NodeType.EVENT], "min_nodes": 3, "max_nodes": 4 },
	{ "tier": 2, "types": [NodeType.BATTLE, NodeType.ELITE, NodeType.EVENT], "min_nodes": 3, "max_nodes": 4 },
	{ "tier": 3, "types": [NodeType.REST, NodeType.SHOP, NodeType.EVENT], "min_nodes": 2, "max_nodes": 3 },
	{ "tier": 4, "types": [NodeType.ELITE, NodeType.BATTLE, NodeType.REST], "min_nodes": 2, "max_nodes": 3 },
	{ "tier": 5, "types": [NodeType.BOSS], "min_nodes": 1, "max_nodes": 1 }
]

var floor_num: int = 1
var tiers: Array = [] # Array of Array[Dictionary]
var current_node_id: String = ""

func _init(p_floor: int = 1) -> void:
	floor_num = p_floor
	generate_map()

func generate_map() -> void:
	tiers.clear()
	for t_idx in range(TIER_CONFIG.size()):
		var cfg = TIER_CONFIG[t_idx]
		var count = randi_range(cfg["min_nodes"], cfg["max_nodes"])
		var tier_nodes: Array[Dictionary] = []
		for n_idx in range(count):
			var n_type: int = cfg["types"][randi() % cfg["types"].size()]
			var n_id = "node_%d_%d_%d" % [floor_num, t_idx, n_idx]
			tier_nodes.append({
				"id": n_id,
				"tier": t_idx,
				"index": n_idx,
				"type": n_type,
				"type_name": get_type_name(n_type),
				"title": get_type_title(n_type),
				"desc": get_type_desc(n_type),
				"next_nodes": [],
				"visited": false
			})
		tiers.append(tier_nodes)
	connect_tiers()

func connect_tiers() -> void:
	for t_idx in range(tiers.size() - 1):
		var curr_tier: Array = tiers[t_idx]
		var next_tier: Array = tiers[t_idx + 1]
		for c_node in curr_tier:
			var c_idx: int = c_node["index"]
			var targets: Array[int] = []
			if next_tier.size() == 1:
				targets.append(0)
			else:
				var min_target = clampi(c_idx - 1, 0, next_tier.size() - 1)
				var max_target = clampi(c_idx + 1, 0, next_tier.size() - 1)
				for ti in range(min_target, max_target + 1):
					targets.append(ti)
			for t_target_idx in targets:
				c_node["next_nodes"].append(next_tier[t_target_idx]["id"])

func get_type_name(type: int) -> String:
	match type:
		NodeType.BATTLE: return "BATTLE"
		NodeType.ELITE: return "ELITE"
		NodeType.EVENT: return "EVENT"
		NodeType.REST: return "REST"
		NodeType.SHOP: return "SHOP"
		NodeType.BOSS: return "BOSS"
	return "UNKNOWN"

func get_type_title(type: int) -> String:
	match type:
		NodeType.BATTLE: return "妖兽遭遇"
		NodeType.ELITE: return "大荒精英"
		NodeType.EVENT: return "大荒奇遇"
		NodeType.REST: return "灵泉道场"
		NodeType.SHOP: return "多宝商行"
		NodeType.BOSS: return "境主决战"
	return "神道秘所"

func get_type_desc(type: int) -> String:
	match type:
		NodeType.BATTLE: return "前方有受蚀妖兽出没，斩妖除魔。"
		NodeType.ELITE: return "太古精英凶兽盘踞，险象环生，胜者获远古遗宝。"
		NodeType.EVENT: return "天地异象，机缘与凶险并存。"
		NodeType.REST: return "天地灵泉汇聚，可在此疗伤休整或洗练真元。"
		NodeType.SHOP: return "多宝道人商行，可用灵石换取灵丹遗宝。"
		NodeType.BOSS: return "五藏山经境主神魔！斩之以证极道！"
	return ""

func to_dict() -> Dictionary:
	return {
		"floor": floor_num,
		"tiers": tiers,
		"current_node_id": current_node_id
	}

static func from_dict(data: Dictionary) -> MountainMap:
	var m = MountainMap.new(data.get("floor", 1))
	m.tiers = data.get("tiers", [])
	m.current_node_id = data.get("current_node_id", "")
	return m
