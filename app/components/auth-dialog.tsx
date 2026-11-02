"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

const openAuthEvent = "fx-open-auth-dialog";

export function openAuthDialog(reason?: string) {
  window.dispatchEvent(new CustomEvent(openAuthEvent, { detail: reason }));
}

function closeDuration() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--modal-close-dur",
  );
  const ms = parseFloat(raw);
  return Number.isFinite(ms) ? ms : 150;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

export function AuthDialog({
  user,
  configured,
  onSignOut,
}: {
  user: SessionUser | null;
  configured: boolean;
  onSignOut: () => Promise<void>;
}) {
  const headingId = useId();
  const emailId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [present, setPresent] = useState(false);
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  function openModal(initialNotice = "") {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setNotice(initialNotice);
    setPresent(true);
    setPhase("closed");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("open"));
    });
  }

  function closeModal() {
    setPhase("closing");
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setPhase("closed");
      setPresent(false);
      setLoadingGoogle(false);
    }, closeDuration());
  }

  useEffect(() => {
    function onOpenEvent(event: Event) {
      const detail = (event as CustomEvent<string | undefined>).detail;
      openModal(typeof detail === "string" ? detail : "");
    }
    window.addEventListener(openAuthEvent, onOpenEvent);

    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    if (authParam === "unconfigured" || authParam === "error") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("auth");
      window.history.replaceState({}, "", nextUrl.toString());
      const message =
        authParam === "unconfigured"
          ? "Google OAuth credentials are not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable live Google sign-in."
          : "Could not complete Google sign-in. Please try again.";
      queueMicrotask(() => openModal(message));
    }

    return () => {
      window.removeEventListener(openAuthEvent, onOpenEvent);
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  function handleGoogleClick() {
    setNotice("");
    if (!configured) {
      setNotice(
        "Google OAuth credentials are not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.",
      );
      return;
    }
    setLoadingGoogle(true);
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase().endsWith("@gmail.com") && configured) {
      handleGoogleClick();
      return;
    }
    setNotice("Please use Continue with Google to sign in to PAS FX.");
  }

  if (!present || typeof document === "undefined") return null;

  const stateClass =
    phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close sign in dialog"
        className={`t-modal-backdrop absolute inset-0 border-0 bg-[#05020d]/78 backdrop-blur-[6px] ${stateClass}`}
        onClick={closeModal}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className={`t-modal relative z-10 w-full max-w-[392px] overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#13111c]/96 px-6 pb-6 pt-7 text-white shadow-[0_32px_90px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)_inset] outline-none sm:px-7 sm:pb-7 sm:pt-8 ${stateClass}`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={closeModal}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-white/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          </svg>
        </button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] shadow-[0_6px_20px_rgba(98,60,234,0.28)]">
          <img
            src="/icons/logo-white.svg"
            alt=""
            aria-hidden="true"
            className="h-6 w-auto object-contain"
          />
        </div>

        {user ? (
          <div className="text-center">
            <h2
              id={headingId}
              className="m-0 font-display text-[20px] font-semibold tracking-[-0.03em] text-white"
            >
              Signed in to PAS FX
            </h2>
            <p className="m-0 mt-1.5 text-[13px] text-white/55">{user.email}</p>

            <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3.5 text-left">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-[14px] font-bold text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[14px] font-semibold text-white">
                  {user.name}
                </p>
                <p className="m-0 truncate text-[12px] text-white/55">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void onSignOut().then(() => closeModal());
              }}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-[11px] border border-white/14 bg-white/[0.07] text-[13.5px] font-semibold text-white transition hover:bg-white/[0.12]"
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2
                id={headingId}
                className="m-0 font-display text-[21px] font-semibold tracking-[-0.03em] text-white"
              >
                Welcome to PAS FX
              </h2>
              <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-white/55">
                Sign in or sign up to save pairs and manage rate alerts
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                disabled={loadingGoogle}
                onClick={handleGoogleClick}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[11px] border-0 bg-white px-4 text-[13.5px] font-semibold text-[#13111c] shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition hover:bg-white/92 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleMark />
                <span>
                  {loadingGoogle ? "Redirecting to Google…" : "Continue with Google"}
                </span>
              </button>
            </div>

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] font-semibold tracking-[0.08em] text-white/40">
                OR
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-2.5">
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-11 w-full rounded-[11px] border border-white/12 bg-white/[0.04] px-3.5 text-[13.5px] text-white outline-none transition placeholder:text-white/35 focus:border-white/35!"
              />
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[11px] border border-white/10 bg-white/[0.08] px-4 text-[13.5px] font-medium text-white/90 transition hover:bg-white/[0.13] hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4 text-white/65"
                >
                  <rect
                    x="2.5"
                    y="4.5"
                    width="15"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="m3.5 6 6.5 4.5L16.5 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Continue with email
              </button>
            </form>

            {notice && (
              <p
                role="status"
                className="m-0 mt-3.5 rounded-[10px] border border-white/12 bg-white/[0.05] px-3 py-2.5 text-center text-[12px] leading-relaxed text-white/80"
              >
                {notice}
              </p>
            )}

            <p className="m-0 mt-5 text-center text-[11.5px] leading-relaxed text-white/45">
              By continuing, you agree to our{" "}
              <a
                href="#about"
                onClick={closeModal}
                className="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white/80"
              >
                Terms of Service
              </a>{" "}
              &amp;{" "}
              <a
                href="#about"
                onClick={closeModal}
                className="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white/80"
              >
                Privacy Policy
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
