#!/bin/bash
# Instala el latido del Mac (una vez). Uso, en la Terminal:
#   bash ~/Desktop/mi-semana/mac/instalar.sh
# Antes guarda el token en el Llavero con el comando que te da el panel del reloj
# (security add-generic-password -U -a latido -s mi-semana-latido -w <token>).
set -e
DIR="$HOME/Library/Application Support/mi-semana"
PLIST="$HOME/Library/LaunchAgents/es.misemana.latido.plist"
ORIGEN="$(cd "$(dirname "$0")" && pwd)"

if ! /usr/bin/security find-generic-password -a latido -s mi-semana-latido -w >/dev/null 2>&1; then
  echo "Falta el token en el Llavero. En el panel del reloj pulsa «Crear token del Mac» y pega aquí el comando que te da."
  exit 1
fi
mkdir -p "$DIR" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
cp "$ORIGEN/latido.sh" "$DIR/latido.sh"
chmod 700 "$DIR/latido.sh"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>es.misemana.latido</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$DIR/latido.sh</string></array>
  <key>StartInterval</key><integer>60</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/mi-semana-latido.log</string>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/mi-semana-latido.log</string>
</dict>
</plist>
PL
/bin/launchctl bootout "gui/$(id -u)/es.misemana.latido" 2>/dev/null || true
/bin/launchctl bootstrap "gui/$(id -u)" "$PLIST"
/bin/launchctl kickstart -k "gui/$(id -u)/es.misemana.latido"
sleep 3
echo "Latido instalado. Mira el panel del reloj: «Mac de Diego · último latido hace unos segundos»."
echo "Registro de errores (si los hay): ~/Library/Logs/mi-semana-latido.log"
