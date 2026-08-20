"use client";

import { useEffect, useState } from "react";

import { DeleteLotButton } from "@/components/delete-lot-button";
import { LotCard } from "@/components/lot-card";
import { createClient } from "@/lib/supabase/client";

type LotStatus = "pending" | "live" | "held" | "sold" | "released";

export type LiveLot = {
  id: string;
  show_id?: string;
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
  initialLots,
  showId,
  userId,
}: {
  admin?: boolean;
  initialLots: LiveLot[];
  showId: string;
  userId: string | null;
}) {
  const [lots, setLots] = useState(() => initialLots.filter(isVisible));

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
        <div className="absolute right-3 top-3 z-10">
          <DeleteLotButton lotId={lot.id} showId={showId} title={lot.title} />
        </div>
      )}
      <LotCard lot={lot} userId={userId} />
    </div>
  ));
}
