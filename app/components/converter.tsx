import { CurrencyPicker } from "./currency-picker";
import { money, number, type Currency } from "./data/fx-data";

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
  const receive = (Number(amount.replaceAll(",", "")) || 0) * rate;

  return (
    <section
      className="mx-auto w-full max-w-[530px] rounded-[26px] border border-[#e6e9e4] bg-white px-5 pb-6 pt-6 text-left shadow-[0_22px_60px_#12220d38] sm:px-[26px] sm:pb-7 sm:pt-7"
      id="converter"
      aria-labelledby="converter-title"
    >
      <h2 id="converter-title" className="sr-only">Currency converter</h2>
      <div className="mb-6 text-center">
        <p className="m-0 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#30472b]">
          Indicative exchange rate
          <span className="grid h-[14px] w-[14px] place-items-center rounded-full border border-[#52694d] text-[9px]" aria-label="Rates are indicative">i</span>
        </p>
        <p className="mb-0 mt-2 text-[12px] font-semibold text-[#30472b]">
          1 {from} = {number(rate, rate < 10 ? 4 : 2)} {to}
        </p>
      </div>

      <label htmlFor="send-amount" className="mb-1 block text-[12px] font-medium text-[#343b33]">Amount</label>
      <div className="flex min-h-[58px] items-center gap-2 rounded-[9px] border border-[#c5c9c4] px-3 focus-within:border-[#75bf50] focus-within:ring-2 focus-within:ring-[#91df6330] sm:min-h-[64px] sm:px-3.5">
        <input
          id="send-amount"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ""))}
          aria-label={`Amount in ${from}`}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-display text-[22px] font-semibold tracking-[-.04em] text-[#202421] outline-none sm:text-[24px]"
        />
        <CurrencyPicker value={from} label="Source currency" onChange={setFrom} variant="hero" />
      </div>

      <div className="relative z-[1] flex h-[52px] items-center justify-center" aria-label="Swap source and target currencies">
        <button
          type="button"
          aria-label="Swap currencies"
          onClick={() => { setFrom(to); setTo(from); }}
          className="grid h-9 w-9 place-items-center rounded-full border-0 bg-[#91df63] text-[20px] leading-none text-[#243a20] transition hover:bg-[#7dd34a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477b30]"
        >
          ↕
        </button>
      </div>

      <label className="mb-1 block text-[12px] font-medium text-[#343b33]">Converted to</label>
      <div className="flex min-h-[58px] items-center gap-2 rounded-[9px] border border-[#c5c9c4] px-3 sm:min-h-[64px] sm:px-3.5">
        <output className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-display text-[22px] font-semibold tracking-[-.04em] text-[#202421] sm:text-[24px]" aria-live="polite">
          {money(receive, to)}
        </output>
        <CurrencyPicker value={to} label="Target currency" onChange={setTo} variant="hero" />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-[13px] bg-[#eaf8fd] px-4 py-4 text-[12px] leading-[1.55] text-[#244966] sm:px-5">
        <span className="grid h-10 w-12 shrink-0 place-items-center text-[25px]" aria-hidden="true">✈</span>
        <p className="m-0">Compare providers to see how much you could receive. <a href="#compare" className="font-semibold underline underline-offset-2">Explore rates</a></p>
      </div>

      <button
        type="button"
        onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}
        className="mt-3 h-[47px] w-full rounded-full border-0 bg-[#91df63] text-[14px] font-semibold text-[#233b1e] transition hover:bg-[#7dd34a]"
      >
        Compare providers
      </button>
      <a href="#alerts" className="mt-1.5 flex h-[43px] w-full items-center justify-center rounded-full border border-[#58724f] bg-white text-[13px] font-semibold text-[#30472b] transition hover:bg-[#f5faf2]">
        Track exchange rate
      </a>
      <p className="mb-0 mt-3 text-center text-[9px] leading-relaxed text-[#818980]">Indicative market rate · provider rates and fees may vary</p>
    </section>
  );
}
