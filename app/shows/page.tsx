import { createClient } from "@/lib/supabase/server";
import { AuctionHeader } from "@/components/auction-header";
import { LiveShowsList, type PublicShow } from "@/components/live-shows-list";
import { Archive, CalendarDays } from "lucide-react";
import Link from "next/link";

async function ShowsList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("id, title, scheduled_at, status, notes, created_at")
    .eq("status", "live")
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Unable to load shows:", error);
    return (
      <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
        Shows could not be loaded. Please try again shortly.
      </div>
    );
  }

  return <LiveShowsList initialShows={(data ?? []) as PublicShow[]} />;
}

async function getViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return {};

  const email = (data.claims.email as string | undefined) ?? "";
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, shipping_address")
    .eq("id", data.claims.sub)
    .maybeSingle();

  return {
    email: profile?.email ?? email,
    name: profile?.full_name ?? undefined,
    shippingAddress: profile?.shipping_address ?? undefined,
  };
}

export default async function ShowsPage() {
  const [viewer, showsList] = await Promise.all([getViewer(), ShowsList()]);

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader {...viewer} />
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
