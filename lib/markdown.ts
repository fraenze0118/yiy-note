import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import katex from "katex";

/* ── Syntax highlighting ── */

marked.use(
  markedHighlight({
    highlight(code, lang) {
      if (!lang) return code; // 未指定语言：原样返回，避免 ASCII 图被误高亮
      if (hljs.getLanguage(lang)) {
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

/**
 * 分三步保护内容不被数学替换误伤：
 * 1. 提取代码块/行内代码 → 占位符
 * 2. 块公式 $$...$$ → KaTeX HTML → 占位符（避免行内正则误伤 KaTeX 内的 $）
 * 3. 行内公式 $...$ → KaTeX HTML
 * 4. 按顺序还原所有占位符
 */
function replaceMath(md: string): string {
  // 提取围栏代码块
  const fences: string[] = [];
  const safe = md.replace(/```[\s\S]*?```/g, (m) => {
    fences.push(m);
    return `%%FENCE${fences.length - 1}%%`;
  });
  // 提取行内代码
  const inlines: string[] = [];
  const safe2 = safe.replace(/`[^`]+`/g, (m) => {
    inlines.push(m);
    return `%%INLINE${inlines.length - 1}%%`;
  });

  // 块公式 → KaTeX → 占位符（关键：防止 MathML annotation 中的 $ 被行内正则捕获）
  const blocks: string[] = [];
  let result = safe2.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    const html = renderKatex(tex.trim(), true);
    blocks.push(html);
    return `%%BLOCK${blocks.length - 1}%%`;
  });

  // 行内数学：\$ 不视为结束符。匹配后检查内容——纯数字/逗号/句点视为金额保留原文
  result = result.replace(/\$(.*?)(?<![\\\s])\$/g, (fullMatch, tex) => {
    const t = tex.trim();
    if (!t || /^[\d,.\s]+$/.test(t)) return fullMatch;
    return renderKatex(t, false);
  });

  // 按提取逆序还原（先还原行内代码 → 围栏 → 块公式 HTML）
  result = result.replace(/%%INLINE(\d+)%%/g, (_, i) => inlines[+i]);
  result = result.replace(/%%FENCE(\d+)%%/g, (_, i) => fences[+i]);
  result = result.replace(/%%BLOCK(\d+)%%/g, (_, i) => blocks[+i]);

  return result;
}

/* ── Exports ── */

export function renderMarkdown(md: string): string {
  return marked.parse(replaceMath(md)) as string;
}

export const renderMarkdownClient = renderMarkdown;
