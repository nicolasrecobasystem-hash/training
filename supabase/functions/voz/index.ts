// Función "voz" de Supabase: (1) dice frases con tu voz de ElevenLabs y (2) da al mando un permiso temporal (15 min, de un solo uso) para usar
// el reconocimiento de voz en tiempo real de ElevenLabs (Scribe). La clave NUNCA va en la web:
// se guarda como secreto ELEVENLABS_API_KEY en Supabase. Solo responde a tu cuenta.
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
  const clave = Deno.env.get('ELEVENLABS_API_KEY');
  if (!clave) return json({ error: 'Falta el secreto ELEVENLABS_API_KEY en Supabase' }, 500);

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user || (u.user.email || '').toLowerCase() !== CORREO_PERMITIDO) return json({ error: 'No autorizado' }, 401);

  let cuerpo: any = {};
  try { cuerpo = await req.json(); } catch { /* vacío */ }

  // Decir un texto en voz alta (texto a voz). Devuelve el audio MP3.
  // Frases cortas: modelo multilingüe v2. Respuestas del chat por voz: flash v2.5 (la más rápida). Guiones (modelo 'eleven_v4'): trozos de hasta 4.000 caracteres,
  // con etiquetas de emoción [así] y un ajuste más expresivo.
  if (cuerpo.accion === 'decir') {
    const MODELOS = ['eleven_multilingual_v2', 'eleven_v4', 'eleven_v4_turbo', 'eleven_v3', 'eleven_flash_v2_5'];
    const modelo = MODELOS.includes(cuerpo.modelo) ? cuerpo.modelo : 'eleven_multilingual_v2';
    const texto = String(cuerpo.texto || '').slice(0, modelo === 'eleven_multilingual_v2' ? 400 : modelo === 'eleven_flash_v2_5' ? 1000 : 4000);
    const vozId = /^[A-Za-z0-9]{10,40}$/.test(cuerpo.voz || '') ? cuerpo.voz : 'k8cFOyAg7B9qwBlDDNTC';
    if (!texto) return json({ error: 'Falta el texto' }, 400);
    const pedido: any = { text: texto, model_id: modelo };
    if (modelo !== 'eleven_multilingual_v2' && modelo !== 'eleven_flash_v2_5') pedido.voice_settings = { stability: 0.4, similarity_boost: 0.8 };
    // Velocidad opcional (ElevenLabs acepta 0.7–1.2; 1 = normal). El chat la usa para hablar más despacio.
    const vel = Number(cuerpo.velocidad);
    if (isFinite(vel) && vel >= 0.7 && vel <= 1.2 && vel !== 1) pedido.voice_settings = { ...(pedido.voice_settings || {}), speed: vel };
    const t = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + vozId + '?output_format=mp3_44100_128', {
      method: 'POST', headers: { 'xi-api-key': clave, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(pedido),
    });
    if (!t.ok) return json({ error: 'ElevenLabs respondió ' + t.status, detalle: await t.text().catch(() => '') }, 502);
    return new Response(t.body, { headers: { ...CORS, 'Content-Type': 'audio/mpeg' } });
  }

  // Poner etiquetas de emoción a un guion con IA (Claude). Necesita el secreto ANTHROPIC_API_KEY.
  if (cuerpo.accion === 'etiquetar') {
    const claveIA = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claveIA) return json({ error: 'Falta el secreto ANTHROPIC_API_KEY en Supabase' }, 500);
    const texto = String(cuerpo.texto || '').slice(0, 20000);
    if (!texto.trim()) return json({ error: 'Falta el texto' }, 400);
    const sistema = 'Preparas guiones en español para que los lea en voz alta el modelo Eleven v4 de ElevenLabs mientras alguien entrena en casa. ' +
      'Añade etiquetas de emoción e interpretación entre corchetes y EN INGLÉS (por ejemplo [energetic], [excited], [calm], [warm], [serious], [whispering], [shouting], [laughing], [encouraging], [thoughtful], [pause], [sighs]) justo antes de la frase a la que afectan. ' +
      'Úsalas con criterio: donde el sentido del texto cambia de tono, no en cada frase. Puedes ajustar la puntuación (puntos suspensivos, exclamaciones, comas) para dar ritmo natural. ' +
      'NO cambies, quites ni añadas palabras del texto. Conserva los párrafos. Devuelve SOLO el guion con las etiquetas, sin comentarios.';
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': claveIA, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 16000, system: sistema, messages: [{ role: 'user', content: texto }] }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: 'La IA respondió ' + r.status, detalle: d }, 502);
    const salida = (d.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim();
    return json({ texto: salida });
  }

  // Avisar a tu agente (Grok Bot en Cursor Automations) por webhook. La clave va en el secreto CURSOR_WEBHOOK_KEY.
  if (cuerpo.accion === 'aviso') {
    const claveHook = Deno.env.get('CURSOR_WEBHOOK_KEY');
    if (!claveHook) return json({ error: 'Falta el secreto CURSOR_WEBHOOK_KEY en Supabase' }, 500);
    const datos = cuerpo.datos && typeof cuerpo.datos === 'object' ? cuerpo.datos : {};
    const r = await fetch('https://api2.cursor.sh/automations/webhook/286c4eee-8d0a-5487-a3bd-9c478ccae5f4', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + claveHook, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fuente: 'mi-semana', canal: 'entreno', ...datos }),
    });
    const txt = await r.text().catch(() => '');
    return json({ ok: r.ok, status: r.status, respuesta: txt.slice(0, 300) }, r.ok ? 200 : 502);
  }

  // Permiso temporal para escuchar (contar repeticiones)
  const r = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', { method: 'POST', headers: { 'xi-api-key': clave } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.token) return json({ error: 'ElevenLabs respondió ' + r.status, detalle: d }, 502);
  return json({ token: d.token });
});
