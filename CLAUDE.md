# App DAW · instrucciones para Claude Code

App web estática (HTML + CSS + JS, sin frameworks ni build) con mis resúmenes del CFGS DAW a distancia (curso 26-27, grupo V1). Responde siempre en **español**, de forma directa y práctica.

## Estructura

```
index.html              Inicio: resumen del día, portadas, calendario y temario
tutorias.html           Horario y videoconferencias (enlace en la barra superior)
assets/inicio.css       Estilos del inicio
assets/inicio.js        Lógica del inicio (lee window.DAW)
assets/tutorias.js      Lógica de tutorias.html
data/datos.js           ÚNICA fuente de datos del inicio (asignaturas, horario, temario, entregas, videoconferencias)
asignaturas/*.html      Un resumen por asignatura, cada uno autocontenido (CSS y JS dentro)
manifest.webmanifest    PWA
sw.js                   Service worker (offline). Si añades archivos, añádelos a ARCHIVOS y sube VERSION
```

- La app tiene que funcionar **abriendo index.html directamente** (file://). Por eso los datos van en `data/datos.js` con `<script>`, no con `fetch`.
- No añadas dependencias, npm ni build. Solo fuentes de Google Fonts (IBM Plex Sans + IBM Plex Mono) con fuentes de respaldo.
- Fechas en `datos.js` siempre en formato `AAAA-MM-DD` (con hora opcional: `2026-11-10 23:59`).

## Tareas habituales

### Actualizar el inicio
Solo se edita `data/datos.js`:
- Marcar un tema terminado → `estado: 'Terminado'` y `nota` en `temario`.
- Nueva entrega → añadir a `entregas` (`tipo: 'inicio'` para comienzos de unidad, `hecho: true` cuando esté entregada).
- Nuevo tema resumido → añadir su número a `resumidos` de la asignatura (activa el enlace "Resumen →" del temario).
- Nueva asignatura con resumen → crear `asignaturas/<id>.html` y poner `archivo: 'asignaturas/<id>.html'`.

### Añadir un tema a un resumen (`asignaturas/<id>.html`)
Te pasaré los apuntes. Reglas:
1. Copia la estructura de los temas que ya hay en ese archivo. **No cambies el diseño ni el JS.**
2. `<article class="tema" id="tema-N" data-num="N" data-title="Título exacto.">` justo después del último tema (antes de "Antes de empezar", ejercicios, anexos y tareas).
3. Primero `<p class="tema-label">Tema N</p>` y `<h1>` con el título.
4. Títulos de apartados **exactamente como en los apuntes** (p. ej. `1.4.1.- Algunos operadores de interés.`). `h2` para apartados, `h3` para subapartados, todos con `id` único (`tN-...`). El menú lateral y el submenú se generan solos desde `data-num`, `data-title`, `h2[id]` y `h3[id]`.
5. Resume en lenguaje sencillo, explicando términos técnicos. Componentes:
   - Tablas: `<div class="tbl"><table>…</table></div>` para comparativas.
   - Código: `<pre><code>…</code></pre>` (escapa `<`, `>` y `&`).
   - Cuadros clave/pista: `<div class="key"><span class="key-title">Pista</span><p>…</p></div>`.
   - Errores: tabla con `<th class="bad">❌ Error</th><th class="good">✅ Corrección</th>`. Al final de cada tema, `h2` "Errores comunes del tema".
   - **Autoevaluaciones sí se incluyen**, en su apartado, con este formato (el ✎ del índice sale solo):
     ```html
     <div class="quiz">
       <p class="quiz-title">Autoevaluación</p>
       <div class="quiz-item">
         <p class="quiz-q">Pregunta</p>
         <div class="quiz-opts">
           <button type="button">Opción incorrecta</button>
           <button type="button" data-ok>Opción correcta</button>
         </div>
         <button type="button" class="quiz-sol">Ver solución</button>
         <p class="quiz-fb"><strong>Respuesta.</strong> Explicación breve.</p>
       </div>
     </div>
     ```
6. Si los apuntes tienen un error, corrígelo en el resumen y avísame con un cuadro `.key` "Ojo con los apuntes".
7. Tareas: `<article class="tema" id="tarea-N" data-num="TN" data-title="Tarea para XXXX0N.">` solo con la descripción, salvo que pida más. Van siempre al final.
8. Al terminar, añade N a `resumidos` en `data/datos.js`.

### Colores de cada asignatura
DWEC `#cdebc8` (activo en verde) · DWES `#fac3c3` · Python `#c9ecfa` · FCN `#fbcfe8` · DASP `#dedede` · SASP `#fbe98c` · Despliegue `#e3d2fb`.
Son los mismos en toda la app (portadas, calendario, temario, horario y menú lateral de los resúmenes). Si cambias uno, cámbialo en `color` de `datos.js` y en `--side` del resumen. El color de acento del calendario (texto en negrita) está en `cal.texto`.

## Detalles a no romper
- **Ediciones desde el inicio** (temario, calendario, tareas, orden de asignaturas) se guardan en `localStorage` (`daw-temario-cambios`, `daw-entregas-cambios`, `daw-entregas-hechas`, `daw-orden-asignaturas`). Los botones "Copiar para datos.js" generan el bloque para pegarlo aquí y dejarlo fijo. Cada entrega tiene un `_id` interno (asig|texto|desde original) para no perder su estado al moverla.
- **Subrayador** de los resúmenes: guarda en `localStorage` (y, en claude.ai, en la cuenta mediante `window.claude`; fuera de claude.ai ese código no hace nada). No subraya dentro de `.quiz`.
- Botón ‹ para ocultar el menú y botón ☰ en móvil.
- Enlace `← Inicio` (`.back-home`) al principio del `<aside>` de cada resumen.
- Modo claro/oscuro con `prefers-color-scheme`.
- Para probar fechas en el inicio: `index.html?hoy=2026-12-01`.

## Probar
Abrir `index.html` en el navegador, o servir la carpeta (`npx serve` / `python3 -m http.server`) para probar la PWA.
