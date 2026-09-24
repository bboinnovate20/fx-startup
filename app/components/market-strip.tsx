export function MarketStrip() {
  return (
    <div
      className={`bg-surface border-t border-t-[#edf1f5] border-b border-b-[#e8edf3]`}
    >
      <div
        className={`max-w-[1145px] m-[auto] min-h-[56px] p-[10px_17px] flex items-center justify-between gap-[14px]
          max-[900px]:flex-wrap max-[900px]:gap-[12px_16px] max-[700px]:p-[12px_16px] max-[700px]:gap-[12px_17px] max-[390px]:gap-[10px_12px]`}
      >
        <span
          className={`[&_i]:inline-block [&_i]:w-[6px] [&_i]:h-[6px] [&_i]:rounded-full [&_i]:bg-[var(--success)] [&_i]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--success)_11%,transparent)] text-[8px] text-[#75849a]
            font-extrabold tracking-[1px] whitespace-nowrap [&_i]:mr-[6px] max-[900px]:w-[100%] max-[700px]:text-[7px]`}
        >
          <i /> SAMPLE MARKET SNAPSHOT
        </span>
        <div
          className={`flex items-center gap-[8px] [border-left:1px_solid_#eef1f4] pl-[18px] text-[9px] text-[#78869b] whitespace-nowrap
            [&_b]:text-[11px] [&_b]:text-[#283a55] [&_em]:not-italic [&_em]:text-[#169767] [&_em]:text-[8px] [&_.negative]:text-[#d65c64] max-[900px]:border-0 max-[900px]:pl-[0]
            max-[700px]:gap-[5px] max-[700px]:text-[8px] max-[700px]:[&_b]:text-[10px] max-[390px]:flex-wrap max-[390px]:gap-[3px_5px]`}
        >
          <span>GBP / NGN</span>
          <b>2,048.62</b>
          <em>↗ 0.42%</em>
        </div>
        <div
          className={`flex items-center gap-[8px] [border-left:1px_solid_#eef1f4] pl-[18px] text-[9px] text-[#78869b] whitespace-nowrap
            [&_b]:text-[11px] [&_b]:text-[#283a55] [&_em]:not-italic [&_em]:text-[#169767] [&_em]:text-[8px] [&_.negative]:text-[#d65c64] max-[900px]:border-0 max-[900px]:pl-[0]
            max-[700px]:gap-[5px] max-[700px]:text-[8px] max-[700px]:[&_b]:text-[10px] max-[390px]:flex-wrap max-[390px]:gap-[3px_5px]`}
        >
          <span>GBP / USD</span>
          <b>1.2748</b>
          <em>↗ 0.18%</em>
        </div>
        <div
          className={`flex items-center gap-[8px] [border-left:1px_solid_#eef1f4] pl-[18px] text-[9px] text-[#78869b] whitespace-nowrap
            [&_b]:text-[11px] [&_b]:text-[#283a55] [&_em]:not-italic [&_em]:text-[#169767] [&_em]:text-[8px] [&_.negative]:text-[#d65c64] max-[900px]:border-0 max-[900px]:pl-[0]
            max-[700px]:gap-[5px] max-[700px]:text-[8px] max-[700px]:[&_b]:text-[10px] max-[390px]:flex-wrap max-[390px]:gap-[3px_5px]`}
        >
          <span>EUR / NGN</span>
          <b>1,730.18</b>
          <em className={`negative`}>↘ 0.12%</em>
        </div>
        <span
          className={`text-[8px] text-[#95a0ae] whitespace-nowrap [&_b]:font-normal [&_b]:p-[0_4px] max-[700px]:w-[100%] max-[700px]:text-[7px]`}
        >
          Illustrative data <b>·</b> 09:41 GMT
        </span>
      </div>
    </div>
  );
}
