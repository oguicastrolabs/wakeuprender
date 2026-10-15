/**
 * Keep-alive: ping Supabase (evita pause) + Render /health (reduz cold start).
 * Schedule: a cada 14 minutos (UTC).
 */

const DEFAULT_RENDER_HEALTH =
  "https://astro-api-saas.onrender.com/health";

async function pingSupabase(url, anonKey) {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/app_config?select=chave&limit=1`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    bodyPreview: text.slice(0, 120),
  };
}

async function pingRender(healthUrl) {
  const res = await fetch(healthUrl, { method: "GET" });
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    bodyPreview: text.slice(0, 120),
  };
}

export default async () => {
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim().replace(/^["']|["']$/g, "");
  const renderHealth =
    (process.env.RENDER_HEALTH_URL || DEFAULT_RENDER_HEALTH).trim().replace(/^["']|["']$/g, "");

  if (!supabaseUrl || !anonKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const [supabase, render] = await Promise.all([
    pingSupabase(supabaseUrl, anonKey).catch((e) => ({
      ok: false,
      status: 0,
      bodyPreview: String(e.message || e),
    })),
    pingRender(renderHealth).catch((e) => ({
      ok: false,
      status: 0,
      bodyPreview: String(e.message || e),
    })),
  ]);

  const ok = Boolean(supabase.ok && render.ok);
  const payload = {
    ok,
    at: new Date().toISOString(),
    supabase,
    render: { ...render, url: renderHealth },
  };

  return new Response(JSON.stringify(payload), {
    status: ok ? 200 : 502,
    headers: { "content-type": "application/json" },
  });
};

export const config = {
  schedule: "*/14 * * * *",
};
