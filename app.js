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
  function limpiar(ls) { return (Array.isArray(ls) ? ls : [ls]).map(function (x) { return String(x || '').trim(); }).filter(esEnlace); }
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
  function guardarTodo() { var a = escribirLS(LS_MUSICA, musicaGuardada), b = escribirLS(LS_MOODS, moods); return a && b; }
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
    cajaRep.className = rep.mini ? 'mini' : '';
    document.getElementById('rep-tit').textContent = rep.etiqueta;
    document.getElementById('rep-mini').textContent = rep.mini ? '▢' : '–';
  }
  function reproducir(ls, etiqueta) {
    if (!ls || !ls.length) return;
    if (!EMBEBIDO) { abrirMusica(ls); return; }
    rep.lista = ls; rep.etiqueta = etiqueta || '♪';
    var opciones = ls.length > 1 ? ls.filter(function (x) { return x !== rep.actual; }) : ls;
    var u = opciones[Math.floor(Math.random() * opciones.length)];
    rep.actual = u; rep.visible = true;
    avisoRep(''); pintarRep();
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
    rep.visible = false; pintarRep();
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
      return '<button type="button" class="mood" data-acc="mood" data-i="' + i + '"><span class="n">' + esc(m) + '</span><span class="c">' + txt(cuenta(m)) + '</span></button>';
    }).join('') +
      '<button type="button" class="mood ninguno" data-acc="mood" data-i="-1"><span class="n">Ninguno</span><span class="c">todas mezcladas · ' + txt(cuenta(null)) + '</span></button>';
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
          esc((mus[moodSel] || []).join('\n')) + '</textarea>' +
          '<div class="cfg-pie"><div id="cfg-estado" class="cfg-estado"></div>' +
          '<button type="button" class="btn-sec" data-acc="cfg-probar">♪ Probar uno al azar</button>' +
          '<button type="button" class="btn-sec" data-acc="cfg-borrar">Borrar todos</button></div>';
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
      '<div class="cfg-nota">Se guarda solo, en este navegador. Usa "Descargar copia" para tener los enlaces a salvo o pasarlos a otro ordenador.</div>' +
      '</div>';
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
    var ls = lineasCfg().filter(esEnlace), o = musicaDe(sel.ej, sel.grupo);
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
    if (st.pidiendoMood) { var f = app.querySelector('.mood'); if (f) f.focus(); }
    if (st.pantalla === 'calent') pintarTemporizador();
    if (st.pantalla === 'config') actualizarEstadoCfg();
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
    else if (acc === 'mood') { var mi = +b.getAttribute('data-i'); st.mood = mi < 0 ? null : moods[mi]; empezar(); }
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
  });

  // Esc cierra la ventana de mood · Enter añade un mood nuevo
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && st.pidiendoMood) { st.pidiendoMood = false; pintar(); }
    if (ev.key === 'Enter' && ev.target.id === 'mood-nuevo') { ev.preventDefault(); anadirMood(); }
  });

  // Barra espaciadora = iniciar / pausar en la pantalla de calentamiento
  document.addEventListener('keydown', function (ev) {
    if (ev.code === 'Space' && st.pantalla === 'calent' && cfg() && !(ev.target instanceof HTMLButtonElement)) {
      ev.preventDefault(); botonPrincipal();
    }
  });

  escalar();
  pintar();
})();
