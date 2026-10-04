/* Chat general con DeepSeek (chat.html).
   La pregunta va a la función «chat» de Supabase, que llama a DeepSeek con la clave guardada allí
   y devuelve la respuesta a trozos (una línea JSON por trozo). Las conversaciones se guardan en
   chat_conversaciones / chat_mensajes y aquí se leen directamente (RLS: solo la cuenta de Diego). */
(function () {
  'use strict';
  var URL_NUBE = 'https://idjlewvzuzqywthrwibv.supabase.co';
  var CLAVE = 'sb_publishable_rgLetEILYTeBPvEqWcAyrA_82D41Npt';   // clave pública (publishable)
  var raiz = document.getElementById('chat');
  var sb = null, usuario = null, error = '';
  var convs = [], actual = null, msgs = [], enviando = null, montado = false;

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return raiz.querySelector(s); }
  function leer(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function guardarLocal(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
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
    return sb.from('chat_conversaciones').select('id, titulo, actualizado').order('actualizado', { ascending: false }).limit(200)
      .then(function (r) { if (r.error) throw r.error; convs = r.data || []; pintarLista(); })
      .catch(function (e) { error = e.message; pintarMsgs(); });
  }
  function abrir(id) {
    if (enviando) return;
    actual = id; msgs = []; error = '';
    guardarLocal('miSemana.chat', id || '');
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
    var resp = { rol: 'assistant', contenido: '', razonamiento: '', vivo: true };
    msgs.push(resp);
    var ctrl = new AbortController();
    enviando = ctrl; pintarPie(); pintarMsgs(true);
    sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(URL_NUBE + '/functions/v1/chat', {
        method: 'POST', signal: ctrl.signal,
        headers: { Authorization: 'Bearer ' + tok, apikey: CLAVE, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, conversacion_id: actual, pensar: pensar }),
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
      '<header class="c-top"><div><div class="c-ante">MI SEMANA · DEEPSEEK</div><h1 class="c-tit">CHAT</h1></div>' +
      '<div class="c-top-der"><button type="button" class="c-sec c-solo-movil" data-a="lista">☰</button>' +
      '<button type="button" class="c-sec" data-a="nueva">＋<span class="c-nueva-txt"> Nueva</span></button>' +
      '<a class="c-sec" href="./">← App</a></div></header>' +
      '<div class="c-cuerpo"><nav class="c-lista" id="c-lista"></nav>' +
      '<main class="c-main"><div class="c-msgs" id="c-msgs"></div>' +
      '<div class="c-pie"><div class="c-caja"><textarea id="c-texto" rows="1" placeholder="Escribe un mensaje…" enterkeyhint="send"></textarea>' +
      '<button type="button" class="c-pri" id="c-boton" data-a="enviar">Enviar</button></div>' +
      '<div class="c-opc"><label><input type="checkbox" id="c-pensar"> Pensar a fondo (más lento)</label><span>Enter envía · Mayús+Enter salto de línea</span></div></div></main></div>';
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
    return h + '</div>';
  }
  function pintarMsgs(bajar) {
    if (!montado) return;
    var caja = $('#c-msgs');
    caja.innerHTML = (msgs.length ? msgs.map(htmlMsg).join('') :
      (actual ? '<div class="c-vacio">Cargando…</div>' : '<div class="c-bienv"><b>¿En qué te ayudo?</b>Chat con DeepSeek. Tus conversaciones se guardan en tu nube.</div>')) +
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
  }
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
    if (a === 'copiar') {
      var cod = b.parentNode.querySelector('code').textContent;
      try { navigator.clipboard.writeText(cod); b.textContent = 'Copiado ✓'; } catch (e) { b.textContent = 'Cópialo a mano'; }
      setTimeout(function () { b.textContent = 'Copiar'; }, 1500);
    }
  });
  raiz.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && /c-clave|c-correo/.test(ev.target.id)) return entrar();
    if (ev.key === 'Enter' && ev.target.id === 'c-texto' && !ev.shiftKey && !ev.isComposing && matchMedia('(pointer:fine)').matches) { ev.preventDefault(); enviar(); }
  });
  raiz.addEventListener('input', function (ev) { if (ev.target.id === 'c-texto') ajustar(); });
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
      if (usuario && usuario.id !== antes) { cargarConvs().then(function () { var g = leer('miSemana.chat'); abrir(convs.some(function (c) { return c.id === g; }) ? g : null); }); }
    }, 0);
  });
  pintar();
})();
