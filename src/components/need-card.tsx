import { formatNumber } from "@/lib/production-view";

export function NeedCard({
  name,
  presentation,
  target,
  confirmed,
  registered,
  remaining,
  priority,
  note,
}: {
  name: string;
  presentation: string;
  target: number;
  confirmed: number;
  registered: number;
  remaining: number;
  priority: "NORMAL" | "ATTENTION" | "URGENT";
  note?: string;
}) {
  const progress = target > 0 ? Math.min(100, (confirmed / target) * 100) : 0;
  const priorityLabel =
    priority === "URGENT"
      ? "Urgente"
      : priority === "ATTENTION"
        ? "Atenção"
        : "Normal";

  return (
    <article className={`need-card need-${priority.toLowerCase()}`}>
      <div className="need-heading">
        <div>
          <span className="need-priority">{priorityLabel}</span>
          <h3>{name}</h3>
          <p>{presentation}</p>
        </div>
        <strong>{formatNumber(remaining)}</strong>
      </div>

      <div className="progress-track" aria-label={`${progress.toFixed(0)}% confirmado`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="need-stats">
        <span><small>Meta real</small><strong>{formatNumber(target)}</strong></span>
        <span><small>Confirmado</small><strong>{formatNumber(confirmed)}</strong></span>
        <span><small>Registrado</small><strong>{formatNumber(registered)}</strong></span>
      </div>

      {note ? <p className="need-note">{note}</p> : null}
    </article>
  );
}
