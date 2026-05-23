import { readFileSync, existsSync } from "fs";
import { TOPICS_FILE } from "./data-path";
import { getAllNotes } from "./notes-data";
import { domains } from "./domains";
import { flattenTopics } from "./topics-data";
import { loadPositions } from "./positions";
import type { NoteMeta } from "./types";
import type { TopicNodeData } from "./topics-data";

function loadTopicTree(): Record<string, TopicNodeData[]> {
  if (!existsSync(TOPICS_FILE)) return {};
  const raw = readFileSync(TOPICS_FILE, "utf-8");
  return JSON.parse(raw) as Record<string, TopicNodeData[]>;
}

export interface TreeNodeData {
  label: string;
  domain: string;
  color: string;
  level: number;
  nodeType: "domain" | "topic";
  topicId?: string;
  noteCount?: number;
  noteIds?: string[];
  [key: string]: unknown;
}

export interface TreeGraphData {
  nodes: { id: string; data: TreeNodeData }[];
  edges: { id: string; source: string; target: string }[];
  savedPositions: Record<string, { x: number; y: number }>;
}

export async function buildDomainTree(domainKey: string): Promise<TreeGraphData> {
  const allNotes = await getAllNotes();
  const domainNotes = allNotes.filter((n) => n.domain === domainKey);
  const domain = domains.find((d) => d.key === domainKey);
  const color = domain?.color ?? "var(--fg)";
  const topicTree = loadTopicTree();
  const tree = topicTree[domainKey] ?? [];

  const noteByTopic = new Map<string, NoteMeta[]>();
  const flatMap = flattenTopics(tree);
  for (const note of domainNotes) {
    let matchedId: string | null = null;
    // First try topicId (new format), then fall back to topic name matching
    if (note.topicId && flatMap.has(note.topicId)) {
      matchedId = note.topicId;
    } else {
      for (const [id, pathArr] of flatMap) {
        if (pathArr[pathArr.length - 1] === note.topic || pathArr.join(" / ") === note.topic) {
          matchedId = id;
          break;
        }
      }
    }
    if (matchedId) {
      const arr = noteByTopic.get(matchedId) ?? [];
      arr.push(note);
      noteByTopic.set(matchedId, arr);
    } else {
      const arr = noteByTopic.get("__unmatched__") ?? [];
      arr.push(note);
      noteByTopic.set("__unmatched__", arr);
    }
  }

  const graphNodes: TreeGraphData["nodes"] = [];
  const graphEdges: TreeGraphData["edges"] = [];

  const domainId = `domain-${domainKey}`;
  graphNodes.push({
    id: domainId,
    data: {
      label: domain?.name ?? domainKey,
      domain: domainKey,
      color,
      level: 0,
      nodeType: "domain",
      noteCount: domainNotes.length,
      noteIds: domainNotes.map((n) => n.id),
    },
  });

  function collectNoteIds(topicNode: TopicNodeData): string[] {
    const direct = (noteByTopic.get(topicNode.id) ?? []).map((n) => n.id);
    const child = topicNode.children?.flatMap(collectNoteIds) ?? [];
    return [...direct, ...child];
  }

  function buildSubtree(nodes: TopicNodeData[], parentId: string, level: number) {
    for (const node of nodes) {
      const allIds = collectNoteIds(node);
      graphNodes.push({
        id: node.id,
        data: {
          label: node.name,
          domain: domainKey,
          color,
          level,
          nodeType: "topic",
          topicId: node.id,
          noteCount: allIds.length,
          noteIds: allIds,
        },
      });
      graphEdges.push({
        id: `${parentId}->${node.id}`,
        source: parentId,
        target: node.id,
      });

      if (node.children && node.children.length > 0) {
        buildSubtree(node.children, node.id, level + 1);
      }
    }
  }

  buildSubtree(tree, domainId, 1);

  const savedPositions = await loadPositions(domainKey);
  return { nodes: graphNodes, edges: graphEdges, savedPositions };
}
