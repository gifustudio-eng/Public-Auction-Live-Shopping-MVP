"use client";

import { useActionState, useEffect, useRef } from "react";

import { createShow, type CreateShowState } from "@/app/admin/actions";

const initialState: CreateShowState = {};

export function CreateShowForm() {
  const [state, formAction, isPending] = useActionState(createShow, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-8 grid max-w-2xl gap-5">
      <label className="grid gap-2 text-sm font-medium">
        Show title
        <input required name="title" maxLength={255} placeholder="e.g. Mid-century design auction" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Scheduled at (WIB)</legend>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <label className="grid gap-2 text-sm text-black/60">
            Date
            <input required name="scheduled_date" type="date" className="min-h-12 rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-[#171712] outline-none transition focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
          </label>
          <label className="grid gap-2 text-sm text-black/60">
            Time
            <input required name="scheduled_time" type="time" className="min-h-12 rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-[#171712] outline-none transition focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
          </label>
        </div>
        <p className="text-sm text-black/45">Select a date from the calendar, then choose the start time.</p>
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        Stream playback URL <span className="font-normal text-black/45">(optional)</span>
        <input name="stream_playback_url" type="url" placeholder="https://…" className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Notes <span className="font-normal text-black/45">(optional)</span>
        <textarea name="notes" rows={4} placeholder="Add any details for this auction." className="resize-y rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none transition focus:border-[#f15a29] focus:ring-2 focus:ring-[#f15a29]/20" />
      </label>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.success}</p>}
      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-[#f15a29] px-5 py-3 font-semibold text-white transition hover:bg-[#d94719] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit">
        {isPending ? "Creating show…" : "Create show"}
      </button>
    </form>
  );
}
