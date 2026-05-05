import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getSaveList, createSave, getSaveDetail, updateSave, deleteSave } from '../api/user';
import type { IUser, ISaveListItem } from '../types/user';

// 用户/角色Store
export const useUserStore = defineStore('user', () => {
  // 1. 状态（state）
  const saveList = ref<ISaveListItem[]>([]); // 存档列表
  const currentUser = ref<IUser | null>(null); // 当前正在玩的角色
  const isLoading = ref(false); // 加载状态

  // 2. 计算属性（getters）
  // 当前角色的等级进度百分比
  const levelProgress = computed(() => {
    if (!currentUser.value) return 0;
    return Math.min((currentUser.value.exp / currentUser.value.maxExp) * 100, 100);
  });

  // 3. 方法（actions）
  // 获取存档列表
  const fetchSaveList = async () => {
    isLoading.value = true;
    try {
      const res = await getSaveList();
      saveList.value = res.data.data;
    } catch (error) {
      console.error('获取存档列表失败:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // 创建存档
  const handleCreateSave = async (saveData: {
    saveName: string;
    sect: string;
    assignedAttrs: { ti: number; nei: number; li: number; gen: number; min: number };
  }) => {
    isLoading.value = true;
    try {
      const res = await createSave(saveData);
      // 创建成功后刷新存档列表
      await fetchSaveList();
      return res.data.data;
    } catch (error) {
      console.error('创建存档失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 加载存档
  const loadSave = async (id: string) => {
    isLoading.value = true;
    try {
      const res = await getSaveDetail(id);
      currentUser.value = res.data.data;
      return res.data.data;
    } catch (error) {
      console.error('加载存档失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新存档
  const handleUpdateSave = async (updateData: Partial<IUser>) => {
    if (!currentUser.value) return;
    isLoading.value = true;
    try {
      const res = await updateSave(currentUser.value._id!, updateData);
      currentUser.value = res.data.data;
      return res.data.data;
    } catch (error) {
      console.error('更新存档失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除存档
  const handleDeleteSave = async (id: string) => {
    isLoading.value = true;
    try {
      await deleteSave(id);
      // 删除成功后刷新存档列表
      await fetchSaveList();
      // 如果删除的是当前正在玩的存档，清空currentUser
      if (currentUser.value?._id === id) {
        currentUser.value = null;
      }
    } catch (error) {
      console.error('删除存档失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    saveList,
    currentUser,
    isLoading,
    levelProgress,
    fetchSaveList,
    handleCreateSave,
    loadSave,
    handleUpdateSave,
    handleDeleteSave
  };
});
