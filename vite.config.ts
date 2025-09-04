/**
 * 文件名: vite.config.ts
 * 分类: 构建配置
 * 作用: Vite 开发与打包配置（含对外可访问 host 设置）
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173, // 默认端口
  },
})
