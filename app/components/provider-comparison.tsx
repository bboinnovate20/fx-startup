import { useMemo, useState } from "react";
import {
  currencies,
  money,
  number,
  pairRates,
  providerSeed,
  type Currency,
} from "./data/fx-data";
import { ButtonBadge } from "./ui/ButtonBadges";
import { LiveIndicator } from "./ui/LiveIndicator";
import { SectionHeading } from "./ui/SectionHeading";

export function ProviderComparison({
  from,
  to,
  amount,
  rate,
}: {
  from: Currency;
  to: Currency;
  amount: number;
  rate: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const providers = useMemo(
    () =>
      providerSeed
        .map((provider) => ({
          ...provider,
          rate: provider.rate * (rate / pairRates["GBP-NGN"]),
        }))
        .sort((a, b) => b.rate - a.rate),
    [rate],
  );
  return (
    <section
      className={`mb-[53px] max-[700px]:mb-[38px] compare-section`}
      id="compare"
    >
      <SectionHeading
        eyebrow="COMPARE YOUR OPTIONS"
        title="Make your money count."
        description="See what your transfer could look like across providers."
        action={
          <button
            className={`border-0 bg-none text-primary text-[10px] font-[650] p-[8px_0] whitespace-nowrap [&_span]:text-[15px]
                [&_span]:ml-[4px] max-[700px]:text-[8px] max-[700px]:pt-[19px] max-[390px]:text-[7px]`}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show top rates" : "View all exchanges"}
            <span> →</span>
          </button>
        }
      />
      <div
        className={`border border-[var(--line)] rounded-[11px] bg-white overflow-hidden shadow-[0_5px_18px_#23365008]`}
      >
        <div
          className={`flex items-center justify-between p-[18px_21px] [&_p]:text-[9px] [&_p]:text-[#8895a5] [&_p]:m-[5px_0_0] [&_p_span]:p-[0_4px]
            max-[700px]:p-[14px] max-[700px]:[&_p]:text-[8px] max-[700px]:[&>_.live-label]:text-[7px] max-[700px]:[&>_.live-label]:gap-[5px] max-[390px]:[&_p]:text-[7px]`}
        >
          <div>
            <strong
              className={`text-[14px] text-navy flex items-center gap-[6px] [&_span]:text-[#9ba8b8] [&_span]:p-[0_3px] max-[700px]:text-[12px]
                max-[390px]:text-[11px]`}
            >
              {currencies[from].flag} {from}
              <span>→</span>
              {currencies[to].flag} {to}
            </strong>
            <p>
              For {money(amount, from)} sent <span>·</span> Sample comparison,
              fees may vary
            </p>
          </div>
          <LiveIndicator>Sample rates</LiveIndicator>
        </div>
        <div
          className={`grid grid-cols-[1.4fr_1fr_0.95fr_1fr_96px] items-center gap-x-[12px] pl-[20px] pr-[18px] bg-[#f7f9fc] border-t border-t-[#edf0f4]
            border-b border-b-[#edf0f4] min-h-[31px] text-[#8491a2] text-[8px] font-extrabold tracking-[0.75px] [&_span:nth-last-child(-n_+_2)]:text-right max-[900px]:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_78px]
            max-[900px]:pl-[14px] max-[900px]:pr-[13px] max-[700px]:hidden`}
        >
          <span>PROVIDER</span>
          <span>EXCHANGE RATE</span>
          <span>TRANSFER FEE</span>
          <span>YOU RECEIVE</span>
          <span />
        </div>
        <div className={`provider-list`}>
          {(showAll ? providers : providers.slice(0, 3)).map(
            (provider, index) => (
              <article
                className={`grid grid-cols-[1.4fr_1fr_0.95fr_1fr_96px] items-center gap-x-[12px] pl-[20px] pr-[18px] relative min-h-[70px]
                  border-b border-b-[#eef1f4] max-[900px]:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_78px] max-[900px]:pl-[14px] max-[900px]:pr-[13px] max-[700px]:grid-cols-[1fr_auto] max-[700px]:gap-y-[7px] max-[700px]:p-[11px_12px] max-[700px]:min-h-[0]`}
                key={provider.name}
              >
                <div
                  className={`flex items-center gap-[9px] [&_b]:block [&_small]:block [&_b]:text-[10px] [&_b]:text-[#263952] [&_small]:text-[8px]
                    [&_small]:text-[#929eae] [&_small]:mt-[3px] max-[700px]:col-[1] max-[700px]:row-[1] max-[390px]:[&_b]:text-[9px] max-[390px]:[&_small]:text-[7px]`}
                >
                  <span
                    className={`w-[31px] h-[31px] rounded-[8px] grid place-items-center font-extrabold text-[13px] [&.wise]:bg-[#e8f7ef] [&.wise]:text-[#1a9a61] [&.sendwave]:bg-[#eaf2ff] [&.sendwave]:text-[#3973ca] [&.remitly]:bg-[#fff0e5] [&.remitly]:text-[#d7783d] [&.worldremit]:bg-[#f1ebfc] [&.worldremit]:text-[#785bc0] max-[390px]:w-[28px] max-[390px]:h-[28px] ${provider.className}`}
                  >
                    {provider.mark}
                  </span>
                  <span>
                    <b>{provider.name}</b>
                    <small>{provider.time}</small>
                  </span>
                </div>
                <div
                  className={`[&_small]:block [&_small]:text-[8px] [&_small]:text-[#929eae] [&_small]:mt-[3px] [&_b]:text-[11px] [&_b]:text-[#263852] max-[700px]:col-[2] max-[700px]:row-[1]
                    max-[700px]:text-right max-[700px]:[&_small]:[display:inline] max-[700px]:[&_small]:ml-[4px] max-[390px]:[&_b]:text-[10px]`}
                >
                  <b>{number(provider.rate)}</b>
                  <small>
                    1 {from} = {to}
                  </small>
                </div>
                <div
                  className={`[&_small]:block [&_small]:text-[8px] [&_small]:text-[#929eae] [&_small]:mt-[3px] [&_b]:text-[9px] [&_b]:text-[#53627a] [&_b]:[font-weight:550] max-[700px]:col-[1]
                    max-[700px]:row-[2] max-[700px]:pl-[40px] max-[700px]:[&_small]:[display:inline] max-[700px]:[&_small]:ml-[4px] max-[390px]:[&_small]:text-[7px]`}
                >
                  <b>
                    {provider.fee === 0
                      ? "No fee"
                      : `${money(provider.fee, from)} fee`}
                  </b>
                  <small>Sample estimate</small>
                </div>
                <div
                  className={`[&_small]:block [&_small]:text-[8px] [&_small]:text-[#929eae] [&_small]:mt-[3px] [&_b]:text-[11px] [&_b]:text-[#172b47] max-[700px]:col-[2] max-[700px]:row-[2]
                    max-[700px]:text-right max-[700px]:[&_small]:[display:inline] max-[700px]:[&_small]:ml-[4px] max-[390px]:[&_small]:text-[7px] max-[390px]:[&_b]:text-[10px]`}
                >
                  <b>{money(amount * provider.rate, to)}</b>
                  <small>Estimated amount</small>
                </div>
                <div
                  className={`flex items-center justify-end gap-[7px] max-[900px]:gap-[4px] max-[700px]:absolute max-[700px]:hidden`}
                >
                  {index === 0 && <ButtonBadge variant="best-rate">BEST RATE</ButtonBadge>}
                  <a
                    href="#about"
                    aria-label={`Learn about ${provider.name}`}
                    className={`grid place-items-center w-[26px] h-[26px] border border-[#e1e7ef] rounded-[6px] text-[#687993] text-[12px]
                        [&:hover]:border-[#a9c4f5] [&:hover]:text-primary`}
                  >
                    ↗
                  </a>
                </div>
              </article>
            ),
          )}
        </div>
        <div
          className={`flex justify-between gap-[14px] p-[11px_20px] text-[#929eac] text-[8px] leading-[1.5] [&_a]:text-[#5877aa]
            [&_a]:whitespace-nowrap [&_a_span]:ml-[4px] max-[700px]:p-[10px_12px] max-[700px]:text-[7px] max-[390px]:gap-[8px] max-[390px]:[&_a]:text-[6px]`}
        >
          <span>
            ⓘ Sample values for design preview; provider rates and fees are not
            live.
          </span>
          <a href="#about">
            How comparisons work <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
