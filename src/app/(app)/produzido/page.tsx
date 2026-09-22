import { redirect } from "next/navigation";
import { KpiCard } from "@/components/kpi-card";
import { StatusPill } from "@/components/status-pill";
import { WeeklyBars } from "@/components/weekly-bars";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import {
  aggregateByUnit,
  formatDateTime,
  lastSevenDayCounts,
  recordsForPeriod,
} from "@/lib/production-view";

export const metadata = { title: "Produzido" };

export default async function ProduzidoPage() {
  const actor = await getSession();
  if (!actor) redirect("/login");

  const service = getProductionService();
  const [records, products] = await Promise.all([
    service.listVisibleRecords(actor),
    service.listProducts(actor),
  ]);
  const productMap = new Map(products.map((product) => [product.id, product]));
  const today = recordsForPeriod(records, "today");
  const week = recordsForPeriod(records, "week");
  const month = recordsForPeriod(records, "month");

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Seu histórico</p>
          <h1>Produzido</h1>
        </div>
        <p>O que foi registrado por você, com o estado real de conferência.</p>
      </header>

      <section className="kpi-grid">
        <KpiCard label="Hoje" value={aggregateByUnit(today)} detail={`${today.length} registros`} />
        <KpiCard label="Semana" value={aggregateByUnit(week)} detail={`${week.length} registros`} />
        <KpiCard label="Mês" value={aggregateByUnit(month)} detail={`${month.length} registros`} />
      </section>

      <section className="surface chart-surface">
        <div className="section-title-row">
          <div>
            <h2>Últimos 7 dias</h2>
            <span>quantidade de registros por dia</span>
          </div>
        </div>
        <WeeklyBars days={lastSevenDayCounts(records)} />
      </section>

      <section className="recent-section">
        <div className="section-title-row">
          <h2>Histórico</h2>
          <span>{records.length} registros</span>
        </div>
        <div className="history-list">
          {records.length === 0 ? (
            <div className="empty-state">Ainda não há produção registrada para mostrar.</div>
          ) : records.map((record) => {
            const product = productMap.get(record.productId);
            return (
              <article className="history-row" key={record.id}>
                <div className="history-product">
                  <div className="product-avatar small">
                    {(product?.name ?? "PR").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{product?.name ?? record.barcode}</strong>
                    <span>{product?.presentation ?? "Produto"} • {formatDateTime(record.recordedAt)}</span>
                  </div>
                </div>
                <div className="history-quantity">{record.declaredQuantity} {record.unit}</div>
                <StatusPill reviewStatus={record.reviewStatus} syncStatus={record.syncStatus} />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
