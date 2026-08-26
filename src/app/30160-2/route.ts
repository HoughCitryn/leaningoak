export function GET() {
  return new Response("This page is no longer available.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function HEAD() {
  return new Response(null, { status: 410 });
}
