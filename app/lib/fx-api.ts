/** Client for the FX backend. Requests go through the Next.js `/fx-api` rewrite. */

export type FxPair = { from: string; to: string };

export type FxRate = {
  pair: FxPair;
  rate: string;
  change24h: string | null;
  source: {
    providerId: string;
    providerName: string;
    freshness: "fresh" | "stale";
  };
};

export type FxHistory = {
  pair: FxPair;
  range: "1d" | "1w";
  points: { t: string; rate: string }[];
  changePercent: string | null;
  source: { providerId: string; providerName: string };
};

export type FxMoney = { amount: string; currency: string } | null;

export type FxQuote = {
  providerId: string;
  providerName: string;
  rateType: "indicative" | "executable_quote";
  rate: string;
  fee: FxMoney;
  receiveAmount: FxMoney;
  speed: string | null;
  freshness: "fresh" | "stale";
  logo?: string | null;
  lastUpdated?: string | null;
};

export type FxComparison = {
  pair: FxPair;
  amount: string | null;
  quotes: FxQuote[];
  unavailable: { providerId: string; providerName: string; reason: string }[];
  ranking: { basis: "receive_amount" | "rate"; bestProviderId: string } | null;
};

export type FxAskResponse = {
  response: { text: string };
  view: {
    pair: FxPair;
    amount: string | null;
    range: "1d" | "1w";
    focus: "rate" | "converter" | "chart" | "providers" | "alert";
  } | null;
};

type AskMessage = { role: "user" | "assistant"; content: string };

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | T
    | null;
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? body.error?.message
        : undefined;
    throw new Error(message || "The rate service is unavailable.");
  }
  return body as T;
}

function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}

export function getRate(from: string, to: string, signal?: AbortSignal) {
  return fetch(`/fx-api/api/v1/rates?${query({ from, to })}`, { signal }).then((response) =>
    readJson<FxRate>(response),
  );
}

export function getHistory(
  from: string,
  to: string,
  range: "1d" | "1w",
  signal?: AbortSignal,
) {
  return fetch(`/fx-api/api/v1/rates/history?${query({ from, to, range })}`, { signal }).then(
    (response) => readJson<FxHistory>(response),
  );
}

export function compareProviders(
  from: string,
  to: string,
  amount: string | undefined,
  signal?: AbortSignal,
) {
  return fetch(`/fx-api/api/v1/rates/compare?${query({ from, to, amount })}`, { signal }).then(
    (response) => readJson<FxComparison>(response),
  );
}

export function askFx(
  input: {
    messages: AskMessage[];
    pair: FxPair;
    amount?: string;
    range: "1d" | "1w";
  },
  signal?: AbortSignal,
) {
  return fetch("/fx-api/api/ask", {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      messages: input.messages,
      context: {
        pair: input.pair,
        amount: input.amount,
        range: input.range,
      },
    }),
  }).then((response) => readJson<FxAskResponse>(response));
}
