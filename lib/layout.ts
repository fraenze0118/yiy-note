import dagre from "@dagrejs/dagre";
import { MarkerType } from "@xyflow/react";
import type { TreeGraphData } from "./graph";

/* ── 节点尺寸映射（与 tree-nodes.tsx 保持一致） ── */

function getNodeSize(nodeType: string, level: number): { width: number; height: number } {
  if (nodeType === "domain") return { width: 200, height: 50 };
  if (level === 1) return { width: 180, height: 44 };
  if (level === 2) return { width: 160, height: 36 };
  if (level === 3) return { width: 140, height: 30 };
  if (level === 4) return { width: 140, height: 28 };
  if (level === 5) return { width: 126, height: 22 };
  if (level === 6) return { width: 114, height: 20 };
  return { width: 104, height: 18 }; // level 7+
}

/* ── 边样式（按目标节点层级） ── */

interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  opacity: number;
  type: "default" | "smoothstep";
  markerEnd?: { type: MarkerType; width: number; height: number; color: string };
}

function edgeStyleForTargetLevel(level: number): EdgeStyle {
  // L0-L3: 直线 + 箭头（骨架层）
  if (level <= 1) return {
    type: "default",
    stroke: "var(--bd)",
    strokeWidth: 2.5,
    opacity: 1,
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "var(--bd)" },
  };
  if (level === 2) return {
    type: "default",
    stroke: "var(--bd)",
    strokeWidth: 2,
    opacity: 0.85,
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "var(--bd)" },
  };
  if (level === 3) return {
    type: "default",
    stroke: "var(--bd)",
    strokeWidth: 1.5,
    opacity: 0.65,
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "var(--bd)" },
  };
  // L3→L4+: smoothstep 曲线（枝叶层），无箭头，逐级淡化
  if (level === 4) return {
    type: "smoothstep",
    stroke: "var(--bd)",
    strokeWidth: 1.2,
    opacity: 0.5,
  };
  if (level === 5) return {
    type: "smoothstep",
    stroke: "var(--bd)",
    strokeWidth: 0.8,
    opacity: 0.35,
  };
  if (level === 6) return {
    type: "smoothstep",
    stroke: "var(--bd)",
    strokeWidth: 0.5,
    opacity: 0.22,
  };
  return {
    type: "smoothstep",
    stroke: "var(--bd)",
    strokeWidth: 0.3,
    opacity: 0.12,
  }; // level 7+
}

/* ── 构建边的辅助函数 ── */

function buildEdges(
  edges: TreeGraphData["edges"],
  nodes: TreeGraphData["nodes"],
) {
  // 预建 level 查找表
  const levelMap = new Map<string, number>();
  for (const n of nodes) {
    levelMap.set(n.id, (n.data as Record<string, unknown>).level as number ?? 0);
  }

  return edges.map((e) => {
    const targetLevel = levelMap.get(e.target) ?? 1;
    const es = edgeStyleForTargetLevel(targetLevel);
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: es.type,
      style: {
        stroke: es.stroke,
        strokeWidth: es.strokeWidth,
        opacity: es.opacity,
      },
      ...(es.type === "smoothstep" ? { pathOptions: { borderRadius: 12 } } : {}),
      ...(es.markerEnd ? { markerEnd: es.markerEnd } : {}),
    };
  });
}

/* ── 主布局函数 ── */

export function layoutTree(data: TreeGraphData) {
  const hasAnySaved = Object.keys(data.savedPositions).length > 0;

  if (hasAnySaved) {
    const unsavedNodes = data.nodes.filter(
      (n) => !data.savedPositions[n.id]
    );

    if (unsavedNodes.length > 0) {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({
        rankdir: "LR",
        nodesep: 22,
        ranksep: 70,
        marginx: 80,
        marginy: 60,
      });

      // Set fixed positions for saved nodes so dagre works around them
      for (const [id, pos] of Object.entries(data.savedPositions)) {
        const nodeData = data.nodes.find((n) => n.id === id);
        const size = getNodeSize(
          nodeData?.data.nodeType ?? "topic",
          (nodeData?.data as Record<string, unknown>).level as number ?? 1,
        );
        g.setNode(id, {
          width: size.width,
          height: size.height,
          x: pos.x + size.width / 2,
          y: pos.y + size.height / 2,
        });
      }

      for (const node of unsavedNodes) {
        const size = getNodeSize(
          node.data.nodeType,
          (node.data as Record<string, unknown>).level as number ?? 1,
        );
        g.setNode(node.id, { width: size.width, height: size.height });
      }

      for (const edge of data.edges) {
        g.setEdge(edge.source, edge.target);
      }

      dagre.layout(g);

      const nodes = data.nodes.map((n) => {
        const size = getNodeSize(
          n.data.nodeType,
          (n.data as Record<string, unknown>).level as number ?? 1,
        );
        const saved = data.savedPositions[n.id];
        const pos = saved ?? g.node(n.id);
        return {
          id: n.id,
          type: n.data.nodeType === "domain" ? "treeDomain" : "treeTopic",
          position: { x: pos.x - size.width / 2, y: pos.y - size.height / 2 },
          data: n.data,
          draggable: true,
        };
      });

      const edges = buildEdges(data.edges, data.nodes);
      return { nodes, edges };
    }

    // All nodes have saved positions
    const nodes = data.nodes.map((n) => {
      const size = getNodeSize(
        n.data.nodeType,
        (n.data as Record<string, unknown>).level as number ?? 1,
      );
      const pos = data.savedPositions[n.id];
      return {
        id: n.id,
        type: n.data.nodeType === "domain" ? "treeDomain" : "treeTopic",
        position: pos,
        data: n.data,
        draggable: true,
      };
    });

    const edges = buildEdges(data.edges, data.nodes);
    return { nodes, edges };
  }

  // No saved positions — first time, use dagre for everything
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: 22,
    ranksep: 70,
    marginx: 80,
    marginy: 60,
  });

  for (const node of data.nodes) {
    const size = getNodeSize(
      node.data.nodeType,
      (node.data as Record<string, unknown>).level as number ?? 1,
    );
    g.setNode(node.id, { width: size.width, height: size.height });
  }

  for (const edge of data.edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const nodes = data.nodes.map((n) => {
    const pos = g.node(n.id);
    const size = getNodeSize(
      n.data.nodeType,
      (n.data as Record<string, unknown>).level as number ?? 1,
    );
    return {
      id: n.id,
      type: n.data.nodeType === "domain" ? "treeDomain" : "treeTopic",
      position: { x: pos.x - size.width / 2, y: pos.y - size.height / 2 },
      data: n.data,
      draggable: true,
    };
  });

  const edges = buildEdges(data.edges, data.nodes);
  return { nodes, edges };
}
