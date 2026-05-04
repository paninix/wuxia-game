import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  username: string;
  password: string;
  name: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  gold: number;
  location: string;
  inventory: Array<{ id: string; name: string; count: number }>;
  equips: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  unlockedAreas: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

import bcrypt from 'bcrypt';

const PlayerSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, unique: true },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  mp: { type: Number, default: 50 },
  maxMp: { type: Number, default: 50 },
  attack: { type: Number, default: 10 },
  defense: { type: Number, default: 5 },
  gold: { type: Number, default: 100 },
  location: { type: String, default: '新手村' },
  inventory: { type: Array, default: [] },
  equips: {
    weapon: { type: String, default: null },
    armor: { type: String, default: null },
    accessory: { type: String, default: null },
  },
  unlockedAreas: { type: Array, default: ['新手村'] },
}, { timestamps: true });

// 密码加密中间件
PlayerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 密码对比方法
PlayerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IPlayer>('Player', PlayerSchema);
