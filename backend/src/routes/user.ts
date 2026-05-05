import express, { Request, Response } from 'express';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/responseUtils';
import { SECT_DATA } from '../data/sectData';
import { calcMaxExp } from '../utils/expUtils';
import { IUser } from '../types/user';

const router = express.Router();

// 1. 获取存档列表
router.get('/list', async (req: Request, res: Response) => {
  try {
    // 只返回存档需要的字段，不返回全部
    const saveList = await User.find({}, { saveName: 1, level: 1, sect: 1, hp: 1, maxHp: 1, lastModifyTime: 1, _id: 1 });
    sendSuccess(res, saveList, '获取存档列表成功');
  } catch (error) {
    console.error('获取存档列表失败:', error);
    sendError(res, '获取存档列表失败，请稍后重试');
  }
});

// 2. 创建存档
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { saveName, sect, assignedAttrs } = req.body;

    // 简单的参数验证（新手可以后续用joi或express-validator完善）
    if (!saveName || !sect || !assignedAttrs) {
      return sendError(res, '参数不完整，请填写所有必填项', 400);
    }
    if (!SECT_DATA[sect]) {
      return sendError(res, '门派不存在', 400);
    }
    // 修复：给reduce添加类型注解
    const totalAssigned = Object.values(assignedAttrs as Record<string, number>).reduce((sum, num) => sum + num, 0);
    if (totalAssigned !== 5) {
      return sendError(res, '初始属性必须分配5点', 400);
    }
    const saveExists = await User.findOne({ saveName });
    if (saveExists) {
      return sendError(res, '存档名称已存在', 400);
    }

    // 计算初始属性（基础属性 + 分配属性 + 门派加成）
    const sectData = SECT_DATA[sect];
    const attrs = assignedAttrs as { ti: number; nei: number; li: number; gen: number; min: number };
    const baseAttrs = {
      level: 1,
      exp: 0,
      maxExp: calcMaxExp(1),
      hp: 100 + (attrs.ti || 0) * 20 + (sectData.bonus.hp || 0),
      maxHp: 100 + (attrs.ti || 0) * 20 + (sectData.bonus.hp || 0),
      mp: 50 + (attrs.nei || 0) * 15 + (sectData.bonus.mp || 0),
      maxMp: 50 + (attrs.nei || 0) * 15 + (sectData.bonus.mp || 0),
      mpRegen: 2 + (attrs.nei || 0) * 0.5 + (sectData.bonus.mpRegen || 0),
      attack: 10 + (attrs.li || 0) * 5 + (sectData.bonus.attack || 0),
      defense: 5 + (attrs.gen || 0) * 5 + (sectData.bonus.defense || 0),
      hit: 90 + (attrs.min || 0) * 3 + (sectData.bonus.hit || 0),
      dodge: 10 + (attrs.min || 0) * 3 + (sectData.bonus.dodge || 0),
      crit: 5 + (sectData.bonus.crit || 0),
      critDmg: 150 + (sectData.bonus.critDmg || 0)
    };

    // 创建新存档（sectBonus直接用普通对象）
    const newUser: Partial<IUser> = {
      saveName,
      sect: sect as any,
      sectBonus: sectData.bonus,
      ...baseAttrs
    };
    const savedUser = await User.create(newUser);

    sendSuccess(res, { _id: savedUser._id, saveName: savedUser.saveName }, '创建存档成功');
  } catch (error) {
    console.error('创建存档失败:', error);
    sendError(res, '创建存档失败，请稍后重试');
  }
});

// 3. 获取单个存档详情
router.get('/detail/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, '存档不存在', 404);
    }
    sendSuccess(res, user, '获取存档详情成功');
  } catch (error) {
    console.error('获取存档详情失败:', error);
    sendError(res, '获取存档详情失败，请稍后重试');
  }
});

// 4. 更新存档（lastModifyTime自动更新）
router.put('/update/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, lastModifyTime: Date.now() };
    // 禁止修改_id和saveName
    delete updateData._id;
    delete updateData.saveName;
    // 禁止直接修改createTime
    delete updateData.createTime;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }); // new: true 返回更新后的文档
    if (!updatedUser) {
      return sendError(res, '存档不存在', 404);
    }
    sendSuccess(res, updatedUser, '更新存档成功');
  } catch (error) {
    console.error('更新存档失败:', error);
    sendError(res, '更新存档失败，请稍后重试');
  }
});

// 5. 删除存档
router.delete('/delete/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return sendError(res, '存档不存在', 404);
    }
    sendSuccess(res, null, '删除存档成功');
  } catch (error) {
    console.error('删除存档失败:', error);
    sendError(res, '删除存档失败，请稍后重试');
  }
});

export default router;
