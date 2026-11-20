/* =========================================================
   DATOS DE LA APP  ·  DAW curso 26-27 · grupo V1
   Es el único archivo que hay que tocar para actualizar
   el inicio (asignaturas, temario, entregas y tutorías).
   Fechas siempre en formato AAAA-MM-DD.
   ========================================================= */
window.DAW = {
  curso: '2026-27',
  grupo: 'V1',

  // archivo: ruta del resumen (null = aún no hay resumen). resumidos: números de tema que ya están en el resumen.
  // enlaces (opcional): botones extra en la tarjeta, p. ej. [{"texto": "Editor de código", "url": "https://…"}].
  // claude (opcional): enlace a tu proyecto de claude.ai para "Preguntar a Claude" (https://claude.ai/project/…); claudeNombre: cómo se llama. Vale un proyecto (claude.ai/project/…) o un chat concreto (claude.ai/chat/…).
  // color: color de la asignatura (portada, calendario, temario…). tinta: texto oscuro sobre ese color.
  // cal.nombre: nombre corto que se ve en la leyenda, el calendario y el temario. cal.texto: color de acento (negrita) del calendario.
  asignaturas: [
    {"id": "dwec", "siglas": "DWEC", "nombre": "Desarrollo Web en Entorno Cliente", "corto": "JavaScript", "color": "#cdebc8", "tinta": "#1f3d1a", "archivo": "asignaturas/dwec.html", "resumidos": [1, 2, 3], "claude": "https://claude.ai/chat/38ae474c-08a2-4be5-98c2-cb6b34a62fbc", "claudeNombre": "chat de JavaScript", "cal": {"nombre": "JS", "texto": "#2d8a3c"}, "emoji": "💚"},
    {"id": "dwes", "siglas": "DWES", "nombre": "Desarrollo Web en Entorno Servidor", "corto": "PHP", "color": "#fac3c3", "tinta": "#4a1414", "archivo": "asignaturas/dwes.html", "resumidos": [1, 2, 3], "enlaces": [{"texto": "Editor de código", "url": "https://fictional-space-doodle-v9gv9rp7phpvvr.github.dev/"}], "cal": {"nombre": "PHP", "texto": "#b3272d"}, "claude": "https://claude.ai/chat/9de5b60a-d12a-4961-a187-84e0fde3a254", "claudeNombre": "chat de PHP", "emoji": "🐘"},
    {"id": "python", "siglas": "PY", "nombre": "Python", "corto": "Python", "color": "#c9ecfa", "tinta": "#0f3550", "archivo": "asignaturas/python.html", "resumidos": [1], "cal": {"nombre": "Python", "texto": "#1683b9"}, "claude": "https://claude.ai/chat/03234ef7-32d1-40cf-a4cc-03f96fed9923", "claudeNombre": "chat de Python", "emoji": "🐍"},
    {"id": "fcn", "siglas": "FCN", "aviso": "Sin tareas", "nombre": "Fundamentos de Computación en la Nube", "corto": "Nube", "color": "#fbcfe8", "tinta": "#4d1238", "archivo": "asignaturas/fcn.html", "resumidos": [1, 2, 3], "cal": {"nombre": "Nube", "texto": "#c3268a"}, "claude": "https://claude.ai/chat/1a7010ae-2fa0-4e24-a969-f87b713153b4", "claudeNombre": "chat de Fundamentos de la nube", "emoji": "☁️"},
    {"id": "dasp", "siglas": "DASP", "nombre": "Digitalización aplicada a los sectores productivos", "corto": "Digitalización", "color": "#dedede", "tinta": "#2a2a2a", "archivo": "asignaturas/dasp.html", "resumidos": [1], "cal": {"nombre": "Digitalización", "texto": "#5a5a5a"}, "claude": "https://claude.ai/chat/1a7010ae-2fa0-4e24-a969-f87b713153b4", "claudeNombre": "chat de Digitalización", "emoji": "💾"},
    {"id": "sasp", "siglas": "SASP", "nombre": "Sostenibilidad aplicada al sistema productivo", "corto": "Sostenibilidad", "color": "#fbe98c", "tinta": "#3d3200", "archivo": "asignaturas/sasp.html", "resumidos": [1, 2, 3], "cal": {"nombre": "Sostenibilidad", "texto": "#9a7b00"}, "claude": "https://claude.ai/chat/878eee28-32bc-4291-9077-82a4b1d0dc1e", "claudeNombre": "chat de Sostenibilidad", "emoji": "🌱"},
    {"id": "despliegue", "siglas": "DESP", "nombre": "Despliegue de Aplicaciones Web", "corto": "Despliegue", "color": "#e3d2fb", "tinta": "#33175c", "archivo": "asignaturas/despliegue.html", "resumidos": [1], "cal": {"nombre": "Despliegue", "texto": "#7f45cf"}, "emoji": "🚀"}
  ],

  // Orden de las asignaturas en toda la app (portadas, leyenda del calendario, temario).
  orden: ['dwes', 'fcn', 'sasp', 'dwec', 'python', 'despliegue', 'dasp'],

  // Horario semanal de videoconferencias. dia: 0 = lunes … 4 = viernes; franja: índice en 'franjas'.
  horario: {
    "franjas": [
      "16:00–16:50",
      "17:50–18:40",
      "19:10–20:00",
      "20:05–21:50",
      "21:00–21:50"
    ],
    "dias": [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes"
    ],
    "clases": [
      {
        "asig": "fcn",
        "dia": 0,
        "franja": 0
      },
      {
        "asig": "python",
        "dia": 4,
        "franja": 0
      },
      {
        "asig": "dwec",
        "dia": 2,
        "franja": 1
      },
      {
        "asig": "sasp",
        "dia": 2,
        "franja": 2,
        "nota": "Solo presencial"
      },
      {
        "asig": "despliegue",
        "dia": 4,
        "franja": 2
      },
      {
        "asig": "dwes",
        "dia": 1,
        "franja": 3
      },
      {
        "asig": "dasp",
        "dia": 0,
        "franja": 4,
        "nota": "Solo presencial"
      }
    ]
  },

  // estado: 'Pendiente' | 'En curso' | 'Terminado'. fin puede llevar hora ('2026-11-10 23:59').
  temario: [
    {"asig": "python", "tema": "1", "titulo": "Elementos de un programa", "inicio": "2026-10-01", "fin": "2026-10-27 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "python", "tema": "2", "titulo": "Estructuras de control", "inicio": "2026-10-28", "fin": "2026-11-26 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "python", "tema": "3", "titulo": "Funciones y recursividad", "inicio": "2026-11-27", "fin": "2027-01-14 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "python", "tema": "4", "titulo": "Cadenas, listas, tuplas y diccionarios", "inicio": "2027-01-15", "fin": "2027-02-18 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "python", "tema": "5", "titulo": "Lectura y escritura de información", "inicio": "2027-02-19", "fin": "2027-03-31 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "python", "tema": "6", "titulo": "Programación orientada a objetos", "inicio": "2027-04-01", "fin": "2027-04-30 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "1", "titulo": "Arquitecturas y lenguajes de programación en clientes web", "inicio": "2026-10-05", "fin": "2026-10-28 23:59", "nota": "7 · 9,67", "estado": "Terminado"},
    {"asig": "dwec", "tema": "2", "titulo": "Estructura del lenguaje JavaScript", "inicio": "2026-10-29", "fin": "2026-11-10 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "3", "titulo": "Modelo de objetos predefinidos en JavaScript", "inicio": "2026-11-11", "fin": "2026-11-26", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "4", "titulo": "Estructuras definidas por el usuario en JavaScript", "inicio": "2026-11-27", "fin": "2026-12-18", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "5", "titulo": "Gestión de eventos y formularios en JavaScript", "inicio": "2026-12-21", "fin": "2027-01-29", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "6", "titulo": "Modelo de objetos del documento en JavaScript", "inicio": "2027-02-01", "fin": "2027-02-25", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "7", "titulo": "Programación AJAX en JavaScript", "inicio": "2027-02-26", "fin": "2027-04-01", "nota": "", "estado": "Pendiente"},
    {"asig": "dwec", "tema": "8", "titulo": "Almacenamiento de datos en el lado cliente e integración de componentes", "inicio": "2027-04-02", "fin": "2027-04-23", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "1", "titulo": "Plataformas de programación web en entorno servidor. Aplicaciones AMP", "inicio": "", "fin": "2026-11-08 23:59", "nota": "6,33", "estado": "Terminado"},
    {"asig": "dwes", "tema": "2", "titulo": "Características del lenguaje PHP", "inicio": "", "fin": "2026-12-13", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "3", "titulo": "Trabajar con bases de datos en PHP", "inicio": "2026-10-30", "fin": "2027-01-10", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "4", "titulo": "Desarrollo de aplicaciones web con PHP", "inicio": "2026-12-21", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "5", "titulo": "Programación orientada a objetos en PHP", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "6", "titulo": "Servicios web", "inicio": "2027-02-22", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "7", "titulo": "Aplicaciones web dinámicas: PHP y JavaScript", "inicio": "2027-03-15", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "dwes", "tema": "8", "titulo": "Aplicaciones web híbridas", "inicio": "2027-04-05", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "despliegue", "tema": "1", "titulo": "Implantación de arquitecturas web", "inicio": "", "fin": "2026-11-20 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "despliegue", "tema": "2", "titulo": "Configuración y administración de servidores web", "inicio": "", "fin": "2027-01-07", "nota": "", "estado": "Pendiente"},
    {"asig": "despliegue", "tema": "3", "titulo": "Configuración y administración de servidores de aplicaciones", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "despliegue", "tema": "4", "titulo": "Instalación y administración de servidores FTP", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "despliegue", "tema": "5", "titulo": "Servicios de red implicados en el despliegue de una aplicación web", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "despliegue", "tema": "6", "titulo": "Documentación y control de versiones", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "dasp", "tema": "1", "titulo": "Digitalización en los sectores productivos", "inicio": "Inicio de clases", "fin": "2026-10-30", "nota": "", "estado": "Pendiente"},
    {"asig": "dasp", "tema": "2", "titulo": "Tecnologías habilitadoras", "inicio": "2026-11-02", "fin": "2026-12-04", "nota": "", "estado": "Pendiente"},
    {"asig": "dasp", "tema": "3", "titulo": "Cloud y sistemas conectados", "inicio": "2026-12-07", "fin": "2027-01-29", "nota": "", "estado": "Pendiente"},
    {"asig": "dasp", "tema": "4", "titulo": "Aplicación de la Inteligencia Artificial (IA)", "inicio": "2027-02-01", "fin": "2027-03-05", "nota": "", "estado": "Pendiente"},
    {"asig": "dasp", "tema": "5", "titulo": "Evaluación de datos", "inicio": "2027-03-08", "fin": "2027-04-16", "nota": "", "estado": "Pendiente"},
    {"asig": "dasp", "tema": "Tests", "titulo": "Tests preparación examen", "inicio": "2027-04-19", "fin": "Fin de clases", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "1", "titulo": "Conceptos de la computación en la nube", "inicio": "2026-10-05", "fin": "2026-10-20", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "2", "titulo": "Economía y facturación en la nube", "inicio": "2026-10-20", "fin": "2026-11-10", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "3", "titulo": "Seguridad en la nube", "inicio": "2026-11-10", "fin": "2026-12-01", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "4", "titulo": "Redes y entrega de contenidos", "inicio": "2026-12-01", "fin": "2027-01-08", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "5", "titulo": "Servicios de cómputo", "inicio": "2027-01-08", "fin": "2027-02-02", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "6", "titulo": "Servicios de almacenamiento", "inicio": "2027-02-02", "fin": "2027-02-23", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "7", "titulo": "Servicios de bases de datos", "inicio": "2027-02-23", "fin": "2027-03-23", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "8", "titulo": "Arquitectura en la nube", "inicio": "2027-03-23", "fin": "2027-04-27", "nota": "", "estado": "Pendiente"},
    {"asig": "fcn", "tema": "9", "titulo": "Escalado automático y monitorización", "inicio": "2027-04-27", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "sasp", "tema": "1", "titulo": "Un futuro sostenible", "inicio": "2026-09-29", "fin": "2026-11-09 23:59", "nota": "10", "estado": "Terminado"},
    {"asig": "sasp", "tema": "2", "titulo": "Un futuro en riesgo", "inicio": "", "fin": "2026-11-17 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "sasp", "tema": "3", "titulo": "ODS. Los Objetivos de Desarrollo Sostenible", "inicio": "", "fin": "2027-02-22 23:59", "nota": "", "estado": "Pendiente"},
    {"asig": "sasp", "tema": "4", "titulo": "", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "sasp", "tema": "5", "titulo": "", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"},
    {"asig": "sasp", "tema": "6", "titulo": "", "inicio": "", "fin": "", "nota": "", "estado": "Pendiente"}
  ],

  // tipo: 'inicio' para comienzos de unidad; hecho: true cuando esté entregado. asig 'otro' = eventos personales (se pintan de fondo; fondo: 'uk' pone la bandera británica).
  entregas: [
    {"asig": "python", "texto": "UT1 23:59", "desde": "2026-10-27"},
    {"asig": "dwes", "texto": "inicio UT3", "desde": "2026-10-30", "tipo": "inicio"},
    {"asig": "dwes", "texto": "UT1 23:59", "desde": "2026-11-03", "hasta": "2026-11-08", "hecho": true},
    {"asig": "sasp", "texto": "UT1 23:59", "desde": "2026-11-08", "hecho": true},
    {"asig": "dwec", "texto": "UT1 23:59", "desde": "2026-11-08", "hecho": true},
    {"asig": "fcn", "texto": "UT1", "desde": "2026-11-10"},
    {"asig": "dwec", "texto": "UT2 23:59", "desde": "2026-11-09"},
    {"asig": "fcn", "texto": "UT2", "desde": "2026-11-11", "hasta": "2026-11-12"},
    {"asig": "python", "texto": "UT1 y UT2", "desde": "2026-11-11", "hasta": "2026-11-13"},
    {"asig": "dasp", "texto": "UT1", "desde": "2026-11-17"},
    {"asig": "sasp", "texto": "UT2 23:59", "desde": "2026-11-17"},
    {"asig": "despliegue", "texto": "UT1 23:59", "desde": "2026-11-18", "hasta": "2026-11-20"},
    {"asig": "otro", "texto": "Londres", "desde": "2026-11-21", "hasta": "2026-11-24", "fondo": "uk"},
    {"asig": "python", "texto": "UT2 23:59", "desde": "2026-11-25", "hasta": "2026-11-26"},
    {"asig": "dwec", "texto": "UT3 fin de plazo", "desde": "2026-11-26"},
    {"asig": "fcn", "texto": "fin UT3", "desde": "2026-12-01"},
    {"asig": "dasp", "texto": "UT2", "desde": "2026-12-04"},
    {"asig": "dwes", "texto": "fin UT2", "desde": "2026-12-13"},
    {"asig": "dwec", "texto": "UT4 fin de plazo", "desde": "2026-12-18"},
    {"asig": "dwes", "texto": "inicio UT4", "desde": "2026-12-21", "tipo": "inicio"},
    {"asig": "fcn", "texto": "fin UT4", "desde": "2027-01-08"},
    {"asig": "dwes", "texto": "fin UT3", "desde": "2027-01-10"},
    {"asig": "python", "texto": "UT3 23:59", "desde": "2027-01-14"},
    {"asig": "dwec", "texto": "UT5", "desde": "2027-01-29"},
    {"asig": "dasp", "texto": "UT3", "desde": "2027-01-29"},
    {"asig": "fcn", "texto": "fin UT5", "desde": "2027-02-02"},
    {"asig": "python", "texto": "UT4 23:59", "desde": "2027-02-18"},
    {"asig": "dwes", "texto": "inicio UT6", "desde": "2027-02-22", "tipo": "inicio"},
    {"asig": "sasp", "texto": "UT3 23:59", "desde": "2027-02-22"},
    {"asig": "fcn", "texto": "fin UT6", "desde": "2027-02-23"},
    {"asig": "dwec", "texto": "UT6", "desde": "2027-02-25"},
    {"asig": "dasp", "texto": "UT4", "desde": "2027-03-05"},
    {"asig": "dwes", "texto": "inicio UT7", "desde": "2027-03-15", "tipo": "inicio"},
    {"asig": "fcn", "texto": "fin UT7", "desde": "2027-03-23"},
    {"asig": "python", "texto": "UT5 23:59", "desde": "2027-03-31"},
    {"asig": "dwec", "texto": "UT7", "desde": "2027-04-01"},
    {"asig": "dwes", "texto": "inicio UT8", "desde": "2027-04-05", "tipo": "inicio"},
    {"asig": "dasp", "texto": "UT5", "desde": "2027-04-16"},
    {"asig": "dasp", "texto": "inicio tests", "desde": "2027-04-19", "tipo": "inicio"},
    {"asig": "dwec", "texto": "UT8", "desde": "2027-04-23"},
    {"asig": "fcn", "texto": "fin UT8", "desde": "2027-04-27"},
    {"asig": "python", "texto": "UT6 23:59", "desde": "2027-04-30"}
  ],

  // Tutorías colectivas. noLectivo: true marca semanas sin clase.
  videoconferencias: [
    {"asig": "fcn", "fecha": "2026-10-26", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2026-10-27", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2026-10-28", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2026-10-30", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2026-10-30", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2026-11-09", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2026-11-10", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2026-11-11", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2026-11-13", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2026-11-13", "inicio": "19:10", "fin": "20:00"},
    {"asig": "dasp", "fecha": "2026-11-16", "inicio": "21:00", "fin": "21:50"},
    {"asig": "sasp", "fecha": "2026-11-18", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2026-11-23", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2026-11-24", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2026-11-25", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2026-11-27", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2026-11-27", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "semana": "2026-12-07", "noLectivo": true},
    {"asig": "dwes", "semana": "2026-12-07", "noLectivo": true},
    {"asig": "dwec", "fecha": "2026-12-09", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2026-12-11", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2026-12-11", "inicio": "19:10", "fin": "20:00"},
    {"asig": "dasp", "fecha": "2026-12-14", "inicio": "21:00", "fin": "21:50"},
    {"asig": "sasp", "fecha": "2026-12-16", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2026-12-21", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2026-12-22", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "semana": "2026-12-21", "noLectivo": true},
    {"asig": "python", "semana": "2026-12-21", "noLectivo": true},
    {"asig": "despliegue", "semana": "2026-12-21", "noLectivo": true},
    {"asig": "dasp", "fecha": "2027-01-11", "inicio": "21:00", "fin": "21:50"},
    {"asig": "sasp", "fecha": "2027-01-13", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2027-01-18", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2027-01-19", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-01-20", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2027-01-22", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-01-22", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2027-02-01", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2027-02-02", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-02-03", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2027-02-05", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-02-05", "inicio": "19:10", "fin": "20:00"},
    {"asig": "dasp", "fecha": "2027-02-08", "inicio": "21:00", "fin": "21:50"},
    {"asig": "sasp", "fecha": "2027-02-10", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "semana": "2027-02-15", "noLectivo": true},
    {"asig": "dwes", "fecha": "2027-02-16", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-02-17", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2027-02-19", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-02-19", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2027-03-01", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2027-03-02", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-03-03", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2027-03-05", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-03-05", "inicio": "19:10", "fin": "20:00"},
    {"asig": "dasp", "fecha": "2027-03-08", "inicio": "21:00", "fin": "21:50"},
    {"asig": "sasp", "fecha": "2027-03-10", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2027-03-15", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2027-03-16", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-03-17", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "semana": "2027-03-15", "noLectivo": true},
    {"asig": "despliegue", "semana": "2027-03-15", "noLectivo": true},
    {"asig": "fcn", "fecha": "2027-04-05", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2027-04-06", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-04-07", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2027-04-09", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-04-09", "inicio": "19:10", "fin": "20:00"},
    {"asig": "dasp", "fecha": "2027-04-12", "inicio": "21:00", "fin": "21:50"},
    {"asig": "sasp", "fecha": "2027-04-14", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2027-04-19", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dwes", "fecha": "2027-04-20", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-04-21", "inicio": "17:50", "fin": "18:40"},
    {"asig": "python", "fecha": "2027-04-23", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-04-23", "inicio": "19:10", "fin": "20:00"},
    {"asig": "fcn", "fecha": "2027-05-03", "inicio": "16:00", "fin": "16:50"},
    {"asig": "dasp", "fecha": "2027-05-03", "inicio": "21:00", "fin": "21:50"},
    {"asig": "dwes", "fecha": "2027-05-04", "inicio": "20:05", "fin": "21:50"},
    {"asig": "dwec", "fecha": "2027-05-05", "inicio": "17:50", "fin": "18:40"},
    {"asig": "sasp", "fecha": "2027-05-05", "inicio": "19:10", "fin": "20:00"},
    {"asig": "python", "fecha": "2027-05-07", "inicio": "16:00", "fin": "16:50"},
    {"asig": "despliegue", "fecha": "2027-05-07", "inicio": "19:10", "fin": "20:00"}
  ]
};
