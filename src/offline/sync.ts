import {
  listPendingProductions,
  markPendingError,
  removePendingProduction,
} from "./db";

interface SyncResult {
  localId: string;
  ok: boolean;
  serverId?: string;
  error?: string;
  message?: string;
}

export async function flushPendingProductions(
  companyId: string,
  userId: string,
): Promise<{ pending: number; synced: number; failed: number }> {
  const items = await listPendingProductions(companyId, userId);
  if (items.length === 0 || !navigator.onLine) {
    return { pending: items.length, synced: 0, failed: 0 };
  }

  try {
    const response = await fetch("/api/production/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          localId: item.localId,
          barcode: item.barcode,
          quantity: item.quantity,
          idempotencyKey: item.idempotencyKey,
          sourceDeviceId: item.sourceDeviceId,
          localRecordedAt: item.localRecordedAt,
        })),
      }),
    });

    if (!response.ok) {
      return { pending: items.length, synced: 0, failed: items.length };
    }

    const payload = await response.json() as { results: SyncResult[] };
    let synced = 0;
    let failed = 0;

    for (const result of payload.results) {
      if (result.ok) {
        await removePendingProduction(result.localId);
        synced += 1;
      } else {
        await markPendingError(
          result.localId,
          result.message ?? result.error ?? "Falha de sincronização.",
        );
        failed += 1;
      }
    }

    const remaining = await listPendingProductions(companyId, userId);
    return { pending: remaining.length, synced, failed };
  } catch {
    return { pending: items.length, synced: 0, failed: items.length };
  }
}
