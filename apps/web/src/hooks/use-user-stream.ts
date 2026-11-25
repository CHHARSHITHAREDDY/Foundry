"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useUserStream(enabled: boolean) {
  const queryClient = useQueryClient();
  const lastEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let es: EventSource | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      const base = api.getUserStreamUrl();
      const url = lastEventIdRef.current
        ? `${base}?lastEventId=${encodeURIComponent(lastEventIdRef.current)}`
        : base;

      es = new EventSource(url, { withCredentials: true });

      es.addEventListener("connected", (evt: MessageEvent) => {
        if (evt.lastEventId) lastEventIdRef.current = evt.lastEventId;
        queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      const refreshAll = (evt: MessageEvent) => {
        if (evt.lastEventId) lastEventIdRef.current = evt.lastEventId;
        queryClient.invalidateQueries({ queryKey: ["billing", "credits"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      };

      es.addEventListener("credits:updated", refreshAll);
      es.addEventListener("notification:new", refreshAll);
      es.addEventListener("stage:change", refreshAll);

      es.onerror = () => {
        es?.close();
        if (!closed) {
          setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      es?.close();
    };
  }, [enabled, queryClient]);
}
