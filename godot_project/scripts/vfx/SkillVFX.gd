class_name SkillVFX
extends Node2D

## 《山海问道录》全技能仙侠国风高阶粒子与神力法阵特效系统
## 彻底实现与各神通技能描述 100% 严密贴合的纯正修仙视觉表现

var skill_id: String = ""
var skill_data: Dictionary = {}
var start_world: Vector2 = Vector2.ZERO
var target_world: Vector2 = Vector2.ZERO
var aoe_worlds: Array = []
var progress: float = 0.0
var duration: float = 0.5
var rng: RandomNumberGenerator = RandomNumberGenerator.new()

func _init() -> void:
	z_index = 85 # 位于角色之上，UI之下
	rng.randomize()

func setup(p_skill_id: String, p_skill_data: Dictionary, p_start: Vector2, p_target: Vector2, p_aoes: Array = []) -> void:
	skill_id = p_skill_id
	skill_data = p_skill_data
	start_world = p_start
	target_world = p_target
	aoe_worlds = p_aoes
	
	# 根据不同神通定制演武持续时长
	match skill_id:
		"FIRE": duration = 2.4 if OS.get_environment("RECORD_SKILL") == "1" else 0.85 # 毕方独足赤羽焰神火喷涌、后掠尾焰与漫天赤羽
		"SWORDS_AOE": duration = 0.85 # 万剑归宗万剑倾盆与剑气爆震
		"HELLFIRE": duration = 0.80   # 大荒讹火劫天火连环坠落
		"DAY_NIGHT": duration = 0.90  # 烛龙太古睁暝逆转乾坤
		"POISON": duration = 0.75     # 相柳九首腐泽沸腾
		"HEAL": duration = 0.70       # 万木逢春灵草生机升腾
		"CHARM": duration = 0.60      # 青丘狐魅惑神法印
		"SLAM": duration = 0.60       # 梼杌撼地崩裂岩刺冲天
		_: duration = 0.50            # 常规单体神通

	progress = 0.0
	var tween = create_tween()
	tween.tween_property(self, "progress", 1.0, duration)
	tween.tween_callback(queue_free)

func _ready() -> void:
	pass

func _process(_delta: float) -> void:
	queue_redraw()

func _draw() -> void:
	match skill_id:
		"SWORD":
			_draw_sword_pierce()
		"SWORDS_AOE":
			_draw_swords_aoe()
		"HEAL":
			_draw_wood_heal()
		"CHARM":
			_draw_fox_charm()
		"FIRE":
			_draw_flame_spew()
		"HELLFIRE":
			_draw_hellfire_calamity()
		"BITE":
			_draw_flame_bite()
		"TALON":
			_draw_talon_pierce()
		"SLAM", "TAOWU_ROAR":
			_draw_earth_fissure()
		"POISON":
			_draw_poison_swamp()
		"DIVE":
			_draw_blood_claw()
		"DAY_NIGHT":
			_draw_day_night()
		_:
			_draw_generic_slash()

## ========================================================================
## 1. 凌虚子【庚金破空剑】（御剑飞刺穿心，击退1格）
## ========================================================================
func _draw_sword_pierce() -> void:
	var t_fly = clampf(progress / 0.45, 0.0, 1.0)
	var sword_pos = start_world.lerp(target_world, t_fly)
	var dir = (target_world - start_world).normalized()
	if dir.length() < 0.01:
		dir = Vector2.RIGHT
	var perp = Vector2(-dir.y, dir.x)

	# 飞剑弹道阶段：呼啸破空的庚金仙剑剑影与剑气残影
	if t_fly < 1.0:
		_draw_detailed_sword(sword_pos - dir * 18.0, dir, 26.0, 5.5, (1.0 - t_fly) * 0.45)
		_draw_detailed_sword(sword_pos, dir, 32.0, 7.5, 0.98)
	
	# 命中刺穿与剑气爆散阶段
	if progress > 0.35:
		var t_hit = (progress - 0.35) / 0.65
		var alpha = 1.0 - t_hit
		# 贯穿金色巨型十字剑芒
		var s_len = 36.0 * (1.0 + t_hit * 0.6)
		draw_line(target_world - dir * s_len, target_world + dir * s_len, Color(1.0, 1.0, 0.9, alpha), 3.2)
		draw_line(target_world - perp * (s_len * 0.5), target_world + perp * (s_len * 0.5), Color(1.0, 0.85, 0.3, alpha * 0.8), 2.0)
		# 激射的放射状金光剑煞
		for i in range(8):
			var a_rad = float(i) * TAU / 8.0
			var v_dir = Vector2(cos(a_rad), sin(a_rad))
			var p0 = target_world + v_dir * (8.0 + t_hit * 12.0)
			var p1 = target_world + v_dir * (16.0 + t_hit * 32.0)
			draw_line(p0, p1, Color("#fde047", alpha), 1.6)
		# 击退气浪半月环
		draw_arc(target_world + dir * (t_hit * 22.0), 14.0 + t_hit * 18.0, 0, TAU, 16, Color(1.0, 0.9, 0.5, alpha * 0.7), 2.0)

## ========================================================================
## 2. 凌虚子【万剑归宗】（十字范围万剑暴击轰炸）
## ========================================================================
func _draw_swords_aoe() -> void:
	var centers = aoe_worlds.duplicate()
	if not target_world in centers:
		centers.append(target_world)

	# 阶段一：地面万剑八卦阵图流转
	var arr_alpha = clampf(sin(progress * PI), 0.0, 1.0)
	for c in centers:
		var rot = progress * 4.0
		# 八卦外环与灵符
		draw_arc(c, 26.0, 0, TAU, 24, Color(0.95, 0.85, 0.35, arr_alpha * 0.8), 1.8)
		draw_arc(c, 16.0, rot, rot + TAU, 16, Color(1.0, 0.95, 0.65, arr_alpha * 0.6), 1.2)
		# 八角阵纹
		for k in range(4):
			var ka = rot + float(k) * PI * 0.5
			var p_a = c + Vector2(cos(ka), sin(ka)) * 26.0
			var p_b = c + Vector2(cos(ka + PI * 0.5), sin(ka + PI * 0.5)) * 26.0
			draw_line(p_a, p_b, Color(1.0, 0.8, 0.2, arr_alpha * 0.5), 1.2)

	# 阶段二：九天庚金万道剑影呼啸下坠斜插大地 (剑影实体而非光束)
	var sword_count = 22
	for i in range(sword_count):
		# 分配到各个十字受击格
		var c_pos = centers[i % centers.size()]
		# 基于 i 的错落落点
		var x_off = sin(float(i * 37)) * 18.0
		var y_off = cos(float(i * 53)) * 18.0
		var land_pos = c_pos + Vector2(x_off, y_off)

		var fall_start_t = float(i) * 0.022
		var t_local = clampf((progress - fall_start_t) / 0.26, 0.0, 1.0)
		if t_local <= 0.0:
			continue

		var sky_pos = land_pos + Vector2(-65.0, -210.0) # 从左上方高空极速斜插
		var curr_pos = sky_pos.lerp(land_pos, t_local)
		var dir_down = (land_pos - sky_pos).normalized()

		if t_local < 1.0:
			# 1. 绘制后方 2 道半透明破空剑影残影 (剑随影动，剑影重重)
			_draw_detailed_sword(curr_pos - dir_down * 24.0, dir_down, 24.0, 5.5, 0.25)
			_draw_detailed_sword(curr_pos - dir_down * 12.0, dir_down, 27.0, 6.2, 0.50)
			# 2. 绘制主体飞剑剑影 (清晰具有剑尖、双刃、剑脊、护手剑格、剑柄、剑镦)
			_draw_detailed_sword(curr_pos, dir_down, 30.0, 7.0, 0.95)
		else:
			# 3. 落地阶段：仙剑半截没入地面斜插，剑身剑鸣振颤，剑气爆浪
			var post_t = (progress - fall_start_t - 0.26) / 0.35
			if post_t < 1.0:
				var hit_a = 1.0 - post_t
				# 斜插地面的仙剑上半截、护手与剑柄 (带微小剑鸣抖动)
				var jitter = Vector2(sin(progress * 40.0 + i) * 1.0, cos(progress * 40.0 + i) * 1.0) * hit_a
				_draw_grounded_sword(land_pos + jitter, dir_down, 18.0, 6.5, hit_a)
				# 剑气冲击波环
				draw_arc(land_pos, 8.0 + post_t * 22.0, 0, TAU, 16, Color("#fef08a", hit_a * 0.8), 1.5)
				draw_arc(land_pos, 4.0 + post_t * 12.0, 0, TAU, 10, Color(1.0, 1.0, 1.0, hit_a * 0.9), 1.0)

## 绘制具备精细剑形构造的庚金仙剑剑影 (彻底告别光束线条)
func _draw_detailed_sword(center: Vector2, dir: Vector2, blade_len: float, blade_w: float, alpha: float) -> void:
	var perp = Vector2(-dir.y, dir.x)
	var tip = center + dir * (blade_len * 0.5)
	var base = center - dir * (blade_len * 0.5)
	
	# 1. 剑体外围剑煞灵芒虚影
	var aura_poly = PackedVector2Array([
		tip + dir * 4.0,
		tip - dir * 4.0 + perp * (blade_w * 0.75),
		base + perp * (blade_w * 0.6),
		base - perp * (blade_w * 0.6),
		tip - dir * 4.0 - perp * (blade_w * 0.75)
	])
	draw_colored_polygon(aura_poly, Color(0.95, 0.85, 0.3, alpha * 0.32))

	# 2. 剑刃受光阳面 (极亮银金)
	var left_blade = PackedVector2Array([
		tip,
		base,
		base + perp * (blade_w * 0.45),
		tip - dir * 5.0 + perp * (blade_w * 0.5)
	])
	draw_colored_polygon(left_blade, Color(1.0, 0.98, 0.8, alpha * 0.95))

	# 3. 剑刃背光阴面 (沉金庚金色)
	var right_blade = PackedVector2Array([
		tip,
		base,
		base - perp * (blade_w * 0.45),
		tip - dir * 5.0 - perp * (blade_w * 0.5)
	])
	draw_colored_polygon(right_blade, Color(0.85, 0.68, 0.22, alpha * 0.90))

	# 4. 剑脊立体极白锐芒
	draw_line(tip, base, Color.WHITE, 1.4)

	# 5. 横展鎏金飞翼护手 (剑格)
	var guard_w = blade_w * 1.5
	var guard_p0 = base + perp * guard_w
	var guard_p1 = base - perp * guard_w
	draw_line(guard_p0, guard_p1, Color("#fde047", alpha * 0.95), 2.8)
	draw_circle(guard_p0, 1.4, Color.WHITE)
	draw_circle(guard_p1, 1.4, Color.WHITE)

	# 6. 玄铁剑柄与金色剑镦 (剑首)
	var hilt_end = base - dir * 8.0
	draw_line(base, hilt_end, Color("#78350f", alpha * 0.9), 2.2)
	draw_circle(hilt_end, 2.2, Color("#facc15", alpha))

## 绘制插在地面上的残存仙剑剑影
func _draw_grounded_sword(ground_pos: Vector2, dir: Vector2, visible_len: float, blade_w: float, alpha: float) -> void:
	var perp = Vector2(-dir.y, dir.x)
	var base = ground_pos - dir * visible_len
	
	# 地面露出的剑身多边形
	var blade_pts = PackedVector2Array([
		ground_pos + perp * (blade_w * 0.45),
		base + perp * (blade_w * 0.45),
		base - perp * (blade_w * 0.45),
		ground_pos - perp * (blade_w * 0.45)
	])
	draw_colored_polygon(blade_pts, Color(1.0, 0.95, 0.7, alpha * 0.85))
	draw_line(ground_pos, base, Color.WHITE, 1.4)

	# 护手剑格
	var guard_p0 = base + perp * (blade_w * 1.5)
	var guard_p1 = base - perp * (blade_w * 1.5)
	draw_line(guard_p0, guard_p1, Color("#fde047", alpha), 2.6)

	# 剑柄与剑首
	var hilt_end = base - dir * 7.5
	draw_line(base, hilt_end, Color("#78350f", alpha * 0.9), 2.0)
	draw_circle(hilt_end, 2.0, Color("#facc15", alpha))

## ========================================================================
## 3. 白浅【万木逢春】（恢复48点气血并驱散负面）
## ========================================================================
func _draw_wood_heal() -> void:
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)
	
	# 脚下乙木长生灵阵
	var base_r = 28.0 * (0.6 + progress * 0.4)
	draw_arc(target_world, base_r, 0, TAU, 24, Color("#22c55e", alpha * 0.75), 1.8)
	draw_arc(target_world, base_r * 0.6, -progress * 3.0, -progress * 3.0 + TAU, 18, Color("#86efac", alpha * 0.65), 1.2)

	# 螺旋升腾的甘露仙光藤蔓
	for strand in range(3):
		var strand_offset = float(strand) * TAU / 3.0
		var pts = PackedVector2Array()
		for step in range(12):
			var st = float(step) / 12.0
			var angle = strand_offset + st * PI * 3.0 + progress * 4.0
			var r = 16.0 * (1.0 - st * 0.35)
			var h = st * 45.0 + (progress * 25.0)
			pts.append(target_world + Vector2(cos(angle) * r, sin(angle) * (r * 0.4) - h))
		draw_polyline(pts, Color(0.4, 0.95, 0.6, alpha * (0.8 - float(strand) * 0.1)), 2.0)

	# 升腾飘舞的翠绿仙露光粒
	for i in range(14):
		var seed_a = float(i * 47)
		var h_rise = fmod(progress * 65.0 + float(i * 12), 55.0)
		var r_drift = sin(progress * 4.0 + float(i)) * 14.0
		var drop_pos = target_world + Vector2(r_drift, -h_rise)
		var p_a = clampf(sin((h_rise / 55.0) * PI) * alpha, 0.0, 1.0)
		draw_circle(drop_pos, 2.5, Color("#bbf7d0", p_a))
		draw_circle(drop_pos, 4.0, Color("#22c55e", p_a * 0.3))

	# 顶上盛开的翡翠青莲虚影
	var lotus_top = target_world + Vector2(0, -42.0)
	for p_idx in range(6):
		var pa = float(p_idx) * TAU / 6.0
		var p_center = lotus_top + Vector2(cos(pa) * 9.0, sin(pa) * 6.0)
		draw_circle(p_center, 4.5 * alpha, Color(0.3, 0.9, 0.5, alpha * 0.45))
	draw_circle(lotus_top, 4.0, Color("#ffffff", alpha * 0.8))

## ========================================================================
## 4. 白浅【青丘狐魅】（木系灵魅，降低目标攻击）
## ========================================================================
func _draw_fox_charm() -> void:
	# 阶段一：九尾狐火灵珠飞袭 (0.0 -> 0.35)
	if progress < 0.35:
		var t_fly = progress / 0.35
		var orb_pos = start_world.lerp(target_world, t_fly)
		draw_circle(orb_pos, 8.0, Color("#f472b6", 0.9))
		draw_circle(orb_pos, 14.0, Color("#e879f9", 0.4))
		draw_circle(orb_pos, 3.5, Color.WHITE)
		for trail in range(3):
			var tr_pos = orb_pos - (target_world - start_world).normalized() * (float(trail + 1) * 8.0)
			draw_circle(tr_pos, 5.0 - float(trail), Color("#f43f5e", 0.4))
		return

	# 阶段二：魅惑心印绽放与九尾霞光环绕 (0.35 -> 1.0)
	var t_charm = (progress - 0.35) / 0.65
	var alpha = 1.0 - t_charm

	# 敌人头顶惑神心印
	var heart_center = target_world + Vector2(0, -28.0 - t_charm * 10.0)
	var heart_scale = (1.0 + sin(t_charm * PI * 3.0) * 0.25) * 8.0
	var heart_pts = PackedVector2Array()
	for k in range(24):
		var th = float(k) * TAU / 24.0
		var hx = 16.0 * pow(sin(th), 3)
		var hy = -(13.0 * cos(th) - 5.0 * cos(2*th) - 2.0 * cos(3*th) - cos(4*th))
		heart_pts.append(heart_center + Vector2(hx, hy) * (heart_scale / 16.0))
	draw_colored_polygon(heart_pts, Color(0.96, 0.35, 0.65, alpha * 0.85))
	draw_polyline(heart_pts, Color("#fde047", alpha * 0.9), 1.5)

	# 身周缭绕摇曳的狐尾幽火
	for tail in range(4):
		var ta = float(tail) * TAU / 4.0 + progress * 3.0
		var tail_base = target_world + Vector2(cos(ta) * 18.0, sin(ta) * 9.0)
		var tail_tip = target_world + Vector2(cos(ta + 0.6) * 32.0, sin(ta + 0.6) * 16.0 - 15.0)
		draw_line(tail_base, tail_tip, Color("#f472b6", alpha * 0.7), 3.0)
		draw_circle(tail_tip, 3.5, Color("#fb7185", alpha * 0.8))

	# 飘散的惑神桃花瓣
	for petal in range(8):
		var pa = float(petal * 43)
		var pr = (t_charm * 35.0)
		var px = target_world.x + cos(pa + progress * 4.0) * pr
		var py = target_world.y + sin(pa) * 12.0 - t_charm * 25.0
		draw_circle(Vector2(px, py), 2.5, Color("#fda4af", alpha * 0.9))

## ========================================================================
## ========================================================================
## 5. 毕方【独足赤羽焰】（纯正 16-bit 像素三昧真火奔涌 + 呼啸后掠赤羽尾焰 + 翻旋火羽）
## ========================================================================
func _draw_flame_spew() -> void:
	var dir = (target_world - start_world).normalized()
	if dir.length() < 0.01: dir = Vector2.RIGHT
	var perp = Vector2(-dir.y, dir.x)
	var total_dist = start_world.distance_to(target_world)
	var source_pt = start_world + dir * 16.0 # 毕方喙部起喷点

	# 演武进度阶段：
	# 0.00 ~ 0.20: 真火出岫，火龙头急速向目标扑咬
	# 0.20 ~ 0.72: 火龙贯穿全场，持续暴烈喷涌，两侧赤羽尾焰疯狂呼啸翻卷，目标处烈火爆散
	# 0.72 ~ 1.00: 毕方收势，火龙龙身向前奔流推进并散化为漫天旋转火羽与金炽火星
	var head_d = total_dist
	var tail_d = 0.0
	if progress < 0.20:
		head_d = total_dist * (progress / 0.20)
		tail_d = 0.0
	elif progress <= 0.72:
		head_d = total_dist
		tail_d = 0.0
	else:
		head_d = total_dist
		tail_d = total_dist * ((progress - 0.72) / 0.28)

	var active_len = maxf(1.0, head_d - tail_d)
	var alpha_spew = clampf(sin(progress * PI), 0.0, 1.0)
	if progress > 0.85:
		alpha_spew = (1.0 - progress) / 0.15

	# --- 1. 毕方起喷口白炽神焰源核 (Source Ignition Core) ---
	if progress < 0.75:
		var src_a = (1.0 - progress / 0.75) * alpha_spew
		_draw_pixel_block(source_pt, 14.0, Color("#ea580c", src_a * 0.9))
		_draw_pixel_block(source_pt, 9.0, Color("#fef08a", src_a))
		_draw_pixel_block(source_pt, 4.0, Color.WHITE)
		for spk in range(4):
			var sa = float(spk) * TAU / 4.0 + progress * 15.0
			var sp_dir = Vector2(cos(sa), sin(sa))
			_draw_pixel_block(source_pt + sp_dir * 10.0, 3.0, Color("#fde047", src_a))

	# --- 2. 核心火龙喷涌柱与两侧后掠【毕方赤羽尾焰】 ---
	var seg_count = 28
	for i in range(seg_count):
		var frac = float(i) / float(seg_count - 1)
		var seg_d = tail_d + active_len * frac
		if seg_d > head_d or seg_d < tail_d:
			continue
		
		# 火柱躯干上下剧烈翻滚的离火律动波
		var wave_amp = lerpf(3.0, 10.0, frac)
		var wave_y = sin(progress * 38.0 - float(i) * 0.75) * wave_amp
		var c_pt = source_pt + dir * seg_d + perp * wave_y
		var base_size = lerpf(9.0, 24.0, frac)

		# 纯正 16-bit 像素阶梯色阶方块 (由外及内 5 层分阶实心方块)
		_draw_pixel_block(c_pt, base_size + 8.0, Color("#7f1d1d", alpha_spew * 0.40))
		_draw_pixel_block(c_pt, base_size + 4.0, Color("#dc2626", alpha_spew * 0.80))
		_draw_pixel_block(c_pt, base_size * 0.72, Color("#ea580c", alpha_spew * 0.92))
		_draw_pixel_block(c_pt, base_size * 0.48, Color("#f97316", alpha_spew * 0.98))
		_draw_pixel_block(c_pt, base_size * 0.26, Color("#fef08a", alpha_spew))
		_draw_pixel_block(c_pt, base_size * 0.12, Color.WHITE)

		# --- 两侧鲜明后掠的【毕方赤羽尾焰】 (Swept-back Feather Plumes) ---
		# 在火龙身体两侧，沿后掠 135° 与 225° 角度延展出一簇簇羽片状阶梯火焰
		if i % 2 == 0 and i >= 3:
			var plume_len = lerpf(12.0, 34.0, frac) * (0.85 + sin(progress * 30.0 + float(i) * 1.3) * 0.25)
			# 上侧赤羽尾焰 (向后上方倾斜掠起)
			var barb_up = (-dir * 0.65 - perp * 0.75).normalized()
			_draw_pixel_block(c_pt + barb_up * (plume_len * 0.35), 7.0, Color("#ea580c", alpha_spew * 0.90))
			_draw_pixel_block(c_pt + barb_up * (plume_len * 0.65), 5.0, Color("#dc2626", alpha_spew * 0.85))
			_draw_pixel_block(c_pt + barb_up * (plume_len * 0.92), 3.2, Color("#fef08a", alpha_spew * 0.95))
			_draw_pixel_block(c_pt + barb_up * (plume_len * 1.08), 2.0, Color.WHITE)

			# 下侧赤羽尾焰 (向后下方倾斜掠起)
			var barb_down = (-dir * 0.65 + perp * 0.75).normalized()
			_draw_pixel_block(c_pt + barb_down * (plume_len * 0.35), 7.0, Color("#ea580c", alpha_spew * 0.90))
			_draw_pixel_block(c_pt + barb_down * (plume_len * 0.65), 5.0, Color("#dc2626", alpha_spew * 0.85))
			_draw_pixel_block(c_pt + barb_down * (plume_len * 0.92), 3.2, Color("#fef08a", alpha_spew * 0.95))
			_draw_pixel_block(c_pt + barb_down * (plume_len * 1.08), 2.0, Color.WHITE)

	# --- 3. 奔涌火龙/火凤之首 (Leading Dragon/Beast Maw) ---
	if head_d > tail_d + 10.0:
		var head_pt = source_pt + dir * head_d + perp * (sin(progress * 38.0 - 20.0) * 8.0)
		# 龙头核心
		_draw_pixel_block(head_pt, 28.0, Color("#dc2626", alpha_spew * 0.85))
		_draw_pixel_block(head_pt, 18.0, Color("#f97316", alpha_spew * 0.95))
		_draw_pixel_block(head_pt, 10.0, Color("#fef08a", alpha_spew))
		# 纯白龙睛
		var eye_off = -dir * 4.0 - perp * 6.0
		_draw_pixel_block(head_pt + eye_off, 4.0, Color.WHITE)
		_draw_pixel_block(head_pt + eye_off, 6.0, Color("#facc15", alpha_spew * 0.6))
		# 龙头顶部后掠的 3 束赤红羽冠 (Feather Crest)
		for c_idx in range(3):
			var crest_d = -dir * (14.0 + float(c_idx) * 8.0) - perp * (8.0 + float(c_idx) * 5.0)
			_draw_pixel_feather(head_pt + crest_d, dir.angle() + PI + 0.35 - float(c_idx) * 0.15, 1.4, Color("#f87171", alpha_spew))

	# --- 4. 沿途漫天飞舞翻旋的【毕方赤羽】独立像素火羽 (12 枚独立旋转羽翎) ---
	for feather_idx in range(12):
		var u_seed = float(feather_idx * 41)
		var u_prog = fmod(progress * 1.8 + float(feather_idx) * 0.083, 1.0)
		var u_d = total_dist * u_prog
		var u_side = 1.0 if feather_idx % 2 == 0 else -1.0
		var u_sway = sin(progress * 22.0 + u_seed) * 22.0 + (16.0 * u_side)
		var feather_pos = source_pt + dir * u_d + perp * u_sway
		var feather_rot = progress * 14.0 + u_seed
		var f_alpha = sin(u_prog * PI) * alpha_spew
		var f_scale = lerpf(0.9, 1.5, fmod(u_seed, 0.6))
		_draw_pixel_feather(feather_pos, feather_rot, f_scale, Color("#f87171", f_alpha * 0.95))

	# --- 5. 目标受击处的像素三昧火海与赤羽爆裂环 (当火舌触达目标时剧烈爆发) ---
	if progress > 0.18:
		var burst_t = (progress - 0.18) / 0.82
		var b_a = clampf(sin(burst_t * PI), 0.0, 1.0)
		if progress > 0.80:
			b_a = (1.0 - progress) / 0.20

		# 像素烈焰回旋风暴环
		var burst_r = 10.0 + burst_t * 36.0
		for step in range(14):
			var ba = float(step) * TAU / 14.0 + progress * 9.0
			var b_dir = Vector2(cos(ba), sin(ba))
			var p_center = target_world + b_dir * burst_r
			var b_size = maxf(4.0, 14.0 * (1.0 - burst_t * 0.5))
			_draw_pixel_block(p_center, b_size, Color("#f97316", b_a * 0.85))
			_draw_pixel_block(p_center, b_size * 0.5, Color("#fef08a", b_a))
			_draw_pixel_block(p_center, b_size * 0.2, Color.WHITE)

		# 环形放射状激射的毕方赤羽
		for bf in range(8):
			var fa = float(bf) * TAU / 8.0 + progress * 6.0
			var f_pt = target_world + Vector2(cos(fa), sin(fa)) * (burst_r * 1.25)
			_draw_pixel_feather(f_pt, fa + PI * 0.5, 1.35, Color("#fca5a5", b_a * 0.95))

		# 地面灼热熔岩焦土像素裂纹
		_draw_pixel_block(target_world + Vector2(-10, 8), 8.0, Color("#7f1d1d", b_a * 0.75))
		_draw_pixel_block(target_world + Vector2(10, -8), 8.0, Color("#7f1d1d", b_a * 0.75))
		_draw_pixel_block(target_world + Vector2(-6, -10), 6.0, Color("#7f1d1d", b_a * 0.75))
		_draw_pixel_block(target_world + Vector2(6, 10), 6.0, Color("#7f1d1d", b_a * 0.75))
		_draw_pixel_block(target_world, 14.0, Color("#f97316", b_a * 0.90))
		_draw_pixel_block(target_world, 8.0, Color(1.0, 0.95, 0.5, b_a * 0.98))

## 辅助函数：严格对齐 2px 整数网格的纯正像素风实心方块
func _draw_pixel_block(pos: Vector2, size: float, col: Color) -> void:
	var snap_x = round(pos.x / 2.0) * 2.0
	var snap_y = round(pos.y / 2.0) * 2.0
	var snap_s = maxf(2.0, round(size / 2.0) * 2.0)
	draw_rect(Rect2(snap_x - snap_s * 0.5, snap_y - snap_s * 0.5, snap_s, snap_s), col)

## 辅助函数：绘制极具国风神韵的 16-bit 像素火羽 (毕方赤羽，带羽轴、羽腹、羽梢金炽层次)
func _draw_pixel_feather(pos: Vector2, rot: float, scale_f: float, col: Color) -> void:
	var f_dir = Vector2(cos(rot), sin(rot))
	var f_perp = Vector2(-f_dir.y, f_dir.x)
	var step_len = 3.6 * scale_f
	var f_w = 3.2 * scale_f

	# 羽轴核心 (4 节贯穿深赤/金红像素)
	for i in range(4):
		var p_stem = pos + f_dir * (float(i - 1.5) * step_len)
		var stem_c = Color("#dc2626", col.a) if i < 3 else Color("#fef08a", col.a)
		_draw_pixel_block(p_stem, 2.5 * scale_f, stem_c)
		
		# 两侧向后倾斜展开的羽翎阶梯结构
		if i == 1:
			# 最宽羽腹 (内红外金)
			_draw_pixel_block(p_stem + f_perp * f_w, 2.4 * scale_f, Color("#f97316", col.a))
			_draw_pixel_block(p_stem - f_perp * f_w, 2.4 * scale_f, Color("#f97316", col.a))
			_draw_pixel_block(p_stem + f_perp * (f_w + 2.0 * scale_f) - f_dir * (1.5 * scale_f), 1.8 * scale_f, Color("#fbbf24", col.a * 0.9))
			_draw_pixel_block(p_stem - f_perp * (f_w + 2.0 * scale_f) - f_dir * (1.5 * scale_f), 1.8 * scale_f, Color("#fbbf24", col.a * 0.9))
		elif i == 2:
			# 羽梢金炽过渡
			_draw_pixel_block(p_stem + f_perp * (f_w * 0.7), 2.0 * scale_f, Color("#fbbf24", col.a))
			_draw_pixel_block(p_stem - f_perp * (f_w * 0.7), 2.0 * scale_f, Color("#fbbf24", col.a))
		elif i == 0:
			# 羽根暗赤近端
			_draw_pixel_block(p_stem + f_perp * (f_w * 0.5), 2.0 * scale_f, Color("#7f1d1d", col.a * 0.8))
			_draw_pixel_block(p_stem - f_perp * (f_w * 0.5), 2.0 * scale_f, Color("#7f1d1d", col.a * 0.8))

## ========================================================================
## 6. 毕方【大荒讹火劫】（大范围火雨轰炸）
## ========================================================================
func _draw_hellfire_calamity() -> void:
	var centers = aoe_worlds.duplicate()
	if not target_world in centers:
		centers.append(target_world)

	# 地面大荒天劫红莲焦土火纹
	var t_alpha = clampf(sin(progress * PI), 0.0, 1.0)
	for c in centers:
		draw_circle(c, 24.0, Color(0.4, 0.08, 0.04, t_alpha * 0.65))
		draw_arc(c, 22.0, 0, TAU, 18, Color(0.95, 0.45, 0.1, t_alpha * 0.8), 1.8)
		# 熔岩裂缝
		draw_line(c + Vector2(-15, -8), c + Vector2(16, 10), Color("#fbbf24", t_alpha * 0.75), 1.6)
		draw_line(c + Vector2(-10, 12), c + Vector2(12, -12), Color("#f97316", t_alpha * 0.65), 1.4)

	# 漫天天火陨石极速砸落
	var meteor_count = 14
	for m in range(meteor_count):
		var target_c = centers[m % centers.size()]
		var m_off = Vector2(sin(float(m * 31)) * 16.0, cos(float(m * 47)) * 14.0)
		var land_pt = target_c + m_off

		var delay_t = float(m) * 0.035
		var t_m = clampf((progress - delay_t) / 0.22, 0.0, 1.0)
		if t_m <= 0.0: continue

		var sky_pt = land_pt + Vector2(-50.0, -190.0)
		var cur_pt = sky_pt.lerp(land_pt, t_m)
		var m_dir = (land_pt - sky_pt).normalized()

		if t_m < 1.0:
			# 陨石火球与烈火浓烟拖尾
			draw_circle(cur_pt, 7.0, Color(1.0, 0.9, 0.3, 0.95))
			draw_circle(cur_pt, 12.0, Color(0.95, 0.3, 0.05, 0.65))
			draw_line(cur_pt, cur_pt - m_dir * 32.0, Color(0.9, 0.2, 0.05, 0.8), 4.5)
			draw_line(cur_pt, cur_pt - m_dir * 48.0, Color(0.3, 0.1, 0.05, 0.4), 2.5)
		else:
			# 落地冲天爆燃火柱
			var boom_t = (progress - delay_t - 0.22) / 0.35
			if boom_t < 1.0:
				var ba = 1.0 - boom_t
				var col_h = (1.0 - boom_t) * 45.0
				draw_colored_polygon(PackedVector2Array([
					land_pt + Vector2(-12, 0),
					land_pt + Vector2(-6, -col_h),
					land_pt + Vector2(6, -col_h),
					land_pt + Vector2(12, 0)
				]), Color(1.0, 0.6, 0.1, ba * 0.9))
				draw_circle(land_pt, 16.0 + boom_t * 18.0, Color(0.95, 0.15, 0.05, ba * 0.6))

## ========================================================================
## 7. 祸斗【炎魔狂噬】（近战烈火撕咬）
## ========================================================================
func _draw_flame_bite() -> void:
	var t_close = clampf(progress / 0.45, 0.0, 1.0)
	var jaw_dist = lerpf(34.0, 4.0, ease(t_close, 3.0)) # 凶残狂暴咬合
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)

	# 上颚炽烈獠牙 (5 颗向下咬碎的利齿)
	var top_jaw_y = target_world.y - jaw_dist
	for i in range(5):
		var tx = target_world.x + (float(i) - 2.0) * 8.0
		var tooth_pts = PackedVector2Array([
			Vector2(tx - 3.5, top_jaw_y),
			Vector2(tx + 3.5, top_jaw_y),
			Vector2(tx, top_jaw_y + 14.0)
		])
		draw_colored_polygon(tooth_pts, Color(1.0, 0.9, 0.4, alpha))
		draw_line(tooth_pts[0], tooth_pts[2], Color("#ef4444", alpha), 1.2)
		draw_line(tooth_pts[1], tooth_pts[2], Color("#ef4444", alpha), 1.2)

	# 下颚炽烈獠牙 (5 颗向上翻咬的利齿)
	var bot_jaw_y = target_world.y + jaw_dist
	for j in range(5):
		var bx = target_world.x + (float(j) - 2.0) * 8.0
		var b_tooth_pts = PackedVector2Array([
			Vector2(bx - 3.5, bot_jaw_y),
			Vector2(bx + 3.5, bot_jaw_y),
			Vector2(bx, bot_jaw_y - 14.0)
		])
		draw_colored_polygon(b_tooth_pts, Color(1.0, 0.9, 0.4, alpha))
		draw_line(b_tooth_pts[0], b_tooth_pts[2], Color("#ef4444", alpha), 1.2)
		draw_line(b_tooth_pts[1], b_tooth_pts[2], Color("#ef4444", alpha), 1.2)

	# 闭合瞬间剧烈骨肉与真火飞溅
	if t_close > 0.6:
		var burst_t = (t_close - 0.6) / 0.4
		var b_a = 1.0 - burst_t
		draw_circle(target_world, 14.0 + burst_t * 18.0, Color(1.0, 0.3, 0.1, b_a * 0.7))
		draw_line(target_world - Vector2(18, 0), target_world + Vector2(18, 0), Color.WHITE, 2.5)

## ========================================================================
## 8. 蛊雕【穿云铁角刺】（俯冲破甲突刺）
## ========================================================================
func _draw_talon_pierce() -> void:
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)
	var scale_arm = 1.0 + progress * 0.4

	# 双重极寒穿云铁角裂空 X 字斩
	var x_span = 26.0 * scale_arm
	# 第一道斩痕 (左上至右下)
	draw_line(target_world + Vector2(-x_span, -x_span), target_world + Vector2(x_span, x_span), Color.WHITE, 3.2)
	draw_line(target_world + Vector2(-x_span, -x_span), target_world + Vector2(x_span, x_span), Color("#7dd3fc", alpha * 0.8), 6.0)

	# 第二道斩痕 (右上至左下)
	draw_line(target_world + Vector2(x_span, -x_span), target_world + Vector2(-x_span, x_span), Color.WHITE, 3.2)
	draw_line(target_world + Vector2(x_span, -x_span), target_world + Vector2(-x_span, x_span), Color("#facc15", alpha * 0.8), 6.0)

	# 穿透火花四溅
	for spk in range(12):
		var a = float(spk) * TAU / 12.0
		var spk_dir = Vector2(cos(a), sin(a))
		var spk_len = (8.0 + progress * 22.0)
		draw_line(target_world, target_world + spk_dir * spk_len, Color("#fef08a", alpha), 1.4)

## ========================================================================
## 9. 梼杌【撼地崩裂】（巨力震碎地脉，岩刺冲天）
## ========================================================================
func _draw_earth_fissure() -> void:
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)
	
	# 四向曲折撕裂的深渊地脉裂缝
	var fissure_dirs = [Vector2(1, 0.2), Vector2(-1, -0.3), Vector2(0.2, 1), Vector2(-0.3, -1)]
	for fd in fissure_dirs:
		var pts = PackedVector2Array([target_world])
		var curr_f = target_world
		for step in range(4):
			var step_len = 8.0 * (1.0 + progress * 1.5)
			curr_f += fd * step_len + Vector2(sin(step * 4.0) * 5.0, cos(step * 3.0) * 5.0)
			pts.append(curr_f)
		draw_polyline(pts, Color("#78350f", alpha * 0.95), 3.0)
		draw_polyline(pts, Color("#f97316", alpha * 0.75), 1.4)

	# 冲天破土顶出的万仞岩石地刺 (3 根险峰地刺)
	var rock_spikes = [
		Vector2(0, 4), Vector2(-14, -6), Vector2(14, -4)
	]
	for sp in rock_spikes:
		var s_base = target_world + sp
		var s_h = 24.0 * clampf(progress / 0.5, 0.0, 1.0)
		var spike_poly = PackedVector2Array([
			s_base + Vector2(-6, 2),
			s_base + Vector2(6, 2),
			s_base + Vector2(0, -s_h)
		])
		draw_colored_polygon(spike_poly, Color("#44403c", alpha))
		draw_line(s_base + Vector2(0, -s_h), s_base + Vector2(6, 2), Color("#a8a29e", alpha * 0.8), 1.5)

## ========================================================================
## 10. 相柳【九首腐泽蚀魂】（腐蚀范围毒沼，沸腾死泽）
## ========================================================================
func _draw_poison_swamp() -> void:
	var centers = aoe_worlds.duplicate()
	if not target_world in centers:
		centers.append(target_world)

	var alpha = clampf(sin(progress * PI), 0.0, 1.0)

	# 大面积深邃腐泽泥潭
	for c in centers:
		draw_circle(c, 24.0, Color(0.08, 0.25, 0.12, alpha * 0.85))
		draw_arc(c, 22.0, 0, TAU, 18, Color(0.2, 0.65, 0.3, alpha * 0.7), 2.0)
		draw_circle(c, 14.0, Color(0.12, 0.35, 0.18, alpha * 0.9))

	# 沸腾破裂的墨绿毒泡
	for b in range(12):
		var target_c = centers[b % centers.size()]
		var bx = target_c.x + sin(float(b * 67)) * 14.0
		var by = target_c.y + cos(float(b * 41)) * 14.0
		var b_pos = Vector2(bx, by)
		var b_phase = fmod(progress * 4.0 + float(b) * 0.25, 1.0)
		var b_r = 3.0 + b_phase * 5.0
		var b_alpha = (1.0 - b_phase) * alpha
		draw_circle(b_pos, b_r, Color("#86efac", b_alpha * 0.7))
		draw_arc(b_pos, b_r, 0, TAU, 10, Color("#4ade80", b_alpha), 1.2)

	# 缭绕升腾的九首死怨毒雾
	for m in range(6):
		var ma = float(m) * TAU / 6.0 + progress * 2.0
		var mx = target_world.x + cos(ma) * (18.0 + progress * 12.0)
		var my = target_world.y + sin(ma) * (10.0) - progress * 28.0
		draw_circle(Vector2(mx, my), 8.0, Color(0.1, 0.5, 0.2, alpha * 0.35))

## ========================================================================
## 11. 穷奇【凶风嗜血扑杀】（恶虎破空嗜血撕咬）
## ========================================================================
func _draw_blood_claw() -> void:
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)
	var t_slash = progress

	# 三重狂暴嗜血利爪划痕
	var claw_offsets = [-12.0, 0.0, 12.0]
	for idx in range(3):
		var off = claw_offsets[idx]
		var c_start = target_world + Vector2(-26.0 + off, -26.0)
		var c_end = target_world + Vector2(26.0 + off, 26.0)
		var cur_end = c_start.lerp(c_end, clampf(t_slash / 0.4, 0.0, 1.0))
		# 猩红利刃光
		draw_line(c_start, cur_end, Color("#dc2626", alpha), 4.2)
		draw_line(c_start, cur_end, Color.WHITE, 1.6)

	# 溅射的暴戾血煞飞滴
	for drop in range(12):
		var da = float(drop * 29)
		var dist = progress * 32.0
		var d_pos = target_world + Vector2(cos(da) * dist, sin(da) * dist)
		draw_circle(d_pos, 2.5, Color("#b91c1c", alpha * 0.85))

## ========================================================================
## 12. 烛九阴【太古睁暝·逆转阴阳】（张目为昼闭目为夜）
## ========================================================================
func _draw_day_night() -> void:
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)
	var centers = aoe_worlds.duplicate()
	if not target_world in centers: centers.append(target_world)

	# 地面旋转的宏大黑白两仪太极巨阵
	var tj_r = 38.0
	var rot = progress * 6.0
	# 阳鱼与阴鱼
	draw_circle(target_world, tj_r, Color(0.1, 0.1, 0.15, alpha * 0.7))
	draw_arc(target_world, tj_r, rot, rot + PI, 24, Color.WHITE, 2.4)
	draw_arc(target_world, tj_r, rot + PI, rot + TAU, 24, Color("#1e293b", alpha), 2.4)
	
	# 两仪阴阳眼
	var eye_dist = tj_r * 0.5
	var eye1 = target_world + Vector2(cos(rot + PI * 0.5), sin(rot + PI * 0.5)) * eye_dist
	var eye2 = target_world + Vector2(cos(rot - PI * 0.5), sin(rot - PI * 0.5)) * eye_dist
	draw_circle(eye1, 6.0, Color.WHITE)
	draw_circle(eye2, 6.0, Color("#090d16"))

	# 贯穿天地的昼夜极光神柱
	var beam_w = 40.0 * (1.0 - abs(progress - 0.5) * 1.5)
	if beam_w > 0.0:
		draw_line(target_world + Vector2(0, -180), target_world + Vector2(0, 180), Color(1.0, 0.95, 0.7, alpha * 0.8), beam_w)
		draw_line(target_world + Vector2(0, -180), target_world + Vector2(0, 180), Color.WHITE, beam_w * 0.4)

	# 扫过全场的昼夜星河极光波
	draw_arc(target_world, 30.0 + progress * 60.0, 0, TAU, 32, Color("#38bdf8", alpha * 0.6), 2.0)

## ========================================================================
## 13. 通用剑气近战兜底
## ========================================================================
func _draw_generic_slash() -> void:
	var alpha = clampf(sin(progress * PI), 0.0, 1.0)
	var r = 18.0 + progress * 14.0
	draw_arc(target_world, r, -PI * 0.6, PI * 0.6, 16, Color("#ecc981", alpha * 0.8), 2.5)
