import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { money, type Currency } from "./data/fx-data";
import type { PlatformRow } from "../lib/use-fx-market";
import type { ProviderInfo } from "./data/providers";
import { Converter } from "./converter";

const ease = [0.22, 1, 0.36, 1] as const;

const heroPhrases = [
  "Catch the right moment.",
  "Get more from every exchange.",
  "Catch the right moment.",
];

// function MobileProviderTicker({ providers }: { providers: ProviderInfo[] }) {
//   const prefersReducedMotion = useReducedMotion();
//
//   return (
//     <div className="provider-ticker mb-8 overflow-hidden lg:hidden" aria-hidden="true">
//       <motion.div
//         className="flex w-max"
//         animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
//         transition={{ duration: 28, ease: "linear", repeat: Infinity }}
//       >
//         {[0, 1].map((copy) => (
//           <div className="flex shrink-0 gap-2 pr-2" key={copy}>
//             {providers.map((provider) => (
//               <div className="currency-floater shrink-0" key={`${copy}-${provider.id}`}>
//                 <img className="provider-floater-logo" src={provider.logo} alt="" />
//               </div>
//             ))}
//           </div>
//         ))}
//       </motion.div>
//     </div>
//   );
// }

function AnimatedHeroPhrase() {
  const prefersReducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "resting" | "clearing" | "complete">("typing");
  const [phraseHeight, setPhraseHeight] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLSpanElement | null>(null);
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

  // Measure the tallest of the phrases so the line keeps one fixed height and the
  // copy below never shifts while typing (instead of reserving a guessed 2 lines).
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      let tallest = 0;
      for (const candidate of heroPhrases) {
        el.textContent = candidate;
        tallest = Math.max(tallest, el.getBoundingClientRect().height);
      }
      el.textContent = "";
      if (tallest > 0) setPhraseHeight(tallest);
    };

    measure();
    document.fonts.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <>
      <span
        className="block"
        style={phraseHeight === undefined ? undefined : { minHeight: `${phraseHeight}px` }}
        aria-hidden="true"
      >
        <motion.span
          animate={{ opacity: phase === "clearing" ? 0.25 : 1 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        >
          {prefersReducedMotion ? phrase : phrase.slice(0, characterCount)}
        </motion.span>
      </span>
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible pointer-events-none absolute left-0 top-0 w-full"
      />
      <span className="sr-only">Catch the right moment.</span>
    </>
  );
}

function ProviderRateCards({
  to,
  quotes,
  bestId,
  loading = false,
}: {
  to: Currency;
  quotes: PlatformRow[];
  bestId: string | null;
  loading?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [introduced, setIntroduced] = useState(false);
  const top3 = quotes.filter((provider): provider is PlatformRow & { payout: number } =>
    provider.available && provider.payout != null,
  ).slice(0, 3);
  useEffect(() => {
    if (introduced || top3.length === 0) return;
    const timeout = window.setTimeout(() => setIntroduced(true), 900);
    return () => window.clearTimeout(timeout);
  }, [introduced, top3.length]);
  if (top3.length === 0) return null;
  const highlighted = top3.some((provider) => provider.id === bestId) ? bestId : top3[0].id;

  return (
    <motion.div
      className="mt-7 space-y-2 text-left"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3, margin: "0px 0px -40px 0px" }}
    >
      {top3.map((provider, i) => (
        <motion.div
          key={provider.id}
          custom={i}
          initial={introduced ? false : undefined}
          variants={{
            hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -16 },
            visible: (custom: number) => ({
              opacity: 1,
              x: 0,
              transition: prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.38, ease, delay: 0.3 + custom * 0.1 },
            }),
          }}
          className={`flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 ${
            provider.id === highlighted ? "bg-primary" : "bg-[#f5f4fa]"
          }`}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-black/5 bg-white">
            {provider.logo ? (
              <img
                src={provider.logo}
                alt=""
                className="h-full w-full object-cover rounded-full"
                onError={(event) => {
                  const image = event.currentTarget;
                  const fallback = `/logos/${provider.id}.png`;
                  if (!image.src.endsWith(fallback)) image.src = fallback;
                }}
              />
            ) : (
              <span className="text-[11px] font-bold text-primary">{provider.mark}</span>
            )}
          </div>
          <span className={`min-w-0 flex-1 text-[13px] font-semibold ${provider.id === highlighted ? "text-white" : "text-[#25243a]"}`}>
            <span className="block truncate">
              {provider.name}
              {provider.id === highlighted && (
                <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">
                  Best rate
                </span>
              )}
            </span>
            {provider.updatedAt ? (
              <span suppressHydrationWarning className={`mt-0.5 block text-[10px] font-medium ${provider.id === highlighted ? "text-white/75" : "text-[#68768a]"}`}>
                Updated {new Date(provider.updatedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : null}
          </span>
          <span
            className={`relative inline-block min-w-16 shrink-0 rounded-[10px] text-right text-[13px] font-bold ${provider.id === highlighted ? "text-white" : "text-[#1a192d]"}`}
            aria-busy={loading}
          >
            <span className={loading ? "opacity-0" : undefined}>{money(provider.payout, to)}</span>
            {provider.chargesApplied ? (
              <span className={`mt-0.5 block text-[9px] font-medium leading-tight ${provider.id === highlighted ? "text-white/75" : "text-[#68768a]"}`}>
                Extra charges applied
              </span>
            ) : null}
            {loading ? <span className="glass-shimmer" aria-hidden="true" /> : null}
          </span>
        </motion.div>
      ))}
      <motion.a
        href="#compare"
        variants={{
          hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
          visible: {
            opacity: 1,
            transition: prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.3, ease, delay: 0.62 },
          },
        }}
        className="flex items-center gap-1 pt-1 text-[12px] font-semibold text-white transition-opacity hover:opacity-75"
      >
        Compare all providers
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0">
          <path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.a>
    </motion.div>
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
  quotes,
  bestId = null,
  status = "ready",
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  amount: string;
  setAmount: (value: string) => void;
  rate: number | null;
  quotes: PlatformRow[];
  bestId?: string | null;
  status?: "loading" | "ready" | "unavailable";
  providers?: ProviderInfo[];
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative isolate z-10 overflow-hidden bg-transparent px-5 pb-36 pt-10 sm:px-8 sm:pb-48 sm:pt-14 lg:px-12 lg:pb-48 lg:pt-16 xl:px-20"
      id="rates"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1220px]">
        <div className="lg:grid lg:grid-cols-[1fr_414px] lg:items-center lg:gap-16 xl:grid-cols-[1fr_450px] xl:gap-24">
          {/* Left column: headline + provider rate cards */}
          <div className="mb-10 lg:-mt-15 text-center lg:mb-0 lg:max-w-[560px] lg:text-left">
            {/* <motion.span
              className="block font-display text-[14px] font-semibold uppercase tracking-wider text-[#c4b5fd] sm:text-[16px]"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              Smart currency exchange
            </motion.span> */}

            <h1 className="relative mb-0 mt-4 font-hegarty text-[24px] font-normal leading-[1.05] tracking-tight text-white sm:text-[36px] lg:text-[48px] xl:text-[44px]">
              <motion.span
                className="block text-[30px] sm:text-[36px] lg:text-[48px] xl:text-[44px]"
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
              className="mx-auto mt-4 max-w-[400px] font-display text-[14px] leading-[1.65] text-white/75 lg:mx-0"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.16 }}
            >
              Live exchange rates from multiple providers.
            </motion.p>

            <div className="hidden lg:block">
              <ProviderRateCards to={to} quotes={quotes} bestId={bestId} loading={status === "loading"} />
            </div>
          </div>

          {/* Right column: converter */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: 0.12 }}
          >
            <Converter {...{ from, to, setFrom, setTo, amount, setAmount, rate, status }} />
          </motion.div>
        </div>

        <div className="lg:hidden">
          {/* <div className="mt-6">
            <MobileProviderTicker providers={providers} />
          </div> */}
          <ProviderRateCards to={to} quotes={quotes} bestId={bestId} loading={status === "loading"} />
        </div>
      </div>
    </section>
  );
}
