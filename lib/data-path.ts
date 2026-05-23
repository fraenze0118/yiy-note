import path from "path";

/** 所有数据的根目录。Electron 打包后通过环境变量或 userData 指定，开发模式默认 content/ */
export const DATA_ROOT =
  process.env.YIY_NOTE_DATA_DIR ?? path.join(process.cwd(), "content");

export const DOMAINS_FILE = path.join(DATA_ROOT, "domains.json");
export const TOPICS_FILE = path.join(DATA_ROOT, "topics.json");
export const POSITIONS_FILE = path.join(DATA_ROOT, "positions.json");
