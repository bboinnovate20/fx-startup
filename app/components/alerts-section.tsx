import { useState } from "react";
import { AlertForm } from "./alert-form";
import { ActiveAlerts } from "./active-alerts";
import type { Alert, Currency } from "./data/fx-data";
import { SectionHeading } from "./ui/SectionHeading";

export function AlertsSection({
  from,
  to,
  setFrom,
  setTo,
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      from: "GBP",
      to: "NGN",
      low: 2000,
      high: 2050,
      target: 2050,
      mode: "range",
      channel: "Telegram",
      enabled: true,
    },
    {
      id: 2,
      from: "GBP",
      to: "NGN",
      low: 2080,
      high: 2120,
      target: 2100,
      mode: "threshold",
      channel: "WhatsApp",
      enabled: false,
    },
  ]);
  const [editing, setEditing] = useState<Alert | null>(null);
  const save = (alert: Omit<Alert, "id" | "enabled">, id?: number) => {
    if (id && id < 0) {
      setEditing(null);
      return;
    }
    if (id) {
      setAlerts((items) =>
        items.map((item) => (item.id === id ? { ...item, ...alert } : item)),
      );
      setEditing(null);
      return;
    }
    setAlerts((items) => [
      { ...alert, id: Date.now(), enabled: true },
      ...items,
    ]);
    setEditing(null);
  };
  const toggle = (id: number) =>
    setAlerts((items) =>
      items.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert,
      ),
    );
  const remove = (id: number) => {
    setAlerts((items) => items.filter((alert) => alert.id !== id));
    if (editing?.id === id) setEditing(null);
  };
  const cancelEdit = () => setEditing(null);
  const edit = (alert: Alert) => {
    setEditing(alert);
    setFrom(alert.from);
    setTo(alert.to);
    document
      .getElementById("alert-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <section className={`mb-[48px] max-[700px]:mb-[38px]`} id="alerts">
      <SectionHeading
        eyebrow="PERSONALIZED RATE ALERTS"
        title="Let the right rate find you."
        description="Set a target. We’ll help you keep an eye on the market."
      />
      <div
        className={`grid grid-cols-[1fr_1fr] gap-[15px] [align-items:start] max-[900px]:gap-[10px] max-[700px]:grid-cols-[1fr] max-[700px]:gap-[11px]`}
        id="alert-form"
      >
        <AlertForm
          key={editing?.id ?? "new-alert"}
          {...{ from, to, setFrom, setTo }}
          editing={editing}
          onSave={save}
          onCancel={cancelEdit}
        />
        <ActiveAlerts
          alerts={alerts}
          onToggle={toggle}
          onEdit={edit}
          onDelete={remove}
        />
      </div>
    </section>
  );
}
