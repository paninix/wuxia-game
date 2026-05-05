// 门派静态数据（和后端保持一致）
export const SECT_DATA = {
  shaolin: {
    id: 'shaolin',
    name: '少林',
    description: '天下武功出少林，擅长防御和外功',
    bonusText: '防御+20、气血+50、攻击+5',
    icon: '🏯'
  },
  wudang: {
    id: 'wudang',
    name: '武当',
    description: '以柔克刚，擅长内力和闪避',
    bonusText: '内力+30、内力回复+1、闪避+10、防御+10',
    icon: '⛰️'
  },
  emei: {
    id: 'emei',
    name: '峨眉',
    description: '擅长暴击和治疗',
    bonusText: '暴击+10%、暴击伤害+20%、内力回复+2',
    icon: '🗡️'
  },
  gaibang: {
    id: 'gaibang',
    name: '丐帮',
    description: '擅长闪避和攻击力',
    bonusText: '攻击+15、闪避+15、命中+5',
    icon: '🥢'
  },
  mingjiao: {
    id: 'mingjiao',
    name: '明教',
    description: '擅长高攻击和高爆发',
    bonusText: '攻击+25、暴击+5%、暴击伤害+30%、气血-20',
    icon: '🔥'
  },
  xiaoyao: {
    id: 'xiaoyao',
    name: '逍遥',
    description: '全能型门派，各项属性均衡',
    bonusText: '攻击+10、防御+10、气血+20、内力+20、闪避+5、命中+5',
    icon: '🎋'
  }
};

export type SectKey = keyof typeof SECT_DATA;
