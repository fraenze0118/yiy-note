"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import type { NoteMeta, DomainDef } from "@/lib/types";

export function SearchBox({ notes, domains }: { notes: NoteMeta[]; domains: DomainDef[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.topic.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.domain.includes(q)
      )
      .slice(0, 20);
  }, [notes, query]);

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 h-10 px-3 rounded-lg border mb-6 max-w-md"
        style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}>
        <Search size={16} className="text-zinc-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索笔记标题、主题、标签..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-zinc-400 hover:text-zinc-600">
            <X size={14} />
          </button>
        )}
      </div>

      {query.trim() && (
        <div>
          <p className="text-xs text-zinc-400 mb-3">{results.length} 条结果</p>
          {results.length === 0 ? (
            <div className="rounded-xl border flex items-center justify-center h-32 text-sm text-zinc-400"
              style={{ borderColor: "var(--bd)", borderStyle: "dashed" }}>
              无匹配结果
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((n) => {
                const d = domains.find((dd) => dd.key === n.domain);
                return (
                  <Link
                    key={n.id}
                    href={`/notes/${n.id}`}
                    className="flex items-center justify-between h-11 px-4 rounded-xl hover:bg-[var(--ac)] transition-colors group"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{highlight(n.title)}</span>
                      <span className="ml-2 text-xs text-zinc-400">
                        {d?.name} / {highlight(n.topic)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {n.tags.filter((t) => t.toLowerCase().includes(query.toLowerCase())).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: `${d?.color}15`, color: d?.color }}
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-xs text-zinc-400">{n.updated}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
