/* Copia de lo que guardaba el navegador (subrayados, notas, tareas, cambios del inicio).
   Al abrir la app en un dispositivo nuevo (iPad, otra URL…), cada dato se carga si ese
   dispositivo todavía no tiene nada guardado con esa clave. Nunca pisa lo que ya hay. */
window.DAW_GUARDADO = {
 "daw-temario-cambios": "{\"dwes|1\":{\"tarea\":true},\"sasp|1\":{\"tarea\":true}}",
 "daw-entregas-hechas": "{\"dwec|UT2 23:59|2026-11-09\":false}",
 "dwes-tarea1": "{\"answers\":{\"0\":\"Primero habrá una página estática de <b>presentación</b>, donde habrá un botón que te lleve al formulario. El <b>formulario</b> también será una página estática con un botón que envíe los datos (esas páginas no cambiarán nunca, siempre tienen la misma información) y al enviar los datos te llevarán a una página con el <b>listado de correos</b> (esta última sí será una página dinámica, registrará el correo con el que acabamos de entrar y mostrará los correos que ya se han registrado previamente).\",\"1\":\"Lo haría mediante la validación de html en formularios, y si la validación es más compleja lo haría mediante <b>JavaScript</b>.\",\"2\":\"Habría que utilizar <b>php</b> puesto que hay que buscar en la base de datos donde figuren el resto de correos que se han guardado previamente.\",\"3\":\"Utilizaría la arquitectura <b>AMP</b>, con el lenguaje <b>php.</b> El lenguaje php usa un tipo de lenguaje de <b>guiones</b>: lo ejecuta un intérprete. <br>Utilizaría esta arquitectura puesto que es una aplicación sencilla, pequeña y sería gratuita. \",\"4\":\"Principalmente el objetivo y el <b>escalado</b> de la aplicación. También los <b>lenguajes</b> que yo ya sepa usar y el <b>precio</b> que le pueda destinar a esta aplicación.\",\"5\":\"AMP: <b>Apache</b> (servidor web), <b>MySQL</b> (gestor BBDD), <b>Php</b> (intérprete).\",\"6\":\"<b>XAMPP</b> (es un paquete que trae todo lo necesario para hacer una web amp; sus siglas indican lo que tiene: x: multiplataforma, a: apache, m: mysql (mariadb), p: php, p: perl). También haría falta un <b>editor de código</b> como NetBeans o Visual Studio Code (y extensiones), <b>Xdebug</b> para depurar código y un navegador web para hacer las pruebas. No necesariamente tenemos que estar conectados a internet. \",\"7\":\"<b>String </b>\",\"8\":\"$edad = $anyoHoy - $anyoNac - (int) ($mesHoy < $mesNac || ($mesHoy == $mesNac && $diaHoy < $diaNac));\"},\"times\":{\"0\":1794224333915,\"1\":1794224333915,\"2\":1794224333915,\"3\":1794224333915,\"4\":1794224333915,\"5\":1794224333915,\"6\":1794224333915,\"7\":1794224333915,\"8\":1794224333915}}",
 "daw-orden-asignaturas": "color"
};
(function () {
  try {
    var g = window.DAW_GUARDADO;
    Object.keys(g).forEach(function (k) {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, g[k]);
    });
  } catch (e) {}
})();
