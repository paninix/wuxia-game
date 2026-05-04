import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Player from '../models/Player';
import { auth, loginLimiter, registerLimiter } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wuxia-game-secret-key-2026';

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

// 注册接口
router.post('/register', registerLimiter, [
  body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20之间'),
  body('password').isLength({ min: 6, max: 30 }).withMessage('密码长度必须在6-30之间'),
  body('name').isLength({ min: 2, max: 10 }).withMessage('角色名长度必须在2-10之间')
], validateResult, async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // 检查用户名是否已存在
    const existingUsername = await Player.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        code: 400,
        message: '该用户名已被注册',
        data: null
      });
    }

    // 检查角色名是否已存在
    const existingName = await Player.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        code: 400,
        message: '该角色名已被使用',
        data: null
      });
    }

    // 创建新玩家
    const player = new Player({ username, password, name });
    await player.save();

    // 生成JWT
    const token = jwt.sign({ _id: player._id }, JWT_SECRET, { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = player.toObject();

    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        user: userInfo,
        token
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '注册失败',
      data: err instanceof Error ? err.message : err
    });
  }
});

// 登录接口
router.post('/login', loginLimiter, [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], validateResult, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(400).json({
        code: 400,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 校验密码
    const isMatch = await player.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 生成JWT
    const token = jwt.sign({ _id: player._id }, JWT_SECRET, { expiresIn: '7d' });

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = player.toObject();

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: userInfo,
        token
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '登录失败',
      data: err instanceof Error ? err.message : err
    });
  }
});

// 获取当前登录玩家信息（需要鉴权）
router.get('/profile', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.user!._id).select('-password');
    if (!player) {
      return res.status(404).json({
        code: 404,
        message: '玩家不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: player
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '获取玩家信息失败',
      data: err instanceof Error ? err.message : err
    });
  }
});

// 更新当前玩家信息（需要鉴权）
router.put('/profile', auth, [
  body('name').optional().isLength({ min: 2, max: 10 }).withMessage('角色名长度必须在2-10之间')
], validateResult, async (req, res) => {
  try {
    const { name } = req.body;
    
    // 如果修改角色名，检查是否已被使用
    if (name && name !== req.user!.name) {
      const existingName = await Player.findOne({ name });
      if (existingName) {
        return res.status(400).json({
          code: 400,
          message: '该角色名已被使用',
          data: null
        });
      }
    }

    const player = await Player.findByIdAndUpdate(
      req.user!._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!player) {
      return res.status(404).json({
        code: 404,
        message: '玩家不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: '更新成功',
      data: player
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '更新玩家信息失败',
      data: err instanceof Error ? err.message : err
    });
  }
});

export default router;
