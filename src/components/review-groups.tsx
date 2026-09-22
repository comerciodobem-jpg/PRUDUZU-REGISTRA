"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PendingReviewGroup } from "@/server/services/production-service";

function number(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ReviewGroups({
  initialGroups,
}: {
  initialGroups: PendingReviewGroup[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [selected, setSelected] = useState<string | null>(
    initialGroups[0]?.product.id ?? null,
  );
  const group = groups.find((item) => item.product.id === selected) ?? groups[0];
  const [confirmed, setConfirmed] = useState(
    group ? String(group.declaredTotal) : "",
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const confirmedNumber = number(confirmed);
  const difference = useMemo(
    () => (group ? confirmedNumber - group.declaredTotal : 0),
    [group, confirmedNumber],
  );

  function select(productId: string) {
    const next = groups.find((item) => item.product.id === productId);
    setSelected(productId);
    setConfirmed(next ? String(next.declaredTotal) : "");
    setNotes("");
    setFeedback("");
  }

  async function confirm() {
    if (!group || confirmedNumber <= 0) return;
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/production/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: group.product.id,
          confirmedQuantity: confirmedNumber,
          notes: notes.trim() || undefined,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Não foi possível confirmar.");

      const remaining = groups.filter((item) => item.product.id !== group.product.id);
      setGroups(remaining);
      const next = remaining[0];
      setSelected(next?.product.id ?? null);
      setConfirmed(next ? String(next.declaredTotal) : "");
      setNotes("");
      setFeedback(
        difference === 0
          ? "Produção confirmada e estoque atualizado."
          : "Divergência registrada. O estoque recebeu apenas a quantidade conferida.",
      );
      router.refresh();
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : "Não foi possível confirmar.");
    } finally {
      setBusy(false);
    }
  }

  if (groups.length === 0) {
    return (
      <div className="page-stack">
        {feedback ? <div className="feedback feedback-success">{feedback}</div> : null}
        <div className="empty-state">
          Não há produção aguardando conferência neste momento.
        </div>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="review-layout">
      <aside className="review-queue" aria-label="Produtos aguardando conferência">
        {groups.map((item) => (
          <button
            type="button"
            key={item.product.id}
            className={
              item.product.id === group.product.id
                ? "review-queue-item review-queue-active"
                : "review-queue-item"
            }
            onClick={() => select(item.product.id)}
          >
            <div>
              <strong>{item.product.name}</strong>
              <span>{item.product.presentation}</span>
            </div>
            <b>{item.declaredTotal} {item.product.controlUnit}</b>
          </button>
        ))}
      </aside>

      <section className="surface review-panel">
        <div className="review-title">
          <div className="product-avatar">
            {group.product.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span>Aguardando conferência</span>
            <h2>{group.product.name}</h2>
            <p>{group.product.presentation} • {group.recordCount} registros</p>
          </div>
        </div>

        <div className="declared-total">
          <span>Total declarado</span>
          <strong>{group.declaredTotal} {group.product.controlUnit}</strong>
        </div>

        <div className="contributors">
          <h3>Composição do total</h3>
          {group.contributors.map((person) => (
            <div className="contributor-row" key={`${person.userId}:${person.employeeId}`}>
              <span>{person.name}</span>
              <strong>{person.quantity} {group.product.controlUnit}</strong>
              <small>{person.recordCount} {person.recordCount === 1 ? "registro" : "registros"}</small>
            </div>
          ))}
        </div>

        <label className="review-field">
          <span>Quantidade física conferida</span>
          <div className="quantity-input">
            <input
              value={confirmed}
              type="number"
              min="0"
              step="any"
              onChange={(event) => setConfirmed(event.target.value)}
            />
            <span>{group.product.controlUnit}</span>
          </div>
        </label>

        <div
          className={
            difference === 0
              ? "difference-card difference-ok"
              : "difference-card difference-alert"
          }
        >
          <span>Diferença</span>
          <strong>
            {difference > 0 ? "+" : ""}{difference} {group.product.controlUnit}
          </strong>
          <small>
            {difference === 0
              ? "Bateu com o que foi declarado."
              : "A diferença pertence à conferência do grupo; não será distribuída entre colaboradores."}
          </small>
        </div>

        <label className="review-field">
          <span>Observação (opcional)</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ex.: contagem física refeita."
          />
        </label>

        <button
          type="button"
          className="button button-success button-register"
          disabled={busy || confirmedNumber <= 0}
          onClick={() => void confirm()}
        >
          {busy ? "Confirmando..." : "Confirmar produção"}
        </button>

        {feedback ? (
          <div className={feedback.includes("Não foi") || feedback.includes("não pode") ? "feedback feedback-error" : "feedback feedback-success"}>
            {feedback}
          </div>
        ) : null}
      </section>
    </div>
  );
}
