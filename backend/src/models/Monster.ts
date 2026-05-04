import mongoose, { Schema, Document } from 'mongoose';

export interface IMonster extends Document {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
  dropItems: Array<{ id: string; name: string; rate: number; count: number }>;
  area: string;
  description: string;
}

const MonsterSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  level: { type: Number, required: true },
  hp: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  expReward: { type: Number, required: true },
  goldReward: { type: Number, required: true },
  dropItems: { type: Array, default: [] },
  area: { type: String, required: true },
  description: { type: String, default: '' }
});

// 初始化默认怪物数据
MonsterSchema.statics.initDefaultMonsters = async function() {
  const defaultMonsters = [
    {
      id: 'slime',
      name: '史莱姆',
      level: 1,
      hp: 30,
      maxHp: 30,
      attack: 5,
      defense: 1,
      expReward: 10,
      goldReward: 5,
      dropItems: [
        { id: 'slime_jelly', name: '史莱姆凝胶', rate: 0.3, count: 1 }
      ],
      area: '新手村',
      description: '低级魔物，浑身黏糊糊的，新人练手的好对象'
    },
    {
      id: 'wild_boar',
      name: '野猪',
      level: 3,
      hp: 60,
      maxHp: 60,
      attack: 10,
      defense: 3,
      expReward: 25,
      goldReward: 15,
      dropItems: [
        { id: 'boar_meat', name: '野猪肉', rate: 0.5, count: 1 },
        { id: 'boar_leather', name: '野猪皮', rate: 0.2, count: 1 }
      ],
      area: '新手村',
      description: '暴躁的野猪，冲撞攻击伤害不低，新人需要小心'
    },
    {
      id: 'thief',
      name: '小毛贼',
      level: 5,
      hp: 80,
      maxHp: 80,
      attack: 15,
      defense: 5,
      expReward: 40,
      goldReward: 30,
      dropItems: [
        { id: 'dagger', name: '生锈的匕首', rate: 0.1, count: 1 },
        { id: 'stolen_coins', name: '偷来的钱币', rate: 0.4, count: 1 }
      ],
      area: '新手村',
      description: '游荡在村口的毛贼，专门打劫过往的新手冒险者'
    },
    {
      id: 'green_snake',
      name: '青蛇',
      level: 8,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 7,
      expReward: 60,
      goldReward: 45,
      dropItems: [
        { id: 'snake_venom', name: '蛇毒', rate: 0.25, count: 1 },
        { id: 'snake_gall', name: '蛇胆', rate: 0.15, count: 1 }
      ],
      area: '新手村外',
      description: '出没在村外草丛中的毒蛇，被咬中会持续掉血'
    }
  ];

  for (const monster of defaultMonsters) {
    await this.findOneAndUpdate(
      { id: monster.id },
      monster,
      { upsert: true, new: true }
    );
  }
  console.log('默认怪物数据初始化完成');
};

export default mongoose.model<IMonster>('Monster', MonsterSchema);
