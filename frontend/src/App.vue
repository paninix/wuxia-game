<script setup lang="ts">
import { ref } from 'vue';
import { createPlayer, getPlayer, updatePlayer, type Player } from './api/player';

const playerName = ref('');
const player = ref<Player | null>(null);
const message = ref('欢迎来到文字武侠世界！');

const handleCreatePlayer = async () => {
  if (!playerName.value.trim()) {
    message.value = '请输入你的江湖名号！';
    return;
  }
  try {
    const res = await createPlayer(playerName.value.trim());
    player.value = res.data;
    message.value = `欢迎${player.value.name}踏入江湖！`;
    localStorage.setItem('playerName', player.value.name);
  } catch (err: any) {
    message.value = err.response?.data?.message || '创建角色失败';
  }
};

const handleLoadPlayer = async (name: string) => {
  try {
    const res = await getPlayer(name);
    player.value = res.data;
    message.value = `欢迎回来，${player.value.name}！`;
  } catch (err: any) {
    message.value = err.response?.data?.message || '加载角色失败';
  }
};

const handlePractice = async () => {
  if (!player.value) return;
  const addExp = Math.floor(Math.random() * 10) + 5;
  player.value.exp += addExp;
  message.value = `你修炼了一会儿，获得了${addExp}点经验！`;
  
  if (player.value.exp >= player.value.level * 100) {
    player.value.level += 1;
    player.value.maxHp += 20;
    player.value.hp = player.value.maxHp;
    player.value.attack += 3;
    player.value.defense += 2;
    message.value += `恭喜你升级到${player.value.level}级！属性大幅提升！`;
  }
  
  // 过滤掉不可修改的字段
  const { _id, createdAt, updatedAt, ...updateData } = player.value;
  const res = await updatePlayer(player.value.name, updateData);
  player.value = res.data;
};

const handleAdventure = async () => {
  if (!player.value) return;
  const gold = Math.floor(Math.random() * 20) + 5;
  player.value.gold += gold;
  const hpLost = Math.floor(Math.random() * 10);
  player.value.hp = Math.max(1, player.value.hp - hpLost);
  message.value = `你在外历练，遇到了几个小毛贼，你轻松解决了他们，获得了${gold}两银子，但是受了点轻伤，损失了${hpLost}点气血。`;
  // 过滤掉不可修改的字段
  const { _id, createdAt, updatedAt, ...updateData } = player.value;
  const res = await updatePlayer(player.value.name, updateData);
  player.value = res.data;
};

const handleRest = async () => {
  if (!player.value) return;
  const recover = Math.floor(player.value.maxHp * 0.3);
  player.value.hp = Math.min(player.value.maxHp, player.value.hp + recover);
  message.value = `你找了家客栈休息了一会儿，恢复了${recover}点气血。`;
  // 过滤掉不可修改的字段
  const { _id, createdAt, updatedAt, ...updateData } = player.value;
  const res = await updatePlayer(player.value.name, updateData);
  player.value = res.data;
};

// 自动加载上次的角色
const savedName = localStorage.getItem('playerName');
if (savedName) {
  handleLoadPlayer(savedName);
}
</script>

<template>
  <div class="game-container">
    <h1>文字武侠世界</h1>
    <div class="message">{{ message }}</div>

    <div v-if="!player" class="create-box">
      <input v-model="playerName" placeholder="请输入你的江湖名号" />
      <button @click="handleCreatePlayer">踏入江湖</button>
    </div>

    <div v-else class="game-content">
      <div class="player-info">
        <h2>{{ player.name }} (Lv.{{ player.level }})</h2>
        <div class="stats">
          <p>气血: {{ player.hp }}/{{ player.maxHp }}</p>
          <p>内力: {{ player.mp }}/{{ player.maxMp }}</p>
          <p>经验: {{ player.exp }}/{{ player.level * 100 }}</p>
          <p>攻击: {{ player.attack }}</p>
          <p>防御: {{ player.defense }}</p>
          <p>银两: {{ player.gold }}</p>
          <p>所在位置: {{ player.location }}</p>
        </div>
      </div>

      <div class="actions">
        <button @click="handlePractice">修炼武功</button>
        <button @click="handleAdventure">外出历练</button>
        <button @click="handleRest">客栈休息</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft Yahei', sans-serif;
}

h1 {
  text-align: center;
  color: #8B4513;
}

.message {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  border-left: 4px solid #8B4513;
}

.create-box {
  text-align: center;
  margin: 50px 0;
}

input {
  padding: 10px;
  font-size: 16px;
  width: 300px;
  border: 2px solid #8B4513;
  border-radius: 4px;
  margin-right: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background: #8B4513;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
}

button:hover {
  background: #A0522D;
}

.game-content {
  display: flex;
  gap: 30px;
}

.player-info {
  flex: 1;
  border: 2px solid #8B4513;
  border-radius: 8px;
  padding: 20px;
}

.stats p {
  line-height: 2;
  font-size: 16px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 5px;
}

.actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
