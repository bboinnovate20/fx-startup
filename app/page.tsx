import FxDashboard from "./components/fx-dashboard";
import { currencyList, type Currency } from "./components/data/fx-data";

type SearchParams = Promise<{
  sendAmount?: string | string[];
  sourceCurrency?: string | string[];
  targetCurrency?: string | string[];
}>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isCurrency(value: string | undefined): value is Currency {
  return Boolean(value && currencyList.includes(value as Currency));
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const source = first(params.sourceCurrency);
  const target = first(params.targetCurrency);
  const amount = first(params.sendAmount);

  return (
    <FxDashboard
      initialValues={{
        amount: amount?.replace(/[^\d.,]/g, "") || "500",
        from: isCurrency(source) ? source : "GBP",
        to: isCurrency(target) ? target : "NGN",
      }}
    />
  );
}
