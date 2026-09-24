import { Button } from "./ui/Button";
import { CurrencyPicker } from "./currency-picker";
import { currencies, money, number, type Currency } from "./data/fx-data";

export function Converter({
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
  const receive = (Number(amount) || 0) * rate;
  return (
    <section
      className={`bg-surface border border-[#e5ebf3] rounded-[14px] p-[22px_23px_17px] shadow-[0_18px_52px_#243d6016] max-[700px]:p-[18px_16px_15px]`}
      id="converter"
      aria-labelledby="converter-title"
    >
      <div
        className={`flex items-center justify-between mb-[17px] [&_h2]:text-[17px] [&_h2]:tracking-[-0.03em] [&_h2]:text-navy [&_h2]:m-[5px_0_0]
          max-[700px]:mb-[13px]`}
      >
        <div>
          <span
            className={`text-[9px] font-extrabold tracking-[1.25px] text-[#7c8aa0]`}
          >
            CURRENCY CONVERTER
          </span>
          <h2 id="converter-title">See your money’s value</h2>
        </div>
        <span
          className={`w-[29px] h-[29px] grid place-items-center rounded-[8px] bg-[#edf3ff] text-primary text-[17px]`}
          aria-hidden="true"
        >
          ↗
        </span>
      </div>
      <div
        className={`p-[10px_12px_8px] border border-[#dfe6ee] rounded-[8px] [&>_label]:block [&>_label]:text-[#748197] [&>_label]:text-[9px] [&>_small]:block [&>_small]:text-[#9aa5b4]
          [&>_small]:text-[8px] [&>_small]:mt-[0]`}
      >
        <label htmlFor="send-amount">You send</label>
        <div
          className={`flex items-center gap-[7px] min-h-[34px] mt-[2px] [&_input]:min-w-[0] [&_input]:w-[100%] [&_input]:border-0
            [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#1c2e49] [&_input]:font-display [&_input]:font-semibold [&_input]:text-[23px] [&_input]:tracking-[-0.04em]
            [&_input]:p-[0] max-[700px]:[&_input]:text-[21px]`}
        >
          <span
            className={`font-display font-semibold text-[#21334f] text-[19px]`}
          >
            {currencies[from].symbol}
          </span>
          <input
            id="send-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label={`Amount in ${from}`}
          />
          <CurrencyPicker
            value={from}
            label="Source currency"
            onChange={setFrom}
          />
        </div>
        <small>{currencies[from].name}</small>
      </div>
      <div
        className={`h-[25px] flex items-center gap-[8px] p-[0_13px] [&>_span]:h-[1px] [&>_span]:bg-[#edf0f4] [&>_span]:flex-[1]
          [&_button]:h-[25px] [&_button]:w-[25px] [&_button]:rounded-[7px] [&_button]:border border-[#dce5f1] [&_button]:bg-[#f9fbff] [&_button]:text-primary [&_button]:text-[16px] [&_button]:leading-[1]`}
      >
        <span />
        <button
          type="button"
          aria-label="Swap currencies"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          ⇅
        </button>
        <span />
      </div>
      <div
        className={`p-[10px_12px_8px] border border-[#dfe6ee] rounded-[8px] [&>_label]:block [&>_label]:text-[#748197] [&>_label]:text-[9px] [&>_small]:block [&>_small]:text-[#9aa5b4]
          [&>_small]:text-[8px] [&>_small]:mt-[0] bg-[#f8faff] border-[#dbe6f7]`}
      >
        <label>They receive</label>
        <div
          className={`flex items-center gap-[7px] min-h-[34px] mt-[2px] [&_input]:min-w-[0] [&_input]:w-[100%] [&_input]:border-0
            [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:text-[#1c2e49] [&_input]:font-display [&_input]:font-semibold [&_input]:text-[23px] [&_input]:tracking-[-0.04em]
            [&_input]:p-[0] max-[700px]:[&_input]:text-[21px]`}
        >
          <output
            className={`min-w-[0] flex-[1] whitespace-nowrap overflow-hidden text-ellipsis font-display text-[22px] font-semibold
              tracking-[-0.04em] text-primary max-[700px]:text-[20px]`}
          >
            {money(receive, to)}
          </output>
          <CurrencyPicker value={to} label="Target currency" onChange={setTo} />
        </div>
        <small>{currencies[to].name}</small>
      </div>
      <div
        className={`mt-[14px] p-[12px_0] border-t border-t-[#edf0f4] flex justify-between items-center text-[9px] text-[#8290a3]
          [&_strong]:text-[9px] [&_strong]:text-[#34445c]`}
      >
        <span>Indicative sample rate · market average</span>
        <strong>
          1 {from} = {number(rate, rate < 10 ? 4 : 2)} {to}
        </strong>
      </div>
      <Button
        className={`w-full h-[41px] rounded-lg text-xs [&_span]:ml-[auto] [&_span]:text-[16px]`}
        onClick={() =>
          document
            .getElementById("compare")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Compare providers <span aria-hidden="true">→</span>
      </Button>
      <p
        className={`text-center text-[#96a2b1] text-[8px] m-[10px_0_0] [&_span]:text-[#37956c] [&_span]:text-[11px] [&_span]:mr-[4px]`}
      >
        <span aria-hidden="true">⌑</span> Compare transparently. Choose
        confidently.
      </p>
    </section>
  );
}
