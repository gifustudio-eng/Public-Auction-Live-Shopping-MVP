import { AuctionHeader } from "@/components/auction-header";
import { CreateConsignorForm } from "@/components/create-consignor-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditConsignorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/");

  const email = (data.claims.email as string | undefined) ?? "";
  const [{ data: profile }, { data: consignor }] = await Promise.all([
    supabase.from("users").select("email, full_name, shipping_address, role").eq("id", data.claims.sub).maybeSingle(),
    supabase.from("consignors").select("id, name, contact, commission_pct, payout_notes").eq("id", id).maybeSingle(),
  ]);
  if (profile?.role !== "admin") redirect("/?signedIn=true");
  if (!consignor) notFound();

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader email={profile.email ?? email} name={profile.full_name ?? undefined} shippingAddress={profile.shipping_address ?? undefined} />
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <Link href="/admin/consignors/edit" className="text-sm font-semibold text-[#d94719] hover:underline">← Back to Edit Consignors</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">Manage Consignors · Edit</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Edit {consignor.name}</h1>
        <CreateConsignorForm consignor={{ id: consignor.id, name: consignor.name, contact: consignor.contact, commissionPct: Number(consignor.commission_pct), payoutNotes: consignor.payout_notes }} />
      </section>
    </main>
  );
}
