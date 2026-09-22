import type { ReactNode } from "react";
import type { SessionActor } from "@/domain/types";
import { BottomNav } from "./bottom-nav";
import { LogoutButton } from "./logout-button";
import { OfflineManager } from "./offline-manager";

export function AppShell({
  actor,
  children,
}: {
  actor: SessionActor;
  children: ReactNode;
}) {
  const canReview = actor.permissions.includes("production.review");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="mini-brand" aria-hidden="true">PR</span>
          <div>
            <strong>Produzir Registra</strong>
            <span>{actor.name}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <OfflineManager companyId={actor.companyId} userId={actor.userId} />
          <LogoutButton />
        </div>
      </header>

      <main className="app-content">{children}</main>
      <BottomNav canReview={canReview} />
    </div>
  );
}
