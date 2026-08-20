import { createClient } from "@/lib/supabase/server";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Clock3,
  Radio,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type Show = {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  stream_playback_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const cardTones = [
  "from-[#d96338] to-[#8f2f1d]",
  "from-[#314b45] to-[#172521]",
  "from-[#74586e] to-[#30212d]",
  "from-[#b58b42] to-[#5f431e]",
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "Asia/Jakarta",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
  timeZoneName: "short",
});

async function ShowsList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select(
      "id, title, scheduled_at, status, notes, created_at",
    )
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Unable to load shows:", error);
    return (
      <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
        Shows could not be loaded. Please try again shortly.
      </div>
    );
  }

  const shows = (data ?? []) as Show[];

  if (shows.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-10 text-center">
        <CalendarDays className="mx-auto size-8 text-black/30" />
        <h2 className="mt-4 text-xl font-semibold">No shows available yet</h2>
        <p className="mt-2 text-black/50">Check back soon for the next auction.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-5">
      {shows.map((show, index) => {
        const scheduledDate = new Date(show.scheduled_at);
        const createdDate = new Date(show.created_at);
        const isLive = show.status.toLowerCase() === "live";
        const canOpenShow = isLive;
        const card = (
          <article
            className={`grid overflow-hidden rounded-3xl border border-black/10 bg-white md:grid-cols-[190px_1fr_auto] ${canOpenShow ? "group transition-transform duration-300 hover:-translate-y-1" : ""}`}
          >
            <div className={`relative flex min-h-44 flex-col justify-between bg-gradient-to-br ${cardTones[index % cardTones.length]} p-6 text-white`}>
              <Sparkles className="size-6 text-[#f6c453]" />
              <div>
                <p className="text-sm text-white/65">{dayFormatter.format(scheduledDate)}</p>
                <p className="mt-1 text-xl font-semibold">{dateFormatter.format(scheduledDate)}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 md:px-8 md:py-7">
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-[#d94719]">
                  <Clock3 className="size-4" /> {timeFormatter.format(createdDate)}
                </span>
                <span className="text-black/25">•</span>
                <span className="capitalize text-black/45">{show.status.replaceAll("_", " ")}</span>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f15a29]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d94719]">
                    <Radio className="size-3" /> Live
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{show.title}</h2>
              {show.notes && (
                <p className="mt-3 max-w-2xl leading-6 text-black/55">{show.notes}</p>
              )}
            </div>

            {canOpenShow && (
              <div className="flex items-center p-6 pt-0 md:p-8">
                <span className="flex size-11 items-center justify-center rounded-full border border-black/10 text-black/55 transition-colors group-hover:border-[#f15a29] group-hover:bg-[#f15a29] group-hover:text-white">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            )}
          </article>
        );

        return canOpenShow ? (
          <Link
            key={show.id}
            href={`/shows/${show.id}`}
            aria-label={`Open show: ${show.title}`}
          >
            {card}
          </Link>
        ) : (
          <div key={show.id}>{card}</div>
        );
      })}
    </div>
  );
}

export default async function ShowsPage() {
  const showsList = await ShowsList();

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="mb-8 flex justify-end">
          <Link
            href="/archive"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/65 transition-colors hover:border-black/20 hover:text-black"
          >
            <Archive className="size-4" />
            View archive
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-12 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#f15a29]/10 px-4 py-2 text-sm font-semibold text-[#d94719]">
              <CalendarDays className="size-4" /> Upcoming schedule
            </div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
              Find your next live show.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-black/55">
              Save the date, meet our hosts, and join the bidding when the room opens.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-black/45">
            <span className="size-2 rounded-full bg-[#f15a29]" />
            All times in your local timezone
          </div>
        </div>

        {showsList}
      </section>
    </main>
  );
}
