/**
 * 《山海问道录·天衍棋局》大荒舆图 · 五藏山经随机路线地图系统 (Map System)
 * 采用层进分岔路线图算法 (Node Route Graph)，包含普通战斗、精英凶煞、大荒奇遇、灵泉道场、天宝商行与境主决战
 */

const MAP_NODE_TYPES = {
  BATTLE: {
    type: 'BATTLE',
    icon: '⚔️',
    title: '妖兽侵扰',
    desc: '遭遇大荒受蚀凶兽巡哨，战胜可获得天衍灵石与灵韵。'
  },
  ELITE: {
    type: 'ELITE',
    icon: '👹',
    title: '荒古精英',
    desc: '凶煞气象极盛的狂暴巨兽，胜之必得珍罕远古遗宝！'
  },
  EVENT: {
    type: 'EVENT',
    icon: '❓',
    title: '山海奇遇',
    desc: '大荒深处机缘偶现，吉凶未卜，全凭道友一念抉择。'
  },
  REST: {
    type: 'REST',
    icon: '🏕️',
    title: '灵泉道场',
    desc: '得遇天池灵脉汇聚之所，可阖目吐纳调养生息或淬炼法宝。'
  },
  SHOP: {
    type: 'SHOP',
    icon: '💎',
    title: '多宝商行',
    desc: '云游仙商设肆于此，可用天衍灵石换取稀世遗宝与回仙灵丹。'
  },
  BOSS: {
    type: 'BOSS',
    icon: '👑',
    title: '境主妖祖',
    desc: '盘踞于山经绝巅的荒古神魔真身！斩杀方能开启下一重山经道途！'
  }
};

class MountainMap {
  constructor(floorNumber) {
    this.floor = floorNumber;
    this.realmConfig = MOUNTAIN_REALMS.find(r => r.floor === floorNumber) || MOUNTAIN_REALMS[0];
    this.tiers = []; // 每一层的节点列表
    this.allNodes = new Map();
    this.currentNodeId = null;
    this.visitedNodeIds = [];

    this.generateMap();
  }

  // 1. 生成程序化分岔地图
  generateMap() {
    this.tiers = [];
    this.allNodes.clear();
    const tierCount = 6; // 0 到 5 阶

    // 第 0 阶：山门起点 (2~3 个分岔)
    const tier0 = this.createTierNodes(0, 3, ['BATTLE', 'EVENT', 'BATTLE']);
    this.tiers.push(tier0);

    // 第 1 阶：前哨探索 (3 个节点)
    const tier1 = this.createTierNodes(1, 3, ['BATTLE', 'EVENT', 'SHOP']);
    this.tiers.push(tier1);

    // 第 2 阶：深腹险境 (3 个节点，包含精英或灵泉)
    const tier2 = this.createTierNodes(2, 3, ['ELITE', 'REST', 'EVENT']);
    this.tiers.push(tier2);

    // 第 3 阶：奇峰纵横 (3 个节点)
    const tier3 = this.createTierNodes(3, 3, ['BATTLE', 'SHOP', 'EVENT']);
    this.tiers.push(tier3);

    // 第 4 阶：绝巅前夕 (2 个节点，灵泉修整或决战前精英)
    const tier4 = this.createTierNodes(4, 2, ['REST', 'ELITE']);
    this.tiers.push(tier4);

    // 第 5 阶：境主终点 (1 个 Boss 节点)
    const tier5 = this.createTierNodes(5, 1, ['BOSS']);
    this.tiers.push(tier5);

    // 2. 连接相邻层级路径
    this.connectTiers();

    // 3. 初始可选节点：第 0 层的所有节点
    this.currentNodeId = null;
    this.visitedNodeIds = [];
  }

  createTierNodes(tierIndex, count, preferredTypes) {
    const list = [];
    for (let i = 0; i < count; i++) {
      const typeKey = preferredTypes[i % preferredTypes.length];
      const typeDef = MAP_NODE_TYPES[typeKey];
      const id = `node_${this.floor}_${tierIndex}_${i}`;

      const node = {
        id,
        floor: this.floor,
        tier: tierIndex,
        index: i,
        type: typeKey,
        icon: typeDef.icon,
        title: typeDef.title,
        desc: typeDef.desc,
        connections: [], // 下一阶连接的节点 id
        isBoss: typeKey === 'BOSS'
      };

      this.allNodes.set(id, node);
      list.push(node);
    }
    return list;
  }

  // 连线逻辑：保证每一层的每个节点至少连到下一阶的一个节点，且下一阶的每个节点都被连接
  connectTiers() {
    for (let t = 0; t < this.tiers.length - 1; t++) {
      const currentTier = this.tiers[t];
      const nextTier = this.tiers[t + 1];

      currentTier.forEach((fromNode, fromIdx) => {
        // 计算映射比例连接 1~2 个邻近节点
        const ratio = fromIdx / Math.max(1, currentTier.length - 1);
        const targetIdx = Math.round(ratio * (nextTier.length - 1));

        fromNode.connections.push(nextTier[targetIdx].id);

        // 有概率连接相邻节点创造分岔
        if (nextTier.length > 1 && Math.random() < 0.6) {
          const altIdx = targetIdx + (fromIdx % 2 === 0 ? 1 : -1);
          if (altIdx >= 0 && altIdx < nextTier.length && !fromNode.connections.includes(nextTier[altIdx].id)) {
            fromNode.connections.push(nextTier[altIdx].id);
          }
        }
      });

      // 保证下一阶所有节点都至少有一条入边
      nextTier.forEach(toNode => {
        const hasIncoming = currentTier.some(from => from.connections.includes(toNode.id));
        if (!hasIncoming) {
          // 随机找一个最近的前序节点连过来
          const randomFrom = currentTier[Math.floor(Math.random() * currentTier.length)];
          if (!randomFrom.connections.includes(toNode.id)) {
            randomFrom.connections.push(toNode.id);
          }
        }
      });
    }
  }

  // 获取当前玩家可以前进访问的节点列表
  getAvailableNodes() {
    // 若尚未进入任何节点，则第 0 层所有节点可选
    if (!this.currentNodeId) {
      return this.tiers[0] || [];
    }
    const currentNode = this.allNodes.get(this.currentNodeId);
    if (!currentNode) return [];

    return currentNode.connections.map(id => this.allNodes.get(id)).filter(Boolean);
  }

  // 移动至指定节点
  moveToNode(nodeId) {
    const node = this.allNodes.get(nodeId);
    if (!node) return null;

    this.currentNodeId = nodeId;
    if (!this.visitedNodeIds.includes(nodeId)) {
      this.visitedNodeIds.push(nodeId);
    }
    return node;
  }

  isCompleted() {
    if (!this.currentNodeId) return false;
    const node = this.allNodes.get(this.currentNodeId);
    return node && node.type === 'BOSS' && this.visitedNodeIds.includes(node.id);
  }

  // 导出保存数据
  serialize() {
    return {
      floor: this.floor,
      currentNodeId: this.currentNodeId,
      visitedNodeIds: [...this.visitedNodeIds],
      tiers: this.tiers.map(tier =>
        tier.map(node => ({
          id: node.id,
          tier: node.tier,
          index: node.index,
          type: node.type,
          connections: [...node.connections]
        }))
      )
    };
  }

  // 从存档反序列化还原地图
  static deserialize(data) {
    const map = new MountainMap(data.floor);
    map.tiers = [];
    map.allNodes.clear();
    map.currentNodeId = data.currentNodeId;
    map.visitedNodeIds = [...(data.visitedNodeIds || [])];

    data.tiers.forEach(tierData => {
      const tierList = [];
      tierData.forEach(nd => {
        const typeDef = MAP_NODE_TYPES[nd.type] || MAP_NODE_TYPES.BATTLE;
        const node = {
          id: nd.id,
          floor: data.floor,
          tier: nd.tier,
          index: nd.index,
          type: nd.type,
          icon: typeDef.icon,
          title: typeDef.title,
          desc: typeDef.desc,
          connections: [...nd.connections],
          isBoss: nd.type === 'BOSS'
        };
        map.allNodes.set(nd.id, node);
        tierList.push(node);
      });
      map.tiers.push(tierList);
    });

    return map;
  }
}

window.MountainMap = MountainMap;
window.MAP_NODE_TYPES = MAP_NODE_TYPES;
