"use client";

import { Plus, ShoppingBag } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";

import { createLot, type CreateLotState } from "@/app/admin/actions";

type Consignor = { id: string };
const initialState: CreateLotState = {};

export function AdminAddLotPanel({
  children,
  consignors,
  defaultCode,
  showId,
  showTitle,
}: {
  children: ReactNode;
  consignors: Consignor[];
  defaultCode: string;
  showId: string;
  showTitle: string;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createLot, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setIsFormOpen(false);
    }
  }, [state.success]);

  return (
    <aside className="rounded-3xl border border-black/10 bg-white p-5 lg:sticky lg:top-6 lg:self-start">
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d94719]">Auction queue</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">Active lots</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-expanded={isFormOpen} aria-label={`Add a new lot to ${showTitle}`} onClick={() => setIsFormOpen((open) => !open)} className="flex size-9 items-center justify-center rounded-full border border-[#f15a29]/25 text-[#d94719] transition hover:bg-[#f15a29] hover:text-white">
            <Plus className="size-4" aria-hidden="true" />
          </button>
          <span className="flex size-9 items-center justify-center rounded-full bg-[#f15a29]/10 text-[#d94719]"><ShoppingBag className="size-4" /></span>
        </div>
      </div>

      {isFormOpen && (
        <form ref={formRef} action={formAction} className="mt-4 rounded-2xl bg-[#f7f4ed] p-4">
          <input type="hidden" name="show_id" value={showId} />
          <p className="text-sm font-semibold">Add new lot</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-xs font-medium">Consignor
              <select required name="consignor_id" className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm">
                <option value="">Select a consignor</option>
                {consignors.map((consignor) => <option key={consignor.id} value={consignor.id}>Consignor {consignor.id.slice(0, 8)}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium">Code
              <input required name="code" maxLength={50} defaultValue={defaultCode} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium">Title
              <input required name="title" maxLength={255} className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium">Description
              <textarea name="description" rows={3} className="resize-y rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" />
            </label>
            {[1, 2, 3].map((number) => <label key={number} className="grid gap-1.5 text-xs font-medium">Image link {number}
              <input name={`image_link_${number}`} type="url" placeholder="https://…" className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" />
            </label>)}
            <label className="grid gap-1.5 text-xs font-medium">Price (IDR)
              <input required name="price_idr" type="number" min="0" step="0.01" className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" />
            </label>
            <div className="grid grid-cols-[1fr_8rem] gap-2">
              <label className="grid gap-1.5 text-xs font-medium">Opens at
                <input name="opens_at" type="datetime-local" className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm" />
              </label>
              <label className="grid gap-1.5 text-xs font-medium">Timezone
                <select name="timezone" defaultValue="Asia/Jakarta" className="rounded-lg border border-black/15 bg-white px-2 py-2 text-sm"><option value="Asia/Jakarta">WIB</option><option value="UTC">UTC</option></select>
              </label>
            </div>
            {consignors.length === 0 && <p className="text-xs text-red-700">No consignors are available.</p>}
            {state.error && <p role="alert" className="text-xs text-red-700">{state.error}</p>}
            {state.success && <p role="status" className="text-xs text-emerald-700">{state.success}</p>}
            <button type="submit" disabled={isPending || consignors.length === 0} className="rounded-lg bg-[#f15a29] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{isPending ? "Adding…" : "Add lot"}</button>
          </div>
        </form>
      )}
      <div className="mt-4 space-y-3">{children}</div>
    </aside>
  );
}
