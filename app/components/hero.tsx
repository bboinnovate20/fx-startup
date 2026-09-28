import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { money, providerSeed, type Currency } from "./data/fx-data";
import type { ProviderInfo } from "./data/providers";
import { Converter } from "./converter";

const ease = [0.22, 1, 0.36, 1] as const;

const heroPhrases = [
  "Catch the right moment.",
  "Get more from every exchange.",
  "Catch the right moment.",
];

function MobileProviderTicker({ providers }: { providers: ProviderInfo[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mb-8 overflow-hidden lg:hidden" aria-hidden="true">
      <motion.div
        className="flex w-max"
        animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {[0, 1].map((copy) => (
          <div className="flex shrink-0 gap-2 pr-2" key={copy}>
            {providers.map((provider) => (
              <div className="currency-floater shrink-0" key={`${copy}-${provider.id}`}>
                <img className="provider-floater-logo" src={provider.logo} alt="" />
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function AnimatedHeroPhrase() {
  const prefersReducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "resting" | "clearing" | "complete">("typing");
  const phrase = heroPhrases[phraseIndex];

  useEffect(() => {
    if (prefersReducedMotion) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (characterCount < phrase.length) {
        timeout = setTimeout(() => setCharacterCount((count) => count + 1), 65);
      } else if (phraseIndex === heroPhrases.length - 1) {
        timeout = setTimeout(() => setPhase("complete"), 0);
      } else {
        timeout = setTimeout(() => setPhase("resting"), 0);
      }
    } else if (phase === "resting") {
      timeout = setTimeout(() => setPhase("clearing"), 3500);
    } else if (phase === "clearing" && characterCount > 0) {
      timeout = setTimeout(() => setCharacterCount((count) => count - 1), 32);
    } else if (phase === "clearing") {
      timeout = setTimeout(() => {
        setPhraseIndex((index) => index + 1);
        setPhase("typing");
      }, 180);
    } else {
      return;
    }

    return () => clearTimeout(timeout);
  }, [characterCount, phase, phrase.length, phraseIndex, prefersReducedMotion]);

  const showCursor = !prefersReducedMotion && phase !== "resting" && phase !== "complete";

  return (
    <>
      <span className="block" aria-hidden="true">
        <motion.span
          animate={{ opacity: phase === "clearing" ? 0.25 : 1 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        >
          {prefersReducedMotion ? phrase : phrase.slice(0, characterCount)}
        </motion.span>
        {showCursor && (
          <motion.span
            className="ml-1 inline-block h-[1em] w-[2px] translate-y-[.12em] bg-primary align-baseline"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        )}
      </span>
      <span className="sr-only">Catch the right moment.</span>
    </>
  );
}

function ProviderRateCards({
  to,
  amount,
  rate,
  providers,
}: {
  to: Currency;
  amount: string;
  rate: number | null;
  providers: ProviderInfo[];
}) {
  const prefersReducedMotion = useReducedMotion();
  if (!rate) return null;

  const amountValue = Number(amount.replaceAll(",", "")) || 500;
  const scale = rate / providerSeed[0].rate;
  const top3 = providerSeed
    .map((seed) => {
      const info = providers.find((p) => p.id === seed.id);
      return { ...seed, logo: info?.logo, payout: amountValue * seed.rate * scale };
    })
    .sort((a, b) => b.payout - a.payout)
    .slice(0, 3);

  return (
    <div className="mt-7 space-y-2 text-left">
      {top3.map((provider, i) => (
        <motion.div
          key={provider.id}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38, ease, delay: 0.3 + i * 0.1 }}
          className={`flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 ${
            i === 0 ? "bg-primary" : "bg-[#f5f4fa]"
          }`}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-black/5 bg-white">
            {provider.logo ? (
              <img src={provider.logo} alt="" className="h-full w-full object-cover rounded-full" />
            ) : (
              <span className="text-[11px] font-bold text-primary">{provider.mark}</span>
            )}
          </div>
          <span className={`flex-1 text-[13px] font-semibold ${i === 0 ? "text-white" : "text-[#25243a]"}`}>
            {provider.name}
            {i === 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">
                Best rate
              </span>
            )}
          </span>
          <span className={`shrink-0 text-[13px] font-bold ${i === 0 ? "text-white" : "text-[#1a192d]"}`}>
            {money(provider.payout, to)}
          </span>
        </motion.div>
      ))}
      <motion.a
        href="#compare"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease, delay: 0.62 }}
        className="flex items-center gap-1 pt-1 text-[12px] font-semibold text-primary transition-opacity hover:opacity-75"
      >
        Compare all providers
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0">
          <path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.a>
    </div>
  );
}

export function Hero({
  from,
  to,
  setFrom,
  setTo,
  amount,
  setAmount,
  rate,
  providers,
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  amount: string;
  setAmount: (value: string) => void;
  rate: number | null;
  providers: ProviderInfo[];
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative isolate overflow-hidden bg-white px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16"
      id="rates"
    >
      <div className="relative z-10 mx-auto max-w-[1080px]">
        <div className="lg:grid lg:grid-cols-[1fr_460px] lg:items-center lg:gap-12 xl:grid-cols-[1fr_500px] xl:gap-16">
          {/* Left column: headline + provider rate cards */}
          <div className="mb-10 text-center lg:mb-0 lg:text-left">
            <motion.span
              className="block text-[16px] font-semibold uppercase tracking-wider text-primary"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              Smart currency exchange
            </motion.span>

            <h1 className="mb-0 mt-4 text-[24px] font-semibold leading-[1.05] tracking-normal text-primary sm:text-[36px] lg:text-[48px] xl:text-[44px]">
              <motion.span
                className="block"
                aria-hidden="true"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
              >
                Know best the rate.
              </motion.span>
              <AnimatedHeroPhrase />
            </h1>

            <motion.p
              className="mx-auto mt-4 max-w-[400px] text-[14px] leading-[1.65] text-[#55536e] lg:mx-0"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.16 }}
            >
              Live exchange rates from multiple providers — see exactly who gives your recipient the most.
            </motion.p>

            <div className="hidden lg:block">
              <ProviderRateCards to={to} amount={amount} rate={rate} providers={providers} />
            </div>
          </div>

          {/* Right column: converter */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: 0.12 }}
          >
            <Converter {...{ from, to, setFrom, setTo, amount, setAmount, rate }} />
          </motion.div>
        </div>

        <div className="lg:hidden">
          <div className="mt-6">
            <MobileProviderTicker providers={providers} />
          </div>
          <ProviderRateCards to={to} amount={amount} rate={rate} providers={providers} />
        </div>
      </div>
    </section>
  );
}
