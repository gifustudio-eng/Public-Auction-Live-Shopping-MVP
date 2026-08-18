import { AuctionHeader } from "@/components/auction-header";
import {
  AdminConsoleActions,
  type AdminShow,
} from "@/components/admin-console-actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/");

  const email = (data.claims.email as string | undefined) ?? "";
  const [{ data: profile }, { data: shows, error: showsError }] =
    await Promise.all([
      supabase
        .from("users")
        .select("email, full_name, shipping_address, role")
        .eq("id", data.claims.sub)
        .maybeSingle(),
      supabase
        .from("shows")
        .select("id, title, status, scheduled_at")
        .order("scheduled_at", { ascending: true }),
    ]);

  if (profile?.role !== "admin") redirect("/?signedIn=true");

  const adminName =
    profile.full_name?.trim() || profile.email || email || "Admin";

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader
        email={profile.email ?? email}
        name={profile.full_name ?? undefined}
        shippingAddress={profile.shipping_address ?? undefined}
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">
          Admin console
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Hello Admin {adminName}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/55">
          Create a show or select an available show before adding its next lot.
        </p>

        <AdminConsoleActions
          shows={(shows ?? []) as AdminShow[]}
          showsFailed={Boolean(showsError)}
        />
      </section>
    </main>
  );
}
