"use client";

import { ImageIcon } from "lucide-react";

import BuyButton from "@/components/buy-button";

type LotStatus = "pending" | "live" | "held" | "sold" | "released";

export type PopupLot = {
  id: string;
  show_id: string;
  code: string;
  title: string;
  description: string | null;
  photos: string[] | null;
  price_idr: number;
  status: LotStatus;
  opens_at: string | null;
};

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function getPhotoUrl(photos: string[] | null) {
  const value = photos?.[0];
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function PopupLotCard({ lot, userId }: { lot: PopupLot; userId: string | null }) {
  const photoUrl = getPhotoUrl(lot.photos);

  return (
    <article className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] overflow-hidden rounded-xl border border-black/10 bg-white">
      <div
        className="flex min-h-32 items-center justify-center bg-black/[0.06] bg-cover bg-center text-black/25"
        style={photoUrl ? { backgroundImage: `url(${JSON.stringify(photoUrl)})` } : undefined}
        role={photoUrl ? "img" : undefined}
        aria-label={photoUrl ? `${lot.title} lot photo` : undefined}
      >
        {!photoUrl && <ImageIcon className="size-6" aria-hidden="true" />}
      </div>
      <div className="min-w-0 p-3">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45">{lot.code}</p>
        <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-gray-900">{lot.title}</h2>
        <p className="mt-2 text-sm font-bold text-[#d94719]">{priceFormatter.format(Number(lot.price_idr))}</p>
        <div className="mt-3">
          <BuyButton
            lotId={lot.id}
            initialStatus={lot.status}
            opensAt={lot.opens_at}
            priceIdr={Number(lot.price_idr)}
            currentUserId={userId}
          />
        </div>
      </div>
    </article>
  );
}
