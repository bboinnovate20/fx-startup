"use client";

import { useEffect, useState } from "react";
import type { ProviderInfo } from "../components/data/providers";
import { compareProviders, getHistory, getRate } from "./fx-api";

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
  available: boolean;
};

function platformLogo(id: string, logo: string | null | undefined, directoryLogo?: string) {
  if (logo?.startsWith("/api/")) return `/fx-api${logo}`;
  if (logo?.startsWith("platforms/")) {
    const platformId = logo.split("/")[1] || id;
    return `/fx-api/api/v1/platforms/${platformId}/logo`;
  }
  return logo || directoryLogo;
}

export type MarketStatus = "loading" | "ready" | "unavailable";

function parseAmount(amount: string) {
  const value = Number(amount.replaceAll(",", ""));
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return String(value);
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
) {
  const [rate, setRate] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [historySource, setHistorySource] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<PlatformRow[]>([]);
  const [bestId, setBestId] = useState<string | null>(null);
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const parsedAmount = parseAmount(amount);
      const range = period === "day" ? "1d" : "1w";
      void (async () => {
        const directory = await fetch("/data/providers.json", { signal: controller.signal })
          .then((response) => (response.ok ? (response.json() as Promise<ProviderInfo[]>) : []))
          .catch(() => [] as ProviderInfo[]);
        if (controller.signal.aborted) return;
        const logos = new Map(directory.map((item) => [item.id, item]));

        const [rateResult, historyResult, comparisonResult] = await Promise.allSettled([
          getRate(from, to, controller.signal),
          getHistory(from, to, range, controller.signal),
          compareProviders(from, to, parsedAmount, controller.signal),
        ]);
        if (controller.signal.aborted) return;

        if (rateResult.status === "fulfilled") {
          setRate(numberOrNull(rateResult.value.rate));
          setStatus("ready");
          setMessage(null);
        } else {
          setRate(null);
          setStatus("unavailable");
          setMessage(
            rateResult.reason instanceof Error
              ? rateResult.reason.message
              : "This pair is not available yet.",
          );
        }

        if (historyResult.status === "fulfilled" && historyResult.value.points.length >= 2) {
          setHistory(
            historyResult.value.points.map((point) => ({
              time: point.t,
              rate: Number(point.rate),
            })),
          );
          setHistorySource(historyResult.value.source.providerName);
        } else {
          setHistory(null);
          setHistorySource(null);
        }

        const rows = new Map<string, PlatformRow>();
        if (comparisonResult.status === "fulfilled") {
          for (const quote of comparisonResult.value.quotes) {
            const logo = logos.get(quote.providerId)?.logo;
            const payout = numberOrNull(quote.receiveAmount?.amount);
            const quoteRate = numberOrNull(quote.rate);
            rows.set(quote.providerId, {
              id: quote.providerId,
              name: quote.providerName,
              logo: platformLogo(quote.providerId, quote.logo, logo),
              mark: quote.providerName.slice(0, 1),
              rate: quoteRate,
              payout:
                payout ??
                (quoteRate != null && parsedAmount ? quoteRate * Number(parsedAmount) : null),
              speed: quote.speed,
              updatedAt: quote.lastUpdated ?? null,
              available: true,
            });
          }
          setBestId(comparisonResult.value.ranking?.bestProviderId ?? null);
        } else {
          setBestId(null);
        }

        for (const [id, row] of rows) {
          if (!row.logo) row.logo = logos.get(id)?.logo;
        }

        const ordered = [...rows.values()].sort((left, right) => {
          if (left.available !== right.available) return left.available ? -1 : 1;
          if (left.payout != null && right.payout != null) return right.payout - left.payout;
          return left.name.localeCompare(right.name);
        });
        setQuotes(ordered);
      })().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setStatus("unavailable");
          setMessage("The rate service is unavailable.");
        }
      });
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [amount, from, period, to]);

  return { rate, history, historySource, quotes, bestId, status, message };
}
