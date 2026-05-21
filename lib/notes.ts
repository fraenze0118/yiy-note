"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import type { NoteMeta } from "./types";
import {
  createNote as createNoteData,
  updateNoteData,
  deleteNoteData,
} from "./notes-data";

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

export async function createNote(
  domain: string,
  topicId: string,
  title: string,
  content: string,
  tags: string[] = []
): Promise<NoteMeta> {
  await requireAuth();
  // Resolve topic display name from topicId
  const { readTopicTree, findNode } = await import("./topics-data");
  const tree = await readTopicTree();
  const domainNodes = tree[domain] ?? [];
  const topicNode = findNode(domainNodes, topicId);
  const topicName = topicNode?.name ?? topicId;
  const meta = await createNoteData(domain, topicName, title, content, tags);
  revalidatePath("/notes");
  revalidatePath("/");
  return meta;
}

export async function updateNote(
  id: string,
  updates: { title?: string; content?: string; topic?: string; tags?: string[]; links?: string[] }
): Promise<NoteMeta | null> {
  await requireAuth();
  const meta = await updateNoteData(id, updates);
  if (meta) {
    revalidatePath(`/notes/${id}`);
    revalidatePath("/notes");
    revalidatePath("/");
  }
  return meta;
}

export async function deleteNote(id: string): Promise<boolean> {
  await requireAuth();
  const result = await deleteNoteData(id);
  if (result) {
    revalidatePath("/notes");
    revalidatePath("/");
  }
  return result;
}
