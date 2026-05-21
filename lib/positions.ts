import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const POSITIONS_FILE = path.join(process.cwd(), "content", "positions.json");

export type PositionMap = Record<string, { x: number; y: number }>;
export type AllPositions = Record<string, PositionMap>; // domainKey -> nodeId -> pos

export async function loadAllPositions(): Promise<AllPositions> {
  if (!existsSync(POSITIONS_FILE)) return {};
  const raw = await readFile(POSITIONS_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function loadPositions(domainKey: string): Promise<PositionMap> {
  const all = await loadAllPositions();
  return all[domainKey] ?? {};
}

export async function savePositions(
  domainKey: string,
  positions: PositionMap
): Promise<void> {
  const dir = path.dirname(POSITIONS_FILE);
  await mkdir(dir, { recursive: true });
  const all = await loadAllPositions();
  all[domainKey] = positions;
  await writeFile(POSITIONS_FILE, JSON.stringify(all, null, 2), "utf-8");
}
