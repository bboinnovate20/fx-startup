"use client";

/**
 * The A2UI store for FX Ask: catalog plus one `MessageProcessor`.
 *
 * Browser only. `@a2ui/web_core` defines Lit elements, which touch
 * `HTMLElement` on import, so this module must never load during server
 * rendering: `use-surfaces.ts` imports it lazily in an effect, and
 * `surface-view.tsx` is loaded with `next/dynamic({ ssr: false })`.
 *
 * The catalog document is `fx-catalog.json`, the contract the backend emits
 * against (`app.agent.a2ui.CATALOG_ID`). Basic components and functions are
 * the SDK's own; `RateChart` and `ProviderLogo` are ours, bound by the SDK's generic binder.
 */

import { createComponentImplementation, type ReactCatalogComponent } from "@a2ui/react";
import { basicCatalog } from "@a2ui/web_core/catalogs/basic/v1";
import {
  Catalog,
  MessageProcessor,
  type CatalogApi,
  type ComponentApi,
  type FunctionApi,
  type FunctionImplementation,
  type SurfaceModel,
} from "@a2ui/web_core/v1_0";
import type { FC } from "react";
import catalogDocument from "./fx-catalog.json";
import { ProviderLogo } from "./provider-logo";
import { RateChart } from "./rate-chart";
import type { SurfacePress } from "./use-surfaces";

type View = FC<{ props: Record<string, unknown> }>;

/** The FX components; every non-basic component in `fx-catalog.json` must be here. */
const FX_VIEWS: Record<string, View> = { RateChart, ProviderLogo };

function fxCatalog() {
  const schemas: CatalogApi = Catalog.fromJson(catalogDocument);
  const components = [...schemas.components.entries()].map(([name, api]) => {
    const fromSdk = basicCatalog.components.get(name);
    if (fromSdk) return fromSdk as ReactCatalogComponent;
    const view = FX_VIEWS[name];
    if (!view) throw new Error(`The FX catalog offers ${name}, and nothing here draws it.`);
    return createComponentImplementation(api, view);
  });
  const functions = [...schemas.functions.entries()].map(([name]) => {
    const fromSdk = basicCatalog.functions.get(name);
    if (!fromSdk) throw new Error(`The FX catalog offers ${name}(), and nothing here evaluates it.`);
    return fromSdk;
  });
  return (schemas as Catalog<ComponentApi, FunctionApi>).withEntries(
    components,
    functions,
  ) as unknown as Catalog<ReactCatalogComponent, FunctionImplementation>;
}

export class FxSurfaces {
  readonly processor: MessageProcessor<ReactCatalogComponent>;
  private listeners = new Set<() => void>();
  private pressListener: ((press: SurfacePress) => void) | null = null;
  private version = 0;

  constructor() {
    this.processor = new MessageProcessor<ReactCatalogComponent>(
      [fxCatalog()],
      (press) => this.pressListener?.(press),
      { errorHandler: (error) => console.warn("[a2ui] rejected a message:", error.error.message) },
    );
    this.processor.onSurfaceCreated(() => this.bump());
    this.processor.onSurfaceDeleted(() => this.bump());
  }

  /** Applies a batch one message at a time; a surface that already exists is kept. */
  apply(messages: unknown[] | undefined): void {
    let applied = false;
    for (const message of messages ?? []) {
      const created = (message as { createSurface?: { surfaceId?: string } }).createSurface;
      if (created?.surfaceId && this.get(created.surfaceId)) continue;
      for (const error of this.processor.processMessagesWithErrors([message])) {
        console.warn("[a2ui] rejected a message:", error.error.message);
      }
      applied = true;
    }
    if (applied) this.bump();
  }

  get(id: string): SurfaceModel<ReactCatalogComponent> | undefined {
    return this.processor.getSurface(id);
  }

  onPress(listener: ((press: SurfacePress) => void) | null): void {
    this.pressListener = listener;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getVersion = (): number => this.version;

  private bump(): void {
    this.version += 1;
    for (const listener of this.listeners) listener();
  }
}
