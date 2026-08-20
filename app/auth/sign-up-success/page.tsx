import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brand } from "@/components/auction-header";

export default function Page() {
  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#f7f4ed] p-6 text-[#171712] md:p-10">
      <div className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-[#f15a29]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-[#f6c453]/20 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-black/10 bg-white shadow-xl shadow-black/5">
            <CardHeader className="pb-5">
              <CardTitle className="text-3xl tracking-[-0.03em] text-[#f15a29]">
                Thank you for signing up!
              </CardTitle>
              <CardDescription className="text-base text-[#171712]/70">Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-[#171712]/70">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              <div className="mt-8 border-t border-black/10 pt-5 text-[#f15a29]">
                <Brand />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
