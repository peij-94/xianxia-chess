class_name SaveManager
extends RefCounted

## 《山海问道录·天衍棋局》云笈天箓 · 存档管理器 (Godot 4 Save Manager)
## 支持：肉鸽活跃进度自动存盘、3个手动封存位、图鉴进度持久化与断点续玩

const STORAGE_ACTIVE_RUN: String = "user://save_active_run.json"
const STORAGE_SLOTS: String = "user://save_slots.json"
const STORAGE_COMPENDIUM: String = "user://save_compendium.json"

static func has_active_run() -> bool:
	return FileAccess.file_exists(STORAGE_ACTIVE_RUN)

static func save_active_run(data: Dictionary) -> bool:
	var f = FileAccess.open(STORAGE_ACTIVE_RUN, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data, "\t"))
		f.close()
		return true
	return false

static func load_active_run() -> Dictionary:
	if not FileAccess.file_exists(STORAGE_ACTIVE_RUN):
		return {}
	var f = FileAccess.open(STORAGE_ACTIVE_RUN, FileAccess.READ)
	if f:
		var text = f.get_as_text()
		f.close()
		var res = JSON.parse_string(text)
		return res if res is Dictionary else {}
	return {}

static func clear_active_run() -> void:
	if FileAccess.file_exists(STORAGE_ACTIVE_RUN):
		DirAccess.remove_absolute(STORAGE_ACTIVE_RUN)

static func get_slots() -> Array:
	if not FileAccess.file_exists(STORAGE_SLOTS):
		return [null, null, null]
	var f = FileAccess.open(STORAGE_SLOTS, FileAccess.READ)
	if f:
		var text = f.get_as_text()
		f.close()
		var res = JSON.parse_string(text)
		if res is Array:
			while res.size() < 3:
				res.append(null)
			return res
	return [null, null, null]

static func save_to_slot(slot_idx: int, run_data: Dictionary, note: String = "手动封存") -> bool:
	var slots = get_slots()
	if slot_idx < 1 or slot_idx > 3:
		return false
	var slot_info = {
		"slot_index": slot_idx,
		"note": note,
		"saved_at": Time.get_datetime_string_from_system(),
		"current_floor": run_data.get("current_floor", 1),
		"stones": run_data.get("spirit_stones", 0),
		"data": run_data
	}
	slots[slot_idx - 1] = slot_info
	var f = FileAccess.open(STORAGE_SLOTS, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(slots, "\t"))
		f.close()
		return true
	return false

static func load_from_slot(slot_idx: int) -> Dictionary:
	var slots = get_slots()
	if slot_idx >= 1 and slot_idx <= 3:
		var s = slots[slot_idx - 1]
		return s if s is Dictionary else {}
	return {}

static func get_compendium() -> Dictionary:
	if not FileAccess.file_exists(STORAGE_COMPENDIUM):
		var init_comp = {
			"boss_kills": {
				"huodou": 0,
				"gudiao": 0,
				"taowu": 0,
				"xiangliu": 0,
				"qiongqi": 0,
				"zhujiuyin": 0
			},
			"unlocked_relics": []
		}
		save_compendium(init_comp)
		return init_comp
	var f = FileAccess.open(STORAGE_COMPENDIUM, FileAccess.READ)
	if f:
		var text = f.get_as_text()
		f.close()
		var res = JSON.parse_string(text)
		return res if res is Dictionary else {}
	return {}

static func save_compendium(data: Dictionary) -> void:
	var f = FileAccess.open(STORAGE_COMPENDIUM, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data, "\t"))
		f.close()

static func record_boss_kill(boss_id: String) -> void:
	var comp = get_compendium()
	var kills = comp.get("boss_kills", {})
	kills[boss_id] = kills.get(boss_id, 0) + 1
	comp["boss_kills"] = kills
	save_compendium(comp)

static func record_relic_unlocked(relic_id: String) -> void:
	var comp = get_compendium()
	var relics = comp.get("unlocked_relics", [])
	if not relics.has(relic_id):
		relics.append(relic_id)
		comp["unlocked_relics"] = relics
		save_compendium(comp)
