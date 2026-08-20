"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteLot } from "@/app/admin/actions";

export function DeleteLotButton({
  lotId,
  showId,
  title,
}: {
  lotId: string;
  showId: string;
  title: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function handleDelete() {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteLot(lotId, showId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Delete ${title}`}
        disabled={isPending}
        onClick={handleDelete}
        className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/55 shadow-sm transition hover:border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
      {error && (
        <p role="alert" className="absolute right-0 top-11 z-20 w-60 rounded-xl bg-red-50 p-3 text-xs text-red-800 shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}
