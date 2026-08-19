import { CalendarDays, Pencil } from "lucide-react";
import Link from "next/link";

import { DeleteShowButton } from "@/components/delete-show-button";

export type AdminShowListItem = {
  id: string;
  title: string;
  status: string;
  scheduled_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function AdminShowList({
  shows,
  editable = false,
}: {
  shows: AdminShowListItem[];
  editable?: boolean;
}) {
  if (shows.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-black/15 bg-white p-10 text-center text-black/50">
        <CalendarDays className="mx-auto size-7" aria-hidden="true" />
        <p className="mt-3">No shows are available yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-4">
      {shows.map((show) => (
        <article
          key={show.id}
          className="flex items-center justify-between gap-5 rounded-3xl border border-black/10 bg-white p-6"
        >
          <div>
            <h2 className="text-xl font-semibold">{show.title}</h2>
            <p className="mt-2 text-sm text-black/55">
              {dateFormatter.format(new Date(show.scheduled_at))} · {" "}
              <span className="capitalize">{show.status.replaceAll("_", " ")}</span>
            </p>
          </div>
          {editable && (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/shows/${show.id}/edit`}
                aria-label={`Edit ${show.title}`}
                className="flex size-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:border-[#f15a29] hover:bg-[#f15a29] hover:text-white"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
              <DeleteShowButton id={show.id} title={show.title} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
