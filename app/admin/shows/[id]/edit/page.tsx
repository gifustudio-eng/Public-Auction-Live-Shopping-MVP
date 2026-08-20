import { AuctionHeader } from "@/components/auction-header";
import { CreateShowForm } from "@/components/create-show-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const wibFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function wibDateAndTime(value: string) {
  const parts = Object.fromEntries(
    wibFormatter
      .formatToParts(new Date(value))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export default async function EditShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/");

  const email = (authData.claims.email as string | undefined) ?? "";
  const [{ data: profile }, { data: show }] = await Promise.all([
    supabase
      .from("users")
      .select("email, full_name, shipping_address, role")
      .eq("id", authData.claims.sub)
      .maybeSingle(),
    supabase
      .from("shows")
      .select("id, title, status, scheduled_at, stream_playback_url, notes")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (profile?.role !== "admin") redirect("/?signedIn=true");
  if (!show) notFound();

  const scheduled = wibDateAndTime(show.scheduled_at);

  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader
        email={profile.email ?? email}
        name={profile.full_name ?? undefined}
        shippingAddress={profile.shipping_address ?? undefined}
      />
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <Link href="/admin/shows/edit" className="text-sm font-semibold text-[#d94719] hover:underline">
          ← Back to show management
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">
          Show CRUD · Edit
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Edit show
        </h1>
        <CreateShowForm
          show={{
            id: show.id,
            title: show.title,
            scheduledDate: scheduled.date,
            scheduledTime: scheduled.time,
            status: show.status as "draft" | "live" | "ended",
            streamPlaybackUrl: show.stream_playback_url,
            notes: show.notes,
          }}
        />
      </section>
    </main>
  );
}
