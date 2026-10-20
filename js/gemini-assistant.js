/**
 * ==============================================================================
 * PELITOS IA · ASISTENTE VETERINARIO INTELIGENTE (POWERED BY GOOGLE GEMINI)
 * ==============================================================================
 * Asistente virtual clínico y comercial para Pelitos Veterinaria (Huánuco, Perú).
 *
 * CAPACIDADES:
 *   1. Orientación clínica preventiva y triaje de urgencias para mascotas.
 *   2. Información de servicios (Consultas, Vacunas, Laboratorio, Estética, PetShop).
 *   3. "Análisis mediante la conversación": Extrae tipo de mascota, síntomas, nivel
 *      de urgencia y genera una pre-ficha lista para derivar a WhatsApp.
 *   4. Modo Dual:
 *      - Con API Key: Conecta directamente con Google Gemini API.
 *      - Sin API Key: Motor clínico local inteligente en español (Zero-Crash Fallback).
 * ==============================================================================
 */

(function (window, document) {
  "use strict";

  /* ==========================================================================
     1. CONFIGURACIÓN Y CONTEXTO INSTITUCIONAL
     ========================================================================== */
  var CONFIG = {
    // Clave de API de Google Gemini (opcional en código; se puede configurar en el chat)
    apiKey: localStorage.getItem("pelitos_gemini_api_key") || "",
    
    // Modelo Gemini recomendado para chats rápidos y precisos
    model: "gemini-1.5-flash",

    // Contexto de la clínica veterinaria
    clinic: {
      nombre: "Pelitos Veterinaria",
      ciudad: "Huánuco, Perú",
      direccion: "Jr. Leoncio Prado N.° 1336",
      horario: "Lunes a sábado de 8:30 a.m. a 8:00 p.m.",
      telefonoConsultorio: "51939356376",
      telefonoEstetica: "51948426656"
    }
  };

  /* Prompt de sistema para Google Gemini */
  var SYSTEM_PROMPT = 
    "Eres 'Pelitos IA', el asistente veterinario inteligente de Pelitos Veterinaria en Huánuco, Perú (Jr. Leoncio Prado 1336). " +
    "Tu rol es atender con empatía, profesionalismo y rapidez a los tutores de perros, gatos y otras mascotas.\n\n" +
    "REGLAS OBLIGATORIAS:\n" +
    "1. Orientación, no diagnóstico final: Puedes orientar sobre síntomas (vómitos, inapetencia, parásitos, vacunas), pero siempre aclara que se requiere evaluación física presencial en la clínica.\n" +
    "2. Seguridad farmacológica: NUNCA recetes medicamentos ni dosis (especialmente tóxicos comunes como paracetamol o ibuprofeno en perros/gatos).\n" +
    "3. Detección de Urgencias: Si el animal presenta convulsiones, sangrado profuso, dificultad respiratoria severa, hinchazón abdominal súbita o ingestión de veneno, califica como 'URGENCIA ALTA' e indica acudir inmediatamente a Jr. Leoncio Prado 1336 o llamar al WhatsApp.\n" +
    "4. Servicios disponibles en Pelitos: Consulta médica, Medicina preventiva (vacunas y desparasitación), Laboratorio clínico propio (análisis de sangre y heces), Cirugías menores, Pelitos Estética (baños medicados, cortes de raza con groomer certificada) y PetShop.\n" +
    "5. Respuestas concisas y estructuradas con emojis amigables. Al final de tu respuesta siempre ofrece coordinar la atención por WhatsApp.";

  /* Estado del Triaje / Análisis en Vivo */
  var triageAnalysis = {
    tipoMascota: "Por identificar",
    nombreMascota: "",
    urgencia: "Verde (Informativa)",
    sintomasDetectados: [],
    servicioSugerido: "Orientación General",
    historial: []
  };

  /* ==========================================================================
     2. MOTOR CLÍNICO LOCAL (FALLBACK INTELIGENTE CUANDO NO HAY API KEY)
     ========================================================================== */
  var LocalTriageEngine = {
    analizarMensaje: function (texto) {
      var t = texto.toLowerCase();
      var resp = "";
      var urgencia = "Verde (Informativa)";
      var servicio = "Consulta General";

      // 1. Detectar Mascota
      if (t.indexOf("perr") !== -1 || t.indexOf("canin") !== -1 || t.indexOf("cachorr") !== -1) {
        triageAnalysis.tipoMascota = "Canino (Perro)";
      } else if (t.indexOf("gat") !== -1 || t.indexOf("felin") !== -1 || t.indexOf("minin") !== -1) {
        triageAnalysis.tipoMascota = "Felino (Gato)";
      }

      // 2. Triage de Emergencias Críticas (Nivel Rojo)
      if (
        t.indexOf("veneno") !== -1 || t.indexOf("intoxic") !== -1 || t.indexOf("sangr") !== -1 ||
        t.indexOf("convuls") !== -1 || t.indexOf("no respira") !== -1 || t.indexOf("atropell") !== -1 ||
        t.indexOf("ahog") !== -1 || t.indexOf("asfixi") !== -1
      ) {
        urgencia = "🚨 ROJA (EMERGENCIA INMEDIATA)";
        servicio = "Atención Médica de Emergencia";
        triageAnalysis.sintomasDetectados.push("Posible emergencia crítica");

        resp = "⚠️ **¡ATENCIÓN! Esto puede ser una emergencia veterinaria crítica.**\n\n" +
               "Por favor, no pierdas tiempo ni intentes remedios caseros. Traslada a tu mascota inmediatamente a nuestra clínica:\n\n" +
               "📍 **Jr. Leoncio Prado N.° 1336, Huánuco**\n" +
               "📞 **WhatsApp de Urgencias:** [+51 939 356 376](https://api.whatsapp.com/send?phone=51939356376&text=URGENCIA%20VETERINARIA%20PELITOS:%20" + encodeURIComponent(texto) + ")\n\n" +
               "Haz clic abajo para avisar al equipo médico que estás en camino.";
      }
      // 3. Síntomas Frecuentes (Nivel Amarillo)
      else if (
        t.indexOf("vomit") !== -1 || t.indexOf("diarrea") !== -1 || t.indexOf("no come") !== -1 ||
        t.indexOf("inapet") !== -1 || t.indexOf("triste") !== -1 || t.indexOf("decaid") !== -1 ||
        t.indexOf("fiebre") !== -1 || t.indexOf("coje") !== -1 || t.indexOf("tos") !== -1
      ) {
        urgencia = "⚠️ Amarilla (Requiere Consulta)";
        servicio = "Consulta Médica Veterinaria";
        triageAnalysis.sintomasDetectados.push("Malestar digestivo o sistémico");

        resp = "Entiendo tu preocupación por tu " + (triageAnalysis.tipoMascota !== "Por identificar" ? triageAnalysis.tipoMascota : "mascota") + ". " +
               "Síntomas como vómitos, diarrea o inapetencia pueden deberse a infecciones virales, parásitos o transgresión alimentaria.\n\n" +
               "💡 **Recomendaciones inmediatas:**\n" +
               "• Mantén agua fresca a su alcance en pequeñas tomas.\n" +
               "• ⛔ **Nunca le des analgésicos humanos** (el paracetamol o ibuprofeno son letales para perros y gatos).\n" +
               "• Te recomendamos agendar una consulta médica para hidratarlo y revisarlo a tiempo.\n\n" +
               "¿Deseas que reservemos un turno de atención en Jr. Leoncio Prado 1336?";
      }
      // 4. Vacunas y Medicina Preventiva
      else if (
        t.indexOf("vacun") !== -1 || t.indexOf("desparasit") !== -1 || t.indexOf("parvovirus") !== -1 ||
        t.indexOf("distemper") !== -1 || t.indexOf("rabia") !== -1 || t.indexOf("pipeta") !== -1 ||
        t.indexOf("garrapata") !== -1 || t.indexOf("pulga") !== -1
      ) {
        urgencia = "Verde (Preventiva)";
        servicio = "Medicina Preventiva y Vacunación";
        triageAnalysis.sintomasDetectados.push("Control de vacunas / parásitos");

        resp = "🐾 **El calendario de medicina preventiva es clave para proteger su vida.**\n\n" +
               "En Pelitos Veterinaria contamos con:\n" +
               "• Vacunas quíntuple, séxtuple, parvovirus, tos de las perreras y antirrábica.\n" +
               "• Vacuna triple felina y leucemia para gatos.\n" +
               "• Desparasitación interna y antipulgas de larga duración (Bravecto, Simparica, Nexgard).\n\n" +
               "¿Qué edad tiene tu consentido para orientarte sobre su próxima dosis?";
      }
      // 5. Estética y Peluquería Canina
      else if (
        t.indexOf("baño") !== -1 || t.indexOf("corte") !== -1 || t.indexOf("estetica") !== -1 ||
        t.indexOf("estética") !== -1 || t.indexOf("peluquer") !== -1 || t.indexOf("grooming") !== -1 ||
        t.indexOf("uñas") !== -1
      ) {
        urgencia = "Verde (Estética)";
        servicio = "Pelitos Estética Canina";
        triageAnalysis.sintomasDetectados.push("Higiene y estética");

        resp = "✂️ **¡En Pelitos Estética dejamos a tu mascota impecable y feliz!**\n\n" +
               "Nuestros paquetes incluyen:\n" +
               "• Baño relajante con agua tibia y champú hipoalergénico.\n" +
               "• Corte higiénico o de raza por nuestra **groomer certificada**.\n" +
               "• Corte y limado de uñas, limpieza de oídos y perfume para mascotas.\n\n" +
               "Atendemos previa cita en Jr. Leoncio Prado 1336 o a domicilio con **Pelitos Móvil**. ¿Te gustaría reservar su turno?";
      }
      // 6. Laboratorio Clínico
      else if (
        t.indexOf("laboratorio") !== -1 || t.indexOf("analisis") !== -1 || t.indexOf("análisis") !== -1 ||
        t.indexOf("hemograma") !== -1 || t.indexOf("sangre") !== -1 || t.indexOf("heces") !== -1
      ) {
        urgencia = "Verde (Diagnóstica)";
        servicio = "Laboratorio Clínico";
        triageAnalysis.sintomasDetectados.push("Pruebas diagnósticas");

        resp = "🔬 **Contamos con Laboratorio Veterinario Propio en Huánuco.**\n\n" +
               "Realizamos hemogramas completos, perfiles bioquímicos (hígado, riñón), frotis sanguíneo, análisis de heces y raspados de piel con entrega rápida de resultados para un diagnóstico certero.\n\n" +
               "¿Tienes una orden médica de exámenes?";
      }
      // 7. Horario y Ubicación
      else if (
        t.indexOf("horario") !== -1 || t.indexOf("hora") !== -1 || t.indexOf("donde") !== -1 ||
        t.indexOf("dónde") !== -1 || t.indexOf("direccion") !== -1 || t.indexOf("dirección") !== -1 ||
        t.indexOf("ubicacion") !== -1 || t.indexOf("abierto") !== -1
      ) {
        resp = "📍 **Estamos ubicados en:** Jr. Leoncio Prado N.° 1336, Huánuco, Perú.\n" +
               "⏰ **Horario de atención:** Lunes a sábado de 8:30 a.m. a 8:00 p.m. (continuo).\n" +
               "📱 **WhatsApp oficial:** +51 939 356 376\n\n" +
               "¡Estaremos encantados de recibirte a ti y a tu mascota!";
      }
      // 8. Respuesta General Empática
      else {
        resp = "¡Hola! Soy **Pelitos IA**, tu asistente veterinario virtual en Huánuco. 🐾\n\n" +
               "Puedo ayudarte con:\n" +
               "• Triaje clínico de síntomas de tu mascota.\n" +
               "• Calendario de vacunas y desparasitación.\n" +
               "• Turnos de Peluquería y Baños.\n" +
               "• Alimentos y productos del PetShop.\n\n" +
               "Cuéntame, ¿qué necesita tu mascota hoy o qué síntomas has notado?";
      }

      triageAnalysis.urgencia = urgencia;
      triageAnalysis.servicioSugerido = servicio;
      return resp;
    }
  };

  /* ==========================================================================
     3. LLAMADA A LA API DE GOOGLE GEMINI
     ========================================================================== */
  async function consultarGeminiAPI(mensajeUsuario) {
    var key = CONFIG.apiKey || localStorage.getItem("pelitos_gemini_api_key");
    if (!key) {
      // Fallback automático al motor local inteligente
      return LocalTriageEngine.analizarMensaje(mensajeUsuario);
    }

    var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
                   encodeURIComponent(CONFIG.model) + ":generateContent";

    // Preparar historial de conversación
    var contents = [
      {
        role: "user",
        parts: [{ text: "Contexto del sistema:\n" + SYSTEM_PROMPT }]
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Soy Pelitos IA y asistiré a los clientes de Pelitos Veterinaria con profesionalismo, empatía y rigor clínico." }]
      }
    ];

    // Incluir últimos turnos de la sesión
    triageAnalysis.historial.slice(-6).forEach(function (h) {
      contents.push({
        role: h.rol === "user" ? "user" : "model",
        parts: [{ text: h.texto }]
      });
    });

    contents.push({
      role: "user",
      parts: [{ text: mensajeUsuario }]
    });

    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 600
          }
        })
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      var data = await response.json();
      var respuestaTexto = data.candidates &&
                           data.candidates[0] &&
                           data.candidates[0].content &&
                           data.candidates[0].content.parts &&
                           data.candidates[0].content.parts[0] &&
                           data.candidates[0].content.parts[0].text;

      if (!respuestaTexto) {
        throw new Error("Respuesta vacía de Gemini");
      }

      // Actualizar triaje en paralelo con el analizador local
      LocalTriageEngine.analizarMensaje(mensajeUsuario);

      // Auditoría en base de datos si está conectada
      if (window.PelitosDB && typeof window.PelitosDB.guardarConsultaIA === "function") {
        window.PelitosDB.guardarConsultaIA(triageAnalysis);
      }

      return respuestaTexto;

    } catch (err) {
      // Fallback seguro en caso de error de red o clave inválida
      console.warn("[Pelitos IA] Fallo conexión Gemini API, usando motor clínico local:", err);
      return LocalTriageEngine.analizarMensaje(mensajeUsuario);
    }
  }

  /* ==========================================================================
     4. RENDERIZADO DEL WIDGET EN EL DOM
     ========================================================================== */
  function inyectarInterfazChat() {
    if (document.getElementById("pelitos-ia-root")) return;

    var root = document.createElement("div");
    root.id = "pelitos-ia-root";
    root.className = "pelitos-ia-container";

    root.innerHTML = 
      '<!-- Botón Lanzador Flotante -->' +
      '<button type="button" class="pelitos-ia-fab" id="btn-toggle-ia" aria-label="Abrir asistente inteligente Pelitos IA" title="Habla con Pelitos IA (Powered by Gemini)">' +
      '  <span class="ia-fab-pulse"></span>' +
      '  <span class="ia-fab-icon">🐾</span>' +
      '  <span class="ia-fab-sparkle">✨</span>' +
      '  <span class="ia-fab-label">Pelitos IA</span>' +
      '</button>' +

      '<!-- Ventana de Chat -->' +
      '<aside class="pelitos-ia-modal" id="modal-chat-ia" aria-hidden="true" role="dialog" aria-label="Asistente Virtual Pelitos IA">' +
      '  <!-- Cabecera -->' +
      '  <div class="ia-header">' +
      '    <div class="ia-header-info">' +
      '      <div class="ia-avatar">' +
      '        <span>🐾</span>' +
      '        <span class="ia-status-dot"></span>' +
      '      </div>' +
      '      <div>' +
      '        <div class="ia-title-row">' +
      '          <h3 class="ia-title">Pelitos IA</h3>' +
      '          <span class="ia-badge-gemini">Gemini</span>' +
      '        </div>' +
      '        <p class="ia-subtitle">Orientación veterinaria en Huánuco</p>' +
      '      </div>' +
      '    </div>' +
      '    <div class="ia-header-actions">' +
      '      <button type="button" class="ia-btn-icon" id="ia-btn-config" title="Configurar API Key de Gemini" aria-label="Configurar clave Gemini">⚙️</button>' +
      '      <button type="button" class="ia-btn-icon" id="ia-btn-cerrar" title="Cerrar chat" aria-label="Cerrar chat">✕</button>' +
      '    </div>' +
      '  </div>' +

      '  <!-- Panel de Triaje y Análisis en Vivo -->' +
      '  <div class="ia-triage-panel" id="ia-triage-panel">' +
      '    <div class="ia-triage-header" id="ia-triage-toggle">' +
      '      <span class="ia-triage-tag">📋 Análisis de la conversación</span>' +
      '      <span class="ia-triage-badge" id="ia-triage-urgencia">Triaje activo</span>' +
      '    </div>' +
      '    <div class="ia-triage-body" id="ia-triage-body">' +
      '      <div class="ia-triage-item"><span>Mascota:</span> <strong id="ia-resumen-mascota">Por identificar</strong></div>' +
      '      <div class="ia-triage-item"><span>Servicio sugerido:</span> <strong id="ia-resumen-servicio">Consulta General</strong></div>' +
      '      <button type="button" class="ia-btn-whatsapp-triage" id="ia-btn-enviar-wa">' +
      '        📲 Enviar pre-ficha a WhatsApp' +
      '      </button>' +
      '    </div>' +
      '  </div>' +

      '  <!-- Mensajes -->' +
      '  <div class="ia-messages" id="ia-messages-list" role="log" aria-live="polite">' +
      '    <div class="ia-msg ia-msg--assistant">' +
      '      <p>¡Hola! Soy <strong>Pelitos IA</strong>, tu asistente veterinario virtual en Huánuco. 🐾✨</p>' +
      '      <p>Puedo ayudarte con orientación de salud de tu mascota, vacunas, servicios de peluquería o agendar una cita.</p>' +
      '      <div class="ia-quick-chips" id="ia-quick-chips">' +
      '        <button type="button" class="ia-chip" data-ia-prompt="¿Qué vacunas necesita mi cachorro?">🐶 Vacunas cachorro</button>' +
      '        <button type="button" class="ia-chip" data-ia-prompt="Quiero reservar un baño y corte">✂️ Baño y Peluquería</button>' +
      '        <button type="button" class="ia-chip" data-ia-prompt="Mi mascota tiene vómitos y no come">🚨 Triaje de malestar</button>' +
      '        <button type="button" class="ia-chip" data-ia-prompt="¿Dónde queda la veterinaria y cuál es el horario?">📍 Horarios y Dirección</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +

      '  <!-- Formulario de Entrada -->' +
      '  <form class="ia-input-bar" id="ia-form-chat">' +
      '    <input type="text" id="ia-input-text" class="ia-input" placeholder="Pregunta sobre la salud de tu mascota…" autocomplete="off" maxlength="300" required />' +
      '    <button type="submit" class="ia-btn-send" id="ia-btn-send" aria-label="Enviar mensaje">' +
      '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '        <line x1="22" y1="2" x2="11" y2="13"></line>' +
      '        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>' +
      '      </svg>' +
      '    </button>' +
      '  </form>' +
      '</aside>';

    document.body.appendChild(root);
    vincularEventosChat();
  }

  /* ==========================================================================
     5. LÓGICA DE INTERACCIÓN Y EVENTOS
     ========================================================================== */
  function vincularEventosChat() {
    var fab = document.getElementById("btn-toggle-ia");
    var modal = document.getElementById("modal-chat-ia");
    var btnCerrar = document.getElementById("ia-btn-cerrar");
    var btnConfig = document.getElementById("ia-btn-config");
    var formChat = document.getElementById("ia-form-chat");
    var inputText = document.getElementById("ia-input-text");
    var messagesList = document.getElementById("ia-messages-list");
    var chipsContainer = document.getElementById("ia-quick-chips");
    var btnWaTriage = document.getElementById("ia-btn-enviar-wa");

    if (!fab || !modal) return;

    function abrirChat() {
      modal.classList.add("activo");
      modal.setAttribute("aria-hidden", "false");
      fab.classList.add("oculto");
      if (inputText) inputText.focus();

      // Registro analítico
      if (window.PelitosAnalytics) {
        window.PelitosAnalytics.trackEvent("chat_ia_abierto");
      }
    }

    function cerrarChat() {
      modal.classList.remove("activo");
      modal.setAttribute("aria-hidden", "true");
      fab.classList.remove("oculto");
    }

    fab.addEventListener("click", abrirChat);
    btnCerrar.addEventListener("click", cerrarChat);

    // Configuración de API Key de Gemini
    btnConfig.addEventListener("click", function () {
      var actual = localStorage.getItem("pelitos_gemini_api_key") || "";
      var nuevaKey = window.prompt(
        "🔑 Configuración de Google Gemini API:\n\n" +
        "Ingresa tu Gemini API Key para habilitar el modelo generativo cloud (o déjalo vacío para usar el motor clínico local):",
        actual
      );

      if (nuevaKey !== null) {
        var keyLimpia = nuevaKey.trim();
        if (keyLimpia) {
          localStorage.setItem("pelitos_gemini_api_key", keyLimpia);
          CONFIG.apiKey = keyLimpia;
          agregarMensajeSistema("✅ Conexión con Google Gemini configurada exitosamente.");
        } else {
          localStorage.removeItem("pelitos_gemini_api_key");
          CONFIG.apiKey = "";
          agregarMensajeSistema("ℹ️ Modo offline/local activado.");
        }
      }
    });

    // Chips de sugerencia rápida
    if (chipsContainer) {
      chipsContainer.addEventListener("click", function (e) {
        var chip = e.target.closest("[data-ia-prompt]");
        if (!chip) return;
        var prompt = chip.getAttribute("data-ia-prompt");
        if (prompt) {
          enviarMensajeUsuario(prompt);
        }
      });
    }

    // Submit del chat
    formChat.addEventListener("submit", function (e) {
      e.preventDefault();
      var texto = (inputText.value || "").trim();
      if (!texto) return;
      inputText.value = "";
      enviarMensajeUsuario(texto);
    });

    // Botón de derivar a WhatsApp con el triaje
    btnWaTriage.addEventListener("click", function () {
      var sintomasStr = triageAnalysis.sintomasDetectados.join(", ") || "Consulta de orientación";
      var textoWa = 
        "Hola Pelitos Veterinaria, tengo una consulta para mi mascota evaluada con Pelitos IA:\n\n" +
        "🐾 *Tipo de mascota:* " + triageAnalysis.tipoMascota + "\n" +
        "⚡ *Nivel de atención:* " + triageAnalysis.urgencia + "\n" +
        "🩺 *Servicio requerido:* " + triageAnalysis.servicioSugerido + "\n" +
        "📝 *Motivo / Síntomas:* " + sintomasStr + "\n\n" +
        "¿Tienen disponibilidad para atendernos en Jr. Leoncio Prado 1336?";

      var numDestino = triageAnalysis.servicioSugerido.indexOf("Estética") !== -1 
        ? CONFIG.clinic.telefonoEstetica 
        : CONFIG.clinic.telefonoConsultorio;

      if (window.PelitosAnalytics) {
        window.PelitosAnalytics.trackContact("Chat_Gemini_Derivacion", {
          urgencia: triageAnalysis.urgencia,
          servicio: triageAnalysis.servicioSugerido
        });
      }

      window.open(
        "https://api.whatsapp.com/send?phone=" + numDestino + "&text=" + encodeURIComponent(textoWa),
        "_blank",
        "noopener,noreferrer"
      );
    });

    function enviarMensajeUsuario(texto) {
      // Pintar mensaje del usuario
      agregarMensajeDOM("user", texto);
      triageAnalysis.historial.push({ rol: "user", texto: texto });

      // Indicador de escribiendo
      var typingIndicator = mostrarIndicadorEscribiendo();

      // Consultar IA (Gemini o Motor Local)
      consultarGeminiAPI(texto).then(function (respuesta) {
        if (typingIndicator && typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }

        agregarMensajeDOM("assistant", respuesta);
        triageAnalysis.historial.push({ rol: "assistant", texto: respuesta });

        // Actualizar el panel de triaje en vivo
        actualizarPanelTriaje();
      }).catch(function () {
        if (typingIndicator && typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }
        agregarMensajeDOM("assistant", "Disculpa, hubo un breve inconveniente. Por favor contáctanos directamente por WhatsApp al +51 939 356 376.");
      });
    }

    function agregarMensajeDOM(rol, texto) {
      var msgDiv = document.createElement("div");
      msgDiv.className = "ia-msg ia-msg--" + (rol === "user" ? "user" : "assistant");

      // Render seguro: formato Markdown básico (negritas y enlaces)
      var p = document.createElement("div");
      p.className = "ia-msg-text";

      var textoStr = String(texto || "");
      // Reemplazo seguro de entidades HTML y atributos
      var contenidoSeguro = textoStr
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\((https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, "<br>");

      p.innerHTML = contenidoSeguro;
      msgDiv.appendChild(p);

      messagesList.appendChild(msgDiv);
      messagesList.scrollTop = messagesList.scrollHeight;
    }

    function agregarMensajeSistema(texto) {
      var d = document.createElement("div");
      d.className = "ia-msg-sistema";
      d.textContent = texto;
      messagesList.appendChild(d);
      messagesList.scrollTop = messagesList.scrollHeight;
    }

    function mostrarIndicadorEscribiendo() {
      var ind = document.createElement("div");
      ind.className = "ia-msg ia-msg--assistant ia-typing";
      ind.innerHTML = '<span class="ia-dot"></span><span class="ia-dot"></span><span class="ia-dot"></span>';
      messagesList.appendChild(ind);
      messagesList.scrollTop = messagesList.scrollHeight;
      return ind;
    }

    function actualizarPanelTriaje() {
      var elMascota = document.getElementById("ia-resumen-mascota");
      var elServicio = document.getElementById("ia-resumen-servicio");
      var elUrgencia = document.getElementById("ia-triage-urgencia");

      if (elMascota) elMascota.textContent = triageAnalysis.tipoMascota;
      if (elServicio) elServicio.textContent = triageAnalysis.servicioSugerido;
      if (elUrgencia) {
        elUrgencia.textContent = triageAnalysis.urgencia;
        elUrgencia.className = "ia-triage-badge " + (
          triageAnalysis.urgencia.indexOf("ROJA") !== -1 ? "rojo" :
          triageAnalysis.urgencia.indexOf("Amarilla") !== -1 ? "amarillo" : "verde"
        );
      }
    }
  }

  // Auto-iniciar al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inyectarInterfazChat);
  } else {
    inyectarInterfazChat();
  }

})(window, document);
