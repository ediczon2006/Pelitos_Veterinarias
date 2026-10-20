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
    "5. Investigación y Búsqueda en Internet en Tiempo Real: Tienes habilitada la herramienta de Búsqueda de Google (Google Search Grounding). Si el usuario consulta sobre razas específicas, síntomas atípicos, nutrición animal, alimentos o plantas tóxicas, compatibilidad de productos, o avances veterinarios, investiga activamente en la web en tiempo real para incorporar todos los datos en tu respuesta.\n" +
    "6. AUTOSUFICIENCIA TOTAL (SIN ENLACES EXTERNOS): Redacta y explica TODOS los datos, síntomas, causas, recomendaciones y cuidados médicos DIRECTAMENTE AQUÍ en tu respuesta de forma completa, clara y didáctica. NUNCA le digas al usuario que vaya a buscar a Google o a enlaces externos; entrega toda la información explicada en este mismo mensaje.\n" +
    "7. Respuestas estructuradas con viñetas y emojis amigables. Al final de tu respuesta siempre ofrece coordinar la atención presencial por WhatsApp.";

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
     2. MOTOR CLÍNICO LOCAL (RESPUESTA PUNTUAL Y EXACTA A CADA PREGUNTA)
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

      // 2. EMERGENCIA CRÍTICA INMEDIATA
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
               "Haz clic en el enlace para avisar al equipo médico que estás en camino.";
      }

      // 3. PRECIOS, TARIFAS Y COSTOS (RESPUESTA DIRECTA)
      else if (
        t.indexOf("precio") !== -1 || t.indexOf("costo") !== -1 || t.indexOf("cuanto") !== -1 ||
        t.indexOf("cuánto") !== -1 || t.indexOf("tarifa") !== -1 || t.indexOf("vale") !== -1 ||
        t.indexOf("cobran") !== -1 || t.indexOf("presupuesto") !== -1
      ) {
        urgencia = "Verde (Comercial)";
        servicio = "Información de Tarifas";
        resp = "💰 **Precios y Tarifas de Servicios en Pelitos Veterinaria:**\n\n" +
               "• **Consulta Médica General:** S/ 25 - S/ 30 (incluye revisión clínica integral, pesaje y temperatura).\n" +
               "• **Vacunas individuales:** S/ 35 a S/ 50 (Puppy, Pentavalente, Séxtuple o Antirrábica con carnet oficial).\n" +
               "• **Desparasitación interna:** S/ 15 a S/ 25 según el peso exacto de tu mascota.\n" +
               "• **Baño y Peluquería Canina:** Desde S/ 25 (razas pequeñas como Shih Tzu, Poodle, Chihuahua), S/ 35 (medianos) hasta S/ 50-70 (grandes). Incluye corte de uñas, limpieza de oídos y perfume.\n" +
               "• **Hemograma completo en laboratorio:** S/ 35 - S/ 45 con entrega en el día.\n\n" +
               "¿Deseas el presupuesto exacto para tu mascota?";
      }

      // 4. PIEL, COMEZÓN, PULGAS, GARRAPATAS, CAÍDA DE PELO Y SARNA
      else if (
        t.indexOf("rasca") !== -1 || t.indexOf("pica") !== -1 || t.indexOf("picazon") !== -1 ||
        t.indexOf("picazón") !== -1 || t.indexOf("pulga") !== -1 || t.indexOf("garrapata") !== -1 ||
        t.indexOf("sarna") !== -1 || t.indexOf("cae el pelo") !== -1 || t.indexOf("caida de pelo") !== -1 ||
        t.indexOf("caída de pelo") !== -1 || t.indexOf("alopecia") !== -1 || t.indexOf("hongo") !== -1 ||
        t.indexOf("caspa") !== -1 || t.indexOf("dermatit") !== -1
      ) {
        urgencia = "Amarilla (Dermatología)";
        servicio = "Dermatología y Antiparasitarios";
        triageAnalysis.sintomasDetectados.push("Problema dermatológico / parásitos");

        resp = "🩺 **Sobre el rascado, pulgas y problemas de piel:**\n\n" +
               "Si tu mascota se rasca mucho o pierde pelo, las causas más frecuentes son:\n" +
               "1. **Dermatitis Alérgica por Picadura de Pulga (DAPP):** Una sola pulga puede causar picazón intensa. Las tabletas masticables (Simparica, Bravecto o NexGard) matan pulgas y garrapatas en horas y protegen por meses.\n" +
               "2. **Hongos o Ácaros de Sarna:** Requieren un raspado cutáneo rápido en nuestro laboratorio para aplicar el tratamiento exacto.\n" +
               "3. **Alivio seguro:** Un baño medicado con champú antiséptico calma la comezón de inmediato.\n\n" +
               "⚠️ **Aviso:** Nunca uses cremas humanas con betametasona o corticoides, porque empeoran hongos y bacterias.";
      }

      // 5. ESTORNUDOS, TOS, GRIPE Y RESPIRACIÓN
      else if (
        t.indexOf("estornud") !== -1 || t.indexOf("tos") !== -1 || t.indexOf("tose") !== -1 ||
        t.indexOf("gripe") !== -1 || t.indexOf("resfri") !== -1 || t.indexOf("moco") !== -1 ||
        t.indexOf("respir") !== -1
      ) {
        urgencia = "Amarilla (Respiratoria)";
        servicio = "Consulta Respiratoria";
        triageAnalysis.sintomasDetectados.push("Síntoma respiratorio (tos / estornudo)");

        resp = "🫁 **Sobre estornudos, tos y dificultades respiratorias:**\n\n" +
               "• **Estornudos seguidos:** Suelen ser causados por polvo, polen, alérgenos o algún cuerpo extraño (como briznas de pasto) atascado en su fosa nasal.\n" +
               "• **Tos seca como si se atragantara:** Muy común en la Traqueobronquitis Infecciosa ('Tos de las perreras') o colapso traqueal en perros pequeños.\n" +
               "• **Secreción con moco o decaimiento:** Indica infección bacteriana o viral que necesita antibióticos veterinarios específicos.\n\n" +
               "💡 **Cuidados inmediatos:** Mantenlo abrigado sin corrientes de aire, evita desinfectantes o ambientadores cerca y no le des jarabes humanos.";
      }

      // 6. OJOS, LEGAÑAS, LAGRIMEO Y CONJUNTIVITIS
      else if (
        t.indexOf("ojo") !== -1 || t.indexOf("legañ") !== -1 || t.indexOf("lagrime") !== -1 ||
        t.indexOf("conjuntiv") !== -1 || t.indexOf("rojo el ojo") !== -1 || t.indexOf("cierra el ojo") !== -1
      ) {
        urgencia = "Amarilla (Oftalmología)";
        servicio = "Consulta Oftalmológica";
        triageAnalysis.sintomasDetectados.push("Molestia ocular / secreción");

        resp = "👁️ **Sobre ojos llorosos, legañas o enrojecimiento:**\n\n" +
               "• **Causas habituales:** Conjuntivitis alérgica o bacteriana, rasguño/úlcera en la córnea, o ingreso de polvo.\n" +
               "• **Limpieza segura en casa:** Limpia el ojo de adentro hacia afuera usando una gasa estéril humedecida con **suero fisiológico** (nunca algodón ni manzanilla casera).\n" +
               "• ⛔ **ALERTA CRÍTICA:** Jamás apliques gotas con corticoides humanos (dexametasona). Si tu mascota tiene una úlcera en la córnea, el corticoide puede perforar el ojo en 24 horas.\n\n" +
               "Si el ojo está cerrado con dolor o legaña espesa, tráelo a consulta médica.";
      }

      // 7. VÓMITOS PUNTUALES
      else if (t.indexOf("vomit") !== -1 || t.indexOf("vomitó") !== -1 || t.indexOf("arcad") !== -1) {
        urgencia = "Amarilla (Gastroenterología)";
        servicio = "Consulta Digestiva";
        triageAnalysis.sintomasDetectados.push("Vómitos");

        resp = "🤢 **Protocolo médico ante vómitos:**\n\n" +
               "• **Vómito amarillo con espuma:** Es bilis; ocurre por estómago vacío prolongado o gastritis.\n" +
               "• **Vómito con comida sin digerir:** Regurgitación por comer con desesperación o intolerancia al alimento.\n" +
               "• **Vómito con sangre o heces:** Alerta roja; tráelo de urgencia.\n\n" +
               "💡 **Pasos en casa:**\n" +
               "1. Retira comida sólida por 6 a 8 horas para desinflamar el estómago.\n" +
               "2. Ofrece agua fresca o suero en pequeñas cantidades (cucharaditas cada 20 minutos).\n" +
               "3. Si vomita más de 2 veces en el día, ven a la clínica para evitar deshidratación.";
      }

      // 8. DIARREA O HECES BLANDAS
      else if (t.indexOf("diarre") !== -1 || t.indexOf("caca") !== -1 || t.indexOf("defec") !== -1 || t.indexOf("suelta") !== -1) {
        urgencia = "Amarilla (Digestiva)";
        servicio = "Consulta Digestiva";
        triageAnalysis.sintomasDetectados.push("Diarrea");

        resp = "💩 **Manejo de diarrea en perros y gatos:**\n\n" +
               "• **Dieta blanda de recuperación:** Prepara arroz blanco bien sancochado con pechuga de pollo desmenuzada (hervida solo en agua, sin sal, sin aceite, sin cebolla).\n" +
               "• **Líquidos:** Asegura que beba agua para reponer lo perdido.\n" +
               "• 🚨 **Alerta:** Si las heces tienen sangre roja, aspecto oscuro/alquitrán o mal olor penetrante, tráelo urgente para descartar Parvovirus o parásitos severos.";
      }

      // 9. INAPETENCIA O NO QUIERE COMER
      else if (t.indexOf("no come") !== -1 || t.indexOf("inapet") !== -1 || t.indexOf("decaid") !== -1 || t.indexOf("triste") !== -1 || t.indexOf("sin ganas") !== -1) {
        urgencia = "Amarilla (Clínica)";
        servicio = "Consulta Médica General";
        triageAnalysis.sintomasDetectados.push("Inapetencia / Decaimiento");

        resp = "🥣 **Sobre la falta de apetito y decaimiento:**\n\n" +
               "• **Causas comunes:** Fiebre, dolor de muelas/encías, gastritis, infección viral o cambio brusco de alimento.\n" +
               "• **Prueba en casa:** Ofrécele un poquito de pollo sancochado tibio o comida húmeda en lata para estimular su olfato.\n" +
               "• Si pasa más de 24 horas sin comer nada, o notas su nariz y orejas muy calientes (fiebre), debe ser evaluado por el veterinario.";
      }

      // 10. ALIMENTOS PERMITIDOS Y SEGUROS (Huevo, Arroz, Pollo, Frutas)
      else if (
        t.indexOf("arroz") !== -1 || t.indexOf("huevo") !== -1 || t.indexOf("pollo") !== -1 ||
        t.indexOf("platano") !== -1 || t.indexOf("plátano") !== -1 || t.indexOf("manzana") !== -1 ||
        t.indexOf("zanahoria") !== -1 || t.indexOf("sandia") !== -1 || t.indexOf("sandía") !== -1
      ) {
        urgencia = "Verde (Nutricional)";
        servicio = "Nutrición Veterinaria";
        resp = "🍗 **Alimentos humanos que SÍ puede comer tu mascota:**\n\n" +
               "• **Huevo:** ¡Muy nutritivo! Siempre cocido o hervido (aporta proteínas y biotina para el pelaje). Nunca crudo por riesgo de Salmonella.\n" +
               "• **Arroz blanco:** Excelente, hervido solo con agua (sin sal ni ajo). Ideal ante problemas estomacales.\n" +
               "• **Pechuga de pollo:** Proteína magra perfecta, sancochada y sin huesos.\n" +
               "• **Zanahoria:** Cruda para limpiar sarro o cocida como premio bajo en calorías.\n" +
               "• **Manzana y Plátano:** En trocitos con moderación. Retira siempre el corazón y semillas de la manzana.";
      }

      // 11. ALIMENTOS TÓXICOS Y PELIGROSOS
      else if (
        t.indexOf("chocolate") !== -1 || t.indexOf("cebolla") !== -1 || t.indexOf("uva") !== -1 ||
        t.indexOf("ajo") !== -1 || t.indexOf("palta") !== -1 || t.indexOf("aguacate") !== -1 ||
        t.indexOf("hueso") !== -1 || t.indexOf("leche") !== -1 || t.indexOf("comida humana") !== -1
      ) {
        urgencia = "Amarilla (Toxicología)";
        servicio = "Consulta de Toxicología";
        triageAnalysis.sintomasDetectados.push("Consulta de alimentos prohibidos");

        resp = "🚫 **Alimentos Prohibidos y Tóxicos para Mascotas:**\n\n" +
               "• **Chocolate/Cacao:** Contiene teobromina; causa taquicardia, temblores y puede ser letal.\n" +
               "• **Cebolla y Ajo:** Destruyen los glóbulos rojos, provocando anemia hemolítica.\n" +
               "• **Uvas y Pasas:** Altamente tóxicas; inducen fallo renal agudo fulminante.\n" +
               "• **Palta (Aguacate):** Contiene persina y grasa que detona pancreatitis aguda.\n" +
               "• **Huesos cocidos:** Se astillan y perforan esófago, estómago o intestinos.\n" +
               "• **Leche de vaca:** Causa diarreas severas y cólicos por falta de lactasa en perros y gatos.\n\n" +
               "Si ingirió alguno de estos alimentos, acude a nuestra clínica de inmediato.";
      }

      // 12. ESTERILIZACIÓN, CASTRACIÓN Y CELO
      else if (
        t.indexOf("esteriliz") !== -1 || t.indexOf("castr") !== -1 || t.indexOf("celo") !== -1 ||
        t.indexOf("operar") !== -1 || t.indexOf("camada") !== -1 || t.indexOf("reproduc") !== -1
      ) {
        urgencia = "Verde (Cirugía preventiva)";
        servicio = "Cirugía y Esterilización";
        resp = "🩺 **Sobre la Esterilización y Castración:**\n\n" +
               "• **Edad ideal:** A partir de los 5 a 6 meses de edad.\n" +
               "• **En hembras:** Previene la infección uterina mortal (piometra) y el cáncer de mama.\n" +
               "• **En machos:** Evita cáncer testicular, problemas de próstata y reduce el marcaje con orina.\n" +
               "• **En Pelitos:** Realizamos la cirugía con monitoreo anestésico y recuperación el mismo día.\n\n" +
               "¿Deseas agendar una evaluación prequirúrgica para tu mascota?";
      }

      // 13. PELITOS MÓVIL Y ATENCIÓN A DOMICILIO
      else if (
        t.indexOf("domicilio") !== -1 || t.indexOf("movil") !== -1 || t.indexOf("móvil") !== -1 ||
        t.indexOf("van") !== -1 || t.indexOf("casa") !== -1 || t.indexOf("recojo") !== -1
      ) {
        urgencia = "Verde (Domicilio)";
        servicio = "Pelitos Móvil (A Domicilio)";
        resp = "🚐 **Pelitos Móvil — A Domicilio en Huánuco:**\n\n" +
               "• **Zonas:** Huánuco Cercado, Amarilis, Pillco Marca y alrededores.\n" +
               "• **Servicios:** Consulta veterinaria, vacunas, desparasitación y traslado seguro para cirugías o peluquería.\n" +
               "• **Cero estrés:** Ideal para mascotas que se ponen nerviosas al viajar.\n\n" +
               "Para agendar la van a tu casa, escríbenos por WhatsApp con tu dirección.";
      }

      // 14. VACUNAS (CALENDARIO COMPLETO)
      else if (t.indexOf("vacun") !== -1 || t.indexOf("distemper") !== -1 || t.indexOf("parvovirus") !== -1 || t.indexOf("rabia") !== -1) {
        urgencia = "Verde (Preventiva)";
        servicio = "Vacunación";
        resp = "💉 **Calendario de Vacunación Recomendado:**\n\n" +
               "🐶 **En Perros:**\n" +
               "• 45 días: Vacuna Puppy (Parvovirus + Moquillo).\n" +
               "• 2 meses: Pentavalente (Parvovirus, Moquillo, Hepatitis, Adenovirus, Parainfluenza).\n" +
               "• 3 meses: Refuerzo Séxtuple (+ Leptospira).\n" +
               "• 4 meses: Vacuna Antirrábica obligatoria.\n" +
               "• Refuerzo anual toda la vida.\n\n" +
               "🐱 **En Gatos:** Triple Felina a los 2 meses, refuerzo a los 3 meses y Antirrábica a los 4 meses.\n\n" +
               "¿Qué edad tiene tu consentido para indicarte la vacuna exacta?";
      }

      // 15. BAÑOS Y PELUQUERÍA
      else if (t.indexOf("baño") !== -1 || t.indexOf("corte") !== -1 || t.indexOf("peluquer") !== -1 || t.indexOf("grooming") !== -1) {
        urgencia = "Verde (Estética)";
        servicio = "Pelitos Estética";
        resp = "✂️ **Servicios de Pelitos Estética Canina:**\n\n" +
               "Nuestros paquetes incluyen:\n" +
               "• Baño con agua tibia y champú hipoalergénico medicado.\n" +
               "• Secado profesional sin jaulas de estrés.\n" +
               "• Corte de raza o higiénico por **groomer certificada**.\n" +
               "• Corte y limado de uñas, limpieza de oídos y perfume.\n\n" +
               "¿Para qué raza de perrito o gatito deseas reservar turno?";
      }

      // 16. HORARIOS Y UBICACIÓN
      else if (
        t.indexOf("horario") !== -1 || t.indexOf("hora") !== -1 || t.indexOf("donde") !== -1 ||
        t.indexOf("dónde") !== -1 || t.indexOf("direccion") !== -1 || t.indexOf("dirección") !== -1 ||
        t.indexOf("abren") !== -1 || t.indexOf("domingo") !== -1 || t.indexOf("feriado") !== -1
      ) {
        urgencia = "Verde (Información)";
        servicio = "Información General";
        resp = "📍 **Dirección y Horarios de Atención:**\n\n" +
               "• **Dirección:** Jr. Leoncio Prado N.° 1336, Huánuco, Perú.\n" +
               "• **Horario:** Lunes a sábado de 8:30 a.m. a 8:00 p.m. (horario continuo).\n" +
               "• **Domingos:** Urgencias y atención previa coordinación por WhatsApp.\n" +
               "• **WhatsApp:** +51 939 356 376 (Consultorio) / +51 948 426 656 (Estética).\n\n" +
               "¡Te esperamos con tu mascota en Jr. Leoncio Prado 1336!";
      }

      // 17. TEMBLORES O DOLOR
      else if (t.indexOf("tiembla") !== -1 || t.indexOf("temblor") !== -1 || t.indexOf("dolor") !== -1 || t.indexOf("queja") !== -1 || t.indexOf("llora") !== -1) {
        urgencia = "⚠️ Amarilla (Dolor / Temblores)";
        servicio = "Consulta Médica General";
        triageAnalysis.sintomasDetectados.push("Temblores / Dolor");

        resp = "⚠️ **Orientación ante temblores o quejidos:**\n\n" +
               "Los temblores pueden deberse a:\n" +
               "• **Dolor agudo:** En columna, cuello o estómago.\n" +
               "• **Fiebre o frío:** Revisa si sus orejitas están ardiendo o muy heladas.\n" +
               "• **Baja de azúcar (hipoglucemia):** Frecuente en cachorros pequeños que comieron poco.\n" +
               "• **Intoxicación:** Si se acompaña de salivación excesiva o pupilas dilatadas.\n\n" +
               "Abrígalo de inmediato y ven a la clínica para tomarle la temperatura y auscultarlo.";
      }

      // 18. GATOS Y CUIDADOS FELINOS
      else if (t.indexOf("gato") !== -1 || t.indexOf("gata") !== -1 || t.indexOf("arenero") !== -1) {
        urgencia = "Amarilla (Medicina Felina)";
        servicio = "Medicina Felina";
        resp = "🐱 **Cuidados Especiales para Felinos:**\n\n" +
               "• **Si orina fuera del arenero o le cuesta:** Alerta de infección urinaria o cristales (urgencia en machos).\n" +
               "• **Agua:** Los gatos no beben suficiente agua; dales comida húmeda (latas o sobres) para proteger sus riñones.\n" +
               "• **Vacunas:** Requieren Triple Felina anual y descarte de Leucemia Viral.\n\n" +
               "¿Qué síntoma o comportamiento específico has notado en tu gatito?";
      }

      // 19. RESPUESTA PUNTUAL PERSONALIZADA PARA CUALQUIER OTRA CONSULTA
      else {
        var temaConsulta = texto.replace(/[?¿!¡]/g, "").trim();
        if (temaConsulta.length > 50) temaConsulta = temaConsulta.substring(0, 47) + "...";

        resp = "Entiendo tu consulta sobre *\"" + temaConsulta + "\"*. 🐾\n\n" +
               "Para responderte con la indicación exacta para tu caso:\n" +
               "1. ¿Qué mascota tienes (perro o gato) y qué edad tiene?\n" +
               "2. ¿Desde cuándo notas esta situación?\n" +
               "3. ¿Presenta algún otro síntoma como vómitos, decaimiento o falta de apetito?\n\n" +
               "Detállame esos puntos y te doy la respuesta veterinaria precisa de inmediato.";
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

    var payload = {
      contents: contents,
      tools: [
        {
          googleSearch: {}
        }
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800
      }
    };

    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify(payload)
      });

      // Si el modelo rechaza tools en esta cuenta, reintentar de forma transparente sin tools
      if (!response.ok && (response.status === 400 || response.status === 404)) {
        delete payload.tools;
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      var data = await response.json();
      var candidate = data.candidates && data.candidates[0];
      var respuestaTexto = candidate &&
                           candidate.content &&
                           candidate.content.parts &&
                           candidate.content.parts[0] &&
                           candidate.content.parts[0].text;

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
      '          <span class="ia-badge-gemini" title="Conectado a la Búsqueda de Google en tiempo real">Gemini 🌐 Web</span>' +
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
      '      <p>Puedo ayudarte con orientación de salud de tu mascota, vacunas, servicios de peluquería o agendar una cita. ¡También investigo en internet en tiempo real para resolver cualquier duda médica o de cuidados!</p>' +
      '      <div class="ia-quick-chips" id="ia-quick-chips">' +
      '        <button type="button" class="ia-chip" data-ia-prompt="¿Qué alimentos humanos son tóxicos o peligrosos para perros y gatos?">🥗 Alimentos prohibidos</button>' +
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
