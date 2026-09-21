/* =========================================================
   Pelitos Veterinaria — Capa de dinamismo (dinamico.js)
   Se carga en todas las páginas después de main.js.
   No depende de librerías externas y no rompe nada si algo
   no existe en la página: cada bloque comprueba antes de actuar.
   ========================================================= */
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
