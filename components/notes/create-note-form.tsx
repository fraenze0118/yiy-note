"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image } from "lucide-react";
import Link from "next/link";
import { createNote } from "@/lib/notes";
import { uploadImage } from "@/lib/images";
import type { DomainDef, TopicOption } from "@/lib/types";

function flattenTopics(topics: TopicOption[], depth = 0): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const t of topics) {
    result.push({ id: t.id, label: `${"-- ".repeat(depth)}${t.name}` });
    if (t.children) {
      result.push(...flattenTopics(t.children, depth + 1));
    }
  }
  return result;
}

export function CreateNoteForm({
  defaultDomain,
  defaultTopic,
  domains,
}: {
  defaultDomain: string;
  defaultTopic?: string;
  domains: DomainDef[];
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(defaultDomain);
  const [topic, setTopic] = useState(defaultTopic ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const currentDomainDef = domains.find((d) => d.key === domain);
  const topicOptions = useMemo(
    () => (currentDomainDef ? flattenTopics(currentDomainDef.topics) : []),
    [currentDomainDef]
  );

  // Sync defaultTopic from URL param (one-shot)
  const topicInitRef = useRef(false);
  useEffect(() => {
    if (defaultTopic && !topicInitRef.current && topicOptions.length > 0) {
      const match = topicOptions.find((t) => t.id === defaultTopic);
      if (match) { setTopic(match.id); topicInitRef.current = true; }
    }
  }, [defaultTopic, topicOptions]);

  const handleSave = async () => {
    if (!title.trim() || !topic) return;
    setSaving(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const meta = await createNote(domain, topic, title.trim(), content, tagList);
      router.push(`/notes/${meta.id}`);
    } catch {
      router.push("/login");
    } finally {
      setSaving(false);
    }
  };

  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    const newPos = start + text.length;
    setTimeout(() => { ta.setSelectionRange(newPos, newPos); ta.focus(); }, 0);
  }, [content]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const url = await uploadImage(domain, reader.result as string);
            insertAtCursor(`![图片](${url})\n`);
          } catch { /* ignore */ }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [domain, insertAtCursor]);

  const handleImageImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const url = await uploadImage(domain, reader.result as string);
        insertAtCursor(`![图片](${url})\n`);
      } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, [domain, insertAtCursor]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Link
          href="/notes"
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} />
          取消
        </Link>
        <button
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="插入图片"
        >
          <Image size={14} />
          图片
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !topic}
          className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: currentDomainDef?.color ?? "var(--fg)" }}
        >
          <Save size={14} />
          {saving ? "创建中..." : "创建笔记"}
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageImport}
      />

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl font-semibold tracking-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
        placeholder="笔记标题"
        autoFocus
      />

      {/* Domain & Topic selector */}
      <div className="flex items-center gap-3">
        <select
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value);
            setTopic("");
          }}
          className="h-8 px-2 rounded-lg text-xs bg-[var(--sb)] border outline-none"
          style={{ borderColor: "var(--bd)" }}
        >
          {domains.map((d) => (
            <option key={d.key} value={d.key}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-8 px-2 rounded-lg text-xs bg-[var(--sb)] border outline-none min-w-0"
          style={{ borderColor: "var(--bd)" }}
        >
          <option value="">选择主题</option>
          {topicOptions.map((t) => (
            <option key={t.id} value={t.id}>
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

      {/* Content */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onPaste={handlePaste}
        className="w-full min-h-[400px] bg-transparent outline-none resize-y font-mono text-sm leading-7 p-4 rounded-xl border"
        style={{ borderColor: "var(--bd)" }}
        placeholder="开始写作...（支持 Markdown、KaTeX 数学公式、代码高亮）"
      />
    </div>
  );
}
