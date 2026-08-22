"use client";

import { PackageCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type SoldLot = {
  id: string;
  code: string;
  title: string;
  price_idr: number;
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function SoldLotsPopup({ initialLots, showId }: { initialLots: SoldLot[]; showId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lots, setLots] = useState(initialLots);

  useEffect(() => {
    setLots(initialLots);
  }, [initialLots]);

  useEffect(() => {
    const supabase = createClient();
    // Subscribe to the whole show, rather than only status=sold, so a lot that
    // changes from live to sold is received and appears in this list right away.
    const channel = supabase
      .channel(`sold-lots:${showId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lots", filter: `show_id=eq.${showId}` },
        (payload) => {
          const previous = payload.old as Partial<SoldLot>;
          const next = payload.new as SoldLot & { status?: string };

          setLots((currentLots) => {
            if (payload.eventType === "DELETE") {
              return currentLots.filter((lot) => lot.id !== previous.id);
            }
            if (next.status !== "sold") {
              return currentLots.filter((lot) => lot.id !== next.id);
            }
            return [...currentLots.filter((lot) => lot.id !== next.id), next];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute bottom-5 left-5 z-10 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#171712] shadow-sm transition-colors hover:bg-[#f7f4ed] sm:bottom-7 sm:left-7"
      >
        <PackageCheck className="size-4" /> Sold lots
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Sold lots">
          <div className="w-full max-w-lg rounded-3xl bg-[#f7f4ed] p-5 text-[#171712] shadow-2xl sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d94719]">Auction results</p>
                <h2 className="mt-1 text-xl font-semibold">Sold lots</h2>
              </div>
              <button type="button" aria-label="Close sold lots" onClick={() => setIsOpen(false)} className="flex size-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:bg-black/5">
                <X className="size-5" />
              </button>
            </div>

            {lots.length === 0 ? (
              <p className="py-8 text-center text-sm text-black/55">No lots have been sold in this show yet.</p>
            ) : (
              <ul className="max-h-[55svh] divide-y divide-black/10 overflow-y-auto">
                {lots.map((lot) => (
                  <li key={lot.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">{lot.code}</p>
                      <p className="mt-1 font-semibold">{lot.title}</p>
                    </div>
                    <p className="self-center whitespace-nowrap text-sm font-semibold text-[#d94719]">{priceFormatter.format(Number(lot.price_idr))}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
