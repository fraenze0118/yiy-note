"use client";

import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { treeNodeTypes } from "./tree-nodes";
import { NotePanel } from "./note-panel";
import { layoutTree } from "@/lib/layout";
import { persistPositions } from "@/lib/positions-actions";
import { useAuth } from "@/lib/auth-context";
import type { TreeGraphData, TreeNodeData } from "@/lib/graph";
import type { NoteMeta, DomainDef } from "@/lib/types";

export function GraphView({
  domainKey,
  data,
  allNotes,
  domains,
}: {
  domainKey: string;
  data: TreeGraphData;
  allNotes: NoteMeta[];
  domains: DomainDef[];
}) {
  const router = useRouter();
  const { authenticated } = useAuth();
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const nodesRef = useRef<Node[]>([]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => layoutTree(data),
    [data]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  nodesRef.current = nodes;

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Save positions on drag stop (debounced)
  const onNodeDragStop = useCallback(
    () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const positions: Record<string, { x: number; y: number }> = {};
        for (const n of nodesRef.current) {
          positions[n.id] = { x: n.position.x, y: n.position.y };
        }
        persistPositions(domainKey, positions);
      }, 600);
    },
    [domainKey]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.data as TreeNodeData);
    },
    []
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const d = node.data as TreeNodeData;
      if (d.noteIds && d.noteIds.length > 0) {
        router.push(`/notes/${d.noteIds[0]}`);
      }
    },
    [router]
  );

  const selectedNotes = useMemo(() => {
    if (!selectedNode?.noteIds) return [];
    return allNotes.filter((n) => selectedNode.noteIds!.includes(n.id));
  }, [selectedNode, allNotes]);

  // A node is a leaf in the graph if no edge has it as source
  const selectedIsLeaf = useMemo(() => {
    if (!selectedNode) return false;
    return !edges.some((e: Edge) => e.source === selectedNode.topicId) &&
      selectedNode.nodeType !== "domain";
  }, [selectedNode, edges]);

  const closePanel = useCallback(() => setSelectedNode(null), []);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const domain = domains.find((d) => d.key === domainKey);
  const topicCount = useMemo(
    () => data.nodes.filter((n) => n.data.nodeType === "topic").length,
    [data]
  );
  const noteCount = useMemo(
    () => data.nodes.find((n) => n.data.nodeType === "domain")?.data.noteCount ?? 0,
    [data]
  );

  return (
    <div className="flex-1 flex">
      <div className="flex-1 relative">
        {/* Stats bar */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 h-8 rounded-lg text-xs"
          style={{ backgroundColor: "var(--sb)", border: "1px solid var(--bd)" }}
        >
          <span className="font-medium" style={{ color: domain?.color }}>
            {domain?.name}
          </span>
          <span className="text-zinc-400">
            {topicCount} 主题 &middot; {noteCount} 笔记
          </span>
        </div>

        {/* Tip */}
        <div className="absolute top-3 right-3 z-10 text-[10px] text-zinc-400">
          单击查看详情{authenticated ? " & 管理" : ""} &middot; 双击打开第一篇 &middot; 拖拽自由布局
        </div>

        {data.nodes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full text-sm text-zinc-400">
            该领域暂无数据
            {authenticated && (
              <span className="ml-1">— 点击节点右侧面板添加子节点</span>
            )}
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={treeNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.08}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="var(--bd)" />
            <Controls
              className="!rounded-lg !border !shadow-sm"
              style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}
            />
            <MiniMap
              className="!rounded-lg !border !shadow-sm"
              style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}
              nodeColor={(n) => {
                const d = n.data as TreeNodeData;
                if (d.nodeType === "domain") return d.color;
                const opacities = [0.7, 0.55, 0.4, 0.28, 0.18, 0.1];
                const idx = Math.min((d.level ?? 1) - 1, opacities.length - 1);
                const alpha = Math.max(0, Math.round(opacities[Math.max(0, idx)] * 100));
                return `${d.color}${alpha}`;
              }}
              maskColor="var(--bg)"
            />
          </ReactFlow>
        )}
      </div>

      {selectedNode && (
        <NotePanel
          node={selectedNode}
          notes={selectedNotes}
          isLeaf={selectedIsLeaf}
          authenticated={authenticated}
          onClose={closePanel}
          onRefresh={handleRefresh}
          domains={domains}
        />
      )}
    </div>
  );
}
