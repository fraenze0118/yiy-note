# Yiy-Note

个人知识管理系统，覆盖**硬件/嵌入式**、**软件开发**、**数学**、**哲学**、**经济/商业**五大领域。支持 Markdown 笔记、层级知识图谱、全文搜索、标签聚合、JWT 认证。

## 技术栈

| 类别 | 方案 |
|------|------|
| 框架 | Next.js 16 (Turbopack) + React 19 |
| 样式 | Tailwind CSS 4 + CSS 变量（亮/暗双主题） |
| 图标 | Lucide React |
| 知识图谱 | React Flow (@xyflow/react) + dagre 树形布局 |
| Markdown | marked + KaTeX（数学公式） |
| 认证 | JWT (jose) + httpOnly cookie |
| 数据 | 本地 Markdown 文件 + YAML frontmatter |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可使用。

### 环境变量

创建 `.env` 文件（已提供默认值）：

```bash
AUTH_PASSWORD=yiy-note-2026   # 登录密码
AUTH_SECRET=your-random-secret # JWT 签名密钥
```

- 访客可浏览全部内容
- 登录后可新建、编辑、删除笔记

## 功能

- **仪表盘** — 统计卡片、领域概览、学习热力图、最近更新
- **知识库** — 按领域/主题筛选笔记列表，点击侧栏领域名快速定位
- **笔记编辑器** — Markdown 实时预览、KaTeX 数学公式、`[[` 双链自动补全
- **知识图谱** — 5 个领域独立树形图，节点自由拖拽，位置持久化，单击查看关联笔记
- **探索** — 全文搜索 + 标签卡片网格，按频次动态缩放
- **暗色模式** — 跟随系统或手动切换

## 项目结构

```
├── app/                  # Next.js App Router 页面
│   ├── notes/            # 知识库、笔记详情、新建笔记
│   ├── graph/            # 知识图谱
│   ├── search/           # 探索（搜索 + 标签）
│   ├── login/            # 登录页
│   └── api/auth/         # 登录/登出/会话 API
├── components/
│   ├── ui/               # sidebar, search-box, tag-cloud, heatmap
│   ├── notes/            # 编辑器, 新建表单
│   └── graph/            # 图谱画布, 节点, 笔记面板
├── lib/                  # 数据层 & 工具
│   ├── notes-data.ts     # MD 文件读写
│   ├── notes.ts          # Server Actions (CRUD)
│   ├── topics.ts         # 100+ 层级主题树
│   ├── graph.ts          # 图谱数据构建
│   ├── layout.ts         # dagre 树形布局
│   ├── auth.ts           # JWT 认证
│   └── ...
├── content/              # 笔记存储（.md 文件）
├── proxy.ts              # 路由保护
└── doc/design.md         # 设计文档
```

## 笔记格式

每篇笔记是一个 `.md` 文件，YAML frontmatter 记录元数据：

```yaml
---
id: "abc123"
title: "笔记标题"
domain: "software"          # hardware | software | math | philosophy | business
topic: "前端"                # 对应 topics.ts 中的层级主题
tags: ["react", "frontend"]
created: "2026-05-01"
updated: "2026-05-10"
links: ["other-note-id"]    # 关联其他笔记
---

# 笔记正文

支持 KaTeX 公式：$$f(x) = x^2$$
支持代码块高亮。
```

## 脚本

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run start    # 运行生产版本
npm run lint     # ESLint 检查
```

## License

MIT
