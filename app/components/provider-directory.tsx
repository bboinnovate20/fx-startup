"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ProviderInfo } from "./data/providers";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" as const } },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.82 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function ProviderDirectory({ providers }: { providers: ProviderInfo[] }) {
  const prefersReducedMotion = useReducedMotion();
  if (!providers.length) return null;

  return (
    <section className="relative left-1/2 mb-[53px] w-screen -translate-x-1/2 bg-primary py-11 font-display text-white sm:py-14" id="providers">
      <div className="mx-auto max-w-[1145px] px-[15px] sm:px-[18px]">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="text-xs font-bold tracking-[0.14em] text-white/75">TRANSFER PROVIDERS</span>
          <h2 className="mb-2 mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
            Explore transfer services.
          </h2>
          <p className="m-0 text-base leading-relaxed text-white/80 sm:text-lg">
            Visit providers to learn more about their transfer options.
          </p>
        </motion.div>

        <motion.ul
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.15 }}
          variants={listVariants}
          className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4"
        >
          {providers.map((provider) => (
            <motion.li key={provider.id} variants={itemVariants}>
              <a
                href={provider.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex min-w-0 items-center gap-3 rounded-[14px] border border-white/20 bg-white p-3 transition-colors hover:bg-white/20 sm:p-4"
              >
                <motion.span
                  variants={logoVariants}
                  className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full sm:h-12 sm:w-12"
                >
                  <img className="h-full w-full object-cover" src={provider.logo} alt="" loading="lazy" />
                </motion.span>
                <span className="truncate text-sm font-semibold text-black sm:text-base">{provider.name}</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
