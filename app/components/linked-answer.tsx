import type { ReactNode } from "react";

export type ProviderLink = { name: string; url: string };

export function linkProviderNames(text: string, providers: ProviderLink[]): ReactNode[] {
  const names = providers
    .filter((provider) => provider.name && provider.url)
    .sort((left, right) => right.name.length - left.name.length);
  const ranges: { start: number; end: number; url: string }[] = [];
  const lower = text.toLowerCase();

  for (const provider of names) {
    const needle = provider.name.toLowerCase();
    let from = 0;
    while (from < text.length) {
      const start = lower.indexOf(needle, from);
      if (start === -1) break;
      const end = start + needle.length;
      const before = start === 0 || !/\w/.test(text[start - 1] ?? "");
      const after = end === text.length || !/\w/.test(text[end] ?? "");
      const overlaps = ranges.some((range) => start < range.end && end > range.start);
      if (before && after && !overlaps) ranges.push({ start, end, url: provider.url });
      from = start + needle.length;
    }
  }

  ranges.sort((left, right) => left.start - right.start);
  const nodes: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) nodes.push(text.slice(cursor, range.start));
    nodes.push(
      <a
        key={`${range.start}-${index}`}
        href={range.url}
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
      >
        {text.slice(range.start, range.end)}
      </a>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
