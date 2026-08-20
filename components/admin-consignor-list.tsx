import { Pencil } from "lucide-react";
import Link from "next/link";

import { DeleteConsignorButton } from "@/components/delete-consignor-button";

export type AdminConsignor = {
  id: string;
  name: string;
  contact: string;
  commission_pct: number | string;
  payout_notes: string | null;
};

export function AdminConsignorList({
  consignors,
  editable = false,
}: {
  consignors: AdminConsignor[];
  editable?: boolean;
}) {
  if (consignors.length === 0) {
    return <p className="mt-8 rounded-2xl border border-dashed border-black/15 bg-white/60 p-6 text-black/55">No consignors have been added yet.</p>;
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {consignors.map((consignor) => (
        <article key={consignor.id} className="relative rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          {editable && (
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <Link href={`/admin/consignors/edit/${consignor.id}`} aria-label={`Edit ${consignor.name}`} className="flex size-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:border-[#f15a29] hover:bg-[#f15a29] hover:text-white">
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
              <DeleteConsignorButton id={consignor.id} name={consignor.name} />
            </div>
          )}
          <h2 className="pr-24 text-lg font-semibold">{consignor.name}</h2>
          <p className="mt-1 text-sm text-black/60">{consignor.contact}</p>
          <p className="mt-4 text-sm"><span className="font-medium">Commission:</span> {Number(consignor.commission_pct).toFixed(2)}%</p>
          {consignor.payout_notes && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/60">{consignor.payout_notes}</p>}
        </article>
      ))}
    </div>
  );
}
