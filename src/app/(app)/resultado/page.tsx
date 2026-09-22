import { redirect } from "next/navigation";
import { NeedCard } from "@/components/need-card";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { aggregateByUnit, recordsForPeriod } from "@/lib/production-view";

export const metadata = { title: "Nosso Resultado" };

export default async function ResultadoPage() {
  const actor = await getSession();
  if (!actor) redirect("/login");

  const service = getProductionService();
  const [needs, products, records] = await Promise.all([
    service.listNeeds(actor),
    service.listProducts(actor),
    service.listVisibleRecords(actor),
  ]);
  const productMap = new Map(products.map((product) => [product.id, product]));
  const today = recordsForPeriod(records, "today");

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Visão coletiva</p>
          <h1>Nosso Resultado</h1>
        </div>
        <p>Necessidades reais da operação e o progresso que já foi confirmado.</p>
      </header>

      <section className="result-hero surface">
        <span>Registrado por você hoje</span>
        <strong>{aggregateByUnit(today)}</strong>
        <p>Cada registro deixa a produção mais visível. Cada conferência deixa o estoque mais confiável.</p>
      </section>

      <section className="needs-section">
        <div className="section-title-row">
          <div>
            <h2>Necessidades de produção</h2>
            <span>{needs.length > 0 ? `${needs.length} ativas` : "sem necessidade aberta"}</span>
          </div>
        </div>

        {needs.length === 0 ? (
          <div className="empty-state">
            Não existe uma meta aberta para mostrar agora. A produção continua sendo registrada normalmente.
          </div>
        ) : (
          <div className="needs-grid">
            {needs.map((need) => {
              const product = productMap.get(need.productId);
              return (
                <NeedCard
                  key={need.id}
                  name={product?.name ?? "Produto"}
                  presentation={product?.presentation ?? ""}
                  target={need.targetQuantity}
                  confirmed={need.confirmedProgressQuantity}
                  registered={need.registeredProgressQuantity}
                  remaining={need.remainingQuantity}
                  priority={need.priority}
                  note={need.note}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
