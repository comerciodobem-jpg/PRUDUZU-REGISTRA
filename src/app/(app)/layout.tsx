import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/server/auth/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const actor = await getSession();
  if (!actor) redirect("/login");

  return <AppShell actor={actor}>{children}</AppShell>;
}
