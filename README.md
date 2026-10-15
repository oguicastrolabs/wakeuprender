# wakeuprender

Keep-alive mínimo no Netlify: a cada **14 minutos** a function `wake` pinga:

1. **Supabase** — `GET /rest/v1/app_config?select=chave&limit=1` (evita pause do free tier)
2. **Render** — `GET /health` do AstroAPI (reduz spin-down do free tier)

Repo: [oguicastrolabs/wakeuprender](https://github.com/oguicastrolabs/wakeuprender)

## Env vars no Netlify (Site → Environment)

| Variável | Exemplo |
|---|---|
| `SUPABASE_URL` | `https://fhsdxxxeqdixrfqqkjbm.supabase.co` |
| `SUPABASE_ANON_KEY` | anon key do projeto (não use service_role) |
| `RENDER_HEALTH_URL` | `https://astro-api-saas.onrender.com/health` (opcional; este é o default) |

## Ativar

1. Netlify → **Add new site** → Import from Git → este repositório (`main`).
2. Setar as env vars acima.
3. Deploy production.
4. **Functions** → `wake` → **Run now** e conferir o JSON (`ok: true`).

O cron só roda em production (não em Deploy Previews).

## Front

`public/index.html` é só uma página estática mínima para o site ter publish.
