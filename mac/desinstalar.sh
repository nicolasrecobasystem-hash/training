#!/bin/bash
# Quita el latido del Mac. El token se queda en el Llavero (bórralo con:
#   security delete-generic-password -a latido -s mi-semana-latido)
/bin/launchctl bootout "gui/$(id -u)/es.misemana.latido" 2>/dev/null || true
rm -f "$HOME/Library/LaunchAgents/es.misemana.latido.plist"
rm -f "$HOME/Library/Application Support/mi-semana/latido.sh"
echo "Latido desinstalado. En unos 5 minutos el reloj mandará la alerta mac_sin_senal (es lo esperado)."
