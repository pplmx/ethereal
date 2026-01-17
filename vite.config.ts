import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 使用 SWC 替代 Babel,速度提升 20 倍
      jsxImportSource: 'react',
    }),
  ],

  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  // 开发服务器配置
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
  },

  // 构建配置
  build: {
    target: 'esnext', // 使用最新 JS 特性
    minify: 'esbuild', // esbuild 比 terser 快 100 倍
    sourcemap: false, // 生产环境关闭 sourcemap

    rollupOptions: {
      output: {
        // 手动分包,优化加载性能
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          animation: ['framer-motion'],
          tauri: ['@tauri-apps/api', '@tauri-apps/plugin-shell'],
        },
      },
    },

    // 性能优化
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // 关闭压缩大小报告,加快构建
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'framer-motion'],
  },

  // 环境变量前缀
  envPrefix: ['VITE_', 'TAURI_'],
});
