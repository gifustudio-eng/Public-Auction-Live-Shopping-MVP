import { AuctionHeader } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";

async function getViewer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return {};

  const userId = data.claims.sub;
  const email = (data.claims.email as string | undefined) ?? "";
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, shipping_address")
    .eq("id", userId)
    .maybeSingle();

  return {
    email: profile?.email ?? email,
    name: profile?.full_name ?? undefined,
    shippingAddress: profile?.shipping_address ?? undefined,
  };
}

export default async function ShowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();

  return (
    <>
      <AuctionHeader {...viewer} />
      {children}
    </>
  );
}
