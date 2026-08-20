import { AuctionHeader } from "@/components/auction-header";
import { CreateConsignorForm } from "@/components/create-consignor-form";
import { AdminConsignorList, type AdminConsignor } from "@/components/admin-consignor-list";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const actionContent = {
  create: {
    eyebrow: "Manage Consignors · Create",
    title: "Create a Consignor",
    description: "Add the consignor details below. Their ID is generated automatically when the record is saved.",
  },
  read: {
    eyebrow: "Manage Consignors · View",
    title: "Available Consignors",
    description: "The consignor list will appear here.",
  },
  edit: {
    eyebrow: "Manage Consignors · Edit",
    title: "Edit Consignors",
    description: "Select a consignor here to update its details.",
  },
} as const;

export default async function ConsignorActionPage({
  params,
}: {
  params: Promise<{ action: string }>;
}) {
  const { action } = await params;
  const content = actionContent[action as keyof typeof actionContent];
  if (!content) notFound();

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

  const { data: consignors } = action === "create"
    ? { data: null }
    : await supabase
      .from("consignors")
      .select("id, name, contact, commission_pct, payout_notes")
      .order("created_at", { ascending: false });

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader
        email={profile.email ?? email}
        name={profile.full_name ?? undefined}
        shippingAddress={profile.shipping_address ?? undefined}
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <Link href="/admin/consignors" className="text-sm font-semibold text-[#d94719] hover:underline">
          ← Back to Consignor Menu
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">
          {content.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-black/55">{content.description}</p>
        {action === "create" && <CreateConsignorForm />}
        {action === "read" && <AdminConsignorList consignors={(consignors ?? []) as AdminConsignor[]} />}
        {action === "edit" && <AdminConsignorList consignors={(consignors ?? []) as AdminConsignor[]} editable />}
      </section>
    </main>
  );
}
