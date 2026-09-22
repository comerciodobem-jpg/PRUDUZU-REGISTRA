"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
    if ("serviceWorker" in navigator) {
      const controller = navigator.serviceWorker.controller;
      controller?.postMessage({ type: "CLEAR_PRIVATE" });
    }
    window.location.assign("/login");
  }

  return (
    <button className="icon-button" onClick={logout} aria-label="Sair">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M14 8l4 4-4 4M18 12H9" />
      </svg>
    </button>
  );
}
