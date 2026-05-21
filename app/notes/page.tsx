import Link from "next/link";
import { getAllNotes } from "@/lib/notes-data";
import { getCachedSession } from "@/lib/auth";
import { domains, domainIconMap } from "@/lib/domains";
import { Clock, Plus, X } from "lucide-react";
export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; topic?: string }>;
}) {
  const sp = await searchParams;
  const filterDomain = sp?.domain;
  const filterTopic = sp?.topic;
  const session = await getCachedSession();

  const allNotes = await getAllNotes();

  const filtered = allNotes.filter((n) => {
    if (filterDomain && n.domain !== filterDomain) return false;
    if (filterTopic && n.topic !== filterTopic) return false;
    return true;
  });

  const grouped: Record<string, { domain: string; color: string; notes: typeof allNotes }> = {};
  for (const d of domains) {
    const domainNotes = filtered.filter((n) => n.domain === d.key);
    if (domainNotes.length > 0 || !filterDomain) {
      grouped[d.key] = { domain: d.name, color: d.color, notes: domainNotes };
    }
  }

  const activeFilter = filterDomain || filterTopic;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">知识库</h1>
        {session && (
          <Link
            href="/notes/new"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--fg)" }}
          >
            <Plus size={14} />
            新建笔记
          </Link>
        )}
      </div>

      {/* Active filter badge */}
      {activeFilter && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            筛选：{filtered.length} 篇
          </span>
          {filterDomain && (
            <span
              className="flex items-center gap-1 text-xs px-2 h-6 rounded-md"
              style={{
                backgroundColor: `${domains.find((d) => d.key === filterDomain)?.color ?? "var(--fg)"}15`,
                color: domains.find((d) => d.key === filterDomain)?.color ?? "var(--fg)",
              }}
            >
              {domains.find((d) => d.key === filterDomain)?.name ?? filterDomain}
            </span>
          )}
          {filterTopic && (
            <span className="flex items-center gap-1 text-xs px-2 h-6 rounded-md bg-[var(--ac)]">
              {filterTopic}
            </span>
          )}
          <Link
            href="/notes"
            className="flex items-center gap-0.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X size={12} />
            清除
          </Link>
        </div>
      )}

      {!activeFilter && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          共 {allNotes.length} 篇笔记
        </p>
      )}

      {filtered.length === 0 ? (
        <div
          className="rounded-xl border flex items-center justify-center h-48 text-sm text-zinc-400"
          style={{ borderColor: "var(--bd)", borderStyle: "dashed" }}
        >
          暂无匹配笔记
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([key, g]) => {
            if (g.notes.length === 0) return null;
            const Icon = domainIconMap[key as keyof typeof domainIconMap];
            return (
              <section key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="size-6 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${g.color}15` }}
                  >
                    <Icon size={14} style={{ color: g.color }} />
                  </div>
                  <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {g.domain}
                  </h2>
                  <span className="text-xs text-zinc-400">({g.notes.length})</span>
                </div>
                <div className="space-y-1">
                  {g.notes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="flex items-center justify-between h-11 px-4 rounded-xl hover:bg-[var(--ac)] transition-colors group"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{note.title}</span>
                        <span className="ml-2 text-xs text-zinc-400">{note.topic}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {note.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${g.color}12`,
                              color: g.color,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock size={11} />
                          {note.updated}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
