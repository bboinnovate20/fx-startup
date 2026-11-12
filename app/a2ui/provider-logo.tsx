"use client";

/**
 * `ProviderLogo`: a provider's logo in an A2UI provider row. The backend only
 * names the provider; the URL is resolved here with the same rules the rest
 * of the site uses (`platformLogo`: the `/fx-api` proxy, then the static
 * directory), and the provider's initial stands in when there is no image or
 * it fails to load.
 */

import { useState } from "react";
import type { ProviderInfo } from "../components/data/providers";
import { platformLogo } from "../lib/use-fx-market";
import directory from "../../public/data/providers.json";

const byId = new Map((directory as ProviderInfo[]).map((item) => [item.id, item]));

export function ProviderLogo({ props }: { props: Record<string, unknown> }) {
  const id = typeof props.providerId === "string" ? props.providerId : "";
  const name = typeof props.name === "string" ? props.name : id;
  const logo = typeof props.logo === "string" ? props.logo : null;
  const src = platformLogo(id, logo, byId.get(id)?.logo);
  const [failed, setFailed] = useState(false);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#eeedf4] bg-white">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote and proxied logos of unknown size
        <img src={src} alt={`${name} logo`} className="h-7 w-7 object-contain" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true" className="text-[14px] font-semibold text-primary">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}
