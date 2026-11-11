class_name Unit
extends Node2D

enum Team { PLAYER, ENEMY }

@export var unit_id: String = "lingxu"
@export var unit_name: String = "凌虚子"
@export var title_name: String = "太虚剑仙"
@export var realm: String = "金丹初期"
@export var element: int = 0 # 0金 1木 2水 3火 4土
@export var team: Team = Team.PLAYER

@export var max_hp: int = 135
var hp: int = 135
@export var max_qi: int = 6
var qi: int = 3
@export var attack: int = 40
@export var defense: int = 12
@export var move_range: int = 4

## 武器系统与基础属性留存
var base_attack: int = 40
var base_defense: int = 12
var base_move_range: int = 4
var base_max_qi: int = 6
var equipped_weapon: Dictionary = {}

var grid_pos: Vector2i = Vector2i.ZERO
var prev_grid_pos: Vector2i = Vector2i.ZERO
var facing: String = "EAST" # EAST, WEST
var has_moved: bool = false
var has_acted: bool = false
var is_alive: bool = true
var is_selected: bool = false

var action_state: String = "idle" # idle, move, guard, attack1, attack2, hit
var action_timer: float = 0.0
var hit_flash_timer: float = 0.0
var guard_rot: float = 0.0

var skills: Array = []
var sprite: Sprite2D = null
var is_moving: bool = false
var current_move_path: Array[Vector2i] = []

func _ready() -> void:
	hp = max_hp
	qi = int(max_qi * 0.5)
	prev_grid_pos = grid_pos
	setup_sprite()
	queue_redraw()

func _process(delta: float) -> void:
	if not is_alive:
		return

	if hit_flash_timer > 0.0:
		hit_flash_timer -= delta
		if sprite:
			sprite.modulate = Color(2.0, 1.2, 1.2, 1.0)
	elif sprite:
		if has_acted and has_moved:
			sprite.modulate = Color(0.65, 0.65, 0.7, 0.75)
		else:
			sprite.modulate = Color.WHITE

	if action_timer > 0.0:
		action_timer -= delta
		if action_timer <= 0.0 and action_state != "guard":
			action_state = "idle"
			update_action_texture()

	if action_state == "guard":
		guard_rot += delta * 2.5
		queue_redraw()

	if is_moving and sprite:
		sprite.position.y = -6.0 + abs(sin(float(Time.get_ticks_msec()) * 0.016)) * -7.0
	elif sprite and action_state != "move":
		sprite.position.y = -6.0

func setup_sprite() -> void:
	sprite = Sprite2D.new()
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	update_action_texture()
	sprite.position = Vector2(0, -6)
	add_child(sprite)

func update_action_texture() -> void:
	if sprite == null:
		return
	var act_to_use = action_state
	if act_to_use == "hit":
		act_to_use = "idle"

	var sprite_path = "res://assets/sprites/%s_%s.png" % [unit_id, act_to_use]
	var fallback_idle = "res://assets/sprites/%s_idle.png" % unit_id
	var fallback_portrait = "res://assets/images/%s.png" % unit_id

	var tex: Texture2D = null
	if ResourceLoader.exists(sprite_path):
		tex = load(sprite_path) as Texture2D
	elif ResourceLoader.exists(fallback_idle):
		tex = load(fallback_idle) as Texture2D
	elif ResourceLoader.exists(fallback_portrait):
		tex = load(fallback_portrait) as Texture2D

	if tex != null:
		sprite.texture = tex
		# 角色尺寸放大至 1.5 倍 (48px)
		var target_size = 48.0
		sprite.scale = Vector2(target_size / tex.get_width(), target_size / tex.get_height())
		sprite.flip_h = (facing == "WEST")

func play_action(act: String, duration: float = 0.5) -> void:
	action_state = act
	action_timer = duration
	update_action_texture()
	queue_redraw()

## 记录与同步裸装基础属性
func sync_base_stats() -> void:
	base_attack = attack
	base_defense = defense
	base_move_range = move_range
	base_max_qi = max_qi

## 穿戴或切换本命神兵法宝
func equip_weapon(weapon_id: String) -> void:
	var w = WeaponSystem.get_weapon(weapon_id)
	if w.is_empty():
		return
	equipped_weapon = w
	attack = base_attack + w.get("atk_bonus", 0)
	defense = base_defense + w.get("def_bonus", 0)
	move_range = base_move_range + w.get("move_bonus", 0)
	max_qi = base_max_qi + w.get("qi_bonus", 0)
	qi = mini(max_qi, qi)
	queue_redraw()

func get_action_badge() -> Dictionary:
	match action_state:
		"move": return { "text": "【🏃 踏星移行】", "color": Color("#38bdf8") }
		"guard": return { "text": "【🛡️ 凝气御守】", "color": Color("#ecc981") }
		"attack1": return { "text": "【⚔️ 破煞杀伐】", "color": Color("#f87171") }
		"attack2": return { "text": "【⚡ 混元极意】", "color": Color("#c084fc") }
		"hit": return { "text": "【💥 破防受创】", "color": Color("#fb7185") }
		_: return { "text": "【🧘 待机吐纳】", "color": Color("#4ade80") }

func set_grid_position(pos: Vector2i, tile_size: float, board_origin: Vector2) -> void:
	grid_pos = pos
	prev_grid_pos = pos
	position = board_origin + Vector2(pos.x * tile_size + tile_size * 0.5, pos.y * tile_size + tile_size * 0.5)
	queue_redraw()

func record_move(new_pos: Vector2i, tile_size: float, board_origin: Vector2) -> void:
	prev_grid_pos = grid_pos
	grid_pos = new_pos
	has_moved = true
	position = board_origin + Vector2(new_pos.x * tile_size + tile_size * 0.5, new_pos.y * tile_size + tile_size * 0.5)
	play_action("move", 0.45)

## 沿寻路路径平滑御风行进 (带移动动作精灵图与轨迹)
func move_along_path(path: Array[Vector2i], tile_size: float, board_origin: Vector2, on_complete: Callable = Callable()) -> void:
	if path.size() <= 1:
		if path.size() == 1:
			grid_pos = path[0]
			position = board_origin + Vector2(grid_pos.x * tile_size + tile_size * 0.5, grid_pos.y * tile_size + tile_size * 0.5)
		has_moved = true
		if on_complete.is_valid():
			on_complete.call()
		return

	prev_grid_pos = grid_pos
	has_moved = true
	is_moving = true
	current_move_path = path

	# 立即切换至移动姿态动作精灵图！
	play_action("move", 999.0)

	var tween = create_tween()
	var step_duration = 0.26 # 每格 260ms，从容流畅的御风身法步频，过场清晰可见

	for i in range(1, path.size()):
		var step_pos = path[i]
		var prev_step = path[i - 1]
		var target_world = board_origin + Vector2(step_pos.x * tile_size + tile_size * 0.5, step_pos.y * tile_size + tile_size * 0.5)

		var facing_dir = "EAST" if step_pos.x >= prev_step.x else "WEST"
		tween.tween_callback(func():
			set_facing(facing_dir)
			grid_pos = step_pos
		)
		tween.tween_property(self, "position", target_world, step_duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

	tween.tween_callback(func():
		is_moving = false
		current_move_path.clear()
		play_action("idle", 0.0)
		queue_redraw()
		if on_complete.is_valid():
			on_complete.call()
	)

func undo_move(tile_size: float, board_origin: Vector2) -> bool:
	if has_moved and not has_acted:
		grid_pos = prev_grid_pos
		has_moved = false
		is_moving = false
		current_move_path.clear()
		position = board_origin + Vector2(grid_pos.x * tile_size + tile_size * 0.5, grid_pos.y * tile_size + tile_size * 0.5)
		play_action("idle", 0.0)
		return true
	return false

func set_facing(dir: String) -> void:
	facing = dir
	if sprite:
		sprite.flip_h = (facing == "WEST")

func take_damage(amount: int) -> int:
	hp = maxi(0, hp - amount)
	if hp <= 0:
		is_alive = false
		visible = false
	else:
		play_action("hit", 0.35)
		hit_flash_timer = 0.25
	queue_redraw()
	return hp

func receive_heal(amount: int) -> int:
	var prev = hp
	hp = mini(max_hp, hp + amount)
	queue_redraw()
	return hp - prev

func start_turn() -> void:
	has_moved = false
	has_acted = false
	qi = mini(max_qi, qi + 1)
	action_state = "idle"
	action_timer = 0.0
	if sprite:
		sprite.modulate = Color.WHITE
	update_action_texture()
	queue_redraw()

func _draw() -> void:
	if not is_alive:
		return

	# 1. 2.5D 透视地面软投影（扁椭圆，放大至 1.5 倍）
	var shadow_pts = PackedVector2Array()
	for i in range(16):
		var a = float(i) * TAU / 16.0
		shadow_pts.append(Vector2(cos(a) * 16.5 + 1.5, sin(a) * 6.5 + 12.0))
	draw_colored_polygon(shadow_pts, Color(0.0, 0.0, 0.0, 0.35))

	# 2. 2.5D 双层莲华玉石法台 (放大至 1.5 倍，适配 48px 格子)
	var base_dark = Color("#12231c") if team == Team.PLAYER else Color("#2a1212")
	var base_mid = Color("#1d382b") if team == Team.PLAYER else Color("#451a1a")
	var rim_color = Color("#34d399") if team == Team.PLAYER else Color("#f87171")
	if is_selected:
		rim_color = Color("#ecc981")

	# 下基座厚度
	var pedestal_bot = PackedVector2Array()
	for i in range(16):
		var a = float(i) * TAU / 16.0
		pedestal_bot.append(Vector2(cos(a) * 14.5, sin(a) * 5.5 + 11.0))
	draw_colored_polygon(pedestal_bot, base_dark)

	# 上台面
	var pedestal_top = PackedVector2Array()
	for i in range(16):
		var a = float(i) * TAU / 16.0
		pedestal_top.append(Vector2(cos(a) * 13.5, sin(a) * 5.0 + 9.0))
	draw_colored_polygon(pedestal_top, base_mid)
	draw_polyline(pedestal_top, rim_color, 1.5)

	# 3. 选中阵环与道家灵光
	if is_selected:
		draw_arc(Vector2(0, 9.0), 18.0, 0, TAU, 24, Color("#ecc981"), 2.2)
		draw_arc(Vector2(0, 9.0), 20.5, 0, TAU, 16, Color("#ecc981", 0.5), 1.0)

	# 4. 御守金光真罡护体法阵
	if action_state == "guard":
		var hex_pts = PackedVector2Array()
		var r = 24.0
		for i in range(7):
			var a = guard_rot + float(i) * TAU / 6.0
			hex_pts.append(Vector2(cos(a) * r, sin(a) * r))
		draw_polyline(hex_pts, Color("#ecc981"), 2.2)
		draw_arc(Vector2.ZERO, 18.0, 0, TAU, 18, Color("#5eead4"), 1.2)

	# 5. 头顶像素血条（适配 48px 格子）
	var bar_w = 36.0
	var bar_h = 4.0
	var bar_x = -bar_w * 0.5
	var bar_y = -26.0

	# 纯黑底框
	draw_rect(Rect2(bar_x - 1, bar_y - 1, bar_w + 2, bar_h + 2), Color("#0a0d0e", 0.9))
	# 当前血量
	var ratio = clampf(float(hp) / float(max_hp), 0.0, 1.0)
	var hp_color = Color("#34d399") if team == Team.PLAYER else Color("#f87171")
	draw_rect(Rect2(bar_x, bar_y, bar_w * ratio, bar_h), hp_color)

	# 6. 底部真元灵符槽（适配 48px 格子）
	var qi_y = 16.0
	var count = mini(6, max_qi)
	var start_x = -float(count * 6.5) * 0.5
	for i in range(count):
		var qx = start_x + i * 6.5
		var is_full = i < qi
		draw_rect(Rect2(qx, qi_y, 5.0, 3.0), Color("#38bdf8") if is_full else Color("#1c2833", 0.8))
		draw_rect(Rect2(qx, qi_y, 3.5, 2.5), Color("#38bdf8") if is_full else Color("#1c2833", 0.8))
