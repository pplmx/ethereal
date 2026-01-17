import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],

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

  test: {
    // 全局 API (不需要每个文件 import { test, expect })
    globals: true,

    // 模拟浏览器环境
    environment: 'jsdom',

    // 测试设置文件
    setupFiles: ['./src/__tests__/setup.ts'],

    // 测试文件匹配规则
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'src-tauri'],

    // 覆盖率配置
    coverage: {
      provider: 'v8', // 使用 V8 原生覆盖率 (比 Istanbul 快)
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
      ],
      // 覆盖率阈值
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },

    // 性能基准测试
    benchmark: {
      include: ['src/**/*.bench.{ts,tsx}'],
    },

    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,

    // 并发运行测试 (提升速度)
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // 监听模式排除
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/src-tauri/**'],
  },
});
