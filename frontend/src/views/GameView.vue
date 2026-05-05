<template>
  <div class="game-container" v-if="userStore.currentUser">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <h2>{{ userStore.currentUser.saveName }} · {{ getSectName(userStore.currentUser.sect) }}</h2>
      <el-button type="danger" size="small" @click="logout">退出</el-button>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧角色信息 -->
      <div class="left-panel">
        <div class="info-card">
          <h3>角色信息</h3>
          <div class="info-icon">{{ getSectIcon(userStore.currentUser.sect) }}</div>
          <div class="level-bar">
            <span>Lv.{{ userStore.currentUser.level }}</span>
            <div class="progress">
              <el-progress
                :percentage="userStore.levelProgress"
                :show-text="false"
                stroke-width="8"
                color="#f0d58c"
              />
            </div>
            <span>{{ userStore.currentUser.exp }}/{{ userStore.currentUser.maxExp }}</span>
          </div>
        </div>

        <div class="stats-card">
          <h3>属性面板</h3>
          <div class="stats-grid">
            <div class="stat-item hp">
              <span class="stat-label">气血</span>
              <span class="stat-value">{{ userStore.currentUser.hp }}/{{ userStore.currentUser.maxHp }}</span>
            </div>
            <div class="stat-item mp">
              <span class="stat-label">内力</span>
              <span class="stat-value">{{ userStore.currentUser.mp }}/{{ userStore.currentUser.maxMp }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">攻击</span>
              <span class="stat-value">{{ userStore.currentUser.attack }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">防御</span>
              <span class="stat-value">{{ userStore.currentUser.defense }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">命中</span>
              <span class="stat-value">{{ userStore.currentUser.hit }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">闪避</span>
              <span class="stat-value">{{ userStore.currentUser.dodge }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">暴击</span>
              <span class="stat-value">{{ userStore.currentUser.crit }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">暴伤</span>
              <span class="stat-value">{{ userStore.currentUser.critDmg }}%</span>
            </div>
            <div class="stat-item gold">
              <span class="stat-label">银两</span>
              <span class="stat-value">{{ userStore.currentUser.gold || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧游戏区 -->
      <div class="right-panel">
        <!-- 消息日志 -->
        <div class="log-card">
          <h3>江湖日志</h3>
          <div class="log-content" ref="logContentRef">
            <div v-for="(log, index) in gameLogs" :key="index" class="log-item" :class="log.type">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-text">{{ log.text }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="actions-card">
          <h3>操作面板</h3>
          <div class="actions-grid">
            <el-button type="primary" size="large" :loading="isPracticing" @click="practice">
              <el-icon><EditPen /></el-icon>
              修炼武功
            </el-button>
            <el-button type="success" size="large" :loading="isAdventuring" @click="adventure">
              <el-icon><Promotion /></el-icon>
              外出历练
            </el-button>
            <el-button type="info" size="large" :loading="isResting" @click="rest">
              <el-icon><MoonNight /></el-icon>
              客栈休息
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { SECT_DATA } from '@/data/sectData'
import type { SectKey } from '@/data/sectData'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 函数声明（会被提升）
const getCurrentTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

const logContentRef = ref<HTMLElement | null>(null)
const gameLogs = ref<Array<{ time: string; text: string; type: 'info' | 'success' | 'warning' }>>([
  { time: getCurrentTime(), text: `欢迎回到江湖，${userStore.currentUser?.saveName}！`, type: 'info' }
])

const isPracticing = ref(false)
const isAdventuring = ref(false)
const isResting = ref(false)

const addLog = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
  gameLogs.value.push({
    time: getCurrentTime(),
    text,
    type
  })
  // 滚动到底部
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}

const getSectIcon = (sectKey: string) => {
  return SECT_DATA[sectKey as SectKey]?.icon || '❓'
}

const getSectName = (sectKey: string) => {
  return SECT_DATA[sectKey as SectKey]?.name || '未知门派'
}

const logout = async () => {
  userStore.currentUser = null
  router.push('/')
  ElMessage.success('退出成功！')
}

const practice = async () => {
  if (!userStore.currentUser || isPracticing.value) return
  isPracticing.value = true
  try {
    // 模拟修炼耗时
    await new Promise(resolve => setTimeout(resolve, 1000))
    const addExp = Math.floor(Math.random() * 10) + 5
    userStore.currentUser.exp += addExp
    let logText = `你修炼了一会儿，获得了${addExp}点经验！`
    // 升级检查
    while (userStore.currentUser.exp >= userStore.currentUser.maxExp) {
      userStore.currentUser.exp -= userStore.currentUser.maxExp
      userStore.currentUser.level += 1
      // 更新属性
      userStore.currentUser.maxHp += 20
      userStore.currentUser.hp = userStore.currentUser.maxHp
      userStore.currentUser.maxMp += 10
      userStore.currentUser.mp = userStore.currentUser.maxMp
      userStore.currentUser.attack += 3
      userStore.currentUser.defense += 2
      userStore.currentUser.maxExp = userStore.currentUser.level * 100
      logText += `恭喜你升级到${userStore.currentUser.level}级！属性大幅提升！`
    }
    // 保存到后端
    await userStore.handleUpdateSave(userStore.currentUser)
    addLog(logText, 'success')
  } catch (error) {
    console.error('修炼失败:', error)
    addLog('修炼失败，请稍后重试！', 'warning')
  } finally {
    isPracticing.value = false
  }
}

const adventure = async () => {
  if (!userStore.currentUser || isAdventuring.value) return
  isAdventuring.value = true
  try {
    // 模拟历练耗时
    await new Promise(resolve => setTimeout(resolve, 1500))
    const gold = Math.floor(Math.random() * 20) + 5
    const hpLost = Math.floor(Math.random() * 10)
    userStore.currentUser.gold = (userStore.currentUser.gold || 0) + gold
    userStore.currentUser.hp = Math.max(1, userStore.currentUser.hp - hpLost)
    // 保存到后端
    await userStore.handleUpdateSave(userStore.currentUser)
    addLog(`你在外历练，遇到了几个小毛贼，你轻松解决了他们，获得了${gold}两银子，但是受了点轻伤，损失了${hpLost}点气血！`, 'info')
  } catch (error) {
    console.error('历练失败:', error)
    addLog('历练失败，请稍后重试！', 'warning')
  } finally {
    isAdventuring.value = false
  }
}

const rest = async () => {
  if (!userStore.currentUser || isResting.value) return
  isResting.value = true
  try {
    // 模拟休息耗时
    await new Promise(resolve => setTimeout(resolve, 800))
    const recoverHp = Math.floor(userStore.currentUser.maxHp * 0.3)
    const recoverMp = Math.floor(userStore.currentUser.maxMp * 0.3)
    userStore.currentUser.hp = Math.min(userStore.currentUser.maxHp, userStore.currentUser.hp + recoverHp)
    userStore.currentUser.mp = Math.min(userStore.currentUser.maxMp, userStore.currentUser.mp + recoverMp)
    // 保存到后端
    await userStore.handleUpdateSave(userStore.currentUser)
    addLog(`你找了家客栈休息了一会儿，恢复了${recoverHp}点气血和${recoverMp}点内力！`, 'success')
  } catch (error) {
    console.error('休息失败:', error)
    addLog('休息失败，请稍后重试！', 'warning')
  } finally {
    isResting.value = false
  }
}

onMounted(() => {
  // 自动恢复一些MP（模拟MP回复）
  if (userStore.currentUser) {
    userStore.currentUser.mp = Math.min(userStore.currentUser.maxMp, userStore.currentUser.mp + Math.floor(userStore.currentUser.mpRegen))
  }
})
</script>

<style scoped>
.game-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.top-nav h2 {
  color: #f0d58c;
  font-size: 24px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px 40px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 300px;
}

.right-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card, .stats-card, .log-card, .actions-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card h3, .stats-card h3, .log-card h3, .actions-card h3 {
  color: #f0d58c;
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card {
  text-align: center;
}

.info-icon {
  font-size: 80px;
  margin: 16px 0;
}

.level-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-bar span {
  color: #e0e0e0;
  font-size: 14px;
  min-width: 80px;
}

.level-bar .progress {
  flex: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-item.hp {
  border-left: 4px solid #f44336;
}

.stat-item.mp {
  border-left: 4px solid #2196f3;
}

.stat-item.gold {
  border-left: 4px solid #ff9800;
}

.stat-label {
  font-size: 12px;
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #e0e0e0;
}

.log-content {
  height: 400px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.log-content::-webkit-scrollbar {
  width: 8px;
}

.log-content::-webkit-scrollbar-thumb {
  background: rgba(240, 213, 140, 0.3);
  border-radius: 4px;
}

.log-item {
  margin-bottom: 12px;
  font-size: 14px;
}

.log-item.success {
  color: #67c23a;
}

.log-item.warning {
  color: #e6a23c;
}

.log-item.info {
  color: #e0e0e0;
}

.log-time {
  color: #808080;
  margin-right: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.actions-grid .el-button {
  height: 100px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 16px;
}

.actions-grid .el-icon {
  font-size: 28px;
}
</style>
