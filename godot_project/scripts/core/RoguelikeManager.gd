class_name RoguelikeManager
extends RefCounted

## 《山海问道录·天衍棋局》五藏山经 · 肉鸽秘境总控系统 (Godot 4 Roguelike Manager)
## 整合 MountainMap 分岔舆图、队伍血量跨战继承、远古遗宝拾取与断点存盘

var is_active: bool = false
var current_floor: int = 1
var map: MountainMap = null
var current_node: Dictionary = {}
var party_state: Array[Dictionary] = []
var relics: Array[Dictionary] = []
var spirit_stones: int = 200

func start_run() -> void:
	is_active = true
	current_floor = 1
	spirit_stones = 200
	relics.clear()
	init_party_state()
	map = MountainMap.new(1)
	current_node = {}
	auto_save()

func init_party_state() -> void:
	party_state.clear()
	var templates = [
		{ "id": "lingxu", "name": "凌虚子", "hp": 135, "max_hp": 135, "qi": 3, "max_qi": 6, "atk": 40, "def": 12 },
		{ "id": "baiqian", "name": "白浅", "hp": 145, "max_hp": 145, "qi": 4, "max_qi": 7, "atk": 28, "def": 15 },
		{ "id": "bifang", "name": "毕方", "hp": 115, "max_hp": 115, "qi": 3, "max_qi": 6, "atk": 38, "def": 9 }
	]
	for t in templates:
		party_state.append(t)

func add_relic(relic: Dictionary) -> void:
	relics.append(relic)
	SaveManager.record_relic_unlocked(relic.get("id", ""))

func has_relic(relic_id: String) -> bool:
	for r in relics:
		if r.get("id", "") == relic_id:
			return true
	return false

func auto_save() -> void:
	if not is_active:
		return
	var run_data = {
		"is_active": is_active,
		"current_floor": current_floor,
		"spirit_stones": spirit_stones,
		"party_state": party_state,
		"relics": relics,
		"map": map.to_dict() if map else {}
	}
	SaveManager.save_active_run(run_data)

func resume_run(saved_data: Dictionary) -> void:
	is_active = true
	current_floor = saved_data.get("current_floor", 1)
	spirit_stones = saved_data.get("spirit_stones", 200)
	party_state = saved_data.get("party_state", [])
	relics = saved_data.get("relics", [])
	if saved_data.has("map"):
		map = MountainMap.from_dict(saved_data["map"])
	else:
		map = MountainMap.new(current_floor)
