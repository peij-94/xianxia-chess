class_name MainMenu
extends Control

## 《山海问道录·天衍棋局》游戏主菜单控制器 (Godot 4 Main Menu Controller)
## 涵盖：肉鸽秘境启程、演武沙盒练习、山海万灵图鉴、云笈天箓存盘管理

@onready var continue_btn: Button = $Margin/HBox/RightCol/VBoxButtons/ContinueBtn
@onready var roguelike_btn: Button = $Margin/HBox/RightCol/VBoxButtons/RoguelikeBtn
@onready var practice_btn: Button = $Margin/HBox/RightCol/VBoxButtons/PracticeBtn
@onready var compendium_btn: Button = $Margin/HBox/RightCol/VBoxButtons/CompendiumBtn
@onready var saves_btn: Button = $Margin/HBox/RightCol/VBoxButtons/SavesBtn
@onready var quit_btn: Button = $Margin/HBox/RightCol/VBoxButtons/QuitBtn
@onready var run_card: PanelContainer = $Margin/HBox/RightCol/ActiveRunCard
@onready var run_info_label: Label = $Margin/HBox/RightCol/ActiveRunCard/VBox/RunInfoLabel

# 弹窗
@onready var compendium_dialog: AcceptDialog = $CompendiumDialog
@onready var compendium_text: RichTextLabel = $CompendiumDialog/ScrollContainer/CompendiumText
@onready var saves_dialog: AcceptDialog = $SavesDialog
@onready var saves_text: RichTextLabel = $SavesDialog/ScrollContainer/SavesText

func _ready() -> void:
	setup_signals()
	check_active_run()
	init_dialog_contents()

func setup_signals() -> void:
	if continue_btn:
		continue_btn.pressed.connect(_on_continue_pressed)
	if roguelike_btn:
		roguelike_btn.pressed.connect(_on_roguelike_pressed)
	if practice_btn:
		practice_btn.pressed.connect(_on_practice_pressed)
	if compendium_btn:
		compendium_btn.pressed.connect(_on_compendium_pressed)
	if saves_btn:
		saves_btn.pressed.connect(_on_saves_pressed)
	if quit_btn:
		quit_btn.pressed.connect(_on_quit_pressed)

func check_active_run() -> void:
	if SaveManager.has_active_run():
		var run = SaveManager.load_active_run()
		if run_card: run_card.visible = true
		if continue_btn: continue_btn.visible = true
		var fl = run.get("current_floor", 1)
		var stones = run.get("spirit_stones", 0)
		if run_info_label:
			run_info_label.text = "✦ 当前秘境潜修中：五藏山经 · 第 %d 层 ｜ 灵石: %d ✦" % [fl, stones]
	else:
		if run_card: run_card.visible = false
		if continue_btn: continue_btn.visible = false

func _on_continue_pressed() -> void:
	Battlefield.launch_mode = "CONTINUE"
	get_tree().change_scene_to_file("res://scenes/Battlefield.tscn")

func _on_roguelike_pressed() -> void:
	Battlefield.launch_mode = "ROGUELIKE"
	get_tree().change_scene_to_file("res://scenes/Battlefield.tscn")

func _on_practice_pressed() -> void:
	Battlefield.launch_mode = "PRACTICE"
	get_tree().change_scene_to_file("res://scenes/Battlefield.tscn")

func _on_compendium_pressed() -> void:
	if compendium_dialog:
		compendium_dialog.popup_centered()

func _on_saves_pressed() -> void:
	refresh_saves_display()
	if saves_dialog:
		saves_dialog.popup_centered()

func _on_quit_pressed() -> void:
	get_tree().quit()

func init_dialog_contents() -> void:
	if compendium_text:
		var txt = "[b][color=#ecc981]=== 《山海万灵录》图鉴精选 ===[/color][/b]\n\n"
		txt += "[b]【修仙同盟】[/b]\n"
		for c in CompendiumManager.get_cultivators():
			txt += "• [color=#a3e635]%s[/color]（%s · %s）\n  [i]%s[/i]\n  %s\n\n" % [c["name"], c["title"], c["realm"], c["origin"], c["tactics"]]
		txt += "[b]【太古凶兽与神魔】[/b]\n"
		for b in CompendiumManager.get_beasts():
			txt += "• [color=#f87171]%s[/color]（%s · %s）\n  [i]%s[/i]\n  %s\n\n" % [b["name"], b["title"], b["realm"], b["origin"], b["tactics"]]
		compendium_text.text = txt

func refresh_saves_display() -> void:
	if saves_text:
		var txt = "[b][color=#93c5fd]=== 云笈天箓 · 秘境封存记录 ===[/color][/b]\n\n"
		var slots = SaveManager.get_slots()
		for i in range(slots.size()):
			var s = slots[i]
			if s != null and s is Dictionary:
				txt += "[b]槽位 %d：[/b] 第 %s 层 ｜ 灵石: %s ｜ 封存时间: %s\n" % [i + 1, s.get("current_floor", 1), s.get("stones", 0), s.get("saved_at", "未知")]
			else:
				txt += "[b]槽位 %d：[/b] [color=#64748b]-- 空置道台 --[/color]\n" % [i + 1]
		txt += "\n[color=#ecc981]（在战局与舆图探索中，随时可在顶部操作栏将当前进度刻印封存至指定槽位）[/color]"
		saves_text.text = txt
