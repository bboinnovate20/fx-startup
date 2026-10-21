"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertForm } from "./alert-form";
import type { Currency } from "./data/fx-data";

function closeDuration() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur");
  const ms = parseFloat(raw);
  return Number.isFinite(ms) ? ms : 150;
}

export function RateAlertDialog({
  open,
  onClose,
  from,
  to,
  setFrom,
  setTo,
}: {
  open: boolean;
  onClose: () => void;
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
}) {
  const headingId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [present, setPresent] = useState(false);
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setPresent(true);
    setPhase("closed");
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPhase("open"));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [open]);

  useEffect(() => {
    if (open || !present) return;
    setPhase("closing");
    const timer = window.setTimeout(() => {
      setPhase("closed");
      setPresent(false);
    }, closeDuration());
    return () => window.clearTimeout(timer);
  }, [open, present]);

  useEffect(() => {
    if (phase !== "open") return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (!present) return null;

  const stateClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close rate alert"
        className={`t-modal-backdrop absolute inset-0 border-0 bg-[#090319]/70 ${stateClass}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className={`t-modal relative z-10 max-h-[min(760px,calc(100svh-24px))] w-full max-w-[520px] overflow-y-auto rounded-[16px] shadow-[0_24px_80px_rgba(9,3,25,0.45)] outline-none ${stateClass}`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-[#f4f6fb] hover:text-[#171a18]"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
            <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
          </svg>
        </button>
        <AlertForm from={from} to={to} setFrom={setFrom} setTo={setTo} compact headingId={headingId} />
      </div>
    </div>,
    document.body,
  );
}
