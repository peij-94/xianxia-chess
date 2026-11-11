/**
 * 《山海问道录·天衍棋局》16-Bit 战斗伤害结算与同调合击系统
 */

class CombatResolver {
  static checkElementRelation(attackerElem, defenderElem) {
    if (ELEMENT_INFO[attackerElem].counter === defenderElem) {
      return { relation: 'ADVANTAGE', rate: 1.35, label: '五行相克' };
    }
    if (ELEMENT_INFO[defenderElem].counter === attackerElem) {
      return { relation: 'DISADVANTAGE', rate: 0.75, label: '五行受抑' };
    }
    return { relation: 'NEUTRAL', rate: 1.0, label: '五行平正' };
  }

  static checkOrientation(attacker, defender) {
    const dx = attacker.x - defender.x;
    const dy = attacker.y - defender.y;

    let isBackstab = false;
    let isFlank = false;

    if (defender.facing === 'EAST' && dx < 0) isBackstab = true;
    else if (defender.facing === 'WEST' && dx > 0) isBackstab = true;
    else if (defender.facing === 'NORTH' && dy > 0) isBackstab = true;
    else if (defender.facing === 'SOUTH' && dy < 0) isBackstab = true;
    else if (dx !== 0 && dy !== 0) {
      isFlank = true;
    }

    if (isBackstab) {
      return { type: 'BACKSTAB', multiplier: 1.4, label: '绝脉背刺' };
    }
    if (isFlank) {
      return { type: 'FLANK', multiplier: 1.15, label: '侧翼夹击' };
    }
    return { type: 'FRONT', multiplier: 1.0, label: '正面交锋' };
  }

  // 结算攻击
  static resolveAttack({ attacker, defender, skill, grid, allUnits, game = null }) {
    const celestial = game ? game.celestialCycle : 'NORMAL';
    const hasRelic = (id) => game && game.roguelike && game.roguelike.isActive && game.roguelike.hasRelic(id);

    // 1. 治疗判定
    if (skill.isHeal) {
      let healAmount = skill.healAmount;
      // 太古闭目为夜：水木生机加深 +40%
      if (celestial === 'NIGHT' && (skill.element === ELEMENT.WOOD || skill.element === ELEMENT.WATER)) {
        healAmount = Math.round(healAmount * 1.4);
      }
      const actualHeal = defender.receiveHeal(healAmount);
      defender.statusEffects = [];
      return {
        isHeal: true,
        healAmount: actualHeal,
        log: `${attacker.name} 施展【${skill.name}】，为 ${defender.name} 恢复 ${actualHeal} 点气血！` +
             (celestial === 'NIGHT' ? ' [九幽夜幕生机+40%]' : '')
      };
    }

    // 2. 闪避判定 (建木林 20% 闪避 或 乘黄腾云吉光 20% 闪避)
    const defenderTerrain = grid.getTerrain(defender.x, defender.y);
    let dodgeRate = 0;
    if (defenderTerrain === TERRAIN_TYPE.WOOD_GROVE) dodgeRate += 0.2;
    if (defender.team === TEAM.PLAYER && hasRelic('CHENGHUANG_FUR')) dodgeRate += 0.2;

    if (dodgeRate > 0 && Math.random() < dodgeRate) {
      return {
        miss: true,
        damage: 0,
        log: `${defender.name} 踏虚闪避，化解了 ${attacker.name} 的攻势！`
      };
    }

    // 3. 基础伤害
    let baseDamage = Math.max(
      8,
      (attacker.getEffectiveAttack() - defender.getEffectiveDefense() * 0.5) * skill.damageScale
    );

    // 穷奇扑杀：对残血 (气血低于40%) 目标嗜血斩杀 +50% 伤害
    let isExecute = false;
    if (skill.id === 'QIONGQI_DIVE' && defender.hp < defender.maxHp * 0.4) {
      baseDamage *= 1.5;
      isExecute = true;
    }

    // 4. 五行倍率
    const elemResult = this.checkElementRelation(skill.element, defender.element);

    // 5. 火脉地形
    const attackerTerrain = grid.getTerrain(attacker.x, attacker.y);
    let terrainMult = 1.0;
    if (attackerTerrain === TERRAIN_TYPE.FIRE_VEIN && skill.element === ELEMENT.FIRE) {
      terrainMult = 1.35;
    }

    // 6. 朝向判定
    const posResult = this.checkOrientation(attacker, defender);

    // 7. 暴击判定
    let critChance = 0.15;
    if (posResult.type === 'BACKSTAB') critChance = 1.0;
    // 烛龙睁目为昼：全员暴击率 +30%
    if (celestial === 'DAY') critChance += 0.3;
    // 遗宝刑天战戚：残血必暴击
    if (attacker.team === TEAM.PLAYER && hasRelic('XINGTONG_AXE') && attacker.hp < attacker.maxHp * 0.5) {
      critChance = 1.0;
    }

    let isCrit = Math.random() < critChance;
    let critMult = isCrit ? 1.5 : 1.0;

    // 昼夜属性增伤：白昼火/金伤害 +25%
    let celestialDamageMult = 1.0;
    if (celestial === 'DAY' && (skill.element === ELEMENT.FIRE || skill.element === ELEMENT.METAL)) {
      celestialDamageMult = 1.25;
    }

    let finalDamage = Math.round(baseDamage * elemResult.rate * terrainMult * posResult.multiplier * critMult * celestialDamageMult);

    // 遗宝祝融神令：额外附加 18 点火系真伤
    let relicBonus = 0;
    if (attacker.team === TEAM.PLAYER && hasRelic('ZHURONG_TOKEN')) {
      relicBonus = 18;
      finalDamage += relicBonus;
    }

    finalDamage = Math.max(1, finalDamage);

    // 8. 同调合击判定 (修仙者与契约兽相邻时触发追加伤害)
    let resonanceBonus = 0;
    if (attacker.team === TEAM.PLAYER) {
      const allyBeast = allUnits.find(u => u.isAlive && u.id !== attacker.id && u.team === TEAM.PLAYER && (u.templateId === 'bifang' || u.templateId === 'baiqian'));
      if (allyBeast && grid.getDistance(attacker.x, attacker.y, allyBeast.x, allyBeast.y) <= 2) {
        resonanceBonus = Math.round(finalDamage * 0.25);
        finalDamage += resonanceBonus;
      }
    }

    // 沙盒演武纯阳不灭判定
    if (game && game.practice && game.practice.isActive && game.practice.config.invinciblePlayer && defender.team === TEAM.PLAYER) {
      finalDamage = 0;
    }

    defender.takeDamage(finalDamage);

    // 昆仑灵髓遗宝：反震 25% 伤害给攻击者
    let reflectDmg = 0;
    if (defender.team === TEAM.PLAYER && hasRelic('KUNLUN_JADE') && attacker.isAlive) {
      reflectDmg = Math.round(finalDamage * 0.25);
      attacker.takeDamage(reflectDmg);
    }

    // 9. 负面状态
    if (skill.debuff) {
      defender.addStatus(skill.debuff);
    }

    // 10. 穷奇嗜血狂性再动：击杀目标后真元+1并重置行动
    let qiongqiReset = false;
    if (skill.id === 'QIONGQI_DIVE' && !defender.isAlive) {
      attacker.qi = Math.min(attacker.maxQi, attacker.qi + 1);
      attacker.hasActed = false;
      qiongqiReset = true;
    }

    // 11. 击退与碰撞
    let collisionInfo = null;
    if (skill.knockback && skill.knockback > 0) {
      const kdx = Math.sign(defender.x - attacker.x);
      const kdy = Math.sign(defender.y - attacker.y);
      const targetX = defender.x + kdx * skill.knockback;
      const targetY = defender.y + kdy * skill.knockback;

      const isBlocked = !grid.isValid(targetX, targetY) ||
                        !grid.isPassable(targetX, targetY) ||
                        allUnits.some(u => u.isAlive && u.id !== defender.id && u.x === targetX && u.y === targetY);

      if (isBlocked) {
        const collisionDmg = Math.round(finalDamage * 0.35);
        defender.takeDamage(collisionDmg);
        collisionInfo = { hitWall: true, collisionDmg };
      } else {
        defender.x = targetX;
        defender.y = targetY;
        collisionInfo = { hitWall: false, newX: targetX, newY: targetY };
      }
    }

    let logText = `${attacker.name} 施展【${skill.name}】命中 ${defender.name}！` +
      (elemResult.relation === 'ADVANTAGE' ? ` [${elemResult.label}+35%]` : '') +
      (elemResult.relation === 'DISADVANTAGE' ? ` [${elemResult.label}-25%]` : '') +
      (posResult.type === 'BACKSTAB' ? ` [绝脉背刺!]` : '') +
      (celestial === 'DAY' ? ` [烈阳普照增幅]` : '') +
      (isExecute ? ` [凶风嗜血斩杀+50%!]` : '') +
      (relicBonus > 0 ? ` [祝融神火+18]` : '') +
      (resonanceBonus > 0 ? ` [大荒同调合击+25%!]` : '') +
      ` 造成 ${finalDamage} 伤害！` +
      (collisionInfo && collisionInfo.hitWall ? ` 目标撞击巨岩，额外承受 ${collisionInfo.collisionDmg} 崩裂伤害！` : '') +
      (reflectDmg > 0 ? ` 昆仑剑意反震 ${reflectDmg} 点伤害！` : '') +
      (!defender.isAlive ? ` ${defender.name} 气绝败亡！` : '') +
      (qiongqiReset ? ` 【穷奇凶威】嗜血破限，立即重置行动！` : '');

    return {
      isHeal: false,
      damage: finalDamage,
      elemResult,
      posResult,
      isCrit,
      resonanceBonus,
      collisionInfo,
      targetKilled: !defender.isAlive,
      qiongqiReset,
      reflectDmg,
      log: logText
    };
  }
}

