/* =========================================================
   Tutorías (tutorias.html)
   Lee window.DAW (data/datos.js): horario semanal y videoconferencias.
   ========================================================= */
(function () {
  'use strict';
  const D = window.DAW;
  if (!D) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:1rem">No se ha podido cargar data/datos.js</p>'); return; }

  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ASIG = Object.fromEntries(D.asignaturas.map(a => [a.id, a]));
  const OTRO = { id: 'otro', siglas: 'Otro', corto: 'Personal', color: '#b3262d', tinta: '#ffffff' };
  const asig = id => ASIG[id] || OTRO;
  const dot = a => `<span class="dot" style="background:${a.color}"></span>`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseISO(s) { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); }

  // Fecha de hoy (se puede simular con ?hoy=2026-11-20 para probar)
  const qHoy = new URLSearchParams(location.search).get('hoy');
  const HOY = qHoy ? parseISO(qHoy) : startOfDay(new Date());
  if (qHoy) document.querySelectorAll('a[href^="index.html"]').forEach(a => { a.href = a.getAttribute('href').replace('index.html', 'index.html?hoy=' + qHoy); });

  $('#curso').textContent = D.curso;
  $('#grupo').textContent = D.grupo;
  const tutorias = D.videoconferencias.filter(v => v.fecha).map(v => ({ ...v, d: parseISO(v.fecha) })).sort((a, b) => a.d - b.d || a.inicio.localeCompare(b.inicio));

  function pintarHorario() {
    const H = D.horario, hoyCol = (HOY.getDay() + 6) % 7;
    let html = '<thead><tr><th>Hora</th>' + H.dias.map((d, i) => `<th class="${i === hoyCol ? 'hoy-col' : ''}">${d}</th>`).join('') + '</tr></thead><tbody>';
    H.franjas.forEach((f, fi) => {
      html += `<tr><td>${f}</td>`;
      H.dias.forEach((_, di) => {
        const c = H.clases.find(x => x.dia === di && x.franja === fi);
        if (!c) { html += '<td></td>'; return; }
        const a = asig(c.asig);
        html += `<td><span class="clase" style="background:${a.color};color:${a.tinta}">${esc(a.corto)}${c.nota ? `<small>${esc(c.nota)}</small>` : ''}</span></td>`;
      });
      html += '</tr>';
    });
    $('#horario').innerHTML = html + '</tbody>';
  }
  function pintarVC() {
    const prox = tutorias.find(t => t.d >= HOY);
    const items = D.videoconferencias.map(v => ({ ...v, d: parseISO(v.fecha || v.semana) })).sort((a, b) => a.d - b.d);
    const meses = {};
    items.forEach(v => { const k = v.d.getFullYear() + '-' + v.d.getMonth(); (meses[k] = meses[k] || []).push(v); });
    $('#vc').innerHTML = Object.values(meses).map(lista => {
      const tit = cap(lista[0].d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
      return `<div class="vc-mes"><h4>${tit}</h4><ul>${lista.map(v => {
        const a = asig(v.asig);
        if (v.noLectivo) return `<li class="nolect"><span class="vc-f">sem. ${v.d.getDate()}</span><span>${dot(a)} ${esc(a.corto)} · no lectivo</span></li>`;
        const cls = v.d < HOY ? 'pasada' : (prox && v === prox ? 'proxima' : (prox && v.fecha === prox.fecha && v.asig === prox.asig ? 'proxima' : ''));
        return `<li class="${cls}"><span class="vc-f">${v.d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span><span style="display:flex;align-items:center;gap:.4rem">${dot(a)} ${esc(a.corto)} · ${v.inicio}</span></li>`;
      }).join('')}</ul></div>`;
    }).join('');
  }

  pintarHorario();
  pintarVC();
})();
