"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Check } from "lucide-react";
import { addDomain, updateDomain } from "@/lib/domains-actions";
import { iconRegistry } from "@/lib/domain-icons";
import type { DomainDef } from "@/lib/types";

const COLOR_OPTIONS = [
  { value: "var(--domain-hardware)", name: "翠绿", hex: "#10b981" },
  { value: "var(--domain-software)", name: "蓝", hex: "#3b82f6" },
  { value: "var(--domain-math)", name: "紫", hex: "#8b5cf6" },
  { value: "var(--domain-philosophy)", name: "金橙", hex: "#f59e0b" },
  { value: "var(--domain-business)", name: "玫红", hex: "#f43f5e" },
  { value: "var(--domain-teal)", name: "青", hex: "#14b8a6" },
  { value: "var(--domain-cyan)", name: "青蓝", hex: "#06b6d4" },
  { value: "var(--domain-indigo)", name: "靛蓝", hex: "#6366f1" },
  { value: "var(--domain-pink)", name: "粉", hex: "#ec4899" },
  { value: "var(--domain-orange)", name: "橙", hex: "#f97316" },
  { value: "var(--domain-lime)", name: "柠绿", hex: "#84cc16" },
  { value: "var(--domain-rose)", name: "玫瑰", hex: "#e11d48" },
  { value: "var(--domain-sky)", name: "天蓝", hex: "#0ea5e9" },
  { value: "var(--domain-violet)", name: "紫罗兰", hex: "#7c3aed" },
  { value: "var(--domain-amber)", name: "琥珀", hex: "#d97706" },
  { value: "var(--fg)", name: "默认", hex: "#18181b" },
];

const ICON_GROUPS: { label: string; keys: string[] }[] = [
  { label: "技术", keys: ["cpu", "code2", "terminal", "database", "cloud", "git-branch", "wrench"] },
  { label: "科学", keys: ["sigma", "flask-conical", "atom", "calculator", "microscope"] },
  { label: "人文", keys: ["scroll-text", "book-open", "globe", "languages", "scale", "landmark"] },
  { label: "商业", keys: ["building2", "chart-line", "briefcase"] },
  { label: "艺术", keys: ["palette", "music", "camera", "heart"] },
];

export function DomainFormDialog({
  open,
  onClose,
  onSuccess,
  domain,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  domain?: DomainDef; // undefined = 新增模式
}) {
  const isEdit = !!domain;
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [icon, setIcon] = useState(ICON_GROUPS[0].keys[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 编辑模式预填
  useEffect(() => {
    if (domain) {
      setName(domain.name);
      setKey(domain.key);
      setColor(COLOR_OPTIONS.find((c) => c.value === domain.color)?.value ?? COLOR_OPTIONS[0].value);
      setIcon(domain.icon in iconRegistry ? domain.icon : ICON_GROUPS[0].keys[0]);
    } else {
      setName("");
      setKey("");
      setColor(COLOR_OPTIONS[0].value);
      setIcon(ICON_GROUPS[0].keys[0]);
    }
  }, [domain, open]);

  const handleKeyChange = useCallback((val: string) => {
    setKey(val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !key.trim()) return;
    setBusy(true);
    setError("");
    try {
      if (isEdit && domain) {
        await updateDomain(domain.key, { name: name.trim(), color, icon });
      } else {
        await addDomain(key.trim(), name.trim(), color, icon);
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }, [name, key, color, icon, isEdit, domain, onSuccess, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        className="relative w-[420px] max-h-[90vh] overflow-y-auto rounded-xl border shadow-lg p-5 space-y-4"
        style={{ backgroundColor: "var(--sb)", borderColor: "var(--bd)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{isEdit ? "编辑知识领域" : "新增知识领域"}</span>
          <button
            onClick={onClose}
            className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="例如：心理学"
            className="w-full h-8 px-2 rounded text-xs bg-[var(--bg)] border outline-none"
            style={{ borderColor: "var(--bd)" }}
            autoFocus
          />
        </div>

        {/* Key */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">
            {isEdit ? "标识符（不可修改）" : "标识符（字母、数字、连字符）"}
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => handleKeyChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="例如：psychology"
            disabled={isEdit}
            className="w-full h-8 px-2 rounded text-xs bg-[var(--bg)] border outline-none disabled:opacity-50"
            style={{ borderColor: "var(--bd)" }}
          />
        </div>

        {/* Color */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">颜色</label>
          <div className="grid grid-cols-8 gap-1.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className="size-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.hex,
                  borderColor: color === c.value ? "var(--fg)" : "transparent",
                  boxShadow: color === c.value ? `0 0 0 2px ${c.hex}40` : undefined,
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">图标</label>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {ICON_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="text-[10px] text-zinc-400 block mb-1">{group.label}</span>
                <div className="flex flex-wrap gap-1">
                  {group.keys.map((key) => {
                    const IconComp = iconRegistry[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setIcon(key)}
                        className={`size-8 flex items-center justify-center rounded-lg transition-all ${
                          icon === key
                            ? "ring-2"
                            : "hover:bg-[var(--ac)] text-zinc-500"
                        }`}
                        style={icon === key ? { backgroundColor: "var(--ac)" } : undefined}
                        title={key}
                      >
                        <IconComp size={16} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !name.trim() || !key.trim()}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--fg)" }}
          >
            <Check size={13} />
            {busy ? (isEdit ? "保存中..." : "创建中...") : (isEdit ? "保存" : "创建")}
          </button>
        </div>
      </div>
    </div>
  );
}
