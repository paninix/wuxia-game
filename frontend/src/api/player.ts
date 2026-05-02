import request from '../utils/request';

export interface Player {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export const createPlayer = (name: string) => {
  return request.post<Player>('/player/create', { name });
};

export const getPlayer = (name: string) => {
  return request.get<Player>(`/player/${name}`);
};

export const updatePlayer = (name: string, data: Partial<Player>) => {
  return request.put<Player>(`/player/${name}`, data);
};
