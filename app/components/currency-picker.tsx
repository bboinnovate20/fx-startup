import type { Currency } from "./data/fx-data";
import { currencies, currencyList } from "./data/fx-data";

export function CurrencyPicker({
  value,
  onChange,
  label,
}: {
  value: Currency;
  onChange: (value: Currency) => void;
  label: string;
}) {
  return (
    <label
      className={`h-[33px] inline-flex items-center gap-[6px] flex-[0_0_auto] bg-[#f4f6f9] rounded-[6px] p-[0_8px]
        text-[#263851] [&_select]:border-0 [&_select]:[appearance:none] [&_select]:bg-transparent [&_select]:text-inherit [&_select]:text-[10px] [&_select]:font-bold [&_select]:cursor-pointer
        [&_select]:outline-[0] [&_select]:p-[3px_0]`}
    >
      <span aria-hidden="true">{currencies[value].flag}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as Currency)}
      >
        {currencyList.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      <span
        className={`text-[13px] text-[#8996a7] mt-[-5px]`}
        aria-hidden="true"
      >
        ⌄
      </span>
    </label>
  );
}
