"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { deleteNote } from "@/lib/notes";

export function DeleteNoteButton({ noteId, title }: { noteId: string; title: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteNote(noteId);
      router.push("/notes");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="size-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-zinc-400 hover:text-red-500"
        title="删除笔记"
      >
        <Trash2 size={14} />
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShow(false)} />
          <div
            className="relative w-96 rounded-xl border shadow-lg p-5 space-y-4"
            style={{ backgroundColor: "var(--sb)", borderColor: "var(--bd)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                删除笔记
              </span>
              <button
                onClick={() => setShow(false)}
                className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-sm">
              确定要删除 <span className="font-semibold">{title}</span> 吗？此操作不可撤销。
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShow(false)}
                className="h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="h-8 px-4 rounded-lg text-xs font-medium text-white disabled:opacity-40 transition-colors"
                style={{ backgroundColor: "#ef4444" }}
              >
                {busy ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
