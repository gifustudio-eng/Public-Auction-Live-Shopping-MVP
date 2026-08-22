"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { PopupLotCard, type PopupLot } from "@/components/popup-lot-card";
import { createClient } from "@/lib/supabase/client";

export type { PopupLot } from "@/components/popup-lot-card";

export function LiveLotPopup({
  initialLot,
  showId,
  userId,
}: {
  initialLot: PopupLot | null;
  showId: string;
  userId: string | null;
}) {
  const [activeLot, setActiveLot] = useState<PopupLot | null>(initialLot);
  const [view, setView] = useState<"lot" | "description">("lot");
  const [soldCountdown, setSoldCountdown] = useState<number | null>(null);

  useEffect(() => {
    setActiveLot(initialLot);
  }, [initialLot]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`public-live-lot:${showId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lots" },
        (payload) => {
          const oldLot = payload.old as Partial<PopupLot>;
          const nextLot = payload.new as PopupLot;

          if (payload.eventType === "DELETE") {
            setActiveLot((current) => current?.id === oldLot.id ? null : current);
            return;
          }

          if (nextLot.show_id !== showId) return;

          if (nextLot.status === "live") {
            setView("lot");
            setActiveLot(nextLot);
            return;
          }

          setActiveLot((current) => {
            if (current?.id !== nextLot.id) return current;
            // A status update must be visible even if the viewer was reading
            // the description when the admin changed the lot.
            setView("lot");
            return nextLot;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showId]);

  useEffect(() => {
    if (activeLot?.status !== "sold") {
      setSoldCountdown(null);
      return;
    }

    setSoldCountdown(3);
    const interval = window.setInterval(() => {
      setSoldCountdown((current) => current === null ? null : Math.max(0, current - 1));
    }, 1000);
    const timeout = window.setTimeout(() => {
      setActiveLot(null);
      setView("lot");
    }, 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [activeLot?.id, activeLot?.status]);

  if (!activeLot) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Live lot">
      <div className="relative max-h-[calc(100svh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#f7f4ed] p-4 text-[#171712] shadow-2xl sm:p-5">
        {view === "description" ? (
          <div>
            <button type="button" onClick={() => setView("lot")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#d94719] hover:underline">
              <ArrowLeft className="size-4" /> Back to lot
            </button>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/45">{activeLot.code}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">{activeLot.title}</h2>
            <p className="mt-5 whitespace-pre-wrap leading-7 text-black/65">{activeLot.description || "No description has been added for this lot."}</p>
          </div>
        ) : (
          <>
            <PopupLotCard lot={activeLot} userId={userId} />
            {soldCountdown !== null && <p className="mt-3 text-center text-sm font-semibold text-[#d94719]">Sold — closing in {soldCountdown}s</p>}
            <button type="button" onClick={() => setView("description")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#d94719] hover:underline">
              <FileText className="size-4" /> Description
            </button>
          </>
        )}
      </div>
    </div>
  );
}
