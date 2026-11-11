# 《山海问道录·天衍棋局》Godot 4 引擎技术实现蓝图

## 一、 Godot 4.x 架构总览与设计原则

为保证从当前 Web Demo 原型到最终 Godot 4 商业级游戏的平滑迁移，底层系统设计遵循**“数据驱动（Data-Driven）”**与**“组合优于继承”**的架构模式。

### 1. 核心技术栈
- **引擎版本**：Godot 4.3+ / 4.4
- **主语言**：GDScript 2.0（静态类型标注，高性能，强契合节点系统）
- **渲染模式**：Forward+ 或 Compatibility（兼顾PC与移动端国风水墨Shader着色器）

---

## 二、 目录结构设计（Godot Project Layout）

```text
res://
├── assets/                  # 美术与音频资源
│   ├── audio/              # 古筝、剑鸣、雷法音效与环境BGM
│   ├── fonts/              # 开源古籍宋体/楷体书法字体
│   ├── shaders/            # 水墨晕染、雾气流动、五行光环Shader
│   ├── sprites/            # 角色Token立绘、地图TileSet、法术贴图
│   └── ui/                 # 卷轴边框、八卦灵盘、玉简材质
├── data/                    # 自定义资源 (Custom Resources)
│   ├── beasts/             # 山海异兽配置 (*.tres)
│   ├── cultivators/        # 修仙者配置 (*.tres)
│   ├── skills/             # 神通法术配置 (*.tres)
│   └── stages/             # 关卡地图与敌人波次配置 (*.tres)
├── scenes/                  # 游戏场景
│   ├── battle/             # 战斗主场景 (Battlefield.tscn)
│   ├── characters/         # 角色单位预制体 (Unit.tscn)
│   ├── effects/            # 飞剑、毕方真火、雷击等法术特效场景
│   └── ui/                 # 战斗HUD、技能悬浮玉简、结算面板
└── scripts/                 # 核心逻辑脚本
    ├── combat/             # 五行生克、伤害结算公式 (CombatResolver.gd)
    ├── core/               # 回合状态机 (TurnManager.gd)、事件总线 (EventBus.gd)
    ├── grid/               # 棋盘网格、BFS可达范围、A*寻路 (GridManager.gd)
    └── resources/          # Resource基类定义 (UnitData.gd, SkillData.gd)
```

---

## 三、 核心系统节点与脚本职责

### 1. 棋盘与寻路（GridManager.gd & TileMapLayer）
- 采用 Godot 4 的 `TileMapLayer` 分层管理：
  - `Layer 0 - Terrain`：地脉类型（平地、水华泉、火元脉等），储存五行环境加成。
  - `Layer 1 - Obstacle`：山石古木，不可通行碰撞层。
  - `Layer 2 - Highlights`：移动可达圈（青光）、攻击范围圈（朱砂红光）。
- 寻路算法：集成 `AStar2D` 与 BFS 广度优先搜索，计算移动消耗并剔除敌方占据格子（ZOC / 阻挡）。

### 2. 单位与数据驱动模型（UnitData.gd & Unit.tscn）
```gdscript
# UnitData.gd
class_name UnitData
extends Resource

@export var unit_name: String
@export var realm: String # 炼气/筑基/金丹
@export var element: int # 0:金 1:木 2:水 3:火 4:土
@export var max_hp: int
@export var max_qi: int
@export var attack: int
@export var defense: int
@export var move_range: int
@export var skills: Array[SkillData]
@export var avatar_texture: Texture2D
```

### 3. 五行结算核心（CombatResolver.gd）
```gdscript
# 五行生克倍率矩阵
const ELEMENT_MULTIPLIER: float = 1.35 # 克制增伤 35%
static func get_element_advantage(attacker_elem: int, defender_elem: int) -> float:
    # 0金 1木 2水 3火 4土
    # 金克木(0->1), 木克土(1->4), 土克水(4->2), 水克火(2->3), 火克金(3->0)
    var counter_map = { 0: 1, 1: 4, 4: 2, 2: 3, 3: 0 }
    if counter_map.get(attacker_elem) == defender_elem:
        return 1.35
    elif counter_map.get(defender_elem) == attacker_elem:
        return 0.75 # 被克受抑
    return 1.0
```

### 4. 回合状态机（TurnManager.gd）
管理明确的状态流转：
1. `PLAYER_SELECT_UNIT`（玩家选择就绪修士/神兽）
2. `PLAYER_SELECT_ACTION`（选择移动、攻击、施展神通）
3. `RESOLVING_ACTION`（播放法术特效、水墨震屏、飘字与碰撞判定）
4. `ENEMY_AI_TURN`（凶兽智能AI计算仇恨、弱点克制集火并执行）
5. `CHECK_VICTORY_DEFEAT`（判定全歼敌酋或我方溃败）

---

## 四、 Web Demo 与 Godot 的代码迁移对应表

| 功能模块 | Web Demo 实现方式 (当前前端工程) | 对应 Godot 4 落地方式 |
| :--- | :--- | :--- |
| **棋盘网格渲染** | HTML5 Canvas 动态水墨网格绘制 | `TileMapLayer` + 自定义水墨Shader |
| **寻路与移动高亮** | BFS 算法（纯数组/队列运算） | `AStar2D` / GDScript BFS 算法库 |
| **法术视效** | Canvas 粒子系统与时间轴曲线动画 | `GPUParticles2D` + `AnimationPlayer` |
| **音效合成** | Web Audio API 动态合成古筝与剑鸣 | Godot AudioStreamPlayer2D + WAV/OGG音频 |
| **单位数据** | JSON / ES6 Object 字典驱动 | Custom `Resource` (`.tres` 文件) |
| **战斗AI** | 启发式评分决策系统（Heuristic AI） | BehaviorTree 插件 或 GDScript 状态机 |
