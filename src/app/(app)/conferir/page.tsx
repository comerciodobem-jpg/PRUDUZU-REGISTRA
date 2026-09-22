import { redirect } from "next/navigation";
import { ReviewGroups } from "@/components/review-groups";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";

export const metadata = { title: "Conferir" };

export default async function ConferirPage() {
  const actor = await getSession();
  if (!actor) redirect("/login");
  if (!actor.permissions.includes("production.review")) redirect("/registrar");

  const groups = await getProductionService().listPendingReviewGroups(actor);

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Validação física</p>
          <h1>Conferir</h1>
        </div>
        <p>
          Confira o total físico. Somente o valor confirmado entra no estoque
          oficial e consome a ficha técnica.
        </p>
      </header>
      <ReviewGroups initialGroups={groups} />
    </div>
  );
}
