// Health — Edge Function
// Minimal health-check endpoint for uptime monitoring.

Deno.serve(async (_req) => {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
