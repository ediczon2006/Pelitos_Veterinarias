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
    db: null,
    auth: null,
    firestore: null,

    /**
     * Inicializa la conexión con Firebase si los datos están presentes
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
      } catch (err) {
        console.warn("[Pelitos DB] Fallback local activo. Motivo:", err.message);
        this.modoLocal = true;
        this.estaListo = true;
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

      if (telefonoLimpio.length < 8) {
        telefonoLimpio = "+51 " + telefonoLimpio;
      }

      var citaDoc = {
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

      // Si Firebase está activo, enviar a Firestore
      if (!this.modoLocal && db && this.firestore) {
        try {
          var payloadFirestore = Object.assign({}, citaDoc, {
            createdAt: this.firestore.serverTimestamp()
          });
          var colRef = this.firestore.collection(db, 'citas');
          var docRef = await this.firestore.addDoc(colRef, payloadFirestore);
          citaDoc.id = docRef.id;
        } catch (err) {
          console.error("[Pelitos DB] Error al guardar cita en Firestore:", err);
        }
      }

      // Guardar también en localStorage como respaldo local
      try {
        var citasLocales = JSON.parse(localStorage.getItem('pelitos_citas') || '[]');
        citasLocales.push(Object.assign({}, citaDoc, { id: citaDoc.id || 'loc_' + Date.now() }));
        localStorage.setItem('pelitos_citas', JSON.stringify(citasLocales));
      } catch (_) {}

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

      if (!this.modoLocal && db && this.firestore) {
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

      try {
        return JSON.parse(localStorage.getItem('pelitos_resenas') || '[]');
      } catch (_) {
        return [];
      }
    }
  };

  window.PelitosDB = PelitosDB;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      PelitosDB.init();
    });
  } else {
    PelitosDB.init();
  }

})(window);
