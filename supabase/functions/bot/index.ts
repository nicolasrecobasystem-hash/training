// Función "bot" de Supabase: la puerta de entrada para que los bots (Grok Bot, Make…) hablen con la app.
// Sin sesión: cada bot se identifica con SU token (cabecera x-bot-token o Authorization: Bearer).
// Los tokens se crean en el panel del reloj; en la base solo queda su hash. La lógica está en reloj_bot (SQL).
// POST { "accion": "contexto" | "sonando" | "valoracion" | "cambio" | "mensaje" | "saltar_descanso" | "iniciar" | "parar", ...datos }
// Listas de canciones (musica.html): "musica_listas" | "musica_lista" | "musica_crear_lista" | "musica_editar_lista" | "musica_borrar_lista"
//   | "musica_agregar" | "musica_editar" | "musica_borrar" | "musica_buscar" | "musica_luces" (pone en las luces los colores de una canción)
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
const ACCIONES = ['contexto', 'sonando', 'valoracion', 'cambio', 'mensaje', 'saltar_descanso', 'iniciar', 'parar',
  'musica_listas', 'musica_lista', 'musica_crear_lista', 'musica_editar_lista', 'musica_borrar_lista',
  'musica_agregar', 'musica_editar', 'musica_borrar', 'musica_buscar', 'musica_luces'];
// ---------- escena de luces: un color distinto en cada luz (por su nombre en Govee) ----------
async function aplicarEscena(clave: string, luces: { nombre_govee: string; color: string; etiqueta?: string }[]) {
  const API_G = 'https://openapi.api.govee.com/router/api/v1';
  const cab = { 'Govee-API-Key': clave, 'Content-Type': 'application/json' };
  const r = await fetch(API_G + '/user/devices', { headers: cab });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: 'Govee respondió ' + r.status };
  const norm = (t: string) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const devs = (d.data || []) as any[];
  const orden = (sku: string, device: string, capability: unknown) =>
    fetch(API_G + '/device/control', { method: 'POST', headers: cab, body: JSON.stringify({ requestId: crypto.randomUUID(), payload: { sku, device, capability } }) })
      .then(async (x) => { const j = await x.json().catch(() => null); const code = j && typeof j.code === 'number' ? j.code : x.status; return x.ok && code === 200; });
  const res = await Promise.all(luces.slice(0, 10).map(async (l) => {
    const dev = devs.find((x) => norm(x.deviceName) === norm(l.nombre_govee));
    if (!dev) return { luz: l.etiqueta || l.nombre_govee, ok: false, error: 'no encontrada en Govee' };
    const rgb = parseInt(String(l.color || '').replace('#', ''), 16);
    if (!(rgb >= 0)) return { luz: l.etiqueta || l.nombre_govee, ok: false, error: 'color no válido' };
    const on = await orden(dev.sku, dev.device, { type: 'devices.capabilities.on_off', instance: 'powerSwitch', value: 1 });
    const col = await orden(dev.sku, dev.device, { type: 'devices.capabilities.color_setting', instance: 'colorRgb', value: rgb });
    return { luz: l.etiqueta || l.nombre_govee, color: l.color, ok: on && col };
  }));
  return { ok: res.every((x) => x.ok), luces: res };
}


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
  if (accion.startsWith('musica_')) {
    const { data: m, error: em } = await sb.rpc('mus_bot', { p_token: token, p_accion: accion, p_datos: datos });
    if (em) { console.error('mus_bot', em.message); return json({ ok: false, error: 'Error interno' }, 500); }
    if (!m?.ok) return json(m, m?.error === 'token' ? 401 : m?.error === 'demasiadas peticiones' ? 429 : 400);
    if (accion === 'musica_luces') {
      if (!m.luces?.length) return json({ ok: false, error: 'esa canción no tiene colores de luces' }, 400);
      const clave = Deno.env.get('GOVEE_API_KEY');
      if (!clave) return json({ ok: false, error: 'Falta el secreto GOVEE_API_KEY' }, 500);
      const r = await aplicarEscena(clave, m.luces);
      return json({ ...r, cancion: m.cancion }, r.ok ? 200 : 502);
    }
    return json(m);
  }
  const { data, error } = await sb.rpc('reloj_bot_acciones', { p_token: token, p_accion: accion, p_datos: datos });
  if (error) {
    console.error('reloj_bot_acciones', error.message);
    return json({ ok: false, error: /uuid|boolean|integer/.test(error.message) ? 'Algún dato tiene un formato no válido (id, voz, nota…)' : 'Error interno' }, 400);
  }
  if (!data?.ok) return json(data, data?.error === 'token' ? 401 : data?.error === 'demasiadas peticiones' ? 429 : 400);
  return json(data);
});
