/* =========================================================
   Pelitos Veterinaria — PetShop (catálogo, carrito, fichas)
   ---------------------------------------------------------
   Requiere, en este orden:
     1. js/main.js      → SITE, enlaceWhatsapp(), abrirExterno()
     2. js/catalogo.js  → window.PELITOS_CATALOGO
     3. este archivo

   Decisiones de implementación:
   · Los importes se manejan en CÉNTIMOS (enteros) para evitar
     los errores de redondeo de los flotantes (0.1 + 0.2).
   · No se usan atributos onclick/onerror en el HTML generado:
     todo va por delegación de eventos, así la página sigue
     funcionando con una Content-Security-Policy estricta.
   · Todo texto que proviene de datos se escapa antes de
     insertarse como HTML.
   ========================================================= */

(function () {
  "use strict";

  // =========================================================
  // 0. Configuración y utilidades
  // =========================================================

  var CATALOGO = window.PELITOS_CATALOGO;
  if (!CATALOGO || !Array.isArray(CATALOGO.productos)) {
    console.error("[PetShop] No se encontró js/catalogo.js. Revisa el orden de los <script>.");
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
   * manda el precio escrito en js/catalogo.js.
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
    var a = ajustes[producto.id];
    return a && a.base !== undefined ? a.base : aCentimos(producto.precio);
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

  /* ---- Oferta: precio regular tachado y % de descuento ----
     Un producto está en oferta si su ficha de js/catalogo.js
     incluye "precioAntes" mayor que el precio publicado. */
  function enOferta(producto) {
    return (
      Number(producto.precioAntes) > 0 &&
      aCentimos(producto.precioAntes) > precioBase(producto)
    );
  }

  /** Diferencia en céntimos entre el precio regular y el de oferta. */
  function deltaOferta(producto) {
    if (!enOferta(producto)) return 0;
    return aCentimos(producto.precioAntes) - precioBase(producto);
  }

  function porcentajeOferta(producto) {
    if (!enOferta(producto)) return 0;
    var antes = aCentimos(producto.precioAntes);
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
  // 5. Catálogo: render, filtros y buscador
  // =========================================================

  var rejilla = document.getElementById("contenedor-productos");
  var filtroActual = "todos";
  var terminoBusqueda = "";

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
    return partes.join(" ").toLowerCase();
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

    var btnFicha = p.ficha
      ? '<button type="button" class="btn-ver-contenido" data-accion="abrir-ficha" data-id="' +
        esc(p.id) +
        '">Ver contenido e ingredientes</button>'
      : "";

    return (
      '<article class="producto-card">' +
      '<div class="producto-card__img-wrap">' +
      (enOferta(p)
        ? '<span class="cinta-oferta">🔥 Oferta S/ ' +
          (precioBase(p) / 100).toFixed(0) +
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
          terminoBusqueda = buscador.value.trim().toLowerCase();
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
   * de precios y exportarla a js/catalogo.js, que es la fuente real.
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
    var guardado = escribirJSON(CLAVE_PRECIOS, ajustes);

    renderCatalogo();
    refrescarDestacado();
    refrescarPrecioModal();
    renderCarrito();

    avisar(
      guardado
        ? "Precios aplicados y recordados en este navegador."
        : "Precios aplicados, pero este navegador no permite guardarlos."
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
    avisar("Precios restablecidos a los valores de js/catalogo.js.");
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
