import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import { Archive, ArrowLeft, CalendarDays, Check, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const pastShows = [
  { date: "Aug 2, 2026", title: "Rare Books & First Editions", lots: 32, sold: 27, accent: "bg-[#a9593b]" },
  { date: "Jul 26, 2026", title: "Studio Ceramics", lots: 24, sold: 22, accent: "bg-[#68755f]" },
  { date: "Jul 18, 2026", title: "Jewels With a Story", lots: 41, sold: 35, accent: "bg-[#866c79]" },
  { date: "Jul 9, 2026", title: "The Collector’s Cabinet", lots: 28, sold: 25, accent: "bg-[#a67b37]" },
  { date: "Jun 28, 2026", title: "Postwar Prints", lots: 36, sold: 31, accent: "bg-[#536b75]" },
  { date: "Jun 20, 2026", title: "Vintage Utility", lots: 30, sold: 26, accent: "bg-[#5d594b]" },
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

export default function ArchivePage() {
  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <Suspense fallback={<AuctionHeader />}>
        <ViewerHeader />
      </Suspense>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="mb-8 flex justify-start">
          <Link
            href="/shows"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/65 transition-colors hover:border-black/20 hover:text-black"
          >
            <ArrowLeft className="size-4" />
            Back to shows
          </Link>
        </div>
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black/[0.06] px-4 py-2 text-sm font-semibold text-black/60">
            <Archive className="size-4" /> Show archive
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">Past shows, memorable finds.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-black/55">
            Look back at recently completed auctions and the collections that found new homes.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pastShows.map((show, index) => (
            <article key={show.title} className="overflow-hidden rounded-3xl border border-black/10 bg-white">
              <div className={`${show.accent} relative h-44 p-6 text-white`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.25),transparent_35%)]" />
                <span className="relative flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <PackageCheck className="size-5" />
                </span>
                <span className="absolute bottom-5 right-5 text-6xl font-semibold text-white/10">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="p-6">
                <p className="flex items-center gap-2 text-sm font-medium text-black/45">
                  <CalendarDays className="size-4" /> {show.date}
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">{show.title}</h2>
                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5 text-sm">
                  <span className="text-black/45">{show.lots} lots offered</span>
                  <span className="flex items-center gap-1.5 font-semibold text-[#52705b]">
                    <Check className="size-4" /> {show.sold} sold
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
