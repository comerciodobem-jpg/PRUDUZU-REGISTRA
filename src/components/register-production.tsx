"use client";

import { useMemo, useState } from "react";
import type { Product, ReviewStatus, SyncStatus } from "@/domain/types";
import { BarcodeScanner } from "./barcode-scanner";
import {
  cacheProducts,
  enqueueProduction,
  getCachedProduct,
  getDeviceId,
} from "@/offline/db";

interface RecentRecord {
  id: string;
  barcode: string;
  quantity: number;
  unit: string;
  recordedAt: string;
  reviewStatus: ReviewStatus;
  syncStatus: SyncStatus;
}

interface ActorIdentity {
  companyId: string;
  userId: string;
  name: string;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function reviewLabel(status: ReviewStatus): string {
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "DIVERGENT") return "Divergente";
  if (status === "CORRECTED") return "Corrigido";
  return "Aguardando conferência";
}

export function RegisterProduction({
  actor,
  initialRecords,
}: {
  actor: ActorIdentity;
  initialRecords: RecentRecord[];
}) {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [looseCount, setLooseCount] = useState("");
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [recent, setRecent] = useState(initialRecords);

  const conversion = product?.packageConversion?.[0];

  const parsedQuantity = useMemo(() => {
    const value = Number(quantity.replace(",", "."));
    return Number.isFinite(value) ? value : 0;
  }, [quantity]);

  function applyPackaging(nextPackages: string, nextLoose: string) {
    setPackageCount(nextPackages);
    setLooseCount(nextLoose);
    if (!conversion) return;
    const packages = Math.max(0, Number(nextPackages) || 0);
    const loose = Math.max(0, Number(nextLoose) || 0);
    setQuantity(String(packages * conversion.multiplier + loose));
  }

  function resetForNext() {
    setBarcode("");
    setProduct(null);
    setQuantity("");
    setPackageCount("");
    setLooseCount("");
  }

  async function lookup(value = barcode) {
    const normalized = value.trim();
    if (!normalized) {
      setMessage({ type: "error", text: "Digite ou leia um código de barras." });
      return;
    }

    setBarcode(normalized);
    setLookupBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/products/barcode/${encodeURIComponent(normalized)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Produto não encontrado.");
      }
      const found = data.product as Product;
      setProduct(found);
      await cacheProducts([found]);
    } catch (cause) {
      const cached = await getCachedProduct(actor.companyId, normalized).catch(
        () => null,
      );
      if (cached) {
        setProduct(cached);
        setMessage({
          type: "warning",
          text: "Produto carregado do catálogo offline.",
        });
      } else {
        setProduct(null);
        setMessage({
          type: "error",
          text: cause instanceof Error ? cause.message : "Produto não encontrado.",
        });
      }
    } finally {
      setLookupBusy(false);
    }
  }

  async function queueOffline(
    idempotencyKey: string,
    sourceDeviceId: string,
    localRecordedAt: string,
  ) {
    const localId = crypto.randomUUID();
    await enqueueProduction({
      localId,
      companyId: actor.companyId,
      userId: actor.userId,
      barcode: product!.barcode,
      quantity: parsedQuantity,
      idempotencyKey,
      sourceDeviceId,
      localRecordedAt,
    });

    setRecent((current) => [
      {
        id: localId,
        barcode: product!.barcode,
        quantity: parsedQuantity,
        unit: product!.controlUnit,
        recordedAt: localRecordedAt,
        reviewStatus: "PENDING_REVIEW",
        syncStatus: "LOCAL_PENDING",
      },
      ...current,
    ].slice(0, 6));
    setMessage({
      type: "warning",
      text: "Sem conexão. Registro salvo neste aparelho e aguardando sincronização.",
    });
    navigator.vibrate?.([35, 30, 35]);
    resetForNext();
  }

  async function submit() {
    if (!product) {
      setMessage({ type: "error", text: "Leia um produto antes de registrar." });
      return;
    }
    if (!(parsedQuantity > 0)) {
      setMessage({ type: "error", text: "Informe uma quantidade maior que zero." });
      return;
    }

    setBusy(true);
    setMessage(null);
    const idempotencyKey = crypto.randomUUID();
    const sourceDeviceId = getDeviceId();
    const localRecordedAt = new Date().toISOString();

    if (!navigator.onLine) {
      await queueOffline(idempotencyKey, sourceDeviceId, localRecordedAt);
      setBusy(false);
      return;
    }

    try {
      const response = await fetch("/api/production/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          barcode: product.barcode,
          quantity: parsedQuantity,
          idempotencyKey,
          sourceDeviceId,
          localRecordedAt,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Não foi possível registrar.");
      }

      const record = data.record as {
        id: string;
        barcode: string;
        declaredQuantity: number;
        unit: string;
        recordedAt: string;
        reviewStatus: ReviewStatus;
        syncStatus: SyncStatus;
      };
      setRecent((current) => [
        {
          id: record.id,
          barcode: record.barcode,
          quantity: record.declaredQuantity,
          unit: record.unit,
          recordedAt: record.recordedAt,
          reviewStatus: record.reviewStatus,
          syncStatus: record.syncStatus,
        },
        ...current,
      ].slice(0, 6));
      setMessage({
        type: "success",
        text: `${product.name}: ${parsedQuantity} ${product.controlUnit} registrado. Aguardando conferência.`,
      });
      navigator.vibrate?.(45);
      resetForNext();
    } catch (cause) {
      if (cause instanceof TypeError) {
        await queueOffline(idempotencyKey, sourceDeviceId, localRecordedAt);
      } else {
        setMessage({
          type: "error",
          text: cause instanceof Error ? cause.message : "Não foi possível registrar.",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="surface scanner-surface">
        <BarcodeScanner onDetected={(value) => void lookup(value)} />

        <div className="manual-code">
          <label htmlFor="barcode">Ou digite o código</label>
          <div className="input-action-row">
            <input
              id="barcode"
              inputMode="numeric"
              autoComplete="off"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void lookup();
              }}
              placeholder="789..."
            />
            <button
              className="button button-secondary"
              disabled={lookupBusy}
              onClick={() => void lookup()}
              type="button"
            >
              {lookupBusy ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>
      </section>

      {product ? (
        <section className="surface product-found">
          <div className="product-avatar" aria-hidden="true">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="product-copy">
            <span className="success-kicker">Produto identificado</span>
            <h2>{product.name}</h2>
            <p>{product.presentation} • {product.sku} • {product.controlUnit}</p>
          </div>

          <div className="quantity-block">
            <label htmlFor="quantity">Quantidade produzida</label>
            <div className="quantity-input">
              <input
                id="quantity"
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setPackageCount("");
                  setLooseCount("");
                }}
                placeholder="0"
              />
              <span>{product.controlUnit}</span>
            </div>
          </div>

          {conversion ? (
            <div className="packaging-helper">
              <div>
                <strong>Atalho por {conversion.name}</strong>
                <span>1 {conversion.name} = {conversion.multiplier} {product.controlUnit}</span>
              </div>
              <div className="packaging-grid">
                <label>
                  <span>{conversion.name}</span>
                  <input
                    type="number"
                    min="0"
                    value={packageCount}
                    onChange={(event) =>
                      applyPackaging(event.target.value, looseCount)
                    }
                    placeholder="0"
                  />
                </label>
                <label>
                  <span>Avulsos</span>
                  <input
                    type="number"
                    min="0"
                    value={looseCount}
                    onChange={(event) =>
                      applyPackaging(packageCount, event.target.value)
                    }
                    placeholder="0"
                  />
                </label>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="button button-success button-register"
            disabled={busy || parsedQuantity <= 0}
            onClick={() => void submit()}
          >
            {busy ? "Registrando..." : "Registrar produção"}
          </button>
        </section>
      ) : null}

      {message ? (
        <div className={`feedback feedback-${message.type}`} role="status">
          {message.text}
        </div>
      ) : null}

      <section className="recent-section">
        <div className="section-title-row">
          <h2>Últimos registros</h2>
          <span>{recent.length > 0 ? "mais recentes" : "nenhum ainda"}</span>
        </div>

        <div className="record-list">
          {recent.length === 0 ? (
            <div className="empty-state compact">
              Seu primeiro registro de hoje aparece aqui.
            </div>
          ) : (
            recent.map((record) => (
              <article className="record-row" key={record.id}>
                <div className="record-icon" aria-hidden="true">✓</div>
                <div className="record-main">
                  <strong>{record.quantity} {record.unit}</strong>
                  <span>Código {record.barcode} • {formatTime(record.recordedAt)}</span>
                </div>
                <div className="record-status">
                  {record.syncStatus === "LOCAL_PENDING" ? (
                    <span className="status status-warning">Pendente sync</span>
                  ) : (
                    <span className="status status-neutral">
                      {reviewLabel(record.reviewStatus)}
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
