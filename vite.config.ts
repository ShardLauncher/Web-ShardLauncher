import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Markdown from 'unplugin-vue-markdown/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Markdown({
      /* options */
    }),
    vue({
      include: [/\.vue$/, /\.md$/], // <-- allows Vue to compile Markdown files
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'docs': path.resolve(__dirname, './docs'),
    },
  },
})
