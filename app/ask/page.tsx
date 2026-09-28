
import AskExperience from "../components/ask-experience";
import { currencyList, type Currency } from "../components/data/fx-data";
import { Footer } from "../components/footer";
import { Header } from "../components/header";

type SearchParams = Promise<{
  q?: string | string[];
  from?: string | string[];
  to?: string | string[];
  amount?: string | string[];
}>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isCurrency(value: string | undefined): value is Currency {
  return Boolean(value && currencyList.includes(value as Currency));
}

export default async function AskPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const from = isCurrency(first(params.from)) ? first(params.from) as Currency : "GBP";
  const to = isCurrency(first(params.to)) ? first(params.to) as Currency : "NGN";
  const rawAmount = first(params.amount)?.replace(/[\s,]/g, "") ?? "500";
  const numericAmount = Number(rawAmount);
  const amount = Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= 1_000_000_000
    ? String(numericAmount)
    : "500";
  const question = first(params.q)?.trim().slice(0, 500)
    || `What is the ${from} to ${to} rate and trend?`;

  return (
    <>
      <Header askHref="#ask-follow-up" startTarget="rates" />
      <AskExperience initialFrom={from} initialTo={to} initialAmount={amount} initialQuestion={question} />
      <Footer />
    </>
  );
}
