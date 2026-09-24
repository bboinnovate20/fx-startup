import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

const buttonVariants = {
  primary:
    "inline-flex items-center justify-center gap-[14px] border-0 bg-white text-primary font-[650] shadow-[0_5px_14px_color-mix(in_srgb,var(--blue)_13%,transparent)] transition-[background,color,transform] duration-[180ms] hover:bg-primary-hover hover:text-white transition-all",
  secondary:
    "inline-flex items-center justify-center gap-[14px] border border-line bg-surface text-[#2c4e83] font-[650] shadow-none transition-[background,transform] duration-[180ms] hover:bg-[#f5f8fe] hover:-translate-y-px",
  quiet:
    "inline-flex items-center justify-center gap-[14px] border-0 bg-transparent text-primary font-[650] shadow-none transition-[background,transform] duration-[180ms] hover:bg-primary-hover hover:-translate-y-px",
  unstyled: "inline-flex items-center justify-center bg-white text-navy-deep",
} satisfies Record<"primary" | "secondary" | "quiet" | "unstyled", string>;

type ButtonProps = {
  children?: ReactNode;
  variant?: keyof typeof buttonVariants;
  className?: string;
} & (
  | ({ as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: "span" } & HTMLAttributes<HTMLSpanElement>)
);

export function Button({
  as = "button",
  children,
  variant = "primary",
  className = "bg-white/90",
  ...props
}: ButtonProps) {
  const classes = `${buttonVariants[variant]} ${className}`;

  if (as === "span") {
    return (
      <span className={classes} {...(props as HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    );
  }

  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
