# CLAUDE.md — Yiy-Note

个人知识管理系统，支持 Markdown 笔记、XMind 风格层级知识图谱、Electron 桌面应用。

## 技术栈

- Next.js 16 (Turbopack) + React 19 + Tailwind CSS 4
- React Flow (@xyflow/react) + dagre 树形布局
- marked + highlight.js + KaTeX（Markdown 渲染）
- Electron + electron-builder（桌面打包）
- 数据：本地文件系统 `content/`，无数据库

## 项目结构

```
app/                          # Next.js App Router（Server Components 为主）
  layout.tsx                  # 根布局：Sidebar + main + ElectronTitleBar
  page.tsx                    # 仪表盘（统计卡片 + 热力图 + 最近笔记）
  notes/                      # 知识库列表 / 笔记详情 / 新建
  graph/                      # 知识图谱
  search/ / tags/             # 搜索 & 标签
components/
  ui/                         # sidebar, heatmap, search-box, tag-cloud, electron-titlebar, theme-toggle
  notes/                      # 编辑器, 新建表单, 复制按钮, 删除确认
  graph/                      # 图谱画布, 7层节点, 笔记面板, 领域管理对话框
lib/                          # 数据层 & 工具（全部 server-compatible）
  data-path.ts                # 统一数据根目录（默认 process.cwd()/content/）
  types.ts                    # NoteMeta, Note, TopicOption, DomainDef
  notes-data.ts / notes.ts    # 笔记 CRUD（文件 I/O + Server Actions）
  topics.ts                   # TopicNode 类型（纯类型，无数据）
  topics-data.ts              # 主题树读写 + 树操作（flatten/rename/remove 等）
  topics-actions.ts           # 主题 Server Actions
  domains.ts                  # 领域数据读取（同步，模块级常量）
  domains-data.ts             # 领域异步读写
  domains-actions.ts          # 领域 Server Actions（add/update/delete）
  domain-icons.ts             # 25 个 Lucide 图标注册表
  graph.ts                    # 图谱数据构建（buildDomainTree，递归汇总 noteCount）
  layout.ts                   # dagre 布局 + smoothstep 边样式
  markdown.ts                 # marked + highlight.js + KaTeX 渲染
  positions.ts / -actions.ts  # 图谱节点位置持久化
  auth.ts                     # 认证（Electron 模式下恒返回已登录）
  auth-context.tsx            # 客户端认证上下文（恒 true）
  theme.tsx                   # 主题 Provider（light/dark + localStorage）
main/                         # Electron 主进程
  background.js               # 窗口管理 + splash + IPC
  preload.js                  # IPC 桥接（minimize/maximize/close）
content/                      # 用户数据（gitignore，不跟踪）
  domains.json / topics.json / positions.json
  <domain>/*.md               # 笔记文件（YAML frontmatter）
public/splash.html            # Electron 启动动画
electron-builder.yml          # electron-builder 打包配置
doc/                          # 设计文档 & plan-v0.x.x.md
```

## 数据流

```
content/domains.json ──→ lib/domains.ts (同步, 模块常量 domains)
content/topics.json  ──→ lib/topics-data.ts (异步)
content/*/*.md       ──→ lib/notes-data.ts (异步, 解析 frontmatter)
                          └→ lib/notes.ts (Server Actions, 调用 revalidatePath)
content/positions.json ─→ lib/positions.ts (异步)
```

**所有数据来自 `content/` 目录。缺失文件时返回空默认值（不抛错）。代码中无硬编码种子数据。**

## 关键约定

### Server Components 优先
`app/` 下的页面默认是 Server Components。**不要在 Server Component 中使用 `useState`/`useEffect`/`useContext`**。需要交互的组件单独标记 `"use client"`。

### 数据路径
所有文件路径必须通过 `lib/data-path.ts` 的 `DATA_ROOT` / `DOMAINS_FILE` / `TOPICS_FILE` / `POSITIONS_FILE` 获取，禁止硬编码 `process.cwd()/content/`。

### 认证
v0.5.0 后已去掉登录认证。`lib/auth-context.tsx` 中 `authenticated` 恒为 `true`。所有 `requireAuth()` 调用已删除。**不要在新增功能中加入认证检查。**

### 笔记格式
每篇 `.md` 文件头部有自定义 frontmatter（`---` 包裹，非标准 YAML 解析器）：

```yaml
---
id: "m0000003ghi"
title: "标题"
domain: "software"
topic: "前端"
topicId: "fe-framework"
tags: ["react"]
created: "2026-05-01"
updated: "2026-05-10"
links: ["other-id"]
---
```

### 主题树
`content/topics.json` 是按 domain key 分组的递归 TopicNode 数组。每个节点 `{id, name, children?: [...]}`。图谱中 `noteCount` 是**递归累计**（当前节点 + 所有子节点笔记数）。

### 图谱节点
L0-L7 七层节点在 `tree-nodes.tsx` 中分别实现。颜色通过 `hex(color, alpha)` 工具函数获取真实 hex 值，**不要用 `var()` 后缀拼接**（ReactFlow foreignObject 中不生效）。

### 路径别名
`@/` 映射到项目根目录。导入示例：`import { domains } from "@/lib/domains"`。

## 常用命令

```bash
npm run dev             # Web 开发服务器（localhost:3000）
npm run build           # 生产构建（next build）
npm run dev:electron    # Electron 桌面开发模式
npm run build:electron  # 打包 Electron 桌面应用
npm run lint            # ESLint
```

## 深色模式

亮/暗主题通过 `<html class="dark">` 切换。CSS 变量值在 `:root` 和 `.dark` 中分别定义：
- `--bg` / `--fg`：主背景/前景色
- `--sb` / `--bd` / `--mu` / `--ac`：侧边栏/边框/静音/强调色
- `--domain-*`：16 个领域颜色变量

新增 CSS 样式时，**始终检查亮/暗两种模式下的对比度**。避免使用硬编码 hex 色值，优先使用 CSS 变量。
