"use client";

/**
 * Draws one A2UI surface. Load it with `next/dynamic({ ssr: false })`: it
 * imports the A2UI SDK, which cannot run during server rendering.
 *
 * `Text` renders Markdown only through a renderer the app supplies; this is
 * the SDK's own sanitizing `@a2ui/markdown-it`.
 */

import { renderMarkdown } from "@a2ui/markdown-it";
import { A2uiSurface, MarkdownContext } from "@a2ui/react";
import type { FxSurfaces } from "./surfaces";
import "./theme.css";

export default function SurfaceView({ store, id }: { store: FxSurfaces; id: string }) {
  const surface = store.get(id);
  if (!surface) return null;
  return (
    <MarkdownContext.Provider value={renderMarkdown}>
      <div className="fx-a2ui">
        <A2uiSurface surface={surface} />
      </div>
    </MarkdownContext.Provider>
  );
}
