/* =========================================================
   Inicio de la app DAW
   Lee window.DAW (data/datos.js) y pinta:
   resumen del día, portadas, calendario y temario. (Las tutorías están en tutorias.html.)
   ========================================================= */
(function () {
  'use strict';
  const D = window.DAW;
  if (!D) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:1rem">No se ha podido cargar data/datos.js</p>'); return; }

  /* ---------- Utilidades ---------- */
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ASIG = Object.fromEntries(D.asignaturas.map(a => [a.id, a]));
  const OTRO = { id: 'otro', siglas: 'Otro', corto: 'Personal', color: '#b3262d', tinta: '#ffffff' };
  const asig = id => ASIG[id] || OTRO;
  // Orden de las asignaturas (D.orden): portadas, leyenda y temario
  const posAsig = id => { const i = (D.orden || []).indexOf(id); return i < 0 ? 99 : i; };
  D.asignaturas.sort((a, b) => posAsig(a.id) - posAsig(b.id));
  D.temario = D.temario.map((t, i) => [t, i]).sort((p, q) => posAsig(p[0].asig) - posAsig(q[0].asig) || p[1] - q[1]).map(p => p[0]);

  // Fecha de hoy (se puede simular con ?hoy=2026-11-20 para probar)
  const qHoy = new URLSearchParams(location.search).get('hoy');
  const HOY = qHoy ? parseISO(qHoy) : startOfDay(new Date());

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseISO(s) { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function diffDays(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 864e5); }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtCorta = d => d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtNum = s => { if (!s || !/^\d{4}-/.test(s)) return s || ''; const [f, h] = s.split(' '); const [y, m, d] = f.split('-'); return d + '/' + m + (h ? ' ' + h : ''); };
  function cuando(d) {
    const n = diffDays(d, HOY);
    if (n === 0) return { txt: 'Hoy', cls: 'hoy-c' };
    if (n === 1) return { txt: 'Mañana', cls: 'pronto' };
    if (n > 1 && n <= 5) return { txt: 'Quedan ' + n + ' días', cls: 'pronto' };
    if (n > 5) return { txt: 'Quedan ' + n + ' días', cls: '' };
    if (n === -1) return { txt: 'Ayer', cls: 'tarde' };
    if (n < -1) return { txt: 'Hace ' + (-n) + ' días', cls: 'tarde' };
    return { txt: fmtCorta(d), cls: '' };
  }
  const dot = a => `<span class="dot" style="background:${a.color}"></span>`;
  const nomCorto = a => (a.cal && a.cal.nombre) || a.corto;   // mismo nombre que en la leyenda
  const tag = a => `<span class="asig-tag" style="background:${a.color};color:${a.tinta}" title="${esc(a.nombre || '')}">${esc(nomCorto(a))}</span>`;

  /* ---------- Entregas marcadas como hechas (se guardan en este navegador) ---------- */
  const KEY = 'daw-entregas-hechas';
  let hechas = {};
  try { hechas = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { hechas = {}; }
  const keyEnt = e => e.asig + '|' + e.texto + '|' + e.desde;
  const idEnt = e => e._id || keyEnt(e);
  // Temas del temario a los que se refiere una entrega del calendario ("UT1 y UT2" → temas 1 y 2)
  const temasDeEntrega = e => {
    if (!e || e.tipo === 'inicio' || e.asig === 'otro') return [];
    const nums = [...String(e.texto || '').matchAll(/UT\s*(\d+)/gi)].map(m => m[1]);
    return D.temario.filter(t => t.asig === e.asig && nums.includes(String(t.tema)));
  };
  const estaHecha = e => {
    const temas = temasDeEntrega(e);
    if (temas.length && temas.every(t => t.estado === 'Terminado' || !!t.tarea)) return true;   // hecha en el temario
    return (idEnt(e) in hechas) ? hechas[idEnt(e)] : !!e.hecho;
  };
  function setHecha(e, v) {
    hechas[idEnt(e)] = v;
    try { localStorage.setItem(KEY, JSON.stringify(hechas)); } catch (err) { /* sin almacenamiento */ }
  }

  /* ---------- Cabecera y saludo ---------- */
  $('#curso').textContent = D.curso;
  $('#grupo').textContent = D.grupo;

  /* ---------- Entregas (datos.js + cambios hechos en el calendario, guardados en este navegador) ---------- */
  // Cada entrega tiene un _id estable (asig|texto|desde original) para no perder su estado al moverla.
  const KEY_ENT = 'daw-entregas-cambios';   // { mod: {id: entrega}, del: [id], add: [entrega] }
  const CAMPOS_ENT = ['asig', 'texto', 'desde', 'hasta', 'tipo', 'fondo'];
  const limpiaEnt = e => Object.fromEntries(CAMPOS_ENT.filter(c => e[c] !== undefined && e[c] !== '' && e[c] !== null).map(c => [c, e[c]]));
  const ORIG_ENT = D.entregas.map(e => ({ ...e, _id: keyEnt(e) }));
  let cambiosEnt = { mod: {}, del: [], add: [] };
  try { cambiosEnt = { ...cambiosEnt, ...JSON.parse(localStorage.getItem(KEY_ENT) || '{}') }; } catch (e) { /* sin almacenamiento */ }
  const hayCambiosEnt = () => Object.keys(cambiosEnt.mod).length + cambiosEnt.del.length + cambiosEnt.add.length > 0;
  function guardarCambiosEnt() {
    try { localStorage.setItem(KEY_ENT, JSON.stringify(cambiosEnt)); } catch (err) { /* sin almacenamiento */ }
  }
  function listaEntregas() {
    const base = ORIG_ENT.filter(e => !cambiosEnt.del.includes(e._id))
      .map(e => cambiosEnt.mod[e._id] ? { ...limpiaEnt(cambiosEnt.mod[e._id]), hecho: e.hecho, _id: e._id } : e);
    return base.concat(cambiosEnt.add.map(e => ({ ...e })));
  }
  function guardarEntrega(id, datos) {
    const nueva = limpiaEnt(datos);
    const iAdd = cambiosEnt.add.findIndex(e => e._id === id);
    if (iAdd >= 0) cambiosEnt.add[iAdd] = { ...nueva, _id: id };
    else if (id) {
      const o = ORIG_ENT.find(e => e._id === id);
      if (o && JSON.stringify(limpiaEnt(o)) === JSON.stringify(nueva)) delete cambiosEnt.mod[id];
      else cambiosEnt.mod[id] = nueva;
    } else {
      id = 'n' + Date.now().toString(36);
      cambiosEnt.add.push({ ...nueva, _id: id });
    }
    guardarCambiosEnt();
    return id;
  }
  function borrarEntrega(id) {
    const iAdd = cambiosEnt.add.findIndex(e => e._id === id);
    if (iAdd >= 0) cambiosEnt.add.splice(iAdd, 1);
    else { delete cambiosEnt.mod[id]; if (!cambiosEnt.del.includes(id)) cambiosEnt.del.push(id); }
    guardarCambiosEnt();
  }

  let entregas = [];
  function recalcEntregas() {
    entregas = listaEntregas().map(e => ({ ...e, d: parseISO(e.hasta || e.desde) }));
  }
  recalcEntregas();
  const tutorias = D.videoconferencias.filter(v => v.fecha).map(v => ({ ...v, d: parseISO(v.fecha) })).sort((a, b) => a.d - b.d || a.inicio.localeCompare(b.inicio));

  /* ---------- Próximas entregas (fechas REALES: columna "Fin tarea" del temario) ---------- */
  // El calendario es solo para organizarse; los plazos de verdad son los del temario.
  const finReal = t => (t.fin && /^\d{4}-/.test(t.fin)) ? parseISO(t.fin) : null;
  const tareaHecha = t => t.estado === 'Terminado' || !!t.tarea;
  function pendientesTem() {
    return D.temario.filter(t => finReal(t) && !tareaHecha(t))
      .map(t => ({ t, a: asig(t.asig), d: finReal(t) })).sort((p, q) => p.d - q.d);
  }
  function pintarHoySub() {
    const pend = pendientesTem();
    const lTarde = pend.filter(p => p.d < HOY), lSemana = pend.filter(p => p.d >= HOY && diffDays(p.d, HOY) <= 7);
    const tarde = lTarde.length, semana = lSemana.length;
    // Al pasar el ratón por el contador se ve qué entregas son
    const quien = l => l.map(p => `${nomCorto(p.a)} · Tema ${p.t.tema} · ${fmtCorta(p.d)}`).join('\n');
    const temas = D.temario.filter(t => /^\d+$/.test(t.tema));
    const hechos = temas.filter(tareaHecha).length;
    const chip = (cls, ico, html, tit) => `<span class="stat ${cls}"${tit ? ` title="${esc(tit)}"` : ''}><span class="stat-ico" aria-hidden="true">${ico}</span>${html}</span>`;
    $('#hoySub').innerHTML = [
      tarde ? chip('st-tarde', '⚠️', `<b>${tarde}</b> fuera de plazo`, quien(lTarde)) : '',
      semana ? chip('st-semana', '⏰', `<b>${semana}</b> ${semana === 1 ? 'vence' : 'vencen'} esta semana`, quien(lSemana))
             : chip('st-libre', '✨', 'Semana libre de entregas'),
      chip('st-ok', '✅', `<b>${hechos}</b>/${temas.length} temas hechos`),
    ].join('');
  }
  const N_PROX = 4;   // mínimo visible; se muestran más si caben hasta abajo
  let verTodasProx = false;
  // Ajusta cuántas entregas se ven para que quepan en el panel (o muestra todas con "Mostrar más")
  function ajustarProx() {
    const ul = $('#proxEntregas'), mas = $('#proxMas');
    const items = [...ul.children].filter(li => !li.classList.contains('vacio'));
    items.forEach(li => { li.hidden = false; });
    ul.classList.toggle('todas', verTodasProx);
    if (!items.length) { mas.hidden = true; return; }
    if (verTodasProx) { mas.hidden = false; mas.textContent = 'Mostrar menos'; return; }
    mas.hidden = false;
    let ocultas = 0;
    const dashboard = ul.clientHeight > 0 && getComputedStyle(ul).overflowY !== 'visible';
    if (dashboard) {
      // escritorio: se ocultan las que no caben en el panel
      for (let i = items.length - 1; i >= Math.min(N_PROX, items.length) && ul.scrollHeight > ul.clientHeight + 1; i--) { items[i].hidden = true; ocultas++; }
    } else {
      items.slice(N_PROX + 2).forEach(li => { li.hidden = true; ocultas++; });
    }
    mas.hidden = !ocultas;
    mas.textContent = `Mostrar más (${ocultas})`;
  }
  window.addEventListener('resize', () => ajustarProx());
  function pintarEntregas() {
    pintarHoySub();
    const ul = $('#proxEntregas'), mas = $('#proxMas');
    const todas = pendientesTem();   // primero las atrasadas, luego las próximas
    const lista = todas;
    if (!lista.length) { ul.innerHTML = '<li class="vacio">No hay tareas pendientes. 🎉</li>'; mas.hidden = true; return; }
    ul.innerHTML = '';
    lista.forEach(({ t, a, d }) => {
      const c = cuando(d);
      const hora = (t.fin || '').slice(11);
      const ICO_RES = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>';
      const ICO_TEM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg>';
      const res = a.archivo && (a.resumidos || []).includes(Number(t.tema))
        ? `<a class="li-ico li-ico-res" href="${esc(a.archivo)}#tema-${t.tema}" style="--c:${a.color};--t:${a.tinta}" title="Resumen del tema ${esc(t.tema)}" aria-label="Resumen del tema ${esc(t.tema)}">${ICO_RES}</a>` : '<span class="li-ico li-ico-vacio" aria-hidden="true"></span>';
      const li = document.createElement('li');
      li.className = 'prox-item';
      const fila = claseFila(t); if (fila) li.classList.add(fila);   // mismos colores que el temario
      li.innerHTML = `<input type="checkbox" class="check" aria-label="Marcar la tarea del tema ${esc(t.tema)} como hecha">
        <span class="li-t">
          <span class="li-cab">${tag(a)}<span class="li-tit" title="${esc(t.titulo)}">${esc(t.titulo) || 'Tema ' + esc(t.tema)}</span></span>
          <small class="li-pie">Tema ${esc(t.tema)} · ${fmtCorta(d)}${hora ? ' · ' + hora : ''}</small>
        </span>
        <span class="li-acc">${res}<a class="li-ico ir-tem" href="#temario" data-asig="${esc(t.asig)}" data-k="${esc(keyTem(t))}" title="Ver en el temario" aria-label="Ver el tema ${esc(t.tema)} en el temario">${ICO_TEM}</a></span>
        <span class="cuando ${c.cls}">${esc(c.txt)}</span>`;
      li.querySelector('input').addEventListener('change', ev => {
        if (ev.target.checked) abrirCompletar(t, ev.target);
      });
      ul.appendChild(li);
    });
    requestAnimationFrame(ajustarProx);
  }

  $('#proxMas').addEventListener('click', () => { verTodasProx = !verTodasProx; pintarEntregas(); });
  // "Temario →": filtra el temario por esa asignatura, baja hasta él y resalta el tema
  $('#proxEntregas').addEventListener('click', ev => {
    const a = ev.target.closest('a.ir-tem'); if (!a) return;
    ev.preventDefault();
    temAsig = a.dataset.asig; pintarFiltroTemario(); pintarTemario();
    $('#temario').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const fila = $('#temTabla tbody').querySelector(`[data-k="${CSS.escape(a.dataset.k)}"]`);
    const tr = fila && fila.closest('tr');
    if (tr) { tr.classList.remove('destello'); void tr.offsetWidth; tr.classList.add('destello'); }
  });

  /* ---------- Completar una tarea (ventana con nota) ---------- */
  const tdlg = $('#tarDlg'), tfrm = $('#tarForm');
  let tarTema = null, tarCheck = null;
  function abrirCompletar(t, chk) {
    tarTema = t; tarCheck = chk;
    const a = asig(t.asig);
    $('#tarSub').innerHTML = `${tag(a)} Tema ${esc(t.tema)} · ${esc(t.titulo)}`;
    tfrm.hecha.checked = true;
    tfrm.nota.value = t.nota || '';
    tfrm.terminado.checked = true;
    if (tdlg.showModal) tdlg.showModal(); else tdlg.setAttribute('open', '');
    tfrm.nota.focus();
  }
  function cerrarCompletar(guardado) {
    if (!guardado && tarCheck) tarCheck.checked = false;
    if (tdlg.close) tdlg.close(); else tdlg.removeAttribute('open');
    tarTema = tarCheck = null;
  }
  $('#tarCancelar').addEventListener('click', () => cerrarCompletar(false));
  tdlg.addEventListener('cancel', () => { if (tarCheck) tarCheck.checked = false; });
  tfrm.addEventListener('submit', ev => {
    ev.preventDefault();
    const t = tarTema; if (!t) return;
    guardarTem(t, 'tarea', tfrm.hecha.checked);
    guardarTem(t, 'nota', tfrm.nota.value.trim());
    if (tfrm.terminado.checked) guardarTem(t, 'estado', 'Terminado');
    cerrarCompletar(true);
    pintarEntregas(); pintarPortadas(); pintarMiniAsig(); pintarTemario(); pintarCal(); pintarMiniCal();
    const a = asig(t.asig), nota = tfrm.nota.value.trim();
    avisar(`✓ ${a.corto} · Tema ${t.tema} ${tfrm.terminado.checked ? 'terminado' : 'actualizado'}${nota ? ' · nota ' + nota : ''}. Lo verás en verde en el temario y tachado en el calendario.`);
  });
  let avisoT = null;
  function avisar(txt) {
    const el = $('#aviso');
    el.textContent = txt; el.hidden = false;
    requestAnimationFrame(() => el.classList.add('on'));
    clearTimeout(avisoT);
    avisoT = setTimeout(() => { el.classList.remove('on'); setTimeout(() => { el.hidden = true; }, 250); }, 4500);
  }

  /* ---------- Portadas ---------- */
  // Orden de las portadas (se recuerda en este navegador)
  const KEY_ORD_ASIG = 'daw-orden-asignaturas';
  const ORDENES_ASIG = { color: 'Color', completado: 'Más completadas', menos: 'Menos completadas', entrega: 'Próxima entrega' };
  let ordenAsig = 'color';
  try { const o = localStorage.getItem(KEY_ORD_ASIG); if (o in ORDENES_ASIG) ordenAsig = o; } catch (e) { /* sin almacenamiento */ }
  function datosPortada(a) {
    const temas = D.temario.filter(t => t.asig === a.id && /^\d+$/.test(t.tema));
    const hechos = temas.filter(t => t.estado === 'Terminado').length;
    const pct = temas.length ? Math.round(hechos / temas.length * 100) : 0;
    return { temas, hechos, pct, prox: pendientesTem().find(p => p.t.asig === a.id && p.d >= HOY) };
  }
  function pintarOrdenAsig() {
    // "Completadas" es un solo botón: ↓ más completadas primero, ↑ menos completadas primero (pincha otra vez para cambiar)
    const comp = ordenAsig === 'completado' || ordenAsig === 'menos';
    const btns = [
      ['color', 'Color', ordenAsig === 'color', ''],
      [comp ? (ordenAsig === 'completado' ? 'menos' : 'completado') : 'completado',
        `Completadas <span class="orden-dir" aria-hidden="true">${ordenAsig === 'menos' ? '↑' : '↓'}</span>`, comp,
        ` title="${ordenAsig === 'menos' ? 'Menos completadas primero' : 'Más completadas primero'} · pincha para invertir"`],
      ['entrega', 'Próxima entrega', ordenAsig === 'entrega', ''],
    ];
    $('#asigOrden').innerHTML = btns.map(([k, txt, on, extra]) =>
      `<button type="button" class="chip" data-orden="${k}" aria-pressed="${on}"${extra}>${txt}</button>`).join('');
  }
  $('#asigOrden').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-orden]'); if (!b) return;
    ordenAsig = b.dataset.orden;
    try { localStorage.setItem(KEY_ORD_ASIG, ordenAsig); } catch (e) { /* sin almacenamiento */ }
    pintarOrdenAsig(); pintarPortadas(); pintarMiniAsig();
  });
  function pintarPortadas() {
    const lista = D.asignaturas.map((a, i) => ({ a, i, ...datosPortada(a) }));
    const cmp = {
      color: (p, q) => p.i - q.i,
      completado: (p, q) => q.pct - p.pct || q.hechos - p.hechos || p.i - q.i,
      menos: (p, q) => p.pct - q.pct || p.hechos - q.hechos || p.i - q.i,
      entrega: (p, q) => (p.prox ? p.prox.d : Infinity) - (q.prox ? q.prox.d : Infinity) || p.i - q.i,
    }[ordenAsig];
    $('#portadas').innerHTML = lista.sort(cmp).map(({ a, temas, hechos, pct, prox }) => {
      const inner = `
        <div class="portada-cover" style="background:${a.color};color:${a.tinta}">
          <div class="portada-top">
            <div class="portada-top-izq"><span class="portada-sig">${esc(a.siglas)}</span>${a.aviso ? `<span class="portada-aviso" title="${esc(a.aviso)}">${esc(a.aviso)}</span>` : ''}${(a.enlaces || []).map(l =>
              `<a class="portada-aviso portada-ext" href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.texto)}" aria-label="${esc(l.texto)}">${/c[oó]digo|editor/i.test(l.texto) ? '&lt;/&gt;' : esc(l.texto) + ' ↗'}</a>`).join('')}</div>
            <div class="portada-top-der"><span class="portada-emo" aria-hidden="true">${a.emoji || ''}</span></div>
          </div>
          <span class="portada-nom">${esc(a.nombre)}</span>
          <span class="portada-corto">${esc(a.corto)}</span>
        </div>
        <div class="portada-foot">
          <div class="fila"><span>${hechos}/${temas.length} temas terminados</span><span>${pct}%</span></div>
          <div class="barra"><span style="width:${pct}%;background:${calA(a).texto}"></span></div>
          ${temas.some(t => /^\d+$/.test(t.tema)) ? `<div class="portada-res" style="--c:${a.color};--t:${a.tinta}" aria-label="Temas (en color, con resumen)">${temas.filter(t => /^\d+$/.test(t.tema)).map(t => {
            const n = Number(t.tema), con = a.archivo && (a.resumidos || []).includes(n), ok = t.estado === 'Terminado';
            const tit = (con ? 'Resumen del tema ' + n : 'Tema ' + n + ': sin resumen') + (ok ? ' · terminado' : '');
            return con ? `<a class="portada-res-t con${ok ? ' hecho' : ''}" href="${esc(a.archivo)}#tema-${n}" title="${tit}">${n}</a>`
                       : `<span class="portada-res-t${ok ? ' hecho' : ''}" title="${tit}">${n}</span>`;
          }).join('')}</div>` : ''}
        </div>`;
      // La tarjeta entera lleva al resumen (enlace estirado), y los enlaces extra van por encima
      return a.archivo
        ? `<div class="portada clicable"><a class="portada-link" href="${esc(a.archivo)}" aria-label="Resumen de ${esc(a.nombre)}"></a>${inner}</div>`
        : `<div class="portada sin">${inner}</div>`;
    }).join('');
  }

  /* ---------- Calendario ---------- */
  let mesVista = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
  const filtro = { entregas: true, tutorias: false };
  const movil = () => window.matchMedia('(max-width:640px)').matches;
  const calA = a => ({ nombre: a.corto, texto: a.tinta, ...(a.cal || {}), fondo: a.color });
  const BANDERA_UK = '<svg viewBox="0 0 60 30" preserveAspectRatio="none" aria-hidden="true"><rect width="60" height="30" fill="#012169"/>' +
    '<path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0L60,30M60,0L0,30" stroke="#C8102E" stroke-width="2"/>' +
    '<path d="M30,0V30M0,15H60" stroke="#fff" stroke-width="10"/><path d="M30,0V30M0,15H60" stroke="#C8102E" stroke-width="6"/></svg>';

  // Eventos del calendario: barras (entregas y tutorías) y fondos (eventos personales, p. ej. Londres)
  function eventosCal() {
    const out = [];
    if (filtro.entregas) entregas.forEach(e => {
      const p = drag && drag.prev && drag.id === e._id ? drag.prev : null;
      out.push({ tipo: e.asig === 'otro' ? 'fondo' : 'ent', e, a: asig(e.asig),
        ini: p ? p.ini : e.desde.slice(0, 10), fin: p ? p.fin : (e.hasta || e.desde).slice(0, 10) });
    });
    if (filtro.tutorias) tutorias.forEach(t => out.push({ tipo: 'tut', t, a: asig(t.asig), ini: t.fecha, fin: t.fecha }));
    return out;
  }
  function evInner(x) {
    const c = calA(x.a);
    if (x.tipo === 'tut') return `🎥 ${x.t.inicio} <b style="color:var(--t)">${esc(c.nombre)}</b>`;
    const txt = x.e.texto.replace(/\s*\d{1,2}:\d{2}$/, '');
    return `${esc(txt)} <b>${esc(c.nombre)}</b>${estaHecha(x.e) ? ' ✓' : ''}`;
  }
  function evAttrs(x, extra) {
    const c = calA(x.a), cls = ['ev', x.tipo];
    if (x.tipo === 'ent' && x.e.tipo === 'inicio') cls.push('inicio');
    if (x.tipo === 'ent' && estaHecha(x.e)) cls.push('hecho');
    if (x.tipo === 'ent' && drag && drag.id === x.e._id && drag.movido) cls.push('arrastrando');
    const idAttr = x.tipo === 'ent' ? ` data-id="${esc(x.e._id)}" draggable="false"` : '';
    const tit = x.tipo === 'tut' ? `Tutoría ${c.nombre} ${x.t.inicio}–${x.t.fin}` : `${c.nombre} · ${x.e.texto}`;
    const href = x.tipo === 'ent' && x.a.archivo ? ` href="${esc(x.a.archivo)}"` : '';
    return `class="${cls.join(' ')}"${href}${idAttr} title="${esc(tit)}" style="--c:${c.fondo};--t:${c.texto};${extra || ''}"`;
  }

  function pintarCal() {
    const y = mesVista.getFullYear(), m = mesVista.getMonth();
    $('#calMes').textContent = cap(mesVista.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
    const cal = $('#cal');
    const primero = new Date(y, m, 1), ultimo = new Date(y, m + 1, 0);
    const evs = eventosCal();

    if (movil()) {
      let html = '<ul class="agenda">';
      for (let d = new Date(primero); d <= ultimo; d = addDays(d, 1)) {
        const s = iso(d), del = evs.filter(x => s >= x.ini && s <= x.fin);
        if (!del.length) continue;
        const hoy = diffDays(d, HOY) === 0;
        html += `<li class="${hoy ? 'es-hoy' : ''}"><span class="ag-d"><b>${d.getDate()}</b>${d.toLocaleDateString('es-ES', { weekday: 'short' })}</span><span class="ag-evs">${del.map(x =>
          x.tipo === 'fondo' ? `<span class="ev-fondo-txt" data-id="${esc(x.e._id)}">${esc(x.e.texto)}</span>` : `<a ${evAttrs(x)}><span>${evInner(x)}</span></a>`).join('')}</span></li>`;
      }
      html += '</ul>';
      cal.innerHTML = html.includes('<li') ? html : '<p style="padding:1rem;margin:0;color:var(--muted)">Nada este mes.</p>';
      cal.classList.toggle('cal-editando', editandoCal);
      return;
    }

    const offset = (primero.getDay() + 6) % 7; // lunes = 0
    let lunes = addDays(primero, -offset);
    let html = '<div class="cal-dows">' + ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(x => `<div>${x}</div>`).join('') + '</div>';
    while (lunes <= ultimo) {
      const dias = [...Array(7)].map((_, i) => addDays(lunes, i));
      // Rango de la semana dentro del mes (columna 0-6)
      const enMes = dias.map(d => d.getMonth() === m);
      const c0 = enMes.indexOf(true), c1 = enMes.lastIndexOf(true);
      const sIni = iso(dias[c0]), sFin = iso(dias[c1]);
      const col = s => diffDays(parseISO(s), lunes);
      const tramo = x => (x.fin < sIni || x.ini > sFin) ? null : { a: col(x.ini < sIni ? sIni : x.ini), b: col(x.fin > sFin ? sFin : x.fin) };

      // Barras: se reparten en carriles para que no se pisen
      const barras = evs.filter(x => x.tipo !== 'fondo').map(x => ({ x, r: tramo(x) })).filter(o => o.r)
        .sort((p, q) => p.r.a - q.r.a || (q.r.b - q.r.a) - (p.r.b - p.r.a));
      const carriles = [];
      barras.forEach(o => {
        let k = carriles.findIndex(fin => fin < o.r.a);
        if (k < 0) { k = carriles.length; carriles.push(-1); }
        carriles[k] = o.r.b; o.k = k;
      });
      const nCar = carriles.length;
      const filas = `grid-template-rows:auto ${nCar ? `repeat(${nCar},auto) ` : ''}1fr`;

      html += `<div class="cal-sem" style="${filas}">`;
      dias.forEach((d, i) => {
        const cls = ['dia'];
        if (!enMes[i]) cls.push('fuera');
        else {
          if (i >= 5) cls.push('finde');
          const n = diffDays(d, HOY);
          if (n < 0) cls.push('pasado');
          if (n === 0) cls.push('es-hoy');
        }
        html += `<div class="${cls.join(' ')}" data-d="${iso(d)}" style="grid-column:${i + 1}"></div>`;
        if (enMes[i]) html += `<span class="num${cls.includes('finde') ? ' finde' : ''}${cls.includes('pasado') ? ' pasado' : ''}" style="grid-column:${i + 1}">${d.getDate()}</span>`;
      });
      evs.filter(x => x.tipo === 'fondo').forEach(x => {
        const r = tramo(x); if (!r) return;
        html += `<div class="ev-fondo${x.e.fondo === 'uk' ? ' uk' : ''}" style="grid-column:${r.a + 1} / ${r.b + 2}">${x.e.fondo === 'uk' ? BANDERA_UK : ''}<span data-id="${esc(x.e._id)}" title="${esc(x.e.texto)}">${esc(x.e.texto)}</span></div>`;
      });
      barras.forEach(o => {
        // Asa para alargar/acortar, solo en el tramo donde acaba la entrega
        const asa = editandoCal && o.x.tipo === 'ent' && o.x.fin <= sFin ? '<i class="ev-asa" aria-hidden="true"></i>' : '';
        html += `<a ${evAttrs(o.x, `grid-column:${o.r.a + 1} / ${o.r.b + 2};grid-row:${o.k + 2}`)}><span>${evInner(o.x)}</span>${asa}</a>`;
      });
      html += '</div>';
      lunes = addDays(lunes, 7);
    }
    cal.innerHTML = html;
    cal.classList.toggle('cal-editando', editandoCal);
  }

  /* ---------- Calendario pequeño (cabecera): mes actual ---------- */
  let miniMes = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
  // Réplica en pequeño del calendario grande: semanas con barras (entregas), fondos (eventos personales)
  // y, subrayado en rojo, el día en que acaba el plazo real de un tema del temario.
  function pintarMiniCal() {
    const y = miniMes.getFullYear(), m = miniMes.getMonth();
    const primero = new Date(y, m, 1), ultimo = new Date(y, m + 1, 0);
    $('#miniMes').textContent = cap(primero.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
    const evs = entregas.map(e => ({ e, a: asig(e.asig), ini: e.desde.slice(0, 10), fin: (e.hasta || e.desde).slice(0, 10) }));
    let html = '<div class="mini-dows">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(x => `<span>${x}</span>`).join('') + '</div>';
    let lunes = addDays(primero, -((primero.getDay() + 6) % 7));
    while (lunes <= ultimo) {
      const dias = [...Array(7)].map((_, i) => addDays(lunes, i));
      const enMes = dias.map(d => d.getMonth() === m);
      const sIni = iso(dias[enMes.indexOf(true)]), sFin = iso(dias[enMes.lastIndexOf(true)]);
      const col = s => diffDays(parseISO(s), lunes);
      const tramo = x => (x.fin < sIni || x.ini > sFin) ? null : { a: col(x.ini < sIni ? sIni : x.ini), b: col(x.fin > sFin ? sFin : x.fin) };
      const barras = evs.filter(x => x.e.asig !== 'otro').map(x => ({ x, r: tramo(x) })).filter(o => o.r)
        .sort((p, q) => p.r.a - q.r.a || (q.r.b - q.r.a) - (p.r.b - p.r.a));
      const carriles = [];
      barras.forEach(o => {
        let k = carriles.findIndex(fin => fin < o.r.a);
        if (k < 0) { k = carriles.length; carriles.push(-1); }
        carriles[k] = o.r.b; o.k = k;
      });
      html += `<div class="mini-sem" style="grid-template-rows:auto ${carriles.length ? `repeat(${carriles.length},6px) ` : ''}1fr">`;
      dias.forEach((d, i) => {
        if (!enMes[i]) { html += `<span class="mini-fuera" style="grid-column:${i + 1}"></span>`; return; }
        const s = iso(d), n = diffDays(d, HOY);
        const plazo = D.temario.some(t => (t.fin || '').slice(0, 10) === s && !tareaHecha(t));
        const cls = ['mini-d', n < 0 ? 'pasado' : '', n === 0 ? 'es-hoy' : '', i >= 5 ? 'finde' : ''].filter(Boolean).join(' ');
        html += `<span class="${cls}" data-d="${s}" style="grid-column:${i + 1}"></span>` +
          `<b class="mini-num${i >= 5 ? ' finde' : ''}${n < 0 ? ' pasado' : ''}${plazo ? ' plazo' : ''}" style="grid-column:${i + 1}">${d.getDate()}</b>`;
      });
      evs.filter(x => x.e.asig === 'otro').forEach(x => {
        const r = tramo(x); if (!r) return;
        html += `<span class="mini-fondo${x.e.fondo === 'uk' ? ' uk' : ''}" style="grid-column:${r.a + 1} / ${r.b + 2}">${x.e.fondo === 'uk' ? BANDERA_UK : ''}</span>`;
      });
      barras.forEach(o => {
        const c = calA(o.x.a);
        const cls = ['mini-ev', estaHecha(o.x.e) ? 'hecho' : '', o.x.e.tipo === 'inicio' ? 'inicio' : ''].filter(Boolean).join(' ');
        html += `<span class="${cls}" style="grid-column:${o.r.a + 1} / ${o.r.b + 2};grid-row:${o.k + 2};--c:${c.fondo};--t:${c.texto}"></span>`;
      });
      html += '</div>';
      lunes = addDays(lunes, 7);
    }
    $('#miniCal').innerHTML = html;
  }
  // Clic en cualquier parte del calendario pequeño → calendario grande en el mes actual
  $('#miniCalPanel').addEventListener('click', ev => {
    const nav = ev.target.closest('[data-mini]');
    if (nav) {   // flechas y "Hoy": cambian el mes del calendario pequeño
      ev.stopPropagation();
      const k = nav.dataset.mini;
      miniMes = k === 'hoy' ? new Date(HOY.getFullYear(), HOY.getMonth(), 1) : new Date(miniMes.getFullYear(), miniMes.getMonth() + (k === 'sig' ? 1 : -1), 1);
      pintarMiniCal(); pop.hidden = true;
      return;
    }
    ev.preventDefault();
    mesVista = new Date(miniMes); pintarCal();
    $('#calendario').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // Ventanita con la información del día al pasar por encima
  const pop = $('#miniPop');
  function infoDia(s) {
    const evs = entregas.filter(e => s >= e.desde.slice(0, 10) && s <= (e.hasta || e.desde).slice(0, 10));
    const plazos = D.temario.filter(t => (t.fin || '').slice(0, 10) === s);
    const d = parseISO(s);
    let h = `<p class="pop-t">${cap(d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))}</p>`;
    if (plazos.length) h += '<p class="pop-sec">Plazo de entrega (temario)</p><ul>' + plazos.map(t => {
      const a = asig(t.asig);
      return `<li class="${tareaHecha(t) ? 'hecho' : ''}">${tag(a)} Tema ${esc(t.tema)}${(t.fin || '').slice(11) ? ' · ' + t.fin.slice(11) : ''}${tareaHecha(t) ? ' ✓' : ''}</li>`;
    }).join('') + '</ul>';
    const bar = evs.filter(e => e.asig !== 'otro'), fon = evs.filter(e => e.asig === 'otro');
    if (bar.length) h += '<p class="pop-sec">En tu calendario</p><ul>' + bar.map(e => {
      const a = asig(e.asig);
      return `<li class="${estaHecha(e) ? 'hecho' : ''}">${tag(a)} ${esc(e.texto)}${estaHecha(e) ? ' ✓' : ''}</li>`;
    }).join('') + '</ul>';
    if (fon.length) h += '<ul>' + fon.map(e => `<li>📍 ${esc(e.texto)}</li>`).join('') + '</ul>';
    if (!plazos.length && !evs.length) h += '<p class="pop-vacio">Nada este día.</p>';
    return h;
  }
  $('#miniCal').addEventListener('mouseover', ev => {
    const c = ev.target.closest('.mini-d[data-d]'); if (!c) return;
    pop.innerHTML = infoDia(c.dataset.d); pop.hidden = false;
    const r = c.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    let x = r.left + r.width / 2 - pw / 2, y = r.bottom + 8;
    x = Math.max(8, Math.min(x, window.innerWidth - pw - 8));
    if (y + ph > window.innerHeight - 8) y = r.top - ph - 8;
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
  });
  $('#miniCal').addEventListener('mouseleave', () => { pop.hidden = true; });
  window.addEventListener('scroll', () => { pop.hidden = true; }, { passive: true });

  /* ---------- Asignaturas compactas (cabecera) ---------- */
  // Orden de la tabla compacta: clic en la cabecera (asc → desc → orden por color)
  let ordenMini = { col: null, dir: 1 };
  const CLAVE_MINI = {
    nombre: x => nomCorto(x.a).toLocaleLowerCase('es'),
    pct: x => x.pct,
    prox: x => x.prox ? x.prox.d.getTime() : null,
  };
  $('#miniAsigCab').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-sort]'); if (!b) return;
    const col = b.dataset.sort;
    if (ordenMini.col !== col) ordenMini = { col, dir: col === 'pct' ? -1 : 1 };
    else if (ordenMini.dir === (col === 'pct' ? -1 : 1)) ordenMini.dir *= -1;
    else ordenMini = { col: null, dir: 1 };
    pintarMiniAsig();
  });
  function pintarMiniAsig() {
    const filas = D.asignaturas.map((a, i) => ({ a, i, ...datosPortada(a) }));
    if (ordenMini.col) {
      const f = CLAVE_MINI[ordenMini.col];
      filas.sort((p, q) => {
        const x = f(p), y = f(q);
        if (x === null && y !== null) return 1;
        if (y === null && x !== null) return -1;
        return ((x < y ? -1 : x > y ? 1 : 0) * ordenMini.dir) || p.i - q.i;
      });
    }
    $('#miniAsigCab').querySelectorAll('button[data-sort]').forEach(b => {
      const on = b.dataset.sort === ordenMini.col;
      b.setAttribute('aria-sort', on ? (ordenMini.dir === 1 ? 'ascending' : 'descending') : 'none');
      b.querySelector('.sort-ic').textContent = on ? (ordenMini.dir === 1 ? '↑' : '↓') : '↕';
    });
    $('#miniAsig').innerHTML = filas.map(({ a, pct, prox }) => {
      const href = a.archivo ? ` href="${esc(a.archivo)}"` : '';
      return `<li><a class="mini-asig-it"${href} title="${esc(a.nombre)}">
        <span class="asig-tag" style="background:${a.color};color:${a.tinta}">${esc(nomCorto(a))}</span>
        <span class="mini-barra"><span style="width:${pct}%;background:${calA(a).texto}"></span></span>
        <span class="mini-pct">${pct}%</span>
        <span class="mini-prox">${prox ? 'T' + esc(prox.t.tema) + ' · ' + esc(cuando(prox.d).txt) : '—'}</span></a></li>`;
    }).join('');
  }

  /* ---------- Editar el calendario ---------- */
  const editandoCal = true;   // el calendario se edita directamente (arrastrar, pinchar…)
  let drag = null;
  const diaEnPunto = (x, y) => { const el = document.elementsFromPoint(x, y).find(n => n.classList && n.classList.contains('dia')); return el ? el.dataset.d : null; };
  function refrescarEntregas() { recalcEntregas(); pintarCal(); pintarMiniCal(); pintarBotonesCal(); }
  function pintarBotonesCal() {
    $('#calCopiar').hidden = !hayCambiosEnt();
    $('#calReset').hidden = !hayCambiosEnt();
  }

  const cal$ = $('#cal');
  cal$.addEventListener('pointerdown', ev => {
    if (!editandoCal || ev.button !== 0) return;
    const el = ev.target.closest('a.ev[data-id]'); if (!el || movil()) return;
    const d0 = diaEnPunto(ev.clientX, ev.clientY); if (!d0) return;
    const e = entregas.find(x => x._id === el.dataset.id); if (!e) return;
    ev.preventDefault();
    drag = { id: e._id, modo: ev.target.closest('.ev-asa') ? 'fin' : 'mover', d0, cur: d0,
      ini: e.desde.slice(0, 10), fin: (e.hasta || e.desde).slice(0, 10), prev: null, movido: false };
  });
  window.addEventListener('pointermove', ev => {
    if (!drag) return;
    const d = diaEnPunto(ev.clientX, ev.clientY);
    if (!d || d === drag.cur) return;
    drag.cur = d; drag.movido = true;
    if (drag.modo === 'mover') {
      const n = diffDays(parseISO(d), parseISO(drag.d0));
      drag.prev = { ini: iso(addDays(parseISO(drag.ini), n)), fin: iso(addDays(parseISO(drag.fin), n)) };
    } else {
      drag.prev = { ini: drag.ini, fin: d < drag.ini ? drag.ini : d };
    }
    pintarCal();
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    const dg = drag; drag = null;
    if (dg.movido && dg.prev && (dg.prev.ini !== dg.ini || dg.prev.fin !== dg.fin)) {
      const e = entregas.find(x => x._id === dg.id);
      guardarEntrega(dg.id, { ...e, desde: dg.prev.ini, hasta: dg.prev.fin !== dg.prev.ini ? dg.prev.fin : '' });
      refrescarEntregas();
    } else {
      pintarCal();
      if (!dg.movido) abrirEditorEnt(dg.id);
    }
  });
  cal$.addEventListener('click', ev => {
    if (!editandoCal) return;
    const a = ev.target.closest('a'); if (a) ev.preventDefault();
    const conId = ev.target.closest('[data-id]');
    if (conId) { if (movil() || !conId.matches('a.ev')) abrirEditorEnt(conId.dataset.id); return; }
    const dia = ev.target.closest('.dia[data-d]');
    if (dia) abrirEditorEnt(null, dia.dataset.d);
  });
  $('#calNueva').addEventListener('click', () => abrirEditorEnt(null, iso(HOY)));

  // Ventana para crear / modificar una entrega
  const dlg = $('#entDlg'), frm = $('#entForm');
  frm.asig.innerHTML = D.asignaturas.map(a => `<option value="${a.id}">${esc(nomCorto(a))}</option>`).join('') + '<option value="otro">Personal (de fondo)</option>';
  let editId = null;
  function abrirEditorEnt(id, fecha) {
    const e = id ? entregas.find(x => x._id === id) : null;
    if (id && !e) return;
    editId = id;
    $('#entDlgT').textContent = e ? 'Modificar entrega' : 'Nueva entrega';
    frm.asig.value = e ? e.asig : (temAsig !== 'todas' ? temAsig : D.asignaturas[0].id);
    frm.texto.value = e ? e.texto : '';
    frm.desde.value = e ? e.desde.slice(0, 10) : fecha;
    frm.hasta.value = e && e.hasta ? e.hasta.slice(0, 10) : '';
    frm.inicio.checked = !!(e && e.tipo === 'inicio');
    frm.hecho.checked = !!(e && estaHecha(e));
    frm.uk.checked = !!(e && e.fondo === 'uk');
    $('#entBorrar').hidden = !e;
    const a = e ? asig(e.asig) : null, nums = e ? [...e.texto.matchAll(/UT\s*(\d+)/gi)].map(m => Number(m[1])) : [];
    const n = a && nums.find(x => (a.resumidos || []).includes(x));
    const enl = $('#entResumen');
    enl.hidden = !(a && a.archivo);
    if (a && a.archivo) { enl.href = a.archivo + (n ? '#tema-' + n : ''); enl.textContent = n ? `Ver resumen del tema ${n} →` : 'Ver resumen →'; }
    actualizarCamposDlg();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    frm.texto.focus();
  }
  function actualizarCamposDlg() { $('#entUkFila').hidden = frm.asig.value !== 'otro'; }
  frm.asig.addEventListener('change', actualizarCamposDlg);
  const cerrarDlg = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  $('#entCancelar').addEventListener('click', cerrarDlg);
  frm.addEventListener('submit', ev => {
    ev.preventDefault();
    const desde = frm.desde.value, hasta = frm.hasta.value;
    if (!frm.texto.value.trim() || !desde) return;
    const e = editId ? entregas.find(x => x._id === editId) : null;
    const id = guardarEntrega(editId, {
      asig: frm.asig.value, texto: frm.texto.value.trim(), desde,
      hasta: hasta && hasta > desde ? hasta : '',
      tipo: frm.inicio.checked ? 'inicio' : '',
      fondo: frm.asig.value === 'otro' && frm.uk.checked ? 'uk' : '',
    });
    if (frm.hecho.checked !== !!(e && estaHecha(e))) setHecha({ _id: id }, frm.hecho.checked);
    cerrarDlg();
    mesVista = new Date(parseISO(desde).getFullYear(), parseISO(desde).getMonth(), 1);
    refrescarEntregas();
  });
  $('#entBorrar').addEventListener('click', () => {
    if (!editId || !confirm('¿Borrar esta entrega del calendario?')) return;
    borrarEntrega(editId); cerrarDlg(); refrescarEntregas();
  });
  $('#calReset').addEventListener('click', () => {
    if (!confirm('¿Descartar los cambios del calendario guardados en este navegador y volver a los de datos.js?')) return;
    cambiosEnt = { mod: {}, del: [], add: [] };
    try { localStorage.removeItem(KEY_ENT); } catch (err) { /* sin almacenamiento */ }
    refrescarEntregas();
  });
  $('#calCopiar').addEventListener('click', () => {
    const lineas = entregas.slice().sort((a, b) => a.desde.localeCompare(b.desde)).map(e => {
      const o = limpiaEnt(e); if (estaHecha(e)) o.hecho = true;
      return '    {' + Object.entries(o).map(([c, v]) => JSON.stringify(c) + ': ' + JSON.stringify(v)).join(', ') + '}';
    });
    copiarTexto('  entregas: [\n' + lineas.join(',\n') + '\n  ],', $('#calCopiar'));
  });
  $('#calPrev').addEventListener('click', () => { mesVista = new Date(mesVista.getFullYear(), mesVista.getMonth() - 1, 1); pintarCal(); });
  $('#calNext').addEventListener('click', () => { mesVista = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 1); pintarCal(); });
  $('#calHoy').addEventListener('click', () => { mesVista = new Date(HOY.getFullYear(), HOY.getMonth(), 1); pintarCal(); });
  $('#calFiltro').addEventListener('change', ev => { filtro[ev.target.value] = ev.target.checked; pintarCal(); });
  window.matchMedia('(max-width:640px)').addEventListener('change', pintarCal);

  $('#leyenda').innerHTML = D.asignaturas.map(a => {
    const c = calA(a);
    return `<li><span class="ley-sq" style="--c:${c.fondo}"></span>${esc(c.nombre)}</li>`;
  }).join('');

  /* ---------- Temario ---------- */
  // Los cambios hechos con "Editar" se guardan en este navegador y se aplican sobre datos.js.
  const KEY_TEM = 'daw-temario-cambios';
  const CAMPOS_TEM = ['titulo', 'inicio', 'fin', 'nota', 'estado'];
  const ESTADOS = ['Pendiente', 'En curso', 'Terminado'];
  const keyTem = t => t.asig + '|' + t.tema;
  const ORIG_TEM = Object.fromEntries(D.temario.map(t => [keyTem(t), { ...t }]));
  let cambiosTem = {};
  try { cambiosTem = JSON.parse(localStorage.getItem(KEY_TEM) || '{}'); } catch (e) { cambiosTem = {}; }
  D.temario.forEach(t => Object.assign(t, cambiosTem[keyTem(t)] || {}));
  const hayCambiosTem = () => Object.keys(cambiosTem).length > 0;
  function guardarTem(t, campo, valor) {
    t[campo] = valor;
    const k = keyTem(t), o = ORIG_TEM[k], c = cambiosTem[k] || {};
    const igual = campo === 'tarea' ? !!(o && o.tarea) === !!valor : o && o[campo] === valor;
    if (igual) delete c[campo]; else c[campo] = valor;
    if (Object.keys(c).length) cambiosTem[k] = c; else delete cambiosTem[k];
    try { localStorage.setItem(KEY_TEM, JSON.stringify(cambiosTem)); } catch (err) { /* sin almacenamiento */ }
    $('#temReset').hidden = !hayCambiosTem();
    $('#temCopiar').hidden = !(editandoTem || hayCambiosTem());
  }
  const fechaOk = v => v === '' || /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(v);

  let temAsig = 'todas', editandoTem = false;
  function pintarFiltroTemario() {
    const opts = [{ id: 'todas', corto: 'Todas' }, ...D.asignaturas];
    $('#temFiltro').innerHTML = opts.map(a =>
      `<button type="button" class="chip" data-id="${a.id}" aria-pressed="${a.id === temAsig}">${a.color ? dot(a) : ''}${esc(a.color ? nomCorto(a) : a.corto)}</button>`).join('');
  }
  $('#temFiltro').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    temAsig = b.dataset.id; pintarFiltroTemario(); pintarTemario();
  });
  // Ordenación al pinchar en la cabecera: { col, dir } (dir 1 = ascendente, -1 = descendente)
  let ordenTem = { col: null, dir: 1 };
  const numTema = t => Number(t.tema) || 0;
  const numNota = t => { const m = String(t.nota || '').match(/\d+(?:[.,]\d+)?/g); return m ? Number(m[m.length - 1].replace(',', '.')) : null; };
  const CLAVE_TEM = {
    asig: t => posAsig(t.asig),
    tema: numTema,
    titulo: t => (t.titulo || '').toLocaleLowerCase('es'),
    inicio: t => t.inicio || null,
    fin: t => t.fin || null,
    nota: numNota,
    tarea: t => t.tarea ? 1 : 0,
    estado: t => { const i = ESTADOS.indexOf(t.estado); return i < 0 ? 9 : i; },
  };
  function ordenarTem(filas) {
    const { col, dir } = ordenTem;
    if (!col) return filas;
    const f = CLAVE_TEM[col];
    return filas.map((t, i) => [t, i]).sort((p, q) => {
      const a = f(p[0]), b = f(q[0]);
      if (a === null && b !== null) return 1;   // vacíos siempre al final
      if (b === null && a !== null) return -1;
      const c = a < b ? -1 : a > b ? 1 : 0;
      return c * dir || p[1] - q[1];
    }).map(p => p[0]);
  }
  $('#temTabla thead').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-sort]'); if (!b) return;
    const col = b.dataset.sort;
    if (ordenTem.col !== col) ordenTem = { col, dir: 1 };
    else if (ordenTem.dir === 1) ordenTem.dir = -1;
    else ordenTem = { col: null, dir: 1 };   // tercer clic: orden original
    pintarTemario();
  });

  // Color de la fila: verde si está hecho; rojo si se ha pasado el plazo; amarillo si caduca en 5 días o menos
  function claseFila(t) {
    if (t.estado === 'Terminado' || t.tarea) return 'fila-terminado';
    const fin = t.fin && /^\d{4}-/.test(t.fin) ? parseISO(t.fin) : null;
    if (!fin) return '';
    const n = diffDays(fin, HOY);
    return n < 0 ? 'fila-tarde' : n <= 5 ? 'fila-pronto' : '';
  }

  function pintarTemario() {
    const filas = ordenarTem(D.temario.filter(t => temAsig === 'todas' || t.asig === temAsig));
    $('#temTabla').classList.toggle('editando', editandoTem);
    $('#temTabla thead').querySelectorAll('th[data-col]').forEach(th => {
      const on = th.dataset.col === ordenTem.col;
      th.setAttribute('aria-sort', on ? (ordenTem.dir === 1 ? 'ascending' : 'descending') : 'none');
      th.querySelector('.sort-ic').textContent = on ? (ordenTem.dir === 1 ? '↑' : '↓') : '↕';
    });
    $('#temTabla tbody').innerHTML = filas.map(t => {
      const a = asig(t.asig);
      const estCls = t.estado === 'Terminado' ? 'terminado' : t.estado === 'En curso' ? 'en-curso' : '';
      const link = a.archivo && (a.resumidos || []).includes(Number(t.tema)) ? `<a class="ir" href="${esc(a.archivo)}#tema-${t.tema}">Resumen →</a>` : '';
      const k = esc(keyTem(t));
      // Nota y estado se editan siempre; título y fechas, solo con "Editar"
      const inp = (campo, cls, ph) => `<input class="tem-in ${cls}" data-k="${k}" data-campo="${campo}" value="${esc(t[campo])}" placeholder="${ph}" aria-label="${campo} del tema ${esc(t.tema)}">`;
      const chkTarea = `<input type="checkbox" class="check tem-tarea" data-k="${k}" ${t.tarea ? 'checked' : ''} aria-label="Tarea del tema ${esc(t.tema)} hecha">`;
      const ICONO = { 'Pendiente': '○', 'En curso': '◐', 'Terminado': '✓' };
      const sel = `<span class="pill-estado ${estCls || 'pendiente'}"><select class="tem-in" data-k="${k}" data-campo="estado" aria-label="estado del tema ${esc(t.tema)}">${
        [...new Set([...ESTADOS, t.estado].filter(Boolean))].map(e => `<option value="${esc(e)}"${e === t.estado ? ' selected' : ''}>${ICONO[e] || '•'} ${esc(e)}</option>`).join('')}</select></span>`;
      if (editandoTem) {
        return `<tr class="${claseFila(t)}">
          <td>${tag(a)}</td><td class="mono">${esc(t.tema)}</td><td>${inp('titulo', 'tem-tit', 'Título')}</td>
          <td>${inp('inicio', 'mono', 'AAAA-MM-DD')}</td><td>${inp('fin', 'mono', 'AAAA-MM-DD hh:mm')}</td>
          <td>${inp('nota', 'mono tem-nota', '—')}</td><td class="td-tarea">${chkTarea}</td><td>${sel}</td><td>${link}</td></tr>`;
      }
      return `<tr class="${claseFila(t)}">
        <td>${tag(a)}</td><td class="mono">${esc(t.tema)}</td><td>${esc(t.titulo)}</td>
        <td class="mono">${esc(fmtNum(t.inicio))}</td><td class="mono">${esc(fmtNum((t.fin || '').slice(0, 10)))}</td>
        <td>${inp('nota', 'mono tem-nota', '—')}</td><td class="td-tarea">${chkTarea}</td><td>${sel}</td><td>${link}</td></tr>`;
    }).join('');
    $('#temCopiar').hidden = !(editandoTem || hayCambiosTem());
    $('#temReset').hidden = !hayCambiosTem();
  }
  function editarTem(on) {
    editandoTem = on;
    const b = $('#temEditar');
    b.textContent = on ? 'Hecho' : 'Editar';
    b.setAttribute('aria-pressed', on);
    pintarTemario();
  }
  $('#temEditar').addEventListener('click', () => editarTem(!editandoTem));
  $('#temTabla').addEventListener('change', ev => {
    if (ev.target.matches('.tem-tarea')) {
      const t = D.temario.find(x => keyTem(x) === ev.target.dataset.k); if (!t) return;
      guardarTem(t, 'tarea', ev.target.checked);
      pintarEntregas(); pintarPortadas(); pintarMiniAsig(); pintarCal();
      return;
    }
    const el = ev.target.closest('.tem-in'); if (!el) return;
    const t = D.temario.find(x => keyTem(x) === el.dataset.k); if (!t) return;
    const campo = el.dataset.campo, v = el.value.trim();
    if ((campo === 'inicio' || campo === 'fin') && !fechaOk(v)) { el.setAttribute('aria-invalid', 'true'); return; }
    el.removeAttribute('aria-invalid');
    guardarTem(t, campo, v);
    if (campo === 'estado') { pintarPortadas(); pintarMiniAsig(); pintarTemario(); }
    if (campo === 'estado' || campo === 'fin') { pintarEntregas(); pintarCal(); }
  });
  $('#temReset').addEventListener('click', () => {
    if (!confirm('¿Descartar los cambios del temario guardados en este navegador y volver a los de datos.js?')) return;
    cambiosTem = {};
    try { localStorage.removeItem(KEY_TEM); } catch (err) { /* sin almacenamiento */ }
    D.temario.forEach(t => { delete t.tarea; Object.assign(t, ORIG_TEM[keyTem(t)]); });
    pintarPortadas(); pintarMiniAsig(); editarTem(editandoTem);
  });
  async function copiarTexto(txt, b) {
    const etiqueta = b.textContent, ok = () => { b.textContent = '¡Copiado!'; setTimeout(() => { b.textContent = etiqueta; }, 1500); };
    try { await navigator.clipboard.writeText(txt); ok(); return; } catch (e) { /* sigue con el plan B */ }
    const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
    const copiado = document.execCommand('copy'); ta.remove();
    if (copiado) ok(); else prompt('Copia este texto y pégalo en data/datos.js:', txt);
  }
  $('#temCopiar').addEventListener('click', async () => {
    const txt = '  temario: [\n' + D.temario.map(t => '    {' + Object.entries(t).map(([c, v]) => JSON.stringify(c) + ': ' + JSON.stringify(v)).join(', ') + '}').join(',\n') + '\n  ],';
    const b = $('#temCopiar'), ok = () => { b.textContent = '¡Copiado!'; setTimeout(() => { b.textContent = 'Copiar para datos.js'; }, 1500); };
    try { await navigator.clipboard.writeText(txt); ok(); return; } catch (e) { /* sigue con el plan B */ }
    const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
    const copiado = document.execCommand('copy'); ta.remove();
    if (copiado) ok(); else prompt('Copia este texto y pégalo en data/datos.js:', txt);
  });

  /* ---------- Arranque ---------- */
  pintarEntregas();
  pintarOrdenAsig();
  pintarBotonesCal();
  pintarPortadas(); pintarMiniAsig();
  pintarCal();
  pintarMiniCal();
  pintarFiltroTemario();
  pintarTemario();

  // PWA: solo funciona servida por http(s), no abriendo el archivo directamente
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
