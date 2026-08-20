"use client";

import { createConsignor, type CreateConsignorState, updateConsignor } from "@/app/admin/actions";
import { useActionState, useEffect, useRef } from "react";

const initialState: CreateConsignorState = {};

export function CreateConsignorForm({
  consignor,
}: {
  consignor?: {
    id: string;
    name: string;
    contact: string;
    commissionPct: number;
    payoutNotes: string | null;
  };
}) {
  const [state, formAction, isPending] = useActionState(
    consignor ? updateConsignor : createConsignor,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && !consignor) formRef.current?.reset();
  }, [consignor, state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-8 grid max-w-2xl gap-5">
      {consignor && <input type="hidden" name="id" value={consignor.id} />}
      <label className="grid gap-2 text-sm font-medium">
        Consignor name
        <input required name="name" maxLength={255} defaultValue={consignor?.name} placeholder="e.g. Ardi Pratama" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-[#171712] outline-none transition placeholder:text-black/45 focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Contact
        <input required name="contact" maxLength={255} defaultValue={consignor?.contact} placeholder="Email address, phone number, or both" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-[#171712] outline-none transition placeholder:text-black/45 focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Commission percentage
        <input required name="commission_pct" type="number" min="0" max="100" step="0.01" defaultValue={consignor?.commissionPct ?? 0} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-[#171712] outline-none transition focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Payout notes <span className="font-normal text-black/45">(optional)</span>
        <textarea name="payout_notes" rows={4} defaultValue={consignor?.payoutNotes ?? ""} placeholder="Add payout instructions or other notes." className="resize-y rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-[#171712] outline-none transition placeholder:text-black/45 focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.success}</p>}
      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-[#f15a29] px-5 py-3 font-semibold text-white transition hover:bg-[#d94719] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit">
        {isPending ? (consignor ? "Saving consignor…" : "Creating consignor…") : consignor ? "Save Changes" : "Create consignor"}
      </button>
    </form>
  );
}
