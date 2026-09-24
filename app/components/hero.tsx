import type { Currency } from "./data/fx-data";
import { Converter } from "./converter";

export function Hero({
  from,
  to,
  setFrom,
  setTo,
  amount,
  setAmount,
  rate,
}: {
  from: Currency;
  to: Currency;
  setFrom: (value: Currency) => void;
  setTo: (value: Currency) => void;
  amount: string;
  setAmount: (value: string) => void;
  rate: number;
}) {
  return (
    <section
      className={`relative p-[56px_24px_62px] bg-[linear-gradient(116deg,_#f1f6ff,_#f8faff_53%,_#eef4ff)] [isolation:isolate] [&_h1]:text-[55px] [&_h1]:leading-[1.03] [&_h1]:text-navy [&_h1]:m-[19px_0_14px]
        [&_h1]:tracking-[-0.055em] [&_h1_em]:not-italic [&_h1_em]:text-primary max-[900px]:[&_h1]:text-[47px] max-[700px]:p-[37px_17px_43px] max-[700px]:[&_h1]:text-[43px] max-[700px]:[&_h1]:m-[16px_0_10px] max-[390px]:[&_h1]:text-[39px]`}
      id="rates"
    >
      <div
        className={`max-w-[1145px] m-[auto] grid grid-cols-[minmax(0,_1fr)_444px] gap-[72px] items-center relative z-[1]
          max-[900px]:grid-cols-[minmax(0,_1fr)_410px] max-[900px]:gap-[32px] max-[700px]:flex max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-[23px]`}
      >
        <div
          className={`pl-[10px] [&>_p]:text-[14px] [&>_p]:leading-[1.8] [&>_p]:text-[#5e6d82] [&>_p]:max-w-[420px] [&>_p]:m-[0] max-[700px]:p-[0] max-[700px]:[&>_p]:text-[12px]
            max-[700px]:[&>_p]:max-w-[390px]`}
        >
          <span
            className={`inline-flex items-center gap-[8px] text-[#53729e] text-[10px] tracking-[0.8px] uppercase font-bold
              [&_i]:inline-block [&_i]:w-[7px] [&_i]:h-[7px] [&_i]:rounded-full [&_i]:bg-[var(--success)] [&_i]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--success)_11%,transparent)]`}
          >
            <i /> Smarter money transfers
          </span>
          <h1>
            Make every
            <br />
            pound <em>go further.</em>
          </h1>
          <p>
            Compare exchange rates from trusted providers and find a better way
            to send money abroad.
          </p>
          <div
            className={`flex items-center gap-[12px] mt-[28px] [&_b]:block [&_small]:block [&_b]:text-[10px] [&_b]:text-[#41536b]
              [&_small]:text-[9px] [&_small]:text-[#8996a7] [&_small]:mt-[3px] max-[700px]:mt-[17px] max-[390px]:[&_b]:text-[9px] max-[390px]:[&_small]:text-[8px]`}
          >
            <div
              className={`flex pl-[2px] [&_i]:w-[27px] [&_i]:h-[27px] [&_i]:ml-[-4px] [&_i]:[border:2px_solid_#f3f7ff] [&_i]:rounded-full [&_i]:grid
                [&_i]:place-items-center [&_i]:not-italic [&_i]:font-bold [&_i]:text-[9px] [&_i]:text-[#3b5980] [&_i]:bg-[#d2e3fa] [&_i:nth-child(2)]:bg-[#f3dbcd] [&_i:nth-child(2)]:text-[#8e604c]
                [&_i:nth-child(3)]:bg-[#e0d9f8] [&_i:nth-child(3)]:text-[#705eaa] [&_i:nth-child(4)]:bg-[#e7ecf3] [&_i:nth-child(4)]:text-[#627188]`}
              aria-hidden="true"
            >
              <i>J</i>
              <i>A</i>
              <i>M</i>
              <i>+</i>
            </div>
            <span>
              <b>Compare with confidence</b>
              <small>Clear rates. Better-informed choices.</small>
            </span>
          </div>
        </div>
        <Converter {...{ from, to, setFrom, setTo, amount, setAmount, rate }} />
      </div>
    </section>
  );
}
