import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/qqqqqqq': {
        target: 'https://mf.ppis.me',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/qqqqqqq/, '/api')
      }
    }
  }
})