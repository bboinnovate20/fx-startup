import { formatRange, number, currencies, type Alert } from "./data/fx-data";

export function AlertCard({
  alert,
  onToggle,
  onEdit,
  onDelete,
}: {
  alert: Alert;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const condition =
    alert.mode === "range"
      ? formatRange(alert.low, alert.high)
      : `≥ ${number(alert.target, 0)}`;
  return (
    <article
      className={`border border-[#e7ecf2] rounded-[7px] p-[9px_10px] [&.paused]:opacity-[0.63] ${alert.enabled ? "" : "paused"}`}
    >
      <div
        className={`flex items-center justify-between [&_strong]:flex [&_strong]:items-center [&_strong]:gap-[5px] [&_strong]:text-[#263850] [&_strong]:text-[9px]
          [&_strong_span]:text-[#a1acb9] [&_strong_span]:p-[0_2px]`}
      >
        <strong>
          {currencies[alert.from].flag} {alert.from}
          <span>→</span>
          {currencies[alert.to].flag} {alert.to}
        </strong>
        <button
          className={`w-[27px] h-[15px] p-[2px] border-0 rounded-[10px] bg-[#d2dbe6] flex justify-start [&_i]:w-[11px] [&_i]:h-[11px] [&_i]:bg-surface [&_i]:rounded-full [&_i]:shadow-[0_1px_2px_#1d2f4738] [&.on]:justify-end [&.on]:bg-[#31b37b] ${alert.enabled ? "on" : ""}`}
          role="switch"
          aria-checked={alert.enabled}
          aria-label={`${alert.enabled ? "Disable" : "Enable"} ${alert.from} to ${alert.to} alert`}
          onClick={onToggle}
        >
          <i />
        </button>
      </div>
      <div
        className={`flex items-center gap-[6px] m-[7px_0] text-[#33445c] [&>_span]:text-[14px] [&>_span]:text-[#6d8ccc] [&_b]:text-[9px]
          [&_small]:text-[7px] [&_small]:text-[#929ead] [&_small]:font-normal [&_small]:ml-[3px]`}
      >
        <span>⌁</span>
        <b>
          {condition}{" "}
          <small>
            {alert.to} per {alert.from}
          </small>
        </b>
      </div>
      <div
        className={`flex items-center justify-between border-t border-t-[#f0f2f5] pt-[6px]`}
      >
        <span
          className={`p-[4px_6px] rounded-[4px] bg-[#edf6fc] text-[#4680a6] text-[7px] [&.whatsapp]:bg-[#edf8f1] [&.whatsapp]:text-[#38885b] ${alert.channel.toLowerCase()}`}
        >
          {alert.channel === "Telegram" ? "➤" : "◔"} {alert.channel}
        </span>
        <span
          className={
            alert.enabled
              ? `flex items-center gap-[4px] text-[#19885e] text-[7px] [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:rounded-full
            [&_i]:bg-[#25ae77]`
              : `flex items-center gap-[4px] text-[#929eac] text-[7px] [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:rounded-full
            [&_i]:bg-[#aab4c0]`
          }
        >
          <i />
          {alert.enabled ? "Active" : "Paused"}
        </span>
        <div
          className={`flex gap-[2px] [&_button]:h-[18px] [&_button]:w-[20px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[#8794a4] [&_button]:text-[12px]
            [&_button:hover]:text-primary`}
        >
          <button onClick={onEdit} aria-label="Edit alert">
            ✎
          </button>
          <button onClick={onDelete} aria-label="Delete alert">
            ×
          </button>
        </div>
      </div>
    </article>
  );
}
