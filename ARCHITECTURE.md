# Ethereal 技术架构

> 本文档描述项目的技术选型和架构设计。

## 技术栈

### 前端

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19.x |
| 语言 | TypeScript | 5.x |
| 状态管理 | Zustand | 5.x |
| 样式 | TailwindCSS | 4.x |
| 动画 | Framer Motion | 12.x |
| 构建 | Vite | 7.x |
| 测试 | Vitest + RTL | 4.x |
| Lint | Biome | 2.x |

### 后端

| 类别 | 技术 | 版本 |
|------|------|------|
| 语言 | Rust | 2021 edition |
| 框架 | Tauri | 2.x |
| 异步 | Tokio | 1.x |
| HTTP | reqwest | 0.12 |
| 日志 | tracing | 0.1 |
| 硬件监控 | sysinfo, nvml-wrapper | - |

### 包管理

- **pnpm** (前端) - 严格依赖隔离，硬链接节省磁盘空间
- **Cargo** (后端)

---

## 项目结构

```text
ethereal/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── stores/             # Zustand stores
│   ├── lib/                # 工具函数
│   └── __tests__/          # Vitest 测试
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── ai/             # Ollama 集成
│   │   ├── monitors/       # 硬件监控模块
│   │   ├── utils/          # 工具函数
│   │   ├── config.rs       # 配置管理
│   │   └── lib.rs          # 入口
│   └── Cargo.toml
├── public/sprites/         # 精灵图资源
├── docs/                   # 文档
└── e2e/                    # Playwright 测试
```

---

## 核心架构

### 状态管理

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ spriteStore │  │ chatStore   │  │ settings │ │
│  └──────┬──────┘  └──────┬──────┘  └────┬─────┘ │
│         │                │              │       │
│         └────────────────┼──────────────┘       │
│                          │ IPC Events           │
└──────────────────────────┼──────────────────────┘
                           │
┌──────────────────────────┼──────────────────────┐
│         Backend (Rust)   │                      │
│  ┌───────────────────────▼───────────────────┐  │
│  │           AppConfig (TOML)                │  │
│  │         Single Source of Truth            │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  monitors/  │  │    ai/      │  │  utils/  │ │
│  └─────────────┘  └─────────────┘  └──────────┘ │
└──────────────────────────────────────────────────┘
```

### 数据流

1. **硬件监控** → `gpu-update` 事件 → 前端 `spriteStore`
2. **剪贴板** → `clipboard-changed` 事件 → AI 处理
3. **配置变更** → `config-updated` 事件 → 前端同步

### 精灵状态机

```text
优先级 (高 → 低):
1. Overheating  - 温度超过阈值
2. LowBattery   - 电量低
3. HighLoad     - CPU/GPU 高负载
4. Thinking     - AI 思考中
5. Working      - 检测到编码工具
6. Gaming       - 游戏进程
7. Browsing     - 浏览器
8. Idle         - 默认状态
```

---

## 关键设计决策

### 为什么选择 Zustand

- 轻量 (~1KB)
- 无 Context Provider
- 直接支持 TypeScript
- 简单的 API，无样板代码

### 为什么选择 Biome

- 比 ESLint + Prettier 快 25 倍
- 单一工具替代两个
- 零配置开箱即用

### 硬件监控降级策略

```
NVIDIA GPU → AMD GPU → CPU → Mock (开发模式)
```

---

## 开发命令

详见 [Development Guide](docs/development.md)

```bash
pnpm dev          # 开发模式
pnpm test         # 运行测试
pnpm lint:fix     # 代码检查
pnpm tauri build  # 构建发布包
```
