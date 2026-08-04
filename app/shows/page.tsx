import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function ShowsData() {
  const supabase = await createClient();
  const { data: shows } = await supabase.from("shows").select();

  return <pre>{JSON.stringify(shows, null, 2)}</pre>;
}

export default function Shows() {
  return (
    <Suspense fallback={<div>Loading shows...</div>}>
      <ShowsData />
    </Suspense>
  );
}