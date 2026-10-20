/**
 * ============================================================================
 * Pelitos Veterinaria & Estética — Conector de Base de Datos Google Firestore
 * ============================================================================
 * Maneja la sincronización en tiempo real de citas, usuarios, reseñas y triajes
 * de Pelitos IA con Google Cloud Firestore, con fallback automático a localStorage
 * si aún no se configuran las credenciales o si el cliente no tiene conexión.
 */

(function (window) {
  'use strict';

  var db = null;
  var auth = null;
  var inicializado = false;

  var PelitosDB = {
    estaListo: false,
    modoLocal: true,

    /**
     * Inicializa la conexión con Firebase si los datos están presentes
     */
    init: async function () {
      var cfg = window.PELITOS_FIREBASE_CONFIG;
      if (!cfg || !cfg.apiKey || !cfg.projectId || cfg.apiKey === "") {
        console.info("[Pelitos DB] Firebase no configurado aún. Operando en modo LocalStorage.");
        this.modoLocal = true;
        this.estaListo = true;
        return;
      }

      try {
        // Carga dinámica de Firebase SDK desde el CDN oficial de Google
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
      } catch (err) {
        console.warn("[Pelitos DB] Error al conectar con Firebase. Usando fallback local:", err);
        this.modoLocal = true;
        this.estaListo = true;
      }
    },

    /**
     * Guarda una nueva cita médica o estética canina
     */
    guardarCita: async function (datosCita) {
      if (!datosCita) throw new Error("Datos de cita inválidos");

      var citaNormalizada = {
        clienteNombre: String(datosCita.clienteNombre || datosCita.nombre || '').trim(),
        telefono: String(datosCita.telefono || datosCita.celular || '').trim(),
        mascotaNombre: String(datosCita.mascotaNombre || datosCita.mascota || '').trim(),
        especie: String(datosCita.especie || 'perro').trim().toLowerCase(),
        servicio: String(datosCita.servicio || 'consulta').trim(),
        fecha: String(datosCita.fecha || '').trim(),
        hora: String(datosCita.hora || '').trim(),
        notas: String(datosCita.notas || '').substring(0, 500),
        estado: 'pendiente',
        creadoEl: new Date().toISOString()
      };

      // Si Firebase está activo
      if (!this.modoLocal && db && this.firestore) {
        try {
          var colRef = this.firestore.collection(db, 'citas');
          var docRef = await this.firestore.addDoc(colRef, citaNormalizada);
          citaNormalizada.id = docRef.id;
        } catch (err) {
          console.error("[Pelitos DB] Error al guardar cita en Firestore:", err);
        }
      }

      // Guardar también en localStorage como respaldo offline
      try {
        var citasLocales = JSON.parse(localStorage.getItem('pelitos_citas') || '[]');
        citasLocales.push(citaNormalizada);
        localStorage.setItem('pelitos_citas', JSON.stringify(citasLocales));
      } catch (_) {}

      return citaNormalizada;
    },

    /**
     * Guarda el registro de un triaje conversacional de Pelitos IA
     */
    guardarConsultaIA: async function (triaje) {
      if (!triaje) return;

      var registro = {
        sintomas: String(triaje.sintomas || '').substring(0, 600),
        nivelUrgencia: String(triaje.nivelUrgencia || 'leve').toLowerCase(),
        recomendacion: String(triaje.recomendacion || '').substring(0, 400),
        fecha: new Date().toISOString()
      };

      if (!this.modoLocal && db && this.firestore) {
        try {
          var colRef = this.firestore.collection(db, 'ia_consultas');
          await this.firestore.addDoc(colRef, registro);
        } catch (err) {
          console.warn("[Pelitos DB] Error al registrar triaje IA en Firestore:", err);
        }
      }
    },

    /**
     * Obtiene reseñas públicas aprobadas desde Firestore
     */
    obtenerResenas: async function () {
      if (!this.modoLocal && db && this.firestore) {
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

      // Fallback a reseñas en memoria/localStorage
      try {
        return JSON.parse(localStorage.getItem('pelitos_resenas') || '[]');
      } catch (_) {
        return [];
      }
    }
  };

  // Exponer globalmente
  window.PelitosDB = PelitosDB;

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      PelitosDB.init();
    });
  } else {
    PelitosDB.init();
  }

})(window);
