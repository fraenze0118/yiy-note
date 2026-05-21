import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DOMAINS_FILE = path.join(process.cwd(), "content", "domains.json");

export interface DomainData {
  key: string;
  name: string;
  color: string;
  icon: string;
}

export async function readDomains(): Promise<DomainData[]> {
  if (!existsSync(DOMAINS_FILE)) return [];
  const raw = await readFile(DOMAINS_FILE, "utf-8");
  return JSON.parse(raw) as DomainData[];
}

export async function writeDomains(domains: DomainData[]): Promise<void> {
  await mkdir(path.dirname(DOMAINS_FILE), { recursive: true });
  await writeFile(DOMAINS_FILE, JSON.stringify(domains, null, 2), "utf-8");
}
