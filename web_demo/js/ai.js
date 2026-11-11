/**
 * 《山海问道录·天衍棋局》凶兽智能 AI 行为决策树
 */

class BeastAI {
  // 运行整轮敌方凶兽行动
  static async runEnemyTurn(game) {
    // 沙盒演武木桩模式：凶兽静立不反击
    if (game.practice && game.practice.isActive && game.practice.config.dummyEnemy) {
      game.addLog('【演武木桩】凶兽作为靶标静默伫立，不作反击。');
      await new Promise(r => setTimeout(r, 400));
      game.switchTurn(TEAM.PLAYER);
      return;
    }

    const enemies = game.units.filter(u => u.isAlive && u.team === TEAM.ENEMY);

    for (const beast of enemies) {
      if (!beast.isAlive || game.isGameOver) break;

      // 等待片刻，给玩家视觉缓冲
      await new Promise(r => setTimeout(r, 450));

      await this.executeBeastAction(beast, game);
    }

    // 敌方全员行动完毕，切回玩家回合
    await new Promise(r => setTimeout(r, 400));
    game.switchTurn(TEAM.PLAYER);
  }

  // 评估并执行单个凶兽的最佳战术行动
  static async executeBeastAction(beast, game) {
    const players = game.units.filter(u => u.isAlive && u.team === TEAM.PLAYER);
    if (players.length === 0) return;

    // 1. 获取所有可移动到的目标格 (包括原地)
    const reachableTiles = game.grid.getReachableTiles(beast, game.units);
    reachableTiles.push({ x: beast.x, y: beast.y, cost: 0, path: [{ x: beast.x, y: beast.y }] });

    // 2. 获取凶兽当前可用技能
    const usableSkills = beast.skills.filter(s => beast.qi >= s.costQi && !s.isHeal);

    let bestAction = null;
    let maxScore = -9999;

    // 3. 启发式评分遍历每一个位置与技能组合
    for (const moveTile of reachableTiles) {
      for (const skill of usableSkills) {
        for (const targetPlayer of players) {
          const dist = game.grid.getDistance(moveTile.x, moveTile.y, targetPlayer.x, targetPlayer.y);
          if (dist >= (skill.minRange || 1) && dist <= skill.range) {
            let score = 50;

            // 击杀权重 (若该技能可直接斩杀目标)
            const estDamage = Math.max(10, beast.attack * skill.damageScale - targetPlayer.defense * 0.5);
            if (targetPlayer.hp <= estDamage) {
              score += 150;
            }

            // 五行相克权重 (若凶兽五行克制该修士)
            if (ELEMENT_INFO[skill.element].counter === targetPlayer.element) {
              score += 45;
            }

            // 目标当前气血百分比越低越倾向于补刀
            score += (1 - (targetPlayer.hp / targetPlayer.maxHp)) * 30;

            // 距离权重 (离最近的玩家合适射程)
            score -= dist * 2;

            if (score > maxScore) {
              maxScore = score;
              bestAction = {
                moveTile,
                skill,
                target: targetPlayer
              };
            }
          }
        }
      }
    }

    // 4. 执行决策
    if (bestAction) {
      // 移动 (带平滑路径轨迹与移动动作精灵图)
      if (bestAction.moveTile.x !== beast.x || bestAction.moveTile.y !== beast.y) {
        window.sound.playMove();
        const path = bestAction.moveTile.path || [{ x: beast.x, y: beast.y }, { x: bestAction.moveTile.x, y: bestAction.moveTile.y }];
        await new Promise(r => beast.startPathMove(path, r));
      }

      // 调整朝向
      if (bestAction.target.x > beast.x) beast.facing = 'EAST';
      else if (bestAction.target.x < beast.x) beast.facing = 'WEST';
      else if (bestAction.target.y > beast.y) beast.facing = 'SOUTH';
      else beast.facing = 'NORTH';

      // 扣除真元并标记行动
      beast.consumeQi(bestAction.skill.costQi);
      beast.hasActed = true;

      // 施法攻击
      game.executeSkill(beast, bestAction.skill, bestAction.target.x, bestAction.target.y);
    } else {
      // 周围无攻击目标，向最近的修士寻路靠拢
      let closestPlayer = players[0];
      let minDist = 999;
      for (const p of players) {
        const d = game.grid.getDistance(beast.x, beast.y, p.x, p.y);
        if (d < minDist) {
          minDist = d;
          closestPlayer = p;
        }
      }

      // 寻找距离该修士最近的可达地格
      let bestMove = null;
      let minMoveDist = 999;
      for (const m of reachableTiles) {
        const d = game.grid.getDistance(m.x, m.y, closestPlayer.x, closestPlayer.y);
        if (d < minMoveDist) {
          minMoveDist = d;
          bestMove = m;
        }
      }

      if (bestMove && (bestMove.x !== beast.x || bestMove.y !== beast.y)) {
        window.sound.playMove();
        const path = bestMove.path || [{ x: beast.x, y: beast.y }, { x: bestMove.x, y: bestMove.y }];
        await new Promise(r => beast.startPathMove(path, r));
      }

      beast.hasActed = true;
    }
  }
}
