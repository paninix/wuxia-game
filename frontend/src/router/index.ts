import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory('/wuxia-game/'), // 注意：和vite.config.ts的base一致
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue') // 角色选择/创建页面
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/GameView.vue'), // 游戏主界面
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore()
        if (userStore.currentUser) {
          next()
        } else {
          next('/')
        }
      }
    }
  ]
})

export default router
