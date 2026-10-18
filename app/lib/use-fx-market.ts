"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProviderInfo } from "../components/data/providers";
import { compareProviders, getHistory, getRate, type FxComparison } from "./fx-api";

export type HistoryPoint = { time: string; rate: number };

export type PlatformRow = {
  id: string;
  name: string;
  logo?: string;
  mark: string;
  rate: number | null;
  payout: number | null;
  speed: string | null;
  updatedAt: string | null;
  website: string | null;
  available: boolean;
  chargesApplied?: boolean;
  pending?: boolean;
};

type UnitQuote = Omit<PlatformRow, "payout" | "pending"> & { ratePerUnit: number | null };

function typedAmount(amount: string) {
  const value = Number(amount.replaceAll(",", ""));
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value;
}

function platformLogo(id: string, logo: string | null | undefined, directoryLogo?: string) {
  if (logo?.startsWith("/api/")) return `/fx-api${logo}`;
  if (logo?.startsWith("platforms/")) {
    const platformId = logo.split("/")[1] || id;
    return `/fx-api/api/v1/platforms/${platformId}/logo`;
  }
  return logo || directoryLogo;
}

export type MarketStatus = "loading" | "ready" | "unavailable";

function unitQuotesFromComparison(
  comparison: FxComparison,
  logos: Map<string, ProviderInfo>,
): UnitQuote[] {
  const rows = new Map<string, UnitQuote>();
  for (const quote of comparison.quotes) {
    const logo = logos.get(quote.providerId)?.logo;
    const received = numberOrNull(quote.receiveAmount?.amount);
    const quoteRate = numberOrNull(quote.rate);
    const fee = numberOrNull(quote.fee?.amount);
    const chargesApplied =
      (fee != null && fee > 0) ||
      (received != null && quoteRate != null && received > 0 && received + 0.005 < quoteRate);
    rows.set(quote.providerId, {
      id: quote.providerId,
      name: quote.providerName,
      logo: platformLogo(quote.providerId, quote.logo, logo),
      mark: quote.providerName.slice(0, 1),
      rate: quoteRate,
      ratePerUnit: quoteRate,
      chargesApplied,
      speed: quote.speed,
      updatedAt: quote.lastUpdated ?? quote.retrievedAt ?? null,
      website: quote.website ?? logos.get(quote.providerId)?.url ?? null,
      available: true,
    });
  }
  for (const [id, row] of rows) {
    if (!row.logo) row.logo = logos.get(id)?.logo;
  }
  return [...rows.values()];
}

async function providerLogos(signal?: AbortSignal) {
  const directory = await fetch("/data/providers.json", { signal })
    .then((response) => (response.ok ? (response.json() as Promise<ProviderInfo[]>) : []))
    .catch(() => [] as ProviderInfo[]);
  return new Map(directory.map((item) => [item.id, item]));
}

function numberOrNull(value: string | null | undefined) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useFxMarket(
  from: string,
  to: string,
  amount: string,
  period: "day" | "week",
  compareLimit?: number,
) {
  const [rate, setRate] = useState<number | null>(null);
  const [ratePair, setRatePair] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [historyKey, setHistoryKey] = useState<string | null>(null);
  const [historySource, setHistorySource] = useState<string | null>(null);
  const [unitQuotes, setUnitQuotes] = useState<UnitQuote[]>([]);
  const [quotePair, setQuotePair] = useState<string | null>(null);
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [comparisonExpanded, setComparisonExpanded] = useState(false);
  const [expandingComparison, setExpandingComparison] = useState(false);
  const expandAbort = useRef<AbortController | null>(null);
  const pair = `${from}:${to}`;

  useEffect(() => {
    const controller = new AbortController();
    expandAbort.current?.abort();
    setStatus("loading");
    setRate(null);
    setRatePair(null);
    setUnitQuotes([]);
    setQuotePair(null);
    setMessage(null);
    setComparisonExpanded(false);
    setExpandingComparison(false);

    void (async () => {
      const logos = await providerLogos(controller.signal);
      if (controller.signal.aborted) return;

      const [rateResult, comparisonResult] = await Promise.allSettled([
        getRate(from, to, controller.signal),
        compareProviders(from, to, "1", controller.signal, compareLimit),
      ]);
      if (controller.signal.aborted) return;

      if (rateResult.status === "fulfilled") {
        setRate(numberOrNull(rateResult.value.rate));
        setRatePair(`${from}:${to}`);
        setStatus("ready");
        setMessage(null);
      } else {
        setRate(null);
        setRatePair(`${from}:${to}`);
        setStatus("unavailable");
        setMessage(
          rateResult.reason instanceof Error
            ? rateResult.reason.message
            : "This pair is not available yet.",
        );
      }

      if (comparisonResult.status === "fulfilled") {
        setUnitQuotes(unitQuotesFromComparison(comparisonResult.value, logos));
      }
      setQuotePair(`${from}:${to}`);
    })().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setRatePair(`${from}:${to}`);
        setQuotePair(`${from}:${to}`);
        setStatus("unavailable");
        setMessage("The rate service is unavailable.");
      }
    });

    return () => controller.abort();
  }, [compareLimit, from, to]);

  const expandComparison = useCallback(() => {
    if (compareLimit == null || comparisonExpanded || expandingComparison) return;
    const controller = new AbortController();
    expandAbort.current?.abort();
    expandAbort.current = controller;
    setExpandingComparison(true);
    void (async () => {
      const logos = await providerLogos(controller.signal);
      const comparison = await compareProviders(from, to, "1", controller.signal);
      if (controller.signal.aborted) return;
      setUnitQuotes(unitQuotesFromComparison(comparison, logos));
      setQuotePair(`${from}:${to}`);
      setComparisonExpanded(true);
    })()
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      })
      .finally(() => {
        if (!controller.signal.aborted) setExpandingComparison(false);
      });
  }, [compareLimit, comparisonExpanded, expandingComparison, from, to]);

  useEffect(() => {
    const controller = new AbortController();
    const range = period === "day" ? "1d" : "1w";
    const key = `${from}:${to}:${period}`;
    setHistory(null);
    setHistorySource(null);
    setHistoryKey(null);

    void getHistory(from, to, range, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.points.length >= 2) {
          setHistory(
            result.points.map((point) => ({
              time: point.t,
              rate: Number(point.rate),
            })),
          );
          setHistorySource(result.source.providerName);
        } else {
          setHistory(null);
          setHistorySource(null);
        }
        setHistoryKey(key);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setHistory(null);
          setHistorySource(null);
          setHistoryKey(key);
        }
      });

    return () => controller.abort();
  }, [from, to, period]);

  const { quotes, bestId } = useMemo(() => {
    const scale = typedAmount(amount);
    const ordered = unitQuotes
      .map((quote) => ({
        id: quote.id,
        name: quote.name,
        logo: quote.logo,
        mark: quote.mark,
        rate: quote.rate,
        payout: quote.ratePerUnit == null ? null : quote.ratePerUnit * scale,
        chargesApplied: quote.chargesApplied,
        speed: quote.speed,
        updatedAt: quote.updatedAt,
        website: quote.website,
        available: quote.available,
      }))
      .sort((left, right) => {
        if (left.available !== right.available) return left.available ? -1 : 1;
        if (left.payout != null && right.payout != null) return right.payout - left.payout;
        return left.name.localeCompare(right.name);
      });
    const best = ordered.find((row) => row.available && row.payout != null);
    return { quotes: ordered, bestId: best?.id ?? null };
  }, [amount, unitQuotes]);

  const pairReady = ratePair === pair && quotePair === pair;
  const historyReady = historyKey === `${pair}:${period}`;
  const historyStatus: MarketStatus = !historyReady
    ? "loading"
    : history && history.length >= 2
      ? "ready"
      : "unavailable";

  return {
    rate: ratePair === pair ? rate : null,
    history: historyReady ? history : null,
    historySource: historyReady ? historySource : null,
    historyStatus,
    quotes: quotePair === pair ? quotes : [],
    bestId: quotePair === pair ? bestId : null,
    status: pairReady ? status : "loading",
    message: pairReady ? message : null,
    comparisonExpanded,
    expandingComparison,
    expandComparison,
  };
}
