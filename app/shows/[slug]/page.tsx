import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShowAudienceCount } from "@/components/show-audience-count";
import { LiveLotPopup, type PopupLot } from "@/components/live-lot-popup";
import { SoldLotsPopup } from "@/components/sold-lots-popup";

type Show = {
  id: string;
  title: string;
  status: string;
  stream_playback_url: string | null;
  notes: string | null;
};

type SoldLot = {
  id: string;
  code: string;
  title: string;
  price_idr: number;
};

async function getViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { id: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return { id: userId, isAdmin: profile?.role === "admin" };
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

async function getSoldLots(showId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lots")
    .select("id, code, title, price_idr")
    .eq("show_id", showId)
    .eq("status", "sold")
    .order("seq", { ascending: true });

  if (error) {
    console.error("Unable to load sold lots:", error);
    return [] as SoldLot[];
  }
  return (data ?? []) as SoldLot[];
}

async function getCurrentLiveLot(showId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lots")
    .select("id, show_id, code, title, description, photos, price_idr, status, opens_at")
    .eq("show_id", showId)
    .eq("status", "live")
    .order("seq", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Unable to load current live lot:", error);
    return null;
  }
  return data as PopupLot | null;
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

export default async function LiveShowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [viewer, show, soldLots, currentLiveLot] = await Promise.all([
    getViewer(),
    getShow(slug),
    getSoldLots(slug),
    getCurrentLiveLot(slug),
  ]);
  const playbackUrl = getPlaybackUrl(show.stream_playback_url);
  const isLive = show.status.toLowerCase() === "live";

  return (
    <main className="min-h-svh bg-[#191914] text-white">
      <section>
        <div className="relative h-svh min-h-[32rem] overflow-hidden bg-[#191914] shadow-sm">
          {isLive && playbackUrl ? (
            <iframe
              src={playbackUrl}
              title={`${show.title} video player`}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/60">
              {isLive ? "A playback URL has not been added for this show yet." : "This stream is currently stopped."}
            </div>
          )}

          <Link
            href="/shows"
            className="absolute left-5 top-5 z-10 inline-flex h-11 items-center gap-2 rounded-xl bg-black/55 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/75 sm:left-7 sm:top-7"
          >
            <ArrowLeft className="size-4" /> Back to shows
          </Link>
          <div className="absolute right-5 top-5 z-10 sm:right-7 sm:top-7">
            <ShowAudienceCount showId={show.id} userId={viewer.id} isAdmin={viewer.isAdmin} />
          </div>
          <SoldLotsPopup initialLots={soldLots} showId={show.id} />
          <LiveLotPopup initialLot={currentLiveLot} showId={show.id} userId={viewer.id} />
          </div>
      </section>
    </main>
  );
}
