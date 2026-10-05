// Función "reloj" de Supabase: las acciones del panel del reloj (reloj.html).
// Misma comprobación que voz y govee: sesión válida y solo el correo permitido.
// No hace nada por su cuenta: el tiempo lo lleva la base (pg_cron → reloj_tick / reloj_vigilar).
// Las llamadas a la base van con la sesión de Diego, y las funciones SQL vuelven a comprobar la cuenta.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORREO_PERMITIDO = 'nicolasrecobasystem@gmail.com';
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
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const { data: u } = await createClient(url, anon).auth.getUser(token);
  if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);
  const sb = createClient(url, anon, { global: { headers: { Authorization: 'Bearer ' + token } } });

  let c: any = {};
  try { c = await req.json(); } catch { /* vacío */ }
  const rpc = async (fn: string, args: Record<string, unknown> = {}) => {
    const { data, error } = await sb.rpc(fn, args);
    if (error) throw new Error(error.message);
    return data;
  };

  try {
    switch (c.accion) {
      case 'estado': {
        let estado = await rpc('reloj_estado');
        // Destinos sembrados con un secreto de las edge functions (p. ej. CURSOR_WEBHOOK_KEY):
        // la primera vez se copia a Vault. El valor nunca sale de aquí ni se devuelve al navegador.
        let importado = false;
        for (const d of estado?.destinos || []) {
          if (!d.tiene_header && d.secreto_env) {
            const v = (Deno.env.get(d.secreto_env) || '').trim();
            if (!v) continue;
            const header = /\s/.test(v) ? v : 'Bearer ' + v;
            await rpc('reloj_guardar_destino', { p_id: d.id, p_nombre: null, p_url: null, p_header: header, p_activo: null });
            importado = true;
          }
        }
        if (importado) estado = await rpc('reloj_estado');
        // Bots y música (lo que apuntan los bots por la función «bot»)
        try { estado.musica = await rpc('reloj_musica_estado'); } catch { estado.musica = null; }
        return json(estado);
      }
      case 'iniciar': return json(await rpc('reloj_iniciar', { p_modo: c.modo, p_minutos: c.minutos ?? null }));
      case 'parar': return json(await rpc('reloj_parar', { p_inmediato: !!c.inmediato }));
      case 'saltar_descanso': return json(await rpc('reloj_saltar_descanso_panel'));
      case 'config': return json(await rpc('reloj_guardar_config', { p: c.config || {} }));
      case 'agenda_guardar': return json({ id: await rpc('reloj_guardar_agenda', { p: c.bloque || {} }) });
      case 'agenda_borrar': await rpc('reloj_borrar_agenda', { p_id: c.id }); return json({ ok: true });
      case 'destino_guardar':
        if (c.url && !/^https:\/\//.test(c.url)) return json({ error: 'La URL tiene que empezar por https://' }, 400);
        return json({ id: await rpc('reloj_guardar_destino', { p_id: c.id || null, p_nombre: c.nombre ?? null, p_url: c.url ?? null, p_header: c.header || null, p_activo: c.activo ?? null }) });
      case 'destino_borrar': await rpc('reloj_borrar_destino', { p_id: c.id }); return json({ ok: true });
      case 'destino_probar': return json({ id_evento: await rpc('reloj_probar_destino', { p_id: c.id }) });
      case 'alerta_cerrar': await rpc('reloj_cerrar_alerta', { p_id: c.id }); return json({ ok: true });
      // Token del Mac: se devuelve UNA vez para guardarlo en el Llavero; en la base solo queda su hash
      case 'dispositivo_crear': return json({ token: await rpc('reloj_crear_dispositivo', { p_nombre: c.nombre || 'Mac de Diego' }) });
      // Token de un bot: también se devuelve UNA sola vez
      case 'bot_crear': return json({ token: await rpc('reloj_crear_bot', { p_nombre: c.nombre || '' }) });
      case 'bot_borrar': await rpc('reloj_borrar_bot', { p_id: c.id }); return json({ ok: true });
      default: return json({ error: 'Acción desconocida' }, 400);
    }
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
