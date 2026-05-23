import type { Metadata } from "next";
import { Suspense } from "react";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth-context";
import { Sidebar } from "@/components/ui/sidebar";
import { ElectronTitleBar } from "@/components/ui/electron-titlebar";
import { domains } from "@/lib/domains";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yiy-Note",
  description: "Personal knowledge base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (navigator.userAgent.includes("Electron")) {
            document.documentElement.classList.add("electron");
          }
        `}} />
      </head>
      <body className="h-full flex flex-col">
        <ElectronTitleBar />
        <div className="flex flex-1 overflow-hidden">
          <ThemeProvider>
            <AuthProvider>
              <Suspense fallback={<div className="w-64 shrink-0" />}>
                <Sidebar domains={domains} />
              </Suspense>
              <main className="flex-1 overflow-y-auto">{children}</main>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
