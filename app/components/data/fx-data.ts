const currencyEntries = [
  ["EUR", "Euro"], ["GBP", "British Pound Sterling"], ["USD", "US Dollar"], ["INR", "Indian Rupee"], ["CAD", "Canadian Dollar"], ["AUD", "Australian Dollar"], ["CHF", "Swiss Franc"], ["MXN", "Mexican Peso"], ["AED", "United Arab Emirates Dirham"],
  ["ALL", "Albanian Lek"], ["AMD", "Armenian Dram"], ["ANG", "Netherlands Antillean Guilder"], ["AOA", "Angolan Kwanza"], ["ARS", "Argentine Peso"], ["AWG", "Aruban Florin"], ["AZN", "Azerbaijani Manat"],
  ["BAM", "Bosnia-Herzegovina Convertible Mark"], ["BBD", "Barbadian Dollar"], ["BDT", "Bangladeshi Taka"], ["BGN", "Bulgarian Lev"], ["BHD", "Bahraini Dinar"], ["BMD", "Bermudan Dollar"], ["BND", "Brunei Dollar"], ["BOB", "Bolivian Boliviano"], ["BRL", "Brazilian Real"], ["BSD", "Bahamian Dollar"], ["BTN", "Bhutanese Ngultrum"], ["BWP", "Botswanan Pula"], ["BZD", "Belize Dollar"],
  ["CLP", "Chilean Peso"], ["CNY", "Chinese Yuan RMB"], ["COP", "Colombian Peso"], ["CRC", "Costa Rican Colón"], ["CVE", "Cape Verdean Escudo"], ["CZK", "Czech Republic Koruna"],
  ["DJF", "Djiboutian Franc"], ["DKK", "Danish Krone"], ["DOP", "Dominican Peso"], ["DZD", "Algerian Dinar"],
  ["EGP", "Egyptian Pound"], ["ETB", "Ethiopian Birr"], ["FJD", "Fijian Dollar"], ["FKP", "Falkland Islands Pound"],
  ["GEL", "Georgian Lari"], ["GGP", "Guernsey Pound"], ["GHS", "Ghanaian Cedi"], ["GIP", "Gibraltar Pound"], ["GMD", "Gambian Dalasi"], ["GNF", "Guinean Franc"], ["GTQ", "Guatemalan Quetzal"], ["GYD", "Guyanaese Dollar"],
  ["HKD", "Hong Kong Dollar"], ["HNL", "Honduran Lempira"], ["HRK", "Croatian Kuna"], ["HTG", "Haitian Gourde"], ["HUF", "Hungarian Forint"],
  ["IDR", "Indonesian Rupiah"], ["ILS", "Israeli New Sheqel"], ["IMP", "Isle of Man Pound"], ["ISK", "Icelandic Króna"],
  ["JEP", "Jersey Pound"], ["JMD", "Jamaican Dollar"], ["JOD", "Jordanian Dinar"], ["JPY", "Japanese Yen"],
  ["KES", "Kenyan Shilling"], ["KGS", "Kyrgystani Som"], ["KHR", "Cambodian Riel"], ["KMF", "Comorian Franc"], ["KRW", "South Korean Won"], ["KWD", "Kuwaiti Dinar"], ["KYD", "Cayman Islands Dollar"], ["KZT", "Kazakhstani Tenge"],
  ["LAK", "Laotian Kip"], ["LBP", "Lebanese Pound"], ["LKR", "Sri Lankan Rupee"], ["LRD", "Liberian Dollar"], ["LSL", "Lesotho Loti"],
  ["MAD", "Moroccan Dirham"], ["MDL", "Moldovan Leu"], ["MGA", "Malagasy Ariary"], ["MKD", "Macedonian Denar"], ["MNT", "Mongolian Tugrik"], ["MOP", "Macanese Pataca"], ["MRU", "Mauritanian Ouguiya"], ["MUR", "Mauritian Rupee"], ["MVR", "Maldivian Rufiyaa"], ["MWK", "Malawian Kwacha"], ["MYR", "Malaysian Ringgit"], ["MZN", "Mozambican Metical"],
  ["NAD", "Namibian Dollar"], ["NGN", "Nigerian Naira"], ["NIO", "Nicaraguan Córdoba"], ["NOK", "Norwegian Krone"], ["NPR", "Nepalese Rupee"], ["NZD", "New Zealand Dollar"], ["OMR", "Omani Rial"],
  ["PAB", "Panamanian Balboa"], ["PEN", "Peruvian Nuevo Sol"], ["PGK", "Papua New Guinean Kina"], ["PHP", "Philippine Peso"], ["PKR", "Pakistani Rupee"], ["PLN", "Polish Zloty"], ["PYG", "Paraguayan Guarani"], ["QAR", "Qatari Rial"],
  ["RON", "Romanian Leu"], ["RSD", "Serbian Dinar"], ["RWF", "Rwandan Franc"], ["SAR", "Saudi Riyal"], ["SBD", "Solomon Islands Dollar"], ["SCR", "Seychellois Rupee"], ["SEK", "Swedish Krona"], ["SGD", "Singapore Dollar"], ["SHP", "Saint Helena Pound"], ["SLL", "Sierra Leonean Leone"], ["SRD", "Surinamese Dollar"], ["SVC", "Salvadoran Colón"], ["SZL", "Swazi Lilangeni"],
  ["THB", "Thai Baht"], ["TJS", "Tajikistani Somoni"], ["TMT", "Turkmenistani Manat"], ["TND", "Tunisian Dinar"], ["TOP", "Tongan Paʻanga"], ["TRY", "Turkish Lira"], ["TTD", "Trinidad and Tobago Dollar"], ["TWD", "New Taiwan Dollar"], ["TZS", "Tanzanian Shilling"], ["UAH", "Ukrainian Hryvnia"], ["UGX", "Ugandan Shilling"], ["UYU", "Uruguayan Peso"], ["UZS", "Uzbekistan Som"],
  ["VND", "Vietnamese Dong"], ["VUV", "Vanuatu Vatu"], ["WST", "Samoan Tala"], ["XCD", "East Caribbean Dollar"], ["XOF", "CFA Franc BCEAO"], ["XPF", "CFP Franc"], ["ZAR", "South African Rand"], ["ZMW", "ZMW"],
] as const;

export type Currency = (typeof currencyEntries)[number][0];
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
const flagFallbacks: Partial<Record<Currency, string>> = {
  ANG: "wise",
  GGP: "wise",
  JEP: "wise",
  SVC: "wise",
  XPF: "wise",
};

const currencyInfo = currencyEntries.map(([code, name]) => {
  const iconCode = flagFallbacks[code] ?? code.toLowerCase();
  try {
    const formatter = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    });
    return [code, {
      name,
      icon: `/currencies/${iconCode}.svg`,
      symbol: formatter.formatToParts(0).find((part) => part.type === "currency")?.value ?? code,
      digits: code === "NGN" ? 0 : formatter.resolvedOptions().maximumFractionDigits,
    }] as const;
  } catch {
    return [code, { name, icon: `/currencies/${iconCode}.svg`, symbol: code, digits: 2 }] as const;
  }
});

export const currencies = Object.fromEntries(currencyInfo) as Record<
  Currency,
  { icon: string; name: string; symbol: string; digits: number }
>;
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
    id: "lemfi",
    name: "LemFi",
    mark: "L",
    className: "lemfi",
    rate: 2048.62,
    fee: 2.8,
    time: "Usually seconds",
  },
  {
    id: "sendwave",
    name: "Sendwave",
    mark: "S",
    className: "sendwave",
    rate: 2042.15,
    fee: 0,
    time: "Usually minutes",
  },
  {
    id: "remitly",
    name: "Remitly",
    mark: "R",
    className: "remitly",
    rate: 2036.8,
    fee: 1.5,
    time: "Same day",
  },
  {
    id: "pesa",
    name: "Pesa",
    mark: "P",
    className: "pesa",
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

export function getRate(from: Currency, to: Currency): number | null {
  if (from === to) return 1;
  const direct = pairRates[`${from}-${to}`];
  if (direct) return direct;
  const inverse = pairRates[`${to}-${from}`];
  if (inverse) return 1 / inverse;
  const toNgn = pairRates[`${from}-NGN`];
  const targetToNgn = pairRates[`${to}-NGN`];
  if (toNgn && targetToNgn) return toNgn / targetToNgn;
  return null;
}

export function money(value: number, currency: Currency) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: currencies[currency].digits,
    }).format(value);
  } catch {
    return `${number(value, currencies[currency].digits)} ${currency}`;
  }
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
