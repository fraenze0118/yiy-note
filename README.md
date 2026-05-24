# Yiy-Note

个人知识管理系统，支持 Markdown 笔记、XMind 风格知识图谱、全文搜索、标签聚合。可打包为 Electron 桌面应用。

## 技术栈

| 类别 | 方案 |
|------|------|
| 框架 | Next.js 16 (Turbopack) + React 19 |
| 样式 | Tailwind CSS 4 + CSS 变量（亮/暗双主题） |
| 图标 | Lucide React (25 个领域图标) |
| 知识图谱 | React Flow (@xyflow/react) + dagre 树形布局 |
| Markdown | marked + highlight.js（语法着色）+ KaTeX（数学公式） |
| 桌面应用 | Electron + electron-builder |
| 数据 | 本地文件系统（`content/` 目录），JSON + Markdown |

## 快速开始

```bash
# 安装依赖
npm install

# 启动 Web 开发服务器
npm run dev

# 启动 Electron 桌面应用（开发模式）
npm run dev:electron

# 打包桌面应用
npm run build:electron
```

打开 http://localhost:3000 即可使用 Web 版。

## 功能

- **仪表盘** — 统计卡片、5 个知识领域概览、GitHub 风格年度热力图、最近更新
- **知识库** — 按领域/主题筛选笔记，侧边栏树形导航
- **笔记编辑器** — Markdown 实时预览、KaTeX 数学公式、代码语法高亮、`[[` 双链自动补全
- **知识图谱** — 按领域独立树形图，L0-L7 七层节点设计，smoothstep 曲线连接，节点自由拖拽
- **领域管理** — 增删改知识领域，16 色 + 25 图标选择器
- **笔记管理** — 新建/编辑/删除笔记，删除需确认
- **探索** — 全文搜索 + 标签云
- **暗色模式** — 亮/暗双主题切换
- **Electron 桌面应用** — frameless 窗口、macOS 风格红绿灯、启动动画、无需登录

## 项目结构

```
├── app/                       # Next.js App Router
│   ├── notes/                 # 知识库、笔记详情、新建笔记
│   ├── graph/                 # 知识图谱
│   ├── search/                # 搜索
│   └── tags/                  # 标签
├── components/
│   ├── ui/                    # sidebar, heatmap, search-box, tag-cloud, electron-titlebar
│   ├── notes/                 # 编辑器, 新建表单, 复制按钮, 删除确认
│   └── graph/                 # 图谱画布, 7层节点, 笔记面板, 领域对话框
├── lib/                       # 数据层
│   ├── data-path.ts           # 统一数据根目录
│   ├── notes-data.ts / notes.ts      # 笔记 CRUD（Server Actions）
│   ├── topics-data.ts / topics-actions.ts  # 主题树读写
│   ├── domains.ts / domains-actions.ts    # 领域管理
│   ├── graph.ts               # 图谱数据构建（递归汇总笔记数）
│   ├── layout.ts              # dagre 树形布局 + smoothstep 边
│   ├── markdown.ts            # marked + highlight.js + KaTeX
│   └── ...
├── main/                      # Electron 主进程
│   ├── background.js          # 窗口管理 + IPC + 启动动画
│   └── preload.js             # IPC 桥接
├── content/                   # 用户数据（gitignore，不跟踪）
├── public/splash.html         # Electron 启动动画
├── electron-builder.yml       # 打包配置
└── doc/                       # 设计文档 & 更新计划
```

## 数据存储

所有数据存储在 `content/` 目录（默认 `process.cwd()/content/`，可通过 `YIY_NOTE_DATA_DIR` 环境变量自定义）：

```
content/
├── domains.json              # 领域定义（名称、颜色、图标）
├── topics.json               # 层级主题树
├── positions.json            # 图谱节点位置
├── hardware/                  # 硬件领域笔记
├── software/                  # 软件领域笔记
├── math/                      # 数学领域笔记
├── philosophy/                # 哲学领域笔记
└── business/                  # 商业领域笔记
```

代码中无硬编码数据。`content/` 目录缺失时所有模块返回空默认值，可通过 UI 从零创建。

## 笔记格式

Markdown 文件 + YAML frontmatter：

```yaml
---
id: "m0000003ghi"
title: "React 状态管理选型"
domain: "software"
topic: "前端"
tags: ["react", "state", "frontend"]
created: "2026-05-05"
updated: "2026-05-10"
links: ["other-note-id"]
---

# 正文（Markdown）

支持 KaTeX 公式 $$f(x) = x^2$$、代码块语法高亮、`[[双链]]`。
```

## License

MIT
