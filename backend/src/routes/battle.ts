import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import Player from '../models/Player';
import Monster from '../models/Monster';

const router = express.Router();

// 统一错误处理
const validateResult = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: '参数校验失败',
      data: errors.array()
    });
  }
  next();
};

// 获取当前区域可挑战的怪物列表
router.get('/monsters', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.user!._id);
    if (!player) {
      return res.status(404).json({
        code: 404,
        message: '玩家不存在',
        data: null
      });
    }

    // 查询当前区域的怪物
    const monsters = await Monster.find({ area: player.location });

    res.json({
      code: 200,
      message: '获取怪物列表成功',
      data: monsters
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '获取怪物列表失败',
      data: err instanceof Error ? err.message : err
    });
  }
});

// 发起战斗接口
router.post('/start', auth, [
  body('monsterId').notEmpty().withMessage('怪物ID不能为空')
], validateResult, async (req, res) => {
  try {
    const { monsterId } = req.body;
    const playerId = req.user!._id;

    // 开启MongoDB事务，保证数据一致性
    const session = await Player.startSession();
    session.startTransaction();

    try {
      // 查询玩家（加锁，防止并发修改）
      const player = await Player.findById(playerId).session(session);
      if (!player) {
        await session.abortTransaction();
        return res.status(404).json({
          code: 404,
          message: '玩家不存在',
          data: null
        });
      }

      // 检查玩家血量
      if (player.hp <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          code: 400,
          message: '你已经受伤了，先休息一下恢复血量吧',
          data: null
        });
      }

      // 查询怪物
      const monster = await Monster.findOne({ id: monsterId }).session(session);
      if (!monster) {
        await session.abortTransaction();
        return res.status(404).json({
          code: 404,
          message: '怪物不存在',
          data: null
        });
      }

      // 检查怪物是否在当前区域
      if (monster.area !== player.location) {
        await session.abortTransaction();
        return res.status(400).json({
          code: 400,
          message: '该怪物不在当前区域',
          data: null
        });
      }

      // 战斗逻辑
      const battleLog: string[] = [];
      let playerHp = player.hp;
      let monsterHp = monster.hp;
      let isPlayerWin = false;

      battleLog.push(`你向${monster.name}发起了挑战！`);
      battleLog.push(`你的生命值: ${playerHp} | ${monster.name}的生命值: ${monsterHp}`);

      // 回合制战斗
      let round = 1;
      while (playerHp > 0 && monsterHp > 0) {
        battleLog.push(`\n===== 第${round}回合 =====`);

        // 玩家先攻击
        const playerDamage = Math.max(1, player.attack - monster.defense + Math.floor(Math.random() * 5));
        // 10%概率暴击
        const isCrit = Math.random() < 0.1;
        const finalPlayerDamage = isCrit ? Math.floor(playerDamage * 1.5) : playerDamage;
        monsterHp = Math.max(0, monsterHp - finalPlayerDamage);

        battleLog.push(`你对${monster.name}造成了${finalPlayerDamage}点伤害${isCrit ? '（暴击！）' : ''}`);
        battleLog.push(`${monster.name}剩余生命值: ${monsterHp}`);

        if (monsterHp <= 0) {
          isPlayerWin = true;
          break;
        }

        // 怪物反击
        const monsterDamage = Math.max(1, monster.attack - player.defense + Math.floor(Math.random() * 3));
        // 15%概率闪避
        const isDodge = Math.random() < 0.15;
        const finalMonsterDamage = isDodge ? 0 : monsterDamage;
        playerHp = Math.max(0, playerHp - finalMonsterDamage);

        if (isDodge) {
          battleLog.push(`你灵巧地躲开了${monster.name}的攻击！`);
        } else {
          battleLog.push(`${monster.name}对你造成了${finalMonsterDamage}点伤害`);
          battleLog.push(`你剩余生命值: ${playerHp}`);
        }

        round++;
      }

      // 战斗结果处理
      if (isPlayerWin) {
        battleLog.push(`\n🎉 你成功击败了${monster.name}！`);

        // 计算经验值奖励（等级差调整）
        const levelDiff = player.level - monster.level;
        let expGain = monster.expReward;
        if (levelDiff > 3) {
          expGain = Math.floor(expGain * 0.5); // 等级太高，经验减半
        } else if (levelDiff < -2) {
          expGain = Math.floor(expGain * 1.5); // 越2级打怪，经验加成50%
        }

        // 计算金币奖励
        const goldGain = monster.goldReward + Math.floor(Math.random() * 10);

        // 处理掉落物品
        const drops: { name: string; count: number }[] = [];
        for (const drop of monster.dropItems) {
          if (Math.random() < drop.rate) {
            drops.push({ name: drop.name, count: drop.count });
            // 添加到玩家背包
            const existingItem = player.inventory.find(item => item.name === drop.name);
            if (existingItem) {
              existingItem.count += drop.count;
            } else {
              player.inventory.push({ id: drop.id, name: drop.name, count: drop.count });
            }
          }
        }

        // 升级判断
        const newExp = player.exp + expGain;
        const requiredExp = player.level * 100; // 升级所需经验：当前等级*100
        let levelUp = false;
        let newLevel = player.level;

        if (newExp >= requiredExp) {
          levelUp = true;
          newLevel = player.level + 1;
          player.level = newLevel;
          player.exp = newExp - requiredExp;
          // 升级属性提升
          player.maxHp += 20;
          player.maxMp += 10;
          player.attack += 3;
          player.defense += 2;
          player.hp = player.maxHp; // 升级满血
          player.mp = player.maxMp; // 升级满蓝
          battleLog.push(`🎉 恭喜你升级了！当前等级：${newLevel}`);
          battleLog.push(`属性提升：生命上限+20，魔力上限+10，攻击+3，防御+2`);
        } else {
          player.exp = newExp;
          player.hp = playerHp; // 保留战斗后血量
        }

        // 增加金币
        player.gold += goldGain;

        // 保存玩家数据
        await player.save({ session });
        await session.commitTransaction();

        // 返回战斗结果
        res.json({
          code: 200,
          message: '战斗胜利',
          data: {
            isWin: true,
            battleLog,
            rewards: {
              exp: expGain,
              gold: goldGain,
              drops,
              levelUp,
              newLevel
            },
            playerStats: {
              hp: player.hp,
              maxHp: player.maxHp,
              mp: player.mp,
              maxMp: player.maxMp,
              level: player.level,
              exp: player.exp,
              gold: player.gold
            }
          }
        });
      } else {
        battleLog.push(`\n💀 你被${monster.name}击败了！`);
        battleLog.push(`你损失了10%的金币，在安全点复活了`);

        // 死亡惩罚：损失10%金币，血量回满，回到当前区域安全点
        const lostGold = Math.floor(player.gold * 0.1);
        player.gold = Math.max(0, player.gold - lostGold);
        player.hp = player.maxHp;
        player.mp = player.maxMp;

        await player.save({ session });
        await session.commitTransaction();

        res.json({
          code: 200,
          message: '战斗失败',
          data: {
            isWin: false,
            battleLog,
            punishment: {
              lostGold,
              goldLeft: player.gold
            },
            playerStats: {
              hp: player.hp,
              maxHp: player.maxHp,
              mp: player.mp,
              maxMp: player.maxMp,
              gold: player.gold
            }
          }
        });
      }

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '战斗发生错误',
      data: err instanceof Error ? err.message : err
    });
  }
});

// 恢复生命值接口
router.post('/recover', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.user!._id);
    if (!player) {
      return res.status(404).json({
        code: 404,
        message: '玩家不存在',
        data: null
      });
    }

    if (player.hp === player.maxHp) {
      return res.status(400).json({
        code: 400,
        message: '你的生命值已经是满的了',
        data: null
      });
    }

    // 恢复生命值需要消耗10金币
    if (player.gold < 10) {
      return res.status(400).json({
        code: 400,
        message: '金币不足，恢复需要10金币',
        data: null
      });
    }

    player.gold -= 10;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    await player.save();

    res.json({
      code: 200,
      message: '恢复成功',
      data: {
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp,
        gold: player.gold
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '恢复失败',
      data: err instanceof Error ? err.message : err
    });
  }
});

export default router;
