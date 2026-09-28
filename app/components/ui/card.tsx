import type { ComponentProps } from "react";

export function Card(props: ComponentProps<"section">) {
  return <section data-slot="card" {...props} />;
}

export function CardHeader(props: ComponentProps<"div">) {
  return <div data-slot="card-header" {...props} />;
}

export function CardTitle(props: ComponentProps<"h2">) {
  return <h2 data-slot="card-title" {...props} />;
}

export function CardDescription(props: ComponentProps<"p">) {
  return <p data-slot="card-description" {...props} />;
}

export function CardContent(props: ComponentProps<"div">) {
  return <div data-slot="card-content" {...props} />;
}

export function CardFooter(props: ComponentProps<"div">) {
  return <div data-slot="card-footer" {...props} />;
}
