import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Clock3,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuyButton from "@/components/buy-button";

const activeLots = [
  {
    number: "Lot 08",
    title: "Danish Teak Lounge Chair",
    detail: "Attributed to Arne Vodder, c. 1962",
    price: "$1,850",
    status: "Open now",
  },
  {
    number: "Lot 09",
    title: "Murano Sommerso Vase",
    detail: "Italy, c. 1960",
    price: "$420",
    status: "Up next",
  },
  {
    number: "Lot 10",
    title: "Brass Tripod Floor Lamp",
    detail: "France, c. 1955",
    price: "$975",
    status: "Coming soon",
  },
];

type Show = {
  id: string;
  title: string;
  status: string;
  stream_playback_url: string | null;
  notes: string | null;
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

function getPlaybackUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return `https://player.mux.com/${encodeURIComponent(value)}`;
  }
}

function ActiveLots({userId}: {userId: string | null}) {
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
        {activeLots.map((lot) => (
          <div key={lot.number} className="flex flex-col gap-3 p-4 border border-black/5 rounded-2xl bg-gray-50/50">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-400">{lot.number}</span>
                <h3 className="font-bold text-gray-900 leading-tight mt-0.5">{lot.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{lot.detail}</p>
              </div>
              <span className="text-sm font-bold text-[#d94719] whitespace-nowrap">{lot.price}</span>
            </div>

            {/* INTEGRASI TOMBOL BELI: HANYA UNTUK LOT ACTIVE "Open now" */}
            <div className="mt-1">
              {lot.status === "Open now" ? (
                <BuyButton
                  lotId="c7b2031a-e555-4421-9962-d67b2d55986d" // Lot ID dummy/asli dari database untuk pengujian
                  initialStatus="live"                         // Set 'live' agar tombol menyala hijau "⚡️ BELI SEKARANG"
                  opensAt={null}                               // Set null agar langsung terbuka tanpa countdown timer
                  priceIdr={1850000}                           // Konversi simulasi $1,850 ke Rupiah (Rp 1.850.000) untuk integrasi DB
                  currentUserId={userId}                       // Mengirimkan ID user dari Server Component ke Client Component tombol
                />
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-gray-100 text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed select-none border border-gray-200/50"
                >
                  {lot.status === "Coming soon" ? "⏳ COMING SOON" : "⏳ UP NEXT"}
                </button>
              )}
            </div>
          </div>
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
  const [viewer, show] = await Promise.all([getViewer(), getShow(slug)]);
  const playbackUrl = getPlaybackUrl(show.stream_playback_url);
  const isLive = show.status.toLowerCase() === "live";

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader {...viewer} />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
        <Link
          href="/shows"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" /> Back to shows
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

          <ActiveLots userId= {viewer.id} />
        </div>
      </section>
    </main>
  );
}
