import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { CurrencyPicker } from "./currency-picker";
import type { Alert, Currency } from "./data/fx-data";
import { ArrowIcon } from "./ui/ArrowIcon";

export function AlertForm({
  from,
  to,
  setFrom,
  setTo,
  compact = false,
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  compact?: boolean;
}) {
  const [target, setTarget] = useState("2050");
  const [low, setLow] = useState("2000");
  const [high, setHigh] = useState("2050");
  const [mode, setMode] = useState<"range" | "threshold">("range");
  const [channel, setChannel] = useState<Alert["channel"]>("Telegram");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "range" && Number(low) > Number(high)) {
      setError("The range start must be lower than the range end.");
      setNotice("");
      return;
    }
    setError("");
    setNotice(
      `Alert created. Connect ${channel} to enable delivery.`,
    );
  }
  return (
    <div
      className={compact ? "rounded-[16px] border border-[#e4e1ef] bg-surface p-4 font-display" : "border border-[var(--line)] rounded-[14px] bg-surface p-6 font-display max-[900px]:p-5 max-[700px]:p-[18px]"}
    >
      <div
        className={`flex items-center gap-3 ${compact ? "mb-3" : "mb-5"} [&_h3]:text-[18px] [&_h3]:text-navy [&_h3]:m-[0] [&_h3]:tracking-[-0.02em]
          [&_small]:block [&_small]:text-[12px] [&_small]:text-[#64748b] [&_small]:mt-1`}
      >
        <span>
          <h3 className={compact ? "text-[18px]!" : "text-2xl!"}>Create alert</h3>
          <small>Choose the rate you want to watch.</small>
        </span>
      </div>
      <form onSubmit={submit}>
        <label className={`block text-[#64748b] text-[12px] font-semibold`}>
          Currency pair
        </label>
        <div
          className={`mt-2 flex w-full min-w-0 items-center gap-1 sm:gap-[10px] [&_.currency-picker]:min-w-0 [&_.currency-picker]:flex-1 [&_.currency-picker]:border-0 [&_.currency-picker]:bg-white [&_.currency-picker]:h-14 [&_.currency-picker]:max-w-full
            [&_.currency-picker>button]:min-w-0 [&_.currency-picker>button]:gap-1.5 [&_.currency-picker>button]:px-1.5 sm:[&_.currency-picker>button]:px-2 [&_.currency-picker>button]:text-[14px] [&_.currency-picker>button>span]:min-w-0 [&_.currency-picker>button>span]:overflow-hidden [&_.currency-picker>button>span>span]:max-w-full [&_.currency-picker>button>img]:h-6 [&_.currency-picker>button>img]:w-6 sm:[&_.currency-picker>button>img]:h-8 sm:[&_.currency-picker>button>img]:w-8 [&>_span]:text-[#9aa5b4] [&>_span]:text-[11px]`}
        >
          <CurrencyPicker
            value={from}
            label="Alert source currency"
            onChange={setFrom}
            variant="pair"
          />
          <ArrowIcon className="h-3 w-3 shrink-0 text-[#9aa5b4]" />
          <CurrencyPicker
            value={to}
            label="Alert target currency"
            onChange={setTo}
            variant="pair"
          />
        </div>
        <fieldset
          className={`border-0 m-[12px_0_0] p-[0] [&_legend]:p-[0] [&_legend]:mb-[6px] grid grid-cols-[1fr_1fr] gap-[7px]
            [&_legend]:col-[1/-1]`}
        >
          <legend className={`block text-[#171a18] text-[12px] font-semibold`}>
            Trigger when the rate
          </legend>
          <button
            type="button"
            aria-pressed={mode === "range"}
            onClick={() => setMode("range")}
            className={`relative flex w-full items-center gap-[10px] rounded-[9px] border bg-white p-3 text-left cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out max-[900px]:p-[10px] max-[900px]:gap-2 max-[700px]:p-3 ${mode === "range" ? "border-primary bg-[#f7f8ff] shadow-[0_0_0_2px_color-mix(in_srgb,var(--blue)_10%,transparent)]" : "border-[#e5eaf0]"}`}
          >
            <span>
              <p className="m-0 text-[12px] font-medium text-[#171a18]">Enters a range</p>
              <small className="mt-1 block text-[10px] text-[#64748b]">Notify me within a rate range</small>
            </span>
          </button>
          <button
            type="button"
            aria-pressed={mode === "threshold"}
            onClick={() => setMode("threshold")}
            className={`relative flex w-full items-center gap-[10px] rounded-[9px] border bg-white p-3 text-left cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out max-[900px]:p-[10px] max-[900px]:gap-2 max-[700px]:p-3 ${mode === "threshold" ? "border-primary bg-[#f7f8ff] shadow-[0_0_0_2px_color-mix(in_srgb,var(--blue)_10%,transparent)]" : "border-[#e5eaf0]"}`}
          >
            <span>
              <p className="m-0 text-[12px] font-medium text-[#171a18]">Reaches a threshold</p>
              <small className="mt-1 block text-[10px] text-[#64748b]">Notify me at or above a rate</small>
            </span>
          </button>
        </fieldset>
        <div
          className={`grid grid-cols-[1fr_1.2fr] gap-[8px] mt-[12px] [&.single]:grid-cols-[1fr] ${mode === "threshold" ? "single" : ""}`}
        >
          <label className={`block text-[#171a18] text-[12px] font-semibold`}>
            Target rate
            <div
              className={`flex items-center gap-2 h-11 p-[0_10px] border border-[#d7dee8] rounded-[8px] mt-2
                [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:border-0 [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#171a18] [&_input]:text-[18px] [&_input]:font-semibold
                [&_input]:p-[0] [&_span]:text-[11px] [&_span]:text-[#64748b] [&_span]:whitespace-nowrap`}
            >
              <input
                required
                type="number"
                min="0"
                step="any"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
            </div>
          </label>
          {mode === "range" && (
            <div className={`grid grid-cols-[1fr_1fr] gap-[6px]`}>
              <label className={`block text-[#171a18] text-[12px] font-semibold`}>
                Range from
                <div
                  className={`flex items-center gap-2 h-11 p-[0_10px] border border-[#d7dee8] rounded-[8px] mt-2
                    [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:border-0 [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#171a18] [&_input]:text-[18px] [&_input]:font-semibold
                    [&_input]:p-[0] [&_span]:text-[11px] [&_span]:text-[#64748b] [&_span]:whitespace-nowrap`}
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={low}
                    onChange={(event) => setLow(event.target.value)}
                  />
                </div>
              </label>
              <label className={`block text-[#171a18] text-[12px] font-semibold`}>
                Range to
                <div
                  className={`flex items-center gap-2 h-11 p-[0_10px] border border-[#d7dee8] rounded-[8px] mt-2
                    [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:border-0 [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#171a18] [&_input]:text-[18px] [&_input]:font-semibold
                    [&_input]:p-[0] [&_span]:text-[11px] [&_span]:text-[#64748b] [&_span]:whitespace-nowrap`}
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={high}
                    onChange={(event) => setHigh(event.target.value)}
                  />
                </div>
              </label>
            </div>
          )}
        </div>
        <fieldset
          className={`border-0 m-[12px_0_0] p-[0] [&_legend]:p-[0] [&_legend]:mb-[6px] mt-[12px]`}
        >
          <legend className={`block text-[#171a18] text-[12px] font-semibold`}>
            Notification channel
          </legend>
          <div className={`flex gap-[7px]`}>
            <label
              className={
                channel === "Telegram"
                  ? `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-2 h-10
                  border border-primary rounded-lg bg-[#f7f8ff] p-[0_12px] text-primary text-[12px] font-medium cursor-pointer transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out shadow-[0_0_0_2px_color-mix(in_srgb,var(--blue)_10%,transparent)]`
                  : `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-2 h-10
                  border border-[#d7dee8] rounded-lg p-[0_12px] text-[#171a18] text-[12px] font-medium cursor-pointer transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out`
              }
            >
              <input
                type="radio"
                name="channel"
                checked={channel === "Telegram"}
                onChange={() => setChannel("Telegram")}
              />
              <img src="/icons/telegram.svg" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
              Telegram
            </label>
            <label
              className={
                channel === "WhatsApp"
                  ? `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-2 h-10
                  border border-primary rounded-lg bg-[#f7f8ff] p-[0_12px] text-primary text-[12px] font-medium cursor-pointer transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out shadow-[0_0_0_2px_color-mix(in_srgb,var(--blue)_10%,transparent)]`
                  : `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-2 h-10
                  border border-[#d7dee8] rounded-lg p-[0_12px] text-[#171a18] text-[12px] font-medium cursor-pointer transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out`
              }
            >
              <input
                type="radio"
                name="channel"
                checked={channel === "WhatsApp"}
                onChange={() => setChannel("WhatsApp")}
              />
              <img src="/icons/whatsapp.svg" alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
              WhatsApp
            </label>
          </div>
          <small className={`block text-[#64748b] text-[10px] mt-2`}>
            You’ll need to connect and authorize your channel before delivery.
          </small>
        </fieldset>
        <Button
          type="submit"
          className={`mt-4 w-full rounded-full text-[14px] [&_span]:ml-[auto] [&_span]:text-[16px] px-5 font-medium! ${compact ? "h-11" : "h-12 py-7"}`}
        >
          Create alert
          <ArrowIcon className="h-4 w-4" />
        </Button>
        {error && (
          <p
            className={`m-[10px_0_0] p-[10px_12px] rounded-[7px] bg-[#fff0f0] text-[#b42332] text-[12px] leading-[1.5]`}
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className={`m-[10px_0_0] p-[10px_12px] rounded-[7px] bg-[#edf8f2] text-[#467660] text-[12px] leading-[1.5]`}
            role="status"
          >
            {notice}
          </p>
        )}
        <p className={`mt-[10px] mb-0 flex items-center justify-center gap-1.5 text-center text-[#64748b] text-[10px]`}>
          <img src="/icons/lock.svg" alt="" aria-hidden="true" className="h-3 w-[10px] shrink-0 object-contain" />
          Your contact details stay private and secure.
        </p>
      </form>
    </div>
  );
}
