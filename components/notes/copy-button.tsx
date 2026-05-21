"use client";

import { useEffect } from "react";

/** 为 .prose-note 内所有 pre 注入语言标签 + 复制按钮 */
export function CodeEnhancer() {
  useEffect(() => {
    const containers = document.querySelectorAll(".prose-note");
    for (const container of containers) {
      const pres = container.querySelectorAll("pre");
      for (const pre of pres) {
        if (pre.querySelector(".code-tools")) continue;

        const code = pre.querySelector("code");
        const lang = code?.className.match(/language-(\w+)/)?.[1] ?? "";
        const label = lang || "text";

        /* ── toolbar ── */
        const tools = document.createElement("div");
        tools.className = "code-tools";

        const langSpan = document.createElement("span");
        langSpan.className = "code-lang";
        langSpan.textContent = label;

        const btn = document.createElement("button");
        btn.className = "code-copy";
        btn.textContent = "Copy";
        btn.onclick = async () => {
          const text = code?.textContent ?? "";
          try {
            await navigator.clipboard.writeText(text);
            btn.textContent = "Copied!";
            setTimeout(() => (btn.textContent = "Copy"), 2000);
          } catch {
            btn.textContent = "Failed";
            setTimeout(() => (btn.textContent = "Copy"), 2000);
          }
        };

        tools.appendChild(langSpan);
        tools.appendChild(btn);
        pre.insertBefore(tools, pre.firstChild);
      }
    }
  }, []);

  return null;
}
