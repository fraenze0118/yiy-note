import { readFile, writeFile, readdir, unlink, mkdir } from "fs/promises";
import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Note, NoteMeta } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const DOMAINS_FILE = path.join(CONTENT_ROOT, "domains.json");
const TOPICS_FILE = path.join(CONTENT_ROOT, "topics.json");

function loadDomainKeys(): string[] {
  if (!existsSync(DOMAINS_FILE)) return [];
  const raw = readFileSync(DOMAINS_FILE, "utf-8");
  const data = JSON.parse(raw) as { key: string }[];
  return data.map((d) => d.key);
}

/** Build a topic name → topicId lookup for migrating old notes */
function loadTopicNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(TOPICS_FILE)) return map;
  const raw = readFileSync(TOPICS_FILE, "utf-8");
  const tree = JSON.parse(raw) as Record<string, { id: string; name: string; children?: unknown[] }[]>;
  function walk(nodes: { id: string; name: string; children?: unknown[] }[], parentPath: string[] = []) {
    for (const node of nodes) {
      const fullPath = [...parentPath, node.name];
      map.set(node.name, node.id);
      map.set(fullPath.join(" / "), node.id);
      if (node.children) walk(node.children as typeof nodes, fullPath);
    }
  }
  for (const nodes of Object.values(tree)) {
    walk(nodes);
  }
  return map;
}

/** Resolve topicId for a note that lacks it. Returns the note with topicId added if possible. */
function resolveTopicId(meta: Partial<NoteMeta>): Partial<NoteMeta> {
  if (meta.topicId || !meta.topic) return meta;
  const nameMap = loadTopicNameMap();
  const id = nameMap.get(meta.topic);
  if (id) {
    return { ...meta, topicId: id };
  }
  return meta;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontmatter(raw: string): { meta: Partial<NoteMeta>; content: string } {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return { meta: {}, content: raw };

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) return { meta: {}, content: raw };

  const frontLines = lines.slice(1, endIdx);
  const content = lines.slice(endIdx + 1).join("\n");

  const meta: Record<string, unknown> = {};
  for (const line of frontLines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value: unknown = line.slice(idx + 1).trim();
    // Strip surrounding quotes from scalar strings
    if (typeof value === "string" && value.length >= 2) {
      const first = value[0];
      const last = value[value.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        value = value.slice(1, -1);
      }
    }
    if (key === "tags" || key === "links") {
      value = (value as string)
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    meta[key] = value;
  }

  // Resolve topicId for notes that only have topic name
  const resolved = resolveTopicId(meta as Partial<NoteMeta>);
  return { meta: resolved, content };
}

function serializeFrontmatter(meta: NoteMeta, content: string): string {
  const m = { ...meta };
  const lines = [
    "---",
    `id: "${m.id}"`,
    `title: "${m.title}"`,
    `domain: "${m.domain}"`,
    `topic: "${m.topic}"`,
  ];
  if (m.topicId) {
    lines.push(`topicId: "${m.topicId}"`);
  }
  lines.push(
    `tags: [${m.tags.map((t) => `"${t}"`).join(", ")}]`,
    `created: "${m.created}"`,
    `updated: "${m.updated}"`,
    `links: [${m.links.map((l) => `"${l}"`).join(", ")}]`,
    "---",
    "",
    content.trimEnd(),
  );
  return lines.join("\n") + "\n";
}

function filePath(domain: string, slug: string): string {
  return path.join(CONTENT_ROOT, domain, `${slug}.md`);
}

export async function getAllNotes(): Promise<NoteMeta[]> {
  const domains = loadDomainKeys();
  const notes: NoteMeta[] = [];
  for (const domain of domains) {
    const dir = path.join(CONTENT_ROOT, domain);
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const raw = await readFile(path.join(dir, file), "utf-8");
      const { meta } = parseFrontmatter(raw);
      if (meta.id) notes.push(meta as NoteMeta);
    }
  }
  return notes.sort(
    (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );
}

export async function getNotesByDomain(domain: string): Promise<NoteMeta[]> {
  const dir = path.join(CONTENT_ROOT, domain);
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  const notes: NoteMeta[] = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const raw = await readFile(path.join(dir, file), "utf-8");
    const { meta } = parseFrontmatter(raw);
    if (meta.id) notes.push(meta as NoteMeta);
  }
  return notes.sort(
    (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );
}

export async function getNoteById(id: string): Promise<Note | null> {
  const domains = loadDomainKeys();
  for (const domain of domains) {
    const dir = path.join(CONTENT_ROOT, domain);
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const raw = await readFile(path.join(dir, file), "utf-8");
      const { meta, content } = parseFrontmatter(raw);
      if (meta.id === id) return { meta: meta as NoteMeta, content };
    }
  }
  return null;
}

export async function createNote(
  domain: string,
  topic: string,
  title: string,
  content: string,
  tags: string[] = []
): Promise<NoteMeta> {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const now = new Date().toISOString().slice(0, 10);

  // Resolve topicId from topic name
  const nameMap = loadTopicNameMap();
  const topicId = nameMap.get(topic) ?? undefined;

  const meta: NoteMeta = {
    id,
    title,
    domain,
    topic,
    topicId,
    tags,
    created: now,
    updated: now,
    links: [],
  };
  const slug = slugify(title) || id;
  const dir = path.join(CONTENT_ROOT, domain);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath(domain, slug), serializeFrontmatter(meta, content), "utf-8");
  return meta;
}

export async function updateNoteData(
  id: string,
  updates: { title?: string; content?: string; topic?: string; tags?: string[]; links?: string[] }
): Promise<NoteMeta | null> {
  const note = await getNoteById(id);
  if (!note) return null;
  const oldSlug = slugify(note.meta.title);
  const newTitle = updates.title ?? note.meta.title;
  const newSlug = slugify(newTitle);

  // If topic changed, re-resolve topicId
  let topicId = note.meta.topicId;
  if (updates.topic && updates.topic !== note.meta.topic) {
    const nameMap = loadTopicNameMap();
    topicId = nameMap.get(updates.topic) ?? undefined;
  }

  const meta: NoteMeta = {
    ...note.meta,
    title: newTitle,
    topic: updates.topic ?? note.meta.topic,
    topicId,
    tags: updates.tags ?? note.meta.tags,
    links: updates.links ?? note.meta.links,
    updated: new Date().toISOString().slice(0, 10),
  };
  const newContent = updates.content !== undefined ? updates.content : note.content;

  const oldPath = filePath(note.meta.domain, oldSlug);
  const newPath = filePath(note.meta.domain, newSlug);

  if (oldPath !== newPath && existsSync(oldPath)) {
    await unlink(oldPath);
  }
  await writeFile(newPath, serializeFrontmatter(meta, newContent), "utf-8");
  return meta;
}

export async function deleteNoteData(id: string): Promise<boolean> {
  const note = await getNoteById(id);
  if (!note) return false;
  const slug = slugify(note.meta.title);
  const fp = filePath(note.meta.domain, slug);
  if (existsSync(fp)) {
    await unlink(fp);
    return true;
  }
  return false;
}
