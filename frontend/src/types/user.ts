// 物品类型定义（预留）
export interface IBackpackItem {
  itemId: string;
  count: number;
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

// 用户存档主类型
export interface IUser {
  _id?: string;
  saveName: string;
  createTime: string;
  lastModifyTime: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  mpRegen: number;
  attack: number;
  defense: number;
  hit: number;
  dodge: number;
  crit: number;
  critDmg: number;
  sect: SectKey;
  sectBonus: { [key: string]: number };
  gold?: number;
  position?: string;
  backpack?: IBackpackItem[];
  equipment?: IEquipment;
  equippedSkills?: IEquippedSkill;
  quests?: any[];
}

// 存档列表展示的简化类型
export interface ISaveListItem {
  _id: string;
  saveName: string;
  level: number;
  sect: SectKey;
  hp: number;
  maxHp: number;
  lastModifyTime: string;
}

// 从后端导入的SectKey类型
export type SectKey = 'shaolin' | 'wudang' | 'emei' | 'gaibang' | 'mingjiao' | 'xiaoyao';
