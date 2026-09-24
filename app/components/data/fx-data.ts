export type Currency = "GBP" | "NGN" | "USD" | "EUR";
export type Alert = {
  id: number;
  from: Currency;
  to: Currency;
  low: number;
  high: number;
  target: number;
  mode: "range" | "threshold";
  channel: "Telegram" | "WhatsApp";
  enabled: boolean;
};
export const currencies: Record<
  Currency,
  { flag: string; name: string; symbol: string; digits: number }
> = {
  GBP: { flag: "🇬🇧", name: "British Pound", symbol: "£", digits: 2 },
  NGN: { flag: "🇳🇬", name: "Nigerian Naira", symbol: "₦", digits: 0 },
  USD: { flag: "🇺🇸", name: "US Dollar", symbol: "$", digits: 2 },
  EUR: { flag: "🇪🇺", name: "Euro", symbol: "€", digits: 2 },
};
export const pairRates: Record<string, number> = {
  "GBP-NGN": 2048.62,
  "USD-NGN": 1582.4,
  "EUR-NGN": 1730.18,
  "GBP-USD": 1.2748,
  "GBP-EUR": 1.1682,
  "USD-EUR": 0.9164,
};
export const providerSeed = [
  {
    name: "Wise",
    mark: "W",
    className: "wise",
    rate: 2048.62,
    fee: 2.8,
    time: "Usually seconds",
  },
  {
    name: "Sendwave",
    mark: "↗",
    className: "sendwave",
    rate: 2042.15,
    fee: 0,
    time: "Usually minutes",
  },
  {
    name: "Remitly",
    mark: "R",
    className: "remitly",
    rate: 2036.8,
    fee: 1.5,
    time: "Same day",
  },
  {
    name: "WorldRemit",
    mark: "◉",
    className: "worldremit",
    rate: 2028.35,
    fee: 2,
    time: "Same day",
  },
];
export const trendPoints = [
  35, 39, 36, 43, 41, 49, 46, 54, 51, 58, 54, 63, 59, 68, 64, 73, 70, 78, 75,
  84, 80, 89, 86, 95,
];
export const currencyList = Object.keys(currencies) as Currency[];

export function getRate(from: Currency, to: Currency) {
  if (from === to) return 1;
  const direct = pairRates[`${from}-${to}`];
  if (direct) return direct;
  const inverse = pairRates[`${to}-${from}`];
  if (inverse) return 1 / inverse;
  const toNgn = pairRates[`${from}-NGN`];
  const targetToNgn = pairRates[`${to}-NGN`];
  if (toNgn && targetToNgn) return toNgn / targetToNgn;
  return 1;
}

export function money(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: currencies[currency].digits,
  }).format(value);
}

export function number(value: number, digits = 2) {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatRange(low: number, high: number) {
  return `${number(low, 0)} – ${number(high, 0)}`;
}
