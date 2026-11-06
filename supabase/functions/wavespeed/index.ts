// Función "wavespeed" de Supabase: el chat genera imágenes y vídeos con los modelos de WaveSpeedAI.
// La clave vive SOLO aquí, en el secreto WAVESPEED_API_KEY (nunca en la web ni en el repo). Solo responde a la cuenta de Diego.
// Acciones (POST JSON salvo «subir»):
//   modelos  → catálogo compacto (id, nombre, tipo, precio, campos del formulario)
//   saldo    → saldo de la cuenta en USD
//   generar  → { ruta, entrada } lanza la tarea y devuelve su id
//   estado   → { id } estado y resultados de la tarea
//   subir    → POST ?accion=subir con el archivo en bruto (cabecera x-nombre) → URL para usar como imagen/vídeo de entrada
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORREO_PERMITIDO = 'nicolasrecobasystem@gmail.com';
const API = 'https://api.wavespeed.ai';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nombre',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
let CATALOGO: { cuando: number; modelos: unknown[] } | null = null;   // se reusa mientras la función esté caliente (1 h)

// De api_schema nos quedamos con la ruta y los campos (tipo, opciones, mínimos, valor por defecto, descripción corta).
function compactar(m: any) {
  const esquemas = (m && m.api_schema && m.api_schema.api_schemas) || [];
  const e = esquemas.find((x: any) => x && x.type === 'model_run') || esquemas.find((x: any) => x && x.request_schema) || {};
  const rs = e.request_schema || {};
  const props = rs.properties || {};
  const campos: Record<string, unknown> = {};
  for (const k of Object.keys(props)) {
    const p = props[k] || {};
    const c: any = { t: p.type || (p.items ? 'array' : 'string') };
    if (Array.isArray(p.enum)) c.op = p.enum.slice(0, 60);
    if (p.default !== undefined) c.def = p.default;
    if (p.minimum !== undefined) c.min = p.minimum;
    if (p.maximum !== undefined) c.max = p.maximum;
    if (p.step !== undefined) c.paso = p.step;
    if (p.maxItems !== undefined) c.maxItems = p.maxItems;
    if (p.items && p.items.type) c.it = p.items.type;
    if (p.description) c.d = String(p.description).slice(0, 220);
    if (p.title) c.ti = String(p.title).slice(0, 60);
    if (p['x-hidden'] || p.hidden) c.oculto = true;
    campos[k] = c;
  }
  return {
    id: m.model_id, nombre: m.name || m.model_id, tipo: m.type || '', precio: m.base_price ?? null,
    desc: String(m.description || '').slice(0, 200),
    ruta: typeof e.api_path === 'string' && e.api_path.startsWith('/api/v3/') ? e.api_path : '/api/v3/' + m.model_id,
    campos, req: Array.isArray(rs.required) ? rs.required : [], orden: Array.isArray(rs['x-order-properties']) ? rs['x-order-properties'] : undefined,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const clave = Deno.env.get('WAVESPEED_API_KEY') || Deno.env.get('wavespeed');
  if (!clave) return json({ error: 'Falta el secreto WAVESPEED_API_KEY en Supabase' }, 500);

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);
  const H = { Authorization: 'Bearer ' + clave };
  const url = new URL(req.url);

  // Subir un archivo de entrada (imagen, vídeo o audio) → URL de WaveSpeed (dura 7 días)
  if (url.searchParams.get('accion') === 'subir') {
    const nombre = (req.headers.get('x-nombre') || 'archivo').replace(/[^\w.\-]+/g, '_').slice(0, 80) || 'archivo';
    const tipo = req.headers.get('content-type') || 'application/octet-stream';
    if (!/^(image|video|audio)\//.test(tipo)) return json({ error: 'Solo imágenes, vídeos o audios' }, 400);
    const bytes = await req.arrayBuffer();
    if (!bytes.byteLength) return json({ error: 'Archivo vacío' }, 400);
    if (bytes.byteLength > 100 * 1024 * 1024) return json({ error: 'Máximo 100 MB' }, 400);
    const fd = new FormData();
    fd.append('file', new Blob([bytes], { type: tipo }), nombre);
    const r = await fetch(API + '/api/v3/media/upload/binary', { method: 'POST', headers: H, body: fd });
    const d = await r.json().catch(() => ({}));
    const enlace = d?.data?.download_url;
    if (!r.ok || !enlace) return json({ error: 'WaveSpeed no aceptó el archivo (' + r.status + ')', detalle: d?.message || '' }, 502);
    return json({ url: enlace });
  }

  let cuerpo: any = {};
  try { cuerpo = await req.json(); } catch { /* vacío */ }

  if (cuerpo.accion === 'modelos') {
    if (!CATALOGO || cuerpo.forzar || Date.now() - CATALOGO.cuando > 3600e3) {
      const r = await fetch(API + '/api/v3/models', { headers: H });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !Array.isArray(d?.data)) return json({ error: 'WaveSpeed respondió ' + r.status, detalle: d?.message || '' }, 502);
      CATALOGO = { cuando: Date.now(), modelos: d.data.filter((m: any) => m && m.model_id).map(compactar) };
    }
    return json({ modelos: CATALOGO.modelos });
  }

  if (cuerpo.accion === 'saldo') {
    const r = await fetch(API + '/api/v3/balance', { headers: H });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: 'WaveSpeed respondió ' + r.status }, 502);
    return json({ saldo: d?.data?.balance ?? null });
  }

  if (cuerpo.accion === 'generar') {
    const ruta = String(cuerpo.ruta || '');
    if (!/^\/api\/v3\/[A-Za-z0-9._\-\/]+$/.test(ruta) || ruta.includes('..') || /\/(predictions|media|balance|models)(\/|$)/.test(ruta)) return json({ error: 'Modelo no válido' }, 400);
    const entrada = cuerpo.entrada && typeof cuerpo.entrada === 'object' ? { ...cuerpo.entrada } : {};
    delete entrada.enable_sync_mode; delete entrada.enable_base64_output;   // siempre en segundo plano y con enlaces
    // Una sola vez: WaveSpeed cobra cada envío, así que no se reintenta solo.
    const r = await fetch(API + ruta, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(entrada) });
    const d = await r.json().catch(() => ({}));
    const id = d?.data?.id;
    if (!r.ok || !id) return json({ error: d?.message || ('WaveSpeed respondió ' + r.status), detalle: d?.data || null }, r.status === 400 || r.status === 422 ? 400 : 502);
    return json({ id, estado: d.data.status || 'created' });
  }

  if (cuerpo.accion === 'estado') {
    const id = String(cuerpo.id || '');
    if (!/^[A-Za-z0-9_\-]{4,100}$/.test(id)) return json({ error: 'Id no válido' }, 400);
    const r = await fetch(API + '/api/v3/predictions/' + id + '/result', { headers: H });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ estado: 'reintentar', error: 'WaveSpeed respondió ' + r.status }, r.status >= 500 || r.status === 429 ? 200 : 502);
    const x = d?.data || {};
    return json({ estado: x.status || '', salidas: Array.isArray(x.outputs) ? x.outputs : [], error: x.error || '', tiempo: x.executionTime ?? x.timings?.inference ?? null });
  }

  return json({ error: 'Acción desconocida' }, 400);
});
