/**
 * 《山海问道录·天衍棋局》16-Bit 角色与山海异兽像素精灵渲染引擎 (Pixel Sprites)
 * 纯手绘逐像素数据矩阵，支持呼吸律动、飞剑悬浮、朝向翻转与受创闪白
 */

class PixelSpriteEngine {
  constructor() {
    this.spriteCache = new Map();
    this.actionSprites = new Map();
    this.initAllSprites();
    this.preloadActionSprites();
  }

  // 预载所有 16-Bit 动作精灵切片 (idle, move, guard, attack1, attack2)
  preloadActionSprites() {
    if (typeof Image === 'undefined') return; // 兼容 Node 测试沙盒

    const characters = [
      'lingxu', 'baiqian', 'bifang', 'huodou', 'gudiao',
      'taowu', 'dangkang', 'xiangliu', 'qiongqi', 'zhujiuyin'
    ];
    const actions = ['idle', 'move', 'guard', 'attack1', 'attack2'];

    characters.forEach(char => {
      actions.forEach(action => {
        const key = `${char}_${action}`;
        const img = new Image();
        img.src = `assets/sprites/${char}_${action}.png`;
        this.actionSprites.set(key, img);
      });
    });
  }

  // 初始化所有角色的离屏 32x32 像素绘制函数
  initAllSprites() {
    // 注册 6 大角色像素绘制器
    this.renderers = {
      lingxu: this.drawLingXuPixel.bind(this),
      baiqian: this.drawBaiQianPixel.bind(this),
      bifang: this.drawBiFangPixel.bind(this),
      huodou: this.drawHuoDouPixel.bind(this),
      gudiao: this.drawGuDiaoPixel.bind(this),
      taowu: this.drawTaoWuPixel.bind(this),
      dangkang: this.drawTaoWuPixel.bind(this),
      xiangliu: this.drawXiangLiuPixel.bind(this),
      qiongqi: this.drawQiongQiPixel.bind(this),
      zhujiuyin: this.drawZhuJiuYinPixel.bind(this)
    };
  }

  // 1. 凌虚子 (太虚剑仙)
  drawLingXuPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 4) * 1.2); // 呼吸沉浮 0~1px

    // --- 悬浮庚金飞剑 (身侧上下浮动) ---
    const swordBob = Math.floor(Math.sin(anim.time * 6) * 2.5);
    const sx = 23;
    const sy = 8 + swordBob;
    R(sx + 1, sy, 2, 10, '#ecc981'); // 剑刃
    R(sx, sy + 1, 4, 8, '#fff4d6');  // 剑心高光
    R(sx - 1, sy + 10, 6, 2, '#8f6826'); // 剑格
    R(sx + 1, sy + 12, 2, 4, '#3d290f'); // 剑柄
    P(sx + 1, sy - 1, '#ffffff');    // 剑尖锐芒

    // --- 剑修身躯 ---
    const y0 = 6 + bob;

    // 发髻与道冠
    R(12, y0, 6, 3, '#1c1b18'); // 黑色发髻
    R(14, y0 - 1, 2, 2, '#e8be6b'); // 纯阳金冠
    P(15, y0 - 2, '#ffffff');

    // 脸部
    R(11, y0 + 3, 8, 7, '#fcd7b6');
    // 发丝侧鬓
    R(10, y0 + 3, 2, 8, '#1c1b18');
    R(18, y0 + 3, 2, 8, '#1c1b18');
    // 剑眉星目
    P(13, y0 + 5, '#1c1b18');
    P(16, y0 + 5, '#1c1b18');
    P(14, y0 + 6, '#28466e'); // 炯炯有神青蓝瞳孔
    P(16, y0 + 6, '#28466e');

    // 白蓝长袍道服
    R(10, y0 + 10, 10, 10, '#eaf2f8'); // 白袍主身
    R(13, y0 + 10, 4, 10, '#3a75a4');  // 藏青中缝道襟
    R(11, y0 + 15, 8, 2, '#ecc981');  // 金丝束腰
    P(15, y0 + 17, '#73e2a7');         // 乾坤灵玉挂饰

    // 衣袖与仙风下摆
    R(8, y0 + 11, 3, 6, '#eaf2f8');
    R(19, y0 + 11, 3, 6, '#eaf2f8');
    // 飘逸下裙
    R(9, y0 + 20, 12, 3, '#d4e3ef');
    R(8, y0 + 22, 14, 2, '#bacddc');

    // 皂靴
    R(11, y0 + 24, 3, 2, '#18242b');
    R(16, y0 + 24, 3, 2, '#18242b');
  }

  // 2. 白浅 (青丘天狐)
  drawBaiQianPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 4) * 1.2);
    const tailWave = Math.floor(Math.sin(anim.time * 3) * 1.8);
    const y0 = 6 + bob;

    // --- 蓬松的九尾仙狐尾巴 (背后扇形摇曳) ---
    // 左尾
    R(4 + tailWave, y0 + 8, 5, 12, '#f8f8fa');
    R(6 + tailWave, y0 + 6, 4, 4, '#fed8df');
    // 右尾
    R(21 - tailWave, y0 + 8, 5, 12, '#f8f8fa');
    R(20 - tailWave, y0 + 6, 4, 4, '#fed8df');
    // 侧尾
    R(2 + tailWave, y0 + 12, 4, 8, '#e6e6f0');
    R(24 - tailWave, y0 + 12, 4, 8, '#e6e6f0');

    // --- 狐耳 ---
    R(10, y0 - 1, 3, 4, '#ffffff');
    P(11, y0, '#fca5b7'); // 耳窝粉红
    R(17, y0 - 1, 3, 4, '#ffffff');
    P(18, y0, '#fca5b7');

    // 白发
    R(9, y0 + 2, 12, 7, '#f4f4f7');
    R(8, y0 + 5, 3, 8, '#e5e5ec');
    R(19, y0 + 5, 3, 8, '#e5e5ec');

    // 仙颜
    R(11, y0 + 4, 8, 6, '#fce4db');
    // 灵魅大眼
    P(12, y0 + 6, '#b03060');
    P(13, y0 + 6, '#d84a78');
    P(16, y0 + 6, '#b03060');
    P(17, y0 + 6, '#d84a78');
    // 腮红
    P(11, y0 + 8, '#fca5b7');
    P(18, y0 + 8, '#fca5b7');

    // 粉白仙裳襦裙
    R(11, y0 + 10, 8, 10, '#ffffff');
    R(12, y0 + 10, 6, 3, '#e85d75'); // 领口红锦
    R(10, y0 + 13, 10, 2, '#48b67b'); // 翠玉腰封
    R(9, y0 + 18, 12, 5, '#fed8df');  // 浅粉下裳

    // 悬浮长生灵木宝珠 (右手侧)
    const orbBob = Math.floor(Math.sin(anim.time * 5) * 2);
    R(22, y0 + 9 + orbBob, 4, 4, '#65c27d');
    P(23, y0 + 10 + orbBob, '#e3ffeb');
  }

  // 3. 毕方 (南山神禽)
  drawBiFangPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 5) * 1.5);
    const wingFlap = Math.floor(Math.sin(anim.time * 8) * 2);
    const y0 = 6 + bob;

    // --- 毕方神火飞羽 (赤红与青蓝交融，大展双翼) ---
    // 左翼
    R(3, y0 + 6 - wingFlap, 7, 10, '#d12e17');
    R(5, y0 + 8 - wingFlap, 5, 6, '#f26829');
    R(6, y0 + 11 - wingFlap, 4, 5, '#2e75b6'); // 青质神羽
    // 右翼
    R(20, y0 + 6 + wingFlap, 8, 10, '#d12e17');
    R(20, y0 + 8 + wingFlap, 6, 6, '#f26829');
    R(20, y0 + 11 + wingFlap, 5, 5, '#2e75b6');

    // 凤羽火冠
    R(14, y0 - 2, 4, 4, '#f59e0b');
    P(15, y0 - 3, '#ef4444');
    P(16, y0 - 4, '#fde047');

    // 神鸟头部
    R(13, y0 + 2, 6, 6, '#dc2626');
    // 白喙
    R(18, y0 + 4, 4, 3, '#f8fafc');
    P(21, y0 + 5, '#cbd5e1');
    // 金红神目
    P(16, y0 + 3, '#fef08a');
    P(15, y0 + 4, '#b91c1c');

    // 躯干
    R(12, y0 + 8, 8, 10, '#b91c1c');
    R(13, y0 + 9, 6, 8, '#f97316'); // 腹部火纹

    // 独足金爪 (山海经名：一足神禽)
    R(15, y0 + 18, 2, 6, '#eab308');
    R(14, y0 + 24, 4, 2, '#ca8a04'); // 金爪抓地

    // 烈焰尾翎
    R(9, y0 + 15, 4, 6, '#ea580c');
    P(8, y0 + 19, '#fde047');
  }

  // 4. 祸斗 (食火黑犬)
  drawHuoDouPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 5) * 1.2);
    const fireFlicker = Math.floor(Math.sin(anim.time * 10) * 1.5);
    const y0 = 7 + bob;

    // 背脊烈焰鬃毛
    R(8, y0 - 1 + fireFlicker, 12, 4, '#f97316');
    R(10, y0 - 3 + fireFlicker, 8, 3, '#ef4444');
    P(13, y0 - 4 + fireFlicker, '#fde047');

    // 犬首
    R(18, y0 + 3, 8, 8, '#1e1b18'); // 漆黑恶犬首
    // 恶耳
    R(17, y0 + 1, 3, 3, '#2a1a18');
    P(18, y0, '#ef4444');
    // 獠牙大口
    R(23, y0 + 7, 5, 4, '#151311');
    P(24, y0 + 8, '#ffffff'); // 白森森犬齿
    P(26, y0 + 9, '#ffffff');
    // 凶戾赤瞳
    P(20, y0 + 4, '#f87171');
    P(21, y0 + 4, '#fde047');

    // 躯干 (黑躯炎纹)
    R(8, y0 + 5, 12, 10, '#1c1917');
    R(10, y0 + 7, 8, 6, '#292524');
    // 烈火裂纹
    P(11, y0 + 8, '#ef4444');
    P(13, y0 + 9, '#f97316');
    P(15, y0 + 8, '#fde047');

    // 四肢 (健硕狼爪)
    R(8, y0 + 15, 3, 8, '#181614');
    R(12, y0 + 15, 3, 8, '#181614');
    R(16, y0 + 15, 3, 8, '#181614');
    R(20, y0 + 15, 3, 8, '#181614');
    // 蹄下踏火
    P(8, y0 + 22, '#f97316');
    P(13, y0 + 22, '#f97316');
    P(21, y0 + 22, '#f97316');

    // 尾部烈焰狼尾
    R(4, y0 + 4, 5, 6, '#1c1917');
    R(2, y0 + 2, 4, 4, '#f97316');
    P(1, y0 + 1, '#fde047');
  }

  // 5. 蛊雕 (鹿吴异禽)
  drawGuDiaoPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 4.5) * 1.5);
    const y0 = 6 + bob;

    // 头顶独角 (山海经：状如雕而有角)
    R(13, y0 - 3, 3, 4, '#b45309');
    P(14, y0 - 4, '#d97706');
    P(15, y0 - 5, '#f59e0b');

    // 雕首
    R(12, y0 + 1, 8, 7, '#451a03');
    // 弯钩利喙
    R(18, y0 + 3, 5, 4, '#d97706');
    R(20, y0 + 6, 2, 3, '#b45309'); // 钩喙尖端
    // 鹰眼
    P(15, y0 + 3, '#fde047');
    P(16, y0 + 4, '#0f172a');

    // 苍鹰铁羽大翼
    R(4, y0 + 7, 8, 12, '#3f2e20');
    R(18, y0 + 7, 8, 12, '#3f2e20');
    // 羽缘高光
    R(5, y0 + 16, 6, 3, '#785b3a');
    R(19, y0 + 16, 6, 3, '#785b3a');

    // 雄伟腹部
    R(11, y0 + 8, 9, 10, '#59412d');
    R(12, y0 + 9, 7, 7, '#785b3a');

    // 锐利钢爪
    R(11, y0 + 18, 3, 6, '#b45309');
    R(16, y0 + 18, 3, 6, '#b45309');
    R(10, y0 + 23, 5, 2, '#78350f');
    R(15, y0 + 23, 5, 2, '#78350f');
  }

  // 6. 梼杌 (荒古巨兽Boss)
  drawTaoWuPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 3) * 1.0);
    const y0 = 4 + bob;

    // --- 荒古四凶之梼杌：厚重岩石巨角与巨兽体魄 ---
    // 巨岩霸角 (左角与右角)
    R(6, y0 - 1, 4, 5, '#57534e');
    R(4, y0 - 3, 3, 3, '#78716c');
    R(21, y0 - 1, 4, 5, '#57534e');
    R(24, y0 - 3, 3, 3, '#78716c');

    // 巨兽头颅
    R(9, y0 + 3, 13, 10, '#292524');
    // 厚重岩盔
    R(10, y0 + 2, 11, 4, '#44403c');
    P(15, y0 + 3, '#ef4444'); // 凶煞符印

    // 凶残赤瞳
    R(11, y0 + 6, 2, 2, '#ef4444');
    P(12, y0 + 6, '#fde047');
    R(18, y0 + 6, 2, 2, '#ef4444');
    P(18, y0 + 6, '#fde047');

    // 巨大外翻野猪獠牙 (山海经：状如虎而犬毛，口生猪牙)
    R(8, y0 + 11, 3, 6, '#f5f5f4');
    P(8, y0 + 10, '#ffffff');
    R(20, y0 + 11, 3, 6, '#f5f5f4');
    P(22, y0 + 10, '#ffffff');

    // 厚重石铠躯干 (庞大霸气)
    R(6, y0 + 12, 19, 10, '#1c1917');
    R(7, y0 + 13, 17, 8, '#292524');
    // 胸膛重铠鳞片
    R(10, y0 + 14, 11, 3, '#57534e');
    R(11, y0 + 18, 9, 3, '#44403c');

    // 粗壮如柱巨腿
    R(6, y0 + 22, 5, 6, '#292524');
    R(20, y0 + 22, 5, 6, '#292524');
    // 重装蹄甲
    R(5, y0 + 26, 7, 2, '#1c1917');
    R(19, y0 + 26, 7, 2, '#1c1917');
  }

  // 7. 相柳 (九首毒蛇水神)
  drawXiangLiuPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 4) * 1.2);
    const snakeWave = Math.floor(Math.sin(anim.time * 6) * 1.5);
    const y0 = 6 + bob;

    // 盘曲幽绿巨蛇躯体
    R(6, y0 + 14, 20, 10, '#132e1f');
    R(8, y0 + 16, 16, 6, '#281a38'); // 毒紫腹鳞
    R(5, y0 + 22, 22, 4, '#0d1f15');

    // 多个起伏蛇首 (中间主头，两侧从头)
    // 中间主蛇首
    R(13, y0 + 2, 6, 6, '#1a432d');
    P(14, y0 + 4, '#bef264'); // 荧光黄绿毒眼
    P(17, y0 + 4, '#bef264');
    R(15, y0 + 8, 2, 4, '#a855f7'); // 吐出紫毒信子

    // 左侧副头1
    R(7 + snakeWave, y0 + 5, 5, 5, '#163826');
    P(8 + snakeWave, y0 + 7, '#bef264');
    // 左侧副头2
    R(3, y0 + 9, 4, 4, '#163826');
    P(4, y0 + 10, '#bef264');

    // 右侧副头1
    R(20 - snakeWave, y0 + 5, 5, 5, '#163826');
    P(23 - snakeWave, y0 + 7, '#bef264');
    // 右侧副头2
    R(25, y0 + 9, 4, 4, '#163826');
    P(26, y0 + 10, '#bef264');

    // 滴落的毒液微粒
    P(15, y0 + 13, '#c084fc');
    P(16, y0 + 14, '#a855f7');
  }

  // 8. 穷奇 (四凶之一·飞翼恶虎)
  drawQiongQiPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 4) * 1.2);
    const wingFlap = Math.floor(Math.sin(anim.time * 8) * 2.5);
    const y0 = 6 + bob;

    // 漆黑巨翼 (扑展恶魔之翼)
    R(3, y0 + 3 - wingFlap, 6, 12, '#09090b');
    R(5, y0 + 5 - wingFlap, 4, 8, '#27272a');
    P(3, y0 + 2 - wingFlap, '#ef4444'); // 翼骨血刺

    R(23, y0 + 3 + wingFlap, 6, 12, '#09090b');
    R(23, y0 + 5 + wingFlap, 4, 8, '#27272a');
    P(28, y0 + 2 + wingFlap, '#ef4444');

    // 恶虎虎首
    R(12, y0 + 4, 9, 8, '#18181b');
    R(14, y0 + 8, 5, 4, '#27272a');
    // 獠牙大口
    P(15, y0 + 10, '#ffffff');
    P(17, y0 + 10, '#ffffff');
    // 嗜血红瞳
    P(14, y0 + 6, '#ef4444');
    P(18, y0 + 6, '#ef4444');
    P(15, y0 + 6, '#fde047');

    // 黑虎矫健身躯
    R(8, y0 + 10, 16, 9, '#18181b');
    R(10, y0 + 12, 12, 6, '#27272a');
    // 血煞爪牙
    R(8, y0 + 19, 3, 6, '#18181b');
    R(13, y0 + 19, 3, 6, '#18181b');
    R(17, y0 + 19, 3, 6, '#18181b');
    R(21, y0 + 19, 3, 6, '#18181b');
    // 血爪尖
    P(8, y0 + 25, '#ef4444');
    P(14, y0 + 25, '#ef4444');
    P(22, y0 + 25, '#ef4444');
  }

  // 9. 烛九阴 (大荒之神·赤龙人面)
  drawZhuJiuYinPixel(ctx, anim) {
    const P = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const bob = Math.floor(Math.sin(anim.time * 3) * 1.5);
    const sunPulse = Math.floor((Math.sin(anim.time * 7) + 1) * 1.5);
    const y0 = 5 + bob;

    // 赤红神龙盘龙蛇躯
    R(5, y0 + 14, 22, 10, '#991b1b');
    R(7, y0 + 16, 18, 6, '#dc2626');
    R(9, y0 + 18, 14, 4, '#f59e0b'); // 龙腹纯阳金鳞

    // 龙鬃烈焰
    R(9, y0, 14, 6, '#ea580c');
    R(11, y0 - 2, 10, 4, '#f97316');
    // 金色龙角
    R(10, y0 - 3, 2, 4, '#eab308');
    R(20, y0 - 3, 2, 4, '#eab308');

    // 庄严人面神颜
    R(12, y0 + 3, 8, 9, '#fed7aa');
    R(13, y0 + 8, 6, 3, '#fdba74');

    // 核心双目：左眼炽日、右目弦月！
    // 左目 (睁目烈日金火)
    P(13, y0 + 5, '#facc15');
    P(14, y0 + 5, '#f97316');
    if (sunPulse > 1) {
      P(12, y0 + 5, '#ffffff'); // 烈阳极光
      P(13, y0 + 4, '#fde047');
    }

    // 右目 (瞑目太阴玄月)
    P(17, y0 + 5, '#38bdf8');
    P(18, y0 + 5, '#0284c7');

    // 额间大道神印
    P(15, y0 + 4, '#ef4444');
    P(16, y0 + 4, '#ef4444');

    // 祥云缭绕
    R(4, y0 + 22, 6, 2, '#f1f5f9');
    R(22, y0 + 22, 6, 2, '#f1f5f9');
  }

  // 核心渲染接口：将像素角色动作精灵画到主战场指定格子
  drawUnitSprite(ctx, unit, cx, cy, size, anim) {
    const action = unit.actionState || 'idle';
    const charKey = unit.templateId;

    // 优先从预载动作切片字典中检索
    let spriteImg = this.actionSprites ? this.actionSprites.get(`${charKey}_${action}`) : null;
    if (!spriteImg || !spriteImg.complete || spriteImg.naturalWidth === 0) {
      // 降级为 idle 切片
      spriteImg = this.actionSprites ? this.actionSprites.get(`${charKey}_idle`) : null;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 计算实际位置与动态动作物理位移
    const targetSize = Math.floor(size * 0.95);
    let ox = 0;
    let oy = -4;

    if (action === 'idle') {
      oy += Math.floor(Math.sin(anim.time * 4) * 1.5);
    } else if (action === 'move') {
      // 御风踏星身法：清晰的脚步腾跃起伏与前倾冲刺
      const bounce = Math.abs(Math.sin(anim.time * 12));
      oy += Math.floor(bounce * -5);
      ox += (unit.facing === 'WEST' ? -2 : 2);
    } else if (action === 'guard') {
      oy += 1; // 稳固微蹲御守架势
    } else if (action === 'attack1') {
      const step = unit.actionTimer > 0 ? (0.5 - unit.actionTimer) / 0.5 : 0.5;
      const lunge = Math.sin(Math.min(1, Math.max(0, step)) * Math.PI) * 8;
      ox += (unit.facing === 'WEST' ? -lunge : lunge);
    } else if (action === 'attack2') {
      const step = unit.actionTimer > 0 ? (0.7 - unit.actionTimer) / 0.7 : 0.5;
      oy -= Math.sin(Math.min(1, Math.max(0, step)) * Math.PI) * 7; // 腾空拔起
    } else if (action === 'hit') {
      ox += Math.floor((Math.random() - 0.5) * 6);
      oy += Math.floor((Math.random() - 0.5) * 4);
    }

    const px = Math.floor(cx - targetSize / 2 + ox);
    const py = Math.floor(cy - targetSize / 2 + oy);

    // 受击闪红闪白高亮
    if (unit.hitFlashTimer && unit.hitFlashTimer > 0) {
      ctx.filter = 'brightness(2.2) contrast(1.4)';
    }

    if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
      // 绘制高质量 16-Bit 动作精灵图
      if (unit.facing === 'WEST') {
        ctx.translate(px + targetSize, py);
        ctx.scale(-1, 1);
        ctx.drawImage(spriteImg, 0, 0, targetSize, targetSize);
      } else {
        ctx.drawImage(spriteImg, px, py, targetSize, targetSize);
      }
    } else {
      // 备选降级方案：动态手绘 32x32 离屏 Canvas
      const renderer = this.renderers[unit.templateId] || this.renderers.lingxu;
      if (renderer) {
        const off = document.createElement('canvas');
        off.width = 32;
        off.height = 32;
        const offCtx = off.getContext('2d');
        offCtx.imageSmoothingEnabled = false;
        renderer(offCtx, anim);

        if (unit.facing === 'WEST') {
          ctx.translate(px + targetSize, py);
          ctx.scale(-1, 1);
          ctx.drawImage(off, 0, 0, 32, 32, 0, 0, targetSize, targetSize);
        } else {
          ctx.drawImage(off, 0, 0, 32, 32, px, py, targetSize, targetSize);
        }
      }
    }

    ctx.restore();

    // 绘制御守【凝气金光/青碧六芒护体罡气】
    if (action === 'guard') {
      this.drawHexGuardBarrier(ctx, cx, cy, size * 0.52, anim);
    }
  }

  // 绘制国风护体真罡阵 (Hexagonal Qi Shield Barrier)
  drawHexGuardBarrier(ctx, cx, cy, radius, anim) {
    ctx.save();
    const rot = anim.time * 2.0;
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = '#ecc981';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(236, 201, 129, 0.18)';

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = Math.cos(angle) * radius;
      const hy = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 内环灵纹
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

window.pixelSpriteEngine = new PixelSpriteEngine();
