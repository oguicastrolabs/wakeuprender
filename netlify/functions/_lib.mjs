const DEFAULTS = {
  SUPABASE_URL: "https://fhsdxxxeqdixrfqqkjbm.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoc2R4eHhlcWRpeHJmcXFramJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MTEwNzQsImV4cCI6MjEwNDQ4NzA3NH0.9aaEJitQJevy9x8VgT35ob4xnsHFmOh3BnFzihxTBz0",
  RENDER_HEALTH_URL: "https://astro-api-saas.onrender.com/health",
};

function envOrDefault(name) {
  const raw = (process.env[name] || "").trim().replace(/^["']|["']$/g, "");
  return raw || DEFAULTS[name];
}

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

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function pingRender(healthUrl) {
  // Timeout curto: Netlify function tem limite; cold start do Render pode passar de 50s.
  const res = await fetchWithTimeout(healthUrl, { method: "GET" }, 12000);
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    bodyPreview: text.slice(0, 120),
  };
}

export async function runWake() {
  const supabaseUrl = envOrDefault("SUPABASE_URL");
  const anonKey = envOrDefault("SUPABASE_ANON_KEY");
  const renderHealth = envOrDefault("RENDER_HEALTH_URL");

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

  // Sucesso do keep-alive = Supabase acordado. Render é best-effort (cold start).
  const ok = Boolean(supabase.ok);
  return {
    ok,
    at: new Date().toISOString(),
    supabase,
    render: { ...render, url: renderHealth },
  };
}
