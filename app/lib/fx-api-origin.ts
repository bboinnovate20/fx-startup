/** Origin of the FX backend. Used only on the Next.js server. */
export function fxApiOrigin() {
  return (process.env.FX_API_URL ?? "https://fx-backend.imusa229.workers.dev")
    .replace(/\/+$/, "")
    .replace(/\/api(?:\/v1)?$/, "");
}
