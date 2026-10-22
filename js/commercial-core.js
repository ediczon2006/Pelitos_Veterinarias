/**
 * @file commercial-core.js
 * @module PelitosCommercialCore
 * @description Domain Engine, Strict Type Contracts, Integer-Cents Financial Calculus,
 * and Deterministic Multi-Channel Routing for Pelitos Veterinaria (Huánuco, Perú).
 * 
 * Standards:
 * - IEEE 754 Floating-Point Immunity (100% Integer Minor Unit Math).
 * - Zero Trust Cart Integrity Verification (Anti-tampering).
 * - Strict Separation of Concerns (Domain Core independent of UI).
 */

(function (global) {
  "use strict";

  // ============================================================================
  // 1. IMMUTABLE CONSTANTS & ROUTING CONFIGURATION (SINGLE SOURCE OF TRUTH)
  // ============================================================================
  var CHANNELS = Object.freeze({
    RECEPCION: Object.freeze({
      id: "recepcion",
      e164: "51927301122",
      formatted: "+51 927 301 122",
      owner: "Diego",
      role: "Atención General, Farmacia Veterinaria & PetShop"
    }),
    CONSULTORIO: Object.freeze({
      id: "consultorio",
      e164: "51939356376",
      formatted: "+51 939 356 376",
      owner: "Dra. Julia",
      role: "Consultorio Médico, Cirugía, Vacunación & Laboratorio"
    }),
    ESTETICA: Object.freeze({
      id: "estetica",
      e164: "51948426656",
      formatted: "+51 948 426 656",
      owner: "Antonella",
      role: "Peluquería Canina, Grooming, Deslanado & Spa Pelitos"
    })
  });

  var CURRENCY = Object.freeze({
    CODE: "PEN",
    SYMBOL: "S/",
    DECIMALS: 2
  });

  // ============================================================================
  // 2. VALUE OBJECT: MONEY (INTEGER CENTS MATHEMATICS)
  // ============================================================================
  function Money(cents) {
    if (!Number.isSafeInteger(cents)) {
      throw new TypeError("[Money] Amount must be a safe integer representing cents. Received: " + cents);
    }
    this._cents = cents;
  }

  Money.fromSoles = function (soles) {
    var n = Number(soles);
    if (!Number.isFinite(n)) {
      throw new TypeError("[Money.fromSoles] Invalid numeric input: " + soles);
    }
    return new Money(Math.round(n * 100));
  };

  Money.fromCents = function (cents) {
    return new Money(Math.trunc(cents));
  };

  Money.zero = function () {
    return new Money(0);
  };

  Money.prototype.getCents = function () {
    return this._cents;
  };

  Money.prototype.getSoles = function () {
    return this._cents / 100;
  };

  Money.prototype.add = function (other) {
    if (!(other instanceof Money)) throw new TypeError("[Money.add] Operand must be an instance of Money");
    return new Money(this._cents + other._cents);
  };

  Money.prototype.subtract = function (other) {
    if (!(other instanceof Money)) throw new TypeError("[Money.subtract] Operand must be an instance of Money");
    return new Money(Math.max(0, this._cents - other._cents));
  };

  Money.prototype.multiply = function (factor) {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new TypeError("[Money.multiply] Factor must be a positive finite number. Received: " + factor);
    }
    return new Money(Math.round(this._cents * factor));
  };

  Money.prototype.applyDiscountPercentage = function (percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new RangeError("[Money.applyDiscountPercentage] Percentage must be in range [0, 100]. Received: " + percentage);
    }
    var discountCents = Math.round((this._cents * percentage) / 100);
    return {
      discount: new Money(discountCents),
      final: new Money(this._cents - discountCents)
    };
  };

  Money.prototype.format = function () {
    return CURRENCY.SYMBOL + " " + (this._cents / 100).toFixed(CURRENCY.DECIMALS);
  };

  // ============================================================================
  // 3. DETERMINISTIC MULTI-CHANNEL ROUTING ENGINE
  // ============================================================================
  var CommercialRouter = {
    /**
     * Resolves canonical recipient phone by domain category.
     * @param {string} domainCategory - Category identifier ('petshop' | 'farmacia' | 'estetica' | 'medicina' | 'cirugia')
     * @returns {Object} Immutable channel definition
     */
    resolveChannel: function (domainCategory) {
      var cat = String(domainCategory || "").toLowerCase().trim();
      switch (cat) {
        case "petshop":
        case "alimentos":
        case "accesorios":
        case "juguetes":
        case "farmacia":
        case "farmacia_veterinaria":
        case "recepcion":
          return CHANNELS.RECEPCION;

        case "estetica":
        case "bano":
        case "spa":
        case "grooming":
        case "corte":
        case "deslanado":
          return CHANNELS.ESTETICA;

        case "medicina":
        case "consultorio":
        case "vacunas":
        case "cirugia":
        case "laboratorio":
        case "profilaxis":
        default:
          return CHANNELS.CONSULTORIO;
      }
    },

    /**
     * Constructs standard URL-encoded WhatsApp deep-link.
     * @param {string} phoneE164 
     * @param {string} messageText 
     * @returns {string} Fully qualified URL
     */
    buildDirectLink: function (phoneE164, messageText) {
      var sanitizedPhone = String(phoneE164).replace(/\D/g, "");
      var encoded = encodeURIComponent(String(messageText || "").trim());
      return "https://api.whatsapp.com/send?phone=" + sanitizedPhone + "&text=" + encoded;
    }
  };

  // ============================================================================
  // 4. ESTÉTICA MATRIX CALCULATOR (DETERMINISTIC INTEGER MATH)
  // ============================================================================
  var ESTETICA_TARIFAS_CENTIMOS = Object.freeze({
    clasico: Object.freeze({ "0-5": 4000, "6-10": 4000, "11-20": 4500, "20+": 4500, esEspecial20: true, tiempo: "~60 a 75 min" }),
    express: Object.freeze({ "0-5": 2500, "6-10": 3000, "11-20": 3500, "20+": 3500, esEspecial20: true, tiempo: "~40 a 50 min" }),
    spa:     Object.freeze({ "0-5": 3000, "6-10": 3500, "11-20": 4000, "20+": 4000, esEspecial20: true, tiempo: "~70 a 90 min" }),
    real:    Object.freeze({ "0-5": 3500, "6-10": 4000, "11-20": 4500, "20+": 4500, esEspecial20: true, tiempo: "~80 a 100 min" }),
    cachorros: Object.freeze({ "0-5": 2500, "6-10": 2500, "11-20": 2500, "20+": 2500, esEspecial20: false, tiempo: "~35 a 45 min" }),
    pielsana:  Object.freeze({ "0-5": 3500, "6-10": 4000, "11-20": 4500, "20+": 4500, esEspecial20: true, tiempo: "~60 min / sesión" })
  });

  var EsteticaEngine = {
    calculateQuotation: function (params) {
      var servicioId = String(params.servicioId || "clasico");
      var pesoId = String(params.pesoId || "0-5");
      var corteCents = params.corteCents ? Math.trunc(params.corteCents) : 0;
      var extrasCents = params.extrasCents ? Math.trunc(params.extrasCents) : 0;

      var table = ESTETICA_TARIFAS_CENTIMOS[servicioId] || ESTETICA_TARIFAS_CENTIMOS.clasico;
      var baseCents = table[pesoId] || table["0-5"];
      var esEspecial = (pesoId === "20+" && table.esEspecial20);

      var subtotal = Money.fromCents(baseCents + corteCents + extrasCents);

      // Descuento oficial por Combo Baño + Corte (10% en servicios seleccionados)
      var aplicaCombo = ["express", "spa", "real"].indexOf(servicioId) !== -1 && corteCents > 0;
      var discountCalc = aplicaCombo ? subtotal.applyDiscountPercentage(10) : { discount: Money.zero(), final: subtotal };

      return {
        base: Money.fromCents(baseCents),
        corte: Money.fromCents(corteCents),
        extras: Money.fromCents(extrasCents),
        subtotal: subtotal,
        descuento: discountCalc.discount,
        total: discountCalc.final,
        esEspecial20: esEspecial,
        tiempoEstimado: table.tiempo,
        routingChannel: CHANNELS.ESTETICA
      };
    }
  };

  // ============================================================================
  // 5. CART STATE INTEGRITY & DISPATCH BUILDER
  // ============================================================================
  var CartIntegrityEngine = {
    /**
     * Validates and recalculates cart lines against authoritative catalog.
     * Prevents client-side price tampering in localStorage.
     */
    reconcileCart: function (rawItems, catalogProducts) {
      if (!Array.isArray(rawItems)) return { items: [], total: Money.zero() };

      var catalogIndex = Object.create(null);
      if (Array.isArray(catalogProducts)) {
        for (var i = 0; i < catalogProducts.length; i++) {
          var p = catalogProducts[i];
          if (p && p.id) catalogIndex[p.id] = p;
        }
      }

      var reconciled = [];
      var totalCents = 0;

      for (var j = 0; j < rawItems.length; j++) {
        var line = rawItems[j];
        if (!line || !line.id || !catalogIndex[line.id]) continue;

        var catalogItem = catalogIndex[line.id];
        var quantity = Math.max(1, Math.min(99, Math.trunc(Number(line.cantidad) || 1)));

        // Base price calculation from authoritative catalog
        var unitCents = Math.round(Number(catalogItem.precio || 0) * 100);

        // Extra variants calculation
        if (Array.isArray(catalogItem.variantes) && line.opciones) {
          for (var v = 0; v < catalogItem.variantes.length; v++) {
            var group = catalogItem.variantes[v];
            var selectedLabel = line.opciones[group.nombre];
            if (Array.isArray(group.opciones)) {
              for (var o = 0; o < group.opciones.length; o++) {
                var opt = group.opciones[o];
                if (opt.label === selectedLabel && opt.extra) {
                  unitCents += Math.round(Number(opt.extra) * 100);
                }
              }
            }
          }
        }

        var lineTotalCents = unitCents * quantity;
        totalCents += lineTotalCents;

        reconciled.push({
          id: catalogItem.id,
          titulo: catalogItem.titulo,
          categoria: catalogItem.categoria,
          opciones: line.opciones || {},
          cantidad: quantity,
          precioUnitario: Money.fromCents(unitCents),
          precioSubtotal: Money.fromCents(lineTotalCents)
        });
      }

      return {
        items: reconciled,
        total: Money.fromCents(totalCents)
      };
    },

    /**
     * Builds standardized WhatsApp dispatch message for PetShop orders.
     */
    buildPetShopDispatchMessage: function (reconciledCart) {
      var lines = [];
      lines.push("🐾 *PELITOS VETERINARIA — CONFIRMACIÓN DE PEDIDO PETSHOP* 🛍️");
      lines.push("--------------------------------------------------");

      for (var i = 0; i < reconciledCart.items.length; i++) {
        var item = reconciledCart.items[i];
        var variantTokens = [];
        for (var key in item.opciones) {
          if (Object.prototype.hasOwnProperty.call(item.opciones, key)) {
            variantTokens.push(item.opciones[key]);
          }
        }
        var variantDesc = variantTokens.length ? " (" + variantTokens.join(" · ") + ")" : "";
        lines.push((i + 1) + ". *" + item.titulo + "*" + variantDesc);
        lines.push("   " + item.cantidad + " un. x " + item.precioUnitario.format() + " = " + item.precioSubtotal.format());
      }

      lines.push("--------------------------------------------------");
      lines.push("💰 *Total a pagar:* " + reconciledCart.total.format());
      lines.push("");
      lines.push("📍 *Destino:* Recojo en clínica o delivery en Huánuco.");
      lines.push("¿Me confirman stock inmediato y medios de pago (Yape/Plin/Transferencia)?");

      var text = lines.join("\n");
      return {
        text: text,
        channel: CHANNELS.RECEPCION,
        link: CommercialRouter.buildDirectLink(CHANNELS.RECEPCION.e164, text)
      };
    }
  };

  // ============================================================================
  // 6. MODULE EXPORTATION (ISOMORPHIC & BROWSER WINDOW BINDING)
  // ============================================================================
  var PelitosCommercialCore = Object.freeze({
    CHANNELS: CHANNELS,
    CURRENCY: CURRENCY,
    Money: Money,
    CommercialRouter: CommercialRouter,
    EsteticaEngine: EsteticaEngine,
    CartIntegrityEngine: CartIntegrityEngine
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = PelitosCommercialCore;
  } else {
    global.PelitosCommercialCore = PelitosCommercialCore;
  }

})(typeof window !== "undefined" ? window : globalThis);
