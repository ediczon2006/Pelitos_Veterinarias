/* ==========================================================================
   TESTIMONIOS DE CLIENTES
   Permite que cualquier visitante deje su reseña desde la propia página.

   Cómo funciona
   -------------
   · Las reseñas que escriben los clientes se guardan en el navegador de cada
     persona (localStorage). Es decir: cada visitante ve las suyas junto a las
     reseñas de ejemplo, pero NO viajan a un servidor ni las ve el resto de la
     gente. Para que sean públicas de verdad hace falta un backend o un
     formulario externo (Google Forms, Formspree, Sheets…). Ver nota al final.
   · Si el navegador bloquea el almacenamiento (modo incógnito estricto o una
     vista previa incrustada) la reseña se muestra igual durante la visita y no
     se rompe nada: solo no sobrevive a recargar la página.
   · Todo el texto se escapa antes de pintarlo, así que nadie puede inyectar
     HTML desde el formulario.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "pelitos:testimonios:v1";
  var MAX_GUARDADOS = 30;
  var MIN_TEXTO = 25;
  var MAX_TEXTO = 400;
  var MAX_NOMBRE = 40;

  /* ---------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------- */

  function esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Almacenamiento con red de seguridad: si localStorage falla se usa una
     variable en memoria y la página sigue funcionando. */
  var enMemoria = null;

  function leer() {
    try {
      var bruto = window.localStorage.getItem(CLAVE);
      if (!bruto) return [];
      var lista = JSON.parse(bruto);
      return Array.isArray(lista) ? lista.filter(valida) : [];
    } catch (e) {
      return Array.isArray(enMemoria) ? enMemoria : [];
    }
  }

  function escribir(lista) {
    enMemoria = lista;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false; // se conserva solo en memoria
    }
  }

  /* Descarta entradas corruptas o de versiones antiguas. */
  function valida(t) {
    return (
      t &&
      typeof t === "object" &&
      typeof t.nombre === "string" &&
      typeof t.texto === "string" &&
      t.nombre.trim() !== "" &&
      t.texto.trim() !== ""
    );
  }

  function iniciales(nombre) {
    var partes = String(nombre).trim().split(/\s+/).slice(0, 2);
    var txt = partes
      .map(function (p) {
        return p.charAt(0);
      })
      .join("");
    return (txt || "?").toUpperCase();
  }

  function fechaRelativa(iso) {
    var t = Date.parse(iso);
    if (!Number.isFinite(t)) return "recién publicado";
    var dias = Math.floor((Date.now() - t) / 86400000);
    if (dias <= 0) return "hoy";
    if (dias === 1) return "ayer";
    if (dias < 30) return "hace " + dias + " días";
    var meses = Math.floor(dias / 30);
    return meses === 1 ? "hace 1 mes" : "hace " + meses + " meses";
  }

  function avisar(mensaje) {
    if (typeof window.PelitosAviso === "function") {
      window.PelitosAviso(mensaje);
      return;
    }
    var caja = document.querySelector("[data-aviso-testimonio]");
    if (caja) {
      caja.textContent = mensaje;
      caja.hidden = false;
    }
  }

  /* ---------------------------------------------------------------
     Pintado
     --------------------------------------------------------------- */

  var ESTRELLA =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  function estrellasHTML(n) {
    var total = Math.min(5, Math.max(1, Number(n) || 5));
    var html = "";
    for (var i = 0; i < total; i++) html += ESTRELLA;
    return html;
  }

  function tarjetaHTML(t) {
    var mascota = t.mascota ? " &middot; " + esc(t.mascota) : "";
    return (
      '<article class="testimonio testimonio--cliente" data-id="' +
      esc(t.id) +
      '">' +
      '<div class="testimonio__estrellas" aria-label="' +
      (Number(t.estrellas) || 5) +
      ' de 5 estrellas">' +
      estrellasHTML(t.estrellas) +
      "</div>" +
      '<p class="testimonio__texto">' +
      esc(t.texto) +
      "</p>" +
      '<div class="testimonio__autor">' +
      '<div class="testimonio__avatar">' +
      esc(iniciales(t.nombre)) +
      "</div>" +
      "<div>" +
      '<div class="testimonio__nombre">' +
      esc(t.nombre) +
      mascota +
      "</div>" +
      '<div class="testimonio__fecha">Reseña desde la web &middot; ' +
      esc(fechaRelativa(t.fecha)) +
      "</div>" +
      "</div>" +
      "</div>" +
      '<button type="button" class="testimonio__borrar" data-borrar="' +
      esc(t.id) +
      '" aria-label="Borrar mi reseña">Borrar mi reseña</button>' +
      "</article>"
    );
  }

  function pintar(lista, contenedor) {
    // Se eliminan las tarjetas de clientes ya pintadas y se vuelven a poner
    // al principio de la rejilla, de la más nueva a la más antigua.
    Array.prototype.forEach.call(
      contenedor.querySelectorAll(".testimonio--cliente"),
      function (el) {
        el.remove();
      }
    );
    if (!lista.length) return;
    var html = lista.map(tarjetaHTML).join("");
    contenedor.insertAdjacentHTML("afterbegin", html);
  }

  /* ---------------------------------------------------------------
     Formulario
     --------------------------------------------------------------- */

  function marcarError(campo, mensaje) {
    var grupo = campo.closest(".campo") || campo.parentElement;
    var aviso = grupo ? grupo.querySelector("[data-error]") : null;
    if (mensaje) {
      campo.setAttribute("aria-invalid", "true");
      if (aviso) {
        aviso.textContent = mensaje;
        aviso.hidden = false;
        campo.setAttribute("aria-describedby", aviso.id || "");
      }
    } else {
      campo.removeAttribute("aria-invalid");
      if (aviso) {
        aviso.textContent = "";
        aviso.hidden = true;
      }
    }
  }

  function conectarEstrellas(form) {
    var oculto = form.querySelector('[name="estrellas"]');
    var botones = Array.prototype.slice.call(
      form.querySelectorAll("[data-estrella]")
    );
    if (!oculto || !botones.length) return;

    function pintarEstado(valor) {
      botones.forEach(function (b) {
        var v = Number(b.getAttribute("data-estrella"));
        b.classList.toggle("es-activa", v <= valor);
        b.setAttribute("aria-checked", v === valor ? "true" : "false");
        b.tabIndex = v === valor ? 0 : -1;
      });
      oculto.value = String(valor);
    }

    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        pintarEstado(Number(b.getAttribute("data-estrella")));
      });
      b.addEventListener("keydown", function (ev) {
        var actual = Number(oculto.value) || 5;
        if (ev.key === "ArrowRight" || ev.key === "ArrowUp") {
          ev.preventDefault();
          pintarEstado(Math.min(5, actual + 1));
          form.querySelector('[data-estrella="' + Math.min(5, actual + 1) + '"]').focus();
        } else if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") {
          ev.preventDefault();
          pintarEstado(Math.max(1, actual - 1));
          form.querySelector('[data-estrella="' + Math.max(1, actual - 1) + '"]').focus();
        }
      });
    });

    pintarEstado(Number(oculto.value) || 5);
  }

  function contador(form) {
    var area = form.querySelector('[name="texto"]');
    var salida = form.querySelector("[data-contador]");
    if (!area || !salida) return;
    function refrescar() {
      var n = area.value.trim().length;
      salida.textContent = n + " / " + MAX_TEXTO;
      salida.classList.toggle("es-corto", n > 0 && n < MIN_TEXTO);
    }
    area.addEventListener("input", refrescar);
    refrescar();
  }

  function iniciar() {
    var contenedor = document.querySelector("[data-lista-testimonios]");
    var form = document.querySelector("[data-form-testimonio]");
    if (!contenedor) return;

    var lista = leer();
    pintar(lista, contenedor);

    // Borrar la propia reseña (solo afecta a este navegador).
    contenedor.addEventListener("click", function (ev) {
      var boton = ev.target.closest("[data-borrar]");
      if (!boton) return;
      var id = boton.getAttribute("data-borrar");
      lista = lista.filter(function (t) {
        return t.id !== id;
      });
      escribir(lista);
      pintar(lista, contenedor);
      avisar("Reseña borrada.");
    });

    if (!form) return;
    conectarEstrellas(form);
    contador(form);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      var nombre = form.querySelector('[name="nombre"]');
      var mascota = form.querySelector('[name="mascota"]');
      var texto = form.querySelector('[name="texto"]');
      var estrellas = form.querySelector('[name="estrellas"]');

      var hayError = false;

      var valNombre = nombre.value.trim().slice(0, MAX_NOMBRE);
      if (valNombre.length < 2) {
        marcarError(nombre, "Escribe tu nombre (mínimo 2 letras).");
        hayError = true;
      } else {
        marcarError(nombre, "");
      }

      var valTexto = texto.value.trim().slice(0, MAX_TEXTO);
      if (valTexto.length < MIN_TEXTO) {
        marcarError(
          texto,
          "Cuéntanos un poco más: al menos " + MIN_TEXTO + " caracteres."
        );
        hayError = true;
      } else {
        marcarError(texto, "");
      }

      if (hayError) {
        var primero = form.querySelector('[aria-invalid="true"]');
        if (primero) primero.focus();
        return;
      }

      var nueva = {
        id: "t" + Date.now() + Math.random().toString(36).slice(2, 6),
        nombre: valNombre,
        mascota: mascota ? mascota.value.trim().slice(0, 30) : "",
        texto: valTexto,
        estrellas: Math.min(5, Math.max(1, Number(estrellas && estrellas.value) || 5)),
        fecha: new Date().toISOString()
      };

      lista = [nueva].concat(lista).slice(0, MAX_GUARDADOS);
      var guardado = escribir(lista);
      pintar(lista, contenedor);

      form.reset();
      conectarEstrellas(form);
      contador(form);

      avisar(
        guardado
          ? "¡Gracias! Tu reseña ya aparece arriba."
          : "¡Gracias! Tu reseña se muestra ahora, pero este navegador no permite guardarla."
      );

      var nuevaTarjeta = contenedor.querySelector(".testimonio--cliente");
      if (nuevaTarjeta && nuevaTarjeta.scrollIntoView) {
        nuevaTarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();

/* --------------------------------------------------------------------------
   PARA QUE LAS RESEÑAS SEAN PÚBLICAS (opcional, requiere un servicio externo)
   --------------------------------------------------------------------------
   Este módulo guarda las reseñas en el navegador de cada visitante. Si quieres
   recibirlas tú y publicarlas para todo el mundo, la forma más rápida sin
   servidor propio es enviar el mismo objeto a un endpoint:

     fetch("https://TU-ENDPOINT", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(nueva)
     });

   Sirve Formspree, Google Apps Script sobre una hoja de cálculo, Airtable o
   Supabase. Recuerda moderar antes de publicar: un formulario abierto en
   internet recibe spam.
   -------------------------------------------------------------------------- */
