import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Markdown from 'unplugin-vue-markdown/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    Markdown({
      /* options */
    }),
    vue({
      include: [/\.vue$/, /\.md$/], // <-- allows Vue to compile Markdown files
    }),
  ],
  server: {
    // 强制指定 MIME 类型，防止被误判为 text/vnd.trolltech.linguist
    headers: {
      'Content-Type': 'application/javascript',
    },
    // 显式指定公共目录
    publicDir: 'public',
    // 强制 HMR 使用正确的协议
    hmr: {
      overlay: true,
    },
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'docs': path.resolve(__dirname, './docs'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保在构建时正确处理资源
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
