/* ==========================================================================
   PELITOS VETERINARIA — JAVASCRIPT ÚNICO (js/main.js)
   Todo el comportamiento del sitio está en este archivo, dividido en bloques.
   Cada página ejecuta solo su bloque, según el atributo data-pagina del <body>.

   CONTENIDO:
        1. DATOS DEL NEGOCIO Y FUNCIONES COMUNES
        2. ACCESO DE CLIENTES (demostración)
        3. CATÁLOGO DEL PETSHOP (SOLO DATOS)
        4. PETSHOP: CATÁLOGO, FICHAS Y CARRITO
        5. PÁGINA INICIO
        6. PÁGINA NOSOTROS
        7. PÁGINA CONSEJOS
        8. PÁGINA CONTACTO
        9. PÁGINA ESTÉTICA: COTIZADOR
        10. PÁGINA ESTÉTICA: ANTES / DESPUÉS
        11. PÁGINA ACCESO DE CLIENTES
        12. ANIMACIONES Y EFECTOS (todas las páginas)
   ========================================================================== */


/* ==========================================================================
   BLOQUE 1 · DATOS DEL NEGOCIO Y FUNCIONES COMUNES
   Números de WhatsApp, menú móvil, cabecera, año del pie y formulario de citas.
   AQUÍ SE CAMBIAN LOS TELÉFONOS: objeto SITE.whatsapp, unas líneas más abajo.
   ========================================================================== */

// AQUI SE CAMBIAN LOS NUMEROS DE WHATSAPP DEL SITIO COMPLETO.
// Se escriben sin espacios, sin "+" y empezando con 51 (codigo de Peru).
const SITE = {
  nombre: "Pelitos Veterinaria",
  whatsapp: {
    consultorio: "51939356376",   // consultas, citas medicas y PetShop
    estetica: "51948426656",      // Pelitos Estetica y Spa Canino
  },
};

/* Números que quedaron escritos a mano dentro del HTML (decenas de enlaces).
   Se usan solo para reconocerlos y reemplazarlos por los de SITE, de modo que
   cambiar un teléfono en un solo sitio realmente afecte a TODO el sitio. */
const WHATSAPP_HEREDADOS = {
  "51939356376": "consultorio",
  "51948426656": "estetica",
};

function sincronizarEnlacesWhatsapp() {
  document.querySelectorAll('a[href*="api.whatsapp.com"]').forEach((a) => {
    try {
      const url = new URL(a.href);
      const actual = url.searchParams.get("phone");
      const rol = WHATSAPP_HEREDADOS[actual];
      if (!rol) return;
      const nuevo = SITE.whatsapp[rol];
      if (!nuevo || nuevo === actual) return;
      url.searchParams.set("phone", nuevo);
      a.href = url.toString();
    } catch (e) {
      /* Un href malformado no debe interrumpir el resto de la página. */
    }
  });
}

function enlaceWhatsapp(texto, numero = SITE.whatsapp.consultorio) {
  const mensaje = String(texto || "Hola, quiero reservar una cita en Pelitos Veterinaria.");
  return `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
}

function sanitizarTexto(valor, max = 80) {
  return String(valor || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/* ÚNICA regla de teléfono del sitio: mínimo 9 dígitos (celular peruano),
   máximo 15 (norma E.164, permite prefijo de país).
   Antes había tres reglas distintas: 6-15 aquí, >=9 en contacto y >=9 en
   registro con un mensaje que decía "necesitamos 9 dígitos". */
const TELEFONO_MIN_DIGITOS = 9;
const TELEFONO_MAX_DIGITOS = 15;

function telefonoValido(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  return digitos.length >= TELEFONO_MIN_DIGITOS && digitos.length <= TELEFONO_MAX_DIGITOS;
}

function abrirExterno(url) {
  /* Con "noopener" el navegador devuelve null, así que no hay ventana que
     desvincular a mano: el `ventana.opener = null` anterior era código muerto. */
  window.open(url, "_blank", "noopener,noreferrer");
}

// Se publican para que los demás bloques de este archivo puedan reutilizarlas.
window.SITE = SITE;
window.enlaceWhatsapp = enlaceWhatsapp;
window.abrirExterno = abrirExterno;
window.sincronizarEnlacesWhatsapp = sincronizarEnlacesWhatsapp;

document.addEventListener("DOMContentLoaded", () => {
  sincronizarEnlacesWhatsapp();

  const header = document.querySelector(".header");
  if (header) {
    const actualizarCabecera = () => {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    actualizarCabecera();
    window.addEventListener("scroll", actualizarCabecera, { passive: true });
  }

  const botonMenu = document.querySelector("[data-menu-btn]");
  const navMovil = document.querySelector("[data-nav-movil]");

  if (botonMenu && navMovil) {
    const cerrarMenu = () => {
      navMovil.classList.remove("abierto");
      botonMenu.setAttribute("aria-expanded", "false");
      botonMenu.setAttribute("aria-label", "Abrir menú");
    };

    botonMenu.addEventListener("click", () => {
      const abierto = navMovil.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", String(abierto));
      botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    navMovil.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", cerrarMenu);
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") cerrarMenu();
    });
  }

  document.querySelectorAll("[data-anio]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const elementos = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
    /* Sin animación, pero el número SÍ debe mostrar su valor final. */
    document.querySelectorAll("[data-target]").forEach((el) => animarContador(el, true));
  } else if (elementos.length) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("visible");
          /* Con arrow function: forEach pasa el índice como 2.º argumento y activaría `sinAnimar`. */
          entrada.target.querySelectorAll("[data-target]").forEach((n) => animarContador(n));
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.12 }
    );
    elementos.forEach((el) => observador.observe(el));
  }

  const formulario = document.querySelector("[data-form-cita]");
  if (formulario) {
    const cajaError = formulario.querySelector("[data-error]");
    const serviciosPermitidos = [
      "Consulta",
      "Vacunación",
      "Desparasitación",
      "Laboratorio",
      "Cirugía",
      "Estética",
      "Otro",
    ];

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const datos = new FormData(formulario);
      const nombre = sanitizarTexto(datos.get("nombre"), 80);
      const telefono = sanitizarTexto(datos.get("telefono"), 20);
      const mascota = sanitizarTexto(datos.get("mascota"), 60);
      const servicioRaw = sanitizarTexto(datos.get("servicio"), 40);
      const servicio = serviciosPermitidos.includes(servicioRaw) ? servicioRaw : "Consulta";
      /* 600 = el mismo maxlength que declara el <textarea> del formulario. */
      const mensaje = sanitizarTexto(datos.get("mensaje"), 600);

      let error = "";
      if (nombre.length < 2) error = "Ingresa tu nombre.";
      else if (!telefonoValido(telefono)) error = "Ingresa un teléfono válido.";

      if (error) {
        if (cajaError) {
          cajaError.textContent = error;
          cajaError.hidden = false;
        }
        return;
      }

      if (cajaError) {
        cajaError.textContent = "";
        cajaError.hidden = true;
      }

      const texto = [
        "Hola Pelitos, quiero solicitar una cita.",
        `Nombre: ${nombre}`,
        `Teléfono: ${telefono}`,
        `Mascota: ${mascota || "-"}`,
        `Servicio: ${servicio}`,
        `Mensaje: ${mensaje || "-"}`,
      ].join("\n");

      const numeroDestino =
        servicio === "Estética" ? SITE.whatsapp.estetica : SITE.whatsapp.consultorio;

      abrirExterno(enlaceWhatsapp(texto, numeroDestino));
    });
  }
});

/* Único animador de contadores del sitio.
   `sinAnimar` pinta directamente el valor final (movimiento reducido).
   La marca `data-contador-hecho` evita que dos llamadas peleen por el mismo número. */
function animarContador(el, sinAnimar) {
  if (!el || el.dataset.contadorHecho === "1") return;
  const target = Number(el.dataset.target);
  if (!Number.isFinite(target) || target <= 0) return;

  const sufijo = el.dataset.sufijo || "+";
  el.dataset.contadorHecho = "1";

  if (sinAnimar) {
    el.textContent = `${target}${sufijo}`;
    return;
  }

  const duracion = 1400;
  const inicio = performance.now();

  const tick = (ahora) => {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const actual = Math.round(target * progreso);
    el.textContent = `${actual}${sufijo}`;
    if (progreso < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* Devuelve true si la página abierta es la indicada en el <body data-pagina="..."> */
function esPagina(nombre) {
  return (document.body && document.body.dataset.pagina) === nombre;
}


/* ==========================================================================
   BLOQUE 2 · ACCESO DE CLIENTES (demostración)
   Guarda la sesión en el navegador. No valida contra ningún servidor.
   ========================================================================== */

(function () {
  "use strict";

  var sesion = null; // memoria de la sesión actual

  function mostrarToast(mensaje, icono) {
    var t = document.createElement("div");
    t.className = "toast-notif";
    t.textContent = (icono ? icono + " " : "") + mensaje;
    document.body.appendChild(t);
    window.requestAnimationFrame(function () {
      t.classList.add("visible");
    });
    window.setTimeout(function () {
      t.classList.remove("visible");
      window.setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 400);
    }, 2600);
  }

  function guardarUsuario(datos) {
    sesion = datos || null;
    return sesion;
  }

  function usuarioActual() {
    return sesion;
  }

  /* Cambia entre las pestañas "acceso" y "registro" */
  function abrirModal(vista) {
    mostrarVista(vista === "registro" ? "registro" : "acceso");
    var caja = document.querySelector(".login-split-form-wrap");
    if (caja) caja.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function mostrarVista(vista) {
    document.querySelectorAll("[data-auth-tab]").forEach(function (b) {
      var activo = b.dataset.authTab === vista;
      b.classList.toggle("activo", activo);
      b.setAttribute("aria-selected", activo ? "true" : "false");
    });
    document.querySelectorAll("[data-auth-vista]").forEach(function (p) {
      p.hidden = p.dataset.authVista !== vista;
    });
  }

  /* ---------------- Validación en vivo ---------------- */
  function fuerza(clave) {
    var puntos = 0;
    if (clave.length >= 6) puntos++;
    if (clave.length >= 10) puntos++;
    if (/[A-Z]/.test(clave) && /[a-z]/.test(clave)) puntos++;
    if (/\d/.test(clave)) puntos++;
    if (/[^A-Za-z0-9]/.test(clave)) puntos++;
    return Math.min(puntos, 4);
  }

  var ETIQUETAS = ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"];

  function validar(input) {
    var tipo = input.dataset.authValidar;
    var valor = input.value.trim();
    var grupo = input.closest(".auth-form-group");
    var pista = grupo ? grupo.querySelector("[data-auth-pista]") : null;
    var ok = true;
    var msg = "";

    if (tipo === "email") {
      ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
      msg = valor ? (ok ? "Correo válido." : "Revisa el formato del correo.") : "";
    } else if (tipo === "clave") {
      ok = valor.length >= 6;
      msg = valor ? (ok ? "Contraseña lista." : "Mínimo 6 caracteres.") : "";
    } else if (tipo === "clave-nueva") {
      var f = fuerza(valor);
      ok = valor.length >= 6;
      msg = valor ? "Seguridad: " + ETIQUETAS[f] : "";
      var barra = grupo ? grupo.querySelector("[data-fuerza]") : null;
      if (barra) {
        barra.style.setProperty("--nivel", String(valor ? f + 1 : 0));
        barra.dataset.nivel = String(valor ? f : -1);
      }
    } else if (tipo === "nombre") {
      ok = valor.length >= 3;
      msg = valor ? (ok ? "Gracias." : "Ingresa al menos 3 caracteres.") : "";
    } else if (tipo === "telefono") {
      ok = telefonoValido(valor);
      msg = valor
        ? ok
          ? "Número válido."
          : "Necesitamos al menos " + TELEFONO_MIN_DIGITOS + " dígitos."
        : "";
    }

    if (grupo) {
      /* Un campo obligatorio vacío también se marca en rojo: antes no se
         pintaba nada y el aviso decía "revisa los campos marcados en rojo". */
      var faltaObligatorio = input.required && !valor;
      grupo.classList.toggle("auth-ok", ok && valor.length > 0);
      grupo.classList.toggle("auth-mal", (!ok && valor.length > 0) || faltaObligatorio);
      if (faltaObligatorio && !msg) msg = "Este dato es obligatorio.";
    }
    if (pista) pista.textContent = msg;
    return ok || (!input.required && !valor);
  }

  function iniciar() {
    /* Mostrar u ocultar contraseña */
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".auth-toggle-pass");
      if (!btn) return;
      var campo = document.getElementById(btn.dataset.toggleFor);
      if (!campo) return;
      var visible = campo.type === "text";
      campo.type = visible ? "password" : "text";
      btn.classList.toggle("activo", !visible);
      btn.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
    });

    /* Pestañas acceso / registro */
    document.querySelectorAll("[data-auth-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        mostrarVista(b.dataset.authTab);
      });
    });

    /* Validación en vivo */
    document.querySelectorAll("[data-auth-validar]").forEach(function (input) {
      input.addEventListener("input", function () {
        validar(input);
      });
      input.addEventListener("blur", function () {
        validar(input);
      });
    });
  }

  /* Enlaces que solo muestran un aviso (antes usaban onclick="..." en el HTML,
     lo que impide aplicar una CSP estricta). */
  document.addEventListener("click", function (e) {
    var enlace = e.target.closest("[data-aviso]");
    if (!enlace) return;
    e.preventDefault();
    mostrarToast(
      enlace.getAttribute("data-aviso"),
      enlace.getAttribute("data-aviso-icono") || ""
    );
  });

  /* ÚNICO sistema de avisos del sitio. Antes había tres (mostrarToast, avisar y
     un window.PelitosAviso del bloque de efectos que nadie llamaba). */
  window.PelitosAviso = mostrarToast;

  window.PelitosAuth = {
    mostrarToast: mostrarToast,
    guardarUsuario: guardarUsuario,
    usuarioActual: usuarioActual,
    validarCampo: validar
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();


/* ==========================================================================
   BLOQUE 3 · CATÁLOGO DEL PETSHOP (SOLO DATOS)
   AQUÍ SE CAMBIAN PRECIOS, PRODUCTOS Y PRESENTACIONES.
   Es una lista de productos: copie un bloque { ... } para agregar otro.
   ========================================================================== */

(function (global) {
  "use strict";

  var PRODUCTOS = [
    // ==================================================================
    // ALIMENTO (producto del configurador destacado)
    // ==================================================================
    {
      id: "alimento-super-premium-canino",
      categoria: "alimentos",
      categoriaTexto: "Nutrición & Salud Canina",
      titulo: "Alimento Súper Premium Canino",
      resumen:
        "Fórmula balanceada con ingredientes de alta digestibilidad, probióticos y omegas 3 y 6 para pelaje brillante y vitalidad.",
      imagen: "../images/productos/producto-1.jpg",
      precio: 48.0,
      destacado: true,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1.5 kg", extra: 0 },
            { label: "3.0 kg", extra: 37, predeterminada: true },
            { label: "7.5 kg", extra: 132 },
            { label: "15 kg", extra: 262 }
          ]
        },
        {
          nombre: "Sabor o fórmula",
          opciones: [
            { label: "Pollo & Arroz", color: "#eab308", extra: 0 },
            { label: "Salmón & Camote", color: "#f97316", extra: 0 },
            { label: "Cordero Hipoalergénico", color: "#8b5cf6", extra: 0 }
          ]
        },
        {
          nombre: "Etapa de vida",
          opciones: [
            { label: "Cachorro", extra: 0 },
            { label: "Adulto raza pequeña", extra: 0, predeterminada: true },
            { label: "Adulto raza grande", extra: 0 },
            { label: "Senior +7 años", extra: 0 }
          ]
        }
      ]
    },

    // ==================================================================
    // ACCESORIOS, SALUD E HIGIENE
    // ==================================================================
    {
      id: "arnes-correas",
      categoria: "accesorios",
      categoriaTexto: "Accesorios & Paseo",
      titulo: "Arnés y Correas para Mascotas",
      resumen:
        "Arnés acolchado con correa a juego: reparte la fuerza en el pecho para no lastimar el cuello, cierres regulables, bandas reflectivas para el paseo nocturno y cuatro tallas de S a XL en cuatro colores.",
      imagen: "../images/productos/producto-arnes.jpg",
      precio: 38.0,
      variantes: [
        {
          nombre: "Talla",
          opciones: [
            { label: "S (pequeño)", extra: 0 },
            { label: "M (mediano)", extra: 6 },
            { label: "L (grande)", extra: 11 },
            { label: "XL (extra grande)", extra: 16 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Morado Pelitos", color: "#5b2a86", extra: 0 },
            { label: "Naranja", color: "#f0791e", extra: 0 },
            { label: "Azul", color: "#2563eb", extra: 0 },
            { label: "Rojo", color: "#dc2626", extra: 0 }
          ]
        }
      ]
    },
    {
      id: "antipulgas-desparasitantes",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Antipulgas y Desparasitantes",
      resumen:
        "Pipetas, comprimidos y collares antiparasitarios dosificados por rango de peso, contra pulgas, garrapatas y parásitos internos. Te indicamos la dosis exacta y la fecha del refuerzo antes de comprar.",
      imagen: "../images/productos/producto-antipulgas.jpg",
      precio: 50.0,
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Rango de peso",
          opciones: [
            { label: "2 a 3.5 kg", extra: 0 },
            { label: "3.5 a 7.5 kg", extra: 8 },
            { label: "7.5 a 15 kg", extra: 18 },
            { label: "15 a 30 kg", extra: 28 },
            { label: "30 a 60 kg", extra: 40 }
          ]
        },
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 unidad (mensual)", extra: 0 },
            { label: "Caja x3 unidades", extra: 90 }
          ]
        }
      ]
    },
    {
      id: "cama-ortopedica",
      categoria: "accesorios",
      categoriaTexto: "Camas & Confort",
      titulo: "Cama Ortopédica y Suave",
      resumen:
        "Cama con base de espuma de alta densidad y borde elevado que sirve de apoyo para la cabeza: alivia caderas y articulaciones en perros mayores. Funda exterior lavable y tres tamaños de 50 a 90 cm.",
      imagen: "../images/productos/producto-cama.jpg",
      precio: 55.0,
      variantes: [
        {
          nombre: "Tamaño",
          opciones: [
            { label: "50 cm (pequeño)", extra: 0 },
            { label: "70 cm (mediano)", extra: 25 },
            { label: "90 cm (grande)", extra: 50 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Gris clínico", color: "#9ca3af", extra: 0 },
            { label: "Rosa palo", color: "#f472b6", extra: 0 },
            { label: "Café moca", color: "#92400e", extra: 0 }
          ]
        }
      ]
    },
    {
      id: "shampoo-dermatologico",
      categoria: "higiene",
      categoriaTexto: "Higiene & Cosmética",
      titulo: "Shampoo y Cuidado Dermatológico",
      resumen:
        "Línea dermatológica de pH neutro para mascotas: avena para piel sensible, fórmula antiparasitaria, realce de pelo blanco o brillo intenso. No irrita los ojos y viene en 250 ml, 500 ml y 1 litro.",
      imagen: "../images/productos/producto-shampoo.jpg",
      precio: 25.0,
      variantes: [
        {
          nombre: "Fórmula",
          opciones: [
            { label: "Piel sensible (avena)", extra: 0 },
            { label: "Antipulgas / antiparasitario", extra: 5 },
            { label: "Pelo blanco / radiante", extra: 4 },
            { label: "Brillo & suavidad", extra: 3 }
          ]
        },
        {
          nombre: "Volumen",
          opciones: [
            { label: "250 ml", extra: 0 },
            { label: "500 ml", extra: 15 },
            { label: "1 litro", extra: 40 }
          ]
        }
      ]
    },
    {
      id: "comedero-bebedero",
      categoria: "accesorios",
      categoriaTexto: "Accesorios & Comederos",
      titulo: "Comedero y Bebedero Ergonómico",
      resumen:
        "Platos ergonómicos a la altura correcta para comer sin forzar el cuello: modelo anti-ahogo de comida lenta, doble plato de acero inoxidable y bebedero automático por gravedad. Antideslizantes y aptos para lavavajillas.",
      imagen: "../images/productos/producto-comedero.jpg",
      precio: 28.0,
      variantes: [
        {
          nombre: "Modelo",
          opciones: [
            { label: "Anti-ahogo lento", extra: 0 },
            { label: "Doble plato de acero", extra: 8 },
            { label: "Automático por gravedad", extra: 15 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Turquesa", color: "#06b6d4", extra: 0 },
            { label: "Naranja", color: "#f97316", extra: 0 },
            { label: "Verde menta", color: "#10b981", extra: 0 }
          ]
        }
      ]
    },

    // ==================================================================
    // LÍNEA NATURALISTIC (Grupo MOR)
    // Ingredientes, análisis y porciones transcritos del reverso
    // de cada envase. Ver notas donde la etiqueta no era legible.
    // ==================================================================
    {
      id: "naturalistic-meat-mix-pollo-pato",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Meat Mix Pollo con Goji Berry & Pato con Arándano",
      imagen: "../images/productos/naturalistic-meat-mix-pollo-pato-frente.jpg",
      imagenReverso: "../images/productos/naturalistic-meat-mix-pollo-pato-reverso.jpg",
      precio: 19.0,
      precioAntes: 22.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Fine Recipes (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Snack complementario para perros con dos recetas en una bolsa. El pollo con goji berry es rico en proteína y aminoácidos que ayudan a mantener la musculatura fuerte; el pato con arándano es una buena fuente de proteína y de ácidos grasos saludables.",
        sellos: ["Grain Free", "Real Meat", "Additive Free"],
        ingredientes: [
          {
            titulo: "Pollo con Goji Berry",
            detalle:
              "Pollo, goji berry, patata, almidón, glicerina vegetal, goma, sorbato de potasio."
          },
          {
            titulo: "Pato con Arándano",
            detalle:
              "Pato, arándano, patata, glicerina vegetal, goma, sorbato de potasio."
          }
        ],
        analisisNota:
          "Los porcentajes del análisis garantizado no son legibles en la etiqueta fotografiada. Confírmalos con el envase físico antes de publicarlos.",
        porciones: [
          { peso: "Menos de 5 kg", racion: "5 – 10 unidades al día" },
          { peso: "5 a 10 kg", racion: "10 – 20 unidades al día" },
          { peso: "10 a 20 kg", racion: "20 – 30 unidades al día" },
          { peso: "Más de 20 kg", racion: "30 – 50 unidades al día" }
        ],
        conservacion:
          "Mantener el envase firmemente cerrado, en un lugar fresco y seco. Consumir antes de la fecha indicada. Mantener fuera del alcance de los niños; la bolsa no es un juguete.",
        uso:
          "Consumo veterinario. Saborizado. Alimento complementario: no reemplaza una dieta balanceada.",
        importador:
          "Comercial Aquamundo Perú SAC / Grupo MOR · SENASA PEA.02.0S.0.00543"
      }
    },
    {
      id: "naturalistic-chicken-sushi",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Classic",
      titulo: "Chicken Sushi 94% Carne",
      imagen: "../images/productos/naturalistic-chicken-sushi-frente.jpg",
      imagenReverso: "../images/productos/naturalistic-chicken-sushi-reverso.jpg",
      precio: 19.0,
      precioAntes: 20.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Classic (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Snack en rodajas tipo sushi cuyo ingrediente principal es carne de pollo y bacalao (94%). Fórmula altamente palatable, baja en grasa y libre de aditivos químicos: útil como premio de entrenamiento.",
        sellos: [
          "Gluten Free",
          "Bajo en grasa",
          "Sin azúcar añadida",
          "Sin colorantes artificiales añadidos"
        ],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Pollo 84 %, bacalao 10 %, almidón 2 %, glicerina vegetal 2 %, proteína de soya 1 %, proteína vegetal 1 %, sal 0.5 %, sorbitol 0.1 %, aminoácidos 0.1 %, colorantes naturales 0.1 %, sorbato de potasio 0.1 %, sucralosa 0.01 %."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 33 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 4 %" },
          { nombre: "Fibra cruda", valor: "máx. 3 %" },
          { nombre: "Ceniza", valor: "máx. 8 %" },
          { nombre: "Humedad", valor: "máx. 20 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 2 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco, protegido de la luz y de temperaturas elevadas.",
        uso:
          "Venta libre / uso veterinario. Prohibido su uso en la alimentación de rumiantes. Suplemento alimenticio de uso exclusivo animal: no reemplaza un alimento completo.",
        fabricante: "Qingdao Walt Food Co., Ltd. — Shandong, China",
        importador:
          "Soc. Comercial Agromundo Perú SAC / Grupo MOR · SENASA P.0.04.0A/100561"
      }
    },
    {
      id: "naturalistic-lamb-strips",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Classic",
      titulo: "Lamb Strips 74% Carne (tiras de cordero)",
      imagen: "../images/productos/naturalistic-lamb-strips-frente.jpg",
      imagenReverso: "../images/productos/naturalistic-lamb-strips-reverso.jpg",
      precio: 19.0,
      precioAntes: 21.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Classic (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Tiras masticables de cordero con pechuga de pato. Altas en proteína y con raíz de achicoria (fuente natural de inulina), sin azúcares ni colorantes.",
        sellos: [
          "Receta Gluten Free",
          "Bajo en grasa",
          "Sin azúcar añadida",
          "Sin sabores ni conservantes artificiales añadidos"
        ],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Cordero 61 %, pechuga de pato 10 %, proteína de soya 4 %, almidón vegetal 4 %, proteína hidrolizada vegetal 4 %, raíz de achicoria 3 %, glicerina vegetal 2 %, cloruro de sodio 1 %, sorbato de potasio 0.1 %, citrato de potasio 0.1 %."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 28 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 3 %" },
          { nombre: "Fibra cruda", valor: "máx. 2 %" },
          { nombre: "Ceniza", valor: "máx. 6 %" },
          { nombre: "Humedad", valor: "máx. 18 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 2 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "6 – 8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco, protegido de la luz.",
        uso:
          "Venta libre / uso veterinario. Prohibido su uso en la alimentación de rumiantes. Suplemento alimenticio de uso exclusivo animal: no reemplaza un alimento completo.",
        fabricante: "Qingdao Multi Foods Co., Ltd. — Shandong, China",
        importador:
          "Comercial Agromundo Pets SAC / Grupo MOR · SENASA F.A.04.04.04.100951"
      }
    },
    {
      id: "naturalistic-meatballs-salmon-camote",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Meat Balls Salmón & Camote",
      imagen: "../images/productos/naturalistic-meatballs-salmon-camote-frente.jpg",
      imagenReverso:
        "../images/productos/naturalistic-meatballs-salmon-camote-reverso.jpg",
      precio: 19.0,
      precioAntes: 23.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Fine Recipes (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Albóndigas elaboradas con salmón real y camote. El salmón aporta proteína de alta calidad rica en ácidos grasos esenciales (Omega 3) y el camote es una fuente de carbohidratos de bajo índice glucémico, vitaminas y minerales.",
        sellos: ["Grain Free", "Real Meat", "Potato Free", "Fuente de Omega 3"],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Salmón 77 %, camote 15 %, almidón de papa 4 %, glicerina vegetal 2 %, trifosfato de polifosfato 2 %, vegetal 2 %, sorbitol < 2 %, aceite de salmón < 1 %, almidón de arveja < 1 %, aminoácidos < 1 %, sal < 1 %."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 18 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 8 %" },
          { nombre: "Fibra cruda", valor: "máx. 3 %" },
          { nombre: "Ceniza", valor: "máx. 5 %" },
          { nombre: "Humedad", valor: "máx. 18 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "2 – 4 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "6 – 8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y protegido de la luz y de la temperatura elevada.",
        uso:
          "Venta libre / uso veterinario. Prohibido su uso en la alimentación de rumiantes. Suplemento alimenticio de uso exclusivo animal: no reemplaza una alimentación completa.",
        fabricante:
          "Qingdao Muir World, Ltd. — Qingdao, China (N.º establecimiento 3700PF0079)",
        importador:
          "Comercial Agromundo Pets SAC / Grupo MOR · SENASA 04.04.0A.109661"
      }
    },
    {
      id: "naturalistic-meatballs-pato-manzana",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Meat Balls Pato & Manzana",
      imagen: "../images/productos/naturalistic-meatballs-pato-manzana-frente.jpg",
      imagenReverso:
        "../images/productos/naturalistic-meatballs-pato-manzana-reverso.jpg",
      precio: 19.0,
      precioAntes: 23.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Fine Recipes (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Albóndigas a base de carne real de pato con manzana. Fuente de vitaminas A, B y B12, zinc, fósforo y hierro; contiene antioxidantes, sin azúcar y libre de granos.",
        sellos: ["Grain Free", "Real Meat", "Additive Free", "Con antioxidantes"],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Pato 71 %, manzana 15 %, almidón de papa, glicerina vegetal 1 %, trifosfato de polifosfato 2 %, sorbitol 2 %, goma, sal."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 28 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 8 %" },
          { nombre: "Fibra cruda", valor: "máx. 2 %" },
          { nombre: "Cenizas", valor: "máx. 3 %" },
          { nombre: "Humedad", valor: "máx. 20 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 2 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "6 – 8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco, protegido de la luz y a temperatura ambiente.",
        uso:
          "Producto de consumo animal. No sustituye una dieta balanceada. Mantener fuera del alcance de los niños.",
        fabricante: "Qingdao Yalute Food Co., Ltd. — Qingdao, China",
        importador: "Comercial Aquamarina Perú SAC / Grupo MOR"
      }
    },
    {
      id: "naturalistic-grill-beef-burger-bbq",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Grill",
      titulo: "Tasty Beef Burger con BBQ (hamburguesas)",
      imagen: "../images/productos/naturalistic-grill-beef-burger-bbq-frente.jpg",
      imagenReverso:
        "../images/productos/naturalistic-grill-beef-burger-bbq-reverso.jpg",
      precio: 19.0,
      precioAntes: 25.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 120 g (3 unidades)", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Grill (Grupo MOR)",
        presentacion: "Bolsa de 120 g · 3 hamburguesas",
        descripcion:
          "Hamburguesas para perros altas en proteína, elaboradas con 88 % de carne de res y humo natural, que les da un sabor a barbecue. Deshidratadas a baja temperatura para conservar sus nutrientes.",
        sellos: ["Grain Free", "Real Meat", "Additive Free"],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Carne de res 88 %, almidón de papa, glicerina vegetal, humo natural."
          }
        ],
        analisisNota:
          "Los porcentajes del análisis garantizado no son legibles en la etiqueta fotografiada. Confírmalos con el envase físico antes de publicarlos.",
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 10 g al día" },
          { peso: "5 a 10 kg", racion: "10 – 20 g al día" },
          { peso: "10 a 20 kg", racion: "20 – 30 g al día" },
          { peso: "Más de 20 kg", racion: "30 – 40 g al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco. Deja siempre agua fresca disponible para tu mascota.",
        uso: "Uso veterinario. Usar siempre como suplemento del alimento principal.",
        importador: "Comercial Aquamundo Perú SAC / Grupo MOR"
      }
    }
  ];

  /* Se añaden los productos escritos en js/productos-nuevos.js (formato simple).
     Ese archivo se carga antes que este y deja la lista ya normalizada en
     window.PELITOS_PRODUCTOS_EXTRA. Si no está cargado, no pasa nada. */
  var EXTRA = Array.isArray(global.PELITOS_PRODUCTOS_EXTRA)
    ? global.PELITOS_PRODUCTOS_EXTRA
    : [];

  var yaUsados = {};
  PRODUCTOS.forEach(function (p) {
    yaUsados[p.id] = true;
  });

  EXTRA.forEach(function (p) {
    if (yaUsados[p.id]) {
      /* Mismo id: el producto nuevo reemplaza al del catálogo original, así se
         puede corregir un producto sin editar este bloque. */
      for (var i = 0; i < PRODUCTOS.length; i++) {
        if (PRODUCTOS[i].id === p.id) {
          PRODUCTOS[i] = p;
          break;
        }
      }
      return;
    }
    yaUsados[p.id] = true;
    PRODUCTOS.push(p);
  });

  global.PELITOS_CATALOGO = Object.freeze({
    moneda: "S/",
    productos: PRODUCTOS
  });
})(window);


/* ==========================================================================
   BLOQUE 4 · PETSHOP: CATÁLOGO, FICHAS Y CARRITO
   Lógica de la página PetShop. No hace falta tocarla para cambiar precios.
   ========================================================================== */

(function () {
  "use strict";

  // =========================================================
  // 0. Configuración y utilidades
  // =========================================================

  var CATALOGO = window.PELITOS_CATALOGO;
  if (!CATALOGO || !Array.isArray(CATALOGO.productos)) {
    console.error(
      "[PetShop] No se encontró el catálogo (window.PELITOS_CATALOGO, BLOQUE 3 de js/main.js)."
    );
    return;
  }

  var CLAVE_PRECIOS = "pelitos:precios:v2";
  var CLAVE_CARRITO = "pelitos:carrito:v2";
  var MAX_UNIDADES = 99;

  // Fallbacks por si main.js no estuviera cargado en alguna página.
  var WHATSAPP = (window.SITE && window.SITE.whatsapp && window.SITE.whatsapp.consultorio) || "51939356376";

  var abrirExterno =
    typeof window.abrirExterno === "function"
      ? window.abrirExterno
      : function (url) {
          /* Con "noopener" el navegador ya devuelve null: no hay opener que
             limpiar (el `v.opener = null` anterior nunca se ejecutaba). */
          window.open(url, "_blank", "noopener,noreferrer");
        };

  var enlaceWhatsapp =
    typeof window.enlaceWhatsapp === "function"
      ? window.enlaceWhatsapp
      : function (texto, numero) {
          return (
            "https://api.whatsapp.com/send?phone=" +
            (numero || WHATSAPP) +
            "&text=" +
            encodeURIComponent(String(texto || ""))
          );
        };

  /** Escapa texto para insertarlo con innerHTML sin riesgo de inyección. */
  function esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Soles (número) → céntimos (entero). */
  function aCentimos(soles) {
    var n = Number(soles);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }

  /** Céntimos → texto con moneda. */
  function formatear(centimos) {
    return CATALOGO.moneda + " " + (Math.max(0, Math.round(centimos)) / 100).toFixed(2);
  }

  function porId(id) {
    for (var i = 0; i < CATALOGO.productos.length; i++) {
      if (CATALOGO.productos[i].id === id) return CATALOGO.productos[i];
    }
    return null;
  }

  function opcionPredeterminada(grupo) {
    for (var i = 0; i < grupo.opciones.length; i++) {
      if (grupo.opciones[i].predeterminada) return grupo.opciones[i];
    }
    return grupo.opciones[0];
  }

  // Almacenamiento en memoria de la sesión: el carrito y las preferencias
  // viven mientras la pestaña esté abierta. Se evita el almacenamiento del
  // navegador para que la tienda funcione en cualquier entorno (incógnito,
  // vistas previas incrustadas, navegadores con cookies restringidas).
  // OJO: por eso NADA sobrevive a un F5. Si algún día se quiere persistir,
  // basta cambiar estas dos funciones por localStorage; la validación de
  // cargarCarrito() ya está preparada para datos viejos o corruptos.
  var memoria = {};

  function leerJSON(clave, porDefecto) {
    try {
      var raw = memoria[clave];
      if (!raw) return porDefecto;
      var dato = JSON.parse(raw);
      return dato && typeof dato === "object" ? dato : porDefecto;
    } catch (e) {
      return porDefecto;
    }
  }

  function escribirJSON(clave, valor) {
    try {
      memoria[clave] = JSON.stringify(valor);
      return true;
    } catch (e) {
      return false;
    }
  }

  // =========================================================
  // 1. Precios (base del catálogo + ajustes locales)
  // =========================================================

  /**
   * Ajustes guardados en el navegador. Forma:
   *   { "<idProducto>": { base: 2350, extras: { "Grupo|Opción": 4200 } } }
   * Los valores están en céntimos. Si un producto no tiene ajuste,
   * manda el precio escrito en el catálogo del BLOQUE 3 de js/main.js.
   */
  var ajustes = normalizarAjustes(leerJSON(CLAVE_PRECIOS, {}));

  function normalizarAjustes(bruto) {
    var limpio = {};
    Object.keys(bruto || {}).forEach(function (id) {
      if (!porId(id)) return; // descarta productos que ya no existen
      var entrada = bruto[id] || {};
      var salida = {};
      if (Number.isFinite(entrada.base) && entrada.base >= 0) {
        salida.base = Math.round(entrada.base);
      }
      if (entrada.extras && typeof entrada.extras === "object") {
        salida.extras = {};
        Object.keys(entrada.extras).forEach(function (clave) {
          var v = entrada.extras[clave];
          if (Number.isFinite(v) && v >= 0) salida.extras[clave] = Math.round(v);
        });
      }
      if (salida.base !== undefined || salida.extras) limpio[id] = salida;
    });
    return limpio;
  }

  function precioBase(producto) {
    /* Guarda contra productos retirados del catálogo: el carrito podía
       conservar un id que ya no existe y aquí reventaba con TypeError. */
    if (!producto) return 0;
    var a = ajustes[producto.id];
    return a && a.base !== undefined ? a.base : aCentimos(producto.precio);
  }

  function recargo(producto, nombreGrupo, opcion) {
    if (!producto || !opcion) return 0;
    var a = ajustes[producto.id];
    var clave = nombreGrupo + "|" + opcion.label;
    if (a && a.extras && a.extras[clave] !== undefined) return a.extras[clave];
    return aCentimos(opcion.extra || 0);
  }

  /** Precio total de un producto con un conjunto de opciones elegidas. */
  function precioCon(producto, seleccion) {
    if (!producto) return 0;
    var elegido = seleccion || {};
    var total = precioBase(producto);
    (producto.variantes || []).forEach(function (grupo) {
      var label = elegido[grupo.nombre];
      var opcion = buscarOpcion(grupo, label);
      if (opcion) total += recargo(producto, grupo.nombre, opcion);
    });
    return total;
  }

  function buscarOpcion(grupo, label) {
    for (var i = 0; i < grupo.opciones.length; i++) {
      if (grupo.opciones[i].label === label) return grupo.opciones[i];
    }
    return null;
  }

  /** Precio mínimo posible: base + el recargo más bajo de cada grupo. */
  function precioDesde(producto) {
    var total = precioBase(producto);
    (producto.variantes || []).forEach(function (grupo) {
      var min = null;
      grupo.opciones.forEach(function (op) {
        var r = recargo(producto, grupo.nombre, op);
        if (min === null || r < min) min = r;
      });
      total += min || 0;
    });
    return total;
  }

  /* ---- Oferta: precio regular tachado y % de descuento ----
     Un producto está en oferta si su ficha de el catálogo del BLOQUE 3 de js/main.js
     incluye "precioAntes" mayor que el precio publicado. */
  function enOferta(producto) {
    return (
      !!producto &&
      Number(producto.precioAntes) > 0 &&
      aCentimos(producto.precioAntes) > precioBase(producto)
    );
  }

  /** Diferencia en céntimos entre el precio regular y el de oferta. */
  function deltaOferta(producto) {
    if (!enOferta(producto)) return 0;
    return aCentimos(producto.precioAntes) - precioBase(producto);
  }

  /* El porcentaje se calcula SOBRE EL PRECIO QUE SE MUESTRA TACHADO.
     Antes el tachado incluía los recargos de variantes y el porcentaje no, así
     que la tarjeta podía decir "-27%" junto a dos cifras cuya diferencia real
     era del 12%. */
  function porcentajeOferta(producto, precioActual) {
    if (!enOferta(producto)) return 0;
    var actual =
      precioActual === undefined ? precioBase(producto) : precioActual;
    var antes = actual + deltaOferta(producto);
    if (antes <= 0) return 0;
    return Math.round(((antes - actual) / antes) * 100);
  }

  /** HTML del precio tachado + etiqueta de descuento (o cadena vacía). */
  function htmlAntes(producto, precioActual) {
    if (!enOferta(producto)) return "";
    return (
      '<span class="producto-card__precio-antes">' +
      esc(formatear(precioActual + deltaOferta(producto))) +
      "</span> " +
      '<span class="din-badge-off">-' +
      porcentajeOferta(producto, precioActual) +
      "%</span>"
    );
  }

  /** Inserta (o quita) el precio tachado junto a un elemento de precio. */
  function pintarAntes(elPrecio, producto, precioActual) {
    if (!elPrecio || !elPrecio.parentNode) return;
    var previo = elPrecio.parentNode.querySelector("[data-oferta-antes]");
    if (previo) previo.remove();
    if (!producto || !enOferta(producto)) return;
    var caja = document.createElement("span");
    caja.setAttribute("data-oferta-antes", "1");
    caja.innerHTML = " " + htmlAntes(producto, precioActual);
    elPrecio.parentNode.appendChild(caja);
  }

  // =========================================================
  // 2. Accesibilidad: bloqueo de scroll y foco en diálogos
  // =========================================================

  var pilaDialogos = [];

  var FOCUSABLES =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  /** ¿Ese diálogo ya está en la pila? La pila guarda objetos {el, foco},
      así que hay que comparar la propiedad .el (indexOf(el) daba siempre -1). */
  function enPila(el) {
    for (var i = 0; i < pilaDialogos.length; i++) {
      if (pilaDialogos[i].el === el) return true;
    }
    return false;
  }

  function abrirDialogo(el) {
    if (!el || enPila(el)) return;
    pilaDialogos.push({ el: el, foco: document.activeElement });
    el.classList.add("abierto");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
    var primero = el.querySelector(FOCUSABLES);
    if (primero) primero.focus();
  }

  function cerrarDialogo(el) {
    for (var i = pilaDialogos.length - 1; i >= 0; i--) {
      if (pilaDialogos[i].el !== el) continue;
      var reg = pilaDialogos.splice(i, 1)[0];
      el.classList.remove("abierto");
      el.setAttribute("aria-hidden", "true");
      if (reg.foco && typeof reg.foco.focus === "function") reg.foco.focus();
      break;
    }
    if (!pilaDialogos.length) document.body.classList.remove("sin-scroll");
  }

  function cerrarDialogoSuperior() {
    if (pilaDialogos.length) cerrarDialogo(pilaDialogos[pilaDialogos.length - 1].el);
  }

  // Escape cierra; Tab queda atrapado dentro del diálogo activo.
  document.addEventListener("keydown", function (e) {
    if (!pilaDialogos.length) return;
    if (e.key === "Escape") {
      /* stopImmediatePropagation: stopPropagation NO frena a los demás
         listeners de keydown registrados en este mismo document. */
      e.stopImmediatePropagation();
      cerrarDialogoSuperior();
      return;
    }
    if (e.key !== "Tab") return;

    var activo = pilaDialogos[pilaDialogos.length - 1].el;
    var focusables = Array.prototype.filter.call(
      activo.querySelectorAll(FOCUSABLES),
      function (el) {
        /* getClientRects: offsetParent es null en elementos position:fixed
           y los dejaba fuera del ciclo de Tab. */
        return el.getClientRects().length > 0 || el === document.activeElement;
      }
    );
    if (!focusables.length) return;

    var primero = focusables[0];
    var ultimo = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  });

  // Imagen que no carga → marcador visual, sin atributos onerror.
  document.addEventListener(
    "error",
    function (e) {
      var el = e.target;
      if (el && el.tagName === "IMG" && !el.dataset.falloImagen) {
        el.dataset.falloImagen = "1";
        /* No se borra el src: el lightbox lo necesita y quitarlo abría el
           visor con una imagen vacía. Basta la clase del marcador. */
        el.classList.add("img-sin-foto");
      }
    },
    true
  );

  // =========================================================
  // 3. Avisos (reemplazan alert/confirm bloqueantes)
  // =========================================================

  var temporizadorAviso = null;

  function avisar(texto) {
    var toast = document.getElementById("toast-notif");
    var mensaje = document.getElementById("toast-mensaje");
    /* Si la página no trae el toast fijo en el HTML, se usa el aviso global en
       lugar de perder el mensaje en silencio. */
    if (!toast || !mensaje) {
      if (typeof window.PelitosAviso === "function") window.PelitosAviso(texto);
      return;
    }
    mensaje.textContent = texto;
    toast.classList.add("visible");
    window.clearTimeout(temporizadorAviso);
    temporizadorAviso = window.setTimeout(function () {
      toast.classList.remove("visible");
    }, 3600);
  }

  // =========================================================
  // 4. Configurador del producto destacado
  // =========================================================

  var destacado = null;
  var seleccionDestacado = {};
  var cantidadDestacado = 1;

  function montarDestacado() {
    var raiz = document.getElementById("configurador-destacado");
    if (!raiz) return;

    destacado = CATALOGO.productos.filter(function (p) {
      return p.destacado;
    })[0];

    if (!destacado) {
      raiz.remove();
      return;
    }

    seleccionDestacado = {};
    (destacado.variantes || []).forEach(function (grupo) {
      seleccionDestacado[grupo.nombre] = opcionPredeterminada(grupo).label;
    });

    var img = raiz.querySelector("[data-destacado-img]");
    if (img) {
      img.src = destacado.imagen;
      img.alt = destacado.titulo;
    }
    var nombre = raiz.querySelector("[data-destacado-titulo]");
    if (nombre) nombre.textContent = destacado.titulo;
    var cat = raiz.querySelector("[data-destacado-categoria]");
    if (cat) cat.textContent = destacado.categoriaTexto;
    var resumen = raiz.querySelector("[data-destacado-resumen]");
    if (resumen) resumen.textContent = destacado.resumen || "";

    var contenedor = raiz.querySelector("[data-destacado-variantes]");
    if (contenedor) {
      contenedor.innerHTML = (destacado.variantes || [])
        .map(function (grupo, i) {
          return grupoVarianteHTML(destacado, grupo, i + 1, seleccionDestacado[grupo.nombre]);
        })
        .join("");
    }

    refrescarDestacado();
  }

  /* `esc()` protege contra HTML, pero NO contra CSS: dentro de style="background:"
     un valor como "red;background-image:url(...)" seguiría siendo válido. Solo se
     aceptan colores hexadecimales. */
  function colorSeguro(valor) {
    return /^#[0-9a-fA-F]{3,8}$/.test(String(valor || "")) ? String(valor) : "";
  }

  function grupoVarianteHTML(producto, grupo, numero, seleccionado) {
    var opciones = grupo.opciones
      .map(function (op) {
        var extra = recargo(producto, grupo.nombre, op);
        return (
          '<button type="button" class="variante-btn' +
          (op.label === seleccionado ? " activo" : "") +
          '" role="radio" aria-checked="' +
          (op.label === seleccionado ? "true" : "false") +
          '" data-grupo="' +
          esc(grupo.nombre) +
          '" data-opcion="' +
          esc(op.label) +
          '">' +
          (colorSeguro(op.color)
            ? '<span class="color-dot" style="background:' +
              esc(colorSeguro(op.color)) +
              '"></span> '
            : "") +
          esc(op.label) +
          (extra > 0 ? ' <span class="variante-btn__extra">+' + esc(formatear(extra)) + "</span>" : "") +
          "</button>"
        );
      })
      .join("");

    var etiqueta = numero ? numero + ". " + grupo.nombre : grupo.nombre;

    return (
      '<div class="variante-grupo">' +
      '<div class="variante-grupo__titulo">' +
      "<span>" +
      esc(etiqueta) +
      ":</span>" +
      '<span class="variante-grupo__valor-seleccionado" data-valor-de="' +
      esc(grupo.nombre) +
      '">' +
      esc(seleccionado) +
      "</span>" +
      "</div>" +
      '<div class="variante-opciones" role="radiogroup" aria-label="' +
      esc(grupo.nombre) +
      '">' +
      opciones +
      "</div>" +
      "</div>"
    );
  }

  function refrescarDestacado() {
    if (!destacado) return;
    var unitario = precioCon(destacado, seleccionDestacado);
    var precioEl = document.querySelector("[data-destacado-precio]");
    var subtotalEl = document.querySelector("[data-destacado-subtotal]");
    var cantidadEl = document.querySelector("[data-destacado-cantidad]");
    if (precioEl) {
      precioEl.textContent = formatear(unitario);
      pintarAntes(precioEl, destacado, unitario);
    }
    if (subtotalEl) subtotalEl.textContent = formatear(unitario * cantidadDestacado);
    if (cantidadEl) cantidadEl.value = String(cantidadDestacado);
  }

  function conectarDestacado() {
    var raiz = document.getElementById("configurador-destacado");
    if (!raiz) return;

    raiz.addEventListener("click", function (e) {
      var btnVariante = e.target.closest(".variante-btn");
      if (btnVariante && raiz.contains(btnVariante)) {
        aplicarSeleccion(btnVariante, seleccionDestacado);
        refrescarDestacado();
        return;
      }

      var accion = e.target.closest("[data-accion]");
      if (!accion) return;

      switch (accion.dataset.accion) {
        case "cantidad-menos":
          cantidadDestacado = Math.max(1, cantidadDestacado - 1);
          refrescarDestacado();
          break;
        case "cantidad-mas":
          cantidadDestacado = Math.min(MAX_UNIDADES, cantidadDestacado + 1);
          refrescarDestacado();
          break;
        case "destacado-whatsapp":
          pedirPorWhatsapp(destacado, seleccionDestacado, cantidadDestacado);
          break;
        case "destacado-carrito":
          agregarAlCarrito(destacado, seleccionDestacado, cantidadDestacado);
          break;
      }
    });
  }

  /** Marca el botón elegido dentro de su grupo y actualiza la selección. */
  function aplicarSeleccion(boton, seleccion) {
    var grupo = boton.dataset.grupo;
    var valor = boton.dataset.opcion;
    if (!grupo || !valor) return;

    var contenedor = boton.parentElement;
    Array.prototype.forEach.call(contenedor.querySelectorAll(".variante-btn"), function (b) {
      var activo = b === boton;
      b.classList.toggle("activo", activo);
      b.setAttribute("aria-checked", activo ? "true" : "false");
    });

    seleccion[grupo] = valor;

    var etiqueta = contenedor
      .closest(".variante-grupo")
      .querySelector('[data-valor-de="' + CSS.escape(grupo) + '"]');
    if (etiqueta) etiqueta.textContent = valor;
  }

  // =========================================================
  // 5. Catálogo: render, filtros y buscador
  // =========================================================

  var rejilla = document.getElementById("contenedor-productos");
  var filtroActual = "todos";
  var terminoBusqueda = "";

  /* Quita tildes y pasa a minúsculas: sin esto "nutricion" no encontraba
     "Nutrición" ni "salmon" encontraba "Salmón". */
  function sinTildes(valor) {
    var t = String(valor || "").toLowerCase();
    return t.normalize ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : t;
  }

  function textoBuscable(p) {
    var partes = [p.titulo, p.categoriaTexto, p.resumen || ""];
    if (p.ficha) {
      partes.push(p.ficha.marca, p.ficha.presentacion, p.ficha.descripcion);
      (p.ficha.sellos || []).forEach(function (s) {
        partes.push(s);
      });
      (p.ficha.ingredientes || []).forEach(function (i) {
        partes.push(i.titulo, i.detalle);
      });
    }
    return sinTildes(partes.join(" "));
  }

  function productosVisibles() {
    return CATALOGO.productos.filter(function (p) {
      if (p.destacado) return false; // ya tiene su propia sección
      if (filtroActual !== "todos" && p.categoria !== filtroActual) return false;
      if (terminoBusqueda && textoBuscable(p).indexOf(terminoBusqueda) === -1) return false;
      return true;
    });
  }

  function renderCatalogo() {
    if (!rejilla) return;
    var lista = productosVisibles();

    var contador = document.getElementById("contador-resultados");
    if (contador) {
      contador.textContent =
        lista.length === 1 ? "1 producto" : lista.length + " productos";
    }

    if (!lista.length) {
      rejilla.innerHTML =
        '<div class="catalogo-vacio">' +
        '<p class="catalogo-vacio__icono" aria-hidden="true">🔍</p>' +
        "<h3>No se encontraron productos</h3>" +
        "<p>Prueba con otra palabra clave o elige otra categoría.</p>" +
        "</div>";
      return;
    }

    rejilla.innerHTML = lista.map(tarjetaHTML).join("");

    /* Escalonado de la animación de entrada al filtrar o buscar */
    Array.prototype.forEach.call(rejilla.children, function (card, i) {
      card.style.setProperty("--din-i", String(i % 10));
    });

    /* Las tarjetas recién creadas no pasan por el arranque de los efectos:
       se les vuelven a poner las clases de luz y elevación. */
    if (window.PelitosEfectos && typeof window.PelitosEfectos.refrescar === "function") {
      window.PelitosEfectos.refrescar(rejilla);
    }
  }

  function tarjetaHTML(p) {
    var sellos =
      p.ficha && p.ficha.sellos && p.ficha.sellos.length
        ? '<ul class="ficha-sellos ficha-sellos--card">' +
          p.ficha.sellos
            .slice(0, 3)
            .map(function (s) {
              return '<li class="ficha-sello">' + esc(s) + "</li>";
            })
            .join("") +
          "</ul>"
        : "";

    var presentacion =
      p.ficha && p.ficha.presentacion
        ? '<p class="producto-card__presentacion">' + esc(p.ficha.presentacion) + "</p>"
        : "";

    var resumenVariantes = (p.variantes || [])
      .map(function (g) {
        return (
          '<li class="tipo-mini-tag"><strong>' +
          esc(g.nombre) +
          ":</strong> " +
          esc(
            g.opciones
              .slice(0, 3)
              .map(function (o) {
                return o.label;
              })
              .join(" · ")
          ) +
          "</li>"
        );
      })
      .join("");

    /* Descripción corta de la tarjeta: se prefiere `resumen`; si el producto
       solo trae ficha técnica, se reutiliza su descripción. */
    var textoDesc = p.resumen || (p.ficha && p.ficha.descripcion) || "";
    var descripcion = textoDesc
      ? '<p class="producto-card__desc">' + esc(textoDesc) + "</p>"
      : "";

    var btnFicha = p.ficha
      ? '<button type="button" class="btn-ver-contenido" data-accion="abrir-ficha" data-id="' +
        esc(p.id) +
        '">Ver contenido e ingredientes</button>'
      : "";

    return (
      '<article class="producto-card">' +
      '<div class="producto-card__img-wrap">' +
      (enOferta(p)
        ? /* formatear() respeta los céntimos: con toFixed(0) un precio de
             S/ 19.50 se anunciaba en la cinta como "S/ 20". */
          '<span class="cinta-oferta">🔥 Oferta ' +
          esc(formatear(precioBase(p))) +
          "</span>"
        : "") +
      '<img src="' +
      esc(p.imagen) +
      '" alt="' +
      esc(p.titulo) +
      '" loading="lazy" decoding="async" width="900" height="1125" />' +
      "</div>" +
      '<div class="producto-card__body">' +
      '<span class="producto-card__cat">' +
      esc(p.categoriaTexto) +
      "</span>" +
      '<h3 class="producto-card__titulo">' +
      esc(p.titulo) +
      "</h3>" +
      presentacion +
      descripcion +
      sellos +
      '<ul class="producto-card__tipos-resumen">' +
      resumenVariantes +
      "</ul>" +
      btnFicha +
      '<div class="producto-card__footer">' +
      '<div class="producto-card__precios">' +
      '<span class="producto-card__precio-etiqueta">Desde</span> ' +
      '<span class="producto-card__precio">' +
      esc(formatear(precioDesde(p))) +
      "</span> " +
      htmlAntes(p, precioDesde(p)) +
      "</div>" +
      '<button type="button" class="btn-elegir-opciones" data-accion="abrir-opciones" data-id="' +
      esc(p.id) +
      '">Elegir opciones' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      "</button>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function conectarFiltros() {
    var filtros = document.getElementById("filtros-categoria");
    if (filtros) {
      filtros.addEventListener("click", function (e) {
        var pill = e.target.closest(".filtro-pill");
        if (!pill) return;
        Array.prototype.forEach.call(filtros.querySelectorAll(".filtro-pill"), function (b) {
          var activo = b === pill;
          b.classList.toggle("activo", activo);
          b.setAttribute("aria-pressed", activo ? "true" : "false");
        });
        filtroActual = pill.dataset.filtro || "todos";
        renderCatalogo();
      });
    }

    var buscador = document.getElementById("buscador-input");
    if (buscador) {
      var pendiente = null;
      buscador.addEventListener("input", function () {
        window.clearTimeout(pendiente);
        pendiente = window.setTimeout(function () {
          terminoBusqueda = sinTildes(buscador.value.trim());
          renderCatalogo();
        }, 150);
      });
    }

    if (rejilla) {
      rejilla.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-accion]");
        if (!btn) return;
        if (btn.dataset.accion === "abrir-opciones") abrirModal(btn.dataset.id, false);
        if (btn.dataset.accion === "abrir-ficha") abrirModal(btn.dataset.id, true);
      });
    }
  }

  // =========================================================
  // 6. Modal de producto (variantes + ficha técnica)
  // =========================================================

  var modal = document.getElementById("modal-opciones");
  var modalCuerpo = document.getElementById("modal-body-variantes");
  var productoModal = null;
  var seleccionModal = {};

  function fichaHTML(p) {
    var f = p.ficha;
    if (!f) return "";
    var bloques = [];

    bloques.push('<p class="ficha-marca">' + esc(f.marca) + " · " + esc(f.presentacion) + "</p>");
    bloques.push('<p class="ficha-descripcion">' + esc(f.descripcion) + "</p>");

    if (f.sellos && f.sellos.length) {
      bloques.push(
        '<ul class="ficha-sellos">' +
          f.sellos
            .map(function (s) {
              return '<li class="ficha-sello">' + esc(s) + "</li>";
            })
            .join("") +
          "</ul>"
      );
    }

    bloques.push('<h4 class="ficha-subtitulo">Ingredientes</h4>');
    bloques.push(
      (f.ingredientes || [])
        .map(function (i) {
          return (
            '<div class="ficha-ingrediente"><strong>' +
            esc(i.titulo) +
            "</strong><p>" +
            esc(i.detalle) +
            "</p></div>"
          );
        })
        .join("")
    );

    if (f.analisis && f.analisis.length) {
      bloques.push('<h4 class="ficha-subtitulo">Análisis garantizado</h4>');
      bloques.push(
        '<table class="ficha-tabla"><tbody>' +
          f.analisis
            .map(function (a) {
              return (
                "<tr><th scope=\"row\">" +
                esc(a.nombre) +
                '</th><td class="ficha-tabla__val">' +
                esc(a.valor) +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>"
      );
    }

    if (f.analisisNota) {
      bloques.push('<p class="ficha-nota" role="note">' + esc(f.analisisNota) + "</p>");
    }

    if (f.porciones && f.porciones.length) {
      bloques.push('<h4 class="ficha-subtitulo">Porciones sugeridas</h4>');
      bloques.push(
        '<table class="ficha-tabla"><thead><tr><th scope="col">Peso de la mascota</th>' +
          '<th scope="col">Ración diaria</th></tr></thead><tbody>' +
          f.porciones
            .map(function (r) {
              return (
                "<tr><th scope=\"row\">" +
                esc(r.peso) +
                '</th><td class="ficha-tabla__val">' +
                esc(r.racion) +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>"
      );
    }

    var legal = [
      ["Conservación", f.conservacion],
      ["Modo de uso", f.uso],
      ["Fabricado por", f.fabricante],
      ["Importa y distribuye", f.importador]
    ]
      .filter(function (par) {
        return par[1];
      })
      .map(function (par) {
        return "<p><strong>" + esc(par[0]) + ":</strong> " + esc(par[1]) + "</p>";
      })
      .join("");

    if (legal) bloques.push('<div class="ficha-legal">' + legal + "</div>");

    if (p.imagenReverso) {
      bloques.push(
        '<figure class="ficha-reverso">' +
          '<img src="' +
          esc(p.imagenReverso) +
          '" alt="Reverso del envase de ' +
          esc(p.titulo) +
          '" loading="lazy" decoding="async" />' +
          "<figcaption>Información impresa en el envase</figcaption>" +
          "</figure>"
      );
    }

    return (
      '<details class="ficha-acordeon">' +
      "<summary><span>Contenido, ingredientes y ficha técnica</span>" +
      '<span class="ficha-acordeon__flecha" aria-hidden="true"></span></summary>' +
      '<div class="ficha-cuerpo">' +
      bloques.join("") +
      "</div></details>"
    );
  }

  function abrirModal(id, expandirFicha) {
    var p = porId(id);
    if (!p || !modal || !modalCuerpo) return;

    productoModal = p;
    seleccionModal = {};
    (p.variantes || []).forEach(function (grupo) {
      seleccionModal[grupo.nombre] = opcionPredeterminada(grupo).label;
    });

    var img = document.getElementById("modal-prod-img");
    if (img) {
      delete img.dataset.falloImagen;
      img.classList.remove("img-sin-foto");
      img.src = p.imagen;
      img.alt = p.titulo;
    }

    var titulo = document.getElementById("modal-prod-titulo");
    if (titulo) titulo.textContent = p.titulo;

    var aviso = p.requiereAsesoria
      ? '<p class="modal-aviso" role="note">Este producto se dispensa con orientación veterinaria. ' +
        "Confirmaremos la dosis según el peso de tu mascota antes de entregarlo.</p>"
      : "";

    /* Descripción también en la ventana: sin ella, un producto sin variantes
       (por ejemplo una bolsa de 1 kg) mostraba un cuerpo completamente vacío. */
    var textoDesc = p.resumen || (p.ficha && p.ficha.descripcion) || "";
    var descripcion = textoDesc
      ? '<p class="modal-prod-desc">' + esc(textoDesc) + "</p>"
      : "";

    modalCuerpo.innerHTML =
      descripcion +
      (p.variantes || [])
        .map(function (grupo) {
          return grupoVarianteHTML(p, grupo, 0, seleccionModal[grupo.nombre]);
        })
        .join("") +
      aviso +
      fichaHTML(p);

    if (expandirFicha) {
      var det = modalCuerpo.querySelector("details.ficha-acordeon");
      if (det) det.open = true;
    }

    refrescarPrecioModal();
    abrirDialogo(modal);
  }

  function refrescarPrecioModal() {
    if (!productoModal) return;
    var el = document.getElementById("modal-prod-precio");
    if (el) {
      var unit = precioCon(productoModal, seleccionModal);
      el.textContent = formatear(unit);
      pintarAntes(el, productoModal, unit);
    }
  }

  function conectarModal() {
    if (!modal) return;

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        cerrarDialogo(modal);
        return;
      }

      var btnVariante = e.target.closest(".variante-btn");
      if (btnVariante) {
        aplicarSeleccion(btnVariante, seleccionModal);
        refrescarPrecioModal();
        return;
      }

      var accion = e.target.closest("[data-accion]");
      if (!accion) return;

      switch (accion.dataset.accion) {
        case "cerrar-modal":
          cerrarDialogo(modal);
          break;
        case "modal-whatsapp":
          pedirPorWhatsapp(productoModal, seleccionModal, 1);
          break;
        case "modal-carrito":
          agregarAlCarrito(productoModal, seleccionModal, 1);
          cerrarDialogo(modal);
          break;
      }
    });
  }

  // =========================================================
  // 7. Carrito
  // =========================================================

  /**
   * Cada línea guarda el id y las opciones elegidas, no el precio.
   * El importe se recalcula siempre desde el catálogo, así un
   * carrito guardado ayer no puede cobrar un precio viejo.
   */
  var carrito = cargarCarrito();

  function claveLinea(id, seleccion) {
    var p = porId(id);
    var valores = (p ? p.variantes || [] : []).map(function (g) {
      return seleccion[g.nombre] || "";
    });
    return id + "::" + valores.join("|");
  }

  function cargarCarrito() {
    var bruto = leerJSON(CLAVE_CARRITO, []);
    if (!Array.isArray(bruto)) return [];
    var valido = [];
    bruto.forEach(function (linea) {
      if (!linea || typeof linea !== "object") return;
      var p = porId(linea.id);
      if (!p) return; // producto retirado del catálogo

      var seleccion = {};
      var completo = true;
      (p.variantes || []).forEach(function (grupo) {
        var elegido = linea.opciones ? linea.opciones[grupo.nombre] : null;
        if (!buscarOpcion(grupo, elegido)) completo = false;
        seleccion[grupo.nombre] = completo ? elegido : opcionPredeterminada(grupo).label;
      });
      if (!completo) return; // variante que ya no se vende

      var cantidad = Math.min(MAX_UNIDADES, Math.max(1, parseInt(linea.cantidad, 10) || 1));
      valido.push({ id: p.id, opciones: seleccion, cantidad: cantidad });
    });
    return valido;
  }

  function guardarCarrito() {
    escribirJSON(CLAVE_CARRITO, carrito);
  }

  function agregarAlCarrito(producto, seleccion, cantidad) {
    if (!producto) return;
    var opciones = {};
    (producto.variantes || []).forEach(function (g) {
      opciones[g.nombre] = seleccion[g.nombre];
    });

    var clave = claveLinea(producto.id, opciones);
    var existente = carrito.filter(function (l) {
      return claveLinea(l.id, l.opciones) === clave;
    })[0];

    var suma = Math.max(1, parseInt(cantidad, 10) || 1);

    if (existente) {
      if (existente.cantidad >= MAX_UNIDADES) {
        avisar("Ya tienes el máximo de " + MAX_UNIDADES + " unidades de este producto.");
        return;
      }
      existente.cantidad = Math.min(MAX_UNIDADES, existente.cantidad + suma);
    } else {
      carrito.push({ id: producto.id, opciones: opciones, cantidad: Math.min(MAX_UNIDADES, suma) });
    }

    guardarCarrito();
    renderCarrito();
    avisar(producto.titulo + " se añadió al carrito.");
  }

  function cambiarCantidad(indice, delta) {
    var linea = carrito[indice];
    if (!linea) return;
    var nueva = linea.cantidad + delta;
    if (nueva < 1) {
      quitarDelCarrito(indice);
      return;
    }
    /* Comprobado en el navegador: al llegar a 99 el botón «+» no daba NINGUNA
       señal y parecía que la página se había colgado. */
    if (nueva > MAX_UNIDADES) {
      avisar("Ya tienes el máximo de " + MAX_UNIDADES + " unidades de este producto.");
      return;
    }
    linea.cantidad = nueva;
    guardarCarrito();
    renderCarrito();
  }

  function quitarDelCarrito(indice) {
    if (!carrito[indice]) return;
    carrito.splice(indice, 1);
    guardarCarrito();
    renderCarrito();
  }

  function totalCarrito() {
    return carrito.reduce(function (suma, linea) {
      var p = porId(linea.id);
      return p ? suma + precioCon(p, linea.opciones) * linea.cantidad : suma;
    }, 0);
  }

  function unidadesCarrito() {
    return carrito.reduce(function (n, l) {
      return n + l.cantidad;
    }, 0);
  }

  function renderCarrito() {
    var badge = document.getElementById("badge-carrito");
    var cuerpo = document.getElementById("cart-items-container");
    var totalEl = document.getElementById("cart-total-monto");
    var checkout = document.getElementById("btn-checkout-whatsapp");
    var unidades = unidadesCarrito();

    if (badge) {
      badge.textContent = String(unidades);
      badge.hidden = unidades === 0;
    }

    var disparador = document.getElementById("btn-abrir-carrito");
    if (disparador) {
      disparador.setAttribute(
        "aria-label",
        unidades === 0
          ? "Ver carrito, vacío"
          : "Ver carrito, " + unidades + (unidades === 1 ? " artículo" : " artículos")
      );
    }

    if (totalEl) totalEl.textContent = formatear(totalCarrito());
    if (checkout) checkout.disabled = carrito.length === 0;
    if (!cuerpo) return;

    if (!carrito.length) {
      cuerpo.innerHTML =
        '<div class="cart-drawer__vacio">' +
        '<p class="cart-drawer__vacio-icono" aria-hidden="true">🐾</p>' +
        "<p><strong>Tu carrito está vacío</strong></p>" +
        "<p>Elige tus productos y variantes para comenzar tu pedido.</p>" +
        "</div>";
      return;
    }

    /* Se descartan las líneas cuyo producto ya no está en el catálogo antes de
       pintar: antes se usaba `p` sin comprobar y el carrito quedaba en blanco. */
    var lineasVivas = carrito.filter(function (linea) {
      return !!porId(linea.id);
    });
    if (lineasVivas.length !== carrito.length) {
      carrito = lineasVivas;
      guardarCarrito();
      if (!carrito.length) {
        renderCarrito();
        return;
      }
    }

    cuerpo.innerHTML = carrito
      .map(function (linea, i) {
        var p = porId(linea.id);
        var unitario = precioCon(p, linea.opciones);
        var variante = (p.variantes || [])
          .map(function (g) {
            return linea.opciones[g.nombre];
          })
          .join(" · ");

        return (
          '<div class="cart-item">' +
          '<img src="' +
          esc(p.imagen) +
          '" alt="" loading="lazy" />' +
          '<div class="cart-item-info">' +
          '<h4 class="cart-item-title">' +
          esc(p.titulo) +
          "</h4>" +
          '<span class="cart-item-variante">' +
          esc(variante) +
          "</span>" +
          '<div class="cart-item-precio">' +
          esc(formatear(unitario)) +
          " c/u · <strong>" +
          esc(formatear(unitario * linea.cantidad)) +
          "</strong></div>" +
          '<div class="cart-item-cantidad">' +
          '<button type="button" data-accion="cart-menos" data-indice="' +
          i +
          '" aria-label="Quitar una unidad de ' +
          esc(p.titulo) +
          '">−</button>' +
          '<span aria-live="polite">' +
          linea.cantidad +
          "</span>" +
          '<button type="button" data-accion="cart-mas" data-indice="' +
          i +
          '" aria-label="Añadir una unidad de ' +
          esc(p.titulo) +
          '">+</button>' +
          "</div>" +
          "</div>" +
          '<button type="button" class="cart-item-remove" data-accion="cart-quitar" data-indice="' +
          i +
          '" aria-label="Quitar ' +
          esc(p.titulo) +
          ' del carrito">&times;</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function conectarCarrito() {
    var drawer = document.getElementById("cart-drawer");
    var fondo = document.getElementById("cart-backdrop");
    var abrir = document.getElementById("btn-abrir-carrito");

    if (abrir && drawer) {
      abrir.addEventListener("click", function () {
        abrirDialogo(drawer);
      });
    }
    if (fondo && drawer) {
      fondo.addEventListener("click", function () {
        cerrarDialogo(drawer);
      });
    }

    if (drawer) {
      drawer.addEventListener("click", function (e) {
        var accion = e.target.closest("[data-accion]");
        if (!accion) return;
        var indice = parseInt(accion.dataset.indice, 10);

        switch (accion.dataset.accion) {
          case "cerrar-carrito":
            cerrarDialogo(drawer);
            break;
          case "cart-mas":
            cambiarCantidad(indice, 1);
            break;
          case "cart-menos":
            cambiarCantidad(indice, -1);
            break;
          case "cart-quitar":
            quitarDelCarrito(indice);
            break;
          case "checkout":
            confirmarPedido();
            break;
        }
      });
    }

    renderCarrito();
  }

  // =========================================================
  // 8. Mensajes de WhatsApp
  // =========================================================

  function lineasVariante(producto, seleccion) {
    return (producto.variantes || []).map(function (g) {
      return "*" + g.nombre + ":* " + seleccion[g.nombre];
    });
  }

  function pedirPorWhatsapp(producto, seleccion, cantidad) {
    if (!producto) return;
    var unitario = precioCon(producto, seleccion);
    var unidades = Math.max(1, parseInt(cantidad, 10) || 1);

    var texto = ["Hola Pelitos Veterinaria, quiero hacer un pedido del PetShop:", ""]
      .concat(["*Producto:* " + producto.titulo])
      .concat(lineasVariante(producto, seleccion))
      .concat([
        "*Cantidad:* " + unidades,
        "*Total referencial:* " + formatear(unitario * unidades),
        "",
        "¿Tienen stock disponible para entrega en Huánuco?"
      ])
      .join("\n");

    abrirExterno(enlaceWhatsapp(texto, WHATSAPP));
  }

  function confirmarPedido() {
    if (!carrito.length) {
      avisar("Agrega al menos un producto antes de confirmar el pedido.");
      return;
    }

    /* Igual que en renderCarrito: solo productos que siguen en el catálogo. */
    var lineas = carrito
      .filter(function (linea) {
        return !!porId(linea.id);
      })
      .map(function (linea, i) {
      var p = porId(linea.id);
      var unitario = precioCon(p, linea.opciones);
      var variante = (p.variantes || [])
        .map(function (g) {
          return linea.opciones[g.nombre];
        })
        .join(" · ");
      return (
        i +
        1 +
        ". *" +
        p.titulo +
        "*\n   " +
        variante +
        "\n   " +
        linea.cantidad +
        " x " +
        formatear(unitario) +
        " = " +
        formatear(unitario * linea.cantidad)
      );
    });

    var texto = ["Hola Pelitos Veterinaria, quiero confirmar este pedido del PetShop:", ""]
      .concat(lineas)
      .concat([
        "",
        "*Total referencial:* " + formatear(totalCarrito()),
        "_Este total lo calculó la página en el navegador del cliente: debe" +
          " confirmarse desde la lista de precios oficial antes de cobrar._",
        "",
        "¿Me confirman stock, el tiempo de entrega en Huánuco y los medios de pago disponibles?"
      ])
      .join("\n");

    abrirExterno(enlaceWhatsapp(texto, WHATSAPP));
  }

  // =========================================================
  // 9. Editor de precios (herramienta interna)
  // =========================================================
  /**
   * Importante: esto NO es un panel de administración con permisos.
   * Todo ocurre en el navegador de quien lo abre, así que los cambios
   * solo los ve esa persona. Es una calculadora para preparar la lista
   * de precios y exportarla a el catálogo del BLOQUE 3 de js/main.js, que es la fuente real.
   * Por eso no lleva contraseña: una clave escrita en el JavaScript
   * público no protege nada y da una falsa sensación de seguridad.
   *
   * Se activa añadiendo ?admin=1 a la URL (o #admin).
   */

  var panel = document.getElementById("panel-precios");
  var editorActivo = false;
  var resetArmado = false;

  function editorSolicitado() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "1") return true;
    } catch (e) {
      /* URLSearchParams no disponible */
    }
    return window.location.hash === "#admin";
  }

  function renderPanel() {
    var cuerpo = document.getElementById("panel-precios-body");
    if (!cuerpo) return;

    cuerpo.innerHTML = CATALOGO.productos
      .map(function (p, iProd) {
        var grupos = (p.variantes || [])
          .map(function (g, iGrupo) {
            var filas = g.opciones
              .map(function (op, iOp) {
                var id = "pp-x-" + iProd + "-" + iGrupo + "-" + iOp;
                return (
                  '<div class="pp-fila pp-fila--extra">' +
                  '<label for="' +
                  id +
                  '">' +
                  esc(op.label) +
                  "</label>" +
                  '<div class="pp-input-wrap"><span aria-hidden="true">+ ' +
                  esc(CATALOGO.moneda) +
                  "</span>" +
                  '<input type="number" inputmode="decimal" step="0.10" min="0" max="9999" id="' +
                  id +
                  '" class="pp-input pp-input--extra" data-id="' +
                  esc(p.id) +
                  '" data-grupo="' +
                  esc(g.nombre) +
                  '" data-opcion="' +
                  esc(op.label) +
                  '" value="' +
                  (recargo(p, g.nombre, op) / 100).toFixed(2) +
                  '" /></div></div>'
                );
              })
              .join("");
            return "<div class=\"pp-tipo\"><h5>" + esc(g.nombre) + "</h5>" + filas + "</div>";
          })
          .join("");

        var idBase = "pp-base-" + iProd;

        return (
          '<article class="pp-producto">' +
          '<header class="pp-producto__head">' +
          '<img src="' +
          esc(p.imagen) +
          '" alt="" loading="lazy" />' +
          "<div><h4>" +
          esc(p.titulo) +
          "</h4><span>" +
          esc(p.categoriaTexto) +
          "</span></div>" +
          "</header>" +
          '<div class="pp-fila pp-fila--base">' +
          '<label for="' +
          idBase +
          '"><strong>Precio base</strong></label>' +
          '<div class="pp-input-wrap"><span aria-hidden="true">' +
          esc(CATALOGO.moneda) +
          "</span>" +
          '<input type="number" inputmode="decimal" step="0.10" min="0" max="99999" id="' +
          idBase +
          '" class="pp-input pp-input--base" data-id="' +
          esc(p.id) +
          '" value="' +
          (precioBase(p) / 100).toFixed(2) +
          '" /></div></div>' +
          (grupos
            ? '<details class="pp-extras"><summary>Recargos por variante</summary>' +
              grupos +
              "</details>"
            : "") +
          "</article>"
        );
      })
      .join("");
  }

  function guardarPanel() {
    var nuevos = {};
    var invalidos = 0;

    var PRECIO_MAXIMO = 9999; // el mismo max que declara el HTML

    function numeroDe(input) {
      var crudo = String(input.value).trim();
      var n = Number(crudo);
      /* Un campo vacío daba Number("") = 0 y dejaba el producto GRATIS.
         También se respeta aquí el máximo del HTML. */
      if (crudo === "" || !Number.isFinite(n) || n < 0 || n > PRECIO_MAXIMO) {
        invalidos++;
        input.classList.add("pp-input--error");
        return null;
      }
      input.classList.remove("pp-input--error");
      return Math.round(n * 100);
    }

    Array.prototype.forEach.call(document.querySelectorAll(".pp-input--base"), function (inp) {
      var c = numeroDe(inp);
      if (c === null) return;
      var p = porId(inp.dataset.id);
      if (!p || c === aCentimos(p.precio)) return; // igual al catálogo: no guardar ruido
      nuevos[inp.dataset.id] = nuevos[inp.dataset.id] || {};
      nuevos[inp.dataset.id].base = c;
    });

    Array.prototype.forEach.call(document.querySelectorAll(".pp-input--extra"), function (inp) {
      var c = numeroDe(inp);
      if (c === null) return;
      var p = porId(inp.dataset.id);
      if (!p) return;
      var grupo = (p.variantes || []).filter(function (g) {
        return g.nombre === inp.dataset.grupo;
      })[0];
      var opcion = grupo ? buscarOpcion(grupo, inp.dataset.opcion) : null;
      if (!opcion || c === aCentimos(opcion.extra || 0)) return;

      var clave = inp.dataset.grupo + "|" + inp.dataset.opcion;
      nuevos[inp.dataset.id] = nuevos[inp.dataset.id] || {};
      nuevos[inp.dataset.id].extras = nuevos[inp.dataset.id].extras || {};
      nuevos[inp.dataset.id].extras[clave] = c;
    });

    if (invalidos) {
      avisar("Hay " + invalidos + " precio(s) no válido(s). Corrígelos antes de guardar.");
      return;
    }

    ajustes = nuevos;
    escribirJSON(CLAVE_PRECIOS, ajustes);

    renderCatalogo();
    refrescarDestacado();
    refrescarPrecioModal();
    renderCarrito();

    /* Antes decía "recordados en este navegador" y era falso: los ajustes viven
       en memoria y se pierden al recargar. Ahora se avisa lo que ocurre de
       verdad y se recuerda exportar. */
    avisar(
      "Precios aplicados solo en esta pestaña. Se pierden al recargar: usa \u00abExportar\u00bb y pégalos en el BLOQUE 3 de js/main.js."
    );
  }

  function restablecerPrecios() {
    ajustes = {};
    escribirJSON(CLAVE_PRECIOS, ajustes);
    renderPanel();
    renderCatalogo();
    refrescarDestacado();
    refrescarPrecioModal();
    renderCarrito();
    avisar("Precios restablecidos a los valores del catálogo (BLOQUE 3 de js/main.js).");
  }

  /** Descarga los ajustes como JSON para pasarlos al catálogo real. */
  function exportarPrecios() {
    var salida = { generado: new Date().toISOString(), moneda: CATALOGO.moneda, productos: {} };

    CATALOGO.productos.forEach(function (p) {
      var entrada = { precio: Number((precioBase(p) / 100).toFixed(2)), variantes: {} };
      (p.variantes || []).forEach(function (g) {
        g.opciones.forEach(function (op) {
          entrada.variantes[g.nombre + " | " + op.label] = Number(
            (recargo(p, g.nombre, op) / 100).toFixed(2)
          );
        });
      });
      salida.productos[p.id] = entrada;
    });

    var texto = JSON.stringify(salida, null, 2);
    try {
      var blob = new Blob([texto], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "precios-petshop-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      avisar("Lista de precios descargada como JSON.");
    } catch (e) {
      console.log(texto);
      avisar("No se pudo descargar. La lista quedó impresa en la consola del navegador.");
    }
  }

  function conectarPanel() {
    var boton = document.getElementById("btn-admin-precios");
    if (!panel || !boton) return;

    editorActivo = editorSolicitado();
    boton.hidden = !editorActivo;
    if (!editorActivo) {
      panel.remove();
      return;
    }

    boton.addEventListener("click", function () {
      renderPanel();
      abrirDialogo(panel);
    });

    panel.addEventListener("click", function (e) {
      if (e.target === panel) {
        cerrarDialogo(panel);
        return;
      }
      var accion = e.target.closest("[data-accion]");
      if (!accion) return;

      switch (accion.dataset.accion) {
        case "cerrar-precios":
          cerrarDialogo(panel);
          break;
        case "guardar-precios":
          guardarPanel();
          break;
        case "exportar-precios":
          exportarPrecios();
          break;
        case "reset-precios":
          // Doble confirmación sin diálogo bloqueante.
          if (!resetArmado) {
            resetArmado = true;
            accion.textContent = "¿Seguro? Pulsa otra vez";
            accion.classList.add("pp-btn--armado");
            window.setTimeout(function () {
              resetArmado = false;
              accion.textContent = "Restablecer";
              accion.classList.remove("pp-btn--armado");
            }, 4000);
            return;
          }
          resetArmado = false;
          accion.textContent = "Restablecer";
          accion.classList.remove("pp-btn--armado");
          restablecerPrecios();
          break;
      }
    });
  }

  // =========================================================
  // 10. Arranque
  // =========================================================

  document.addEventListener("DOMContentLoaded", function () {
    montarDestacado();
    conectarDestacado();
    conectarFiltros();
    conectarModal();
    conectarCarrito();
    conectarPanel();
    renderCatalogo();
  });
})();


/* ==========================================================================
   BLOQUE 5 · (ELIMINADO)
   La cabecera al bajar, el observer de .reveal, los contadores animados y el
   año dinámico ya los hace el BLOQUE 1 para TODAS las páginas. Este bloque
   repetía lo mismo solo para el inicio y provocaba dos animaciones peleando
   por el mismo número y dos umbrales distintos para la clase "scrolled".
   No agregar código aquí: usar el BLOQUE 1.
   ========================================================================== */


/* ==========================================================================
   BLOQUE 6 · PÁGINA NOSOTROS
   Botón 'Ver qué hace' de cada integrante del equipo.
   Se ejecuta solo cuando el <body> tiene data-pagina="nosotros".
   ========================================================================== */

(function () {
  if (!esPagina("nosotros")) return;   // solo se ejecuta en esta página

  (function () {
    var grid = document.querySelector(".equipo-grid");
    if (!grid) return;
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".equipo-card__toggle");
      if (!btn) return;
      var card = btn.closest(".equipo-card");
      var abierto = card.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
      btn.querySelector("span").textContent = abierto ? "Ocultar" : "Ver qué hace";
    });
  })();
})();


/* ==========================================================================
   BLOQUE 7 · PÁGINA CONSEJOS
   Filtros por tema y tarjetas que se despliegan.
   Se ejecuta solo cuando el <body> tiene data-pagina="consejos".
   ========================================================================== */

(function () {
  if (!esPagina("consejos")) return;   // solo se ejecuta en esta página

  (function () {
    var grid = document.getElementById("grid-consejos");
    var filtros = document.getElementById("filtros-consejos");
    var contador = document.getElementById("contador-consejos");
    if (!grid) return;

    var tarjetas = Array.prototype.slice.call(grid.querySelectorAll(".consejo-card"));

    function pintarContador(n) {
      if (contador) contador.textContent = n === 1 ? "1 consejo" : n + " consejos";
    }

    function filtrar(tema) {
      var visibles = 0;
      tarjetas.forEach(function (t, i) {
        var mostrar = tema === "todos" || t.dataset.tema === tema;
        t.hidden = !mostrar;
        if (mostrar) {
          t.style.setProperty("--din-i", String(visibles % 8));
          t.classList.remove("consejo-card--anim");
          void t.offsetWidth;
          t.classList.add("consejo-card--anim");
          visibles++;
        }
      });
      pintarContador(visibles);
    }

    if (filtros) {
      filtros.addEventListener("click", function (e) {
        var pill = e.target.closest("[data-tema-filtro]");
        if (!pill) return;
        filtros.querySelectorAll("[data-tema-filtro]").forEach(function (b) {
          var activo = b === pill;
          b.classList.toggle("activo", activo);
          b.setAttribute("aria-pressed", activo ? "true" : "false");
        });
        filtrar(pill.dataset.temaFiltro);
      });
    }

    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".consejo-card__toggle");
      if (!btn) return;
      var card = btn.closest(".consejo-card");
      var abierto = card.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
      btn.querySelector("span").textContent = abierto ? "Ocultar recomendaciones" : "Ver recomendaciones";
    });

    pintarContador(tarjetas.length);
  })();

  /* ===== Calculadora de edad aproximada ===== */
  (function () {
    var caja = document.getElementById("calc-edad");
    if (!caja) return;
    var anios = document.getElementById("calc-anios");
    var tamano = document.getElementById("calc-tamano");
    var salida = document.getElementById("calc-resultado");
    var etapa = document.getElementById("calc-etapa");
    var nota = document.getElementById("calc-nota");

    var porAnio = { pequeno: 4, mediano: 5, grande: 6 };
    var senior = { pequeno: 10, mediano: 8, grande: 7 };

    function calcular() {
      var edad = Math.max(0.2, Math.min(22, Number(anios.value) || 1));
      var t = tamano.value;
      var humano;
      if (edad <= 1) humano = edad * 15;
      else if (edad <= 2) humano = 15 + (edad - 1) * 9;
      else humano = 24 + (edad - 2) * porAnio[t];

      salida.textContent = Math.round(humano);

      var texto, consejo;
      if (edad < 1) {
        texto = "Cachorro";
        consejo = "Etapa de vacunas, desparasitación y socialización.";
      } else if (edad < 3) {
        texto = "Adulto joven";
        consejo = "Control veterinario una vez al año y refuerzos al día.";
      } else if (edad < senior[t]) {
        texto = "Adulto";
        consejo = "Control anual, cuidado dental y peso vigilado.";
      } else {
        texto = "Senior";
        consejo = "Controles cada 6 meses con análisis de laboratorio.";
      }
      etapa.textContent = texto;
      nota.textContent = consejo;
    }

    anios.addEventListener("input", calcular);
    tamano.addEventListener("change", calcular);
    calcular();
  })();
})();


/* ==========================================================================
   BLOQUE 8 · PÁGINA CONTACTO
   Validación en vivo del formulario de citas.
   Se ejecuta solo cuando el <body> tiene data-pagina="contacto".
   ========================================================================== */

(function () {
  if (!esPagina("contacto")) return;   // solo se ejecuta en esta página

  (function () {
    var form = document.querySelector("[data-form-cita]");
    if (!form) return;

    function validarCampo(input, mostrarVacio) {
      var tipo = input.dataset.validar;
      var valor = input.value.trim();
      var pista = input.parentElement.querySelector("[data-pista]");
      var ok = true;
      var msg = "";

      /* Campo vacío y aún sin enviar: se deja la ayuda original en lugar de
         acusar al usuario de un error que todavía no cometió. */
      if (!valor && !mostrarVacio && tipo !== "opcional") {
        input.parentElement.classList.remove("campo--ok", "campo--mal");
        input.removeAttribute("aria-invalid");
        if (pista && pista.dataset.pistaOriginal !== undefined) {
          pista.textContent = pista.dataset.pistaOriginal;
        }
        return tipo === "opcional";
      }

      if (tipo === "texto") {
        ok = valor.length >= 3;
        msg = ok ? "Perfecto, gracias." : "Ingresa al menos 3 caracteres.";
      } else if (tipo === "telefono") {
        ok = telefonoValido(valor);
        msg = ok
          ? "Número válido."
          : "Necesitamos al menos " + TELEFONO_MIN_DIGITOS + " dígitos.";
      } else if (tipo === "opcional") {
        ok = true;
        msg = valor ? "Listo, anotado." : "Opcional, nos ayuda a preparar la atención.";
      }

      input.parentElement.classList.toggle("campo--ok", ok && valor.length > 0);
      input.parentElement.classList.toggle("campo--mal", !ok);
      /* El rojo solo se ve: sin aria-invalid un lector de pantalla no se
         enteraba de que el campo estaba mal (detectado al probar el form). */
      if (ok) input.removeAttribute("aria-invalid");
      else input.setAttribute("aria-invalid", "true");
      if (pista) {
        pista.textContent = msg;
        if (!pista.id) {
          pista.id = "pista-" + (input.name || input.id || "campo");
        }
        input.setAttribute("aria-describedby", pista.id);
      }
      return ok;
    }

    var campos = form.querySelectorAll("[data-validar]");
    campos.forEach(function (input) {
      var pista = input.parentElement.querySelector("[data-pista]");
      if (pista) pista.dataset.pistaOriginal = pista.textContent;
      input.addEventListener("input", function () { validarCampo(input); });
      input.addEventListener("blur", function () { validarCampo(input); });
    });

    /* Esta validación ahora SÍ frena el envío. Antes solo pintaba colores y el
       formulario se enviaba igual desde el BLOQUE 1 con otras reglas.
       stopImmediatePropagation corta el otro listener de submit del mismo form. */
    form.addEventListener("submit", function (evento) {
      var primerMal = null;
      campos.forEach(function (input) {
        if (!validarCampo(input, true) && !primerMal) primerMal = input;
      });
      if (!primerMal) return;
      evento.preventDefault();
      evento.stopImmediatePropagation();
      var caja = form.querySelector("[data-error]");
      if (caja) {
        caja.textContent = "Revisa los campos marcados en rojo.";
        caja.hidden = false;
      }
      primerMal.focus();
    });

    /* Contador de caracteres del mensaje */
    var area = form.querySelector("[data-contador-destino]");
    if (area) {
      var salida = document.querySelector(area.dataset.contadorDestino);
      area.addEventListener("input", function () {
        if (salida) salida.textContent = area.value.length + " / 600 caracteres";
      });
    }
  })();
})();


/* ==========================================================================
   BLOQUE 9 · PÁGINA ESTÉTICA: COTIZADOR
   AQUÍ SE CAMBIAN LAS TARIFAS DE ESTÉTICA: objeto TARIFAS, al inicio del bloque.
   Se ejecuta solo cuando el <body> tiene data-pagina="estetica".
   ========================================================================== */

(function () {
  if (!esPagina("estetica")) return;   // solo se ejecuta en esta página

  // Matriz de precios por Servicio y Rango de Peso
  const TARIFAS = {
    clasico: {
      "0-5": 40,
      "6-10": 40,
      "11-20": 45,
      "20+": 55,
      tiempo: "~60 a 75 min"
    },
    express: {
      "0-5": 25,
      "6-10": 30,
      "11-20": 35,
      "20+": 45,
      tiempo: "~40 a 50 min"
    },
    spa: {
      "0-5": 30,
      "6-10": 35,
      "11-20": 40,
      "20+": 50,
      tiempo: "~70 a 90 min"
    },
    real: {
      "0-5": 35,
      "6-10": 40,
      "11-20": 45,
      "20+": 60,
      tiempo: "~80 a 100 min"
    }
  };

  /* Escribe en un nodo solo si existe: si mañana se renombra un id del HTML,
     el cotizador sigue funcionando en vez de lanzar una excepción que dejaba
     sin conectar todo lo que viene después (galería, FAQ, comparador). */
  function ponerTexto(id, valor) {
    const nodo = document.getElementById(id);
    if (nodo) nodo.textContent = valor;
  }

  /* El estado inicial se LEE de los botones marcados como .activo en el HTML.
     Antes estaba escrito a mano y mostraba un tamaño que no existía en la
     interfaz ("Toy / Mini (0-5 Kg)" frente al botón "Pequeño (0-5 kg)"). */
  const btnPesoInicial = document.querySelector('#selector-peso .selector-pill-btn.activo');
  const btnServicioInicial = document.querySelector('#selector-servicio .selector-pill-btn.activo');

  let estadoCotizador = {
    pesoId: (btnPesoInicial && btnPesoInicial.dataset.peso) || "0-5",
    pesoNombre: (btnPesoInicial && btnPesoInicial.dataset.pesoNombre) || "Toy / Mini (hasta 5 kg)",
    servicioId: (btnServicioInicial && btnServicioInicial.dataset.servicio) || "clasico",
    servicioNombre:
      (btnServicioInicial && btnServicioInicial.dataset.nombre) ||
      "Servicio Clásico (Duchita + Corte)",
    extras: []
  };

  function recalcularCotizador() {
    const tarifaObj = TARIFAS[estadoCotizador.servicioId] || TARIFAS.clasico;
    const base = tarifaObj[estadoCotizador.pesoId];
    /* Si la combinación no está en la matriz NO se inventa un precio.
       Antes el respaldo era 40, que cobraba de más en "Amor Express" (25). */
    const hayPrecio = typeof base === "number" && isFinite(base);
    const precioBase = hayPrecio ? base : 0;

    let extrasMonto = 0;
    estadoCotizador.extras.forEach(e => { extrasMonto += e.costo; });

    const totalFinal = precioBase + extrasMonto;
    const textoBase = hayPrecio ? `S/ ${precioBase.toFixed(2)}` : "A consultar";
    const textoTotal = hayPrecio ? `S/ ${totalFinal.toFixed(2)}` : "A consultar";

    // Actualizar UI
    ponerTexto('resumen-peso', estadoCotizador.pesoNombre);
    ponerTexto('resumen-servicio', estadoCotizador.servicioNombre);
    ponerTexto('resumen-precio-base', textoBase);
    ponerTexto('resumen-extras-monto', `+S/ ${extrasMonto.toFixed(2)}`);
    ponerTexto('resumen-total', textoTotal);
    ponerTexto('resumen-tiempo', tarifaObj.tiempo || "A consultar");

    // Actualizar enlace de WhatsApp con los datos completos
    const extrasLista = estadoCotizador.extras.length > 0
      ? "\n*Adicionales:* " + estadoCotizador.extras.map(e => e.nombre).join(', ')
      : "";

    /* Las líneas van sin sangría: el texto se envía tal cual por WhatsApp y
       antes cada renglón llegaba con dos espacios delante. */
    const msg = [
      "¡Hola Pelitos Estética! Deseo reservar cita:",
      "*Servicio:* " + estadoCotizador.servicioNombre,
      "*Tamaño de mi mascota:* " + estadoCotizador.pesoNombre + extrasLista,
      "*Total estimado:* " + textoTotal + " (a confirmar por el local)",
      "",
      "¿Tienen turnos disponibles para esta semana en su sede de Jr. Leoncio Prado?"
    ].join("\n");

    const btnWa = document.getElementById('btn-whatsapp-cotizador');
    if (btnWa) {
      btnWa.href = enlaceWhatsapp(msg, SITE.whatsapp.estetica);
    }
  }

  // Eventos selector de peso
  document.querySelectorAll('#selector-peso .selector-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#selector-peso .selector-pill-btn').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      estadoCotizador.pesoId = btn.dataset.peso;
      estadoCotizador.pesoNombre = btn.dataset.pesoNombre;
      recalcularCotizador();
    });
  });

  // Eventos selector de servicio
  document.querySelectorAll('#selector-servicio .selector-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#selector-servicio .selector-pill-btn').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      estadoCotizador.servicioId = btn.dataset.servicio;
      estadoCotizador.servicioNombre = btn.dataset.nombre;
      recalcularCotizador();
    });
  });

  // Eventos checkboxes extras
  document.querySelectorAll('.extra-check').forEach(chk => {
    chk.addEventListener('change', () => {
      estadoCotizador.extras = [];
      document.querySelectorAll('.extra-check:checked').forEach(c => {
        estadoCotizador.extras.push({
          nombre: c.dataset.extraNombre,
          costo: parseFloat(c.dataset.costo) || 0
        });
      });
      recalcularCotizador();
    });
  });

  // Inicializar cotizador
  recalcularCotizador();

  // Acordeón interactivo FAQ
  document.querySelectorAll('.faq-pregunta').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.faq-card');
      if (!card) return;
      const estaActivo = card.classList.contains('activo');
      document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('activo'));
      if (!estaActivo) {
        card.classList.add('activo');
      }
    });
  });

  // Lightbox para fotos
  const modalLightbox = document.getElementById('lightbox-modal');
  const imgLightbox = document.getElementById('lightbox-img');
  const captionLightbox = document.getElementById('lightbox-caption');

  function cerrarFotoGrande() {
    if (!modalLightbox) return;
    modalLightbox.classList.remove('abierto');
    modalLightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sin-scroll');
    if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus();
  }

  var focoPrevio = null;

  function abrirFotoGrande(src, caption) {
    if (!modalLightbox || !imgLightbox) return;
    focoPrevio = document.activeElement;
    imgLightbox.src = src;
    imgLightbox.alt = caption || "Foto ampliada";
    if (captionLightbox) captionLightbox.textContent = caption || "";
    modalLightbox.classList.add('abierto');
    modalLightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sin-scroll');
    var cerrar = document.getElementById('lightbox-cerrar');
    if (cerrar) cerrar.focus();
  }

  /* Las fotos de la galería ya no usan onclick="..." en el HTML (rompía con
     comillas en los pies de foto e impedía cualquier CSP estricta): ahora
     declaran data-foto / data-pie y se atienden con un solo listener. */
  document.addEventListener("click", function (e) {
    var zona = e.target.closest("[data-foto]");
    if (!zona) return;
    abrirFotoGrande(zona.getAttribute("data-foto"), zona.getAttribute("data-pie"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var zona = e.target.closest && e.target.closest("[data-foto]");
    if (!zona) return;
    e.preventDefault();
    abrirFotoGrande(zona.getAttribute("data-foto"), zona.getAttribute("data-pie"));
  });

  // Se mantiene publicada por compatibilidad con enlaces antiguos.
  window.abrirFotoGrande = abrirFotoGrande;

  /* Cada nodo se comprueba antes de usarlo: si falta uno, el resto del bloque
     sigue funcionando en lugar de romperse con un TypeError. */
  var btnCerrarLb = document.getElementById('lightbox-cerrar');
  if (btnCerrarLb) btnCerrarLb.addEventListener('click', cerrarFotoGrande);

  if (modalLightbox) {
    modalLightbox.addEventListener('click', (e) => {
      if (e.target === modalLightbox) cerrarFotoGrande();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalLightbox.classList.contains('abierto')) {
        cerrarFotoGrande();
      }
    });
  }
})();


/* ==========================================================================
   BLOQUE 10 · PÁGINA ESTÉTICA: ANTES / DESPUÉS
   Barra deslizante que compara las dos fotos.
   Se ejecuta solo cuando el <body> tiene data-pagina="estetica".
   ========================================================================== */

(function () {
  if (!esPagina("estetica")) return;   // solo se ejecuta en esta página

  (function () {
    var caja = document.getElementById("comparador");
    if (!caja) return;
    var despues = document.getElementById("comparador-despues");
    var linea = document.getElementById("comparador-linea");
    var rango = document.getElementById("comparador-rango");
    /* Sin los tres nodos no hay comparador: se sale sin lanzar excepciones. */
    if (!despues || !linea || !rango) return;

    function pintar(valor) {
      var v = Math.max(0, Math.min(100, valor));
      if (!isFinite(v)) v = 50;
      despues.style.setProperty("--pos", v + "%");
      linea.style.left = v + "%";
    }

    rango.addEventListener("input", function () { pintar(Number(rango.value)); });

    // También se puede arrastrar directamente sobre la imagen
    var arrastrando = false;
    function desdeEvento(e) {
      var r = caja.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var v = (x / r.width) * 100;
      rango.value = String(v);
      pintar(v);
    }
    caja.addEventListener("pointerdown", function (e) {
      if (e.target === rango) return;
      arrastrando = true;
      /* Captura del puntero: así el arrastre termina siempre, incluso si el
         dedo sale de la imagen o el sistema cancela el gesto. */
      if (caja.setPointerCapture && e.pointerId !== undefined) {
        try { caja.setPointerCapture(e.pointerId); } catch (err) {}
      }
      desdeEvento(e);
    });
    window.addEventListener("pointermove", function (e) { if (arrastrando) desdeEvento(e); });
    function soltar() { arrastrando = false; }
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    window.addEventListener("blur", soltar);

    pintar(50);
  })();
})();


/* ==========================================================================
   BLOQUE 11 · PÁGINA ACCESO DE CLIENTES
   Botones del formulario de acceso.
   Se ejecuta solo cuando el <body> tiene data-pagina="acceso".
   ========================================================================== */

(function () {
  if (!esPagina("acceso")) return;   // solo se ejecuta en esta página

  // Eventos específicos de la página de login
  document.addEventListener("DOMContentLoaded", () => {
    const btnPageGoogle = document.getElementById("btn-page-google");
    const formPageLogin = document.getElementById("form-page-login");

    if (btnPageGoogle) {
      btnPageGoogle.addEventListener("click", () => {
        btnPageGoogle.disabled = true;
        btnPageGoogle.innerHTML = `<span>Conectando con Google...</span>`;
        setTimeout(() => {
          PelitosAuth.guardarUsuario({
            nombre: "Dr. Roberto Pelitos",
            email: "usuario.pelitos@gmail.com",
            tipo: "google"
          });
          PelitosAuth.mostrarToast("¡Sesión iniciada con Google!", "✨");
          setTimeout(() => {
            window.location.href = "../index.html";
          }, 800);
        }, 900);
      });
    }

    const formRegistro = document.getElementById("form-page-registro");
    if (formRegistro) {
      formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();
        const campos = ["reg-nombre", "reg-email", "reg-tel", "reg-pass"];
        const todoOk = campos.every((id) => {
          const el = document.getElementById(id);
          return el && PelitosAuth.validarCampo(el);
        });
        const terminos = document.getElementById("reg-terminos");

        if (!todoOk) {
          PelitosAuth.mostrarToast("Revisa los campos marcados en rojo", "⚠️");
          return;
        }
        if (terminos && !terminos.checked) {
          PelitosAuth.mostrarToast("Necesitamos tu autorización de contacto", "⚠️");
          return;
        }

        const nombre = document.getElementById("reg-nombre").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const tel = document.getElementById("reg-tel").value.replace(/\D/g, "");
        /* El campo de mascota es opcional y puede no existir en la página. */
        const campoMascota = document.getElementById("reg-mascota");
        const mascota = campoMascota ? campoMascota.value.trim() : "";

        PelitosAuth.guardarUsuario({ nombre, email, tipo: "registro" });
        PelitosAuth.mostrarToast("Cuenta creada. Te escribimos por WhatsApp", "🐾");

        const texto =
          "Hola Pelitos, acabo de crear mi cuenta.%0A" +
          "Nombre: " + encodeURIComponent(nombre) + "%0A" +
          "Correo: " + encodeURIComponent(email) + "%0A" +
          "Celular: " + encodeURIComponent(tel) +
          (mascota ? "%0AMascota: " + encodeURIComponent(mascota) : "");
        /* Se abre DENTRO del gesto del usuario: dentro de un setTimeout el
           navegador lo trataba como ventana emergente y la bloqueaba. */
        abrirExterno(
          "https://api.whatsapp.com/send?phone=" +
            SITE.whatsapp.consultorio +
            "&text=" +
            texto
        );
      });
    }

    if (formPageLogin) {
      formPageLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("page-email")?.value.trim();
        const pass = document.getElementById("page-pass")?.value.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          PelitosAuth.mostrarToast("Ingresa un correo electrónico válido", "⚠️");
          return;
        }
        if (!pass || pass.length < 6) {
          PelitosAuth.mostrarToast("La contraseña debe tener al menos 6 caracteres", "⚠️");
          return;
        }

        PelitosAuth.guardarUsuario({
          nombre: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
          tipo: "correo"
        });

        PelitosAuth.mostrarToast("¡Bienvenido al portal!", "👋");
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 800);
      });
    }
  });
})();


/* ==========================================================================
   BLOQUE 12 · ANIMACIONES Y EFECTOS (todas las páginas)
   Apariciones al bajar la página, visor de fotos y botón de volver arriba.
   Va al final a propósito: necesita que el resto ya haya dibujado la página.
   ========================================================================== */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  root.classList.add("js-din");

  function listo(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* ---------------------------------------------------------
     1. Barra de progreso de lectura
     --------------------------------------------------------- */
  function barraProgreso() {
    var cont = document.createElement("div");
    cont.className = "din-progreso";
    var barra = document.createElement("div");
    barra.className = "din-progreso__barra";
    cont.appendChild(barra);
    document.body.appendChild(cont);

    var pendiente = false;
    function pintar() {
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      var pct = alto > 0 ? (window.scrollY / alto) * 100 : 0;
      barra.style.width = Math.min(100, Math.max(0, pct)).toFixed(2) + "%";
      pendiente = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!pendiente) {
          pendiente = true;
          window.requestAnimationFrame(pintar);
        }
      },
      { passive: true }
    );
    pintar();
  }

  /* ---------------------------------------------------------
     2. Reveal al hacer scroll + escalonado de los hijos
     --------------------------------------------------------- */
  function revelados() {
    /* Escalonado dentro de los bloques .reveal que ya existían */
    document.querySelectorAll(".reveal").forEach(function (bloque) {
      var hijos = bloque.children;
      for (var i = 0; i < hijos.length; i++) {
        hijos[i].style.setProperty("--din-i", String(i % 8));
      }
    });

    /* Nuevos candidatos: secciones y tarjetas que no estaban animadas */
    var seleccion = [
      ".seccion > .contenedor > .titulo-bloque",
      ".seccion > .contenedor > .rejilla:not(.reveal)",
      ".seccion > .contenedor > p",
      ".galeria-grid > *",
      ".faq-card",
      ".dato",
      ".razon",
      ".login-beneficio-item",
      ".mapa",
      ".form-grid",
      "[data-din-rev]",
    ].join(",");

    var nuevos = [];
    document.querySelectorAll(seleccion).forEach(function (el) {
      if (el.closest(".reveal") || el.classList.contains("reveal")) return;
      if (el.classList.contains("din-rev")) return;
      el.classList.add("din-rev");
      nuevos.push(el);
    });

    /* Índice de escalonado por grupo de hermanos */
    nuevos.forEach(function (el) {
      var hermanos = Array.prototype.filter.call(
        el.parentNode ? el.parentNode.children : [],
        function (n) {
          return n.classList && n.classList.contains("din-rev");
        }
      );
      el.style.setProperty("--din-i", String(hermanos.indexOf(el) % 8));
    });

    if (reduce || !("IntersectionObserver" in window)) {
      nuevos.forEach(function (el) {
        el.classList.add("din-visible");
      });
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("din-visible");
          e.target.querySelectorAll("[data-target]").forEach(contador);
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    nuevos.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* Contador numérico: delega en el ÚNICO animador del sitio (BLOQUE 1).
     Antes había una segunda implementación aquí y ambas escribían el mismo
     textContent con duraciones distintas. */
  function contador(el) {
    if (typeof animarContador === "function") animarContador(el, reduce);
  }

  /* ---------------------------------------------------------
     3. Tarjetas: luz que sigue al cursor + elevación
     --------------------------------------------------------- */
  var SELECTOR_TARJETAS =
    ".tarjeta, .producto-card, .dato, .razon, .login-beneficio-item, .galeria-card";

  function marcarTarjetas(raiz) {
    (raiz || document).querySelectorAll(SELECTOR_TARJETAS).forEach(function (t) {
      t.classList.add("din-luz", "din-flota");
    });
  }

  function tarjetasVivas() {
    marcarTarjetas(document);

    /* El catálogo del PetShop se vuelve a pintar al filtrar o buscar y las
       tarjetas nuevas nacían sin efectos. Con este gancho el propio
       renderCatalogo puede pedir que se vuelvan a marcar. */
    window.PelitosEfectos = {
      refrescar: function (raiz) {
        marcarTarjetas(raiz);
      }
    };

    if (reduce) return;

    document.addEventListener(
      "pointermove",
      function (e) {
        var t = e.target.closest
          ? e.target.closest(".din-luz")
          : null;
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty("--din-mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        t.style.setProperty("--din-my", ((e.clientY - r.top) / r.height) * 100 + "%");
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     4. Ripple en botones
     --------------------------------------------------------- */
  function ripple() {
    if (reduce) return;
    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest(
        ".btn, .btn-agregar-carrito, .btn-temu-comprar, .btn-elegir-opciones, .btn-auth-submit, .filtro-pill"
      );
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      var d = Math.max(r.width, r.height);
      var s = document.createElement("span");
      s.className = "din-ripple";
      s.style.width = s.style.height = d + "px";
      s.style.left = e.clientX - r.left - d / 2 + "px";
      s.style.top = e.clientY - r.top - d / 2 + "px";
      btn.appendChild(s);
      window.setTimeout(function () {
        s.remove();
      }, 620);
    });
  }

  /* ---------------------------------------------------------
     5. Botón volver arriba
     --------------------------------------------------------- */
  function volverArriba() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "din-arriba";
    btn.setAttribute("aria-label", "Volver arriba");
    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("visible", window.scrollY > 520);
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     6. Parallax suave (hero, luces y decorativos)
     --------------------------------------------------------- */
  function parallax() {
    if (reduce) return;
    var figura = document.querySelector(".hero__figura img");
    if (figura) figura.setAttribute("data-din-parallax", "0.05");
    /* Las luces ambientales ya tienen su propia animación de pulso:
       no se les aplica parallax para no pisar ese movimiento. */

    var capas = document.querySelectorAll("[data-din-parallax]");
    if (!capas.length) return;

    var pendiente = false;
    function pintar() {
      var y = window.scrollY;
      capas.forEach(function (c) {
        var f = parseFloat(c.getAttribute("data-din-parallax")) || 0;
        c.style.transform = "translate3d(0," + (y * f).toFixed(1) + "px,0)";
      });
      pendiente = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!pendiente) {
          pendiente = true;
          requestAnimationFrame(pintar);
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     7. Lightbox de fotos (instalaciones, estética, servicios)
     --------------------------------------------------------- */
  function lightbox() {
    var imagenes = Array.prototype.filter.call(
      document.querySelectorAll("main img"),
      function (img) {
        var s = img.getAttribute("src") || "";
        return (
          /\/(instalaciones|estetica|servicios|equipo)\//.test(s) &&
          !img.closest("a") &&
          /* La galería de Estética tiene su propio visor (data-foto):
             sin esta exclusión un clic abría DOS ventanas superpuestas. */
          !img.closest("[data-foto]")
        );
      }
    );
    if (!imagenes.length) return;

    var caja = document.createElement("div");
    caja.className = "din-lightbox";
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-modal", "true");
    caja.setAttribute("aria-label", "Galería de fotos");
    caja.innerHTML =
      '<button type="button" class="din-lightbox__cerrar" aria-label="Cerrar galería">&times;</button>' +
      '<button type="button" class="din-lightbox__nav din-lightbox__nav--prev" aria-label="Foto anterior">&#8249;</button>' +
      '<button type="button" class="din-lightbox__nav din-lightbox__nav--next" aria-label="Foto siguiente">&#8250;</button>' +
      '<img alt="" />' +
      '<p class="din-lightbox__pie"></p>';
    document.body.appendChild(caja);

    var img = caja.querySelector("img");
    var pie = caja.querySelector(".din-lightbox__pie");
    var indice = 0;

    function mostrar(i) {
      indice = (i + imagenes.length) % imagenes.length;
      var origen = imagenes[indice];
      img.src = origen.currentSrc || origen.src;
      img.alt = origen.alt || "";
      pie.textContent =
        (origen.alt || "Foto") + " · " + (indice + 1) + " de " + imagenes.length;
    }

    var focoAnterior = null;

    function abrir(i) {
      mostrar(i);
      focoAnterior = document.activeElement;
      caja.classList.add("abierto");
      /* Se usa la MISMA clase que el resto de diálogos: antes este visor tocaba
         body.style.overflow y al cerrarlo devolvía el scroll aunque siguiera
         abierto otro diálogo. */
      document.body.classList.add("sin-scroll");
      var btnCerrar = caja.querySelector(".din-lightbox__cerrar");
      if (btnCerrar) btnCerrar.focus();
    }

    function cerrar() {
      caja.classList.remove("abierto");
      document.body.classList.remove("sin-scroll");
      if (focoAnterior && typeof focoAnterior.focus === "function") focoAnterior.focus();
    }

    imagenes.forEach(function (el, i) {
      el.classList.add("din-zoomable");
      el.setAttribute("tabindex", "0");
      el.addEventListener("click", function () {
        abrir(i);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir(i);
        }
      });
    });

    caja.querySelector(".din-lightbox__cerrar").addEventListener("click", cerrar);
    caja
      .querySelector(".din-lightbox__nav--prev")
      .addEventListener("click", function () {
        mostrar(indice - 1);
      });
    caja
      .querySelector(".din-lightbox__nav--next")
      .addEventListener("click", function () {
        mostrar(indice + 1);
      });
    caja.addEventListener("click", function (e) {
      if (e.target === caja) cerrar();
    });
    document.addEventListener("keydown", function (e) {
      if (!caja.classList.contains("abierto")) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") mostrar(indice - 1);
      if (e.key === "ArrowRight") mostrar(indice + 1);
    });
  }

  /* ---------------------------------------------------------
     8. Estado "abierto ahora" calculado en vivo
        Horario: lunes a sábado, 8:30 a 20:00 (hora de Perú)
     --------------------------------------------------------- */
  function horarioEnVivo() {
    /* Solo las insignias marcadas con data-horario.
       Antes se tomaban TODAS las .badge-abierto y se borraba su texto: en
       estética eso destruía el rótulo "Área Exclusiva de Grooming...".
       data-horario="corto" muestra solo ABIERTO / CERRADO. */
    var badges = document.querySelectorAll("[data-horario]");
    if (!badges.length) return;

    /* Hora de Perú sin depender de reparsear un texto localizado
       (ese truco fallaba en algunos navegadores). */
    function partesLima() {
      try {
        var f = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Lima",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(new Date());
        var v = {};
        f.forEach(function (p) {
          v[p.type] = p.value;
        });
        var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        var h = parseInt(v.hour, 10) % 24;
        return { dia: dias[v.weekday], minutos: h * 60 + parseInt(v.minute, 10) };
      } catch (err) {
        var d = new Date();
        return { dia: d.getDay(), minutos: d.getHours() * 60 + d.getMinutes() };
      }
    }

    function estado() {
      var p = partesLima();
      var dia = p.dia; // 0 domingo
      var minutos = p.minutos;
      var abierto = dia >= 1 && dia <= 6 && minutos >= 510 && minutos < 1200;
      return { abierto: abierto, dia: dia, minutos: minutos };
    }

    function pintar() {
      var e = estado();
      badges.forEach(function (b) {
        var punto = b.querySelector(".punto");
        var texto;
        if (b.getAttribute("data-horario") === "corto") {
          texto = e.abierto ? "ABIERTO" : "CERRADO";
          b.classList.toggle("din-cerrado", !e.abierto);
          b.textContent = "";
          if (punto) b.appendChild(punto);
          b.appendChild(document.createTextNode(punto ? " " + texto : texto));
          return;
        }
        if (e.abierto) {
          texto = "Abierto ahora · Lun–Sáb 8:30–20:00";
        } else if (e.dia === 0) {
          texto = "Cerrado hoy · Abrimos lunes 8:30 a.m.";
        } else if (e.minutos < 510) {
          texto = "Cerrado · Abrimos hoy a las 8:30 a.m.";
        } else if (e.dia === 6) {
          /* Sábado después de las 20:00: el domingo NO se abre. */
          texto = "Cerrado · Abrimos el lunes a las 8:30 a.m.";
        } else {
          texto = "Cerrado · Abrimos mañana a las 8:30 a.m.";
        }
        b.classList.toggle("din-cerrado", !e.abierto);
        b.textContent = "";
        if (punto) b.appendChild(punto);
        b.appendChild(document.createTextNode(" " + texto));
      });
    }
    pintar();
    window.setInterval(pintar, 60000);
  }

  /* ---------------------------------------------------------
     9. (Eliminado) Aquí vivía un TERCER sistema de toasts que sobrescribía
        window.PelitosAviso y al que nunca se llamaba. El aviso único se
        define ahora en el bloque de sesión (window.PelitosAviso).
     --------------------------------------------------------- */

  /* ---------------------------------------------------------
     10. Scrollspy: marca el enlace de la sección visible
     --------------------------------------------------------- */
  function scrollspy() {
    var enlaces = Array.prototype.filter.call(
      document.querySelectorAll(".nav a[href^='#'], .nav a[href*='#']"),
      function (a) {
        var h = a.getAttribute("href") || "";
        var id = h.slice(h.indexOf("#") + 1);
        return h.indexOf("#") > -1 && id && document.getElementById(id);
      }
    );
    if (!enlaces.length || !("IntersectionObserver" in window)) return;

    var obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          enlaces.forEach(function (a) {
            var h = a.getAttribute("href");
            a.classList.toggle(
              "activo",
              h.slice(h.indexOf("#") + 1) === e.target.id
            );
          });
        });
      },
      { threshold: 0.45 }
    );
    enlaces.forEach(function (a) {
      var h = a.getAttribute("href");
      var s = document.getElementById(h.slice(h.indexOf("#") + 1));
      if (s) obs.observe(s);
    });
  }

  /* ---------------------------------------------------------
     11. Ticker: pausa al pasar el cursor
     --------------------------------------------------------- */
  function ticker() {
    document.querySelectorAll(".ticker-servicios").forEach(function (t) {
      var pista = t.querySelector(".ticker-track");
      if (!pista) return;
      t.addEventListener("pointerenter", function () {
        pista.style.animationPlayState = "paused";
      });
      t.addEventListener("pointerleave", function () {
        pista.style.animationPlayState = "running";
      });
    });
  }


  /* ---------------------------------------------------------
     12. Filtros reutilizables
     Un contenedor [data-filtro-set] con botones [data-filtro]
     muestra u oculta los elementos [data-tema] del contenedor
     indicado en data-filtro-destino.
     --------------------------------------------------------- */
  function filtrosGenericos() {
    document.querySelectorAll("[data-filtro-set]").forEach(function (set) {
      var destino = document.querySelector(set.dataset.filtroDestino);
      if (!destino) return;
      var items = Array.prototype.slice.call(destino.querySelectorAll("[data-tema]"));
      var contador = set.dataset.filtroContador
        ? document.querySelector(set.dataset.filtroContador)
        : null;
      var singular = set.dataset.filtroSingular || "resultado";
      var plural = set.dataset.filtroPlural || "resultados";

      function aplicar(tema) {
        var visibles = 0;
        items.forEach(function (item) {
          var mostrar = tema === "todos" || item.dataset.tema === tema;
          item.hidden = !mostrar;
          if (mostrar) {
            item.style.setProperty("--din-i", String(visibles % 8));
            item.classList.remove("din-entra");
            void item.offsetWidth;
            item.classList.add("din-entra");
            visibles++;
          }
        });
        if (contador) {
          contador.textContent = visibles + " " + (visibles === 1 ? singular : plural);
        }
      }

      set.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-filtro]");
        if (!btn) return;
        set.querySelectorAll("[data-filtro]").forEach(function (b) {
          var activo = b === btn;
          b.classList.toggle("activo", activo);
          b.setAttribute("aria-pressed", activo ? "true" : "false");
        });
        aplicar(btn.dataset.filtro);
      });

      if (contador) {
        contador.textContent = items.length + " " + (items.length === 1 ? singular : plural);
      }
    });
  }

  /* ---------------------------------------------------------
     13. Bloques plegables reutilizables
     Cualquier .plegable con un .plegable__toggle se abre y
     cierra, actualizando aria-expanded y el texto del botón.
     --------------------------------------------------------- */
  function plegables() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".plegable__toggle");
      if (!btn) return;
      var caja = btn.closest(".plegable");
      if (!caja) return;
      var abierto = caja.classList.toggle("abierto");
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
      var etiqueta = btn.querySelector("[data-abrir]");
      if (etiqueta) {
        etiqueta.textContent = abierto
          ? etiqueta.dataset.cerrar || "Ocultar"
          : etiqueta.dataset.abrir || "Ver más";
      }
    });
  }

  /* Barra de cita de la portada: arma el mensaje de WhatsApp con lo elegido.
     Si el JavaScript falla, el formulario no hace nada raro: el visitante
     sigue teniendo el botón de WhatsApp de la cabecera. */
  function barraCita() {
    var form = document.querySelector("[data-barra-cita]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var servicio = (form.querySelector("[name=servicio]") || {}).value || "Consulta m\u00e9dica";
      var mascota = ((form.querySelector("[name=mascota]") || {}).value || "").trim();
      var cuando = (form.querySelector("[name=cuando]") || {}).value || "";

      var numero =
        (window.SITE && window.SITE.whatsapp && window.SITE.whatsapp.consultorio) ||
        "51939356376";
      if (/est\u00e9tica/i.test(servicio) && window.SITE && window.SITE.whatsapp) {
        numero = window.SITE.whatsapp.estetica || numero;
      }

      var partes = [
        "Hola Pelitos Veterinaria, quiero reservar una cita.",
        "Servicio: " + servicio,
        "Cu\u00e1ndo: " + cuando,
      ];
      if (mascota) partes.push("Mascota: " + mascota);
      partes.push("\u00bfQu\u00e9 horarios tienen disponibles?");

      var url =
        "https://api.whatsapp.com/send?phone=" +
        numero +
        "&text=" +
        encodeURIComponent(partes.join("\n"));

      /* Se abre dentro del gesto del usuario para que no lo bloquee el navegador. */
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  /* --------------------------------------------------------- */
  listo(function () {
    try { barraCita(); } catch (e) {}
    try { barraProgreso(); } catch (e) {}
    try { revelados(); } catch (e) {}
    try { tarjetasVivas(); } catch (e) {}
    try { ripple(); } catch (e) {}
    try { volverArriba(); } catch (e) {}
    try { parallax(); } catch (e) {}
    try { lightbox(); } catch (e) {}
    try { horarioEnVivo(); } catch (e) {}
    try { scrollspy(); } catch (e) {}
    try { ticker(); } catch (e) {}
    try { filtrosGenericos(); } catch (e) {}
    try { plegables(); } catch (e) {}
  });
})();
