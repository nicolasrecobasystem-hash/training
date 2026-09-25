// Función "voz" de Supabase: da al mando un permiso temporal (15 min, de un solo uso) para usar
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

  const r = await fetch('https://api.elevenlabs.io/v1/single-use-token/realtime_scribe', { method: 'POST', headers: { 'xi-api-key': clave } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.token) return json({ error: 'ElevenLabs respondió ' + r.status, detalle: d }, 502);
  return json({ token: d.token });
});
