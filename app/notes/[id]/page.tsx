import { notFound } from "next/navigation";
import Link from "next/link";
import { getNoteById, getAllNotes } from "@/lib/notes-data";
import { getCachedSession } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import { getDomain, domains } from "@/lib/domains";
import { ArrowLeft, Clock, Pencil } from "lucide-react";
import { NoteEditor } from "@/components/notes/note-editor";
import { CodeEnhancer } from "@/components/notes/copy-button";

export default async function NotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const edit = sp?.edit;
  const note = await getNoteById(id);
  if (!note) notFound();

  const session = await getCachedSession();
  const allNotes = await getAllNotes();
  const domain = getDomain(note.meta.domain);
  const html = renderMarkdown(note.content);
  const isEditing = session ? edit === "true" : false;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/notes"
          className="size-7 flex items-center justify-center rounded-lg hover:bg-[var(--ac)] transition-colors text-zinc-500"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="h-3 w-px" style={{ backgroundColor: "var(--bd)" }} />
        <Link
          href="/notes"
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          知识库
        </Link>
        <span className="text-sm text-zinc-400">/</span>
        <span className="text-sm text-zinc-400">{domain?.name}</span>
        <span className="text-sm text-zinc-400">/</span>
        <span className="text-sm font-medium truncate">{note.meta.title}</span>
      </div>

      {isEditing ? (
        <NoteEditor note={note} allTitles={allNotes.map((n) => n.title)} domains={domains} />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{note.meta.title}</h1>
              {session && (
                <Link
                  href={`/notes/${id}?edit=true`}
                  className="size-7 flex items-center justify-center rounded-lg hover:bg-[var(--ac)] transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  <Pencil size={14} />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
              {domain && (
                <span
                  className="px-1.5 py-0.5 rounded-md font-medium"
                  style={{
                    backgroundColor: `${domain.color}15`,
                    color: domain.color,
                  }}
                >
                  {domain.name}
                </span>
              )}
              <span>{note.meta.topic}</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                创建于 {note.meta.created} &middot; 更新于 {note.meta.updated}
              </span>
            </div>
            {note.meta.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {note.meta.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--ac)" }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <article
            className="prose-note"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <CodeEnhancer />
        </>
      )}
    </div>
  );
}
