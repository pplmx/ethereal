# ✨ Ethereal (以太之灵) 完整开发路线图 v2.0

## 🎯 项目核心定义

- **技术栈**: Tauri v2 + Rust + React + TypeScript + Ollama
- **核心特性**: 透明桌宠 + GPU监控 + AI交互
- **开发周期**: 预计 6-8 周 (兼职) / 3-4 周 (全职)

---

## 📊 优先级说明

- 🔴 **P0 (阻塞性)**: 不完成无法进入下一阶段
- 🟡 **P1 (核心功能)**: 影响用户体验的主要功能
- 🟢 **P2 (增强体验)**: 锦上添花的优化项
- 🔵 **P3 (可选)**: 长期规划或实验性功能

---

## Phase 0: 基础设施搭建 (Week 1, Days 1-3)
>
> **目标**: 建立稳定的开发环境和工程基础

### 🔴 P0: 项目初始化

- [ ] 使用 Tauri CLI 创建项目:

  ```bash
  # 安装 Tauri CLI
  cargo install create-tauri-app --locked

  # 创建项目 (选择 pnpm + React + TypeScript)
  cargo create-tauri-app ethereal
  # 或使用 npm
  npm create tauri-app@latest
  ```

- [ ] 配置 pnpm 工作空间:

  ```yaml
  # pnpm-workspace.yaml
  packages:
    - 'src'
    - 'src-tauri'
  ```

- [ ] 更新到现代依赖:

  ```json
  {
    "dependencies": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "@tauri-apps/api": "^2.0.0",
      "zustand": "^5.0.0",
      "framer-motion": "^11.0.0"
    },
    "devDependencies": {
      "@vitejs/plugin-react-swc": "^3.7.0",
      "vite": "^6.0.0",
      "typescript": "^5.6.0",
      "@biomejs/biome": "^1.9.0",
      "vitest": "^2.0.0",
      "@testing-library/react": "^16.0.0",
      "@testing-library/user-event": "^14.5.0"
    }
  }
  ```

- [ ] 配置目录结构:

  ```text
  ethereal/
  ├── src/                    # React 前端
  │   ├── components/         # UI 组件
  │   ├── hooks/             # 自定义 Hooks
  │   ├── stores/            # Zustand stores
  │   ├── lib/               # 工具函数
  │   └── __tests__/         # Vitest 测试
  ├── src-tauri/             # Rust 后端
  │   ├── src/
  │   │   ├── commands/      # Tauri Commands
  │   │   ├── monitors/      # 硬件监控模块
  │   │   ├── ai/            # Ollama 集成
  │   │   └── utils/         # 工具函数
  │   └── Cargo.toml
  ├── public/
  │   └── sprites/           # 精灵图资源
  ├── biome.json             # Biome 配置
  ├── vitest.config.ts       # Vitest 配置
  └── pnpm-workspace.yaml
  ```

- [ ] 初始化 Git:

  ```bash
  git init
  pnpm dlx husky-init
  ```

### 🔴 P0: 日志与调试系统

- [ ] Rust 端日志配置:

  ```toml
  # Cargo.toml
  [dependencies]
  tracing = "0.1"
  tracing-subscriber = { version = "0.3", features = ["env-filter"] }
  tracing-appender = "0.2"
  ```

  ```rust
  // main.rs
  use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

  fn init_logging() {
      let file_appender = tracing_appender::rolling::daily(
          get_app_log_dir(),
          "ethereal.log",
      );

      tracing_subscriber::registry()
          .with(
              tracing_subscriber::EnvFilter::try_from_default_env()
                  .unwrap_or_else(|_| "ethereal=debug,warn".into()),
          )
          .with(tracing_subscriber::fmt::layer().with_writer(file_appender))
          .init();
  }
  ```

- [ ] 前端日志集成 (可选):

  ```typescript
  // lib/logger.ts
  const isDev = import.meta.env.DEV;

  export const logger = {
    debug: (...args: any[]) => isDev && console.debug('[Ethereal]', ...args),
    info: (...args: any[]) => console.info('[Ethereal]', ...args),
    warn: (...args: any[]) => console.warn('[Ethereal]', ...args),
    error: (...args: any[]) => console.error('[Ethereal]', ...args),
  };
  ```

- [ ] 添加 panic hook:

  ```rust
  use std::panic;

  panic::set_hook(Box::new(|panic_info| {
      tracing::error!("应用崩溃: {:?}", panic_info);
      // 可选: 保存崩溃报告到文件
  }));
  ```

### 🟡 P1: 配置管理框架

- [ ] 使用 `config` crate (支持多格式):

  ```toml
  # Cargo.toml
  [dependencies]
  config = { version = "0.14", features = ["toml"] }
  serde = { version = "1.0", features = ["derive"] }
  ```

  ```rust
  // config.rs
  use serde::{Deserialize, Serialize};

  #[derive(Debug, Deserialize, Serialize, Clone)]
  pub struct AppConfig {
      pub window: WindowConfig,
      pub hardware: HardwareConfig,
      pub ai: AiConfig,
  }

  #[derive(Debug, Deserialize, Serialize, Clone)]
  pub struct WindowConfig {
      #[serde(default = "default_x")]
      pub default_x: i32,
      #[serde(default = "default_y")]
      pub default_y: i32,
  }

  fn default_x() -> i32 { 100 }
  fn default_y() -> i32 { 100 }

  impl AppConfig {
      pub fn load() -> Result<Self, config::ConfigError> {
          let config_path = get_config_path();
          config::Config::builder()
              .add_source(config::File::from(config_path))
              .add_source(config::Environment::with_prefix("ETHEREAL"))
              .build()?
              .try_deserialize()
      }

      pub fn save(&self) -> anyhow::Result<()> {
          let toml = toml::to_string_pretty(self)?;
          std::fs::write(get_config_path(), toml)?;
          Ok(())
      }
  }
  ```

- [ ] 创建默认配置模板:

  ```toml
  # config.default.toml
  [window]
  default_x = 100
  default_y = 100
  always_on_top = true

  [hardware]
  monitor_source = "auto"
  polling_interval_ms = 2000

  [hardware.thresholds]
  nvidia_temp = 80.0
  amd_temp = 80.0
  cpu_temp = 85.0

  [ai]
  model_name = "llama3.2"
  api_endpoint = "http://localhost:11434"
  max_response_length = 100
  cooldown_seconds = 30
  ```

- [ ] 实现配置热加载 (使用 `notify` crate):

  ```rust
  use notify::{Watcher, RecursiveMode, watcher};

  fn watch_config(app_handle: AppHandle) {
      let (tx, rx) = std::sync::mpsc::channel();
      let mut watcher = watcher(tx, Duration::from_secs(2)).unwrap();

      watcher.watch(get_config_path(), RecursiveMode::NonRecursive).unwrap();

      std::thread::spawn(move || {
          while let Ok(_event) = rx.recv() {
              if let Ok(new_config) = AppConfig::load() {
                  app_handle.emit_all("config-updated", new_config).ok();
              }
          }
      });
  }
  ```

### 🟢 P2: 开发辅助工具

- [ ] **Vitest 配置**:

  ```typescript
  // vitest.config.ts
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react-swc';

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/__tests__/'],
      },
    },
  });
  ```

  ```typescript
  // src/__tests__/setup.ts
  import { expect, afterEach } from 'vitest';
  import { cleanup } from '@testing-library/react';
  import * as matchers from '@testing-library/jest-dom/matchers';

  expect.extend(matchers);
  afterEach(() => cleanup());
  ```

- [ ] **示例测试**:

  ```typescript
  // src/components/__tests__/SpriteAnimator.test.tsx
  import { describe, it, expect, vi } from 'vitest';
  import { render, screen, waitFor } from '@testing-library/react';
  import { SpriteAnimator } from '../SpriteAnimator';

  describe('SpriteAnimator', () => {
    it('应该渲染第一帧', () => {
      const frames = ['/sprite1.png', '/sprite2.png'];
      render(<SpriteAnimator frames={frames} fps={30} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', frames[0]);
    });

    it('应该循环播放动画', async () => {
      vi.useFakeTimers();
      const frames = ['/sprite1.png', '/sprite2.png'];
      render(<SpriteAnimator frames={frames} fps={2} />);

      vi.advanceTimersByTime(500); // 0.5秒后切换到第二帧
      await waitFor(() => {
        expect(screen.getByRole('img')).toHaveAttribute('src', frames[1]);
      });

      vi.useRealTimers();
    });
  });
  ```

- [ ] **Biome 配置** (替代 ESLint + Prettier):

  ```json
  // biome.json
  {
    "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
    "organizeImports": { "enabled": true },
    "linter": {
      "enabled": true,
      "rules": {
        "recommended": true,
        "complexity": {
          "noExtraBooleanCast": "error",
          "noMultipleSpacesInRegularExpressionLiterals": "error"
        },
        "style": {
          "noNegationElse": "off",
          "useSingleVarDeclarator": "warn"
        }
      }
    },
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineWidth": 100
    },
    "javascript": {
      "formatter": {
        "quoteStyle": "single",
        "trailingCommas": "all"
      }
    }
  }
  ```

- [ ] **性能监控 Overlay** (开发模式):

  ```tsx
  // src/components/DevTools.tsx
  import { useEffect, useState } from 'react';

  export const DevTools = () => {
    const [stats, setStats] = useState({
      fps: 0,
      memory: 0,
      eventCount: 0,
    });

    useEffect(() => {
      if (import.meta.env.DEV) {
        // 监控 FPS
        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = () => {
          frames++;
          const now = performance.now();
          if (now >= lastTime + 1000) {
            setStats(prev => ({ ...prev, fps: frames }));
            frames = 0;
            lastTime = now;
          }
          requestAnimationFrame(measureFPS);
        };
        measureFPS();
      }
    }, []);

    if (!import.meta.env.DEV) return null;

    return (
      <div className="fixed top-0 right-0 bg-black/80 text-white p-2 text-xs">
        <div>FPS: {stats.fps}</div>
        <div>Memory: {(performance as any).memory?.usedJSHeapSize >> 20}MB</div>
      </div>
    );
  };
  ```

- [ ] **Mock 数据生成器**:

  ```rust
  // src-tauri/src/monitors/mock.rs
  #[cfg(debug_assertions)]
  pub struct MockDataGenerator {
      pattern: ActivityPattern,
  }

  #[cfg(debug_assertions)]
  impl MockDataGenerator {
      pub fn new(pattern: ActivityPattern) -> Self {
          Self { pattern }
      }

      pub fn generate_gpu_data(&self) -> GpuData {
          // 生成模拟数据逻辑
      }
  }
  ```

---

## Phase 1: 幽灵窗口核心 (Week 1-2, Days 4-10)
>
> **目标**: 实现透明窗口 + 鼠标穿透 + 基础动画

### 🔴 P0: 透明窗口配置

- [ ] 修改 `tauri.conf.json`:

  ```json
  {
    "tauri": {
      "windows": [{
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true,
        "resizable": false,
        "skipTaskbar": true,
        "width": 200,
        "height": 200
      }]
    }
  }
  ```

- [ ] 验证窗口背景完全透明 (无白边/黑边)

### 🔴 P0: Windows 鼠标穿透

- [ ] 在 `Cargo.toml` 添加 `windows` crate:

  ```toml
  [dependencies.windows]
  version = "0.52"
  features = [
    "Win32_UI_WindowsAndMessaging",
    "Win32_Foundation"
  ]
  ```

- [ ] 实现 Rust 函数:

  ```rust
  #[tauri::command]
  fn set_click_through(window: tauri::Window, enabled: bool) {
    // SetWindowLongPtrW 逻辑
  }
  ```

- [ ] 添加安全保护:每次穿透切换时保存前一状态

### 🔴 P0: 全局热键系统

- [ ] 集成 `tauri-plugin-global-shortcut`
- [ ] 注册 `Ctrl+Shift+E` 切换穿透
- [ ] 注册 `Ctrl+Shift+Q` 退出程序
- [ ] 热键冲突检测与提示

### 🟡 P1: 精灵动画引擎

- [ ] 创建 `SpriteAnimator` React组件:

  ```tsx
  interface SpriteProps {
    frames: string[];  // 图片路径数组
    fps: number;
    loop: boolean;
  }
  ```

- [ ] 实现帧循环播放 (requestAnimationFrame)
- [ ] 添加动画状态控制 (play/pause/stop)
- [ ] 预加载优化 (避免闪烁)

### 🟡 P1: 窗口拖拽

- [ ] 监听鼠标按下事件 (非穿透模式)
- [ ] 调用 `appWindow.startDragging()`
- [ ] 保存窗口位置到配置文件

### 🟢 P2: 视觉优化

- [ ] 精灵图渐入渐出效果 (CSS transitions)
- [ ] 阴影/发光效果 (drop-shadow)
- [ ] 多显示器边界检测 (防止窗口移出屏幕)

### ✅ 阶段验收

- 窗口完全透明,精灵图无白边
- 热键切换穿透后能正常点击桌面后方元素
- 拖拽窗口后重启,位置能恢复

---

## Phase 2: 系统感知层 (Week 2-3, Days 11-17)
>
> **目标**: 获取GPU数据 + 活跃窗口识别 + 状态机

### 🔴 P0: 硬件监控抽象层设计

- [ ] 定义通用监控接口:

  ```rust
  trait HardwareMonitor {
    fn get_temperature(&self) -> f32;
    fn get_utilization(&self) -> f32;
    fn get_memory_usage(&self) -> (u64, u64); // (used, total)
    fn is_available(&self) -> bool;
  }
  ```

- [ ] **实现 NVIDIA GPU 监控** (nvml-wrapper):

  ```rust
  struct NvidiaMonitor {
    nvml: Option<Nvml>,
    device: Option<Device>,
  }

  impl HardwareMonitor for NvidiaMonitor {
    fn get_temperature(&self) -> f32 {
      self.device
        .and_then(|d| d.temperature(TemperatureSensor::Gpu).ok())
        .unwrap_or(0.0)
    }
    // ...
  }
  ```

- [ ] **实现 CPU 监控** (通用降级方案):

  ```rust
  struct CpuMonitor; // 使用 sysinfo crate

  impl HardwareMonitor for CpuMonitor {
    fn get_temperature(&self) -> f32 {
      // 读取 CPU 温度
    }
    fn get_utilization(&self) -> f32 {
      // 读取 CPU 使用率
    }
  }
  ```

- [ ] **实现模拟监控** (开发/测试用):

  ```rust
  struct MockMonitor {
    base_temp: f32,
    variance: f32,
  }

  impl HardwareMonitor for MockMonitor {
    fn get_temperature(&self) -> f32 {
      // 生成波动数据: 45-75°C 之间随机
      self.base_temp + (rand::random::<f32>() * self.variance)
    }
  }
  ```

- [ ] **智能选择监控源**:

  ```rust
  fn create_monitor() -> Box<dyn HardwareMonitor> {
    // 优先级: NVIDIA GPU → AMD GPU → CPU → Mock
    if let Ok(nvidia) = NvidiaMonitor::new() {
      Box::new(nvidia)
    } else if let Ok(cpu) = CpuMonitor::new() {
      Box::new(cpu)
    } else {
      Box::new(MockMonitor::default())
    }
  }
  ```

- [ ] 在首次启动时检测硬件并记录到日志

### 🟡 P1: 异步数据推送

- [ ] 创建 Tokio 后台任务:

  ```rust
  tokio::spawn(async move {
    loop {
      let data = get_gpu_stats();
      app.emit_all("gpu-update", data);
      tokio::time::sleep(Duration::from_millis(2000)).await;
    }
  });
  ```

- [ ] 前端监听事件并更新UI
- [ ] 添加数据缓存 (避免频繁读取)

### 🔴 P0: 活跃窗口检测

- [ ] 集成 `active-win-pos-rs`
- [ ] 实现分类逻辑:

  ```rust
  enum AppCategory {
    Coding,   // VSCode, Cursor, IntelliJ
    Gaming,   // 全屏游戏
    Browsing, // Chrome, Firefox
    Idle,     // 桌面/文件管理器
  }
  ```

- [ ] 进程名称匹配规则库
- [ ] **异常处理**: 某些游戏/安全软件可能阻止检测

### 🟡 P1: 状态机核心 (硬件无关)

- [ ] 定义状态优先级:

  ```rust
  enum SpriteState {
    Overheating,  // 优先级1: 温度 > 阈值 (不限GPU/CPU)
    HighLoad,     // 优先级2: 利用率 > 80%
    Working,      // 优先级3: 检测到编码工具
    Gaming,       // 优先级4: 游戏进程
    Idle,         // 优先级5: 默认状态
  }
  ```

- [ ] 实现硬件无关的状态判断:

  ```rust
  fn determine_state(
    monitor: &dyn HardwareMonitor,
    active_app: &AppCategory,
  ) -> SpriteState {
    let temp = monitor.get_temperature();
    let usage = monitor.get_utilization();

    if temp > config.temp_threshold {
      return SpriteState::Overheating;
    }
    if usage > 80.0 {
      return SpriteState::HighLoad;
    }
    match active_app {
      AppCategory::Coding => SpriteState::Working,
      AppCategory::Gaming => SpriteState::Gaming,
      _ => SpriteState::Idle,
    }
  }
  ```

- [ ] 状态转换防抖 (避免频繁切换)
- [ ] 状态持续时间记录

### 🟢 P2: 多硬件平台支持

- [ ] **AMD GPU监控** (可选):

  ```rust
  // 使用 Windows Performance Counters 或 AMD ADL
  struct AmdMonitor;
  ```

- [ ] **Intel 集显监控** (可选):

  ```rust
  // 读取 Intel GPU 温度传感器
  struct IntelMonitor;
  ```

- [ ] **macOS 适配**:
    - 使用 `IOKit` 读取 CPU/GPU 温度
    - Metal API 获取 GPU 信息
- [ ] **Linux 适配**:
    - 读取 `/sys/class/hwmon/` 或 `lm-sensors`
    - AMDGPU/Nouveau 驱动接口

### ✅ 阶段验收

- 运行压力测试,精灵立即进入"过热"状态
- 切换到VSCode,3秒内进入"工作"状态
- 无N卡环境下仍能正常运行 (模拟模式)

---

## Phase 3: AI 智能层 (Week 3-4, Days 18-24)
>
> **目标**: Ollama集成 + 剪贴板监听 + 对话UI

### 🟡 P1: Ollama 客户端

- [ ] 添加 `reqwest` 异步HTTP客户端
- [ ] 封装API调用函数:

  ```rust
  async fn chat_with_ollama(prompt: &str) -> Result<String> {
    let client = reqwest::Client::new();
    let response = client
      .post("http://localhost:11434/api/generate")
      .json(&json!({
        "model": "llama3.2",
        "prompt": prompt,
        "stream": false
      }))
      .send()
      .await?;
    // 解析响应
  }
  ```

- [ ] **离线处理**: Ollama未启动时静默降级
- [ ] 超时控制 (5秒无响应则取消)

### 🟡 P1: 人设注入

- [ ] 设计System Prompt:

  ```text
  你是"以太之灵",一个存在于代码世界的幽灵精灵。
  你的回复需要:
  1. 简洁(30字内)
  2. 带有冷幽默
  3. 技术相关时展现专业性
  4. 避免重复和啰嗦
  ```

- [ ] 上下文管理 (保留最近3轮对话)
- [ ] 敏感词过滤器

### 🔴 P0: 剪贴板监听

- [ ] 集成 `arboard` crate
- [ ] 轮询检测变化 (500ms间隔)
- [ ] 内容类型识别:

  ```rust
  enum ClipboardContent {
    Code(Language),     // 代码片段
    Error(ErrorType),   // 报错信息
    Text,               // 普通文本
    Binary,             // 忽略
  }
  ```

- [ ] **安全过滤**:
    - 忽略 < 10 字符内容
    - 匹配密码模式 (password=, token=)
    - 检测SQL注入/命令注入模式

### 🟡 P1: 触发策略

- [ ] 冷却时间机制 (30秒内不重复响应)
- [ ] 置信度阈值 (明确是代码/错误才触发)
- [ ] 用户手动触发 (右键菜单"询问精灵")

### 🟡 P1: 对话气泡UI

- [ ] 创建 `SpeechBubble` 组件:

  ```tsx
  interface BubbleProps {
    message: string;
    position: 'top' | 'bottom';
    duration: number; // 显示时长
  }
  ```

- [ ] 打字机效果 (逐字显示)
- [ ] 自动淡出动画
- [ ] 多气泡队列管理

### 🟢 P2: 智能增强

- [ ] 时间感知欢迎语:

  ```text
  00:00-06:00: "深夜还在码字?注意休息哦"
  06:00-12:00: "早安,准备好迎接bug了吗?"
  12:00-18:00: "下午好,咖啡续上了吗?"
  18:00-24:00: "晚上好,今天的代码提交了吗?"
  ```

- [ ] GPU异常主动提醒
- [ ] 长时间无操作时的随机互动

### ✅ 阶段验收

- 复制Python报错,3秒内弹出相关建议
- Ollama离线时不影响其他功能
- 连续复制10次,只响应有意义的内容

---

## Phase 4: 鲁棒性与优化 (Week 4-5, Days 25-31)
>
> **目标**: 错误处理 + 性能优化 + 边界测试

### 🔴 P0: 异常恢复机制

- [ ] 实现全局错误边界 (React Error Boundary)
- [ ] Rust panic处理:

  ```rust
  std::panic::set_hook(Box::new(|panic_info| {
    error!("Panic发生: {:?}", panic_info);
    // 保存崩溃现场
  }));
  ```

- [ ] 关键资源释放:

  ```rust
  impl Drop for EtherealApp {
    fn drop(&mut self) {
      // 释放NVML句柄
      // 保存配置文件
    }
  }
  ```

### 🟡 P1: 性能优化

- [ ] 前端:
    - React.memo 优化组件渲染
    - 使用 CSS transform 替代 top/left (GPU加速)
    - 虚拟化长列表 (如对话历史)
- [ ] 后端:
    - 使用 `lazy_static` 缓存静态数据
    - 数据库连接池 (如需持久化)
    - 减少跨进程通信频率

### 🟡 P1: 资源占用控制

- [ ] 空闲状态 CPU < 1%
- [ ] 内存占用 < 80MB
- [ ] 精灵动画使用 CSS而非Canvas (降低GPU负担)

### 🔴 P0: 多显示器适配

- [ ] 检测主显示器变化
- [ ] DPI缩放适配:

  ```rust
  let scale_factor = window.scale_factor();
  let logical_size = physical_size / scale_factor;
  ```

- [ ] 跨屏拖拽坐标转换

### 🟡 P1: 边界测试用例

- [ ] GPU热插拔测试
- [ ] 系统休眠/唤醒恢复
- [ ] 网络断开时Ollama调用
- [ ] 超长剪贴板内容 (10MB+)
- [ ] 快速切换窗口焦点 (防抖测试)
- [ ] 同时运行多个实例

### 🟢 P2: 优雅降级

- [ ] 低配置模式 (禁用部分动画)
- [ ] 省电模式 (降低轮询频率)
- [ ] 离线模式 (纯本地功能)

### ✅ 阶段验收

- 运行24小时无内存泄漏
- 强制结束进程后无僵尸句柄
- 4K + 1080P双屏切换正常

---

## Phase 5: 用户体验与交付 (Week 5-6, Days 32-38)
>
> **目标**: 用户界面 + 打包发布 + 文档

### 🟡 P1: 托盘菜单

- [ ] 集成 `tauri-plugin-system-tray`
- [ ] 菜单项:

  ```text
  ├─ 显示/隐藏
  ├─ 设置
  │  ├─ GPU监控开关
  │  ├─ AI功能开关
  │  └─ 开机自启
  ├─ 关于
  └─ 退出
  ```

- [ ] 菜单项动态更新 (反映当前状态)

### 🟡 P1: 硬件信息展示

- [ ] 设置界面显示当前监控源:

  ```text
  当前监控: NVIDIA GeForce RTX 4090
  温度: 65°C | 负载: 45% | 显存: 8GB/24GB

  或

  当前监控: CPU (Intel i9-13900K)
  温度: 52°C | 负载: 32%
  提示: 未检测到独立显卡,使用CPU数据
  ```

- [ ] 监控源切换选项 (手动指定)
- [ ] 硬件不可用时的友好提示

### 🟢 P2: 首次启动引导

- [ ] 欢迎页面 (介绍功能)
- [ ] 权限申请说明 (剪贴板/窗口检测)
- [ ] **智能硬件检测**:

  ```text
  正在检测系统硬件...

  ✅ 检测到 NVIDIA RTX 4090
     将监控 GPU 温度和负载

  或

  ⚠️  未检测到独立显卡
     将使用 CPU 数据代替
     功能不受影响,部分状态判断基于CPU

  ❌ NVIDIA 驱动版本过低 (< 470)
     建议更新驱动以获得更好体验
     点击此处下载最新驱动
  ```

- [ ] Ollama服务状态检查
- [ ] 一键启用推荐配置

### 🔴 P0: 打包构建

- [ ] 配置 `tauri.conf.json`:

  ```json
  {
    "package": {
      "productName": "Ethereal",
      "version": "1.0.0"
    },
    "tauri": {
      "bundle": {
        "identifier": "com.ethereal.app",
        "icon": ["icons/icon.png"],
        "windows": {
          "wix": {
            "language": "zh-CN"
          }
        }
      }
    }
  }
  ```

- [ ] 生成安装包 `npm run tauri build`
- [ ] 测试安装/卸载流程
- [ ] 签名配置 (可选)

### 🟡 P1: 文档编写

- [ ] README.md:
    - 功能介绍
    - 安装步骤
    - 使用教程
    - FAQ
- [ ] 开发文档:
    - 架构设计
    - API说明
    - 贡献指南
- [ ] 更新日志模板

### 🟢 P2: 营销素材

- [ ] 演示视频/GIF
- [ ] 功能截图
- [ ] 推广文案

### ✅ 最终验收

1. 安装包 < 50MB
2. 安装后首次启动 < 3秒
3. 所有核心功能正常
4. 崩溃率 < 0.1%
5. 用户可独立完成安装和基础配置

---

## Phase 6: 长期维护 (Post-Release)
>
> **目标**: 持续优化与功能扩展

### 🔵 P3: 高级功能 (v1.1+)

- [ ] 多精灵皮肤系统
- [ ] 自定义动画编辑器
- [ ] 插件系统 (Lua/JS脚本)
- [ ] 云同步配置
- [ ] 社区精灵商店

### 🔵 P3: 跨平台支持

- [ ] macOS适配 (替换Windows API)
- [ ] Linux适配 (X11/Wayland)
- [ ] AMD GPU支持

### 🟡 P1: 持续优化

- [ ] 收集崩溃报告
- [ ] 性能遥测数据
- [ ] 用户反馈迭代
- [ ] 安全漏洞修复

---

## 📅 时间线总览

| 阶段 | 周期 | 核心产出 | 关键里程碑 |
| ------ | ------ | ---------- | ----------- |
| Phase 0 | 3天 | 开发环境 | 首次运行成功 |
| Phase 1 | 7天 | 透明窗口 | 精灵可拖拽穿透 |
| Phase 2 | 7天 | 系统感知 | GPU数据实时显示 |
| Phase 3 | 7天 | AI交互 | 首次AI对话成功 |
| Phase 4 | 7天 | 稳定性 | 24小时压力测试通过 |
| Phase 5 | 7天 | 发布准备 | 安装包生成 |
| **总计** | **38天** | **v1.0** | **公开发布** |

---

## 🚨 风险管理

### 高风险项

1. **NVML兼容性**: 旧驱动可能不支持 → 优先实现降级方案
2. **Ollama稳定性**: 本地模型可能崩溃 → 添加健康检查
3. **窗口穿透**: 部分游戏可能冲突 → 提供白名单机制

### 应对策略

- 每个Phase结束进行风险评估
- 关键功能准备Plan B
- 提前2周完成核心功能 (留buffer)

---

## 💡 开发建议

### 每日检查清单

- [ ] Git commit代码
- [ ] 更新开发日志
- [ ] 运行单元测试
- [ ] 检查内存泄漏

### 每周复盘

- 完成进度 vs 计划进度
- 技术债务记录
- 下周优先级调整

---

## 🎯 成功标准

**MVP (最小可行产品)**:

- ✅ 透明窗口正常显示
- ✅ 能检测GPU状态
- ✅ 基础AI对话功能

**完整v1.0**:

- ✅ 所有P0、P1功能完成
- ✅ 通过48小时稳定性测试
- ✅ 安装包可在3台不同配置电脑运行

**优秀产品**:

- ✅ 完成P2功能
- ✅ 用户留存率 > 60%
- ✅ 社区反馈积极

---

**祝开发顺利! 记住: 先让它跑起来,再让它跑得快,最后让它跑得美! 🚀**
