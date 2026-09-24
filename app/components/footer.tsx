import { Brand } from "./ui/Brand";

export function Footer() {
  return (
    <footer className={`bg-navy text-[#91a2b9]`} id="about">
      <div
        className={`max-w-[1145px] m-[auto] p-[25px_18px] flex items-center gap-[22px] [&_nav]:flex [&_nav]:items-center
          [&_nav]:gap-[17px] [&_nav]:ml-[auto] [&_nav]:text-[8px] [&_nav_a:hover]:text-white [&>_small]:text-[7px] [&>_small]:text-[#71839b] [&>_small]:whitespace-nowrap max-[900px]:flex-wrap
          max-[900px]:[&_nav]:ml-[0] max-[900px]:[&>_small]:ml-[auto] max-[700px]:p-[21px_16px] max-[700px]:gap-[13px] max-[700px]:[&_nav]:w-[100%] max-[700px]:[&_nav]:flex-wrap max-[700px]:[&_nav]:gap-[12px_16px] max-[700px]:[&>_small]:m-[0]
          max-[700px]:[&>_small]:w-[100%]`}
      >
        <div
          className={`[&_.brand]:text-[16px] [&_.brand-mark]:h-[24px] [&_.brand-mark]:w-[24px] [&_.brand-mark]:rounded-[7px] [&_.brand-mark_svg]:w-[14px] [&_p]:text-[8px] [&_p]:text-[#8192aa] [&_p]:m-[7px_0_0]`}
        >
          <Brand />
          <p>Currency exchange, made clearer.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#compare">Compare rates</a>
          <a href="#alerts">Rate alerts</a>
          <a href="#about">About FX Swift</a>
          <a href="#about">Privacy</a>
          <a href="#about">Terms</a>
        </nav>
        <small>© 2026 FX Swift. Sample figures shown for preview.</small>
      </div>
    </footer>
  );
}
