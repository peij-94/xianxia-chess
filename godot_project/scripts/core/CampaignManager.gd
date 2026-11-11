class_name CampaignManager
extends RefCounted

## 六大山海经主线战役关卡配置 (20x20 宏大战场)
const CHAPTERS: Array[Dictionary] = [
	{
		"id": 1,
		"title": "第一回：青丘之野 · 凶潮初现",
		"desc": "大荒异变，食火恶犬祸斗与凶禽蛊雕侵扰青丘。太虚剑仙与天狐白浅联手御敌！",
		"enemies": [
			{ "type": "huodou", "pos": Vector2i(16, 11) },
			{ "type": "gudiao", "pos": Vector2i(16, 8) }
		],
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 9) },
			{ "type": "baiqian", "pos": Vector2i(3, 11) },
			{ "type": "bifang", "pos": Vector2i(2, 10) }
		],
		"obstacles": [Vector2i(7, 7), Vector2i(7, 13), Vector2i(12, 7), Vector2i(12, 13)],
		"reward_stones": 120
	},
	{
		"id": 2,
		"title": "第二回：章莪之山 · 讹火连天",
		"desc": "章莪山地火脉涌动，凶兽借祝融火灵之势狂暴！善用五行水克火方可破阵。",
		"enemies": [
			{ "type": "huodou", "pos": Vector2i(15, 7) },
			{ "type": "huodou", "pos": Vector2i(16, 12) },
			{ "type": "gudiao", "pos": Vector2i(16, 9) }
		],
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 8) },
			{ "type": "baiqian", "pos": Vector2i(2, 10) },
			{ "type": "bifang", "pos": Vector2i(3, 12) }
		],
		"obstacles": [Vector2i(8, 6), Vector2i(8, 14), Vector2i(11, 8), Vector2i(11, 12)],
		"reward_stones": 200
	},
	{
		"id": 3,
		"title": "第三回：昆仑之渊 · 封魔决战",
		"desc": "荒古四凶之一【梼杌】破印而出！重铠撼地，巨力崩山。修仙同盟背水一战！",
		"enemies": [
			{ "type": "taowu", "pos": Vector2i(16, 10) }, # 梼杌 Boss
			{ "type": "huodou", "pos": Vector2i(15, 6) },
			{ "type": "gudiao", "pos": Vector2i(15, 13) }
		],
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 9) },
			{ "type": "baiqian", "pos": Vector2i(3, 11) },
			{ "type": "bifang", "pos": Vector2i(2, 10) }
		],
		"obstacles": [Vector2i(7, 6), Vector2i(7, 14), Vector2i(12, 7), Vector2i(12, 13)],
		"reward_stones": 360
	},
	{
		"id": 4,
		"title": "第四回：北山大泽 · 相柳毒沼",
		"desc": "共工之臣【相柳】九首盘踞死泽，水毒滔天！腥臭毒雨腐蚀天地生机。",
		"enemies": [
			{ "type": "xiangliu", "pos": Vector2i(16, 10) }, # 相柳 Boss
			{ "type": "gudiao", "pos": Vector2i(15, 7) },
			{ "type": "gudiao", "pos": Vector2i(15, 13) }
		],
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 9) },
			{ "type": "baiqian", "pos": Vector2i(3, 11) },
			{ "type": "bifang", "pos": Vector2i(2, 10) }
		],
		"obstacles": [Vector2i(6, 8), Vector2i(8, 12), Vector2i(11, 7), Vector2i(13, 11)],
		"reward_stones": 450
	},
	{
		"id": 5,
		"title": "第五回：邽山之阴 · 穷奇嗜风",
		"desc": "四凶之二【穷奇】恶虎生双翼，嗜血俯冲诛灭残魂！庚金狂风暴起。",
		"enemies": [
			{ "type": "qiongqi", "pos": Vector2i(16, 10) }, # 穷奇 Boss
			{ "type": "huodou", "pos": Vector2i(15, 7) },
			{ "type": "huodou", "pos": Vector2i(16, 13) }
		],
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 8) },
			{ "type": "baiqian", "pos": Vector2i(2, 10) },
			{ "type": "bifang", "pos": Vector2i(3, 12) }
		],
		"obstacles": [Vector2i(8, 7), Vector2i(8, 13), Vector2i(11, 8), Vector2i(12, 5)],
		"reward_stones": 560
	},
	{
		"id": 6,
		"title": "第六回：章尾之巅 · 烛龙定鼎",
		"desc": "太古至尊神明【烛九阴】张目为昼、闭目为夜！掌控阴阳法则，逆转大荒乾坤！",
		"enemies": [
			{ "type": "zhujiuyin", "pos": Vector2i(16, 10) }, # 烛九阴 至尊Boss
			{ "type": "xiangliu", "pos": Vector2i(15, 6) },  # 相柳
			{ "type": "qiongqi", "pos": Vector2i(15, 13) }   # 穷奇
		],
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 9) },
			{ "type": "baiqian", "pos": Vector2i(3, 11) },
			{ "type": "bifang", "pos": Vector2i(2, 10) }
		],
		"obstacles": [Vector2i(6, 6), Vector2i(6, 14), Vector2i(11, 8), Vector2i(11, 12)],
		"reward_stones": 888
	}
]

## Roguelike 随机秘境关卡动态生成器 (五藏山经)
static func generate_roguelike_floor(floor_num: int) -> Dictionary:
	var boss_types = ["huodou", "taowu", "xiangliu", "qiongqi", "zhujiuyin"]
	var selected_boss = boss_types[clampi(floor_num - 1, 0, boss_types.size() - 1)]
	
	var enemies: Array[Dictionary] = [
		{ "type": selected_boss, "pos": Vector2i(16, 10) }
	]
	
	if floor_num >= 2:
		enemies.append({ "type": "gudiao" if floor_num % 2 == 0 else "huodou", "pos": Vector2i(15, 7) })
	if floor_num >= 4:
		enemies.append({ "type": "xiangliu" if floor_num == 5 else "gudiao", "pos": Vector2i(15, 13) })
		
	var obstacles: Array[Vector2i] = []
	var obs_count = 6 + (floor_num % 4)
	for i in range(obs_count):
		obstacles.append(Vector2i(7 + (i * 2) % 6, 4 + (i * 3) % 12))
		
	return {
		"id": 100 + floor_num,
		"title": "五藏秘境第 %d 层 · 山经潜修" % floor_num,
		"desc": "随机衍化的大荒深处古秘境，灵气与煞气激荡交融。",
		"enemies": enemies,
		"players": [
			{ "type": "lingxu", "pos": Vector2i(3, 9) },
			{ "type": "baiqian", "pos": Vector2i(3, 11) },
			{ "type": "bifang", "pos": Vector2i(2, 10) }
		],
		"obstacles": obstacles,
		"reward_stones": 150 * floor_num
	}
