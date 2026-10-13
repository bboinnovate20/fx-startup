import { fxApiOrigin } from "../../lib/fx-api-origin";

const hopByHop = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "transfer-encoding",
]);

async function proxy(request: Request, path: string[]) {
  const incoming = new URL(request.url);
  const target = `${fxApiOrigin()}/${path.join("/")}${incoming.search}`;
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) headers.set(key, value);
  });

  const response = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  });

  const outgoing = new Headers();
  response.headers.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) outgoing.set(key, value);
  });
  return new Response(response.body, { status: response.status, headers: outgoing });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}
