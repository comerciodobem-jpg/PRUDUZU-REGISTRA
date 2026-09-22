import type { ReviewStatus, SyncStatus } from "@/domain/types";

export function StatusPill({
  reviewStatus,
  syncStatus,
}: {
  reviewStatus: ReviewStatus;
  syncStatus?: SyncStatus;
}) {
  if (syncStatus === "LOCAL_PENDING") {
    return <span className="status status-warning">Pendente sync</span>;
  }
  if (syncStatus === "SYNC_FAILED") {
    return <span className="status status-danger">Falha de sync</span>;
  }

  if (reviewStatus === "CONFIRMED") {
    return <span className="status status-success">Confirmado</span>;
  }
  if (reviewStatus === "DIVERGENT") {
    return <span className="status status-danger">Divergente</span>;
  }
  if (reviewStatus === "CORRECTED") {
    return <span className="status status-info">Corrigido</span>;
  }
  return <span className="status status-neutral">Aguardando conferência</span>;
}
