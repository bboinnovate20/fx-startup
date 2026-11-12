"use client";

import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AskDock } from "./fx-ask";
import { ChatAttachment, ChatSkeletonCard } from "./ask-chat-cards";
import Loader from "./loading-icon";
import { currencyList, number, type Currency } from "./data/fx-data";
import directory from "../../public/data/providers.json";
import { surfaceIdOf, useFxSurfaces, type SurfacePress } from "../a2ui/use-surfaces";
import { assignAskVariant, rememberAskVariant, type AskVariant } from "../lib/ask-variant";
import { askFx, type FxPair } from "../lib/fx-api";
import { recentConversations } from "../lib/recent-conversations";
import { linkProviderNames, type ProviderLink } from "./linked-answer";
import { RateAlertDialog } from "./rate-alert-dialog";
import { useFxMarket } from "../lib/use-fx-market";
import type { RateHistoryPeriod } from "./ui/rate-history-chart";

// `a2ui` is the turn's A2UI batch, kept so a restored session redraws its cards.
type Message = { id: number; role: "user" | "assistant" | "system"; text: string; a2ui?: unknown[] };
type Status = "idle" | "thinking";
type TurnContext = { pair?: { from: Currency; to: Currency }; amount?: string; range?: "1d" | "1w" };

// The A2UI SDK touches browser globals on import, so cards render client-only.
const SurfaceView = dynamic(() => import("../a2ui/surface-view"), { ssr: false });

const suggestions = ["What about EUR?", "Show 24 hours", "Cheapest provider?"];
const sessionKey = "fx-ask-session-v2";
const workspaceDelay = 650;

const ease = [0.22, 1, 0.36, 1] as const;
const enter: Transition = { duration: 0.32, ease };

function asPair(value: unknown): { from: Currency; to: Currency } | undefined {
  const pair = value as FxPair | undefined;
  if (!pair || !currencyList.includes(pair.from as Currency) || !currencyList.includes(pair.to as Currency)) return undefined;
  return { from: pair.from as Currency, to: pair.to as Currency };
}

const desktopQuery = "(min-width: 1024px)";

/** Whether the workspace column is showing (Tailwind's `lg`). */
function useDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(desktopQuery);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  );
}

/** A press on an A2UI card, as the question and context of the next turn. */
function turnFromPress(press: SurfacePress): { text: string; context: TurnContext } | null {
  const context = press.context ?? {};
  const pair = asPair(context.pair);
  if (press.name === "set_range" && (context.range === "1d" || context.range === "1w")) {
    return {
      text: context.range === "1d" ? "Show the last 24 hours" : "Show the last week",
      context: { pair, range: context.range },
    };
  }
  if (press.name === "set_pair" && pair) {
    return { text: `Show ${pair.from} to ${pair.to}`, context: { pair } };
  }
  if (press.name === "set_amount" && typeof context.amount === "string" && pair) {
    return { text: `Compare providers for ${context.amount} ${pair.from}`, context: { pair, amount: context.amount } };
  }
  return null;
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={enter}
      className="mr-auto flex w-max items-center gap-1 rounded-[14px] rounded-bl-[5px] bg-[#f2f1f8] px-3.5 py-3"
    >
      <Loader size={22} darkColor="#623CEA" lightColor="#c9bfff" label="FX Ask is thinking" />
    </motion.div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[10px] bg-[#ece9f6] motion-reduce:animate-none ${className}`} />;
}

function WorkspaceSkeleton() {
  return (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="space-y-3"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <div className="rounded-[16px] border border-[#e4e1ef] bg-white p-4">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="mt-3 h-6 w-56" />
      </div>
      {["h-[250px]", "h-[300px]", "h-[220px]"].map((height) => (
        <div key={height} className="rounded-[16px] border border-[#e4e1ef] bg-white p-4">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="mt-2 h-3 w-20" />
          <SkeletonBlock className={`mt-4 w-full ${height}`} />
        </div>
      ))}
    </motion.div>
  );
}

export default function AskExperience({
  initialFrom,
  initialTo,
  initialAmount,
  initialQuestion,
  initialVariant = null,
}: {
  initialFrom: Currency;
  initialTo: Currency;
  initialAmount: string;
  initialQuestion: string;
  initialVariant?: AskVariant | null;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [amount, setAmount] = useState(initialAmount);
  const [historyPeriod, setHistoryPeriod] = useState<RateHistoryPeriod>("week");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "user", text: initialQuestion }]);
  const [status, setStatus] = useState<Status>("thinking");
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [variant, setVariant] = useState<AskVariant | null>(initialVariant);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const surfaces = useFxSurfaces();
  const desktop = useDesktop();
  const market = useFxMarket(from, to, amount, historyPeriod);
  const contextKey = `${initialFrom}:${initialTo}:${initialAmount}:${initialQuestion}`;
  const providerLinks = useMemo<ProviderLink[]>(() => {
    const byName = new Map<string, string>();
    for (const provider of directory) {
      if (provider.url) byName.set(provider.name, provider.url);
    }
    for (const quote of market.quotes) {
      if (quote.website) byName.set(quote.name, quote.website);
    }
    return [...byName].map(([name, url]) => ({ name, url }));
  }, [market.quotes]);
  // The "panels" arm draws the agent's A2UI cards; the "text" arm answers in
  // the thread only.
  const showPanels = variant === "panels";
  const textAnswer = !showPanels;
  const latestSurfaceId = [...messages].reverse().map((message) => surfaceIdOf(message.a2ui)).find(Boolean);
  const latestSurface = latestSurfaceId && surfaces?.get(latestSurfaceId) ? latestSurfaceId : undefined;
  const [alert, setAlert] = useState<{ open: boolean; target?: string }>({ open: false });

  // Every answer's cards, whether just received or restored from the session.
  // Applying is idempotent: a surface that already exists is kept.
  useEffect(() => {
    if (!surfaces) return;
    for (const message of messages) surfaces.apply(message.a2ui);
  }, [messages, surfaces]);

  useEffect(() => {
    const assigned = initialVariant ?? assignAskVariant();
    setVariant(assigned);
    rememberAskVariant(assigned);
  }, [initialVariant]);

  // Session restore writes state after mount so the server HTML and the first
  // client render stay the same.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let restored = false;
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          contextKey?: string;
          messages?: Message[];
          from?: Currency;
          to?: Currency;
          amount?: string;
          historyPeriod?: RateHistoryPeriod;
        };
        if (parsed.contextKey === contextKey && Array.isArray(parsed.messages) && parsed.messages.length > 1) {
          restored = true;
          setMessages(parsed.messages);
          if (parsed.from && currencyList.includes(parsed.from)) setFrom(parsed.from);
          if (parsed.to && currencyList.includes(parsed.to)) setTo(parsed.to);
          const savedAmount = Number(parsed.amount);
          if (Number.isFinite(savedAmount) && savedAmount > 0 && savedAmount <= 1_000_000_000) setAmount(String(savedAmount));
          if (parsed.historyPeriod === "day" || parsed.historyPeriod === "week") setHistoryPeriod(parsed.historyPeriod);
        }
      }
    } catch {
      // Storage may be unavailable or contain invalid data; start with the URL context.
    }
    setSessionRestored(true);
    if (!variant) return;

    const workspaceTimer = setTimeout(() => setWorkspaceReady(true), restored ? 200 : workspaceDelay);
    const controller = new AbortController();
    if (restored) {
      setStatus("idle");
    } else {
      void askFx({
        messages: [{ role: "user", content: initialQuestion }],
        pair: { from: initialFrom, to: initialTo },
        amount: initialAmount,
        range: "1w",
        presentation: "panels",
      }, controller.signal).then((result) => {
        if (result.view?.range === "1d") setHistoryPeriod("day");
        setMessages((current) => [...current, {
          id: Date.now(),
          role: "assistant",
          text: result.response.text,
          a2ui: result.a2ui,
        }]);
        setStatus("idle");
      }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessages((current) => [...current, {
          id: Date.now(),
          role: "assistant",
          text: error instanceof Error ? error.message : "The assistant is not available yet.",
        }]);
        setStatus("idle");
      });
    }
    return () => {
      clearTimeout(workspaceTimer);
      controller.abort();
    };
  }, [contextKey, initialFrom, initialAmount, initialQuestion, initialTo, variant]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!sessionRestored) return;
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({
        contextKey,
        messages,
        from,
        to,
        amount,
        historyPeriod,
      }));
    } catch {
      // Keep the current conversation usable when storage is disabled or full.
    }
  }, [amount, contextKey, from, historyPeriod, messages, sessionRestored, to]);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    messageEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [messages, status]);

  function appendMessage(role: Message["role"], text: string, a2ui?: unknown[]) {
    setMessages((current) => [...current, { id: Date.now() + Math.random(), role, text, a2ui }]);
  }

  // A press on a card is a new turn: its question, with the card's choice as
  // context. The listener reads the latest render through a ref.
  const pressRef = useRef<(press: SurfacePress) => void>(() => {});
  useEffect(() => {
    pressRef.current = (press) => {
      // Opening the alert form is local: an alert only exists once the user confirms it.
      if (press.name === "open_alert") {
        const pair = asPair(press.context?.pair);
        if (pair) {
          setFrom(pair.from);
          setTo(pair.to);
        }
        const target = press.context?.target;
        setAlert({ open: true, target: typeof target === "string" ? target : undefined });
        return;
      }
      const turn = turnFromPress(press);
      if (turn) submitQuestion(turn.text, turn.context);
    };
  });
  useEffect(() => {
    if (!surfaces) return;
    surfaces.onPress((press) => pressRef.current(press));
    return () => surfaces.onPress(null);
  }, [surfaces]);

  function submitQuestion(value: string, context: TurnContext = {}) {
    const text = value.trim();
    if (!text || status === "thinking") return;
    const history = messages.flatMap((message) =>
      message.role === "user" || message.role === "assistant"
        ? [{ role: message.role, content: message.text }]
        : [],
    );
    appendMessage("user", text);
    setQuestion("");
    setStatus("thinking");
    void askFx({
      messages: recentConversations(history, text),
      pair: context.pair ?? { from, to },
      amount: context.amount ?? amount.replaceAll(",", ""),
      range: context.range ?? (historyPeriod === "day" ? "1d" : "1w"),
      presentation: "panels",
    }).then((result) => {
      if (result.view?.pair.from && currencyList.includes(result.view.pair.from as Currency)) {
        setFrom(result.view.pair.from as Currency);
      }
      if (result.view?.pair.to && currencyList.includes(result.view.pair.to as Currency)) {
        setTo(result.view.pair.to as Currency);
      }
      if (result.view?.amount) setAmount(result.view.amount);
      if (result.view?.range === "1d") setHistoryPeriod("day");
      if (result.view?.range === "1w") setHistoryPeriod("week");
      appendMessage("assistant", result.response.text, result.a2ui);
      setStatus("idle");
      inputRef.current?.focus();
    }).catch((error: unknown) => {
      appendMessage(
        "assistant",
        error instanceof Error ? error.message : "The assistant is not available yet.",
      );
      setStatus("idle");
      inputRef.current?.focus();
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  return (
    <MotionConfig reducedMotion="user">
      <AskDock from={from} to={to} amount={amount} />
      <main className={`bg-[#f7f6fc] font-display text-[#19182c] ${textAnswer ? "min-h-screen" : "grid min-h-screen lg:h-[calc(100svh-74px)] lg:min-h-0 lg:grid-cols-[minmax(320px,36%)_minmax(0,1fr)] lg:overflow-hidden"}`}>
        <section className={`flex min-h-screen min-w-0 flex-col border-[#e2def3] bg-white ${textAnswer ? "mx-auto w-full max-w-2xl" : "border-b lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r"}`} aria-label="Ask FX Swift">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#eeedf4] px-4 sm:px-5">
            <Link href="/" className="text-[12px] font-medium text-[#686781] transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              ← Back to rates
            </Link>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
              <span aria-hidden="true">✦</span> FX Ask
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite" aria-relevant="additions">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={enter}
              className="mb-4 text-center text-[11px] text-[#77758f]"
            >
              Carried over: {number(Number(amount) || 0, 2)} {from} → {to}
            </motion.p>
            <div className="space-y-2.5">
              {messages.map((message) => message.role === "system" ? (
                <motion.p
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={enter}
                  className="m-0 text-center text-[11px] italic text-[#88869e]"
                >
                  {message.text}
                </motion.p>
              ) : (
                <div key={message.id} className="space-y-2">
                  <motion.p
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={enter}
                    style={{ transformOrigin: message.role === "user" ? "bottom right" : "bottom left" }}
                    className={`m-0 w-fit max-w-[85%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2.5 text-[13.5px] leading-[1.5] ${
                      message.role === "user"
                        ? "ml-auto rounded-br-[5px] bg-primary text-white"
                        : "mr-auto rounded-bl-[5px] bg-[#f2f1f8] text-[#25243a]"
                    }`}
                  >
                    {linkProviderNames(message.text, providerLinks)}
                  </motion.p>
                  {/* Mobile only: the A2UI card this answer produced, attached
                      right under it, like an AI chat tool result. Desktop shows
                      the latest card in the workspace column instead, so inline
                      cards are not mounted there (a hidden chart has no size). */}
                  {showPanels && !desktop && message.role === "assistant" && (() => {
                    const id = surfaceIdOf(message.a2ui);
                    return surfaces && id && surfaces.get(id) ? (
                      <div className="lg:hidden">
                        <ChatAttachment>
                          <SurfaceView store={surfaces} id={id} />
                        </ChatAttachment>
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
              {showPanels && !workspaceReady && (
                <div className="lg:hidden">
                  <ChatSkeletonCard />
                </div>
              )}
              <AnimatePresence>{status === "thinking" && <TypingIndicator key="typing" />}</AnimatePresence>
              <div ref={messageEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-[#e7e3f4] bg-white p-3 sm:px-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  disabled={status === "thinking"}
                  onClick={() => submitQuestion(suggestion)}
                  className="min-h-7 rounded-full border border-[#b7a8ff] bg-white px-2.5 py-0.5 text-[11.5px] text-[#29273f] transition-colors hover:bg-[#f5f2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pl-3 transition-shadow focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--blue)_14%,transparent)]">
              <label htmlFor="ask-follow-up" className="sr-only">Ask a follow-up question</label>
              <input
                ref={inputRef}
                id="ask-follow-up"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a follow-up…"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13.5px] outline-none placeholder:text-[#88869e] focus:!border-0 focus-visible:outline-none"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={status === "thinking" || !question.trim()}
                className="min-h-9 rounded-full border-0 bg-primary px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "thinking" ? (
                  <Loader size={19} darkColor="#ffffff" lightColor="#d9d0ff" label="Sending question" />
                ) : "Send"}
              </motion.button>
            </form>
          </div>
        </section>

        {showPanels && <motion.section
          layoutScroll
          className="hidden min-w-0 overflow-y-auto bg-[#f5f4fa] px-3 py-4 sm:px-4 lg:block lg:h-full xl:px-6"
          aria-label="Rate workspace"
        >
          <div className="mx-auto max-w-[720px] [&_#trend]:!mb-0 [&_#compare]:!mb-0">
            <AnimatePresence mode="wait" initial={false}>
              {!workspaceReady || (!latestSurface && status === "thinking") ? (
                <WorkspaceSkeleton key="skeleton" />
              ) : (
                <motion.div
                  key={latestSurfaceId ?? "empty"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={enter}
                  className="space-y-3"
                >
                  {surfaces && latestSurface ? (
                    <SurfaceView store={surfaces} id={latestSurface} />
                  ) : (
                    <p className="rounded-[16px] border border-[#e4e1ef] bg-white p-4 text-[13px] text-[#77758f]">
                      Ask about a rate, a trend or providers and the details appear here.
                    </p>
                  )}
                  <p className="pb-3 text-center text-[11px] text-[#77758f]">Indicative rates; provider rates and fees may vary.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>}
      </main>
      <RateAlertDialog
        open={alert.open}
        onClose={() => setAlert({ open: false })}
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        initialTarget={alert.target}
      />
    </MotionConfig>
  );
}
