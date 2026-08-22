"use client";

import dynamic from "next/dynamic";
import { ImageIcon } from "lucide-react";

const BuyButton = dynamic(() => import("@/components/buy-button"), {
  loading: () => (
    <div
      className="h-24 animate-pulse rounded-2xl border border-black/5 bg-white"
      aria-label="Loading purchase controls"
    />
  ),
});

type LotStatus = "pending" | "live" | "held" | "sold" | "released";

type LotCardProps = {
  lot: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    photos: string[] | null;
    price_idr: number;
    status: LotStatus;
    opens_at: string | null;
  };
  userId: string | null;
  showBuyButton?: boolean;
};

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

export function LotCard({ lot, userId, showBuyButton = true }: LotCardProps) {
  const photoUrl = getPhotoUrl(lot.photos);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-gray-50/50 p-4">
      <div
        className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl bg-black/[0.06] bg-cover bg-center text-black/25"
        style={photoUrl ? { backgroundImage: `url(${JSON.stringify(photoUrl)})` } : undefined}
        role={photoUrl ? "img" : undefined}
        aria-label={photoUrl ? `${lot.title} lot photo` : undefined}
      >
        {!photoUrl && <ImageIcon className="size-7" aria-hidden="true" />}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-gray-400">{lot.code}</span>
          <h3 className="mt-0.5 font-bold leading-tight text-gray-900">{lot.title}</h3>
          {lot.description && (
            <p className="mt-0.5 text-xs text-gray-500">{lot.description}</p>
          )}
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-[#d94719]">
          {priceFormatter.format(Number(lot.price_idr))}
        </span>
      </div>

      {showBuyButton && (
        <div className="mt-1">
          <BuyButton
            lotId={lot.id}
            initialStatus={lot.status}
            opensAt={lot.opens_at}
            priceIdr={Number(lot.price_idr)}
            currentUserId={userId}
          />
        </div>
      )}
    </div>
  );
}
