# DAW · Resúmenes y calendario

Inicio con mis asignaturas, entregas, temario y tutorías del DAW (curso 26-27), y un resumen por asignatura.

## Abrirla en el ordenador
Doble clic en `index.html`. Funciona sin servidor y sin Internet (sin conexión se ve con la fuente del sistema).

## Editarla
Abre la carpeta en VS Code y usa Claude Code. `CLAUDE.md` le explica la estructura y las reglas.
- Datos del inicio: `data/datos.js`
- Resúmenes: `asignaturas/*.html`

## Verla en el móvil

**Misma wifi (rápido):**
```bash
python3 -m http.server 8000     # o: npx serve
```
En el móvil: `http://IP-del-Mac:8000` (la IP sale en Ajustes > Red).

**Desde cualquier sitio, mientras VS Code esté abierto:**
Lanza el servidor, ve al panel **Puertos** de VS Code > *Reenviar un puerto* > 8000, inicia sesión con GitHub y abre la URL `https://….devtunnels.ms` en el móvil.

**URL fija (recomendado): GitHub Pages**
1. Sube la carpeta a un repositorio de GitHub.
2. Settings > Pages > Deploy from a branch > `main` / raíz.
3. Tendrás `https://<usuario>.github.io/<repo>/`. Ábrela en el móvil y "Añadir a pantalla de inicio": se instala como app y funciona sin conexión.
4. Para actualizar: `git push`. Si añades archivos nuevos, añádelos a `sw.js` y sube `VERSION`.

Con la cuenta gratuita de GitHub la página es pública (aunque nadie conozca la URL).

## A tener en cuenta
- Los subrayados y las entregas marcadas como hechas se guardan en cada navegador por separado.
- Para simular otra fecha en el inicio: `index.html?hoy=2026-12-01`.
