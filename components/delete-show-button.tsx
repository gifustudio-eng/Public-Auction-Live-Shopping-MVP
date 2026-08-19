"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteShow } from "@/app/admin/actions";

export function DeleteShowButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function handleDelete() {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteShow(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="relative">
      <button type="button" disabled={isPending} aria-label={`Delete ${title}`} onClick={handleDelete} className="flex size-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50">
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
      {error && <p role="alert" className="absolute right-0 top-12 z-10 w-64 rounded-xl bg-red-50 p-3 text-xs text-red-800 shadow-lg">{error}</p>}
    </div>
  );
}
