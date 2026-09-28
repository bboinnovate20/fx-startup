"use client";

import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertForm } from "./alert-form";
import { ChatAttachment, ChatSkeletonCard, RateChatCard } from "./ask-chat-cards";
import Loader from "./loading-icon";
import { currencyList, getRate, number, type Currency } from "./data/fx-data";
import type { ProviderInfo } from "./data/providers";
import { ProviderComparison } from "./provider-comparison";
import { TrendSection } from "./trend-section";
import type { RateHistoryPeriod } from "./ui/rate-history-chart";

type Message = { id: number; role: "user" | "assistant" | "system"; text: string; panel?: Panel };
type Panel = "rate" | "chart" | "providers" | "alert";
type Status = "idle" | "thinking";

const suggestions = ["What about EUR?", "Show 24 hours", "Cheapest provider?"];
const panels: Panel[] = ["rate", "chart", "providers", "alert"];
const sessionKey = "fx-ask-session-v1";
// Simulated latency until /api/ask exists; keeps the loading states exercised.
const replyDelay = 850;
const workspaceDelay = 650;

const ease = [0.22, 1, 0.36, 1] as const;
const enter: Transition = { duration: 0.32, ease };
const reorder: Transition = { type: "spring", bounce: 0, visualDuration: 0.45 };

function openingReply(from: Currency, to: Currency) {
  return `I’ve opened the ${from} to ${to} rate, provider comparison, and illustrative rate history. Rates and fees may vary.`;
}

function focusFor(question: string): Panel {
  if (/provider|cheapest/i.test(question)) return "providers";
  if (/trend|history|time/i.test(question)) return "chart";
  if (/alert|target/i.test(question)) return "alert";
  return "rate";
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
}: {
  initialFrom: Currency;
  initialTo: Currency;
  initialAmount: string;
  initialQuestion: string;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [amount, setAmount] = useState(initialAmount);
  const [historyPeriod, setHistoryPeriod] = useState<RateHistoryPeriod>("week");
  const [focus, setFocus] = useState<Panel>(focusFor(initialQuestion));
  const [question, setQuestion] = useState("");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: "user", text: initialQuestion }]);
  const [status, setStatus] = useState<Status>("thinking");
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const amountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rate = getRate(from, to);
  const contextKey = `${initialFrom}:${initialTo}:${initialAmount}:${initialQuestion}`;

  useEffect(() => {
    let active = true;
    fetch("/data/providers.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load providers");
        return response.json() as Promise<ProviderInfo[]>;
      })
      .then((data) => {
        if (active && Array.isArray(data)) setProviders(data);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (amountTimerRef.current) clearTimeout(amountTimerRef.current);
    };
  }, []);

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
          focus?: Panel;
        };
        if (parsed.contextKey === contextKey && Array.isArray(parsed.messages) && parsed.messages.length > 1) {
          restored = true;
          setMessages(parsed.messages);
          if (parsed.from && currencyList.includes(parsed.from)) setFrom(parsed.from);
          if (parsed.to && currencyList.includes(parsed.to)) setTo(parsed.to);
          const savedAmount = Number(parsed.amount);
          if (Number.isFinite(savedAmount) && savedAmount > 0 && savedAmount <= 1_000_000_000) setAmount(String(savedAmount));
          if (parsed.historyPeriod === "day" || parsed.historyPeriod === "week") setHistoryPeriod(parsed.historyPeriod);
          if (parsed.focus && panels.includes(parsed.focus)) setFocus(parsed.focus);
        }
      }
    } catch {
      // Storage may be unavailable or contain invalid data; start with the URL context.
    }
    setSessionRestored(true);

    const workspaceTimer = setTimeout(() => setWorkspaceReady(true), restored ? 200 : workspaceDelay);
    if (restored) {
      setStatus("idle");
    } else {
      const openingFocus = focusFor(initialQuestion);
      replyTimerRef.current = setTimeout(() => {
        setMessages((current) => [...current, {
          id: Date.now(),
          role: "assistant",
          text: openingReply(initialFrom, initialTo),
          panel: openingFocus,
        }]);
        setStatus("idle");
      }, replyDelay);
    }
    return () => {
      clearTimeout(workspaceTimer);
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, [contextKey, initialFrom, initialQuestion, initialTo]);

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
        focus,
      }));
    } catch {
      // Keep the current conversation usable when storage is disabled or full.
    }
  }, [amount, contextKey, focus, from, historyPeriod, messages, sessionRestored, to]);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    messageEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [messages, status]);

  function appendMessage(role: Message["role"], text: string, panel?: Panel) {
    setMessages((current) => [...current, { id: Date.now() + Math.random(), role, text, panel }]);
  }

  function updateAmount(value: string) {
    setAmount(value);
    if (amountTimerRef.current) clearTimeout(amountTimerRef.current);
    amountTimerRef.current = setTimeout(() => {
      const numericValue = Number(value.replaceAll(",", ""));
      if (Number.isFinite(numericValue) && numericValue > 0) {
        appendMessage("system", `Amount updated to ${number(numericValue, 2)} ${from}.`);
      }
    }, 900);
  }

  function updateHistoryPeriod(period: RateHistoryPeriod) {
    setHistoryPeriod(period);
    appendMessage("system", `Rate history changed to ${period === "day" ? "24 hours" : "1 week"}.`);
  }

  function respond(text: string) {
    let nextFocus: Panel = "rate";
    let response = openingReply(from, to);
    if (/24\s*hours?|1\s*day/i.test(text)) {
      setHistoryPeriod("day");
      nextFocus = "chart";
      response = "The rate history panel is now showing the 24-hour range. The chart is illustrative.";
    } else if (/7\s*days?|1\s*week|week|trend|history/i.test(text)) {
      setHistoryPeriod("week");
      nextFocus = "chart";
      response = "The rate history panel is showing the one-week range. The chart is illustrative.";
    } else if (/cheapest|provider|compare/i.test(text)) {
      nextFocus = "providers";
      response = "I’ve highlighted the provider comparison. The displayed rates and fees are sample estimates.";
    } else if (/alert|target/i.test(text)) {
      nextFocus = "alert";
      response = "I’ve highlighted the alert form. It won’t create an alert until you submit the form.";
    } else if (/\bEUR\b/i.test(text)) {
      const nextFrom = to === "EUR" ? from : "EUR";
      const nextTo = to === "EUR" ? "NGN" : to;
      setFrom(nextFrom);
      setTo(nextTo);
      nextFocus = "chart";
      response = `I’ve updated the workspace to ${nextFrom} to ${nextTo}. Rates and chart history are indicative.`;
    }
    setFocus(nextFocus);
    appendMessage("assistant", response, nextFocus);
  }

  function submitQuestion(value: string) {
    const text = value.trim();
    if (!text || status === "thinking") return;
    appendMessage("user", text);
    setQuestion("");
    setStatus("thinking");
    replyTimerRef.current = setTimeout(() => {
      respond(text);
      setStatus("idle");
      inputRef.current?.focus();
    }, replyDelay);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  const panelOrder = panels.filter((panel) => panel !== "rate" && panel !== focus);
  if (focus !== "rate") panelOrder.unshift(focus);

  function renderPanel(panel: Panel) {
    return (
      <motion.div
        key={panel}
        layout="position"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ default: { ...enter, delay: panelOrder.indexOf(panel) * 0.06 }, layout: reorder }}
        className={`rounded-[16px] ring-offset-2 ring-offset-[#f5f4fa] transition-shadow duration-300 ${
          focus === panel ? "ring-2 ring-primary" : "ring-0 ring-transparent"
        }`}
      >
        {panel === "chart" && (
          <TrendSection
            from={from}
            to={to}
            setFrom={setFrom}
            setTo={setTo}
            rate={rate}
            historyPeriod={historyPeriod}
            setHistoryPeriod={updateHistoryPeriod}
            compact
          />
        )}
        {panel === "providers" && (
          <ProviderComparison
            from={from}
            to={to}
            amount={amount}
            setAmount={updateAmount}
            rate={rate}
            providers={providers}
            compact
            showInput={false}
          />
        )}
        {panel === "alert" && (
          <section className="rounded-[16px] bg-white" id="alerts">
            <AlertForm from={from} to={to} setFrom={setFrom} setTo={setTo} compact />
          </section>
        )}
      </motion.div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="grid min-h-screen bg-[#f7f6fc] font-display text-[#19182c] lg:h-[calc(100svh-74px)] lg:min-h-0 lg:grid-cols-[minmax(320px,36%)_minmax(0,1fr)] lg:overflow-hidden">
        <section className="flex min-h-screen min-w-0 flex-col border-b border-[#e2def3] bg-white lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r" aria-label="Ask FX Swift">
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
                    {message.text}
                  </motion.p>
                  {/* Mobile only: the workspace panel this answer produced, attached
                      right under it, like an AI chat tool result. Desktop keeps the
                      panel in the workspace column instead. */}
                  {message.role === "assistant" && message.panel && (
                    <div className="space-y-2 lg:hidden">
                      <RateChatCard from={from} to={to} rate={rate} focused={message.panel === "rate"} />
                      {message.panel === "chart" && (
                        <ChatAttachment focused>
                          <TrendSection
                            from={from}
                            to={to}
                            setFrom={setFrom}
                            setTo={setTo}
                            rate={rate}
                            historyPeriod={historyPeriod}
                            setHistoryPeriod={updateHistoryPeriod}
                            compact
                          />
                        </ChatAttachment>
                      )}
                      {message.panel === "providers" && (
                        <ChatAttachment focused>
                          <ProviderComparison
                            from={from}
                            to={to}
                            amount={amount}
                            setAmount={updateAmount}
                            rate={rate}
                            providers={providers}
                            compact
                            showInput={false}
                          />
                        </ChatAttachment>
                      )}
                      {message.panel === "alert" && (
                        <ChatAttachment focused>
                          <section className="rounded-[14px] bg-white" id="alerts">
                            <AlertForm from={from} to={to} setFrom={setFrom} setTo={setTo} compact />
                          </section>
                        </ChatAttachment>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {!workspaceReady && (
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

        <motion.section
          layoutScroll
          className="hidden min-w-0 overflow-y-auto bg-[#f5f4fa] px-3 py-4 sm:px-4 lg:block lg:h-full xl:px-6"
          aria-label="Rate workspace"
        >
          <div className="mx-auto max-w-[720px] [&_#trend]:!mb-0 [&_#compare]:!mb-0">
            <AnimatePresence mode="wait" initial={false}>
              {!workspaceReady ? (
                <WorkspaceSkeleton key="skeleton" />
              ) : (
                <motion.div
                  key="workspace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={enter}
                  className="space-y-3"
                >
                  <section id="rates" className={`rounded-[16px] border border-[#e4e1ef] bg-white p-4 transition-shadow duration-300 ${focus === "rate" ? "ring-2 ring-primary ring-offset-2 ring-offset-[#f5f4fa]" : ""}`} aria-label="Current rate">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#77758f]">
                      <span>{from} → {to}</span>
                      <span>Indicative market rate</span>
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={`${from}-${to}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease }}
                        className="mb-0 mt-1 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#1a192d] sm:text-[24px]"
                      >
                        1 {from} = {rate === null ? "—" : number(rate, rate < 10 ? 4 : 2)} {to}
                      </motion.p>
                    </AnimatePresence>
                  </section>

                  {panelOrder.map(renderPanel)}
                  <p className="pb-3 text-center text-[11px] text-[#77758f]">Indicative rates; provider rates and fees may vary.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
    </MotionConfig>
  );
}
