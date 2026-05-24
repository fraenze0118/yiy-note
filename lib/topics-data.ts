import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

import { TOPICS_FILE } from "./data-path";

export interface TopicNodeData {
  id: string;
  name: string;
  children?: TopicNodeData[];
}

export type TopicTreeData = Record<string, TopicNodeData[]>;

export async function readTopicTree(): Promise<TopicTreeData> {
  if (!existsSync(TOPICS_FILE)) return {};
  const raw = await readFile(TOPICS_FILE, "utf-8");
  return JSON.parse(raw) as TopicTreeData;
}

export async function writeTopicTree(tree: TopicTreeData): Promise<void> {
  await mkdir(path.dirname(TOPICS_FILE), { recursive: true });
  await writeFile(TOPICS_FILE, JSON.stringify(tree, null, 2), "utf-8");
}

/** Flatten the topic tree to a map of id → path array */
export function flattenTopics(
  tree: TopicNodeData[],
  parentPath: string[] = []
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const node of tree) {
    const path = [...parentPath, node.name];
    map.set(node.id, path);
    if (node.children) {
      for (const [k, v] of flattenTopics(node.children, path)) {
        map.set(k, v);
      }
    }
  }
  return map;
}

/** Build a map of topic name → topic id for migration purposes */
export function buildTopicNameMap(tree: TopicNodeData[]): Map<string, string> {
  const map = new Map<string, string>();
  function walk(nodes: TopicNodeData[], parentPath: string[] = []) {
    for (const node of nodes) {
      const path = [...parentPath, node.name];
      map.set(node.name, node.id);
      map.set(path.join(" / "), node.id);
      if (node.children) walk(node.children, path);
    }
  }
  walk(tree);
  return map;
}

/** Find a node by id in the tree */
export function findNode(
  tree: TopicNodeData[],
  id: string
): TopicNodeData | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Find the parent id of a node */
export function findParentId(
  tree: TopicNodeData[],
  id: string
): string | null {
  for (const node of tree) {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === id) return node.id;
      }
      const found = findParentId(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Check if a node is a leaf (has no children) */
export function isLeafNode(tree: TopicNodeData[], id: string): boolean {
  const node = findNode(tree, id);
  return node !== null && (!node.children || node.children.length === 0);
}

/** Add a child node to a parent. Returns true if parent was found. */
export function addChildNode(
  tree: TopicNodeData[],
  parentId: string,
  child: TopicNodeData
): boolean {
  for (const node of tree) {
    if (node.id === parentId) {
      node.children = [...(node.children ?? []), child];
      return true;
    }
    if (node.children && addChildNode(node.children, parentId, child)) {
      return true;
    }
  }
  return false;
}

/** Rename a node by id. Returns true if found. */
export function renameNode(
  tree: TopicNodeData[],
  id: string,
  newName: string
): boolean {
  for (const node of tree) {
    if (node.id === id) {
      node.name = newName;
      return true;
    }
    if (node.children && renameNode(node.children, id, newName)) {
      return true;
    }
  }
  return false;
}

type RemoveResult = { removed: TopicNodeData; parentId: string | null };

/** Remove a node by id. Returns the removed node and its parent id, or null. */
export function removeNode(
  tree: TopicNodeData[],
  id: string,
  parentId?: string
): RemoveResult | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      const removed = tree.splice(i, 1)[0];
      return { removed, parentId: parentId ?? null };
    }
    if (tree[i].children) {
      const result = removeNode(tree[i].children!, id, tree[i].id);
      if (result) {
        // Clean up empty children array
        if (tree[i].children!.length === 0) {
          delete tree[i].children;
        }
        return result;
      }
    }
  }
  return null;
}

/** Resolve a topic name from topicId */
export function resolveTopicName(tree: TopicNodeData[], topicId: string): string | null {
  const node = findNode(tree, topicId);
  return node?.name ?? null;
}
