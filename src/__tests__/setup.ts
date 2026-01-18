import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

// 扩展 Vitest 的 expect 方法
expect.extend(matchers);

// 每个测试后自动清理 DOM
afterEach(() => {
  cleanup();
});

// Mock Tauri APIs globally
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
  emit: vi.fn(),
}));

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    onMoved: vi.fn(),
    startDragging: vi.fn(),
    listen: vi.fn(),
    emit: vi.fn(),
  }),
  appWindow: {
    listen: vi.fn(),
    emit: vi.fn(),
    close: vi.fn(),
    minimize: vi.fn(),
    startDragging: vi.fn(),
  },
}));

// Mock window.matchMedia (Framer Motion 需要)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock Globals
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock Globals
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Remove duplicate mocks at the bottom if they exist

// Mock Globals
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 全局测试超时设置
vi.setConfig({ testTimeout: 10000 });
