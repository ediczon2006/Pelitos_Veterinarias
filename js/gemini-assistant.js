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
 *      - Con API Key: Conecta directamente con Google Gemini API (responde TODO).
 *      - Sin API Key: Motor clínico local inteligente en español (Zero-Crash Fallback).
 * ==============================================================================
 */

(function (window, document) {
  "use strict";

  /* ==========================================================================
     1. CONFIGURACIÓN Y CONTEXTO INSTITUCIONAL
     ========================================================================== */
  var CONFIG = {
    apiKey: localStorage.getItem("pelitos_gemini_api_key") || "",
    model: "gemini-1.5-flash",
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
    "1. RESPONDE SIEMPRE Y DIRECTAMENTE: Responde CUALQUIER pregunta que te hagan, sin importar cómo esté formulada. " +
    "No importa si usan jerga, palabras incompletas, preguntas cortas o largas; siempre da una respuesta completa y útil. " +
    "NUNCA respondas con 'no entiendo' o pidas que reformulen; interpreta el sentido de la pregunta.\n" +
    "2. Orientación, no diagnóstico final: Puedes orientar sobre síntomas (vómitos, inapetencia, parásitos, vacunas), pero siempre aclara que se requiere evaluación física presencial.\n" +
    "3. Seguridad farmacológica: NUNCA recetes medicamentos ni dosis (especialmente tóxicos comunes como paracetamol o ibuprofeno en perros/gatos).\n" +
    "4. Detección de Urgencias: Si el animal presenta convulsiones, sangrado profuso, dificultad respiratoria severa, hinchazón abdominal súbita o ingestión de veneno, califica como 'URGENCIA ALTA' e indica acudir inmediatamente a Jr. Leoncio Prado 1336 o llamar al WhatsApp.\n" +
    "5. Servicios disponibles en Pelitos: Consulta médica, Medicina preventiva (vacunas y desparasitación), Laboratorio clínico propio (análisis de sangre y heces), Cirugías menores, Pelitos Estética (baños medicados, cortes de raza con groomer certificada) y PetShop.\n" +
    "6. Investigación en Tiempo Real: Tienes habilitada la herramienta de Búsqueda de Google (Google Search Grounding). Úsala proactivamente para consultas sobre razas específicas, síntomas atípicos, nutrición, alimentos o plantas tóxicas, compatibilidad de productos, o avances veterinarios.\n" +
    "7. AUTOSUFICIENCIA TOTAL (SIN ENLACES EXTERNOS): Redacta y explica TODOS los datos, síntomas, causas, recomendaciones y cuidados médicos DIRECTAMENTE en tu respuesta de forma completa, clara y didáctica. NUNCA le digas al usuario que vaya a buscar a Google o a enlaces externos; entrega toda la información explicada en este mismo mensaje.\n" +
    "8. Respuestas estructuradas con viñetas y emojis amigables. Al final de tu respuesta siempre ofrece coordinar la atención presencial por WhatsApp.\n" +
    "9. Temas fuera de veterinaria: Si la pregunta no tiene nada que ver con animales, mascotas o la veterinaria, respóndela de forma amable pero breve, y luego recuerda que tu especialidad es el cuidado de mascotas.";

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
     2. MOTOR CLÍNICO LOCAL INTELIGENTE — RESPONDE CUALQUIER PREGUNTA
     ========================================================================== */

  /**
   * Base de conocimiento veterinario: cada entrada tiene un array de "señales"
   * (palabras o fragmentos) que disparan esa respuesta, y la respuesta detallada.
   * El motor recorre todas las entradas y acumula puntuación para encontrar
   * la respuesta más relevante, en lugar de hacer match rígido de la primera que encaja.
   */
  var KNOWLEDGE_BASE = [
    /* ------------------------------------------------------------------ EMERGENCIAS */
    {
      id: "emergencia",
      urgencia: "🚨 ROJA (EMERGENCIA INMEDIATA)",
      servicio: "Atención Médica de Emergencia",
      señales: [
        "veneno","envenena","intoxic","sangr","convuls","no respira","atropell",
        "ahog","asfixi","desmay","colapso","no reacciona","no mueve","moribund",
        "shock","electrocucion","quemadura grave","fractura abierta","hemorrag"
      ],
      respuesta: function(t) {
        return (
          "⚠️ **¡ATENCIÓN! Posible EMERGENCIA veterinaria crítica.**\n\n" +
          "No intentes remedios caseros. Traslada a tu mascota **de inmediato** a:\n\n" +
          "📍 **Jr. Leoncio Prado N.° 1336, Huánuco**\n" +
          "📞 **WhatsApp de Urgencias:** +51 939 356 376\n\n" +
          "✅ **Mientras llegas:**\n" +
          "• Mantenla calmada y abrigada (si no tiene dificultad respiratoria).\n" +
          "• No le des agua ni comida ni medicamentos.\n" +
          "• Si tuvo un golpe, cárgala horizontalmente sobre una tabla o toalla.\n" +
          "• Si ingirió algo tóxico, lleva el envase o el nombre de la sustancia.\n\n" +
          "Avisa al equipo médico por WhatsApp que estás en camino."
        );
      }
    },

    /* ------------------------------------------------------------------ PRECIOS */
    {
      id: "precios",
      urgencia: "Verde (Comercial)",
      servicio: "Información de Tarifas",
      señales: [
        "precio","costo","cuanto","cuánto","tarifa","vale","cobran","presupuesto",
        "cuanto cobra","cuanto cuesta","cuánto cuesta","quanto","cobro","caro","barato","oferta"
      ],
      respuesta: function(t) {
        return (
          "💰 **Precios y Tarifas de Pelitos Veterinaria:**\n\n" +
          "• **Consulta Médica General:** S/ 25 - S/ 30 (revisión clínica integral, pesaje y temperatura).\n" +
          "• **Vacunas individuales:** S/ 35 a S/ 50 (Puppy, Pentavalente, Séxtuple o Antirrábica con carnet oficial).\n" +
          "• **Desparasitación interna:** S/ 15 a S/ 25 según el peso de tu mascota.\n" +
          "• **Baño y Peluquería Canina:** Desde S/ 25 (razas pequeñas: Shih Tzu, Poodle, Chihuahua), " +
            "S/ 35 (medianas), hasta S/ 50-70 (grandes). Incluye corte de uñas, limpieza de oídos y perfume.\n" +
          "• **Hemograma completo en laboratorio:** S/ 35 - S/ 45 con entrega en el día.\n" +
          "• **Esterilización/Castración:** Desde S/ 150 a S/ 220 según tamaño (incluye anestesia y seguimiento).\n\n" +
          "¿Deseas el presupuesto exacto para tu mascota? Dime la raza y el peso y te damos el precio preciso."
        );
      }
    },

    /* ------------------------------------------------------------------ PIEL / PARÁSITOS */
    {
      id: "piel_parasitos",
      urgencia: "Amarilla (Dermatología)",
      servicio: "Dermatología y Antiparasitarios",
      señales: [
        "rasca","rascan","pica","picazon","picazón","pulga","garrapata","sarna","cae el pelo",
        "caida de pelo","caída de pelo","alopecia","hongo","caspa","dermatit","mancha en la piel",
        "costra","herida","llaga","rojez","roncha","alergia en la piel","irritacion","irritación",
        "piel seca","pelada","escama"
      ],
      respuesta: function(t) {
        return (
          "🩺 **Problemas de piel, rascado y parásitos:**\n\n" +
          "Las causas más frecuentes del rascado intenso son:\n\n" +
          "🦟 **Pulgas y garrapatas:**\n" +
          "• Una sola pulga puede causar picazón intensa durante semanas.\n" +
          "• Busca puntitos negros (excremento de pulgas) al separar el pelo.\n" +
          "• **Solución:** Tabletas masticables modernas (Simparica, Bravecto o NexGard) eliminan " +
            "pulgas y garrapatas en horas y protegen por 1 a 3 meses sin baños ni aplicaciones externas.\n\n" +
          "🍄 **Hongos y Sarna:**\n" +
          "• Los hongos generan zonas redondeadas sin pelo, con costras grises.\n" +
          "• La sarna causa picazón severa con costras en bordes de orejas, codos y abdomen.\n" +
          "• **Requieren un raspado cutáneo rápido en nuestro laboratorio** para aplicar el tratamiento exacto.\n\n" +
          "💊 **Alergias:**\n" +
          "• La Dermatitis Alérgica Alimentaria aparece como rojez en patas, abdomen y orejas.\n" +
          "• La alergia ambiental (ácaros del polvo, pólenes) se manifiesta con patas lamidas y cara frotada.\n\n" +
          "⚠️ **Importante:** Nunca uses cremas humanas con betametasona o corticoides, " +
          "porque empeoran hongos y bacterias. Ven a la clínica para el diagnóstico correcto."
        );
      }
    },

    /* ------------------------------------------------------------------ RESPIRATORIO */
    {
      id: "respiratorio",
      urgencia: "Amarilla (Respiratoria)",
      servicio: "Consulta Respiratoria",
      señales: [
        "estornud","tos","tose","gripe","resfri","moco","respir","jadea","jadeo",
        "respira mal","dificultad para respirar","ronquido","ronca","silba al respirar",
        "nariz tapada","congestion","pecho","pulmon"
      ],
      respuesta: function(t) {
        return (
          "🫁 **Problemas respiratorios en mascotas:**\n\n" +
          "**Estornudos frecuentes:**\n" +
          "• Pueden ser por polvo, pólenes o algún cuerpo extraño (brizna, hierba) en la fosa nasal.\n" +
          "• Si hay secreción amarilla o verde, hay infección bacteriana que necesita antibiótico veterinario.\n\n" +
          "**Tos seca repetitiva (como si se atragantara):**\n" +
          "• Muy común en la *Traqueobronquitis Infecciosa* ('Tos de las perreras'), " +
            "altamente contagiosa entre perros. Se trata con antibióticos y reposo.\n" +
          "• En perros pequeños (Chihuahua, Poodle, Yorkshire), puede ser colapso traqueal: " +
            "requiere diagnóstico y manejo crónico.\n\n" +
          "**Jadeo excesivo:**\n" +
          "• Si no es por calor ni ejercicio, puede indicar dolor, anemia o problemas cardíacos.\n\n" +
          "💡 **Cuidados en casa:** Mantenlo abrigado y lejos de corrientes de aire. " +
          "No uses desinfectantes o ambientadores en aerosol cerca de la mascota. " +
          "Nunca le des jarabes o pastillas humanas para la tos.\n\n" +
          "Si lleva más de 48 horas con síntomas, tráelo a consulta para auscultación pulmonar."
        );
      }
    },

    /* ------------------------------------------------------------------ OJOS */
    {
      id: "ojos",
      urgencia: "Amarilla (Oftalmología)",
      servicio: "Consulta Oftalmológica",
      señales: [
        "ojo","legañ","lagrime","conjuntiv","rojo el ojo","cierra el ojo","tercer parpado",
        "nube en el ojo","catarata","ceguera","no ve","ojo hinchado","golpe en el ojo",
        "ojo azul","ojo blanco","secrecion ocular","ojo cerrado","parpadea mucho"
      ],
      respuesta: function(t) {
        return (
          "👁️ **Problemas oculares en mascotas:**\n\n" +
          "**Causas más frecuentes:**\n" +
          "• **Conjuntivitis alérgica o bacteriana:** Ojos rojos, lagrimeo y secreción " +
            "(amarilla = bacteriana, transparente = alérgica).\n" +
          "• **Úlcera corneal:** El ojo aparece nublado o azulado, con mucho dolor (el animal " +
            "lo mantiene cerrado). Es urgente; puede perder el ojo sin tratamiento en 24-48h.\n" +
          "• **Tercer párpado visible:** Señal de infección o malestar general.\n" +
          "• **Cataratas:** Nube blanca densa en el cristalino; común en perros mayores de 8 años o diabéticos.\n\n" +
          "🧴 **Limpieza segura en casa:**\n" +
          "Limpia el ojo de adentro hacia afuera con una gasa estéril humedecida con " +
          "**suero fisiológico** (nunca algodón suelto, manzanilla ni agua de grifo).\n\n" +
          "⛔ **ALERTA CRÍTICA:** Jamás apliques gotas con corticoides humanos (dexametasona o betametasona). " +
          "Si existe una úlcera corneal, el corticoide puede perforar el ojo en 24 horas.\n\n" +
          "Si el ojo está cerrado con dolor o la legaña es espesa, ven a consulta médica urgente."
        );
      }
    },

    /* ------------------------------------------------------------------ VÓMITOS */
    {
      id: "vomitos",
      urgencia: "Amarilla (Gastroenterología)",
      servicio: "Consulta Digestiva",
      señales: [
        "vomit","vomitó","arcad","regurgit","echa por la boca","bota la comida",
        "bota por la boca","devuelve","vomitar","nausea","náusea","bilis","amarillo con espuma",
        "sale espuma","agua con espuma"
      ],
      respuesta: function(t) {
        return (
          "🤢 **Protocolo médico ante vómitos:**\n\n" +
          "**Tipos de vómito y su significado:**\n\n" +
          "• 🟡 **Vómito amarillo con espuma (bilis):** Ocurre por estómago vacío prolongado o gastritis. " +
            "Frecuente en ayunos de más de 8 horas.\n" +
          "• 🍗 **Vómito con comida sin digerir:** Regurgitación por comer muy rápido, " +
            "intolerancia al alimento o megaesófago.\n" +
          "• 🟢 **Vómito con hierba:** Los perros y gatos a veces comen pasto para purgarse; " +
            "es instintivo y generalmente no es grave.\n" +
          "• 🔴 **Vómito con sangre o posos de café:** Alerta roja; indica úlcera gástrica " +
            "o hemorragia digestiva. Ven a urgencias.\n\n" +
          "💡 **Pasos seguros en casa (si solo ha vomitado 1-2 veces y está alerta):**\n" +
          "1. Retira comida sólida por 6 a 8 horas para desinflamar el estómago.\n" +
          "2. Ofrece agua fresca en pequeñas cantidades (cucharaditas cada 20 min).\n" +
          "3. Después de 8 h, comienza con dieta blanda: arroz cocido + pollo hervido sin sal.\n" +
          "4. Si vomita más de 3 veces en el día, hay decaimiento o sangre, ven a la clínica."
        );
      }
    },

    /* ------------------------------------------------------------------ DIARREA */
    {
      id: "diarrea",
      urgencia: "Amarilla (Digestiva)",
      servicio: "Consulta Digestiva",
      señales: [
        "diarre","caca blanda","caca suelta","caca líquida","caca con sangre","defec",
        "deposicione","heces","hace caca liquida","sueltas","heces blandas",
        "parvovirus","giardia","parásito intestinal","lombrices","ver lombriz"
      ],
      respuesta: function(t) {
        return (
          "💩 **Manejo de diarrea en perros y gatos:**\n\n" +
          "**Causas más comunes:**\n" +
          "• Cambio brusco de alimento o comida nueva.\n" +
          "• Parásitos intestinales (Giardia, Áscaris, Tenias): muy frecuentes en cachorros.\n" +
          "• Infección viral (Parvovirus, Coronavirus canino): suele ir con vómitos, fiebre y decaimiento.\n" +
          "• Estrés o ansiedad por viajes, cambios en el hogar, nuevas mascotas.\n" +
          "• Alimentos prohibidos (leche, grasa, embutidos) o basura ingerida.\n\n" +
          "🍗 **Dieta blanda de recuperación:**\n" +
          "• Arroz blanco bien sancochado + pechuga de pollo desmenuzada (hervida solo en agua, sin sal ni condimentos).\n" +
          "• Asegura agua fresca siempre disponible para reponer líquidos.\n" +
          "• Divide en 3-4 porciones pequeñas al día.\n\n" +
          "🚨 **Ven URGENTE si:**\n" +
          "• Las heces tienen sangre roja o aspecto negro/alquitrán.\n" +
          "• El animal lleva más de 24 horas con diarrea o está muy decaído.\n" +
          "• Es un cachorro menor de 4 meses (Parvovirus puede ser mortal en horas).\n\n" +
          "**Sobre el Parvovirus:** Es altamente contagioso y mortal en no vacunados. " +
          "Síntomas: diarrea con sangre, vómitos, fiebre y decaimiento severo. Requiere hospitalización urgente."
        );
      }
    },

    /* ------------------------------------------------------------------ INAPETENCIA */
    {
      id: "inapetencia",
      urgencia: "Amarilla (Clínica)",
      servicio: "Consulta Médica General",
      señales: [
        "no come","inapet","decaid","triste","sin ganas","no quiere comer","rechaza comida",
        "perdio el apetito","perdió el apetito","no tiene hambre","come poco","come menos",
        "bajó de peso","bajo de peso","flaco","delgado"
      ],
      respuesta: function(t) {
        return (
          "🥣 **Sobre la falta de apetito y decaimiento:**\n\n" +
          "**Causas más frecuentes:**\n" +
          "• **Fiebre:** La nariz y las orejas estarán muy calientes. El animal se ve quieto y sin energía.\n" +
          "• **Dolor dental o en encías:** Pueden sentir dolor al masticar y evitan la comida.\n" +
          "• **Gastritis o malestar estomacal:** Puede ir acompañado de vómito de bilis por la mañana.\n" +
          "• **Cambio de alimento:** Si cambiaste la marca o el tipo de comida, el animal puede rechazarla inicialmente.\n" +
          "• **Infección viral o bacteriana:** Especialmente en cachorros no vacunados.\n" +
          "• **Estrés:** Nuevos animales, mudanzas, cambios de rutina.\n\n" +
          "🍗 **Prueba en casa:**\n" +
          "Ofrécele un poquito de pollo sancochado tibio o comida húmeda en lata para estimular el olfato. " +
          "A veces funciona calentarla ligeramente (que despida aroma).\n\n" +
          "⏱️ **Cuándo ir a la clínica:**\n" +
          "• Si pasa más de 24 horas sin comer absolutamente nada.\n" +
          "• Si además tiene fiebre, vómitos o está muy decaído.\n" +
          "• En cachorros: más de 12 horas sin comer ya es motivo de consulta urgente."
        );
      }
    },

    /* ------------------------------------------------------------------ ALIMENTOS SEGUROS */
    {
      id: "alimentos_seguros",
      urgencia: "Verde (Nutricional)",
      servicio: "Nutrición Veterinaria",
      señales: [
        "puede comer","que come","que le doy","que darle","arroz","huevo","pollo",
        "platano","plátano","manzana","zanahoria","sandia","sandía","camote","papa",
        "atun","sardina","puede comer fruta","comida para perro","que darle de comer",
        "alimento","nutricion","nutrición","dieta","comida casera para","comida natural"
      ],
      respuesta: function(t) {
        return (
          "🍗 **Alimentos humanos que SÍ puede comer tu mascota:**\n\n" +
          "✅ **Seguros y nutritivos:**\n" +
          "• **Huevo hervido o cocido:** Muy nutritivo; aporta proteínas y biotina para el pelaje. Nunca crudo (riesgo de Salmonella y bloqueo de biotina).\n" +
          "• **Arroz blanco hervido:** Excelente sin sal ni aceite. Ideal ante problemas estomacales.\n" +
          "• **Pechuga de pollo:** Proteína magra perfecta, sancochada sin huesos, sin sal ni ajo.\n" +
          "• **Zanahoria:** Cruda funciona como 'mordedor natural' para limpiar sarro. Cocida como premio bajo en calorías.\n" +
          "• **Manzana (sin semillas ni corazón):** Buena fuente de fibra y vitamina C. En trocitos pequeños.\n" +
          "• **Plátano/Banana:** En pequeñas cantidades. Rico en potasio, pero alto en azúcar.\n" +
          "• **Sandía (sin pepas ni cáscara):** Hidratante y baja en calorías.\n" +
          "• **Atún o sardina en agua (sin sal):** Buena fuente de Omega-3 para el pelaje. Solo como suplemento ocasional.\n" +
          "• **Camote hervido:** Fuente de betacaroteno y fibra. Bien tolerado por la mayoría de perros.\n\n" +
          "⚖️ **Regla de oro:** Los alimentos caseros no deben superar el 20% de su dieta total. " +
          "El resto debe ser un alimento balanceado de calidad apropiado para su edad y tamaño."
        );
      }
    },

    /* ------------------------------------------------------------------ ALIMENTOS TÓXICOS */
    {
      id: "alimentos_toxicos",
      urgencia: "Amarilla (Toxicología)",
      servicio: "Consulta de Toxicología",
      señales: [
        "chocolate","cebolla","uva","ajo","palta","aguacate","hueso cocido","leche",
        "comida humana","pasas","nuez","macadamia","cafeina","café","alcohol","sal",
        "azucar artificial","xilitol","goma de mascar","chicle","limon","citrico",
        "alimento prohibido","toxico para","veneno","intoxicacion alimentaria","comio","comió"
      ],
      respuesta: function(t) {
        return (
          "🚫 **Alimentos Prohibidos y Tóxicos para Mascotas:**\n\n" +
          "• 🍫 **Chocolate y Cacao:** Contiene teobromina y cafeína. Causa vómitos, diarrea, taquicardia, " +
            "temblores y convulsiones. El chocolate negro es el más peligroso. **Dosis letal: ~10g por kg.**\n" +
          "• 🧅 **Cebolla y Ajo (crudos, cocidos o en polvo):** Destruyen los glóbulos rojos, provocando " +
            "anemia hemolítica grave. El ajo es 5 veces más tóxico que la cebolla por gramo.\n" +
          "• 🍇 **Uvas y Pasas:** Altamente tóxicas; incluso pequeñas cantidades pueden inducir fallo " +
            "renal agudo. El mecanismo exacto aún no se conoce, pero NO existe dosis segura.\n" +
          "• 🥑 **Palta / Aguacate:** Contiene persina en la pulpa, semilla y cáscara. " +
            "Causa vómitos, diarrea y pancreatitis aguda.\n" +
          "• 🦴 **Huesos cocidos:** Se fragmentan en astillas que pueden perforar esófago, estómago o intestinos.\n" +
          "• 🥛 **Leche de vaca:** Causa diarreas y cólicos por deficiencia de lactasa en adultos.\n" +
          "• ☕ **Café y Té:** La cafeína causa hiperactividad, convulsiones y taquicardia.\n" +
          "• 🔵 **Xilitol (chicles, golosinas 'sin azúcar'):** Provoca hipoglucemia severa y fallo hepático fulminante.\n" +
          "• 🥜 **Nuez de macadamia:** Causa debilidad muscular, vómitos, fiebre y temblores en perros.\n\n" +
          "🚨 **Si ingirió alguno de estos alimentos, acude a nuestra clínica de inmediato o llama al +51 939 356 376.**"
        );
      }
    },

    /* ------------------------------------------------------------------ ESTERILIZACIÓN */
    {
      id: "esterilizacion",
      urgencia: "Verde (Cirugía preventiva)",
      servicio: "Cirugía y Esterilización",
      señales: [
        "esteriliz","castr","celo","operar","camada","reproduc","preñ","embaraz",
        "quedo preñada","pariri","parto","gestacion","gestación","piometra",
        "sacar los ovarios","sacar testículos","ligar","ligar trompas"
      ],
      respuesta: function(t) {
        return (
          "🩺 **Esterilización y Castración en Pelitos:**\n\n" +
          "**¿Por qué esterilizar?**\n" +
          "• **En hembras:** Previene la infección uterina mortal (piometra), " +
            "el cáncer de mama (riesgo se reduce en >90% si se hace antes del 2.° celo) " +
            "y los embarazos no deseados.\n" +
          "• **En machos:** Elimina el riesgo de cáncer testicular, reduce los problemas de " +
            "próstata y disminuye comportamientos como marcaje con orina, escapadas y agresión.\n\n" +
          "**Edad ideal:**\n" +
          "• Perros y gatos: **5 a 6 meses de edad** (antes del primer celo en hembras).\n" +
          "• Razas grandes: se puede esperar hasta los 12 meses.\n\n" +
          "**En Pelitos realizamos:**\n" +
          "• Cirugía con monitoreo anestésico completo.\n" +
          "• Recuperación ambulatoria el mismo día en la mayoría de los casos.\n" +
          "• Revisión post-operatoria incluida.\n\n" +
          "**Sobre el celo en perras:**\n" +
          "• El celo ocurre cada 6 meses aprox. (sangrado vaginal, vulva inflamada).\n" +
          "• Durante el celo NO se realiza cirugía; debe esperar 2 meses después.\n\n" +
          "¿Deseas agendar una evaluación prequirúrgica? Escríbenos por WhatsApp."
        );
      }
    },

    /* ------------------------------------------------------------------ VACUNAS */
    {
      id: "vacunas",
      urgencia: "Verde (Preventiva)",
      servicio: "Vacunación",
      señales: [
        "vacun","distemper","parvovirus","rabia","antirrábica","pentavalente",
        "sextuple","triple felina","leucemia","carnet de vacunacion","vacunacion al dia",
        "refuerzo","vacuna anual","primera vacuna","esquema de vacunacion"
      ],
      respuesta: function(t) {
        return (
          "💉 **Calendario de Vacunación Recomendado:**\n\n" +
          "🐶 **En Perros:**\n" +
          "• **45 días:** Vacuna Puppy (Parvovirus + Moquillo/Distemper).\n" +
          "• **2 meses (8 semanas):** Pentavalente " +
            "(Parvovirus, Moquillo, Hepatitis infecciosa, Adenovirus tipo 2, Parainfluenza).\n" +
          "• **3 meses (12 semanas):** Séxtuple (+ Leptospirosis). Refuerzo de la Pentavalente.\n" +
          "• **4 meses (16 semanas):** Vacuna Antirrábica obligatoria por ley.\n" +
          "• **Refuerzo anual** de todas las vacunas de por vida.\n\n" +
          "🐱 **En Gatos:**\n" +
          "• **2 meses:** Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus).\n" +
          "• **3 meses:** Refuerzo de la Triple Felina.\n" +
          "• **4 meses:** Vacuna Antirrábica.\n" +
          "• **Refuerzo anual.** Opcional: vacuna contra Leucemia Viral Felina (FeLV) en gatos con acceso exterior.\n\n" +
          "📌 **Importante:** No vacunes a una mascota enferma, con parásitos o con fiebre. " +
          "El veterinario debe revisarla primero para confirmar que está en condiciones óptimas.\n\n" +
          "¿Qué edad tiene tu consentido para indicarte la vacuna exacta que le toca?"
        );
      }
    },

    /* ------------------------------------------------------------------ BAÑO / PELUQUERÍA */
    {
      id: "estetica",
      urgencia: "Verde (Estética)",
      servicio: "Pelitos Estética",
      señales: [
        "baño","corte","peluquer","grooming","pelo largo","pelo enredado","nudo",
        "cepillado","pelado","rasurado","higienico","uñas","limpieza de oídos",
        "perfume","lazo","moño","spa canino","bañar","cortar el pelo"
      ],
      respuesta: function(t) {
        return (
          "✂️ **Servicios de Pelitos Estética Canina:**\n\n" +
          "Nuestros paquetes de grooming incluyen:\n" +
          "• 🚿 Baño con agua tibia y champú hipoalergénico medicado (dermatológico si lo necesita).\n" +
          "• 💨 Secado profesional sin jaulas de estrés (siempre con personal presente).\n" +
          "• ✂️ Corte de raza estándar o higiénico por **groomer certificada**.\n" +
          "• 🐾 Corte y limado de uñas, limpieza de oídos y perfume final.\n\n" +
          "**Razas más comunes que atendemos:**\n" +
          "Shih Tzu, Poodle (Toy y Miniatura), Bichón Frisé, Yorkshire Terrier, " +
          "Schnauzer, Cocker Spaniel, Labrador, Golden Retriever, Husky y más.\n\n" +
          "**Precios desde:**\n" +
          "• Razas pequeñas: S/ 25\n" +
          "• Razas medianas: S/ 35\n" +
          "• Razas grandes: S/ 50 - S/ 70\n\n" +
          "📲 Para reservar turno con tu groomer favorita, escríbenos al WhatsApp de Estética: +51 948 426 656.\n" +
          "¿Para qué raza deseas reservar turno?"
        );
      }
    },

    /* ------------------------------------------------------------------ HORARIOS / DIRECCIÓN */
    {
      id: "ubicacion",
      urgencia: "Verde (Información)",
      servicio: "Información General",
      señales: [
        "horario","hora","donde","dónde","direccion","dirección","abren","cierran",
        "domingo","feriado","atienden","cuando abren","cuantas horas","leoncio prado",
        "huanuco","huánuco","ubicacion","ubicación","como llegar","mapa","maps"
      ],
      respuesta: function(t) {
        return (
          "📍 **Dirección y Horarios de Atención de Pelitos Veterinaria:**\n\n" +
          "🏥 **Clínica Veterinaria:**\n" +
          "• **Dirección:** Jr. Leoncio Prado N.° 1336, Huánuco, Perú.\n" +
          "• **Horario:** Lunes a sábado de 8:30 a.m. a 8:00 p.m. (horario continuo).\n" +
          "• **Domingos y feriados:** Urgencias con coordinación previa por WhatsApp.\n" +
          "• **WhatsApp Consultorio:** +51 939 356 376\n\n" +
          "✂️ **Pelitos Estética:**\n" +
          "• Misma dirección: Jr. Leoncio Prado N.° 1336.\n" +
          "• **WhatsApp Estética:** +51 948 426 656\n\n" +
          "🗺️ **Cómo llegar:** Estamos en el centro de Huánuco, a pocos pasos del Parque Puelles. " +
          "Puedes buscarnos en Google Maps como 'Pelitos Veterinaria Huánuco'.\n\n" +
          "¡Te esperamos con tu mascota!"
        );
      }
    },

    /* ------------------------------------------------------------------ TEMBLORES / DOLOR */
    {
      id: "dolor_temblores",
      urgencia: "Amarilla (Dolor / Temblores)",
      servicio: "Consulta Médica General",
      señales: [
        "tiembla","temblor","dolor","queja","llora","gime","quejido","cojea","no apoya",
        "no camina","cuesta caminar","le duele","pata hinchada","hinchado","hinchazón",
        "se cae","pierde equilibrio","mareo","columna","espalda","rigidez"
      ],
      respuesta: function(t) {
        return (
          "⚠️ **Orientación ante temblores, dolor o quejidos:**\n\n" +
          "**Causas posibles de temblores:**\n" +
          "• **Dolor agudo:** En columna, articulaciones, abdomen o heridas internas.\n" +
          "• **Fiebre alta:** Revisa si sus orejas y nariz están muy calientes.\n" +
          "• **Hipoglucemia (baja de azúcar):** Frecuente en cachorros pequeños que comieron poco. " +
            "Síntomas: debilidad, temblor, desorientación. Ofrece un poquito de miel en las encías y ve a la clínica.\n" +
          "• **Intoxicación:** Los temblores con salivación excesiva o pupilas dilatadas son señal de urgencia.\n" +
          "• **Frío:** Los perros de razas pequeñas o de pelo corto tiemblan por hipotermia.\n\n" +
          "**Si cojea o no apoya una pata:**\n" +
          "• Puede ser una espina, cortada en la almohadilla, o una torcedura.\n" +
          "• Revisa la pata cuidadosamente; si hay herida, límpiala con agua limpia.\n" +
          "• Si no mejora en 24 horas o hay inflamación, tráelo a revisión.\n\n" +
          "🌡️ Abrígalo de inmediato y ven a la clínica para tomarle la temperatura y evaluarlo."
        );
      }
    },

    /* ------------------------------------------------------------------ GATOS / FELINOS */
    {
      id: "felinos",
      urgencia: "Amarilla (Medicina Felina)",
      servicio: "Medicina Felina",
      señales: [
        "gato","gata","gatito","arenero","orinar fuera","orina fuera","ronronea","ronroneo",
        "bola de pelo","trichobezoar","leucemia felina","felv","fiv","sida del gato",
        "gripe del gato","herpesvirus","calicivirus","toxoplasmosis","embarazo y gato",
        "mujer embarazada gato"
      ],
      respuesta: function(t) {
        return (
          "🐱 **Cuidados Especiales para Felinos:**\n\n" +
          "**Problemas urinarios (muy frecuentes en gatos):**\n" +
          "• Si orina fuera del arenero, se queja al orinar, o va mucho sin producir orina: " +
            "puede ser **obstrucción urinaria** (urgencia crítica en machos) o cistitis.\n" +
          "• Los gatos machos son especialmente propensos a la obstrucción uretral; puede ser mortal en horas.\n" +
          "• **Solución de base:** Aumentar el consumo de agua con comida húmeda (latas/sobres).\n\n" +
          "**Bolas de pelo (Trichobezoares):**\n" +
          "• Normal que los vomiten 1-2 veces al mes. Más de eso indica problema.\n" +
          "• Prevención: Cepillado frecuente y malt/pasta de malta veterinaria.\n\n" +
          "**Toxoplasmosis y embarazo:**\n" +
          "• El riesgo real es MÍNIMO si la dueña no limpia el arenero directamente, usa guantes, " +
            "y el gato no caza ni come carne cruda. No es necesario deshacerse del gato.\n\n" +
          "**Enfermedades virales felinas:**\n" +
          "• **FeLV (Leucemia):** Se contagia por contacto íntimo entre gatos; vacuna disponible.\n" +
          "• **FIV (VIF, 'sida gatuno'):** No se contagia a humanos. Se transmite por mordeduras entre gatos.\n\n" +
          "¿Qué síntoma o comportamiento específico has notado en tu gatito?"
        );
      }
    },

    /* ------------------------------------------------------------------ DESPARASITACIÓN */
    {
      id: "desparasitacion",
      urgencia: "Verde (Preventiva)",
      servicio: "Medicina Preventiva",
      señales: [
        "desparasit","lombriz","gusano","parasito","parásito","tenia","áscaris","ancylostoma",
        "giardia","coccidios","intestino","vers","antiparasit","pastilla antiparásito",
        "antiparasitario","medicina preventiva"
      ],
      respuesta: function(t) {
        return (
          "🪱 **Desparasitación Interna y Externa:**\n\n" +
          "**¿Con qué frecuencia desparasitar?**\n" +
          "• **Cachorros (hasta 6 meses):** Cada 2 semanas hasta los 3 meses, luego mensual hasta los 6 meses.\n" +
          "• **Adultos:** Cada 3 meses (4 veces al año) como mínimo.\n" +
          "• Si conviven con niños pequeños, desparasitar mensualmente es la práctica más segura.\n\n" +
          "**Parásitos más comunes:**\n" +
          "• **Áscaris (Toxocara):** Lombriz redonda, muy común en cachorros. " +
            "Síntomas: barriga abultada, diarrea, tos.\n" +
          "• **Tenia:** Segmentos blancos como granos de arroz en las heces o alrededor del ano.\n" +
          "• **Giardia:** Diarrea blanda crónica, a veces con moco. Difícil de eliminar; requiere tratamiento específico.\n" +
          "• **Ancylostoma (uncinaria):** Causa anemia, sobre todo en cachorros.\n\n" +
          "**Desparasitación externa (pulgas y garrapatas):**\n" +
          "• Pipetas (spot-on), collares antiparasitarios o tabletas masticables (Bravecto, Simparica).\n" +
          "• Las tabletas modernas son las más efectivas y seguras.\n\n" +
          "En Pelitos tenemos todos los antiparasitarios disponibles. Trae el peso de tu mascota para la dosis exacta."
        );
      }
    },

    /* ------------------------------------------------------------------ LABORATORIO */
    {
      id: "laboratorio",
      urgencia: "Verde (Diagnóstico)",
      servicio: "Laboratorio Clínico",
      señales: [
        "analisis","análisis","hemograma","sangre","examen de sangre","heces","orina",
        "laboratorio","bioquimica","bioquímica","perfil hepatico","perfil renal",
        "resultado","plaquetas","leucocitos","eritrocitos","glucosa","urea","creatinina"
      ],
      respuesta: function(t) {
        return (
          "🔬 **Laboratorio Clínico Propio de Pelitos:**\n\n" +
          "Contamos con laboratorio **propio en la clínica**, lo que nos permite entregarte " +
          "resultados el mismo día sin enviarlo a terceros.\n\n" +
          "**Exámenes disponibles:**\n\n" +
          "🩸 **Hemograma Completo (S/ 35-45):**\n" +
          "• Cuenta de glóbulos rojos (eritrocitos), glóbulos blancos (leucocitos) y plaquetas.\n" +
          "• Detecta anemia, infecciones, leucemia, problemas de coagulación.\n\n" +
          "🧪 **Perfil Bioquímico (S/ 50-80):**\n" +
          "• Glucosa, Urea, Creatinina, ALT, AST, Bilirrubina.\n" +
          "• Evalúa la función hepática y renal. Obligatorio antes de cirugía o anestesia.\n\n" +
          "🔍 **Coproparasitológico — Examen de Heces (S/ 20-25):**\n" +
          "• Detecta parásitos intestinales: Giardia, Áscaris, Coccidios, Tenia.\n" +
          "• Trae una muestra fresca en un recipiente limpio (de las últimas 2 horas).\n\n" +
          "💧 **Urianálisis (S/ 25-30):**\n" +
          "• Evalúa función renal, infecciones urinarias y cristales.\n\n" +
          "¿Qué examen necesitas para tu mascota? Te orientamos sobre cuál es el más adecuado."
        );
      }
    },

    /* ------------------------------------------------------------------ RAZAS */
    {
      id: "razas",
      urgencia: "Verde (Informativa)",
      servicio: "Orientación General",
      señales: [
        "raza","golden","labrador","bulldog","poodle","shih tzu","chihuahua","husky",
        "rottweiler","pastor aleman","schnauzer","yorkshire","beagle","dalmata",
        "mestizo","criollo","que raza","cual raza","tipo de perro"
      ],
      respuesta: function(t) {
        return (
          "🐶 **Razas y Cuidados Específicos:**\n\n" +
          "Cada raza tiene necesidades particulares de salud, alimentación y cuidado. " +
          "Aquí un resumen de las más comunes en Huánuco:\n\n" +
          "• **Shih Tzu y Poodle:** Pelo largo que requiere grooming cada 6-8 semanas. " +
            "Propensos a problemas dentales y oculares (legañas).\n" +
          "• **Chihuahua:** Pueden tener hipoglucemia y problemas de rótula (luxación). " +
            "Muy sensibles al frío; abrígarlos en temporada húmeda de Huánuco.\n" +
          "• **Labrador y Golden Retriever:** Propensos a displasia de cadera y obesidad. " +
            "Requieren ejercicio diario y control de peso.\n" +
          "• **Bulldog Francés / Inglés:** Braquicéfalos (cara chata); pueden tener " +
            "dificultad respiratoria en climas calurosos. No exponerlos al calor.\n" +
          "• **Husky Siberiano:** Raza de doble capa; soporta el frío pero le afecta el calor. " +
            "Requiere ejercicio intenso y puede 'gritar' para comunicarse.\n" +
          "• **Mestizos/Criollos:** Generalmente más robustos inmunológicamente. " +
            "Las mismas vacunas y desparasitaciones aplican.\n\n" +
          "¿Tienes alguna consulta específica sobre la raza de tu mascota? Cuéntame más."
        );
      }
    },

    /* ------------------------------------------------------------------ DOMICILIO */
    {
      id: "domicilio",
      urgencia: "Verde (Domicilio)",
      servicio: "Pelitos Móvil (A Domicilio)",
      señales: [
        "domicilio","movil","móvil","van","casa","recojo","a domicilio","vienen a casa",
        "pueden venir","atienden en casa","traen","llevan","servicio a domicilio"
      ],
      respuesta: function(t) {
        return (
          "🚐 **Pelitos Móvil — Servicio a Domicilio en Huánuco:**\n\n" +
          "• **Zonas de cobertura:** Huánuco Cercado, Amarilis, Pillco Marca y alrededores " +
            "(consultar disponibilidad para zonas alejadas).\n" +
          "• **Servicios disponibles a domicilio:**\n" +
          "  - Consulta veterinaria básica.\n" +
          "  - Vacunas y desparasitación.\n" +
          "  - Toma de muestras para laboratorio.\n" +
          "  - Traslado seguro hacia la clínica para cirugías o grooming.\n\n" +
          "• **Ideal para:** Mascotas que se ponen muy nerviosas al transportarse, " +
            "dueños con movilidad limitada, o casos donde el traslado es complicado.\n\n" +
          "📲 Para agendar el servicio a domicilio, escríbenos por WhatsApp al **+51 939 356 376** " +
          "con tu dirección exacta y el servicio requerido."
        );
      }
    },

    /* ------------------------------------------------------------------ COMPORTAMIENTO */
    {
      id: "comportamiento",
      urgencia: "Verde (Conductual)",
      servicio: "Orientación Conductual",
      señales: [
        "muerde","morder","agresiv","ladra mucho","ansied","fobia","miedo","nervios",
        "destruye","rompe cosas","orina en la cama","orina en el sofa","orina dentro",
        "no obedece","portarse mal","comportamiento","conducta","deprimido",
        "come basura","come caca","come excremento","coprofagia","lame mucho"
      ],
      respuesta: function(t) {
        return (
          "🧠 **Orientación sobre Comportamiento y Conducta:**\n\n" +
          "**Agresividad y mordeduras:**\n" +
          "• La agresividad puede ser por miedo, dolor, falta de socialización, o dominancia.\n" +
          "• Lo primero es descartar una causa médica (dolor dental, hipotiroidismo, etc.) " +
            "con una revisión veterinaria.\n" +
          "• Se recomienda trabajar con un entrenador canino certificado para modificación de conducta.\n\n" +
          "**Ansiedad por separación:**\n" +
          "• Síntomas: destrucción de objetos, aullidos, orinar dentro de casa al quedarse solo.\n" +
          "• Estrategias: juguetes interactivos (Kongs), rutinas fijas, ejercicio previo a las salidas.\n\n" +
          "**Coprofagia (comer heces):**\n" +
          "• Puede ser por deficiencia nutricional, aburrimiento o conducta aprendida.\n" +
          "• Descarta parásitos intestinales primero con un examen de heces.\n\n" +
          "**Orina fuera del arenero (en gatos):**\n" +
          "• Descarta infección urinaria o cristales con un análisis de orina.\n" +
          "• Si es conductual, puede ser estrés, arenero sucio o cambio en el hogar.\n\n" +
          "¿Qué comportamiento específico te preocupa? Cuéntame más para orientarte mejor."
        );
      }
    },

    /* ------------------------------------------------------------------ PESO / OBESIDAD */
    {
      id: "peso_obesidad",
      urgencia: "Verde (Nutrición)",
      servicio: "Nutrición y Control de Peso",
      señales: [
        "obeso","gordo","sobrepeso","adelgazar","dieta","bajar de peso","control de peso",
        "cuanto debe pesar","peso ideal","muy flaco","desnutrido","desnutricion"
      ],
      respuesta: function(t) {
        return (
          "⚖️ **Control de Peso y Nutrición en Mascotas:**\n\n" +
          "**¿Cómo saber si tu mascota tiene sobrepeso?**\n" +
          "• Deberías poder sentir sus costillas con una leve presión (sin verlas). " +
            "Si están cubiertas por una capa gruesa de grasa, hay sobrepeso.\n" +
          "• Visto desde arriba, debe tener una cintura marcada detrás de las costillas.\n\n" +
          "**Consecuencias del sobrepeso:**\n" +
          "• Diabetes, problemas articulares, enfermedades cardíacas y menor esperanza de vida.\n\n" +
          "**Cómo ayudarle a adelgazar:**\n" +
          "• Reduce las porciones un 10-20% y elimina los premios calóricos.\n" +
          "• Reemplaza los premios por zanahoria cruda o arroz hinchado sin sal.\n" +
          "• Aumenta el ejercicio gradualmente (2 caminatas al día).\n" +
          "• Pide en Pelitos un **Alimento Balanceado de Control de Peso** (Light) apropiado.\n\n" +
          "**Mascotas muy delgadas:**\n" +
          "• Descarta parásitos (examen de heces), mala absorción intestinal o enfermedades crónicas.\n\n" +
          "¿Quieres que te calculemos la ración diaria recomendada para el peso de tu mascota?"
        );
      }
    }
  ];

  /* ==========================================================================
     MOTOR DE PUNTUACIÓN SEMÁNTICA — Encuentra la respuesta más relevante
     ========================================================================== */
  var LocalTriageEngine = {
    /**
     * Analiza el texto del usuario y retorna la respuesta más relevante.
     * Usa un sistema de puntuación: cada señal que coincide suma 1 punto.
     * La entrada con mayor puntaje gana. Si hay empate o puntaje cero,
     * usa el analizador contextual de último recurso.
     */
    analizarMensaje: function(texto) {
      var t = texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")  // eliminar acentos para matching
        .replace(/[¿¡]/g, "");

      // Detectar tipo de mascota
      if (t.indexOf("perr") !== -1 || t.indexOf("canin") !== -1 || t.indexOf("cachorr") !== -1) {
        triageAnalysis.tipoMascota = "Canino (Perro)";
      } else if (t.indexOf("gat") !== -1 || t.indexOf("felin") !== -1 || t.indexOf("minino") !== -1) {
        triageAnalysis.tipoMascota = "Felino (Gato)";
      }

      // Puntuar cada entrada del banco de conocimiento
      var mejorPuntaje = 0;
      var mejorEntrada = null;

      for (var i = 0; i < KNOWLEDGE_BASE.length; i++) {
        var entrada = KNOWLEDGE_BASE[i];
        var puntaje = 0;

        for (var j = 0; j < entrada.señales.length; j++) {
          var señal = entrada.señales[j]
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (t.indexOf(señal) !== -1) {
            puntaje += 1;
          }
        }

        // Bonus si la señal es larga (más específica)
        if (puntaje > 0 && entrada.id === "emergencia") {
          puntaje += 5; // prioridad máxima para emergencias
        }

        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejorEntrada = entrada;
        }
      }

      // Si encontramos una respuesta relevante
      if (mejorEntrada && mejorPuntaje > 0) {
        triageAnalysis.urgencia = mejorEntrada.urgencia;
        triageAnalysis.servicioSugerido = mejorEntrada.servicio;
        if (mejorEntrada.sintomasDetectados) {
          triageAnalysis.sintomasDetectados.push(mejorEntrada.id);
        }
        return mejorEntrada.respuesta(t);
      }

      // ---------------------------------------------------------------
      // FALLBACK INTELIGENTE: responder cualquier pregunta no categorizada
      // ---------------------------------------------------------------
      triageAnalysis.urgencia = "Verde (Informativa)";
      triageAnalysis.servicioSugerido = "Consulta General";

      // Intentar extraer el tema principal de la pregunta
      var palabrasIgnorar = [
        "que","como","cuando","donde","por","para","una","con","sin","los",
        "las","del","mi","su","se","me","te","le","es","hay","tiene","puede",
        "puedo","puedes","son","fue","quiero","saber","sobre","algo","pero",
        "mas","muy","bien","mal","ya","si","no","el","la","un","en","de","a","y","o"
      ];

      var palabras = texto.toLowerCase()
        .replace(/[¿¡?!.,;:]/g, "")
        .split(/\s+/)
        .filter(function(p) { return p.length > 3 && palabrasIgnorar.indexOf(p) === -1; });

      var temaDetectado = palabras.length > 0 ? palabras[0] : "";

      // Respuesta contextual basada en la longitud y tipo de mensaje
      if (texto.trim().length < 15) {
        // Mensaje muy corto — pedir más detalle
        return (
          "¡Hola! 🐾 Estoy aquí para ayudarte con cualquier duda sobre la salud y cuidado de tu mascota.\n\n" +
          "Para darte la orientación más precisa, cuéntame:\n" +
          "• ¿Qué tipo de mascota tienes y cuántos años tiene?\n" +
          "• ¿Cuál es tu consulta o qué síntoma notas?\n\n" +
          "Estoy listo para responder tu pregunta."
        );
      }

      // Mensaje de longitud normal — responder con orientación veterinaria general
      return (
        "🐾 Entiendo tu consulta" + (temaDetectado ? " sobre **" + temaDetectado + "**" : "") + ".\n\n" +
        "Para darte la respuesta veterinaria más precisa y personalizada, necesito un poco más de contexto:\n\n" +
        "1. **¿Qué tipo de mascota tienes?** (perro, gato, ave, u otro)\n" +
        "2. **¿Qué edad tiene aproximadamente?** (cachorro, adulto, senior)\n" +
        "3. **¿Qué observas exactamente?** Descríbeme el síntoma o situación con el mayor detalle posible.\n\n" +
        "Con esa información te respondo de forma completa y directa. " +
        "También puedes escribir directamente al veterinario por WhatsApp: **+51 939 356 376**."
      );
    }
  };

  /* ==========================================================================
     3. LLAMADA A LA API DE GOOGLE GEMINI
     ========================================================================== */
  async function consultarGeminiAPI(mensajeUsuario) {
    var key = CONFIG.apiKey || localStorage.getItem("pelitos_gemini_api_key");
    if (!key) {
      return LocalTriageEngine.analizarMensaje(mensajeUsuario);
    }

    var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
                   encodeURIComponent(CONFIG.model) + ":generateContent";

    var contents = [
      {
        role: "user",
        parts: [{ text: "Contexto del sistema:\n" + SYSTEM_PROMPT }]
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Soy Pelitos IA y asistiré a los clientes de Pelitos Veterinaria con profesionalismo, empatía y rigor clínico. Responderé CUALQUIER pregunta que me hagan de forma completa y directa." }]
      }
    ];

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
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 900
      }
    };

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 9500) : null;

    try {
      var fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify(payload)
      };
      if (controller) {
        fetchOptions.signal = controller.signal;
      }

      var response = await fetch(endpoint, fetchOptions);

      if (!response.ok && (response.status === 400 || response.status === 404)) {
        delete payload.tools;
        fetchOptions.body = JSON.stringify(payload);
        response = await fetch(endpoint, fetchOptions);
      }

      if (timeoutId) clearTimeout(timeoutId);

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

      LocalTriageEngine.analizarMensaje(mensajeUsuario);

      if (window.PelitosDB && typeof window.PelitosDB.guardarConsultaIA === "function") {
        window.PelitosDB.guardarConsultaIA(triageAnalysis);
      }

      return respuestaTexto;

    } catch (err) {
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
      '<button type="button" class="pelitos-ia-fab" id="btn-toggle-ia" aria-label="Abrir asistente inteligente Pelitos IA" title="Habla con Pelitos IA">' +
      '  <span class="ia-fab-icon-wrap">' +
      '    <svg class="ia-fab-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16.5" rx="3.8" ry="3"/><circle cx="6.5" cy="11.5" r="1.8"/><circle cx="10" cy="8.5" r="1.8"/><circle cx="14" cy="8.5" r="1.8"/><circle cx="17.5" cy="11.5" r="1.8"/></svg>' +
      '    <span class="ia-fab-sparkle">✨</span>' +
      '  </span>' +
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
      '          <span class="ia-badge-gemini" title="Asistente veterinario inteligente">IA Veterinaria</span>' +
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
      '      <p>¡Hola! Soy <strong>Pelitos IA</strong>, tu asistente veterinario en Huánuco. 🐾✨</p>' +
      '      <p>Puedo ayudarte con <strong>cualquier pregunta</strong> sobre salud animal, vacunas, nutrición, razas, comportamiento, peluquería o agendar una cita. ¡Pregúntame lo que quieras!</p>' +
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
      '    <input type="text" id="ia-input-text" class="ia-input" placeholder="Pregunta cualquier cosa sobre tu mascota…" autocomplete="off" maxlength="300" required />' +
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

    // API pública para abrir o cerrar Pelitos IA desde cualquier botón o enlace
    window.PelitosIA = {
      abrir: abrirChat,
      cerrar: cerrarChat
    };

    // Redirección/apertura automática al hacer clic en cualquier elemento con data-abrir-ia o href="#pelitos-ia"
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-abrir-ia], a[href='#pelitos-ia'], a[href$='#pelitos-ia']");
      if (trigger) {
        e.preventDefault();
        abrirChat();
        if (inputText) {
          inputText.placeholder = "¿Qué servicio o duda tienes sobre tu mascota?";
          inputText.focus();
        }
      }
    });

    // Abrir automáticamente si la URL contiene el ancla #pelitos-ia
    if (window.location.hash === "#pelitos-ia" || window.location.hash === "#ia") {
      setTimeout(abrirChat, 400);
    }

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
          agregarMensajeSistema("ℹ️ Modo motor local activado.");
        }
      }
    });

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

    formChat.addEventListener("submit", function (e) {
      e.preventDefault();
      var texto = (inputText.value || "").trim();
      if (!texto) return;
      inputText.value = "";
      enviarMensajeUsuario(texto);
    });

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
      agregarMensajeDOM("user", texto);
      triageAnalysis.historial.push({ rol: "user", texto: texto });

      var typingIndicator = mostrarIndicadorEscribiendo();

      consultarGeminiAPI(texto).then(function (respuesta) {
        if (typingIndicator && typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }

        agregarMensajeDOM("assistant", respuesta);
        triageAnalysis.historial.push({ rol: "assistant", texto: respuesta });
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

      var p = document.createElement("div");
      p.className = "ia-msg-text";

      var textoStr = String(texto || "");
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
