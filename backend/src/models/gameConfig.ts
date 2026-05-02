import mongoose, { Schema, Document } from 'mongoose';

export interface IArea {
  id: string;
  name: string;
  description: string;
  levelRequirement: number;
  events: string[];
}

export interface IEvent {
  id: string;
  name: string;
  description: string;
  type: 'battle' | 'item' | 'story' | 'quest';
  reward?: {
    exp?: number;
    gold?: number;
    item?: { id: string; name: string; count: number };
  };
  enemy?: {
    name: string;
    hp: number;
    attack: number;
    exp: number;
    gold: number;
  };
}

export interface IItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'weapon' | 'armor' | 'accessory';
  effect?: {
    hp?: number;
    mp?: number;
    attack?: number;
    defense?: number;
  };
  price: number;
}

export interface IGameConfig extends Document {
  areas: IArea[];
  events: IEvent[];
  items: IItem[];
}

const GameConfigSchema: Schema = new Schema({
  areas: { type: Array, required: true },
  events: { type: Array, required: true },
  items: { type: Array, required: true },
}, { timestamps: true });

export default mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);
