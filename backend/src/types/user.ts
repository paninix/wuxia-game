// 门派属性加成类型（所有可能的属性）
export interface ISectBonus {
  hp?: number;
  mp?: number;
  mpRegen?: number;
  attack?: number;
  defense?: number;
  hit?: number;
  dodge?: number;
  crit?: number;
  critDmg?: number;
}

// 物品类型定义（预留，后续扩展背包系统用）
export interface IBackpackItem {
  itemId: string; // 物品ID，关联items表
  count: number; // 物品数量
}

// 装备类型定义（预留）
export interface IEquipment {
  weapon?: string;
  armor?: string;
  pants?: string;
  shoes?: string;
  accessory?: string;
}

// 武学类型定义（预留）
export interface IEquippedSkill {
  skill1?: string;
  skill2?: string;
  skill3?: string;
  skill4?: string;
}

// 用户存档主类型（MongoDB单嵌入式文档，适合新手练单机）
// 注意：去掉_id，因为Document会自动添加
export interface IUser {
  saveName: string; // 存档名称，唯一
  createTime: Date; // 创建时间
  lastModifyTime: Date; // 最后修改时间
  // 基础属性
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  mpRegen: number; // 非战斗时每秒回复MP
  // 战斗属性
  attack: number;
  defense: number;
  hit: number;
  dodge: number;
  crit: number; // 暴击率（0-100）
  critDmg: number; // 暴击伤害加成（100为基础）
  // 门派信息
  sect: 'shaolin' | 'wudang' | 'emei' | 'gaibang' | 'mingjiao' | 'xiaoyao'; // 枚举限定门派
  sectBonus: ISectBonus; // 门派属性加成
  // 预留扩展字段
  gold?: number;
  position?: string;
  backpack?: IBackpackItem[];
  equipment?: IEquipment;
  equippedSkills?: IEquippedSkill;
  quests?: any[];
}
