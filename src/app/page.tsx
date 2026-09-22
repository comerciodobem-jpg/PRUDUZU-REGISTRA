import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";

export default async function HomePage() {
  const actor = await getSession();
  redirect(actor ? "/registrar" : "/login");
}
