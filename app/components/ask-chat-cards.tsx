"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { number, type Currency } from "./data/fx-data";

const cardEnter = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

// Shared shell for the mobile chat attachments: a compact card that sits
// under an assistant bubble, distinct from the desktop workspace panels.
function ChatCardShell({
  eyebrow,
  focused,
  children,
}: {
  eyebrow: string;
  focused?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={cardEnter}
      className={`mr-auto w-full max-w-[92%] rounded-[14px] border bg-white p-3.5 shadow-[0_8px_20px_rgba(31,26,64,0.06)] ${
        focused ? "border-primary ring-1 ring-primary/30" : "border-[#e4e1ef]"
      }`}
    >
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9491ac]">
        {eyebrow}
      </span>
      {children}
    </motion.div>
  );
}

// Wrapper for attachments that reuse an existing compact component (chart,
// provider comparison, alert form) so those stay a single source of truth.
export function ChatAttachment({ children, focused }: { children: ReactNode; focused?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={cardEnter}
      className={`mr-auto w-full max-w-[92%] overflow-hidden rounded-[14px] transition-shadow ${
        focused ? "ring-2 ring-primary ring-offset-2 ring-offset-white" : ""
      }`}
    >
      {children}
    </motion.div>
  );
}

export function ChatSkeletonCard() {
  return (
    <ChatCardShell eyebrow="Preparing workspace">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#ece9f6] motion-reduce:animate-none" />
        <div className="h-6 w-40 animate-pulse rounded-[8px] bg-[#ece9f6] motion-reduce:animate-none" />
      </div>
    </ChatCardShell>
  );
}

export function RateChatCard({
  from,
  to,
  rate,
  focused,
}: {
  from: Currency;
  to: Currency;
  rate: number | null;
  focused?: boolean;
}) {
  return (
    <ChatCardShell eyebrow="Current rate" focused={focused}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="m-0 text-[11px] text-[#77758f]">{from} → {to}</p>
          <p className="m-0 mt-1 text-[19px] font-semibold tracking-[-0.03em] text-[#1a192d]">
            1 {from} = {rate === null ? "—" : number(rate, rate < 10 ? 4 : 2)} {to}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f2f1f8] px-2.5 py-1 text-[10px] font-medium text-[#5b5876]">
          Indicative
        </span>
      </div>
    </ChatCardShell>
  );
}
