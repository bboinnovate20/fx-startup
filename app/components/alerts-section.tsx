import type { Currency } from "./data/fx-data";
import { AlertForm } from "./alert-form";

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
  return (
    <section className="mb-[48px] grid grid-cols-1 items-start gap-6 max-[700px]:mb-[38px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8" id="alerts">
      <div className="mb-[19px] lg:mb-0">
 
        <h2 className="m-[6px_0] max-w-[13ch] font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-navy lg:text-[43px]">
          Let the right rate find you.
        </h2>
        <p className="m-0 max-w-[34ch] text-[14px] leading-[1.6] text-[#77869b] mt-4.5">
          Set a target. We’ll help you keep an eye on the market.
        </p>

        <p className="mb-2 px-7 bg-gray-300 p-3 max-w-max mt-7 rounded-full text-[11px] font-bold text- max-[700px]:text-[10px]">
          PERSONALIZED RATE ALERTS
        </p>
      </div>
      <div className="w-full min-w-0" id="alert-form">
        <AlertForm from={from} to={to} setFrom={setFrom} setTo={setTo} />
      </div>
    </section>
  );
}
