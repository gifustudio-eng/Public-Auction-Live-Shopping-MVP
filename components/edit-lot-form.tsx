"use client";

import { useActionState, useEffect, useRef } from "react";

import { type CreateLotState, updateLot } from "@/app/admin/actions";
import type { LiveLot } from "@/components/live-lots";

const initialState: CreateLotState = {};

function wibDateTime(value: string | null) {
  if (!value) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(value))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function EditLotForm({
  consignors,
  lot,
  onClose,
  showId,
}: {
  consignors: { id: string }[];
  lot: LiveLot & { consignor_id?: string | null };
  onClose: () => void;
  showId: string;
}) {
  const [state, formAction, isPending] = useActionState(updateLot, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) onClose();
  }, [onClose, state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-3 rounded-2xl bg-[#f7f4ed] p-4">
      <input type="hidden" name="lot_id" value={lot.id} />
      <input type="hidden" name="show_id" value={showId} />
      <p className="text-sm font-semibold">Edit lot</p>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-xs font-medium">Consignor
          <select required name="consignor_id" defaultValue={lot.consignor_id ?? ""} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm">
            <option value="">Select a consignor</option>
            {consignors.map((consignor) => <option key={consignor.id} value={consignor.id}>Consignor {consignor.id.slice(0, 8)}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">Code<input required name="code" maxLength={50} defaultValue={lot.code} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" /></label>
        <label className="grid gap-1.5 text-xs font-medium">Title<input required name="title" maxLength={255} defaultValue={lot.title} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" /></label>
        <label className="grid gap-1.5 text-xs font-medium">Description<textarea name="description" rows={3} defaultValue={lot.description ?? ""} className="resize-y rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" /></label>
        {[0, 1, 2].map((index) => <label key={index} className="grid gap-1.5 text-xs font-medium">Image link {index + 1}<input name={`image_link_${index + 1}`} type="url" defaultValue={lot.photos?.[index] ?? ""} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" /></label>)}
        <label className="grid gap-1.5 text-xs font-medium">Price (IDR)<input required name="price_idr" type="number" min="0" step="0.01" defaultValue={lot.price_idr} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" /></label>
        <label className="grid gap-1.5 text-xs font-medium">Lot status
          <select name="lot_status" defaultValue={lot.status} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"><option value="pending">Pending</option><option value="live">Live</option><option value="held">Held</option><option value="sold">Sold</option><option value="released">Released</option></select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">Lot hold status
          <select name="hold_status" defaultValue="active" className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"><option value="active">Active</option><option value="converted">Converted</option><option value="expired">Expired</option></select>
        </label>
        <div className="grid grid-cols-[1fr_8rem] gap-2">
          <label className="grid gap-1.5 text-xs font-medium">Opens at<input name="opens_at" type="datetime-local" defaultValue={wibDateTime(lot.opens_at)} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" /></label>
          <label className="grid gap-1.5 text-xs font-medium">Timezone<select name="timezone" defaultValue="Asia/Jakarta" className="rounded-lg border border-black/15 bg-white px-2 py-2 text-sm"><option value="Asia/Jakarta">WIB</option><option value="UTC">UTC</option></select></label>
        </div>
        {state.error && <p role="alert" className="text-xs text-red-700">{state.error}</p>}
        <div className="flex gap-2"><button type="button" onClick={onClose} disabled={isPending} className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold">Cancel</button><button type="submit" disabled={isPending || consignors.length === 0} className="rounded-lg bg-[#f15a29] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{isPending ? "Updating…" : "Update lot"}</button></div>
      </div>
    </form>
  );
}
