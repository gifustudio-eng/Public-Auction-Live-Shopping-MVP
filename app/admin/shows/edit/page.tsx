import { AdminShowList, type AdminShowListItem } from "@/components/admin-show-list";
import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditShowsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/");

  const email = (authData.claims.email as string | undefined) ?? "";
  const [{ data: profile }, { data: shows, error }] = await Promise.all([
    supabase.from("users").select("email, full_name, shipping_address, role").eq("id", authData.claims.sub).maybeSingle(),
    supabase.from("shows").select("id, title, status, scheduled_at").order("scheduled_at", { ascending: true }),
  ]);
  if (profile?.role !== "admin") redirect("/?signedIn=true");

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader email={profile.email ?? email} name={profile.full_name ?? undefined} shippingAddress={profile.shipping_address ?? undefined} />
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <Link href="/admin/shows" className="text-sm font-semibold text-[#d94719] hover:underline">← Back to Show CRUD</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">Show CRUD · Edit</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Manage available shows</h1>
        {error ? <p className="mt-10 rounded-2xl bg-red-50 p-5 text-red-800">Shows could not be loaded. Please try again.</p> : <AdminShowList shows={(shows ?? []) as AdminShowListItem[]} editable />}
      </section>
    </main>
  );
}
