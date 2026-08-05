// Scheduler — Edge Function
// Cron-triggered collector dispatcher. Fetches all enabled, active feeds from
// the feeds table and records a collector_runs entry for each.
// Runs server-side with the service_role key — never expose this in the browser.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (_req) => {
  const { data: feeds, error } = await supabase
    .from('feeds')
    .select('*')
    .eq('enabled', true)
    .eq('health_status', 'active');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const results = [];
  for (const feed of feeds ?? []) {
    // Log each feed processing intent — actual collector dispatch
    // happens via HTTP call to rss-proxy or direct fetch
    const { error: runError } = await supabase
      .from('collector_runs')
      .insert({
        source_id: feed.source_id,
        collector_type: feed.source_type,
        status: 'running',
        started_at: new Date().toISOString(),
      });

    results.push({
      feed_id: feed.id,
      name: feed.name,
      status: runError ? 'error' : 'scheduled',
      error: runError?.message,
    });
  }

  return new Response(JSON.stringify({
    processed: results.length,
    feeds: results,
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
