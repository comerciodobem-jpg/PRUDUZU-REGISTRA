import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/login-panel";
import { demoModeEnabled, getSession } from "@/server/auth/session";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  const actor = await getSession();
  if (actor) redirect("/registrar");

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark" aria-hidden="true">PR</div>
        <p className="eyebrow">Óris 360 • Produção</p>
        <h1>Produzir Registra</h1>
        <p className="login-intro">
          Produza. Registre. Confira. O estoque oficial só muda depois da
          validação física.
        </p>
        <LoginPanel demoEnabled={demoModeEnabled()} />
      </section>
    </main>
  );
}
