import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { Currency } from "./data/fx-data";
import { currencies, currencyList } from "./data/fx-data";

export function CurrencyPicker({
  value,
  onChange,
  label,
  variant = "default",
}: {
  value: Currency;
  onChange: (value: Currency) => void;
  label: string;
  variant?: "default" | "hero" | "pair";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(currencyList.indexOf(value));
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = currencies[value];
  const filtered = currencyList.filter((currency) =>
    `${currency} ${currencies[currency].name}`.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function choose(currency: Currency) {
    onChange(currency);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[activeIndex]) choose(filtered[activeIndex]);
      return;
    }

    if (!filtered.length) return;

    let nextIndex = activeIndex;
    if (event.key === "ArrowDown") nextIndex = (activeIndex + 1) % filtered.length;
    else if (event.key === "ArrowUp") nextIndex = (activeIndex - 1 + filtered.length) % filtered.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = filtered.length - 1;
    else return;

    event.preventDefault();
    setActiveIndex(nextIndex);
  }

  const hero = variant === "hero";
  const pair = variant === "pair";

  return (
    <div
      className={`currency-picker bg-gray-100 rounded-full font-display `}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery(""); }}}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}: ${selected.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setQuery("");
          setActiveIndex(currencyList.indexOf(value));
          setOpen((isOpen) => !isOpen);
        }}
        className={`flex h-full w-full items-center justify-center gap-2 rounded-[inherit] border-0 bg-gray-200 text-inherit focus-visible:outline-[3px] focus-visible:outline-primary focus-visible:outline-offset-2 ${hero ? "min-h-[42px] px-2 text-[17px] font-semibold" : pair ? "min-h-14 gap-2.5 px-3 text-[16px] font-bold" : "min-h-[33px] px-2 text-[11px] font-semibold"}`}
      >
        <img
          src={selected.icon}
          alt=""
          aria-hidden="true"
          className={`shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(16,35,61,0.16)] ${pair ? "h-8 w-8" : hero ? "h-[23px] w-[23px]" : "h-[19px] w-[19px]"}`}
        />
        {pair ? (
          <span className="min-w-0 text-left leading-tight">
            <span className="block text-[16px] font-bold">{value}</span>
            <span className="block max-w-full truncate text-[11px] font-medium text-[#64748b]">
              {selected.name}
            </span>
          </span>
        ) : (
          <span>{value}</span>
        )}
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 text-[#718096] ${hero || pair ? "ml-0.5 h-4 w-4" : "h-3 w-3"}`}>
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(280px,calc(100vw-32px))] overflow-hidden rounded-xl border border-[#dce4ee] bg-white p-1.5 text-[#172b4d] shadow-[0_16px_40px_rgba(18,40,72,0.18)]">
          <div className="flex h-10 items-center gap-2 border-b border-[#edf1f6] px-2">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#8390a2]">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              role="combobox"
              aria-label={`Search ${label.toLowerCase()}`}
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={id}
              aria-activedescendant={filtered[activeIndex] ? `${id}-${filtered[activeIndex]}` : undefined}
              placeholder="Search currency"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#172b4d] outline-none placeholder:text-[#98a3b2]"
            />
          </div>
          <div
            id={id}
            role="listbox"
            aria-label={label}
            className="max-h-[min(320px,calc(100vh-150px))] overflow-y-auto py-1"
          >
            {filtered.length ? filtered.map((currency, index) => {
              const item = currencies[currency];
              const isSelected = currency === value;
              return (
                <button
                  key={currency}
                  id={`${id}-${currency}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => choose(currency)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${activeIndex === index ? "bg-[#f0f5ff]" : "hover:bg-[#f6f8fb]"}`}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(16,35,61,0.16)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold leading-4">{currency}</span>
                    <span className="block text-[11px] leading-4 text-[#718096]">{item.name}</span>
                  </span>
                  {isSelected && (
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-primary">
                      <path d="m3 8 3.1 3.1L13 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              );
            }) : (
              <p className="m-0 px-3 py-4 text-center text-[12px] text-[#718096]">No currencies found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
