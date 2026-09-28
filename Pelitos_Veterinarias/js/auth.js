/* =========================================================
   auth.js — Portal de clientes de Pelitos Veterinaria
   Demostración funcional sin backend: la sesión se guarda
   solo en memoria (no se usa almacenamiento del navegador).
   ========================================================= */
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
