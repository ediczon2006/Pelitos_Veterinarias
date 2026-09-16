/* ==========================================================================
   PRODUCTOS NUEVOS · EL ARCHIVO PARA AGREGAR COSAS AL PETSHOP
   ==========================================================================

   Este es el ÚNICO archivo que necesitas tocar para añadir un producto.
   No hace falta abrir js/main.js ni saber cómo funciona el resto.

   CÓMO AGREGAR UN PRODUCTO (3 pasos)
   ----------------------------------
   1. Guarda la foto en:  images/productos/
      Usa un nombre sin espacios ni tildes, por ejemplo:  cama-mascota.jpg
   2. Copia una de las líneas de abajo, pégala dentro de la lista y cambia
      el título, el precio y el nombre de la foto.
   3. Guarda el archivo y recarga la página. Listo.

   CAMPOS QUE PUEDES USAR
   ----------------------
   titulo    (obligatorio) Nombre del producto.
   precio    (obligatorio) En soles, solo el número:  35   o   10.50
   foto      (obligatorio) Nombre del archivo dentro de images/productos/
   categoria (opcional)    "accesorios" | "alimentos" | "snacks" | "salud" | "higiene"
                           Si no la pones, va a "accesorios".
   resumen   (opcional)    Una o dos frases que se muestran en la ficha.
   tallas    (opcional)    ["Chico", "Mediano"]  → crea el selector de tamaño.
                           Para cobrar más por una talla:  ["Chico", "Mediano +10"]
                           (el número después del + son soles adicionales).
   colores   (opcional)    ["Gris", "Rosa", "Azul"]  → crea el selector de color.
   oferta    (opcional)    Precio anterior, para que salga el precio tachado.
   asesoria  (opcional)    true si el producto necesita indicación veterinaria.

   OJO: cada producto termina con una coma. No borres los corchetes [ ] finales.
   ========================================================================== */

window.PELITOS_PRODUCTOS_NUEVOS = [

  {
    titulo: "Cama para mascota",
    precio: 35,
    foto: "cama-mascota.jpg",
    categoria: "accesorios",
    resumen:
      "Cama acolchada y lavable, ideal para perros y gatos de talla pequeña y mediana.",
    tallas: ["Talla única"]
  },

  {
    titulo: "Tazón para comer",
    precio: 10,
    foto: "tazon-comer.jpg",
    categoria: "accesorios",
    resumen:
      "Comedero resistente, con base antideslizante y fácil de lavar."
  },

  {
    titulo: "Botella bebedero portátil",
    precio: 15,
    foto: "botella-agua.jpg",
    categoria: "accesorios",
    resumen:
      "Botella con bebedero integrado para paseos y viajes: sirves agua sin derramar."
  },

  {
    titulo: "Hueso de plástico",
    precio: 10,
    foto: "hueso-plastico.jpg",
    categoria: "accesorios",
    resumen:
      "Juguete masticable que entretiene y ayuda a la limpieza dental del perro."
  }

];

/* ==========================================================================
   DE AQUÍ HACIA ABAJO NO HACE FALTA TOCAR NADA.
   Convierte la lista simple de arriba al formato interno del catálogo y
   muestra un aviso claro si a un producto le falta la foto.
   ========================================================================== */

(function (global) {
  "use strict";

  var RUTA_FOTOS = "../images/productos/";

  var NOMBRES_CATEGORIA = {
    alimentos: "Nutrición & Salud Canina",
    snacks: "Snacks & Premios",
    salud: "Salud & Farmacia",
    accesorios: "Accesorios & Confort",
    higiene: "Higiene & Cosmética"
  };

  /** "Cama para mascota" → "cama-para-mascota" */
  function slug(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
  }

  /** "Mediano +10" → { label: "Mediano", extra: 10 } */
  function aOpcion(entrada, color) {
    var texto = String(entrada || "").trim();
    var extra = 0;
    var m = texto.match(/\s*\+\s*(\d+(?:\.\d+)?)\s*$/);
    if (m) {
      extra = Number(m[1]) || 0;
      texto = texto.replace(m[0], "").trim();
    }
    var op = { label: texto, extra: extra };
    if (color) op.color = color;
    return op;
  }

  var COLORES_CONOCIDOS = {
    gris: "#9ca3af",
    negro: "#111827",
    blanco: "#e5e7eb",
    rosa: "#f472b6",
    rojo: "#dc2626",
    azul: "#2563eb",
    verde: "#16a34a",
    amarillo: "#eab308",
    naranja: "#f0791e",
    morado: "#5b2a86",
    cafe: "#92400e",
    marron: "#92400e",
    celeste: "#38bdf8"
  };

  function colorDe(nombre) {
    var clave = slug(nombre).split("-")[0];
    return COLORES_CONOCIDOS[clave] || null;
  }

  /** Pasa un producto de la lista simple al formato que espera el PetShop. */
  function normalizar(bruto, indice) {
    if (!bruto || typeof bruto !== "object") return null;

    var titulo = String(bruto.titulo || "").trim();
    var precio = Number(bruto.precio);
    if (!titulo || !Number.isFinite(precio) || precio < 0) {
      console.warn(
        "[Productos nuevos] Producto #" +
          (indice + 1) +
          " ignorado: necesita 'titulo' y un 'precio' numérico."
      );
      return null;
    }

    var categoria = String(bruto.categoria || "accesorios").toLowerCase();
    if (!NOMBRES_CATEGORIA[categoria]) categoria = "accesorios";

    var variantes = [];

    if (Array.isArray(bruto.tallas) && bruto.tallas.length) {
      variantes.push({
        nombre: "Tamaño",
        opciones: bruto.tallas.map(function (t, i) {
          var op = aOpcion(t);
          if (i === 0) op.predeterminada = true;
          return op;
        })
      });
    }

    if (Array.isArray(bruto.colores) && bruto.colores.length) {
      variantes.push({
        nombre: "Color",
        opciones: bruto.colores.map(function (c, i) {
          var op = aOpcion(c, colorDe(c));
          if (i === 0) op.predeterminada = true;
          return op;
        })
      });
    }

    var producto = {
      id: slug(bruto.id || titulo) || "producto-nuevo-" + (indice + 1),
      categoria: categoria,
      categoriaTexto: bruto.categoriaTexto || NOMBRES_CATEGORIA[categoria],
      titulo: titulo,
      imagen: bruto.imagen || RUTA_FOTOS + String(bruto.foto || "").trim(),
      precio: precio,
      variantes: variantes
    };

    if (bruto.resumen) producto.resumen = String(bruto.resumen);
    if (bruto.asesoria) producto.requiereAsesoria = true;

    var antes = Number(bruto.oferta);
    if (Number.isFinite(antes) && antes > precio) producto.precioAntes = antes;

    return producto;
  }

  var listos = (Array.isArray(global.PELITOS_PRODUCTOS_NUEVOS)
    ? global.PELITOS_PRODUCTOS_NUEVOS
    : []
  )
    .map(normalizar)
    .filter(Boolean);

  /* Se deja preparado para que el catálogo del PetShop lo recoja. main.js lee
     esta lista al construir window.PELITOS_CATALOGO, así que este archivo debe
     cargarse ANTES que js/main.js. */
  global.PELITOS_PRODUCTOS_EXTRA = listos;

  /* Nota sobre las fotos que faltan: si el archivo indicado en 'foto' todavía
     no existe, main.js ya marca la imagen con la clase .img-sin-foto y css la
     pinta como un bloque neutro con el rótulo «foto pendiente». No se rompe
     nada: solo se ve el hueco hasta que subas la imagen. */
})(window);
