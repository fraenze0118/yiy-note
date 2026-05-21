"use client";

import { useState, useCallback } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { getDomainIcon } from "@/lib/domain-icons";
import { DomainFormDialog } from "./domain-form-dialog";
import { DeleteDomainDialog } from "./delete-domain-dialog";
import type { DomainDef } from "@/lib/types";

export function DomainManageDialog({
  open,
  onClose,
  onSuccess,
  domains,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  domains: DomainDef[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editDomain, setEditDomain] = useState<DomainDef | undefined>();
  const [deleteDomain, setDeleteDomain] = useState<DomainDef | undefined>();
  const [error, setError] = useState("");

  const handleEdit = useCallback((d: DomainDef) => {
    setEditDomain(d);
    setShowForm(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditDomain(undefined);
    setShowForm(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditDomain(undefined);
    onSuccess();
  }, [onSuccess]);

  const handleDeleteSuccess = useCallback(() => {
    setDeleteDomain(undefined);
    onSuccess();
  }, [onSuccess]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />

        <div
          className="relative w-80 rounded-xl border shadow-lg p-5 space-y-3"
          style={{ backgroundColor: "var(--sb)", borderColor: "var(--bd)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">知识领域管理</span>
            <button
              onClick={onClose}
              className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
            >
              <X size={14} />
            </button>
          </div>

          {/* Domain list */}
          <div className="space-y-1 max-h-[340px] overflow-y-auto">
            {domains.map((d) => {
              const Icon = getDomainIcon(d.icon);
              return (
                <div
                  key={d.key}
                  className="flex items-center gap-2.5 h-10 px-3 rounded-lg hover:bg-[var(--ac)] transition-colors group"
                >
                  <div className="size-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${d.color}15` }}>
                    <Icon size={14} style={{ color: d.color }} />
                  </div>
                  <span className="text-sm flex-1 truncate">{d.name}</span>
                  <button
                    onClick={() => handleEdit(d)}
                    className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
                    title="编辑"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteDomain(d)}
                    className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="删除"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-between pt-1">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Plus size={13} />
              新增领域
            </button>
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* Sub-dialogs */}
      <DomainFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditDomain(undefined); }}
        onSuccess={handleFormSuccess}
        domain={editDomain}
      />

      {deleteDomain && (
        <DeleteDomainDialog
          open={!!deleteDomain}
          onClose={() => setDeleteDomain(undefined)}
          onSuccess={handleDeleteSuccess}
          domain={deleteDomain}
          topicCount={deleteDomain.topics.length}
          noteCount={0}
        />
      )}
    </>
  );
}
