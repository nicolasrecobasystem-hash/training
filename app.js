(function () {
  'use strict';

  var app = document.getElementById('app');
  var vista = document.getElementById('vista');   // lo que se repinta en cada pantalla
  var hoy = new Date().getDay();

  var st = {
    pantalla: 'semana', sel: hoy, hueco: 0, bloque: 0, completado: false, desc: 30, cfgVista: 'biblio', filtroMood: '', filtroInt: 0, mood: null, pidiendoMood: false,
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
  // Bloques del día (Calentamiento, Principal...). Si un grupo no tiene BLOQUES, solo su calentamiento.
  function bloquesDe(g) {
    var b = (typeof BLOQUES !== 'undefined' && BLOQUES[g]) || null;
    return b && b.length ? b : [{ titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS[g] || [] }];
  }
  function bloques() { return bloquesDe(DIAS[st.sel].grupo); }
  // Ejercicios reales de un bloque (en datos.js un hueco se marca con null: sale como [Por definir])
  function ejs(b) { return (b.ejercicios || []).filter(Boolean); }
  function bloqueActual() { return bloques()[st.bloque] || bloques()[0]; }
  function lista() { return bloqueActual().ejercicios || []; }
  function ejActual() { return lista()[st.hueco]; }
  function cfg() { var e = ejActual(); return e && e.temporizador ? e.temporizador : null; }
  // ---------- música: biblioteca con mood e intensidad ----------
  // Cada canción (archivo subido o enlace de YouTube) está UNA sola vez en la biblioteca,
  // con sus moods y un nivel de intensidad (1 baja · 2 media · 3 alta).
  // Cada ejercicio tiene su intensidad; al entrenar suena una canción al azar
  // del mood elegido y de la intensidad del ejercicio.
  var LS_MOODS = 'miSemana.moods.v1', LS_BIBLIO = 'miSemana.biblioteca.v1', LS_INTENS = 'miSemana.intensidad.v1';
  var INTENSIDADES = ['', 'Baja', 'Media', 'Alta'];
  var INTENSIDAD_BLOQUE = { 'Calentamiento': 1, 'Principal': 3, 'Posterior y estabilidad': 2, 'Final': 2, 'Final en la barra': 2 };   // por defecto; se cambia por ejercicio en Configuración
  function leerLS(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function escribirLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esEnlace(x) { return /^https?:\/\/\S+$/i.test(x); }
  // Un archivo subido a Supabase se guarda como "sb:<ruta en el almacén>|<nombre>"
  function esArchivo(x) { return /^sb:[^|]+\|.+$/.test(x); }
  function rutaArchivo(x) { return x.slice(3, x.indexOf('|')); }
  function nombreArchivo(x) { return x.slice(x.indexOf('|') + 1); }
  function limpiar(ls) {
    return (Array.isArray(ls) ? ls : [ls]).map(function (x) { return String(x || '').trim(); })
      .filter(function (x) { return esEnlace(x) || esArchivo(x); });
  }
  var moods = leerLS(LS_MOODS, null);
  if (!Array.isArray(moods)) moods = ['Energía', 'Tranquilo', 'Motivación'];
  var biblioteca = leerLS(LS_BIBLIO, null);
  var ejIntensidad = leerLS(LS_INTENS, null);
  if (!ejIntensidad || typeof ejIntensidad !== 'object' || Array.isArray(ejIntensidad)) ejIntensidad = {};
  function nuevoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function nombreDe(item) {
    if (esArchivo(item)) return nombreArchivo(item);
    var d = datosYouTube(item);
    return d ? 'YouTube · ' + (d.id || 'lista ' + d.list) : item;
  }
  function normalizarCancion(c) {
    if (!c || typeof c !== 'object') return null;
    var item = limpiar([c.item])[0];
    if (!item) return null;
    var n = +c.intensidad;
    if (!(n >= 1 && n <= 3)) n = 2;
    return {
      id: String(c.id || nuevoId()), item: item, intensidad: n,
      nombre: String(c.nombre || nombreDe(item)).slice(0, 120),
      moods: Array.isArray(c.moods) ? c.moods.filter(function (m) { return typeof m === 'string' && m; }) : []
    };
  }
  function cancionPorItem(item) { for (var i = 0; i < biblioteca.length; i++) if (biblioteca[i].item === item) return biblioteca[i]; return null; }
  function cancionPorId(id) { for (var i = 0; i < biblioteca.length; i++) if (biblioteca[i].id === id) return biblioteca[i]; return null; }
  // Añade una canción (o completa la que ya existe con los moods nuevos)
  function anadirCancion(item, nombre, moodsIni, intensidad) {
    var c = cancionPorItem(item);
    if (!c) {
      c = normalizarCancion({ item: item, nombre: nombre, intensidad: intensidad || 2 });
      if (!c) return null;
      biblioteca.push(c);
    }
    (moodsIni || []).forEach(function (m) { if (m && c.moods.indexOf(m) < 0) c.moods.push(m); });
    return c;
  }
  // Pasa el formato anterior ({ "Grupo|Ejercicio": { mood: [enlaces] } }) a la biblioteca
  function migrarAntiguo(mus) {
    if (!mus || typeof mus !== 'object') return 0;
    var n = 0;
    Object.keys(mus).forEach(function (clave) {
      if (clave === 'version' || clave === 'moods') return;
      var v = mus[clave], o = {};
      if (typeof v === 'string' || Array.isArray(v)) o.General = limpiar(v);
      else if (v && typeof v === 'object') Object.keys(v).forEach(function (m) { o[m] = limpiar(v[m]); });
      var inten = intensidadDeClave(clave);
      Object.keys(o).forEach(function (m) {
        if (o[m].length && moods.indexOf(m) < 0) moods.push(m);
        o[m].forEach(function (item) { if (anadirCancion(item, null, [m], inten)) n++; });
      });
    });
    return n;
  }
  function asegurarMoods() {
    biblioteca.forEach(function (c) { c.moods.forEach(function (m) { if (moods.indexOf(m) < 0) moods.push(m); }); });
  }
  // Último mood elegido ('' = Ninguno, null = nunca elegido): sale marcado al pulsar START
  var LS_ULTIMO = 'miSemana.ultimoMood.v1';
  var ultimoMood = leerLS(LS_ULTIMO, null);
  function guardarTodo() {
    var a = escribirLS(LS_BIBLIO, biblioteca), b = escribirLS(LS_MOODS, moods), c = escribirLS(LS_INTENS, ejIntensidad);
    subirNube();   // y a la nube, si hay sesión
    return a && b && c;
  }
  // Intensidad de un ejercicio: la elegida en Configuración, la de datos.js o la de su bloque
  function intensidadDeClave(clave) {
    var n = +ejIntensidad[clave];
    if (n >= 1 && n <= 3) return n;
    var x = todosLosEjercicios().filter(function (y) { return y.clave === clave; })[0];
    if (!x) return 2;
    var d = +x.ej.intensidad;
    return d >= 1 && d <= 3 ? d : (INTENSIDAD_BLOQUE[x.bloque] || 2);
  }
  // Canciones para un ejercicio y un mood (null = "Ninguno": cualquier mood).
  // Primero las de la intensidad del ejercicio; si no hay ninguna, cualquiera de ese mood.
  function cancionesPara(e, grupo, mood) {
    if (!e) return [];
    var inten = intensidadDeClave(grupo + '|' + e.nombre);
    var delMood = biblioteca.filter(function (c) { return !mood || c.moods.indexOf(mood) >= 0; });
    var exactas = delMood.filter(function (c) { return c.intensidad === inten; });
    return exactas.length ? exactas : delMood;
  }
  function enlacesMusica(e, grupo, mood) { return cancionesPara(e, grupo, mood).map(function (c) { return c.item; }); }
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
    var grupos = Object.keys(CALENTAMIENTOS);
    if (typeof BLOQUES !== 'undefined') Object.keys(BLOQUES).forEach(function (g) { if (grupos.indexOf(g) < 0) grupos.push(g); });
    grupos.forEach(function (g) {
      bloquesDe(g).forEach(function (b) {
        ejs(b).forEach(function (e) {
          out.push({ grupo: g, bloque: b.titulo, ej: e, clave: g + '|' + e.nombre });
        });
      });
    });
    return out;
  }
  // Primera vez con la biblioteca: se trae la música guardada con el formato anterior
  if (!Array.isArray(biblioteca)) {
    biblioteca = [];
    migrarAntiguo(leerLS('miSemana.musica.v2', null));
    migrarAntiguo(leerLS('miSemana.musica.v1', null));
    todosLosEjercicios().forEach(function (x) { if (x.ej.musica) { var o = {}; o[x.clave] = x.ej.musica; migrarAntiguo(o); } });
    escribirLS(LS_BIBLIO, biblioteca); escribirLS(LS_MOODS, moods);
  } else {
    biblioteca = biblioteca.map(normalizarCancion).filter(Boolean);
  }
  asegurarMoods();
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
  function datosParaNube() { return { version: 3, moods: moods, biblioteca: biblioteca, ejIntensidad: ejIntensidad, ultimoMood: ultimoMood, historial: historial }; }

  // ---------- historial: qué ejercicios hiciste cada día ----------
  // { "2026-09-24": { grupo: "Hombro", hechos: ["Hombro|Colgarte de la barra", ...], total: 10, terminado: true } }
  var LS_HIST = 'miSemana.historial.v1';
  var historial = leerLS(LS_HIST, null);
  if (!historial || typeof historial !== 'object' || Array.isArray(historial)) historial = {};
  function claveFecha(f) {
    return f.getFullYear() + '-' + (f.getMonth() < 9 ? '0' : '') + (f.getMonth() + 1) + '-' + (f.getDate() < 10 ? '0' : '') + f.getDate();
  }
  function totalDe(g) { var n = 0; bloquesDe(g).forEach(function (b) { n += ejs(b).length; }); return n; }
  function registroDe(k) { var r = historial[k]; return r && Array.isArray(r.hechos) ? r : null; }
  function estaHecho(ex, g) { var r = registroDe(claveFecha(new Date())); return !!(ex && r && r.hechos.indexOf(g + '|' + ex.nombre) >= 0); }
  function guardarHistorial() { escribirLS(LS_HIST, historial); subirNube(); }
  function marcarHecho(ex, g, valor) {
    if (!ex) return;
    var k = claveFecha(new Date()), r = registroDe(k) || { grupo: g, hechos: [] };
    var id = g + '|' + ex.nombre, i = r.hechos.indexOf(id);
    if (valor && i < 0) r.hechos.push(id);
    if (!valor && i >= 0) r.hechos.splice(i, 1);
    r.grupo = g; r.total = totalDe(g);
    if (r.hechos.length || r.terminado) historial[k] = r; else delete historial[k];
    guardarHistorial();
  }
  // Mezcla el historial de la nube con el de este navegador (no se pierde nada)
  function mezclarHistorial(otro) {
    if (!otro || typeof otro !== 'object') return;
    Object.keys(otro).forEach(function (k) {
      var o = otro[k]; if (!o || !Array.isArray(o.hechos)) return;
      var r = registroDe(k);
      if (!r) { historial[k] = { grupo: o.grupo, hechos: o.hechos.slice(), total: o.total, terminado: !!o.terminado }; return; }
      o.hechos.forEach(function (h) { if (r.hechos.indexOf(h) < 0) r.hechos.push(h); });
      r.terminado = r.terminado || !!o.terminado; r.total = Math.max(r.total || 0, o.total || 0);
    });
  }
  function aplicarDeNube(d) {
    if (!d || typeof d !== 'object') return;
    if (Array.isArray(d.moods)) moods = d.moods.filter(function (m) { return typeof m === 'string' && m.trim(); });
    if (Array.isArray(d.biblioteca)) biblioteca = d.biblioteca.map(normalizarCancion).filter(Boolean);
    else if (d.musica && typeof d.musica === 'object') migrarAntiguo(d.musica);   // datos de la versión anterior
    if (d.ejIntensidad && typeof d.ejIntensidad === 'object' && !Array.isArray(d.ejIntensidad)) ejIntensidad = d.ejIntensidad;
    if (d.ultimoMood === null || typeof d.ultimoMood === 'string') ultimoMood = d.ultimoMood;
    if (d.historial) { mezclarHistorial(d.historial); escribirLS(LS_HIST, historial); }
    asegurarMoods();
    escribirLS(LS_BIBLIO, biblioteca); escribirLS(LS_MOODS, moods); escribirLS(LS_INTENS, ejIntensidad); escribirLS(LS_ULTIMO, ultimoMood);
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
  // Entrar con correo y contraseña (la sesión queda guardada en este navegador)
  function entrarConClave() {
    var c = document.getElementById('nube-correo'), k = document.getElementById('nube-clave');
    var correo = c ? c.value.trim() : '', clave = k ? k.value : '';
    if (!nube.sb) return;
    if (!/^\S+@\S+\.\S+$/.test(correo) || !clave) { estadoNube('fuera', 'Escribe tu correo y tu contraseña'); return; }
    escribirLS('miSemana.correo', correo);
    estadoNube('entrando');
    nube.sb.auth.signInWithPassword({ email: correo, password: clave }).then(function (r) {
      if (r.error) estadoNube('fuera', /invalid/i.test(r.error.message) ? 'Correo o contraseña incorrectos' : 'No se pudo entrar: ' + r.error.message);
      // si entra, onAuthStateChange se encarga del resto
    });
  }
  // Poner o cambiar la contraseña (con la sesión iniciada)
  function guardarClave() {
    var k = document.getElementById('nube-clave-nueva'), clave = k ? k.value : '';
    if (!nube.sb || !nube.usuario) return;
    if (clave.length < 6) { nube.msgClave = 'Mínimo 6 caracteres'; pintarNube(); return; }
    nube.sb.auth.updateUser({ password: clave }).then(function (r) {
      if (r.error) { nube.msgClave = 'No se pudo guardar: ' + r.error.message; pintarNube(); return; }
      nube.cambiandoClave = false; nube.msgClave = '';
      estadoNube('ok', 'contraseña guardada ✓ · ya puedes entrar con ella en cualquier navegador');
    });
  }
  function salirNube() { if (nube.sb) nube.sb.auth.signOut(); nube.usuario = null; estadoNube('fuera'); }
  function pintarNube() {
    var el = document.getElementById('cfg-nube');
    if (!el) return;
    var h;
    if (nube.estado === 'local') h = '☁ Se guarda en este navegador. La sincronización en la nube funciona en la web publicada.';
    else if (nube.estado === 'conectando' || nube.estado === 'apagada') h = '☁ Conectando con la nube…';
    else if (nube.estado === 'fuera') h = '<span>☁ Entra en tu nube:</span>' +
      '<input id="nube-correo" type="email" value="' + esc(leerLS('miSemana.correo', 'nicolasrecobasystem@gmail.com')) + '" aria-label="Tu correo" autocomplete="username">' +
      '<input id="nube-clave" type="password" placeholder="Contraseña" aria-label="Contraseña" autocomplete="current-password">' +
      '<button type="button" class="btn-sec btn-entrar" data-acc="nube-clave-entrar">Entrar</button>' +
      '<button type="button" class="btn-link" data-acc="nube-entrar">¿Sin contraseña? Enviarme enlace</button>' +
      (nube.msg ? '<span class="aviso-cfg">' + esc(nube.msg) + '</span>' : '');
    else if (nube.estado === 'entrando') h = '☁ Entrando…';
    else if (nube.estado === 'enviando') h = '☁ Enviando enlace…';
    else if (nube.estado === 'enviado') h = '☁ Revisa tu correo y pulsa el enlace <b>en este mismo navegador</b>.';
    else h = '<span class="' + (nube.estado === 'error' ? 'aviso-cfg' : 'nube-ok') + '">☁ ' +
      (nube.usuario ? esc(nube.usuario.email) + ' · ' : '') + (nube.estado === 'sincronizando' ? 'sincronizando…' : esc(nube.msg)) + '</span>' +
      (nube.usuario ? (nube.cambiandoClave
        ? '<input id="nube-clave-nueva" type="password" placeholder="Nueva contraseña (mín. 6)" aria-label="Nueva contraseña" autocomplete="new-password">' +
          '<button type="button" class="btn-sec btn-entrar" data-acc="nube-clave-guardar">Guardar contraseña</button>' +
          '<button type="button" class="btn-link" data-acc="nube-clave-cancelar">Cancelar</button>' +
          (nube.msgClave ? '<span class="aviso-cfg">' + esc(nube.msgClave) + '</span>' : '')
        : '<button type="button" class="btn-sec" data-acc="nube-clave-poner">🔑 Poner contraseña</button>' +
          '<button type="button" class="btn-sec" data-acc="nube-salir">Cerrar sesión</button>') : '');
    el.innerHTML = h;
    if (nube.cambiandoClave) { var nk = document.getElementById('nube-clave-nueva'); if (nk) nk.focus(); }
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
    if (st.serie < c.series) fase('descanso', descansoActual());
    else {
      st.fase = 'hecho'; st.corriendo = false; st.quedan = 0;
      var yaEstaba = estaHecho(ejActual(), DIAS[st.sel].grupo);
      marcarHecho(ejActual(), DIAS[st.sel].grupo, true);
      if (yaEstaba) pintarTemporizador(); else pintar();
    }
  }
  function descansoActual() {
    var c = cfg() || {};
    return c.descansos && c.descansos.indexOf(st.desc) >= 0 ? st.desc : (c.descanso || 30);
  }
  function reiniciar() {
    parar();
    var c = cfg();
    if (c && c.opciones && c.opciones.indexOf(st.dur) < 0) st.dur = c.opciones[0];
    if (c && c.descansos && c.descansos.indexOf(st.desc) < 0) st.desc = c.descansos.indexOf(c.descanso) >= 0 ? c.descanso : c.descansos[0];
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
  // Nº de ejercicios del día a partir de sus bloques (ej. "10 · 4 bloques")
  function cuentaEjercicios(g) {
    var bl = bloquesDe(g), n = 0;
    bl.forEach(function (b) { n += ejs(b).length; });
    return n ? n + (bl.length > 1 ? ' · ' + bl.length + ' bloques' : '') : '';
  }
  function htmlSemana() {
    var d = DIAS[st.sel];
    var info = INFO_GRUPO[d.grupo] || {};
    // Fecha de hoy y fecha de cada día de esta semana (de domingo a sábado)
    var ahora = new Date();
    var fechaHoy = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    fechaHoy = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);
    function fechaDia(i) {
      var f = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - ahora.getDay() + i);
      return f.getDate() + ' ' + f.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    }
    function progresoDia(i) {
      var f = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - ahora.getDay() + i);
      var r = registroDe(claveFecha(f));
      if (!r) return '';
      var tot = r.total || totalDe(r.grupo), n = r.hechos.length;
      return n >= tot || r.terminado ? '<div class="prog-dia ok">✓</div>' : '<div class="prog-dia">' + n + '/' + tot + '</div>';
    }
    var dias = DIAS.map(function (x, i) {
      var cls = 'dia' + (i === st.sel ? ' activo' : '') + (i === hoy ? ' hoy' : '');
      return '<button type="button" class="' + cls + '" data-acc="dia" data-i="' + i + '" aria-pressed="' + (i === st.sel) + '" aria-label="' + esc(x.nombre + ', ' + x.grupo) + '">' +
        '<div class="cab"><div class="letra">' + esc(x.letra) + '</div><div class="cab-der">' + (i === hoy ? '<div class="etq-hoy">HOY</div>' : '') + progresoDia(i) + '</div></div>' +
        '<div><div class="nombre">' + esc(x.nombre) + ' <span class="fecha-dia">' + esc(fechaDia(i)) + '</span></div><div class="grupo">' + esc(x.grupo) + '</div></div></button>';
    }).join('');
    function campo(k, v) { return '<div class="campo"><div class="k">' + k + '</div><div class="v">' + esc(v || '[Por definir]') + '</div></div>'; }
    return '<div class="pantalla semana">' +
      '<div class="fila-sup"><div><div class="antetitulo">ELIGE UN DÍA</div><h1 class="titulo">MI SEMANA</h1></div>' +
      '<div class="fila-der"><div class="fecha-hoy">' + esc(fechaHoy) + '</div><div class="leyenda"><i></i>HOY</div>' +
      '<button type="button" class="btn-sec" data-acc="calendario">📅 Calendario</button>' +
      '<button type="button" class="btn-sec" data-acc="config">⚙ Configuración</button></div></div>' +
      '<div class="dias">' + dias + '</div>' +
      '<div class="detalle"><div class="izq"><div class="antetitulo">' + esc(d.nombre.toUpperCase()) + '</div><div class="grande">' + esc(d.grupo.toUpperCase()) + '</div></div>' +
      '<div class="campos">' + campo('DURACIÓN', info.duracion) + campo('EJERCICIOS', info.ejercicios || cuentaEjercicios(d.grupo)) + campo('MATERIAL', info.material) + campo('ENFOQUE', info.enfoque) + '</div>' +
      '<button type="button" class="btn-start" data-acc="start" aria-label="Empezar el entrenamiento">START</button></div>' +
      '</div>';
  }

  // ---------- TU PARED: esquema del equipo con el ancla que usa el ejercicio ----------
  var ANCLAS = { barra: 'Barra', mosqueton: 'Mosquetón de la barra', alta: 'Ancla alta', media: 'Ancla media', baja: 'Ancla baja' };
  function svgPared(a) {
    var NAR = '#F2913D', APAG = '#4A5059';
    function col(k) { return a === k ? NAR : APAG; }
    function txt(k) { return a === k ? NAR : '#9EA3AA'; }
    // Animación de lo que se usa: dos ondas que se expanden + flecha que empuja hacia el punto
    function halo(k, cx, cy) {
      if (a !== k) return '';
      function onda(ini) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="8" stroke="' + NAR + '" stroke-width="2.5" fill="none" opacity="0">' +
          '<animate attributeName="r" values="8;24" dur="1.6s" begin="' + ini + 's" repeatCount="indefinite"/>' +
          '<animate attributeName="opacity" values=".9;0" dur="1.6s" begin="' + ini + 's" repeatCount="indefinite"/></circle>';
      }
      return onda(0) + onda(0.8);
    }
    function flecha(k, cy) {
      if (a !== k) return '';
      return '<path d="M46 ' + cy + ' l9 -7 v14 z" fill="' + NAR + '">' +
        '<animateTransform attributeName="transform" type="translate" values="4 0;-2 0;4 0" dur=".9s" repeatCount="indefinite"/></path>';
    }
    var f = 'font-family="IBM Plex Mono, Consolas, monospace"';
    function etiqueta(k, y, nombre, sub) {
      return '<text x="68" y="' + y + '" fill="' + txt(k) + '" ' + f + ' font-size="12" font-weight="600" letter-spacing=".5">' + nombre + '</text>' +
        (sub ? '<text x="68" y="' + (y + 14) + '" fill="' + (a === k ? NAR : '#7C828A') + '" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">' + sub + '</text>' : '');
    }
    function punto(k, cy) {
      return halo(k, 32, cy) + '<circle cx="32" cy="' + cy + '" r="8" fill="' + col(k) + '">' +
        (a === k ? '<animate attributeName="r" values="7;10;7" dur=".9s" repeatCount="indefinite"/>' : '') + '</circle>' + flecha(k, cy);
    }
    var barraCol = a === 'barra' ? NAR : (a ? '#9EA3AA' : '#F4F1EA');
    return '<svg viewBox="0 0 150 380" fill="none" role="img" aria-label="Tu pared: barra arriba y anclas alta, media y baja' + (a ? '; este ejercicio usa: ' + ANCLAS[a] : '; este ejercicio no usa ancla') + '">' +
      '<rect x="6" y="8" width="52" height="352" rx="6" stroke="#4A5059" stroke-width="2"/>' +
      '<line x1="0" y1="362" x2="150" y2="362" stroke="#4A5059" stroke-width="2"/>' +
      (a === 'barra' ? '<rect x="8" y="16" width="48" height="26" rx="6" fill="' + NAR + '" opacity=".2"><animate attributeName="opacity" values=".05;.45;.05" dur=".9s" repeatCount="indefinite"/></rect>' +
        '<rect x="8" y="16" width="48" height="26" rx="6" stroke="' + NAR + '" stroke-width="2" fill="none"><animate attributeName="opacity" values="1;.2;1" dur=".9s" repeatCount="indefinite"/></rect>' : '') +
      '<g stroke="' + barraCol + '" stroke-width="5" stroke-linecap="round"><line x1="13" y1="34" x2="51" y2="34"/><line x1="22" y1="34" x2="22" y2="24"/><line x1="42" y1="34" x2="42" y2="24"/></g>' +
      halo('mosqueton', 32, 43) + '<circle cx="32" cy="43" r="4" stroke="' + (a === 'mosqueton' ? NAR : '#9EA3AA') + '" stroke-width="2.5"/>' + flecha('mosqueton', 43) +
      etiqueta('barra', 32, 'BARRA', '') +
      '<text x="68" y="48" fill="' + (a === 'mosqueton' ? NAR : '#7C828A') + '" ' + f + ' font-size="10"' + (a === 'mosqueton' ? ' font-weight="600"' : '') + '>mosquetón</text>' +
      punto('alta', 120) + etiqueta('alta', 118, 'ALTA', 'altura oreja') +
      punto('media', 205) + etiqueta('media', 203, 'MEDIA', 'cintura') +
      punto('baja', 315) + etiqueta('baja', 313, 'BAJA', 'pantorrilla') +
      '</svg>';
  }
  function htmlPared(ex) {
    var a = ex && ANCLAS[ex.ancla] ? ex.ancla : '';
    var uso = !ex ? '' : a ? 'Usa: <b>' + esc(ANCLAS[a]) + '</b>' : esc(ex.anclaNota || 'No usa ancla');
    return '<div class="panel p-pared"><div class="p-tit">TU PARED</div>' +
      '<div class="pared-fig">' + svgPared(ex ? a : '') + '</div>' +
      (uso ? '<div class="pared-uso' + (a ? ' on' : '') + '">' + uso + '</div>' : '') + '</div>';
  }

  function htmlCalentamiento() {
    var d = DIAS[st.sel], l = lista(), ex = ejActual();
    function vacio(t) { return '<div class="vacio">' + t + '</div>'; }
    function claveHtml(c) {
      return '<div class="clave"><div class="k">' + esc(c[0].toUpperCase()) + '</div><div class="v">' + esc(c[1]) + '</div></div>';
    }

    // Menú compacto de ejercicios (arriba)
    var nMenu = Math.max(1, l.length);
    var menu = Array.apply(null, Array(nMenu)).map(function (_, i) {
      var e = l[i];
      var hc = estaHecho(e, d.grupo);
      var cls = 'hueco' + (e ? ' lleno' : '') + (i === st.hueco ? ' activo' : '') + (hc ? ' hecho' : '');
      return '<button type="button" class="' + cls + '" data-acc="hueco" data-i="' + i + '" aria-pressed="' + (i === st.hueco) + '">' +
        '<div class="num">' + (hc ? '✓' : (i + 1)) + '</div>' +
        '<div class="n">' + esc(e ? e.nombre : '[Ejercicio]') + '</div>' +
        '<div class="d">' + esc(e ? e.dosis : '[Series × reps]') + '</div></button>';
    }).join('');

    // Panel 1: nombre, figura y claves
    var p1;
    if (ex) {
      var fig = ex.dibujo && DIBUJOS[ex.dibujo] ? '<div class="fig">' + DIBUJOS[ex.dibujo] + '</div>' : vacio('[Dibujo]');
      var hayInfo = ex.info && ex.info.length;
      p1 = '<div class="p-cab"><div class="p-nombre">' + esc(ex.nombre.toUpperCase()) + '</div><div class="p-dosis">' + esc(ex.dosis) +
        (hayInfo ? '<button type="button" class="btn-info' + (st.verInfo ? ' on' : '') + '" data-acc="info" aria-pressed="' + !!st.verInfo + '" aria-label="Qué trabaja y cómo progresar">ⓘ</button>' : '') + '</div></div>' +
        '<div class="p-ind"><span>' + esc(ex.indicacion || '') + '</span>' +
        (enlacesMusica(ex, d.grupo, st.mood).length ? '<button type="button" class="btn-musica" data-acc="musica" aria-label="Poner otra canción de este ejercicio">' +
          (musicaSonandoDe === d.grupo + '|' + ex.nombre ? '♪ Otra canción' : '♪ Música') + '</button>' : '') + '</div>' +
        '<div class="p-fila">' + (ex.ritmo ? '<div class="p-ritmo">RITMO · ' + esc(ex.ritmo.toUpperCase()) + '</div>' : '<span></span>') +
          (estaHecho(ex, d.grupo)
            ? '<button type="button" class="btn-hecho on" data-acc="hecho" aria-pressed="true" title="Pulsa para desmarcar">✓ Hecho hoy</button>'
            : '<button type="button" class="btn-hecho" data-acc="hecho" aria-pressed="false">Marcar hecho</button>') + '</div>' +
        (st.verInfo && hayInfo
          ? '<div class="info-lista">' + ex.info.map(function (x) {
              return '<div class="info-item"><div class="k">' + esc(x[0].toUpperCase()) + '</div><div class="v">' + esc(x[1]) + '</div></div>';
            }).join('') + '</div>'
          : '<div class="con">' + fig + '<div class="claves">' + (ex.claves || []).map(claveHtml).join('') + '</div></div>');
    } else {
      p1 = vacio('[Dibujo del ejercicio]');
    }

    // Panel 2: detalle del agarre
    var ag = ex && ex.agarre;
    var p2 = '<div class="p-tit">' + esc(ag && ag.titulo ? ag.titulo : 'AGARRE') + '</div>' + (ag
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
      '<div class="cab-paso"><span class="antetitulo">PASO ' + (st.bloque + 1) + ' DE ' + bloques().length + '</span><h2 class="titulo-m">' + esc(bloqueActual().titulo.toUpperCase()) + '</h2>' +
      (bloqueActual().nota ? '<span class="nota-bloque">' + esc(bloqueActual().nota) + '</span>' : '') + '</div>' +
      '<div class="barra-der">' + (st.mood ? '<div class="mood-lbl">♪ ' + esc(st.mood.toUpperCase()) + '</div>' : '') +
      '<div class="mono dia-lbl">' + esc(d.nombre.toUpperCase() + ' · ' + d.grupo.toUpperCase()) + '</div>' +
      '<div class="puntos">' + bloques().map(function (b, i) {
        return '<button type="button" class="punto' + (i === st.bloque ? ' on' : (i < st.bloque ? ' hecho' : '')) + '" data-acc="bloque" data-i="' + i + '" aria-label="Ir a ' + esc(b.titulo) + '"' + (i === st.bloque ? ' aria-current="step"' : '') + '></button>';
      }).join('') + '</div></div></div>' +
      '<div class="menu-ej" style="grid-template-columns:repeat(' + nMenu + ',minmax(0,1fr))">' + menu + '</div>' +
      '<div class="cuerpo"><div class="panel p-fig">' + p1 + '</div>' + htmlPared(ex) +
      '<div class="panel p-ag">' + p2 + '</div><div class="panel p-err">' + p3 + '</div></div>' +
      '<div class="pie"><div id="zona-temp" style="flex-grow:1;display:flex"></div>' +
      (st.bloque > 0 ? '<button type="button" class="btn-ant" data-acc="anterior" aria-label="Anterior: ' + esc(bloques()[st.bloque - 1].titulo) + '" title="Anterior: ' + esc(bloques()[st.bloque - 1].titulo) + '">←</button>' : '') +
      (st.bloque < bloques().length - 1
        ? '<button type="button" class="btn-sig on" data-acc="siguiente" aria-label="Siguiente: ' + esc(bloques()[st.bloque + 1].titulo) + '"><span class="sig-k">SIGUIENTE →</span><span class="sig-n">' + esc(bloques()[st.bloque + 1].titulo) + '</span></button>'
        : '<button type="button" class="btn-sig on fin" data-acc="terminar">Terminar ✓</button>') + '</div>' +
      '</div>';
  }

  // Ventana "¿Con qué mood entrenas?" al pulsar START
  function calMes() { var h = new Date(); return st.calMes || new Date(h.getFullYear(), h.getMonth(), 1); }
  function rachaActual() {
    var f = new Date(), n = 0;
    if (!registroDe(claveFecha(f))) f.setDate(f.getDate() - 1);   // hoy aún no cuenta
    while (registroDe(claveFecha(f)) && registroDe(claveFecha(f)).hechos.length) { n++; f.setDate(f.getDate() - 1); }
    return n;
  }
  function htmlCalendario() {
    var m = calMes(), hoyK = claveFecha(new Date());
    var nomMes = m.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    nomMes = nomMes.charAt(0).toUpperCase() + nomMes.slice(1);
    var ini = new Date(m.getFullYear(), m.getMonth(), 1 - m.getDay());   // la semana empieza en domingo
    var celdas = ['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(function (l) { return '<div class="cal-cab">' + l + '</div>'; }).join('');
    var entrenosMes = 0;
    for (var i = 0; i < 42; i++) {
      var f = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i), k = claveFecha(f);
      var fuera = f.getMonth() !== m.getMonth(), r = registroDe(k);
      var g = r ? r.grupo : DIAS[f.getDay()].grupo, tot = r ? (r.total || totalDe(g)) : totalDe(g);
      var n = r ? r.hechos.length : 0, estado = !r || !n ? (r && r.terminado ? 'ok' : '') : (n >= tot || r.terminado ? 'ok' : 'medio');
      if (!fuera && estado) entrenosMes++;
      var pasado = k < hoyK;
      var cls = 'cal-dia' + (fuera ? ' fuera' : '') + (k === hoyK ? ' hoy' : '') + (k === st.calSel ? ' sel' : '') +
        (estado ? ' ' + estado : (pasado ? ' vacio-dia' : ''));
      celdas += '<button type="button" class="' + cls + '" data-acc="cal-dia" data-k="' + k + '" aria-pressed="' + (k === st.calSel) + '">' +
        '<span class="n">' + f.getDate() + '</span><span class="g">' + esc(g) + '</span>' +
        (estado === 'ok' ? '<span class="marca">✓</span>' : estado === 'medio' ? '<span class="marca">' + n + '/' + tot + '</span>' : '') + '</button>';
    }
    // Detalle del día elegido
    var sel = st.calSel || hoyK, ps = sel.split('-'), fs = new Date(+ps[0], +ps[1] - 1, +ps[2]);
    var rs = registroDe(sel), gs = rs ? rs.grupo : DIAS[fs.getDay()].grupo;
    var fsTxt = fs.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    fsTxt = fsTxt.charAt(0).toUpperCase() + fsTxt.slice(1);
    var lista = '';
    bloquesDe(gs).forEach(function (b) {
      if (!ejs(b).length) return;
      lista += '<div class="cfg-grupo">' + esc(b.titulo.toUpperCase()) + '</div>';
      ejs(b).forEach(function (e) {
        var ok = rs && rs.hechos.indexOf(gs + '|' + e.nombre) >= 0;
        lista += '<div class="cal-ej' + (ok ? ' ok' : '') + '"><span class="c">' + (ok ? '✓' : '○') + '</span>' + esc(e.nombre) + '</div>';
      });
    });
    if (!lista) lista = '<div class="cfg-nota-mini">Este día aún no tiene rutina cargada.</div>';
    var nHechos = rs ? rs.hechos.length : 0, totS = rs ? (rs.total || totalDe(gs)) : totalDe(gs);
    var resumen = nHechos ? nHechos + ' de ' + totS + ' ejercicios' + (rs.terminado ? ' · terminado' : '') : (sel > hoyK ? 'Pendiente' : 'Sin entreno');
    return '<div class="pantalla calendario">' +
      '<div class="barra-sup"><button type="button" class="btn-sec" data-acc="volver">← Semana</button>' +
      '<div class="cab-paso"><span class="antetitulo">TU PROGRESO</span><h2 class="titulo-m">CALENDARIO</h2></div>' +
      '<div class="barra-der"><button type="button" class="btn-sec" data-acc="cal-mes" data-d="-1" aria-label="Mes anterior">‹</button>' +
      '<div class="cal-mes">' + esc(nomMes) + '</div>' +
      '<button type="button" class="btn-sec" data-acc="cal-mes" data-d="1" aria-label="Mes siguiente">›</button>' +
      '<button type="button" class="btn-sec" data-acc="cal-hoy">Hoy</button></div></div>' +
      '<div class="cal-cuerpo"><div class="panel cal-grid">' + celdas + '</div>' +
      '<div class="panel cal-detalle"><div class="antetitulo">' + esc(fsTxt.toUpperCase()) + '</div>' +
      '<div class="cal-grupo">' + esc(gs.toUpperCase()) + '</div><div class="cal-res">' + esc(resumen) + '</div>' +
      '<div class="cal-lista">' + lista + '</div>' +
      '<div class="cal-stats"><div><b>' + rachaActual() + '</b><span>días seguidos</span></div><div><b>' + entrenosMes + '</b><span>entrenos este mes</span></div></div>' +
      '</div></div></div>';
  }

  function htmlCompletado() {
    var d = DIAS[st.sel];
    return '<div class="velo" data-acc="cerrar-fin"><div class="modal fin" role="dialog" aria-modal="true" aria-labelledby="tit-fin">' +
      '<div class="antetitulo">' + esc(d.nombre.toUpperCase() + ' · ' + d.grupo.toUpperCase()) + '</div>' +
      '<h2 class="titulo-m" id="tit-fin">¡ENTRENO COMPLETADO!</h2>' +
      '<p class="fin-txt">' + bloquesDe(d.grupo).map(function (b) { return esc(b.titulo); }).join(' · ') + '</p>' +
      '<div class="modal-pie"><button type="button" class="btn-pri" data-acc="cerrar-fin">Volver a la semana</button></div></div></div>';
  }
  function htmlMood() {
    var d = DIAS[st.sel], l = lista();
    function cuenta(m) {
      var vistas = {};
      l.forEach(function (e) { enlacesMusica(e, d.grupo, m).forEach(function (u) { vistas[u] = 1; }); });
      return Object.keys(vistas).length;
    }
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
    var chips = moods.map(function (m, i) {
      return '<span class="chip"><span>' + esc(m) + '</span><button type="button" class="chip-x" data-acc="mood-borrar" data-i="' + i + '" aria-label="Borrar el mood ' + esc(m) + '">✕</button></span>';
    }).join('');
    var barraMoods = '<div class="cfg-moods"><div class="cfg-lbl">MOODS</div>' + chips +
      '<input id="mood-nuevo" type="text" maxlength="24" placeholder="Nuevo mood…" aria-label="Nombre del nuevo mood">' +
      '<button type="button" class="btn-sec" data-acc="mood-anadir">+ Añadir</button>' +
      '<span id="mood-aviso" class="aviso-cfg mono"></span></div>';
    var vista = st.cfgVista === 'ejercicios' ? 'ejercicios' : 'biblio';
    var filtros = '';
    if (vista === 'biblio') {
      var fm = st.filtroMood || '', fi = +st.filtroInt || 0;
      filtros = '<div class="cfg-filtros">' +
        '<label>MOOD<select id="filtro-mood"><option value="">Todos</option>' +
        moods.map(function (m) { return '<option value="' + esc(m) + '"' + (fm === m ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') +
        '<option value="-"' + (fm === '-' ? ' selected' : '') + '>Sin mood</option></select></label>' +
        '<label>INTENSIDAD<select id="filtro-int"><option value="0">Todas</option>' +
        [1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (fi === n ? ' selected' : '') + '>' + INTENSIDADES[n] + '</option>'; }).join('') +
        '</select></label></div>';
    }
    var pestanas = '<div class="cfg-tabs">' +
      '<button type="button" class="tab-mood' + (vista === 'biblio' ? ' activo' : '') + '" data-acc="cfg-vista" data-v="biblio" aria-pressed="' + (vista === 'biblio') + '">♫ Biblioteca<span>' + biblioteca.length + '</span></button>' +
      '<button type="button" class="tab-mood' + (vista === 'ejercicios' ? ' activo' : '') + '" data-acc="cfg-vista" data-v="ejercicios" aria-pressed="' + (vista === 'ejercicios') + '">Intensidad de los ejercicios</button>' +
      filtros + '</div>';
    return '<div class="pantalla config">' +
      '<div class="barra-sup"><button type="button" class="btn-sec" data-acc="volver">← Semana</button>' +
      '<div class="cab-paso"><span class="antetitulo">TU MÚSICA</span><h2 class="titulo-m">CONFIGURACIÓN</h2></div>' +
      '<div class="barra-der"><button type="button" class="btn-sec" data-acc="cfg-exportar">Descargar copia</button>' +
      '<button type="button" class="btn-sec" data-acc="cfg-importar">Cargar copia</button>' +
      '<input type="file" id="cfg-archivo" accept=".json,application/json" hidden></div></div>' +
      barraMoods + pestanas +
      '<div class="panel cfg-panel">' + (vista === 'biblio' ? htmlBiblioteca() : htmlEjercicios()) + '</div>' +
      '<div id="cfg-nube" class="cfg-nube"></div>' +
      '</div>';
  }
  function pillsIntensidad(acc, attrs, actual) {
    return '<div class="pills-int" role="group" aria-label="Intensidad">' + [1, 2, 3].map(function (n) {
      return '<button type="button" class="pill-int n' + n + (n === actual ? ' on' : '') + '" data-acc="' + acc + '" ' + attrs +
        ' data-n="' + n + '" aria-pressed="' + (n === actual) + '">' + INTENSIDADES[n] + '</button>';
    }).join('') + '</div>';
  }
  // Biblioteca: cada canción con sus moods y su intensidad
  function htmlBiblioteca() {
    var herr = '<div class="biblio-herr">' +
      (EMBEBIDO && nube.usuario
        ? '<label class="btn-sec btn-subir">⬆ Subir canciones<input type="file" id="subir-audio" accept="audio/*" multiple hidden></label><span class="cfg-nota-mini">o arrástralas aquí</span>'
        : '<span class="cfg-nota-mini">' + (EMBEBIDO ? 'Entra con tu correo (abajo) para subir tus archivos.' : 'Los archivos se suben desde la web publicada.') + '</span>') +
      '<input id="yt-nuevo" type="url" placeholder="Pega un enlace de YouTube…" aria-label="Enlace de YouTube">' +
      '<button type="button" class="btn-sec" data-acc="yt-anadir">+ Añadir</button>' +
      '<span id="cfg-estado" class="cfg-nota-mini"></span></div>';
    var fm = st.filtroMood || '', fi = +st.filtroInt || 0;
    var visibles = biblioteca.filter(function (c) {
      return (!fm || (fm === '-' ? !c.moods.length : c.moods.indexOf(fm) >= 0)) && (!fi || c.intensidad === fi);
    });
    var filas = visibles.map(function (c) {
      var id = esc(c.id), arch = esArchivo(c.item);
      var pills = moods.map(function (m) {
        var on = c.moods.indexOf(m) >= 0;
        return '<button type="button" class="pill-mood' + (on ? ' on' : '') + '" data-acc="song-mood" data-id="' + id + '" data-m="' + esc(m) + '" aria-pressed="' + on + '">' + esc(m) + '</button>';
      }).join('');
      return '<div class="cancion' + (c.moods.length ? '' : ' sin-mood') + '">' +
        '<span class="icono" title="' + (arch ? 'Archivo' : 'YouTube') + '">' + (arch ? '♫' : '▶') + '</span>' +
        '<input class="song-nombre" data-id="' + id + '" value="' + esc(c.nombre) + '" maxlength="120" aria-label="Nombre de la canción">' +
        '<div class="moods-fila">' + (pills || '<span class="cfg-nota-mini">Crea un mood arriba</span>') + '</div>' +
        pillsIntensidad('song-int', 'data-id="' + id + '"', c.intensidad) +
        '<button type="button" class="btn-ico" data-acc="song-probar" data-id="' + id + '" aria-label="Probar ' + esc(c.nombre) + '">▶</button>' +
        '<button type="button" class="btn-ico" data-acc="song-quitar" data-id="' + id + '" aria-label="Quitar ' + esc(c.nombre) + '">✕</button></div>';
    }).join('');
    var vacio = !biblioteca.length ? '<div class="vacio">Tu biblioteca está vacía: sube canciones o pega enlaces de YouTube.</div>'
      : '<div class="vacio">Ninguna canción con ese filtro.</div>';
    var sinMood = biblioteca.filter(function (c) { return !c.moods.length; }).length;
    var aviso = sinMood && moods.length
      ? '<div class="biblio-aviso">⚠ ' + sinMood + (sinMood === 1 ? ' canción no tiene' : ' canciones no tienen') +
        ' mood: solo suenan con «Ninguno». Toca el mood en cada una (se pone naranja) o usa la barra de abajo.</div>' : '';
    var masivo = visibles.length > 1
      ? '<div class="biblio-masivo"><span class="cfg-lbl">A LAS ' + visibles.length + ' DE LA LISTA:</span>' +
        moods.map(function (m) { return '<button type="button" class="pill-mood" data-acc="masivo-mood" data-m="' + esc(m) + '">+ ' + esc(m) + '</button>'; }).join('') +
        '<span class="cfg-lbl sep">INTENSIDAD</span>' +
        [1, 2, 3].map(function (n) { return '<button type="button" class="pill-int n' + n + ' suelta" data-acc="masivo-int" data-n="' + n + '">' + INTENSIDADES[n] + '</button>'; }).join('') +
        '</div>' : '';
    return herr + aviso + masivo + '<div class="biblio-lista">' + (filas || vacio) + '</div>';
  }
  // Intensidad de cada ejercicio y cuántas canciones le tocan por mood
  function htmlEjercicios() {
    var filas = '', ultimo = '';
    todosLosEjercicios().forEach(function (x) {
      var cab = x.grupo + ' · ' + x.bloque;
      if (cab !== ultimo) { filas += '<div class="cfg-grupo">' + esc(cab.toUpperCase()) + '</div>'; ultimo = cab; }
      var n = intensidadDeClave(x.clave);
      var cuentas = moods.map(function (m) {
        var c = biblioteca.filter(function (s) { return s.moods.indexOf(m) >= 0 && s.intensidad === n; }).length;
        return '<span' + (c ? ' class="on"' : '') + '>' + esc(m) + ' ' + c + '</span>';
      }).join(' · ');
      filas += '<div class="ej-fila"><div class="n">' + esc(x.ej.nombre) + '</div>' +
        pillsIntensidad('ej-int', 'data-clave="' + esc(x.clave) + '"', n) + '<div class="ej-cuentas">' + cuentas + '</div></div>';
    });
    return '<div class="cfg-nota-mini">Al entrenar suena una canción del mood elegido con la misma intensidad que el ejercicio. Si no hay ninguna, suena otra de ese mood.</div>' +
      '<div class="biblio-lista">' + (filas || '<div class="vacio">Todavía no hay ejercicios cargados.</div>') + '</div>';
  }
  function actualizarEstadoCfg(msg) { var el = document.getElementById('cfg-estado'); if (el) el.innerHTML = msg || ''; }
  function moodsDelFiltro() {
    if (st.filtroMood && st.filtroMood !== '-') return [st.filtroMood];
    return moods.length === 1 ? [moods[0]] : [];
  }
  function anadirYouTube() {
    var inp = document.getElementById('yt-nuevo'), u = inp ? inp.value.trim() : '';
    if (!esEnlace(u) || !datosYouTube(u)) { actualizarEstadoCfg('<span class="aviso-cfg">Pega un enlace de YouTube válido</span>'); return; }
    if (cancionPorItem(u)) { actualizarEstadoCfg('<span class="aviso-cfg">Ese enlace ya está en la biblioteca</span>'); return; }
    anadirCancion(u, null, moodsDelFiltro(), +st.filtroInt || 2);
    guardarTodo(); pintar();
    actualizarEstadoCfg('Añadido ✓ · marca su mood y su intensidad');
    var n = document.getElementById('yt-nuevo'); if (n) n.focus();
  }
  function nombreSeguro(n) {
    return n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
  }
  // Varias canciones a la vez: antes de subir, pregunta mood(s) e intensidad para todas
  function prepararSubida(files) {
    var lista = Array.prototype.slice.call(files);
    if (lista.length < 2) { subirArchivos(lista); return; }
    st.subida = { files: lista, moods: moodsDelFiltro(), intensidad: +st.filtroInt || 2 };
    pintar();
  }
  function htmlSubida() {
    var sb = st.subida, n = sb.files.length;
    var nombres = sb.files.slice(0, 4).map(function (f) { return '<li>' + esc(f.name.replace(/\.[^.]+$/, '')) + '</li>'; }).join('') +
      (n > 4 ? '<li class="mas">y ' + (n - 4) + ' más</li>' : '');
    return '<div class="velo" data-acc="sub-cancelar"><div class="modal subida" role="dialog" aria-modal="true" aria-labelledby="tit-sub">' +
      '<div class="antetitulo">SUBIR A TU BIBLIOTECA</div>' +
      '<h2 class="titulo-m" id="tit-sub">' + n + ' CANCIONES</h2>' +
      '<ul class="sub-nombres">' + nombres + '</ul>' +
      '<div class="cfg-lbl">MOOD · puedes marcar varios</div>' +
      '<div class="sub-fila">' + (moods.length ? moods.map(function (m) {
        var on = sb.moods.indexOf(m) >= 0;
        return '<button type="button" class="pill-mood' + (on ? ' on' : '') + '" data-acc="sub-mood" data-m="' + esc(m) + '" aria-pressed="' + on + '">' + esc(m) + '</button>';
      }).join('') : '<span class="cfg-nota-mini">Aún no tienes moods: créalos arriba en Configuración.</span>') + '</div>' +
      '<div class="cfg-lbl">INTENSIDAD</div>' +
      '<div class="sub-fila">' + pillsIntensidad('sub-int', '', sb.intensidad) + '</div>' +
      '<div class="modal-pie"><button type="button" class="btn-sec" data-acc="sub-cancelar">Cancelar</button>' +
      '<button type="button" class="btn-pri" data-acc="sub-ok">Subir ' + n + ' canciones</button></div>' +
      '</div></div>';
  }
  function subirArchivos(files, moodsElegidos, intensidadElegida) {
    if (!nube.sb || !nube.usuario) return;
    var lista = Array.prototype.slice.call(files), hechos = 0, fallos = 0, total = lista.length;
    var moodsIni = moodsElegidos || moodsDelFiltro(), inten = intensidadElegida || +st.filtroInt || 2;
    function siguiente() {
      if (!lista.length) {
        guardarTodo(); pintar();
        actualizarEstadoCfg(hechos + (hechos === 1 ? ' canción subida' : ' canciones subidas') +
          (fallos ? ' · <span class="aviso-cfg">' + fallos + ' con error</span>' : '') + ' ✓ · marca su mood y su intensidad');
        return;
      }
      var f = lista.shift();
      if (f.size > 50 * 1024 * 1024) { fallos++; siguiente(); return; }
      actualizarEstadoCfg('Subiendo ' + esc(f.name) + '… (' + (hechos + fallos + 1) + ' de ' + total + ')');
      var ruta = nube.usuario.id + '/' + Date.now() + '-' + nombreSeguro(f.name);
      var nombre = f.name.replace(/\.[^.]+$/, '').replace(/\|/g, ' ');
      nube.sb.storage.from('musica').upload(ruta, f, { contentType: f.type || 'audio/mpeg', upsert: false }).then(function (r) {
        if (r.error) { fallos++; siguiente(); return; }
        anadirCancion('sb:' + ruta + '|' + nombre, nombre, moodsIni, inten);
        hechos++; siguiente();
      });
    }
    siguiente();
  }
  function quitarCancion(id) {
    var c = cancionPorId(id);
    if (!c) return;
    if (!window.confirm('¿Quitar "' + c.nombre + '" de la biblioteca?' + (esArchivo(c.item) ? ' El archivo se borrará de la nube.' : ''))) return;
    biblioteca = biblioteca.filter(function (x) { return x.id !== id; });
    if (esArchivo(c.item) && nube.sb && nube.usuario) nube.sb.storage.from('musica').remove([rutaArchivo(c.item)]);
    guardarTodo(); pintar();
  }
  function avisoMood(t) { var a = document.getElementById('mood-aviso'); if (a) a.textContent = t; }
  function anadirMood() {
    var inp = document.getElementById('mood-nuevo');
    var nombre = inp ? inp.value.trim() : '';
    if (!nombre) { avisoMood('Escribe un nombre'); return; }
    if (moods.some(function (m) { return m.toLowerCase() === nombre.toLowerCase(); })) { avisoMood('Ese mood ya existe'); return; }
    moods.push(nombre); guardarTodo(); pintar();
    var n = document.getElementById('mood-nuevo'); if (n) n.focus();
  }
  function borrarMood(i) {
    var m = moods[i];
    if (m == null) return;
    var usos = biblioteca.filter(function (c) { return c.moods.indexOf(m) >= 0; }).length;
    if (usos && !window.confirm('¿Borrar el mood "' + m + '"? ' + usos + (usos === 1 ? ' canción dejará' : ' canciones dejarán') + ' de tenerlo (siguen en la biblioteca).')) return;
    biblioteca.forEach(function (c) { c.moods = c.moods.filter(function (x) { return x !== m; }); });
    moods.splice(i, 1);
    if (st.mood === m) st.mood = null;
    if (st.filtroMood === m) st.filtroMood = '';
    guardarTodo(); pintar();
  }
  function exportarCfg() {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(datosParaNube(), null, 2)], { type: 'application/json' }));
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
        if (o && Array.isArray(o.moods)) o.moods.forEach(function (m) { if (typeof m === 'string' && m.trim() && moods.indexOf(m) < 0) moods.push(m); });
        if (o && Array.isArray(o.biblioteca)) {
          o.biblioteca.forEach(function (x) {
            var c = normalizarCancion(x);
            if (!c) return;
            var ya = cancionPorItem(c.item);
            if (ya) { ya.nombre = c.nombre; ya.intensidad = c.intensidad; c.moods.forEach(function (m) { if (ya.moods.indexOf(m) < 0) ya.moods.push(m); }); }
            else biblioteca.push(c);
            n++;
          });
        } else {
          n = migrarAntiguo(o && o.musica && typeof o.musica === 'object' ? o.musica : o);   // copias antiguas
        }
        if (o && o.ejIntensidad && typeof o.ejIntensidad === 'object') Object.keys(o.ejIntensidad).forEach(function (k) { ejIntensidad[k] = o.ejIntensidad[k]; });
        asegurarMoods();
      } catch (e) { n = -1; }
      guardarTodo(); pintar();
      actualizarEstadoCfg(n < 0 ? '<span class="aviso-cfg">ese archivo no es una copia válida</span>' : 'copia cargada ✓ (' + n + ' canciones)');
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
      if (c.descansos && st.fase === 'espera' && !st.pausado) {
        pastillas = '<div class="t-dur"><span>DESCANSO</span>' + c.descansos.map(function (d) {
          return '<button type="button" class="pastilla' + (d === st.desc ? ' on' : '') + '" data-acc="desc" data-s="' + d + '" aria-pressed="' + (d === st.desc) + '">' + d + ' s</button>';
        }).join('') + '</div>';
      } else {
        pastillas = '<div class="t-dur"><span>' + c.reps + ' REPETICIONES · DESCANSO ' + descansoActual() + ' s</span></div>';
      }
    } else if (st.fase === 'espera' && st.serie === 1 && !st.pausado) {
      pastillas = '<div class="t-dur"><span>DURACIÓN</span>' + c.opciones.map(function (s) {
        return '<button type="button" class="pastilla' + (s === st.dur ? ' on' : '') + '" data-acc="dur" data-s="' + s + '" aria-pressed="' + (s === st.dur) + '">' + s + ' s</button>';
      }).join('') + '</div>';
    }
    zona.innerHTML = '<div class="temporizador">' +
      '<div class="t-estado"><div class="t-fase" style="color:' + col + '">' + textos[st.fase] + (st.pausado ? ' · PAUSA' : '') + '</div>' +
      '<div class="t-serie">SERIE ' + st.serie + ' / ' + c.series + (c.lado ? ' · ' + esc(String(c.lado).toUpperCase()) : '') + '</div></div>' +
      '<div class="t-tiempo" aria-live="polite" style="color:' + col + '">' + tiempo + '</div>' +
      '<div class="t-medio"><div class="t-barra"><i style="width:' + pct + '%;background:' + col + '"></i></div>' + pastillas + '</div>' +
      '<button type="button" class="btn-pri" data-acc="principal">' + etiqueta + '</button>' +
      '<button type="button" class="btn-rei" data-acc="reiniciar">Reiniciar</button></div>';
  }

  function pintar() {
    vista.innerHTML = st.pantalla === 'semana' ? htmlSemana() + (st.pidiendoMood ? htmlMood() : '') + (st.completado ? htmlCompletado() : '') : (st.pantalla === 'config' ? htmlConfig() + (st.subida ? htmlSubida() : '') : st.pantalla === 'calendario' ? htmlCalendario() : htmlCalentamiento());
    if (st.pidiendoMood) { var f = vista.querySelector('.mood.ultimo') || vista.querySelector('.mood'); if (f) f.focus(); }
    if (st.pantalla === 'calent') pintarTemporizador();
    if (st.pantalla === 'config') { actualizarEstadoCfg(); pintarNube(); }
  }

  function empezar() { musicaSonandoDe = ''; st.pidiendoMood = false; st.pantalla = 'calent'; st.bloque = 0; st.hueco = 0; reiniciar(); pintar(); }
  function irABloque(i) {
    if (i < 0 || i >= bloques().length) return;
    st.bloque = i; st.hueco = 0; st.verInfo = false; reiniciar(); pintar();
  }

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
    else if (acc === 'nube-clave-entrar') { entrarConClave(); }
    else if (acc === 'nube-clave-poner') { nube.cambiandoClave = true; nube.msgClave = ''; pintarNube(); }
    else if (acc === 'nube-clave-cancelar') { nube.cambiandoClave = false; pintarNube(); }
    else if (acc === 'nube-clave-guardar') { guardarClave(); }
    else if (acc === 'cerrar-mood') { if (b === ev.target || b.tagName === 'BUTTON') { st.pidiendoMood = false; pintar(); } }
    else if (acc === 'mood-anadir') { anadirMood(); }
    else if (acc === 'mood-borrar') { borrarMood(+b.getAttribute('data-i')); }
    else if (acc === 'volver') { reiniciar(); cerrarRep(); st.pantalla = 'semana'; pintar(); }
    else if (acc === 'rep-otra') { reproducir(rep.lista, rep.etiqueta); }
    else if (acc === 'rep-mini') { rep.mini = !rep.mini; pintarRep(); }
    else if (acc === 'rep-cerrar') { cerrarRep(); }
    else if (acc === 'hueco') { st.hueco = +b.getAttribute('data-i'); st.verInfo = false; reiniciar(); pintar(); }
    else if (acc === 'siguiente') { irABloque(st.bloque + 1); }
    else if (acc === 'anterior') { irABloque(st.bloque - 1); }
    else if (acc === 'info') { st.verInfo = !st.verInfo; pintar(); }
    else if (acc === 'bloque') { irABloque(+b.getAttribute('data-i')); }
    else if (acc === 'terminar') {
      var kf = claveFecha(new Date()), gf = DIAS[st.sel].grupo, rf = registroDe(kf) || { grupo: gf, hechos: [] };
      rf.grupo = gf; rf.total = totalDe(gf); rf.terminado = true; historial[kf] = rf; guardarHistorial();
      reiniciar(); cerrarRep(); st.pantalla = 'semana'; st.completado = true; pintar();
    }
    else if (acc === 'hecho') { var eh = ejActual(), gh = DIAS[st.sel].grupo; marcarHecho(eh, gh, !estaHecho(eh, gh)); pintar(); }
    else if (acc === 'calendario') { reiniciar(); cerrarRep(); st.pantalla = 'calendario'; st.calMes = null; st.calSel = claveFecha(new Date()); pintar(); }
    else if (acc === 'cal-mes') { var cm = calMes(); st.calMes = new Date(cm.getFullYear(), cm.getMonth() + (+b.getAttribute('data-d')), 1); pintar(); }
    else if (acc === 'cal-hoy') { st.calMes = null; st.calSel = claveFecha(new Date()); pintar(); }
    else if (acc === 'cal-dia') { st.calSel = b.getAttribute('data-k'); pintar(); }
    else if (acc === 'cerrar-fin') { if (b === ev.target || b.tagName === 'BUTTON') { st.completado = false; pintar(); } }
    else if (acc === 'desc') { st.desc = +b.getAttribute('data-s'); pintarTemporizador(); }
    else if (acc === 'dur') { st.dur = +b.getAttribute('data-s'); st.quedan = st.dur; st.total = st.dur; pintarTemporizador(); }
    else if (acc === 'config') { reiniciar(); st.pantalla = 'config'; pintar(); }
    else if (acc === 'cfg-vista') { st.cfgVista = b.getAttribute('data-v'); pintar(); }
    else if (acc === 'song-mood') {
      var cm = cancionPorId(b.getAttribute('data-id')), mm = b.getAttribute('data-m');
      if (cm) {
        var on = cm.moods.indexOf(mm) < 0;
        cm.moods = on ? cm.moods.concat([mm]) : cm.moods.filter(function (x) { return x !== mm; });
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
        guardarTodo();
      }
    }
    else if (acc === 'song-int') {
      var ci = cancionPorId(b.getAttribute('data-id')), ni = +b.getAttribute('data-n');
      if (ci) {
        ci.intensidad = ni;
        Array.prototype.forEach.call(b.parentNode.children, function (x) { var y = +x.getAttribute('data-n') === ni; x.classList.toggle('on', y); x.setAttribute('aria-pressed', y); });
        guardarTodo();
      }
    }
    else if (acc === 'song-probar') { var cp = cancionPorId(b.getAttribute('data-id')); if (cp) reproducir([cp.item], '♪ Prueba · ' + cp.nombre); }
    else if (acc === 'song-quitar') { quitarCancion(b.getAttribute('data-id')); }
    else if (acc === 'yt-anadir') { anadirYouTube(); }
    else if (acc === 'sub-mood' && st.subida) {
      var smm = b.getAttribute('data-m'), sm = st.subida.moods;
      st.subida.moods = sm.indexOf(smm) >= 0 ? sm.filter(function (x) { return x !== smm; }) : sm.concat([smm]);
      pintar();
    }
    else if (acc === 'sub-int' && st.subida) { st.subida.intensidad = +b.getAttribute('data-n'); pintar(); }
    else if (acc === 'sub-cancelar') { if (b === ev.target || b.tagName === 'BUTTON') { st.subida = null; pintar(); } }
    else if (acc === 'sub-ok' && st.subida) {
      var sp = st.subida; st.subida = null; pintar();
      subirArchivos(sp.files, sp.moods, sp.intensidad);
    }
    else if (acc === 'masivo-mood' || acc === 'masivo-int') {
      var fm2 = st.filtroMood || '', fi2 = +st.filtroInt || 0;
      var vis = biblioteca.filter(function (c) {
        return (!fm2 || (fm2 === '-' ? !c.moods.length : c.moods.indexOf(fm2) >= 0)) && (!fi2 || c.intensidad === fi2);
      });
      if (acc === 'masivo-mood') { var mm2 = b.getAttribute('data-m'); vis.forEach(function (c) { if (c.moods.indexOf(mm2) < 0) c.moods.push(mm2); }); }
      else { var nn2 = +b.getAttribute('data-n'); vis.forEach(function (c) { c.intensidad = nn2; }); }
      guardarTodo(); pintar();
      actualizarEstadoCfg('Aplicado a ' + vis.length + ' canciones ✓');
    }
    else if (acc === 'ej-int') { ejIntensidad[b.getAttribute('data-clave')] = +b.getAttribute('data-n'); guardarTodo(); pintar(); }
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
  app.addEventListener('change', function (ev) {
    if (ev.target.id === 'cfg-archivo' && ev.target.files && ev.target.files[0]) importarCfg(ev.target.files[0]);
    if (ev.target.id === 'subir-audio' && ev.target.files && ev.target.files.length) prepararSubida(ev.target.files);
    if (ev.target.id === 'filtro-mood') { st.filtroMood = ev.target.value; pintar(); }
    if (ev.target.id === 'filtro-int') { st.filtroInt = +ev.target.value; pintar(); }
    if (ev.target.classList.contains('song-nombre')) {
      var cn = cancionPorId(ev.target.getAttribute('data-id')), nv = ev.target.value.trim();
      if (cn && nv) { cn.nombre = nv.slice(0, 120); guardarTodo(); }
    }
  });

  // Arrastrar y soltar canciones en Configuración (Biblioteca)
  function esAudio(f) { return /^audio\//.test(f.type) || /\.(mp3|m4a|aac|wav|ogg|oga|flac|webm|opus)$/i.test(f.name); }
  function llevaArchivos(ev) { var t = ev.dataTransfer && ev.dataTransfer.types; return !!t && Array.prototype.indexOf.call(t, 'Files') >= 0; }
  var arrastres = 0;
  function marcarSoltar(on) {
    var pnl = document.querySelector('.cfg-panel');
    if (pnl) pnl.classList.toggle('soltando', on);
  }
  // Fuera de Configuración, que soltar un archivo no haga que el navegador lo abra
  window.addEventListener('dragover', function (ev) { if (llevaArchivos(ev)) ev.preventDefault(); });
  window.addEventListener('drop', function (ev) { if (llevaArchivos(ev)) ev.preventDefault(); });
  app.addEventListener('dragenter', function (ev) {
    if (st.pantalla !== 'config' || !llevaArchivos(ev)) return;
    arrastres++; marcarSoltar(true);
  });
  app.addEventListener('dragleave', function (ev) {
    if (st.pantalla !== 'config' || !llevaArchivos(ev)) return;
    arrastres = Math.max(0, arrastres - 1); if (!arrastres) marcarSoltar(false);
  });
  app.addEventListener('dragover', function (ev) {
    if (st.pantalla !== 'config' || !llevaArchivos(ev)) return;
    ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy';
  });
  app.addEventListener('drop', function (ev) {
    if (st.pantalla !== 'config' || !llevaArchivos(ev)) return;
    ev.preventDefault(); arrastres = 0; marcarSoltar(false);
    var fs = Array.prototype.filter.call(ev.dataTransfer.files || [], esAudio);
    if (st.cfgVista !== 'biblio') { st.cfgVista = 'biblio'; pintar(); }
    if (!fs.length) { actualizarEstadoCfg('<span class="aviso-cfg">Solo se pueden soltar archivos de audio (MP3, M4A…)</span>'); return; }
    if (!EMBEBIDO || !nube.usuario) { actualizarEstadoCfg('<span class="aviso-cfg">Entra con tu correo (abajo) para subir canciones</span>'); return; }
    prepararSubida(fs);
  });

  // Esc cierra la ventana de mood · Enter añade un mood nuevo
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && st.pidiendoMood) { st.pidiendoMood = false; pintar(); }
    if (ev.key === 'Escape' && st.completado) { st.completado = false; pintar(); }
    if (ev.key === 'Escape' && st.subida) { st.subida = null; pintar(); }
    if (ev.key === 'Enter' && ev.target.id === 'mood-nuevo') { ev.preventDefault(); anadirMood(); }
    if (ev.key === 'Enter' && (ev.target.id === 'nube-correo' || ev.target.id === 'nube-clave')) { ev.preventDefault(); entrarConClave(); }
    if (ev.key === 'Enter' && ev.target.id === 'nube-clave-nueva') { ev.preventDefault(); guardarClave(); }
    if (ev.key === 'Enter' && ev.target.id === 'yt-nuevo') { ev.preventDefault(); anadirYouTube(); }
    if (ev.key === 'Enter' && ev.target.classList && ev.target.classList.contains('song-nombre')) ev.target.blur();
  });

  // Barra espaciadora = iniciar / pausar en la pantalla de calentamiento
  document.addEventListener('keydown', function (ev) {
    if (ev.code === 'Space' && st.pantalla === 'calent' && cfg() && !(ev.target instanceof HTMLButtonElement)) {
      ev.preventDefault(); botonPrincipal();
    }
  });

  // ---------- relojes: Miami y Madrid, siempre visibles (fuera de la vista que se repinta) ----------
  var relojes = document.createElement('div');
  relojes.id = 'relojes';
  relojes.setAttribute('aria-label', 'Hora en Miami y en Madrid');
  app.appendChild(relojes);
  function horaEn(zona) {
    try { return new Date().toLocaleTimeString('es-ES', { timeZone: zona, hour: '2-digit', minute: '2-digit' }); } catch (e) { return '--:--'; }
  }
  function pintarRelojes() {
    relojes.innerHTML = '<span>MIAMI <b>' + horaEn('America/New_York') + '</b></span><span class="sep">·</span><span>MADRID <b>' + horaEn('Europe/Madrid') + '</b></span>';
  }
  pintarRelojes();
  setInterval(pintarRelojes, 15000);

  escalar();
  pintar();
  iniciarNube();
})();
