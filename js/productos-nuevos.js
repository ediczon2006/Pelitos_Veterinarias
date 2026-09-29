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
   categoria (opcional)    "accesorios" | "alimentos" | "snacks" | "salud" | "higiene" | "ropa"
                           Si no la pones, va a "accesorios".
   resumen   (opcional)    Una o dos frases que se muestran en la ficha.
   descuento (opcional)    Rebaja en por ciento:  40   → la web cobra el 40 %
                           menos, tacha el precio de lista y pinta la cinta
                           «-40 % de descuento». Para terminar la campana,
                           borra esta linea y vuelve el precio normal.
   tallas    (opcional)    ["Chico", "Mediano"]  → crea el selector de tamaño.
                           Para cobrar más por una talla:  ["Chico", "Mediano +10"]
                           (el número después del + son soles adicionales).
   colores   (opcional)    ["Gris", "Rosa", "Azul"]  → crea el selector de color.
   opciones  (opcional)    ["Opción A", "Opción B +5"]  → selector genérico, para
                           cuando no es ni talla ni color (ej. versión, fórmula,
                           tipo de prenda). El texto del selector se llama
                           "Presentación" salvo que pongas "opcionesNombre".
   opcionesNombre (opcional) Título del selector de "opciones", ej. "Fórmula",
                           "Versión", "Prenda". Solo se usa junto con "opciones".
   oferta    (opcional)    Precio anterior, para que salga el precio tachado.
   asesoria  (opcional)    true si el producto necesita indicación veterinaria.

   OJO: cada producto termina con una coma. No borres los corchetes [ ] finales.
   ========================================================================== */

window.PELITOS_PRODUCTOS_NUEVOS = [

  /* ---------- Alimento en bolsa de 1 kg ---------- */

  {
    titulo: "Ricocan Cachorro Razas Pequeñas x 1 kg",
    precio: 12,
    foto: "ricocan-cachorros-1kg.jpg",
    categoria: "alimentos",
    resumen:
      "Alimento completo para cachorros de razas pequeñas, sabor carne y leche. Croquetas pequeñas fáciles de masticar, con DHA, prebióticos, multivitaminas, minerales orgánicos y omega 3 y 6 para el cerebro, la visión y las defensas. Bolsa de 1 kg con cierre fácil."
  },

  {
    titulo: "Ricocat Gatitos x 1 kg",
    precio: 12,
    foto: "ricocat-gatitos-1kg.jpg",
    categoria: "alimentos",
    resumen:
      "Alimento para gatitos de 1 a 12 meses, sabor carne, pescado y leche. Croquetas marinadas con DHA, taurina, calcio y fósforo para el desarrollo del cerebro, la visión, los huesos y una digestión tranquila. Bolsa de 1 kg con cierre fácil."
  },

  {
    titulo: "Canbo Super Premium Cachorro Cordero x 1 kg",
    precio: 22,
    foto: "canbo-cachorro-cordero-1kg.jpg",
    categoria: "alimentos",
    resumen:
      "Súper premium de cordero para cachorros de razas pequeñas: 30 % de proteína y 18 % de grasa, con glucosamina para las articulaciones, fibra prebiótica, DHA/EPA y minerales orgánicos. Fórmula avanzada en bolsa de 1 kg."
  },

  {
    titulo: "Canbo Super Premium Gatitos Pollo x 1 kg",
    precio: 22,
    foto: "canbo-gatitos-pollo-1kg.jpg",
    categoria: "alimentos",
    resumen:
      "Desarrollo inicial para gatitos hasta 12 meses, con pollo: 40 % de proteína y 18 % de grasa, tecnología Bio Protect con prebióticos, taurina y vitamina A para la visión, y EPA/DHA para el sistema nervioso. Bolsa de 1 kg."
  },

  {
    titulo: "Comedero Doble con Dispensador de Agua",
    precio: 10,
    foto: "comedero-doble-dispensador.jpg",
    categoria: "accesorios",
    resumen:
      "Comedero doble con carita de gato y dispensador de agua al centro: en un solo plato sirves el alimento y mantienes el agua fresca.",
    colores: ["Rosado"]
  },

  {
    titulo: "Comedero Doble Carita de Oso",
    precio: 15,
    foto: "comedero-doble-oso.jpg",
    categoria: "accesorios",
    resumen:
      "Dos tazones hondos en una sola base ancha, con forma de osito. La base amplia evita que se voltee mientras come.",
    colores: ["Verde"]
  },

  {
    titulo: "Comedero Doble Ovalado",
    precio: 10,
    foto: "comedero-doble-ovalado.jpg",
    categoria: "accesorios",
    resumen:
      "Comedero ovalado de dos divisiones, bajo y liviano: agua a un lado y comida al otro. Ideal para cachorros y gatos.",
    colores: ["Celeste"]
  },

  {
    titulo: "Comedero Elevado con Base de Madera",
    precio: 10,
    foto: "comedero-elevado.jpg",
    categoria: "accesorios",
    resumen:
      "Tazón elevado sobre patitas: la mascota come con el cuello en posición natural, mejor digestión y menos desorden en el piso.",
    colores: ["Menta"]
  },

  {
    titulo: "Tazón Woof Rosado",
    precio: 10,
    foto: "tazon-woof-rosado.jpg",
    categoria: "accesorios",
    resumen:
      "Tazón de plástico resistente con diseño Woof, borde alto y fácil de lavar a mano.",
    colores: ["Rosado"]
  },

  {
    titulo: "Tazón Huellitas Naranja",
    precio: 10,
    foto: "tazon-huellitas-naranja.jpg",
    categoria: "accesorios",
    resumen:
      "Tazón con estampado de huellitas y base con apoyos que reducen el deslizamiento mientras la mascota come.",
    colores: ["Naranja"]
  },

  {
    titulo: "Botella Bebedero Portátil Aqua Dog",
    precio: 15,
    foto: "botella-agua.jpg",
    categoria: "accesorios",
    resumen:
      "Botella con bebedero integrado para paseos y viajes: aprietas y el agua llena el tazón, el resto vuelve a la botella. Libre de BPA.",
    colores: ["Celeste"]
  },

  {
    titulo: "Cama Redonda con Borde de Borrego",
    precio: 35,
    foto: "cama-borrego-azul.jpg",
    categoria: "accesorios",
    resumen:
      "Cama redonda con paredes acolchadas y borde de peluche borrego, base antideslizante y cojín removible para lavar.",
    tallas: ["Talla única"],
    colores: ["Azul"]
  },

  {
    titulo: "Cama Redonda Estampado Patitas",
    precio: 35,
    foto: "cama-patitas-morada.jpg",
    categoria: "accesorios",
    resumen:
      "Cama redonda con estampado de huesitos y patitas, interior forrado en peluche y cojín removible. Abriga en las noches frías de Huánuco.",
    tallas: ["Talla única"],
    colores: ["Morado"]
  },

  {
    titulo: "Hueso Mordedor de Plástico",
    precio: 10,
    foto: "hueso-plastico.jpg",
    categoria: "accesorios",
    resumen:
      "Hueso masticable grande: entretiene por horas, calma la ansiedad y ayuda a la limpieza dental del perro."
  },

  /* NOTA: los productos de laboratorio (ECA, IBASA, 4 Groomer, Huellas), los
     kits y la ropa NO se escriben aqui: ya estan en el catalogo grande de
     js/main.js con su ficha tecnica completa (ingredientes, dosis, registro).
     Si los repite aqui apareceran dos veces en el PetShop. */,

  /* ====================================================================
     PRODUCTOS AGREGADOS DESDE LAS FOTOS SUBIDAS (septiembre 2026)
     - "catálogo Pelitos": precio tomado de las láminas de precios de la tienda.
     - "referencial": no tenía precio en las láminas; es un precio de mercado
       en Perú como referencia. Revíselo y cámbielo si en tienda es otro.
     ==================================================================== */
  { // precio: precio referencial de mercado
    titulo: "Simparica 10 mg (2.5 a 5 kg) x 1 tableta",
    precio: 59,
    foto: "simparica-10.jpg",
    categoria: "salud",
    marca: "Simparica",
    especie: "perro",
    resumen: "Antipulgas y garrapatas masticable (sarolaner) de Zoetis para perros de 2.5 a 5 kg. Protección de un mes con una sola tableta.",
    asesoria: true
  },
  { // precio: precio referencial de mercado
    titulo: "Simparica 20 mg (5 a 10 kg) x 1 tableta",
    precio: 67,
    foto: "simparica-20.jpg",
    categoria: "salud",
    marca: "Simparica",
    especie: "perro",
    resumen: "Antipulgas y garrapatas masticable (sarolaner) de Zoetis para perros de 5 a 10 kg. Protección de un mes.",
    asesoria: true
  },
  { // precio: precio referencial de mercado
    titulo: "Simparica 40 mg (10 a 20 kg) x 1 tableta",
    precio: 76,
    foto: "simparica-40.jpg",
    categoria: "salud",
    marca: "Simparica",
    especie: "perro",
    resumen: "Antipulgas y garrapatas masticable (sarolaner) de Zoetis para perros de 10 a 20 kg. Protección de un mes.",
    asesoria: true
  },
  { // precio: precio referencial de mercado
    titulo: "Bravecto 1000 mg (20 a 40 kg) x 1 tableta",
    precio: 156,
    foto: "bravecto-20-40.jpg",
    categoria: "salud",
    marca: "Bravecto",
    especie: "perro",
    resumen: "Tableta masticable de fluralaner contra pulgas y garrapatas para perros de 20 a 40 kg. Una sola dosis protege 12 semanas.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Proteggo 3M (hasta 4.5 kg)",
    precio: 50,
    foto: "proteggo-4-5.jpg",
    categoria: "salud",
    marca: "Proteggo",
    especie: "perro",
    opciones: ["1 mes", "3 meses +50"],
    opcionesNombre: "Protección",
    resumen: "Antipulgas y garrapatas masticable (fluralaner) para perros de hasta 4.5 kg.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Proteggo 3M (4.5 a 10 kg)",
    precio: 60,
    foto: "proteggo-4-10.jpg",
    categoria: "salud",
    marca: "Proteggo",
    especie: "perro",
    opciones: ["1 mes", "3 meses +60"],
    opcionesNombre: "Protección",
    resumen: "Antipulgas y garrapatas masticable (fluralaner) para perros de 4.5 a 10 kg.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Proteggo 3M (10 a 20 kg)",
    precio: 70,
    foto: "proteggo-10-20.jpg",
    categoria: "salud",
    marca: "Proteggo",
    especie: "perro",
    opciones: ["1 mes", "3 meses +70"],
    opcionesNombre: "Protección",
    resumen: "Antipulgas y garrapatas masticable (fluralaner) para perros de 10 a 20 kg.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Proteggo 3M (20 a 40 kg)",
    precio: 80,
    foto: "proteggo-20-40.jpg",
    categoria: "salud",
    marca: "Proteggo",
    especie: "perro",
    opciones: ["1 mes", "3 meses +80"],
    opcionesNombre: "Protección",
    resumen: "Antipulgas y garrapatas masticable (fluralaner) para perros de 20 a 40 kg.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Rivolta Pipeta Antipulgas 6%",
    precio: 30,
    foto: "rivolta-pipeta.jpg",
    categoria: "salud",
    marca: "Rivolta",
    especie: ["perro", "gato"],
    resumen: "Pipeta antipulgas de aplicación tópica.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Collar Seresto 8 meses",
    precio: 250,
    foto: "collar-seresto.jpg",
    categoria: "salud",
    marca: "Seresto",
    especie: ["perro", "gato"],
    resumen: "Collar antipulgas y garrapatas de Elanco con protección de hasta 8 meses."
  },
  { // precio: catálogo Pelitos
    titulo: "Atomil Plus Polvo Antipulgas",
    precio: 5,
    foto: "atomil-plus.jpg",
    categoria: "salud",
    marca: "Atomil",
    especie: ["perro", "gato"],
    resumen: "Polvo antipulgas de uso veterinario en sobre."
  },
  { // precio: catálogo Pelitos
    titulo: "Matanox 20 E.C. Desinfectante",
    precio: 8,
    foto: "matanox-20ec.jpg",
    categoria: "salud",
    marca: "Matanox",
    especie: ["perro", "gato"],
    resumen: "Cipermetrina al 20 % para el control de pulgas y garrapatas en el ambiente. Uso veterinario, siga las indicaciones del envase.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Kyro-Kan Spray x 60 ml",
    precio: 15,
    foto: "kyro-kan.jpg",
    categoria: "salud",
    marca: "Kyro-Kan",
    especie: ["perro", "gato"],
    resumen: "Spray de uso veterinario en frasco de 60 ml.",
    asesoria: true
  },
  { // precio: catálogo Pelitos
    titulo: "Pitu-Kan Antipulgas",
    precio: 10,
    foto: "pitu-kan.jpg",
    categoria: "salud",
    marca: "Pitu-Kan",
    especie: ["perro", "gato"],
    resumen: "Extermina pulgas, piojos y garrapatas. Hasta 90 días de protección según el envase."
  },
  { // precio: precio referencial de mercado
    titulo: "Tranquiliss Gotas x 15 ml",
    precio: 15,
    foto: "tranquiliss-gotas.jpg",
    categoria: "salud",
    marca: "Tranquiliss",
    especie: ["perro", "gato"],
    resumen: "Gotas tranquilizantes y antieméticas para perros y gatos, ideales para viajes. Frasco de 15 ml.",
    asesoria: true
  },
  { // precio: precio referencial de mercado
    titulo: "Ricocan Adultos Cordero y Cereales x 1 kg",
    precio: 9.5,
    foto: "ricocan-adultos-cordero.jpg",
    categoria: "alimentos",
    marca: "Ricocan",
    especie: "perro",
    resumen: "Alimento completo para perros adultos, sabor cordero y cereales. Precio por kilo."
  },
  { // precio: precio referencial de mercado
    titulo: "Ricocat Adultos x 1 kg",
    precio: 14.5,
    foto: "ricocat-adultos.jpg",
    categoria: "alimentos",
    marca: "Ricocat",
    especie: "gato",
    opciones: ["Salmón y leche", "Pollo, sardina y salmón", "Atún, sardina y trucha"],
    opcionesNombre: "Sabor",
    resumen: "Alimento completo para gatos adultos. Precio por kilo."
  },
  { // precio: precio referencial de mercado
    titulo: "Super Cat Adultos x 1 kg",
    precio: 14,
    foto: "supercat-adultos.jpg",
    categoria: "alimentos",
    marca: "Super Cat",
    especie: "gato",
    resumen: "Alimento para gatos adultos sabor carne, pollo y leche. Precio por kilo."
  },
  { // precio: precio referencial de mercado
    titulo: "Michicat Adultos Pollo y Sardina x 9 kg",
    precio: 65,
    foto: "michicat-9kg.jpg",
    categoria: "alimentos",
    marca: "Michicat",
    especie: "gato",
    resumen: "Saco de 9 kg de alimento para gatos adultos sabor pollo y sardina."
  },
  { // precio: precio referencial de mercado
    titulo: "Dog Chow Adultos Extra Life x 1 kg",
    precio: 14,
    foto: "dog-chow-adultos.jpg",
    categoria: "alimentos",
    marca: "Dog Chow",
    especie: "perro",
    resumen: "Alimento Purina Dog Chow para perros adultos con Extra Life. Precio por kilo."
  },
  { // precio: precio referencial de mercado
    titulo: "Dog Chow Cachorros Extra Life x 1 kg",
    precio: 16,
    foto: "dog-chow-cachorros.jpg",
    categoria: "alimentos",
    marca: "Dog Chow",
    especie: "perro",
    resumen: "Alimento Purina Dog Chow para cachorros con Extra Life. Precio por kilo."
  },
  { // precio: precio referencial de mercado
    titulo: "Pro Plan Puppy x 1 kg",
    precio: 34,
    foto: "pro-plan-puppy.jpg",
    categoria: "alimentos",
    marca: "Pro Plan",
    especie: "perro",
    resumen: "Purina Pro Plan para cachorros con OptiStart. Precio por kilo."
  },
  { // precio: precio referencial de mercado
    titulo: "Ricocan Lata Paté Cordero x 330 g",
    precio: 6,
    foto: "ricocan-lata-cordero.jpg",
    categoria: "alimentos",
    marca: "Ricocan",
    especie: "perro",
    resumen: "Alimento húmedo para perros adultos, paté sabor cordero. Lata de 330 g."
  },
  { // precio: precio referencial de mercado
    titulo: "Ricocan Lata Trocitos Carne y Verduras x 330 g",
    precio: 6,
    foto: "ricocan-lata-carne-verduras.jpg",
    categoria: "alimentos",
    marca: "Ricocan",
    especie: "perro",
    resumen: "Alimento húmedo para perros adultos, trocitos en salsa sabor carne y verduras. Lata de 330 g."
  },
  { // precio: precio referencial de mercado
    titulo: "Ricocat Lata Paté Pavo e Hígado x 330 g",
    precio: 6,
    foto: "ricocat-pate-pavo-higado.jpg",
    categoria: "alimentos",
    marca: "Ricocat",
    especie: "gato",
    resumen: "Alimento húmedo para gatos adultos, paté de pavo e hígado. Lata de 330 g."
  },
  { // precio: precio referencial de mercado
    titulo: "Ricocat Lata Paté Hígado y Pollo x 330 g",
    precio: 6,
    foto: "ricocat-pate-higado-pollo.jpg",
    categoria: "alimentos",
    marca: "Ricocat",
    especie: "gato",
    resumen: "Alimento húmedo para gatos adultos, paté de hígado y pollo. Lata de 330 g."
  },
  { // precio: precio referencial de mercado
    titulo: "Canbo Lata Articulaciones Fuertes x 330 g",
    precio: 12,
    foto: "canbo-lata-articulaciones.jpg",
    categoria: "alimentos",
    marca: "Canbo",
    especie: "perro",
    resumen: "Paté súper premium para perros adultos con fórmula para articulaciones fuertes. Lata de 330 g."
  },
  { // precio: precio referencial de mercado
    titulo: "Canbo Lata Digestión Saludable x 330 g",
    precio: 13,
    foto: "canbo-lata-digestion.jpg",
    categoria: "alimentos",
    marca: "Canbo",
    especie: "perro",
    resumen: "Paté súper premium para perros adultos con fórmula para una digestión saludable. Lata de 330 g."
  },
  { // precio: catálogo Pelitos
    titulo: "Hueso de Carnaza",
    precio: 5,
    foto: "hueso-carnaza.jpg",
    categoria: "snacks",
    marca: "Pelitos",
    especie: "perro",
    opciones: ["1 unidad", "Promoción 5 unidades +15"],
    resumen: "Hueso de carnaza para morder. Promoción: 5 por S/ 20."
  },
  { // precio: catálogo Pelitos
    titulo: "Rico Crack Multisabores",
    precio: 14,
    foto: "rico-crack.jpg",
    categoria: "snacks",
    marca: "Ricocan",
    especie: "perro",
    tallas: ["T0", "T1 +2", "T2 +4"],
    resumen: "Galletas premio para perros, multisabores."
  },
  { // precio: catálogo Pelitos
    titulo: "Yamis Bocaditos para Gato",
    precio: 5,
    foto: "yamis-bocadito.jpg",
    categoria: "snacks",
    marca: "Yamis",
    especie: "gato",
    opciones: ["1 unidad", "Promoción 5 unidades +15"],
    resumen: "Snack para gatos. Promoción: 5 por S/ 20."
  },
  { // precio: catálogo Pelitos
    titulo: "Churu Snack Cremoso para Gato",
    precio: 14,
    foto: "churu.jpg",
    categoria: "snacks",
    marca: "Churu",
    especie: "gato",
    tallas: ["T0", "T1 +2", "T2 +4"],
    resumen: "Snack cremoso Inaba Churu para gatos, en tubitos."
  },
  { // precio: catálogo Pelitos
    titulo: "Hámster con Cuerda",
    precio: 10,
    foto: "hamster-cuerda.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Juguete de peluche con cuerda para gatos."
  },
  { // precio: catálogo Pelitos
    titulo: "Set de Juegos Gatunos",
    precio: 8,
    foto: "set-juegos-gatunos.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Set de juguetes variados para gatos."
  },
  { // precio: catálogo Pelitos
    titulo: "Pollo Cascabel",
    precio: 6,
    foto: "pollo-cascabel.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Juguete de peluche con cascabel."
  },
  { // precio: catálogo Pelitos
    titulo: "Frisbee para Perro",
    precio: 7,
    foto: "frisbee.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Disco volador para jugar al aire libre."
  },
  { // precio: catálogo Pelitos
    titulo: "Hueso de Yute",
    precio: 3,
    foto: "hueso-yute.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Juguete mordedor en forma de hueso."
  },
  { // precio: catálogo Pelitos
    titulo: "Pollo de Hule",
    precio: 10,
    foto: "pollo-hule.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Pollo de hule con sonido, clásico para jugar."
  },
  { // precio: catálogo Pelitos
    titulo: "Ratón Suspendido con Rascador",
    precio: 12,
    foto: "raton-suspendido.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Ratón con resorte sobre base rascadora."
  },
  { // precio: catálogo Pelitos
    titulo: "Torre de Pelotas",
    precio: 12,
    foto: "torre-pelotas.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Torre de tres pisos con pelotas que giran, para el juego diario del gato."
  },
  { // precio: catálogo Pelitos
    titulo: "Caña de Pescar para Gatos",
    precio: 8,
    foto: "cana-pescar-gatos.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Varita con juguete colgante para estimular la caza."
  },
  { // precio: catálogo Pelitos
    titulo: "Ratón de Juguete",
    precio: 5,
    foto: "raton-juguete.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Ratoncito de peluche para gatos."
  },
  { // precio: catálogo Pelitos
    titulo: "Pelota Antiestrés con Luces",
    precio: 8,
    foto: "pelota-luces.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Pelota con púas suaves y luces."
  },
  { // precio: catálogo Pelitos
    titulo: "Pelota de Tenis Perruna",
    precio: 8,
    foto: "pelota-tenis.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Pelotas de tenis para lanzar y morder."
  },
  { // precio: catálogo Pelitos
    titulo: "Limpiador de Patitas",
    precio: 12,
    foto: "limpiador-patitas.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Vaso limpiador con cerdas de silicona para limpiar las patitas después del paseo."
  },
  { // precio: catálogo Pelitos
    titulo: "Guante Cepillo",
    precio: 7,
    foto: "guante-cepillo.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Guante masajeador que recoge el pelo suelto."
  },
  { // precio: catálogo Pelitos
    titulo: "Tijera Recolectora",
    precio: 4,
    foto: "tijera-recolectora.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Recogedor tipo tijera para las necesidades de tu perro."
  },
  { // precio: catálogo Pelitos
    titulo: "Set de Biberón",
    precio: 12,
    foto: "set-biberon.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Biberón con cepillo limpiador para cachorros y gatitos."
  },
  { // precio: catálogo Pelitos
    titulo: "Biberón Chupón Blando",
    precio: 8,
    foto: "biberones.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Biberón de chupón blando para cachorros y gatitos.",
    colores: ["Celeste", "Rosado"]
  },
  { // precio: catálogo Pelitos
    titulo: "Set Cortaúñas",
    precio: 10,
    foto: "set-cortaunas.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Cortaúñas con lima incluida."
  },
  { // precio: catálogo Pelitos
    titulo: "Peine con Dispensador",
    precio: 10,
    foto: "peine-dispensador.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Cepillo autolimpiable: con un botón suelta el pelo acumulado."
  },
  { // precio: catálogo Pelitos
    titulo: "Plato Regulador Antiestrés",
    precio: 15,
    foto: "plato-regulador.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Comedero lento que ayuda a que tu mascota coma despacio."
  },
  { // precio: catálogo Pelitos
    titulo: "Set Dental",
    precio: 25,
    foto: "set-dental.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Pasta dental, cepillo doble y dedales para la higiene bucal."
  },
  { // precio: catálogo Pelitos
    titulo: "Correa Retráctil con Diseño",
    precio: 20,
    foto: "correa-retractil.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Correa retráctil para paseos con más libertad."
  },
  { // precio: catálogo Pelitos
    titulo: "Correa de Cadena",
    precio: 10,
    foto: "correa-cadena.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Correa de cadena con asa."
  },
  { // precio: catálogo Pelitos
    titulo: "Transportadora de Malla con Ventana",
    precio: 25,
    foto: "transportadora-malla.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Bolso transportador de malla con ventana. Precio desde S/ 25 según tamaño."
  },
  { // precio: catálogo Pelitos
    titulo: "Mochila Transportadora",
    precio: 100,
    foto: "mochila-rosa.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    colores: ["Rosado", "Verde"],
    resumen: "Mochila tipo cápsula con ventana y respiraderos."
  },
  { // precio: catálogo Pelitos
    titulo: "Cama Tipo Colchoneta",
    precio: 100,
    foto: "cama-colchoneta-gris.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    colores: ["Gris", "Celeste"],
    resumen: "Cama rectangular acolchada con bordes altos."
  },
  { // precio: catálogo Pelitos
    titulo: "Cama Redonda Clásica",
    precio: 14,
    foto: "cama-redonda-clasica.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    tallas: ["T0", "T1 +2", "T2 +4", "T3 +7", "T4 +9", "T5 +11", "T6 +15"],
    resumen: "Cama redonda estampada, en siete tamaños."
  },
  { // precio: catálogo Pelitos
    titulo: "Collar Isabelino",
    precio: 15,
    foto: "collar-isabelino.jpg",
    categoria: "salud",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    tallas: ["XXS (15-20 cm)", "XS (20-30 cm) +5", "S (25-35 cm) +10", "M (30-40 cm) +15", "L (35-45 cm) +20", "XL (40-50 cm) +25"],
    resumen: "Collar protector postoperatorio. La talla va según el contorno del cuello."
  },
  { // precio: catálogo Pelitos
    titulo: "Chaleco K9",
    precio: 20,
    foto: "chaleco-k9.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    tallas: ["M", "L", "XL +3", "XXL +5"],
    resumen: "Pechera tipo chaleco Police K9 acolchada y reflectante."
  },
  { // precio: catálogo Pelitos
    titulo: "Pechera Faipet Cuero Graso",
    precio: 15,
    foto: "pechera-faipet-cuero.jpg",
    categoria: "accesorios",
    marca: "Faipet",
    especie: "perro",
    tallas: ["T1", "T2 +1", "T3 +2", "T4 +3", "T5 +5", "T6 +7", "T7 +9"],
    resumen: "Pechera de cuero graso resistente."
  },
  { // precio: catálogo Pelitos
    titulo: "Pechera Faipet Nylon con Tiro",
    precio: 14,
    foto: "pechera-faipet-nylon.jpg",
    categoria: "accesorios",
    marca: "Faipet",
    especie: "perro",
    tallas: ["T0", "T1 +2", "T2 +4", "T3 +7", "T4 +9", "T5 +11", "T6 +15"],
    resumen: "Pechera de nylon con correa incluida."
  },
  { // precio: catálogo Pelitos
    titulo: "Arnés con Mochila",
    precio: 20,
    foto: "arnes-mochila.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Arnés con mochilita decorativa."
  },
  { // precio: catálogo Pelitos
    titulo: "Pechera y Correa Simple",
    precio: 8,
    foto: "pechera-correa-simple.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Juego de pechera y correa ligera."
  },
  { // precio: catálogo Pelitos
    titulo: "Pechera Reflectante con Correa",
    precio: 20,
    foto: "pechera-reflectante.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    colores: ["Celeste", "Gris", "Rosado"],
    resumen: "Pechera reflectante con correa para paseos seguros."
  },
  { // precio: catálogo Pelitos
    titulo: "Pechera con Grabado de Huella con Tiro",
    precio: 14,
    foto: "pechera-huella.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    tallas: ["T0", "T1 +2", "T2 +4", "T3 +7", "T4 +9", "T5 +11", "T6 +15"],
    resumen: "Pechera acolchada con huella bordada y correa."
  },
  { // precio: precio referencial de mercado
    titulo: "Bolso Transportador Rosado",
    precio: 60,
    foto: "bolso-transportador-rosa.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Bolso transportador con ventanas de malla y asas."
  },
  { // precio: precio referencial de mercado
    titulo: "Bolso Transportador Negro con Huellitas",
    precio: 60,
    foto: "bolso-transportador-negro.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Bolso transportador estampado con ventanas de malla."
  },
  { // precio: precio referencial de mercado
    titulo: "Transportadora Rígida",
    precio: 99,
    foto: "transportadora-rigida.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Kennel de plástico con puerta metálica, para viajes y visitas al veterinario."
  },
  { // precio: precio referencial de mercado
    titulo: "Bozal Canasta",
    precio: 28,
    foto: "bozal-canasta.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Bozal tipo canasta que permite respirar y beber con comodidad."
  },
  { // precio: precio referencial de mercado
    titulo: "Bozal de Cuero",
    precio: 30,
    foto: "bozal-cuero.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Bozal de cuero ajustable."
  },
  { // precio: precio referencial de mercado
    titulo: "Cama Iglú con Orejitas",
    precio: 65,
    foto: "cama-iglu-orejitas.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Cama tipo cueva con orejitas y cojín interior."
  },
  { // precio: precio referencial de mercado
    titulo: "Cama Carita de Gato",
    precio: 70,
    foto: "cama-gato-carita.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    resumen: "Cama redonda de peluche con carita de gato."
  },
  { // precio: precio referencial de mercado
    titulo: "Cama Rectangular Café",
    precio: 64,
    foto: "cama-rectangular-cafe.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Cama rectangular acolchada con bordes."
  },
  { // precio: precio referencial de mercado
    titulo: "Dispensador de Bolsas",
    precio: 15,
    foto: "dispensador-bolsas.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Porta bolsas en forma de hueso para la correa."
  },
  { // precio: precio referencial de mercado
    titulo: "Medias Antideslizantes Dog Socks",
    precio: 10,
    foto: "medias-dog-socks.jpg",
    categoria: "ropa",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Medias con suela antideslizante."
  },
  { // precio: precio referencial de mercado
    titulo: "Plato de Acero con Huellitas",
    precio: 15,
    foto: "plato-acero-huellas.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Plato de acero inoxidable con base antideslizante."
  },
  { // precio: precio referencial de mercado
    titulo: "Correa de Soga Reforzada",
    precio: 25,
    foto: "correa-soga-reforzada.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    resumen: "Correa de soga resistente con asa acolchada y detalles reflectantes."
  },
  { // precio: precio referencial de mercado
    titulo: "Correa de Soga",
    precio: 25,
    foto: "correas-soga.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "perro",
    colores: ["Azul", "Rojo", "Verde", "Negro"],
    resumen: "Correa de soga trenzada."
  },
  { // precio: precio referencial de mercado
    titulo: "Cepillo Carda",
    precio: 20,
    foto: "cepillo-carda-azul.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Carda para desenredar y retirar el pelo muerto."
  },
  { // precio: precio referencial de mercado
    titulo: "Peine Metálico",
    precio: 25,
    foto: "peine-metalico.jpg",
    categoria: "higiene",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Peine de acero de doble densidad con mango."
  },
  { // precio: precio referencial de mercado
    titulo: "Collar con Cascabel para Gato",
    precio: 9,
    foto: "collar-corazones.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: "gato",
    colores: ["Rojo", "Celeste", "Rosado", "Morado"],
    resumen: "Collar con corazones y cascabel."
  },
  { // precio: precio referencial de mercado
    titulo: "Comedero Elevado de Acero",
    precio: 25,
    foto: "comedero-elevado-acero.jpg",
    categoria: "accesorios",
    marca: "Pelitos",
    especie: ["perro", "gato"],
    resumen: "Comedero elevado con plato de acero y patitas."
  }
];

/* ==========================================================================
   DE AQUÍ HACIA ABAJO NO HACE FALTA TOCAR NADA.
   Convierte la lista simple de arriba al formato interno del catálogo y
   muestra un aviso claro si a un producto le falta la foto.
   ========================================================================== */

(function (global) {
  "use strict";

  var RUTA_FOTOS = "../images/productos/tienda/";

  var NOMBRES_CATEGORIA = {
    alimentos: "Nutrición & Salud Canina",
    snacks: "Snacks & Premios",
    salud: "Salud & Farmacia",
    accesorios: "Accesorios & Confort",
    higiene: "Higiene & Cosmética",
    ropa: "Ropa para Mascotas"
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
    celeste: "#38bdf8",
    rosado: "#f472b6",
    menta: "#7fd1bd",
    turquesa: "#2dd4bf",
    beige: "#e0d3b8"
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

    if (Array.isArray(bruto.opciones) && bruto.opciones.length) {
      variantes.push({
        nombre: String(bruto.opcionesNombre || "Presentación"),
        opciones: bruto.opciones.map(function (o, i) {
          var op = aOpcion(o);
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
    if (bruto.marca) producto.marca = String(bruto.marca);
    if (bruto.especie) producto.especie = bruto.especie;

    /* Descuento de campana: se pasa igual que en el catalogo de main.js, asi
       un producto de esta lista tambien puede salir rebajado. */
    var rebaja = Number(bruto.descuento);
    if (Number.isFinite(rebaja) && rebaja > 0 && rebaja < 100) producto.descuento = rebaja;
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
