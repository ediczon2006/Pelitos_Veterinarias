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

function telefonoValido(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  return digitos.length >= 6 && digitos.length <= 15;
}

function abrirExterno(url) {
  const ventana = window.open(url, "_blank", "noopener,noreferrer");
  if (ventana) ventana.opener = null;
}

// Se publican para que los demás bloques de este archivo puedan reutilizarlas.
window.SITE = SITE;
window.enlaceWhatsapp = enlaceWhatsapp;
window.abrirExterno = abrirExterno;

document.addEventListener("DOMContentLoaded", () => {
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
    const ICONO_MENU = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    const ICONO_CERRAR = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const cabecera = botonMenu.closest(".header");

    /* Altura de la cabecera, para que el menú ocupe el resto de la pantalla */
    const medirCabecera = () => {
      if (cabecera) document.documentElement.style.setProperty("--alto-header", cabecera.offsetHeight + "px");
    };

    const abrirMenu = () => {
      medirCabecera();
      navMovil.classList.add("abierto");
      document.body.classList.add("menu-abierto");
      botonMenu.setAttribute("aria-expanded", "true");
      botonMenu.setAttribute("aria-label", "Cerrar menú");
      botonMenu.innerHTML = ICONO_CERRAR;
    };

    const cerrarMenu = () => {
      navMovil.classList.remove("abierto");
      document.body.classList.remove("menu-abierto");
      botonMenu.setAttribute("aria-expanded", "false");
      botonMenu.setAttribute("aria-label", "Abrir menú");
      botonMenu.innerHTML = ICONO_MENU;
    };

    botonMenu.addEventListener("click", (evento) => {
      evento.stopPropagation();
      if (navMovil.classList.contains("abierto")) cerrarMenu();
      else abrirMenu();
    });

    navMovil.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", cerrarMenu);
    });

    /* Tocar fuera del menú (en el fondo oscuro) lo cierra */
    document.addEventListener("click", (evento) => {
      if (!navMovil.classList.contains("abierto")) return;
      if (navMovil.contains(evento.target) || botonMenu.contains(evento.target)) return;
      cerrarMenu();
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") cerrarMenu();
    });

    /* Si la pantalla se agranda (girar el celular), se cierra el menú */
    window.addEventListener("resize", () => {
      medirCabecera();
      if (window.innerWidth > 980) cerrarMenu();
    });
  }

  document.querySelectorAll("[data-anio]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const elementos = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
  } else if (elementos.length) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("visible");
          entrada.target.querySelectorAll("[data-target]").forEach(animarContador);
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
      const mensaje = sanitizarTexto(datos.get("mensaje"), 400);

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

function animarContador(el) {
  const target = Number(el.dataset.target);
  if (!Number.isFinite(target) || target <= 0) return;

  const sufijo = el.dataset.sufijo || "+";
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

  /* OJO (decisión del negocio, no es un error que se pueda "arreglar" aquí):
     esta web no tiene servidor, así que el acceso es solo una demostración.
     La "sesión" vive en esta variable y se pierde al cambiar de página, por lo
     que en el resto del sitio nadie sabe quién entró. Para que el acceso sea
     real hace falta un servicio de cuentas (Firebase, Supabase, etc.). */
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
      ok = valor.replace(/\D/g, "").length >= 9;
      msg = valor ? (ok ? "Número válido." : "Necesitamos 9 dígitos.") : "";
    }

    if (grupo) {
      grupo.classList.toggle("auth-ok", ok && valor.length > 0);
      grupo.classList.toggle("auth-mal", !ok && valor.length > 0);
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

  window.PelitosAuth = {
    mostrarToast: mostrarToast,
    guardarUsuario: guardarUsuario,
    usuarioActual: usuarioActual,
    abrirModal: abrirModal,
    mostrarVista: mostrarVista,
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
    // Nota: aquí estaban seis productos de foto genérica (alimento súper
    // premium, arnés, antipulgas, cama ortopédica, shampoo y comedero).
    // Se retiraron a pedido de la tienda porque no eran productos reales del
    // local. Para volver a poner uno, copie cualquier bloque { ... } de abajo.

    // ==================================================================
    // LÍNEA NATURALISTIC (Grupo MOR)
    // Ingredientes, análisis y porciones transcritos del reverso
    // de cada envase. Ver notas donde la etiqueta no era legible.
    // ==================================================================
    {
      id: "naturalistic-meat-mix-pollo-pato",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Naturalistic Meat Mix Pollo y Pato x 100 g",
      imagen: "../images/productos/tienda/naturalistic-meat-mix-pollo-pato-frente.jpg",
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
      titulo: "Naturalistic Chicken Sushi x 100 g",
      imagen: "../images/productos/tienda/naturalistic-chicken-sushi-frente.jpg",
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
      titulo: "Naturalistic Lamb Strips Cordero x 100 g",
      imagen: "../images/productos/tienda/naturalistic-lamb-strips-frente.jpg",
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
      titulo: "Naturalistic Meat Balls Salmón y Camote x 100 g",
      imagen: "../images/productos/tienda/naturalistic-meatballs-salmon-camote-frente.jpg",
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
      titulo: "Naturalistic Meat Balls Pato y Manzana x 100 g",
      imagen: "../images/productos/tienda/naturalistic-meatballs-pato-manzana-frente.jpg",
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
      titulo: "Naturalistic Grill Beef Burger BBQ x 120 g",
      imagen: "../images/productos/tienda/naturalistic-grill-beef-burger-bbq-frente.jpg",
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
    },

    // ==================================================================
    // ┌────────────────────────────────────────────────────────────────┐
    // │  NUEVOS PRODUCTOS — AGREGADOS EL 18/09/2026                    │
    // │                                                                │
    // │  PRECIOS: cada ficha ya tiene un PRECIO DE REFERENCIA tomado    │
    // │  de tiendas veterinarias peruanas el 18/09/2026. Debajo de      │
    // │  cada precio hay un comentario que dice de donde salio.         │
    // │  REVISELOS con sus precios reales y cambie el numero. Se        │
    // │  escribe con punto decimal: 35.5 (no 35,5).                     │
    // │  Si pone precio: 0, la web muestra "Precio a consultar" y solo   │
    // │  ofrece el pedido por WhatsApp (no entra al carrito).           │
    // │                                                                │
    // │  Las presentaciones ("variantes") suman con "extra":            │
    // │      extra: 0   = no cambia el precio                           │
    // │      extra: 12  = cuesta 12 soles mas que el precio base        │
    // └────────────────────────────────────────────────────────────────┘
    // ==================================================================

    // 1) Desinfectante de ambientes ECAKLIN (Lab ECA) — 750 ml
    {
      id: "ecaklin-desinfectante",
      categoria: "higiene",
      categoriaTexto: "Higiene del Hogar",
      titulo: "Ecaklin Desinfectante de Ambientes x 750 ml",
      resumen:
        "Desinfectante de ambientes y objetos para espacios donde vive la mascota. Neutraliza olores, atóxico y seguro al contacto según la etiqueta del envase.",
      imagen: "../images/productos/tienda/ecaklin-desinfectante-ambientes.jpg",
      precio: 43.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // referencia set/2026: lumpet.pe S/34.90, mascotify.pe S/35.00, misterpet.pe S/45.00
      variantes: [
        {
          nombre: "Versión",
          opciones: [
            { label: "ECAKLIN Dogs (perros) 750 ml", extra: 0 },
            { label: "ECAKLIN Cats (gatos) 750 ml", extra: 0 }
          ]
        }
      ]
    },

    // 2) Máscara texturizadora 4 Groomer — 230 g
    {
      id: "4groomer-mascara-texturizadora",
      categoria: "higiene",
      categoriaTexto: "Estética & Cosmética",
      titulo: "4 Groomer Máscara Texturizadora x 230 g",
      resumen:
        "Máscara de almendra y teztuán para un pelaje sano, suave y brillante. Sin parabenos ni siliconas, de uso profesional en estética canina. Envase de 230 g.",
      imagen: "../images/productos/tienda/4groomer-mascara-texturizadora.jpg",
      precio: 60.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // referencia set/2026: linea importada IBASA 4Groomer 230 g, R$130.99 en Brasil (petcerto.com.br)
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "230 g con dosificador", extra: 0 }
          ]
        }
      ]
    },

    // 3) Condicionador profesional 4 Groomer — 250 ml
    {
      id: "4groomer-condicionador",
      categoria: "higiene",
      categoriaTexto: "Estética & Cosmética",
      titulo: "4 Groomer Condicionador Profesional x 250 ml",
      resumen:
        "Condicionador desenredante de uso profesional, pH balanceado, para todas las razas. Hidrata, suaviza y facilita el peinado. Envase de 250 ml.",
      imagen: "../images/productos/tienda/4groomer-condicionador.jpg",
      precio: 40.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // referencia set/2026: acondicionador IBASA 250 ml S/28.40 (convet) y S/42.60 (petmas.pe); 4Groomer es la linea profesional
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "250 ml", extra: 0 }
          ]
        }
      ]
    },

    // 4) Champú medicado IBASA Animal Health — 200 ml
    {
      id: "ibasa-champu-medicado",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Ibasa Shampoo Medicado x 200 ml",
      resumen:
        "Champús de uso veterinario IBASA Animal Health en envase de 200 ml: versión hipoalergénica para pieles sensibles y versión con cetoconazol para el tratamiento de micosis en perros y gatos.",
      imagen: "../images/productos/tienda/ibasa-champu-medicado.jpg",
      precio: 60.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // revisado set/2026: cetoconazol 2% IBASA 200 ml S/64.90 (promart.pe) y S/79.90 (ripley.com.pe);
      // 100 ml S/29.20 (convet). Se subio de 59.90 a 64.90 para no quedar debajo del costo de reposicion.
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Fórmula",
          opciones: [
            { label: "Hipoalergénico con aloe vera 200 ml", extra: 0 },
            { label: "Cetoconazol antimicótico 200 ml", extra: 0 }
          ]
        }
      ]
    },

    // 5) ECA DERM solución tópica en spray (Lab ECA) — 200 ml
    {
      id: "ecaderm-solucion-topica",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Eca Derm Solución Tópica Spray",
      resumen:
        "Solución tópica en spray para perros y gatos, aliada contra pulgas y garrapatas. Hidrata y cuida la piel. Uso veterinario, en frasco de 120 ml o de 500 ml.",
      imagen: "../images/productos/tienda/ecaderm-solucion-topica.jpg",
      precio: 40.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // revisado set/2026: Lab ECA vende dos tamanos, no uno de 200 ml: 120 ml S/31.00 (misterpet.pe)
      // y 500 ml S/55.00-65.00 (mascotasvetshop.pe S/55.00, misterpet.pe S/60.00, miau.pe S/65.00).
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "Spray 120 ml", extra: 0, predeterminada: true },
            { label: "Spray 500 ml", extra: 31 }
          ]
        }
      ]
    },

    // 6) ECA DERM crema regeneradora (Lab ECA)
    {
      id: "ecaderm-crema-regeneradora",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Eca Derm Crema Regeneradora",
      resumen:
        "Crema de uso tópico antibiótica, cicatrizante y desinfectante, indicada para todo tipo de piel en perros y gatos. Producto de venta libre, uso veterinario.",
      imagen: "../images/productos/tienda/ecaderm-crema-regeneradora.jpg",
      precio: 35.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // referencia set/2026: 60 g S/25.00-30.00 (brisapet.pe S/27.00, mascotify.pe S/30.00)
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "Pote de crema", extra: 0 }
          ]
        }
      ]
    },

    // 7) ECAÓTIC limpiador auricular (Lab ECA) — 60 ml
    {
      id: "ecaotic-limpiador-auricular",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Ecaótic Limpiador Auricular x 60 ml",
      resumen:
        "Limpiador de oídos a base de ácido hipocloroso para perros y gatos. Uso veterinario, contenido neto 60 ml. Producto peruano de Lab ECA.",
      imagen: "../images/productos/tienda/ecaotic-limpiador-auricular.jpg",
      precio: 35.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // referencia set/2026: 60 ml S/18.50 (rappi) y S/19.90 (superpet.pe, allju.pe)
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "60 ml", extra: 0 }
          ]
        }
      ]
    },

    // 8) Serie descalonia Huellas Pet Care (GLACSA) — 50 ml
    {
      id: "huellas-descalonia",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Huellas Pet Care Descalonia Spray x 50 ml",
      resumen:
        "Sprays de 50 ml de la línea descalonia de Huellas Pet Care (GLACSA), en sus tres versiones: Go!!, Force y Flection. Consulte con la veterinaria cuál corresponde a su mascota.",
      imagen: "../images/productos/tienda/huellas-descalonia-serie.jpg",
      precio: 38.00,   // PRECIO DE VENTA — puede cambiarlo cuando quiera.
      // ESTIMADO: no se encontro lista publica de esta linea; se comparo con sprays veterinarios similares (S/42.00-51.90). CONFIRME CON SU PROVEEDOR
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Versión",
          opciones: [
            { label: "descalonia Go!! 50 ml", extra: 0 },
            { label: "descalonia Force 50 ml", extra: 0 },
            { label: "descalonia Flection 50 ml", extra: 0 }
          ]
        }
      ]
    },

    // ==================================================================
    // ┌────────────────────────────────────────────────────────────────┐
    // │  KITS DE ACCESORIOS — CAMPAÑA CON 40% DE DESCUENTO             │
    // │                                                                │
    // │  Estos tres kits llevan la linea:                               │
    // │      descuento: 40,                                             │
    // │  Eso significa: escriba en "precio" el PRECIO NORMAL del kit     │
    // │  y la web sola resta el 40%, muestra el precio regular tachado   │
    // │  y pinta la cinta "-40% de descuento" sobre la foto.            │
    // │                                                                │
    // │  Ejemplo: precio: 100  ->  la web muestra S/ 60.00 y S/ 100.00  │
    // │  tachado. Para terminar la campaña, borre la linea descuento.    │
    // │  Para cambiar el porcentaje, cambie el 40 por otro numero.       │
    // │                                                                │
    // │  Nota: el descuento se aplica al precio base. Si una opcion      │
    // │  suma dinero con "extra", escriba ese monto ya rebajado.         │
    // └────────────────────────────────────────────────────────────────┘
    // ==================================================================

    // 9) Kit de accesorios básico (comedero, bebedero portátil, manta, juguete)
    {
      id: "kit-accesorios-basico",
      categoria: "accesorios",
      categoriaTexto: "Kits de Accesorios",
      titulo: "Kit de Accesorios Básico para Perro",
      resumen:
        "Comedero antideslizante, bebedero portátil Aqua Dog, manta polar, cortaúñas con lima y pelota dispensadora. Ideal para quienes recién reciben a su mascota.",
      imagen: "../images/productos/tienda/kit-accesorios-basico.jpg",
      precio: 87.00,   // PRECIO NORMAL — puede cambiarlo cuando quiera.
      // Con el 40 % de descuento de abajo, la web cobra S/ 52.20 por las 5 piezas.
      descuento: 40,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "Kit completo de 5 piezas", extra: 0 }
          ]
        }
      ]
    },

    // 10) Kit de accesorios completo (cepillado, comedero lento, limpiapatas)
    {
      id: "kit-accesorios-completo",
      categoria: "accesorios",
      categoriaTexto: "Kits de Accesorios",
      titulo: "Kit de Accesorios Completo para Perro",
      resumen:
        "Rastrillo deslanador, peine doble de grooming, comedero lento antiansiedad, limpiapatas Wash Foot Cup, juguete mordedor de hueso y pelota sonora.",
      imagen: "../images/productos/tienda/kit-accesorios-completo.jpg",
      precio: 83.00,   // PRECIO NORMAL — puede cambiarlo cuando quiera.
      // Con el 40 % de descuento de abajo, la web cobra S/ 49.80 por las 6 piezas.
      descuento: 40,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "Kit completo de 6 piezas", extra: 0 }
          ]
        }
      ]
    },

    // 11) Kit de accesorios para gatos (torre de juegos, guante, comedero doble)
    {
      id: "kit-accesorios-gatos",
      categoria: "accesorios",
      categoriaTexto: "Kits de Accesorios",
      titulo: "Kit de Accesorios para Gato",
      resumen:
        "Torre de juegos Tower of Tracks, caña con plumas, guante deslanador True Touch, cortaúñas con lima y comedero doble. Pensado para gatos en casa.",
      imagen: "../images/productos/tienda/kit-accesorios-gatos.jpg",
      precio: 82.53,   // PRECIO NORMAL — puede cambiarlo cuando quiera.
      // Con el 40 % de descuento de abajo, la web cobra S/ 49.52 por las 6 piezas.
      descuento: 40,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "Kit completo de 5 piezas", extra: 0 }
          ]
        }
      ]
    },

    // ==================================================================
    // ┌────────────────────────────────────────────────────────────────┐
    // │  ROPA PARA MASCOTAS — LA VITRINA DE LA TIENDA                  │
    // │  AGREGADO EL 18/09/2026                                        │
    // │                                                                │
    // │  Son las mismas prendas que se ven en el carrusel de fotos de   │
    // │  la vitrina; ahora tambien se pueden comprar desde la web.      │
    // │  Los precios son DE REFERENCIA del mercado peruano (set/2026):  │
    // │  cambie el numero por su precio real de mostrador.              │
    // │                                                                │
    // │  La talla suma dinero con "extra": las tallas grandes llevan     │
    // │  mas tela, por eso cuestan un poco mas. Si usted cobra igual     │
    // │  todas las tallas, ponga extra: 0 en todas.                      │
    // └────────────────────────────────────────────────────────────────┘
    // ==================================================================

    // 12) Conjunto polar a cuadros (casaca con capucha + pantalón)
    {
      id: "ropa-conjunto-polar",
      categoria: "ropa",
      categoriaTexto: "Ropa para Mascotas",
      titulo: "Conjunto Polar a Cuadros con Capucha",
      resumen:
        "Conjunto de dos piezas en polar: casaca a cuadros con capucha y pantalón con bolsillos. Abriga de verdad en las mañanas frías de Huánuco y se pone en segundos por la espalda.",
      imagen: "../images/productos/vitrina-conjunto-polar.jpg",
      precio: 45.00,   // PRECIO DE REFERENCIA — puede cambiarlo cuando quiera.
      // referencia set/2026: enteritos y conjuntos de polar S/42.00-55.00 (elpetshop.pe, wompet.pe)
      variantes: [
        {
          nombre: "Talla",
          opciones: [
            { label: "XS (Chihuahua, Poodle toy)", extra: 0 },
            { label: "S (Shih Tzu, Pug)", extra: 0, predeterminada: true },
            { label: "M (Schnauzer, Beagle)", extra: 6 },
            { label: "L (Cocker, Border Collie)", extra: 12 }
          ]
        },
        {
          nombre: "Modelo",
          opciones: [
            { label: "Cuadros rojo con pantalón gris", color: "#b91c1c", extra: 0 },
            { label: "Cuadros azul con pantalón gris", color: "#1d4ed8", extra: 0 }
          ]
        }
      ]
    },

    // 13) Chaleco con forro sherpa (el más pedido de la vitrina)
    {
      id: "ropa-chaleco-sherpa",
      categoria: "ropa",
      categoriaTexto: "Ropa para Mascotas",
      titulo: "Chaleco Impermeable con Forro Sherpa",
      resumen:
        "Chaleco de exterior resistente al agua con forro peluche sherpa por dentro y broches al frente: se pone y se saca en segundos, sin pasarlo por la cabeza. El más pedido de la vitrina.",
      imagen: "../images/productos/vitrina-chaleco-lila.jpg",
      precio: 42.00,   // PRECIO DE REFERENCIA — puede cambiarlo cuando quiera.
      // referencia set/2026: abrigo sherpa polar S/42.00 (elpetshop.pe), chaleco térmico S/55.00 (wompet.pe)
      variantes: [
        {
          nombre: "Talla",
          opciones: [
            { label: "XS (Chihuahua, Poodle toy)", extra: 0 },
            { label: "S (Shih Tzu, Pug)", extra: 0, predeterminada: true },
            { label: "M (Schnauzer, Beagle)", extra: 6 },
            { label: "L (Cocker, Border Collie)", extra: 12 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Lila con forro rosado", color: "#a78bfa", extra: 0 },
            { label: "Celeste con forro crema", color: "#7dd3fc", extra: 0 },
            { label: "Rosado con forro celeste", color: "#f9a8d4", extra: 0 }
          ]
        }
      ]
    },

    // 14) Vestidos, casacas y mantas de temporada (la percha completa)
    {
      id: "ropa-temporada",
      categoria: "ropa",
      categoriaTexto: "Ropa para Mascotas",
      titulo: "Ropa de Temporada: Poleras, Casacas y Mantas",
      resumen:
        "La percha completa de la tienda: poleras de algodón, casacas jean, vestidos con vuelo y mantas polar, en tallas para razas pequeñas y medianas. Elija la prenda y la talla; le confirmamos el stock y el color por WhatsApp.",
      imagen: "../images/productos/vitrina-conjuntos-ropa.jpg",
      precio: 10.00,   // Prenda mas economica (la polera). La web cobra el 40 % menos (ver "descuento").
      descuento: 40,
      // Las demas prendas suman con "extra": manta +2 (S/12), vestido +5 (S/15), casaca jean +5 (S/15).
      // referencia set/2026: poleras desde S/27.00 (cat-oh.com), vestidos S/35.00 (falabella.com.pe), casacas S/34.90 (petuniverse.com.pe)
      variantes: [
        {
          nombre: "Prenda",
          opciones: [
            { label: "Polera de algodón", extra: 0 },
            { label: "Manta polar", extra: 2 },
            { label: "Vestido con vuelo", extra: 5, predeterminada: true },
            { label: "Casaca jean", extra: 5 }
          ]
        },
        {
          nombre: "Talla",
          opciones: [
            { label: "XS", extra: 0 },
            { label: "S", extra: 0, predeterminada: true },
            { label: "M", extra: 1 },
            { label: "L", extra: 2 }
          ]
        }
      ]
    }
  ];


  /* Se anaden los productos escritos en js/productos-nuevos.js (formato simple).
     Ese archivo se carga antes que este y deja la lista ya normalizada en
     window.PELITOS_PRODUCTOS_EXTRA. Si no esta cargado, no pasa nada. */
  var EXTRA = Array.isArray(global.PELITOS_PRODUCTOS_EXTRA)
    ? global.PELITOS_PRODUCTOS_EXTRA
    : [];

  var yaUsados = {};
  PRODUCTOS.forEach(function (p) {
    yaUsados[p.id] = true;
  });

  EXTRA.forEach(function (p) {
    if (yaUsados[p.id]) {
      /* Mismo id: el producto nuevo reemplaza al del catalogo original, asi se
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
    console.error("[PetShop] No se encontró el catálogo (BLOQUE 3 de js/main.js). Revisa el orden de los <script>.");
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
          var v = window.open(url, "_blank", "noopener,noreferrer");
          if (v) v.opener = null;
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
   * manda el precio escrito en el catálogo
   * (BLOQUE 3 de js/main.js, o js/productos-nuevos.js).
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

  /* ---- Descuento por campaña ("descuento: 40" en el Bloque 3) ----
     Si un producto tiene "descuento", en el Bloque 3 se escribe el precio
     NORMAL y aqui la web resta el porcentaje. Asi el precio tachado y el
     "-40%" salen solos, sin escribir dos precios. */
  function porcentajeDescuento(producto) {
    var d = Number(producto && producto.descuento) || 0;
    return d > 0 && d < 100 ? d : 0;
  }

  /** Precio de lista, antes de aplicar el descuento de campaña. */
  function precioRegular(producto) {
    var a = ajustes[producto.id];
    return a && a.base !== undefined ? a.base : aCentimos(producto.precio);
  }

  function precioBase(producto) {
    var base = precioRegular(producto);
    var pct = porcentajeDescuento(producto);
    return pct ? Math.round((base * (100 - pct)) / 100) : base;
  }

  function recargo(producto, nombreGrupo, opcion) {
    var a = ajustes[producto.id];
    var clave = nombreGrupo + "|" + opcion.label;
    if (a && a.extras && a.extras[clave] !== undefined) return a.extras[clave];
    return aCentimos(opcion.extra || 0);
  }

  /** Precio total de un producto con un conjunto de opciones elegidas. */
  function precioCon(producto, seleccion) {
    var total = precioBase(producto);
    (producto.variantes || []).forEach(function (grupo) {
      var label = seleccion[grupo.nombre];
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

  /* ---- Productos sin precio publicado ----
     Si en el Bloque 3 un producto tiene "precio: 0", la web no inventa
     un monto: muestra "Precio a consultar" y solo permite pedirlo por
     WhatsApp. En cuanto se escriba el precio, la tarjeta y el carrito
     funcionan normalmente sin tocar nada mas. */
  function sinPrecio(producto) {
    return !(precioBase(producto) > 0);
  }

  /* ---- Oferta: precio regular tachado y % de descuento ----
     Un producto está en oferta si en el Bloque 3 tiene "precioAntes"
     mayor que el precio publicado, o si tiene "descuento: 40". */
  function enOferta(producto) {
    return precioAnterior(producto) > precioBase(producto);
  }

  /** Precio tachado en céntimos: el de campaña o el escrito en precioAntes. */
  function precioAnterior(producto) {
    if (porcentajeDescuento(producto)) return precioRegular(producto);
    return aCentimos(producto.precioAntes);
  }

  /** Diferencia en céntimos entre el precio regular y el de oferta. */
  function deltaOferta(producto) {
    if (!enOferta(producto)) return 0;
    return precioAnterior(producto) - precioBase(producto);
  }

  function porcentajeOferta(producto) {
    if (!enOferta(producto)) return 0;
    var antes = precioAnterior(producto);
    return Math.round(((antes - precioBase(producto)) / antes) * 100);
  }

  /** HTML del precio tachado + etiqueta de descuento (o cadena vacía). */
  function htmlAntes(producto, precioActual) {
    if (!enOferta(producto)) return "";
    return (
      '<span class="producto-card__precio-antes">' +
      esc(formatear(precioActual + deltaOferta(producto))) +
      "</span> " +
      '<span class="din-badge-off">-' +
      porcentajeOferta(producto) +
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

  function abrirDialogo(el) {
    if (!el || pilaDialogos.indexOf(el) !== -1) return;
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
      e.stopPropagation();
      cerrarDialogoSuperior();
      return;
    }
    if (e.key !== "Tab") return;

    var activo = pilaDialogos[pilaDialogos.length - 1].el;
    var focusables = Array.prototype.filter.call(
      activo.querySelectorAll(FOCUSABLES),
      function (el) {
        return el.offsetParent !== null || el === document.activeElement;
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
        el.removeAttribute("src");
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
    if (!toast || !mensaje) return;
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
          (op.color
            ? '<span class="color-dot" style="background:' + esc(op.color) + '"></span> '
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
  // 5. Catálogo: render, filtros, orden, buscador y páginas
  //    Diseño tipo "tienda": barra lateral con Ordenar por, Especies,
  //    Marcas y Categorías; tarjetas limpias y paginación.
  // =========================================================

  var rejilla = document.getElementById("contenedor-productos");
  var POR_PAGINA = 12;
  var terminoBusqueda = "";
  var ordenActual = "";               // "", "precio-asc", "precio-desc", "az", "za"
  var filtrosActivos = { especie: [], marca: [], categoria: [] };
  var paginaActual = 1;

  var NOMBRES_CATEGORIA = {
    alimentos: "Alimentos",
    snacks: "Snacks",
    salud: "Salud & Farmacia",
    higiene: "Higiene & Estética",
    accesorios: "Accesorios",
    ropa: "Ropa"
  };

  /* Marcas conocidas: si el producto no trae "marca", se detecta por el nombre. */
  var MARCAS_CONOCIDAS = [
    "Naturalistic", "4 Groomer", "ECAKLIN", "IBASA", "ECA DERM", "ECAÓTIC",
    "Huellas Pet Care", "Ricocan", "Ricocat", "Canbo"
  ];

  function sinTildes(t) {
    return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  /** Marca del producto: campo "marca", la ficha técnica o el nombre. */
  function marcaDe(p) {
    if (p.marca) return p.marca;
    var texto = sinTildes(p.titulo + " " + (p.ficha && p.ficha.marca ? p.ficha.marca : ""));
    for (var i = 0; i < MARCAS_CONOCIDAS.length; i++) {
      if (texto.indexOf(sinTildes(MARCAS_CONOCIDAS[i]).replace(/\s+/g, " ")) !== -1 ||
          texto.replace(/\s+/g, "").indexOf(sinTildes(MARCAS_CONOCIDAS[i]).replace(/\s+/g, "")) !== -1) {
        return MARCAS_CONOCIDAS[i];
      }
    }
    return "Pelitos";
  }

  /** Especie: campo "especie" ("perro", "gato" o ["perro","gato"]) o se deduce del texto. */
  var ESPECIE_POR_ID = {
    "ricocat-gatitos-1-kg": "gato",
    "canbo-super-premium-gatitos-pollo-1-kg": "gato",
    "kit-accesorios-gatos": "gato",
    "ecaklin-desinfectante": "ambos",
    "huellas-descalonia": "ambos",
    "comedero-doble-con-dispensador": "ambos",
    "comedero-doble-carita-de-oso": "ambos",
    "comedero-doble-ovalado": "ambos",
    "comedero-elevado-con-base": "ambos",
    "tazon-huellitas": "ambos",
    "cama-redonda-con-borde-de-borrego": "ambos",
    "cama-redonda-estampado-patitas": "ambos",
    "tazon-woof": "perro",
    "botella-bebedero-portatil": "perro",
    "hueso-de-plastico": "perro",
    "kit-accesorios-basico": "perro",
    "kit-accesorios-completo": "perro"
  };

  function especiesDe(p) {
    if (p.especie) return [].concat(p.especie).map(sinTildes);
    var fijo = ESPECIE_POR_ID[p.id];
    if (fijo) return fijo === "ambos" ? ["perro", "gato"] : [fijo];
    if (/naturalistic|4groomer|ricocan|canbo-super-premium-cachorro|ropa-/.test(p.id)) return ["perro"];
    var t = sinTildes([p.titulo, p.categoriaTexto, p.resumen, p.ficha && p.ficha.descripcion].join(" "));
    if (/perros? y gatos?|gatos? y perros?|mascotas?\b/.test(t) && !/para perros|para gatos/.test(t)) return ["perro", "gato"];
    var gato = /\bgat|felin|ricocat/.test(t);
    var perro = /\bperr|cachorr|canin|\bdog\b|ricocan/.test(t) || p.categoria === "ropa";
    if (gato && !perro) return ["gato"];
    if (perro && !gato) return ["perro"];
    return ["perro", "gato"];
  }

  function textoBuscable(p) {
    var partes = [p.titulo, p.categoriaTexto, p.resumen || "", marcaDe(p)];
    if (p.ficha) {
      partes.push(p.ficha.marca, p.ficha.presentacion, p.ficha.descripcion);
      (p.ficha.sellos || []).forEach(function (s) { partes.push(s); });
      (p.ficha.ingredientes || []).forEach(function (i) { partes.push(i.titulo, i.detalle); });
    }
    return sinTildes(partes.join(" "));
  }

  function productosBase() {
    return CATALOGO.productos.filter(function (p) { return !p.destacado; });
  }

  function cumple(p, excluir) {
    if (excluir !== "especie" && filtrosActivos.especie.length) {
      var esp = especiesDe(p);
      if (!filtrosActivos.especie.some(function (e) { return esp.indexOf(e) !== -1; })) return false;
    }
    if (excluir !== "marca" && filtrosActivos.marca.length && filtrosActivos.marca.indexOf(marcaDe(p)) === -1) return false;
    if (excluir !== "categoria" && filtrosActivos.categoria.length && filtrosActivos.categoria.indexOf(p.categoria) === -1) return false;
    if (terminoBusqueda && textoBuscable(p).indexOf(terminoBusqueda) === -1) return false;
    return true;
  }

  function productosVisibles() {
    var lista = productosBase().filter(function (p) { return cumple(p); });
    var precio = function (p) { return sinPrecio(p) ? Infinity : precioDesde(p); };
    if (ordenActual === "precio-asc") lista.sort(function (a, b) { return precio(a) - precio(b); });
    if (ordenActual === "precio-desc") lista.sort(function (a, b) { return (precio(b) === Infinity ? -1 : precio(b)) - (precio(a) === Infinity ? -1 : precio(a)); });
    if (ordenActual === "az") lista.sort(function (a, b) { return a.titulo.localeCompare(b.titulo, "es"); });
    if (ordenActual === "za") lista.sort(function (a, b) { return b.titulo.localeCompare(a.titulo, "es"); });
    return lista;
  }

  /* ---- Barra lateral de filtros (se arma sola con los datos del catálogo) ---- */
  var ICONO_CHECK = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  function opcionHTML(grupo, valor, texto, cantidad, activo) {
    return (
      '<label class="ps-check' + (cantidad === 0 && !activo ? " ps-check--vacio" : "") + '">' +
      '<input type="checkbox" data-grupo="' + esc(grupo) + '" value="' + esc(valor) + '"' + (activo ? " checked" : "") + " />" +
      '<span class="ps-check__caja">' + ICONO_CHECK + "</span>" +
      '<span class="ps-check__texto">' + esc(texto) + "</span>" +
      (cantidad !== null ? '<span class="ps-check__num">' + cantidad + "</span>" : "") +
      "</label>"
    );
  }

  function grupoHTML(id, titulo, contenido, abierto) {
    return (
      '<div class="ps-grupo' + (abierto ? " abierto" : "") + '" data-ps-grupo="' + id + '">' +
      '<button type="button" class="ps-grupo__titulo" aria-expanded="' + (abierto ? "true" : "false") + '">' +
      "<span>" + titulo + "</span>" +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      "</button>" +
      '<div class="ps-grupo__cuerpo">' + contenido + "</div>" +
      "</div>"
    );
  }

  var gruposAbiertos = { orden: true, especie: false, marca: false, categoria: false };

  function renderFiltros() {
    var caja = document.getElementById("ps-filtros-cuerpo");
    if (!caja) return;
    var base = productosBase();

    function contar(grupo, prueba) {
      return base.filter(function (p) { return cumple(p, grupo) && prueba(p); }).length;
    }

    var orden = [
      ["precio-asc", "Precio menor"],
      ["precio-desc", "Precio mayor"],
      ["az", "Nombre A-Z"],
      ["za", "Nombre Z-A"]
    ].map(function (o) { return opcionHTML("orden", o[0], o[1], null, ordenActual === o[0]); }).join("");

    var especies = [["perro", "Perro"], ["gato", "Gato"]].map(function (e) {
      return opcionHTML("especie", e[0], e[1], contar("especie", function (p) { return especiesDe(p).indexOf(e[0]) !== -1; }), filtrosActivos.especie.indexOf(e[0]) !== -1);
    }).join("");

    var marcas = [];
    base.forEach(function (p) { var m = marcaDe(p); if (marcas.indexOf(m) === -1) marcas.push(m); });
    marcas.sort(function (a, b) { return a.localeCompare(b, "es"); });
    var marcasHTML = marcas.map(function (m) {
      return opcionHTML("marca", m, m, contar("marca", function (p) { return marcaDe(p) === m; }), filtrosActivos.marca.indexOf(m) !== -1);
    }).join("");

    var cats = [];
    base.forEach(function (p) { if (cats.indexOf(p.categoria) === -1) cats.push(p.categoria); });
    var ordenCats = Object.keys(NOMBRES_CATEGORIA);
    cats.sort(function (a, b) { return ordenCats.indexOf(a) - ordenCats.indexOf(b); });
    var catsHTML = cats.map(function (c) {
      return opcionHTML("categoria", c, NOMBRES_CATEGORIA[c] || c, contar("categoria", function (p) { return p.categoria === c; }), filtrosActivos.categoria.indexOf(c) !== -1);
    }).join("");

    caja.innerHTML =
      grupoHTML("orden", "Ordenar por", orden, gruposAbiertos.orden) +
      grupoHTML("especie", "Especies", especies, gruposAbiertos.especie) +
      grupoHTML("categoria", "Categorías", catsHTML, gruposAbiertos.categoria) +
      grupoHTML("marca", "Marcas", marcasHTML, gruposAbiertos.marca);

    var hayFiltros = ordenActual || terminoBusqueda || filtrosActivos.especie.length || filtrosActivos.marca.length || filtrosActivos.categoria.length;
    Array.prototype.forEach.call(document.querySelectorAll("[data-ps-limpiar]"), function (b) { b.hidden = !hayFiltros; });

    var nActivos = filtrosActivos.especie.length + filtrosActivos.marca.length + filtrosActivos.categoria.length + (ordenActual ? 1 : 0);
    var badge = document.getElementById("ps-filtros-num");
    if (badge) { badge.textContent = nActivos; badge.hidden = !nActivos; }
  }

  function renderCatalogo() {
    if (!rejilla) return;
    var lista = productosVisibles();
    var paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    if (paginaActual > paginas) paginaActual = paginas;

    var contador = document.getElementById("contador-resultados");
    if (contador) contador.textContent = lista.length === 1 ? "1 producto" : lista.length + " productos";
    var verN = document.getElementById("ps-ver-n");
    if (verN) verN.textContent = lista.length === 1 ? "Ver 1 producto" : "Ver " + lista.length + " productos";

    renderFiltros();

    if (!lista.length) {
      rejilla.innerHTML =
        '<div class="catalogo-vacio">' +
        '<p class="catalogo-vacio__icono" aria-hidden="true">🔍</p>' +
        "<h3>No se encontraron productos</h3>" +
        "<p>Prueba con otra palabra o quita algún filtro.</p>" +
        '<button type="button" class="ps-limpiar" data-ps-limpiar>Limpiar filtros</button>' +
        "</div>";
      renderPaginacion(0);
      return;
    }

    var inicio = (paginaActual - 1) * POR_PAGINA;
    rejilla.innerHTML = lista.slice(inicio, inicio + POR_PAGINA).map(tarjetaHTML).join("");
    Array.prototype.forEach.call(rejilla.children, function (card, i) {
      card.style.setProperty("--din-i", String(i % 10));
    });
    renderPaginacion(paginas);
  }

  function renderPaginacion(paginas) {
    var nav = document.getElementById("ps-paginacion");
    if (!nav) return;
    if (paginas <= 1) { nav.innerHTML = ""; return; }
    var html = '<button type="button" class="ps-pag__flecha" data-pagina="' + (paginaActual - 1) + '"' + (paginaActual === 1 ? " disabled" : "") + ' aria-label="Página anterior">‹</button>';
    for (var i = 1; i <= paginas; i++) {
      html += '<button type="button" class="ps-pag__num' + (i === paginaActual ? " activo" : "") + '" data-pagina="' + i + '"' + (i === paginaActual ? ' aria-current="page"' : "") + ">" + i + "</button>";
    }
    html += '<button type="button" class="ps-pag__flecha" data-pagina="' + (paginaActual + 1) + '"' + (paginaActual === paginas ? " disabled" : "") + ' aria-label="Página siguiente">›</button>';
    nav.innerHTML = html;
  }

  function tarjetaHTML(p) {
    var especies = especiesDe(p).map(function (e) {
      return '<span class="ps-card__tag">' + (e === "gato" ? "Gato" : "Perro") + "</span>";
    }).join("");

    var hayVariasTarifas = precioDesde(p) !== precioCon(p, seleccionMaxima(p));
    var etiquetaOferta = "";
    if (!sinPrecio(p) && enOferta(p)) {
      var pct = Math.round((deltaOferta(p) / precioAnterior(p)) * 100);
      etiquetaOferta = '<span class="ps-card__oferta">-' + pct + "%</span>";
    }

    var precio = sinPrecio(p)
      ? '<span class="ps-card__precio ps-card__precio--consultar">Precio a consultar</span>'
      : (enOferta(p) ? '<span class="ps-card__antes">' + esc(formatear(precioAnterior(p))) + "</span>" : "") +
        '<span class="ps-card__precio">' + (hayVariasTarifas && !enOferta(p) ? '<small>Desde</small> ' : "") + esc(formatear(precioDesde(p))) + "</span>";

    return (
      '<article class="producto-card ps-card">' +
      '<button type="button" class="ps-card__link" data-accion="abrir-opciones" data-id="' + esc(p.id) + '" aria-label="Ver ' + esc(p.titulo) + '"></button>' +
      etiquetaOferta +
      '<div class="ps-card__media">' +
      '<img src="' + esc(p.imagen) + '" alt="' + esc(p.titulo) + '" loading="lazy" decoding="async" onerror="this.closest(\'.ps-card__media\').classList.add(\'imagen-error\')" />' +
      "</div>" +
      '<div class="ps-card__cuerpo">' +
      '<p class="ps-card__marca">' + esc(marcaDe(p)) + "</p>" +
      '<h3 class="ps-card__titulo">' + esc(p.titulo) + "</h3>" +
      '<div class="ps-card__tags">' + especies + "</div>" +
      '<div class="ps-card__pie">' + precio + "</div>" +
      "</div>" +
      "</article>"
    );
  }

  /** Selección con la opción más cara de cada grupo (para saber si mostrar "Desde"). */
  function seleccionMaxima(p) {
    var sel = {};
    (p.variantes || []).forEach(function (g) {
      var max = null, label = null;
      g.opciones.forEach(function (op) {
        var r = recargo(p, g.nombre, op);
        if (max === null || r > max) { max = r; label = op.label; }
      });
      sel[g.nombre] = label;
    });
    return sel;
  }

  function limpiarFiltros() {
    ordenActual = "";
    terminoBusqueda = "";
    filtrosActivos = { especie: [], marca: [], categoria: [] };
    paginaActual = 1;
    var buscador = document.getElementById("buscador-input");
    if (buscador) buscador.value = "";
    renderCatalogo();
  }

  function subirAlCatalogo() {
    var destino = document.getElementById("catalogo");
    if (!destino) return;
    var y = destino.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function conectarFiltros() {
    var panel = document.getElementById("ps-filtros");
    var cuerpo = document.getElementById("ps-filtros-cuerpo");

    if (cuerpo) {
      cuerpo.addEventListener("click", function (e) {
        var t = e.target.closest(".ps-grupo__titulo");
        if (!t) return;
        var g = t.parentElement;
        var abierto = g.classList.toggle("abierto");
        t.setAttribute("aria-expanded", abierto ? "true" : "false");
        gruposAbiertos[g.dataset.psGrupo] = abierto;
      });
      cuerpo.addEventListener("change", function (e) {
        var input = e.target;
        if (!input.dataset || !input.dataset.grupo) return;
        var grupo = input.dataset.grupo;
        if (grupo === "orden") {
          ordenActual = input.checked ? input.value : "";
        } else {
          var lista = filtrosActivos[grupo];
          var i = lista.indexOf(input.value);
          if (input.checked && i === -1) lista.push(input.value);
          if (!input.checked && i !== -1) lista.splice(i, 1);
        }
        paginaActual = 1;
        renderCatalogo();
      });
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-ps-limpiar]")) limpiarFiltros();
      if (e.target.closest("[data-ps-abrir-filtros]") && panel) {
        panel.classList.add("abierto");
        document.body.classList.add("ps-filtros-abiertos");
      }
      if (e.target.closest("[data-ps-cerrar-filtros]") && panel) {
        panel.classList.remove("abierto");
        document.body.classList.remove("ps-filtros-abiertos");
      }
    });

    var paginacion = document.getElementById("ps-paginacion");
    if (paginacion) {
      paginacion.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pagina]");
        if (!b || b.disabled) return;
        paginaActual = Number(b.dataset.pagina) || 1;
        renderCatalogo();
        subirAlCatalogo();
      });
    }

    var buscador = document.getElementById("buscador-input");
    if (buscador) {
      // Leer parámetro de búsqueda proveniente de la cabecera u otras páginas (?q=...)
      try {
        var urlParams = new URLSearchParams(window.location.search);
        var qParam = urlParams.get("q") || urlParams.get("buscar");
        if (qParam && qParam.trim()) {
          buscador.value = qParam.trim();
          terminoBusqueda = sinTildes(qParam.trim());
          paginaActual = 1;
        }
      } catch (eBuscador) {}

      var pendiente = null;
      buscador.addEventListener("input", function () {
        window.clearTimeout(pendiente);
        pendiente = window.setTimeout(function () {
          terminoBusqueda = sinTildes(buscador.value.trim());
          paginaActual = 1;
          renderCatalogo();
        }, 150);
      });
      var form = buscador.closest("form");
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); subirAlCatalogo(); });
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

    modalCuerpo.innerHTML =
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
      if (sinPrecio(productoModal)) {
        el.textContent = "A consultar";
        pintarAntes(el, null, 0);
      } else {
        el.textContent = formatear(unit);
        pintarAntes(el, productoModal, unit);
      }
    }

    // Sin precio publicado no se puede sumar al carrito: solo pedido por WhatsApp.
    var btnCarrito = modal
      ? modal.querySelector('[data-accion="modal-carrito"]')
      : null;
    if (btnCarrito) {
      btnCarrito.hidden = sinPrecio(productoModal);
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

      // Se revisa CADA grupo de variantes por separado. Si una sola opción ya
      // no se vende, la línea entera se descarta (antes, al fallar un grupo,
      // los siguientes se rellenaban con el valor por defecto aunque la línea
      // se fuera a descartar de todos modos: sobraba).
      var seleccion = {};
      var completo = true;
      (p.variantes || []).forEach(function (grupo) {
        var elegido = linea.opciones ? linea.opciones[grupo.nombre] : null;
        if (!buscarOpcion(grupo, elegido)) {
          completo = false;
          return;
        }
        seleccion[grupo.nombre] = elegido;
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
        avisar("Ya tienes el máximo de unidades de este producto en el carrito.");
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
    linea.cantidad = Math.min(MAX_UNIDADES, nueva);
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
        unidades === 0 ? "Ver carrito, vacío" : "Ver carrito, " + unidades + " artículos"
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
        sinPrecio(producto)
          ? "*Precio:* por confirmar"
          : "*Total referencial:* " + formatear(unitario * unidades),
        "",
        sinPrecio(producto)
          ? "¿Me confirman el precio y si hay stock para entrega en Huánuco?"
          : "¿Tienen stock disponible para entrega en Huánuco?"
      ])
      .join("\n");

    abrirExterno(enlaceWhatsapp(texto, WHATSAPP));
  }

  function confirmarPedido() {
    if (!carrito.length) {
      avisar("Agrega al menos un producto antes de confirmar el pedido.");
      return;
    }

    var lineas = carrito.map(function (linea, i) {
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
   * de precios y copiarla a mano al catálogo, que es la fuente real:
   * BLOQUE 3 de js/main.js, o js/productos-nuevos.js.
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

    function numeroDe(input) {
      var n = Number(input.value);
      if (!Number.isFinite(n) || n < 0) {
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

    /* OJO: los precios se aplican solo en esta pestaña. Al recargar la página
       vuelven los del catálogo, porque no se guardan en el navegador (ver
       "Almacenamiento en memoria de la sesión" arriba). Para que el cambio sea
       de verdad hay que pulsar "Descargar lista" y copiar los precios al
       catálogo (BLOQUE 3 de js/main.js o js/productos-nuevos.js). */
    avisar(
      "Precios aplicados en esta pestaña. Para que queden fijos: Descargar lista y copiarlos al catálogo."
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
    avisar("Precios restablecidos a los valores del catálogo (js/main.js).");
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
  // 10. Vitrina dinámica de ropa y promociones
  // =========================================================
  /*
    Es el carrusel de fotos que está arriba del catálogo, en
    pages/productos.html (busque VITRINA DINÁMICA en ese archivo).

    Como funciona:
      - Cambia de foto solo cada 6 segundos.
      - Se detiene cuando el visitante pasa el mouse encima, cuando usa
        el teclado o cuando la pestaña no está a la vista.
      - También se puede mover con las flechas, con los puntos de abajo
        y arrastrando con el dedo en el celular.
      - Si el sistema del visitante pide menos animaciones, no se mueve solo.

    Para agregar, quitar o cambiar una foto o un texto NO hay que tocar
    este código: se edita la lista de <li class="vitrina__slide"> dentro
    de pages/productos.html. Los puntos de navegación se crean solos.

    Para cambiar cada cuánto pasa de foto, cambie el 6000 de abajo
    (está en milisegundos: 6000 = 6 segundos).
  */

  var VITRINA_MS = 6000; // tiempo que dura cada foto en pantalla

  function conectarVitrina() {
    var vitrina = document.getElementById("vitrina-petshop");
    if (!vitrina) return;

    var pista = vitrina.querySelector("[data-vitrina-pista]");
    var slides = [].slice.call(vitrina.querySelectorAll(".vitrina__slide"));
    var puntos = vitrina.querySelector("[data-vitrina-puntos]");
    var etiqueta = vitrina.querySelector("[data-vitrina-contador]");
    if (!pista || slides.length === 0) return;

    // Fondo borroso: cada foto se repite ampliada detras de si misma, asi
    // las fotos verticales se ven completas y sin bordes vacios.
    slides.forEach(function (slide) {
      var img = slide.querySelector("img");
      if (img) slide.style.backgroundImage = 'url("' + img.getAttribute("src") + '")';
    });

    var actual = 0;
    var temporizador = null;
    var enPausa = false;
    var menosMovimiento =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Puntos de navegación: uno por cada foto, creados automáticamente
    var botonesPunto = [];
    if (puntos) {
      puntos.innerHTML = "";
      slides.forEach(function (slide, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "vitrina__punto";
        var titulo = slide.querySelector(".vitrina__titulo");
        b.setAttribute(
          "aria-label",
          "Ver " + (titulo ? titulo.textContent.trim() : "imagen " + (i + 1))
        );
        b.addEventListener("click", function () {
          ir(i);
          reiniciarReloj();
        });
        puntos.appendChild(b);
        botonesPunto.push(b);
      });
    }

    function ir(indice) {
      actual = (indice + slides.length) % slides.length;
      pista.style.transform = "translateX(-" + actual * 100 + "%)";
      slides.forEach(function (s, i) {
        s.classList.toggle("activo", i === actual);
        s.setAttribute("aria-hidden", i === actual ? "false" : "true");
      });
      botonesPunto.forEach(function (b, i) {
        b.classList.toggle("activo", i === actual);
        b.setAttribute("aria-current", i === actual ? "true" : "false");
      });
      if (etiqueta) {
        etiqueta.textContent = actual + 1 + " / " + slides.length;
      }
    }

    function reiniciarReloj() {
      window.clearInterval(temporizador);
      temporizador = null;
      if (menosMovimiento || enPausa || slides.length < 2) return;
      temporizador = window.setInterval(function () {
        ir(actual + 1);
      }, VITRINA_MS);
    }

    function pausar() {
      enPausa = true;
      reiniciarReloj();
    }

    function reanudar() {
      enPausa = false;
      reiniciarReloj();
    }

    var anterior = vitrina.querySelector("[data-vitrina-anterior]");
    var siguiente = vitrina.querySelector("[data-vitrina-siguiente]");
    if (anterior) {
      anterior.addEventListener("click", function () {
        ir(actual - 1);
        reiniciarReloj();
      });
    }
    if (siguiente) {
      siguiente.addEventListener("click", function () {
        ir(actual + 1);
        reiniciarReloj();
      });
    }

    vitrina.addEventListener("mouseenter", pausar);
    vitrina.addEventListener("mouseleave", reanudar);
    vitrina.addEventListener("focusin", pausar);
    vitrina.addEventListener("focusout", reanudar);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pausar();
      else reanudar();
    });

    // Flechas del teclado cuando la vitrina tiene el foco
    vitrina.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        ir(actual - 1);
        reiniciarReloj();
      }
      if (e.key === "ArrowRight") {
        ir(actual + 1);
        reiniciarReloj();
      }
    });

    // Arrastre con el dedo en celulares
    var inicioX = null;
    vitrina.addEventListener(
      "touchstart",
      function (e) {
        inicioX = e.touches[0].clientX;
        pausar();
      },
      { passive: true }
    );
    vitrina.addEventListener(
      "touchend",
      function (e) {
        if (inicioX === null) return;
        var dif = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(dif) > 40) ir(actual + (dif < 0 ? 1 : -1));
        inicioX = null;
        reanudar();
      },
      { passive: true }
    );

    ir(0);
    reiniciarReloj();
  }

  // =========================================================
  // 11. Arranque
  // =========================================================

  document.addEventListener("DOMContentLoaded", function () {
    montarDestacado();
    conectarDestacado();
    conectarFiltros();
    conectarModal();
    conectarCarrito();
    conectarPanel();
    conectarVitrina();
    renderCatalogo();
  });
})();


/* ==========================================================================
   BLOQUE 5 · PÁGINA INICIO
   Cabecera al bajar la página y contadores animados.
   Se ejecuta solo cuando el <body> tiene data-pagina="inicio".
   ========================================================================== */

(function () {
  if (!esPagina("inicio")) return;   // solo se ejecuta en esta página

  // Animación de contadores
  function animarContador(el) {
    const target = +el.dataset.target;
    // Si el numero del HTML esta mal escrito, se pinta tal cual y se sale.
    // (Antes el contador se quedaba girando para siempre en segundo plano.)
    if (!Number.isFinite(target) || target <= 0) {
      el.textContent = el.dataset.target || '';
      return;
    }
    // El "5" es el unico contador que lleva la palabra años; el resto lleva "+".
    const sufijo = target === 5 ? ' años' : '+';
    const duracion = 1800;
    const paso = Math.max(1, Math.ceil(target / (duracion / 16)));
    let actual = 0;
    const timer = setInterval(() => {
      actual = Math.min(actual + paso, target);
      el.textContent = actual + sufijo;
      if (actual >= target) clearInterval(timer);
    }, 16);
  }

  // Intersection Observer para reveal y contadores
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('[data-target]').forEach(animarContador);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Barra de cita de la portada: arma el mensaje y lo abre en WhatsApp.
     No guarda nada ni manda correos: solo redacta el texto por el cliente.
     Para cambiar el numero de WhatsApp, edite TELEFONO_CITA de abajo. */
  const TELEFONO_CITA = '51939356376';
  const barraCita = document.querySelector('[data-barra-cita]');
  if (barraCita) {
    /* Si elige "Hoy", se desactivan las horas que ya pasaron. */
    const selectDia = barraCita.querySelector('[name="dia"]');
    const selectHora = barraCita.querySelector('[name="hora"]');
    const aHora24 = (texto) => {
      const m = /^(\d{1,2}):(\d{2})\s*([ap])/i.exec(texto);
      if (!m) return 0;
      let h = parseInt(m[1], 10) % 12;
      if (m[3].toLowerCase() === 'p') h += 12;
      return h * 60 + parseInt(m[2], 10);
    };
    const actualizarHoras = () => {
      if (!selectDia || !selectHora) return;
      const hoyISO = (() => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); })();
      const esHoy = selectDia.value === 'Hoy' || selectDia.value === hoyISO;
      const ahora = new Date();
      const minutos = ahora.getHours() * 60 + ahora.getMinutes();
      let primeraLibre = null;
      Array.from(selectHora.options).forEach((op) => {
        op.disabled = esHoy && aHora24(op.value) <= minutos;
        if (!op.disabled && !primeraLibre) primeraLibre = op;
      });
      if (selectHora.selectedOptions[0] && selectHora.selectedOptions[0].disabled && primeraLibre) {
        primeraLibre.selected = true;
      }
      /* Si hoy ya no quedan horas, se pasa a "Mañana". */
      if (esHoy && !primeraLibre) {
        if (selectDia.type === 'date') {
          const m = new Date(); m.setDate(m.getDate() + 1);
          m.setMinutes(m.getMinutes() - m.getTimezoneOffset());
          selectDia.value = m.toISOString().slice(0, 10);
        } else {
          selectDia.value = 'Mañana';
        }
        actualizarHoras();
      }
    };
    /* Calendario: no se permiten fechas pasadas ni superiores a 60 días */
    if (selectDia && selectDia.type === 'date') {
      const h = new Date(); h.setMinutes(h.getMinutes() - h.getTimezoneOffset());
      selectDia.min = h.toISOString().slice(0, 10);
      const maxFecha = new Date();
      maxFecha.setDate(maxFecha.getDate() + 60);
      maxFecha.setMinutes(maxFecha.getMinutes() - maxFecha.getTimezoneOffset());
      selectDia.max = maxFecha.toISOString().slice(0, 10);
    }

    const validarDiaLaboral = () => {
      if (!selectDia || selectDia.type !== 'date' || !selectDia.value) return;
      const partes = selectDia.value.split('-').map(Number);
      if (partes.length === 3) {
        const fechaElegida = new Date(partes[0], partes[1] - 1, partes[2]);
        if (fechaElegida.getDay() === 0) { // Domingo
          const sigLunes = new Date(fechaElegida);
          sigLunes.setDate(sigLunes.getDate() + 1);
          sigLunes.setMinutes(sigLunes.getMinutes() - sigLunes.getTimezoneOffset());
          selectDia.value = sigLunes.toISOString().slice(0, 10);
          if (typeof window.PelitosAviso === 'function') {
            window.PelitosAviso('Los domingos la clínica permanece cerrada. Hemos seleccionado el lunes para tu atención.');
          } else {
            alert('Los domingos la clínica permanece cerrada. Hemos seleccionado el lunes para tu atención.');
          }
        }
      }
      actualizarHoras();
    };

    if (selectDia) selectDia.addEventListener('change', validarDiaLaboral);
    actualizarHoras();

    barraCita.addEventListener('submit', (e) => {
      e.preventDefault();
      const dato = (nombre) => {
        const campo = barraCita.querySelector('[name="' + nombre + '"]');
        return campo ? String(campo.value).replace(/[\u200B-\u200D\uFEFF\u0000-\u001F]/g, '').trim() : '';
      };
      const servicio = dato('servicio');
      const mascota = dato('mascota').slice(0, 40);
      let dia = dato('dia');
      /* Fecha del calendario (AAAA-MM-DD) en formato legible: lunes 28/09/2026 */
      if (/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
        const [a, mm, d] = dia.split('-').map(Number);
        const f = new Date(a, mm - 1, d);
        if (f.getDay() === 0) {
          alert('Los domingos estamos cerrados. Por favor selecciona una fecha de lunes a sábado.');
          return;
        }
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        dia = dias[f.getDay()] + ' ' + String(d).padStart(2, '0') + '/' + String(mm).padStart(2, '0') + '/' + a;
      }
      const hora = dato('hora');
      const texto =
        'Hola Pelitos, quiero reservar una cita.\n' +
        (servicio ? 'Servicio: ' + servicio + '\n' : '') +
        (mascota ? 'Mascota: ' + mascota + '\n' : '') +
        (dia ? 'Cuándo: ' + dia + '\n' : '') +
        (hora && dia !== 'Solo quiero información' ? 'Hora: ' + hora : '');
      window.open(
        'https://api.whatsapp.com/send?phone=' + TELEFONO_CITA + '&text=' + encodeURIComponent(texto),
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // Año dinámico
  document.querySelectorAll('[data-anio]').forEach(el => el.textContent = new Date().getFullYear());
})();


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

    function validarCampo(input) {
      var tipo = input.dataset.validar;
      var valor = input.value.trim();
      var pista = input.parentElement.querySelector("[data-pista]");
      var ok = true;
      var msg = "";

      if (tipo === "texto") {
        ok = valor.length >= 3;
        msg = ok ? "Perfecto, gracias." : "Ingresa al menos 3 caracteres.";
      } else if (tipo === "telefono") {
        var digitos = valor.replace(/\D/g, "");
        ok = digitos.length >= 9;
        msg = ok ? "Número válido." : "Necesitamos un número de 9 dígitos.";
      } else if (tipo === "opcional") {
        ok = true;
        msg = valor ? "Listo, anotado." : "Opcional, nos ayuda a preparar la atención.";
      }

      input.parentElement.classList.toggle("campo--ok", ok && valor.length > 0);
      input.parentElement.classList.toggle("campo--mal", !ok && valor.length > 0);
      if (pista) pista.textContent = msg;
      return ok;
    }

    form.querySelectorAll("[data-validar]").forEach(function (input) {
      input.addEventListener("input", function () { validarCampo(input); });
      input.addEventListener("blur", function () { validarCampo(input); });
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

  let estadoCotizador = {
    pesoId: "0-5",
    pesoNombre: "Toy / Mini (0-5 Kg)",
    servicioId: "clasico",
    servicioNombre: "Servicio Clásico (Duchita + Corte)",
    extras: []
  };

  function recalcularCotizador() {
    const tarifaObj = TARIFAS[estadoCotizador.servicioId] || TARIFAS.clasico;
    const precioBase = tarifaObj[estadoCotizador.pesoId] || 40;
  
    let extrasMonto = 0;
    estadoCotizador.extras.forEach(e => { extrasMonto += e.costo; });

    const totalFinal = precioBase + extrasMonto;

    // Actualizar UI
    document.getElementById('resumen-peso').textContent = estadoCotizador.pesoNombre;
    document.getElementById('resumen-servicio').textContent = estadoCotizador.servicioNombre;
    document.getElementById('resumen-precio-base').textContent = `S/ ${precioBase.toFixed(2)}`;
    document.getElementById('resumen-extras-monto').textContent = `+S/ ${extrasMonto.toFixed(2)}`;
    document.getElementById('resumen-total').textContent = `S/ ${totalFinal.toFixed(2)}`;
    document.getElementById('resumen-tiempo').textContent = tarifaObj.tiempo;

    // Actualizar enlace de WhatsApp con los datos completos
    const extrasLista = estadoCotizador.extras.length > 0 
      ? "\n*Adicionales:* " + estadoCotizador.extras.map(e => e.nombre).join(', ')
      : "";

    const msg = `¡Hola Pelitos Estética! Deseo reservar cita:
  *Servicio:* ${estadoCotizador.servicioNombre}
  *Tamaño de mi mascota:* ${estadoCotizador.pesoNombre}${extrasLista}
  *Total estimado:* S/ ${totalFinal.toFixed(2)}

  ¿Tienen turnos disponibles para esta semana en su sede de Jr. Leoncio Prado?`;

    document.getElementById('btn-whatsapp-cotizador').href = `https://api.whatsapp.com/send?phone=51948426656&text=${encodeURIComponent(msg)}`;
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

  function abrirFotoGrande(src, caption) {
    if (!modalLightbox || !imgLightbox) return;
    imgLightbox.src = src;
    captionLightbox.textContent = caption || "";
    modalLightbox.classList.add('abierto');
    modalLightbox.setAttribute('aria-hidden', 'false');
  }

  // Las fotos de la galería la llaman desde el HTML con onclick="abrirFotoGrande(...)",
  // por eso se publica aquí para que el HTML la encuentre.

  
  window.abrirFotoGrande = abrirFotoGrande;

  document.getElementById('lightbox-cerrar').addEventListener('click', () => {
    modalLightbox.classList.remove('abierto');
    modalLightbox.setAttribute('aria-hidden', 'true');
  });

  modalLightbox.addEventListener('click', (e) => {
    if (e.target === modalLightbox) {
      modalLightbox.classList.remove('abierto');
      modalLightbox.setAttribute('aria-hidden', 'true');
    }
  });
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

    function pintar(valor) {
      var v = Math.max(0, Math.min(100, valor));
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
      desdeEvento(e);
    });
    window.addEventListener("pointermove", function (e) { if (arrastrando) desdeEvento(e); });
    window.addEventListener("pointerup", function () { arrastrando = false; });

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
      /* Antes este botón "iniciaba sesión" con una cuenta inventada
         (Dr. Roberto Pelitos). Como aún no hay conexión real con Google,
         ahora avisa y lleva al cliente al acceso con correo. */
      btnPageGoogle.addEventListener("click", () => {
        PelitosAuth.mostrarToast("El acceso con Google estará disponible pronto. Por ahora ingresa con tu correo.", "ℹ️");
        const correo = document.querySelector('#form-page-login input[type="email"]');
        if (correo) correo.focus();
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
        // Campo opcional: puede no existir en la página, así que se protege
        // (antes, si faltaba, el registro se rompía sin avisar).
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
        setTimeout(() => {
          window.open("https://api.whatsapp.com/send?phone=51939356376&text=" + texto, "_blank", "noopener");
        }, 700);
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

  /* Contador numérico (para estadísticas fuera de .reveal) */
  function contador(el) {
    if (el.dataset.dinHecho === "1") return;
    el.dataset.dinHecho = "1";
    var meta = Number(el.dataset.target);
    if (!isFinite(meta) || meta <= 0) return;
    var sufijo = el.dataset.sufijo || "+";
    if (reduce) {
      el.textContent = meta + sufijo;
      return;
    }
    var t0 = performance.now();
    var dur = 1400;
    function tick(t) {
      var p = Math.min((t - t0) / dur, 1);
      var suave = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(meta * suave) + sufijo;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------
     3. Tarjetas: luz que sigue al cursor + elevación
     --------------------------------------------------------- */
  function tarjetasVivas() {
    var tarjetas = document.querySelectorAll(
      ".tarjeta, .producto-card, .dato, .razon, .login-beneficio-item, .galeria-card"
    );
    tarjetas.forEach(function (t) {
      t.classList.add("din-luz", "din-flota");
    });
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
          !img.closest("a")
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

    function abrir(i) {
      mostrar(i);
      caja.classList.add("abierto");
      document.body.style.overflow = "hidden";
    }
    function cerrar() {
      caja.classList.remove("abierto");
      document.body.style.overflow = "";
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
    var badges = document.querySelectorAll(".badge-abierto");
    if (!badges.length) return;

    function estado() {
      var ahora = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Lima" })
      );
      var dia = ahora.getDay(); // 0 domingo
      var minutos = ahora.getHours() * 60 + ahora.getMinutes();
      var abierto = dia >= 1 && dia <= 6 && minutos >= 510 && minutos < 1200;
      return { abierto: abierto, dia: dia, minutos: minutos };
    }

    function pintar() {
      var e = estado();
      badges.forEach(function (b) {
        var punto = b.querySelector(".punto");
        var texto = e.abierto
          ? "Abierto ahora · Lun–Sáb 8:30–20:00"
          : e.dia === 0
          ? "Cerrado hoy · Abrimos lunes 8:30 a.m."
          : e.minutos < 510
          ? "Cerrado · Abrimos hoy a las 8:30 a.m."
          : "Cerrado · Abrimos mañana a las 8:30 a.m.";
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
     9. Toast genérico reutilizable: window.PelitosAviso("...")
     --------------------------------------------------------- */
  function toast() {
    var el = document.createElement("div");
    el.className = "din-toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
    var tmp = null;
    window.PelitosAviso = function (msg) {
      el.textContent = String(msg || "");
      el.classList.add("visible");
      window.clearTimeout(tmp);
      tmp = window.setTimeout(function () {
        el.classList.remove("visible");
      }, 3200);
    };
  }

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

  /* --------------------------------------------------------- */
  listo(function () {
    try { barraProgreso(); } catch (e) {}
    try { revelados(); } catch (e) {}
    try { tarjetasVivas(); } catch (e) {}
    try { ripple(); } catch (e) {}
    try { volverArriba(); } catch (e) {}
    try { parallax(); } catch (e) {}
    try { lightbox(); } catch (e) {}
    try { horarioEnVivo(); } catch (e) {}
    try { toast(); } catch (e) {}
    try { scrollspy(); } catch (e) {}
    try { ticker(); } catch (e) {}
    try { filtrosGenericos(); } catch (e) {}
    try { plegables(); } catch (e) {}
  });
})();
