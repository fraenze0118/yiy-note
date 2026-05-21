"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, authenticated, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTarget = useRef(searchParams.get("redirect"));

  useEffect(() => {
    if (authenticated) {
      router.replace(redirectTarget.current ?? "/");
    }
  }, [authenticated, router]);

  if (loading || authenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    setError("");
    const result = await login(password);
    setSubmitting(false);
    if (result.ok) {
      const redirect = searchParams.get("redirect");
      router.push(redirect ?? "/");
    } else {
      setError(result.error ?? "登录失败");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-8">
        <div className="text-center mb-8">
          <div className="size-10 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-800 mx-auto mb-3">
            Y
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Yiy-Note</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            请输入密码以继续
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="输入密码"
              autoFocus
              className="w-full h-10 pl-9 pr-4 rounded-xl border text-sm bg-transparent outline-none placeholder:text-zinc-400 transition-colors focus:border-zinc-400"
              style={{ borderColor: error ? "#f43f5e" : "var(--bd)" }}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !password.trim()}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--fg)" }}
          >
            {submitting ? "验证中..." : "登录"}
            {!submitting && <ArrowRight size={15} />}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          访客可浏览全部内容，登录后可增删改
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
