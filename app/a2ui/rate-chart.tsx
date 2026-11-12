"use client";

/**
 * `RateChart`, the one FX component in the A2UI catalog: the basic catalog has
 * no chart. It draws the history points the backend validated, bound at
 * `/panels/chart/data/points`, and sits inside a basic `Card`; the title,
 * range buttons and figures around it are basic components.
 */

import { useReducedMotion } from "motion/react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { number } from "../components/data/fx-data";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../components/ui/chart";
import type { FxPair } from "../lib/fx-api";

type Props = Record<string, unknown>;

const config = { rate: { label: "Rate", color: "var(--blue)" } } satisfies ChartConfig;

function label(value: string, range: unknown) {
  const date = new Date(value);
  // A 24-hour series can be two daily points, so its labels carry the date too.
  return new Intl.DateTimeFormat("en-GB", range === "1d"
    ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "short" }).format(date);
}

export function RateChart({ props }: { props: Props }) {
  const reduceMotion = useReducedMotion();
  const raw = Array.isArray(props.points) ? (props.points as { t: string; rate: string }[]) : [];
  const data = raw
    .map((point) => ({ time: point.t, rate: Number(point.rate) }))
    .filter((point) => Number.isFinite(point.rate));
  const to = (props.pair as FxPair | undefined)?.to ?? "";
  if (data.length < 2) {
    return <p className="m-0 py-8 text-center text-[13px] text-[#718096]">Not enough history to draw.</p>;
  }
  const rates = data.map((point) => point.rate);
  const low = Math.min(...rates);
  const high = Math.max(...rates);
  const padding = (high - low || high * 0.001) * 0.15;
  const digits = high < 10 ? 4 : 2;
  const first = data[0].time;
  const last = data[data.length - 1].time;

  return (
    <ChartContainer config={config} className="aspect-auto h-[190px] w-full">
      <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke="#ece9f6" />
        <XAxis
          dataKey="time"
          type="category"
          ticks={[first, last]}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value: string) => label(value, props.range)}
        />
        <YAxis
          dataKey="rate"
          type="number"
          domain={[low - padding, high + padding]}
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickCount={4}
          width={64}
          tickFormatter={(value: number) => number(value, digits)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel valueFormatter={(value) => `${number(value, digits)} ${to}`} />}
        />
        <Line
          dataKey="rate"
          type="monotone"
          stroke="var(--color-rate)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-rate)", stroke: "white", strokeWidth: 2 }}
          isAnimationActive={!reduceMotion}
          animationDuration={700}
        />
      </LineChart>
    </ChartContainer>
  );
}
