import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/user';

// 扩展Document接口，获得TypeScript类型提示
interface IUserDocument extends IUser, Document {}

// 定义Schema
const UserSchema: Schema = new Schema<IUserDocument>({
  saveName: {
    type: String,
    required: true,
    unique: true, // 存档名称唯一
    trim: true
  },
  createTime: {
    type: Date,
    default: Date.now // 默认当前时间
  },
  lastModifyTime: {
    type: Date,
    default: Date.now
  },
  level: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 100
  },
  exp: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maxExp: {
    type: Number,
    required: true,
    default: 100 // 1级升2级需要100经验
  },
  hp: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  maxHp: {
    type: Number,
    required: true,
    default: 100,
    min: 1
  },
  mp: {
    type: Number,
    required: true,
    default: 50,
    min: 0
  },
  maxMp: {
    type: Number,
    required: true,
    default: 50,
    min: 1
  },
  mpRegen: {
    type: Number,
    required: true,
    default: 2,
    min: 0
  },
  attack: {
    type: Number,
    required: true,
    default: 10,
    min: 1
  },
  defense: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  hit: {
    type: Number,
    required: true,
    default: 90,
    min: 0,
    max: 100
  },
  dodge: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
    max: 100
  },
  crit: {
    type: Number,
    required: true,
    default: 5,
    min: 0,
    max: 100
  },
  critDmg: {
    type: Number,
    required: true,
    default: 150,
    min: 100
  },
  sect: {
    type: String,
    required: true,
    enum: ['shaolin', 'wudang', 'emei', 'gaibang', 'mingjiao', 'xiaoyao'] // 枚举限定可选值
  },
  sectBonus: {
    type: Object, // MongoDB用普通对象
    required: true
  },
  gold: {
    type: Number,
    default: 100,
    min: 0
  },
  position: {
    type: String,
    default: 'start_village' // 默认新手村
  },
  backpack: {
    type: [Object], // 预留嵌入式数组
    default: []
  },
  equipment: {
    type: Object, // 预留嵌入式对象
    default: {}
  },
  equippedSkills: {
    type: Object, // 预留嵌入式对象
    default: {}
  },
  quests: {
    type: [Object], // 预留嵌入式数组
    default: []
  }
});

// 导出Model
export default mongoose.model<IUserDocument>('User', UserSchema);
