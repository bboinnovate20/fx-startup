"use client";

import { createContext, useContext, useId, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";

export type ChartConfig = Record<string, { label?: ReactNode; color?: string }>;

const ChartContext = createContext<ChartConfig | null>(null);

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: ReactElement;
}) {
  const id = useId().replaceAll(":", "");
  const chartVars = Object.fromEntries(
    Object.entries(config)
      .filter(([, value]) => value.color)
      .map(([key, value]) => [`--color-${key}`, value.color]),
  ) as CSSProperties;

  return (
    <ChartContext.Provider value={config}>
      <div
        data-slot="chart"
        data-chart={`chart-${id}`}
        className={`flex min-w-0 justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[#64748b] [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none ${className ?? ""}`}
        style={chartVars}
      >
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 800, height: 360 }}>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  formatter,
}: TooltipProps<number, string> & {
  hideLabel?: boolean;
  formatter?: (value: number, name: string) => ReactNode;
}) {
  const config = useContext(ChartContext);
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[145px] rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs shadow-lg">
      {!hideLabel && <p className="mb-1.5 mt-0 font-medium text-[#64748b]">{String(label ?? "")}</p>}
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? "value");
        const title = config?.[key]?.label ?? item.name ?? key;
        const value = typeof item.value === "number" && formatter
          ? formatter(item.value, key)
          : String(item.value ?? "—");
        return (
          <div key={`${key}-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-[#64748b]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color ?? "var(--blue)" }} />
              {title}
            </span>
            <span className="font-semibold tabular-nums text-[#0f172a]">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
