# Web-ShardLauncher

[ShardLauncher](https://github.com/LanRhyme/ShardLauncher) 的官方网站项目，基于 Vue 3, Vite 和 Tailwind CSS 构建
The official website project for [ShardLauncher](https://github.com/LanRhyme/ShardLauncher). Built with Vue 3, Vite, and Tailwind CSS.

## ✨ 特性 (Features)

- **现代化 UI**: 采用毛玻璃 (Glassmorphism) 设计风格，完全响应式布局。
- **国际化支持**: 完整支持中文（简体）和英文。
- **下载中心**: 集成 GitHub API 获取最新 Release 和 Artifacts，支持 API 速率限制处理和离线回退数据。
- **文档系统**: 基于 Markdown 的动态文档渲染，支持多语言路由。
- **主题生成器**: 内置 ShardLauncher 主题配色生成工具。

## 🛠️ 技术栈 (Tech Stack)

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - 强类型的 JavaScript 超集
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [Vue Router](https://router.vuejs.org/) - 路由管理
- [Vue I18n](https://kazupon.github.io/vue-i18n/) - 国际化插件
- [Remix Icon](https://remixicon.com/) - 开源图标库

## 🚀 快速开始 (Getting Started)

### 环境要求 (Prerequisites)

- Node.js (推荐最新 LTS 版本)
- npm 或 pnpm

### 安装依赖 (Installation)

```bash
npm install
```

### 开发模式 (Development)

启动本地开发服务器：

```bash
npm run dev
```

### 构建部署 (Build)

构建生产环境代码：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## ⚙️ 环境变量 (Environment Variables)

为了避免在开发过程中触发 GitHub API 的速率限制，您可以配置个人访问令牌 (Personal Access Token)。

1. 在项目根目录创建 `.env.local` 文件。
2. 添加您的 GitHub Token：

```properties
VITE_GITHUB_TOKEN=your_token_here
```

> **注意**: `.env.local` 文件已被 git 忽略，请勿将 Token 提交到版本控制系统中。

## 📂 项目结构 (Project Structure)

```
Web-ShardLauncher/
├── docs/                 # Markdown 文档文件 (zh/en)
├── public/               # 静态资源 (favicon, robots.txt)
├── src/
│   ├── assets/           # 静态资源和全局样式 (main.css)
│   ├── components/       # 公共 UI 组件
│   ├── composables/      # Vue Composables
│   ├── data/             # 静态数据 (如 fallback 数据)
│   ├── i18n/             # 国际化语言包
│   ├── router/           # 路由配置
│   ├── views/            # 页面组件 (Home, Download, Docs, Generator)
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── index.html            # HTML 模板
├── package.json          # 项目依赖配置
├── tailwind.config.js    # Tailwind CSS 配置
└── vite.config.ts        # Vite 配置
```

## 📄 许可证 (License)

本项目跟随主项目协议或 MIT 协议。
