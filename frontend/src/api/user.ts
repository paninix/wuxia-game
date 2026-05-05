import request, { type IApiResponse } from '../utils/request';
import type { IUser, ISaveListItem } from '../types/user';

// 获取存档列表
export const getSaveList = () => {
  return request.get<IApiResponse<ISaveListItem[]>>('/user/list');
};

// 创建存档
export const createSave = (data: {
  saveName: string;
  sect: string;
  assignedAttrs: { ti: number; nei: number; li: number; gen: number; min: number };
}) => {
  return request.post<IApiResponse<{ _id: string; saveName: string }>>('/user/create', data);
};

// 获取存档详情
export const getSaveDetail = (id: string) => {
  return request.get<IApiResponse<IUser>>(`/user/detail/${id}`);
};

// 更新存档
export const updateSave = (id: string, data: Partial<IUser>) => {
  return request.put<IApiResponse<IUser>>(`/user/update/${id}`, data);
};

// 删除存档
export const deleteSave = (id: string) => {
  return request.delete<IApiResponse<null>>(`/user/delete/${id}`);
};
