"use client";

import { useState, useEffect } from "react";

export function ElectronTitleBar() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(navigator.userAgent.includes("Electron"));
  }, []);

  if (!isElectron) return null;

  const api = (window as unknown as Record<string, unknown>).yiyNote as
    | { minimize: () => void; maximize: () => void; close: () => void }
    | undefined;

  return (
    <div
      className="electron-drag h-7 shrink-0 flex items-center justify-end select-none"
      style={{ backgroundColor: "#18181b" }}
    >
      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={() => api?.minimize()}
          className="size-2 rounded-full"
          style={{ backgroundColor: "#22c55e" }}
          title="最小化"
        />
        <button
          onClick={() => api?.maximize()}
          className="size-2 rounded-full"
          style={{ backgroundColor: "#eab308" }}
          title="最大化"
        />
        <button
          onClick={() => api?.close()}
          className="size-2 rounded-full"
          style={{ backgroundColor: "#ef4444" }}
          title="关闭"
        />
      </div>
    </div>
  );
}
