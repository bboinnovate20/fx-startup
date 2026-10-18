"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { currencies, formatAmount, money, number, roundAmount, visibleDigits, type Currency } from "./data/fx-data";
import type { MarketStatus, PlatformRow } from "../lib/use-fx-market";
import { ArrowIcon } from "./ui/ArrowIcon";
import { SectionHeading } from "./ui/SectionHeading";

const ease = [0.22, 1, 0.36, 1] as const;

function updatedLabel(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Updated ${formatted}`;
}
const rowLayoutTransition = { type: "spring", bounce: 0, visualDuration: 0.4 } as const;

export function ProviderComparison({
  from,
  to,
  amount,
  setAmount,
  rate,
  quotes,
  bestId = null,
  status = "ready",
  compact = false,
  showInput = true,
}: {
  from: Currency;
  to: Currency;
  amount: string;
  setAmount: (amount: string) => void;
  rate: number | null;
  quotes: PlatformRow[];
  bestId?: string | null;
  status?: MarketStatus;
  message?: string | null;
  compact?: boolean;
  showInput?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [shareStatus, setShareStatus] = useState("Share");
  const [editingAmount, setEditingAmount] = useState(false);
  const [toastOn, setToastOn] = useState(false);
  const [introduced, setIntroduced] = useState(false);
  const pairMissing = status !== "loading" && quotes.length === 0;
  useEffect(() => {
    if (introduced || quotes.length === 0) return;
    const timeout = window.setTimeout(() => setIntroduced(true), 900);
    return () => window.clearTimeout(timeout);
  }, [introduced, quotes.length]);
  useEffect(() => {
    if (!pairMissing) {
      setToastOn(false);
      return;
    }
    setToastOn(false);
    const open = window.setTimeout(() => setToastOn(true), 20);
    const close = window.setTimeout(() => setToastOn(false), 3400);
    return () => {
      window.clearTimeout(open);
      window.clearTimeout(close);
    };
  }, [from, pairMissing, to]);
  const availableRates = quotes.flatMap((provider) =>
    provider.available && provider.rate != null ? [provider.rate] : [],
  );
  const lowestProviderRate = availableRates.length ? Math.min(...availableRates) : null;

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
    <section className={compact ? "font-display" : "mb-[55px] font-display max-[600px]:mb-[40px]"} id="compare">
      {!compact && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease }}
        >
          <SectionHeading
            eyebrow="SIDE BY SIDE"
            title="Compare your options"
            description="See how much your recipient could get from each provider."
          />
        </motion.div>
      )}


      <div className={compact ? "overflow-hidden rounded-[16px] border border-[#e4e1ef] bg-white" : "overflow-hidden rounded-[20px] border border-[#e6ebf2] bg-white shadow-[0_12px_32px_rgba(18,35,65,0.06)]"}>
        <div className={`grid grid-cols-1 gap-x-4 gap-y-2 border-b border-[#e9edf3] bg-[#f8faff] ${compact ? "p-4" : "p-4"} ${showInput ? "sm:grid-cols-[minmax(220px,1fr)_auto] sm:grid-rows-[auto_auto]" : "sm:grid-cols-[1fr_auto]"} sm:items-center ${compact ? "sm:p-4" : "sm:p-5"}`}>
          {showInput && <>
          <span className={`font-semibold text-navy sm:col-start-1 sm:row-start-1 ${compact ? "text-[15px]" : "text-base"}`}>{compact ? "Compare providers · you send" : "You send"}</span>
          <label htmlFor="compare-send-amount" className={`flex ${compact ? "h-11" : "h-[52px]"} min-w-0 items-center gap-3 rounded-[14px] border border-[#d7dfeb] bg-white px-3.5 transition-shadow focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--navy)_10%,transparent)] sm:col-start-1 sm:row-start-2`}>
              <img src={currencies[from].icon} alt="" className="h-6 w-6 rounded-full object-cover" />
              <input
                id="compare-send-amount"
                aria-label={`Amount in ${from}`}
                inputMode="decimal"
                placeholder={pairMissing ? "Not available" : "Enter amount to convert"}
                value={pairMissing ? "" : editingAmount ? amount : formatAmount(amount)}
                disabled={pairMissing}
                onFocus={() => setEditingAmount(true)}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
                onBlur={() => {
                  setEditingAmount(false);
                  const parsed = Number(amount.replaceAll(",", ""));
                  if (amount.trim() && Number.isFinite(parsed)) setAmount(roundAmount(parsed));
                }}
                className={`min-w-0 flex-1 border-0 bg-transparent font-semibold ${compact ? "text-base" : "text-lg"} text-navy outline-none`}
              />
              <span className="text-sm font-bold text-[#64748b]">{from}</span>
          </label>
          </>}
        <div className={`flex flex-wrap items-center justify-center gap-4 ${showInput ? "sm:col-start-2 sm:row-start-2" : "sm:col-start-2 sm:row-start-1"}`}>
          <motion.button
            type="button"
            onClick={shareComparison}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-primary bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:border-primary-hover hover:bg-primary-hover"
            aria-live="polite">
            <img src="/icons/plane-send.svg" alt="" className="h-3.5 w-3.5 brightness-0 invert" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={shareStatus}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease }}
              >
                {shareStatus}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[from, to].map((currency) => (
                <img
                  key={currency}
                  src={currencies[currency].icon}
                  alt=""
                  className="h-8 w-8 rounded-full border-[3px] border-[#f8faff] object-cover"
                />
              ))}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#75839a]">Exchange rate</div>
              <div className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-navy">
                1 {from} <ArrowIcon className="h-3 w-3 text-primary" /> {rate ? `${number(rate, visibleDigits(rate, rate < 10 ? 4 : 2))} ${to}` : `— ${to}`}
              </div>
            </div>
          </div>

        </div>


        </div>

        <motion.div
          className={compact ? "space-y-2 p-3" : "space-y-3 p-4 sm:p-6"}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: "0px 0px -60px 0px" }}
        >

      {!compact && (
        <motion.div
          variants={{
            hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
            visible: {
              opacity: 1,
              transition: prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3, ease, delay: 0.15 },
            },
          }}
          className="mb-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#e1e9f5] bg-[#f4f7fc] px-4 py-3 sm:px-4.5"
        >
          <p className="m-0 text-[13px] leading-relaxed text-navy">
            <strong className="font-semibold">Want a better rate?</strong>{" "}
          </p>
          <a href="#alerts" className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover">
            Set an alert
          </a>
        </motion.div>
      )}
          <AnimatePresence>
            {quotes.length ? quotes.map((provider, index) => {
              const isBest = provider.available && provider.id === (bestId ?? quotes.find((item) => item.available)?.id);
              const difference = provider.available && provider.rate != null && lowestProviderRate
                ? ((provider.rate / lowestProviderRate) - 1) * 100
                : null;
              const roundedDifference = difference == null ? null : Math.round(difference * 10) / 10;
              const trend = roundedDifference == null || roundedDifference === 0 ? "equal" : roundedDifference > 0 ? "up" : "down";
              const trendIcon = trend === "equal" ? "/icons/arrow-right.svg" : `/icons/arrow-trending-${trend}.svg`;
              const updated = provider.available ? updatedLabel(provider.updatedAt) : null;
              return (
                <motion.article
                  key={provider.id}
                  layout="position"
                  custom={index}
                  initial={introduced ? false : undefined}
                  variants={{
                    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
                    visible: (custom: number) => ({
                      opacity: 1,
                      y: 0,
                      transition: prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.3, ease, delay: introduced ? 0 : 0.15 + custom * 0.05 },
                    }),
                  }}
                  exit={{ opacity: 0 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                  transition={{ layout: rowLayoutTransition }}
                  className={`rounded-[24px] transition-colors ${compact ? "p-2.5 pr-5" : "p-3 sm:p-3.5"} ${isBest ? "bg-primary text-white" : "bg-[#f0f2f5] text-navy"}`}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
                    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-white ${compact ? "h-9 w-9" : "h-9 w-9 sm:h-11 sm:w-11"} ${provider.logo ? "" : "border border-black/5"}`}>
                      {provider.logo ? (
                        <img
                          src={provider.logo}
                          alt={`${provider.name} logo`}
                          className="h-full w-full rounded-full object-cover"
                          onError={(event) => {
                            const image = event.currentTarget;
                            const fallback = `/logos/${provider.id}.png`;
                            if (!image.src.endsWith(fallback)) image.src = fallback;
                          }}
                        />
                      ) : (
                        <span className="text-base font-extrabold text-primary">{provider.mark}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 sm:min-w-[80px]">
                      <div className={`truncate font-semibold ${compact ? "text-[14px]" : "text-sm sm:text-base"} ${isBest ? "text-white" : "text-navy"}`}>
                        {provider.name}{isBest && <span className="ml-2 hidden rounded-full bg-white/20 px-2 py-1 align-middle text-[10px] font-semibold sm:inline">Best rate</span>}
                      </div>
                      {updated ? (
                        <div suppressHydrationWarning className={`mt-0.5 text-[11px] ${isBest ? "text-white/80" : "text-[#68768a]"}`}>
                          {updated}
                        </div>
                      ) : null}
                      {provider.website ? (
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isBest ? "bg-white/15 text-white" : "bg-white text-navy"}`}
                        >
                          Visit
                          <img
                            src="/icons/external-link-stroke-rounded.svg"
                            alt=""
                            className={`h-3.5 w-3.5 ${isBest ? "brightness-0 invert" : ""}`}
                          />
                        </a>
                      ) : null}
                      {/* <div className={`mt-0.5 text-[11px] ${compact ? "" : "sm:text-xs"} ${isBest ? "text-white/85" : "text-[#68768a]"}`}>
                        {provider.fee === 0 ? "No transfer fee" : `Est. ${money(provider.fee * scale, from)} fee`}
                        <span className="mx-1.5" aria-hidden="true">·</span>{provider.time}
                      </div> */}
                    </div>
                    {roundedDifference != null ? (
                    <div
                      aria-label={`${provider.name} rate is ${roundedDifference === 0 ? "the lowest shown" : `${number(roundedDifference, 1)} percent higher than the lowest shown`}`}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold sm:px-2.5 sm:text-xs ${isBest ? "bg-white/15 text-white" : "bg-[#e6f7ef] text-[#16804f]"}`}
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
                    ) : null}
                    <div
                      className={`relative ml-auto grid shrink-0 justify-items-end rounded-[12px] text-right text-sm font-bold ${compact ? "sm:text-base" : "sm:text-lg"} ${isBest ? "text-white" : "text-navy"}`}
                      aria-busy={status === "loading"}
                    >
                      <div className={status === "loading" ? "opacity-0" : undefined}>
                        <div className="whitespace-nowrap">
                          {provider.available && provider.payout != null ? money(provider.payout, to) : "Not available"}
                        </div>
                        <div className={`mt-0.5 max-w-[5.25rem] text-[9px] font-medium leading-tight sm:max-w-[8.5rem] sm:text-[10px] ${isBest ? "text-white/75" : "text-[#7c8798]"}`}>
                          {provider.available
                            ? provider.chargesApplied
                              ? "Extra charges applied"
                              : (provider.speed ?? "recipient gets")
                            : "Not available"}
                        </div>
                      </div>
                      {status === "loading" ? <span className="glass-shimmer" aria-hidden="true" /> : null}
                    </div>
                  </div>
                </motion.article>
              );
            }) : status === "loading" ? (
              <motion.div
                key="loading"
                variants={{
                  hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.2 } },
                }}
                className="rounded-[16px] bg-[#f6f8fb] px-5 py-6 text-center text-sm text-[#68768a]"
              >
                Loading provider quotes…
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className={`border-t border-[#e9edf3] text-center text-[#8490a1] ${compact ? "px-4 py-2.5 text-[11px]" : "px-4 py-3 text-[11px]"}`}>
          Normal exchange rate. Extra charges applied.
        </div>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <div className={`t-toast rounded-full bg-navy px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(11,31,58,0.28)] ${toastOn ? "is-open" : ""}`} role="status">
          Not available
        </div>
      </div>
    </section>
  );
}
