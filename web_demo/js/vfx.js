/**
 * 《山海问道录·天衍棋局》16-Bit 复古像素特效与粒子引擎 (Pixel VFX)
 */

class PixelParticle {
  constructor(x, y, vx, vy, color, size = 3, decay = 0.04, shape = 'square') {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.alpha = 1.0;
    this.decay = decay;
    this.shape = shape; // 'square', 'cross', 'spark'
    this.life = 1.0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.alpha = Math.max(0, this.life);
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    const px = Math.floor(this.x);
    const py = Math.floor(this.y);
    const s = Math.floor(this.size);

    if (this.shape === 'square') {
      ctx.fillRect(px, py, s, s);
    } else if (this.shape === 'cross') {
      // 像素十字星 (如治愈星芒)
      ctx.fillRect(px - s, py, s * 3, s);
      ctx.fillRect(px, py - s, s, s * 3);
    } else if (this.shape === 'spark') {
      // 细微火星
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.restore();
  }
}

class PixelFloatingText {
  constructor(text, x, y, color = '#ECC981', isBig = false) {
    this.text = text;
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.color = color;
    this.isBig = isBig;
    this.alpha = 1.0;
    this.life = 1.0;
    this.decay = 0.025;
  }

  update() {
    this.y -= 1; // 逐像素上升
    this.life -= this.decay;
    this.alpha = Math.max(0, this.life);
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.imageSmoothingEnabled = false;

    // 像素字体与硬阴影
    const fontSize = this.isBig ? 18 : 14;
    ctx.font = `bold ${fontSize}px "Courier New", "SimSun", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 像素实心深色阴影 (右下2px)
    ctx.fillStyle = '#080c0e';
    ctx.fillText(this.text, this.x + 2, this.y + 2);
    ctx.fillText(this.text, this.x - 1, this.y);
    ctx.fillText(this.text, this.x + 1, this.y);
    ctx.fillText(this.text, this.x, this.y - 1);
    ctx.fillText(this.text, this.x, this.y + 1);

    // 文字本体
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class PixelVFXManager {
  constructor() {
    this.particles = [];
    this.texts = [];
    this.complexEffects = [];
    this.shakeFrames = 0;
    this.shakeIntensity = 0;
  }

  shake(intensity = 6, frames = 10) {
    this.shakeIntensity = intensity;
    this.shakeFrames = frames;
  }

  addText(text, x, y, color = '#ECC981', isBig = false) {
    this.texts.push(new PixelFloatingText(text, x, y, color, isBig));
  }

  // 1. 金系庚金飞剑像素斩裂
  spawnSwordVFX(cx, cy) {
    // 释放金芒像素流
    for (let i = 0; i < 28; i++) {
      const angle = (Math.PI * 2 / 28) * i;
      const speed = 2 + Math.random() * 5;
      const color = Math.random() < 0.6 ? '#ecc981' : '#fff9e6';
      this.particles.push(new PixelParticle(
        cx, cy,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        Math.floor(2 + Math.random() * 3),
        0.045,
        'square'
      ));
    }

    // 斩裂光痕 (45度倾斜金光方块束)
    for (let k = -20; k <= 20; k += 4) {
      this.particles.push(new PixelParticle(
        cx + k, cy + k,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        '#ffffff',
        3,
        0.06,
        'square'
      ));
    }
  }

  // 2. 火系三昧神火像素爆燃
  spawnFireVFX(cx, cy) {
    const fireColors = ['#f97316', '#ef4444', '#fde047', '#b91c1c'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      const c = fireColors[Math.floor(Math.random() * fireColors.length)];
      this.particles.push(new PixelParticle(
        cx, cy,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 1.2, // 像素火星向上飘
        c,
        Math.floor(2 + Math.random() * 4),
        0.035,
        'square'
      ));
    }
  }

  // 3. 木系万木逢春甘露像素升腾
  spawnHealVFX(cx, cy) {
    const healColors = ['#65c27d', '#8effa9', '#48b67b', '#e3ffeb'];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const radius = 6 + Math.random() * 14;
      const c = healColors[Math.floor(Math.random() * healColors.length)];
      this.particles.push(new PixelParticle(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
        (Math.random() - 0.5) * 0.8,
        -1.5 - Math.random() * 2, // 向上浮升
        c,
        3,
        0.03,
        'cross'
      ));
    }
  }

  // 4. 壁击碎岩碎石飞溅
  spawnImpactVFX(cx, cy) {
    const rockColors = ['#78716c', '#57534e', '#d6d3d1', '#44403c'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const c = rockColors[Math.floor(Math.random() * rockColors.length)];
      this.particles.push(new PixelParticle(
        cx, cy,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        c,
        3 + Math.floor(Math.random() * 3),
        0.05,
        'square'
      ));
    }
  }

  // 5. 相柳九首水毒墨绿腐泽粒子
  spawnPoisonVFX(cx, cy) {
    const poisonColors = ['#22c55e', '#15803d', '#a855f7', '#7e22ce', '#bef264'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      const c = poisonColors[Math.floor(Math.random() * poisonColors.length)];
      this.particles.push(new PixelParticle(
        cx, cy,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 0.5,
        c,
        Math.floor(2 + Math.random() * 3),
        0.038,
        'square'
      ));
    }
  }

  // 6. 烛九阴阴阳太极昼夜极光粒子
  spawnCelestialVFX(cx, cy) {
    const celestialColors = ['#f59e0b', '#38bdf8', '#fbbf24', '#e0f2fe', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 / 40) * i;
      const speed = 2.5 + Math.random() * 5.0;
      const c = celestialColors[i % celestialColors.length];
      this.particles.push(new PixelParticle(
        cx, cy,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        c,
        Math.floor(3 + Math.random() * 3),
        0.03,
        'cross'
      ));
    }
  }

  // 7. 凝气御守真罡金芒护体粒子
  spawnGuardBarrierVFX(cx, cy) {
    const shieldColors = ['#ecc981', '#5eead4', '#fef08a', '#99f6e4'];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const r = 24;
      const c = shieldColors[i % shieldColors.length];
      this.particles.push(new PixelParticle(
        cx + Math.cos(angle) * r,
        cy + Math.sin(angle) * r,
        Math.cos(angle) * 1.5,
        Math.sin(angle) * 1.5,
        c,
        Math.floor(2 + Math.random() * 3),
        0.04,
        'cross'
      ));
    }
  }

  // 8. 踏星御风位移残影虚线粒子
  spawnDashVFX(fx, fy, tx, ty) {
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = fx + (tx - fx) * t;
      const py = fy + (ty - fy) * t;
      this.particles.push(new PixelParticle(
        px, py,
        (Math.random() - 0.5) * 1.0,
        (Math.random() - 0.5) * 1.0,
        '#38bdf8',
        Math.floor(2 + Math.random() * 2),
        0.08,
        'spark'
      ));
    }
  }

  // 9. 技能定制专属武学动效 (万剑、天火、魅影、血煞、剧毒、神昼)
  spawnSkillBurstVFX(skill, cx, cy) {
    if (!skill) return;
    const sId = skill.id;

    if (sId === 'THOUSAND_SWORDS') {
      // 从天而降的密集金光剑雨
      for (let i = 0; i < 30; i++) {
        const ox = (Math.random() - 0.5) * 48;
        const oy = -40 - Math.random() * 30;
        this.particles.push(new PixelParticle(
          cx + ox, cy + oy,
          (Math.random() - 0.5) * 0.5,
          5 + Math.random() * 4,
          Math.random() < 0.7 ? '#ecc981' : '#ffffff',
          3,
          0.05,
          'square'
        ));
      }
    } else if (sId === 'FOX_CHARM') {
      // 灵狐魅影粉红落英花瓣螺旋
      const petals = ['#f472b6', '#fb7185', '#fda4af', '#fdf2f8'];
      for (let i = 0; i < 26; i++) {
        const angle = (Math.PI * 2 / 26) * i;
        const spd = 2 + Math.random() * 2.5;
        this.particles.push(new PixelParticle(
          cx, cy,
          Math.cos(angle) * spd,
          Math.sin(angle) * spd - 1,
          petals[i % petals.length],
          3,
          0.035,
          'cross'
        ));
      }
    } else if (sId === 'QIONGQI_DIVE') {
      // 穷奇凶风十字血煞破空爪芒
      for (let k = -24; k <= 24; k += 4) {
        this.particles.push(new PixelParticle(
          cx + k, cy + k,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          '#ef4444',
          3,
          0.06,
          'square'
        ));
        this.particles.push(new PixelParticle(
          cx + k, cy - k,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          '#dc2626',
          3,
          0.06,
          'square'
        ));
      }
    } else if (sId === 'TAOWU_ROAR' || sId === 'DANGKANG_SLAM') {
      // 梼杌震地崩裂土黄色环形气浪
      for (let i = 0; i < 32; i++) {
        const angle = (Math.PI * 2 / 32) * i;
        const spd = 3 + Math.random() * 3;
        this.particles.push(new PixelParticle(
          cx, cy,
          Math.cos(angle) * spd,
          Math.sin(angle) * spd,
          i % 2 === 0 ? '#ca8a04' : '#78716c',
          Math.floor(3 + Math.random() * 3),
          0.045,
          'square'
        ));
      }
    }
  }

  // 10. 触发全技能专属核心武学动作与战斗特效编排
  triggerSkillChoreography(skill, attacker, targetX, targetY, tileSize = 64) {
    if (!skill) return;
    const fx = (attacker.x + 0.5) * tileSize;
    const fy = (attacker.y + 0.5) * tileSize;
    const tx = (targetX + 0.5) * tileSize;
    const ty = (targetY + 0.5) * tileSize;

    switch (skill.id) {
      case 'SWORD_PIERCE':
        this.complexEffects.push(new SwordPierceProjectileEffect(fx, fy, tx, ty, 0.32));
        break;
      case 'THOUSAND_SWORDS':
        this.complexEffects.push(new ThousandSwordsArrayEffect(tx, ty, 0.72));
        break;
      case 'SWORD_AURA_BURST':
        this.complexEffects.push(new SwordAuraBurstLaserEffect(fx, fy, tx, ty, 0.55));
        break;
      case 'WOOD_HEAL':
        this.complexEffects.push(new WoodLotusHealEffect(tx, ty, 0.7));
        break;
      case 'FOX_CHARM':
        this.complexEffects.push(new FoxCharmSpiritEffect(fx, fy, tx, ty, 0.5));
        break;
      case 'NINE_TAIL_RENEW':
        this.complexEffects.push(new NineTailRenewRainEffect(fx, fy, tx, ty, 0.8));
        break;
      case 'BIFANG_FIRE':
        this.complexEffects.push(new BifangFireBirdEffect(fx, fy, tx, ty, 0.42));
        break;
      case 'BIFANG_HELLFIRE':
        this.complexEffects.push(new BifangHellfireMeteorEffect(tx, ty, 0.75));
        break;
      case 'HUODOU_BITE':
        this.complexEffects.push(new HuodouFlameJawEffect(tx, ty, 0.48));
        break;
      case 'GUDIAO_TALON':
        this.complexEffects.push(new GudiaoAirBladeEffect(tx, ty, 0.42));
        break;
      case 'DANGKANG_SLAM':
      case 'TAOWU_ROAR':
        this.complexEffects.push(new TaowuEarthFissureEffect(tx, ty, 0.65));
        break;
      case 'XIANGLIU_POISON':
        this.complexEffects.push(new XiangliuHydraPoisonEffect(tx, ty, 0.75));
        break;
      case 'QIONGQI_DIVE':
        this.complexEffects.push(new QiongqiBloodClawEffect(tx, ty, 0.55));
        break;
      case 'ZHUJIUYIN_DAY_NIGHT':
        this.complexEffects.push(new ZhuJiuyinTaijiCosmicEffect(tx, ty, 0.9));
        break;
      default:
        this.spawnSkillBurstVFX(skill, tx, ty);
        break;
    }
  }

  update(dt = 0.016) {
    this.particles = this.particles.filter(p => p.update());
    this.texts = this.texts.filter(t => t.update());
    this.complexEffects = this.complexEffects.filter(e => e.update(dt, this));
    if (this.shakeFrames > 0) {
      this.shakeFrames--;
    }
  }

  draw(ctx) {
    this.complexEffects.forEach(e => e.draw(ctx));
    this.particles.forEach(p => p.draw(ctx));
    this.texts.forEach(t => t.draw(ctx));
  }

  getShakeOffset() {
    if (this.shakeFrames > 0) {
      const ratio = this.shakeFrames / 10;
      return {
        x: Math.floor((Math.random() * 2 - 1) * this.shakeIntensity * ratio),
        y: Math.floor((Math.random() * 2 - 1) * this.shakeIntensity * ratio)
      };
    }
    return { x: 0, y: 0 };
  }
}

// ============================================================================
// 东方仙侠专属武学技能动态特效编排组件库 (Skill Choreography VFX Classes)
// ============================================================================

// 1. 庚金飞剑长空破空飞刺 (Sword Pierce Projectile)
class SwordPierceProjectileEffect {
  constructor(fromX, fromY, toX, toY, duration = 0.35) {
    this.fx = fromX; this.fy = fromY;
    this.tx = toX; this.ty = toY;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.angle = Math.atan2(toY - fromY, toX - fromX);
    this.hasHit = false;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    // 弹道飞行时沿途产生破空星屑
    const curX = this.fx + (this.tx - this.fx) * this.progress;
    const curY = this.fy + (this.ty - this.fy) * this.progress;
    vfx.particles.push(new PixelParticle(
      curX, curY,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      Math.random() < 0.6 ? '#fde047' : '#ffffff',
      3, 0.08, 'spark'
    ));

    if (this.progress >= 1.0 && !this.hasHit) {
      this.hasHit = true;
      vfx.spawnSwordVFX(this.tx, this.ty);
      vfx.shake(7, 10);
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    const curX = this.fx + (this.tx - this.fx) * this.progress;
    const curY = this.fy + (this.ty - this.fy) * this.progress;

    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(this.angle);

    // 纯金炽烈飞剑长光
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-22, -2, 28, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, -1, 24, 2);
    // 剑尖锋芒
    ctx.beginPath();
    ctx.moveTo(6, 0); ctx.lineTo(-4, -5); ctx.lineTo(-4, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 剑尾拖曳破空流光
    ctx.strokeStyle = 'rgba(236, 201, 129, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, 0); ctx.lineTo(-45, 0);
    ctx.stroke();

    ctx.restore();
  }
}

// 2. 万剑归宗周天八卦降魔剑阵 (Thousand Swords Formation)
class ThousandSwordsArrayEffect {
  constructor(tx, ty, duration = 0.75) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.swords = [];
    for (let i = 0; i < 14; i++) {
      this.swords.push({
        ox: (Math.random() - 0.5) * 72,
        oy: (Math.random() - 0.5) * 72,
        startDelay: 0.12 + Math.random() * 0.35,
        landed: false
      });
    }
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    // 各落剑着地判定
    this.swords.forEach(sw => {
      if (!sw.landed && this.elapsed >= sw.startDelay + 0.15) {
        sw.landed = true;
        vfx.spawnSwordVFX(this.tx + sw.ox, this.ty + sw.oy);
      }
    });

    if (this.progress > 0.4 && this.progress < 0.6) {
      vfx.shake(9, 14);
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    // 地面金色八卦太极剑阵光圈
    const alpha = Math.sin(this.progress * Math.PI);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = '#ecc981';
    ctx.lineWidth = 2.5;

    const r = 46 * Math.min(1, this.progress * 3);
    ctx.beginPath();
    ctx.arc(this.tx, this.ty, r, 0, Math.PI * 2);
    ctx.stroke();

    // 八角剑符
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k + this.elapsed * 3;
      const bx = this.tx + Math.cos(a) * r;
      const by = this.ty + Math.sin(a) * r;
      ctx.fillStyle = '#fde047';
      ctx.fillRect(bx - 2, by - 2, 4, 4);
    }

    // 从九霄垂直暴落的金光巨剑
    this.swords.forEach(sw => {
      if (this.elapsed < sw.startDelay) return;
      const dropTime = 0.15;
      const dropProg = Math.min(1.0, (this.elapsed - sw.startDelay) / dropTime);
      const curY = (this.ty - 160) + (160 + sw.oy) * dropProg;
      const curX = this.tx + sw.ox;

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(curX - 2, curY - 24, 4, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(curX - 1, curY - 20, 2, 16);
    });
    ctx.restore();
  }
}

// 3. 太白极刃百丈金光长虹贯日 (Sword Aura Burst Laser)
class SwordAuraBurstLaserEffect {
  constructor(fx, fy, tx, ty, duration = 0.55) {
    this.fx = fx; this.fy = fy;
    this.angle = Math.atan2(ty - fy, tx - fx);
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);
    if (this.progress > 0.1 && this.progress < 0.4) {
      vfx.shake(12, 16);
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    const alpha = Math.sin(this.progress * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.fx, this.fy);
    ctx.rotate(this.angle);

    // 贯穿整幅画面的百丈白金剑柱
    const beamW = 28 * Math.sin(this.progress * Math.PI);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.fillRect(0, -beamW * 1.5, 750, beamW * 3);
    ctx.fillStyle = '#ecc981';
    ctx.fillRect(0, -beamW, 750, beamW * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -beamW * 0.4, 750, beamW * 0.8);
    ctx.restore();
  }
}

// 4. 万木逢春圣洁玉莲甘霖 (Wood Lotus Heal)
class WoodLotusHealEffect {
  constructor(tx, ty, duration = 0.7) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    // 向上升腾的甘露水木粒子
    if (Math.random() < 0.6) {
      vfx.particles.push(new PixelParticle(
        this.tx + (Math.random() - 0.5) * 36,
        this.ty + (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 1.2,
        -2.5 - Math.random() * 2,
        Math.random() < 0.5 ? '#6ee7b7' : '#a7f3d0',
        3, 0.035, 'cross'
      ));
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    const alpha = Math.sin(this.progress * Math.PI);
    ctx.save();
    ctx.globalAlpha = alpha;

    // 旋转展开的八瓣碧玉莲花
    const r = 30 * Math.sin(this.progress * Math.PI);
    const rot = this.elapsed * 2.2;
    for (let i = 0; i < 8; i++) {
      const a = rot + (Math.PI / 4) * i;
      const px = this.tx + Math.cos(a) * r;
      const py = this.ty + Math.sin(a) * r;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 莲花中心长生灵珠
    ctx.fillStyle = '#ecfdf5';
    ctx.beginPath();
    ctx.arc(this.tx, this.ty, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 5. 青丘天狐魅影落英花瓣 (Fox Charm Spirit)
class FoxCharmSpiritEffect {
  constructor(fx, fy, tx, ty, duration = 0.52) {
    this.fx = fx; this.fy = fy;
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    // 弹道沿线洒落粉红桃花瓣
    const curX = this.fx + (this.tx - this.fx) * this.progress;
    const curY = this.fy + (this.ty - this.fy) * this.progress;
    vfx.particles.push(new PixelParticle(
      curX, curY,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2 - 0.5,
      Math.random() < 0.6 ? '#f472b6' : '#fb7185',
      3, 0.038, 'cross'
    ));

    if (this.progress >= 1.0) {
      vfx.addText('【灵狐惑心】', this.tx, this.ty - 34, '#f472b6', true);
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    const curX = this.fx + (this.tx - this.fx) * this.progress;
    const curY = this.fy + (this.ty - this.fy) * this.progress;

    ctx.save();
    // 粉红九尾法相灵魅光球
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.beginPath();
    ctx.arc(curX, curY, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(curX, curY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 6. 九尾回天大灵雨天狐法相 (Nine Tail Renew Rain)
class NineTailRenewRainEffect {
  constructor(fx, fy, tx, ty, duration = 0.8) {
    this.fx = fx; this.fy = fy;
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    // 全屏甘露灵雨降下
    for (let i = 0; i < 3; i++) {
      vfx.particles.push(new PixelParticle(
        this.tx + (Math.random() - 0.5) * 120,
        this.ty - 80 + Math.random() * 40,
        0, 5 + Math.random() * 3,
        '#6ee7b7', 3, 0.05, 'spark'
      ));
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const alpha = Math.sin(this.progress * Math.PI);
    ctx.globalAlpha = alpha;

    // 背后展开的 9 条圣洁粉白巨尾剪影
    for (let i = -4; i <= 4; i++) {
      const a = (i * 0.22) - Math.PI / 2;
      const lx = this.fx + Math.cos(a) * 75;
      const ly = this.fy + Math.sin(a) * 75;
      ctx.strokeStyle = 'rgba(253, 242, 248, 0.5)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(this.fx, this.fy);
      ctx.quadraticCurveTo(this.fx + i * 20, this.fy - 50, lx, ly);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// 7. 毕方独足神鸟振翅冲霄 (Bi Fang Fire Bird)
class BifangFireBirdEffect {
  constructor(fx, fy, tx, ty, duration = 0.42) {
    this.fx = fx; this.fy = fy;
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.angle = Math.atan2(toY - fromY, toX - fromX);
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    const curX = this.fx + (this.tx - this.fx) * this.progress;
    const curY = this.fy + (this.ty - this.fy) * this.progress;
    vfx.particles.push(new PixelParticle(
      curX, curY,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 3,
      Math.random() < 0.7 ? '#f97316' : '#22d3ee',
      4, 0.045, 'square'
    ));

    if (this.progress >= 1.0) {
      vfx.spawnFireVFX(this.tx, this.ty);
      vfx.shake(8, 12);
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    const curX = this.fx + (this.tx - this.fx) * this.progress;
    const curY = this.fy + (this.ty - this.fy) * this.progress;

    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(this.angle);

    // 火鸟展翅剪影
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(24, 0); ctx.lineTo(-12, -18); ctx.lineTo(-6, 0); ctx.lineTo(-12, 18);
    ctx.closePath();
    ctx.fill();

    // 核心纯阳青羽
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(4, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 8. 大荒讹火神劫群星陨落 (Bifang Hellfire Meteor)
class BifangHellfireMeteorEffect {
  constructor(tx, ty, duration = 0.75) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.meteors = [
      { ox: 0, oy: 0, delay: 0 },
      { ox: -28, oy: -20, delay: 0.12 },
      { ox: 28, oy: -20, delay: 0.18 },
      { ox: -20, oy: 28, delay: 0.25 },
      { ox: 20, oy: 28, delay: 0.32 }
    ];
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    this.meteors.forEach(m => {
      if (!m.landed && this.elapsed >= m.delay + 0.18) {
        m.landed = true;
        vfx.spawnFireVFX(this.tx + m.ox, this.ty + m.oy);
      }
    });

    if (this.progress > 0.3 && this.progress < 0.7) {
      vfx.shake(10, 14);
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    this.meteors.forEach(m => {
      if (this.elapsed < m.delay) return;
      const p = Math.min(1.0, (this.elapsed - m.delay) / 0.18);
      const mx = (this.tx + m.ox - 60) + 60 * p;
      const my = (this.ty + m.oy - 120) + 120 * p;

      // 陨石火尾
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(mx, my); ctx.lineTo(mx - 30, my - 60);
      ctx.stroke();

      // 炽红陨核
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(mx, my, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

// 9. 祸斗【炎魔狂噬】—— 凶煞炎魔咆哮扑杀与三昧真火巨颚撕咬
class HuodouFlameJawEffect {
  constructor(tx, ty, duration = 0.6) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.hasErupted = false;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    if (!this.hasErupted && this.progress >= 0.38) {
      this.hasErupted = true;
      vfx.spawnFireVFX(this.tx, this.ty);
      vfx.shake(12, 14);
      if (typeof window !== 'undefined' && window.sound && window.sound.playFireBurst) {
        window.sound.playFireBurst();
      }
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const p = this.progress;
    let biteDist;
    if (p < 0.4) {
      biteDist = 48 * (1 - p / 0.4);
    } else {
      biteDist = 0;
    }
    const alpha = p < 0.8 ? 1.0 : (1.0 - (p - 0.8) / 0.2);
    ctx.globalAlpha = Math.max(0, alpha);

    // 1. 底层炽热熔岩地脉光环
    const glowR = 36 + Math.sin(p * Math.PI) * 16;
    const grad = ctx.createRadialGradient(this.tx, this.ty, 4, this.tx, this.ty, glowR);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.75)');
    grad.addColorStop(0.8, 'rgba(185, 28, 28, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.tx, this.ty, glowR, 0, Math.PI * 2);
    ctx.fill();

    // 2. 凶煞恶犬上下炎魔利齿獠牙
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;

    // 上颚
    ctx.beginPath();
    ctx.moveTo(this.tx - 32, this.ty - biteDist - 10);
    ctx.lineTo(this.tx - 24, this.ty - biteDist + 16);
    ctx.lineTo(this.tx - 16, this.ty - biteDist - 6);
    ctx.lineTo(this.tx - 6, this.ty - biteDist + 22);
    ctx.lineTo(this.tx + 4, this.ty - biteDist - 8);
    ctx.lineTo(this.tx + 14, this.ty - biteDist + 20);
    ctx.lineTo(this.tx + 22, this.ty - biteDist - 6);
    ctx.lineTo(this.tx + 30, this.ty - biteDist + 16);
    ctx.lineTo(this.tx + 36, this.ty - biteDist - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 下颚
    ctx.beginPath();
    ctx.moveTo(this.tx - 32, this.ty + biteDist + 10);
    ctx.lineTo(this.tx - 22, this.ty + biteDist - 16);
    ctx.lineTo(this.tx - 14, this.ty + biteDist + 6);
    ctx.lineTo(this.tx, this.ty + biteDist - 24);
    ctx.lineTo(this.tx + 12, this.ty + biteDist + 8);
    ctx.lineTo(this.tx + 22, this.ty + biteDist - 18);
    ctx.lineTo(this.tx + 34, this.ty + biteDist + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. 咬合爆发时的四射火焰撕裂爪齿火刃 (0.35 ~ 0.8)
    if (p >= 0.35) {
      const slashP = (p - 0.35) / 0.45;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4 * (1 - slashP);
      for (let i = -1; i <= 1; i++) {
        const ox = i * 16;
        ctx.beginPath();
        ctx.moveTo(this.tx + ox - 20, this.ty - 24);
        ctx.lineTo(this.tx + ox + 20, this.ty + 24);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

// 10. 蛊雕【穿云铁角刺】—— 九天破空铁羽神禽俯冲、破甲金芒风刃暴击
class GudiaoAirBladeEffect {
  constructor(tx, ty, duration = 0.55) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.hasPierced = false;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    if (!this.hasPierced && this.progress >= 0.35) {
      this.hasPierced = true;
      vfx.spawnSwordVFX(this.tx, this.ty);
      vfx.shake(11, 14);
      if (typeof window !== 'undefined' && window.sound && window.sound.playSwordSlash) {
        window.sound.playSwordSlash();
      }
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const p = this.progress;
    const alpha = p < 0.75 ? 1.0 : (1.0 - (p - 0.75) / 0.25);
    ctx.globalAlpha = Math.max(0, alpha);

    // 1. 九天高空破云俯冲神角 (0 ~ 0.4)
    if (p < 0.5) {
      const dropP = Math.min(1.0, p / 0.35);
      const startX = this.tx - 80;
      const startY = this.ty - 130;
      const curX = startX + (this.tx - startX) * dropP;
      const curY = startY + (this.ty - startY) * dropP;

      ctx.save();
      ctx.translate(curX, curY);
      ctx.rotate(Math.PI / 3);

      // 穿天金刚巨角
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(35, 0); ctx.lineTo(-20, -10); ctx.lineTo(-12, 0); ctx.lineTo(-20, 10);
      ctx.closePath();
      ctx.fill();

      // 金芒尾焰与音爆环
      ctx.strokeStyle = '#ecc981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(236, 201, 129, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-15, 0, 8, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. 刺地破甲爆发——四道极速旋转的铁羽破风月牙斩光 (0.35 ~ 0.9)
    if (p >= 0.35) {
      const rot = (p - 0.35) * 12;
      const expand = 20 + (p - 0.35) * 35;
      ctx.save();
      ctx.translate(this.tx, this.ty);
      ctx.rotate(rot);

      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);
        // 白金锐利风刃弧光
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(expand * 0.7, 0, 22, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        ctx.strokeStyle = '#ecc981';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(expand * 0.7, 0, 26, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        ctx.restore();
      }

      // 地面蛛网状金色破甲冲击裂纹
      ctx.strokeStyle = 'rgba(236, 201, 129, 0.75)';
      ctx.lineWidth = 2.0;
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * expand * 0.8, Math.sin(a) * expand * 0.8);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }
}

// 11. 梼杌【荒古四凶·地脉崩裂】—— 大地十字深渊崩裂、玄黄地刺冲天破土、震碎山岳
class TaowuEarthFissureEffect {
  constructor(tx, ty, duration = 0.85) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.hasSlammed = false;
    this.fissureNodes = [
      { ox: 0, oy: 0, delay: 0.15, h: 42, w: 18 },
      { ox: 0, oy: -36, delay: 0.22, h: 36, w: 15 },
      { ox: 0, oy: 36, delay: 0.22, h: 36, w: 15 },
      { ox: -36, oy: 0, delay: 0.22, h: 36, w: 15 },
      { ox: 36, oy: 0, delay: 0.22, h: 36, w: 15 }
    ];
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    if (!this.hasSlammed && this.progress >= 0.18) {
      this.hasSlammed = true;
      vfx.shake(18, 22);
      vfx.spawnImpactVFX(this.tx, this.ty);
      if (typeof window !== 'undefined' && window.sound && window.sound.playHit) {
        window.sound.playHit();
      }
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const p = this.progress;
    const alpha = p < 0.75 ? 1.0 : (1.0 - (p - 0.75) / 0.25);
    ctx.globalAlpha = Math.max(0, alpha);

    // 1. 十字崩碎深渊地缝 (暗红/焦黑断层裂隙)
    if (p >= 0.15) {
      const fProg = Math.min(1.0, (p - 0.15) / 0.25);
      const span = 60 * fProg;

      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.tx - span, this.ty + 2);
      ctx.lineTo(this.tx - span * 0.4, this.ty - 3);
      ctx.lineTo(this.tx + span * 0.4, this.ty + 4);
      ctx.lineTo(this.tx + span, this.ty - 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.tx + 2, this.ty - span);
      ctx.lineTo(this.tx - 3, this.ty - span * 0.4);
      ctx.lineTo(this.tx + 4, this.ty + span * 0.4);
      ctx.lineTo(this.tx - 2, this.ty + span);
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 2. 从深缝暴突拔地而起的穿天巨岩地刺群
    this.fissureNodes.forEach(node => {
      if (this.elapsed < node.delay) return;
      const spikeP = Math.min(1.0, (this.elapsed - node.delay) / 0.16);
      const cx = this.tx + node.ox;
      const cy = this.ty + node.oy;
      const h = node.h * Math.sin(spikeP * Math.PI * 0.5);
      const w = node.w;

      // 背阴暗面
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx - w * 0.6, cy);
      ctx.lineTo(cx, cy + 4);
      ctx.closePath();
      ctx.fill();

      // 向阳面
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + w * 0.6, cy);
      ctx.lineTo(cx, cy + 4);
      ctx.closePath();
      ctx.fill();

      // 地刺金石尖棱
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx, cy + 4);
      ctx.stroke();
    });

    // 3. 巨力震飞环形沙暴气浪
    if (p >= 0.18) {
      const shockR = 30 + (p - 0.18) * 85;
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(this.tx, this.ty, shockR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// 12. 相柳【九首腐泽蚀魂】—— 九条上古毒蟒聚首狂喷、2x2沸腾剧毒沼泽、腐骨蚀魂烟
class XiangliuHydraPoisonEffect {
  constructor(tx, ty, duration = 0.9) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.bubbles = [];
    for (let i = 0; i < 18; i++) {
      this.bubbles.push({
        ox: (Math.random() - 0.5) * 65,
        oy: (Math.random() - 0.5) * 45,
        r: 3 + Math.random() * 5,
        speed: 1.5 + Math.random() * 2.5,
        delay: Math.random() * 0.5
      });
    }
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    if (this.progress > 0.25 && this.progress < 0.65) {
      vfx.shake(9, 10);
      if (Math.random() < 0.6) {
        vfx.spawnPoisonVFX(this.tx + (Math.random() - 0.5) * 40, this.ty + (Math.random() - 0.5) * 30);
      }
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const p = this.progress;
    const alpha = p < 0.8 ? 1.0 : (1.0 - (p - 0.8) / 0.2);
    ctx.globalAlpha = Math.max(0, alpha);

    // 1. 九首毒蟒自虚空居高临下向下喷吐毒瀑 (0.0 ~ 0.45)
    if (p < 0.55) {
      ctx.save();
      for (let i = 0; i < 9; i++) {
        const headAngle = (Math.PI / 10) * (i + 1);
        const headX = this.tx + Math.cos(headAngle) * 80 - 40;
        const headY = this.ty - 90 + Math.sin(headAngle) * 25;

        // 巨蟒头颅
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(headX, headY, 8, 0, Math.PI * 2);
        ctx.fill();

        // 猩红毒瞳
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(headX - 2, headY - 1, 2, 2);
        ctx.fillRect(headX + 2, headY - 1, 2, 2);

        // 倾泻而下的墨绿剧毒水幕
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(34, 197, 94, 0.45)' : 'rgba(168, 85, 247, 0.45)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.quadraticCurveTo(this.tx + (i - 4) * 8, this.ty - 30, this.tx + (i - 4) * 6, this.ty);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. 2x2 地表沸腾恶臭腐蚀毒沼 (墨绿与剧毒幽紫大毒池)
    if (p >= 0.2) {
      const marshP = Math.min(1.0, (p - 0.2) / 0.2);
      const mw = 65 * marshP;
      const mh = 42 * marshP;

      const poolGrad = ctx.createRadialGradient(this.tx, this.ty, 5, this.tx, this.ty, mw);
      poolGrad.addColorStop(0, '#15803d');
      poolGrad.addColorStop(0.6, '#064e3b');
      poolGrad.addColorStop(0.9, '#581c87');
      poolGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(this.tx, this.ty, mw, mh, 0, 0, Math.PI * 2);
      ctx.fill();

      // 沸腾毒泡泡
      ctx.fillStyle = '#86efac';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      this.bubbles.forEach(b => {
        if (this.elapsed < b.delay + 0.2) return;
        const bProg = ((this.elapsed - b.delay - 0.2) * b.speed) % 1.0;
        const curR = b.r * Math.sin(bProg * Math.PI);
        if (curR > 0.5) {
          ctx.beginPath();
          ctx.arc(this.tx + b.ox, this.ty + b.oy - bProg * 8, curR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });
    }

    // 3. 升腾的蚀骨腐魂骷髅幽雾 (0.4 ~ 0.9)
    if (p >= 0.38) {
      const smokeP = (p - 0.38) / 0.55;
      const sy = this.ty - smokeP * 40;
      ctx.save();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.45)';
      ctx.beginPath();
      ctx.arc(this.tx, sy, 18, 0, Math.PI * 2);
      ctx.arc(this.tx - 12, sy + 6, 12, 0, Math.PI * 2);
      ctx.arc(this.tx + 12, sy + 6, 12, 0, Math.PI * 2);
      ctx.fill();

      // 幽灵骷髅双眼眼眶
      ctx.fillStyle = '#052e16';
      ctx.beginPath();
      ctx.arc(this.tx - 6, sy - 2, 3.5, 0, Math.PI * 2);
      ctx.arc(this.tx + 6, sy - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}

// 13. 穷奇【凶风嗜血扑杀】—— 苍穹黑翼遮日、恶虎狂暴飞扑、四道残暴猩红巨爪撕裂虚空
class QiongqiBloodClawEffect {
  constructor(tx, ty, duration = 0.65) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.hasRipped = false;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    if (!this.hasRipped && this.progress >= 0.25) {
      this.hasRipped = true;
      vfx.shake(14, 18);
      vfx.spawnImpactVFX(this.tx, this.ty);
      if (typeof window !== 'undefined' && window.sound && window.sound.playSwordSlash) {
        window.sound.playSwordSlash();
      }
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const p = this.progress;
    const alpha = p < 0.75 ? 1.0 : (1.0 - (p - 0.75) / 0.25);
    ctx.globalAlpha = Math.max(0, alpha);

    // 1. 苍穹漆黑巨型血翼展开飞扑 (0.0 ~ 0.35)
    if (p < 0.45) {
      const wingP = Math.min(1.0, p / 0.25);
      const span = 90 * wingP;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.moveTo(this.tx, this.ty - 40);
      ctx.quadraticCurveTo(this.tx - span * 0.7, this.ty - 75, this.tx - span, this.ty - 30);
      ctx.lineTo(this.tx - span * 0.5, this.ty - 20);
      ctx.lineTo(this.tx, this.ty - 30);
      ctx.moveTo(this.tx, this.ty - 40);
      ctx.quadraticCurveTo(this.tx + span * 0.7, this.ty - 75, this.tx + span, this.ty - 30);
      ctx.lineTo(this.tx + span * 0.5, this.ty - 20);
      ctx.lineTo(this.tx, this.ty - 30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. 四道狂暴撕裂虚空的鲜红巨爪 (0.25 ~ 0.9)
    if (p >= 0.22) {
      const clawP = Math.min(1.0, (p - 0.22) / 0.18);
      const len = 48 * clawP;
      const clawOffsets = [-22, -8, 8, 22];
      ctx.lineCap = 'round';

      clawOffsets.forEach((ox, idx) => {
        ctx.strokeStyle = idx % 2 === 0 ? '#dc2626' : '#b91c1c';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(this.tx + ox - len * 0.6, this.ty - len * 0.8);
        ctx.lineTo(this.tx + ox + len * 0.6, this.ty + len * 0.8);
        ctx.stroke();

        ctx.strokeStyle = '#fef2f2';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(this.tx + ox - len * 0.5, this.ty - len * 0.7);
        ctx.lineTo(this.tx + ox + len * 0.5, this.ty + len * 0.7);
        ctx.stroke();
      });

      // 交叉反向撕扯爪纹
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(this.tx + len * 0.7, this.ty - len * 0.6);
      ctx.lineTo(this.tx - len * 0.7, this.ty + len * 0.6);
      ctx.stroke();

      // 狂暴血滴与腥红电弧
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + p * 6;
        ctx.beginPath();
        ctx.moveTo(this.tx, this.ty);
        ctx.lineTo(this.tx + Math.cos(a) * 35, this.ty + Math.sin(a) * 28);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

// 14. 烛九阴【太古睁暝·逆转阴阳】—— 至尊神龙巨目睁暝、乾坤阴阳极光天罚、太古八卦天盘
class ZhuJiuyinTaijiCosmicEffect {
  constructor(tx, ty, duration = 1.1) {
    this.tx = tx; this.ty = ty;
    this.duration = duration;
    this.elapsed = 0;
    this.progress = 0;
    this.hasStruck = false;
  }
  update(dt, vfx) {
    this.elapsed += dt;
    this.progress = Math.min(1.0, this.elapsed / this.duration);

    if (!this.hasStruck && this.progress >= 0.35) {
      this.hasStruck = true;
      vfx.shake(18, 25);
      vfx.spawnCelestialVFX(this.tx, this.ty);
      if (typeof window !== 'undefined' && window.sound && window.sound.playBell) {
        window.sound.playBell();
      }
    }
    return this.progress < 1.0;
  }
  draw(ctx) {
    ctx.save();
    const p = this.progress;
    const alpha = p < 0.85 ? 1.0 : (1.0 - (p - 0.85) / 0.15);
    ctx.globalAlpha = Math.max(0, alpha);

    // 1. 苍穹虚空睁开两只上古神目 (0.0 ~ 0.5)
    if (p < 0.6) {
      const eyeP = Math.sin(Math.min(1.0, p / 0.35) * Math.PI);
      const eyeH = 14 * eyeP;

      // 左目 (烈日金乌神瞳)
      const ex1 = this.tx - 45;
      const ey1 = this.ty - 100;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(ex1, ey1, 24, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(ex1, ey1, 5, 0, Math.PI * 2); ctx.fill();

      // 右目 (九幽玄阴冷瞳)
      const ex2 = this.tx + 45;
      const ey2 = this.ty - 100;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(ex2, ey2, 24, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath(); ctx.arc(ex2, ey2, 5, 0, Math.PI * 2); ctx.fill();
    }

    // 2. 双极天罚神光柱从天顶贯穿地面 (0.28 ~ 0.85)
    if (p >= 0.28) {
      const beamP = Math.min(1.0, (p - 0.28) / 0.2);
      const beamW = 28 * Math.sin(beamP * Math.PI);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.fillRect(this.tx - beamW - 4, this.ty - 250, beamW, 250);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.fillRect(this.tx - beamW * 0.5 - 4, this.ty - 250, beamW * 0.5, 250);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(this.tx + 4, this.ty - 250, beamW, 250);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.fillRect(this.tx + 4, this.ty - 250, beamW * 0.5, 250);
    }

    // 3. 地表巨型阴阳太极八卦天盘 (飞速旋转并带有金蓝八卦符环)
    ctx.save();
    ctx.translate(this.tx, this.ty);
    ctx.rotate(this.elapsed * 3.0);

    const r = 56;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(0, -r / 2, r / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0369a1';
    ctx.beginPath(); ctx.arc(0, r / 2, r / 2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#0369a1';
    ctx.beginPath(); ctx.arc(0, -r / 2, r / 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, -r / 2, r / 10, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(0, r / 2, r / 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, r / 2, r / 10, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.stroke();

    for (let k = 0; k < 8; k++) {
      const ba = (Math.PI / 4) * k;
      const bx = Math.cos(ba) * (r + 14);
      const by = Math.sin(ba) * (r + 14);
      ctx.fillStyle = '#ecc981';
      ctx.fillRect(bx - 3, by - 3, 6, 6);
    }
    ctx.restore();

    ctx.restore();
  }
}
