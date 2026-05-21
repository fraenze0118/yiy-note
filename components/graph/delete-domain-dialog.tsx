"use client";

import { useState, useCallback } from "react";
import { X, AlertTriangle } from "lucide-react";
import { deleteDomain } from "@/lib/domains-actions";
import type { DomainDef } from "@/lib/types";

export function DeleteDomainDialog({
  open,
  onClose,
  onSuccess,
  domain,
  topicCount,
  noteCount,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  domain: DomainDef;
  topicCount: number;
  noteCount: number;
}) {
  const [confirmKey, setConfirmKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = useCallback(async () => {
    if (confirmKey !== domain.key) return;
    setBusy(true);
    setError("");
    try {
      await deleteDomain(domain.key);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  }, [confirmKey, domain.key, onSuccess, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        className="relative w-96 rounded-xl border shadow-lg p-5 space-y-4"
        style={{ backgroundColor: "var(--sb)", borderColor: "var(--bd)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            删除知识领域
          </span>
          <button
            onClick={onClose}
            className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        </div>

        <div className="text-sm space-y-3">
          <p>
            确定要删除 <span className="font-semibold">{domain.name}</span> 吗？
          </p>
          <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 list-disc pl-4">
            <li>主题节点：<span className="font-medium">{topicCount}</span> 个（将被删除）</li>
            <li>笔记：<span className="font-medium">{noteCount}</span> 篇（文件保留，但失去领域归属）</li>
          </ul>
          <p className="text-xs text-red-500">
            此操作不可撤销。
          </p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">
            请输入领域标识符 <code className="text-xs px-1 py-0.5 rounded bg-[var(--ac)]">{domain.key}</code> 以确认：
          </label>
          <input
            type="text"
            value={confirmKey}
            onChange={(e) => setConfirmKey(e.target.value)}
            className="w-full h-8 px-2 rounded text-xs bg-[var(--bg)] border outline-none"
            style={{ borderColor: "var(--bd)" }}
            placeholder={domain.key}
            autoFocus
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            disabled={busy || confirmKey !== domain.key}
            className="h-8 px-4 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "#ef4444" }}
          >
            {busy ? "删除中..." : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  );
}
