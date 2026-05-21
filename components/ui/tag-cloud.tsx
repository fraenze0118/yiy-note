"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { NoteMeta, DomainDef } from "@/lib/types";
import { Hash } from "lucide-react";

export function TagCloud({ notes, domains }: { notes: NoteMeta[]; domains: DomainDef[] }) {
  const domainColorMap = useMemo(
    () => Object.fromEntries(domains.map((d) => [d.key, d.color])) as Record<string, string>,
    [domains]
  );
  const [selected, setSelected] = useState<string | null>(null);

  const tags = useMemo(() => {
    const map = new Map<string, { count: number; domains: Set<string> }>();
    for (const n of notes) {
      for (const t of n.tags) {
        const entry = map.get(t) ?? { count: 0, domains: new Set() };
        entry.count++;
        entry.domains.add(n.domain);
        map.set(t, entry);
      }
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, count: v.count, domains: Array.from(v.domains) }))
      .sort((a, b) => b.count - a.count);
  }, [notes]);

  const maxCount = tags[0]?.count ?? 1;

  const filteredNotes = useMemo(() => {
    if (!selected) return [];
    return notes.filter((n) => n.tags.includes(selected));
  }, [notes, selected]);

  return (
    <div>
      {tags.length === 0 ? (
        <div className="rounded-xl border border-dashed flex items-center justify-center h-24 text-sm text-zinc-400"
          style={{ borderColor: "var(--bd)" }}>
          暂无标签 — 在笔记中为笔记添加标签
        </div>
      ) : (
        <>
          {/* Tag grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {tags.map((t) => {
              const ratio = t.count / maxCount;
              const isSelected = selected === t.name;
              const primaryDomain = t.domains[0];
              const tagColor = domainColorMap[primaryDomain] ?? "var(--fg)";

              return (
                <button
                  key={t.name}
                  onClick={() => setSelected(isSelected ? null : t.name)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isSelected ? "" : "hover:bg-[var(--ac)]"
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${tagColor}10` : "var(--sb)",
                    borderColor: isSelected ? tagColor : "var(--bd)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    ...(isSelected ? { boxShadow: `0 0 0 2px ${tagColor}30` } : {}),
                  }}
                >
                  <Hash size={14} className="shrink-0 text-zinc-400" />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-medium leading-tight truncate"
                      style={{
                        fontSize: `${Math.round(0.8 + ratio * 0.35)}rem`,
                        color: isSelected ? tagColor : "var(--fg)",
                      }}
                    >
                      {t.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-zinc-400">{t.count} 篇</span>
                      <span className="flex gap-0.5">
                        {t.domains.slice(0, 2).map((dk) => (
                          <span
                            key={dk}
                            className="size-1 rounded-full"
                            style={{ backgroundColor: domainColorMap[dk] }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Filtered notes */}
      {selected && (
        <div>
          <p className="text-xs text-zinc-400 mb-3">
            包含 #{selected} 的笔记 — {filteredNotes.length} 篇
          </p>
          {filteredNotes.length > 0 && (
            <div className="space-y-1">
              {filteredNotes.map((n) => {
                const d = domains.find((dd) => dd.key === n.domain);
                return (
                  <Link
                    key={n.id}
                    href={`/notes/${n.id}`}
                    className="flex items-center gap-3 h-10 px-3 rounded-lg hover:bg-[var(--ac)] transition-colors"
                  >
                    <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: d?.color }} />
                    <span className="text-sm truncate flex-1">{n.title}</span>
                    <span className="text-xs text-zinc-400 shrink-0">{n.updated}</span>
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
