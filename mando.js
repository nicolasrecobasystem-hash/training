/* Mando de la tableta: muestra lo que pasa en la pantalla grande y le manda órdenes.
   Usa la misma cuenta de Supabase y un canal Realtime ("mando-<tu id>"), sin tablas.
   La pantalla grande es la que cuenta el tiempo, pone la música y guarda el historial. */
(function () {
  'use strict';
  var URL_NUBE = 'https://idjlewvzuzqywthrwibv.supabase.co';
  var CLAVE = 'sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt';   // clave pública (publishable)
  var raiz = document.getElementById('mando');
  var sb = null, usuario = null, canal = null, listo = false;
  var estado = null, llegoEn = 0, vistaActual = '', dibujoActual = null, errorLogin = '';
  // Pantallas grandes abiertas con tu cuenta: { id: { e: estado, t: cuándo llegó } }. El mando sigue a UNA.
  var pantallas = {}, objetivo = null, elegidaAMano = false;
  function vivas() { var ahora = Date.now(); return Object.keys(pantallas).filter(function (k) { return ahora - pantallas[k].t < 12000; }); }
  function elegirPantalla() {
    var vs = vivas();
    if (objetivo && vs.indexOf(objetivo) < 0) { objetivo = null; elegidaAMano = false; }
    if (elegidaAMano) return;
    // La mejor: la que está a la vista y que tocaste por última vez. Solo se cambia si otra es
    // claramente mejor (así no salta de una a otra mientras miras).
    function nota(k) { var e = pantallas[k].e; return [(e.visible !== false) ? 1 : 0, e.toque || 0]; }
    function mejor(a, b) { var A = nota(a), B = nota(b); return A[0] !== B[0] ? A[0] > B[0] : A[1] > B[1]; }
    vs.forEach(function (k) { if (!objetivo || mejor(k, objetivo)) objetivo = k; });
  }

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return raiz.querySelector(s); }
  function hora(z) { try { return new Date().toLocaleTimeString('es-ES', { timeZone: z, hour: '2-digit', minute: '2-digit' }); } catch (e) { return '--:--'; } }
  function conectado() { elegirPantalla(); if (objetivo) { estado = pantallas[objetivo].e; llegoEn = pantallas[objetivo].t; } return listo && !!objetivo; }

  // ---------- barra de arriba (siempre) ----------
  function htmlTop() {
    return '<div class="m-top"><div class="m-relojes"></div><div class="m-con"><i></i><span></span></div></div>';
  }
  function pintarTop() {
    var r = $('.m-relojes'), c = $('.m-con');
    if (r) r.innerHTML = 'MIAMI <b>' + hora('America/New_York') + '</b><span class="sep">·</span>MADRID <b>' + hora('Europe/Madrid') + '</b>';
    if (c) {
      var on = conectado();
      c.className = 'm-con ' + (on ? 'on' : (usuario ? 'off' : ''));
      var n = vivas().length;
      c.querySelector('span').textContent = on ? (n > 1 ? (estado.equipo || 'PANTALLA').toUpperCase() + ' · ' + n + ' ABIERTAS ⇄' : 'PANTALLA') : (usuario ? 'SIN PANTALLA' : '');
      c.setAttribute('data-a', n > 1 ? 'cambiar-pantalla' : '');
    }
  }

  // ---------- órdenes ----------
  function mandar(accion, extra) {
    if (!canal || !listo) return;
    var p = { accion: accion, para: objetivo };
    if (extra) for (var k in extra) p[k] = extra[k];
    canal.send({ type: 'broadcast', event: 'cmd', payload: p });
    pedirPantallaEncendida();
  }

  // Que la tableta no se apague mientras entrenas (si el navegador lo permite)
  var bloqueo = null;
  function pedirPantallaEncendida() {
    try { if (!bloqueo && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { bloqueo = l; l.addEventListener('release', function () { bloqueo = null; }); }).catch(function () {}); } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { bloqueo = null; pedirPantallaEncendida(); saludar(); } });

  // ---------- pantallas ----------
  function htmlLogin() {
    return htmlTop() + '<div class="m-centro"><div class="m-ante">MANDO · MI SEMANA</div><h1 class="m-tit">Entra con tu cuenta</h1>' +
      '<p class="m-txt">La misma que usas en la pantalla grande.</p>' +
      '<div class="m-form"><input id="m-correo" type="email" autocomplete="username" placeholder="Correo" value="' + esc(leer('miSemana.correo')) + '">' +
      '<input id="m-clave" type="password" autocomplete="current-password" placeholder="Contraseña">' +
      '<div class="m-error">' + esc(errorLogin) + '</div>' +
      '<button type="button" class="m-pri" data-a="entrar">Entrar</button></div></div>';
  }
  function htmlEspera() {
    return htmlTop() + '<div class="m-centro"><div class="m-ante">MANDO · MI SEMANA</div><h1 class="m-tit">Buscando la pantalla grande…</h1>' +
      '<p class="m-txt">Abre la app en la pantalla grande con la misma cuenta. En cuanto aparezca, aquí verás el ejercicio.</p>' +
      '<button type="button" class="m-salir" data-a="salir">Salir de la cuenta</button></div>';
  }
  function htmlSemana(e) {
    var hoy = new Date().getDay();
    var dias = DIAS.map(function (d, i) {
      return '<button type="button" class="m-dia' + (d.nombre === e.dia ? ' on' : '') + (i === hoy ? ' hoy' : '') + '" data-a="dia" data-i="' + i + '"><b>' + esc(d.letra || d.nombre[0]) + '</b><span>' + esc(d.grupo) + '</span></button>';
    }).join('');
    return htmlTop() + '<div class="m-centro"><div class="m-ante">' + esc(e.dia) + '</div><h1 class="m-tit">' + esc(e.grupo) + '</h1>' +
      '<div class="m-dias">' + dias + '</div>' +
      '<button type="button" class="m-start" data-a="start">START</button>' +
      (e.pantalla !== 'semana' ? '<p class="m-txt">La pantalla grande está en ' + (e.pantalla === 'config' ? 'Configuración' : 'el Calendario') + '. Con START empiezas igual.</p>' : '') +
      '</div>';
  }
  function htmlMood(e) {
    var bs = e.moods.map(function (m, i) {
      return '<button type="button" class="m-mood' + (e.ultimoMood === m.n ? ' ultimo' : '') + '" data-a="mood" data-i="' + i + '"><b>' + esc(m.n) + '</b><span>' + m.c + (m.c === 1 ? ' canción' : ' canciones') + '</span></button>';
    }).join('');
    bs += '<button type="button" class="m-mood' + (e.ultimoMood === '' ? ' ultimo' : '') + '" data-a="mood" data-i="-1"><b>Ninguno</b><span>todas mezcladas</span></button>';
    return htmlTop() + '<div class="m-centro"><div class="m-ante">' + esc(e.dia + ' · ' + e.grupo) + '</div><h1 class="m-tit">¿Con qué mood entrenas?</h1>' +
      '<div class="m-moods">' + bs + '</div><button type="button" class="m-salir" data-a="cancelar-mood">Cancelar</button></div>';
  }
  // Pantalla del ejercicio en el mando. Dos modos, igual que la pantalla grande:
  //  APRENDER (parado, oscuro): nombre, datos, dibujo pequeño y botón INICIAR morado.
  //  ENTRENAR (del color de la fase = color de las luces): tiempo gigante y un botón enorme.
  var eligiendoMood = false;
  function htmlCalent() {
    return htmlTop() +
      '<div class="m-cab"><div class="m-ante"></div><h1 class="m-nombre"></h1></div>' +
      '<div class="m-apr"><div class="m-chips"></div><div class="m-dibujo"></div><div class="m-fases"></div></div>' +
      '<div class="m-ent"><div class="m-ent-top"><div class="m-fase"></div><button type="button" class="m-parar" data-a="reiniciar">✕ Parar</button></div>' +
      '<div class="m-tiempo"></div><div class="m-ent-pie"><div class="m-puntos"></div><div class="m-serie"></div></div></div>' +
      '<button type="button" class="m-pri" data-a="principal"></button>' +
      '<div class="m-fila"><button type="button" class="m-sec ant" data-a="ant">← Anterior</button>' +
      '<button type="button" class="m-sec sig" data-a="sig"></button></div>' +
      '<div class="m-musica"><button type="button" class="m-cancion" data-a="cancion" aria-label="Cambiar de canción"></button>' +
      '<button type="button" class="m-moodchip" data-a="abrir-moods" aria-label="Cambiar el mood"></button></div>' +
      '<div class="m-velo" hidden></div>';
  }
  function textoFase(t) {
    return { espera: t.serie > 1 ? 'SIGUIENTE SERIE' : 'LISTO', prep: 'PREPÁRATE', trabajo: t.reps ? 'HAZ LAS REPS' : '¡AGUANTA!', descanso: 'DESCANSO', hecho: '¡COMPLETADO!' }[t.fase] || '';
  }
  function htmlMoodsMando(e) {
    var bs = (e.moods || []).map(function (m, i) {
      return '<button type="button" class="m-mood' + (e.mood === m.n ? ' ultimo' : '') + '" data-a="mood-cambiar" data-i="' + i + '"><b>' + esc(m.n) + '</b><span>' + m.c + (m.c === 1 ? ' canción' : ' canciones') + (e.mood === m.n ? ' · ahora' : '') + '</span></button>';
    }).join('') + '<button type="button" class="m-mood' + (!e.mood ? ' ultimo' : '') + '" data-a="mood-cambiar" data-i="-1"><b>Todas</b><span>mezcladas</span></button>';
    return '<div class="m-hoja"><div class="m-ante">CAMBIAR LA MÚSICA</div><h2 class="m-tit">¿Qué mood?</h2><div class="m-moods">' + bs + '</div>' +
      '<button type="button" class="m-salir" data-a="cerrar-moods">Cancelar</button></div>';
  }
  function actualizarCalent(e) {
    var ex = e.ej, t = e.temp, m = e.musica || {};
    var ent = e.modo === 'entrenar';
    raiz.className = ent ? 'modo-ent f-' + (e.color || 'blanco') : 'modo-apr';
    $('.m-ante').textContent = (e.bloque.titulo + ' · ' + (e.hueco + 1) + ' de ' + e.nHuecos).toUpperCase();
    $('.m-nombre').textContent = ex ? ex.nombre : '[Por definir]';
    if (!ent) {
      $('.m-chips').innerHTML = ex ? '<span class="c">' + esc(ex.dosis) + '</span>' + (t ? '<span>desc. ' + t.descanso + ' s</span>' : '') + (ex.ancla ? '<span>' + esc(ex.ancla) + '</span>' : '') + (ex.hecho ? '<span class="ok">✓ hecho</span>' : '') : '';
      var clave = ex ? ex.nombre + '|' + ex.dibujo : '';
      if (clave !== dibujoActual) {
        dibujoActual = clave;
        var svg = ex && ex.dibujo && typeof DIBUJOS !== 'undefined' ? DIBUJOS[ex.dibujo] : '';
        $('.m-dibujo').innerHTML = svg || '<div class="m-vacio">[Dibujo del ejercicio]</div>';
      }
      var trab = t ? (t.reps ? (parseInt(t.reps, 10) || 10) * 3 : t.quedan) : 20;
      $('.m-fases').innerHTML = t ? '<i class="morado" style="flex:5"></i><i class="rojo" style="flex:' + trab + '"></i><i class="azul" style="flex:' + t.descanso + '"></i><i class="blanco" style="flex:5"></i>' : '';
    } else if (t) {
      $('.m-fase').textContent = textoFase(t) + (t.pausado ? ' · PAUSA' : '');
      var q = Math.max(0, t.quedan | 0);
      var txt = Math.floor(q / 60) + ':' + (q % 60 < 10 ? '0' : '') + (q % 60);
      if (t.reps && (t.fase === 'espera' || t.fase === 'trabajo')) txt = esc(String(t.reps)) + '<small>REPS</small>';
      if (t.fase === 'hecho') txt = '✓';
      $('.m-tiempo').innerHTML = txt;
      var hechas = t.fase === 'hecho' ? t.series : (t.fase === 'descanso' ? t.serie : t.serie - 1);
      $('.m-puntos').innerHTML = Array.apply(null, Array(t.series)).map(function (_, i) { return '<i class="' + (i < hechas ? 'on' : '') + '"></i>'; }).join('');
      $('.m-serie').textContent = ('Serie ' + Math.min(t.serie, t.series) + ' / ' + t.series + (t.lado ? ' · ' + t.lado : '')).toUpperCase();
    }
    var pri = $('.m-pri');
    pri.textContent = t ? t.etiqueta : 'Sin temporizador'; pri.disabled = !t;
    $('.m-sec.ant').disabled = e.bloque.i === 0 && e.hueco === 0;
    var sig = $('.m-sec.sig');
    if (e.ultimo) { sig.setAttribute('data-a', 'terminar'); sig.className = 'm-sec sig fin'; sig.innerHTML = 'Terminar ✓'; }
    else { sig.setAttribute('data-a', 'sig'); sig.className = 'm-sec sig'; sig.innerHTML = 'Siguiente →<small>' + esc(e.siguiente) + '</small>'; }
    $('.m-cancion').innerHTML = m.sonando ? '<span class="nota">♪</span><b>' + esc(m.nombre) + '</b><small>toca para cambiar</small>' : (m.hay ? '<span class="nota">♪</span><b>Poner música</b><small>toca para empezar</small>' : '<span class="nota">♪</span><b>Sin canciones</b><small>cambia el mood →</small>');
    $('.m-moodchip').textContent = (e.mood || 'Todas') + ' ▾';
    var velo = $('.m-velo');
    if (eligiendoMood) { if (velo.hidden) { velo.hidden = false; velo.innerHTML = htmlMoodsMando(e); } }
    else if (!velo.hidden) { velo.hidden = true; velo.innerHTML = ''; }
  }

  function pintar() {
    var on = !!usuario && conectado(), v, e = estado;
    if (!usuario) v = 'login';
    else if (!on) v = 'espera';
    else if (e.pidiendoMood) v = 'mood';
    else if (e.pantalla === 'calent') v = 'calent';
    else v = 'semana';
    var firma = v === 'semana' ? v + e.dia + e.pantalla : v === 'mood' ? v + e.ultimoMood + e.moods.length : v;
    if (firma !== vistaActual) {
      vistaActual = firma; dibujoActual = null;
      raiz.innerHTML = v === 'login' ? htmlLogin() : v === 'espera' ? htmlEspera() : v === 'mood' ? htmlMood(e) : v === 'calent' ? htmlCalent() : htmlSemana(e);
    }
    if (v === 'calent') actualizarCalent(e); else { raiz.className = ''; eligiendoMood = false; }
    pintarTop();
  }

  // ---------- eventos ----------
  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-a]');
    if (!b || b.disabled) return;
    var a = b.getAttribute('data-a');
    if (!a) return;
    if (a === 'entrar') entrar();
    else if (a === 'cambiar-pantalla') {   // pasa a la siguiente pantalla abierta
      var vs = vivas(); if (vs.length < 2) return;
      objetivo = vs[(vs.indexOf(objetivo) + 1) % vs.length]; elegidaAMano = true; vistaActual = ''; pintar();
    }
    else if (a === 'salir') { if (sb) sb.auth.signOut(); }
    else if (a === 'dia') mandar('dia', { i: +b.getAttribute('data-i') });
    else if (a === 'start') { var i = DIAS.map(function (d) { return d.nombre; }).indexOf(estado.dia); mandar('start', { dia: i }); }
    else if (a === 'mood') mandar('mood', { i: +b.getAttribute('data-i') });
    else if (a === 'abrir-moods') { eligiendoMood = true; pintar(); }
    else if (a === 'cerrar-moods') { eligiendoMood = false; pintar(); }
    else if (a === 'mood-cambiar') { eligiendoMood = false; mandar('mood-cambiar', { i: +b.getAttribute('data-i') }); pintar(); }
    else mandar(a);
  });
  raiz.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && (ev.target.id === 'm-clave' || ev.target.id === 'm-correo')) entrar(); });

  function leer(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function entrar() {
    var c = ($('#m-correo') || {}).value, p = ($('#m-clave') || {}).value;
    if (!c || !p) { errorLogin = 'Escribe correo y contraseña'; vistaActual = ''; pintar(); return; }
    try { localStorage.setItem('miSemana.correo', c.trim()); } catch (e) {}
    sb.auth.signInWithPassword({ email: c.trim(), password: p }).then(function (r) {
      if (r.error) { errorLogin = 'No se pudo entrar: revisa correo y contraseña'; vistaActual = ''; pintar(); }
    });
  }

  function saludar() { if (canal && listo) canal.send({ type: 'broadcast', event: 'hola', payload: { t: Date.now() } }); }
  function conectarCanal() {
    if (canal) return;
    canal = sb.channel('mando-' + usuario.id, { config: { broadcast: { self: false } } });
    canal.on('broadcast', { event: 'estado' }, function (m) {
      var e = m.payload || {}, id = e.id || 'antigua';
      pantallas[id] = { e: e, t: Date.now() };
      var antes = objetivo; elegirPantalla();
      if (id === objetivo || antes !== objetivo) pintar();   // las otras pantallas no repintan: nada de parpadeos
    })
      .subscribe(function (s) { listo = s === 'SUBSCRIBED'; if (listo) saludar(); pintar(); });
  }
  function desconectar() { if (canal) { try { sb.removeChannel(canal); } catch (e) {} } canal = null; listo = false; estado = null; pantallas = {}; objetivo = null; }

  // ---------- arranque ----------
  pintar();
  setInterval(function () { pintar(); }, 1000);   // relojes y aviso de conexión
  setInterval(saludar, 10000);                    // "sigo aquí" para la pantalla grande
  try { sb = window.supabase.createClient(URL_NUBE, CLAVE); } catch (e) { raiz.innerHTML = htmlTop() + '<div class="m-centro"><h1 class="m-tit">Sin conexión</h1><p class="m-txt">No se pudo cargar la nube. Revisa internet y recarga.</p></div>'; return; }
  sb.auth.onAuthStateChange(function (ev, sesion) {
    var u = sesion && sesion.user;
    setTimeout(function () {
      if (u && (!usuario || usuario.id !== u.id)) { usuario = u; errorLogin = ''; desconectar(); conectarCanal(); }
      else if (!u) { usuario = null; desconectar(); }
      vistaActual = ''; pintar();
    }, 0);
  });
})();
