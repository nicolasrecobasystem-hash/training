// Función "chat" de Supabase: chat general con DeepSeek para chat.html.
// Misma comprobación que voz, govee y reloj: sesión válida y solo el correo permitido.
// La clave va en el secreto «deep» (o DEEPSEEK_API_KEY; nunca sale de aquí). Modelo: DEEPSEEK_MODELO o deepseek-flash.
// Guarda la pregunta y la respuesta en chat_mensajes con la sesión de Diego (RLS).
// Respuesta en streaming: una línea JSON por trozo → {t:'conv',id} {t:'razon',x} {t:'texto',x} {t:'fin'} | {t:'error',x}
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORREO_PERMITIDO = 'nicolasrecobasystem@gmail.com';
const API = 'https://api.deepseek.com/chat/completions';
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
function sistema() {
  const hoy = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' });
  return 'Eres un asistente útil, claro y directo. Responde en español salvo que te escriban en otro idioma. ' +
    'Usa Markdown cuando ayude (listas, negritas, bloques de código). Fecha y hora en Madrid: ' + hoy + '.';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const { data: u } = await createClient(url, anon).auth.getUser(token);
  if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);
  const clave = Deno.env.get('deep') || Deno.env.get('DEEPSEEK_API_KEY');
  if (!clave) return json({ error: 'Falta el secreto «deep» con la clave de DeepSeek en Supabase' }, 500);
  const modelo = Deno.env.get('DEEPSEEK_MODELO') || 'deepseek-flash';
  const sb = createClient(url, anon, { global: { headers: { Authorization: 'Bearer ' + token } } });

  let c: any = {};
  try { c = await req.json(); } catch { /* vacío */ }
  const texto = String(c.mensaje || '').trim();
  if (!texto) return json({ error: 'Mensaje vacío' }, 400);
  if (texto.length > MAX_PREGUNTA) return json({ error: 'Mensaje demasiado largo' }, 400);
  const pensar = !!c.pensar;

  // Conversación: la que viene o una nueva con el principio de la pregunta como título
  let conv = typeof c.conversacion_id === 'string' ? c.conversacion_id : '';
  if (conv) {
    const { data, error } = await sb.from('chat_conversaciones').select('id').eq('id', conv).maybeSingle();
    if (error || !data) return json({ error: 'Conversación no encontrada' }, 404);
  } else {
    const titulo = texto.replace(/\s+/g, ' ').slice(0, 60) + (texto.length > 60 ? '…' : '');
    const { data, error } = await sb.from('chat_conversaciones').insert({ titulo }).select('id').single();
    if (error) return json({ error: error.message }, 500);
    conv = data.id;
  }

  const { data: previos, error: e1 } = await sb.from('chat_mensajes').select('rol, contenido')
    .eq('conversacion_id', conv).order('id', { ascending: false }).limit(HISTORIAL);
  if (e1) return json({ error: e1.message }, 500);
  const { error: e2 } = await sb.from('chat_mensajes').insert({ conversacion_id: conv, rol: 'user', contenido: texto });
  if (e2) return json({ error: e2.message }, 500);

  const mensajes = [{ role: 'system', content: sistema() }]
    .concat((previos || []).reverse().filter((m: any) => m.contenido).map((m: any) => ({ role: m.rol, content: m.contenido })))
    .concat([{ role: 'user', content: texto }]);

  const r = await fetch(API, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + clave, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelo, messages: mensajes, stream: true, stream_options: { include_usage: true },
      thinking: { type: pensar ? 'enabled' : 'disabled' },
    }),
  });
  if (!r.ok || !r.body) {
    const det = (await r.text().catch(() => '')).slice(0, 300);
    console.error('DeepSeek', r.status, det);
    return json({ error: 'DeepSeek respondió ' + r.status + (r.status === 401 ? ' (revisa la clave del secreto «deep»)' : r.status === 402 ? ' (sin saldo)' : ''), conversacion_id: conv }, 502);
  }

  const enc = new TextEncoder();
  let respuesta = '', razon = '', uso: unknown = null, guardado = false;
  const guardar = async () => {
    if (guardado || (!respuesta && !razon)) return;
    guardado = true;
    await sb.from('chat_mensajes').insert({ conversacion_id: conv, rol: 'assistant', contenido: respuesta, razonamiento: razon || null, modelo, uso });
    await sb.from('chat_conversaciones').update({ actualizado: new Date().toISOString() }).eq('id', conv);
  };

  const lector = r.body.getReader();
  const salida = new ReadableStream({
    async start(ctrl) {
      let vivo = true;
      const mandar = (o: unknown) => { if (!vivo) return; try { ctrl.enqueue(enc.encode(JSON.stringify(o) + '\n')); } catch { vivo = false; } };
      mandar({ t: 'conv', id: conv, modelo });
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
            if (!linea.startsWith('data:')) continue;
            const dato = linea.slice(5).trim();
            if (dato === '[DONE]') continue;
            let j: any; try { j = JSON.parse(dato); } catch { continue; }
            if (j.usage) uso = j.usage;
            const d = j.choices?.[0]?.delta || {};
            if (d.reasoning_content) { razon += d.reasoning_content; mandar({ t: 'razon', x: d.reasoning_content }); }
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
    // Si Diego pulsa «Parar», se corta también DeepSeek y se guarda lo que había llegado
    async cancel() { try { await lector.cancel(); } catch { /* */ } await guardar().catch(() => {}); },
  });
  return new Response(salida, { headers: { ...CORS, 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache' } });
});
