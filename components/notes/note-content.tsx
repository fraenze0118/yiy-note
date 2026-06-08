"use client";

import { useEffect, useState } from "react";
import { renderMarkdownClient } from "@/lib/markdown";

/**
 * 客户端渲染笔记正文，避免 SSR 下 KaTeX MathML 与 React hydration 的细微 HTML 差异。
 */
export function NoteContent({ rawMarkdown }: { rawMarkdown: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(renderMarkdownClient(rawMarkdown));
  }, [rawMarkdown]);

  if (!html) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-[var(--ac)] rounded w-3/4" />
        <div className="h-4 bg-[var(--ac)] rounded w-1/2" />
        <div className="h-4 bg-[var(--ac)] rounded w-5/6" />
      </div>
    );
  }

  return (
    <article
      className="prose-note"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
