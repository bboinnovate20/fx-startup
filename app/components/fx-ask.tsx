"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { assignAskVariant } from "../lib/ask-variant";
import type { Currency } from "./data/fx-data";

const suggestions = ["What is yesterday price?", "Cheapest provider?", "7-day trend"];
const openEvent = "fx-open-ask";

function closeDuration() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--resize-dur");
  const ms = parseFloat(raw);
  return Number.isFinite(ms) ? ms : 300;
}

export function openAsk(question = "") {
  window.dispatchEvent(new CustomEvent(openEvent, { detail: question }));
}

export function AskDock({ from, to, amount }: { from: Currency; to: Currency; amount: string }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function reveal(next: string) {
      if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
      setQuestion(next);
      setOpen(true);
      setShown(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
    }
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      reveal(typeof detail === "string" ? detail : "");
    }
    window.addEventListener(openEvent, onOpen);
    return () => window.removeEventListener(openEvent, onOpen);
  }, []);

  useEffect(() => {
    if (!shown) return;
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setShown(false);
        closeTimer.current = window.setTimeout(() => setOpen(false), closeDuration());
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shown]);

  function closeDock() {
    setShown(false);
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), closeDuration());
  }

  function submitQuestion(value: string) {
    const text = value.trim();
    if (!text) return;
    const params = new URLSearchParams({
      q: text,
      from,
      to,
      amount: amount.replaceAll(",", "") || "10",
      variant: assignAskVariant(),
    });
    router.push(`/ask?${params.toString()}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center px-4 pb-4 sm:pb-6">
      <button
        type="button"
        aria-label="Close ask"
        className={`t-ask-fade absolute inset-0 border-0 bg-[#090319]/40 ${shown ? "is-open" : ""}`}
        onClick={closeDock}
      />
      <form
        onSubmit={handleSubmit}
        className={`t-resize t-ask-fade relative z-[1] flex h-14 items-center gap-2 rounded-full border border-[#d9d3f5] bg-white px-4 shadow-[0_16px_40px_rgba(18,16,40,0.18)] ${shown ? "is-open w-[min(540px,calc(100vw-32px))]" : "w-[min(240px,calc(100vw-96px))]"}`}
      >
        <label htmlFor={inputId} className="sr-only">Ask about this rate</label>
        <input
          ref={inputRef}
          id={inputId}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this rate…"
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-[#17152c] outline-none placeholder:text-[#77758b]"
        />
        <button
          type="submit"
          aria-label="Send question"
          disabled={!question.trim()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-0 bg-primary text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src="/icons/arrow-up-right.svg" alt="" aria-hidden="true" className="h-3.5 w-3.5 brightness-0 invert" />
        </button>
      </form>
    </div>,
    document.body,
  );
}

export function FxAsk() {
  return (
    <section className="mt-3 rounded-[14px] border border-[#b7a8ff] bg-[#efebff] px-3 pb-2" aria-label="Ask about this rate">
      <button
        type="button"
        onClick={() => openAsk()}
        className="-mx-3 flex w-[calc(100%+24px)] items-center gap-2 border-0 bg-transparent px-3 py-2 text-left text-[13px] leading-5 text-[#77758b]"
      >
        <span className="shrink-0 text-[14px] leading-none text-[#17152c]" aria-hidden="true">✦</span>
        <span className="min-w-0 flex-1 truncate">Ask about this rate…</span>
      </button>
      <div
        className="mt-1.5 flex w-full flex-nowrap gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Suggested questions"
      >
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => openAsk(suggestion)}
            className="min-h-7 shrink-0 whitespace-nowrap rounded-full border border-[#b7a8ff] bg-white px-2.5 py-0.5 text-left text-[12px] text-[#17152c] transition-colors hover:bg-[#f8f6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
