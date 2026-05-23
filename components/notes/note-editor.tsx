"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Edit3, X } from "lucide-react";
import type { Note, TopicOption, DomainDef } from "@/lib/types";
import { updateNote } from "@/lib/notes";
import { renderMarkdownClient } from "@/lib/markdown";
import { CodeEnhancer } from "./copy-button";

function flattenTopicNames(topics: TopicOption[], depth = 0): { id: string; name: string; label: string }[] {
  const result: { id: string; name: string; label: string }[] = [];
  for (const t of topics) {
    result.push({ id: t.id, name: t.name, label: `${"-- ".repeat(depth)}${t.name}` });
    if (t.children) {
      result.push(...flattenTopicNames(t.children, depth + 1));
    }
  }
  return result;
}

export function NoteEditor({ note, allTitles, domains }: { note: Note; allTitles: string[]; domains: DomainDef[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(note.meta.title);
  const [content, setContent] = useState(note.content);
  const [topic, setTopic] = useState(note.meta.topic);
  const [tags, setTags] = useState(note.meta.tags.join(", "));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Double-link autocomplete state
  const [linkSuggestions, setLinkSuggestions] = useState<string[]>([]);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkIdx, setLinkIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const domain = domains.find((d) => d.key === note.meta.domain);
  const topicOptions = useMemo(
    () => (domain ? flattenTopicNames(domain.topics) : []),
    [domain]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await updateNote(note.meta.id, { title, content, topic, tags: tagList });
      router.push(`/notes/${note.meta.id}`);
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setSaving(false);
    }
  }, [title, content, topic, tags, note.meta.id, router]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Check for [[ autocomplete
    const cursor = e.target.selectionStart;
    const before = val.slice(0, cursor);
    const match = before.match(/\[\[([^\]]*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      setLinkQuery(q);
      const suggestions = allTitles
        .filter((t) => t !== note.meta.title && t.toLowerCase().includes(q))
        .slice(0, 8);
      setLinkSuggestions(suggestions);
      setLinkIdx(0);
    } else {
      setLinkSuggestions([]);
    }
  };

  const insertLink = (linkTitle: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const before = content.slice(0, cursor);
    const after = content.slice(cursor);
    const match = before.match(/\[\[[^\]]*$/);
    if (match) {
      const insertPos = before.length - match[0].length;
      const newContent = content.slice(0, insertPos) + `[[${linkTitle}]]` + after;
      setContent(newContent);
      setLinkSuggestions([]);
      // Restore cursor position after the inserted link
      const newCursor = insertPos + linkTitle.length + 4;
      setTimeout(() => {
        textarea.setSelectionRange(newCursor, newCursor);
        textarea.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (linkSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setLinkIdx((i) => (i + 1) % linkSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLinkIdx((i) => (i - 1 + linkSuggestions.length) % linkSuggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertLink(linkSuggestions[linkIdx]);
    } else if (e.key === "Escape") {
      setLinkSuggestions([]);
    }
  };

  const previewHtml = preview ? renderMarkdownClient(content) : "";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs transition-colors ${
            preview
              ? ""
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
          style={preview ? { backgroundColor: "var(--ac)" } : undefined}
        >
          {preview ? <Edit3 size={14} /> : <Eye size={14} />}
          {preview ? "编辑" : "预览"}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => router.push(`/notes/${note.meta.id}`)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <X size={14} />
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ backgroundColor: domain?.color ?? "var(--fg)" }}
        >
          <Save size={14} />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        placeholder="笔记标题"
      />

      {/* Meta */}
      <div className="flex items-center gap-3">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-8 px-2 rounded-lg text-xs bg-[var(--sb)] border outline-none"
          style={{ borderColor: "var(--bd)" }}
        >
          {topicOptions.map((t) => (
            <option key={t.id} value={t.name}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="标签（逗号分隔）"
          className="flex-1 h-8 px-2 rounded-lg text-xs bg-[var(--sb)] border outline-none placeholder:text-zinc-400"
          style={{ borderColor: "var(--bd)" }}
        />
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <>
          <div
            className="prose-note min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          <CodeEnhancer />
        </>
      ) : (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[400px] bg-transparent outline-none resize-y text-sm p-4 rounded-xl border"
            style={{ borderColor: "var(--bd)", fontFamily: `"Sarasa Mono SC", "Cascadia Code", "JetBrains Mono", "Fira Code", "SimSun", "宋体", "ui-monospace", "SFMono-Regular", "monospace"`, lineHeight: 1.5, fontVariantLigatures: "none", tabSize: 4 }}
            placeholder="开始写作...（支持 Markdown、KaTeX 数学公式、代码高亮、[[ 插入双链）
"
          />
          {linkSuggestions.length > 0 && (
            <div
              className="absolute left-4 z-20 rounded-xl border shadow-lg overflow-hidden min-w-[220px]"
              style={{
                borderColor: "var(--bd)",
                backgroundColor: "var(--sb)",
                bottom: "100%",
                marginBottom: 4,
              }}
            >
              <div className="px-3 py-1.5 border-b text-[10px] text-zinc-400" style={{ borderColor: "var(--bd)" }}>
                链接到笔记 ({linkQuery ? `"${linkQuery}"` : "全部"})
              </div>
              {linkSuggestions.map((t, i) => (
                <button
                  key={t}
                  onClick={() => insertLink(t)}
                  onMouseEnter={() => setLinkIdx(i)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--ac)] transition-colors flex items-center gap-2"
                  style={
                    i === linkIdx
                      ? { backgroundColor: "var(--ac)" }
                      : undefined
                  }
                >
                  <span className="size-1 rounded-full" style={{ backgroundColor: "var(--bd)" }} />
                  {t}
                </button>
              ))}
              <div className="px-3 py-1 border-t text-[10px] text-zinc-400" style={{ borderColor: "var(--bd)" }}>
                ↑↓ 选择 &middot; ↵ 确认 &middot; Esc 关闭
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
