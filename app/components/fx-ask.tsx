"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Currency } from "./data/fx-data";

const suggestions = ["Is now a good time?", "Cheapest provider?", "7-day trend"];

export function FxAsk({ from, to, amount }: { from: Currency; to: Currency; amount: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function submitQuestion(value: string) {
    const text = value.trim() || `What is the ${from} to ${to} rate and trend?`;
    const params = new URLSearchParams({ q: text, from, to, amount: amount.replaceAll(",", "") || "500" });
    router.push(`/ask?${params.toString()}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  return (
    <section className="mt-4 rounded-[18px] border border-[#b7a8ff] bg-[#efebff] p-3 sm:p-3.5" aria-label="Ask about this rate">
      <form onSubmit={handleSubmit}>
        <div className="flex min-h-10 items-center gap-2.5">
          <span className="shrink-0 text-[17px] leading-none text-[#17152c]" aria-hidden="true">✦</span>
          <label htmlFor="fx-ask-question" className="sr-only">Ask about this rate</label>
          <input
            id="fx-ask-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about this rate…"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-[#17152c] outline-none placeholder:text-[#77758b] focus-visible:outline-none"
          />
          <button
            type="submit"
            aria-label="Send question"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border-0 bg-primary text-[21px] leading-none text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img src="/icons/arrow-up-left.svg" alt="" aria-hidden="true" className="h-3.5 w-3.5 brightness-0 invert" />
          </button>
        </div>
        <div
          className="mt-2.5 flex w-full flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Suggested questions"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => submitQuestion(suggestion)}
              className="min-h-8 shrink-0 whitespace-nowrap rounded-full border border-[#b7a8ff] bg-white px-3 py-1 text-left text-[12px] text-[#17152c] transition-colors hover:bg-[#f8f6ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
