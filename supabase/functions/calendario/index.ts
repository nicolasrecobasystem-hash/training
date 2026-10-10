// Función "calendario" de Supabase: lee Google Calendar por su dirección secreta iCal y guarda los eventos en cal_eventos.
// Los enlaces se añaden desde la app (tabla cal_fuentes, el enlace cifrado en Vault); el secreto «gcal» sirve de respaldo.
// Google (dirección secreta iCal) y Apple/iCloud (calendario público, webcal:// vale). Los enlaces nunca se registran.
// Quién puede llamarla: el cron de la base (cabecera x-cron-token, comprobada con cal_token_valido) o la sesión de Diego.
// accion 'sincronizar' → guarda desde ayer hasta 60 días vista (recurrencias expandidas, excepciones y cancelados incluidos).
// Los avisos a Levi no salen de aquí: los emite cal_avisar() en la base, cada minuto.
// Desplegar con "Verify JWT" desactivado.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import ICAL from 'npm:ical.js@2.1.0';

const CORREO_PERMITIDO = 'nicolasrecobasystem@gmail.com';
const DIAS_VISTA = 60;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

// ---------- lectura del iCal (sin Deno.serve: se prueba aparte) ----------
// Hora de pared en una zona → instante real (todo el día y horas sin zona van en Madrid)
function enZona(zona: string, y: number, m: number, d: number, h = 0, mi = 0, s = 0): Date {
  const guess = Date.UTC(y, m - 1, d, h, mi, s);
  const f = new Intl.DateTimeFormat('en-US', { timeZone: zona, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  const off = (t: number) => { const p = Object.fromEntries(f.formatToParts(new Date(t)).map((x) => [x.type, x.value])); return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t; };
  const t1 = guess - off(guess);
  return new Date(guess - off(t1));   // segunda pasada: bien también en los cambios de hora
}
function zonaValida(z: string) { try { new Intl.DateTimeFormat('en-US', { timeZone: z }); return true; } catch { return false; } }
function aFecha(t: any): Date {
  if (t.isDate) return enZona('Europe/Madrid', t.year, t.month, t.day);
  if (!t.zone || t.zone.tzid === 'floating') {
    // TZID sin VTIMEZONE en el feed (p. ej. America/New_York): se resuelve con la zona IANA
    const z = typeof t.timezone === 'string' && zonaValida(t.timezone) ? t.timezone : 'Europe/Madrid';
    return enZona(z, t.year, t.month, t.day, t.hour, t.minute, t.second);
  }
  return t.toJSDate();
}
export type EventoCal = { uid: string; inicio: string; fin: string | null; todo_el_dia: boolean; titulo: string; lugar: string | null; descripcion: string | null; calendario: string | null; enlace: string | null };

export function leerIcal(txt: string, desde: Date, hasta: Date): EventoCal[] {
  const cal = new ICAL.Component(ICAL.parse(txt));
  for (const tz of cal.getAllSubcomponents('vtimezone')) { try { ICAL.TimezoneService.register(tz); } catch { /* zona rara */ } }
  const nombreCal = (cal.getFirstPropertyValue('x-wr-calname') as string) || null;
  const maestros: any[] = [], excepciones = new Map<string, any[]>();
  for (const ve of cal.getAllSubcomponents('vevent')) {
    const ev = new ICAL.Event(ve);
    if (!ev.uid || !ev.startDate) continue;
    if (ev.isRecurrenceException()) { const l = excepciones.get(ev.uid) || []; l.push(ev); excepciones.set(ev.uid, l); }
    else maestros.push(ev);
  }
  const out: EventoCal[] = [];
  const meter = (ev: any, ini: any, fin: any, item: any) => {
    const st = String(item.component.getFirstPropertyValue('status') || '').toUpperCase();
    if (st === 'CANCELLED') return;
    const a = aFecha(ini), b = fin ? aFecha(fin) : null;
    if ((b || a) <= desde || a >= hasta) return;
    out.push({
      uid: ev.uid, inicio: a.toISOString(), fin: b ? b.toISOString() : null, todo_el_dia: !!ini.isDate,
      titulo: String(item.summary || '(sin título)').slice(0, 300), lugar: item.location ? String(item.location).slice(0, 300) : null,
      descripcion: item.description ? String(item.description).slice(0, 2000) : null, calendario: nombreCal,
      enlace: (item.component.getFirstPropertyValue('url') as string) || null,
    });
  };
  for (const ev of maestros) {
    for (const ex of excepciones.get(ev.uid) || []) { try { ev.relateException(ex); } catch { /* excepción suelta */ } }
    if (ev.isRecurring()) {
      const it = ev.iterator();
      let n = 0, sig;
      while ((sig = it.next()) && n++ < 2000) {
        const d = ev.getOccurrenceDetails(sig);
        if (aFecha(sig) >= hasta) break;
        meter(ev, d.startDate, d.endDate, d.item);
      }
    } else meter(ev, ev.startDate, ev.endDate, ev);
  }
  // Excepciones cuyo evento maestro no vino en el feed
  const conMaestro = new Set(maestros.map((m) => m.uid));
  for (const [uid, l] of excepciones) if (!conMaestro.has(uid)) for (const ex of l) meter(ex, ex.startDate, ex.endDate, ex);
  // Sin duplicados (uid + inicio)
  const vistos = new Set<string>();
  return out.filter((e) => { const k = e.uid + '|' + e.inicio; if (vistos.has(k)) return false; vistos.add(k); return true; })
    .sort((x, y) => x.inicio.localeCompare(y.inicio));
}
// ---------- fin de la lectura ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const tokCron = (req.headers.get('x-cron-token') || '').trim();
  let sb;
  if (tokCron) {
    sb = createClient(url, anon);
    const { data } = await sb.rpc('cal_token_valido', { p_token: tokCron });
    if (data !== true) return json({ error: 'No autorizado' }, 401);
  } else {
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u } = await createClient(url, anon).auth.getUser(token);
    if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);
    sb = createClient(url, anon, { global: { headers: { Authorization: 'Bearer ' + token } } });
  }
  let c: any = {};
  try { c = await req.json(); } catch { /* vacío */ }
  if ((c.accion || 'sincronizar') !== 'sincronizar') return json({ error: 'Acción no válida' }, 400);

  const ahora = new Date();
  const desde = new Date(ahora.getTime() - 36 * 3600e3), hasta = new Date(ahora.getTime() + DIAS_VISTA * 86400e3);
  const tok = tokCron || null;
  const guardarError = async (msg: string) => { await sb.rpc('cal_guardar', { p_token: tok, p_eventos: [], p_desde: desde.toISOString(), p_hasta: hasta.toISOString(), p_error: msg }); return json({ ok: false, error: msg }, 502); };

  // Calendarios: los que se añaden desde la app (enlaces en Vault) y, si existe, el secreto «gcal» de respaldo.
  // Google (https://…basic.ics) y Apple/iCloud (webcal://… se lee como https://)
  const { data: deApp, error: eF } = await sb.rpc('cal_fuentes_urls', { p_token: tok });
  if (eF) return json({ ok: false, error: 'No se pudieron leer los calendarios: ' + eF.message }, 500);
  const fuentes: { id: string | null; nombre: string; url: string }[] = (deApp || []).map((f: any) => ({ id: f.id, nombre: f.nombre, url: f.url }));
  (Deno.env.get('gcal') || Deno.env.get('GCAL_ICAL') || '').split(/[\s,]+/).filter(Boolean)
    .forEach((u, i) => fuentes.push({ id: null, nombre: 'Secreto gcal ' + (i + 1), url: u }));
  if (!fuentes.length) return guardarError('No hay calendarios conectados: añádelos con ⚙ en la agenda del calendario');

  let total = 0, fallos = 0;
  const resultado: { nombre: string; ok: boolean; eventos?: number; error?: string }[] = [];
  for (let i = 0; i < fuentes.length; i++) {
    const f = fuentes[i], clave = f.id || 'env' + (i ? i : '');
    const url = f.url.trim().replace(/^webcals?:\/\//i, 'https://');
    let error = '', lista: EventoCal[] = [];
    try {
      if (!/^https:\/\//.test(url)) throw new Error('enlace no válido');
      const r = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mi semana (calendario)' } });
      if (!r.ok) error = 'respondió ' + r.status + (r.status === 404 || r.status === 403 ? ' (¿enlace cambiado o calendario ya no público?)' : '');
      else {
        const txt = await r.text();
        if (!txt.includes('BEGIN:VCALENDAR')) error = 'no es un calendario iCal (revisa el enlace)';
        else lista = leerIcal(txt, desde, hasta).map((e) => ({ ...e, calendario: f.id ? f.nombre : (e.calendario || f.nombre) }));
      }
    } catch (e) {
      console.error('calendario', f.nombre, String(e).slice(0, 160));   // nunca se registra el enlace
      error = String(e).includes('Timeout') || String(e).includes('timed out') ? 'tardó demasiado' : 'no se pudo leer';
    }
    if (error) {
      // Sus eventos anteriores se quedan como estaban (no se borra nada si falla)
      fallos++;
      if (f.id) await sb.rpc('cal_marcar_fuente', { p_token: tok, p_id: f.id, p_ok: false, p_eventos: null, p_error: error });
      resultado.push({ nombre: f.nombre, ok: false, error });
      continue;
    }
    const { error: eG } = await sb.rpc('cal_guardar', { p_token: tok, p_eventos: lista, p_desde: desde.toISOString(), p_hasta: hasta.toISOString(), p_fuente: clave });
    if (eG) { fallos++; resultado.push({ nombre: f.nombre, ok: false, error: eG.message }); continue; }
    if (f.id) await sb.rpc('cal_marcar_fuente', { p_token: tok, p_id: f.id, p_ok: true, p_eventos: lista.length, p_error: null });
    total += lista.length;
    resultado.push({ nombre: f.nombre, ok: true, eventos: lista.length });
  }
  if (fallos === fuentes.length) return guardarError(resultado.map((x) => x.nombre + ': ' + x.error).join(' · '));
  if (fallos) await sb.rpc('cal_guardar', { p_token: tok, p_eventos: [], p_desde: desde.toISOString(), p_hasta: hasta.toISOString(), p_error: fallos + ' calendario(s) con error: ' + resultado.filter((x) => !x.ok).map((x) => x.nombre).join(', ') });
  return json({ ok: fallos === 0, eventos: total, calendarios: resultado });
});
