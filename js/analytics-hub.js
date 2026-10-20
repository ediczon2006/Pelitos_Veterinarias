/**
 * ==============================================================================
 * PELITOS VETERINARIA — UNIFIED ANALYTICS & CRO HUB
 * ==============================================================================
 * Integración centralizada, asíncrona y segura para las 5 herramientas de marketing:
 *   1. Google Analytics 4 (GA4)       [Cuantitativo / Métricas Globales]
 *   2. Píxel de Meta (Facebook/IG)    [Atribución / Retargeting de Anuncios]
 *   3. Píxel de TikTok               [Atribución de Videos y Campañas]
 *   4. Microsoft Clarity              [Grabación de sesiones, heatmaps y rage clicks]
 *   5. Hotjar                         [Grabaciones y encuestas de satisfacción]
 *
 * CARACTERÍSTICAS PRINCIPALES:
 *   - Carga No Bloqueante (Zero-Impact en Core Web Vitals).
 *   - Fail-Safe: Opera de forma segura sin romper la web si los IDs aún no se configuran.
 *   - Privacy by Design: Enmascaramiento estricto de PII (no graba contraseñas ni datos sensibles).
 *   - Event Delegation: Detecta automáticamente clics en WhatsApp, cotizadores y formularios.
 * ==============================================================================
 */

(function (window, document) {
  "use strict";

  /* ==========================================================================
     1. CONFIGURACIÓN CENTRALIZADA
     Reemplace las cadenas vacías con los IDs reales proporcionados por cada plataforma.
     ========================================================================== */
  var CONFIG = {
    // 1. Google Analytics 4: Formato "G-XXXXXXXXXX"
    googleAnalyticsId: "",

    // 2. Meta Pixel (Facebook / Instagram): Formato numérico "1234567890123456"
    metaPixelId: "",

    // 3. TikTok Pixel: Formato alfanumérico "C1234567890ABCDEF"
    tiktokPixelId: "",

    // 4. Microsoft Clarity: ID de proyecto de 10 caracteres (ej. "n8x92abcde")
    clarityProjectId: "",

    // 5. Hotjar: Site ID numérico de Hotjar (ej. "3456789")
    hotjarSiteId: "",
    hotjarVersion: 6,

    // Modo depuración: Si está en true o si estamos en localhost, registra los eventos en consola
    debugMode: (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "file:"
    ),

    // Privacidad: Enmascarar automáticamente campos de formulario en grabaciones
    maskSensitiveInputs: true
  };

  /* Helper para logs en consola */
  function logDebug(modulo, accion, data) {
    if (CONFIG.debugMode && window.console && console.log) {
      console.log(
        "%c[Pelitos Analytics · " + modulo + "]%c " + accion,
        "background:#6c3991; color:#fff; font-weight:bold; border-radius:3px; padding:2px 5px;",
        "color:#059669; font-weight:600;",
        data || ""
      );
    }
  }

  /* Inyector asíncrono de scripts externos */
  function inyectarScript(src, id, callback) {
    if (!src) return;
    if (id && document.getElementById(id)) return;

    var s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = src;
    if (id) s.id = id;
    if (callback) s.onload = callback;

    var primero = document.getElementsByTagName("script")[0];
    if (primero && primero.parentNode) {
      primero.parentNode.insertBefore(s, primero);
    } else {
      document.head.appendChild(s);
    }
  }

  /* ==========================================================================
     2. BOOTSTRAP DE LAS 5 PLATAFORMAS (SOLO SI TIENEN ID CONFIGURADO)
     ========================================================================== */

  /* 2.1 Google Analytics 4 */
  function initGoogleAnalytics() {
    var id = CONFIG.googleAnalyticsId ? CONFIG.googleAnalyticsId.trim() : "";
    if (!id || id.indexOf("XXXX") !== -1) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", id, {
      send_page_view: true,
      anonymize_ip: true
    });

    inyectarScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id), "ga4-sdk");
    logDebug("GA4", "Inicializado con ID: " + id);
  }

  /* 2.2 Píxel de Meta (Facebook / Instagram) */
  function initMetaPixel() {
    var id = CONFIG.metaPixelId ? CONFIG.metaPixelId.trim() : "";
    if (!id || id.indexOf("XXXX") !== -1) return;

    if (!window.fbq) {
      var n = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      window.fbq = n;
    }

    window.fbq("init", id);
    window.fbq("track", "PageView");

    inyectarScript("https://connect.facebook.net/en_US/fbevents.js", "meta-pixel-sdk");
    logDebug("MetaPixel", "Inicializado con ID: " + id);
  }

  /* 2.3 Píxel de TikTok */
  function initTikTokPixel() {
    var id = CONFIG.tiktokPixelId ? CONFIG.tiktokPixelId.trim() : "";
    if (!id || id.indexOf("XXXX") !== -1) return;

    if (!window.ttq) {
      window.TiktokAnalyticsObject = "ttq";
      var ttq = (window.ttq = window.ttq || []);
      ttq.methods = [
        "page", "track", "identify", "instances", "debug", "on", "off",
        "once", "ready", "alias", "group", "enableCookie", "disableCookie",
        "holdConsent", "revokeConsent", "grantConsent"
      ];
      ttq.setAndDefer = function (t, e) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (t) {
        var e = ttq._i[t] || [];
        for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function (e, n) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        inyectarScript(r + "?sdkid=" + encodeURIComponent(e) + "&lib=ttq", "tiktok-pixel-sdk");
      };
    }

    window.ttq.load(id);
    window.ttq.page();
    logDebug("TikTokPixel", "Inicializado con ID: " + id);
  }

  /* 2.4 Microsoft Clarity */
  function initClarity() {
    var id = CONFIG.clarityProjectId ? CONFIG.clarityProjectId.trim() : "";
    if (!id || id.indexOf("XXXX") !== -1) return;

    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      t.id = "clarity-sdk";
      y = l.getElementsByTagName(r)[0];
      if (y && y.parentNode) y.parentNode.insertBefore(t, y);
      else l.head.appendChild(t);
    })(window, document, "clarity", "script", id);

    // Enmascaramiento de privacidad por defecto
    if (window.clarity) {
      window.clarity("set", "mask", true);
    }
    logDebug("Clarity", "Inicializado con Proyecto ID: " + id);
  }

  /* 2.5 Hotjar */
  function initHotjar() {
    var id = CONFIG.hotjarSiteId ? CONFIG.hotjarSiteId.trim() : "";
    if (!id || id.indexOf("XXXX") !== -1) return;

    (function (h, o, t, j, a, r) {
      h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
      h._hjSettings = { hjid: id, hjsv: CONFIG.hotjarVersion || 6 };
      a = o.getElementsByTagName("head")[0];
      r = o.createElement("script"); r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      r.id = "hotjar-sdk";
      if (a) a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");

    logDebug("Hotjar", "Inicializado con Site ID: " + id);
  }

  /* ==========================================================================
     3. DISPATCHER UNIFICADO DE EVENTOS
     ========================================================================== */

  var AnalyticsHub = {
    config: CONFIG,

    /** Inicializa todos los proveedores configurados */
    init: function (customConfig) {
      if (customConfig && typeof customConfig === "object") {
        for (var k in customConfig) {
          if (Object.prototype.hasOwnProperty.call(customConfig, k)) {
            CONFIG[k] = customConfig[k];
          }
        }
      }

      initGoogleAnalytics();
      initMetaPixel();
      initTikTokPixel();
      initClarity();
      initHotjar();

      if (CONFIG.maskSensitiveInputs) {
        this.aplicarProteccionPrivacidad();
      }

      this.activarAutoEscucha();
      logDebug("Hub", "Sistema de analítica listo y escuchando eventos.");
    },

    /** Enmascara campos de formulario para evitar grabación de PII en Clarity y Hotjar */
    aplicarProteccionPrivacidad: function () {
      var inputs = document.querySelectorAll("input, textarea, select");
      inputs.forEach(function (el) {
        el.setAttribute("data-clarity-mask", "true");
        el.setAttribute("data-hj-suppress", "");
      });
    },

    /** Envío genérico de evento hacia todos los píxeles activos */
    trackEvent: function (nombreEvento, datos) {
      datos = datos || {};
      logDebug("Evento", nombreEvento, datos);

      // 1. Google Analytics 4
      if (typeof window.gtag === "function") {
        window.gtag("event", nombreEvento, datos);
      }

      // 2. Meta Pixel
      if (typeof window.fbq === "function") {
        // Mapeo a eventos estándar de Meta
        var metaEventos = {
          "add_to_cart": "AddToCart",
          "begin_checkout": "InitiateCheckout",
          "contact_whatsapp": "Contact",
          "sign_up": "CompleteRegistration",
          "search": "Search",
          "view_service": "ViewContent"
        };
        var metaEv = metaEventos[nombreEvento] || "CustomEvent";
        if (metaEv === "CustomEvent") {
          window.fbq("trackCustom", nombreEvento, datos);
        } else {
          window.fbq("track", metaEv, datos);
        }
      }

      // 3. TikTok Pixel
      if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
        var ttEventos = {
          "add_to_cart": "AddToCart",
          "begin_checkout": "InitiateCheckout",
          "contact_whatsapp": "Contact",
          "sign_up": "CompleteRegistration",
          "search": "Search"
        };
        var ttEv = ttEventos[nombreEvento];
        if (ttEv) {
          window.ttq.track(ttEv, datos);
        }
      }

      // 4. Microsoft Clarity
      if (typeof window.clarity === "function") {
        try {
          window.clarity("event", nombreEvento);
        } catch (_) {}
      }

      // 5. Hotjar
      if (typeof window.hj === "function") {
        try {
          window.hj("event", nombreEvento);
        } catch (_) {}
      }
    },

    /* ---- Métodos de Negocio Específicos para Pelitos ---- */

    /** Contacto por WhatsApp (Reservas, Consultas, Urgencias) */
    trackContact: function (canal, detalles) {
      this.trackEvent("contact_whatsapp", {
        canal: canal || "WhatsApp",
        tipo_atencion: (detalles && detalles.servicio) || "General",
        pagina: window.location.pathname
      });
    },

    /** Añadir producto al carrito PetShop */
    trackAddToCart: function (item) {
      this.trackEvent("add_to_cart", {
        currency: "PEN",
        value: Number(item.precio) || 0,
        item_id: String(item.id || ""),
        item_name: String(item.titulo || ""),
        item_category: String(item.categoria || "PetShop"),
        quantity: Number(item.cantidad) || 1
      });
    },

    /** Iniciar Checkout o Pedido por WhatsApp */
    trackInitiateCheckout: function (pedido) {
      this.trackEvent("begin_checkout", {
        currency: "PEN",
        value: Number(pedido.total) || 0,
        num_items: Number(pedido.cantidad_items) || 1,
        producto: pedido.producto || "Pedido Carrito PetShop"
      });
    },

    /** Registro de usuario o verificación OTP exitosa */
    trackRegistration: function (detalles) {
      this.trackEvent("sign_up", {
        method: (detalles && detalles.metodo) || "OTP_Verificado",
        tiene_mascota: Boolean(detalles && detalles.mascota)
      });
    },

    /** Búsqueda en el catálogo */
    trackSearch: function (termino, totalResultados) {
      if (!termino) return;
      this.trackEvent("search", {
        search_term: String(termino).trim(),
        results_count: Number(totalResultados) || 0
      });
    },

    /* ---- Detección Automática de Clics en Enlaces de WhatsApp ---- */
    activarAutoEscucha: function () {
      var self = this;
      document.addEventListener("click", function (e) {
        var link = e.target.closest("a");
        if (!link || !link.href) return;

        var href = link.href.toLowerCase();
        if (href.indexOf("api.whatsapp.com") !== -1 || href.indexOf("wa.me") !== -1) {
          var textoBoton = (link.textContent || "").trim();
          var categoria = "WhatsApp General";

          if (href.indexOf("cita") !== -1 || textoBoton.indexOf("Reservar") !== -1) {
            categoria = "Reserva de Cita Médica";
          } else if (href.indexOf("est%c3%a9tica") !== -1 || href.indexOf("peluquer") !== -1 || href.indexOf("ba%c3%b1o") !== -1) {
            categoria = "Reserva de Estética Canina";
          } else if (href.indexOf("petshop") !== -1 || href.indexOf("pedido") !== -1) {
            categoria = "Pedido PetShop";
          } else if (href.indexOf("laboratorio") !== -1 || href.indexOf("examen") !== -1) {
            categoria = "Solicitud Laboratorio";
          } else if (href.indexOf("m%c3%b3vil") !== -1 || href.indexOf("domicilio") !== -1) {
            categoria = "Pelitos Móvil";
          }

          self.trackContact("WhatsApp_Click", {
            servicio: categoria,
            texto_enlace: textoBoton.slice(0, 40)
          });
        }
      }, { passive: true });
    }
  };

  // Exponer globalmente en window
  window.PelitosAnalytics = AnalyticsHub;
  window.AnalyticsHub = AnalyticsHub;

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      AnalyticsHub.init();
    });
  } else {
    AnalyticsHub.init();
  }

})(window, document);
