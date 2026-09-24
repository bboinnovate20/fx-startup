import { number, trendPoints, type Currency } from "./data/fx-data";
import { InsightCard } from "./insight-card";

function TrendChart({
  from,
  to,
  rate,
}: {
  from: Currency;
  to: Currency;
  rate: number;
}) {
  const chartDigits = rate < 10 ? 4 : 2;
  const chartLevels = [rate * 1.01, rate * 1.003, rate * 0.997, rate * 0.99];
  const path = trendPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${(index / (trendPoints.length - 1)) * 640} ${156 - point * 1.42}`,
    )
    .join(" ");
  return (
    <section
      className={`border border-[var(--line)] rounded-[11px] bg-surface p-[20px_21px_15px] max-[700px]:p-[17px]`}
    >
      <div
        className={`flex items-center justify-between [&_h2]:text-[17px] [&_h2]:text-navy [&_h2]:m-[5px_0_0]`}
      >
        <div>
          <span
            className={`text-[9px] tracking-[1.35px] font-extrabold text-[#6f82a1]`}
          >
            RATE MOVEMENT
          </span>
          <h2>24-hour trend</h2>
        </div>
        <span
          className={`border border-[#e4e9f0] rounded-[6px] p-[7px_9px] text-[#63728a] text-[8px] [&_span]:ml-[8px] [&_span]:text-[#8b97a7]`}
        >
          Previous 24 hours <span>⌄</span>
        </span>
      </div>
      <div
        className={`flex items-baseline gap-[8px] m-[18px_0_10px] [&>_b]:font-display [&>_b]:text-[23px] [&>_b]:text-navy [&>_b]:tracking-[-0.04em]
          [&>_span]:text-[8px] [&>_span]:text-[#8c98a8] [&_em]:text-[8px] [&_em]:not-italic [&_em]:bg-[#eaf8f1] [&_em]:text-[#188b5f] [&_em]:rounded-[4px] [&_em]:p-[5px_7px]
          [&_em]:ml-[3px] [&_em_small]:ml-[3px] [&_em_small]:text-[#5c8c76] [&_em.sample-change]:bg-[#f2f5fa] [&_em.sample-change]:text-[#74839a]`}
      >
        <b>{number(rate)}</b>
        <span>
          {to} per {from}
        </span>
        <em className={`sample-change`}>Sample movement</em>
      </div>
      <div className={`h-[146px] relative p-[0_0_16px_37px]`}>
        <div
          className={`absolute [left:0] [top:0] [bottom:21px] flex flex-col justify-between text-[7px]
            text-[#9da8b5]`}
        >
          {chartLevels.map((level) => (
            <span key={level}>{number(level, chartDigits)}</span>
          ))}
        </div>
        <svg
          className={`w-[100%] h-[100%] overflow-visible`}
          viewBox="0 0 640 174"
          role="img"
          aria-label={`Illustrative ${from} to ${to} trend rising over the previous 24 hours`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#155eef" stopOpacity=".17" />
              <stop offset="1" stopColor="#155eef" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className={`fill-none [stroke:#edf1f5] stroke-[1] [stroke-dasharray:3_4]`}
            d="M0 24H640M0 66H640M0 108H640M0 150H640"
          />
          <path d={`${path} L640 174 L0 174Z`} fill="url(#trend-fill)" />
          <path
            d={path}
            className={`fill-none [stroke:var(--blue)] stroke-[2.3] [vector-effect:non-scaling-stroke]`}
          />
          <circle
            cx="640"
            cy="21"
            r="5"
            className={`fill-white [stroke:var(--blue)] stroke-[3] [vector-effect:non-scaling-stroke]`}
          />
        </svg>
        <div
          className={`absolute [bottom:1px] [left:37px] [right:0] flex justify-between text-[#9da8b5] text-[7px]`}
        >
          <span>9 AM</span>
          <span>3 PM</span>
          <span>9 PM</span>
          <span>3 AM</span>
          <span>9 AM</span>
        </div>
      </div>
      <div
        className={`border-t border-t-[#eff2f5] pt-[11px] flex justify-between text-[#99a4b1] text-[7px] [&_span:first-child]:flex [&_span:first-child]:items-center
          [&_span:first-child]:gap-[5px] [&_i]:w-[6px] [&_i]:h-[6px] [&_i]:rounded-full [&_i]:bg-primary [&_b]:font-normal [&_b]:p-[0_4px] [&_strong]:text-[#69788e]
          [&_strong]:font-semibold max-[390px]:text-[6px]`}
      >
        <span>
          <i /> {from} / {to}
        </span>
        <span>
          Sample trend <b>·</b> 24h high{" "}
          <strong>{number(rate * 1.013, chartDigits)}</strong>
        </span>
      </div>
    </section>
  );
}
export function TrendSection({
  from,
  to,
  rate,
}: {
  from: Currency;
  to: Currency;
  rate: number;
}) {
  return (
    <section
      className={`mb-[53px] max-[700px]:mb-[38px] grid grid-cols-[1.65fr_1fr] gap-[16px] max-[700px]:grid-cols-[1fr] max-[700px]:gap-[11px]`}
    >
      <TrendChart from={from} to={to} rate={rate} />
      <InsightCard />
    </section>
  );
}
