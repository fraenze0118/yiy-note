"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { DATA_ROOT } from "./data-path";

export async function uploadImage(domain: string, base64: string): Promise<string> {
  // base64 格式：data:image/png;base64,xxxx
  const match = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");

  const [, mime, data] = match;
  const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];
  const buffer = Buffer.from(data, "base64");

  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
  const rnd = Math.random().toString(36).slice(2, 6);
  const filename = `${ts}-${rnd}.${ext}`;

  const dir = path.join(DATA_ROOT, domain, "images");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/api/images?path=${domain}/images/${filename}`;
}
