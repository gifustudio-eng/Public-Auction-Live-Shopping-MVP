"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { DeleteLotButton } from "@/components/delete-lot-button";
import { EditLotForm } from "@/components/edit-lot-form";
import { LotCard } from "@/components/lot-card";
import { createClient } from "@/lib/supabase/client";

type LotStatus = "pending" | "live" | "held" | "sold" | "released";

export type LiveLot = {
  id: string;
  show_id?: string;
  consignor_id?: string | null;
  code: string;
  title: string;
  description: string | null;
  photos: string[] | null;
  price_idr: number;
  seq?: number;
  status: LotStatus;
  opens_at: string | null;
};

const visibleStatuses = new Set<LotStatus>(["pending", "live", "released", "sold"]);

function isVisible(lot: LiveLot) {
  return visibleStatuses.has(lot.status);
}

export function LiveLots({
  admin = false,
  consignors = [],
  initialLots,
  showId,
  userId,
}: {
  admin?: boolean;
  consignors?: { id: string }[];
  initialLots: LiveLot[];
  showId: string;
  userId: string | null;
}) {
  const [lots, setLots] = useState(() => initialLots.filter(isVisible));
  const [editingLotId, setEditingLotId] = useState<string>();

  useEffect(() => {
    setLots(initialLots.filter(isVisible));
  }, [initialLots]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`show-lots:${showId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lots",
          filter: `show_id=eq.${showId}`,
        },
        (payload) => {
          setLots((currentLots) => {
            const oldLot = payload.old as Partial<LiveLot>;
            const newLot = payload.new as LiveLot;

            if (payload.eventType === "DELETE") {
              return currentLots.filter((lot) => lot.id !== oldLot.id);
            }

            if (!isVisible(newLot)) {
              return currentLots.filter((lot) => lot.id !== newLot.id);
            }

            const withoutUpdatedLot = currentLots.filter((lot) => lot.id !== newLot.id);
            return [...withoutUpdatedLot, newLot].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showId]);

  if (lots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-black/45">
        No available lots for this show.
      </div>
    );
  }

  return lots.map((lot) => (
    <div key={lot.id} className="relative">
      {admin && (
        <>
          <button
            type="button"
            aria-label={`Edit ${lot.title}`}
            onClick={() => setEditingLotId((current) => current === lot.id ? undefined : lot.id)}
            className="absolute left-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/55 shadow-sm transition hover:border-[#f15a29] hover:bg-[#f15a29] hover:text-white"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <div className="absolute right-3 top-3 z-10">
            <DeleteLotButton lotId={lot.id} showId={showId} title={lot.title} />
          </div>
        </>
      )}
      <LotCard lot={lot} userId={userId} />
      {admin && editingLotId === lot.id && (
        <EditLotForm
          consignors={consignors}
          lot={lot}
          onClose={() => setEditingLotId(undefined)}
          showId={showId}
        />
      )}
    </div>
  ));
}
