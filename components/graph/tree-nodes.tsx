"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TreeNodeData } from "@/lib/graph";

/* ── 颜色工具：将 CSS var 字符串转为真实 hex，绕过 ReactFlow 中 var() 后缀失效问题 ── */

const VAR_TO_HEX: Record<string, string> = {
  "var(--domain-hardware)": "#10b981",
  "var(--domain-software)": "#3b82f6",
  "var(--domain-math)": "#8b5cf6",
  "var(--domain-philosophy)": "#f59e0b",
  "var(--domain-business)": "#f43f5e",
  "var(--domain-teal)": "#14b8a6",
  "var(--domain-cyan)": "#06b6d4",
  "var(--domain-indigo)": "#6366f1",
  "var(--domain-pink)": "#ec4899",
  "var(--domain-orange)": "#f97316",
  "var(--domain-lime)": "#84cc16",
  "var(--domain-rose)": "#e11d48",
  "var(--domain-sky)": "#0ea5e9",
  "var(--domain-violet)": "#7c3aed",
  "var(--domain-amber)": "#d97706",
  "var(--fg)": "#18181b",
};

/** CSS var 字符串 → hex。可选 alpha 0-1 追加为 8 位 hex */
function hex(color: string, alpha?: number): string {
  const h = VAR_TO_HEX[color] ?? "#18181b";
  if (alpha === undefined) return h;
  return h + Math.round(alpha * 255).toString(16).padStart(2, "0");
}

/* L0 — 领域根节点 */
function TreeDomainNode({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  return (
    <div className="rounded-[14px] px-5 py-3 border-2 flex items-center gap-3 cursor-pointer transition-shadow hover:shadow-md"
      style={{ borderColor: d.color, backgroundColor: `${d.color}10`, minWidth: 200, boxShadow: `0 0 16px ${d.color}18` }}>
      <Handle type="source" position={Position.Right} style={{ backgroundColor: d.color, width: 6, height: 6, border: "none" }} />
      <div className="size-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: d.color }}>{d.label[0]}</div>
      <div>
        <div className="text-sm font-semibold">{d.label}</div>
        <div className="text-[10px] text-zinc-500">{count > 0 ? `${count} 篇笔记` : "暂无笔记"}</div>
      </div>
    </div>
  );
}

/* L1 — 卡片：色条 + 渐变 */
function TopicL1({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="rounded-[12px] px-3 py-2 cursor-pointer transition-all hover:shadow-sm border"
      style={{ minWidth: 180, minHeight: 44, borderColor: `${color}25`, borderLeftWidth: 4, borderLeftColor: color,
        background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`, paddingLeft: 10 }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: color, width: 5, height: 5, border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: color, width: 5, height: 5, border: "none" }} />
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium" style={{ color }}>{d.label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: count > 0 ? hex(color, 0.8) : "var(--ac)", color: count > 0 ? "white" : "var(--bd)" }}>{count}</span>
      </div>
    </div>
  );
}

/* L2 — 卡片：菱形 */
function TopicL2({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="rounded-lg px-3 py-1.5 cursor-pointer transition-all hover:shadow-sm border"
      style={{ minWidth: 160, minHeight: 36, backgroundColor: `${color}05`, borderColor: `${color}20` }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: `${color}66`, width: 4, height: 4, border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: `${color}66`, width: 4, height: 4, border: "none" }} />
      <div className="flex items-center gap-2">
        <span className="shrink-0" style={{ width: 6, height: 6, backgroundColor: color, transform: "rotate(45deg)", marginLeft: 2 }} />
        <span className="text-xs font-medium" style={{ color: "var(--fg)" }}>{d.label}</span>
        <span className="text-[10px] px-1 rounded-full" style={{ backgroundColor: count > 0 ? hex(color, 0.094) : "var(--ac)", color: count > 0 ? color : "var(--bd)" }}>{count}</span>
      </div>
    </div>
  );
}

/* L3 — 轻卡片：极淡领域色底 + 领域色边框，空心圆标记，衔接 L2 与 L4 */
function TopicL3({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="rounded-md px-3 py-1.5 cursor-pointer transition-all hover:shadow-sm border"
      style={{ minWidth: 140, minHeight: 30, backgroundColor: `${color}06`, borderColor: `${color}20` }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: `${color}66`, width: 3, height: 3, border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: `${color}66`, width: 3, height: 3, border: "none" }} />
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, border: `2px solid ${color}`, backgroundColor: "transparent", marginLeft: 2 }} />
        <span className="text-[11px]" style={{ color: "var(--fg)" }}>{d.label}</span>
        <span className="text-[9px] px-1 rounded-full" style={{ backgroundColor: count > 0 ? hex(color, 0.082) : "var(--ac)", color: count > 0 ? hex(color, 0.8) : "var(--bd)" }}>{count}</span>
      </div>
    </div>
  );
}

/* L4 — 彩色标签：无底无边，领域色加粗文字 + 实心圆点，衔接卡片与纯文字 */
function TopicL4({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="flex items-center gap-2 cursor-pointer transition-all hover:opacity-80"
      style={{ minWidth: 140, minHeight: 28, paddingLeft: 4 }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: `${color}4d`, width: 3, height: 3, border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: `${color}4d`, width: 3, height: 3, border: "none" }} />
      <span className="shrink-0 rounded-full" style={{ width: 5, height: 5, backgroundColor: color }} />
      <span className="text-[12px] font-semibold" style={{ color }}>{d.label}</span>
      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: count > 0 ? hex(color, 0.6) : "var(--ac)", color: count > 0 ? "white" : "var(--bd)" }}>{count}</span>
    </div>
  );
}

/* L5 — 左侧色条：无底无边，短竖线 accent bar */
function TopicL5({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="flex items-center cursor-pointer transition-all hover:opacity-80"
      style={{ minWidth: 126, minHeight: 22, paddingLeft: 8 }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: "var(--bd)", width: 2, height: 2, border: "none", opacity: 0.4 }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: "var(--bd)", width: 2, height: 2, border: "none", opacity: 0.4 }} />
      <span className="shrink-0 rounded-sm" style={{ width: 2.5, height: 14, backgroundColor: `${color}59`, marginRight: 6 }} />
      <span className="text-[10px]" style={{ color: "var(--fg)" }}>{d.label}</span>
      <span className="text-[8px] ml-1.5" style={{ color: count > 0 ? color : "var(--bd)" }}>{count}</span>
    </div>
  );
}

/* L6 — 圆点引导：仅点 + 文字，更深缩进 */
function TopicL6({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="flex items-center cursor-pointer transition-all hover:opacity-70"
      style={{ minWidth: 114, minHeight: 20, paddingLeft: 16, opacity: 0.85 }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: "var(--bd)", width: 1.5, height: 1.5, border: "none", opacity: 0.2 }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: "var(--bd)", width: 1.5, height: 1.5, border: "none", opacity: 0.2 }} />
      <span className="shrink-0 rounded-full" style={{ width: 3, height: 3, backgroundColor: `${color}40`, marginRight: 8 }} />
      <span className="text-[9px]" style={{ color: "var(--fg)" }}>{d.label}</span>
      <span className="text-[7px] ml-1" style={{ color: count > 0 ? color : "var(--bd)" }}>{count}</span>
    </div>
  );
}

/* L7 — 叶子：斜体淡化，最小存在感 */
function TopicL7({ data }: NodeProps) {
  const d = data as unknown as TreeNodeData;
  const count = d.noteCount ?? 0;
  const color = d.color;
  return (
    <div className="flex items-center cursor-pointer transition-all hover:opacity-60"
      style={{ minWidth: 104, minHeight: 18, paddingLeft: 24, opacity: 0.7 }}>
      <Handle type="target" position={Position.Left} style={{ backgroundColor: "var(--bd)", width: 1, height: 1, border: "none", opacity: 0.1 }} />
      <Handle type="source" position={Position.Right} style={{ backgroundColor: "var(--bd)", width: 1, height: 1, border: "none", opacity: 0.1 }} />
      <span className="text-[8px] italic" style={{ color: "var(--fg)" }}>{d.label}</span>
      <span className="text-[7px] ml-1" style={{ color: count > 0 ? color : "var(--bd)" }}>{count}</span>
    </div>
  );
}

/* 路由 */
function TreeTopicNode(props: NodeProps) {
  const level = ((props.data as unknown as TreeNodeData).level) ?? 1;
  switch (level) {
    case 1: return <TopicL1 {...props} />;
    case 2: return <TopicL2 {...props} />;
    case 3: return <TopicL3 {...props} />;
    case 4: return <TopicL4 {...props} />;
    case 5: return <TopicL5 {...props} />;
    case 6: return <TopicL6 {...props} />;
    default: return <TopicL7 {...props} />;
  }
}

export const treeDomainNode = memo(TreeDomainNode);
export const treeTopicNode = memo(TreeTopicNode);
export const treeNodeTypes = { treeDomain: treeDomainNode, treeTopic: treeTopicNode };
