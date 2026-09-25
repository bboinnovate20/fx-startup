"use client";

import { useState } from "react";
import type { Currency } from "./data/fx-data";
import { getRate } from "./data/fx-data";
import { Header } from "./header";
import { Hero } from "./hero";
import { MarketStrip } from "./market-strip";
import { ProviderComparison } from "./provider-comparison";
import { TrendSection } from "./trend-section";
import { AlertsSection } from "./alerts-section";
import { Footer } from "./footer";

export default function FxDashboard() {
  const [from, setFrom] = useState<Currency>("GBP");
  const [to, setTo] = useState<Currency>("NGN");
  const [amount, setAmount] = useState("500");
  const rate = getRate(from, to);
  const amountValue = Number(amount) || 0;
  return (
    <>
      <div className={`overflow-hidden`} id="top">
        <Header />

        <main>
          <MarketStrip />
          <Hero
            {...{ from, to, setFrom, setTo, amount, setAmount }}
            rate={rate}
          />
          <div
            className={`max-w-[1145px] m-[auto] p-[55px_18px_67px] max-[700px]:p-[39px_15px_47px]`}
          >
            <ProviderComparison
              from={from}
              to={to}
              amount={amountValue}
              rate={rate}
            />
            <TrendSection from={from} to={to} rate={rate} />
            <AlertsSection {...{ from, to, setFrom, setTo }} />
            <section
              className={`relative overflow-hidden flex items-center gap-[14px] p-[22px_25px] border border-[#e0e9fa] rounded-[11px]
                bg-[#edf3ff] [&>_div:nth-child(2)]:relative [&>_div:nth-child(2)]:z-[1] [&_h2]:text-[17px] [&_h2]:text-navy [&_h2]:m-[5px_0] [&_p]:text-[9px] [&_p]:text-[#7889a2]
                [&_p]:m-[0] [&>_a]:relative [&>_a]:z-[1] [&>_a]:ml-[auto] [&>_a]:border border-[#dce6f7] [&>_a]:rounded-[6px] [&>_a]:p-[10px_12px] [&>_a]:bg-surface
                [&>_a]:text-[#315b9e] [&>_a]:text-[8px] [&>_a]:font-[650] [&>_a]:whitespace-nowrap [&>_a_span]:text-[13px] [&>_a_span]:ml-[8px] max-[700px]:p-[17px] max-[700px]:gap-[11px]
                max-[700px]:items-start max-[700px]:flex-wrap max-[700px]:[&>_div:nth-child(2)]:w-[calc(100%_-_45px)] max-[700px]:[&_h2]:text-[15px] max-[700px]:[&_p]:leading-[1.5] max-[700px]:[&>_a]:ml-[44px] max-[700px]:[&>_a]:p-[9px_10px]`}
            >
              <span
                className={`relative z-[1] grid place-items-center w-[38px] h-[38px] rounded-[10px] bg-primary
                  text-white text-[20px] shadow-[0_6px_15px_color-mix(in_srgb,var(--blue)_19%,transparent)] max-[700px]:w-[33px] max-[700px]:h-[33px]`}
                aria-hidden="true"
              >
                ↗
              </span>
              <div>
                <span
                  className={`text-[9px] tracking-[1.35px] font-extrabold text-[#6f82a1]`}
                >
                  YOUR MONEY. YOUR MOVE.
                </span>
                <h2>A better rate is just the start.</h2>
                <p>Compare transparently and make more of every transfer.</p>
              </div>
              <a href="#converter">
                Convert currency <span>→</span>
              </a>
              <div
                className={`absolute [right:130px] [top:-83px] w-[220px] h-[220px] border border-[#a8c2ef45] rounded-full shadow-[0_0_0_30px_#a8c2ef20,_0_0_0_62px_#a8c2ef12]
                  max-[700px]:[right:10px]`}
                aria-hidden="true"
              />
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
