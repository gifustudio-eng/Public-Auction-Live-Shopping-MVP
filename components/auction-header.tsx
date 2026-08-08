import { Gavel } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { ProfilePanel } from "@/components/profile-panel";

export function Brand() {
  return (
    <p
      className="flex items-center gap-3 text-lg font-semibold tracking-tight"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#f15a29] text-white">
        <Gavel className="size-5" aria-hidden="true" />
      </span>
      Public Auction
    </p>
  );
}

export function AuctionHeader({
  email,
  name,
  shippingAddress,
}: {
  email?: string;
  name?: string;
  shippingAddress?: string;
}) {
  return (
    <header className="border-b border-black/10 bg-[#f7f4ed]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Brand />
        {email ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-black/50 md:inline">
              {name || email}
            </span>
            <ProfilePanel
              email={email}
              initialName={name}
              initialShippingAddress={shippingAddress}
            />
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/"
            className="text-sm font-semibold text-black/60 transition-colors hover:text-black"
          >
            Back home
          </Link>
        )}
      </div>
    </header>
  );
}
