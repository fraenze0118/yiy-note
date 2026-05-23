"use client";

import { createContext, useContext } from "react";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  authenticated: true,
  loading: false,
  login: async () => ({ ok: true }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{ authenticated: true, loading: false, login: async () => ({ ok: true }), logout: async () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
