export function ArrowIcon({
  direction = "right",
  className = "",
}: {
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}) {
  const rotation = {
    left: "rotate-0",
    right: "rotate-180",
    up: "rotate-90",
    down: "-rotate-90",
  }[direction];

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${rotation} ${className}`}
      style={{
        mask: "url('/icons/arrow-left.svg') center / contain no-repeat",
        WebkitMask: "url('/icons/arrow-left.svg') center / contain no-repeat",
      }}
    />
  );
}
