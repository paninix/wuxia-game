import type { ISectBonus } from '../types/user';

// 门派数据类型
interface ISectData {
  name: string;
  description: string;
  bonus: ISectBonus;
  initialSkills: string[];
}

// 门派静态数据
export const SECT_DATA: Record<string, ISectData> = {
  shaolin: {
    name: '少林',
    description: '天下武功出少林，擅长防御和外功',
    bonus: { defense: 20, hp: 50, attack: 5 },
    initialSkills: ['shaolin_longfist']
  },
  wudang: {
    name: '武当',
    description: '以柔克刚，擅长内力和闪避',
    bonus: { mp: 30, mpRegen: 1, dodge: 10, defense: 10 },
    initialSkills: ['wudang_taiji']
  },
  emei: {
    name: '峨眉',
    description: '擅长暴击和治疗',
    bonus: { crit: 10, critDmg: 20, mpRegen: 2 },
    initialSkills: ['emei_jiuyin']
  },
  gaibang: {
    name: '丐帮',
    description: '擅长闪避和攻击力',
    bonus: { attack: 15, dodge: 15, hit: 5 },
    initialSkills: ['gaibang_dogbeating']
  },
  mingjiao: {
    name: '明教',
    description: '擅长高攻击和高爆发',
    bonus: { attack: 25, crit: 5, critDmg: 30, hp: -20 },
    initialSkills: ['mingjiao_qiankun']
  },
  xiaoyao: {
    name: '逍遥',
    description: '全能型门派，各项属性均衡',
    bonus: { attack: 10, defense: 10, hp: 20, mp: 20, dodge: 5, hit: 5 },
    initialSkills: ['xiaoyao_lingbo']
  }
};
