/* Chat general (chat.html) con DeepSeek directo o cualquier modelo de OpenRouter.
   La pregunta va a la función «chat» de Supabase, que llama al proveedor con la clave guardada allí
   y devuelve la respuesta a trozos (una línea JSON por trozo). Las conversaciones se guardan en
   chat_conversaciones / chat_mensajes y aquí se leen directamente (RLS: solo la cuenta de Diego). */
(function () {
  'use strict';
  var URL_NUBE = 'https://idjlewvzuzqywthrwibv.supabase.co';
  var CLAVE = 'sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt';   // clave pública (publishable)
  var raiz = document.getElementById('chat');
  var sb = null, usuario = null, error = '';
  var convs = [], actual = null, msgs = [], enviando = null, montado = false;
  // Modelo elegido: {proveedor:'deepseek'} o {proveedor:'openrouter', modelo:'openai/…'}. Cada conversación recuerda el suyo.
  var sel = leerModelo(), catalogo = null, catInfo = {}, catError = '', filtro = { q: '', tipo: 'todos', orden: 'nuevos' };

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return raiz.querySelector(s); }
  function leer(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function guardarLocal(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  function leerModelo() {
    try { var m = JSON.parse(localStorage.getItem('miSemana.chat.modelo') || 'null'); if (m && (m.proveedor === 'deepseek' || (m.proveedor === 'openrouter' && m.modelo))) return m; } catch (e) { /* */ }
    return { proveedor: 'deepseek' };
  }
  function nombreModelo(m) {
    if (!m || m.proveedor !== 'openrouter') return 'DeepSeek directo';
    var c = catalogo && catalogo.filter(function (x) { return x.id === m.modelo; })[0];
    return c ? c.nombre : m.modelo;
  }
  function deEtiqueta(e) {   // 'openrouter:openai/gpt' → {proveedor, modelo}
    if (!e) return null;
    var i = e.indexOf(':');
    return e.slice(0, i) === 'openrouter' ? { proveedor: 'openrouter', modelo: e.slice(i + 1) } : { proveedor: 'deepseek' };
  }
  function llamar(cuerpo) {
    return sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(URL_NUBE + '/functions/v1/chat', { method: 'POST', headers: { Authorization: 'Bearer ' + tok, apikey: CLAVE, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
    }).then(function (r) { return r.json().then(function (d) { if (!r.ok || d.error) throw new Error(d.error || ('HTTP ' + r.status)); return d; }); });
  }
  function fecha(iso) {
    var d = new Date(iso), hoy = new Date();
    var o = d.toDateString() === hoy.toDateString() ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' };
    return d.toLocaleString('es-ES', o);
  }

  // ---------- Markdown seguro (se escapa todo y luego se dan formato a unas pocas marcas) ----------
  function enLinea(t) {
    var trozos = [];
    t = t.replace(/`([^`\n]+)`/g, function (_, c) { trozos.push('<code>' + c + '</code>'); return '\u0000' + (trozos.length - 1) + '\u0000'; });
    t = t.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, function (_, x, u) { return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + x + '</a>'; });
    t = t.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return t.replace(/\u0000(\d+)\u0000/g, function (_, i) { return trozos[+i]; });
  }
  function tabla(lineas) {
    var celdas = function (l) { return l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return enLinea(c.trim()); }); };
    var h = '<div class="c-tabla"><table><thead><tr>' + celdas(lineas[0]).map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    lineas.slice(2).forEach(function (l) { h += '<tr>' + celdas(l).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table></div>';
  }
  function md(texto) {
    var partes = esc(texto).split(/```/), html = '';
    partes.forEach(function (p, i) {
      if (i % 2) {   // bloque de código
        var nl = p.indexOf('\n'), cod = nl >= 0 ? p.slice(nl + 1) : p;
        html += '<div class="c-codigo"><button type="button" class="c-copiar" data-a="copiar">Copiar</button><pre><code>' + cod.replace(/\n$/, '') + '</code></pre></div>';
        return;
      }
      var lineas = p.split('\n'), j = 0, par = [];
      function cerrarPar() { if (par.length) { html += '<p>' + enLinea(par.join('<br>')) + '</p>'; par = []; } }
      while (j < lineas.length) {
        var l = lineas[j], m;
        if (!l.trim()) { cerrarPar(); j++; continue; }
        if ((m = l.match(/^(#{1,4})\s+(.*)/))) { cerrarPar(); html += '<h' + m[1].length + '>' + enLinea(m[2]) + '</h' + m[1].length + '>'; j++; continue; }
        if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { cerrarPar(); html += '<hr>'; j++; continue; }
        if (/^\s*\|.*\|\s*$/.test(l) && j + 1 < lineas.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lineas[j + 1]) && lineas[j + 1].indexOf('-') >= 0) {
          cerrarPar(); var t = [];
          while (j < lineas.length && /^\s*\|.*\|\s*$/.test(lineas[j])) t.push(lineas[j++]);
          html += tabla(t); continue;
        }
        if (/^\s*&gt;\s?/.test(l)) {
          cerrarPar(); var q = [];
          while (j < lineas.length && /^\s*&gt;\s?/.test(lineas[j])) q.push(lineas[j++].replace(/^\s*&gt;\s?/, ''));
          html += '<blockquote>' + enLinea(q.join('<br>')) + '</blockquote>'; continue;
        }
        var ul = /^\s*[-*•]\s+/, ol = /^\s*\d+[.)]\s+/;
        if (ul.test(l) || ol.test(l)) {
          cerrarPar(); var tipo = ul.test(l) ? 'ul' : 'ol', re = tipo === 'ul' ? ul : ol, items = [];
          while (j < lineas.length && re.test(lineas[j])) items.push(lineas[j++].replace(re, ''));
          html += '<' + tipo + '>' + items.map(function (x) { return '<li>' + enLinea(x) + '</li>'; }).join('') + '</' + tipo + '>'; continue;
        }
        par.push(l); j++;
      }
      cerrarPar();
    });
    return html;
  }

  // ---------- datos ----------
  function cargarConvs() {
    return sb.from('chat_conversaciones').select('id, titulo, actualizado, proveedor, modelo').order('actualizado', { ascending: false }).limit(200)
      .then(function (r) { if (r.error) throw r.error; convs = r.data || []; pintarLista(); })
      .catch(function (e) { error = e.message; pintarMsgs(); });
  }
  function abrir(id) {
    if (enviando) return;
    actual = id; msgs = []; error = '';
    guardarLocal('miSemana.chat', id || '');
    var cv = id && convs.filter(function (x) { return x.id === id; })[0];
    if (cv && cv.proveedor) { sel = cv.proveedor === 'openrouter' && cv.modelo ? { proveedor: 'openrouter', modelo: cv.modelo } : { proveedor: 'deepseek' }; pintarPie(); }
    $('.c-cuerpo').classList.remove('ver-lista');
    pintarLista(); pintarMsgs();
    if (!id) return $('#c-texto').focus();
    sb.from('chat_mensajes').select('id, rol, contenido, razonamiento, modelo, creado').eq('conversacion_id', id).order('id').limit(500)
      .then(function (r) { if (r.error) throw r.error; if (actual !== id) return; msgs = r.data || []; pintarMsgs(true); })
      .catch(function (e) { error = e.message; pintarMsgs(); });
  }
  function borrar(id) {
    var c = convs.filter(function (x) { return x.id === id; })[0];
    if (!c || !confirm('¿Borrar «' + c.titulo + '»?')) return;
    sb.from('chat_conversaciones').delete().eq('id', id).then(function (r) {
      if (r.error) { error = r.error.message; return pintarMsgs(); }
      convs = convs.filter(function (x) { return x.id !== id; });
      if (actual === id) abrir(null); else pintarLista();
    });
  }

  // ---------- enviar (respuesta a trozos) ----------
  function enviar() {
    var caja = $('#c-texto'), texto = caja.value.trim();
    if (!texto || enviando) return;
    caja.value = ''; ajustar();
    error = '';
    var pensar = $('#c-pensar').checked;
    msgs.push({ rol: 'user', contenido: texto });
    var resp = { rol: 'assistant', contenido: '', razonamiento: '', vivo: true, modelo: (sel.proveedor === 'openrouter' ? 'openrouter:' + sel.modelo : 'deepseek:') };
    msgs.push(resp);
    var ctrl = new AbortController();
    enviando = ctrl; pintarPie(); pintarMsgs(true);
    sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(URL_NUBE + '/functions/v1/chat', {
        method: 'POST', signal: ctrl.signal,
        headers: { Authorization: 'Bearer ' + tok, apikey: CLAVE, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, conversacion_id: actual, pensar: pensar, proveedor: sel.proveedor, modelo: sel.modelo }),
      });
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (d) {
        if (d.conversacion_id && !actual) { actual = d.conversacion_id; cargarConvs(); }
        throw new Error(d.error || ('HTTP ' + r.status));
      });
      var lector = r.body.getReader(), dec = new TextDecoder(), resto = '';
      function paso() {
        return lector.read().then(function (x) {
          if (x.done) return;
          resto += dec.decode(x.value, { stream: true });
          var i;
          while ((i = resto.indexOf('\n')) >= 0) {
            var l = resto.slice(0, i); resto = resto.slice(i + 1);
            if (!l.trim()) continue;
            var o; try { o = JSON.parse(l); } catch (e) { continue; }
            if (o.t === 'conv') { if (actual !== o.id) { actual = o.id; guardarLocal('miSemana.chat', o.id); cargarConvs(); } resp.modelo = o.modelo; }
            else if (o.t === 'razon') resp.razonamiento += o.x;
            else if (o.t === 'texto') resp.contenido += o.x;
            else if (o.t === 'error') error = o.x;
          }
          pintarVivo(resp);
          return paso();
        });
      }
      return paso();
    }).catch(function (e) {
      if (e.name !== 'AbortError') error = e.message;
    }).then(function () {
      resp.vivo = false; enviando = null;
      if (!resp.contenido && !resp.razonamiento) msgs.pop();
      pintarPie(); pintarMsgs(true); cargarConvs();
      if (matchMedia('(pointer:fine)').matches) $('#c-texto').focus();
    });
  }
  function parar() { if (enviando) enviando.abort(); }

  // ---------- pintar ----------
  function htmlLogin() {
    return '<div class="c-centro"><div class="c-ante">CHAT · MI SEMANA</div><h1 class="c-tit">Entra con tu cuenta</h1>' +
      '<div class="c-form"><input id="c-correo" type="email" autocomplete="username" placeholder="Correo" value="' + esc(leer('miSemana.correo')) + '">' +
      '<input id="c-clave" type="password" autocomplete="current-password" placeholder="Contraseña">' +
      '<div class="c-error">' + esc(error) + '</div><button type="button" class="c-pri" data-a="entrar">Entrar</button></div></div>';
  }
  function montar() {
    raiz.innerHTML =
      '<header class="c-top"><div><div class="c-ante">MI SEMANA · IA</div><h1 class="c-tit">CHAT</h1></div>' +
      '<div class="c-top-der"><button type="button" class="c-sec c-solo-movil" data-a="lista">☰</button>' +
      '<button type="button" class="c-sec" data-a="nueva">＋<span class="c-nueva-txt"> Nueva</span></button>' +
      '<a class="c-sec" href="./">← App</a></div></header>' +
      '<div class="c-cuerpo"><nav class="c-lista" id="c-lista"></nav>' +
      '<main class="c-main"><div class="c-msgs" id="c-msgs"></div>' +
      '<div class="c-pie"><div class="c-caja"><textarea id="c-texto" rows="1" placeholder="Escribe un mensaje…" enterkeyhint="send"></textarea>' +
      '<button type="button" class="c-pri" id="c-boton" data-a="enviar">Enviar</button></div>' +
      '<div class="c-opc"><button type="button" class="c-modelo" id="c-modelo" data-a="modelos"></button>' +
      '<label><input type="checkbox" id="c-pensar"> Pensar a fondo</label><span class="c-ayuda">Enter envía · Mayús+Enter salto de línea</span></div></div></main></div>' +
      '<div class="c-modal" id="c-modal" hidden></div>';
    $('#c-pensar').checked = leer('miSemana.chat.pensar') === '1';
    montado = true;
  }
  function pintar() {
    if (!usuario) { montado = false; raiz.innerHTML = htmlLogin(); return; }
    if (!montado) { montar(); pintarLista(); pintarMsgs(); pintarPie(); }
  }
  function pintarLista() {
    if (!montado) return;
    $('#c-lista').innerHTML = convs.length ? convs.map(function (c) {
      return '<div class="c-conv' + (c.id === actual ? ' on' : '') + '"><button type="button" class="c-abrir" data-a="abrir" data-id="' + c.id + '">' +
        esc(c.titulo) + '<small>' + fecha(c.actualizado) + '</small></button>' +
        '<button type="button" class="c-borrar" data-a="borrar" data-id="' + c.id + '" title="Borrar" aria-label="Borrar conversación">✕</button></div>';
    }).join('') : '<div class="c-vacio">Aún no hay conversaciones.</div>';
  }
  function htmlMsg(m) {
    if (m.rol === 'user') return '<div class="c-m user">' + esc(m.contenido) + '</div>';
    var h = '<div class="c-m assistant' + (m.vivo && !m.contenido ? ' c-cursor' : '') + '">';
    if (m.razonamiento) h += '<details class="c-razon"' + (m.vivo && !m.contenido ? ' open' : '') + '><summary>' + (m.vivo && !m.contenido ? 'Pensando…' : 'Razonamiento') + '</summary><div>' + esc(m.razonamiento) + '</div></details>';
    h += m.contenido ? md(m.contenido) : '';
    if (m.vivo && m.contenido) h += '<span class="c-cursor"></span>';
    if (m.modelo && !m.vivo) h += '<div class="c-meta">' + esc(nombreModelo(deEtiqueta(m.modelo))) + '</div>';
    return h + '</div>';
  }
  function pintarMsgs(bajar) {
    if (!montado) return;
    var caja = $('#c-msgs');
    caja.innerHTML = (msgs.length ? msgs.map(htmlMsg).join('') :
      (actual ? '<div class="c-vacio">Cargando…</div>' : '<div class="c-bienv"><b>¿En qué te ayudo?</b>Hablas con <span class="c-acento">' + esc(nombreModelo(sel)) + '</span>. Cámbialo abajo, en el botón del modelo.</div>')) +
      (error ? '<div class="c-error">' + esc(error) + '</div>' : '');
    if (bajar) caja.scrollTop = caja.scrollHeight;
  }
  function pintarVivo(resp) {   // solo se repinta el último mensaje, y se baja si ya estabas abajo
    var caja = $('#c-msgs'), abajo = caja.scrollHeight - caja.scrollTop - caja.clientHeight < 80;
    var todos = caja.querySelectorAll('.c-m.assistant'), ult = todos[todos.length - 1];
    var abierto = ult && ult.querySelector('details') && ult.querySelector('details').open;
    if (ult) {
      var nuevo = document.createElement('div'); nuevo.innerHTML = htmlMsg(resp); nuevo = nuevo.firstChild;
      var d = nuevo.querySelector('details'); if (d && abierto) d.open = true;
      ult.replaceWith(nuevo);
    }
    else pintarMsgs();
    if (error) pintarMsgs();
    if (abajo) caja.scrollTop = caja.scrollHeight;
  }
  function pintarPie() {
    if (!montado) return;
    var b = $('#c-boton');
    b.textContent = enviando ? '■ Parar' : 'Enviar';
    b.setAttribute('data-a', enviando ? 'parar' : 'enviar');
    $('#c-modelo').textContent = '🧠 ' + nombreModelo(sel) + ' ▾';
    $('#c-modelo').disabled = !!enviando;
  }

  // ---------- selector de modelo ----------
  function cargarCatalogo(forzar) {
    if (catalogo && !forzar) return Promise.resolve();
    try {
      var g = JSON.parse(localStorage.getItem('miSemana.chat.catalogo') || 'null');
      if (!forzar && g && g.info && g.info.openrouter && Date.now() - g.cuando < 6 * 3600e3) { catalogo = g.modelos; catInfo = g.info || {}; return Promise.resolve(); }
    } catch (e) { /* */ }
    catError = '';
    return llamar({ accion: 'modelos' }).then(function (d) {
      catalogo = d.modelos || []; catInfo = { deepseek: d.deepseek, openrouter: d.openrouter, modelo_deepseek: d.modelo_deepseek };
      guardarLocal('miSemana.chat.catalogo', JSON.stringify({ cuando: Date.now(), modelos: catalogo, info: catInfo }));
    }).catch(function (e) { catError = e.message; });
  }
  function precio(m) {
    if (m.entrada === 0 && m.salida === 0) return '<span class="c-gratis">Gratis</span>';
    if (m.entrada == null || m.entrada < 0) return 'precio variable';
    return '$' + m.entrada + ' / $' + m.salida + ' por M';
  }
  function ctx(n) { return !n ? '' : n >= 1e6 ? Math.round(n / 1e5) / 10 + 'M' : Math.round(n / 1000) + 'K'; }
  function abrirModelos() {
    var mo = $('#c-modal'); mo.hidden = false;
    mo.innerHTML = '<div class="c-caja-modal" role="dialog" aria-label="Elegir modelo">' +
      '<div class="c-modal-cab"><b>Elegir modelo</b><button type="button" class="c-sec" data-a="cerrar-modelos">✕</button></div>' +
      '<input type="search" id="c-buscar" placeholder="Buscar: gpt, claude, gemini, llama, free…" value="' + esc(filtro.q) + '" autocomplete="off">' +
      '<div class="c-filtros">' +
      [['todos', 'Todos'], ['gratis', 'Gratis'], ['razonan', 'Razonan']].map(function (f) { return '<button type="button" class="c-chip' + (filtro.tipo === f[0] ? ' on' : '') + '" data-a="filtro" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') +
      '<span class="c-sep"></span>' +
      [['nuevos', 'Nuevos'], ['nombre', 'A–Z'], ['barato', 'Más baratos']].map(function (f) { return '<button type="button" class="c-chip' + (filtro.orden === f[0] ? ' on' : '') + '" data-a="orden" data-v="' + f[0] + '">' + f[1] + '</button>'; }).join('') +
      '</div><div class="c-modelos" id="c-modelos"><div class="c-vacio">Cargando modelos…</div></div></div>';
    if (matchMedia('(pointer:fine)').matches) $('#c-buscar').focus();
    cargarCatalogo().then(pintarModelos);
  }
  function pintarModelos() {
    var caja = $('#c-modelos'); if (!caja) return;
    var q = filtro.q.trim().toLowerCase(), lista = (catalogo || []).filter(function (m) {
      if (filtro.tipo === 'gratis' && !(m.entrada === 0 && m.salida === 0)) return false;
      if (filtro.tipo === 'razonan' && !m.razona) return false;
      return !q || q.split(/\s+/).every(function (p) { return (m.id + ' ' + m.nombre).toLowerCase().indexOf(p) >= 0; });
    });
    lista.sort(filtro.orden === 'nombre' ? function (a, b) { return a.nombre.localeCompare(b.nombre); }
      : filtro.orden === 'barato' ? function (a, b) { return ((a.entrada || 0) + (a.salida || 0)) - ((b.entrada || 0) + (b.salida || 0)) || a.nombre.localeCompare(b.nombre); }
      : function (a, b) { return (b.creado || 0) - (a.creado || 0); });
    var total = lista.length, h = '';
    if (!q && filtro.tipo === 'todos') h += '<button type="button" class="c-opcion' + (sel.proveedor === 'deepseek' ? ' on' : '') + '" data-a="elegir" data-p="deepseek">' +
      '<span><b>DeepSeek directo</b><small>' + esc(catInfo.modelo_deepseek || 'deepseek-flash') + ' · con tu clave de DeepSeek</small></span><em>' + (catInfo.deepseek === false ? 'sin clave' : '') + '</em></button>';
    h += lista.slice(0, 300).map(function (m) {
      return '<button type="button" class="c-opcion' + (sel.proveedor === 'openrouter' && sel.modelo === m.id ? ' on' : '') + '" data-a="elegir" data-p="openrouter" data-m="' + esc(m.id) + '">' +
        '<span><b>' + esc(m.nombre) + (m.razona ? ' <i title="Puede razonar">🧠</i>' : '') + '</b><small>' + esc(m.id) + (m.ctx ? ' · ' + ctx(m.ctx) : '') + '</small></span><em>' + precio(m) + '</em></button>';
    }).join('');
    if (catError) h = '<div class="c-error">No se pudo cargar el catálogo: ' + esc(catError) + '</div>' + h;
    else if (catInfo.openrouter === false) h = '<div class="c-error">Falta el secreto «openrouter» en Supabase: verás los modelos pero no podrás usarlos.</div>' + h;
    caja.innerHTML = h + '<div class="c-pie-modal">' + total + ' modelos' + (total > 300 ? ' · se muestran 300, afina la búsqueda' : '') +
      ' · <button type="button" class="c-link" data-a="recargar-modelos">recargar lista</button></div>';
  }
  function elegir(p, m) {
    sel = p === 'openrouter' ? { proveedor: 'openrouter', modelo: m } : { proveedor: 'deepseek' };
    guardarLocal('miSemana.chat.modelo', JSON.stringify(sel));
    cerrarModelos(); pintarPie();
    if (!msgs.length) pintarMsgs();
  }
  function cerrarModelos() { var mo = $('#c-modal'); if (mo) { mo.hidden = true; mo.innerHTML = ''; } }
  function ajustar() { var t = $('#c-texto'); if (!t) return; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 200) + 'px'; }

  // ---------- eventos ----------
  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a');
    if (a === 'entrar') return entrar();
    if (a === 'enviar') return enviar();
    if (a === 'parar') return parar();
    if (a === 'nueva') return abrir(null);
    if (a === 'abrir') return abrir(b.getAttribute('data-id'));
    if (a === 'borrar') return borrar(b.getAttribute('data-id'));
    if (a === 'lista') return $('.c-cuerpo').classList.toggle('ver-lista');
    if (a === 'modelos') return abrirModelos();
    if (a === 'cerrar-modelos') return cerrarModelos();
    if (a === 'filtro') { filtro.tipo = b.getAttribute('data-v'); abrirModelos(); return; }
    if (a === 'orden') { filtro.orden = b.getAttribute('data-v'); abrirModelos(); return; }
    if (a === 'elegir') return elegir(b.getAttribute('data-p'), b.getAttribute('data-m'));
    if (a === 'recargar-modelos') { $('#c-modelos').innerHTML = '<div class="c-vacio">Cargando modelos…</div>'; return cargarCatalogo(true).then(pintarModelos); }
    if (a === 'copiar') {
      var cod = b.parentNode.querySelector('code').textContent;
      try { navigator.clipboard.writeText(cod); b.textContent = 'Copiado ✓'; } catch (e) { b.textContent = 'Cópialo a mano'; }
      setTimeout(function () { b.textContent = 'Copiar'; }, 1500);
    }
  });
  raiz.addEventListener('click', function (ev) { if (ev.target.id === 'c-modal') cerrarModelos(); });
  raiz.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && $('#c-modal') && !$('#c-modal').hidden) return cerrarModelos();
    if (ev.key === 'Enter' && /c-clave|c-correo/.test(ev.target.id)) return entrar();
    if (ev.key === 'Enter' && ev.target.id === 'c-texto' && !ev.shiftKey && !ev.isComposing && matchMedia('(pointer:fine)').matches) { ev.preventDefault(); enviar(); }
  });
  raiz.addEventListener('input', function (ev) {
    if (ev.target.id === 'c-texto') ajustar();
    if (ev.target.id === 'c-buscar') { filtro.q = ev.target.value; pintarModelos(); }
  });
  raiz.addEventListener('change', function (ev) { if (ev.target.id === 'c-pensar') guardarLocal('miSemana.chat.pensar', ev.target.checked ? '1' : '0'); });
  function entrar() {
    var c = ($('#c-correo') || {}).value, p = ($('#c-clave') || {}).value;
    if (!c || !p) { error = 'Escribe correo y contraseña'; return pintar(); }
    sb.auth.signInWithPassword({ email: c.trim(), password: p }).then(function (r) { if (r.error) { error = 'No se pudo entrar: revisa correo y contraseña'; pintar(); } else error = ''; });
  }

  // ---------- arranque ----------
  try { sb = window.supabase.createClient(URL_NUBE, CLAVE); } catch (e) { raiz.innerHTML = '<div class="c-vacio">No se pudo cargar Supabase. Revisa internet y recarga.</div>'; return; }
  sb.auth.onAuthStateChange(function (ev, s) {
    var u = s && s.user;
    setTimeout(function () {
      var antes = usuario && usuario.id; usuario = u || null; pintar();
      if (usuario && usuario.id !== antes) { cargarCatalogo().then(function () { pintarPie(); if (msgs.length) pintarMsgs(); }); cargarConvs().then(function () { var g = leer('miSemana.chat'); abrir(convs.some(function (c) { return c.id === g; }) ? g : null); }); }
    }, 0);
  });
  pintar();
})();
