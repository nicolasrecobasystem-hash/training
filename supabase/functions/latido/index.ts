// Función "latido" de Supabase: el Mac de Diego avisa "sigo vivo" cada 60 s.
// No usa la sesión de Diego sino un token propio del dispositivo (Authorization: Bearer <token>),
// que vive en el Llavero del Mac. En la base solo se guarda su hash (sha256).
// Desplegar con "Verify JWT" desactivado: la comprobación la hace reloj_latido() con el token.
import { createClient } from 'jsr:@supabase/supabase-js@2';

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Usa POST' }, 405);
  const token = (req.headers.get('x-dispositivo-token') || (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')).trim();
  if (token.length < 20) return json({ ok: false, error: 'Falta el token del dispositivo' }, 401);
  let info: Record<string, unknown> = {};
  try { const b = await req.json(); if (b && typeof b === 'object') info = b; } catch { /* sin cuerpo */ }
  info = Object.fromEntries(Object.entries(info).slice(0, 10).map(([k, v]) => [k.slice(0, 40), String(v).slice(0, 200)]));
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data, error } = await sb.rpc('reloj_latido', { p_token: token, p_info: info });
  if (error) return json({ ok: false, error: 'No se pudo guardar el latido' }, 500);
  if (!data?.ok) return json({ ok: false, error: 'Token no válido' }, 401);
  return json(data);
});
