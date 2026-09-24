import type { ReactNode } from "react";

export function LiveIndicator({ children }: { children: ReactNode }) {
  return (
    <span
      className={`[&_i]:inline-block [&_i]:w-[6px] [&_i]:h-[6px] [&_i]:rounded-full [&_i]:bg-[var(--success)] [&_i]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--success)_11%,transparent)] inline-flex items-center
        gap-[7px] text-[#8794a5] text-[8px]`}
    >
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
