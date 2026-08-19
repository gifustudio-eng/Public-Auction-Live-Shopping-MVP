import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LotsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/");

  const email = (data.claims.email as string | undefined) ?? "";
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, shipping_address, role")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/?signedIn=true");

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader
        email={profile.email ?? email}
        name={profile.full_name ?? undefined}
        shippingAddress={profile.shipping_address ?? undefined}
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <Link href="/admin" className="text-sm font-semibold text-[#d94719] hover:underline">
          ← Back to admin console
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">
          Lot CRUD
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Manage lots
        </h1>
      </section>
    </main>
  );
}
