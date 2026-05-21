"use server";

import { revalidatePath } from "next/cache";
import { mkdir, rmdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getSession } from "./auth";
import { readTopicTree, writeTopicTree } from "./topics-data";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const DOMAINS_FILE = path.join(CONTENT_ROOT, "domains.json");

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

export interface DomainData {
  key: string;
  name: string;
  color: string;
  icon: string;
}

async function readDomainsJson(): Promise<DomainData[]> {
  if (!existsSync(DOMAINS_FILE)) return [];
  const { readFile } = await import("fs/promises");
  const raw = await readFile(DOMAINS_FILE, "utf-8");
  return JSON.parse(raw) as DomainData[];
}

async function writeDomainsJson(domains: DomainData[]): Promise<void> {
  const { writeFile, mkdir: mk } = await import("fs/promises");
  await mk(path.dirname(DOMAINS_FILE), { recursive: true });
  await writeFile(DOMAINS_FILE, JSON.stringify(domains, null, 2), "utf-8");
}

export async function addDomain(
  key: string,
  name: string,
  color: string,
  icon: string
): Promise<DomainData> {
  await requireAuth();

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
    throw new Error("领域 key 只能包含小写字母、数字和连字符");
  }

  const domains = await readDomainsJson();
  if (domains.some((d) => d.key === key)) {
    throw new Error(`领域 key "${key}" 已存在`);
  }

  const newDomain: DomainData = { key, name, color, icon };
  domains.push(newDomain);
  await writeDomainsJson(domains);

  // Create directory for the domain
  await mkdir(path.join(CONTENT_ROOT, key), { recursive: true });

  // Create empty entry in topics.json
  const topics = await readTopicTree();
  if (!topics[key]) {
    topics[key] = [];
    await writeTopicTree(topics);
  }

  revalidatePath("/graph");
  revalidatePath("/notes");
  revalidatePath("/");
  return newDomain;
}

export async function deleteDomain(domainKey: string): Promise<void> {
  await requireAuth();

  const domains = await readDomainsJson();
  const domain = domains.find((d) => d.key === domainKey);
  if (!domain) {
    throw new Error(`领域 "${domainKey}" 不存在`);
  }

  // Check for topics in this domain
  const topics = await readTopicTree();
  const domainTopics = topics[domainKey];
  if (domainTopics && domainTopics.length > 0) {
    throw new Error("不能删除包含主题节点的领域，请先删除所有主题节点");
  }

  // Check for notes in this domain
  const domainDir = path.join(CONTENT_ROOT, domainKey);
  if (existsSync(domainDir)) {
    const files = await readdir(domainDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    if (mdFiles.length > 0) {
      throw new Error(`不能删除包含笔记的领域，请先删除或迁移 ${mdFiles.length} 篇笔记`);
    }
  }

  // Remove from domains.json
  const filtered = domains.filter((d) => d.key !== domainKey);
  await writeDomainsJson(filtered);

  // Remove from topics.json
  delete topics[domainKey];
  await writeTopicTree(topics);

  // Remove empty directory
  if (existsSync(domainDir)) {
    try {
      await rmdir(domainDir);
    } catch {
      // Directory not empty or other issue — leave it
    }
  }

  revalidatePath("/graph");
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function updateDomain(
  domainKey: string,
  updates: { name?: string; color?: string; icon?: string }
): Promise<DomainData> {
  await requireAuth();

  const domains = await readDomainsJson();
  const idx = domains.findIndex((d) => d.key === domainKey);
  if (idx === -1) {
    throw new Error(`领域 "${domainKey}" 不存在`);
  }

  domains[idx] = { ...domains[idx], ...updates };
  await writeDomainsJson(domains);

  revalidatePath("/graph");
  revalidatePath("/notes");
  revalidatePath("/");
  return domains[idx];
}
