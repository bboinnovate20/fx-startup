"use client";

import { useState } from "react";
import { Brand } from "./ui/Brand";
import { Button } from "./ui/Button";
import { ButtonBadge } from "./ui/ButtonBadges";

const links = [
  ["Exchange rates", "#rates"],
  ["Compare", "#compare"],
  ["Rate alerts", "#alerts"],
  ["About", "#about"],
] as const;

export function Header({
  askHref = "#fx-ask-question",
  startTarget = "converter",
}: {
  askHref?: string;
  startTarget?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="relative z-40 h-[74px] bg-[var(--black)] text-white max-[700px]:h-16">
      <div className="relative mx-auto flex h-full w-full max-w-360 items-center gap-6 px-6 sm:px-8 lg:px-12 2xl:px-25 max-[700px]:gap-3 max-[700px]:px-4">
        <Brand />

        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          onKeyDown={(event) => event.key === "Escape" && close()}
          className={`ml-8 flex items-center gap-3 max-[700px]:absolute max-[700px]:left-0 max-[700px]:right-0 max-[700px]:top-full max-[700px]:z-50 max-[700px]:ml-0 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-1 max-[700px]:border-t max-[700px]:border-white/15 max-[700px]:bg-[var(--black)] max-[700px]:p-3 max-[700px]:shadow-lg max-[700px]:[&_a]:w-full max-[700px]:[&_a_span]:w-full max-[700px]:[&_a_span]:justify-start ${open ? "max-[700px]:flex" : "max-[700px]:hidden"}`}
        >
          {links.map(([label, href]) => (
            <a href={href} key={href} onClick={close}>
              <ButtonBadge className="border border-white/30 bg-white/10 text-white transition-colors hover:bg-primary-hover hover:text-white">
                {label}
              </ButtonBadge>
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-5 max-[700px]:gap-2">
          <a className="text-[14px] font-semibold text-white/80 hover:text-white max-[900px]:hidden" href="#alerts">
            Log in
          </a>
          <a
            href={askHref}
            className="rounded-full border border-white/35 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[700px]:px-2 max-[700px]:py-1.5 max-[700px]:text-[11px]"
          >
            Ask AI
          </a>
          <Button
            className="rounded-full px-4.5 py-2.5 max-[700px]:px-3 max-[700px]:py-2 [&_span]:text-[15px] max-[700px]:[&_span]:text-[13px]"
            onClick={() => {
              close();
              document.getElementById(startTarget)?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get started
            <img src="/icons/chevron-right.svg" alt="" className="h-4 w-4 brightness-0 invert" />
          </Button>
          <button
            type="button"
            className="hidden h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] rounded-lg border border-white/25 bg-white/10 text-white transition hover:bg-white/20 max-[700px]:flex"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <span className={`h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
