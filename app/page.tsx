import {
  BookOpen,
  GitGraph,
  Tag,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { getAllNotes } from "@/lib/notes-data";
import { domains } from "@/lib/domains";
import { domainIconMap } from "@/lib/domains";
import { Heatmap } from "@/components/ui/heatmap";

export default async function Home() {
  const notes = await getAllNotes();

  const domainCounts = domains.map((d) => ({
    ...d,
    count: notes.filter((n) => n.domain === d.key).length,
  }));

  const totalNotes = notes.length;
  const tagSet = new Set(notes.flatMap((n) => n.tags));
  const totalTags = tagSet.size;
  const linkCount = notes.reduce((sum, n) => sum + n.links.length, 0);

  const stats = [
    { label: "总笔记", value: totalNotes, icon: BookOpen },
    { label: "关联图谱", value: linkCount, icon: GitGraph },
    { label: "标签", value: totalTags, icon: Tag },
    { label: "知识领域", value: domains.length, icon: Clock },
  ];

  const recentNotes = notes.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-1.5">仪表盘</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          你的知识库概览 — 开始记录你的学习轨迹。
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}
          >
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
              <s.icon size={16} />
              <span className="text-xs">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Domain cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            知识领域
          </h2>
          <Link
            href="/notes"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            查看全部 <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {domainCounts.map((d) => {
            const Icon = domainIconMap[d.key];
            return (
              <Link
                key={d.key}
                href={`/notes?domain=${d.key}`}
                className="rounded-xl border p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors group"
                style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${d.color}15` }}
                  >
                    <Icon size={18} style={{ color: d.color }} />
                  </div>
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{d.count}</span>
                  <span className="text-xs text-zinc-400">篇笔记</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-10">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          学习热力图
        </h2>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}>
          <Heatmap dates={notes.flatMap((n) => [n.created, n.updated])} />
        </div>
      </div>

      {/* Recent notes */}
      <div>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          最近更新
        </h2>
        {recentNotes.length === 0 ? (
          <div
            className="rounded-xl border flex items-center justify-center h-32 text-sm text-zinc-400"
            style={{ borderColor: "var(--bd)", borderStyle: "dashed" }}
          >
            <Link
              href="/notes"
              className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              创建你的第一篇笔记
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentNotes.map((n) => {
              const d = domains.find((dd) => dd.key === n.domain);
              return (
                <Link
                  key={n.id}
                  href={`/notes/${n.id}`}
                  className="flex items-center justify-between h-10 px-3 rounded-lg hover:bg-[var(--ac)] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: d?.color }}
                    />
                    <span className="text-sm truncate">{n.title}</span>
                  </div>
                  <span className="text-xs text-zinc-400 shrink-0">{n.updated}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
