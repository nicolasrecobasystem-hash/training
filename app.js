(function () {
  'use strict';

  var app = document.getElementById('app');
  var vista = document.getElementById('vista');   // lo que se repinta en cada pantalla
  var hoy = new Date().getDay();

  var st = {
    pantalla: 'semana', sel: hoy, hueco: 0, cfgSel: 0, cfgMood: 0, mood: null, pidiendoMood: false,
    fase: 'espera', corriendo: false, pausado: false,
    serie: 1, dur: 20, quedan: 20, total: 20
  };

  var iv = null, finEn = 0, ultimoSeg = 0, restanteMs = 0, audio = null;

  // ---------- utilidades ----------
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lista() { return CALENTAMIENTOS[DIAS[st.sel].grupo] || []; }
  function ejActual() { return lista()[st.hueco]; }
  function cfg() { var e = ejActual(); return e && e.temporizador ? e.temporizador : null; }
  // ---------- música y moods ----------
  // Moods: lista personalizable desde Configuración.
  // Enlaces: por ejercicio y por mood, guardados en este navegador.
  // Si un ejercicio no se ha tocado en Configuración, se usan los de datos.js (campo musica).
  var LS_MUSICA = 'miSemana.musica.v2', LS_MOODS = 'miSemana.moods.v1';
  function leerLS(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function escribirLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esEnlace(x) { return /^https?:\/\/\S+$/i.test(x); }
  // Un archivo subido a Supabase se guarda como "sb:<ruta en el almacén>|<nombre para mostrar>"
  function esArchivo(x) { return /^sb:[^|]+\|.+$/.test(x); }
  function rutaArchivo(x) { return x.slice(3, x.indexOf('|')); }
  function nombreArchivo(x) { return x.slice(x.indexOf('|') + 1); }
  function limpiar(ls) {
    return (Array.isArray(ls) ? ls : [ls]).map(function (x) { return String(x || '').trim(); })
      .filter(function (x) { return esEnlace(x) || esArchivo(x); });
  }
  // Normaliza a { mood: [enlaces] }. Una lista suelta (sin moods) va al mood "General".
  function porMood(m) {
    var o = {};
    if (!m) return o;
    if (typeof m === 'string' || Array.isArray(m)) { var l = limpiar(m); if (l.length) o.General = l; return o; }
    Object.keys(m).forEach(function (k) { var l2 = limpiar(m[k]); if (l2.length) o[k] = l2; });
    return o;
  }
  var moods = leerLS(LS_MOODS, null);
  if (!Array.isArray(moods)) moods = ['Energía', 'Tranquilo', 'Motivación'];
  var musicaGuardada = leerLS(LS_MUSICA, null);
  if (!musicaGuardada || typeof musicaGuardada !== 'object') {
    // Recupera lo guardado con la versión anterior (sin moods) dentro de "General"
    var viejo = leerLS('miSemana.musica.v1', {});
    musicaGuardada = {};
    Object.keys(viejo || {}).forEach(function (k) { var l = limpiar(viejo[k]); if (l.length) musicaGuardada[k] = { General: l }; });
  }
  function asegurarMoods(o) { Object.keys(o).forEach(function (m) { if (moods.indexOf(m) < 0) moods.push(m); }); }
  // Último mood elegido ('' = Ninguno, null = nunca elegido): sale marcado al pulsar START
  var LS_ULTIMO = 'miSemana.ultimoMood.v1';
  var ultimoMood = leerLS(LS_ULTIMO, null);
  function guardarTodo() {
    var a = escribirLS(LS_MUSICA, musicaGuardada), b = escribirLS(LS_MOODS, moods);
    subirNube();   // y a la nube, si hay sesión
    return a && b;
  }
  // { mood: [enlaces] } de un ejercicio
  function musicaDe(e, grupo) {
    if (!e) return {};
    var k = grupo + '|' + e.nombre;
    return Object.prototype.hasOwnProperty.call(musicaGuardada, k) ? porMood(musicaGuardada[k]) : porMood(e.musica);
  }
  // Enlaces de un ejercicio para un mood (null = "Ninguno": todos mezclados)
  function enlacesMusica(e, grupo, mood) {
    var o = musicaDe(e, grupo);
    if (mood) return o[mood] || [];
    var todos = [];
    Object.keys(o).forEach(function (m) { o[m].forEach(function (u) { if (todos.indexOf(u) < 0) todos.push(u); }); });
    return todos;
  }
  // Abre uno al azar (sin repetir el último si hay más de uno) en una ventanita aparte
  var ultimaMusica = '';
  function abrirMusica(ls) {
    ls = ls.filter(esEnlace);   // la ventanita solo sirve para YouTube
    if (!ls.length) return;
    var opciones = ls.length > 1 ? ls.filter(function (x) { return x !== ultimaMusica; }) : ls;
    ultimaMusica = opciones[Math.floor(Math.random() * opciones.length)];
    window.open(ultimaMusica, 'musica', 'width=520,height=380');
    try { window.focus(); } catch (e) {}
  }
  // Al pulsar Iniciar por primera vez en un ejercicio, arranca una canción de su mood.
  // No se repite en las series siguientes; con "♪ Otra canción" cambias cuando quieras.
  var musicaSonandoDe = '';
  function arrancarMusica(forzar) {
    var ex = ejActual(), g = DIAS[st.sel].grupo;
    if (!ex) return;
    var k = g + '|' + ex.nombre;
    if (!forzar && musicaSonandoDe === k) return;
    var ls = enlacesMusica(ex, g, st.mood);
    if (!ls.length) return;
    reproducir(ls, '♪ ' + (st.mood || 'Mezcla') + ' · ' + ex.nombre);
    musicaSonandoDe = k;
    var bm = document.querySelector('[data-acc="musica"]');
    if (bm) bm.textContent = '♪ Otra canción';
  }
  // Todos los ejercicios cargados, para la pantalla de Configuración
  function todosLosEjercicios() {
    var out = [];
    Object.keys(CALENTAMIENTOS).forEach(function (g) {
      (CALENTAMIENTOS[g] || []).forEach(function (e) {
        out.push({ grupo: g, bloque: 'Calentamiento', ej: e, clave: g + '|' + e.nombre });
      });
    });
    return out;
  }
  todosLosEjercicios().forEach(function (x) { asegurarMoods(musicaDe(x.ej, x.grupo)); });
  function esReps() { var c = cfg(); return !!(c && c.reps); }

  // ---------- reproductor de YouTube embebido ----------
  // Funciona con la web publicada (http/https). Abierta con doble clic (file://)
  // YouTube bloquea el reproductor (error 153), así que entonces se usa la ventanita aparte.
  var EMBEBIDO = location.protocol === 'http:' || location.protocol === 'https:';
  var rep = { lista: [], actual: '', etiqueta: '', player: null, visible: false, mini: true, esLista: false, pendiente: null };
  var cajaRep = document.getElementById('reproductor');
  cajaRep.innerHTML =
    '<div class="rep-cab"><span id="rep-tit" class="rep-tit">♪</span>' +
    '<button type="button" data-acc="rep-otra" aria-label="Otra canción">⏭ Otra</button>' +
    '<button type="button" id="rep-mini" data-acc="rep-mini" aria-label="Cambiar el tamaño del vídeo">–</button>' +
    '<button type="button" data-acc="rep-cerrar" aria-label="Parar la música y cerrar">✕</button></div>' +
    '<div class="rep-video"><div id="yt-player"></div></div>' +
    '<div class="rep-audio" hidden><div id="rep-cancion" class="rep-cancion"></div><audio id="rep-audio-el" controls preload="none"></audio></div>' +
    '<div id="rep-aviso" class="rep-aviso" hidden></div>';

  // Saca el vídeo y/o la lista de reproducción de cualquier enlace de YouTube
  function datosYouTube(u) {
    try {
      var x = new URL(u), h = x.hostname.replace(/^(www|m|music)\./, ''), p = x.pathname.split('/').filter(Boolean);
      var id = null, list = x.searchParams.get('list');
      if (h === 'youtu.be') id = p[0];
      else if (/^youtube(-nocookie)?\.com$/.test(h)) {
        if (p[0] === 'watch') id = x.searchParams.get('v');
        else if (['shorts', 'embed', 'live', 'v'].indexOf(p[0]) >= 0) id = p[1];
      }
      return id || list ? { id: id, list: list } : null;
    } catch (e) { return null; }
  }
  function cargarApi(cb) {
    if (window.YT && window.YT.Player) { cb(); return; }
    rep.pendiente = cb;
    if (document.getElementById('yt-api')) return;
    window.onYouTubeIframeAPIReady = function () { var f = rep.pendiente; rep.pendiente = null; if (f) f(); };
    var sc = document.createElement('script');
    sc.id = 'yt-api'; sc.src = 'https://www.youtube.com/iframe_api';
    sc.onerror = function () { avisoRep('No se pudo cargar YouTube. ¿Hay conexión a internet?'); };
    document.head.appendChild(sc);
  }
  function avisoRep(msg, url) {
    var a = document.getElementById('rep-aviso');
    if (!a) return;
    a.hidden = !msg;
    a.innerHTML = msg ? esc(msg) + (url ? ' <a href="' + esc(url) + '" target="_blank" rel="noopener">Abrir en YouTube</a>' : '') : '';
  }
  function pintarRep() {
    cajaRep.hidden = !rep.visible;
    cajaRep.className = (rep.mini ? 'mini' : '') + (rep.modo === 'audio' ? ' audio' : '');
    cajaRep.querySelector('.rep-video').hidden = rep.modo === 'audio';
    cajaRep.querySelector('.rep-audio').hidden = rep.modo !== 'audio';
    document.getElementById('rep-tit').textContent = rep.etiqueta;
    document.getElementById('rep-mini').textContent = rep.mini ? '▢' : '–';
  }
  // Audio de tus archivos (Supabase Storage, privado): se pide un enlace temporal firmado
  var audioEl = document.getElementById('rep-audio-el');
  audioEl.addEventListener('ended', function () { if (rep.visible && rep.modo === 'audio') reproducir(rep.lista, rep.etiqueta); });
  audioEl.addEventListener('error', function () { if (rep.modo === 'audio' && audioEl.src) avisoRep('No se pudo reproducir este archivo.'); });
  function pararVideo() { try { if (rep.player && rep.player.pauseVideo) rep.player.pauseVideo(); } catch (e) {} }
  function pararAudio() { try { audioEl.pause(); } catch (e) {} }
  function reproducirArchivo(item) {
    rep.modo = 'audio'; pararVideo(); pintarRep();
    document.getElementById('rep-cancion').textContent = '♫ ' + nombreArchivo(item);
    if (!nube.sb || !nube.usuario) { avisoRep('Entra con tu correo en Configuración para oír tus archivos.'); return; }
    nube.sb.storage.from('musica').createSignedUrl(rutaArchivo(item), 3 * 3600).then(function (r) {
      if (r.error || !r.data) { avisoRep('No se encontró el archivo en la nube.'); return; }
      if (rep.actual !== item) return;   // mientras tanto se pidió otra canción
      audioEl.src = r.data.signedUrl;
      var pr = audioEl.play();
      if (pr && pr.catch) pr.catch(function () { avisoRep('Pulsa ▶ para empezar la música.'); });
    });
  }
  function reproducir(ls, etiqueta) {
    if (!ls || !ls.length) return;
    if (!EMBEBIDO) { abrirMusica(ls); return; }
    // Sin sesión no se pueden oír los archivos: se usan solo los enlaces de YouTube
    var disponibles = nube.usuario ? ls : ls.filter(esEnlace);
    if (!disponibles.length) disponibles = ls;
    rep.lista = ls; rep.etiqueta = etiqueta || '♪';
    var opciones = disponibles.length > 1 ? disponibles.filter(function (x) { return x !== rep.actual; }) : disponibles;
    var u = opciones[Math.floor(Math.random() * opciones.length)];
    rep.actual = u; rep.visible = true;
    avisoRep(''); pintarRep();
    if (esArchivo(u)) { reproducirArchivo(u); return; }
    pararAudio(); rep.modo = 'video'; pintarRep();
    var d = datosYouTube(u);
    if (!d) { avisoRep('Este enlace no parece de YouTube.', u); return; }
    rep.esLista = !!d.list;   // las listas de reproducción siguen solas
    cargarApi(function () {
      if (!rep.player) {
        var pv = { autoplay: 1, playsinline: 1, rel: 0 };
        if (d.list) { pv.listType = 'playlist'; pv.list = d.list; }
        rep.player = new YT.Player('yt-player', {
          width: '100%', height: '100%', videoId: d.id || undefined, playerVars: pv,
          events: {
            onReady: function (e) { try { e.target.playVideo(); } catch (x) {} },
            // Al acabar una canción suelta, pone otra al azar de la misma lista
            onStateChange: function (e) { if (e.data === 0 && !rep.esLista && rep.visible) reproducir(rep.lista, rep.etiqueta); },
            onError: function () { avisoRep('Este vídeo no se deja reproducir fuera de YouTube.', rep.actual); }
          }
        });
      } else if (d.list) {
        rep.player.loadPlaylist({ list: d.list, listType: 'playlist' });
      } else {
        rep.player.loadVideoById(d.id);
      }
    });
  }
  function cerrarRep() {
    try { if (rep.player && rep.player.stopVideo) rep.player.stopVideo(); } catch (e) {}
    pararAudio();
    rep.visible = false; pintarRep();
  }

  // ---------- nube (Supabase): moods, música y último mood en todos tus dispositivos ----------
  // Solo en la web publicada. Entras una vez por navegador con un enlace a tu correo.
  // Al entrar, manda lo que haya en la nube; si la nube está vacía, sube lo de este navegador.
  var NUBE_URL = 'https://idjlewvzuzqywthrwibv.supabase.co';
  var NUBE_CLAVE = 'sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt';   // clave pública (publishable)
  var nube = { sb: null, usuario: null, estado: 'apagada', msg: '', pendiente: false, reloj: null };
  function datosParaNube() { return { moods: moods, musica: musicaGuardada, ultimoMood: ultimoMood }; }
  function aplicarDeNube(d) {
    if (!d || typeof d !== 'object') return;
    if (Array.isArray(d.moods)) moods = d.moods.filter(function (m) { return typeof m === 'string' && m.trim(); });
    if (d.musica && typeof d.musica === 'object' && !Array.isArray(d.musica)) musicaGuardada = d.musica;
    if (d.ultimoMood === null || typeof d.ultimoMood === 'string') ultimoMood = d.ultimoMood;
    escribirLS(LS_MUSICA, musicaGuardada); escribirLS(LS_MOODS, moods); escribirLS(LS_ULTIMO, ultimoMood);
    var a = document.activeElement;
    var escribiendo = a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT');
    if (!escribiendo && st.pantalla !== 'calent') pintar();
  }
  function estadoNube(e, msg) { nube.estado = e; nube.msg = msg || ''; pintarNube(); }
  function iniciarNube() {
    if (!EMBEBIDO) { estadoNube('local'); return; }
    estadoNube('conectando');
    var sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    sc.onload = function () {
      try { nube.sb = window.supabase.createClient(NUBE_URL, NUBE_CLAVE); }
      catch (e) { estadoNube('error', 'No se pudo conectar con la nube'); return; }
      nube.sb.auth.onAuthStateChange(function (ev, sesion) {
        var u = sesion && sesion.user;
        setTimeout(function () {   // fuera del aviso de Supabase, como recomienda su documentación
          if (u && (!nube.usuario || nube.usuario.id !== u.id)) { nube.usuario = u; if (st.pantalla === 'config') pintar(); bajarNube(); }
          else if (!u) { nube.usuario = null; if (nube.estado !== 'enviado') estadoNube('fuera'); }
        }, 0);
      });
    };
    sc.onerror = function () { estadoNube('error', 'Sin conexión con la nube: se usa lo guardado en este navegador'); };
    document.head.appendChild(sc);
  }
  function bajarNube() {
    if (!nube.sb || !nube.usuario) return;
    estadoNube('sincronizando');
    nube.sb.from('ajustes_entreno').select('datos').eq('user_id', nube.usuario.id).maybeSingle().then(function (r) {
      if (r.error) {
        estadoNube('error', r.error.code === 'PGRST205' ? 'falta crear la tabla en Supabase (script SQL)' : 'no se pudo leer la nube');
        return;
      }
      if (r.data && r.data.datos && Object.keys(r.data.datos).length) { aplicarDeNube(r.data.datos); estadoNube('ok', 'sincronizado ✓'); }
      else subirNube(true);   // primera vez: sube lo que hay en este navegador
    });
  }
  function subirNube(ya) {
    if (!nube.sb || !nube.usuario) return;
    nube.pendiente = true;
    clearTimeout(nube.reloj);
    nube.reloj = setTimeout(function () {
      estadoNube('sincronizando');
      nube.sb.from('ajustes_entreno').upsert({ user_id: nube.usuario.id, datos: datosParaNube(), actualizado: new Date().toISOString() })
        .then(function (r) {
          if (r.error) { estadoNube('error', 'no se pudo guardar en la nube; se reintentará'); return; }
          nube.pendiente = false; estadoNube('ok', 'guardado en la nube ✓');
        });
    }, ya ? 0 : 800);
  }
  window.addEventListener('online', function () { if (nube.pendiente) subirNube(true); });
  // Al volver a la pestaña, trae los cambios hechos en otro dispositivo
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && nube.usuario && !nube.pendiente) bajarNube();
  });
  function entrarNube() {
    var inp = document.getElementById('nube-correo');
    var correo = inp ? inp.value.trim() : '';
    if (!nube.sb) return;
    if (!/^\S+@\S+\.\S+$/.test(correo)) { estadoNube('fuera', 'Escribe un correo válido'); return; }
    estadoNube('enviando');
    nube.sb.auth.signInWithOtp({ email: correo, options: { emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
      if (r.error) estadoNube('fuera', 'No se pudo enviar el enlace: ' + r.error.message);
      else estadoNube('enviado');
    });
  }
  function salirNube() { if (nube.sb) nube.sb.auth.signOut(); nube.usuario = null; estadoNube('fuera'); }
  function pintarNube() {
    var el = document.getElementById('cfg-nube');
    if (!el) return;
    var h;
    if (nube.estado === 'local') h = '☁ Se guarda en este navegador. La sincronización en la nube funciona en la web publicada.';
    else if (nube.estado === 'conectando' || nube.estado === 'apagada') h = '☁ Conectando con la nube…';
    else if (nube.estado === 'fuera') h = '<span>☁ Guarda tus ajustes en la nube:</span>' +
      '<input id="nube-correo" type="email" value="nicolasrecobasystem@gmail.com" aria-label="Tu correo" autocomplete="email">' +
      '<button type="button" class="btn-sec" data-acc="nube-entrar">Enviarme enlace de acceso</button>' +
      (nube.msg ? '<span class="aviso-cfg">' + esc(nube.msg) + '</span>' : '');
    else if (nube.estado === 'enviando') h = '☁ Enviando enlace…';
    else if (nube.estado === 'enviado') h = '☁ Revisa tu correo y pulsa el enlace <b>en este mismo navegador</b>.';
    else h = '<span class="' + (nube.estado === 'error' ? 'aviso-cfg' : 'nube-ok') + '">☁ ' +
      (nube.usuario ? esc(nube.usuario.email) + ' · ' : '') + (nube.estado === 'sincronizando' ? 'sincronizando…' : esc(nube.msg)) + '</span>' +
      (nube.usuario ? '<button type="button" class="btn-sec" data-acc="nube-salir">Cerrar sesión</button>' : '');
    el.innerHTML = h;
  }

  // ---------- escalado 16:9 ----------
  function escalar() {
    var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    app.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', escalar);

  // ---------- sonido ----------
  function activarAudio() {
    try {
      if (!audio) { var C = window.AudioContext || window.webkitAudioContext; if (C) audio = new C(); }
      if (audio && audio.state === 'suspended') audio.resume();
    } catch (e) {}
  }
  function pitido(freq, largo, veces) {
    try {
      if (audio) {
        for (var i = 0; i < veces; i++) {
          var t = audio.currentTime + i * (largo + 0.12);
          var o = audio.createOscillator(), g = audio.createGain();
          o.type = 'square'; o.frequency.value = freq;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + largo);
          o.connect(g); g.connect(audio.destination);
          o.start(t); o.stop(t + largo + 0.02);
        }
      }
    } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate(veces > 1 ? [300, 120, 300, 120, 300] : 120); } catch (e) {}
  }

  // ---------- temporizador ----------
  function parar() { if (iv) { clearInterval(iv); iv = null; } }
  function arrancarIntervalo() { parar(); iv = setInterval(tic, 200); }
  function fase(nombre, segs) {
    finEn = Date.now() + segs * 1000; ultimoSeg = segs;
    st.fase = nombre; st.quedan = segs; st.total = segs; st.corriendo = true; st.pausado = false;
    arrancarIntervalo(); pintarTemporizador();
  }
  function tic() {
    var q = Math.max(0, Math.ceil((finEn - Date.now()) / 1000));
    if (q !== ultimoSeg) {
      ultimoSeg = q;
      if (q > 0 && q <= 3) pitido(660, 0.12, 1);
      st.quedan = q; pintarTemporizador();
    }
    if (q <= 0) { parar(); terminarFase(); }
  }
  function terminarFase() {
    var c = cfg() || { series: 1, descanso: 30 };
    if (st.fase === 'prep') {
      pitido(990, 0.35, 1);
      if (esReps()) { st.fase = 'trabajo'; st.corriendo = false; st.pausado = false; pintarTemporizador(); }
      else fase('trabajo', st.dur);
    } else if (st.fase === 'trabajo') {
      finSerie();
    } else if (st.fase === 'descanso') {
      pitido(990, 0.3, 2);
      st.fase = 'espera'; st.corriendo = false; st.serie += 1; st.quedan = st.dur; st.total = st.dur;
      pintarTemporizador();
    }
  }
  // Fin de una serie (por tiempo o al pulsar "Serie hecha"): descanso o completado
  function finSerie() {
    var c = cfg() || { series: 1, descanso: 30 };
    pitido(880, 0.3, 3);
    if (st.serie < c.series) fase('descanso', c.descanso);
    else { st.fase = 'hecho'; st.corriendo = false; st.quedan = 0; pintarTemporizador(); }
  }
  function reiniciar() {
    parar();
    var c = cfg();
    if (c && c.opciones && c.opciones.indexOf(st.dur) < 0) st.dur = c.opciones[0];
    st.fase = 'espera'; st.corriendo = false; st.pausado = false; st.serie = 1; st.quedan = st.dur; st.total = st.dur;
  }
  function botonPrincipal() {
    activarAudio();
    var prep = (cfg() && cfg().preparacion) || 5;
    if (esReps() && st.fase === 'trabajo' && !st.corriendo) {
      finSerie();
    } else if (st.corriendo) {
      parar(); restanteMs = Math.max(0, finEn - Date.now());
      st.corriendo = false; st.pausado = true; pintarTemporizador();
    } else if (st.pausado) {
      finEn = Date.now() + restanteMs; st.corriendo = true; st.pausado = false;
      arrancarIntervalo(); pintarTemporizador();
    } else {
      if (st.fase === 'espera' && st.serie === 1) arrancarMusica(false);
      if (st.fase === 'hecho') st.serie = 1;
      fase('prep', prep);
    }
  }

  // ---------- plantillas ----------
  function htmlSemana() {
    var d = DIAS[st.sel];
    var info = INFO_GRUPO[d.grupo] || {};
    var dias = DIAS.map(function (x, i) {
      var cls = 'dia' + (i === st.sel ? ' activo' : '') + (i === hoy ? ' hoy' : '');
      return '<button type="button" class="' + cls + '" data-acc="dia" data-i="' + i + '" aria-pressed="' + (i === st.sel) + '" aria-label="' + esc(x.nombre + ', ' + x.grupo) + '">' +
        '<div class="cab"><div class="letra">' + esc(x.letra) + '</div>' + (i === hoy ? '<div class="etq-hoy">HOY</div>' : '') + '</div>' +
        '<div><div class="nombre">' + esc(x.nombre) + '</div><div class="grupo">' + esc(x.grupo) + '</div></div></button>';
    }).join('');
    function campo(k, v) { return '<div class="campo"><div class="k">' + k + '</div><div class="v">' + esc(v || '[Por definir]') + '</div></div>'; }
    return '<div class="pantalla semana">' +
      '<div class="fila-sup"><div><div class="antetitulo">ELIGE UN DÍA</div><h1 class="titulo">MI SEMANA</h1></div>' +
      '<div class="fila-der"><div class="leyenda"><i></i>HOY</div>' +
      '<button type="button" class="btn-sec" data-acc="config">⚙ Configuración</button></div></div>' +
      '<div class="dias">' + dias + '</div>' +
      '<div class="detalle"><div class="izq"><div class="antetitulo">' + esc(d.nombre.toUpperCase()) + '</div><div class="grande">' + esc(d.grupo.toUpperCase()) + '</div></div>' +
      '<div class="campos">' + campo('DURACIÓN', info.duracion) + campo('EJERCICIOS', info.ejercicios) + campo('MATERIAL', info.material) + campo('ENFOQUE', info.enfoque) + '</div>' +
      '<button type="button" class="btn-start" data-acc="start" aria-label="Empezar el entrenamiento">START</button></div>' +
      '</div>';
  }

  function htmlCalentamiento() {
    var d = DIAS[st.sel], l = lista(), ex = ejActual();
    function vacio(t) { return '<div class="vacio">' + t + '</div>'; }
    function claveHtml(c) {
      return '<div class="clave"><div class="k">' + esc(c[0].toUpperCase()) + '</div><div class="v">' + esc(c[1]) + '</div></div>';
    }

    // Menú compacto de ejercicios (arriba)
    var menu = [0, 1, 2].map(function (i) {
      var e = l[i];
      var cls = 'hueco' + (e ? ' lleno' : '') + (i === st.hueco ? ' activo' : '');
      return '<button type="button" class="' + cls + '" data-acc="hueco" data-i="' + i + '" aria-pressed="' + (i === st.hueco) + '">' +
        '<div class="num">' + (i + 1) + '</div>' +
        '<div class="n">' + esc(e ? e.nombre : '[Ejercicio]') + '</div>' +
        '<div class="d">' + esc(e ? e.dosis : '[Series × reps]') + '</div></button>';
    }).join('');

    // Panel 1: nombre, figura y claves
    var p1;
    if (ex) {
      var fig = ex.dibujo && DIBUJOS[ex.dibujo] ? '<div class="fig">' + DIBUJOS[ex.dibujo] + '</div>' : vacio('[Dibujo]');
      p1 = '<div class="p-cab"><div class="p-nombre">' + esc(ex.nombre.toUpperCase()) + '</div><div class="p-dosis">' + esc(ex.dosis) + '</div></div>' +
        '<div class="p-ind"><span>' + esc(ex.indicacion || '') + '</span>' +
        (enlacesMusica(ex, d.grupo, st.mood).length ? '<button type="button" class="btn-musica" data-acc="musica" aria-label="Poner otra canción de este ejercicio">' +
          (musicaSonandoDe === d.grupo + '|' + ex.nombre ? '♪ Otra canción' : '♪ Música') + '</button>' : '') + '</div>' +
        '<div class="con">' + fig + '<div class="claves">' + (ex.claves || []).map(claveHtml).join('') + '</div></div>';
    } else {
      p1 = vacio('[Dibujo del ejercicio]');
    }

    // Panel 2: detalle del agarre
    var ag = ex && ex.agarre;
    var p2 = '<div class="p-tit">AGARRE</div>' + (ag
      ? (ag.dibujo && DIBUJOS[ag.dibujo] ? '<div class="ag-fig">' + DIBUJOS[ag.dibujo] + '</div>' : '') +
        '<div class="ag-puntos">' + (ag.puntos || []).map(claveHtml).join('') + '</div>'
      : vacio('[Por definir]'));

    // Panel 3: errores comunes
    var er = ex && ex.errores;
    var p3 = '<div class="p-tit">ERRORES COMUNES</div>' + (er && er.length
      ? '<div class="errores">' + er.map(function (x) {
          return '<div class="error"><div class="x" aria-hidden="true">✕</div><div><div class="e">' + esc(x[0]) + '</div><div class="ok">→ ' + esc(x[1]) + '</div></div></div>';
        }).join('') + '</div>'
      : vacio('[Por definir]'));

    return '<div class="pantalla calent">' +
      '<div class="barra-sup"><button type="button" class="btn-sec" data-acc="volver">← Semana</button>' +
      '<div class="cab-paso"><span class="antetitulo">PASO 1</span><h2 class="titulo-m">CALENTAMIENTO</h2></div>' +
      '<div class="barra-der">' + (st.mood ? '<div class="mood-lbl">♪ ' + esc(st.mood.toUpperCase()) + '</div>' : '') +
      '<div class="mono dia-lbl">' + esc(d.nombre.toUpperCase() + ' · ' + d.grupo.toUpperCase()) + '</div>' +
      '<div class="puntos"><i class="on"></i><i></i><i></i><i></i></div></div></div>' +
      '<div class="menu-ej">' + menu + '</div>' +
      '<div class="cuerpo"><div class="panel p-fig">' + p1 + '</div><div class="panel p-ag">' + p2 + '</div><div class="panel p-err">' + p3 + '</div></div>' +
      '<div class="pie"><div id="zona-temp" style="flex-grow:1;display:flex"></div>' +
      '<button type="button" class="btn-sig" disabled>Siguiente →</button></div>' +
      '</div>';
  }

  // Ventana "¿Con qué mood entrenas?" al pulsar START
  function htmlMood() {
    var d = DIAS[st.sel], l = lista();
    function cuenta(m) { var n = 0; l.forEach(function (e) { n += enlacesMusica(e, d.grupo, m).length; }); return n; }
    function txt(n) { return n ? n + (n === 1 ? ' canción' : ' canciones') : 'sin canciones'; }
    var botones = moods.map(function (m, i) {
      var ult = ultimoMood === m;
      return '<button type="button" class="mood' + (ult ? ' ultimo' : '') + '" data-acc="mood" data-i="' + i + '"><span class="n">' + esc(m) + '</span><span class="c">' + txt(cuenta(m)) + (ult ? ' · la última vez' : '') + '</span></button>';
    }).join('') +
      '<button type="button" class="mood ninguno' + (ultimoMood === '' ? ' ultimo' : '') + '" data-acc="mood" data-i="-1"><span class="n">Ninguno</span><span class="c">todas mezcladas · ' + txt(cuenta(null)) + (ultimoMood === '' ? ' · la última vez' : '') + '</span></button>';
    return '<div class="velo" data-acc="cerrar-mood"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="tit-mood">' +
      '<div class="antetitulo">' + esc(d.nombre.toUpperCase() + ' · ' + d.grupo.toUpperCase()) + '</div>' +
      '<h2 class="titulo-m" id="tit-mood">¿CON QUÉ MOOD ENTRENAS?</h2>' +
      '<div class="moods">' + botones + '</div>' +
      '<div class="modal-pie"><button type="button" class="btn-sec" data-acc="cerrar-mood">Cancelar</button></div>' +
      '</div></div>';
  }

  function htmlConfig() {
    var todos = todosLosEjercicios();
    if (st.cfgSel >= todos.length) st.cfgSel = 0;
    if (st.cfgMood >= moods.length) st.cfgMood = 0;
    var chips = moods.map(function (m, i) {
      return '<span class="chip"><span>' + esc(m) + '</span><button type="button" class="chip-x" data-acc="mood-borrar" data-i="' + i + '" aria-label="Borrar el mood ' + esc(m) + '">✕</button></span>';
    }).join('');
    var barraMoods = '<div class="cfg-moods"><div class="cfg-lbl">MOODS</div>' + chips +
      '<input id="mood-nuevo" type="text" maxlength="24" placeholder="Nuevo mood…" aria-label="Nombre del nuevo mood">' +
      '<button type="button" class="btn-sec" data-acc="mood-anadir">+ Añadir</button>' +
      '<span id="mood-aviso" class="aviso-cfg mono"></span></div>';
    var lista = '', ultimo = '';
    todos.forEach(function (x, i) {
      var cab = x.grupo + ' · ' + x.bloque;
      if (cab !== ultimo) { lista += '<div class="cfg-grupo">' + esc(cab.toUpperCase()) + '</div>'; ultimo = cab; }
      var n = enlacesMusica(x.ej, x.grupo, null).length;
      lista += '<button type="button" class="cfg-ej' + (i === st.cfgSel ? ' activo' : '') + '" data-acc="cfg-ej" data-i="' + i + '" aria-pressed="' + (i === st.cfgSel) + '">' +
        '<span class="n">' + esc(x.ej.nombre) + '</span>' +
        '<span class="cuenta' + (n ? ' on' : '') + '" data-cuenta="' + i + '">' + (n ? '♪ ' + n : 'sin música') + '</span></button>';
    });
    var sel = todos[st.cfgSel], editor;
    if (!sel) {
      editor = '<div class="vacio">Todavía no hay ejercicios cargados.</div>';
    } else {
      editor = '<div class="antetitulo">' + esc((sel.grupo + ' · ' + sel.bloque).toUpperCase()) + '</div>' +
        '<div class="cfg-nombre">' + esc(sel.ej.nombre.toUpperCase()) + '</div>';
      if (!moods.length) {
        editor += '<div class="vacio">Añade un mood arriba para empezar a poner enlaces.</div>';
      } else {
        var mus = musicaDe(sel.ej, sel.grupo), moodSel = moods[st.cfgMood];
        var tabs = moods.map(function (m, i) {
          return '<button type="button" class="tab-mood' + (i === st.cfgMood ? ' activo' : '') + '" data-acc="cfg-mood" data-i="' + i + '" aria-pressed="' + (i === st.cfgMood) + '">' +
            esc(m) + '<span data-tab="' + i + '">' + (mus[m] || []).length + '</span></button>';
        }).join('');
        editor += '<div class="tabs-mood">' + tabs + '</div>' +
          '<label class="cfg-lbl" for="cfg-texto">ENLACES PARA «' + esc(moodSel.toUpperCase()) + '» · UNO POR LÍNEA · SE ELIGE UNO AL AZAR</label>' +
          '<textarea id="cfg-texto" spellcheck="false" placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/...">' +
          esc((mus[moodSel] || []).filter(esEnlace).join('\n')) + '</textarea>' +
          htmlArchivos((mus[moodSel] || []).filter(esArchivo)) +
          '<div class="cfg-pie"><div id="cfg-estado" class="cfg-estado"></div>' +
          '<button type="button" class="btn-sec" data-acc="cfg-probar">♪ Probar uno al azar</button>' +
          '<button type="button" class="btn-sec" data-acc="cfg-borrar">Borrar enlaces</button></div>';
      }
    }
    return '<div class="pantalla config">' +
      '<div class="barra-sup"><button type="button" class="btn-sec" data-acc="volver">← Semana</button>' +
      '<div class="cab-paso"><span class="antetitulo">MÚSICA POR EJERCICIO</span><h2 class="titulo-m">CONFIGURACIÓN</h2></div>' +
      '<div class="barra-der"><button type="button" class="btn-sec" data-acc="cfg-exportar">Descargar copia</button>' +
      '<button type="button" class="btn-sec" data-acc="cfg-importar">Cargar copia</button>' +
      '<input type="file" id="cfg-archivo" accept=".json,application/json" hidden></div></div>' +
      barraMoods +
      '<div class="cfg-cuerpo"><div class="panel cfg-lista">' + lista + '</div><div class="panel cfg-editor">' + editor + '</div></div>' +
      '<div id="cfg-nube" class="cfg-nube"></div>' +
      '</div>';
  }

  // Lista de archivos de audio del mood abierto + botón para subir más
  function htmlArchivos(archivos) {
    var chips = archivos.map(function (x) {
      return '<span class="chip chip-audio"><span>♫ ' + esc(nombreArchivo(x)) + '</span>' +
        '<button type="button" class="chip-x" data-acc="archivo-quitar" data-item="' + esc(x) + '" aria-label="Quitar ' + esc(nombreArchivo(x)) + '">✕</button></span>';
    }).join('');
    var subir = !EMBEBIDO ? '<span class="cfg-nota-mini">Los archivos se suben desde la web publicada.</span>'
      : !nube.usuario ? '<span class="cfg-nota-mini">Entra con tu correo (abajo) para subir canciones.</span>'
      : '<label class="btn-sec btn-subir">⬆ Subir canciones<input type="file" id="subir-audio" accept="audio/*" multiple hidden></label>' +
        '<label class="cfg-check"><input type="checkbox" id="subir-todos"> añadirlas a todos los ejercicios</label>';
    return '<div class="cfg-archivos"><div class="cfg-lbl">ARCHIVOS DE AUDIO' + (archivos.length ? ' · ' + archivos.length : '') + '</div>' +
      '<div class="lista-audio">' + chips + subir + '<span id="subir-estado" class="cfg-nota-mini"></span></div></div>';
  }
  function nombreSeguro(n) {
    return n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
  }
  function subirArchivos(files) {
    var sel = todosLosEjercicios()[st.cfgSel], m = moods[st.cfgMood];
    var aTodos = !!(document.getElementById('subir-todos') || {}).checked;
    var est = function (t) { var e = document.getElementById('subir-estado'); if (e) e.textContent = t; };
    if (!sel || !m || !nube.usuario) return;
    var lista = Array.prototype.slice.call(files), hechos = 0, fallos = 0;
    function siguiente() {
      if (!lista.length) {
        guardarTodo(); pintar();
        est(hechos + (hechos === 1 ? ' canción subida' : ' canciones subidas') + (fallos ? ' · ' + fallos + ' con error' : '') + ' ✓');
        return;
      }
      var f = lista.shift();
      if (f.size > 50 * 1024 * 1024) { fallos++; siguiente(); return; }
      est('Subiendo ' + f.name + '… (' + (hechos + fallos + 1) + ' de ' + (hechos + fallos + lista.length + 1) + ')');
      var ruta = nube.usuario.id + '/' + Date.now() + '-' + nombreSeguro(f.name);
      nube.sb.storage.from('musica').upload(ruta, f, { contentType: f.type || 'audio/mpeg', upsert: false }).then(function (r) {
        if (r.error) { fallos++; siguiente(); return; }
        var item = 'sb:' + ruta + '|' + f.name.replace(/\.[^.]+$/, '').replace(/\|/g, ' ');
        var destinos = aTodos ? todosLosEjercicios() : [sel];
        destinos.forEach(function (x) {
          var o = musicaDe(x.ej, x.grupo);
          o[m] = (o[m] || []).concat([item]);
          musicaGuardada[x.clave] = o;
        });
        hechos++; siguiente();
      });
    }
    siguiente();
  }
  // Quita un archivo del mood abierto; si ya no se usa en ningún sitio, lo borra de la nube
  function quitarArchivo(item) {
    var sel = todosLosEjercicios()[st.cfgSel], m = moods[st.cfgMood];
    if (!sel || !m) return;
    var o = musicaDe(sel.ej, sel.grupo);
    o[m] = (o[m] || []).filter(function (x) { return x !== item; });
    if (!o[m].length) delete o[m];
    musicaGuardada[sel.clave] = o;
    var enUso = todosLosEjercicios().some(function (x) {
      var mm = musicaDe(x.ej, x.grupo);
      return Object.keys(mm).some(function (k) { return mm[k].indexOf(item) >= 0; });
    });
    if (!enUso && nube.sb && nube.usuario) nube.sb.storage.from('musica').remove([rutaArchivo(item)]);
    guardarTodo(); pintar();
  }

  function lineasCfg() {
    var ta = document.getElementById('cfg-texto');
    return ta ? ta.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : [];
  }
  function actualizarEstadoCfg(msg) {
    var el = document.getElementById('cfg-estado');
    if (!el) return;
    var lineas = lineasCfg(), ok = lineas.filter(esEnlace).length, malas = lineas.length - ok;
    el.innerHTML = (ok ? ok + (ok === 1 ? ' enlace' : ' enlaces') : 'Sin enlaces') +
      (malas ? ' · <span class="aviso-cfg">' + malas + (malas === 1 ? ' línea no parece un enlace' : ' líneas no parecen enlaces') + '</span>' : '') +
      (msg ? ' · ' + msg : '');
  }
  function guardarCfg() {
    var sel = todosLosEjercicios()[st.cfgSel], m = moods[st.cfgMood];
    if (!sel || !m) return;
    var o = musicaDe(sel.ej, sel.grupo);
    var ls = lineasCfg().filter(esEnlace).concat((o[m] || []).filter(esArchivo));   // los archivos se conservan
    if (ls.length) o[m] = ls; else delete o[m];
    musicaGuardada[sel.clave] = o;
    var ok = guardarTodo();
    actualizarEstadoCfg(ok ? 'guardado ✓' : '<span class="aviso-cfg">no se pudo guardar en este navegador: usa "Descargar copia"</span>');
    var total = enlacesMusica(sel.ej, sel.grupo, null).length;
    var c = document.querySelector('[data-cuenta="' + st.cfgSel + '"]');
    if (c) { c.textContent = total ? '♪ ' + total : 'sin música'; c.className = 'cuenta' + (total ? ' on' : ''); }
    var t = document.querySelector('[data-tab="' + st.cfgMood + '"]');
    if (t) t.textContent = ls.length;
  }
  function avisoMood(t) { var a = document.getElementById('mood-aviso'); if (a) a.textContent = t; }
  function anadirMood() {
    var inp = document.getElementById('mood-nuevo');
    var nombre = inp ? inp.value.trim() : '';
    if (!nombre) { avisoMood('Escribe un nombre'); return; }
    if (moods.some(function (m) { return m.toLowerCase() === nombre.toLowerCase(); })) { avisoMood('Ese mood ya existe'); return; }
    moods.push(nombre); guardarTodo();
    st.cfgMood = moods.length - 1; pintar();
    var n = document.getElementById('mood-nuevo'); if (n) n.focus();
  }
  function borrarMood(i) {
    var m = moods[i];
    if (m == null) return;
    var usos = 0;
    todosLosEjercicios().forEach(function (x) { usos += enlacesMusica(x.ej, x.grupo, m).length; });
    if (usos && !window.confirm('¿Borrar el mood "' + m + '"? Se quitarán sus ' + usos + ' enlaces de todos los ejercicios.')) return;
    todosLosEjercicios().forEach(function (x) {
      var o = musicaDe(x.ej, x.grupo);
      if (o[m]) { delete o[m]; musicaGuardada[x.clave] = o; }
    });
    Object.keys(musicaGuardada).forEach(function (k) { var o = musicaGuardada[k]; if (o && !Array.isArray(o) && o[m]) delete o[m]; });
    moods.splice(i, 1);
    if (st.mood === m) st.mood = null;
    if (st.cfgMood >= moods.length) st.cfgMood = Math.max(0, moods.length - 1);
    guardarTodo(); pintar();
  }
  function exportarCfg() {
    var mus = {};
    todosLosEjercicios().forEach(function (x) { mus[x.clave] = musicaDe(x.ej, x.grupo); });
    Object.keys(musicaGuardada).forEach(function (k) { if (!(k in mus)) mus[k] = porMood(musicaGuardada[k]); });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, moods: moods, musica: mus }, null, 2)], { type: 'application/json' }));
    a.download = 'musica-mi-semana.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    actualizarEstadoCfg('copia descargada ✓');
  }
  function importarCfg(archivo) {
    var r = new FileReader();
    r.onload = function () {
      var n = 0;
      try {
        var o = JSON.parse(r.result);
        var mus = o && o.musica && typeof o.musica === 'object' ? o.musica : o;
        if (o && Array.isArray(o.moods)) o.moods.forEach(function (m) { if (typeof m === 'string' && m.trim() && moods.indexOf(m) < 0) moods.push(m); });
        Object.keys(mus).forEach(function (k) {
          if (k === 'version' || k === 'moods') return;
          var p2 = porMood(mus[k]); musicaGuardada[k] = p2; asegurarMoods(p2); n++;
        });
      } catch (e) { n = -1; }
      guardarTodo(); pintar();
      actualizarEstadoCfg(n < 0 ? '<span class="aviso-cfg">ese archivo no es una copia válida</span>' : 'copia cargada ✓ (' + n + ' ejercicios)');
    };
    r.readAsText(archivo);
  }

  function pintarTemporizador() {
    var zona = document.getElementById('zona-temp');
    if (!zona) return;
    var c = cfg();
    if (!c) { zona.innerHTML = '<div class="sin-temp">SIGUIENTE: [por definir]</div>'; return; }
    var colores = { espera: 'var(--texto)', prep: 'var(--amarillo)', trabajo: 'var(--acento)', descanso: 'var(--azul)', hecho: 'var(--azul)' };
    var textos = { espera: st.serie > 1 ? 'SIGUIENTE SERIE' : 'LISTO', prep: 'PREPÁRATE', trabajo: c.reps ? 'HAZ LAS REPS' : '¡AGUANTA!', descanso: 'DESCANSO', hecho: '¡COMPLETADO!' };
    var mostrado = st.fase === 'espera' ? st.dur : st.quedan;
    var tiempo = Math.floor(mostrado / 60) + ':' + (mostrado % 60 < 10 ? '0' : '') + (mostrado % 60);
    if (c.reps && (st.fase === 'espera' || st.fase === 'trabajo' || st.fase === 'hecho')) tiempo = c.reps + '<small>REPS</small>';
    var pct = (st.fase === 'espera' || (c.reps && st.fase === 'trabajo')) ? 100 : (st.fase === 'hecho' ? 0 : Math.round(st.quedan / Math.max(1, st.total) * 100));
    var etiqueta = (c.reps && st.fase === 'trabajo') ? 'Serie hecha ✓' : st.corriendo ? 'Pausar' : (st.pausado ? 'Continuar' : (st.fase === 'hecho' ? 'Repetir' : (st.serie > 1 ? 'Iniciar serie ' + st.serie : 'Iniciar')));
    var col = colores[st.fase];
    var pastillas = '';
    if (c.reps) {
      pastillas = '<div class="t-dur"><span>' + c.reps + ' REPETICIONES · DESCANSO ' + c.descanso + ' s</span></div>';
    } else if (st.fase === 'espera' && st.serie === 1 && !st.pausado) {
      pastillas = '<div class="t-dur"><span>DURACIÓN</span>' + c.opciones.map(function (s) {
        return '<button type="button" class="pastilla' + (s === st.dur ? ' on' : '') + '" data-acc="dur" data-s="' + s + '" aria-pressed="' + (s === st.dur) + '">' + s + ' s</button>';
      }).join('') + '</div>';
    }
    zona.innerHTML = '<div class="temporizador">' +
      '<div class="t-estado"><div class="t-fase" style="color:' + col + '">' + textos[st.fase] + (st.pausado ? ' · PAUSA' : '') + '</div>' +
      '<div class="t-serie">SERIE ' + st.serie + ' / ' + c.series + '</div></div>' +
      '<div class="t-tiempo" aria-live="polite" style="color:' + col + '">' + tiempo + '</div>' +
      '<div class="t-medio"><div class="t-barra"><i style="width:' + pct + '%;background:' + col + '"></i></div>' + pastillas + '</div>' +
      '<button type="button" class="btn-pri" data-acc="principal">' + etiqueta + '</button>' +
      '<button type="button" class="btn-rei" data-acc="reiniciar">Reiniciar</button></div>';
  }

  function pintar() {
    vista.innerHTML = st.pantalla === 'semana' ? htmlSemana() + (st.pidiendoMood ? htmlMood() : '') : (st.pantalla === 'config' ? htmlConfig() : htmlCalentamiento());
    if (st.pidiendoMood) { var f = vista.querySelector('.mood.ultimo') || vista.querySelector('.mood'); if (f) f.focus(); }
    if (st.pantalla === 'calent') pintarTemporizador();
    if (st.pantalla === 'config') { actualizarEstadoCfg(); pintarNube(); }
  }

  function empezar() { musicaSonandoDe = ''; st.pidiendoMood = false; st.pantalla = 'calent'; st.hueco = 0; reiniciar(); pintar(); }

  // ---------- eventos ----------
  app.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-acc]');
    if (!b || b.disabled) return;
    var acc = b.getAttribute('data-acc');
    if (acc === 'dia') { st.sel = +b.getAttribute('data-i'); pintar(); }
    else if (acc === 'start') {
      // Pregunta el mood antes de empezar (si no hay moods, empieza directamente)
      if (moods.length) { st.pidiendoMood = true; pintar(); } else { st.mood = null; empezar(); }
    }
    else if (acc === 'mood') {
      var mi = +b.getAttribute('data-i');
      st.mood = mi < 0 ? null : moods[mi];
      ultimoMood = st.mood || ''; escribirLS(LS_ULTIMO, ultimoMood); subirNube();
      empezar();
    }
    else if (acc === 'nube-entrar') { entrarNube(); }
    else if (acc === 'nube-salir') { salirNube(); }
    else if (acc === 'cerrar-mood') { if (b === ev.target || b.tagName === 'BUTTON') { st.pidiendoMood = false; pintar(); } }
    else if (acc === 'cfg-mood') { st.cfgMood = +b.getAttribute('data-i'); pintar(); }
    else if (acc === 'mood-anadir') { anadirMood(); }
    else if (acc === 'mood-borrar') { borrarMood(+b.getAttribute('data-i')); }
    else if (acc === 'volver') { reiniciar(); cerrarRep(); st.pantalla = 'semana'; pintar(); }
    else if (acc === 'rep-otra') { reproducir(rep.lista, rep.etiqueta); }
    else if (acc === 'rep-mini') { rep.mini = !rep.mini; pintarRep(); }
    else if (acc === 'rep-cerrar') { cerrarRep(); }
    else if (acc === 'hueco') { st.hueco = +b.getAttribute('data-i'); reiniciar(); pintar(); }
    else if (acc === 'dur') { st.dur = +b.getAttribute('data-s'); st.quedan = st.dur; st.total = st.dur; pintarTemporizador(); }
    else if (acc === 'config') { reiniciar(); st.pantalla = 'config'; pintar(); }
    else if (acc === 'cfg-ej') { st.cfgSel = +b.getAttribute('data-i'); pintar(); }
    else if (acc === 'cfg-probar') { var sx = todosLosEjercicios()[st.cfgSel]; if (sx) reproducir(enlacesMusica(sx.ej, sx.grupo, moods[st.cfgMood]), '♪ Prueba · ' + (moods[st.cfgMood] || '')); }
    else if (acc === 'archivo-quitar') { quitarArchivo(b.getAttribute('data-item')); }
    else if (acc === 'cfg-borrar') { var ta = document.getElementById('cfg-texto'); if (ta) { ta.value = ''; guardarCfg(); } }
    else if (acc === 'cfg-exportar') { exportarCfg(); }
    else if (acc === 'cfg-importar') { document.getElementById('cfg-archivo').click(); }
    else if (acc === 'principal') { botonPrincipal(); }
    else if (acc === 'musica') {
      // Se abre en una ventanita aparte (siempre la misma) para no salir de la web
      arrancarMusica(true);
    }
    else if (acc === 'reiniciar') { reiniciar(); pintarTemporizador(); }
  });

  // Configuración: guardar al escribir y cargar copia
  app.addEventListener('input', function (ev) { if (ev.target.id === 'cfg-texto') guardarCfg(); });
  app.addEventListener('change', function (ev) {
    if (ev.target.id === 'cfg-archivo' && ev.target.files && ev.target.files[0]) importarCfg(ev.target.files[0]);
    if (ev.target.id === 'subir-audio' && ev.target.files && ev.target.files.length) subirArchivos(ev.target.files);
  });

  // Esc cierra la ventana de mood · Enter añade un mood nuevo
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && st.pidiendoMood) { st.pidiendoMood = false; pintar(); }
    if (ev.key === 'Enter' && ev.target.id === 'mood-nuevo') { ev.preventDefault(); anadirMood(); }
    if (ev.key === 'Enter' && ev.target.id === 'nube-correo') { ev.preventDefault(); entrarNube(); }
  });

  // Barra espaciadora = iniciar / pausar en la pantalla de calentamiento
  document.addEventListener('keydown', function (ev) {
    if (ev.code === 'Space' && st.pantalla === 'calent' && cfg() && !(ev.target instanceof HTMLButtonElement)) {
      ev.preventDefault(); botonPrincipal();
    }
  });

  escalar();
  pintar();
  iniciarNube();
})();
