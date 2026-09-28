import { useEffect, useState } from "react";
import { CurrencyPicker } from "./currency-picker";
import { currencies, number, type Currency } from "./data/fx-data";
import { FxAsk } from "./fx-ask";

export function Converter({
  from,
  to,
  setFrom,
  setTo,
  amount,
  setAmount,
  rate,
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
  showAsk?: boolean;
  compact?: boolean;
}) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState("");
  const receive = rate === null ? null : (Number(amount.replaceAll(",", "")) || 0) * rate;

  useEffect(() => {
    if (!editingTarget) {
      setTargetDraft(receive === null ? "" : number(receive, currencies[to].digits));
    }
  }, [editingTarget, receive, to]);

  function swapCurrencies() {
    const nextAmount = targetDraft.replaceAll(",", "");
    if (rate !== null && nextAmount) setAmount(nextAmount);
    setEditingTarget(false);
    setFrom(to);
    setTo(from);
  }

  return (
    <section
      className={compact
        ? "w-full rounded-full border border-[#e4e1ef] bg-white p-4 text-left font-display"
        : "mx-auto w-full max-w-[600px] rounded-[22px] border border-[#e6e9e4] bg-white px-4 pb-5 pt-5 text-left font-display shadow-[0_12px_30px_#12220d38] sm:rounded-[26px] sm:px-[26px] sm:pb-7 sm:pt-7"}
      id="converter"
      aria-labelledby="converter-title"
    >
      {/* <h2 id="converter-title" className="sr-only">Currency converter</h2> */}
      <div className={compact ? "mb-3 text-center" : "mb-4 text-center sm:mb-6"}>
        <p className="m-0 flex items-center justify-center gap-1.5 text-[14px] font-semibold">
          Market Exchange Rate
        </p>
        <a
          href="#trend"
          className={`mx-auto inline-flex ${compact ? "mt-2 min-h-9 text-[14px]" : "mt-2.5 min-h-[44px] text-[14px] sm:mt-3 sm:min-h-[50px] sm:text-[16px]"} max-w-full items-center gap-2.5 rounded-full bg-[#eef0ec] px-4 font-semibold tracking-[-0.02em] text-[#171a18] transition-colors hover:bg-[#e4e8e1] sm:px-6`}
          aria-label={`${rate === null ? `Exchange rate unavailable for ${from} to ${to}` : `1 ${from} equals ${number(rate, 4)} ${to}`}. View rate history`}
        >
          <span className="whitespace-nowrap">1 {from} = {rate === null ? "—" : number(rate, 4)} {to}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ml-1 h-[17px] w-[17px] shrink-0 text-[#171a18]">
            <path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <label htmlFor="send-amount" className="mb-1 block text-[12px] font-medium text-[#343b33]">Amount</label>
      <div className={`flex items-center rounded-full border border-[#c5c9c4] pl-3 pr-2 focus-within:border-2 focus-within:border-navy sm:px-3.5 ${compact ? "min-h-12" : "min-h-[52px] sm:min-h-[64px]"}`}>
        <input
          id="send-amount"
          inputMode="decimal"
          placeholder="Enter Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
          aria-label={`Amount in ${from}`}
          className={`min-w-0 grow flex-1 border-0 bg-transparent p-0 font-display font-semibold text-[#202421] outline-none ${compact ? "text-[18px]" : "text-[20px] sm:text-[24px]"}`}
        />
        <CurrencyPicker value={from} label="Source currency" onChange={setFrom} variant="hero" align="right" />
      </div>

      <div className={`relative z-[1] flex items-center ${compact ? "h-10" : "h-[44px] sm:h-[52px]"} justify-center`} aria-label="Swap source and target currencies">
        <button
          type="button"
          aria-label="Swap currencies"
          onClick={swapCurrencies}
          className={`grid place-items-center rounded-full ${compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11"} border-0 bg-primary text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
        >
          <img src="/icons/switch.svg" alt="" className="h-auto w-5 brightness-0 invert" />
        </button>
      </div>

      <label htmlFor="receive-amount" className="mb-1 block text-[12px] font-medium text-[#343b33]">Converted to</label>
      <div className={`flex items-center gap-2 rounded-full border border-[#c5c9c4] pl-3 pr-2 focus-within:border-2 focus-within:border-navy sm:px-3.5 ${compact ? "min-h-12" : "min-h-[52px] sm:min-h-[64px]"}`}>
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
              setAmount(String(Number(next.replaceAll(",", "")) / rate));
            }
          }}
          aria-label={`Converted amount in ${to}`}
          className={`min-w-0 flex-1 border-0 bg-transparent p-0 font-display font-semibold text-[#202421] outline-none disabled:cursor-not-allowed disabled:text-[#818980] ${compact ? "text-[18px]" : "text-[20px] sm:text-[24px]"}`}
        />
        <CurrencyPicker value={to} label="Target currency" onChange={setTo} variant="hero" align="right" />
      </div>

      {!compact && (<>
      <button
        type="button"
        onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}
        className="mt-3 h-[48px] w-full rounded-full border-0 bg-primary text-[14px] font-semibold text-white transition hover:bg-primary-hover sm:h-[52px] sm:text-[15px]"
      >
        Compare providers
      </button>
      <a href="#alerts" className="mt-1.5 flex h-[40px] w-full items-center justify-center rounded-full border border-gray-300 bg-white text-[13px] font-semibold text-black transition hover:bg-[#f5faf2] sm:h-[43px]">
        Track exchange rate
      </a>
      </>)}
      {showAsk && <FxAsk from={from} to={to} amount={amount} />}
      {!compact && <p className="mb-0 mt-3 text-center text-[9px] leading-relaxed text-[#818980]">Indicative market rate · provider rates and fees may vary</p>}
    </section>
  );
}
