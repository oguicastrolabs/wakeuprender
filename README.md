# wakeuprender

Keep-alive mínimo no Netlify: a cada **14 minutos** a function `wake` pinga:

1. **Supabase** — `GET /rest/v1/app_config?select=chave&limit=1` (evita pause do free tier)
2. **Render** — `GET /health` do AstroAPI (reduz spin-down do free tier)

Repo: [oguicastrolabs/wakeuprender](https://github.com/oguicastrolabs/wakeuprender)

## Como roda (zero config no painel)

- Defaults (URL + **anon** key) já vão na function e no GitHub Action.
- Netlify: cron `wake` a cada 14 min + HTTP de teste em `/.netlify/functions/ping`
- GitHub Actions: workflow `wake` a cada 14 min (backup)

Env vars no Netlify são opcionais (só se quiser sobrescrever).

Site: https://wakeuprender.netlify.app/  
Ping: https://wakeuprender.netlify.app/.netlify/functions/ping

## Front

`public/index.html` é só uma página estática mínima para o site ter publish.
