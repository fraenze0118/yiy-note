"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { getDomainIcon } from "@/lib/domain-icons";
import { useAuth } from "@/lib/auth-context";
import { DomainFormDialog } from "./domain-form-dialog";
import { DomainManageDialog } from "./domain-manage-dialog";
import type { DomainDef } from "@/lib/types";

const LS_DOMAIN = "yiy-last-graph-domain";

export function DomainTabs({
  active,
  domains,
}: {
  active: string;
  domains: DomainDef[];
}) {
  const router = useRouter();
  const { authenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const initRef = useRef(false);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  // 记忆最后查看的领域
  useEffect(() => {
    if (active && domains.some(d => d.key === active)) {
      localStorage.setItem(LS_DOMAIN, active);
    }
  }, [active, domains]);

  // 首次加载：URL 无 domain 参数时跳转到上次查看的领域
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("domain")) {
      const cached = localStorage.getItem(LS_DOMAIN);
      if (cached && domains.some(d => d.key === cached) && cached !== active) {
        router.replace(`/graph?domain=${cached}`);
      }
    }
  }, [active, domains, router]);

  return (
    <>
      <div
        className="h-12 flex items-center gap-1 px-5 border-b shrink-0 overflow-x-auto"
        style={{ borderColor: "var(--bd)", backgroundColor: "var(--sb)" }}
      >
        <span className="text-xs font-medium text-zinc-400 mr-2 tracking-wide shrink-0">
          知识领域
        </span>
        {domains.map((d) => {
          const Icon = getDomainIcon(d.icon);
          const isActive = d.key === active;
          return (
            <Link
              key={d.key}
              href={`/graph?domain=${d.key}`}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs transition-colors shrink-0 ${
                isActive
                  ? "font-medium"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              style={
                isActive
                  ? { backgroundColor: `${d.color}15`, color: d.color }
                  : undefined
              }
            >
              <Icon size={14} />
              {d.name}
            </Link>
          );
        })}

        <div className="flex-1" />

        {authenticated && (
          <button
            onClick={() => setShowManage(true)}
            className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
            title="管理领域"
          >
            <Settings size={14} />
          </button>
        )}

        {authenticated && (
          <button
            onClick={() => setShowForm(true)}
            className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0"
            title="新增领域"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <DomainFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />

      <DomainManageDialog
        open={showManage}
        onClose={() => setShowManage(false)}
        onSuccess={handleSuccess}
        domains={domains}
      />
    </>
  );
}
