/**
 * 《山海问道录·天衍棋局》16-Bit 国风像素战棋核心渲染引擎
 */

class BoardRenderer {
  constructor(canvas, grid, vfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grid = grid;
    this.vfx = vfx;

    this.tileSize = 64; // 像素棋盘格大小
    this.time = 0;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
  }

  initCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const width = 900;
    const height = 900;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false; // 严格保持像素画锐度
    this.tileSize = Math.floor(width / this.grid.cols);
  }

  // 渲染总入口
  render(state) {
    this.time += 0.04;
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // 屏幕震颤偏移
    const shake = this.vfx.getShakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    // 1. 绘制像素地脉与网格
    this.drawPixelTerrain();

    // 2. 绘制移动/攻击高亮像素框
    this.drawPixelHighlights(state);

    // 3. 绘制鼠标悬停地格
    this.drawHoverPixelTile(state);

    // 4. 绘制像素角色与山海异兽精灵
    this.drawPixelUnits(state);

    // 5. 绘制太古昼夜天象氛围罩
    this.drawCelestialOverlay(w, h, state.celestialCycle);

    // 6. 绘制像素特效与伤害飘字
    this.vfx.draw(ctx);

    ctx.restore();
  }

  // 绘制太古阴阳昼夜光影
  drawCelestialOverlay(w, h, cycle) {
    if (!cycle || cycle === 'NORMAL') return;
    const ctx = this.ctx;
    ctx.save();

    if (cycle === 'DAY') {
      // 烈阳金昼氛围
      ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
      ctx.fillRect(0, 0, w, h);

      // 顶部天象仙纹角标
      ctx.fillStyle = 'rgba(13, 19, 23, 0.85)';
      ctx.fillRect(10, 10, 240, 24);
      ctx.strokeStyle = '#ecc981';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 240, 24);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px "SimSun", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌞【太古神昼】全员暴击+30% 金火+25%', 16, 22);
    } else if (cycle === 'NIGHT') {
      // 九幽玄夜氛围
      ctx.fillStyle = 'rgba(10, 15, 36, 0.38)';
      ctx.fillRect(0, 0, w, h);

      // 顶部天象仙纹角标
      ctx.fillStyle = 'rgba(13, 19, 23, 0.85)';
      ctx.fillRect(10, 10, 240, 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 240, 24);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "SimSun", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌙【九幽玄夜】步法/射程-1 水木回春+40%', 16, 22);
    }

    ctx.restore();
  }


  // 1. 绘制像素地貌
  drawPixelTerrain() {
    const ctx = this.ctx;
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        const terrain = this.grid.getTerrain(x, y);

        // 调用像素地块渲染器
        window.pixelTileset.drawTile(ctx, terrain, px, py, this.tileSize, this.time);
      }
    }
  }

  // 2. 绘制移动/攻击选择指示 (仅在行动交互时显示柔和灵韵光圈，无网格)
  drawPixelHighlights(state) {
    const ctx = this.ctx;
    const pulse = Math.sin(this.time * 5) * 2;

    // 移动可达格 (轻柔流光玉莲灵气环，无硬方格)
    if (state.moveTiles && state.moveTiles.length > 0) {
      state.moveTiles.forEach(t => {
        const px = t.x * this.tileSize;
        const py = t.y * this.tileSize;
        const s = this.tileSize;
        const cx = px + s / 2;
        const cy = py + s / 2;

        ctx.save();
        // 柔和地脉灵气光晕
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, s * 0.44);
        grad.addColorStop(0, 'rgba(52, 211, 153, 0.38)');
        grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.18)');
        grad.addColorStop(1, 'rgba(5, 150, 105, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // 外围流转细灵纹
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.38 + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // 中心踏星步微芒
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
        ctx.restore();
      });
    }

    // 技能射程高亮 (仅施法时显示靶向道符，无硬边框)
    if (state.skillTargets && state.skillTargets.length > 0) {
      const isHeal = state.selectedSkill && state.selectedSkill.isHeal;
      state.skillTargets.forEach(t => {
        const px = t.x * this.tileSize;
        const py = t.y * this.tileSize;
        const s = this.tileSize;
        const cx = px + s / 2;
        const cy = py + s / 2;
        const occUnit = state.units.find(u => u.isAlive && u.x === t.x && u.y === t.y);

        ctx.save();
        if (isHeal) {
          const isAlly = occUnit && occUnit.team === TEAM.PLAYER;
          const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, s * 0.42);
          grad.addColorStop(0, isAlly ? 'rgba(74, 222, 128, 0.45)' : 'rgba(74, 222, 128, 0.2)');
          grad.addColorStop(1, 'rgba(74, 222, 128, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isAlly ? '#4ade80' : 'rgba(74, 222, 128, 0.4)';
          ctx.lineWidth = isAlly ? 2 : 1;
          ctx.stroke();
        } else {
          const isEnemy = occUnit && occUnit.team === TEAM.ENEMY;
          const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, s * 0.42);
          grad.addColorStop(0, isEnemy ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.18)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isEnemy ? '#ef4444' : 'rgba(239, 68, 68, 0.35)';
          ctx.lineWidth = isEnemy ? 2 : 1;
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // AOE 覆盖高亮 (金芒流光太极扩散圈)
    if (state.aoeTiles && state.aoeTiles.length > 0) {
      state.aoeTiles.forEach(t => {
        const px = t.x * this.tileSize;
        const py = t.y * this.tileSize;
        const s = this.tileSize;
        const cx = px + s / 2;
        const cy = py + s / 2;

        ctx.save();
        const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, s * 0.48);
        grad.addColorStop(0, 'rgba(236, 201, 129, 0.55)');
        grad.addColorStop(0.8, 'rgba(236, 201, 129, 0.25)');
        grad.addColorStop(1, 'rgba(236, 201, 129, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }

  // 3. 仅在有效行动交互时渲染目标指示，平时空地绝无网格方框
  drawHoverPixelTile(state) {
    if (!state.hoveredTile) return;
    const { x, y } = state.hoveredTile;
    const isMoveDest = state.moveTiles && state.moveTiles.some(t => t.x === x && t.y === y);
    const isSkillTarget = state.skillTargets && state.skillTargets.some(t => t.x === x && t.y === y);
    const hoveredUnit = state.units.find(u => u.isAlive && u.x === x && u.y === y);

    // 仅在移动落点、技能锁定或悬停在单位时高亮，平时空旷战场无任何网格线
    if (!isMoveDest && !isSkillTarget && !hoveredUnit) return;

    const px = x * this.tileSize;
    const py = y * this.tileSize;
    const s = this.tileSize;
    const cx = px + s / 2;
    const cy = py + s / 2;
    const ctx = this.ctx;

    ctx.save();
    if (isMoveDest) {
      // 移动落点：明亮青碧莲华踏足圈
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fill();
    } else if (isSkillTarget) {
      // 技能锁定：赤金八卦诛邪准星
      const isHeal = state.selectedSkill && state.selectedSkill.isHeal;
      const col = isHeal ? '#4ade80' : '#f43f5e';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // 准星四方符文点
      ctx.fillStyle = col;
      ctx.fillRect(cx - 1, cy - s * 0.48, 2, 6);
      ctx.fillRect(cx - 1, cy + s * 0.48 - 6, 2, 6);
      ctx.fillRect(cx - s * 0.48, cy - 1, 6, 2);
      ctx.fillRect(cx + s * 0.48 - 6, cy - 1, 6, 2);
    } else if (hoveredUnit) {
      // 单位底座气盘微光
      ctx.strokeStyle = hoveredUnit.team === TEAM.PLAYER ? 'rgba(74, 222, 128, 0.7)' : 'rgba(248, 113, 113, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, py + s * 0.76, s * 0.38, s * 0.16, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. 绘制 2.5D 像素角色棋子与法台 (支持平滑移动轨迹与踏星残影)
  drawPixelUnits(state) {
    const ctx = this.ctx;

    // 先绘制所有移动中单位的仙风道轨与踏星残影 (在单位下方地面)
    state.units.forEach(unit => {
      if (!unit.isAlive) return;
      this.drawUnitMoveTrail(ctx, unit);
    });

    state.units.forEach(unit => {
      if (!unit.isAlive) return;

      const curX = unit.renderX !== undefined ? unit.renderX : unit.x;
      const curY = unit.renderY !== undefined ? unit.renderY : unit.y;
      const px = curX * this.tileSize;
      const py = curY * this.tileSize;
      const cx = px + this.tileSize / 2;
      const cy = py + this.tileSize / 2;

      ctx.save();

      // 1. 2.5D 莲华法台底座与方向软阴影
      this.draw25DPedestal(ctx, cx, cy, unit, state);

      // 2. 角色精灵本体 (站在 2.5D 法台上，无方块背景)
      if (unit.isDone) {
        ctx.globalAlpha = 0.55;
      }
      window.pixelSpriteEngine.drawUnitSprite(ctx, unit, cx, cy - 2, this.tileSize, {
        time: this.time,
        isSelected: state.selectedUnit && state.selectedUnit.id === unit.id
      });
      ctx.globalAlpha = 1.0;

      // 3. 顶部 2.5D 晶石血条
      this.drawPixelHealthBar(ctx, px, py, unit);

      // 4. 底部真元晶石槽
      this.drawPixelQiSlots(ctx, px, py, unit);

      // 5. 五行属性印章角标 (右下角)
      this.drawPixelElementBadge(ctx, px, py, unit.element);

      // 6. 朝向微指针
      this.drawPixelFacing(ctx, px, py, unit.facing);

      ctx.restore();
    });
  }

  // 绘制踏星步法与仙风移动轨迹 (Movement Path & Starlight Trail)
  drawUnitMoveTrail(ctx, unit) {
    const isAlly = unit.team === TEAM.PLAYER;
    const trailCol = isAlly ? '#38bdf8' : '#f87171';
    const s = this.tileSize;

    ctx.save();

    // 1. 绘制完整规划路径的流光仙轨虚线
    if (unit.isMoving && unit.movePath && unit.movePath.length > 1) {
      // 底层宽域流光导轨
      ctx.strokeStyle = isAlly ? 'rgba(56, 189, 248, 0.25)' : 'rgba(248, 113, 113, 0.25)';
      ctx.lineWidth = 5.0;
      ctx.beginPath();
      const curX = (unit.renderX + 0.5) * s;
      const curY = (unit.renderY + 0.5) * s;
      ctx.moveTo(curX, curY);
      for (let i = unit.currentPathIndex; i < unit.movePath.length; i++) {
        const pt = unit.movePath[i];
        ctx.lineTo((pt.x + 0.5) * s, (pt.y + 0.5) * s);
      }
      ctx.stroke();

      // 表层明亮八卦仙道虚线
      ctx.strokeStyle = isAlly ? '#38bdf8' : '#f87171';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -this.time * 30; // 快速流光游走
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      for (let i = unit.currentPathIndex; i < unit.movePath.length; i++) {
        const pt = unit.movePath[i];
        ctx.lineTo((pt.x + 0.5) * s, (pt.y + 0.5) * s);
      }
      ctx.stroke();
      ctx.setLineDash([]); // 还原

      // 在路径各关键地脉节点绘制阵位符石
      for (let i = unit.currentPathIndex; i < unit.movePath.length; i++) {
        const pt = unit.movePath[i];
        const nx = (pt.x + 0.5) * s;
        const ny = (pt.y + 0.5) * s;
        ctx.fillStyle = isAlly ? 'rgba(236, 201, 129, 0.8)' : 'rgba(248, 113, 113, 0.8)';
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 在终点绘制接引八卦光环
      const finalDest = unit.movePath[unit.movePath.length - 1];
      if (finalDest) {
        const fx = (finalDest.x + 0.5) * s;
        const fy = (finalDest.y + 0.5) * s;
        ctx.strokeStyle = isAlly ? '#ecc981' : '#f87171';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(fx, fy, s * 0.38, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = isAlly ? 'rgba(236, 201, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)';
        ctx.fill();
      }
    }

    // 2. 绘制脚下踏星残影点 (Ghost Starlight Steps)
    if (unit.trailPositions && unit.trailPositions.length > 0) {
      unit.trailPositions.forEach(pos => {
        const cx = (pos.x + 0.5) * s;
        const cy = (pos.y + 0.5) * s + s * 0.25;
        const alpha = Math.max(0, pos.alpha);

        ctx.fillStyle = isAlly ? `rgba(56, 189, 248, ${alpha * 0.35})` : `rgba(248, 113, 113, ${alpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, s * 0.28, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isAlly ? `rgba(236, 201, 129, ${alpha * 0.6})` : `rgba(251, 113, 133, ${alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  // 绘制 2.5D 实体莲华法台底座 (Tiered Isometric Pedestal)
  draw25DPedestal(ctx, cx, cy, unit, state) {
    const isSelected = state.selectedUnit && state.selectedUnit.id === unit.id;
    const isAlly = unit.team === TEAM.PLAYER;
    const s = this.tileSize;
    const rx = s * 0.40;
    const ry = s * 0.17;
    const baseOffsetY = s * 0.28;

    ctx.save();

    // 1. 地面柔和 2.5D 投影 (Directional Ambient Occlusion)
    ctx.fillStyle = 'rgba(5, 8, 10, 0.52)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + baseOffsetY + 3, rx * 1.15, ry * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 2.5D 实体底座厚度边缘 (Bevel Extrusion)
    ctx.fillStyle = isAlly ? '#12261d' : '#281010';
    ctx.beginPath();
    ctx.ellipse(cx, cy + baseOffsetY + 2, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. 2.5D 顶面玉盘 (Isometric Jade Ring Disc)
    const discGrad = ctx.createLinearGradient(cx - rx, cy + baseOffsetY, cx + rx, cy + baseOffsetY);
    if (isAlly) {
      discGrad.addColorStop(0, '#193327');
      discGrad.addColorStop(0.5, '#2e5b46');
      discGrad.addColorStop(1, '#193327');
    } else {
      discGrad.addColorStop(0, '#361514');
      discGrad.addColorStop(0.5, '#5c221e');
      discGrad.addColorStop(1, '#361514');
    }
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + baseOffsetY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. 金曜/赤华法阵描边
    ctx.strokeStyle = isAlly ? 'rgba(236, 201, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)';
    ctx.lineWidth = isSelected ? 2.0 : 1.2;
    ctx.stroke();

    // 5. 选中状态：旋转 2.5D 六芒阵芒
    if (isSelected) {
      const rot = this.time * 2.5;
      for (let i = 0; i < 6; i++) {
        const a = rot + (Math.PI * 2 / 6) * i;
        const gx = cx + Math.cos(a) * (rx + 2);
        const gy = cy + baseOffsetY + Math.sin(a) * (ry + 1);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
      }
    }

    ctx.restore();
  }

  // 绘制 16-bit 像素血条
  drawPixelHealthBar(ctx, px, py, unit) {
    const bw = this.tileSize - 10;
    const bh = 4;
    const bx = px + 5;
    const by = py + 2;

    // 像素黑框底槽
    ctx.fillStyle = '#0a0d0e';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);

    const ratio = Math.max(0, unit.hp / unit.maxHp);
    const fillW = Math.floor(bw * ratio);

    // 玩家方为翠绿，敌方为朱红
    const hpColor = unit.team === TEAM.PLAYER ? '#50a274' : '#ef4444';
    const hpLight = unit.team === TEAM.PLAYER ? '#8effa9' : '#fca5a5';

    ctx.fillStyle = hpColor;
    ctx.fillRect(bx, by, fillW, bh);

    // 顶部 1px 高光
    if (fillW > 0) {
      ctx.fillStyle = hpLight;
      ctx.fillRect(bx, by, fillW, 1);
    }
  }

  // 绘制像素真元槽 (蓝色小像素方格)
  drawPixelQiSlots(ctx, px, py, unit) {
    const maxSlots = Math.min(5, unit.maxQi);
    const bx = px + Math.floor((this.tileSize - maxSlots * 6) / 2);
    const by = py + this.tileSize - 5;

    for (let i = 0; i < maxSlots; i++) {
      const sx = bx + i * 6;
      const hasQi = i < unit.qi;

      // 槽框
      ctx.fillStyle = '#080c0e';
      ctx.fillRect(sx, by, 5, 3);

      if (hasQi) {
        ctx.fillStyle = '#55a8f2';
        ctx.fillRect(sx + 1, by + 1, 3, 1);
      } else {
        ctx.fillStyle = '#1c2833';
        ctx.fillRect(sx + 1, by + 1, 3, 1);
      }
    }
  }

  // 五行属性像素印章 (右下)
  drawPixelElementBadge(ctx, px, py, elem) {
    const conf = ELEMENT_INFO[elem];
    const s = 10;
    const bx = px + this.tileSize - s - 2;
    const by = py + this.tileSize - s - 2;

    // 像素小圆/方块底座
    ctx.fillStyle = '#0d1317';
    ctx.fillRect(bx, by, s, s);
    ctx.fillStyle = conf.color;
    ctx.fillRect(bx + 1, by + 1, s - 2, s - 2);

    // 篆体首字
    ctx.fillStyle = '#0a0d0f';
    ctx.font = 'bold 8px "SimSun", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(conf.name, bx + s / 2, by + s / 2);
  }

  // 像素朝向小三角
  drawPixelFacing(ctx, px, py, facing) {
    const cx = px + this.tileSize / 2;
    const cy = py + this.tileSize - 8;
    ctx.fillStyle = '#ecc981';

    if (facing === 'EAST') {
      ctx.fillRect(cx + 6, cy, 2, 3);
      ctx.fillRect(cx + 8, cy + 1, 2, 1);
    } else if (facing === 'WEST') {
      ctx.fillRect(cx - 8, cy, 2, 3);
      ctx.fillRect(cx - 10, cy + 1, 2, 1);
    }
  }
}
