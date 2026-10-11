/* Música (musica.html): listas de canciones con enlace, beat (BPM + ritmo), nota 1–5, 3 moods y colores para las luces.
   Se leen y escriben directamente en Supabase (mus_listas / mus_canciones, RLS: solo la cuenta de Diego).
   El agente escribe en las mismas tablas por la función «bot» (acciones musica_*); aquí se refresca cada 20 s.
   «Probar luces» manda la combinación a la función «govee» (accion escena). */
(function () {
  'use strict';
  var URL_NUBE = 'https://idjlewvzuzqywthrwibv.supabase.co';
  var CLAVE = 'sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt';   // clave pública (publishable)
  var ZONAS_DEF = [{ zona: 'escritorio', etiqueta: 'Escritorio' }, { zona: 'techo1', etiqueta: 'Techo 1' }, { zona: 'techo2', etiqueta: 'Techo 2' }, { zona: 'pizarra', etiqueta: 'Pizarra' }];
  var raiz = document.getElementById('musica');
  var sb = null, usuario = null, error = '';
  var listas = [], zonas = ZONAS_DEF.slice(), actual = leer('miSemana.musica.lista') || null, canciones = [], cargando = false;
  var filtro = { q: '', mood: '', min: 0, orden: 'posicion' };
  var editando = null, editandoLista = null, toastT = null, aplicando = '';

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return raiz.querySelector(s); }
  function leer(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function guardarLocal(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* */ } }
  function toast(t) {
    var el = document.querySelector('.m-toast'); if (!el) { el = document.createElement('div'); el.className = 'm-toast'; document.body.appendChild(el); }
    el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 3500);
  }
  function autor(q) { return !q ? '' : q === 'app' ? 'tú' : q.replace(/^bot:/, '🤖 '); }
  function urlSegura(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }

  // ---------- datos ----------
  function cargarListas() {
    return Promise.all([
      sb.from('mus_listas').select('id,nombre,descripcion,actualizado,creada_por').order('actualizado', { ascending: false }),
      sb.from('mus_canciones').select('lista_id'),
      sb.from('mus_zonas').select('zona,etiqueta,nombre_govee,orden').order('orden')
    ]).then(function (rs) {
      if (rs[0].error) { error = 'No se pudieron leer las listas: ' + rs[0].error.message; listas = []; return; }
      var n = {}; (rs[1].data || []).forEach(function (x) { n[x.lista_id] = (n[x.lista_id] || 0) + 1; });
      listas = (rs[0].data || []).map(function (l) { l.n = n[l.id] || 0; return l; });
      if (rs[2].data && rs[2].data.length) zonas = rs[2].data;
      if (!listas.some(function (l) { return l.id === actual; })) actual = listas[0] ? listas[0].id : null;
      error = '';
    });
  }
  function cargarCanciones() {
    if (!actual) { canciones = []; return Promise.resolve(); }
    return sb.from('mus_canciones').select('*').eq('lista_id', actual).order('posicion').order('creado').then(function (r) {
      if (r.error) { error = 'No se pudieron leer las canciones: ' + r.error.message; return; }
      canciones = r.data || [];
    });
  }
  function recargar(silencio) {
    if (!usuario || cargando) return Promise.resolve();
    cargando = true;
    return cargarListas().then(cargarCanciones).then(function () { cargando = false; if (!silencio || !editando) pintar(); }, function () { cargando = false; });
  }
  function guardarCancion(id, cambios) {
    cambios.editada_por = 'app'; cambios.actualizado = new Date().toISOString();
    return sb.from('mus_canciones').update(cambios).eq('id', id).select().single().then(function (r) {
      if (r.error) { toast('⚠ ' + r.error.message); return null; }
      canciones = canciones.map(function (c) { return c.id === id ? r.data : c; });
      return r.data;
    });
  }
  function tocarLista() { if (actual) sb.from('mus_listas').update({ actualizado: new Date().toISOString() }).eq('id', actual).then(function () {}); }

  // ---------- luces ----------
  function aplicarLuces(c) {
    var luces = zonas.filter(function (z) { return c.luces && c.luces[z.zona]; }).map(function (z) { return { nombre_govee: z.nombre_govee || z.etiqueta, etiqueta: z.etiqueta, color: c.luces[z.zona] }; });
    if (!luces.length) return toast('Esta canción no tiene colores de luces');
    aplicando = c.id; pintar();
    sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(URL_NUBE + '/functions/v1/govee', { method: 'POST', headers: { Authorization: 'Bearer ' + tok, apikey: CLAVE, 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'escena', luces: luces }) });
    }).then(function (r) { return r.json(); }).then(function (d) {
      aplicando = ''; pintar();
      if (d.error) return toast('⚠ ' + d.error);
      var mal = (d.luces || []).filter(function (x) { return !x.ok; });
      toast(mal.length ? '⚠ No respondió: ' + mal.map(function (x) { return x.luz + (x.error ? ' (' + x.error + ')' : ''); }).join(', ') : '💡 Luces de «' + c.titulo + '» aplicadas');
    }, function () { aplicando = ''; pintar(); toast('⚠ No se pudo hablar con las luces'); });
  }

  // ---------- pintar ----------
  function visibles() {
    var q = filtro.q.trim().toLowerCase();
    var l = canciones.filter(function (c) {
      if (filtro.mood && (c.moods || []).indexOf(filtro.mood) < 0) return false;
      if (filtro.min && (c.nota || 0) < filtro.min) return false;
      if (q && (c.titulo + ' ' + (c.artista || '') + ' ' + (c.ritmo || '') + ' ' + (c.moods || []).join(' ')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var o = filtro.orden;
    l.sort(function (a, b) {
      if (o === 'nota') return (b.nota || 0) - (a.nota || 0) || a.posicion - b.posicion;
      if (o === 'bpm') return (a.bpm || 999) - (b.bpm || 999);
      if (o === 'recientes') return a.actualizado < b.actualizado ? 1 : -1;
      return a.posicion - b.posicion;
    });
    return l;
  }
  function estrellas(c) {
    var h = '<span class="m-estrellas" role="group" aria-label="Tu nota">';
    for (var i = 1; i <= 5; i++) h += '<button type="button" class="m-estrella' + ((c.nota || 0) >= i ? ' on' : '') + '" data-a="nota" data-id="' + c.id + '" data-v="' + i + '" aria-label="' + i + ' de 5">★</button>';
    return h + '</span>';
  }
  function filaCancion(c, i, total) {
    var u = urlSegura(c.url);
    return '<article class="m-c" data-id="' + c.id + '">' +
      '<div class="m-num">' + (i + 1) + '</div>' +
      '<div class="m-info"><div class="m-titulo"><b>' + esc(c.titulo) + '</b>' + (c.artista ? '<span>' + esc(c.artista) + '</span>' : '') + '</div>' +
        '<div class="m-meta">' + (c.bpm ? '<span class="m-bpm">' + c.bpm + ' BPM</span>' : '') + (c.ritmo ? '<span class="m-ritmo">' + esc(c.ritmo) + '</span>' : '') + estrellas(c) + '</div>' +
        '<div class="m-meta">' + (c.moods || []).map(function (m) { return '<span class="m-mood">' + esc(m) + '</span>'; }).join('') +
          (c.editada_por ? '<span class="m-autor">' + esc(autor(c.editada_por)) + '</span>' : '') + '</div>' +
        (c.notas ? '<div class="m-autor" style="font-family:var(--sans);font-size:13px;color:var(--suave)">' + esc(c.notas) + '</div>' : '') + '</div>' +
      '<div class="m-luces">' + zonas.map(function (z) {
        var col = c.luces && c.luces[z.zona];
        return '<label class="m-luz" title="' + esc(z.etiqueta) + (col ? ' ' + col : ' (sin color)') + '"><i' + (col ? ' style="background:' + col + '"' : '') + '></i>' + esc(z.etiqueta) +
          '<input type="color" data-a="color" data-id="' + c.id + '" data-z="' + z.zona + '" value="' + (col || '#000000').toLowerCase() + '" aria-label="Color ' + esc(z.etiqueta) + '"></label>';
      }).join('') + '</div>' +
      '<div class="m-acciones">' +
        (u ? '<a class="m-ico" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" title="Abrir enlace" aria-label="Abrir enlace">▶</a>' : '<span class="m-ico" style="opacity:.25" title="Sin enlace">▶</span>') +
        '<button type="button" class="m-ico" data-a="luces" data-id="' + c.id + '" title="Probar luces"' + (aplicando === c.id ? ' disabled' : '') + ' aria-label="Probar luces">' + (aplicando === c.id ? '…' : '💡') + '</button>' +
        '<button type="button" class="m-ico" data-a="editar" data-id="' + c.id + '" title="Editar" aria-label="Editar">✎</button>' +
        (filtro.orden === 'posicion' ? '<button type="button" class="m-ico" data-a="subir" data-id="' + c.id + '" title="Subir"' + (i === 0 ? ' disabled' : '') + ' aria-label="Subir">↑</button>' +
          '<button type="button" class="m-ico" data-a="bajar" data-id="' + c.id + '" title="Bajar"' + (i === total - 1 ? ' disabled' : '') + ' aria-label="Bajar">↓</button>' : '') +
      '</div></article>';
  }
  function pintar() {
    if (!usuario) {
      raiz.innerHTML = '<div class="m-login"><div class="m-ante">Mi semana</div><h1 class="m-tit">MÚSICA</h1>' +
        '<p style="color:var(--suave)">Entra con tu cuenta para ver tus listas.</p>' +
        '<input id="m-correo" type="email" placeholder="Correo" autocomplete="username"><input id="m-clave" type="password" placeholder="Contraseña" autocomplete="current-password">' +
        '<button type="button" class="m-pri" data-a="entrar">Entrar</button>' + (error ? '<div class="m-aviso mal">' + esc(error) + '</div>' : '') + '</div>';
      return;
    }
    var l = listas.filter(function (x) { return x.id === actual; })[0];
    var moods = {}; canciones.forEach(function (c) { (c.moods || []).forEach(function (m) { moods[m] = (moods[m] || 0) + 1; }); });
    var vis = visibles();
    var h = '<header class="m-top"><div><div class="m-ante">Mi semana · listas del agente</div><h1 class="m-tit">MÚSICA</h1></div>' +
      '<div class="m-top-der"><a class="m-sec" href="./">← Inicio</a><a class="m-sec" href="reloj.html">⏱ Reloj</a><button type="button" class="m-sec" data-a="recargar" title="Recargar">↻</button></div></header>' +
      '<div class="m-cuerpo"><nav class="m-listas" aria-label="Listas">' +
      listas.map(function (x) { return '<button type="button" class="m-lista' + (x.id === actual ? ' on' : '') + '" data-a="lista" data-id="' + x.id + '"><b>' + esc(x.nombre) + '</b><small>' + x.n + '</small></button>'; }).join('') +
      '<button type="button" class="m-sec m-nueva" data-a="nueva-lista">＋ Nueva lista</button></nav><main>' +
      '<div class="m-select-lista"><select data-a="lista-sel" aria-label="Lista">' + listas.map(function (x) { return '<option value="' + x.id + '"' + (x.id === actual ? ' selected' : '') + '>' + esc(x.nombre) + ' (' + x.n + ')</option>'; }).join('') + '</select>' +
      '<button type="button" class="m-sec" data-a="nueva-lista" aria-label="Nueva lista">＋</button></div>' +
      (error ? '<div class="m-aviso mal">' + esc(error) + '</div>' : '');
    if (!l) {
      h += '<div class="m-vacio">' + (listas.length ? 'Elige una lista.' : 'Aún no hay listas. Crea una aquí o pídele a tu agente que añada canciones (acción <code>musica_agregar</code>).') + '</div>';
    } else {
      h += '<div class="m-cab"><div><h2>' + esc(l.nombre) + '</h2>' + (l.descripcion ? '<p>' + esc(l.descripcion) + '</p>' : '') +
        '<p class="m-autor">' + canciones.length + ' canciones' + (l.creada_por ? ' · creada por ' + esc(autor(l.creada_por)) : '') + '</p></div>' +
        '<div class="m-cab-btns"><button type="button" class="m-pri" data-a="nueva">＋ Canción</button><button type="button" class="m-sec" data-a="editar-lista">✎ Lista</button></div></div>' +
        '<div class="m-filtros"><input type="search" id="m-q" placeholder="Buscar título, artista, ritmo, mood…" value="' + esc(filtro.q) + '">' +
        '<select data-a="min" aria-label="Nota mínima"><option value="0">Todas las notas</option>' + [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '"' + (filtro.min === n ? ' selected' : '') + '>' + '★'.repeat(n) + (n < 5 ? ' o más' : '') + '</option>'; }).join('') + '</select>' +
        '<select data-a="orden" aria-label="Orden">' + [['posicion', 'Orden de la lista'], ['nota', 'Mejor nota'], ['bpm', 'BPM (lento → rápido)'], ['recientes', 'Recientes']].map(function (o) { return '<option value="' + o[0] + '"' + (filtro.orden === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
        (Object.keys(moods).length ? '<div class="m-chips" style="margin:-4px 0 14px">' + Object.keys(moods).sort().map(function (m) { return '<button type="button" class="m-chip' + (filtro.mood === m ? ' on' : '') + '" data-a="mood" data-v="' + esc(m) + '">' + esc(m) + ' · ' + moods[m] + '</button>'; }).join('') + '</div>' : '') +
        '<div class="m-canciones">' + (vis.length ? vis.map(function (c, i) { return filaCancion(c, i, vis.length); }).join('') : '<div class="m-vacio">' + (canciones.length ? 'Ninguna canción con estos filtros.' : 'Lista vacía. Añade una canción o pídeselo a tu agente.') + '</div>') + '</div>';
    }
    h += '</main></div>' + (editando ? modalCancion() : '') + (editandoLista ? modalLista() : '');
    var foco = document.activeElement && document.activeElement.id, pos = foco === 'm-q' ? document.activeElement.selectionStart : null;
    raiz.innerHTML = h;
    if (foco === 'm-q' && $('#m-q')) { $('#m-q').focus(); try { $('#m-q').setSelectionRange(pos, pos); } catch (e) { /* */ } }
  }
  function modalCancion() {
    var c = editando, nuevo = !c.id, lu = c.luces || {};
    return '<div class="m-modal" data-a="cerrar-fondo"><div class="m-caja" role="dialog" aria-modal="true" aria-labelledby="m-tit-ed"><h3 id="m-tit-ed">' + (nuevo ? 'NUEVA CANCIÓN' : 'EDITAR CANCIÓN') + '</h3>' +
      '<div class="m-form">' +
      '<label>Título*<input id="e-titulo" maxlength="200" value="' + esc(c.titulo) + '"></label>' +
      '<label>Artista<input id="e-artista" maxlength="200" value="' + esc(c.artista) + '"></label>' +
      '<label class="ancho">Enlace (YouTube, Spotify…)<input id="e-url" type="url" inputmode="url" placeholder="https://" value="' + esc(c.url) + '"></label>' +
      '<label>BPM<input id="e-bpm" type="number" min="20" max="300" inputmode="numeric" value="' + esc(c.bpm) + '"></label>' +
      '<label>Ritmo / estilo<input id="e-ritmo" maxlength="60" placeholder="house, reggaetón, lo-fi…" value="' + esc(c.ritmo) + '"></label>' +
      '<label class="ancho">Tu nota<span>' + [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" class="m-estrella' + ((c.nota || 0) >= i ? ' on' : '') + '" data-a="e-nota" data-v="' + i + '" style="font-size:28px">★</button>'; }).join('') +
        ' <button type="button" class="m-chip" data-a="e-nota" data-v="0">sin nota</button></span></label>' +
      '<label class="ancho">Moods (hasta 3)<span class="m-moods-in">' + [0, 1, 2].map(function (i) { return '<input id="e-mood' + i + '" maxlength="30" value="' + esc((c.moods || [])[i]) + '">'; }).join('') + '</span></label>' +
      '<div class="ancho" style="grid-column:1/-1"><div style="font-size:13px;color:var(--suave);margin-bottom:6px">Colores de las luces</div><div class="m-colores">' +
        zonas.map(function (z) {
          var col = lu[z.zona];
          return '<div class="m-color"><input type="color" id="e-c-' + z.zona + '" value="' + (col || '#ffffff').toLowerCase() + '"' + (col ? '' : ' class="sin"') + ' aria-label="' + esc(z.etiqueta) + '">' +
            '<label><input type="checkbox" id="e-u-' + z.zona + '"' + (col ? ' checked' : '') + '> ' + esc(z.etiqueta) + '</label></div>';
        }).join('') + '</div></div>' +
      '<label class="ancho">Notas<textarea id="e-notas" maxlength="1000">' + esc(c.notas) + '</textarea></label>' +
      '</div><div class="m-pie">' + (nuevo ? '<span></span>' : '<button type="button" class="m-sec m-peligro" data-a="borrar">Borrar canción</button>') +
      '<span style="display:flex;gap:8px"><button type="button" class="m-sec" data-a="cerrar">Cancelar</button><button type="button" class="m-pri" data-a="guardar">Guardar</button></span></div></div></div>';
  }
  function modalLista() {
    var l = editandoLista, nuevo = !l.id;
    return '<div class="m-modal" data-a="cerrar-fondo"><div class="m-caja" role="dialog" aria-modal="true"><h3>' + (nuevo ? 'NUEVA LISTA' : 'EDITAR LISTA') + '</h3><div class="m-form">' +
      '<label class="ancho">Nombre*<input id="l-nombre" maxlength="80" value="' + esc(l.nombre) + '"></label>' +
      '<label class="ancho">Descripción<textarea id="l-desc" maxlength="500">' + esc(l.descripcion) + '</textarea></label></div>' +
      '<div class="m-pie">' + (nuevo ? '<span></span>' : '<button type="button" class="m-sec m-peligro" data-a="borrar-lista">Borrar lista</button>') +
      '<span style="display:flex;gap:8px"><button type="button" class="m-sec" data-a="cerrar">Cancelar</button><button type="button" class="m-pri" data-a="guardar-lista">Guardar</button></span></div></div></div>';
  }

  // ---------- acciones ----------
  function leerForm() {
    var v = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
    var luces = {}; zonas.forEach(function (z) { var u = document.getElementById('e-u-' + z.zona); if (u && u.checked) luces[z.zona] = v('e-c-' + z.zona).toUpperCase(); });
    var moods = []; [0, 1, 2].forEach(function (i) { var m = v('e-mood' + i).toLowerCase(); if (m && moods.indexOf(m) < 0) moods.push(m); });
    return { titulo: v('e-titulo'), artista: v('e-artista') || null, url: v('e-url') || null, bpm: v('e-bpm') ? Math.round(+v('e-bpm')) : null,
      ritmo: v('e-ritmo') || null, nota: editando.nota || null, moods: moods, luces: luces, notas: v('e-notas') || null };
  }
  function guardarEdicion() {
    var d = leerForm();
    if (!d.titulo) return toast('Falta el título');
    if (d.url && !/^https?:\/\//i.test(d.url)) return toast('El enlace tiene que empezar por http:// o https://');
    if (d.bpm != null && (d.bpm < 20 || d.bpm > 300)) return toast('El BPM tiene que estar entre 20 y 300');
    var p;
    if (editando.id) p = guardarCancion(editando.id, d);
    else {
      var pos = canciones.reduce(function (m, c) { return Math.max(m, c.posicion || 0); }, 0) + 1;
      d.lista_id = actual; d.posicion = pos; d.creada_por = 'app'; d.editada_por = 'app';
      p = sb.from('mus_canciones').insert(d).select().single().then(function (r) { if (r.error) { toast('⚠ ' + r.error.message); return null; } canciones.push(r.data); return r.data; });
    }
    p.then(function (ok) { if (ok) { editando = null; tocarLista(); recargar(); toast('Guardado'); } });
  }
  function mover(id, paso) {
    var lista = visibles(), i = lista.findIndex(function (c) { return c.id === id; }), j = i + paso;
    if (i < 0 || j < 0 || j >= lista.length) return;
    var a = lista[i], b = lista[j], pa = a.posicion, pb = b.posicion;
    if (pa === pb) pb = pa + paso;
    Promise.all([guardarCancion(a.id, { posicion: pb }), guardarCancion(b.id, { posicion: pa })]).then(function () { pintar(); });
  }
  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a'), id = b.getAttribute('data-id');
    var c = id && canciones.filter(function (x) { return x.id === id; })[0];
    if (a === 'entrar') return entrar();
    if (a === 'recargar') return recargar();
    if (a === 'lista') { actual = id; guardarLocal('miSemana.musica.lista', id); filtro.mood = ''; return cargarCanciones().then(pintar); }
    if (a === 'nueva-lista') { editandoLista = { nombre: '', descripcion: '' }; pintar(); var n = $('#l-nombre'); if (n) n.focus(); return; }
    if (a === 'editar-lista') { var l = listas.filter(function (x) { return x.id === actual; })[0]; editandoLista = { id: l.id, nombre: l.nombre, descripcion: l.descripcion || '' }; return pintar(); }
    if (a === 'mood') { filtro.mood = filtro.mood === b.getAttribute('data-v') ? '' : b.getAttribute('data-v'); return pintar(); }
    if (a === 'nota' && c) { var v = +b.getAttribute('data-v'); return guardarCancion(c.id, { nota: c.nota === v ? null : v }).then(pintar); }
    if (a === 'luces' && c) return aplicarLuces(c);
    if (a === 'editar' && c) { editando = JSON.parse(JSON.stringify(c)); pintar(); return; }
    if (a === 'nueva') { editando = { titulo: '', moods: [], luces: {} }; pintar(); var t = $('#e-titulo'); if (t) t.focus(); return; }
    if (a === 'subir') return mover(id, -1);
    if (a === 'bajar') return mover(id, 1);
    if (a === 'e-nota') { var d = leerForm(); var nv = +b.getAttribute('data-v') || null; editando = Object.assign({}, editando, d, { nota: nv }); return pintar(); }
    if (a === 'cerrar' || (a === 'cerrar-fondo' && ev.target === b)) { editando = null; editandoLista = null; return pintar(); }
    if (a === 'guardar') return guardarEdicion();
    if (a === 'borrar') {
      if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.textContent = '¿Seguro? Pulsa otra vez'; return; }
      return sb.from('mus_canciones').delete().eq('id', editando.id).then(function (r) { if (r.error) return toast('⚠ ' + r.error.message); editando = null; recargar(); toast('Canción borrada'); });
    }
    if (a === 'guardar-lista') {
      var nom = ($('#l-nombre').value || '').trim(), desc = ($('#l-desc').value || '').trim() || null;
      if (!nom) return toast('Falta el nombre');
      var q = editandoLista.id ? sb.from('mus_listas').update({ nombre: nom, descripcion: desc, actualizado: new Date().toISOString() }).eq('id', editandoLista.id).select().single()
        : sb.from('mus_listas').insert({ nombre: nom, descripcion: desc, creada_por: 'app' }).select().single();
      return q.then(function (r) {
        if (r.error) return toast(/duplicate|unique/i.test(r.error.message) ? 'Ya hay una lista con ese nombre' : '⚠ ' + r.error.message);
        actual = r.data.id; guardarLocal('miSemana.musica.lista', actual); editandoLista = null; recargar();
      });
    }
    if (a === 'borrar-lista') {
      if (!b.dataset.confirma) { b.dataset.confirma = '1'; b.textContent = '¿Borrar la lista y sus canciones? Pulsa otra vez'; return; }
      return sb.from('mus_listas').delete().eq('id', editandoLista.id).then(function (r) { if (r.error) return toast('⚠ ' + r.error.message); editandoLista = null; actual = null; recargar(); toast('Lista borrada'); });
    }
  });
  raiz.addEventListener('input', function (ev) {
    if (ev.target.id === 'm-q') { filtro.q = ev.target.value; pintar(); }
    if (/^e-c-/.test(ev.target.id)) { var z = ev.target.id.slice(4), u = document.getElementById('e-u-' + z); if (u) u.checked = true; ev.target.classList.remove('sin'); }
  });
  raiz.addEventListener('change', function (ev) {
    var a = ev.target.getAttribute('data-a');
    if (a === 'min') { filtro.min = +ev.target.value; pintar(); }
    if (a === 'orden') { filtro.orden = ev.target.value; pintar(); }
    if (a === 'lista-sel') { actual = ev.target.value; guardarLocal('miSemana.musica.lista', actual); filtro.mood = ''; cargarCanciones().then(pintar); }
    if (a === 'color') {   // color cambiado directamente en la fila
      var id = ev.target.getAttribute('data-id'), z = ev.target.getAttribute('data-z'), c = canciones.filter(function (x) { return x.id === id; })[0];
      if (!c) return;
      var luces = Object.assign({}, c.luces || {}); luces[z] = ev.target.value.toUpperCase();
      guardarCancion(id, { luces: luces }).then(function () { pintar(); toast('Color guardado · pulsa 💡 para probarlo'); });
    }
  });
  raiz.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && (editando || editandoLista)) { editando = null; editandoLista = null; pintar(); }
    if (ev.key === 'Enter' && /m-clave|m-correo/.test(ev.target.id)) entrar();
    if (ev.key === 'Enter' && ev.target.id === 'l-nombre') { var g = raiz.querySelector('[data-a=guardar-lista]'); if (g) g.click(); }
  });
  function entrar() {
    var c = ($('#m-correo') || {}).value, p = ($('#m-clave') || {}).value;
    if (!c || !p) { error = 'Escribe correo y contraseña'; return pintar(); }
    sb.auth.signInWithPassword({ email: c.trim(), password: p }).then(function (r) { if (r.error) { error = 'No se pudo entrar: revisa correo y contraseña'; pintar(); } else error = ''; });
  }

  // ---------- arranque ----------
  try { sb = window.supabase.createClient(URL_NUBE, CLAVE); } catch (e) { raiz.innerHTML = '<div class="m-vacio">No se pudo cargar Supabase. Revisa internet y recarga.</div>'; return; }
  sb.auth.onAuthStateChange(function (ev, s) {
    var u = s && s.user;
    setTimeout(function () { var antes = usuario && usuario.id; usuario = u || null; pintar(); if (usuario && usuario.id !== antes) recargar(); }, 0);
  });
  // Lo que escribe el agente aparece solo: refresco cada 20 s si la página está a la vista y no estás editando
  setInterval(function () { if (usuario && document.visibilityState === 'visible' && !editando && !editandoLista && document.activeElement && document.activeElement.id !== 'm-q') recargar(true); }, 20000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && usuario && !editando && !editandoLista) recargar(true); });
  pintar();
})();
