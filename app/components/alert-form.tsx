import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { CurrencyPicker } from "./currency-picker";
import type { Alert, Currency } from "./data/fx-data";

export function AlertForm({
  from,
  to,
  setFrom,
  setTo,
  onSave,
  onCancel,
  editing,
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  onSave: (alert: Omit<Alert, "id" | "enabled">, id?: number) => void;
  onCancel: () => void;
  editing: Alert | null;
}) {
  const [target, setTarget] = useState(String(editing?.target ?? 2050));
  const [low, setLow] = useState(String(editing?.low ?? 2000));
  const [high, setHigh] = useState(String(editing?.high ?? 2050));
  const [mode, setMode] = useState<"range" | "threshold">(
    editing?.mode ?? "range",
  );
  const [channel, setChannel] = useState<Alert["channel"]>(
    editing?.channel ?? "Telegram",
  );
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
    onSave(
      {
        from,
        to,
        target: Number(target),
        low: Number(low),
        high: Number(high),
        mode,
        channel,
      },
      editing?.id,
    );
    setNotice(
      `${editing ? "Alert updated" : "Alert saved"}. Connect ${channel} to enable delivery.`,
    );
  }
  return (
    <div
      className={`border border-[var(--line)] rounded-[11px] bg-surface p-[19px_20px] max-[900px]:p-[15px] max-[700px]:p-[16px]`}
    >
      <div
        className={`flex items-center gap-[10px] mb-[15px] [&_h3]:text-[13px] [&_h3]:text-navy [&_h3]:m-[0] [&_h3]:tracking-[-0.02em]
          [&_small]:block [&_small]:text-[8px] [&_small]:text-[#8996a7] [&_small]:mt-[4px]`}
      >
        <span
          className={`grid place-items-center w-[31px] h-[31px] rounded-[8px] text-primary bg-[#edf3ff] text-[18px]`}
        >
          {editing ? "✎" : "＋"}
        </span>
        <span>
          <h3>{editing ? "Edit rate alert" : "Create a rate alert"}</h3>
          <small>Choose the rate you want to watch.</small>
        </span>
      </div>
      <form onSubmit={submit}>
        <label className={`block text-[#68778d] text-[8px] font-[650]`}>
          Currency pair
        </label>
        <div
          className={`flex items-center gap-[9px] mt-[6px] [&_.currency-picker]:border border-[#e1e7ef] [&_.currency-picker]:bg-white [&_.currency-picker]:h-[35px] [&_.currency-picker]:flex-[1]
            [&_.currency-picker]:justify-center [&>_span]:text-[#9aa5b4] [&>_span]:text-[11px]`}
        >
          <CurrencyPicker
            value={from}
            label="Alert source currency"
            onChange={setFrom}
          />
          <span>→</span>
          <CurrencyPicker
            value={to}
            label="Alert target currency"
            onChange={setTo}
          />
        </div>
        <fieldset
          className={`border-0 m-[12px_0_0] p-[0] [&_legend]:p-[0] [&_legend]:mb-[6px] grid grid-cols-[1fr_1fr] gap-[7px]
            [&_legend]:col-[1/-1]`}
        >
          <legend className={`block text-[#68778d] text-[8px] font-[650]`}>
            Trigger when the rate
          </legend>
          <label
            className={`relative flex items-center gap-[8px] border border-[#e5eaf0] rounded-[6px] p-[8px_7px] cursor-pointer [&.selected]:border-[#a8c1f4] [&.selected]:bg-[#f8faff] [&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none [&_b]:block [&_small]:block [&_b]:text-[8px] [&_b]:text-[#34445b] [&_small]:text-[7px] [&_small]:text-[#919cab] [&_small]:mt-[3px] max-[900px]:p-[7px_5px] max-[900px]:gap-[5px] max-[900px]:[&_small]:text-[6px] max-[700px]:p-[8px_7px] max-[700px]:[&_small]:text-[7px] ${mode === "range" ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="trigger-mode"
              checked={mode === "range"}
              onChange={() => setMode("range")}
            />
            <span
              className={`w-[12px] h-[12px] border border-[#bac4d1] rounded-full flex-[0_0_auto]`}
            />
            <span>
              <b>Enters a range</b>
              <small>Notify me within a rate range</small>
            </span>
          </label>
          <label
            className={`relative flex items-center gap-[8px] border border-[#e5eaf0] rounded-[6px] p-[8px_7px] cursor-pointer [&.selected]:border-[#a8c1f4] [&.selected]:bg-[#f8faff] [&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none [&_b]:block [&_small]:block [&_b]:text-[8px] [&_b]:text-[#34445b] [&_small]:text-[7px] [&_small]:text-[#919cab] [&_small]:mt-[3px] max-[900px]:p-[7px_5px] max-[900px]:gap-[5px] max-[900px]:[&_small]:text-[6px] max-[700px]:p-[8px_7px] max-[700px]:[&_small]:text-[7px] ${mode === "threshold" ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="trigger-mode"
              checked={mode === "threshold"}
              onChange={() => setMode("threshold")}
            />
            <span
              className={`w-[12px] h-[12px] border border-[#bac4d1] rounded-full flex-[0_0_auto]`}
            />
            <span>
              <b>Reaches a threshold</b>
              <small>Notify me at or above a rate</small>
            </span>
          </label>
        </fieldset>
        <div
          className={`grid grid-cols-[1fr_1.2fr] gap-[8px] mt-[12px] [&.single]:grid-cols-[1fr] ${mode === "threshold" ? "single" : ""}`}
        >
          <label className={`block text-[#68778d] text-[8px] font-[650]`}>
            Target rate
            <div
              className={`flex items-center gap-[5px] h-[33px] p-[0_7px] border border-[#e0e6ee] rounded-[6px] mt-[5px]
                [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:border-0 [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#293b55] [&_input]:text-[9px]
                [&_input]:p-[0] [&_span]:text-[7px] [&_span]:text-[#8794a6] [&_span]:whitespace-nowrap`}
            >
              <input
                required
                type="number"
                min="0"
                step="any"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
              <span>
                {to} / {from}
              </span>
            </div>
          </label>
          {mode === "range" && (
            <div className={`grid grid-cols-[1fr_1fr] gap-[6px]`}>
              <label className={`block text-[#68778d] text-[8px] font-[650]`}>
                Range from
                <div
                  className={`flex items-center gap-[5px] h-[33px] p-[0_7px] border border-[#e0e6ee] rounded-[6px] mt-[5px]
                    [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:border-0 [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#293b55] [&_input]:text-[9px]
                    [&_input]:p-[0] [&_span]:text-[7px] [&_span]:text-[#8794a6] [&_span]:whitespace-nowrap`}
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={low}
                    onChange={(event) => setLow(event.target.value)}
                  />
                  <span>{to}</span>
                </div>
              </label>
              <label className={`block text-[#68778d] text-[8px] font-[650]`}>
                Range to
                <div
                  className={`flex items-center gap-[5px] h-[33px] p-[0_7px] border border-[#e0e6ee] rounded-[6px] mt-[5px]
                    [&_input]:w-[100%] [&_input]:min-w-[0] [&_input]:border-0 [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#293b55] [&_input]:text-[9px]
                    [&_input]:p-[0] [&_span]:text-[7px] [&_span]:text-[#8794a6] [&_span]:whitespace-nowrap`}
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={high}
                    onChange={(event) => setHigh(event.target.value)}
                  />
                  <span>{to}</span>
                </div>
              </label>
            </div>
          )}
        </div>
        <fieldset
          className={`border-0 m-[12px_0_0] p-[0] [&_legend]:p-[0] [&_legend]:mb-[6px] mt-[12px]`}
        >
          <legend className={`block text-[#68778d] text-[8px] font-[650]`}>
            Notification channel
          </legend>
          <div className={`flex gap-[7px]`}>
            <label
              className={
                channel === "Telegram"
                  ? `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-[6px] h-[29px]
                  border border-[#e2e8ef] rounded-[5px] p-[0_9px] text-[#6b7a8e] text-[8px] cursor-pointer [&.selected]:border-[#a9c2f2] [&.selected]:bg-[#f7faff]
                  [&.selected]:text-[#315b9f] [&_.fake-radio]:[border:4px_solid_var(--blue)]`
                  : `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-[6px] h-[29px]
                  border border-[#e2e8ef] rounded-[5px] p-[0_9px] text-[#6b7a8e] text-[8px] cursor-pointer [&.selected]:border-[#a9c2f2] [&.selected]:bg-[#f7faff]
                  [&.selected]:text-[#315b9f]`
              }
            >
              <input
                type="radio"
                name="channel"
                checked={channel === "Telegram"}
                onChange={() => setChannel("Telegram")}
              />
              <span
                className={`text-[12px] [&.telegram]:text-[#2586c4] [&.whatsapp]:text-[#20a36b] telegram`}
              >
                ➤
              </span>
              Telegram
            </label>
            <label
              className={
                channel === "WhatsApp"
                  ? `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-[6px] h-[29px]
                  border border-[#e2e8ef] rounded-[5px] p-[0_9px] text-[#6b7a8e] text-[8px] cursor-pointer [&.selected]:border-[#a9c2f2] [&.selected]:bg-[#f7faff]
                  [&.selected]:text-[#315b9f] [&_.fake-radio]:[border:4px_solid_var(--blue)]`
                  : `[&_input]:absolute [&_input]:opacity-[0] [&_input]:pointer-events-none relative inline-flex items-center gap-[6px] h-[29px]
                  border border-[#e2e8ef] rounded-[5px] p-[0_9px] text-[#6b7a8e] text-[8px] cursor-pointer [&.selected]:border-[#a9c2f2] [&.selected]:bg-[#f7faff]
                  [&.selected]:text-[#315b9f]`
              }
            >
              <input
                type="radio"
                name="channel"
                checked={channel === "WhatsApp"}
                onChange={() => setChannel("WhatsApp")}
              />
              <span
                className={`text-[12px] [&.telegram]:text-[#2586c4] [&.whatsapp]:text-[#20a36b] whatsapp`}
              >
                ◔
              </span>
              WhatsApp
            </label>
          </div>
          <small className={`block text-[#9aa5b1] text-[7px] mt-[6px]`}>
            You’ll need to connect and authorize your channel before delivery.
          </small>
        </fieldset>
        <Button
          type="submit"
          className={`h-9 w-full mt-3 rounded-lg text-[9px] [&_span]:ml-[auto] [&_span]:text-[15px]`}
        >
          {editing ? "Save alert changes" : "Create rate alert"}
          <span>→</span>
        </Button>
        {editing && (
          <button
            type="button"
            className={`block w-[100%] border-0 bg-transparent text-[#6c7d94] text-[8px] mt-[7px] [&:hover]:text-primary`}
            onClick={onCancel}
          >
            Cancel editing
          </button>
        )}
        {error && (
          <p
            className={`m-[8px_0_0] p-[7px_8px] rounded-[5px] bg-[#fff0f0] text-[#b42332] text-[8px] leading-[1.5]`}
            role="alert"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className={`m-[8px_0_0] p-[7px_8px] rounded-[5px] bg-[#edf8f2] text-[#467660] text-[8px] leading-[1.5]`}
            role="status"
          >
            {notice}
          </p>
        )}
        <p className={`text-center m-[8px_0_0] text-[#98a3af] text-[7px]`}>
          ⌑ Your contact details stay private and secure.
        </p>
      </form>
    </div>
  );
}
