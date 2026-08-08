import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Radio,
  Sparkles,
} from "lucide-react";
import { Suspense } from "react";

const shows = [
  {
    day: "Today",
    date: "August 8",
    time: "7:00 PM",
    title: "Mid-Century Icons",
    host: "Hosted by Mara Chen",
    description: "Sculptural lighting, teak furniture, and design classics from the 1950s–70s.",
    category: "Design",
    live: true,
    tone: "from-[#d96338] to-[#8f2f1d]",
  },
  {
    day: "Sunday",
    date: "August 9",
    time: "11:00 AM",
    title: "The Sunday Watch Edit",
    host: "Hosted by Theo Laurent",
    description: "A considered collection of vintage watches, from daily wearers to rare references.",
    category: "Watches",
    live: false,
    tone: "from-[#314b45] to-[#172521]",
  },
  {
    day: "Tuesday",
    date: "August 11",
    time: "8:30 PM",
    title: "After Dark: Modern Art",
    host: "Hosted by Ellis House",
    description: "Bold editions, works on paper, and emerging artists selected for new collectors.",
    category: "Art",
    live: false,
    tone: "from-[#74586e] to-[#30212d]",
  },
  {
    day: "Thursday",
    date: "August 13",
    time: "6:00 PM",
    title: "Objects With a Past",
    host: "Hosted by June & Found",
    description: "Curious antiques, storied silver, and characterful pieces for the collected home.",
    category: "Antiques",
    live: false,
    tone: "from-[#b58b42] to-[#5f431e]",
  },
];

async function getViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return {};

  const email = (data.claims.email as string | undefined) ?? "";
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, shipping_address")
    .eq("email", email)
    .maybeSingle();

  return {
    email: profile?.email ?? email,
    name: profile?.full_name ?? undefined,
    shippingAddress: profile?.shipping_address ?? undefined,
  };
}

async function ViewerHeader() {
  const viewer = await getViewer();
  return <AuctionHeader {...viewer} />;
}

export default function ShowsPage() {
  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <Suspense fallback={<AuctionHeader />}>
        <ViewerHeader />
      </Suspense>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
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

        <div className="mt-10 grid gap-5">
          {shows.map((show) => (
            <article
              key={show.title}
              className="group grid overflow-hidden rounded-3xl border border-black/10 bg-white transition-transform duration-300 hover:-translate-y-1 md:grid-cols-[190px_1fr_auto]"
            >
              <div className={`relative flex min-h-44 flex-col justify-between bg-gradient-to-br ${show.tone} p-6 text-white`}>
                <Sparkles className="size-6 text-[#f6c453]" />
                <div>
                  <p className="text-sm text-white/65">{show.day}</p>
                  <p className="mt-1 text-xl font-semibold">{show.date}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-6 md:px-8 md:py-7">
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  <span className="flex items-center gap-1.5 text-[#d94719]">
                    <Clock3 className="size-4" /> {show.time}
                  </span>
                  <span className="text-black/25">•</span>
                  <span className="text-black/45">{show.category}</span>
                  {show.live && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f15a29]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d94719]">
                      <Radio className="size-3" /> Tonight
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{show.title}</h2>
                <p className="mt-1 text-sm font-medium text-black/45">{show.host}</p>
                <p className="mt-3 max-w-2xl leading-6 text-black/55">{show.description}</p>
              </div>

              <div className="flex items-center p-6 pt-0 md:p-8">
                <span className="flex size-11 items-center justify-center rounded-full border border-black/10 text-black/55 transition-colors group-hover:border-[#f15a29] group-hover:bg-[#f15a29] group-hover:text-white">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
