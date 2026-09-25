"use client";

import { useState } from "react";
import { currencies, money, number, providerSeed, type Currency } from "./data/fx-data";
import type { ProviderInfo } from "./data/providers";
import { ArrowIcon } from "./ui/ArrowIcon";
import { SectionHeading } from "./ui/SectionHeading";

export function ProviderComparison({
  from,
  to,
  amount,
  setAmount,
  rate,
  providers,
}: {
  from: Currency;
  to: Currency;
  amount: string;
  setAmount: (amount: string) => void;
  rate: number | null;
  providers: ProviderInfo[];
}) {
  const [shareStatus, setShareStatus] = useState("Share");
  const amountValue = Number(amount.replaceAll(",", "")) || 0;
  const scale = rate ? rate / providerSeed[0].rate : 0;
  const results = providerSeed
    .map((provider) => {
      const directoryEntry = providers.find((item) => item.id === provider.id);
      const payout = amountValue * provider.rate * scale;
      return { ...provider, logo: directoryEntry?.logo, payout };
    })
    .sort((a, b) => b.payout - a.payout);
  const lowestProviderRate = Math.min(...providerSeed.map((provider) => provider.rate));

  async function shareComparison() {
    const url = new URL("/", window.location.origin);
    url.searchParams.set("sendAmount", amount.replaceAll(",", "") || "0");
    url.searchParams.set("sourceCurrency", from);
    url.searchParams.set("targetCurrency", to);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Compare currency rates",
          text: `Compare ${from} to ${to} rates`,
          url: url.toString(),
        });
        setShareStatus("Shared");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        setShareStatus("Link copied");
      } else {
        window.prompt("Copy this comparison link", url.toString());
        setShareStatus("Link ready");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Share failed");
    }
  }

  return (
    <section className="mb-[55px] font-display max-[700px]:mb-[40px]" id="compare">
      <SectionHeading
        eyebrow="SIDE BY SIDE"
        title="Compare your options"
        description="See how much your recipient could get from each provider."
      />


      <div className="overflow-hidden rounded-[24px] border border-[#e6ebf2] bg-white shadow-[0_16px_45px_rgba(18,35,65,0.07)]">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[#e9edf3] bg-[#f8faff] p-5 sm:grid-cols-[minmax(220px,1fr)_auto] sm:grid-rows-[auto_auto] sm:items-center sm:p-6">
          <span className="text-lg font-semibold text-navy sm:col-start-1 sm:row-start-1">You send</span>
          <label htmlFor="compare-send-amount" className="flex h-[58px] min-w-0 items-center gap-3 rounded-[16px] border border-[#d7dfeb] bg-white px-4 transition focus-within:border-2 focus-within:border-navy sm:col-start-1 sm:row-start-2">
              <img src={currencies[from].icon} alt="" className="h-7 w-7 rounded-full object-cover" />
              <input
                id="compare-send-amount"
                aria-label={`Amount in ${from}`}
                inputMode="decimal"
                placeholder="Enter amount to convert"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
                className="min-w-0 flex-1 border-0 bg-transparent text-xl font-bold text-navy outline-none"
              />
              <span className="text-sm font-bold text-[#64748b]">{from}</span>
          </label>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:col-start-2 sm:row-start-2">
          <button
            type="button"
            onClick={shareComparison}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-3xl border border-primary bg-primary px-6 text-sm font-medium text-white transition hover:border-primary-hover hover:bg-primary-hover"
            aria-live="polite"
          >
            <img src="/icons/plane-send.svg" alt="" className="h-4 w-4 brightness-0 invert" />
            {shareStatus}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[from, to].map((currency) => (
                <img
                  key={currency}
                  src={currencies[currency].icon}
                  alt=""
                  className="h-9 w-9 rounded-full border-[3px] border-[#f8faff] object-cover"
                />
              ))}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#75839a]">Exchange rate</div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-navy">
                1 {from} <ArrowIcon className="h-3 w-3 text-primary" /> {rate ? `${number(rate, 2)} ${to}` : `— ${to}`}
              </div>
            </div>
          </div>

        </div>


        </div>

        <div className="space-y-3 p-4 sm:p-6">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#e1e9f5] bg-[#f4f7fc] px-4 py-3.5 sm:px-5">
        <p className="m-0 text-sm leading-relaxed text-navy">
          <strong className="font-semibold">Want a better rate?</strong>{" "}
          Set a rate alert and we’ll let you know when it reaches your target.
        </p>
        <a href="#alerts" className=" shrink-0 rounded-full bg-primary px-6 py-3  font-semibold text-white transition hover:bg-primary-hover">
          Set an alert
        </a>
      </div>
          {rate ? results.map((provider, index) => {
            const isBest = index === 0;
            const difference = ((provider.rate / lowestProviderRate) - 1) * 100;
            const roundedDifference = Math.round(difference * 10) / 10;
            const trend = roundedDifference > 0 ? "up" : roundedDifference < 0 ? "down" : "equal";
            const trendIcon = trend === "equal" ? "/icons/arrow-right.svg" : `/icons/arrow-trending-${trend}.svg`;
            return (
              <article
                key={provider.id}
                className={`rounded-[70px] p-4 transition-colors sm:p-5 ${isBest ? "bg-primary text-white" : "bg-[#f0f2f5] text-navy"}`}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white sm:h-14 sm:w-14 ${provider.logo ? "" : "border border-black/5"}`}>
                    {provider.logo ? (
                      <img src={provider.logo} alt={`${provider.name} logo`} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-extrabold text-primary">{provider.mark}</span>
                    )}
                  </div>
                  <div className="min-w-[64px] flex-1 sm:min-w-[80px]">
                    <div className={`truncate text-base font-bold sm:text-lg ${isBest ? "text-white" : "text-navy"}`}>
                      {provider.name}{isBest && <span className="ml-2 hidden rounded-full bg-white/20 px-2 py-1 align-middle text-[10px] font-semibold sm:inline">Best rate</span>}
                    </div>
                    <div className={`mt-1 text-xs sm:text-sm ${isBest ? "text-white/85" : "text-[#68768a]"}`}>
                      {provider.fee === 0 ? "No transfer fee" : `Est. ${money(provider.fee * scale, from)} fee`}
                      <span className="mx-1.5" aria-hidden="true">·</span>{provider.time}
                    </div>
                  </div>
                  <div
                    aria-label={`${provider.name} payout is ${roundedDifference === 0 ? "the lowest shown" : `${number(roundedDifference, 1)} percent higher than the lowest shown`}`}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:text-sm ${isBest ? "bg-white/15 text-white" : "bg-[#e6f7ef] text-[#16804f]"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-3 w-3 ${isBest ? "bg-white" : "bg-[#14532d]"}`}
                      style={{
                        mask: `url('${trendIcon}') center / contain no-repeat`,
                        WebkitMask: `url('${trendIcon}') center / contain no-repeat`,
                      }}
                    />
                    {roundedDifference > 0 ? "+" : ""}{number(roundedDifference, 1)}%
                    <span className="hidden font-medium sm:inline">
                      {roundedDifference > 0 ? "higher" : "lowest"}
                    </span>
                  </div>
                  <div className={`shrink-0 text-right text-sm font-extrabold sm:text-xl ${isBest ? "text-white" : "text-navy"}`}>
                    {money(provider.payout, to)}
                    <div className={`mt-0.5 text-[10px] font-medium sm:text-xs ${isBest ? "text-white/75" : "text-[#7c8798]"}`}>recipient gets</div>
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-[18px] bg-[#f6f8fb] px-5 py-8 text-center text-sm text-[#68768a]">
              Estimates aren’t available for {from} to {to} yet.
            </div>
          )}
        </div>

        <div className="border-t border-[#e9edf3] px-5 py-4 text-center text-xs text-[#8490a1]">
          Sample estimates only. Rates and fees are not live quotes.
        </div>
      </div>
    </section>
  );
}
