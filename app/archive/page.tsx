import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import { Archive, ArrowLeft, CalendarDays, PackageCheck } from "lucide-react";
import Link from "next/link";

const accents = ["bg-[#a9593b]", "bg-[#68755f]", "bg-[#866c79]", "bg-[#a67b37]", "bg-[#536b75]", "bg-[#5d594b]"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

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

export default async function ArchivePage() {
  const [viewer, pastShows] = await Promise.all([
    getViewer(),
    getArchivedShows(),
  ]);

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader {...viewer} />
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
          {pastShows.length === 0 && (
            <p className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-8 text-center text-black/55 sm:col-span-2 lg:col-span-3">
              No completed shows are in the archive yet.
            </p>
          )}
          {pastShows.map((show, index) => (
            <article key={show.id} className="overflow-hidden rounded-3xl border border-black/10 bg-white">
              <div className={`${accents[index % accents.length]} relative h-44 p-6 text-white`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.25),transparent_35%)]" />
                <span className="relative flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <PackageCheck className="size-5" />
                </span>
                <span className="absolute bottom-5 right-5 text-6xl font-semibold text-white/10">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="p-6">
                <p className="flex items-center gap-2 text-sm font-medium text-black/45">
                  <CalendarDays className="size-4" /> {dateFormatter.format(new Date(show.scheduled_at))}
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">{show.title}</h2>
                <div className="mt-6 border-t border-black/10 pt-5 text-sm font-semibold text-[#52705b]">
                  Completed auction
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

async function getArchivedShows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("id, title, scheduled_at")
    .eq("status", "ended")
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("Unable to load archived shows:", error);
    return [];
  }
  return data;
}
