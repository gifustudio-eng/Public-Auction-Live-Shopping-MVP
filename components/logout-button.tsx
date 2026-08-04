"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      onClick={logout}
      variant="outline"
      className="rounded-full border-black/15 bg-transparent px-5 shadow-none hover:bg-black hover:text-white"
    >
      Log out
    </Button>
  );
}
