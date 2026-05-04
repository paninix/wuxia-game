import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Player from '../models/Player';

// 扩展Request类型，添加user字段
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        username: string;
        name: string;
      };
    }
  }
}

// JWT密钥，生产环境请存入环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'wuxia-game-secret-key-2026';

// 鉴权中间件
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未授权访问，请先登录',
        data: null
      });
    }

    // 校验token
    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };
    
    // 查找用户
    const player = await Player.findById(decoded._id).select('-password');
    if (!player) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在或token已失效',
        data: null
      });
    }

    // 挂载用户信息到请求对象
    req.user = {
      _id: player._id.toString(),
      username: player.username,
      name: player.name
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        code: 401,
        message: '登录已过期，请重新登录',
        data: null
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        code: 401,
        message: '无效的token',
        data: null
      });
    }
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
};

// 限流中间件
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: {
    code: 429,
    message: '登录尝试次数过多，请15分钟后再试',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 最多注册3个账号
  message: {
    code: 429,
    message: '注册过于频繁，请1小时后再试',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});
