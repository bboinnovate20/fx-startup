import type { Currency } from "./data/fx-data";
import type { HistoryPoint } from "../lib/use-fx-market";
import { CurrencyPicker } from "./currency-picker";
import { ArrowIcon } from "./ui/ArrowIcon";
import { RateHistoryChart } from "./ui/rate-history-chart";
import type { RateHistoryPeriod } from "./ui/rate-history-chart";

export function TrendSection({ from, to, setFrom, setTo, rate, history = null, historySource = null, historyStatus = history == null ? "unavailable" : "ready", historyPeriod, setHistoryPeriod, compact = false }: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  rate: number | null;
  history?: HistoryPoint[] | null;
  historySource?: string | null;
  historyStatus?: "loading" | "ready" | "unavailable";
  historyPeriod?: RateHistoryPeriod;
  setHistoryPeriod?: (period: RateHistoryPeriod) => void;
  compact?: boolean;
}) {
  const pairPicker = (
    <div className="relative flex w-full max-w-[440px] items-center gap-2 [&_.currency-picker]:min-w-0 [&_.currency-picker]:flex-1 [&_.currency-picker]:bg-[#f1f3f6] [&_.currency-picker]:text-[#64748b]">
      <CurrencyPicker value={from} label="Rate history source currency" onChange={setFrom} variant="pair" anchor="row" />
      <ArrowIcon className="h-3 w-3 shrink-0 text-[#9aa5b4]" />
      <CurrencyPicker value={to} label="Rate history target currency" onChange={setTo} variant="pair" anchor="row" />
    </div>
  );

  return (
    <div id="trend" className="mb-[53px] scroll-mt-24 max-[700px]:mb-[38px]">
      {historyStatus !== "ready" || history == null || history.length < 2 || rate === null ? (
        <section className="mx-auto max-w-[1020px] rounded-[12px] border border-[var(--line)] bg-white p-6 max-[700px]:p-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="m-0 text-[22px] text-[#171a18]">Rate history</h2>
            {pairPicker}
          </div>
          {historyStatus === "loading" ? (
            <div className="skeleton-shimmer mt-5 h-[180px] w-full rounded-[12px]" aria-busy="true" aria-label="Loading rate history" />
          ) : (
            <p className="mb-0 mt-5 text-[13px] leading-5 text-[#718096]">Not available</p>
          )}
        </section>
      ) : (
        <RateHistoryChart
          from={from}
          to={to}
          setFrom={setFrom}
          setTo={setTo}
          rate={rate}
          points={history}
          sourceName={historySource}
          periodValue={historyPeriod}
          onPeriodChange={setHistoryPeriod}
          compact={compact}
        />
      )}
    </div>
  );
}
