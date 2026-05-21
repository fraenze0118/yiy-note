"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import {
  readTopicTree,
  writeTopicTree,
  isLeafNode,
  addChildNode,
  renameNode,
  removeNode,
  findNode,
  findParentId,
  type TopicNodeData,
} from "./topics-data";
import { getAllNotes } from "./notes-data";

class AuthError extends Error {
  constructor() {
    super("请先登录");
    this.name = "AuthError";
  }
}

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new AuthError();
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function addTopicNode(
  domainKey: string,
  parentId: string,
  name: string
): Promise<TopicNodeData> {
  await requireAuth();
  const tree = await readTopicTree();
  if (!tree[domainKey]) {
    tree[domainKey] = [];
  }
  const domainNodes = tree[domainKey];
  const newNode: TopicNodeData = { id: generateId(), name };

  // If parent is the domain root node (e.g. "domain-hardware"), add at top level
  if (parentId === `domain-${domainKey}`) {
    domainNodes.push(newNode);
  } else {
    const added = addChildNode(domainNodes, parentId, newNode);
    if (!added) {
      throw new Error(`父节点 "${parentId}" 不存在`);
    }
  }

  await writeTopicTree(tree);
  revalidatePath("/graph");
  revalidatePath("/notes");
  revalidatePath("/");
  return newNode;
}

export async function renameTopicNode(
  domainKey: string,
  nodeId: string,
  newName: string
): Promise<void> {
  await requireAuth();
  const tree = await readTopicTree();
  const domainNodes = tree[domainKey];
  if (!domainNodes) {
    throw new Error(`领域 "${domainKey}" 不存在`);
  }

  const oldNode = findNode(domainNodes, nodeId);
  if (!oldNode) {
    throw new Error(`节点 "${nodeId}" 不存在`);
  }
  const oldName = oldNode.name;

  const renamed = renameNode(domainNodes, nodeId, newName);
  if (!renamed) {
    throw new Error(`无法重命名节点 "${nodeId}"`);
  }

  // Update the topic display name in all notes referencing this topicId
  const allNotes = await getAllNotes();
  const { updateNoteData } = await import("./notes-data");
  for (const note of allNotes) {
    if (note.topicId === nodeId || note.topic === oldName) {
      await updateNoteData(note.id, { topic: newName });
    }
  }

  await writeTopicTree(tree);
  revalidatePath("/graph");
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function deleteTopicNode(
  domainKey: string,
  nodeId: string
): Promise<void> {
  await requireAuth();
  const tree = await readTopicTree();
  const domainNodes = tree[domainKey];
  if (!domainNodes) {
    throw new Error(`领域 "${domainKey}" 不存在`);
  }

  if (!isLeafNode(domainNodes, nodeId)) {
    throw new Error("只能删除叶子节点（没有子节点的节点）");
  }

  // Find parent — may be another topic node or the domain root
  const parentId = findParentId(domainNodes, nodeId);

  const removed = removeNode(domainNodes, nodeId);
  if (!removed) {
    throw new Error(`节点 "${nodeId}" 不存在`);
  }

  // Reassign notes to parent node (or domain if parent is the domain root)
  const parentNode = parentId ? findNode(domainNodes, parentId) : null;
  const allNotes = await getAllNotes();
  const { updateNoteData } = await import("./notes-data");
  for (const note of allNotes) {
    if (note.topicId === nodeId || note.topic === removed.removed.name) {
      await updateNoteData(note.id, {
        topic: parentNode?.name ?? domainKey,
      });
    }
  }

  await writeTopicTree(tree);
  revalidatePath("/graph");
  revalidatePath("/notes");
  revalidatePath("/");
}
