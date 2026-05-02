import express from 'express';
import Player from '../models/player';

const router = express.Router();

// 创建玩家
router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;
    
    const existingPlayer = await Player.findOne({ name });
    if (existingPlayer) {
      return res.status(400).json({ message: '该玩家名称已存在' });
    }

    const player = new Player({ name });
    await player.save();
    
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ message: '创建玩家失败', error: err });
  }
});

// 获取玩家信息
router.get('/:name', async (req, res) => {
  try {
    const player = await Player.findOne({ name: req.params.name });
    if (!player) {
      return res.status(404).json({ message: '玩家不存在' });
    }
    
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: '获取玩家信息失败', error: err });
  }
});

// 更新玩家信息
router.put('/:name', async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!player) {
      return res.status(404).json({ message: '玩家不存在' });
    }
    
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: '更新玩家信息失败', error: err });
  }
});

export default router;
