"use client";

import { createClient } from "@/lib/supabase/client";
import { ArrowRight, CalendarDays, Clock3, Radio, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export type PublicShow = {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const cardTones = [
  "from-[#d96338] to-[#8f2f1d]",
  "from-[#314b45] to-[#172521]",
  "from-[#74586e] to-[#30212d]",
  "from-[#b58b42] to-[#5f431e]",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "Asia/Jakarta" });
const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Jakarta" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Jakarta", timeZoneName: "short" });

function isLive(show: PublicShow) {
  return show.status.toLowerCase() === "live";
}

export function LiveShowsList({ initialShows }: { initialShows: PublicShow[] }) {
  const [shows, setShows] = useState(() => initialShows.filter(isLive));

  useEffect(() => {
    setShows(initialShows.filter(isLive));
  }, [initialShows]);

  useEffect(() => {
    const supabase = createClient();
    // Do not filter this subscription by status: we must receive a live show
    // changing to ended in order to remove it from this public list immediately.
    const channel = supabase
      .channel("public-live-shows")
      .on("postgres_changes", { event: "*", schema: "public", table: "shows" }, (payload) => {
        const previous = payload.old as Partial<PublicShow>;
        const next = payload.new as PublicShow;

        setShows((currentShows) => {
          if (payload.eventType === "DELETE") {
            return currentShows.filter((show) => show.id !== previous.id);
          }

          if (!isLive(next)) {
            return currentShows.filter((show) => show.id !== next.id);
          }

          return [...currentShows.filter((show) => show.id !== next.id), next]
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  if (shows.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-10 text-center">
        <CalendarDays className="mx-auto size-8 text-black/30" />
        <h2 className="mt-4 text-xl font-semibold">No live shows available yet</h2>
        <p className="mt-2 text-black/50">Check back soon for the next auction.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5">
      {shows.map((show, index) => {
        const scheduledDate = new Date(show.scheduled_at);
        const createdDate = new Date(show.created_at);
        return (
          <Link key={show.id} href={`/shows/${show.id}`} aria-label={`Open show: ${show.title}`}>
            <article className="group grid overflow-hidden rounded-3xl border border-black/10 bg-white transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[190px_1fr_auto]">
              <div className={`relative flex min-h-44 flex-col justify-between bg-gradient-to-br ${cardTones[index % cardTones.length]} p-6 text-white`}>
                <Sparkles className="size-6 text-[#f6c453]" />
                <div>
                  <p className="text-sm text-white/65">{dayFormatter.format(scheduledDate)}</p>
                  <p className="mt-1 text-xl font-semibold">{dateFormatter.format(scheduledDate)}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center p-6 md:px-8 md:py-7">
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  <span className="flex items-center gap-1.5 text-[#d94719]"><Clock3 className="size-4" /> {timeFormatter.format(createdDate)}</span>
                  <span className="text-black/25">•</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f15a29]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d94719]"><Radio className="size-3" /> Live</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{show.title}</h2>
                {show.notes && <p className="mt-3 max-w-2xl leading-6 text-black/55">{show.notes}</p>}
              </div>
              <div className="flex items-center p-6 pt-0 md:p-8">
                <span className="flex size-11 items-center justify-center rounded-full border border-black/10 text-black/55 transition-colors group-hover:border-[#f15a29] group-hover:bg-[#f15a29] group-hover:text-white"><ArrowRight className="size-4" /></span>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
