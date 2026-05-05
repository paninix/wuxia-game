import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/wuxia-game/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // 路径别名，方便导入组件/文件
    }
  }
})
