import { useEffect, useState } from "react";
import type { MarketStatus } from "../lib/use-fx-market";
import { CurrencyPicker } from "./currency-picker";
import { number, type Currency } from "./data/fx-data";
import { FxAsk } from "./fx-ask";
import { RateAlertDialog } from "./rate-alert-dialog";

function plainAmount(value: number) {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

function groupedAmount(value: string) {
  const parsed = Number(value.replaceAll(",", ""));
  if (!value.trim() || !Number.isFinite(parsed)) return value;
  return parsed.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function Converter({
  from,
  to,
  setFrom,
  setTo,
  amount,
  setAmount,
  rate,
  status = "ready",
  showAsk = true,
  compact = false,
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  amount: string;
  setAmount: (value: string) => void;
  rate: number | null;
  status?: MarketStatus;
  showAsk?: boolean;
  compact?: boolean;
}) {
  const loading = status === "loading";
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const receive = rate === null ? null : (Number(amount.replaceAll(",", "")) || 0) * rate;

  useEffect(() => {
    if (!editingTarget) {
      setTargetDraft(receive === null ? "" : number(receive, 2));
    }
  }, [editingTarget, receive]);

  function commitAmount(raw: string) {
    const parsed = Number(raw.replaceAll(",", ""));
    if (!raw.trim() || !Number.isFinite(parsed)) return;
    setAmount(plainAmount(parsed));
  }

  function swapCurrencies() {
    const parsed = Number(targetDraft.replaceAll(",", ""));
    if (rate !== null && targetDraft.trim() && Number.isFinite(parsed)) {
      setAmount(plainAmount(parsed));
    }
    setEditingTarget(false);
    setFrom(to);
    setTo(from);
  }

  return (
    <section
      className={compact
        ? "w-full rounded-full border border-[#e4e1ef] bg-white p-4 text-left font-display"
        : "mx-auto w-full max-w-[540px] rounded-[20px] border border-[#e6e9e4] bg-white px-3.5 pb-4 pt-4 text-left font-display shadow-[0_12px_30px_#12220d38] sm:rounded-[23px] sm:px-[23px] sm:pb-6 sm:pt-6"}
      id="converter"
      aria-labelledby="converter-title"
    >
      {/* <h2 id="converter-title" className="sr-only">Currency converter</h2> */}
      <div className={compact ? "mb-3 text-center" : "mb-3.5 text-center sm:mb-5"}>
        <p className="m-0 flex items-center justify-center gap-1.5 text-[13px] font-semibold">
          Market Exchange Rate
        </p>
        {loading ? (
          <div
            className={`skeleton-shimmer mx-auto ${compact ? "mt-2 min-h-9 w-[200px]" : "mt-2 min-h-10 w-[216px] sm:mt-2.5 sm:min-h-[45px] sm:w-[252px]"} rounded-full`}
            aria-busy="true"
            aria-label="Loading exchange rate"
          />
        ) : (
          <a
            href="#trend"
            className={`mx-auto inline-flex ${compact ? "mt-2 min-h-9 text-[14px]" : "mt-2 min-h-10 text-[13px] sm:mt-2.5 sm:min-h-[45px] sm:text-[15px]"} max-w-full items-center gap-2 rounded-full bg-[#eef0ec] px-3.5 font-semibold tracking-[-0.02em] text-[#171a18] transition-colors hover:bg-[#e4e8e1] sm:px-5`}
            aria-label={`${rate === null ? `Exchange rate unavailable for ${from} to ${to}` : `1 ${from} equals ${number(rate, 4)} ${to}`}. View rate history`}
          >
            <span className="whitespace-nowrap">1 {from} = {rate === null ? "—" : number(rate, 4)} {to}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ml-1 h-4 w-4 shrink-0 text-[#171a18]">
              <path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      <label htmlFor="send-amount" className="mb-1 block text-[11px] font-medium text-[#343b33]">Amount</label>
      {loading ? (
        <div
          className={`skeleton-shimmer w-full rounded-full ${compact ? "min-h-12" : "min-h-[47px] sm:min-h-[58px]"}`}
          aria-busy="true"
          aria-label="Loading amount"
        />
      ) : (
        <div className={`relative flex items-center rounded-full border border-[#c5c9c4] py-1.5 pl-3 pr-1.5 focus-within:border-2 focus-within:border-navy sm:px-3 sm:py-0 ${compact ? "min-h-12" : "min-h-[47px] sm:min-h-[58px]"}`}>
          <input
            id="send-amount"
            inputMode="decimal"
            placeholder="Enter Amount"
            value={editingAmount ? amount : groupedAmount(amount)}
            onFocus={() => setEditingAmount(true)}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
            onBlur={() => {
              setEditingAmount(false);
              commitAmount(amount);
            }}
            aria-label={`Amount in ${from}`}
            className={`min-w-0 grow flex-1 border-0 bg-transparent p-0 font-display font-bold text-[#202421] outline-none ${compact ? "text-[18px]" : "text-[18px] sm:text-[22px]"}`}
          />
          <CurrencyPicker value={from} label="Source currency" onChange={setFrom} variant="hero" align="right" anchor="row" />
        </div>
      )}

      <div className={`relative z-[1] flex items-center ${compact ? "h-10" : "h-10 sm:h-[47px]"} justify-center`} aria-label="Swap source and target currencies">
        <button
          type="button"
          aria-label="Swap currencies"
          onClick={swapCurrencies}
          disabled={loading}
          className={`grid place-items-center rounded-full ${compact ? "h-9 w-9" : "h-9 w-9 sm:h-10 sm:w-10"} border-0 bg-transparent transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50`}
        >
          <span
            aria-hidden="true"
            className="block h-3.5 w-4 bg-primary"
            style={{
              mask: "url(/icons/switch.svg) center / contain no-repeat",
              WebkitMask: "url(/icons/switch.svg) center / contain no-repeat",
            }}
          />
        </button>
      </div>

      <label htmlFor="receive-amount" className="mb-1 block text-[11px] font-medium text-[#343b33]">Converted to</label>
      {loading ? (
        <div
          className={`skeleton-shimmer w-full rounded-full ${compact ? "min-h-12" : "min-h-[47px] sm:min-h-[58px]"}`}
          aria-busy="true"
          aria-label="Loading converted amount"
        />
      ) : (
        <div className={`relative flex items-center gap-2 rounded-full border border-[#c5c9c4] py-1.5 pl-3 pr-1.5 focus-within:border-2 focus-within:border-navy sm:px-3 sm:py-0 ${compact ? "min-h-12" : "min-h-[47px] sm:min-h-[58px]"}`}>
          <div className="relative min-w-0 flex-1 self-stretch">
            <input
              id="receive-amount"
              inputMode="decimal"
              value={targetDraft}
              disabled={rate === null}
              onFocus={() => setEditingTarget(true)}
              onBlur={() => setEditingTarget(false)}
              onChange={(event) => {
                const next = event.target.value.replace(/[^\d.,]/g, "");
                setTargetDraft(next);
                if (!next) setAmount("");
                else if (rate !== null && rate > 0) {
                  const parsed = Number(next.replaceAll(",", ""));
                  if (Number.isFinite(parsed)) setAmount(plainAmount(parsed / rate));
                }
              }}
              aria-label={`Converted amount in ${to}`}
              className={`h-full w-full min-w-0 border-0 bg-transparent p-0 font-display font-bold text-[#202421] outline-none disabled:cursor-not-allowed disabled:text-[#818980] ${compact ? "text-[18px]" : "text-[18px] sm:text-[22px]"}`}
            />
          </div>
          <CurrencyPicker value={to} label="Target currency" onChange={setTo} variant="hero" align="right" anchor="row" />
        </div>
      )}

      {!compact && (loading ? (
        <div
          className="skeleton-shimmer mt-2.5 h-[calc(43px+6px+36px)] w-full rounded-[20px] sm:h-[calc(47px+6px+39px)]"
          aria-busy="true"
          aria-label="Loading actions"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-2.5 h-[43px] w-full rounded-full border-0 bg-primary text-[13px] font-semibold text-white transition hover:bg-primary-hover sm:h-[47px] sm:text-[14px]"
          >
            Compare providers
          </button>
          <button
            type="button"
            onClick={() => setAlertOpen(true)}
            className="mt-1.5 flex h-9 w-full items-center justify-center rounded-full border border-gray-300 bg-white text-[12px] font-semibold text-black transition hover:bg-[#f5faf2] sm:h-[39px]"
          >
            Track exchange rate
          </button>
        </>
      ))}
      {!compact && (
        <RateAlertDialog
          open={alertOpen}
          onClose={() => setAlertOpen(false)}
          from={from}
          to={to}
          setFrom={setFrom}
          setTo={setTo}
        />
      )}
      {showAsk && !loading && <FxAsk from={from} to={to} amount={amount} />}
      {!loading && (
        <p className={`mb-0 text-center font-medium text-[#5c6560] ${compact ? "mt-2 text-[11px]" : "mt-2.5 text-[12px]"}`}>
          Normal exchange rate. Extra charges applied.
        </p>
      )}
    </section>
  );
}
