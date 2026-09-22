"use client";

import { useCallback, useEffect, useState } from "react";
import { cacheProducts, listPendingProductions } from "@/offline/db";
import { flushPendingProductions } from "@/offline/sync";
import type { Product } from "@/domain/types";

export function OfflineManager({
  companyId,
  userId,
}: {
  companyId: string;
  userId: string;
}) {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  const refresh = useCallback(async () => {
    setOnline(navigator.onLine);

    const current = await listPendingProductions(companyId, userId).catch(() => []);
    setPending(current.length);

    if (!navigator.onLine) return;

    await fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { products: Product[] };
        await cacheProducts(data.products);
      })
      .catch(() => undefined);

    const sync = await flushPendingProductions(companyId, userId).catch(() => null);
    if (sync) setPending(sync.pending);
  }, [companyId, userId]);

  useEffect(() => {
    void refresh();
    const onOnline = () => void refresh();
    const onOffline = () => {
      setOnline(false);
      void listPendingProductions(companyId, userId).then((items) =>
        setPending(items.length),
      );
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [companyId, userId, refresh]);

  return (
    <button
      className={online ? "connection-pill connection-online" : "connection-pill connection-offline"}
      onClick={() => void refresh()}
      title="Atualizar sincronização"
      type="button"
    >
      <span className="connection-dot" />
      <span>{online ? "Online" : "Offline"}</span>
      {pending > 0 ? <strong>{pending}</strong> : null}
    </button>
  );
}
