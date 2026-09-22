"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/registrar", label: "Registrar", icon: "scan" },
  { href: "/produzido", label: "Produzido", icon: "list" },
  { href: "/resultado", label: "Resultado", icon: "chart" },
] as const;

function Icon({ name }: { name: "scan" | "list" | "chart" | "check" }) {
  if (name === "scan") {
    return <svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8" /></svg>;
  }
  if (name === "list") {
    return <svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
  }
  if (name === "chart") {
    return <svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7" /></svg>;
  }
  return <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>;
}

export function BottomNav({ canReview }: { canReview: boolean }) {
  const pathname = usePathname();
  const nav = canReview
    ? [...items, { href: "/conferir", label: "Conferir", icon: "check" as const }]
    : items;

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "nav-item nav-item-active" : "nav-item"}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
