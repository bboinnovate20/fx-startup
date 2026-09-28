"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { number, type Currency } from "../data/fx-data";
import { CurrencyPicker } from "../currency-picker";
import { ArrowIcon } from "./ArrowIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";

type HistoryPeriod = "day" | "week";
export type RateHistoryPeriod = HistoryPeriod;
const periods: { id: HistoryPeriod; label: string; days: number; movement: number }[] = [
  { id: "day", label: "24 hours", days: 1, movement: 0.002 },
  { id: "week", label: "1 week", days: 7, movement: 0.004 },
];

type RatePoint = { time: string; rate: number };

function makeRateHistory(rate: number, period: HistoryPeriod, days: number) {
  const pointCount = 64;
  const movement = periods.find((item) => item.id === period)!.movement;
  const frequency = period === "day" ? 2.8 : 1.7;
  const wave = (index: number) => {
    const t = index / (pointCount - 1);
    return Math.sin(t * Math.PI * 5.3 * frequency) * 0.42
      + Math.sin(t * Math.PI * 13.7 * frequency + 0.8) * 0.2
      + Math.sin(t * Math.PI * 29.1 * frequency + 2.2) * 0.11;
  };
  const endWave = wave(pointCount - 1);
  const end = Date.now();
  const duration = days * 24 * 60 * 60 * 1000;

  return Array.from({ length: pointCount }, (_, index): RatePoint => ({
    time: new Date(end - duration + (duration * index) / (pointCount - 1)).toISOString(),
    rate: rate * (1 + (wave(index) - endWave) * movement),
  }));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
}

export function RateHistoryChart({ from, to, setFrom, setTo, rate, periodValue, onPeriodChange, compact = false }: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  rate: number;
  periodValue?: RateHistoryPeriod;
  onPeriodChange?: (period: RateHistoryPeriod) => void;
  compact?: boolean;
}) {
  const [localPeriod, setLocalPeriod] = useState<HistoryPeriod>("week");
  const period = periodValue ?? localPeriod;
  const changePeriod = (nextPeriod: HistoryPeriod) => {
    setLocalPeriod(nextPeriod);
    onPeriodChange?.(nextPeriod);
  };
  const selectedPeriod = periods.find((item) => item.id === period)!;
  const data = makeRateHistory(rate, period, selectedPeriod.days);
  const digits = rate < 10 ? 4 : 2;
  const startLabel = period === "day" ? "24 hours ago" : shortDate(data[0].time);
  const endLabel = period === "day" ? "Now" : shortDate(data[data.length - 1].time);
  const yPadding = rate * selectedPeriod.movement * 0.5;
  const chartConfig = {
    rate: {
      label: `${to} per ${from}`,
      color: "var(--blue)",
    },
  } satisfies ChartConfig;

  return (
    <Card className={`mx-auto w-full max-w-[1020px] gap-0 overflow-hidden ${compact ? "rounded-[16px] font-display" : "rounded-[12px]"} border border-[var(--line)] bg-white p-0 text-[#171a18] shadow-none`}>
      <CardHeader className={`flex flex-wrap items-center justify-between ${compact ? "gap-3 px-4 pb-0 pt-4" : "gap-4 px-7 pb-0 pt-6 max-[700px]:px-[18px] max-[700px]:pt-5"}`}>
        <div className="min-w-0">
          <CardTitle className={`m-0 leading-tight tracking-[-0.04em] ${compact ? "text-[18px]" : "text-[26px] max-[700px]:text-[23px]"}`}>Rate history</CardTitle>
          <CardDescription className="mb-0 mt-1 text-[12px] text-[#64748b]">{from} to {to}</CardDescription>
          <div className={`${compact ? "mt-2 max-w-[300px] [&_button]:!min-h-10" : "mt-3 max-w-[440px]"} flex w-full items-center gap-2 [&_.currency-picker]:min-w-0 [&_.currency-picker]:flex-1 [&_.currency-picker]:bg-[#f1f3f6] [&_.currency-picker]:text-[#64748b]`}>
            <CurrencyPicker value={from} label="Rate history source currency" onChange={setFrom} variant="pair" />
            <ArrowIcon className="h-3 w-3 shrink-0 text-[#9aa5b4]" />
            <CurrencyPicker value={to} label="Rate history target currency" onChange={setTo} variant="pair" />
          </div>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Rate history period">
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={period === item.id}
              onClick={() => changePeriod(item.id)}
              className={`rounded-full border font-semibold ${compact ? "min-h-8 px-3 text-[12px]" : "min-h-10 px-4 text-[14px]"} transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-[390px]:px-3 max-[390px]:text-[12px] ${
                period === item.id
                  ? "border-primary bg-primary text-white"
                  : "border-primary bg-white text-primary hover:bg-[#f3f5fa]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className={compact ? "px-2 pb-0 pt-3" : "px-5 pb-0 pt-5 max-[700px]:px-3"}>
        <ChartContainer
          config={chartConfig}
          className={compact ? "h-[210px] w-full min-w-0" : "h-[300px] w-full min-w-0 sm:h-[370px]"}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 12, right: 12, bottom: 4, left: 4 }}
          >
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              type="category"
              ticks={[data[0].time, data[data.length - 1].time]}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => value === data[0].time ? startLabel : endLabel}
              minTickGap={24}
            />
            <YAxis
              dataKey="rate"
              type="number"
              domain={[rate - yPadding, rate + yPadding]}
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickCount={5}
              width={68}
              tickFormatter={(value: number) => number(value, digits)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent valueFormatter={(value) => `${number(value, digits)} ${to}`} />}
            />
            <Line
              dataKey="rate"
              type="linear"
              stroke="var(--color-rate)"
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-rate)", stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={`flex flex-wrap items-center justify-between gap-2 border-t border-[#e5e7e4] text-[11px] text-[#667064] ${compact ? "mt-2 px-4 py-3" : "mt-3 px-7 pb-5 pt-4 max-[700px]:px-[18px]"}`}>
        <span className="font-medium text-primary">1 {from} = {number(rate, digits)} {to}</span>
        <span>Illustrative history · {selectedPeriod.label}</span>
      </CardFooter>
    </Card>
  );
}
