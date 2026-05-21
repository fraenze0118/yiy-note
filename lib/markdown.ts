import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import katex from "katex";

/* ── Syntax highlighting ── */

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

/* ── marked config ── */

marked.setOptions({
  gfm: true,
  breaks: false,
});

/* ── KaTeX math ── */

function renderKatex(text: string, displayMode: boolean): string {
  try {
    return katex.renderToString(text, { displayMode, throwOnError: false });
  } catch {
    return text;
  }
}

/** 保护代码块内的 $ 不被数学替换误伤 */
function replaceMath(md: string): string {
  // Extract fenced code blocks to protect them
  const fences: string[] = [];
  const safe = md.replace(/```[\s\S]*?```/g, (m) => {
    fences.push(m);
    return `%%FENCE${fences.length - 1}%%`;
  });
  // Extract inline code
  const inlines: string[] = [];
  const safe2 = safe.replace(/`[^`]+`/g, (m) => {
    inlines.push(m);
    return `%%INLINE${inlines.length - 1}%%`;
  });

  // Replace math in protected text
  let result = safe2;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) =>
    renderKatex(tex.trim(), true)
  );
  result = result.replace(/\$(.*?)\$/g, (_, tex) =>
    renderKatex(tex.trim(), false)
  );

  // Restore inline code and fences
  result = result.replace(/%%INLINE(\d+)%%/g, (_, i) => inlines[+i]);
  result = result.replace(/%%FENCE(\d+)%%/g, (_, i) => fences[+i]);

  return result;
}

/* ── Exports ── */

export function renderMarkdown(md: string): string {
  return marked.parse(replaceMath(md)) as string;
}

export const renderMarkdownClient = renderMarkdown;
