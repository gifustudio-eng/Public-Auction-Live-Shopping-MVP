"use client";

import { CirclePause, Play } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setShowStreamStatus } from "@/app/admin/actions";

export function StreamEmergencyControls({ showId }: { showId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function updateStream(status: "live" | "ended") {
    setError(undefined);
    startTransition(async () => {
      const result = await setShowStreamStatus(showId, status);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="mt-8 text-center">
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={isPending} onClick={() => updateStream("ended")} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-red-600 px-8 text-base font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60">
          <CirclePause className="size-5" aria-hidden="true" /> Stop Stream
        </button>
        <button type="button" disabled={isPending} onClick={() => updateStream("live")} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#f15a29] px-8 text-base font-bold text-white shadow-sm transition hover:bg-[#d94719] disabled:opacity-60">
          <Play className="size-5" aria-hidden="true" /> Continue Stream
        </button>
      </div>
      {error && <p role="alert" className="mx-auto mt-3 max-w-md text-sm text-red-700">{error}</p>}
    </div>
  );
}
