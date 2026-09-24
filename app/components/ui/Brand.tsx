export function Brand() {
  return (
    <a
      className={`flex items-center gap-[10px] text-white font-bold text-[20px] tracking-[-0.8px] [&>_span:last-child_>_span]:text-[#b8c6d9]
        [&>_span:last-child_>_span]:font-normal max-[700px]:text-[18px]`}
      href="#top"
      aria-label="FX Swift home"
    >
      <span
        className={`grid place-items-center w-[31px] h-[31px] rounded-[9px] bg-primary shadow-[0_5px_14px_color-mix(in_srgb,var(--blue)_25%,transparent)] [&_svg]:w-[18px]
          [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-[2] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24">
          <path d="M5 17 17 5M7 5h10v10" />
        </svg>
      </span>
      <span>
        fx<span>swift</span>
      </span>
    </a>
  );
}
