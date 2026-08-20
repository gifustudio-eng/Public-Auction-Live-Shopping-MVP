import { Brand } from "@/components/auction-header";
import { Check } from "lucide-react";
import Link from "next/link";

export default function VerificationSuccessPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f7f4ed] px-6 py-12 text-[#171712]">
      <div className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-[#f15a29]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-[#f6c453]/20 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl shadow-black/5 sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f15a29] text-white">
          <Check className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em] text-[#f15a29]">
          Verification Successful
        </h1>
        <p className="mt-3 leading-7 text-black/55">
          Your email is confirmed. You can now sign in and join the auction.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#f15a29] px-6 font-semibold text-white transition hover:bg-[#d94719]"
        >
          Back to login
        </Link>
        <div className="mt-10 border-t border-black/10 pt-6 text-left">
          <Brand />
        </div>
      </section>
    </main>
  );
}
