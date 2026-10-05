// Función "bot" de Supabase: la puerta de entrada para que los bots (Grok Bot, Make…) hablen con la app.
// Sin sesión: cada bot se identifica con SU token (cabecera x-bot-token o Authorization: Bearer).
// Los tokens se crean en el panel del reloj; en la base solo queda su hash. La lógica está en reloj_bot (SQL).
// POST { "accion": "contexto" | "sonando" | "valoracion" | "cambio" | "mensaje" | "saltar_descanso", ...datos }
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
const ACCIONES = ['contexto', 'sonando', 'valoracion', 'cambio', 'mensaje', 'saltar_descanso'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'Usa POST' }, 405);
  const token = (req.headers.get('x-bot-token') || (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')).trim();
  if (token.length < 20 || token.length > 200) return json({ ok: false, error: 'Falta el token del bot' }, 401);

  let c: any = {};
  try { c = await req.json(); } catch { return json({ ok: false, error: 'El cuerpo tiene que ser JSON' }, 400); }
  if (!c || typeof c !== 'object' || Array.isArray(c)) return json({ ok: false, error: 'El cuerpo tiene que ser un objeto JSON' }, 400);
  const accion = String(c.accion || '');
  if (!ACCIONES.includes(accion)) return json({ ok: false, error: 'accion tiene que ser una de: ' + ACCIONES.join(', ') }, 400);
  const { accion: _, ...datos } = c;
  if (JSON.stringify(datos).length > 8000) return json({ ok: false, error: 'Demasiados datos' }, 413);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data, error } = await sb.rpc('reloj_bot_acciones', { p_token: token, p_accion: accion, p_datos: datos });
  if (error) {
    console.error('reloj_bot_acciones', error.message);
    return json({ ok: false, error: /uuid|boolean|integer/.test(error.message) ? 'Algún dato tiene un formato no válido (id, voz, nota…)' : 'Error interno' }, 400);
  }
  if (!data?.ok) return json(data, data?.error === 'token' ? 401 : data?.error === 'demasiadas peticiones' ? 429 : 400);
  return json(data);
});
