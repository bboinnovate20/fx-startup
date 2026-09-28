"use client";

import { useEffect, useState } from "react";
import type { Currency } from "./data/fx-data";
import { getRate } from "./data/fx-data";
import type { ProviderInfo } from "./data/providers";
import { Header } from "./header";
import { Hero } from "./hero";
import { MarketStrip } from "./market-strip";
import { ProviderComparison } from "./provider-comparison";
import { ProviderDirectory } from "./provider-directory";
import { TrendSection } from "./trend-section";
import { AlertsSection } from "./alerts-section";
import { Footer } from "./footer";
import { ArrowIcon } from "./ui/ArrowIcon";

export default function FxDashboard({
  initialValues,
}: {
  initialValues?: { amount?: string; from?: Currency; to?: Currency };
}) {
  const [from, setFrom] = useState<Currency>(initialValues?.from ?? "GBP");
  const [to, setTo] = useState<Currency>(initialValues?.to ?? "NGN");
  const [amount, setAmount] = useState(initialValues?.amount ?? "500");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const rate = getRate(from, to);

  useEffect(() => {
    let active = true;
    fetch("/data/providers.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load providers");
        return response.json() as Promise<ProviderInfo[]>;
      })
      .then((data) => {
        if (active && Array.isArray(data)) setProviders(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className={`overflow-hidden`} id="top">
        <Header />

        <main>
          <MarketStrip />
          <Hero
            {...{ from, to, setFrom, setTo, amount, setAmount }}
            rate={rate}
            providers={providers}
          />
          <div
            className={`max-w-[1000px] m-[auto] p-[55px_18px_67px] max-[700px]:p-[39px_15px_47px]`}
          >
            <ProviderComparison
              from={from}
              to={to}
              amount={amount}
              setAmount={setAmount}
              rate={rate}
              providers={providers}
            />
            <ProviderDirectory providers={providers} />
            <TrendSection from={from} to={to} setFrom={setFrom} setTo={setTo} rate={rate} />
            <AlertsSection {...{ from, to, setFrom, setTo }} />

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
