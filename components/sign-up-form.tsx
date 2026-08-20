"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/auth/verification-success`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative border-black/10 bg-white shadow-xl shadow-black/5">
        <CardHeader className="pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d94719]">
            Join the auction
          </p>
          <CardTitle className="pt-1 text-3xl tracking-[-0.03em] text-[#f15a29]">Create your account</CardTitle>
          <CardDescription className="pt-1 text-black/55">Save your details and start discovering live auctions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2.5">
                <Label htmlFor="email" className="text-[#171712]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-black/15 bg-[#f7f4ed] text-[#171712] placeholder:text-black/45 focus-visible:border-[#f15a29] focus-visible:ring-[#f15a29]/25"
                />
              </div>
              <div className="grid gap-2.5">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-[#171712]">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-black/15 bg-[#f7f4ed] text-[#171712] placeholder:text-black/45 focus-visible:border-[#f15a29] focus-visible:ring-[#f15a29]/25"
                />
              </div>
              <div className="grid gap-2.5">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password" className="text-[#171712]">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-11 rounded-xl border-black/15 bg-[#f7f4ed] text-[#171712] placeholder:text-black/45 focus-visible:border-[#f15a29] focus-visible:ring-[#f15a29]/25"
                />
              </div>
              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <Button type="submit" className="h-12 w-full rounded-xl bg-[#f15a29] text-base text-white shadow-none hover:bg-[#d94719]" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-black/55">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-[#d94719] hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
