"use client";

import { useEffect, useState } from "react";
import { openAsk } from "./fx-ask";
import { Brand } from "./ui/Brand";
import { Button } from "./ui/Button";
import { ButtonBadge } from "./ui/ButtonBadges";

const links = [
  ["Exchange rates", "#rates"],
  ["Compare", "#compare"],
  ["Rate alerts", "#alerts"],
] as const;

export function Header({
  startTarget = "converter",
  blend = false,
}: {
  startTarget?: string;
  blend?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-[74px] text-white max-[700px]:h-16">
      <div
        aria-hidden="true"
        className={`site-header-surface bg-primary/80 backdrop-blur-sm pointer-events-none absolute inset-0 -z-10 ${!blend || scrolled ? "is-solid" : ""}`}
      />
      <div className="relative mx-auto flex h-full w-full max-w-360 items-center gap-6 px-6 sm:px-8 lg:px-12 2xl:px-25 max-[700px]:gap-3 max-[700px]:px-4">
        <Brand />

        <nav
          aria-label="Main navigation"
          className="ml-8 flex items-center gap-3 max-[700px]:hidden"
        >
          {links.map(([label, href]) => (
            <a href={href} key={href}>
              <ButtonBadge className="border border-white/30 bg-white text-black! transition-colors duration-150 hover:bg-primary-hover hover:text-white!">
                {label}
              </ButtonBadge>
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-5 max-[700px]:gap-2">
          <a className="text-[14px] font-semibold text-white/80 transition-colors duration-150 hover:text-white max-[900px]:hidden" href="#alerts">
            Log in
          </a>
          <button
            type="button"
            onClick={() => {
              close();
              openAsk();
            }}
            className="rounded-full border border-white/35 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[700px]:px-2 max-[700px]:py-1.5 max-[700px]:text-[11px]"
          >
            Ask AI
          </button>
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
            className="hidden h-11 w-11 shrink-0 place-items-center rounded-full text-white transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.96] max-[700px]:inline-grid"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="t-icon-swap h-5 w-5" data-state={open ? "b" : "a"}>
              <span className="t-icon grid h-5 w-5 place-items-center" data-icon="a">
                <img src="/icons/menu.svg" alt="" className="h-5 w-5 object-contain brightness-0 invert" />
              </span>
              <span className="t-icon grid h-5 w-5 place-items-center" data-icon="b">
                <img src="/icons/cancel-2.svg" alt="" className="h-3.5 w-3.5 object-contain brightness-0 invert" />
              </span>
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 hidden bg-transparent max-[700px]:block"
          aria-label="Close navigation"
          onClick={close}
        />
      ) : null}

      <nav
        id="primary-navigation"
        aria-label="Mobile navigation"
        data-open={open ? "true" : "false"}
        inert={!open}
        className="t-panel-slide absolute inset-x-3 top-full z-40 mt-2 hidden max-h-[60dvh] flex-col overflow-y-auto rounded-[20px] bg-navy max-[700px]:flex"
      >
        <ul className="m-0 flex list-none flex-col gap-2.5 p-2.5">
          {links.map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                onClick={close}
                className="flex min-h-11 items-center justify-between px-3 font-display text-[18px] font-semibold tracking-[-0.03em] text-white transition-colors duration-150 hover:text-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {label}
                <img src="/icons/chevron-right.svg" alt="" className="h-4 w-4 shrink-0 brightness-0 invert opacity-70" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
