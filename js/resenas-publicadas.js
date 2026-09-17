/* ==========================================================================
   RESEÑAS PUBLICADAS · LAS QUE VE TODO EL MUNDO
   ==========================================================================

   Cuando un cliente deja una reseña en la web, esa reseña se guarda solo en
   SU navegador y además te llega por WhatsApp (el botón "Enviar mi reseña a
   Pelitos" aparece después de publicarla).

   Para que esa reseña la vea TODO EL MUNDO, cópiala aquí abajo:

   1. Agrega un bloque nuevo dentro de la lista, con este formato:

        { nombre: "María R.", mascota: "Luna, shih tzu", estrellas: 5,
          texto: "Lo que escribió el cliente.", fecha: "2026-09-17" },

   2. Guarda el archivo y recarga la página. Ya aparece para todos.

   CAMPOS
   ------
   nombre    (obligatorio) Nombre o nombre + inicial del apellido.
   texto     (obligatorio) La reseña, tal como la escribió el cliente.
   estrellas (opcional)    1 a 5. Si no la pones, se toma 5.
   mascota   (opcional)    "Luna, shih tzu"
   fecha     (opcional)    "2026-09-17"  (año-mes-día). Si no la pones, no se
                           muestra fecha.

   OJO: cada reseña termina con una coma y el texto va entre comillas. Si el
   texto lleva comillas dobles por dentro, usa comillas simples: 'así'.
   ========================================================================== */

window.PELITOS_RESENAS_PUBLICADAS = [

  // Ejemplo listo para copiar (bórralo cuando tengas reseñas reales):
  // {
  //   nombre: "María R.",
  //   mascota: "Luna, shih tzu",
  //   estrellas: 5,
  //   texto: "Atendieron a Luna el mismo día y me explicaron todo con calma.",
  //   fecha: "2026-09-17"
  // },

];
