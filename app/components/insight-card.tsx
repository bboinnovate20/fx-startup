export function InsightCard() {
  return (
    <aside
      className={`border border-[var(--line)] rounded-[11px] bg-navy-deep relative overflow-hidden text-white p-[21px_22px] min-h-[260px]
        [&:before]:[content:""] [&:before]:absolute [&:before]:w-[180px] [&:before]:h-[180px] [&:before]:[right:-66px] [&:before]:[top:54px] [&:before]:border border-[#9eb9e32a] [&:before]:rounded-full
        [&:before]:shadow-[0_0_0_28px_#9eb9e315,_0_0_0_58px_#9eb9e30e] [&_h3]:relative [&_h3]:text-[19px] [&_h3]:leading-[1.18] [&_h3]:tracking-[-0.035em] [&_h3]:m-[17px_0_9px] [&_h3]:max-w-[260px] [&_p]:relative
        [&_p]:text-[#bbc9dd] [&_p]:text-[9px] [&_p]:leading-[1.75] [&_p]:m-[0] [&_p]:max-w-[260px] [&>_a]:relative [&>_a]:inline-block [&>_a]:text-[#a7c4ff]
        [&>_a]:text-[8px] [&>_a]:font-[650] [&>_a]:mt-[13px] [&>_a_span]:ml-[8px] [&>_a_span]:text-[13px] max-[700px]:min-h-[223px] max-[700px]:p-[19px]`}
    >
      <div
        className={`flex items-center gap-[8px] text-[8px] tracking-[1px] font-bold text-[#a9bddb] [&_span]:text-[16px]
          [&_span]:text-[#9dbaff]`}
      >
        <span>✳</span> MARKET NOTE
      </div>
      <h3>Compare the whole transfer, not just the rate.</h3>
      <p>
        Fees and delivery times can change what your recipient gets. Check the
        full estimate before choosing a provider.
      </p>
      <a href="#compare">
        Compare provider details <span>→</span>
      </a>
      <div
        className={`absolute [bottom:14px] [right:20px] w-[145px] h-[32px] opacity-[0.72] [&_svg]:w-[100%] [&_svg]:h-[100%]
          [&_svg]:overflow-visible [&_path]:fill-none [&_path]:[stroke:#55d3a0] [&_path]:stroke-[2]`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 240 46" preserveAspectRatio="none">
          <path d="M0 39 20 33 41 37 61 24 82 28 102 17 123 22 143 12 164 18 184 8 205 13 240 3" />
        </svg>
      </div>
    </aside>
  );
}
