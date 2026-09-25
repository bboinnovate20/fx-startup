import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { Currency } from "./data/fx-data";
import type { ProviderInfo } from "./data/providers";
import { Converter } from "./converter";

const leftProviderIds = ["wise", "nala", "remitly"];
const rightProviderIds = ["pesa", "sendwave", "lemfi"];
const heroPhrases = [
  "Catch the right moment.",
  "Get more from every exchange.",
  "Catch the right moment.",
];

function ProviderFloaters({ side, providers }: { side: "left" | "right"; providers: ProviderInfo[] }) {
  const ids = side === "left" ? leftProviderIds : rightProviderIds;
  const items = ids
    .map((id) => providers.find((provider) => provider.id === id))
    .filter((provider): provider is ProviderInfo => Boolean(provider));

  return (
    <div className={`currency-rail currency-rail-${side}`} aria-hidden="true">
      {items.map((provider, index) => (
        <ProviderFloater
          key={provider.id}
          provider={provider}
          pathIndex={index + (side === "right" ? 1 : 0)}
          delay={index * 0.45 + (side === "right" ? 0.7 : 0)}
        />
      ))}
    </div>
  );
}

function ProviderFloater({
  provider,
  pathIndex,
  delay,
}: {
  provider: ProviderInfo;
  pathIndex: number;
  delay: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const direction = pathIndex % 2 ? -1 : 1;
  const variation = Math.abs(pathIndex) % 3;
  const path = Array.from({ length: 9 }, (_, step) => {
    const angle = ((step * Math.PI) / 4) * direction;
    return {
      x: Math.sin(angle) * (16 + variation * 5),
      y: step * (8 + variation),
      rotate: step * 45 * direction,
    };
  });

  return (
    <motion.div
      className="currency-floater"
      animate={prefersReducedMotion ? undefined : {
        x: path.map(({ x }) => x),
        y: path.map(({ y }) => y),
        rotate: path.map(({ rotate }) => rotate),
        scale: [0.96, 1, 1.03, 1, 0.96],
        opacity: [0, 1, 1, 0.5, 0],
      }}
      transition={{
        duration: 6.5 + (Math.abs(pathIndex) % 3) * 0.7,
        ease: "easeInOut",
        repeat: Infinity,
        delay,
      }}
    >
      <img className="provider-floater-logo" src={provider.logo} alt="" />
    </motion.div>
  );
}

function MobileProviderTicker({ providers }: { providers: ProviderInfo[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden lg:hidden" aria-hidden="true">
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
  return (
    <section
      className="relative isolate overflow-hidden bg-white px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14"
      id="rates"
    >
      <div className="relative z-10 mx-auto max-w-240 text-center">
        <div className="h-40">
          <span className="text-[16px] uppercase font-semibold tracking-wider text-primary">
            Smart currency exchange
          </span>
          <h1
            className="mb-2 mt-4 min-h-[3.15em] text-[34px] font-semibold leading-[1.05] tracking-normal text-primary sm:text-[46px] lg:min-h-[2.1em]"
          >
            <span aria-hidden="true">Know best the rate.</span>
            <AnimatedHeroPhrase />
          </h1>
        </div>
        <div className="mx-auto grid max-w-[960px] grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)_minmax(0,1fr)] lg:gap-5">
          <MobileProviderTicker providers={providers} />
          <ProviderFloaters side="left" providers={providers} />
          <Converter {...{ from, to, setFrom, setTo, amount, setAmount, rate }} />
          <ProviderFloaters side="right" providers={providers} />
        </div>
      </div>
    </section>
  );
}
