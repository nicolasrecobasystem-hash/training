# Reloj del día (Mi semana)

El reloj lleva la agenda de modos de Diego (concentración, descanso, entreno, mañana) **en Supabase**,
avisa por webhook a sus agentes en cada cambio de fase y abre una alerta cuando algo se cae.
Ningún cambio depende de que la app esté abierta: `pg_cron` ejecuta `reloj_tick()` y `reloj_vigilar()`
cada minuto dentro de la base, y los webhooks salen con `pg_net`.

## Cómo funciona

| Pieza | Dónde | Qué hace |
|---|---|---|
| `reloj_tick()` | SQL, pg_cron cada minuto | Arranca los bloques de la agenda, planifica las fases (3 h por delante), manda `aviso_previo`, arranca la fase que toca (`modo_iniciado` / `fase_iniciada`), cierra los modos (`modo_detenido`) y envía la bandeja de salida. |
| `reloj_entregar()` | SQL (la llama el tick) | Manda cada entrega con `net.http_post` (timeout 10 s), lee la respuesta en el minuto siguiente y reintenta con espera exponencial (30 s, 1, 2, 4, 8 min; 6 intentos). Al agotarlos: alerta `entrega_fallida`. |
| `reloj_vigilar()` | SQL, pg_cron cada minuto | `mac_sin_senal` (5 min sin latido) / `mac_recuperado`, `fase_perdida` (fase que no arrancó, arrancó tarde, se saltó o cuyo webhook no se entregó 2 min después de su hora). Una alerta por incidente. |
| `reloj` | Edge function | Acciones del panel (iniciar/parar, agenda, destinos, probar, token del Mac, config, estado). Misma comprobación que `voz`: sesión + correo permitido. |
| `latido` | Edge function | Recibe el latido del Mac con un token propio del dispositivo (en la base solo su hash). |
| `reloj.html` | GitHub Pages | Panel: modo y fase, cuenta atrás, último latido, entregas, alertas, agenda, destinos y duraciones. Se entra desde ⚙ Configuración → «⏱ Reloj del día». |
| `mac/` | Mac de Diego | `latido.sh` (launchd cada 60 s, token leído del Llavero) e `instalar.sh` / `desinstalar.sh`. |

Idempotencia: cada transición es un `UPDATE … WHERE estado = 'programada' RETURNING`, cada evento tiene una
clave única (`fase:<id>`, `aviso_previo:<id>`, `modo_detenido:<id>`, `alerta:<id>`…), cada entrega es única por
`(id_evento, destino_id)`, y tick, vigilante y acciones se serializan con `pg_advisory_xact_lock`.
Un reintento reenvía exactamente el mismo `id_evento`, el mismo payload y la cabecera `Idempotency-Key`.

Zona horaria: la base guarda `timestamptz`; la agenda se interpreta en `Europe/Madrid` y las duraciones son
absolutas, así que el cambio de hora (25-oct-2026) no mueve ni duplica fases (probado, ver abajo).

Audio y luces: el reloj **no** llama a Govee, ElevenLabs ni a ningún reproductor; solo informa. Antes de cada
cambio que implique parar música o luces sale `aviso_previo` (por defecto 2 min antes; configurable, y también
qué fases lo provocan en `reloj_config.fases_con_parada`). «Parar» desde el panel avisa y para X min después;
«Parar ya» manda el aviso y la parada a la vez.

## Contrato del webhook

`POST` a la URL del destino con `Content-Type: application/json`, `Authorization: <header guardado en Vault>`
e `Idempotency-Key: <id_evento>`:

```json
{
  "fuente": "mi-semana",
  "version": 1,
  "id_evento": "47bc897a-4c0d-483b-bf62-0c51ff750e59",
  "evento": "fase_iniciada",
  "modo": "concentracion",
  "fase": "descanso_corto",
  "ciclo": 1,
  "hora_madrid": "2026-10-12T11:25:00+02:00",
  "fin_madrid": "2026-10-12T11:30:00+02:00",
  "origen": "manual",
  "siguiente_cambio": { "fase": "pomodoro", "ciclo": 2, "hora_madrid": "2026-10-12T11:30:00+02:00" },
  "mensaje": "Descanso corto tras el pomodoro 1 hasta las 11:30."
}
```

- `evento`: `modo_iniciado | fase_iniciada | aviso_previo | modo_detenido | alerta | prueba`.
- `modo`: `concentracion | descanso | entreno | manana`. `fase`: `pomodoro | descanso_corto | descanso_largo | descanso | entreno | manana`.
- `siguiente_cambio`: la próxima fase; si lo siguiente es el final del modo, `{"fase": null, "evento": "modo_detenido", "hora_madrid": …}`; `null` si no hay nada previsto (concentración manual sin fin, al pararla, alertas).
- `aviso_previo` lleva `"implica_parar": true`, la fase que termina y en `siguiente_cambio` el cambio que anuncia.
- `alerta` lleva `"alerta": {"tipo": "mac_sin_senal | mac_recuperado | fase_perdida | entrega_fallida", "detalle": "…"}`.
- Campos añadidos al contrato propuesto: `fin_madrid`, `origen`, `implica_parar`, `motivo` (en `modo_detenido`). Son extra: un agente que no los conozca los puede ignorar.

## Desplegar (proyecto **pruebas**, `idjlewvzuzqywthrwibv`)

No tengo acceso por conector a este proyecto, así que son pasos para el panel de Supabase:

1. **SQL Editor → New query**: pega y ejecuta, **en este orden**, cada archivo de `supabase/migrations/`:
   1. `20261003100000_reloj_extensiones.sql` (pg_cron, pg_net, Vault, pgcrypto)
   2. `20261003100100_reloj_tablas.sql`
   3. `20261003100200_reloj_logica.sql`
   4. `20261003100300_reloj_cron.sql`

   Se pueden volver a pegar sin romper nada. Si el paso 1 da error de permisos, actívalas a mano en
   **Database → Extensions** (pg_cron, pg_net) y sigue.
2. **Edge Functions → Deploy a new function** → nombre `reloj` → pega `supabase/functions/reloj/index.ts` → Deploy.
   En **Settings** de la función, desactiva «Verify JWT with legacy secret» (como en `voz`: la función hace su propia comprobación).
3. Lo mismo con `latido` (`supabase/functions/latido/index.ts`), también con «Verify JWT» desactivado.
4. No hace falta ningún secreto nuevo: el destino de Cursor ya sembrado copia `CURSOR_WEBHOOK_KEY` a Vault la primera vez que abres el panel.
5. Comprueba en el SQL Editor:
   ```sql
   select jobname, schedule, active from cron.job where jobname like 'reloj-%';      -- 3 tareas activas
   select * from cron.job_run_details order by start_time desc limit 5;              -- status = succeeded
   select nombre, pista, secreto_id is not null as con_header from reloj_destinos;    -- tras abrir el panel: con_header = true
   ```
6. Abre `https://nicolasrecobasystem-hash.github.io/training/reloj.html` (o ⚙ Configuración → ⏱ Reloj del día).

## Probar de punta a punta

1. **Webhook de prueba**: en el panel, «Probar webhook» en el destino. En «Últimas entregas» debe salir `entregada · HTTP 200` en ≤ 1 min.
2. **Ciclo completo sin intervención** (fases de 1 minuto): en «Duraciones» pon pomodoro 1, descanso corto 1, descanso largo 1,
   pomodoros por largo 2, aviso previo 0,5 → Guardar → «▶ Concentración». Cierra la app. En ~5 min el destino recibe
   `modo_iniciado`, `aviso_previo`, `fase_iniciada` (descanso corto 1), pomodoro 2, descanso largo 2… Luego «Parar ya» y vuelve a 25/5/15/4/2.
3. **Destino que falla**: añade un destino a `https://httpbin.org/status/500` → «Probar webhook» → 6 intentos con el mismo `id_evento` y una alerta `entrega_fallida`. Bórralo después.
4. **Mac**: instala el latido (abajo), espera a ver «último latido hace X s», ejecuta `bash ~/Desktop/mi-semana/mac/desinstalar.sh`:
   a los 5–6 min sale una alerta `mac_sin_senal`; reinstala y sale `mac_recuperado`.

### curl para probar un destino a mano

```bash
curl -sS -X POST 'https://api2.cursor.sh/automations/webhook/286c4eee-8d0a-5487-a3bd-9c478ccae5f4' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $CURSOR_WEBHOOK_KEY" \
  -H 'Idempotency-Key: 11111111-2222-3333-4444-555555555555' \
  -d '{"fuente":"mi-semana","version":1,"id_evento":"11111111-2222-3333-4444-555555555555","evento":"prueba",
       "modo":null,"fase":null,"ciclo":null,"hora_madrid":"2026-10-03T12:00:00+02:00","siguiente_cambio":null,
       "mensaje":"Prueba del reloj de Mi semana: si lees esto, el webhook funciona."}'
```
(Exporta antes `CURSOR_WEBHOOK_KEY` en tu Terminal; no lo pegues en ningún archivo.)

## Latido del Mac (launchd + Llavero)

1. En el panel del reloj → bloque «Mac» → **Crear token del Mac**. Sale un comando una sola vez:
   `security add-generic-password -U -a latido -s mi-semana-latido -w <token>` → pégalo en la Terminal (guarda el token en el Llavero).
2. `bash ~/Desktop/mi-semana/mac/instalar.sh` → crea `~/Library/LaunchAgents/es.misemana.latido.plist` (cada 60 s y al arrancar)
   y copia el script a `~/Library/Application Support/mi-semana/`.
3. Errores, si los hay: `~/Library/Logs/mi-semana-latido.log`. Para quitarlo: `bash ~/Desktop/mi-semana/mac/desinstalar.sh`.

El token no está en el script ni en el repo; en la base solo se guarda su sha256. Si el Mac duerme también
deja de latir: es lo esperado y el vigilante avisará.

## Pruebas automáticas

En cualquier Postgres 15+ (sin Supabase), con `00_simulacion_supabase.sql` imitando Vault, pg_net, auth y cron:

```bash
createdb reloj
psql -d reloj -f supabase/tests/00_simulacion_supabase.sql
for f in supabase/migrations/2026100310{01,02,03}00_*.sql; do psql -d reloj -f $f; done
psql -d reloj -f supabase/tests/01_pruebas_reloj.sql        # 14 líneas "OK …"
PSQL="psql -d reloj" sh supabase/tests/02_tick_en_paralelo.sh   # 16 ticks a la vez, sin duplicados
```

Cubren: ciclo completo con fases de 1 min (horas de Madrid y `siguiente_cambio`), parar inmediato y con margen,
tick repetido y en paralelo sin duplicados, 500 → 6 reintentos con el mismo `id_evento` y una sola `entrega_fallida`,
`mac_sin_senal` / `mac_recuperado` una vez por incidente, `fase_perdida` una vez, agenda y concentración a través del
cambio de hora del 25-oct-2026, `aviso_previo` 2 min antes de cada cambio configurado, header solo en Vault y RLS.

## Supuestos confirmados o cambiados

- ✔ Frontend JS plano sin bundler; `voz` con `accion:'aviso'` hace un único fetch a Cursor con `CURSOR_WEBHOOK_KEY`, sin reintentos. **No se toca**: el aviso de entreno y las estadísticas siguen saliendo igual.
- ✔ No había `supabase/migrations`. Se crean 4.
- ⚠ No pude comprobar pg_cron/pg_net/Vault en el proyecto (sin acceso por conector ni navegador en ese momento): la migración 1 los activa con `if not exists`.
- ↺ **Cambio**: `tick`, `entregar` y `vigilante` son funciones SQL ejecutadas por pg_cron, no edge functions. Así el reloj no tiene que guardar una clave de servicio para llamarse a sí mismo, cada transición es atómica dentro de la base y el header de cada destino se lee de Vault sin salir de Postgres.
- ↺ **Cambio**: el header de los destinos va siempre en Vault (no en secretos de edge functions). El destino sembrado guarda solo el *nombre* `CURSOR_WEBHOOK_KEY`; la función `reloj` lo copia a Vault la primera vez.
- ↺ Panel como página aparte (`reloj.html`), como `mando.html`: no toca la pantalla de entreno (escalada a 16:9) de `app.js`. Único cambio en `app.js`: el enlace «⏱ Reloj del día» en Configuración.
- ✔ Identificadores sin choque con el descanso entre series del entreno: los modos/fases del reloj viven en tablas y payloads propios (`reloj_*`, `descanso_corto`, `descanso_largo`).
- ✔ El reloj del día es solo de Diego (RLS y funciones limitadas a su correo); Emelith sigue solo en el modo entreno.
- ⚠ Con pg_net los envíos de un mismo minuto salen en paralelo: el orden de llegada `aviso_previo` → `modo_detenido` en «Parar ya» no está garantizado al milisegundo; para garantizarlo usa «Parar» (con margen).
- ⚠ pg_net deja las peticiones (con su header) en `net.http_request_queue` hasta enviarlas (segundos) y no las escribe en logs; las respuestas quedan 6 h en `net._http_response` sin headers.
