"use client";

import { useState } from "react";

export function LoginPanel({ demoEnabled }: { demoEnabled: boolean }) {
  const [busy, setBusy] = useState<"operator" | "reviewer" | null>(null);
  const [error, setError] = useState("");

  async function login(role: "operator" | "reviewer") {
    setBusy(role);
    setError("");
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Não foi possível entrar.");
      window.location.assign("/registrar");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
      setBusy(null);
    }
  }

  if (!demoEnabled) {
    return (
      <div className="login-integration-note">
        <strong>Acesso conectado ao Óris 360</strong>
        <span>
          Esta instalação aguarda a sessão emitida pelo provedor de identidade
          configurado para a empresa.
        </span>
      </div>
    );
  }

  return (
    <div className="login-actions">
      <button
        className="button button-primary button-large"
        disabled={busy !== null}
        onClick={() => login("operator")}
      >
        {busy === "operator" ? "Entrando..." : "Entrar como operador"}
      </button>
      <button
        className="button button-secondary"
        disabled={busy !== null}
        onClick={() => login("reviewer")}
      >
        {busy === "reviewer" ? "Entrando..." : "Entrar como conferente"}
      </button>
      <p className="demo-caption">
        Modo de demonstração: as duas identidades são separadas para provar o
        fluxo registrar → conferir.
      </p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
