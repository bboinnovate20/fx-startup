import type { HTMLAttributes } from "react";
import { Button } from "./Button";

const badgeVariants = {
  neutral: "bg-[#f1f5f9] text-[#475569]",
  positive: "bg-[#eaf8f1] text-[#17875e]",
  negative: "bg-[#fef2f2] text-[#dc2626]",
  warning: "bg-[#fff7e6] text-[#b45309]",
  "best-rate": "bg-[#eaf8f1] text-[#17875e]",
} satisfies Record<
  "neutral" | "positive" | "negative" | "warning" | "best-rate",
  string
>;

export function ButtonBadge({
  children,
  variant = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
  className?: string;
}) {
  return (
    <Button
      as="span"
      variant="unstyled"
      className={`rounded-full p-2 px-3 text-[14px] tracking-[0.25px] whitespace-nowrap  *:
        text-white ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
