"use client";

import { ChevronDown, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { EditLotForm } from "@/components/edit-lot-form";
import { DeleteLotButton } from "@/components/delete-lot-button";
import type { LiveLot } from "@/components/live-lots";
import { createClient } from "@/lib/supabase/client";

type OtherLot = LiveLot & { consignor_id?: string | null };
type View = "available" | "sold";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function AdminOtherLotsAccordion({
  consignors,
  initialLots,
  showId,
}: {
  consignors: { id: string; name: string }[];
  initialLots: OtherLot[];
  showId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("available");
  const [lots, setLots] = useState(initialLots);
  const [editingLotId, setEditingLotId] = useState<string>();

  useEffect(() => setLots(initialLots), [initialLots]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-other-lots:${showId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lots", filter: `show_id=eq.${showId}` },
        (payload) => {
          const previous = payload.old as Partial<OtherLot>;
          const next = payload.new as OtherLot;

          setLots((currentLots) => {
            if (payload.eventType === "DELETE") {
              return currentLots.filter((lot) => lot.id !== previous.id);
            }
            if (next.status === "live") {
              return currentLots.filter((lot) => lot.id !== next.id);
            }
            return [...currentLots.filter((lot) => lot.id !== next.id), next]
              .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showId]);

  const displayedLots = view === "sold"
    ? lots.filter((lot) => lot.status === "sold")
    : lots.filter((lot) => lot.status !== "sold");

  return (
    <section className="rounded-2xl border border-black/10 bg-[#f7f4ed]">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span>
          <span className="block text-sm font-semibold">Other lots</span>
          <span className="mt-1 block text-xs text-black/50">Lots that are not live</span>
        </span>
        <ChevronDown className={`size-5 text-black/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t border-black/10 p-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setView("available")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${view === "available" ? "bg-[#f15a29] text-white" : "bg-white text-black/60"}`}>Available Lots</button>
            <button type="button" onClick={() => setView("sold")} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${view === "sold" ? "bg-[#f15a29] text-white" : "bg-white text-black/60"}`}>Sold Lots</button>
          </div>

          <div className="mt-4 space-y-2">
            {displayedLots.length === 0 ? (
              <p className="rounded-xl border border-dashed border-black/15 bg-white/60 p-4 text-center text-xs text-black/50">No lots in this view.</p>
            ) : displayedLots.map((lot) => (
              <div key={lot.id} className="rounded-xl bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{lot.title}</p>
                    <p className="mt-1 text-xs text-black/50">{lot.code} · {priceFormatter.format(Number(lot.price_idr))}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" aria-label={`Edit ${lot.title}`} onClick={() => setEditingLotId((current) => current === lot.id ? undefined : lot.id)} className="flex size-8 items-center justify-center rounded-full border border-black/10 text-black/55 transition hover:border-[#f15a29] hover:bg-[#f15a29] hover:text-white">
                      <Pencil className="size-3.5" />
                    </button>
                    <DeleteLotButton lotId={lot.id} showId={showId} title={lot.title} />
                  </div>
                </div>
                {editingLotId === lot.id && <EditLotForm consignors={consignors} lot={lot} onClose={() => setEditingLotId(undefined)} showId={showId} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
