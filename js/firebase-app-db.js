/**
 * ============================================================================
 * Pelitos Veterinaria & Estética — Conector de Base de Datos Google Firestore
 * ============================================================================
 * Arquitectura Enterprise: Sincronización en tiempo real de citas, usuarios,
 * reseñas y triajes clínicos de Pelitos IA con Google Cloud Firestore.
 *
 * RESILIENCIA & OFFLINE-FIRST:
 *   1. Detección automática de conectividad (navigator.onLine y eventos 'online').
 *   2. Cola de sincronización fuera de línea ('pelitos_citas_pendientes').
 *   3. IDs deterministas y no colisionantes con crypto.randomUUID().
 *   4. Límite de cuota defensivo FIFO en localStorage (máx. 50 registros).
 *   5. Compatibilidad estricta con las reglas de seguridad de firestore.rules.
 * ============================================================================
 */

(function (window) {
  'use strict';

  var db = null;
  var auth = null;
  var inicializado = false;
  var sincronizando = false;

  var STORAGE_KEYS = {
    citas: 'pelitos_citas',
    citasPendientes: 'pelitos_citas_pendientes',
    resenas: 'pelitos_resenas'
  };

  /**
   * Generador de identificadores universales seguros (RFC 4122 v4 con fallback)
   */
  function generarUUID() {
    try {
      if (typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
    } catch (_) {}
    var timestamp = Date.now().toString(36);
    var rand = Math.random().toString(36).substring(2, 10);
    return 'plt-' + timestamp + '-' + rand;
  }

  var PelitosDB = {
    estaListo: false,
    modoLocal: true,
    db: null,
    auth: null,
    firestore: null,

    /**
     * Inicializa la conexión con Google Cloud Firestore
     */
    init: async function () {
      if (inicializado) return;
      var cfg = window.PELITOS_FIREBASE_CONFIG;
      if (!cfg || !cfg.apiKey || !cfg.projectId || cfg.apiKey.trim() === "") {
        this.modoLocal = true;
        this.estaListo = true;
        return;
      }

      try {
        var firebaseApp = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        var firestore = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        var firebaseAuth = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

        var app = firebaseApp.initializeApp(cfg);
        db = firestore.getFirestore(app);
        auth = firebaseAuth.getAuth(app);

        this.db = db;
        this.auth = auth;
        this.firestore = firestore;
        this.modoLocal = false;
        this.estaListo = true;
        inicializado = true;

        console.info("[Pelitos DB] Conectado exitosamente a Google Cloud Firestore (" + cfg.projectId + ").");

        // Disparar sincronización de citas creadas fuera de línea
        this.sincronizarColaPendiente();
      } catch (err) {
        console.warn("[Pelitos DB] Fallback local activo. Motivo:", err.message);
        this.modoLocal = true;
        this.estaListo = true;
      }
    },

    /**
     * Encola una cita médica o estética para sincronización posterior cuando haya red
     */
    encolarCitaPendiente: function (citaDoc) {
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.citasPendientes);
        var pendientes = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(pendientes)) pendientes = [];

        // Evitar duplicados por UUID
        var existe = pendientes.some(function (p) {
          return p.uuid === citaDoc.uuid;
        });

        if (!existe) {
          if (pendientes.length >= 50) {
            pendientes = pendientes.slice(-40);
          }
          pendientes.push(citaDoc);
          localStorage.setItem(STORAGE_KEYS.citasPendientes, JSON.stringify(pendientes));
          console.info("[Pelitos DB] Cita encolada fuera de línea para sincronización futura.");
        }
      } catch (errQuota) {
        console.warn("[Pelitos DB] Error al encolar cita pendiente (cuota local):", errQuota);
      }
    },

    /**
     * Sincroniza las citas acumuladas fuera de línea hacia Google Cloud Firestore
     */
    sincronizarColaPendiente: async function () {
      if (sincronizando || this.modoLocal || !db || !this.firestore) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      sincronizando = true;
      try {
        var raw = localStorage.getItem(STORAGE_KEYS.citasPendientes);
        var pendientes = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(pendientes) || pendientes.length === 0) {
          sincronizando = false;
          return;
        }

        console.info("[Pelitos DB] Sincronizando " + pendientes.length + " citas pendientes a Firestore...");
        var colRef = this.firestore.collection(db, 'citas');
        var restantes = [];

        for (var i = 0; i < pendientes.length; i++) {
          var cita = pendientes[i];
          try {
            var payload = Object.assign({}, cita, {
              createdAt: this.firestore.serverTimestamp(),
              sincronizadoOffline: true
            });
            delete payload.id; // Permitir que Firestore genere el docId canónico
            var docRef = await this.firestore.addDoc(colRef, payload);
            console.info("[Pelitos DB] Cita " + cita.uuid + " sincronizada exitosamente. Doc ID: " + docRef.id);
          } catch (syncErr) {
            console.warn("[Pelitos DB] Error al sincronizar cita " + cita.uuid + ":", syncErr);
            restantes.push(cita);
          }
        }

        if (restantes.length > 0) {
          localStorage.setItem(STORAGE_KEYS.citasPendientes, JSON.stringify(restantes));
        } else {
          localStorage.removeItem(STORAGE_KEYS.citasPendientes);
          console.info("[Pelitos DB] Todas las citas pendientes fueron sincronizadas.");
        }
      } catch (err) {
        console.warn("[Pelitos DB] Error durante la sincronización de citas:", err);
      } finally {
        sincronizando = false;
      }
    },

    /**
     * Guarda una nueva cita médica o estética canina (Esquema estricto compatible con firestore.rules)
     */
    guardarCita: async function (datosCita) {
      if (!datosCita) throw new Error("Datos de cita inválidos");

      var telefonoLimpio = String(datosCita.telefono || datosCita.celular || '')
        .trim()
        .replace(/[^\d+ -]/g, '')
        .slice(0, 20);

      if (telefonoLimpio.length >= 7 && !telefonoLimpio.startsWith("+")) {
        telefonoLimpio = "+51 " + telefonoLimpio;
      }

      var citaDoc = {
        uuid: datosCita.uuid || generarUUID(),
        nombre: String(datosCita.nombre || datosCita.clienteNombre || 'Cliente').trim().slice(0, 80),
        telefono: telefonoLimpio,
        mascota: String(datosCita.mascota || datosCita.mascotaNombre || 'Mascota').trim().slice(0, 60),
        servicio: String(datosCita.servicio || 'Consulta').trim().slice(0, 80),
        fecha: String(datosCita.fecha || new Date().toISOString().split("T")[0]).trim().slice(0, 40),
        hora: String(datosCita.hora || new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })).trim().slice(0, 25),
        status: 'pendiente'
      };

      var mensaje = String(datosCita.mensaje || datosCita.notas || '').trim().slice(0, 600);
      if (mensaje) {
        citaDoc.mensaje = mensaje;
      }

      if (auth && auth.currentUser && auth.currentUser.uid) {
        citaDoc.userId = auth.currentUser.uid;
      }

      var guardadoEnNube = false;

      // Si Firestore está listo y hay conexión a internet, intentar guardar en la nube
      if (!this.modoLocal && db && this.firestore && (typeof navigator === 'undefined' || navigator.onLine)) {
        try {
          var payloadFirestore = Object.assign({}, citaDoc, {
            createdAt: this.firestore.serverTimestamp()
          });
          var colRef = this.firestore.collection(db, 'citas');
          var docRef = await this.firestore.addDoc(colRef, payloadFirestore);
          citaDoc.id = docRef.id;
          guardadoEnNube = true;
          console.info("[Pelitos DB] Cita guardada en Firestore. ID: " + docRef.id);
        } catch (err) {
          console.error("[Pelitos DB] Error al guardar cita en Firestore, derivando a cola fuera de línea:", err);
          guardadoEnNube = false;
        }
      }

      // Si no se pudo guardar en la nube, encolar para sincronizar cuando vuelva la conexión
      if (!guardadoEnNube) {
        this.encolarCitaPendiente(citaDoc);
      }

      // Guardar en el histórico local con límite defensivo de cuota
      try {
        var rawCitas = localStorage.getItem(STORAGE_KEYS.citas);
        var citasLocales = rawCitas ? JSON.parse(rawCitas) : [];
        if (!Array.isArray(citasLocales)) citasLocales = [];

        if (citasLocales.length >= 60) {
          citasLocales = citasLocales.slice(-50);
        }
        citasLocales.push(Object.assign({}, citaDoc, { id: citaDoc.id || citaDoc.uuid }));
        localStorage.setItem(STORAGE_KEYS.citas, JSON.stringify(citasLocales));
      } catch (errQuota) {
        console.warn("[Pelitos DB] Almacenamiento local restringido o cuota excedida:", errQuota);
      }

      return citaDoc;
    },

    /**
     * Guarda el registro de un triaje conversacional de Pelitos IA
     */
    guardarConsultaIA: async function (triaje) {
      if (!triaje) return;

      var sintomas = Array.isArray(triaje.sintomasDetectados) && triaje.sintomasDetectados.length > 0
        ? triaje.sintomasDetectados.join(', ').slice(0, 1000)
        : String(triaje.sintomas || 'Orientación preventiva').trim().slice(0, 1000);

      var consultaDoc = {
        uuid: generarUUID(),
        tipoMascota: String(triaje.tipoMascota || 'Por identificar').trim().slice(0, 60),
        sintomas: sintomas,
        urgencia: String(triaje.urgencia || 'Verde (Informativa)').trim().slice(0, 80),
        servicioSugerido: String(triaje.servicioSugerido || 'Consulta General').trim().slice(0, 100)
      };

      if (triaje.resumen) {
        consultaDoc.resumen = String(triaje.resumen).trim().slice(0, 1500);
      }

      if (auth && auth.currentUser && auth.currentUser.uid) {
        consultaDoc.userId = auth.currentUser.uid;
      }

      if (!this.modoLocal && db && this.firestore && (typeof navigator === 'undefined' || navigator.onLine)) {
        try {
          var payloadFirestore = Object.assign({}, consultaDoc, {
            createdAt: this.firestore.serverTimestamp()
          });
          var colRef = this.firestore.collection(db, 'ia_consultas');
          await this.firestore.addDoc(colRef, payloadFirestore);
        } catch (err) {
          console.warn("[Pelitos DB] Error al registrar triaje IA en Firestore:", err);
        }
      }
    },

    /**
     * Obtiene reseñas públicas aprobadas desde Firestore
     */
    obtenerResenas: async function () {
      if (!this.modoLocal && db && this.firestore && (typeof navigator === 'undefined' || navigator.onLine)) {
        try {
          var q = this.firestore.query(
            this.firestore.collection(db, 'resenas'),
            this.firestore.where('status', '==', 'aprobada'),
            this.firestore.limit(20)
          );
          var snapshot = await this.firestore.getDocs(q);
          var resenas = [];
          snapshot.forEach(function (doc) {
            var data = doc.data();
            data.id = doc.id;
            resenas.push(data);
          });
          if (resenas.length > 0) return resenas;
        } catch (err) {
          console.warn("[Pelitos DB] Error al consultar reseñas de Firestore:", err);
        }
      }

      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.resenas) || '[]');
      } catch (_) {
        return [];
      }
    }
  };

  window.PelitosDB = PelitosDB;

  // Escuchar reconexión a Internet para sincronizar citas pendientes
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('online', function () {
      console.info("[Pelitos DB] Conexión a Internet restablecida. Procesando cola fuera de línea...");
      PelitosDB.sincronizarColaPendiente();
    });
  }

  // Inicialización en DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      PelitosDB.init();
    });
  } else {
    PelitosDB.init();
  }

})(window);
