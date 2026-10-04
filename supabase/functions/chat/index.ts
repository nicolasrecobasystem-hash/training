// Función "chat" de Supabase: chat general para chat.html, con DeepSeek directo o cualquier modelo de OpenRouter.
// Misma comprobación que voz, govee y reloj: sesión válida y solo el correo permitido.
// Claves (nunca salen de aquí): DeepSeek en el secreto «deep» (o DEEPSEEK_API_KEY), OpenRouter en «openrouter» (o OPENROUTER_API_KEY).
// Modelo de DeepSeek directo: DEEPSEEK_MODELO o deepseek-flash. Sin instrucción de sistema: el modelo tal cual.
// Guarda la pregunta y la respuesta en chat_mensajes con la sesión de Diego (RLS).
// accion 'modelos' → catálogo de OpenRouter. Por defecto envía un mensaje y responde a trozos:
//   una línea JSON por trozo → {t:'conv',id,modelo} {t:'razon',x} {t:'texto',x} {t:'fin',uso} | {t:'error',x}
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORREO_PERMITIDO = 'nicolasrecobasystem@gmail.com';
const API_DEEPSEEK = 'https://api.deepseek.com/chat/completions';
const API_OR = 'https://openrouter.ai/api/v1';
const HISTORIAL = 40;            // mensajes anteriores que se mandan como contexto
const MAX_PREGUNTA = 20000;      // caracteres
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
const claveDeepseek = () => Deno.env.get('deep') || Deno.env.get('DEEPSEEK_API_KEY') || '';
const claveOR = () => Deno.env.get('openrouter') || Deno.env.get('OPENROUTER_API_KEY') || '';
const cabOR = (k: string) => ({ Authorization: 'Bearer ' + k, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://nicolasrecobasystem-hash.github.io/training/', 'X-Title': 'Mi semana' });
const precioM = (p: unknown) => { const n = Number(p); return isFinite(n) ? Math.round(n * 1e6 * 1000) / 1000 : null; };   // USD por millón de tokens

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const { data: u } = await createClient(url, anon).auth.getUser(token);
  if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);
  const sb = createClient(url, anon, { global: { headers: { Authorization: 'Bearer ' + token } } });

  let c: any = {};
  try { c = await req.json(); } catch { /* vacío */ }

  // ---------- catálogo de OpenRouter ----------
  if (c.accion === 'modelos') {
    const k = claveOR();
    const r = await fetch(API_OR + '/models', { headers: k ? cabOR(k) : {} });
    if (!r.ok) return json({ error: 'OpenRouter respondió ' + r.status }, 502);
    const d = await r.json();
    const modelos = (d.data || []).map((m: any) => ({
      id: m.id, nombre: m.name || m.id, ctx: m.context_length || null,
      entrada: precioM(m.pricing?.prompt), salida: precioM(m.pricing?.completion),
      razona: Array.isArray(m.supported_parameters) && m.supported_parameters.includes('reasoning'),
      creado: m.created || 0,
    }));
    return json({ modelos, deepseek: !!claveDeepseek(), openrouter: !!k, modelo_deepseek: Deno.env.get('DEEPSEEK_MODELO') || 'deepseek-flash' });
  }

  // ---------- enviar ----------
  const texto = String(c.mensaje || '').trim();
  if (!texto) return json({ error: 'Mensaje vacío' }, 400);
  if (texto.length > MAX_PREGUNTA) return json({ error: 'Mensaje demasiado largo' }, 400);
  const pensar = !!c.pensar;
  const proveedor = c.proveedor === 'openrouter' ? 'openrouter' : 'deepseek';
  let modelo: string;
  let clave: string;
  if (proveedor === 'openrouter') {
    modelo = String(c.modelo || '');
    if (!/^[\w.\-:/~]{3,120}$/.test(modelo)) return json({ error: 'Modelo no válido' }, 400);
    clave = claveOR();
    if (!clave) return json({ error: 'Falta el secreto «openrouter» con la clave de OpenRouter en Supabase' }, 500);
  } else {
    modelo = Deno.env.get('DEEPSEEK_MODELO') || 'deepseek-flash';
    clave = claveDeepseek();
    if (!clave) return json({ error: 'Falta el secreto «deep» con la clave de DeepSeek en Supabase' }, 500);
  }
  const etiqueta = (proveedor === 'openrouter' ? 'openrouter:' : 'deepseek:') + modelo;   // lo que se guarda en el mensaje

  // Conversación: la que viene (se le apunta el modelo actual) o una nueva con el principio de la pregunta como título
  let conv = typeof c.conversacion_id === 'string' ? c.conversacion_id : '';
  const guardaModelo = { proveedor, modelo: proveedor === 'openrouter' ? modelo : null };
  if (conv) {
    const { data, error } = await sb.from('chat_conversaciones').update(guardaModelo).eq('id', conv).select('id').maybeSingle();
    if (error || !data) return json({ error: 'Conversación no encontrada' }, 404);
  } else {
    const titulo = texto.replace(/\s+/g, ' ').slice(0, 60) + (texto.length > 60 ? '…' : '');
    const { data, error } = await sb.from('chat_conversaciones').insert({ titulo, ...guardaModelo }).select('id').single();
    if (error) return json({ error: error.message }, 500);
    conv = data.id;
  }

  const { data: previos, error: e1 } = await sb.from('chat_mensajes').select('rol, contenido')
    .eq('conversacion_id', conv).order('id', { ascending: false }).limit(HISTORIAL);
  if (e1) return json({ error: e1.message }, 500);
  const { error: e2 } = await sb.from('chat_mensajes').insert({ conversacion_id: conv, rol: 'user', contenido: texto });
  if (e2) return json({ error: e2.message }, 500);

  // Sin instrucción de sistema: el modelo tal cual, solo con el historial de la conversación
  const mensajes = ([] as { role: string; content: string }[])
    .concat((previos || []).reverse().filter((m: any) => m.contenido).map((m: any) => ({ role: m.rol, content: m.contenido })))
    .concat([{ role: 'user', content: texto }]);

  const cuerpo: Record<string, unknown> = { model: modelo, messages: mensajes, stream: true };
  let r: Response;
  if (proveedor === 'openrouter') {
    cuerpo.usage = { include: true };
    if (pensar) cuerpo.reasoning = { effort: 'high' };
    r = await fetch(API_OR + '/chat/completions', { method: 'POST', headers: cabOR(clave), body: JSON.stringify(cuerpo) });
  } else {
    cuerpo.stream_options = { include_usage: true };
    cuerpo.thinking = { type: pensar ? 'enabled' : 'disabled' };
    r = await fetch(API_DEEPSEEK, { method: 'POST', headers: { Authorization: 'Bearer ' + clave, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  }
  if (!r.ok || !r.body) {
    const det = (await r.text().catch(() => '')).slice(0, 400);
    console.error(proveedor, r.status, det);
    let motivo = '';
    try { motivo = JSON.parse(det)?.error?.message || ''; } catch { /* */ }
    const nombre = proveedor === 'openrouter' ? 'OpenRouter' : 'DeepSeek';
    const pista = r.status === 401 ? ' (revisa la clave)' : r.status === 402 ? ' (sin saldo)' : r.status === 429 ? ' (demasiadas peticiones, espera un poco)' : '';
    return json({ error: nombre + ' respondió ' + r.status + pista + (motivo ? ': ' + motivo.slice(0, 160) : ''), conversacion_id: conv }, 502);
  }

  const enc = new TextEncoder();
  let respuesta = '', razon = '', uso: unknown = null, guardado = false;
  const guardar = async () => {
    if (guardado || (!respuesta && !razon)) return;
    guardado = true;
    await sb.from('chat_mensajes').insert({ conversacion_id: conv, rol: 'assistant', contenido: respuesta, razonamiento: razon || null, modelo: etiqueta, uso });
    await sb.from('chat_conversaciones').update({ actualizado: new Date().toISOString() }).eq('id', conv);
  };

  const lector = r.body.getReader();
  const salida = new ReadableStream({
    async start(ctrl) {
      let vivo = true;
      const mandar = (o: unknown) => { if (!vivo) return; try { ctrl.enqueue(enc.encode(JSON.stringify(o) + '\n')); } catch { vivo = false; } };
      mandar({ t: 'conv', id: conv, modelo: etiqueta });
      const dec = new TextDecoder();
      let resto = '';
      try {
        for (;;) {
          const { value, done } = await lector.read();
          if (done) break;
          resto += dec.decode(value, { stream: true });
          let i;
          while ((i = resto.indexOf('\n')) >= 0) {
            const linea = resto.slice(0, i).trim(); resto = resto.slice(i + 1);
            if (!linea.startsWith('data:')) continue;          // OpenRouter manda «: OPENROUTER PROCESSING» para mantener viva la conexión
            const dato = linea.slice(5).trim();
            if (dato === '[DONE]') continue;
            let j: any; try { j = JSON.parse(dato); } catch { continue; }
            if (j.error) { mandar({ t: 'error', x: String(j.error.message || 'Error del modelo').slice(0, 200) }); continue; }
            if (j.usage) uso = j.usage;
            const d = j.choices?.[0]?.delta || {};
            let rz = d.reasoning_content || (typeof d.reasoning === 'string' ? d.reasoning : '');
            if (!rz && Array.isArray(d.reasoning_details)) rz = d.reasoning_details.map((x: any) => x.text || x.summary || '').join('');
            if (rz) { razon += rz; mandar({ t: 'razon', x: rz }); }
            if (d.content) { respuesta += d.content; mandar({ t: 'texto', x: d.content }); }
          }
        }
        await guardar();
        mandar({ t: 'fin', uso });
      } catch (e) {
        await guardar().catch(() => {});
        mandar({ t: 'error', x: 'Se cortó la respuesta' });
        console.error('stream', String(e));
      } finally {
        try { ctrl.close(); } catch { /* ya cerrado */ }
      }
    },
    // Si Diego pulsa «Parar», se corta también el proveedor y se guarda lo que había llegado
    async cancel() { try { await lector.cancel(); } catch { /* */ } await guardar().catch(() => {}); },
  });
  return new Response(salida, { headers: { ...CORS, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache' } });
});
