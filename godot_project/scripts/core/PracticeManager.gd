class_name PracticeManager
extends RefCounted

## 《山海问道录·天衍棋局》演武演道 · 练习沙盒系统 (Godot 4 Practice Sandbox)
## 支持自由自定义修仙队伍阵容、假想敌凶兽、境界阶梯、沙盒法则开关

var is_active: bool = false

var config: Dictionary = {
	"player_units": ["lingxu", "baiqian", "bifang"],
	"enemy_units": ["huodou", "gudiao"],
	"realm_level": 0,
	"terrain_theme": "BALANCED",
	"celestial": "NORMAL",
	"infinite_qi": false,
	"invincible_player": false,
	"dummy_enemy": false
}

func start_practice(custom_cfg: Dictionary = {}) -> void:
	is_active = true
	for k in custom_cfg.keys():
		config[k] = custom_cfg[k]

func stop_practice() -> void:
	is_active = false
