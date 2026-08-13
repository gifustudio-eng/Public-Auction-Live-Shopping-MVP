import { LoginForm } from "@/components/login-form";
import { AuctionHeader, Brand } from "@/components/auction-header";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Radio } from "lucide-react";
import Link from "next/link";

function LoginScreen() {
  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#f7f4ed] text-[#171712]">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-[#f15a29]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#f6c453]/20 blur-3xl" />

      <section className="relative hidden w-1/2 flex-col justify-between bg-[#191914] p-12 text-white lg:flex xl:p-16">
        <Brand />

        <div className="max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#f6c453]">
            Live shopping, reimagined
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
            Bid live. Find something remarkable.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/60">
            Join live auctions, discover one-of-a-kind pieces, and take home
            your next great find.
          </p>
        </div>

        <p className="text-sm text-white/35">Bid confidently. Shop securely.</p>
      </section>

      <section className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <LoginForm />
          <p className="mt-8 text-center text-xs leading-5 text-black/40">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}

function AppHome({
  email,
  name,
  shippingAddress,
}: {
  email: string;
  name?: string;
  shippingAddress?: string;
}) {
  return (
    <main className="min-h-svh bg-[#f7f4ed] text-[#171712]">
      <AuctionHeader
        email={email}
        name={name}
        shippingAddress={shippingAddress}
      />

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#f15a29]/10 px-4 py-2 text-sm font-semibold text-[#d94719]">
            <Radio className="size-4" /> Live auctions are happening now
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
            Your next great find is going once, going twice...
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/55">
            Explore live shows, bid in real time, and discover pieces worth
            talking about.
          </p>
          <ButtonLink />
        </div>
      </section>
    </main>
  );
}

function ButtonLink() {
  return (
    <Link
      href="/shows"
      className="mt-9 inline-flex h-12 items-center gap-2 rounded-xl bg-[#f15a29] px-6 font-semibold text-white transition-colors hover:bg-[#d94719]"
    >
      Browse live shows <ArrowRight className="size-4" />
    </Link>
  );
}

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ signedIn?: string }>;
}) {
  const { signedIn } = await searchParams;

  if (signedIn === "true") {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (data?.claims) {
      const userEmail = (data.claims.email as string | undefined) ?? "";
      const { data: profile } = await supabase
        .from("users")
        .select("email, full_name, shipping_address")
        .eq("email", userEmail)
        .maybeSingle();

      return (
        <AppHome
          email={profile?.email ?? userEmail}
          name={profile?.full_name ?? undefined}
          shippingAddress={profile?.shipping_address ?? undefined}
        />
      );
    }
  }

  return <LoginScreen />;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ signedIn?: string }>;
}) {
  return <HomeContent searchParams={searchParams} />;
}
