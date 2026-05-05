// 计算当前等级升级所需的经验值
export const calcMaxExp = (level: number): number => {
  // 简单的经验公式：等级 * 100
  return level * 100;
};
