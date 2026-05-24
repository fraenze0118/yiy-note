"use server";

import { revalidatePath } from "next/cache";
import type { NoteMeta } from "./types";
import {
  createNote as createNoteData,
  updateNoteData,
  deleteNoteData,
} from "./notes-data";

export async function createNote(
  domain: string,
  topicId: string,
  title: string,
  content: string,
  tags: string[] = []
): Promise<NoteMeta> {
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
  
  const meta = await updateNoteData(id, updates);
  if (meta) {
    revalidatePath(`/notes/${id}`);
    revalidatePath("/notes");
    revalidatePath("/");
  }
  return meta;
}

export async function deleteNote(id: string): Promise<boolean> {
  
  const result = await deleteNoteData(id);
  if (result) {
    revalidatePath("/notes");
    revalidatePath("/");
  }
  return result;
}
