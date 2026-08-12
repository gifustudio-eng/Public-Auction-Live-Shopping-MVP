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
import { Suspense } from "react";

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

export function generateStaticParams() {
  return [{ slug: "mid-century-icons" }];
}

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

function ActiveLots() {
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
        {activeLots.map((lot, index) => (
          <article
            key={lot.number}
            className={`rounded-2xl border p-4 ${index === 0 ? "border-[#f15a29]/35 bg-[#f15a29]/[0.06]" : "border-black/10"}`}
          >
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em]">
              <span className="text-black/40">{lot.number}</span>
              <span className={index === 0 ? "text-[#d94719]" : "text-black/35"}>
                {lot.status}
              </span>
            </div>
            <h3 className="mt-3 font-semibold leading-5">{lot.title}</h3>
            <p className="mt-1 text-sm leading-5 text-black/45">{lot.detail}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-black/40">Current price</p>
                <p className="mt-0.5 text-lg font-semibold">{lot.price}</p>
              </div>
              {index === 0 && (
                <button
                  type="button"
                  className="h-10 rounded-xl bg-[#f15a29] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#d94719]"
                >
                  Claim lot
                </button>
              )}
            </div>
          </article>
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
  if (slug !== "mid-century-icons") notFound();

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <Suspense fallback={<AuctionHeader />}>
        <ViewerHeader />
      </Suspense>

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
              <iframe
                src="https://player.mux.com/DUT2pW02J01k012kOGnBieYbytcHXCkbVcYxPkk1YG8DQo"
                title="Mid-Century Icons live auction"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-7 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#d94719]">
                  <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> Live now</span>
                  <span className="text-black/20">•</span>
                  <span>Design</span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Mid-Century Icons
                </h1>
                <p className="mt-2 text-black/50">Hosted by Mara Chen</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#52705b]/10 px-3 py-2 text-xs font-semibold text-[#52705b]">
                <ShieldCheck className="size-4" /> Secure claiming
              </span>
            </div>

            <p className="mt-6 max-w-3xl leading-7 text-black/55">
              Join Mara for an evening of sculptural lighting, teak furniture,
              and enduring design classics selected from private collections.
            </p>
          </div>

          <ActiveLots />
        </div>
      </section>
    </main>
  );
}
