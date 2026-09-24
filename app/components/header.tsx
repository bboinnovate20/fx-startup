import { useState } from "react";
import { Brand } from "./ui/Brand";
import { Button } from "./ui/Button";
import { ButtonBadge } from "./ui/ButtonBadges";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header
      className={`h-18.5 bg-primary text-white relative`}
    >
      <div
        className="h-full max-w-360 m-auto px-25 flex items-center max-[700px]:p-[0_17px]"
      >
        <Brand />
        <div className="flex-grow flex gap-5">
          
          <button
            className={``}
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav aria-label="Main navigation" className="flex items-center gap-3">
            
            <a href="#rates" onClick={close}>
              <ButtonBadge className="transition-colors hover:bg-[#104fcf] hover:text-white border border-white/40 bg-white/10">Exchange rates</ButtonBadge>
              {/* Exchange rates */}
            </a>
            <a href="#compare" onClick={close}>
              <ButtonBadge className="transition-colors hover:bg-[#104fcf] hover:text-white border border-white/40 bg-white/10">Compare</ButtonBadge>
            </a>
            <a href="#alerts" onClick={close}>
              <ButtonBadge className="transition-colors hover:bg-[#104fcf] hover:text-white border border-white/40 bg-white/10">Rate alerts</ButtonBadge>
            </a>
            <a href="#about" onClick={close}>
              <ButtonBadge className="transition-colors hover:bg-[#104fcf] hover:text-white border border-white/40 bg-white/10">About</ButtonBadge>
            </a>
          </nav>
        </div>

        <div className="">
          <div className={`flex items-center gap-[22px] max-[700px]:ml-[auto]`}>
            <a
              className={`text-[#d7e0ec] text-[16px] max-[700px]:hidden font-bold`}
              href="#alerts"
            >
              Log in
            </a>
            <Button
              className={`px-4.5 py-2.5 rounded-full [&_span]:text-[15px] `}
              onClick={() =>
                document
                  .getElementById("converter")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get started
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
}
