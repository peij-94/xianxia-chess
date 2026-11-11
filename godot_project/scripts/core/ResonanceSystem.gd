class_name ResonanceSystem
extends RefCounted

## 检查是否触发修士与神兽【大荒同调·羁绊合击】
static func check_beast_resonance(attacker: Unit, all_units: Array[Unit], max_dist: int = 2) -> bool:
	if attacker.team != Unit.Team.PLAYER:
		return false

	# 检查 2 格范围内是否存在其他存活友方灵兽 (白浅/毕方)
	for u in all_units:
		if u.is_alive and u != attacker and u.team == Unit.Team.PLAYER:
			var dist = abs(attacker.grid_pos.x - u.grid_pos.x) + abs(attacker.grid_pos.y - u.grid_pos.y)
			if dist <= max_dist:
				return true
	return false
