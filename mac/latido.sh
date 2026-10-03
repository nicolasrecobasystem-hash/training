#!/bin/bash
# Latido del Mac de Diego para el reloj de Mi semana: "sigo vivo" cada 60 s (lo lanza launchd).
# El token NO está en este archivo: se lee del Llavero de macOS (servicio "mi-semana-latido").
# Si el Mac se duerme, se apaga o se para este script, el vigilante del reloj avisa a los agentes
# a los 5 minutos (alerta mac_sin_senal) y avisa otra vez cuando vuelve (mac_recuperado).
URL="https://idjlewvzuzqywthrwibv.supabase.co/functions/v1/latido"
APIKEY="sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt"   # clave pública de la app (no es secreta)

TOKEN=$(/usr/bin/security find-generic-password -a latido -s mi-semana-latido -w 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "$(date '+%F %T') sin token en el Llavero (servicio mi-semana-latido)" >&2
  exit 1
fi
EQUIPO=$(/usr/sbin/scutil --get ComputerName 2>/dev/null | tr -d '"\\')
MACOS=$(/usr/bin/sw_vers -productVersion 2>/dev/null)
RESP=$(/usr/bin/curl -sS --max-time 15 -X POST "$URL" \
  -H "apikey: $APIKEY" \
  -H "x-dispositivo-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"equipo\":\"$EQUIPO\",\"macos\":\"$MACOS\"}" -w ' HTTP%{http_code}' 2>&1)
case "$RESP" in
  *HTTP200) ;;                                      # todo bien: no se escribe nada
  *) echo "$(date '+%F %T') latido fallido: $RESP" >&2 ;;
esac
