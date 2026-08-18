import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LotCard } from "@/components/lot-card";

type Show = {
  id: string;
  title: string;
  status: string;
  stream_playback_url: string | null;
  notes: string | null;
};

type LotStatus = "pending" | "live" | "held" | "sold" | "released";

type Lot = {
  id: string;
  show_id: string;
  consignor_id: string;
  code: string;
  title: string;
  description: string | null;
  photos: string[] | null;
  price_idr: number;
  seq: number;
  status: LotStatus;
  opens_at: string | null;
  sold_at: string | null;
  updated_at: string;
};

async function getViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { id: null };

  const email = (data.claims.email as string | undefined) ?? "";
  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, shipping_address")
    .eq("email", email)
    .maybeSingle();

  return {
    id: profile?.id ?? null,
    email: profile?.email ?? email,
    name: profile?.full_name ?? undefined,
    shippingAddress: profile?.shipping_address ?? undefined,
  };
}

async function getShow(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("id, title, status, stream_playback_url, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  return data as Show;
}

async function getAvailableLots(showId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lots")
    .select(
      "*",
    )
    .eq("show_id", showId)
    .in("status", ["pending", "live", "released", "sold"])
    .order("seq", { ascending: true });

  if (error) {
    console.error("Unable to load available lots:", error);
    return { lots: [] as Lot[], error: true };
  }

  return { lots: (data ?? []) as Lot[], error: false };
}

function getPlaybackUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return `https://player.mux.com/${encodeURIComponent(value)}`;
  }
}

function ActiveLots({
  lots,
  userId,
  hasError,
}: {
  lots: Lot[];
  userId: string | null;
  hasError: boolean;
}) {
  return (
    <aside className="rounded-3xl border border-black/10 bg-white p-5 lg:sticky lg:top-6 lg:self-start">
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d94719]">
            Auction queue
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            Active lots
          </h2>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-[#f15a29]/10 text-[#d94719]">
          <ShoppingBag className="size-4" />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {hasError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Available lots could not be loaded. Please try again shortly.
          </div>
        ) : lots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-black/45">
            No available lots for this show.
          </div>
        ) : lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} userId={userId} />
        ))}
      </div>
    </aside>
  );
}

export default async function LiveShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [viewer, show, availableLots] = await Promise.all([
    getViewer(),
    getShow(slug),
    getAvailableLots(slug),
  ]);
  const playbackUrl = getPlaybackUrl(show.stream_playback_url);
  const isLive = show.status.toLowerCase() === "live";

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader {...viewer} />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition-colors hover:text-black"
          >
            <ArrowLeft className="size-4" /> Back to shows
          </Link>
          <Link
            href={`/shows/${show.id}/sold`}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black/65 transition-colors hover:border-black/20 hover:text-black"
          >
            <PackageCheck className="size-4" /> Sold lots
          </Link>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0">
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-[#191914] shadow-sm">
              {playbackUrl ? (
                <iframe
                  src={playbackUrl}
                  title={`${show.title} video player`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
                  A playback URL has not been added for this show yet.
                </div>
              )}
            </div>
            <div className="mt-7 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#d94719]">
                  <span className="flex items-center gap-1.5 capitalize"><Clock3 className="size-4" /> {isLive ? "Live now" : show.status.replaceAll("_", " ")}</span>
                  <span className="text-black/20">•</span>
                  <span>Design</span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {show.title}
                </h1>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#52705b]/10 px-3 py-2 text-xs font-semibold text-[#52705b]">
                <ShieldCheck className="size-4" /> Secure claiming
              </span>
            </div>

            {show.notes && (
              <p className="mt-6 max-w-3xl leading-7 text-black/55">
                {show.notes}
              </p>
            )}
          </div>

          <ActiveLots
            lots={availableLots.lots}
            userId={viewer.id}
            hasError={availableLots.error}
          />
        </div>
      </section>
    </main>
  );
}
