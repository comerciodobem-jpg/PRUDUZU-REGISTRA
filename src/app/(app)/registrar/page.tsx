import { redirect } from "next/navigation";
import { RegisterProduction } from "@/components/register-production";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";

export const metadata = { title: "Registrar" };

export default async function RegistrarPage() {
  const actor = await getSession();
  if (!actor) redirect("/login");

  const records = (await getProductionService().listVisibleRecords(actor)).slice(0, 6);

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Registro rápido</p>
          <h1>O que você produziu?</h1>
        </div>
        <p>Leia o código, informe a quantidade e registre. Só isso.</p>
      </header>

      <RegisterProduction
        actor={{
          companyId: actor.companyId,
          userId: actor.userId,
          name: actor.name,
        }}
        initialRecords={records.map((record) => ({
          id: record.id,
          barcode: record.barcode,
          quantity: record.declaredQuantity,
          unit: record.unit,
          recordedAt: record.recordedAt,
          reviewStatus: record.reviewStatus,
          syncStatus: record.syncStatus,
        }))}
      />
    </div>
  );
}
