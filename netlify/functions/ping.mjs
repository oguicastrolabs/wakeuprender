import { runWake } from "./_lib.mjs";

export default async () => {
  const payload = await runWake();
  return new Response(JSON.stringify(payload, null, 2), {
    status: payload.ok ? 200 : 502,
    headers: { "content-type": "application/json" },
  });
};
