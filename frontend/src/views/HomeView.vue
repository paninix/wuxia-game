<template>
  <div class="home-container">
    <h1 class="title">🏯 武侠世界</h1>

    <!-- 加载中 -->
    <div v-if="userStore.isLoading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <!-- 角色列表 -->
    <div v-else class="content">
      <h2 class="subtitle">选择你的江湖身份</h2>

      <div class="save-list">
        <div v-for="save in userStore.saveList" :key="save._id" class="save-card">
          <div class="save-icon">{{ getSectIcon(save.sect) }}</div>
          <div class="save-info">
            <h3>{{ save.saveName }}</h3>
            <p>{{ getSectName(save.sect) }} · Lv.{{ save.level }}</p>
            <p class="hp-bar">
              <span :style="{ width: `${(save.hp / save.maxHp) * 100}%` }"></span>
            </p>
          </div>
          <div class="save-actions">
            <el-button type="primary" size="small" @click="loadSave(save._id)">进入</el-button>
            <el-button type="danger" size="small" @click="deleteSave(save._id)">删除</el-button>
          </div>
        </div>

        <!-- 创建新角色按钮 -->
        <div class="save-card create-card" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          <p>创建新角色</p>
        </div>
      </div>
    </div>

    <!-- 创建角色对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新角色"
      width="600px"
      :close-on-click-modal="false"
      @close="resetCreateForm"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="角色名称" required>
          <el-input v-model="createForm.saveName" placeholder="输入你的江湖名号" />
        </el-form-item>

        <el-form-item label="选择门派" required>
          <el-radio-group v-model="createForm.sect">
            <el-radio
              v-for="(sect, key) in SECT_DATA"
              :key="key"
              :label="key"
              class="sect-radio"
            >
              <div class="sect-option">
                <span class="sect-icon">{{ sect.icon }}</span>
                <div class="sect-desc">
                  <p class="sect-name">{{ sect.name }}</p>
                  <p class="sect-bonus">{{ sect.bonusText }}</p>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分配属性" required>
          <div class="attr-allocation">
            <p class="attr-tip">剩余属性点：{{ remainingAttrs }}</p>
            <div class="attr-item">
              <span>体质（+HP）</span>
              <el-input-number
                v-model="createForm.assignedAttrs.ti"
                :min="0"
                :max="5"
                :disabled="remainingAttrs === 0 && createForm.assignedAttrs.ti === 0"
                @change="calculateRemainingAttrs"
              />
            </div>
            <div class="attr-item">
              <span>内力（+MP/MP回复）</span>
              <el-input-number
                v-model="createForm.assignedAttrs.nei"
                :min="0"
                :max="5"
                :disabled="remainingAttrs === 0 && createForm.assignedAttrs.nei === 0"
                @change="calculateRemainingAttrs"
              />
            </div>
            <div class="attr-item">
              <span>力量（+攻击）</span>
              <el-input-number
                v-model="createForm.assignedAttrs.li"
                :min="0"
                :max="5"
                :disabled="remainingAttrs === 0 && createForm.assignedAttrs.li === 0"
                @change="calculateRemainingAttrs"
              />
            </div>
            <div class="attr-item">
              <span>根骨（+防御）</span>
              <el-input-number
                v-model="createForm.assignedAttrs.gen"
                :min="0"
                :max="5"
                :disabled="remainingAttrs === 0 && createForm.assignedAttrs.gen === 0"
                @change="calculateRemainingAttrs"
              />
            </div>
            <div class="attr-item">
              <span>敏捷（+命中/闪避）</span>
              <el-input-number
                v-model="createForm.assignedAttrs.min"
                :min="0"
                :max="5"
                :disabled="remainingAttrs === 0 && createForm.assignedAttrs.min === 0"
                @change="calculateRemainingAttrs"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="userStore.isLoading" @click="createSave">创建角色</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { SECT_DATA } from '@/data/sectData'
import type { SectKey } from '@/data/sectData'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const showCreateDialog = ref(false)
const createForm = ref({
  saveName: '',
  sect: '' as SectKey,
  assignedAttrs: {
    ti: 0,
    nei: 0,
    li: 0,
    gen: 0,
    min: 0
  }
})

const remainingAttrs = computed(() => {
  const attrs = createForm.value.assignedAttrs
  return 5 - (attrs.ti + attrs.nei + attrs.li + attrs.gen + attrs.min)
})

const getSectIcon = (sectKey: string) => {
  return SECT_DATA[sectKey as SectKey]?.icon || '❓'
}

const getSectName = (sectKey: string) => {
  return SECT_DATA[sectKey as SectKey]?.name || '未知门派'
}

const calculateRemainingAttrs = () => {
  // 计算已在computed中自动处理
}

const resetCreateForm = () => {
  createForm.value = {
    saveName: '',
    sect: '' as SectKey,
    assignedAttrs: {
      ti: 0,
      nei: 0,
      li: 0,
      gen: 0,
      min: 0
    }
  }
}

const loadSave = async (id: string) => {
  try {
    await userStore.loadSave(id)
    ElMessage.success('加载角色成功！')
    router.push('/game')
  } catch (error) {
    console.error('加载角色失败:', error)
  }
}

const deleteSave = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？删除后无法恢复！', '删除确认', {
      type: 'warning'
    })
    await userStore.deleteSave(id)
    ElMessage.success('删除角色成功！')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
    }
  }
}

const createSave = async () => {
  // 验证
  if (!createForm.value.saveName.trim()) {
    ElMessage.warning('请输入角色名称！')
    return
  }
  if (!createForm.value.sect) {
    ElMessage.warning('请选择门派！')
    return
  }
  if (remainingAttrs.value !== 0) {
    ElMessage.warning('请把5点属性点分配完！')
    return
  }

  try {
    await userStore.handleCreateSave(createForm.value)
    ElMessage.success('创建角色成功！')
    showCreateDialog.value = false
    // 自动加载新创建的角色
    const newSave = userStore.saveList[userStore.saveList.length - 1]
    if (newSave) {
      await userStore.loadSave(newSave._id)
      router.push('/game')
    }
  } catch (error) {
    console.error('创建角色失败:', error)
  }
}

onMounted(async () => {
  await userStore.fetchSaveList()
})
</script>

<style scoped>
.home-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 48px;
  color: #f0d58c;
  text-align: center;
  margin-bottom: 40px;
  text-shadow: 0 0 20px rgba(240, 213, 140, 0.5);
}

.subtitle {
  font-size: 28px;
  color: #e0e0e0;
  text-align: center;
  margin-bottom: 40px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #e0e0e0;
  font-size: 18px;
  gap: 20px;
}

.loading .el-icon {
  font-size: 48px;
  color: #f0d58c;
}

.save-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.save-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.save-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(240, 213, 140, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.create-card {
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  color: rgba(240, 213, 140, 0.8);
  font-size: 18px;
}

.create-card .el-icon {
  font-size: 48px;
}

.save-icon {
  font-size: 64px;
}

.save-info {
  flex: 1;
}

.save-info h3 {
  font-size: 22px;
  color: #f0d58c;
  margin-bottom: 8px;
}

.save-info p {
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 4px;
}

.save-info .hp-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.save-info .hp-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #f44336, #ff9800);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.save-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 对话框样式 */
.sect-radio {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.sect-radio:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.sect-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sect-icon {
  font-size: 32px;
}

.sect-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.sect-bonus {
  font-size: 12px;
  color: #666;
}

.attr-allocation {
  width: 100%;
}

.attr-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  font-weight: bold;
}

.attr-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
</style>
