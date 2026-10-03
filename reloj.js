/* Panel del reloj del día (reloj.html).
   El reloj NO corre aquí: lo lleva Supabase (pg_cron llama a reloj_tick y reloj_vigilar cada minuto).
   Esta página lee el estado (función «reloj», accion 'estado') cada 10 s, cuenta atrás en pantalla
   y manda las órdenes (iniciar, parar, agenda, destinos, probar webhook, token del Mac). */
(function () {
  'use strict';
  var URL_NUBE = 'https://idjlewvzuzqywthrwibv.supabase.co';
  var CLAVE = 'sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt';   // clave pública (publishable)
  var raiz = document.getElementById('reloj');
  var sb = null, usuario = null, est = null, error = '', aviso = '', tokenNuevo = '', desfase = 0, cargando = false;
  var MODOS = [['concentracion', 'Concentración'], ['descanso', 'Descanso'], ['entreno', 'Entreno'], ['manana', 'Mañana']];
  var FASES = { pomodoro: 'Pomodoro', descanso_corto: 'Descanso corto', descanso_largo: 'Descanso largo', descanso: 'Descanso', entreno: 'Entreno', manana: 'Mañana' };
  var DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return raiz.querySelector(s); }
  function ahora() { return Date.now() + desfase; }   // hora del servidor
  function hm(iso, seg) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: seg ? '2-digit' : undefined }); } catch (e) { return '—'; }
  }
  function cuando(iso) {
    if (!iso) return 'nunca';
    var s = Math.round((ahora() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'hace ' + Math.max(0, s) + ' s';
    if (s < 3600) return 'hace ' + Math.floor(s / 60) + ' min';
    return hm(iso) + ' (' + new Date(iso).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'short' }) + ')';
  }
  function cuenta(iso) {
    if (!iso) return '—';
    var s = Math.max(0, Math.round((new Date(iso).getTime() - ahora()) / 1000));
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (x < 10 ? '0' : '') + x;
  }
  function nombreModo(m) { for (var i = 0; i < MODOS.length; i++) if (MODOS[i][0] === m) return MODOS[i][1]; return m || ''; }
  function nombreFase(f, c) { return (FASES[f] || f || '') + (f === 'pomodoro' && c ? ' ' + c : ''); }

  // ---------- llamadas ----------
  function llamar(cuerpo) {
    return sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(URL_NUBE + '/functions/v1/reloj', { method: 'POST', headers: { Authorization: 'Bearer ' + tok, apikey: CLAVE, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
    }).then(function (r) { return r.json().then(function (d) { if (!r.ok || d.error) throw new Error(d.error || ('HTTP ' + r.status)); return d; }); });
  }
  function cargar() {
    if (!usuario || cargando) return;
    cargando = true;
    llamar({ accion: 'estado' }).then(function (d) {
      est = d; error = ''; if (d.ahora) desfase = new Date(d.ahora).getTime() - Date.now();
    }).catch(function (e) { error = e.message; }).then(function () { cargando = false; pintar(); });
  }
  function accion(cuerpo, okTxt) {
    aviso = 'Enviando…'; pintarAviso();
    return llamar(cuerpo).then(function (d) { aviso = okTxt || 'Hecho ✓'; cargar(); return d; })
      .catch(function (e) { aviso = 'Error: ' + e.message; pintarAviso(); });
  }

  // ---------- pantallas ----------
  function htmlLogin() {
    return '<div class="r-centro"><div class="r-ante">RELOJ · MI SEMANA</div><h1 class="r-tit">Entra con tu cuenta</h1>' +
      '<div class="r-form"><input id="r-correo" type="email" autocomplete="username" placeholder="Correo" value="' + esc(leer('miSemana.correo')) + '">' +
      '<input id="r-clave" type="password" autocomplete="current-password" placeholder="Contraseña">' +
      '<div class="r-error">' + esc(error) + '</div><button type="button" class="r-pri" data-a="entrar">Entrar</button></div></div>';
  }
  function htmlCabecera() {
    return '<header class="r-top"><div><div class="r-ante">MI SEMANA</div><h1 class="r-tit">RELOJ DEL DÍA</h1></div>' +
      '<div class="r-top-der"><span class="r-hora" id="r-hora"></span><a class="r-sec" href="./">← App</a></div></header>';
  }
  function htmlEstado() {
    var s = est.sesion, f = est.fase, sig = est.siguiente;
    var color = !s ? 'blanco' : (f && /descanso/.test(f.tipo) ? 'azul' : f && f.tipo === 'pomodoro' ? 'rojo' : 'morado');
    var botones = MODOS.map(function (m) {
      var on = s && s.modo === m[0];
      return '<button type="button" class="r-modo' + (on ? ' on' : '') + '" data-a="iniciar" data-m="' + m[0] + '">' + (on ? '↻ ' : '▶ ') + m[1] + '</button>';
    }).join('');
    var prox = (est.proximas || []).slice(0, 4).map(function (p) { return '<span>' + esc(nombreFase(p.tipo, p.ciclo)) + ' <b>' + hm(p.inicio) + '</b></span>'; }).join('');
    return '<section class="r-estado f-' + color + '">' +
      '<div class="r-est-izq"><div class="r-ante">' + (s ? 'MODO ' + esc(nombreModo(s.modo)).toUpperCase() + ' · ' + (s.origen === 'agenda' ? 'AGENDA' : 'MANUAL') : 'SIN MODO ACTIVO') + '</div>' +
      '<div class="r-fase">' + (f ? esc(nombreFase(f.tipo, f.ciclo)) : 'Libre') + '</div>' +
      '<div class="r-cuenta" id="r-cuenta">' + (sig ? cuenta(sig.hora_madrid) : '—') + '</div>' +
      '<div class="r-sig">' + (sig ? (sig.fase ? 'Luego ' + esc(nombreFase(sig.fase, sig.ciclo)) : 'Fin del modo') + ' a las <b>' + hm(sig.hora_madrid) + '</b>' : (s ? 'Sin fin previsto: hasta que lo pares' : 'Inicia un modo o programa la agenda')) + '</div>' +
      (prox ? '<div class="r-prox">' + prox + '</div>' : '') + '</div>' +
      '<div class="r-est-der"><div class="r-modos">' + botones + '</div>' +
      '<label class="r-min">Minutos (opcional) <input id="r-minutos" type="number" min="1" step="1" placeholder="—"></label>' +
      (s ? '<div class="r-paro"><button type="button" class="r-sec" data-a="parar">■ Parar (avisa ' + esc(est.config.aviso_previo_min) + ' min antes)</button>' +
           '<button type="button" class="r-sec peligro" data-a="parar-ya">■ Parar ya</button></div>' : '') +
      '</div></section>';
  }
  function htmlMac() {
    var ls = est.latidos || [];
    var filas = ls.map(function (l) {
      var seg = l.ultimo ? (ahora() - new Date(l.ultimo).getTime()) / 1000 : 1e9;
      return '<div class="r-fila"><i class="r-punto ' + (seg < 120 ? 'ok' : seg < 300 ? 'medio' : 'mal') + '"></i><b>' + esc(l.nombre) + '</b><span class="r-gris">' + (l.ultimo ? 'último latido ' + cuando(l.ultimo) : 'aún sin latidos') + '</span></div>';
    }).join('') || '<div class="r-vacio">Ningún dispositivo. Crea el token del Mac e instala el script.</div>';
    var tok = tokenNuevo ? '<div class="r-token"><div class="r-ante">TOKEN NUEVO · SOLO SE MUESTRA AHORA</div>' +
      '<p>Pégalo en la Terminal del Mac para guardarlo en el Llavero:</p><pre>security add-generic-password -U -a latido -s mi-semana-latido -w ' + esc(tokenNuevo) + '</pre>' +
      '<button type="button" class="r-sec" data-a="copiar-token">Copiar comando</button> <button type="button" class="r-sec" data-a="ocultar-token">Ya lo guardé</button></div>' : '';
    return '<section class="r-panel"><h2>Mac</h2>' + filas + tok +
      '<button type="button" class="r-sec" data-a="token">' + (ls.length ? 'Renovar token del Mac' : 'Crear token del Mac') + '</button></section>';
  }
  function htmlAlertas() {
    var as = est.alertas || [];
    return '<section class="r-panel' + (as.length ? ' alerta' : '') + '"><h2>Alertas abiertas <span>' + as.length + '</span></h2>' +
      (as.map(function (a) {
        return '<div class="r-fila"><span class="r-chip mal">' + esc(a.tipo) + '</span><span>' + esc(a.detalle) + '<br><span class="r-gris">' + cuando(a.abierta_en) + '</span></span>' +
          '<button type="button" class="r-mini" data-a="cerrar-alerta" data-id="' + esc(a.id) + '">Cerrar</button></div>';
      }).join('') || '<div class="r-vacio">Todo en orden.</div>') + '</section>';
  }
  function htmlEntregas() {
    var es = est.entregas || [];
    return '<section class="r-panel ancho"><h2>Últimas entregas</h2><div class="r-tabla">' +
      (es.map(function (e) {
        var cls = e.estado === 'entregada' ? 'ok' : e.estado === 'fallida' ? 'mal' : 'medio';
        return '<div class="r-fila"><span class="r-chip ' + cls + '">' + esc(e.estado) + '</span><b>' + esc(e.evento) + (e.fase ? ' · ' + esc(e.fase) : '') + '</b>' +
          '<span class="r-gris">' + esc(e.destino) + ' · ' + e.intentos + (e.intentos === 1 ? ' intento' : ' intentos') + (e.ultimo_estado ? ' · HTTP ' + e.ultimo_estado : '') +
          (e.estado === 'pendiente' ? ' · reintento ' + hm(e.proximo_intento, true) : '') + (e.ultimo_error && e.estado !== 'entregada' ? ' · ' + esc(String(e.ultimo_error).slice(0, 60)) : '') +
          ' · ' + cuando(e.actualizado) + '</span></div>';
      }).join('') || '<div class="r-vacio">Aún no ha salido ningún webhook.</div>') + '</div></section>';
  }
  function htmlDestinos() {
    var ds = est.destinos || [];
    return '<section class="r-panel ancho"><h2>Destinos de webhook</h2>' +
      ds.map(function (d) {
        return '<div class="r-fila"><i class="r-punto ' + (d.activo ? 'ok' : 'mal') + '"></i><span><b>' + esc(d.nombre) + '</b><br><span class="r-gris r-url">' + esc(d.url) + '</span></span>' +
          '<span class="r-gris">' + (d.tiene_header ? 'Authorization ' + esc(d.pista || '••••') : d.secreto_env ? 'esperando ' + esc(d.secreto_env) : 'sin header') + '</span>' +
          '<span class="r-acciones"><button type="button" class="r-mini" data-a="probar" data-id="' + d.id + '">Probar webhook</button>' +
          '<button type="button" class="r-mini" data-a="destino-activo" data-id="' + d.id + '" data-v="' + (!d.activo) + '">' + (d.activo ? 'Pausar' : 'Activar') + '</button>' +
          '<button type="button" class="r-mini" data-a="destino-header" data-id="' + d.id + '">Cambiar header</button>' +
          '<button type="button" class="r-mini peligro" data-a="destino-borrar" data-id="' + d.id + '" data-n="' + esc(d.nombre) + '">✕</button></span></div>';
      }).join('') +
      '<div class="r-nuevo"><input id="d-nombre" placeholder="Nombre (p. ej. DJ Personal)"><input id="d-url" type="url" placeholder="https://… URL del webhook">' +
      '<input id="d-header" type="password" autocomplete="off" placeholder="Header Authorization (p. ej. Bearer …)"><button type="button" class="r-pri" data-a="destino-nuevo">Añadir destino</button></div>' +
      '<p class="r-nota">El header se guarda cifrado en Vault y aquí solo se ve enmascarado. Cada webhook lleva <code>Idempotency-Key</code> con su <code>id_evento</code>.</p></section>';
  }
  function htmlAgenda() {
    var ag = est.agenda || [];
    var filas = ag.map(function (a) {
      var dias = DIAS.map(function (l, i) { return '<i class="' + ((a.dias || []).indexOf(i + 1) >= 0 ? 'on' : '') + '">' + l + '</i>'; }).join('');
      return '<div class="r-fila"><i class="r-punto ' + (a.activo ? 'ok' : 'mal') + '"></i><b>' + String(a.hora_inicio).slice(0, 5) + '–' + String(a.hora_fin).slice(0, 5) + '</b>' +
        '<span>' + esc(nombreModo(a.modo)) + (a.nombre ? ' · ' + esc(a.nombre) : '') + '</span><span class="r-dias">' + dias + '</span>' +
        '<span class="r-acciones"><button type="button" class="r-mini" data-a="agenda-activo" data-id="' + a.id + '" data-v="' + (!a.activo) + '">' + (a.activo ? 'Pausar' : 'Activar') + '</button>' +
        '<button type="button" class="r-mini peligro" data-a="agenda-borrar" data-id="' + a.id + '">✕</button></span></div>';
    }).join('') || '<div class="r-vacio">Sin bloques. Ejemplo: mañana de 07:00 a 09:00.</div>';
    return '<section class="r-panel ancho"><h2>Agenda diaria <span>hora de Madrid</span></h2>' + filas +
      '<div class="r-nuevo"><select id="a-modo">' + MODOS.map(function (m) { return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join('') + '</select>' +
      '<input id="a-ini" type="time" value="07:00"><input id="a-fin" type="time" value="09:00"><input id="a-nombre" placeholder="Nombre (opcional)">' +
      '<span class="r-dias elegir">' + DIAS.map(function (l, i) { return '<label><input type="checkbox" class="a-dia" value="' + (i + 1) + '" checked>' + l + '</label>'; }).join('') + '</span>' +
      '<button type="button" class="r-pri" data-a="agenda-nueva">Añadir bloque</button></div></section>';
  }
  function htmlConfig() {
    var c = est.config || {};
    function campo(k, t) { return '<label>' + t + '<input type="number" min="0" step="any" data-k="' + k + '" value="' + esc(c[k]) + '"></label>'; }
    return '<section class="r-panel"><h2>Duraciones (min)</h2><div class="r-config">' +
      campo('pomodoro_min', 'Pomodoro') + campo('descanso_corto_min', 'Descanso corto') + campo('descanso_largo_min', 'Descanso largo') +
      campo('pomodoros_por_largo', 'Pomodoros por descanso largo') + campo('descanso_min', 'Modo descanso') + campo('entreno_min', 'Modo entreno') +
      campo('manana_min', 'Modo mañana') + campo('aviso_previo_min', 'Aviso previo') + '</div>' +
      '<button type="button" class="r-pri" data-a="config">Guardar</button></section>';
  }
  function htmlRegistro() {
    return '<section class="r-panel"><h2>Registro</h2><div class="r-registro">' + (est.eventos || []).map(function (e) {
      return '<div><span class="r-gris">' + hm(e.creado, true) + '</span> <b>' + esc(e.evento || e.tipo) + '</b> ' + esc(String(e.texto || '').slice(0, 140)) + '</div>';
    }).join('') + '</div></section>';
  }
  function pintar() {
    if (!usuario) { raiz.innerHTML = htmlLogin(); return; }
    var foco = document.activeElement && document.activeElement.id, valores = {};
    raiz.querySelectorAll('input[id],select[id]').forEach(function (x) { valores[x.id] = x.type === 'checkbox' ? x.checked : x.value; });
    if (!est) { raiz.innerHTML = htmlCabecera() + '<div class="r-vacio">' + (error ? 'No se pudo cargar: ' + esc(error) : 'Cargando…') + '</div>'; return; }
    raiz.innerHTML = htmlCabecera() + '<div class="r-aviso" id="r-aviso"></div>' + (error ? '<div class="r-error">' + esc(error) + '</div>' : '') +
      htmlEstado() + '<div class="r-rejilla">' + htmlAlertas() + htmlMac() + htmlEntregas() + htmlAgenda() + htmlDestinos() + htmlConfig() + htmlRegistro() + '</div>';
    Object.keys(valores).forEach(function (id) { var x = document.getElementById(id); if (x && x.type !== 'checkbox' && valores[id] !== '') x.value = valores[id]; });
    if (foco && document.getElementById(foco)) document.getElementById(foco).focus();
    pintarAviso(); reloj();
  }
  function pintarAviso() { var a = document.getElementById('r-aviso'); if (a) { a.textContent = aviso; a.style.display = aviso ? '' : 'none'; } }
  function reloj() {
    var h = document.getElementById('r-hora');
    if (h) h.innerHTML = 'MADRID <b>' + hm(new Date(ahora()).toISOString(), true) + '</b>';
    var c = document.getElementById('r-cuenta');
    if (c && est && est.siguiente) c.textContent = cuenta(est.siguiente.hora_madrid);
  }

  // ---------- eventos ----------
  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a'), id = b.getAttribute('data-id');
    if (a === 'entrar') return entrar();
    if (a === 'iniciar') {
      var min = +(($('#r-minutos') || {}).value || 0);
      if (est.sesion && !confirm('Hay un modo activo. ¿Pararlo (con aviso previo a los agentes) y empezar ' + nombreModo(b.getAttribute('data-m')) + '?')) return;
      return accion({ accion: 'iniciar', modo: b.getAttribute('data-m'), minutos: min > 0 ? min : null }, 'Modo iniciado ✓ · los agentes reciben modo_iniciado');
    }
    if (a === 'parar') return accion({ accion: 'parar', inmediato: false }, 'Aviso enviado · se para en ' + est.config.aviso_previo_min + ' min');
    if (a === 'parar-ya') return confirm('¿Parar ya? Los agentes reciben el aviso y la parada a la vez.') && accion({ accion: 'parar', inmediato: true }, 'Parado ✓');
    if (a === 'cerrar-alerta') return accion({ accion: 'alerta_cerrar', id: id });
    if (a === 'probar') return accion({ accion: 'destino_probar', id: id }, 'Prueba enviada · mira «Últimas entregas» en un minuto');
    if (a === 'destino-activo') return accion({ accion: 'destino_guardar', id: id, activo: b.getAttribute('data-v') === 'true' });
    if (a === 'destino-header') {
      var h = prompt('Nuevo header Authorization (p. ej. Bearer …). Se guarda cifrado; no se volverá a mostrar.');
      return h && accion({ accion: 'destino_guardar', id: id, header: h }, 'Header guardado ✓');
    }
    if (a === 'destino-borrar') return confirm('¿Borrar el destino «' + b.getAttribute('data-n') + '» y su header?') && accion({ accion: 'destino_borrar', id: id });
    if (a === 'destino-nuevo') {
      var u = ($('#d-url') || {}).value || '';
      if (!/^https:\/\//.test(u)) { aviso = 'La URL tiene que empezar por https://'; return pintarAviso(); }
      return accion({ accion: 'destino_guardar', nombre: $('#d-nombre').value || 'Destino', url: u, header: $('#d-header').value || null }, 'Destino añadido ✓')
        .then(function () { ['#d-nombre', '#d-url', '#d-header'].forEach(function (s) { var x = $(s); if (x) x.value = ''; }); });
    }
    if (a === 'agenda-nueva') {
      var dias = Array.prototype.slice.call(raiz.querySelectorAll('.a-dia:checked')).map(function (x) { return +x.value; });
      return accion({ accion: 'agenda_guardar', bloque: { modo: $('#a-modo').value, hora_inicio: $('#a-ini').value, hora_fin: $('#a-fin').value, nombre: $('#a-nombre').value, dias: dias } }, 'Bloque añadido ✓');
    }
    if (a === 'agenda-activo') return accion({ accion: 'agenda_guardar', bloque: { id: id, activo: b.getAttribute('data-v') === 'true' } });
    if (a === 'agenda-borrar') return confirm('¿Borrar este bloque de la agenda?') && accion({ accion: 'agenda_borrar', id: id });
    if (a === 'config') {
      var cfg = {}; raiz.querySelectorAll('.r-config input').forEach(function (x) { cfg[x.getAttribute('data-k')] = +x.value; });
      return accion({ accion: 'config', config: cfg }, 'Guardado ✓ (se aplica a las fases nuevas)');
    }
    if (a === 'token') {
      if (est.latidos.length && !confirm('El token anterior dejará de valer. ¿Crear uno nuevo?')) return;
      return accion({ accion: 'dispositivo_crear', nombre: 'Mac de Diego' }, 'Token creado').then(function (d) { if (d && d.token) { tokenNuevo = d.token; pintar(); } });
    }
    if (a === 'copiar-token') { try { navigator.clipboard.writeText('security add-generic-password -U -a latido -s mi-semana-latido -w ' + tokenNuevo); aviso = 'Copiado ✓'; } catch (e) { aviso = 'Cópialo a mano'; } return pintarAviso(); }
    if (a === 'ocultar-token') { tokenNuevo = ''; return pintar(); }
  });
  raiz.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && /r-clave|r-correo/.test(ev.target.id)) entrar(); });
  function leer(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function entrar() {
    var c = ($('#r-correo') || {}).value, p = ($('#r-clave') || {}).value;
    if (!c || !p) { error = 'Escribe correo y contraseña'; return pintar(); }
    sb.auth.signInWithPassword({ email: c.trim(), password: p }).then(function (r) { if (r.error) { error = 'No se pudo entrar: revisa correo y contraseña'; pintar(); } });
  }

  // ---------- arranque ----------
  try { sb = window.supabase.createClient(URL_NUBE, CLAVE); } catch (e) { raiz.innerHTML = '<div class="r-vacio">No se pudo cargar Supabase. Revisa internet y recarga.</div>'; return; }
  sb.auth.onAuthStateChange(function (ev, s) {
    var u = s && s.user;
    setTimeout(function () { var antes = usuario && usuario.id; usuario = u || null; if (usuario && usuario.id !== antes) { est = null; cargar(); } pintar(); }, 0);
  });
  setInterval(reloj, 1000);
  setInterval(cargar, 10000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') cargar(); });
  pintar();
})();
