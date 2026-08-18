import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, CalendarCheck, ImageIcon, PackageCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type Show = {
  id: string;
  title: string;
};

type SoldLot = {
  id: string;
  show_id: string;
  consignor_id: string;
  code: string;
  title: string;
  description: string | null;
  photos: string[] | null;
  price_idr: number;
  seq: number;
  status: "sold";
  opens_at: string | null;
  sold_at: string | null;
  updated_at: string;
};

async function getShow(showId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shows")
    .select("id, title")
    .eq("id", showId)
    .maybeSingle();

  if (error || !data) notFound();
  return data as Show;
}

async function getSoldLots(showId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lots")
    .select(
      "id, show_id, consignor_id, code, title, description, photos, price_idr, seq, status, opens_at, sold_at, updated_at",
    )
    .eq("show_id", showId)
    .eq("status", "sold")
    .order("seq", { ascending: true });

  return {
    lots: (data ?? []) as SoldLot[],
    error: Boolean(error),
  };
}

function getPhotoUrl(photos: string[] | null) {
  const value = photos?.[0];
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const soldDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function SoldLotsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: showId } = await params;
  const [show, soldLots] = await Promise.all([
    getShow(showId),
    getSoldLots(showId),
  ]);

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-28 lg:pt-10">
        <Link
          href={`/shows/${show.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/55 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" /> Back to live show
        </Link>

        <div className="mt-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#52705b]/10 px-4 py-2 text-sm font-semibold text-[#52705b]">
            <PackageCheck className="size-4" /> Sold lots
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Sold from {show.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-black/55">
            Every completed sale from this show, in auction order.
          </p>
        </div>

        {soldLots.error ? (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
            Sold lots could not be loaded. Please try again shortly.
          </div>
        ) : soldLots.lots.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-black/15 bg-white/50 p-10 text-center">
            <PackageCheck className="mx-auto size-8 text-black/25" />
            <h2 className="mt-4 text-xl font-semibold">No sold lots yet</h2>
            <p className="mt-2 text-black/45">Completed sales from this show will appear here.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {soldLots.lots.map((lot) => {
              const photoUrl = getPhotoUrl(lot.photos);

              return (
                <article key={lot.id} className="overflow-hidden rounded-3xl border border-black/10 bg-white">
                  <div
                    className="flex aspect-[4/3] items-center justify-center bg-black/[0.06] bg-cover bg-center text-black/25"
                    style={photoUrl ? { backgroundImage: `url(${JSON.stringify(photoUrl)})` } : undefined}
                    role={photoUrl ? "img" : undefined}
                    aria-label={photoUrl ? `${lot.title} lot photo` : undefined}
                  >
                    {!photoUrl && <ImageIcon className="size-8" aria-hidden="true" />}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">{lot.code}</span>
                      <span className="rounded-full bg-[#52705b]/10 px-2.5 py-1 text-xs font-semibold text-[#52705b]">Sold</span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em]">{lot.title}</h2>
                    {lot.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/50">{lot.description}</p>
                    )}
                    <p className="mt-5 text-xl font-semibold text-[#d94719]">
                      {priceFormatter.format(Number(lot.price_idr))}
                    </p>
                    {lot.sold_at && (
                      <p className="mt-4 flex items-center gap-2 border-t border-black/10 pt-4 text-xs text-black/40">
                        <CalendarCheck className="size-4" />
                        {soldDateFormatter.format(new Date(lot.sold_at))}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
