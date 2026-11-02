"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AuthDialog, openAuthDialog, type SessionUser } from "./auth-dialog";
import { openAsk } from "./fx-ask";
import { openRateAlert } from "./rate-alert-dialog";
import { Brand } from "./ui/Brand";
import { Button } from "./ui/Button";
import { ButtonBadge } from "./ui/ButtonBadges";

const links = [
  ["Exchange rates", "#rates"],
  ["Compare", "#compare"],
  ["Rate alerts", "#alerts"],
] as const;

const mobileLinks: ReadonlyArray<{
  label: string;
  href?: string;
  action?: "alerts" | "ask";
}> = [
  { label: "Exchange rates", href: "#rates" },
  { label: "Compare", href: "#compare" },
  { label: "Rate trend", href: "#trend" },
  { label: "Rate alerts", action: "alerts" },
  { label: "Ask AI", action: "ask" },
];

export function Header({
  startTarget = "converter",
  blend = false,
}: {
  startTarget?: string;
  blend?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authConfigured, setAuthConfigured] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setMounted(true);
    });
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            user?: SessionUser | null;
            configured?: boolean;
          } | null,
        ) => {
          if (!active || !data) return;
          setUser(data.user ?? null);
          setAuthConfigured(Boolean(data.configured));
        },
      )
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }

  return (
    <>
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
            {links.map(([label, href]) =>
              href === "#alerts" ? (
                <button
                  type="button"
                  key={href}
                  onClick={() => openRateAlert()}
                  className="border-0 bg-transparent p-0"
                >
                  <ButtonBadge className="border border-white/30 bg-white text-black! transition-colors duration-150 hover:bg-primary-hover hover:text-white!">
                    {label}
                  </ButtonBadge>
                </button>
              ) : (
                <a href={href} key={href}>
                  <ButtonBadge className="border border-white/30 bg-white text-black! transition-colors duration-150 hover:bg-primary-hover hover:text-white!">
                    {label}
                  </ButtonBadge>
                </a>
              ),
            )}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-4 max-[700px]:gap-2">
            <button
              type="button"
              onClick={() => openAuthDialog()}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[700px]:hidden"
            >
              {user ? (
                <>
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt=""
                      className="h-4.5 w-4.5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-white text-[10px] font-bold text-primary">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                close();
                openAsk();
              }}
              className="rounded-full border border-white/35 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[700px]:px-2.5 max-[700px]:py-1.5 max-[700px]:text-[11px]"
            >
              Ask AI
            </button>
            <Button
              className="rounded-full px-4.5 py-2.5 max-[700px]:px-3 max-[700px]:py-2 [&_span]:text-[15px] max-[700px]:[&_span]:text-[13px]"
              onClick={() => {
                close();
                document
                  .getElementById(startTarget)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get started
              <img
                src="/icons/chevron-right.svg"
                alt=""
                className="h-4 w-4 brightness-0 invert"
              />
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
                <span
                  className="t-icon grid h-5 w-5 place-items-center"
                  data-icon="a"
                >
                  <img
                    src="/icons/menu.svg"
                    alt=""
                    className="h-5 w-5 object-contain brightness-0 invert"
                  />
                </span>
                <span
                  className="t-icon grid h-5 w-5 place-items-center"
                  data-icon="b"
                >
                  <img
                    src="/icons/cancel-2.svg"
                    alt=""
                    className="h-3.5 w-3.5 object-contain brightness-0 invert"
                  />
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {mounted &&
        createPortal(
          <nav
            id="primary-navigation"
            aria-label="Mobile navigation"
            data-open={open ? "true" : "false"}
            inert={!open}
            className="t-mobile-menu fixed inset-0 z-[75] hidden flex-col justify-between overflow-y-auto bg-[#070312] px-6 pb-8 pt-3.5 text-white max-[700px]:flex"
          >
            <div>
              <div className="flex h-12 items-center justify-between">
                <div onClick={close}>
                  <Brand />
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="border-0 bg-transparent px-1 py-2 font-display text-[13px] font-semibold tracking-[0.16em] text-white/90 uppercase transition-colors hover:text-white"
                >
                  CLOSE
                </button>
              </div>

              <ul className="m-0 mt-10 flex list-none flex-col gap-5 p-0">
                {mobileLinks.map((item, index) => (
                  <li
                    key={item.label}
                    className="t-mobile-menu-item"
                    style={{
                      transitionDelay: open ? `${40 + index * 45}ms` : "0ms",
                    }}
                  >
                    {item.action ? (
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          if (item.action === "alerts") openRateAlert();
                          if (item.action === "ask") openAsk();
                        }}
                        className="border-0 bg-transparent p-0 text-left font-display text-[34px] font-semibold leading-[1.15] tracking-[-0.035em] text-white transition-colors hover:text-white/70"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        onClick={close}
                        className="block font-display text-[34px] font-semibold leading-[1.15] tracking-[-0.035em] text-white transition-colors hover:text-white/70"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="t-mobile-menu-item mt-10 flex flex-col gap-3"
              style={{
                transitionDelay: open
                  ? `${40 + mobileLinks.length * 45}ms`
                  : "0ms",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  close();
                  openAuthDialog();
                }}
                className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full border-0 bg-white px-6 font-display text-[15px] font-semibold text-[#090319] transition hover:bg-white/90 active:scale-[0.99]"
              >
                {user ? `Signed in as ${user.name}` : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  close();
                  document
                    .getElementById(startTarget)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex h-13 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.08] px-6 font-display text-[15px] font-semibold text-white transition hover:bg-white/[0.14] active:scale-[0.99]"
              >
                Get started
              </button>
            </div>
          </nav>,
          document.body,
        )}

      <AuthDialog
        user={user}
        configured={authConfigured}
        onSignOut={handleSignOut}
      />
    </>
  );
}
