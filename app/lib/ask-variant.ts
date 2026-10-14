export type AskVariant = "panels" | "text";

const storageKey = "fx-ask-variant";

export function askVariantFromParam(value: string | undefined): AskVariant | null {
  return value === "text" || value === "panels" ? value : null;
}

export function assignAskVariant(): AskVariant {
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved === "text" || saved === "panels") return saved;
  } catch {
    // Storage can be blocked; fall through to a one-off assignment.
  }
  const next: AskVariant = Math.random() < 0.5 ? "text" : "panels";
  try {
    sessionStorage.setItem(storageKey, next);
  } catch {
    // The query string still carries the assignment for this visit.
  }
  return next;
}

export function rememberAskVariant(variant: AskVariant) {
  try {
    sessionStorage.setItem(storageKey, variant);
  } catch {
    // The page still uses the variant from the URL.
  }
}
