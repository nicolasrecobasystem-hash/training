// Función "govee" de Supabase: la app le pide colores y esta función habla con Govee.
// La clave de Govee NUNCA va en la web: se guarda como secreto GOVEE_API_KEY en Supabase.
// Solo responde a tu cuenta (sesión iniciada con el correo permitido).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORREO_PERMITIDO = 'nicolasrecobasystem@gmail.com';
const API = 'https://openapi.api.govee.com/router/api/v1';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const clave = Deno.env.get('GOVEE_API_KEY');
  if (!clave) return json({ error: 'Falta el secreto GOVEE_API_KEY en Supabase' }, 500);

  // ¿Quién llama? Solo tu cuenta
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);

  let cuerpo: any = {};
  try { cuerpo = await req.json(); } catch { /* vacío */ }
  const cab = { 'Govee-API-Key': clave, 'Content-Type': 'application/json' };

  // Lista de luces de tu cuenta Govee
  if (cuerpo.accion === 'listar') {
    const r = await fetch(API + '/user/devices', { headers: cab });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: 'Govee respondió ' + r.status, detalle: d }, 502);
    const luces = (d.data || []).map((x: any) => {
      const caps = (x.capabilities || []).map((c: any) => c.instance);
      return { sku: x.sku, device: x.device, nombre: x.deviceName || x.sku, color: caps.includes('colorRgb'), brillo: caps.includes('brightness') };
    });
    return json({ luces });
  }

  // Poner un color (y opcionalmente encender y fijar brillo) en las luces elegidas
  if (cuerpo.accion === 'color') {
    const devs: any[] = Array.isArray(cuerpo.luces) ? cuerpo.luces.slice(0, 10) : [];
    const rgb = Math.max(0, Math.min(0xFFFFFF, Number(cuerpo.rgb) | 0));
    const orden = (sku: string, device: string, capability: unknown) =>
      fetch(API + '/device/control', { method: 'POST', headers: cab, body: JSON.stringify({ requestId: crypto.randomUUID(), payload: { sku, device, capability } }) })
        .then(async (r) => ({ ok: r.ok, status: r.status, d: await r.json().catch(() => null) }));
    const res = await Promise.all(devs.map(async (x) => {
      const pasos = [];
      if (cuerpo.encender) pasos.push(await orden(x.sku, x.device, { type: 'devices.capabilities.on_off', instance: 'powerSwitch', value: 1 }));
      pasos.push(await orden(x.sku, x.device, { type: 'devices.capabilities.color_setting', instance: 'colorRgb', value: rgb }));
      const b = Number(cuerpo.brillo);
      if (b >= 1 && b <= 100) pasos.push(await orden(x.sku, x.device, { type: 'devices.capabilities.range', instance: 'brightness', value: Math.round(b) }));
      return { device: x.device, ok: pasos.every((p) => p.ok), estados: pasos.map((p) => p.status) };
    }));
    return json({ res });
  }

  return json({ error: 'Acción desconocida' }, 400);
});
