/**
 * 《山海问道录·天衍棋局》16-Bit 国风像素地块渲染器 (Pixel Tileset)
 * 采用纯正复古像素网格与经典东方青绿山水/泥金/朱砂调色板
 */

class PixelTileset {
  constructor() {
    this.tileSize = 64; // 渲染格像素大小
    this.tileCanvasCache = new Map();
    this.animTime = 0;
    this.initTilePatterns();
  }

  // 预生成基础静态地块离屏像素缓冲
  initTilePatterns() {
    // 为 5 种地形创建离屏 Canvas
    Object.values(TERRAIN_TYPE).forEach(type => {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.renderBaseTile(ctx, type);
      this.tileCanvasCache.set(type, c);
    });
  }

  // 绘制 32x32 基础像素地块
  renderBaseTile(ctx, type) {
    const P = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };

    const Rect = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    switch (type) {
      case TERRAIN_TYPE.PLAIN: {
        // 【凡土平原】：自然有机大荒草甸与泥金微尘，无方格边界
        Rect(0, 0, 32, 32, '#141d18');

        // 柔和起伏的草甸色块与青黛质感
        Rect(2, 4, 12, 10, '#16231d');
        Rect(16, 12, 14, 12, '#182720');
        Rect(4, 18, 10, 8, '#131b16');

        // 点缀几簇青翠仙草与苍苔
        const grassPoints = [
          [6, 8], [7, 7], [8, 8], [6, 9],
          [22, 18], [23, 17], [24, 18], [23, 19],
          [14, 25], [15, 24], [16, 25], [28, 6], [4, 27]
        ];
        grassPoints.forEach(([x, y]) => P(x, y, '#2e583c'));

        // 泥金微尘（太古灵脉地气星尘，非网格标记）
        P(11, 14, '#38301c'); P(21, 23, '#38301c');
        break;
      }

      case TERRAIN_TYPE.WATER_SPRING: {
        // 【水华天泉】：无方格拘束的自然灵湖水泽
        Rect(0, 0, 32, 32, '#0f1d2a');
        Rect(2, 2, 28, 28, '#142a3e');
        Rect(5, 5, 22, 22, '#1a3752');
        Rect(8, 8, 16, 16, '#234a6d');

        // 柔和水草与浮光
        P(10, 11, '#3b78aa'); P(11, 11, '#539ed8');
        P(20, 18, '#3b78aa'); P(21, 18, '#539ed8');
        break;
      }

      case TERRAIN_TYPE.FIRE_VEIN: {
        // 【祝融火脉】：自然蜿蜒的火山地裂地脉
        Rect(0, 0, 32, 32, '#1a0d0c');
        Rect(4, 4, 24, 24, '#241210');

        // 裂缝暗红底与天然熔岩流
        const lavaCracks = [
          [5, 12], [6, 12], [7, 13], [8, 14], [9, 14], [10, 15], [11, 15],
          [12, 16], [13, 16], [14, 16], [15, 15], [16, 14], [17, 13], [18, 13],
          [19, 12], [20, 11], [21, 10], [22, 10], [23, 9], [24, 9],
          [13, 17], [13, 18], [14, 19], [14, 20], [15, 21], [16, 22], [17, 23],
          [7, 14], [6, 15], [5, 16], [4, 17]
        ];
        lavaCracks.forEach(([x, y]) => {
          Rect(x, y, 2, 2, '#8f2518');
          P(x, y, '#e65134');
        });
        break;
      }

      case TERRAIN_TYPE.WOOD_GROVE: {
        // 【建木古林】：郁郁葱葱的自然林木与浮阴，无方格
        Rect(0, 0, 32, 32, '#102217');
        Rect(2, 2, 28, 28, '#163122');
        Rect(6, 6, 20, 20, '#1c3d2b');

        // 翠绿像素竹叶/树冠纹样
        for (let i = 0; i < 7; i++) {
          const rx = 4 + (i * 5) % 22;
          const ry = 4 + (i * 6) % 22;
          Rect(rx, ry, 3, 2, '#2d613e');
          P(rx + 1, ry - 1, '#4db672');
        }
        break;
      }

      case TERRAIN_TYPE.STONE_WALL: {
        // 【玄黄巨岩】：立体巍峨的太古仙峰玄石
        Rect(0, 0, 32, 32, '#141412');
        Rect(3, 3, 26, 13, '#3a3731');
        Rect(5, 5, 22, 9, '#524e45');
        Rect(9, 6, 12, 5, '#6b665a');

        // 岩石下部阴影
        Rect(3, 16, 26, 13, '#21201c');
        Rect(5, 18, 22, 9, '#181715');

        // 裂纹与棱角
        P(10, 7, '#35332c'); P(11, 8, '#35332c'); P(12, 9, '#21201c');
        P(12, 10, '#21201c'); P(13, 11, '#21201c');
        P(20, 9, '#35332c'); P(21, 10, '#21201c');
        break;
      }
    }
  }

  // 绘制动态地块到主画布
  drawTile(ctx, type, px, py, size, time) {
    const baseCanvas = this.tileCanvasCache.get(type);
    if (!baseCanvas) return;

    // 绘制基础像素贴图（点对点像素缩放）
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(baseCanvas, 0, 0, 32, 32, px, py, size, size);

    // 动态像素光效层
    if (type === TERRAIN_TYPE.WATER_SPRING) {
      // 灵泉中心像素涟漪波动
      const wave = Math.floor((Math.sin(time * 3) + 1) * 3);
      ctx.fillStyle = 'rgba(142, 207, 255, 0.6)';
      ctx.fillRect(px + size * 0.35 - wave, py + size * 0.45, size * 0.3 + wave * 2, 2);
      ctx.fillRect(px + size * 0.42, py + size * 0.35 - wave, 2, size * 0.3 + wave * 2);
    } else if (type === TERRAIN_TYPE.FIRE_VEIN) {
      // 祝融火脉核心岩浆脉冲闪烁
      const pulse = Math.floor((Math.sin(time * 5) + 1) * 2);
      ctx.fillStyle = pulse > 2 ? '#ff9a42' : '#f24822';
      ctx.fillRect(px + size * 0.4, py + size * 0.4, 6, 6);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(px + size * 0.44, py + size * 0.44, 3, 3);
    } else if (type === TERRAIN_TYPE.WOOD_GROVE) {
      // 建木林叶间萤火微光
      const sparkY = (Math.sin(time * 2 + px) + 1) * 4;
      ctx.fillStyle = '#8effa9';
      ctx.fillRect(px + size * 0.3, py + size * 0.6 - sparkY, 3, 3);
      ctx.fillRect(px + size * 0.7, py + size * 0.3 + sparkY, 2, 2);
    }
  }
}

window.pixelTileset = new PixelTileset();
