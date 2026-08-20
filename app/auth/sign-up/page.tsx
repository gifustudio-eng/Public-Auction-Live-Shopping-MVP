import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#f7f4ed] p-6 text-[#171712] md:p-10">
      <div className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-[#f15a29]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-[#f6c453]/20 blur-3xl" />
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </main>
  );
}
