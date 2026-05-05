import { Response } from 'express';

// 统一成功响应
export const sendSuccess = (res: Response, data: any, msg: string = '操作成功') => {
  res.status(200).json({
    code: 200,
    msg,
    data
  });
};

// 统一失败响应
export const sendError = (res: Response, msg: string = '操作失败', code: number = 500) => {
  res.status(code).json({
    code,
    msg,
    data: null
  });
};
