/* ==========================================================================
   TESTIMONIOS DE CLIENTES
   Permite que cualquier visitante deje su reseña desde la propia página.

   Cómo funciona
   -------------
   · Las reseñas que escriben los clientes se quedan en su propia pantalla
     mientras la pestaña esté abierta: el visitante ve la suya al instante,
     pero no viaja a ningún servidor.
   · Para que la reseña llegue a Pelitos, después de publicarla aparece el botón
     "Enviar mi reseña a Pelitos" que la manda por WhatsApp ya redactada.
   · Para que la vea TODO EL MUNDO, se copia en js/resenas-publicadas.js. Ese
     archivo se pinta para todos los visitantes (moderación manual, sin spam).
   · La reseña no sobrevive a recargar la página, y eso es a propósito: así la
     web funciona igual en modo incógnito y dentro de vistas previas. El
     circuito bueno es el de WhatsApp, que sí llega a Pelitos.
   · Todo el texto se escapa antes de pintarlo, así que nadie puede inyectar
     HTML desde el formulario.
   ========================================================================== */

(function () {
  "use strict";


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

  /* Almacenamiento: la resena vive en esta variable mientras la pestana este
     abierta. No se usa el almacen permanente del navegador por dos razones: el
     resto de la web tampoco lo usa (ver "Almacenamiento en memoria de la
     sesion" en js/main.js) y en las vistas previas incrustadas esta bloqueado,
     lo que hacia fallar la pagina entera.

     Si algun dia quiere que la resena sobreviva a recargar la pagina, un
     programador puede cambiar las dos funciones de abajo para que lean y
     escriban en el almacen del navegador, siempre dentro de un try/catch. */
  var enMemoria = [];

  function leer() {
    return Array.isArray(enMemoria) ? enMemoria.filter(valida) : [];
  }

  function escribir(lista) {
    enMemoria = Array.isArray(lista) ? lista : [];
    return false; // false = "no sobrevive a recargar la pagina"
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

  function tarjetaHTML(t, publicada) {
    var mascota = t.mascota ? " &middot; " + esc(t.mascota) : "";
    var pie = publicada
      ? "Reseña de cliente" + (t.fecha ? " &middot; " + esc(fechaCorta(t.fecha)) : "")
      : "Reseña desde la web &middot; " + esc(fechaRelativa(t.fecha));
    return (
      '<article class="testimonio ' +
      (publicada ? "testimonio--publicada" : "testimonio--cliente") +
      '" data-id="' +
      esc(t.id || "") +
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
      '<div class="testimonio__fecha">' +
      pie +
      "</div>" +
      "</div>" +
      "</div>" +
      (publicada
        ? ""
        : '<button type="button" class="testimonio__borrar" data-borrar="' +
          esc(t.id) +
          '" aria-label="Borrar mi reseña">Borrar mi reseña</button>') +
      "</article>"
    );
  }

  /** "2026-09-17" → "17 de setiembre de 2026" (si no se puede, devuelve tal cual) */
  function fechaCorta(valor) {
    var MESES = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"
    ];
    var m = String(valor || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(valor || "");
    var mes = MESES[Number(m[2]) - 1];
    if (!mes) return String(valor);
    return Number(m[3]) + " de " + mes + " de " + m[1];
  }

  /** Reseñas aprobadas por el negocio: las ve todo el mundo. */
  function pintarPublicadas(contenedor) {
    var lista = window.PELITOS_RESENAS_PUBLICADAS;
    if (!Array.isArray(lista) || !lista.length) return;
    var limpias = lista
      .filter(function (r) {
        return r && String(r.nombre || "").trim() && String(r.texto || "").trim();
      })
      .map(function (r) {
        return {
          nombre: String(r.nombre).trim().slice(0, MAX_NOMBRE),
          mascota: r.mascota ? String(r.mascota).trim().slice(0, 30) : "",
          texto: String(r.texto).trim().slice(0, MAX_TEXTO),
          estrellas: Math.min(5, Math.max(1, Number(r.estrellas) || 5)),
          fecha: r.fecha || ""
        };
      });
    if (!limpias.length) return;
    contenedor.insertAdjacentHTML(
      "afterbegin",
      limpias
        .map(function (r) {
          return tarjetaHTML(r, true);
        })
        .join("")
    );
  }

  /** Arma el enlace de WhatsApp con la reseña ya redactada. */
  function enlaceWhatsApp(resena) {
    var texto =
      "Hola Pelitos, dejé una reseña en la web y quiero que la publiquen:\n\n" +
      "Nombre: " + resena.nombre + "\n" +
      (resena.mascota ? "Mascota: " + resena.mascota + "\n" : "") +
      "Calificación: " + resena.estrellas + " de 5\n" +
      "Reseña: " + resena.texto;
    return (
      "https://api.whatsapp.com/send?phone=51939356376&text=" +
      encodeURIComponent(texto)
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
    var html = lista
      .map(function (t) {
        return tarjetaHTML(t, false);
      })
      .join("");
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
        // Solo se enlaza si el aviso tiene id; si no, un aria-describedby
        // vacío confunde al lector de pantalla.
        if (aviso.id) campo.setAttribute("aria-describedby", aviso.id);
      }
    } else {
      campo.removeAttribute("aria-invalid");
      if (aviso) {
        aviso.textContent = "";
        aviso.hidden = true;
      }
    }
  }

  /* Deja el selector de estrellas en el valor del campo oculto, sin tocar
     los eventos. Se usa después de enviar una reseña. */
  function reiniciarEstrellas(form) {
    var oculto = form.querySelector('[name="estrellas"]');
    if (!oculto) return;
    oculto.value = oculto.value || "5";
    var valor = Number(oculto.value) || 5;
    Array.prototype.forEach.call(form.querySelectorAll("[data-estrella]"), function (b) {
      var v = Number(b.getAttribute("data-estrella"));
      b.classList.toggle("es-activa", v <= valor);
      b.setAttribute("aria-checked", v === valor ? "true" : "false");
      b.tabIndex = v === valor ? 0 : -1;
    });
  }

  /* Vuelve a pintar el contador de caracteres sin conectar otro evento. */
  function refrescarContador(form) {
    var area = form.querySelector('[name="texto"]');
    var salida = form.querySelector("[data-contador]");
    if (!area || !salida) return;
    var n = area.value.trim().length;
    salida.textContent = n + " / " + MAX_TEXTO;
    salida.classList.toggle("es-corto", n > 0 && n < MIN_TEXTO);
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

  /* La tarjeta de "todavía no hay reseñas" solo debe verse cuando de verdad no
     hay ninguna. En cuanto aparece una, se esconde; si se borran todas, vuelve.
     Así el hueco de la página nunca queda vacío ni sobra la tarjeta. */
  function ajustarEspera(contenedor) {
    var espera = contenedor.querySelector("[data-testimonio-espera]");
    if (!espera) return;
    var hay = contenedor.querySelector(
      ".testimonio--cliente, .testimonio--publicada"
    );
    espera.hidden = !!hay;
  }

  function iniciar() {
    var contenedor = document.querySelector("[data-lista-testimonios]");
    var form = document.querySelector("[data-form-testimonio]");
    if (!contenedor) return;

    pintarPublicadas(contenedor);

    var lista = leer();
    pintar(lista, contenedor);
    ajustarEspera(contenedor);

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
      ajustarEspera(contenedor);
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
      escribir(lista);
      pintar(lista, contenedor);
      ajustarEspera(contenedor);

      // Se limpia el formulario y se vuelven a poner las 5 estrellas y el
      // contador en cero SIN volver a conectar los eventos: si se conectaran
      // otra vez, cada reseña enviada dejaría un listener extra pegado a cada
      // estrella (fuga de memoria y clics contados varias veces).
      form.reset();
      reiniciarEstrellas(form);
      refrescarContador(form);

      avisar(
        "¡Gracias! Tu reseña ya aparece arriba. Mándanosla por WhatsApp para que la publiquemos para todos."
      );

      // El cliente puede mandarnos su reseña por WhatsApp para que la
      // publiquemos en la web para todo el mundo.
      var envio = document.querySelector("[data-enviar-resena]");
      if (envio) {
        var enlace = envio.querySelector("a");
        if (enlace) enlace.href = enlaceWhatsApp(nueva);
        envio.hidden = false;
      }

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

   Mientras no haya servidor, el circuito que ya funciona es:
   cliente publica → le sale el botón de WhatsApp → la reseña llega a Pelitos →
   se copia en js/resenas-publicadas.js → la ve todo el mundo.
   -------------------------------------------------------------------------- */
