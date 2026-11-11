class_name GridManager
extends Node

@export var cols: int = 20
@export var rows: int = 20

## 地形与障碍物类型枚举
enum TerrainType {
	PLAIN,          # 寻常平地
	WATER_SPRING,   # 碧波天池流光仙泉 (灵力回元)
	FIRE_VEIN,      # 祝融熔岩地火脉 (火法暴击)
	WOOD_GROVE,     # 太古建木古林 (生机庇护)
	STONE_WALL,     # 玄黄万仞岩峰 (巨石障碍)
	SWORD_MONUMENT, # 通天古剑残碑 (剑气共振障碍)
	FIRE_PILLAR,    # 祝融赤火晶柱 (炽火殉爆障碍)
	FROST_SPIKE,    # 太阴玄冰极刺 (寒霜减速障碍)
	THORN_VINES     # 幽煞剧毒荆棘 (毒煞蚀骨障碍)
}

var terrain_grid: Array = []

func _ready() -> void:
	init_grid()

func init_grid() -> void:
	terrain_grid.clear()
	for y in range(rows):
		var row_data = []
		for x in range(cols):
			row_data.append(TerrainType.PLAIN)
		terrain_grid.append(row_data)

	# 默认险石障碍 (20x20 宏大战场)
	set_terrain(Vector2i(7, 7), TerrainType.STONE_WALL)
	set_terrain(Vector2i(12, 12), TerrainType.STONE_WALL)
	set_terrain(Vector2i(7, 12), TerrainType.STONE_WALL)
	set_terrain(Vector2i(12, 7), TerrainType.STONE_WALL)

func is_valid(pos: Vector2i) -> bool:
	return pos.x >= 0 and pos.x < cols and pos.y >= 0 and pos.y < rows

func set_terrain(pos: Vector2i, type: TerrainType) -> void:
	if is_valid(pos):
		terrain_grid[pos.y][pos.x] = type

func get_terrain(pos: Vector2i) -> TerrainType:
	if is_valid(pos):
		return terrain_grid[pos.y][pos.x]
	return TerrainType.STONE_WALL

func is_obstacle(t: TerrainType) -> bool:
	return t in [TerrainType.STONE_WALL, TerrainType.SWORD_MONUMENT, TerrainType.FIRE_PILLAR, TerrainType.FROST_SPIKE, TerrainType.THORN_VINES]

func is_passable(pos: Vector2i) -> bool:
	return not is_obstacle(get_terrain(pos))

## 曼哈顿距离
func get_distance(a: Vector2i, b: Vector2i) -> int:
	return abs(a.x - b.x) + abs(a.y - b.y)

## BFS 广度优先搜索可移动地格
func get_reachable_tiles(start_pos: Vector2i, max_move: int, occupied_positions: Array[Vector2i]) -> Array[Vector2i]:
	var reachable: Array[Vector2i] = []
	var visited: Dictionary = {} # Vector2i -> cost
	var queue: Array[Dictionary] = [{ "pos": start_pos, "cost": 0 }]
	visited[start_pos] = 0

	var directions = [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]

	while not queue.is_empty():
		var current = queue.pop_front()
		var curr_pos: Vector2i = current["pos"]
		var curr_cost: int = current["cost"]

		for d in directions:
			var nxt: Vector2i = curr_pos + d
			if not is_valid(nxt) or not is_passable(nxt):
				continue
			if nxt in occupied_positions and nxt != start_pos:
				continue

			var new_cost = curr_cost + 1
			if new_cost <= max_move:
				if not visited.has(nxt) or visited[nxt] > new_cost:
					visited[nxt] = new_cost
					reachable.append(nxt)
					queue.append({ "pos": nxt, "cost": new_cost })

	return reachable

## BFS 寻路算法，获取路径网格序列
func find_path(start_pos: Vector2i, end_pos: Vector2i, max_move: int, occupied_positions: Array[Vector2i]) -> Array[Vector2i]:
	if start_pos == end_pos:
		return [start_pos]

	var parent_map: Dictionary = {}
	var cost_map: Dictionary = {}
	var queue: Array[Vector2i] = [start_pos]
	parent_map[start_pos] = start_pos
	cost_map[start_pos] = 0

	var directions = [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]
	var found = false

	while not queue.is_empty():
		var curr = queue.pop_front()
		if curr == end_pos:
			found = true
			break

		var curr_cost = cost_map[curr]
		for d in directions:
			var nxt = curr + d
			if not is_valid(nxt) or not is_passable(nxt):
				continue
			if nxt in occupied_positions and nxt != end_pos and nxt != start_pos:
				continue

			var new_cost = curr_cost + 1
			if new_cost <= max_move:
				if not cost_map.has(nxt) or cost_map[nxt] > new_cost:
					cost_map[nxt] = new_cost
					parent_map[nxt] = curr
					queue.append(nxt)

	if not found and not parent_map.has(end_pos):
		return [start_pos, end_pos]

	var path: Array[Vector2i] = []
	var step = end_pos
	while step != start_pos:
		path.push_front(step)
		if not parent_map.has(step):
			break
		step = parent_map[step]
	path.push_front(start_pos)
	return path
