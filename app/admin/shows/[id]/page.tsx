import { AuctionHeader } from "@/components/auction-header";
import { AdminAddLotPanel } from "@/components/admin-add-lot-panel";
import { DeleteLotButton } from "@/components/delete-lot-button";
import { LotCard } from "@/components/lot-card";
import { ShowAudienceCount } from "@/components/show-audience-count";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type LotStatus = "pending" | "live" | "held" | "sold" | "released";

type Lot = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  photos: string[] | null;
  price_idr: number;
  seq: number;
  status: LotStatus;
  opens_at: string | null;
};

function getPlaybackUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return `https://player.mux.com/${encodeURIComponent(value)}`;
  }
}

export default async function AdminShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/");

  const email = (authData.claims.email as string | undefined) ?? "";
  const [
    { data: profile },
    { data: show },
    { data: lots, error: lotsError },
    { data: consignors },
  ] =
    await Promise.all([
      supabase
        .from("users")
        .select("email, full_name, shipping_address, role")
        .eq("id", authData.claims.sub)
        .maybeSingle(),
      supabase
        .from("shows")
        .select("id, title, status, stream_playback_url, notes")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("lots")
        .select("id, code, title, description, photos, price_idr, seq, status, opens_at")
        .eq("show_id", id)
        .in("status", ["pending", "live", "released", "sold"])
        .order("seq", { ascending: true }),
      supabase.from("consignors").select("id").order("id", { ascending: true }),
    ]);

  if (profile?.role !== "admin") redirect("/?signedIn=true");
  if (!show) notFound();

  const playbackUrl = getPlaybackUrl(show.stream_playback_url);
  const isLive = show.status.toLowerCase() === "live";
  const showLots = (lots ?? []) as Lot[];
  const nextLotNumber = showLots.length + 1;

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader
        email={profile.email ?? email}
        name={profile.full_name ?? undefined}
        shippingAddress={profile.shipping_address ?? undefined}
      />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
        <Link
          href="/admin/shows/read"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" /> Back to available shows
        </Link>

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
            <div className="mt-7 border-b border-black/10 pb-7">
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#d94719]">
                <span className="flex items-center gap-1.5 capitalize">
                  <Clock3 className="size-4" />
                  {isLive ? "Live now" : show.status.replaceAll("_", " ")}
                </span>
                <span className="text-black/20">•</span>
                <span>Admin view</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {show.title}
              </h1>
              <div className="mt-5">
                <ShowAudienceCount showId={show.id} userId={authData.claims.sub as string} isAdmin />
              </div>
            </div>
            {show.notes && <p className="mt-6 max-w-3xl leading-7 text-black/55">{show.notes}</p>}
          </div>

          <AdminAddLotPanel
            consignors={consignors ?? []}
            defaultCode={`LOT-${nextLotNumber}`}
            showId={show.id}
            showTitle={show.title}
          >
              {lotsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Lots could not be loaded. Please try again shortly.</div>
              ) : showLots.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-black/45">No available lots for this show.</div>
              ) : (
                showLots.map((lot) => (
                  <div key={lot.id} className="relative">
                    <div className="absolute right-3 top-3 z-10">
                      <DeleteLotButton lotId={lot.id} showId={show.id} title={lot.title} />
                    </div>
                    <LotCard lot={lot} userId={authData.claims.sub as string} />
                  </div>
                ))
              )}
          </AdminAddLotPanel>
        </div>
      </section>
    </main>
  );
}
