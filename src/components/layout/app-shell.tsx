"use client";

import { AuthSessionGate } from "@/components/auth/auth-session-gate";
import { BottomNav } from "@/components/layout/bottom-nav";
import { APP_NAME } from "@/lib/constants";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionGate mode="authenticated-only" redirectTo="/login">
      <div className="app-shell mx-auto flex min-h-dvh w-full max-w-lg flex-col">
        <header className="glass sticky top-0 z-40 border-b border-border/60 px-4 py-3">
          <h1 className="text-center text-sm font-semibold tracking-wide text-foreground">
            {APP_NAME}
          </h1>
        </header>
        <main className="flex-1 px-4 py-4">{children}</main>
        <BottomNav />
      </div>
    </AuthSessionGate>
  );
}
