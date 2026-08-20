"use client";

import { Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AudiencePresence = { userId: string; isAdmin: boolean };

function audienceSize(state: Record<string, AudiencePresence[]>) {
  const audience = new Set<string>();

  Object.values(state).flat().forEach((presence) => {
    if (!presence.isAdmin) audience.add(presence.userId);
  });

  return audience.size;
}

export function ShowAudienceCount({
  isAdmin,
  showId,
  userId,
}: {
  isAdmin: boolean;
  showId: string;
  userId: string | null;
}) {
  const [count, setCount] = useState(0);
  const guestId = useRef(`guest-${crypto.randomUUID()}`);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`show-audience:${showId}`, {
      config: { presence: { key: userId ?? guestId.current } },
    });
    const updateCount = () => setCount(audienceSize(channel.presenceState<AudiencePresence>()));

    channel
      .on("presence", { event: "sync" }, updateCount)
      .on("presence", { event: "join" }, updateCount)
      .on("presence", { event: "leave" }, updateCount)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ userId: userId ?? guestId.current, isAdmin }).then(updateCount);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAdmin, showId, userId]);

  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f15a29]/10 px-3 py-2 text-xs font-semibold text-[#d94719]">
      <Users className="size-4" aria-hidden="true" />
      {count} {count === 1 ? "viewer" : "viewers"}
    </span>
  );
}
