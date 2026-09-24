import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex items-end justify-between gap-[18px] mb-[19px] [&_h2]:text-[26px] [&_h2]:leading-[1.15] [&_h2]:text-navy
        [&_h2]:m-[6px_0] [&_p]:text-[11px] [&_p]:text-[#77869b] [&_p]:m-[0] [&_p]:leading-[1.6] max-[700px]:items-start max-[700px]:mb-[15px] max-[700px]:[&_h2]:text-[22px]
        max-[700px]:[&_p]:text-[9px] max-[700px]:[&_p]:leading-[1.55] max-[700px]:[&_p]:max-w-[300px] max-[390px]:[&_h2]:text-[20px]`}
    >
      <div>
        <span
          className={`text-[9px] tracking-[1.35px] font-extrabold text-[#6f82a1]`}
        >
          {eyebrow}
        </span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
