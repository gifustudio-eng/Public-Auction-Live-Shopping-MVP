"use client";

import {
  CalendarDays,
  CalendarPlus,
  Check,
  PackagePlus,
} from "lucide-react";
import { useState } from "react";

export type AdminShow = {
  id: string;
  title: string;
  status: string;
  scheduled_at: string;
};

type Action = "show" | "lot";

const showDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function AdminConsoleActions({
  shows,
  showsFailed,
}: {
  shows: AdminShow[];
  showsFailed: boolean;
}) {
  const [activeAction, setActiveAction] = useState<Action>();
  const [selectedShowId, setSelectedShowId] = useState<string>();

  return (
    <div className="mt-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <ActionCard
          active={activeAction === "show"}
          description="Start setting up a new auction show."
          icon={<CalendarPlus className="size-6" aria-hidden="true" />}
          onClick={() => setActiveAction("show")}
          title="Insert New Show"
        />
        <ActionCard
          active={activeAction === "lot"}
          description="Choose a show and add an item to its lineup."
          icon={<PackagePlus className="size-6" aria-hidden="true" />}
          onClick={() => setActiveAction("lot")}
          title="Insert New Lot"
        />
      </div>

      {activeAction === "show" && (
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-7 sm:p-8">
          <h2 className="text-xl font-semibold">Insert New Show</h2>
          <p className="mt-2 text-black/55">
            The new-show form can be added here when its fields are ready.
          </p>
        </div>
      )}

      {activeAction === "lot" && (
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-7 sm:p-8">
          <h2 className="text-xl font-semibold">Choose an available show</h2>
          <p className="mt-2 text-black/55">
            The new lot will belong to the show you select.
          </p>

          {showsFailed ? (
            <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
              Shows could not be loaded. Please try again shortly.
            </p>
          ) : shows.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-6 text-center text-black/50">
              <CalendarDays className="mx-auto size-6" aria-hidden="true" />
              <p className="mt-2">No shows are available yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {shows.map((show) => {
                const selected = selectedShowId === show.id;

                return (
                  <button
                    key={show.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedShowId(show.id)}
                    className={`flex items-center justify-between rounded-2xl border p-5 text-left transition-colors ${
                      selected
                        ? "border-[#f15a29] bg-[#f15a29]/5"
                        : "border-black/10 hover:border-[#f15a29]/60"
                    }`}
                  >
                    <span>
                      <span className="block font-semibold">{show.title}</span>
                      <span className="mt-1 block text-sm text-black/50">
                        {showDateFormatter.format(new Date(show.scheduled_at))} · {" "}
                        <span className="capitalize">
                          {show.status.replaceAll("_", " ")}
                        </span>
                      </span>
                    </span>
                    {selected && (
                      <span className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f15a29] text-white">
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionCard({
  active,
  description,
  icon,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group rounded-3xl border p-7 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
        active
          ? "border-[#f15a29] bg-white shadow-md"
          : "border-black/10 bg-white"
      }`}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f15a29] text-white">
        {icon}
      </span>
      <span className="mt-6 block text-xl font-semibold">{title}</span>
      <span className="mt-2 block leading-6 text-black/55">{description}</span>
    </button>
  );
}
