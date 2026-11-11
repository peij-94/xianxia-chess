# 《山海问道录·天衍棋局》Godot 4 引擎开发工程指南 (16-Bit 像素重构版)

本项目已全面升级为 **16-Bit 国风仙侠复古像素美学（Pixel Art Xianxia SRPG）**，并与 Web 端 Demo 的多关卡战役与数值系统保持严格一致。

## 一、 美术资源与像素资产索引

- `assets/images/cover.jpg`：16-bit 复古像素风主视觉海报（浮空仙岛与山海异兽对峙）。
- `assets/images/portraits_sheet.jpg`：6 大角色像素头像总图鉴。
- `assets/images/lingxu.png`：太虚剑仙·凌虚子（256x256 像素头像）。
- `assets/images/baiqian.png`：青丘天狐·白浅（256x256 像素头像）。
- `assets/images/bifang.png`：南山神鸟·毕方（256x256 像素头像）。
- `assets/images/huodou.png`：荒古食火犬·祸斗（256x256 像素头像）。
- `assets/images/gudiao.png`：鹿吴凶禽·蛊雕（256x256 像素头像）。
- `assets/images/taowu.png`：荒古四凶·梼杌真身（256x256 像素头像）。
- `assets/images/xiangliu.png`：北山水患·相柳九首巨蛇（256x256 像素头像）。
- `assets/images/qiongqi.png`：荒古四凶·穷奇嗜血翼魔（256x256 像素头像）。
- `assets/images/zhujiuyin.png`：章尾太古古神·烛九阴（256x256 像素头像）。

---

## 二、 核心 GDScript 架构与模块职责

- `scripts/combat/CombatResolver.gd`：五行生克倍率（金克木、木克土、土克水、水克火、火克金增伤 35%）、绝脉背刺（140%必暴击）、侧击与击退撞墙二次崩裂伤害结算。
- `scripts/grid/GridManager.gd`：正交方格棋盘网格、BFS 寻路算法、曼哈顿距离与地脉加成。
- `scripts/entities/Unit.gd`：修士与山海异兽实体类，管理气血、真元吐纳、朝向、行动状态与移动回溯撤销。
- `scripts/core/CampaignManager.gd`：六大山海经主线关卡战役配置 + 五藏山经 Roguelike 动态生成器。
- `scripts/core/MountainMap.gd`：五藏山经 6 阶拓扑分岔舆图生成器（战斗/精英/奇遇/灵泉道场/多宝商行/境主决战）。
- `scripts/core/RoguelikeManager.gd`：五藏山经 Roguelike 主循环、队伍跨战斗血量继承、遗宝词条与自动存盘。
- `scripts/core/PracticeManager.gd`：演武演道沙盒系统（队伍阵容自选、无限真元、纯阳不灭无敌、木桩靶标模式）。
- `scripts/core/CompendiumManager.gd`：山海万灵录图鉴（原典考据、弱点打法、远古遗宝、五行生克道盘）。
- `scripts/core/SaveManager.gd`：云笈天箓存盘系统（活跃肉鸽断点续玩、3个手动归档槽位、首领击破与遗宝收集记录）。
- `scripts/core/ResonanceSystem.gd`：修仙者与契约兽相邻时的【大荒同调·合击技】判定。
- `shaders/InkWashPixel.gdshader`：16-Bit 国风水墨像素着色器，支持边缘墨点消融与像素栅格量化。
- `scenes/vfx/`：GPUParticles2D 粒子特效（飞剑水墨斩裂、相柳水毒腐泽、烛龙阴阳天极极光）。

---

## 三、 Godot 4 像素画工程设置说明

1. **像素纹理过滤**：已在 `project.godot` 中全局开启 `textures/canvas_textures/default_texture_filter=1`（Nearest 最近邻像素采样），确保像素点阵绝对清晰锐利，无模糊。
2. **太古昼夜光影**：通过 `CanvasModulate` 动态渐变实现烛九阴【太古睁暝·逆转阴阳】机制（烈阳白昼增伤、九幽玄夜迷障）。
3. **粒子与着色器**：使用 `GPUParticles2D` 搭配 `InkWashPixel.gdshader` 渲染具有物理飞溅与宣纸晕染质感的东方像素战斗动效。
4. **全套系统与 Web 端互通**：舆图拓扑、战斗公式、图鉴原典与存档格式与 Web 端 Demo 保持 100% 同构，随时可无缝移植体验。


