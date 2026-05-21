"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GitGraph,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Dot,
  ChevronsUpDown,
  Settings,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";
import { getDomainIcon } from "@/lib/domain-icons";
import { DomainManageDialog } from "@/components/graph/domain-manage-dialog";
import type { TopicOption, DomainDef } from "@/lib/types";

const LS_EXPANDED_KEY = "yiy-note-topic-expanded";

const navItems = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/notes", label: "知识库", icon: BookOpen },
  { href: "/graph", label: "知识图谱", icon: GitGraph },
  { href: "/search", label: "探索", icon: Search },
];

/* ── 收集子树所有节点 ID（用于全部展开/折叠） ── */

function collectIds(topics: TopicOption[]): string[] {
  const ids: string[] = [];
  for (const t of topics) {
    ids.push(t.id);
    if (t.children) ids.push(...collectIds(t.children));
  }
  return ids;
}

/* ── 树形连接线辅助 ── */

/** 连接线颜色：按层级递减 */
function treeLineStyle(depth: number, domainColor: string): React.CSSProperties {
  if (depth === 0) return { borderColor: `${domainColor}66` };
  if (depth === 1) return { borderColor: `${domainColor}40` };
  if (depth === 2) return { borderColor: "var(--bd)" };
  if (depth === 3) return { borderColor: "var(--bd)", opacity: 0.6 };
  if (depth === 4) return { borderColor: "var(--bd)", opacity: 0.35 };
  return { borderColor: "var(--bd)", opacity: 0.2 };
}

/** 层级装饰符号（与图谱节点形态对应） */
function depthMarker(depth: number, domainColor: string): React.ReactNode {
  switch (depth) {
    case 0: return <span className="shrink-0 rounded-sm" style={{ width: 4, height: 14, backgroundColor: domainColor, marginLeft: 1 }} />;
    case 1: return <span className="shrink-0" style={{ width: 6, height: 6, backgroundColor: domainColor, transform: "rotate(45deg)", marginLeft: 1 }} />;
    case 2: return <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, border: `2px solid ${domainColor}`, backgroundColor: "transparent", marginLeft: 1 }} />;
    case 3: return <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, backgroundColor: domainColor, marginLeft: 1 }} />;
    case 4: return <span className="shrink-0 rounded-sm" style={{ width: 2.5, height: 12, backgroundColor: `${domainColor}59`, marginLeft: 1 }} />;
    case 5: return <span className="shrink-0 rounded-full" style={{ width: 3, height: 3, backgroundColor: `${domainColor}40`, marginLeft: 2 }} />;
    default: return null;
  }
}

/* ── 递归主题树项 ── */

function TopicTreeItems({
  topics,
  domainKey,
  domainColor,
  depth,
  expanded,
  onToggle,
  pathname,
  isLastChild,
}: {
  topics: TopicOption[];
  domainKey: string;
  domainColor: string;
  depth: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  pathname: string;
  isLastChild?: boolean;
}) {
  const lineStyle = treeLineStyle(depth, domainColor);

  return (
    <>
      {topics.map((topic, idx) => {
        const hasChildren = topic.children && topic.children.length > 0;
        const open = expanded[topic.id] ?? false;
        const isLast = idx === topics.length - 1;
        const isActive =
          pathname === `/notes?domain=${domainKey}&topic=${encodeURIComponent(topic.name)}`;

        // 文字样式：对应图谱节点形态
        const textClass =
          depth === 0 ? "text-[13px] font-medium"
          : depth === 1 ? "text-xs font-medium"
          : depth === 2 ? "text-[11px]"
          : depth === 3 ? "text-[11px] font-medium"
          : depth === 4 ? "text-[10px]"
          : depth === 5 ? "text-[9px]"
          : "text-[8px] italic"; // depth 6+ L7 叶子

        return (
          <div key={topic.id} className="relative">
            {/* 垂直线（从上一个节点延伸下来） */}
            {depth > 0 && (
              <div
                className="absolute left-0 w-px"
                style={{
                  ...lineStyle,
                  borderLeftWidth: 1,
                  top: 0,
                  bottom: isLast ? "50%" : 0,
                }}
              />
            )}

            {/* 水平连接线 */}
            {depth > 0 && (
              <div
                className="absolute top-3 w-3 border-t"
                style={{
                  left: 0,
                  ...lineStyle,
                  borderTopWidth: 1,
                }}
              />
            )}

            {/* 节点行 */}
            <div
              className="flex items-center gap-0.5 w-full rounded-lg hover:bg-[var(--ac)] transition-colors group"
              style={{ paddingLeft: depth > 0 ? 12 : 0 }}
            >
              {hasChildren ? (
                <button
                  onClick={() => onToggle(topic.id)}
                  className="size-5 flex items-center justify-center shrink-0 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {open ? <ChevronDown size={depth <= 2 ? 12 : 10} /> : <ChevronRight size={depth <= 2 ? 12 : 10} />}
                </button>
              ) : (
                <span className="size-5 flex items-center justify-center shrink-0">
                  {depthMarker(depth, domainColor) || <Dot size={10} className="text-zinc-300 dark:text-zinc-600" />}
                </span>
              )}
              <Link
                href={`/notes?domain=${domainKey}&topic=${encodeURIComponent(topic.name)}`}
                className={`flex-1 min-w-0 h-6 leading-6 truncate ${textClass} ${
                  isActive
                    ? "font-medium"
                    : depth <= 2
                      ? "hover:text-zinc-900 dark:hover:text-zinc-100"
                      : "hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                style={depth === 0 || depth === 3 ? { color: domainColor } : undefined}
              >
                {topic.name}
              </Link>
            </div>

            {/* 子节点 */}
            {hasChildren && open && (
              <div className="relative" style={{ marginLeft: 12 }}>
                {/* 父节点向下的垂直线延续 */}
                {depth > 0 && !isLast && (
                  <div
                    className="absolute left-0 w-px top-0 bottom-0"
                    style={{ ...lineStyle, borderLeftWidth: 1 }}
                  />
                )}
                <TopicTreeItems
                  topics={topic.children!}
                  domainKey={domainKey}
                  domainColor={domainColor}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  pathname={pathname}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ── 侧边栏主组件 ── */

export function Sidebar({ domains }: { domains: DomainDef[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const { authenticated } = useAuth();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ hardware: true });
  const [showManage, setShowManage] = useState(false);

  const handleManageSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_EXPANDED_KEY);
      if (raw) setExpanded(JSON.parse(raw) as Record<string, boolean>);
    } catch { /* ignore */ }
  }, []);

  // 持久化展开状态
  useEffect(() => {
    try {
      localStorage.setItem(LS_EXPANDED_KEY, JSON.stringify(expanded));
    } catch { /* ignore */ }
  }, [expanded]);

  const toggleDomain = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleTopic = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // 全部展开/折叠某领域
  const toggleAllInDomain = useCallback((domain: DomainDef) => {
    const ids = collectIds(domain.topics);
    const anyOpen = ids.some((id) => expanded[id]);
    setExpanded((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        next[id] = !anyOpen;
      }
      return next;
    });
  }, [expanded]);

  return (
    <aside
      className="w-64 h-screen flex flex-col border-r shrink-0"
      style={{ backgroundColor: "var(--sb)", borderColor: "var(--bd)" }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 font-semibold text-base tracking-tight">
        <span className="size-7 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-800">
          Y
        </span>
        Yiy-Note
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "font-medium"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                style={active ? { backgroundColor: "var(--ac)" } : undefined}
              >
                <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Domain tree */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-xs font-medium tracking-wide text-zinc-400 dark:text-zinc-500 uppercase">
              知识领域
            </span>
            {authenticated && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowManage(true)}
                  className="size-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  title="管理领域"
                >
                  <Settings size={13} />
                </button>
                <Link
                  href="/notes/new"
                  className="size-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  title="新建笔记"
                >
                  <Plus size={14} />
                </Link>
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            {domains.map((domain) => {
              const Icon = getDomainIcon(domain.icon);
              const open = expanded[domain.key];
              const isDomainActive =
                pathname === `/notes?domain=${domain.key}` ||
                pathname.startsWith(`/notes?domain=${domain.key}&`);

              return (
                <div key={domain.key}>
                  <div className="flex items-center gap-0.5 w-full h-8 rounded-lg hover:bg-[var(--ac)] transition-colors group">
                    <button
                      onClick={() => toggleDomain(domain.key)}
                      className="size-6 flex items-center justify-center shrink-0 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {open ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </button>
                    <Link
                      href={`/notes?domain=${domain.key}`}
                      className="flex items-center gap-2 flex-1 min-w-0 text-sm h-full"
                    >
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: domain.color }}
                      />
                      <Icon size={15} className="shrink-0 text-zinc-500" />
                      <span
                        className={`truncate ${
                          isDomainActive
                            ? "font-medium"
                            : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                        }`}
                      >
                        {domain.name}
                      </span>
                    </Link>
                    {/* 全部展开/折叠按钮 */}
                    {domain.topics.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleAllInDomain(domain);
                        }}
                        className="size-5 flex items-center justify-center rounded text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        title="展开/折叠全部"
                      >
                        <ChevronsUpDown size={11} />
                      </button>
                    )}
                  </div>
                  {open && (
                    <div className="ml-7 space-y-0.5 mt-0.5">
                      <TopicTreeItems
                        topics={domain.topics}
                        domainKey={domain.key}
                        domainColor={domain.color}
                        depth={0}
                        expanded={expanded}
                        onToggle={toggleTopic}
                        pathname={pathname}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div
        className="h-12 flex items-center justify-between px-4 border-t shrink-0"
        style={{ borderColor: "var(--bd)" }}
      >
        <ThemeToggle />
        <div className="flex items-center gap-2">
          {authenticated ? (
            <span className="size-1.5 rounded-full bg-emerald-400" title="已登录" />
          ) : (
            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              登录
            </Link>
          )}
          <span className="text-xs text-zinc-400">v0.2.1</span>
        </div>
      </div>

      <DomainManageDialog
        open={showManage}
        onClose={() => setShowManage(false)}
        onSuccess={handleManageSuccess}
        domains={domains}
      />
    </aside>
  );
}
