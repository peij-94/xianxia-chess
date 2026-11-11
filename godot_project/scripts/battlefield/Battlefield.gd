class_name Battlefield
extends Node2D

## 棋盘参数 (20x20 大尺度天衍棋局，放大至1.5倍 48px 格子)
const TILE_SIZE: float = 48.0
const COLS: int = 20
const ROWS: int = 20
const BOARD_ORIGIN: Vector2 = Vector2(24, 76)

## 五大山海秘境场景环境与专属法则增益
const BIOMES: Dictionary = {
	"SWORD_TOMB": {
		"id": "SWORD_TOMB",
		"name": "通天剑冢 · 万剑归宗",
		"icon": "⚔️",
		"bg_dark": Color(0.04, 0.07, 0.10),
		"bg_tint": Color(0.07, 0.12, 0.17),
		"accent": Color("#38bdf8"),
		"border": Color("#7dd3fc"),
		"buff_title": "【万剑归宗】",
		"buff_desc": "金系与剑道威能+25%，物理攻击暴击率+15%",
		"elem_boost": 0,
		"dmg_mult": 1.25,
		"crit_bonus": 0.15,
	},
	"MAGMA_VALLEY": {
		"id": "MAGMA_VALLEY",
		"name": "祝融火谷 · 焚世地脉",
		"icon": "🔥",
		"bg_dark": Color(0.10, 0.04, 0.04),
		"bg_tint": Color(0.16, 0.06, 0.06),
		"accent": Color("#ef4444"),
		"border": Color("#f97316"),
		"buff_title": "【地脉烈煌】",
		"buff_desc": "火系神通威能+30%，产生击退或撞墙壁击时附加灼烧真火伤害",
		"elem_boost": 3,
		"dmg_mult": 1.30,
		"wall_burn": true,
	},
	"ANCIENT_FOREST": {
		"id": "ANCIENT_FOREST",
		"name": "太古建木 · 青帝神林",
		"icon": "🌲",
		"bg_dark": Color(0.03, 0.09, 0.05),
		"bg_tint": Color(0.06, 0.15, 0.09),
		"accent": Color("#22c55e"),
		"border": Color("#4ade80"),
		"buff_title": "【乙木长生】",
		"buff_desc": "木系神通射程+1；每候回合伊始，全体修仙同盟自愈+12气血",
		"elem_boost": 1,
		"range_bonus": 1,
		"regen_hp": 12,
	},
	"GLACIAL_ABYSS": {
		"id": "GLACIAL_ABYSS",
		"name": "太阴寒潭 · 九幽玄冰",
		"icon": "❄️",
		"bg_dark": Color(0.03, 0.07, 0.11),
		"bg_tint": Color(0.05, 0.12, 0.18),
		"accent": Color("#06b6d4"),
		"border": Color("#38bdf8"),
		"buff_title": "【玄冰凝罡】",
		"buff_desc": "水系神通真元消耗-1；全体受到的暴击伤害减免30%",
		"elem_boost": 2,
		"cost_discount": 1,
		"crit_resist": 0.30,
	},
	"KUNLUN_TAIJI": {
		"id": "KUNLUN_TAIJI",
		"name": "昆仑仙府 · 太极两仪",
		"icon": "☯️",
		"bg_dark": Color(0.07, 0.05, 0.12),
		"bg_tint": Color(0.11, 0.08, 0.18),
		"accent": Color("#a855f7"),
		"border": Color("#ecc981"),
		"buff_title": "【两仪合德】",
		"buff_desc": "五行相克增伤提升至50%；绝脉背刺必暴伤害提升至160%",
		"elem_boost": -1,
		"counter_mult": 1.50,
		"backstab_mult": 1.60,
	}
}
var current_biome: Dictionary = BIOMES["ANCIENT_FOREST"]
var biome_banner_lbl: Label = null

## 大荒四时天象·天气系统
const WEATHERS: Dictionary = {
	"CLEAR": {
		"id": "CLEAR",
		"name": "天朗气清 · 乾坤泰和",
		"icon": "☀️",
		"color": Color("#fef08a"),
		"modulate": Color(1.0, 1.0, 1.0, 1.0),
		"desc": "阴阳谐和，大荒祥瑞。全员聚气吐纳正常，无特殊气候加成与减益。"
	},
	"LIGHTNING": {
		"id": "LIGHTNING",
		"name": "紫霄雷暴 · 九天掣电",
		"icon": "⚡",
		"color": Color("#c084fc"),
		"modulate": Color(0.85, 0.78, 1.15, 1.0),
		"desc": "九天神雷滚滚！金系神通伤害+25%；攻击暴击时引动【九天引雷】连锁轰击周围1格敌方！"
	},
	"RAIN": {
		"id": "RAIN",
		"name": "灵气仙霖 · 碧水甘露",
		"icon": "🌧️",
		"color": Color("#38bdf8"),
		"modulate": Color(0.80, 0.95, 1.05, 1.0),
		"desc": "青霖仙露润泽！水系与木系神通消耗-1气；每候回合结束全体友军自愈+15气血与+1真元；火系威能-20%。"
	},
	"HEATWAVE": {
		"id": "HEATWAVE",
		"name": "烈阳天煞 · 旱魃炽炎",
		"icon": "🏜️",
		"color": Color("#f97316"),
		"modulate": Color(1.18, 0.92, 0.75, 1.0),
		"desc": "赤阳当空，大地熔铸！火系神通威能+35%；攻击命中附带【真火灼烧】；水系治疗效果-30%；全员真元聚气+1。"
	},
	"FOG": {
		"id": "FOG",
		"name": "太阴寒雾 · 迷踪幻境",
		"icon": "🌫️",
		"color": Color("#94a3b8"),
		"modulate": Color(0.85, 0.90, 0.96, 0.96),
		"desc": "九幽寒雾笼罩！全体步法+1；获得20%【迷雾闪避】几率；射程大于2格的神通威力-25%。"
	}
}

var current_weather: Dictionary = WEATHERS["CLEAR"]
var weather_turns_left: int = 3

## 障碍物高清像素纹理预载
const ObsRockTex = preload("res://assets/obstacles/obstacle_rock.png")
const ObsMonumentTex = preload("res://assets/obstacles/obstacle_monument.png")
const ObsFirePillarTex = preload("res://assets/obstacles/obstacle_fire_pillar.png")
const ObsFrostSpikeTex = preload("res://assets/obstacles/obstacle_frost_spike.png")
const ObsThornTex = preload("res://assets/obstacles/obstacle_thorn.png")

## 粒子特效预载
const SlashVFX = preload("res://scenes/vfx/PixelInkWashSlash.tscn")
const PoisonVFX = preload("res://scenes/vfx/PixelPoisonBurst.tscn")
const CelestialVFX = preload("res://scenes/vfx/PixelCelestialRay.tscn")
const FlameJawVFX = preload("res://scenes/vfx/PixelFlameJaw.tscn")
const TalonVFX = preload("res://scenes/vfx/PixelTalonPiercing.tscn")
const EarthFissureVFX = preload("res://scenes/vfx/PixelEarthFissure.tscn")
const BloodClawVFX = preload("res://scenes/vfx/PixelBloodClaw.tscn")

## 状态
enum TurnState { PLAYER_TURN, ENEMY_TURN, RESOLVING }
var current_turn: TurnState = TurnState.PLAYER_TURN
var round_count: int = 1
var current_chapter_idx: int = 0
static var launch_mode: String = "ROGUELIKE" # "ROGUELIKE", "CONTINUE", "PRACTICE", "CAMPAIGN"
var is_roguelike_mode: bool = false
var roguelike_floor: int = 1
var celestial_cycle: String = "NORMAL" # NORMAL, DAY, NIGHT
var anim_time: float = 0.0

## 战棋网格与寻路
var grid_manager: GridManager = null
var units: Array[Unit] = []
var selected_unit: Unit = null
var selected_skill: Dictionary = {}
var move_tiles: Array[Vector2i] = []
var skill_targets: Array[Vector2i] = []
var hovered_tile: Vector2i = Vector2i(-1, -1)
var action_menu_mode: String = "ACTION" # "ACTION" or "SKILLS"

## 悬浮菜单组件 (Floating Action HUD)
var floating_menu: PanelContainer = null
var floating_actions_hbox: HBoxContainer = null
var floating_skills_hbox: HBoxContainer = null
var floating_submode: String = "ACTION"

## 右侧面板与 UI 增强控件
var element_wheel_bar: PanelContainer = null
var hp_progress_bar: ProgressBar = null
var qi_progress_bar: ProgressBar = null
var weapon_panel: PanelContainer = null
var weapon_icon_rect: TextureRect = null
var weapon_name_label: Label = null
var weapon_stats_label: Label = null
var weapon_switch_btn: Button = null
var action_hub_container: VBoxContainer = null
var action_hub_title: Label = null
var inspection_card: PanelContainer = null
var inspection_title_label: Label = null
var inspection_meta_label: Label = null
var inspection_desc_label: Label = null
var inspection_state_label: Label = null

## 基础 UI 节点引用
@onready var ui_canvas: CanvasLayer = $HUD
@onready var day_night_modulate: CanvasModulate = $DayNightModulate
@onready var top_bar: HBoxContainer = $HUD/TopBar
@onready var round_label: Label = $HUD/TopBar/RoundLabel
@onready var turn_label: Label = $HUD/TopBar/TurnLabel
@onready var end_turn_btn: Button = $HUD/TopBar/EndTurnBtn
@onready var undo_btn: Button = $HUD/TopBar/UndoBtn
@onready var chapter_btn: Button = $HUD/TopBar/ChapterBtn
@onready var roguelike_btn: Button = $HUD/TopBar/RoguelikeBtn
@onready var home_btn: Button = $HUD/TopBar/HomeBtn
@onready var side_panel: Panel = $HUD/SidePanel
@onready var unit_name_label: Label = $HUD/SidePanel/UnitNameLabel
@onready var unit_realm_label: Label = $HUD/SidePanel/UnitRealmLabel
@onready var unit_elem_label: Label = $HUD/SidePanel/UnitElemLabel
@onready var unit_hp_label: Label = $HUD/SidePanel/UnitHpLabel
@onready var unit_qi_label: Label = $HUD/SidePanel/UnitQiLabel
@onready var unit_atk_def_label: Label = $HUD/SidePanel/UnitAtkDefLabel
@onready var unit_avatar_rect: TextureRect = $HUD/SidePanel/AvatarRect
@onready var skills_container: VBoxContainer = $HUD/SidePanel/SkillsContainer
@onready var combat_log: RichTextLabel = $HUD/SidePanel/CombatLog
@onready var modal_panel: Panel = $HUD/ModalPanel
@onready var modal_title: Label = $HUD/ModalPanel/ModalTitle
@onready var modal_desc: Label = $HUD/ModalPanel/ModalDesc
@onready var modal_btn: Button = $HUD/ModalPanel/ModalBtn

func _ready() -> void:
	grid_manager = GridManager.new()
	add_child(grid_manager)
	
	setup_ui_theme()
	setup_signals()

	if launch_mode == "CONTINUE":
		if SaveManager.has_active_run():
			var run = SaveManager.load_active_run()
			roguelike_floor = run.get("current_floor", 1)
			load_roguelike_floor(roguelike_floor)
		else:
			start_roguelike_run()
	elif launch_mode == "PRACTICE":
		start_practice_mode()
	elif launch_mode == "CAMPAIGN":
		load_chapter(0)
	else:
		start_roguelike_run()

	if OS.get_environment("RECORD_SKILL") == "1":
		_run_record_skill_video()
	elif OS.get_environment("AUTO_SCREENSHOT") == "1":
		_run_auto_screenshot()

func _run_record_skill_video() -> void:
	await get_tree().create_timer(0.5).timeout
	var bf_unit: Unit = null
	for u in units:
		if u.unit_id == "bifang":
			bf_unit = u
			break
	if bf_unit == null:
		get_tree().quit()
		return

	select_unit(bf_unit)
	await get_tree().create_timer(0.2).timeout

	# 演示施展毕方本命招牌神技【独足赤羽焰】
	var sk = bf_unit.skills[0] # FIRE 独足赤羽焰
	var target_pt = Vector2i(6, 10)
	execute_player_skill(bf_unit, sk, target_pt)

	var dir_path = "/tmp/skill_frames"
	DirAccess.make_dir_recursive_absolute(dir_path)

	# 录制 32 帧 (每帧等待约 35ms，结合 save_png 耗时，完美覆盖 2.4 秒全演武进程)
	for f in range(32):
		await get_tree().create_timer(0.035).timeout
		var img = get_viewport().get_texture().get_image()
		img.save_png("%s/frame_%03d.png" % [dir_path, f])

	print("RECORD_FRAMES_DONE")
	get_tree().quit()

func _run_auto_screenshot() -> void:
	await get_tree().create_timer(0.6).timeout
	var bq_unit: Unit = null
	var lx_unit: Unit = null
	for u in units:
		if u.unit_id == "baiqian":
			bq_unit = u
		elif u.unit_id == "lingxu":
			lx_unit = u
	
	if bq_unit and lx_unit:
		# 演示白浅施展【万木逢春】青木长生灵阵与甘露升腾
		select_unit(bq_unit)
		var heal_sk = bq_unit.skills[0] # HEAL 万木逢春
		execute_player_skill(bq_unit, heal_sk, lx_unit.grid_pos)
	
	# 在万木逢春青木灵阵绽放与仙藤甘露螺旋升腾时抓取实机画面
	await get_tree().create_timer(0.28).timeout
	var img = get_viewport().get_texture().get_image()
	img.save_png("/Users/peij94/.gemini/antigravity/brain/ef68998a-8d68-43a9-bd87-d195ecb591ce/godot_heal_vfx_screenshot.png")
	print("HEAL_VFX_SCREENSHOT_SAVED_SUCCESSFULLY")
	get_tree().quit()

func _process(delta: float) -> void:
	anim_time += delta

	# 持续微光呼吸、天气氛围与移动刷新
	queue_redraw()

	if floating_menu and floating_menu.visible and selected_unit != null:
		update_floating_menu_position()

func setup_signals() -> void:
	end_turn_btn.pressed.connect(_on_end_turn_pressed)
	undo_btn.pressed.connect(_on_undo_pressed)
	chapter_btn.pressed.connect(_on_chapter_btn_pressed)
	roguelike_btn.pressed.connect(start_roguelike_run)
	if home_btn:
		home_btn.pressed.connect(_on_home_btn_pressed)
	modal_btn.pressed.connect(_on_modal_btn_pressed)

func _on_home_btn_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")

## ========================================================================
## 1. 国风仙侠 UI 主题与悬浮菜单搭建
## ========================================================================
func setup_ui_theme() -> void:
	# 1. 顶部栏背景板与按钮美化 (宽度适配 1440 视口)
	var top_style = StyleBoxFlat.new()
	top_style.bg_color = Color(0.06, 0.10, 0.13, 0.95)
	top_style.border_color = Color("#ecc981")
	top_style.set_border_width_all(1)
	top_style.set_corner_radius_all(4)
	top_style.shadow_color = Color(0, 0, 0, 0.6)
	top_style.shadow_size = 4
	top_bar.position = Vector2(24, 8)
	top_bar.size = Vector2(1392, 34)

	apply_btn_style(end_turn_btn, Color("#134e35"), Color("#22c55e"), Color("#86efac"))
	apply_btn_style(undo_btn, Color("#1e293b"), Color("#94a3b8"), Color("#cbd5e1"))
	apply_btn_style(chapter_btn, Color("#2e382d"), Color("#ecc981"), Color("#fde047"))
	apply_btn_style(roguelike_btn, Color("#3a2512"), Color("#f59e0b"), Color("#fcd34d"))
	apply_btn_style(home_btn, Color("#1f2937"), Color("#64748b"), Color("#e2e8f0"))

	# 四时天象演化切换快捷按钮
	var weather_btn = Button.new()
	weather_btn.text = "🌤️ 四时天象"
	weather_btn.tooltip_text = "观测或引聚大荒四时天象更迭 (雷暴/仙霖/烈阳/寒雾/晴朗)"
	apply_btn_style(weather_btn, Color("#2d2038"), Color("#c084fc"), Color("#e9d5ff"))
	weather_btn.custom_minimum_size = Vector2(96, 34)
	weather_btn.pressed.connect(func(): change_weather())
	top_bar.add_child(weather_btn)
	top_bar.move_child(weather_btn, 4)

	# 2. 顶部五行生克指示栏 & 秘境领域法则条 (双栏横排)
	element_wheel_bar = PanelContainer.new()
	var elem_style = StyleBoxFlat.new()
	elem_style.bg_color = Color(0.04, 0.08, 0.10, 0.92)
	elem_style.border_color = Color(0.92, 0.79, 0.51, 0.45)
	elem_style.set_border_width_all(1)
	elem_style.set_corner_radius_all(4)
	elem_style.content_margin_left = 12
	elem_style.content_margin_right = 12
	element_wheel_bar.add_theme_stylebox_override("panel", elem_style)
	element_wheel_bar.position = Vector2(24, 46)
	element_wheel_bar.size = Vector2(1392, 24)
	
	var banner_hbox = HBoxContainer.new()
	banner_hbox.add_theme_constant_override("separation", 20)
	element_wheel_bar.add_child(banner_hbox)

	var elem_lbl = Label.new()
	elem_lbl.text = "【大荒天衍·五行生克】金 →克→ 木 →克→ 土 →克→ 水 →克→ 火 →克→ 金 ｜ 绝脉背刺 140% ｜ 撞墙崩裂 ｜ 合击 +25%"
	elem_lbl.add_theme_color_override("font_color", Color("#ecc981"))
	elem_lbl.add_theme_font_size_override("font_size", 11)
	banner_hbox.add_child(elem_lbl)

	biome_banner_lbl = Label.new()
	biome_banner_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	biome_banner_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	biome_banner_lbl.add_theme_font_size_override("font_size", 11)
	banner_hbox.add_child(biome_banner_lbl)
	update_environment_banner()

	ui_canvas.add_child(element_wheel_bar)

	# 3. 右侧控制面板重新布局与美化 (紧凑精巧型，缩窄至 412px，不抢占棋盘空间)
	side_panel.position = Vector2(1004, 76)
	side_panel.size = Vector2(412, 960)
	var side_style = StyleBoxFlat.new()
	side_style.bg_color = Color(0.06, 0.09, 0.12, 0.96)
	side_style.border_color = Color("#ecc981")
	side_style.set_border_width_all(2)
	side_style.set_corner_radius_all(8)
	side_style.shadow_color = Color(0, 0, 0, 0.8)
	side_style.shadow_size = 8
	side_panel.add_theme_stylebox_override("panel", side_style)

	# 头像框背景
	var avatar_bg = Panel.new()
	avatar_bg.position = Vector2(16, 12)
	avatar_bg.size = Vector2(72, 72)
	var abg_style = StyleBoxFlat.new()
	abg_style.bg_color = Color(0.03, 0.05, 0.07, 0.95)
	abg_style.border_color = Color("#ecc981")
	abg_style.set_border_width_all(1)
	abg_style.set_corner_radius_all(6)
	avatar_bg.add_theme_stylebox_override("panel", abg_style)
	side_panel.add_child(avatar_bg)
	avatar_bg.show_behind_parent = false
	side_panel.move_child(avatar_bg, 0)
	unit_avatar_rect.position = Vector2(18, 14)
	unit_avatar_rect.size = Vector2(68, 68)

	unit_name_label.position = Vector2(98, 12)
	unit_name_label.size = Vector2(300, 24)
	unit_name_label.add_theme_font_size_override("font_size", 18)
	unit_name_label.add_theme_color_override("font_color", Color("#ecc981"))

	unit_realm_label.position = Vector2(98, 36)
	unit_realm_label.size = Vector2(300, 20)
	unit_realm_label.add_theme_font_size_override("font_size", 12)

	unit_elem_label.position = Vector2(98, 58)
	unit_elem_label.size = Vector2(300, 20)
	unit_elem_label.add_theme_font_size_override("font_size", 12)

	# 气血与真元进度条 (双槽并排)
	hp_progress_bar = ProgressBar.new()
	hp_progress_bar.position = Vector2(16, 88)
	hp_progress_bar.size = Vector2(185, 20)
	hp_progress_bar.show_percentage = false
	var hp_bg = StyleBoxFlat.new()
	hp_bg.bg_color = Color("#172026")
	hp_bg.set_corner_radius_all(3)
	var hp_fg = StyleBoxFlat.new()
	hp_fg.bg_color = Color("#22c55e")
	hp_fg.set_corner_radius_all(3)
	hp_progress_bar.add_theme_stylebox_override("background", hp_bg)
	hp_progress_bar.add_theme_stylebox_override("fill", hp_fg)
	side_panel.add_child(hp_progress_bar)

	unit_hp_label.position = Vector2(16, 88)
	unit_hp_label.size = Vector2(185, 20)
	unit_hp_label.add_theme_font_size_override("font_size", 11)
	unit_hp_label.add_theme_color_override("font_color", Color.WHITE)
	unit_hp_label.add_theme_constant_override("outline_size", 3)
	unit_hp_label.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.95))
	unit_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	unit_hp_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	side_panel.move_child(unit_hp_label, side_panel.get_child_count() - 1)

	qi_progress_bar = ProgressBar.new()
	qi_progress_bar.position = Vector2(211, 88)
	qi_progress_bar.size = Vector2(185, 20)
	qi_progress_bar.show_percentage = false
	var qi_bg = StyleBoxFlat.new()
	qi_bg.bg_color = Color("#172026")
	qi_bg.set_corner_radius_all(3)
	var qi_fg = StyleBoxFlat.new()
	qi_fg.bg_color = Color("#0284c7")
	qi_fg.set_corner_radius_all(3)
	qi_progress_bar.add_theme_stylebox_override("background", qi_bg)
	qi_progress_bar.add_theme_stylebox_override("fill", qi_fg)
	side_panel.add_child(qi_progress_bar)

	unit_qi_label.position = Vector2(211, 88)
	unit_qi_label.size = Vector2(185, 20)
	unit_qi_label.add_theme_font_size_override("font_size", 11)
	unit_qi_label.add_theme_color_override("font_color", Color.WHITE)
	unit_qi_label.add_theme_constant_override("outline_size", 3)
	unit_qi_label.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.95))
	unit_qi_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	unit_qi_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	side_panel.move_child(unit_qi_label, side_panel.get_child_count() - 1)

	unit_atk_def_label.position = Vector2(16, 114)
	unit_atk_def_label.size = Vector2(380, 22)
	unit_atk_def_label.add_theme_font_size_override("font_size", 12)
	unit_atk_def_label.add_theme_color_override("font_color", Color("#cbd5e1"))

	# 4. 本命神兵法宝专属装备栏 (武器系统与像素图标展示)
	weapon_panel = PanelContainer.new()
	var w_style = StyleBoxFlat.new()
	w_style.bg_color = Color(0.04, 0.08, 0.12, 0.95)
	w_style.border_color = Color(0.92, 0.79, 0.51, 0.45)
	w_style.set_border_width_all(1)
	w_style.set_corner_radius_all(6)
	w_style.content_margin_left = 8
	w_style.content_margin_top = 4
	w_style.content_margin_right = 8
	w_style.content_margin_bottom = 4
	weapon_panel.add_theme_stylebox_override("panel", w_style)
	weapon_panel.position = Vector2(16, 138)
	weapon_panel.size = Vector2(380, 44)
	weapon_panel.mouse_entered.connect(inspect_current_weapon)
	weapon_panel.mouse_exited.connect(reset_skill_inspection)
	side_panel.add_child(weapon_panel)

	var w_hbox = HBoxContainer.new()
	w_hbox.add_theme_constant_override("separation", 8)
	weapon_panel.add_child(w_hbox)

	weapon_icon_rect = TextureRect.new()
	weapon_icon_rect.custom_minimum_size = Vector2(34, 34)
	weapon_icon_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	weapon_icon_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	w_hbox.add_child(weapon_icon_rect)

	var w_vbox = VBoxContainer.new()
	w_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	w_vbox.add_theme_constant_override("separation", 2)
	w_hbox.add_child(w_vbox)

	weapon_name_label = Label.new()
	weapon_name_label.text = "本命神兵：未佩戴"
	weapon_name_label.add_theme_color_override("font_color", Color("#ecc981"))
	weapon_name_label.add_theme_font_size_override("font_size", 12)
	w_vbox.add_child(weapon_name_label)

	weapon_stats_label = Label.new()
	weapon_stats_label.text = "暂无神兵加成"
	weapon_stats_label.add_theme_color_override("font_color", Color("#94a3b8"))
	weapon_stats_label.add_theme_font_size_override("font_size", 10)
	w_vbox.add_child(weapon_stats_label)

	weapon_switch_btn = Button.new()
	weapon_switch_btn.text = "⚡ 换宝"
	weapon_switch_btn.tooltip_text = "切换轮换本命神兵法宝"
	apply_btn_style(weapon_switch_btn, Color("#1e293b"), Color("#ecc981"), Color("#fde047"))
	weapon_switch_btn.custom_minimum_size = Vector2(56, 26)
	weapon_switch_btn.pressed.connect(_on_weapon_switch_pressed)
	w_hbox.add_child(weapon_switch_btn)

	# 隐藏原本场景里可能残留的重叠旧标题
	var old_skill_title = side_panel.get_node_or_null("SkillTitle")
	if old_skill_title:
		old_skill_title.visible = false

	# 战术行动中枢标题
	var act_header = Label.new()
	act_header.text = "✦ 战术行动指令中枢 (移动/攻击/防御)"
	act_header.position = Vector2(16, 186)
	act_header.size = Vector2(380, 20)
	act_header.add_theme_color_override("font_color", Color("#ecc981"))
	act_header.add_theme_font_size_override("font_size", 12)
	side_panel.add_child(act_header)

	skills_container.position = Vector2(16, 208)
	skills_container.size = Vector2(380, 116)
	skills_container.add_theme_constant_override("separation", 5)

	# 招式神通真解秘卷区 (Inspection Card)
	inspection_card = PanelContainer.new()
	var insp_style = StyleBoxFlat.new()
	insp_style.bg_color = Color(0.04, 0.08, 0.11, 0.95)
	insp_style.border_color = Color(0.92, 0.79, 0.51, 0.45)
	insp_style.set_border_width_all(1)
	insp_style.set_corner_radius_all(6)
	insp_style.content_margin_left = 10
	insp_style.content_margin_top = 6
	insp_style.content_margin_right = 10
	insp_style.content_margin_bottom = 6
	inspection_card.add_theme_stylebox_override("panel", insp_style)
	inspection_card.position = Vector2(16, 328)
	inspection_card.size = Vector2(380, 108)
	side_panel.add_child(inspection_card)

	var insp_vbox = VBoxContainer.new()
	insp_vbox.add_theme_constant_override("separation", 3)
	inspection_card.add_child(insp_vbox)

	var insp_top_row = HBoxContainer.new()
	insp_vbox.add_child(insp_top_row)

	inspection_title_label = Label.new()
	inspection_title_label.text = "✦ 凝神入定 · 观照命盘"
	inspection_title_label.add_theme_color_override("font_color", Color("#ecc981"))
	inspection_title_label.add_theme_font_size_override("font_size", 12)
	insp_top_row.add_child(inspection_title_label)

	inspection_state_label = Label.new()
	inspection_state_label.text = "【神识感应】"
	inspection_state_label.add_theme_color_override("font_color", Color("#94a3b8"))
	inspection_state_label.add_theme_font_size_override("font_size", 11)
	insp_top_row.add_child(inspection_state_label)

	inspection_meta_label = Label.new()
	inspection_meta_label.text = "指点棋盘悬浮图标或技能卡片参悟神通真解"
	inspection_meta_label.add_theme_color_override("font_color", Color("#38bdf8"))
	inspection_meta_label.add_theme_font_size_override("font_size", 11)
	insp_vbox.add_child(inspection_meta_label)

	inspection_desc_label = Label.new()
	inspection_desc_label.text = "轻点棋盘角色身旁【悬浮招式图标】蓄力施法，或悬停图标参悟绝学秘卷。"
	inspection_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	inspection_desc_label.add_theme_color_override("font_color", Color("#cbd5e1"))
	inspection_desc_label.add_theme_font_size_override("font_size", 10)
	insp_vbox.add_child(inspection_desc_label)

	# 实况日志框
	var log_header = side_panel.get_node_or_null("LogTitle") as Label
	if log_header:
		log_header.position = Vector2(16, 442)
		log_header.size = Vector2(380, 20)
		log_header.text = "✦ 大荒天衍实况战报"
		log_header.add_theme_font_size_override("font_size", 12)
	combat_log.position = Vector2(16, 466)
	combat_log.size = Vector2(380, 480)

	# 4. 创建棋盘悬浮操作菜单 (Floating Action Menu)
	setup_floating_menu()

## 实时更新顶部秘境与天象双重法则展示条
func update_environment_banner() -> void:
	if biome_banner_lbl == null:
		return
	var b_icon = current_biome.get("icon", "🏔️")
	var b_name = current_biome.get("name", "大荒秘境")
	var b_accent: Color = current_biome.get("accent", Color("#ecc981"))
	
	var w_icon = current_weather.get("icon", "☀️")
	var w_name = current_weather.get("name", "天朗气清")
	var w_col = current_weather.get("color", Color("#fef08a"))

	biome_banner_lbl.text = "【秘境】%s %s ｜ 【天象】%s %s (%d候)" % [b_icon, b_name, w_icon, w_name.substr(0, 4), weather_turns_left]
	biome_banner_lbl.add_theme_color_override("font_color", b_accent)

## 切换大荒四时天象更迭
func change_weather(w_id: String = "") -> void:
	if w_id != "" and WEATHERS.has(w_id):
		current_weather = WEATHERS[w_id]
	else:
		var w_keys = WEATHERS.keys()
		var candidates = w_keys.filter(func(k): return k != current_weather["id"])
		var picked = candidates[randi() % candidates.size()]
		current_weather = WEATHERS[picked]

	weather_turns_left = randi_range(3, 4)
	animate_modulate(current_weather["modulate"])
	update_environment_banner()

	var w_name = current_weather["name"]
	var w_col: Color = current_weather["color"]
	spawn_floating_banner("天象剧变 ｜ %s" % w_name, w_col)
	add_log("[color=%s]【天象剧变】风云骤起，大荒天象转为「%s」！\n✦ 法则：%s[/color]" % [w_col.to_html(), w_name, current_weather["desc"]])
	queue_redraw()

## 屏幕中央天象预警横幅
func spawn_floating_banner(msg: String, col: Color) -> void:
	var banner = Label.new()
	banner.text = msg
	banner.add_theme_font_size_override("font_size", 18)
	banner.add_theme_color_override("font_color", col)
	banner.add_theme_constant_override("outline_size", 4)
	banner.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.95))
	banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	banner.position = Vector2(BOARD_ORIGIN.x + (COLS * TILE_SIZE - 400) * 0.5, BOARD_ORIGIN.y + 40)
	banner.size = Vector2(400, 36)
	banner.z_index = 150
	ui_canvas.add_child(banner)

	var t = create_tween()
	t.tween_property(banner, "position:y", banner.position.y - 20, 1.8)
	t.parallel().tween_property(banner, "modulate:a", 0.0, 1.8)
	t.tween_callback(banner.queue_free)

## 玩家点击换宝按钮：轮换切换本命神兵法宝
func _on_weapon_switch_pressed() -> void:
	if selected_unit == null or selected_unit.team != Unit.Team.PLAYER:
		return
	var all_w = WeaponSystem.get_all_weapon_ids()
	var curr_id = selected_unit.equipped_weapon.get("id", "")
	var curr_idx = all_w.find(curr_id)
	var next_idx = (curr_idx + 1) % all_w.size()
	var next_id = all_w[next_idx]
	selected_unit.equip_weapon(next_id)
	update_unit_panel(selected_unit)
	inspect_current_weapon()
	add_log("[color=#38bdf8]【神兵交替】%s 祭起全新本命法宝「%s」！属性与被动已同步运化。[/color]" % [selected_unit.unit_name, selected_unit.equipped_weapon["name"]])
	spawn_floating_text("【换宝·%s】" % selected_unit.equipped_weapon["name"], selected_unit.grid_pos, Color("#fde047"))

## 鼠标悬停武器面板时，参悟神兵真解
func inspect_current_weapon() -> void:
	if selected_unit == null or selected_unit.equipped_weapon.is_empty() or inspection_card == null:
		return
	var w = selected_unit.equipped_weapon
	inspection_card.visible = true
	inspection_title_label.text = "✦ %s %s [%s]" % [w.get("emoji", "🗡️"), w.get("name", "神兵"), w.get("tier", "凡品")]
	inspection_title_label.add_theme_color_override("font_color", w.get("tier_color", Color("#ecc981")))
	inspection_state_label.text = "【本命神兵】"
	inspection_state_label.add_theme_color_override("font_color", Color("#fde047"))
	inspection_meta_label.text = "+%d 攻伐 ｜ +%d 守御 ｜ +%d%% 暴击 ｜ %s" % [w.get("atk_bonus", 0), w.get("def_bonus", 0), int(w.get("crit_bonus", 0.0) * 100), w.get("passive_name", "")]
	inspection_desc_label.text = "%s\n《山海神兵谱》：%s" % [w.get("passive_desc", ""), w.get("flavor", "")]

## 初始化棋盘角色身旁悬浮菜单 HUD
func setup_floating_menu() -> void:
	if floating_menu != null:
		return
	floating_menu = PanelContainer.new()
	var f_style = StyleBoxFlat.new()
	f_style.bg_color = Color(0.06, 0.09, 0.13, 0.96)
	f_style.border_color = Color("#ecc981")
	f_style.set_border_width_all(2)
	f_style.set_corner_radius_all(6)
	f_style.shadow_color = Color(0, 0, 0, 0.8)
	f_style.shadow_size = 10
	f_style.content_margin_left = 8
	f_style.content_margin_top = 6
	f_style.content_margin_right = 8
	f_style.content_margin_bottom = 6
	floating_menu.add_theme_stylebox_override("panel", f_style)
	floating_menu.visible = false
	floating_menu.z_index = 100
	ui_canvas.add_child(floating_menu)

	var main_vbox = VBoxContainer.new()
	floating_menu.add_child(main_vbox)

	floating_actions_hbox = HBoxContainer.new()
	floating_actions_hbox.add_theme_constant_override("separation", 6)
	main_vbox.add_child(floating_actions_hbox)

	floating_skills_hbox = HBoxContainer.new()
	floating_skills_hbox.add_theme_constant_override("separation", 6)
	floating_skills_hbox.visible = false
	main_vbox.add_child(floating_skills_hbox)

## 工具：为按钮应用国风高质感 StyleBox
func apply_btn_style(btn: Button, bg_col: Color, border_col: Color, text_col: Color) -> void:
	var sb = StyleBoxFlat.new()
	sb.bg_color = bg_col
	sb.border_color = border_col
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(4)
	btn.add_theme_stylebox_override("normal", sb)

	var sb_hover = StyleBoxFlat.new()
	sb_hover.bg_color = bg_col.lightened(0.2)
	sb_hover.border_color = border_col.lightened(0.3)
	sb_hover.set_border_width_all(2)
	sb_hover.set_corner_radius_all(4)
	btn.add_theme_stylebox_override("hover", sb_hover)

	btn.add_theme_color_override("font_color", text_col)
	btn.add_theme_color_override("font_hover_color", Color.WHITE)

func get_skill_icon_str(id: String) -> String:
	match id:
		"SWORD": return "🗡️"
		"SWORDS_AOE": return "🌪️"
		"HEAL": return "🌿"
		"CHARM": return "🌸"
		"FIRE": return "🔥"
		"HELLFIRE": return "☄️"
		"BITE": return "🐺"
		"TALON": return "🦅"
		"SLAM": return "🐗"
		"DAY_NIGHT": return "🐉"
		_: return "⚔️"

func get_skill_choreo_str(id: String) -> String:
	match id:
		"SWORD": return "[🗡️ 飞剑贯日·疾刺架势]"
		"SWORDS_AOE": return "[🌪️ 万剑归宗·剑阵腾空]"
		"HEAL": return "[🌿 万木逢春·结印仙霖]"
		"CHARM": return "[🌸 青丘狐魅·幻影魅步]"
		"FIRE": return "[🔥 赤羽神焰·吐火烈袭]"
		"HELLFIRE": return "[☄️ 讹火天劫·焚世展翼]"
		"BITE": return "[🐺 炎魔狂噬·撕咬扑杀]"
		"TALON": return "[🦅 铁角穿云·极速俯冲]"
		"SLAM": return "[🐗 撼地蛮突·地脉裂震]"
		"DAY_NIGHT": return "[🐉 太古睁暝·极光阴阳]"
		_: return "[⚔️ 武道出招]"

func get_element_color(elem_idx: int) -> Color:
	match elem_idx:
		0: return Color("#ecc981") # 金
		1: return Color("#65c27d") # 木
		2: return Color("#55a8f2") # 水
		3: return Color("#f25842") # 火
		4: return Color("#d4a36a") # 土
		_: return Color("#cbd5e1")

## ========================================================================
## 2. 角色悬浮战术指令中枢 (Floating Action Menu) 交互
## ========================================================================
func show_floating_action_menu(u: Unit, mode: String = "ACTION") -> void:
	floating_submode = mode
	if u == null or not u.is_alive or u.team != Unit.Team.PLAYER or u.has_acted:
		if floating_menu:
			floating_menu.visible = false
		reset_skill_inspection()
		update_action_hub_ui(null)
		return

	if floating_menu == null:
		setup_floating_menu()

	for c in floating_actions_hbox.get_children():
		c.queue_free()
	for c in floating_skills_hbox.get_children():
		c.queue_free()

	if mode == "ACTION":
		floating_actions_hbox.visible = true
		floating_skills_hbox.visible = false

		# 1. 移动 / 撤步
		var move_btn = Button.new()
		if u.has_moved:
			move_btn.text = "↶ 撤步"
			move_btn.tooltip_text = "撤销本次踏星移行，回溯至移动前站位"
			apply_btn_style(move_btn, Color("#1e293b"), Color("#94a3b8"), Color("#cbd5e1"))
			move_btn.mouse_entered.connect(func(): inspect_action("UNDO", u))
			move_btn.mouse_exited.connect(func(): reset_skill_inspection())
			move_btn.pressed.connect(func(): _on_undo_pressed())
		else:
			move_btn.text = "🏃 移动"
			move_btn.tooltip_text = "展开踏星身法，在棋盘青绿地格内移行"
			apply_btn_style(move_btn, Color("#134e35"), Color("#22c55e"), Color("#86efac"))
			move_btn.mouse_entered.connect(func(): inspect_action("MOVE", u))
			move_btn.mouse_exited.connect(func(): reset_skill_inspection())
			move_btn.pressed.connect(func(): start_move_selection())
		move_btn.custom_minimum_size = Vector2(72, 36)
		floating_actions_hbox.add_child(move_btn)

		# 2. 攻击 -> 切换二级技能
		var atk_btn = Button.new()
		atk_btn.text = "⚔️ 攻击"
		atk_btn.tooltip_text = "展开本命神通秘卷，抉择绝学杀伐"
		apply_btn_style(atk_btn, Color("#631c1c"), Color("#ef4444"), Color("#fca5a5"))
		atk_btn.mouse_entered.connect(func(): inspect_action("ATTACK", u))
		atk_btn.mouse_exited.connect(func(): reset_skill_inspection())
		atk_btn.pressed.connect(func():
			show_floating_action_menu(u, "SKILLS")
		)
		atk_btn.custom_minimum_size = Vector2(72, 36)
		floating_actions_hbox.add_child(atk_btn)

		# 3. 防御 -> 凝气御守
		var guard_btn = Button.new()
		guard_btn.text = "🛡️ 防御"
		guard_btn.tooltip_text = "原地沉肩调息，展开护体真罡金芒，抵挡下一次攻击并调息结束回合"
		apply_btn_style(guard_btn, Color("#4d3810"), Color("#ecc981"), Color("#fef08a"))
		guard_btn.mouse_entered.connect(func(): inspect_action("GUARD", u))
		guard_btn.mouse_exited.connect(func(): reset_skill_inspection())
		guard_btn.pressed.connect(func(): execute_guard_action())
		guard_btn.custom_minimum_size = Vector2(72, 36)
		floating_actions_hbox.add_child(guard_btn)

	elif mode == "SKILLS":
		floating_actions_hbox.visible = false
		floating_skills_hbox.visible = true

		# 返回按钮
		var back_btn = Button.new()
		back_btn.text = "↶ 返回"
		back_btn.tooltip_text = "返回一级战术行动抉择"
		apply_btn_style(back_btn, Color("#1e293b"), Color("#64748b"), Color("#cbd5e1"))
		back_btn.custom_minimum_size = Vector2(58, 36)
		back_btn.pressed.connect(func():
			show_floating_action_menu(u, "ACTION")
		)
		floating_skills_hbox.add_child(back_btn)

		# 每个技能按钮
		for sk in u.skills:
			var sk_btn = Button.new()
			var cost = sk.get("cost", 0)
			var can_cast = (u.qi >= cost and not u.has_acted)
			var icon_str = get_skill_icon_str(sk.get("id", ""))
			var short_name = sk.get("name", "").substr(0, 4)
			sk_btn.text = "%s %s\n(%d气)" % [icon_str, short_name, cost]
			sk_btn.disabled = not can_cast
			
			var elem_col = get_element_color(sk.get("elem", 0))
			apply_btn_style(sk_btn, Color("#101921"), elem_col, Color.WHITE)
			sk_btn.custom_minimum_size = Vector2(88, 36)
			sk_btn.mouse_entered.connect(func(): inspect_skill(sk, u))
			sk_btn.mouse_exited.connect(func(): reset_skill_inspection())
			sk_btn.pressed.connect(func():
				select_skill(sk)
			)
			floating_skills_hbox.add_child(sk_btn)

	floating_menu.visible = true
	update_floating_menu_position()
	update_action_hub_ui(u, mode)

func update_floating_menu_position() -> void:
	if selected_unit == null or floating_menu == null:
		return
	var char_center = BOARD_ORIGIN + Vector2(selected_unit.grid_pos.x + 0.5, selected_unit.grid_pos.y) * TILE_SIZE
	var menu_size = floating_menu.get_combined_minimum_size()
	if menu_size.x < 100:
		menu_size = Vector2(240, 48)
	
	var px = char_center.x - menu_size.x * 0.5
	px = clampf(px, BOARD_ORIGIN.x + 4, BOARD_ORIGIN.x + COLS * TILE_SIZE - menu_size.x - 4)
	
	var py = char_center.y - menu_size.y - 12.0
	if py < BOARD_ORIGIN.y + 4:
		py = char_center.y + TILE_SIZE + 10.0
	
	floating_menu.position = Vector2(px, py)

## 右侧面板中枢同步更新
func update_action_hub_ui(u: Unit, mode: String = "ACTION") -> void:
	for c in skills_container.get_children():
		c.queue_free()

	if u == null or not u.is_alive or u.team != Unit.Team.PLAYER or u.has_acted:
		return

	if mode == "ACTION":
		var move_btn = Button.new()
		if u.has_moved:
			move_btn.text = "↶ 撤回步法 [回溯] ｜ 原位回退站位，重新抉择行动"
			apply_btn_style(move_btn, Color("#1e293b"), Color("#94a3b8"), Color("#cbd5e1"))
			move_btn.pressed.connect(func(): _on_undo_pressed())
		else:
			move_btn.text = "🏃 踏星步法 [移动] ｜ (步法:%d格) 指点棋盘青绿地格移行" % u.move_range
			apply_btn_style(move_btn, Color("#134e35"), Color("#22c55e"), Color("#86efac"))
			move_btn.pressed.connect(func(): start_move_selection())
		move_btn.custom_minimum_size = Vector2(380, 32)
		move_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		move_btn.mouse_entered.connect(func(): inspect_action("MOVE" if not u.has_moved else "UNDO", u))
		move_btn.mouse_exited.connect(func(): reset_skill_inspection())
		skills_container.add_child(move_btn)

		var atk_btn = Button.new()
		atk_btn.text = "⚔️ 破煞神通 [攻击] ｜ (包含 %d 门本命绝学) 点击展开" % u.skills.size()
		apply_btn_style(atk_btn, Color("#631c1c"), Color("#ef4444"), Color("#fca5a5"))
		atk_btn.custom_minimum_size = Vector2(380, 32)
		atk_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		atk_btn.mouse_entered.connect(func(): inspect_action("ATTACK", u))
		atk_btn.mouse_exited.connect(func(): reset_skill_inspection())
		atk_btn.pressed.connect(func(): show_floating_action_menu(u, "SKILLS"))
		skills_container.add_child(atk_btn)

		var guard_btn = Button.new()
		guard_btn.text = "🛡️ 凝气御守 [防御] ｜ (消耗:0) 展开护体金罡调息"
		apply_btn_style(guard_btn, Color("#4d3810"), Color("#ecc981"), Color("#fef08a"))
		guard_btn.custom_minimum_size = Vector2(380, 32)
		guard_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		guard_btn.mouse_entered.connect(func(): inspect_action("GUARD", u))
		guard_btn.mouse_exited.connect(func(): reset_skill_inspection())
		guard_btn.pressed.connect(func(): execute_guard_action())
		skills_container.add_child(guard_btn)

	elif mode == "SKILLS":
		var back_btn = Button.new()
		back_btn.text = "↶ 返回战术指令 [移动/攻击/防御]"
		apply_btn_style(back_btn, Color("#1e293b"), Color("#64748b"), Color("#cbd5e1"))
		back_btn.custom_minimum_size = Vector2(380, 28)
		back_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		back_btn.pressed.connect(func(): show_floating_action_menu(u, "ACTION"))
		skills_container.add_child(back_btn)

		for sk in u.skills:
			var btn = Button.new()
			var cost = sk.get("cost", 0)
			var choreo = get_skill_choreo_str(sk.get("id", ""))
			var icon_str = get_skill_icon_str(sk.get("id", ""))
			var elem_col = get_element_color(sk.get("elem", 0))
			btn.text = "%s 【%s】 %s\n(真元:%d 射程:%d) %s" % [icon_str, sk["name"], choreo, cost, sk.get("range", 1), sk.get("desc", "")]
			btn.custom_minimum_size = Vector2(380, 34)
			btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
			btn.disabled = (u.has_acted or u.qi < cost)
			apply_btn_style(btn, Color("#101921"), elem_col, Color.WHITE)
			btn.mouse_entered.connect(func(): inspect_skill(sk, u))
			btn.mouse_exited.connect(func(): reset_skill_inspection())
			btn.pressed.connect(func(): select_skill(sk))
			skills_container.add_child(btn)

	elif mode == "TARGETING":
		var cancel_btn = Button.new()
		cancel_btn.text = "↶ 取消蓄力锁定 (右键或轻点此处) ｜ 重选绝学神通"
		apply_btn_style(cancel_btn, Color("#3f1717"), Color("#ef4444"), Color("#fca5a5"))
		cancel_btn.custom_minimum_size = Vector2(380, 32)
		cancel_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		cancel_btn.pressed.connect(func():
			selected_skill = {}
			skill_targets.clear()
			show_floating_action_menu(u, "SKILLS")
			queue_redraw()
		)
		skills_container.add_child(cancel_btn)

		var back_action_btn = Button.new()
		back_action_btn.text = "↶ 返回一级行动指令 [移动/攻击/防御]"
		apply_btn_style(back_action_btn, Color("#1e293b"), Color("#64748b"), Color("#cbd5e1"))
		back_action_btn.custom_minimum_size = Vector2(380, 28)
		back_action_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		back_action_btn.pressed.connect(func():
			selected_skill = {}
			skill_targets.clear()
			show_floating_action_menu(u, "ACTION")
			queue_redraw()
		)
		skills_container.add_child(back_action_btn)

	elif mode == "MOVING":
		var cancel_btn = Button.new()
		cancel_btn.text = "↶ 取消踏星移行 (右键或轻点此处) ｜ 返回行动中枢"
		apply_btn_style(cancel_btn, Color("#1e293b"), Color("#94a3b8"), Color("#cbd5e1"))
		cancel_btn.custom_minimum_size = Vector2(380, 32)
		cancel_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		cancel_btn.pressed.connect(func():
			move_tiles.clear()
			show_floating_action_menu(u, "ACTION")
			queue_redraw()
		)
		skills_container.add_child(cancel_btn)

func inspect_action(act_type: String, u: Unit) -> void:
	if inspection_card == null:
		return
	inspection_card.visible = true
	if act_type == "MOVE":
		inspection_state_label.text = "【踏星步法】"
		inspection_state_label.add_theme_color_override("font_color", Color("#86efac"))
		inspection_title_label.text = "✦ 踏星移行 · 战术身法"
		inspection_meta_label.text = "🏃 步法: %d格 ｜ 🎯 自由寻路 ｜ 💎 真元: 0" % u.move_range
		inspection_desc_label.text = "展开神行步法，在棋盘青绿高亮地格内飞身移行。若未施展攻击神通，随时可通过右键或撤步按钮原位回溯！"
	elif act_type == "UNDO":
		inspection_state_label.text = "【步法回溯】"
		inspection_state_label.add_theme_color_override("font_color", Color("#cbd5e1"))
		inspection_title_label.text = "✦ 踏星回溯 · 撤销移行"
		inspection_meta_label.text = "↶ 原位回退 ｜ 💎 无损消耗"
		inspection_desc_label.text = "取消本次踏星移行，角色原路回溯至移动前的站位，并重新恢复全部行动指令！"
	elif act_type == "ATTACK":
		inspection_state_label.text = "【武道神通】"
		inspection_state_label.add_theme_color_override("font_color", Color("#fca5a5"))
		inspection_title_label.text = "✦ 武道神通 · 破煞出招"
		inspection_meta_label.text = "⚔️ 包含 %d 门本命绝学 ｜ 境界: %s" % [u.skills.size(), u.realm]
		inspection_desc_label.text = "展开本命神通秘卷，抉择飞剑突刺、万剑大阵、仙霖妙法或奥义大招，锁定并惩戒敌对凶煞！"
	elif act_type == "GUARD":
		inspection_state_label.text = "【凝气御守】"
		inspection_state_label.add_theme_color_override("font_color", Color("#fef08a"))
		inspection_title_label.text = "✦ 纯阳真罡 · 周天吐纳"
		inspection_meta_label.text = "🛡️ 抵挡1次攻击 ｜ 💎 真元: 0 ｜ 🧘 沉肩运化"
		inspection_desc_label.text = "原地沉肩调息，展开旋转金光六芒护体罡气，完全抵御下一次任意杀伐伤害并结束本候回合。"

func inspect_skill(sk: Dictionary, u: Unit) -> void:
	if inspection_card == null:
		return
	inspection_card.visible = true
	var elem_names = ["金", "木", "水", "火", "土"]
	var elem_str = elem_names[sk.get("elem", 0)]
	var choreo = get_skill_choreo_str(sk.get("id", ""))
	
	inspection_state_label.text = "【神通真解】"
	inspection_state_label.add_theme_color_override("font_color", Color("#fde047"))
	inspection_title_label.text = "✦ %s %s" % [sk.get("name", "秘术"), choreo]
	var scale_str = "💥 威力: %d%%" % int(sk.get("scale", 1.0) * 100)
	if sk.get("is_heal", false):
		scale_str = "💖 恢复: %d点气血" % sk.get("heal_amt", 40)
	inspection_meta_label.text = "[%s行] ｜ 💎 真元: %d ｜ 🎯 射程: %d格 ｜ %s" % [elem_str, sk.get("cost", 0), sk.get("range", 1), scale_str]
	inspection_desc_label.text = sk.get("desc", "运化本命五行灵气，对敌方施展杀伐。")

func reset_skill_inspection() -> void:
	if inspection_card == null:
		return
	if not selected_skill.is_empty() and selected_unit != null:
		inspect_skill(selected_skill, selected_unit)
		inspection_state_label.text = "【⚡ 蓄力锁定中】"
		inspection_state_label.add_theme_color_override("font_color", Color("#4ade80"))
		return
	inspection_state_label.text = "【神识感应】"
	inspection_state_label.add_theme_color_override("font_color", Color("#94a3b8"))
	inspection_title_label.text = "✦ 凝神入定 · 观照命盘"
	inspection_meta_label.text = "指点棋盘悬浮图标或技能卡片参悟神通真解"
	inspection_desc_label.text = "轻点棋盘角色身旁【悬浮招式图标】蓄力施法，或悬停图标参悟绝学秘卷。"

## ========================================================================
## 3. 战斗与关卡数据加载
## ========================================================================
func start_practice_mode() -> void:
	is_roguelike_mode = false
	var practice_data = {
		"title": "演武演道 · 战阵推演道场",
		"desc": "自由研习五行生克、背刺穿透与同调合击",
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 9) },
			{ "type": "baiqian", "pos": Vector2i(3, 11) }
		],
		"enemies": [
			{ "type": "huodou", "pos": Vector2i(16, 9) },
			{ "type": "gudiao", "pos": Vector2i(16, 11) }
		],
		"obstacles": [Vector2i(10, 8), Vector2i(10, 12), Vector2i(9, 10), Vector2i(11, 10)]
	}
	celestial_cycle = "NORMAL"
	init_battlefield_data(practice_data)
	add_log("[color=#38bdf8]=== 开启【天衍演武·沙盒道场】=== [/color]")

func _on_chapter_btn_pressed() -> void:
	is_roguelike_mode = false
	var next_idx = (current_chapter_idx + 1) % CampaignManager.CHAPTERS.size()
	load_chapter(next_idx)

func start_roguelike_run() -> void:
	is_roguelike_mode = true
	roguelike_floor = 1
	load_roguelike_floor(1)

func load_roguelike_floor(floor_num: int) -> void:
	roguelike_floor = floor_num
	var r_data = CampaignManager.generate_roguelike_floor(floor_num)
	celestial_cycle = "DAY" if floor_num == 5 else "NORMAL"
	animate_modulate(Color(1.2, 1.1, 0.85, 1.0) if celestial_cycle == "DAY" else Color.WHITE)

	init_battlefield_data(r_data)
	add_log("[color=#34d399]=== 踏入【五藏山经·随机秘境】第 %d 层 ===[/color]" % floor_num)

func load_chapter(idx: int) -> void:
	is_roguelike_mode = false
	current_chapter_idx = idx
	var ch = CampaignManager.CHAPTERS[idx]
	celestial_cycle = "DAY" if idx == 5 else "NORMAL"
	animate_modulate(Color(1.2, 1.1, 0.85, 1.0) if celestial_cycle == "DAY" else Color.WHITE)

	init_battlefield_data(ch)
	add_log("[color=#ecc981]=== 开启 %s ===[/color]" % ch["title"])

func init_battlefield_data(ch: Dictionary) -> void:
	for u in units:
		u.queue_free()
	units.clear()
	selected_unit = null
	selected_skill = {}
	move_tiles.clear()
	skill_targets.clear()
	modal_panel.visible = false
	if floating_menu:
		floating_menu.visible = false

	grid_manager.init_grid()
	var raw_obstacles = ch.get("obstacles", []).duplicate()
	# 丰富大荒战术障碍物布局 (古剑残碑、赤火晶柱、太阴玄冰刺、幽煞毒藤、玄黄万仞岩)
	var obs_pool = [
		GridManager.TerrainType.SWORD_MONUMENT,
		GridManager.TerrainType.FIRE_PILLAR,
		GridManager.TerrainType.FROST_SPIKE,
		GridManager.TerrainType.THORN_VINES,
		GridManager.TerrainType.STONE_WALL
	]
	
	# 若地图预设障碍物较少，补足战术交锋地貌
	var extra_tactical_pts = [Vector2i(9, 7), Vector2i(10, 13), Vector2i(8, 10), Vector2i(11, 9), Vector2i(10, 5)]
	for ep in extra_tactical_pts:
		if not ep in raw_obstacles and raw_obstacles.size() < 7:
			raw_obstacles.append(ep)

	for i in range(raw_obstacles.size()):
		var obs_pos = raw_obstacles[i]
		var obs_type = obs_pool[i % obs_pool.size()]
		grid_manager.set_terrain(obs_pos, obs_type)
	
	grid_manager.set_terrain(Vector2i(5, 6), GridManager.TerrainType.WATER_SPRING)
	grid_manager.set_terrain(Vector2i(5, 14), GridManager.TerrainType.WATER_SPRING)
	grid_manager.set_terrain(Vector2i(15, 6), GridManager.TerrainType.FIRE_VEIN)
	grid_manager.set_terrain(Vector2i(15, 14), GridManager.TerrainType.FIRE_VEIN)
	grid_manager.set_terrain(Vector2i(9, 9), GridManager.TerrainType.WOOD_GROVE)
	grid_manager.set_terrain(Vector2i(10, 11), GridManager.TerrainType.WOOD_GROVE)

	# 随机挑选本场秘境背景与专属场景增益
	var biome_keys = BIOMES.keys()
	var picked_b = ""
	if ch.has("biome") and BIOMES.has(ch["biome"]):
		picked_b = ch["biome"]
	else:
		picked_b = biome_keys[randi() % biome_keys.size()]
	current_biome = BIOMES[picked_b]
	update_environment_banner()
	add_log("[color=%s]✦ 场景法则展开：%s ｜ %s[/color]" % [current_biome["accent"].to_html(), current_biome["name"], current_biome["buff_desc"]])

	for p_data in ch["players"]:
		spawn_unit(p_data["type"], p_data["pos"], Unit.Team.PLAYER)
	for e_data in ch["enemies"]:
		spawn_unit(e_data["type"], e_data["pos"], Unit.Team.ENEMY)

	current_turn = TurnState.PLAYER_TURN
	round_count = 1
	update_hud()
	update_unit_panel(null)
	queue_redraw()

func spawn_unit(template_id: String, pos: Vector2i, team: Unit.Team) -> Unit:
	var u = Unit.new()
	u.unit_id = template_id
	u.team = team

	if template_id == "lingxu":
		u.unit_name = "凌虚子"
		u.title_name = "太虚剑仙"
		u.realm = "金丹初期"
		u.element = 0 # 金
		u.max_hp = 135
		u.max_qi = 6
		u.attack = 40
		u.defense = 12
		u.move_range = 4
		u.skills = [
			{ "id": "SWORD", "name": "庚金破空剑", "elem": 0, "cost": 0, "range": 2, "scale": 1.0, "knockback": 1, "desc": "御剑飞刺击退1格" },
			{ "id": "SWORDS_AOE", "name": "万剑归宗", "elem": 0, "cost": 3, "range": 3, "scale": 1.75, "knockback": 0, "desc": "十字范围万剑暴击轰炸" }
		]
	elif template_id == "baiqian":
		u.unit_name = "白浅"
		u.title_name = "青丘天狐"
		u.realm = "化灵期"
		u.element = 1 # 木
		u.max_hp = 145
		u.max_qi = 7
		u.attack = 28
		u.defense = 15
		u.move_range = 3
		u.skills = [
			{ "id": "HEAL", "name": "万木逢春", "elem": 1, "cost": 2, "range": 3, "is_heal": true, "heal_amt": 48, "desc": "恢复48点气血并驱散负面" },
			{ "id": "CHARM", "name": "青丘狐魅", "elem": 1, "cost": 1, "range": 2, "scale": 0.85, "knockback": 0, "desc": "木系灵魅，降低目标攻击" }
		]
	elif template_id == "bifang":
		u.unit_name = "毕方"
		u.title_name = "南山火鸟"
		u.realm = "通玄天禽"
		u.element = 3 # 火
		u.max_hp = 115
		u.max_qi = 6
		u.attack = 38
		u.defense = 9
		u.move_range = 3
		u.skills = [
			{ "id": "FIRE", "name": "独足赤羽焰", "elem": 3, "cost": 0, "range": 2, "scale": 1.1, "knockback": 0, "desc": "三昧灵火喷吐" },
			{ "id": "HELLFIRE", "name": "大荒讹火劫", "elem": 3, "cost": 3, "range": 3, "scale": 1.6, "knockback": 0, "desc": "大范围火雨轰炸" }
		]
	elif template_id == "huodou":
		u.unit_name = "祸斗"
		u.title_name = "食火灾犬"
		u.realm = "荒古狂妖"
		u.element = 3 # 火
		u.max_hp = 125
		u.max_qi = 4
		u.attack = 34
		u.defense = 10
		u.move_range = 3
		u.skills = [{ "id": "BITE", "name": "炎魔狂噬", "elem": 3, "cost": 0, "range": 1, "scale": 1.15, "knockback": 0, "desc": "近战烈火撕咬" }]
	elif template_id == "gudiao":
		u.unit_name = "蛊雕"
		u.title_name = "鹿吴巨禽"
		u.realm = "凶戾异兽"
		u.element = 0 # 金
		u.max_hp = 100
		u.max_qi = 4
		u.attack = 38
		u.defense = 7
		u.move_range = 4
		u.skills = [{ "id": "TALON", "name": "穿云铁角刺", "elem": 0, "cost": 0, "range": 1, "scale": 1.3, "knockback": 0, "desc": "俯冲破甲突刺" }]
	elif template_id == "taowu":
		u.unit_name = "梼杌真身"
		u.title_name = "荒古四凶之一"
		u.realm = "凶神破封"
		u.element = 4 # 土
		u.max_hp = 240
		u.max_qi = 6
		u.attack = 38
		u.defense = 22
		u.move_range = 2
		u.skills = [{ "id": "SLAM", "name": "撼地崩裂", "elem": 4, "cost": 1, "range": 2, "scale": 1.6, "knockback": 1, "desc": "巨力震碎地脉" }]
	elif template_id == "xiangliu":
		u.unit_name = "相柳"
		u.title_name = "九首水毒神魔"
		u.realm = "北山水患"
		u.element = 2 # 水
		u.max_hp = 210
		u.max_qi = 6
		u.attack = 36
		u.defense = 16
		u.move_range = 3
		u.skills = [{ "id": "POISON", "name": "九首腐泽蚀魂", "elem": 2, "cost": 1, "range": 3, "scale": 1.35, "knockback": 0, "desc": "腐蚀范围毒沼" }]
	elif template_id == "qiongqi":
		u.unit_name = "穷奇"
		u.title_name = "荒古四凶之二"
		u.realm = "嗜血翼魔"
		u.element = 0 # 金
		u.max_hp = 195
		u.max_qi = 5
		u.attack = 44
		u.defense = 12
		u.move_range = 4
		u.skills = [{ "id": "DIVE", "name": "凶风嗜血扑杀", "elem": 0, "cost": 1, "range": 3, "scale": 1.6, "knockback": 0, "desc": "恶虎破空嗜血撕咬" }]
	elif template_id == "zhujiuyin":
		u.unit_name = "烛九阴"
		u.title_name = "章尾大荒之神"
		u.realm = "至尊天祖"
		u.element = 3 # 火
		u.max_hp = 320
		u.max_qi = 8
		u.attack = 46
		u.defense = 24
		u.move_range = 3
		u.skills = [{ "id": "DAY_NIGHT", "name": "太古睁暝·逆转阴阳", "elem": 3, "cost": 2, "range": 4, "scale": 1.9, "knockback": 0, "desc": "张目为昼闭目为夜" }]

	add_child(u)
	u.set_grid_position(pos, TILE_SIZE, BOARD_ORIGIN)
	u.set_facing("EAST" if team == Unit.Team.PLAYER else "WEST")
	u.sync_base_stats()

	# 配备本命神兵法宝
	if template_id == "lingxu":
		u.equip_weapon("sword_taibai")
	elif template_id == "baiqian":
		u.equip_weapon("silk_nine_tail")
	elif template_id == "bifang":
		u.equip_weapon("zither_flame")
	elif template_id == "taowu":
		u.equip_weapon("seal_fantian")
	elif template_id == "qiongqi":
		u.equip_weapon("spear_chaos")
	elif template_id == "xiangliu":
		u.equip_weapon("halberd_abyss")

	units.append(u)
	return u

func toggle_celestial_cycle() -> void:
	if celestial_cycle == "DAY":
		celestial_cycle = "NIGHT"
		add_log("[color=#38bdf8]【太古睁暝】烛九阴闭目为夜！大荒阴阳逆转，九幽玄夜笼罩！[/color]")
		animate_modulate(Color(0.52, 0.58, 0.88, 1.0))
	else:
		celestial_cycle = "DAY"
		add_log("[color=#facc15]【太古睁暝】烛九阴张目为昼！烈阳极光普照大荒，杀伐暴击大涨！[/color]")
		animate_modulate(Color(1.22, 1.12, 0.88, 1.0))

func animate_modulate(target_color: Color) -> void:
	if day_night_modulate:
		var tween = create_tween()
		tween.tween_property(day_night_modulate, "color", target_color, 0.8)

func spawn_particle_vfx(vfx_packed: PackedScene, pos: Vector2i) -> void:
	if vfx_packed == null:
		return
	var p = vfx_packed.instantiate()
	add_child(p)
	p.position = BOARD_ORIGIN + Vector2(pos.x + 0.5, pos.y + 0.5) * TILE_SIZE
	if p is GPUParticles2D or p is CPUParticles2D:
		p.emitting = true
		get_tree().create_timer(p.lifetime + 0.2).timeout.connect(func(): if is_instance_valid(p): p.queue_free())

## 唤起大荒仙侠国风神通高阶动态法阵与弹道视觉特效
func play_skill_vfx(attacker: Unit, target_pos: Vector2i, skill: Dictionary, aoe_tiles: Array = []) -> void:
	var vfx = SkillVFX.new()
	add_child(vfx)
	var s_world = attacker.position if attacker != null else BOARD_ORIGIN + Vector2(target_pos.x + 0.5, target_pos.y + 0.5) * TILE_SIZE
	var t_world = BOARD_ORIGIN + Vector2(target_pos.x + 0.5, target_pos.y + 0.5) * TILE_SIZE
	var aoe_w: Array[Vector2] = []
	for at in aoe_tiles:
		if at is Vector2i:
			aoe_w.append(BOARD_ORIGIN + Vector2(at.x + 0.5, at.y + 0.5) * TILE_SIZE)
		elif at is Vector2:
			aoe_w.append(at)
	vfx.setup(skill.get("id", ""), skill, s_world, t_world, aoe_w)

func spawn_floating_text(text: String, grid_pos: Vector2i, col: Color = Color("#ecc981")) -> void:
	var label = Label.new()
	label.text = text
	label.add_theme_color_override("font_color", col)
	label.add_theme_font_size_override("font_size", 16)
	label.position = BOARD_ORIGIN + Vector2(grid_pos.x + 0.5, grid_pos.y + 0.2) * TILE_SIZE - Vector2(30, 10)
	label.z_index = 200
	add_child(label)
	
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 32.0, 0.65)
	tween.tween_property(label, "modulate:a", 0.0, 0.65).set_delay(0.2)
	tween.chain().tween_callback(label.queue_free)

## ========================================================================
## 4. 战棋鼠标交互与智能多级取消
## ========================================================================
func _unhandled_input(event: InputEvent) -> void:
	if current_turn != TurnState.PLAYER_TURN or modal_panel.visible:
		return

	if event is InputEventMouseMotion:
		var tile = get_tile_from_mouse(event.position)
		if tile != hovered_tile:
			hovered_tile = tile
			queue_redraw()

	elif event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			var tile = get_tile_from_mouse(event.position)
			if not grid_manager.is_valid(tile):
				return
			handle_click_tile(tile)
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			handle_right_click()

func get_tile_from_mouse(mouse_pos: Vector2) -> Vector2i:
	var local = mouse_pos - BOARD_ORIGIN
	var tx = int(floor(local.x / TILE_SIZE))
	var ty = int(floor(local.y / TILE_SIZE))
	return Vector2i(tx, ty)

func handle_right_click() -> void:
	# 1. 若在技能瞄准蓄力中，退回技能选择
	if not selected_skill.is_empty():
		selected_skill = {}
		skill_targets.clear()
		if selected_unit != null:
			show_floating_action_menu(selected_unit, "SKILLS")
		queue_redraw()
		return

	# 2. 若处于技能二级菜单，退回一级行动菜单 (移动/攻击/防御)
	if floating_submode == "SKILLS" and selected_unit != null:
		show_floating_action_menu(selected_unit, "ACTION")
		return

	# 3. 若正在移动模式 (展示绿格)，取消移动模式重显行动菜单
	if not move_tiles.is_empty() and selected_unit != null:
		move_tiles.clear()
		show_floating_action_menu(selected_unit, "ACTION")
		queue_redraw()
		return

	# 4. 若已移动且未攻击，右键撤销移动回溯原位
	if selected_unit != null and selected_unit.team == Unit.Team.PLAYER and selected_unit.has_moved and not selected_unit.has_acted:
		_on_undo_pressed()
		return

	# 5. 取消选中收起菜单
	if selected_unit != null:
		clear_selection()

func _on_undo_pressed() -> void:
	if selected_unit != null and selected_unit.team == Unit.Team.PLAYER and selected_unit.has_moved and not selected_unit.has_acted:
		selected_unit.undo_move(TILE_SIZE, BOARD_ORIGIN)
		add_log("[color=#cbd5e1]%s 撤销移动，踏星步原位回溯。[/color]" % selected_unit.unit_name)
		move_tiles.clear()
		selected_skill = {}
		skill_targets.clear()
		update_unit_panel(selected_unit)
		show_floating_action_menu(selected_unit, "ACTION")
		queue_redraw()

func handle_click_tile(tile: Vector2i) -> void:
	var clicked_u = get_unit_at(tile)

	# 容差检测：若点击稍高点中了下方角色的头顶立绘
	if clicked_u == null and tile.y + 1 < ROWS:
		var below_u = get_unit_at(tile + Vector2i(0, 1))
		if below_u != null:
			clicked_u = below_u

	# 1. 技能瞄准中
	if not selected_skill.is_empty():
		if tile in skill_targets:
			var is_heal = selected_skill.get("is_heal", false)
			if is_heal:
				if clicked_u == null or clicked_u.team != selected_unit.team:
					add_log("[color=#fca5a5]【施法阻断】此神通需指定我方修仙同盟施展！[/color]")
					return
			else:
				if clicked_u != null and clicked_u.team == selected_unit.team:
					add_log("[color=#fca5a5]【同门相护】不可攻击我方修仙同盟！[/color]")
					return
			execute_player_skill(selected_unit, selected_skill, tile)
		else:
			selected_skill = {}
			skill_targets.clear()
			show_floating_action_menu(selected_unit, "SKILLS")
			queue_redraw()
		return

	# 2. 单位已选中
	if selected_unit != null:
		# 点击移动可达地格
		if tile in move_tiles and not selected_unit.has_moved and not selected_unit.is_moving:
			var occupied: Array[Vector2i] = []
			for ou in units:
				if ou.is_alive and ou != selected_unit: occupied.append(ou.grid_pos)
			var path = grid_manager.find_path(selected_unit.grid_pos, tile, selected_unit.move_range, occupied)
			move_tiles.clear()
			current_turn = TurnState.RESOLVING
			if floating_menu:
				floating_menu.visible = false
			queue_redraw()

			selected_unit.move_along_path(path, TILE_SIZE, BOARD_ORIGIN, func():
				current_turn = TurnState.PLAYER_TURN
				add_log("[color=#86efac]%s 踏星移行至 (%d, %d)。[/color]" % [selected_unit.unit_name, tile.x + 1, tile.y + 1])
				update_unit_panel(selected_unit)
				show_floating_action_menu(selected_unit, "ACTION")
				queue_redraw()
			)
			return

		# 如果处于移动状态中点击了其他地方
		if not move_tiles.is_empty():
			move_tiles.clear()
			if clicked_u != null and clicked_u == selected_unit:
				show_floating_action_menu(selected_unit, "ACTION")
				return
			if clicked_u != null and clicked_u.team == Unit.Team.PLAYER:
				select_unit(clicked_u)
				return
			if clicked_u != null and clicked_u.team == Unit.Team.ENEMY:
				update_unit_panel(clicked_u)
				return
			show_floating_action_menu(selected_unit, "ACTION")
			return

		if clicked_u != null and clicked_u.team == Unit.Team.PLAYER:
			select_unit(clicked_u)
			return

		if clicked_u != null and clicked_u.team == Unit.Team.ENEMY:
			update_unit_panel(clicked_u)
			return

		clear_selection()
		return

	# 3. 初始空闲状态
	if clicked_u != null:
		if clicked_u.team == Unit.Team.PLAYER:
			select_unit(clicked_u)
		else:
			update_unit_panel(clicked_u)

func select_unit(u: Unit) -> void:
	if selected_unit != null:
		selected_unit.is_selected = false
		selected_unit.queue_redraw()

	selected_unit = u
	selected_unit.is_selected = true
	selected_unit.queue_redraw()
	selected_skill = {}
	skill_targets.clear()
	move_tiles.clear()
	action_menu_mode = "ACTION"

	update_unit_panel(u)
	show_floating_action_menu(u, "ACTION")
	queue_redraw()

func clear_selection() -> void:
	if selected_unit != null:
		selected_unit.is_selected = false
		selected_unit.queue_redraw()
		selected_unit = null
	selected_skill = {}
	move_tiles.clear()
	skill_targets.clear()
	if floating_menu:
		floating_menu.visible = false
	reset_skill_inspection()
	update_unit_panel(null)
	queue_redraw()

func select_skill(skill: Dictionary) -> void:
	if selected_unit == null:
		return
	selected_skill = skill
	move_tiles.clear()
	skill_targets.clear()

	var is_heal = skill.get("is_heal", false)
	var max_r = skill.get("range", 2)
	# 秘境场景增益：太古建木木系神通射程 +1
	if current_biome.get("id", "") == "ANCIENT_FOREST" and skill.get("elem", 0) == 1:
		max_r += 1
	for y in range(ROWS):
		for x in range(COLS):
			var pos = Vector2i(x, y)
			var dist = grid_manager.get_distance(selected_unit.grid_pos, pos)
			if dist >= (0 if is_heal else 1) and dist <= max_r:
				skill_targets.append(pos)

	# 核心：选择攻击功法后立刻收起棋盘悬浮菜单，确保视野与攻击点位不被遮挡
	if floating_menu:
		floating_menu.visible = false

	inspect_skill(skill, selected_unit)
	if inspection_state_label:
		inspection_state_label.text = "【⚡ 蓄力锁定中】"
		inspection_state_label.add_theme_color_override("font_color", Color("#4ade80"))
	
	update_action_hub_ui(selected_unit, "TARGETING")
	var sk_name = skill.get("name", "本命神通")
	add_log("[color=#fca5a5]【神通蓄力】%s 运转「%s」，请指点棋盘红芒/光圈选择攻击目标！（右键或点击右侧可取消）[/color]" % [selected_unit.unit_name, sk_name])
	queue_redraw()

func start_move_selection() -> void:
	if selected_unit == null or selected_unit.has_moved or selected_unit.has_acted:
		return
	var occupied: Array[Vector2i] = []
	for ou in units:
		if ou.is_alive and ou != selected_unit:
			occupied.append(ou.grid_pos)
	move_tiles = grid_manager.get_reachable_tiles(selected_unit.grid_pos, selected_unit.move_range, occupied)
	if floating_menu:
		floating_menu.visible = false
	inspect_action("MOVE", selected_unit)
	update_action_hub_ui(selected_unit, "MOVING")
	add_log("[color=#86efac]【步法展开】%s 准备踏星移行，指点棋盘青绿地格！(右键取消)[/color]" % selected_unit.unit_name)
	queue_redraw()

func execute_guard_action() -> void:
	if selected_unit == null or selected_unit.has_acted:
		return
	selected_unit.has_acted = true
	selected_unit.has_moved = true
	selected_unit.play_action("guard", 999.0)
	add_log("[color=#fef08a]%s 凝气御守，吐纳周天，周身六芒护体金罡环绕！[/color]" % selected_unit.unit_name)
	spawn_floating_text("【护体真罡】", selected_unit.grid_pos, Color("#fef08a"))
	if floating_menu:
		floating_menu.visible = false
	update_unit_panel(selected_unit)
	clear_selection()
	check_turn_complete()

func execute_player_skill(attacker: Unit, skill: Dictionary, target_pos: Vector2i) -> void:
	attacker.qi -= skill.get("cost", 0)
	attacker.has_acted = true
	attacker.has_moved = true

	attacker.set_facing("WEST" if target_pos.x < attacker.grid_pos.x else "EAST")

	var is_heal = skill.get("is_heal", false)
	var skill_id = skill.get("id", "")

	var is_aoe_or_ult = skill.get("cost", 0) >= 3 or skill_id in ["SWORDS_AOE", "HELLFIRE", "DAY_NIGHT", "TAOWU_ROAR", "POISON"]
	attacker.play_action("attack2" if is_aoe_or_ult else "attack1", 0.7 if is_aoe_or_ult else 0.5)

	if skill_id == "SWORDS_AOE":
		var aoe_tiles = [target_pos, target_pos + Vector2i.UP, target_pos + Vector2i.DOWN, target_pos + Vector2i.LEFT, target_pos + Vector2i.RIGHT]
		play_skill_vfx(attacker, target_pos, skill, aoe_tiles)
		for at in aoe_tiles:
			var defender = get_unit_at(at)
			if defender != null and defender.team != attacker.team:
				resolve_combat(attacker, defender, skill)
	elif skill_id == "HELLFIRE":
		var aoe_tiles: Array[Vector2i] = []
		for dy in range(-1, 2):
			for dx in range(-1, 2):
				if abs(dx) + abs(dy) <= 2:
					aoe_tiles.append(target_pos + Vector2i(dx, dy))
		play_skill_vfx(attacker, target_pos, skill, aoe_tiles)
		for at in aoe_tiles:
			var defender = get_unit_at(at)
			if defender != null and defender.team != attacker.team:
				resolve_combat(attacker, defender, skill)
	elif skill_id == "POISON":
		var aoe_tiles: Array[Vector2i] = []
		for dy in range(2):
			for dx in range(2):
				aoe_tiles.append(target_pos + Vector2i(dx, dy))
		play_skill_vfx(attacker, target_pos, skill, aoe_tiles)
		for at in aoe_tiles:
			var defender = get_unit_at(at)
			if defender != null and defender.team != attacker.team:
				resolve_combat(attacker, defender, skill)
	elif skill_id == "DAY_NIGHT":
		toggle_celestial_cycle()
		var aoe_tiles = [target_pos, target_pos + Vector2i.UP, target_pos + Vector2i.DOWN, target_pos + Vector2i.LEFT, target_pos + Vector2i.RIGHT]
		play_skill_vfx(attacker, target_pos, skill, aoe_tiles)
		for at in aoe_tiles:
			var defender = get_unit_at(at)
			if defender != null and defender.team != attacker.team:
				resolve_combat(attacker, defender, skill)
	else:
		play_skill_vfx(attacker, target_pos, skill)
		var defender = get_unit_at(target_pos)
		if defender != null:
			if is_heal and defender.team == attacker.team:
				resolve_combat(attacker, defender, skill)
			elif not is_heal and defender.team != attacker.team:
				resolve_combat(attacker, defender, skill)

	clear_selection()
	check_turn_complete()

func resolve_combat(attacker: Unit, defender: Unit, skill: Dictionary) -> void:
	if skill.get("is_heal", false):
		if defender.team != attacker.team:
			return
		var heal_val = skill.get("heal_amt", 40)
		if celestial_cycle == "NIGHT":
			heal_val = int(heal_val * 1.4)
		# 本命神兵·九尾回天绫 治疗真意强化
		if attacker.equipped_weapon.get("id", "") == "SILK_NINE_TAIL":
			heal_val = int(heal_val * 1.30)
		var healed = defender.receive_heal(heal_val)
		spawn_floating_text("+%d 仙露" % healed, defender.grid_pos, Color("#65c27d"))
		add_log("[color=#65c27d]%s 施展【%s】为同盟 %s 恢复了 %d 点气血！[/color]" % [attacker.unit_name, skill["name"], defender.unit_name, healed])
		return

	if defender.team == attacker.team:
		return

	# 大荒四时天象·太阴寒雾【迷雾幻影·完全闪避】判定
	var cur_w_id = current_weather.get("id", "CLEAR")
	if cur_w_id == "FOG" and randf() < 0.20:
		spawn_floating_text("【迷雾闪避】MISS", defender.grid_pos, Color("#94a3b8"))
		add_log("[color=#94a3b8]【天象法则·迷踪幻影】%s 融于太阴寒雾，幻影替身完全闪避了招式！[/color]" % defender.unit_name)
		return

	var elem_mult = CombatResolver.get_element_multiplier(skill.get("elem", 0), defender.element)
	var orient_info = CombatResolver.get_orientation_multiplier(attacker.grid_pos, defender.grid_pos, defender.facing)
	var is_crit = (orient_info["type"] == "BACKSTAB") or (randf() < 0.15)
	
	if celestial_cycle == "DAY":
		is_crit = is_crit or (randf() < 0.3)
		if skill.get("elem", 0) == 0 or skill.get("elem", 0) == 3:
			elem_mult *= 1.25

	# 秘境场景专属法则增益
	var b_id = current_biome.get("id", "")
	var s_elem = skill.get("elem", 0)
	var s_id = skill.get("id", "")

	if b_id == "SWORD_TOMB":
		if s_elem == 0 or s_id in ["SWORD", "SWORDS_AOE", "TALON"]:
			elem_mult *= 1.25
			is_crit = is_crit or (randf() < 0.15)
	elif b_id == "MAGMA_VALLEY":
		if s_elem == 3 or s_id in ["FIRE", "HELLFIRE", "BITE"]:
			elem_mult *= 1.30
	elif b_id == "GLACIAL_ABYSS":
		if is_crit:
			elem_mult *= 0.70
	elif b_id == "KUNLUN_TAIJI":
		if elem_mult > 1.0:
			elem_mult = 1.50
		if orient_info["type"] == "BACKSTAB":
			orient_info["mult"] = 1.60

	# 大荒四时天象法则增益
	if cur_w_id == "LIGHTNING":
		if s_elem == 0:
			elem_mult *= 1.25
	elif cur_w_id == "HEATWAVE":
		if s_elem == 3:
			elem_mult *= 1.35
	elif cur_w_id == "RAIN":
		if s_elem == 3:
			elem_mult *= 0.80

	var has_reso = ResonanceSystem.check_beast_resonance(attacker, units)
	var reso_bonus = 1.25 if has_reso else 1.0

	# 神兵被动：开天乾坤枪无视 30% 守御
	var effective_def = defender.defense
	var atk_w_id = attacker.equipped_weapon.get("id", "").to_lower()
	var def_w_id = defender.equipped_weapon.get("id", "").to_lower()
	if atk_w_id == "spear_chaos":
		effective_def = int(defender.defense * 0.7)

	var dmg = CombatResolver.calculate_damage(attacker.attack, effective_def, skill.get("scale", 1.0), elem_mult * reso_bonus, orient_info["mult"], is_crit)
	
	# 神兵被动：太白青锋剑暴击增伤 30%
	if atk_w_id == "sword_taibai" and is_crit:
		dmg = int(dmg * 1.30)

	# 天气法则：太阴寒雾远距离威力衰减 25%
	var combat_dist = grid_manager.get_distance(attacker.grid_pos, defender.grid_pos)
	if cur_w_id == "FOG" and combat_dist > 2:
		dmg = int(dmg * 0.75)

	# 神兵被动：九尾回天绫 25% 几率减伤 35%
	if def_w_id == "silk_nine_tail" and randf() < 0.25:
		dmg = int(dmg * 0.65)
		spawn_floating_text("【天绫御伤】", defender.grid_pos, Color("#f472b6"))
		add_log("[color=#f472b6]【本命法宝】%s 的「九尾回天绫」幻化狐尾霞光，减免 35%% 伤害！[/color]" % defender.unit_name)

	var skill_id = skill.get("id", "")
	if skill_id == "DIVE" and defender.hp < defender.max_hp * 0.4:
		dmg = int(dmg * 1.5)

	# 攻击者出招突刺动作
	var orig_atk_pos = attacker.position
	var dir = (defender.position - attacker.position).normalized()
	var atk_tween = create_tween()
	atk_tween.tween_property(attacker, "position", orig_atk_pos + dir * 14.0, 0.1)
	atk_tween.tween_property(attacker, "position", orig_atk_pos, 0.15)

	# 受击者受创闪烁与结算
	defender.take_damage(dmg)
	var hit_tween = create_tween()
	hit_tween.tween_property(defender, "modulate", Color(2.5, 0.4, 0.4, 1.0), 0.08)
	hit_tween.tween_property(defender, "modulate", Color.WHITE, 0.18)

	var is_boss_skill = skill_id in ["TAOWU_ROAR", "DIVE", "DAY_NIGHT", "POISON"]
	if is_crit or is_boss_skill:
		var intensity = 10.0 if is_boss_skill else 5.0
		var shake_tween = create_tween()
		var orig_b_pos = position
		shake_tween.tween_property(self, "position", orig_b_pos + Vector2(randf_range(-intensity, intensity), randf_range(-intensity, intensity)), 0.05)
		shake_tween.tween_property(self, "position", orig_b_pos, 0.09)

	var float_col = Color("#ef4444") if (elem_mult > 1.0 or is_crit) else Color("#ecc981")
	var hit_label = "-%d" % dmg
	if is_crit: hit_label = "【暴击】" + hit_label
	if elem_mult > 1.0: hit_label = "【相克】" + hit_label
	spawn_floating_text(hit_label, defender.grid_pos, float_col)

	# 特效播放
	if skill_id in ["BITE", "FIRE", "HELLFIRE"]:
		spawn_particle_vfx(FlameJawVFX, defender.grid_pos)
	elif skill_id in ["TALON"]:
		spawn_particle_vfx(TalonVFX, defender.grid_pos)
	elif skill_id in ["SLAM", "TAOWU_ROAR"]:
		spawn_particle_vfx(EarthFissureVFX, defender.grid_pos)
	elif skill_id in ["DIVE"]:
		spawn_particle_vfx(BloodClawVFX, defender.grid_pos)
	elif skill_id in ["POISON"]:
		spawn_particle_vfx(PoisonVFX, defender.grid_pos)
	elif skill_id in ["DAY_NIGHT"]:
		spawn_particle_vfx(CelestialVFX, defender.grid_pos)
	else:
		spawn_particle_vfx(SlashVFX, defender.grid_pos)

	var log_str = "%s 施展【%s】命中 %s！造成 %d 伤害" % [attacker.unit_name, skill["name"], defender.unit_name, dmg]
	if elem_mult > 1.0: log_str += " [五行相克!]"
	if orient_info["type"] == "BACKSTAB": log_str += " [绝脉背刺!]"
	if has_reso: log_str += " [大荒同调合击!]"
	if skill_id == "DIVE" and not defender.is_alive:
		attacker.qi += 1
		attacker.has_acted = false
		log_str += " 【穷奇嗜血破限再动!】"
	add_log(log_str)

	# 神兵被动：赤羽三昧琴 暴击附加真火灼烧
	if atk_w_id == "zither_flame" and is_crit and defender.is_alive:
		defender.take_damage(18)
		spawn_floating_text("【离火】 -18", defender.grid_pos, Color("#f97316"))
		add_log("[color=#f97316]【神兵战技·焚海离音】赤羽三昧琴暴击引燃三昧离火，追加 18 点真火灼伤！[/color]")

	# 神兵被动：玄冥幽水戈 削弱守御与步法
	if atk_w_id == "halberd_abyss" and defender.is_alive:
		defender.defense = maxi(0, defender.defense - 4)
		defender.move_range = maxi(1, defender.move_range - 1)
		spawn_floating_text("【幽水迟滞】", defender.grid_pos, Color("#38bdf8"))
		add_log("[color=#38bdf8]【神兵战技·玄冥重浪】玄冥幽水戈破甲迟滞，削弱目标 4 点守御与 1 点步法！[/color]")

	# 神兵被动：番天镇岳印 近战反震 20% 伤害
	if def_w_id == "seal_fantian" and combat_dist <= 1 and attacker.is_alive:
		var reflect_dmg = maxi(1, int(dmg * 0.20))
		attacker.take_damage(reflect_dmg)
		spawn_floating_text("【番天反震】 -%d" % reflect_dmg, attacker.grid_pos, Color("#d97706"))
		add_log("[color=#d97706]【神兵战技·番天反震】番天印地脉重力崩山反冲，反弹 %d 点伤害给 %s！[/color]" % [reflect_dmg, attacker.unit_name])

	# 天象法则：紫霄雷暴暴击引动九天引雷连锁轰击周围敌方
	if cur_w_id == "LIGHTNING" and is_crit:
		var targets_hit = 0
		for ou in units:
			if ou.is_alive and ou.team == defender.team and ou != defender:
				if grid_manager.get_distance(defender.grid_pos, ou.grid_pos) <= 1:
					ou.take_damage(20)
					spawn_floating_text("【引雷连锁】 -20", ou.grid_pos, Color("#c084fc"))
					targets_hit += 1
		if targets_hit > 0:
			add_log("[color=#c084fc]【天象法则·九天引雷】紫霄神雷连环掣电，连锁轰击了周围 %d 名敌方！[/color]" % targets_hit)

	# 击退与障碍物撞击连锁机制 (壁击)
	var kb_amount = skill.get("knockback", 0)
	if atk_w_id == "sword_taibai" and kb_amount > 0:
		kb_amount += 1 # 太白青锋剑：击退距离额外+1
	
	if kb_amount > 0 and defender.is_alive:
		var kdx = clampi(defender.grid_pos.x - attacker.grid_pos.x, -1, 1)
		var kdy = clampi(defender.grid_pos.y - attacker.grid_pos.y, -1, 1)
		var nxt = defender.grid_pos + Vector2i(kdx, kdy)
		if not grid_manager.is_valid(nxt) or not grid_manager.is_passable(nxt) or get_unit_at(nxt) != null:
			# 触发障碍物撞击壁击连锁
			var obs_terrain = grid_manager.get_terrain(nxt) if grid_manager.is_valid(nxt) else GridManager.TerrainType.STONE_WALL
			var wall_dmg = int(dmg * 0.35)
			
			match obs_terrain:
				GridManager.TerrainType.SWORD_MONUMENT:
					# 古剑残碑：剑煞二次穿心
					wall_dmg += 22
					play_skill_vfx(null, defender.grid_pos, {"id": "SWORD"})
					spawn_particle_vfx(SlashVFX, defender.grid_pos)
					defender.take_damage(wall_dmg)
					spawn_floating_text("【残碑剑煞】 -%d" % wall_dmg, defender.grid_pos, Color("#38bdf8"))
					add_log("[color=#38bdf8]【战术连锁·残碑剑煞】目标猛烈撞击古剑残碑，残碑万道古剑意共鸣激射！追加造成 -%d 剑煞穿心伤害！[/color]" % wall_dmg)
				GridManager.TerrainType.FIRE_PILLAR:
					# 赤火晶柱：烈焰晶火殉爆
					wall_dmg += 26
					play_skill_vfx(null, defender.grid_pos, {"id": "FIRE"})
					spawn_particle_vfx(FlameJawVFX, defender.grid_pos)
					defender.take_damage(wall_dmg)
					spawn_floating_text("【晶柱殉爆】 -%d" % wall_dmg, defender.grid_pos, Color("#f97316"))
					add_log("[color=#f97316]【战术连锁·晶柱殉爆】目标撞碎赤火晶柱，地脉真火剧烈殉爆！追加造成 -%d 爆燃伤害！[/color]" % wall_dmg)
				GridManager.TerrainType.FROST_SPIKE:
					# 太阴玄冰刺：极寒冻伤并凝滞真元
					wall_dmg += 18
					play_skill_vfx(null, defender.grid_pos, {"id": "TALON"})
					defender.qi = maxi(0, defender.qi - 1)
					defender.take_damage(wall_dmg)
					spawn_floating_text("【玄冰刺骨】 -%d 真元-1" % wall_dmg, defender.grid_pos, Color("#67e8f9"))
					add_log("[color=#67e8f9]【战术连锁·玄冰刺骨】目标猛撞太阴玄冰刺，受 -%d 寒冰伤害，并凝滞扣减 1 点真元！[/color]" % wall_dmg)
				GridManager.TerrainType.THORN_VINES:
					# 幽煞毒荆棘：毒素蔓延与减防
					wall_dmg += 16
					play_skill_vfx(null, defender.grid_pos, {"id": "POISON"})
					defender.defense = maxi(0, defender.defense - 3)
					spawn_particle_vfx(PoisonVFX, defender.grid_pos)
					defender.take_damage(wall_dmg)
					spawn_floating_text("【毒藤噬魂】 -%d" % wall_dmg, defender.grid_pos, Color("#4ade80"))
					add_log("[color=#4ade80]【战术连锁·毒藤噬魂】目标跌入幽煞毒荆棘，毒刺侵蚀削减 3 点守御并造成 -%d 毒伤！[/color]" % wall_dmg)
				_:
					# 玄黄万仞岩与边界
					play_skill_vfx(null, defender.grid_pos, {"id": "SLAM"})
					spawn_particle_vfx(EarthFissureVFX, defender.grid_pos)
					defender.take_damage(wall_dmg)
					spawn_floating_text("【万仞崩裂】 -%d" % wall_dmg, defender.grid_pos, Color("#d4a36a"))
					add_log("目标猛烈撞击玄黄万仞岩，受到二次崩裂伤害 -%d！" % wall_dmg)
		else:
			defender.set_grid_position(nxt, TILE_SIZE, BOARD_ORIGIN)

	check_game_over()

func check_turn_complete() -> void:
	var players = units.filter(func(u): return u.is_alive and u.team == Unit.Team.PLAYER)
	var all_done = players.all(func(u): return u.has_moved and u.has_acted)
	if all_done:
		_on_end_turn_pressed()

func _on_end_turn_pressed() -> void:
	if current_turn != TurnState.PLAYER_TURN:
		return
	current_turn = TurnState.ENEMY_TURN
	clear_selection()
	update_hud()
	add_log("[color=#ef4444]--- 荒古凶兽狂性大发，发起扑杀！ ---[/color]")
	run_enemy_ai()

func run_enemy_ai() -> void:
	var enemies = units.filter(func(u): return u.is_alive and u.team == Unit.Team.ENEMY)
	var players = units.filter(func(u): return u.is_alive and u.team == Unit.Team.PLAYER)

	for e in enemies:
		if not e.is_alive or players.is_empty():
			continue

		await get_tree().create_timer(0.35).timeout

		var target: Unit = players[0]
		var min_d = 999
		for p in players:
			var d = grid_manager.get_distance(e.grid_pos, p.grid_pos)
			if d < min_d:
				min_d = d
				target = p

		if min_d > 1:
			var occupied: Array[Vector2i] = []
			for ou in units:
				if ou.is_alive and ou != e: occupied.append(ou.grid_pos)
			var reachable = grid_manager.get_reachable_tiles(e.grid_pos, e.move_range, occupied)
			var best_tile = e.grid_pos
			var best_sub_d = min_d
			for rt in reachable:
				var rd = grid_manager.get_distance(rt, target.grid_pos)
				if rd < best_sub_d:
					best_sub_d = rd
					best_tile = rt
			if best_tile != e.grid_pos:
				var path = grid_manager.find_path(e.grid_pos, best_tile, e.move_range, occupied)
				var done_flag = [false]
				e.move_along_path(path, TILE_SIZE, BOARD_ORIGIN, func(): done_flag[0] = true)
				while not done_flag[0]:
					await get_tree().process_frame

		if not e.skills.is_empty():
			var sk = e.skills[0]
			var dist = grid_manager.get_distance(e.grid_pos, target.grid_pos)
			if dist <= sk.get("range", 1):
				e.set_facing("WEST" if target.grid_pos.x < e.grid_pos.x else "EAST")
				e.play_action("attack1", 0.6)
				play_skill_vfx(e, target.grid_pos, sk)
				resolve_combat(e, target, sk)
				await get_tree().create_timer(0.4).timeout

	current_turn = TurnState.PLAYER_TURN
	round_count += 1
	for u in units:
		if u.is_alive:
			u.start_turn()

	# 大荒四时天象更迭演变
	weather_turns_left -= 1
	if weather_turns_left <= 0:
		change_weather()
	else:
		update_environment_banner()

	# 天气每候法则结算
	var cur_w_id = current_weather.get("id", "CLEAR")
	if cur_w_id == "RAIN":
		# 灵气仙霖：每候回合结束全体友军自愈+15气血与+1真元
		for pu in units:
			if pu.is_alive and pu.team == Unit.Team.PLAYER:
				var h = pu.receive_heal(15)
				pu.qi = mini(pu.max_qi, pu.qi + 1)
				if h > 0:
					spawn_floating_text("+%d 仙霖甘露" % h, pu.grid_pos, Color("#38bdf8"))
		add_log("[color=#38bdf8]【天象法则·仙霖甘露】大荒降下青霖仙露，修仙同盟自愈 +15 气血并回复 1 点真元！[/color]")
	elif cur_w_id == "HEATWAVE":
		# 烈阳天煞：全员聚气真元+1
		for u in units:
			if u.is_alive:
				u.qi = mini(u.max_qi, u.qi + 1)
		add_log("[color=#f97316]【天象法则·烈阳蒸腾】天地离火翻涌，全员聚气真元 +1！[/color]")

	# 场景增益：太古建木每候回合伊始自愈恢复 12 点气血
	if current_biome.get("id", "") == "ANCIENT_FOREST":
		var regen_count = 0
		for pu in units:
			if pu.is_alive and pu.team == Unit.Team.PLAYER:
				var healed = pu.receive_heal(12)
				if healed > 0:
					spawn_floating_text("+%d 乙木长生" % healed, pu.grid_pos, Color("#86efac"))
					regen_count += 1
		if regen_count > 0:
			add_log("[color=#86efac]【秘境真意·乙木长生】建木神林灵露生机倒灌，修仙同盟自愈恢复 12 点气血！[/color]")

	update_hud()
	add_log("[color=#8effa9]--- 第 %d 候天象交替，灵脉吐纳 (当前天象：%s，剩余 %d 候) ---[/color]" % [round_count, current_weather["name"].substr(0, 4), weather_turns_left])

func check_game_over() -> void:
	var alive_p = units.filter(func(u): return u.is_alive and u.team == Unit.Team.PLAYER)
	var alive_e = units.filter(func(u): return u.is_alive and u.team == Unit.Team.ENEMY)

	if alive_e.is_empty():
		modal_panel.visible = true
		modal_title.text = "道破混沌 · 大荒底定"
		modal_desc.text = "太虚修士与契约神兽肃清了妖潮！"
		modal_btn.text = "前往下一回"
	elif alive_p.is_empty():
		modal_panel.visible = true
		modal_title.text = "道消身陨 · 轮回再起"
		modal_desc.text = "修仙同盟全军溃灭……"
		modal_btn.text = "重聚元神 · 再战"

func _on_modal_btn_pressed() -> void:
	modal_panel.visible = false
	if is_roguelike_mode:
		roguelike_floor += 1
		if roguelike_floor > 5:
			add_log("[color=#ecc981]★ 恭贺道友全通五藏山经！[/color]")
			load_chapter(0)
		else:
			load_roguelike_floor(roguelike_floor)
	else:
		var next_idx = (current_chapter_idx + 1) % CampaignManager.CHAPTERS.size()
		load_chapter(next_idx)

func get_unit_at(pos: Vector2i) -> Unit:
	for u in units:
		if u.is_alive and u.grid_pos == pos:
			return u
	return null

func update_hud() -> void:
	round_label.text = "第 %d 候" % round_count
	if current_turn == TurnState.PLAYER_TURN:
		turn_label.text = "【太虚修士回合】"
		turn_label.add_theme_color_override("font_color", Color("#8effa9"))
		end_turn_btn.disabled = false
	else:
		turn_label.text = "【荒古凶兽回合】"
		turn_label.add_theme_color_override("font_color", Color("#fca5a5"))
		end_turn_btn.disabled = true

func update_unit_panel(u: Unit) -> void:
	if u == null:
		unit_name_label.text = "未选定单位"
		unit_realm_label.text = "---"
		unit_elem_label.text = "---"
		unit_hp_label.text = "气血: 0 / 0"
		unit_qi_label.text = "真元: 0 / 0"
		if hp_progress_bar:
			hp_progress_bar.value = 0
		if qi_progress_bar:
			qi_progress_bar.value = 0
		unit_atk_def_label.text = "攻: - | 防: - | 步: -"
		unit_avatar_rect.texture = null
		if weapon_name_label:
			weapon_name_label.text = "本命神兵：未选定"
		if weapon_stats_label:
			weapon_stats_label.text = "---"
		if weapon_icon_rect:
			weapon_icon_rect.texture = null
		if weapon_switch_btn:
			weapon_switch_btn.visible = false
		update_action_hub_ui(null)
		reset_skill_inspection()
		return

	unit_name_label.text = u.unit_name
	var badge = u.get_action_badge()
	unit_realm_label.text = "%s %s" % [u.realm, badge["text"]]
	unit_realm_label.add_theme_color_override("font_color", badge.get("color", Color("#4ade80")))

	var elem_names = ["金", "木", "水", "火", "土"]
	unit_elem_label.text = "%s行天命" % elem_names[u.element]
	unit_elem_label.add_theme_color_override("font_color", get_element_color(u.element))

	unit_hp_label.text = "气血: %d / %d" % [u.hp, u.max_hp]
	if hp_progress_bar:
		hp_progress_bar.max_value = u.max_hp
		hp_progress_bar.value = u.hp

	unit_qi_label.text = "真元: %d / %d" % [u.qi, u.max_qi]
	if qi_progress_bar:
		qi_progress_bar.max_value = u.max_qi
		qi_progress_bar.value = u.qi

	unit_atk_def_label.text = "攻伐: %d ｜ 守御: %d ｜ 步法: %d" % [u.attack, u.defense, u.move_range]

	# 同步本命神兵专属面板
	if weapon_panel:
		weapon_panel.visible = true
	if u.equipped_weapon.is_empty():
		weapon_name_label.text = "本命神兵：未佩戴"
		weapon_name_label.add_theme_color_override("font_color", Color("#94a3b8"))
		weapon_stats_label.text = "暂无神兵加成"
		weapon_icon_rect.texture = null
		if weapon_switch_btn:
			weapon_switch_btn.visible = (u.team == Unit.Team.PLAYER)
	else:
		var w = u.equipped_weapon
		weapon_name_label.text = "%s %s" % [w.get("emoji", "🗡️"), w.get("name", "神兵")]
		weapon_name_label.add_theme_color_override("font_color", w.get("tier_color", Color("#ecc981")))
		weapon_stats_label.text = "+%d攻 +%d防 %s" % [w.get("atk_bonus", 0), w.get("def_bonus", 0), w.get("passive_name", "")]
		if ResourceLoader.exists(w.get("icon_path", "")):
			weapon_icon_rect.texture = load(w["icon_path"])
		else:
			weapon_icon_rect.texture = null
		if weapon_switch_btn:
			weapon_switch_btn.visible = (u.team == Unit.Team.PLAYER)

	var act_path = "res://assets/sprites/%s_%s.png" % [u.unit_id, u.action_state]
	var idle_path = "res://assets/sprites/%s_idle.png" % u.unit_id
	var portrait_path = "res://assets/images/%s.png" % u.unit_id
	if ResourceLoader.exists(act_path):
		unit_avatar_rect.texture = load(act_path)
	elif ResourceLoader.exists(idle_path):
		unit_avatar_rect.texture = load(idle_path)
	elif ResourceLoader.exists(portrait_path):
		unit_avatar_rect.texture = load(portrait_path)

	update_action_hub_ui(u, floating_submode)

func add_log(msg: String) -> void:
	combat_log.append_text(msg + "\n")

## ========================================================================
## 5. 大荒山海自然战场地貌绘制 (彻底淘汰叉叉圈圈，重构仙山玄岩灵泉)
## ========================================================================
func _draw() -> void:
	var total_w = COLS * TILE_SIZE
	var total_h = ROWS * TILE_SIZE
	var board_rect = Rect2(BOARD_ORIGIN.x, BOARD_ORIGIN.y, total_w, total_h)
	
	# 1. 秘境自然地貌专属底板与水墨质感
	draw_rect(board_rect, current_biome.get("bg_dark", Color("#0d1713")))
	
	# 绘制细微斑驳地质水墨纹理 (无生硬网格，仅有自然山海底色渐变)
	for y in range(ROWS):
		for x in range(COLS):
			var px = BOARD_ORIGIN.x + x * TILE_SIZE
			var py = BOARD_ORIGIN.y + y * TILE_SIZE
			if (x + y) % 2 == 0:
				draw_rect(Rect2(px, py, TILE_SIZE, TILE_SIZE), current_biome.get("bg_tint", Color(0.06, 0.11, 0.09, 0.4)))

	# 绘制秘境专属氛围微光与地脉灵纹
	var b_id = current_biome.get("id", "")
	if b_id == "SWORD_TOMB":
		var sword_seeds = [Vector2i(3, 4), Vector2i(16, 5), Vector2i(7, 16), Vector2i(13, 15), Vector2i(10, 6), Vector2i(6, 12), Vector2i(15, 12)]
		for sp in sword_seeds:
			var sc = BOARD_ORIGIN + Vector2(sp.x + 0.5, sp.y + 0.5) * TILE_SIZE
			draw_line(sc + Vector2(-16, 16), sc + Vector2(16, -16), Color("#7dd3fc", 0.35), 1.6)
			draw_line(sc + Vector2(4, 8), sc + Vector2(8, 4), Color("#fef08a", 0.55), 2.0)
			draw_circle(sc + Vector2(16, -16), 3.0, Color("#38bdf8", 0.6))
	elif b_id == "MAGMA_VALLEY":
		var magma_seeds = [Vector2i(4, 8), Vector2i(8, 4), Vector2i(14, 8), Vector2i(8, 16), Vector2i(12, 12), Vector2i(16, 16)]
		var m_glow = abs(sin(anim_time * 3.5)) * 0.2
		for mp in magma_seeds:
			var mc = BOARD_ORIGIN + Vector2(mp.x + 0.5, mp.y + 0.5) * TILE_SIZE
			draw_circle(mc, 18.0, Color(0.9, 0.2, 0.1, 0.14 + m_glow))
			draw_polyline(PackedVector2Array([mc + Vector2(-18, 5), mc + Vector2(-3, -4), mc + Vector2(10, 8), mc + Vector2(20, -3)]), Color(0.95, 0.4, 0.1, 0.45), 1.8)
	elif b_id == "ANCIENT_FOREST":
		var wood_seeds = [Vector2i(4, 4), Vector2i(15, 5), Vector2i(5, 15), Vector2i(16, 14), Vector2i(8, 8), Vector2i(12, 12), Vector2i(3, 10)]
		for wp in wood_seeds:
			var wc = BOARD_ORIGIN + Vector2(wp.x + 0.5, wp.y + 0.5) * TILE_SIZE
			draw_arc(wc, 15.0, 0, PI * 1.5, 14, Color("#22c55e", 0.3), 1.4)
			draw_circle(wc + Vector2(5, -5), 3.0, Color("#86efac", 0.5))
	elif b_id == "GLACIAL_ABYSS":
		var ice_seeds = [Vector2i(6, 6), Vector2i(14, 6), Vector2i(6, 14), Vector2i(14, 14), Vector2i(10, 4), Vector2i(10, 16)]
		for ip in ice_seeds:
			var ic = BOARD_ORIGIN + Vector2(ip.x + 0.5, ip.y + 0.5) * TILE_SIZE
			draw_line(ic + Vector2(-14, 0), ic + Vector2(14, 0), Color("#38bdf8", 0.35), 1.4)
			draw_line(ic + Vector2(0, -14), ic + Vector2(0, 14), Color("#38bdf8", 0.35), 1.4)
			draw_arc(ic, 14.0, 0, TAU, 18, Color("#67e8f9", 0.25), 1.2)
	elif b_id == "KUNLUN_TAIJI":
		var board_center = BOARD_ORIGIN + Vector2(COLS * TILE_SIZE * 0.5, ROWS * TILE_SIZE * 0.5)
		var tj_r = TILE_SIZE * 3.6
		draw_arc(board_center, tj_r, 0, TAU, 48, Color("#ecc981", 0.22), 1.8)
		draw_arc(board_center, tj_r + 18.0, 0, TAU, 48, Color("#a855f7", 0.18), 1.2)
		draw_circle(board_center + Vector2(0, -tj_r * 0.45), tj_r * 0.14, Color("#ecc981", 0.25))
		draw_circle(board_center + Vector2(0, tj_r * 0.45), tj_r * 0.14, Color("#a855f7", 0.25))

	# 2. 绘制丰富生动的自然山海特殊地质 (立体的玄黄巨岩、碧波天池灵泉、熔岩祝融火脉、葱茏建木古林，1.5倍尺度)
	var s15 = 1.5
	for y in range(ROWS):
		for x in range(COLS):
			var pos = Vector2i(x, y)
			var t_type = grid_manager.get_terrain(pos)
			if t_type == GridManager.TerrainType.PLAIN:
				continue
			var px = BOARD_ORIGIN.x + x * TILE_SIZE
			var py = BOARD_ORIGIN.y + y * TILE_SIZE
			var center = Vector2(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.5)
			
			match t_type:
				GridManager.TerrainType.STONE_WALL:
					# === 玄黄万仞岩 (像素高清贴图 + 立体阴影 + 灵脉金砂) ===
					draw_circle(center + Vector2(2, 14), 18.0, Color(0, 0, 0, 0.45))
					draw_texture_rect(ObsRockTex, Rect2(px, py, TILE_SIZE, TILE_SIZE), false)
					draw_circle(center + Vector2(-6, -4), 2.2, Color("#ecc981", 0.6))

				GridManager.TerrainType.SWORD_MONUMENT:
					# === 古剑残碑 (像素古剑残碑 + 青蓝剑煞光芒 + 浮动剑芒) ===
					draw_circle(center + Vector2(0, 14), 16.0, Color(0, 0, 0, 0.45))
					draw_texture_rect(ObsMonumentTex, Rect2(px, py, TILE_SIZE, TILE_SIZE), false)
					var s_glow = abs(sin(anim_time * 4.0 + (x * 3 + y))) * 0.3
					draw_arc(center, 19.0, 0, TAU, 16, Color("#38bdf8", 0.25 + s_glow), 1.2)
					draw_line(center + Vector2(-12, 12), center + Vector2(12, -14), Color("#7dd3fc", 0.35 + s_glow), 1.4)

				GridManager.TerrainType.FIRE_PILLAR:
					# === 赤火晶柱 (像素炽火晶柱 + 烈焰光晕 + 升腾火星) ===
					draw_circle(center + Vector2(0, 14), 17.0, Color(0, 0, 0, 0.48))
					draw_texture_rect(ObsFirePillarTex, Rect2(px, py, TILE_SIZE, TILE_SIZE), false)
					var f_glow = abs(sin(anim_time * 5.0 + (x + y * 2))) * 0.35
					draw_circle(center, 20.0, Color(0.95, 0.35, 0.1, 0.12 + f_glow))
					var spark_y = fmod(anim_time * 30.0 + x * 10, 24.0)
					draw_circle(center + Vector2(sin(anim_time * 6.0) * 8.0, 10.0 - spark_y), 2.2, Color("#fbbf24", 0.8))

				GridManager.TerrainType.FROST_SPIKE:
					# === 太阴玄冰刺 (像素玄冰刺 + 极寒霜芒 + 冰凌闪光) ===
					draw_circle(center + Vector2(0, 14), 16.0, Color(0, 0, 0, 0.42))
					draw_texture_rect(ObsFrostSpikeTex, Rect2(px, py, TILE_SIZE, TILE_SIZE), false)
					var i_glow = abs(cos(anim_time * 3.5 + (x * 2 + y))) * 0.25
					draw_arc(center, 18.0, 0, TAU, 8, Color("#67e8f9", 0.3 + i_glow), 1.4)
					draw_circle(center + Vector2(4, -8), 2.5, Color("#e0f2fe", 0.85))

				GridManager.TerrainType.THORN_VINES:
					# === 幽煞毒荆棘 (像素毒藤 + 墨绿毒瘴烟尘) ===
					draw_circle(center + Vector2(0, 14), 17.0, Color(0, 0, 0, 0.45))
					draw_texture_rect(ObsThornTex, Rect2(px, py, TILE_SIZE, TILE_SIZE), false)
					var p_glow = abs(sin(anim_time * 2.8 + (x + y))) * 0.22
					draw_circle(center + Vector2(-4, 2), 16.0, Color(0.2, 0.65, 0.3, 0.15 + p_glow))
					draw_circle(center + Vector2(6, -6), 2.4, Color("#86efac", 0.75))
				
				GridManager.TerrainType.WATER_SPRING:
					# === 碧波天池流光仙泉 ===
					draw_circle(center, TILE_SIZE * 0.44, Color("#13364a", 0.6))
					draw_circle(center, TILE_SIZE * 0.38, Color("#0c2b3d", 0.95))
					var pulse = sin(anim_time * 3.0 + (x + y)) * 1.5
					draw_arc(center, TILE_SIZE * 0.28 + pulse, 0, TAU, 18, Color("#38bdf8", 0.85), 1.5)
					draw_arc(center, TILE_SIZE * 0.15, 0, TAU, 12, Color("#7dd3fc", 0.9), 1.2)
					draw_circle(center, 3.0, Color("#e0f2fe"))
				
				GridManager.TerrainType.FIRE_VEIN:
					# === 祝融地火熔岩裂谷 ===
					draw_circle(center, TILE_SIZE * 0.42, Color("#300e09", 0.8))
					var f_p0 = center + Vector2(-11, -7) * s15
					var f_p1 = center + Vector2(-3, -2) * s15
					var f_p2 = center + Vector2(4, -8) * s15
					var f_p3 = center + Vector2(1, 2) * s15
					var f_p4 = center + Vector2(10, 6) * s15
					var f_p5 = center + Vector2(-6, 8) * s15
					draw_polyline(PackedVector2Array([f_p0, f_p1, f_p3, f_p4]), Color("#ef4444"), 2.6)
					draw_polyline(PackedVector2Array([f_p1, f_p2]), Color("#f97316"), 2.2)
					draw_polyline(PackedVector2Array([f_p3, f_p5]), Color("#ea580c"), 2.2)
					draw_line(f_p1, f_p3, Color("#fbbf24"), 1.6)
					var f_pulse = abs(sin(anim_time * 4.0 + (x + y))) * 2.5
					draw_arc(center, TILE_SIZE * 0.35 + f_pulse, 0, TAU, 16, Color("#f97316", 0.5), 1.2)
				
				GridManager.TerrainType.WOOD_GROVE:
					# === 建木苍翠灵林 ===
					draw_circle(center + Vector2(-4, 3) * s15, TILE_SIZE * 0.26, Color("#0d2a1b", 0.95))
					draw_circle(center + Vector2(4, 2) * s15, TILE_SIZE * 0.28, Color("#133b26", 0.95))
					draw_circle(center + Vector2(0, -4) * s15, TILE_SIZE * 0.30, Color("#184c31", 0.95))
					draw_circle(center + Vector2(-2, -5) * s15, TILE_SIZE * 0.18, Color("#22c55e", 0.85))
					draw_circle(center + Vector2(3, -1) * s15, TILE_SIZE * 0.14, Color("#4ade80", 0.75))
					draw_circle(center + Vector2(0, -3) * s15, 2.4, Color("#86efac"))

	# 3. 战场外围秘境专属结界框线
	var border_c = current_biome.get("border", Color("#ecc981"))
	var accent_c = current_biome.get("accent", Color("#263b30"))
	draw_rect(board_rect, accent_c.darkened(0.4), false, 2.4)
	draw_rect(Rect2(BOARD_ORIGIN.x - 3, BOARD_ORIGIN.y - 3, total_w + 6, total_h + 6), border_c.lightened(0.1), false, 1.5)
	var c_len = 22.0
	var corners = [
		Vector2(BOARD_ORIGIN.x - 3, BOARD_ORIGIN.y - 3),
		Vector2(BOARD_ORIGIN.x + total_w + 3, BOARD_ORIGIN.y - 3),
		Vector2(BOARD_ORIGIN.x - 3, BOARD_ORIGIN.y + total_h + 3),
		Vector2(BOARD_ORIGIN.x + total_w + 3, BOARD_ORIGIN.y + total_h + 3)
	]
	draw_line(corners[0], corners[0] + Vector2(c_len, 0), border_c, 2.4)
	draw_line(corners[0], corners[0] + Vector2(0, c_len), border_c, 2.4)
	draw_line(corners[1], corners[1] + Vector2(-c_len, 0), border_c, 2.4)
	draw_line(corners[1], corners[1] + Vector2(0, c_len), border_c, 2.4)
	draw_line(corners[2], corners[2] + Vector2(c_len, 0), border_c, 2.4)
	draw_line(corners[2], corners[2] + Vector2(0, -c_len), border_c, 2.4)
	draw_line(corners[3], corners[3] + Vector2(-c_len, 0), border_c, 2.4)
	draw_line(corners[3], corners[3] + Vector2(0, -c_len), border_c, 2.4)

	# 4. 移动范围柔和流光玉莲圈 (呼吸光效，无方块生硬网格)
	var m_pulse = sin(anim_time * 5.0) * 1.5
	for mt in move_tiles:
		var px = BOARD_ORIGIN.x + mt.x * TILE_SIZE
		var py = BOARD_ORIGIN.y + mt.y * TILE_SIZE
		var center = Vector2(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.5)
		draw_rect(Rect2(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4), Color(0.12, 0.45, 0.28, 0.28))
		draw_arc(center, TILE_SIZE * 0.38 + m_pulse * 0.6, 0, TAU, 20, Color("#34d399", 0.85), 1.4)
		draw_circle(center, 2.2, Color("#86efac", 0.7))

	# 5. 技能瞄准范围指示 (带微光半透色块与呼吸光晕)
	var is_heal_skill = selected_skill.get("is_heal", false) if not selected_skill.is_empty() else false
	var s_pulse = sin(anim_time * 6.0) * 1.5
	for st in skill_targets:
		var px = BOARD_ORIGIN.x + st.x * TILE_SIZE
		var py = BOARD_ORIGIN.y + st.y * TILE_SIZE
		var target_u = get_unit_at(st)
		var center = Vector2(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.5)

		if is_heal_skill:
			var is_ally = target_u != null and target_u.team == Unit.Team.PLAYER
			var bg_col = Color(0.12, 0.45, 0.28, 0.25) if is_ally else Color(0.1, 0.35, 0.22, 0.12)
			draw_rect(Rect2(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4), bg_col)
			var col = Color("#34d399") if is_ally else Color(0.2, 0.6, 0.35, 0.35)
			draw_arc(center, TILE_SIZE * 0.38 + s_pulse * 0.4, 0, TAU, 20, col, 2.0 if is_ally else 0.9)
			if is_ally:
				draw_circle(center, 3.0, Color("#86efac"))
		else:
			var is_enemy = target_u != null and target_u.team == Unit.Team.ENEMY
			var bg_col = Color(0.65, 0.15, 0.15, 0.28) if is_enemy else Color(0.45, 0.12, 0.12, 0.14)
			draw_rect(Rect2(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4), bg_col)
			var col = Color("#f87171") if is_enemy else Color(0.8, 0.25, 0.25, 0.35)
			draw_arc(center, TILE_SIZE * 0.38 + s_pulse * 0.4, 0, TAU, 20, col, 2.0 if is_enemy else 0.9)
			if is_enemy:
				draw_circle(center, 3.0, Color("#fca5a5"))

	# 6. 交互悬停指示
	var is_interactive = (hovered_tile in move_tiles) or (hovered_tile in skill_targets) or (get_unit_at(hovered_tile) != null)
	if is_interactive and grid_manager.is_valid(hovered_tile):
		var hx = BOARD_ORIGIN.x + hovered_tile.x * TILE_SIZE
		var hy = BOARD_ORIGIN.y + hovered_tile.y * TILE_SIZE
		draw_rect(Rect2(hx + 1, hy + 1, TILE_SIZE - 2, TILE_SIZE - 2), Color("#fde047", 0.85), false, 1.5)

	# 7. 大荒四时天象全屏/全棋盘动态视效渲染
	var w_id = current_weather.get("id", "CLEAR")
	if w_id == "LIGHTNING":
		# 紫霄雷暴：闪电折线突发划破虚空
		var l_time = fmod(anim_time, 2.2)
		if l_time < 0.22:
			var lx = BOARD_ORIGIN.x + fmod(anim_time * 337.0, total_w * 0.7) + total_w * 0.15
			var pts = PackedVector2Array([
				Vector2(lx, BOARD_ORIGIN.y),
				Vector2(lx - 18, BOARD_ORIGIN.y + total_h * 0.25),
				Vector2(lx + 14, BOARD_ORIGIN.y + total_h * 0.50),
				Vector2(lx - 22, BOARD_ORIGIN.y + total_h * 0.75),
				Vector2(lx + 8, BOARD_ORIGIN.y + total_h)
			])
			draw_polyline(pts, Color("#c084fc", 0.85), 2.8)
			draw_polyline(pts, Color("#ffffff", 0.95), 1.2)
			draw_circle(pts[2], 12.0, Color("#a855f7", 0.35))
	elif w_id == "RAIN":
		# 灵气仙霖：漫天青色灵雨飘洒与涟漪
		for i in range(36):
			var seed_x = float((i * 73 + 19) % int(total_w))
			var seed_y = float((i * 47 + 31) % int(total_h))
			var rx = BOARD_ORIGIN.x + fmod(seed_x + anim_time * 40.0, total_w)
			var ry = BOARD_ORIGIN.y + fmod(seed_y + anim_time * 320.0, total_h)
			draw_line(Vector2(rx, ry), Vector2(rx - 3, ry + 10), Color("#38bdf8", 0.40), 1.2)
			if fmod(ry, 120.0) < 10.0:
				draw_arc(Vector2(rx - 3, ry + 10), 3.5, 0, TAU, 8, Color("#7dd3fc", 0.35), 0.8)
	elif w_id == "HEATWAVE":
		# 烈阳天煞：地火炽热火星升腾与热浪
		for i in range(28):
			var seed_x = float((i * 89 + 13) % int(total_w))
			var seed_y = float((i * 61 + 29) % int(total_h))
			var hx = BOARD_ORIGIN.x + seed_x + sin(anim_time * 3.0 + i) * 14.0
			var hy = BOARD_ORIGIN.y + fmod(seed_y - anim_time * 70.0 + total_h, total_h)
			draw_circle(Vector2(hx, hy), 2.2, Color("#f97316", 0.65))
			draw_circle(Vector2(hx, hy), 4.5, Color("#fbbf24", 0.20))
	elif w_id == "FOG":
		# 太阴寒雾：弥漫涌动的白雾烟瘴带
		for i in range(5):
			var fy = BOARD_ORIGIN.y + float(i) * (total_h / 5.0) + 40.0 + sin(anim_time * 0.8 + i) * 20.0
			var fx = BOARD_ORIGIN.x + fmod(float(i * 180) + anim_time * 28.0, total_w + 300.0) - 150.0
			draw_circle(Vector2(fx, fy), 80.0, Color("#94a3b8", 0.08))
			draw_circle(Vector2(fx + 60, fy - 15), 65.0, Color("#cbd5e1", 0.06))
	elif w_id == "CLEAR":
		# 天朗气清：金色阳光祥瑞尘辉
		for i in range(12):
			var cx = BOARD_ORIGIN.x + float((i * 137) % int(total_w)) + sin(anim_time * 1.5 + i) * 15.0
			var cy = BOARD_ORIGIN.y + float((i * 93) % int(total_h)) + cos(anim_time * 1.2 + i) * 15.0
			var c_pulse = abs(sin(anim_time * 2.0 + i)) * 0.4
			draw_circle(Vector2(cx, cy), 3.0, Color("#fef08a", 0.25 + c_pulse))
