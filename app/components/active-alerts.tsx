import { useState } from "react";
import { AlertCard } from "./alert-card";
import type { Alert } from "./data/fx-data";

export function ActiveAlerts({
  alerts,
  onToggle,
  onEdit,
  onDelete,
}: {
  alerts: Alert[];
  onToggle: (id: number) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (id: number) => void;
}) {
  const [feedback, setFeedback] = useState("");
  return (
    <div
      className={`border border-[var(--line)] rounded-[11px] bg-surface p-[19px_20px] max-[900px]:p-[15px] max-[700px]:p-[16px]`}
    >
      <div
        className={`[&_h3]:text-[13px] [&_h3]:text-navy [&_h3]:m-[0] [&_h3]:tracking-[-0.02em] [&_small]:block [&_small]:text-[8px] [&_small]:text-[#8996a7] [&_small]:mt-[4px]
          flex items-start justify-between mb-[12px] [&_h3_i]:[display:inline-grid] [&_h3_i]:place-items-center [&_h3_i]:min-w-[16px] [&_h3_i]:h-[16px]
          [&_h3_i]:rounded-[9px] [&_h3_i]:bg-[#edf2f8] [&_h3_i]:text-[#738197] [&_h3_i]:not-italic [&_h3_i]:text-[7px] [&_h3_i]:ml-[3px]`}
      >
        <span>
          <h3>
            Your alerts <i>{alerts.length}</i>
          </h3>
          <small>Manage your rate notifications.</small>
        </span>
        <span className={`text-[18px] text-[#8aa0c3]`} aria-hidden="true">
          ◷
        </span>
      </div>
      {feedback && (
        <div
          className={`flex gap-[7px] items-start p-[7px_8px] mb-[8px] bg-[#edf8f2] rounded-[5px] text-[#467660]
            text-[8px] [&_p]:flex-[1] [&_p]:m-[0] [&_p]:leading-[1.5] [&_button]:border-0 [&_button]:bg-none [&_button]:text-[#779584] [&_button]:p-[0]`}
          role="status"
        >
          <span>✓</span>
          <p>{feedback}</p>
          <button aria-label="Dismiss message" onClick={() => setFeedback("")}>
            ×
          </button>
        </div>
      )}
      {alerts.length ? (
        <div className={`grid gap-[7px]`}>
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={() => onToggle(alert.id)}
              onEdit={() => onEdit(alert)}
              onDelete={() => {
                onDelete(alert.id);
                setFeedback("Alert deleted.");
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`grid [justify-items:center] p-[20px_8px] text-[#8895a5] text-center [&>_span]:text-[20px] [&_b]:text-[9px] [&_b]:text-[#43536a]
            [&_b]:mt-[5px] [&_p]:text-[8px] [&_p]:m-[4px_0]`}
        >
          <span>◷</span>
          <b>No alerts yet</b>
          <p>Create one and we’ll keep an eye on the rate.</p>
        </div>
      )}
      <div
        className={`flex gap-[7px] items-start mt-[11px] p-[8px] rounded-[5px] bg-[#f4f7fc] text-[#8390a1]
          [&>_span]:text-[10px] [&>_span]:text-[#6683bb] [&_p]:text-[7px] [&_p]:leading-[1.6] [&_p]:m-[0] [&_b]:text-[#536781]`}
      >
        <span>ⓘ</span>
        <p>
          When a condition is met, the alert is designed to include the{" "}
          <b>top 3 available provider rates</b>. Delivery needs an authorized
          channel.
        </p>
      </div>
    </div>
  );
}
