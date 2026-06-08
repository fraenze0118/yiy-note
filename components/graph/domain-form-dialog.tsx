"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Check, Pipette } from "lucide-react";
import { addDomain, updateDomain } from "@/lib/domains-actions";
import { iconRegistry } from "@/lib/domain-icons";
import type { DomainDef } from "@/lib/types";

const PRESET_COLORS = [
  { value: "var(--domain-hardware)", hex: "#10b981" },
  { value: "var(--domain-software)", hex: "#3b82f6" },
  { value: "var(--domain-math)", hex: "#8b5cf6" },
  { value: "var(--domain-philosophy)", hex: "#f59e0b" },
  { value: "var(--domain-business)", hex: "#f43f5e" },
  { value: "var(--domain-teal)", hex: "#14b8a6" },
  { value: "var(--domain-cyan)", hex: "#06b6d4" },
  { value: "var(--domain-indigo)", hex: "#6366f1" },
  { value: "var(--domain-pink)", hex: "#ec4899" },
  { value: "var(--domain-orange)", hex: "#f97316" },
  { value: "var(--domain-lime)", hex: "#84cc16" },
  { value: "var(--domain-rose)", hex: "#e11d48" },
  { value: "var(--domain-sky)", hex: "#0ea5e9" },
  { value: "var(--domain-violet)", hex: "#7c3aed" },
  { value: "var(--domain-amber)", hex: "#d97706" },
  { value: "var(--fg)", hex: "#18181b" },
];

const ICON_GROUPS: { label: string; keys: string[] }[] = [
  { label: "技术", keys: ["cpu", "code2", "terminal", "database", "cloud", "git-branch", "wrench", "monitor", "laptop", "server", "wifi", "bluetooth", "plug", "shield", "rocket"] },
  { label: "科学", keys: ["sigma", "flask-conical", "atom", "calculator", "microscope", "brain", "dna", "telescope"] },
  { label: "人文", keys: ["scroll-text", "book-open", "globe", "languages", "scale", "landmark", "library", "graduation-cap", "pencil"] },
  { label: "商业", keys: ["building2", "chart-line", "briefcase", "wallet", "trending-up", "target"] },
  { label: "生活", keys: ["palette", "music", "camera", "heart", "home", "coffee", "sun", "moon-star"] },
];

/** 判断颜色是预设 CSS 变量还是自定义 hex */
function isPresetColor(value: string): boolean {
  return PRESET_COLORS.some((c) => c.value === value);
}

export function DomainFormDialog({
  open,
  onClose,
  onSuccess,
  domain,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  domain?: DomainDef;
}) {
  const isEdit = !!domain;
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [customColor, setCustomColor] = useState("#3b82f6"); // input type=color 的 hex 值
  const [icon, setIcon] = useState(ICON_GROUPS[0].keys[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 当前实际颜色值：自定义 hex 或预设 CSS 变量
  const activeColor = isPresetColor(color) ? color : customColor;
  // input type=color 的显示值
  const pickerHex = isPresetColor(color)
    ? PRESET_COLORS.find((c) => c.value === color)?.hex ?? "#3b82f6"
    : customColor;

  useEffect(() => {
    if (domain) {
      setName(domain.name);
      setKey(domain.key);
      if (isPresetColor(domain.color)) {
        setColor(domain.color);
        setCustomColor("#3b82f6");
      } else {
        setColor(""); // 不自选预设
        setCustomColor(domain.color);
      }
      setIcon(domain.icon in iconRegistry ? domain.icon : ICON_GROUPS[0].keys[0]);
    } else {
      setName("");
      setKey("");
      setColor(PRESET_COLORS[0].value);
      setCustomColor("#3b82f6");
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
        await updateDomain(domain.key, { name: name.trim(), color: activeColor, icon });
      } else {
        await addDomain(key.trim(), name.trim(), activeColor, icon);
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }, [name, key, activeColor, icon, isEdit, domain, onSuccess, onClose]);

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
          <button onClick={onClose} className="size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600">
            <X size={14} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">名称</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
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
            type="text" value={key} onChange={(e) => handleKeyChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="例如：psychology"
            disabled={isEdit}
            className="w-full h-8 px-2 rounded text-xs bg-[var(--bg)] border outline-none disabled:opacity-50"
            style={{ borderColor: "var(--bd)" }}
          />
        </div>

        {/* Color */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">预设颜色</label>
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className="size-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.hex,
                  borderColor: color === c.value ? "var(--fg)" : "transparent",
                  boxShadow: color === c.value ? `0 0 0 2px ${c.hex}40` : undefined,
                }}
                title={c.value}
              />
            ))}
          </div>

          <label className="text-xs text-zinc-400 mb-1 flex items-center gap-1.5">
            <Pipette size={12} />
            自定义颜色
          </label>
          <input
            type="color"
            value={pickerHex}
            onChange={(e) => { setColor(""); setCustomColor(e.target.value); }}
            className="w-full h-8 rounded cursor-pointer border"
            style={{ borderColor: "var(--bd)" }}
          />
        </div>

        {/* Icon */}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">图标</label>
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {ICON_GROUPS.map((group) => (
              <div key={group.label}>
                <span className="text-[10px] text-zinc-400 block mb-1">{group.label}</span>
                <div className="flex flex-wrap gap-1">
                  {group.keys.map((k) => {
                    const IconComp = iconRegistry[k];
                    return (
                      <button
                        key={k}
                        onClick={() => setIcon(k)}
                        className={`size-8 flex items-center justify-center rounded-lg transition-all ${
                          icon === k ? "ring-2" : "hover:bg-[var(--ac)] text-zinc-500"
                        }`}
                        style={icon === k ? { backgroundColor: "var(--ac)" } : undefined}
                        title={k}
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
          <button onClick={onClose} className="h-8 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
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
