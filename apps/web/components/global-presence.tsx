"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  LiveblocksProvider,
  RoomProvider,
  useUpdateMyPresence,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

function PresenceUpdater({ userEmail }: { userEmail: string }) {
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    updateMyPresence({ email: userEmail, isOnline: true });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updateMyPresence({ email: userEmail, isOnline: false });
      } else {
        updateMyPresence({ email: userEmail, isOnline: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      updateMyPresence({ email: userEmail, isOnline: false });
    };
  }, [updateMyPresence, userEmail]);

  return null;
}

export function GlobalPresence() {
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenantId;
  const userEmail = session?.user?.email;
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  if (!tenantId || !userEmail || !publicApiKey) return null;

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider
        id={`org-presence-${tenantId}`}
        initialPresence={{ email: userEmail, isOnline: true }}
      >
        <ClientSideSuspense fallback={null}>
          {() => <PresenceUpdater userEmail={userEmail} />}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
