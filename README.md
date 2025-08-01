# 🍅 Tomato Timer - 番茄工作法计时器

一个现代化的番茄工作法计时器应用，采用 iOS 18 设计风格，基于 Next.js 构建，提供微服务架构的 API 接口。

## ✨ 特性

- 🎨 **iOS 18 设计风格**：精美的用户界面，完美适配移动设备
- ⏰ **番茄工作法**：25分钟工作 + 5分钟休息的经典循环
- 📱 **响应式设计**：完美兼容各种手机屏幕尺寸
- 🔔 **智能提醒**：音效提醒、振动反馈和桌面通知
- 📊 **数据统计**：专注时长分析和生产力趋势
- 🌙 **深色模式**：支持亮色/暗色主题切换
- 🔄 **微服务架构**：RESTful API 支持外部集成

## 🚀 技术栈

- **前端**: Next.js 15, React 18, TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **动画**: Framer Motion
- **图标**: Lucide React
- **API**: Next.js API Routes

## 📱 核心功能

### 1. 番茄计时器
- 25分钟专注工作时段
- 5分钟短休息 / 15分钟长休息
- 自定义时长设置
- 循环进度指示器
- 暂停、停止、重置控制

### 2. 任务管理
- 创建和管理待办任务
- 任务优先级设置
- 番茄时段与任务关联
- 任务完成状态跟踪

### 3. 数据统计
- 每日番茄数统计
- 专注时长分析
- 任务完成率
- 生产力趋势图表

### 4. API 服务
- 任务 CRUD 操作 (`/api/tasks`)
- 统计数据接口 (`/api/stats`)
- 标准化响应格式
- 错误处理机制

## 🛠 开发指南

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
npm start
```

### 代码检查
```bash
npm run lint
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── tasks/         # 任务管理 API
│   │   └── stats/         # 统计数据 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 应用布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── BottomNavigation.tsx
│   ├── CircularProgress.tsx
│   └── TimerDisplay.tsx
├── hooks/                 # 自定义 Hooks
│   └── usePomodoroClock.ts
├── lib/                   # 工具库
│   ├── store.ts           # 状态管理
│   └── utils.ts           # 工具函数
└── types/                 # TypeScript 类型定义
    └── index.ts
```

## 🔗 API 接口

### 任务管理
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks/[id]` - 更新任务
- `DELETE /api/tasks/[id]` - 删除任务

### 统计数据
- `GET /api/stats` - 获取统计数据
- `POST /api/stats` - 保存统计数据

## 🎯 设计原则

- **移动优先**：专为手机屏幕优化的用户体验
- **iOS 设计语言**：遵循苹果设计规范，使用系统色彩和字体
- **无障碍访问**：支持屏幕阅读器和键盘导航
- **性能优化**：使用 React 18 并发特性和 Next.js 优化
- **类型安全**：TypeScript 严格模式，完整的类型覆盖

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ for better productivity
