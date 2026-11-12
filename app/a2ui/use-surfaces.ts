"use client";

/**
 * Safe to import anywhere, including code that renders on the server: the
 * A2UI SDK is loaded lazily, in the browser, by `useFxSurfaces`.
 */

import type { ActionPayload } from "@a2ui/web_core/v1_0";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { FxSurfaces } from "./surfaces";

/** A press on a card, as the SDK reports it: `{name, context, surfaceId, ...}`. */
export type SurfacePress = ActionPayload;
export type { FxSurfaces };

const noStore = () => () => {};

/** One store per chat, or `null` until the SDK has loaded in the browser. */
export function useFxSurfaces(): FxSurfaces | null {
  const [store, setStore] = useState<FxSurfaces | null>(null);
  useEffect(() => {
    let live = true;
    void import("./surfaces").then(({ FxSurfaces }) => {
      if (live) setStore(new FxSurfaces());
    });
    return () => {
      live = false;
    };
  }, []);
  useSyncExternalStore(store?.subscribe ?? noStore, () => store?.getVersion() ?? 0, () => 0);
  return store;
}

/** The surface a turn's A2UI batch creates, if any. */
export function surfaceIdOf(messages: unknown[] | undefined): string | undefined {
  for (const message of messages ?? []) {
    const id = (message as { createSurface?: { surfaceId?: string } }).createSurface?.surfaceId;
    if (id) return id;
  }
  return undefined;
}
