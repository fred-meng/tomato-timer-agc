# Copilot Instructions for Tomato Timer

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 项目概述
这是一个基于番茄工作法的计时器应用，采用Next.js + TypeScript构建，具有以下特点：

## 技术栈
- **前端**: Next.js 15 (App Router), React 18, TypeScript
- **样式**: Tailwind CSS (iOS 18 设计风格)
- **API**: Next.js API Routes (微服务架构)
- **状态管理**: React Context + useReducer
- **音频**: Web Audio API
- **存储**: localStorage + IndexedDB

## 设计指南
- **设计风格**: 严格遵循iOS 18的设计语言
  - 使用圆角矩形、模糊效果、渐变色
  - 采用SF Pro字体风格的字体栈
  - 使用iOS系统颜色和间距规范
- **响应式设计**: 移动优先，完美适配各种手机屏幕
- **动画效果**: 使用Framer Motion实现流畅过渡动画
- **主题**: 支持亮色/暗色模式切换

## 核心功能模块
1. **番茄计时器**
   - 25分钟工作 + 5分钟休息的经典循环
   - 自定义时长设置
   - 音效提醒和振动反馈
   - 背景运行支持

2. **任务管理**
   - 创建、编辑、删除任务
   - 任务优先级设置
   - 任务完成状态跟踪
   - 任务与番茄时段关联

3. **统计分析**
   - 每日/周/月番茄数统计
   - 专注时长分析
   - 任务完成率图表
   - 生产力趋势分析

4. **API服务**
   - RESTful API设计
   - 任务CRUD操作
   - 统计数据接口
   - 用户设置同步

## 代码规范
- 使用TypeScript严格模式
- 组件采用函数式组件 + Hooks
- 自定义Hook封装逻辑复用
- API路由采用标准RESTful设计
- 错误处理和loading状态管理
- 无障碍访问(a11y)支持

## 文件结构
```
src/
├── app/                 # Next.js App Router
├── components/          # 可复用组件
├── hooks/              # 自定义Hooks
├── lib/                # 工具函数和配置
├── types/              # TypeScript类型定义
└── styles/             # 全局样式
```

请确保所有生成的代码符合以上规范和设计要求。
