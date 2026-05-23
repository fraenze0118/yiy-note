"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { X, BookOpen, ChevronRight, Plus, Pencil, Trash2, Check } from "lucide-react";
import { addTopicNode, renameTopicNode, deleteTopicNode } from "@/lib/topics-actions";
import type { TreeNodeData } from "@/lib/graph";
import type { NoteMeta, DomainDef } from "@/lib/types";

export function NotePanel({
  node,
  notes,
  isLeaf,
  authenticated,
  onClose,
  onRefresh,
  domains,
}: {
  node: TreeNodeData;
  notes: NoteMeta[];
  isLeaf: boolean;
  authenticated: boolean;
  onClose: () => void;
  onRefresh: () => void;
  domains: DomainDef[];
}) {
  const domain = domains.find((d) => d.key === node.domain);
  const [addingChild, setAddingChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(node.label);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleAddChild = useCallback(async () => {
    const name = childName.trim();
    if (!name) return;
    setBusy(true);
    setError("");
    try {
      await addTopicNode(node.domain, node.nodeType === "domain" ? `domain-${node.domain}` : (node.topicId ?? ""), name);
      setChildName("");
      setAddingChild(false);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }, [childName, node, onRefresh]);

  const handleRename = useCallback(async () => {
    const name = renameName.trim();
    if (!name || name === node.label) {
      setRenaming(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await renameTopicNode(node.domain, node.topicId!, name);
      setRenaming(false);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }, [renameName, node, onRefresh]);

  const handleDelete = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      await deleteTopicNode(node.domain, node.topicId!);
      onClose();
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }, [node, onClose, onRefresh]);

  const isDomainNode = node.nodeType === "domain";

  return (
    <div
      className="w-72 shrink-0 border-l overflow-y-auto flex flex-col"
      style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}
    >
      {/* Header */}
      <div
        className="h-12 flex items-center gap-2 px-4 border-b shrink-0"
        style={{ borderColor: "var(--bd)" }}
      >
        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: node.color }} />
        {renaming ? (
          <input
            type="text"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
            className="flex-1 min-w-0 text-sm font-medium bg-transparent border-b outline-none"
            style={{ borderColor: node.color }}
            autoFocus
            disabled={busy}
          />
        ) : (
          <span className="text-sm font-medium truncate flex-1">{node.label}</span>
        )}
        {renaming ? (
          <button
            onClick={handleRename}
            disabled={busy || !renameName.trim()}
            className="size-5 flex items-center justify-center rounded text-emerald-500 hover:text-emerald-600 disabled:opacity-30"
          >
            <Check size={14} />
          </button>
        ) : null}
        <button
          onClick={onClose}
          className="size-6 flex items-center justify-center rounded-md hover:bg-[var(--ac)] transition-colors text-zinc-400"
        >
          <X size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 border-b" style={{ borderColor: "var(--bd)" }}>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span>
            {isDomainNode ? "领域根节点" : `L${node.level} 主题`}
          </span>
          <span>{notes.length} 篇笔记</span>
        </div>
      </div>

      {/* Actions (authenticated only) */}
      {authenticated && (
        <div className="px-3 py-2 border-b space-y-1" style={{ borderColor: "var(--bd)" }}>
          {/* Add child node */}
          {addingChild ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddChild(); if (e.key === "Escape") { setAddingChild(false); setChildName(""); } }}
                placeholder="子节点名称"
                className="flex-1 h-7 px-2 rounded text-xs bg-[var(--bg)] border outline-none"
                style={{ borderColor: "var(--bd)" }}
                autoFocus
                disabled={busy}
              />
              <button
                onClick={handleAddChild}
                disabled={busy || !childName.trim()}
                className="size-6 flex items-center justify-center rounded text-emerald-500 hover:text-emerald-600 disabled:opacity-30"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setAddingChild(false); setChildName(""); }}
                className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingChild(true)}
              className="flex items-center gap-2 w-full h-7 px-2 rounded text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-[var(--ac)] transition-colors"
            >
              <Plus size={13} />
              新增子节点
            </button>
          )}

          {/* Add note under this node */}
          <Link
            href={`/notes/new?domain=${node.domain}${isDomainNode ? "" : `&topicId=${node.topicId}`}`}
            className="flex items-center gap-2 w-full h-7 px-2 rounded text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-[var(--ac)] transition-colors"
          >
            <BookOpen size={13} />
            在此节点下新建笔记
          </Link>

          {/* Rename (topic nodes only) */}
          {!isDomainNode && !renaming && (
            <button
              onClick={() => { setRenameName(node.label); setRenaming(true); }}
              className="flex items-center gap-2 w-full h-7 px-2 rounded text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-[var(--ac)] transition-colors"
            >
              <Pencil size={13} />
              重命名
            </button>
          )}

          {/* Delete (leaf nodes only) */}
          {!isDomainNode && isLeaf && (
            deleting ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-500 flex-1 px-2">确定删除？笔记将归父节点</span>
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="size-6 flex items-center justify-center rounded text-red-500 hover:text-red-600 disabled:opacity-30"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setDeleting(false)}
                  className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleting(true)}
                className="flex items-center gap-2 w-full h-7 px-2 rounded text-xs text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <Trash2 size={13} />
                删除此节点
              </button>
            )
          )}
          {error && (
            <p className="text-xs text-red-500 px-2">{error}</p>
          )}
        </div>
      )}

      {/* Note list */}
      <div className="flex-1 overflow-y-auto p-2">
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-zinc-400">
            该节点下暂无笔记
          </div>
        ) : (
          <div className="space-y-0.5">
            {notes.map((n) => (
              <Link
                key={n.id}
                href={`/notes/${n.id}?from=graph&domain=${node.domain}&topic=${node.topicId ?? ""}`}
                className="flex items-center gap-2.5 px-3 h-9 rounded-lg hover:bg-[var(--ac)] transition-colors group"
              >
                <BookOpen size={13} className="text-zinc-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{n.title}</div>
                </div>
                <ChevronRight size={13} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
