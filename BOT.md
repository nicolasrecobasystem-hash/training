# Bots → Mi semana: contrato de la función `bot`

El bot **elige y pone la música en el Mac** y guarda su propio perfil (gustos, vetos, semillas).
La app es el **reloj** (modo y fase del momento) y la **bitácora**: apunta qué sonó, las notas 1–5, los «cambia», y lo enseña en el panel del reloj.

## Lo que la app ya le manda al bot (salida, ya funciona)

Webhook a cada destino activo en cada cambio: `modo_iniciado`, `fase_iniciada`, `aviso_previo`, `modo_detenido`… con
`modo` (concentracion | descanso | entreno | manana), `fase` (pomodoro | descanso_corto | descanso_largo | descanso | entreno | manana),
`ciclo`, `hora_madrid`, `siguiente_cambio`. Con eso el bot sabe cuándo cambiar de energía o parar la música.

## Lo que el bot le manda a la app (entrada, nuevo)

```
POST https://idjlewvzuzqywthrwibv.supabase.co/functions/v1/bot
x-bot-token: <token del bot>          (o Authorization: Bearer <token>)
Content-Type: application/json
```

El token se crea en el panel del reloj → tarjeta **Bots** → «Crear token». Se ve una sola vez; guárdalo como secreto del bot.

| accion | para qué | campos |
|---|---|---|
| `contexto` | antes de elegir: modo/fase actuales y lo que sonó los últimos 3 días (para no repetir) | `limite` (opcional, 1–200, por defecto 50) |
| `sonando` | justo después de poner algo | `titulo` (obligatorio), `artista`, `semilla` (búsqueda o playlist de la que salió), `familia` (orquestal, ambient, deep house…), `energia` (`baja`/`media`/`alta`), `voz` (true/false), `url`, `nuevo` (true si es un descubrimiento), `extra` (objeto libre) |
| `valoracion` | Diego dice una nota | `nota` (1–5), `id` (opcional; si no va, se aplica a lo último que sonó) |
| `cambio` | Diego dice «cambia» | `id` (opcional; si no va, lo último) |
| `mensaje` | cualquier aviso para el registro del panel | `texto` |

Respuestas: `{"ok":true,...}`. Errores: 401 token malo, 400 datos mal, 429 más de 60 escrituras por minuto.

### Ejemplos

```bash
U=https://idjlewvzuzqywthrwibv.supabase.co/functions/v1/bot
T=<token>

# ¿Qué toca y qué ha sonado?
curl -s -X POST $U -H "x-bot-token: $T" -H "Content-Type: application/json" -d '{"accion":"contexto","limite":30}'

# Apuntar lo que pongo
curl -s -X POST $U -H "x-bot-token: $T" -H "Content-Type: application/json" \
  -d '{"accion":"sonando","titulo":"Time","artista":"Hans Zimmer","semilla":"hans zimmer focus","familia":"orquestal","energia":"baja","voz":false,"url":"https://www.youtube.com/watch?v=..."}'

# Diego: «un 4»
curl -s -X POST $U -H "x-bot-token: $T" -H "Content-Type: application/json" -d '{"accion":"valoracion","nota":4}'

# Diego: «cambia»
curl -s -X POST $U -H "x-bot-token: $T" -H "Content-Type: application/json" -d '{"accion":"cambio"}'
```

`contexto` devuelve:

```json
{ "ok": true, "hora_madrid": "2026-10-05T10:15:37+02:00",
  "modo": "concentracion", "fase": "pomodoro", "ciclo": 1,
  "fase_inicio": "…", "fase_fin": "…", "minutos_en_fase": 7, "minutos_en_modo": 7,
  "siguiente_cambio": { "fase": "descanso_corto", "ciclo": 1, "hora_madrid": "…" },
  "historial": [ { "hora_madrid": "…", "titulo": "Time", "artista": "Hans Zimmer", "semilla": "…",
                   "familia": "orquestal", "energia": "baja", "voz": false, "nuevo": false,
                   "modo": "concentracion", "fase": "pomodoro", "nota": 4, "cambiada": false } ] }
```

## Procedimiento sugerido para el bot (capas 1–3)

1. **Perfil vivo** (en el bot): familias/artistas que funcionan por modo, vetos (sin Marc Anthony, sin triste, sin fiesta), media de nota por familia.
   Se recalcula con las notas y «cambia» que el bot apunta aquí (también puede leerlas de `contexto.historial`).
2. **Semillas**: 20–40 búsquedas/playlists etiquetadas por familia, energía y voz. Rampa por energía dentro del bloque:
   baja al empezar, media a los 10 min, alta a los 20 (`minutos_en_fase` de `contexto`), siempre una semilla distinta de la anterior.
3. **Anti-repetición**: antes de elegir, `contexto` → descartar títulos y semillas de hoy y de las 2–3 sesiones anteriores, y rotar de familia.
4. (Más adelante) **Descubrimiento** 1 de cada 5 con `"nuevo": true`; ≥4 entra al perfil, ≤2 queda vetado un tiempo.
5. **Contexto**: cada modo con su lista y volumen. En `descanso_*` y al recibir `aviso_previo`/`modo_detenido`, bajar o parar.
6. **Feedback**: al acabar un bloque, preguntar «¿del 1 al 5?» y mandarlo con `valoracion`.
