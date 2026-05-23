import { cache } from "react";

/** Electron 桌面应用无需认证，始终返回已登录状态 */
export async function getSession(): Promise<{ username: string }> {
  return { username: "local" };
}

export const getCachedSession = cache(getSession);
