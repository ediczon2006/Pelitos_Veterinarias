/* =========================================================
   Pelitos Veterinaria — Datos del catálogo del PetShop
   ---------------------------------------------------------
   Este archivo contiene SOLO datos. Toda la lógica vive en
   js/productos.js. Para cambiar un precio de forma definitiva
   edita el campo "precio" (en soles) del producto y publica.

   Estructura de un producto:
     id            identificador único y estable (no lo cambies
                   después de publicar: el carrito y los precios
                   guardados dependen de él)
     categoria     debe coincidir con un data-filtro del HTML
     precio        precio base en soles
     imagen        foto frontal (ruta relativa a /pages)
     imagenReverso foto del reverso del envase (opcional)
     destacado     true = se muestra en el configurador superior
     variantes[]   grupos de opciones; "extra" es el recargo en
                   soles que se suma al precio base
     ficha         contenido declarado en el envase (opcional)
   ========================================================= */

(function (global) {
  "use strict";

  var PRODUCTOS = [
    // ==================================================================
    // ALIMENTO (producto del configurador destacado)
    // ==================================================================
    {
      id: "alimento-super-premium-canino",
      categoria: "alimentos",
      categoriaTexto: "Nutrición & Salud Canina",
      titulo: "Alimento Súper Premium Canino",
      resumen:
        "Fórmula balanceada con ingredientes de alta digestibilidad, probióticos y omegas 3 y 6 para pelaje brillante y vitalidad.",
      imagen: "../images/productos/producto-1.jpg",
      precio: 48.0,
      destacado: true,
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1.5 kg", extra: 0 },
            { label: "3.0 kg", extra: 37, predeterminada: true },
            { label: "7.5 kg", extra: 132 },
            { label: "15 kg", extra: 262 }
          ]
        },
        {
          nombre: "Sabor o fórmula",
          opciones: [
            { label: "Pollo & Arroz", color: "#eab308", extra: 0 },
            { label: "Salmón & Camote", color: "#f97316", extra: 0 },
            { label: "Cordero Hipoalergénico", color: "#8b5cf6", extra: 0 }
          ]
        },
        {
          nombre: "Etapa de vida",
          opciones: [
            { label: "Cachorro", extra: 0 },
            { label: "Adulto raza pequeña", extra: 0, predeterminada: true },
            { label: "Adulto raza grande", extra: 0 },
            { label: "Senior +7 años", extra: 0 }
          ]
        }
      ]
    },

    // ==================================================================
    // ACCESORIOS, SALUD E HIGIENE
    // ==================================================================
    {
      id: "arnes-correas",
      categoria: "accesorios",
      categoriaTexto: "Accesorios & Paseo",
      titulo: "Arnés y Correas para Mascotas",
      imagen: "../images/productos/producto-arnes.jpg",
      precio: 38.0,
      variantes: [
        {
          nombre: "Talla",
          opciones: [
            { label: "S (pequeño)", extra: 0 },
            { label: "M (mediano)", extra: 6 },
            { label: "L (grande)", extra: 11 },
            { label: "XL (extra grande)", extra: 16 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Morado Pelitos", color: "#5b2a86", extra: 0 },
            { label: "Naranja", color: "#f0791e", extra: 0 },
            { label: "Azul", color: "#2563eb", extra: 0 },
            { label: "Rojo", color: "#dc2626", extra: 0 }
          ]
        }
      ]
    },
    {
      id: "antipulgas-desparasitantes",
      categoria: "salud",
      categoriaTexto: "Salud & Farmacia",
      titulo: "Antipulgas y Desparasitantes",
      imagen: "../images/productos/producto-antipulgas.jpg",
      precio: 50.0,
      requiereAsesoria: true,
      variantes: [
        {
          nombre: "Rango de peso",
          opciones: [
            { label: "2 a 3.5 kg", extra: 0 },
            { label: "3.5 a 7.5 kg", extra: 8 },
            { label: "7.5 a 15 kg", extra: 18 },
            { label: "15 a 30 kg", extra: 28 },
            { label: "30 a 60 kg", extra: 40 }
          ]
        },
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 unidad (mensual)", extra: 0 },
            { label: "Caja x3 unidades", extra: 90 }
          ]
        }
      ]
    },
    {
      id: "cama-ortopedica",
      categoria: "accesorios",
      categoriaTexto: "Camas & Confort",
      titulo: "Cama Ortopédica y Suave",
      imagen: "../images/productos/producto-cama.jpg",
      precio: 55.0,
      variantes: [
        {
          nombre: "Tamaño",
          opciones: [
            { label: "50 cm (pequeño)", extra: 0 },
            { label: "70 cm (mediano)", extra: 25 },
            { label: "90 cm (grande)", extra: 50 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Gris clínico", color: "#9ca3af", extra: 0 },
            { label: "Rosa palo", color: "#f472b6", extra: 0 },
            { label: "Café moca", color: "#92400e", extra: 0 }
          ]
        }
      ]
    },
    {
      id: "shampoo-dermatologico",
      categoria: "higiene",
      categoriaTexto: "Higiene & Cosmética",
      titulo: "Shampoo y Cuidado Dermatológico",
      imagen: "../images/productos/producto-shampoo.jpg",
      precio: 25.0,
      variantes: [
        {
          nombre: "Fórmula",
          opciones: [
            { label: "Piel sensible (avena)", extra: 0 },
            { label: "Antipulgas / antiparasitario", extra: 5 },
            { label: "Pelo blanco / radiante", extra: 4 },
            { label: "Brillo & suavidad", extra: 3 }
          ]
        },
        {
          nombre: "Volumen",
          opciones: [
            { label: "250 ml", extra: 0 },
            { label: "500 ml", extra: 15 },
            { label: "1 litro", extra: 40 }
          ]
        }
      ]
    },
    {
      id: "comedero-bebedero",
      categoria: "accesorios",
      categoriaTexto: "Accesorios & Comederos",
      titulo: "Comedero y Bebedero Ergonómico",
      imagen: "../images/productos/producto-comedero.jpg",
      precio: 28.0,
      variantes: [
        {
          nombre: "Modelo",
          opciones: [
            { label: "Anti-ahogo lento", extra: 0 },
            { label: "Doble plato de acero", extra: 8 },
            { label: "Automático por gravedad", extra: 15 }
          ]
        },
        {
          nombre: "Color",
          opciones: [
            { label: "Turquesa", color: "#06b6d4", extra: 0 },
            { label: "Naranja", color: "#f97316", extra: 0 },
            { label: "Verde menta", color: "#10b981", extra: 0 }
          ]
        }
      ]
    },

    // ==================================================================
    // LÍNEA NATURALISTIC (Grupo MOR)
    // Ingredientes, análisis y porciones transcritos del reverso
    // de cada envase. Ver notas donde la etiqueta no era legible.
    // ==================================================================
    {
      id: "naturalistic-meat-mix-pollo-pato",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Meat Mix Pollo con Goji Berry & Pato con Arándano",
      imagen: "../images/productos/naturalistic-meat-mix-pollo-pato-frente.jpg",
      imagenReverso: "../images/productos/naturalistic-meat-mix-pollo-pato-reverso.jpg",
      precio: 19.0,
      precioAntes: 22.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Fine Recipes (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Snack complementario para perros con dos recetas en una bolsa. El pollo con goji berry es rico en proteína y aminoácidos que ayudan a mantener la musculatura fuerte; el pato con arándano es una buena fuente de proteína y de ácidos grasos saludables.",
        sellos: ["Grain Free", "Real Meat", "Additive Free"],
        ingredientes: [
          {
            titulo: "Pollo con Goji Berry",
            detalle:
              "Pollo, goji berry, patata, almidón, glicerina vegetal, goma, sorbato de potasio."
          },
          {
            titulo: "Pato con Arándano",
            detalle:
              "Pato, arándano, patata, glicerina vegetal, goma, sorbato de potasio."
          }
        ],
        analisisNota:
          "Los porcentajes del análisis garantizado no son legibles en la etiqueta fotografiada. Confírmalos con el envase físico antes de publicarlos.",
        porciones: [
          { peso: "Menos de 5 kg", racion: "5 – 10 unidades al día" },
          { peso: "5 a 10 kg", racion: "10 – 20 unidades al día" },
          { peso: "10 a 20 kg", racion: "20 – 30 unidades al día" },
          { peso: "Más de 20 kg", racion: "30 – 50 unidades al día" }
        ],
        conservacion:
          "Mantener el envase firmemente cerrado, en un lugar fresco y seco. Consumir antes de la fecha indicada. Mantener fuera del alcance de los niños; la bolsa no es un juguete.",
        uso:
          "Consumo veterinario. Saborizado. Alimento complementario: no reemplaza una dieta balanceada.",
        importador:
          "Comercial Aquamundo Perú SAC / Grupo MOR · SENASA PEA.02.0S.0.00543"
      }
    },
    {
      id: "naturalistic-chicken-sushi",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Classic",
      titulo: "Chicken Sushi 94% Carne",
      imagen: "../images/productos/naturalistic-chicken-sushi-frente.jpg",
      imagenReverso: "../images/productos/naturalistic-chicken-sushi-reverso.jpg",
      precio: 19.0,
      precioAntes: 20.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Classic (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Snack en rodajas tipo sushi cuyo ingrediente principal es carne de pollo y bacalao (94%). Fórmula altamente palatable, baja en grasa y libre de aditivos químicos: útil como premio de entrenamiento.",
        sellos: [
          "Gluten Free",
          "Bajo en grasa",
          "Sin azúcar añadida",
          "Sin colorantes artificiales añadidos"
        ],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Pollo 84 %, bacalao 10 %, almidón 2 %, glicerina vegetal 2 %, proteína de soya 1 %, proteína vegetal 1 %, sal 0.5 %, sorbitol 0.1 %, aminoácidos 0.1 %, colorantes naturales 0.1 %, sorbato de potasio 0.1 %, sucralosa 0.01 %."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 33 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 4 %" },
          { nombre: "Fibra cruda", valor: "máx. 3 %" },
          { nombre: "Ceniza", valor: "máx. 8 %" },
          { nombre: "Humedad", valor: "máx. 20 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 2 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco, protegido de la luz y de temperaturas elevadas.",
        uso:
          "Venta libre / uso veterinario. Prohibido su uso en la alimentación de rumiantes. Suplemento alimenticio de uso exclusivo animal: no reemplaza un alimento completo.",
        fabricante: "Qingdao Walt Food Co., Ltd. — Shandong, China",
        importador:
          "Soc. Comercial Agromundo Perú SAC / Grupo MOR · SENASA P.0.04.0A/100561"
      }
    },
    {
      id: "naturalistic-lamb-strips",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Classic",
      titulo: "Lamb Strips 74% Carne (tiras de cordero)",
      imagen: "../images/productos/naturalistic-lamb-strips-frente.jpg",
      imagenReverso: "../images/productos/naturalistic-lamb-strips-reverso.jpg",
      precio: 19.0,
      precioAntes: 21.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Classic (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Tiras masticables de cordero con pechuga de pato. Altas en proteína y con raíz de achicoria (fuente natural de inulina), sin azúcares ni colorantes.",
        sellos: [
          "Receta Gluten Free",
          "Bajo en grasa",
          "Sin azúcar añadida",
          "Sin sabores ni conservantes artificiales añadidos"
        ],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Cordero 61 %, pechuga de pato 10 %, proteína de soya 4 %, almidón vegetal 4 %, proteína hidrolizada vegetal 4 %, raíz de achicoria 3 %, glicerina vegetal 2 %, cloruro de sodio 1 %, sorbato de potasio 0.1 %, citrato de potasio 0.1 %."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 28 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 3 %" },
          { nombre: "Fibra cruda", valor: "máx. 2 %" },
          { nombre: "Ceniza", valor: "máx. 6 %" },
          { nombre: "Humedad", valor: "máx. 18 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 2 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "6 – 8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco, protegido de la luz.",
        uso:
          "Venta libre / uso veterinario. Prohibido su uso en la alimentación de rumiantes. Suplemento alimenticio de uso exclusivo animal: no reemplaza un alimento completo.",
        fabricante: "Qingdao Multi Foods Co., Ltd. — Shandong, China",
        importador:
          "Comercial Agromundo Pets SAC / Grupo MOR · SENASA F.A.04.04.04.100951"
      }
    },
    {
      id: "naturalistic-meatballs-salmon-camote",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Meat Balls Salmón & Camote",
      imagen: "../images/productos/naturalistic-meatballs-salmon-camote-frente.jpg",
      imagenReverso:
        "../images/productos/naturalistic-meatballs-salmon-camote-reverso.jpg",
      precio: 19.0,
      precioAntes: 23.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Fine Recipes (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Albóndigas elaboradas con salmón real y camote. El salmón aporta proteína de alta calidad rica en ácidos grasos esenciales (Omega 3) y el camote es una fuente de carbohidratos de bajo índice glucémico, vitaminas y minerales.",
        sellos: ["Grain Free", "Real Meat", "Potato Free", "Fuente de Omega 3"],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Salmón 77 %, camote 15 %, almidón de papa 4 %, glicerina vegetal 2 %, trifosfato de polifosfato 2 %, vegetal 2 %, sorbitol < 2 %, aceite de salmón < 1 %, almidón de arveja < 1 %, aminoácidos < 1 %, sal < 1 %."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 18 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 8 %" },
          { nombre: "Fibra cruda", valor: "máx. 3 %" },
          { nombre: "Ceniza", valor: "máx. 5 %" },
          { nombre: "Humedad", valor: "máx. 18 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "2 – 4 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "6 – 8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y protegido de la luz y de la temperatura elevada.",
        uso:
          "Venta libre / uso veterinario. Prohibido su uso en la alimentación de rumiantes. Suplemento alimenticio de uso exclusivo animal: no reemplaza una alimentación completa.",
        fabricante:
          "Qingdao Muir World, Ltd. — Qingdao, China (N.º establecimiento 3700PF0079)",
        importador:
          "Comercial Agromundo Pets SAC / Grupo MOR · SENASA 04.04.0A.109661"
      }
    },
    {
      id: "naturalistic-meatballs-pato-manzana",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Fine Recipes",
      titulo: "Meat Balls Pato & Manzana",
      imagen: "../images/productos/naturalistic-meatballs-pato-manzana-frente.jpg",
      imagenReverso:
        "../images/productos/naturalistic-meatballs-pato-manzana-reverso.jpg",
      precio: 19.0,
      precioAntes: 23.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 100 g", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Fine Recipes (Grupo MOR)",
        presentacion: "Bolsa resellable de 100 g",
        descripcion:
          "Albóndigas a base de carne real de pato con manzana. Fuente de vitaminas A, B y B12, zinc, fósforo y hierro; contiene antioxidantes, sin azúcar y libre de granos.",
        sellos: ["Grain Free", "Real Meat", "Additive Free", "Con antioxidantes"],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Pato 71 %, manzana 15 %, almidón de papa, glicerina vegetal 1 %, trifosfato de polifosfato 2 %, sorbitol 2 %, goma, sal."
          }
        ],
        analisis: [
          { nombre: "Proteína cruda", valor: "mín. 28 %" },
          { nombre: "Grasa cruda / extracto etéreo", valor: "mín. 8 %" },
          { nombre: "Fibra cruda", valor: "máx. 2 %" },
          { nombre: "Cenizas", valor: "máx. 3 %" },
          { nombre: "Humedad", valor: "máx. 20 %" }
        ],
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 2 unidades al día" },
          { peso: "5 a 10 kg", racion: "3 – 5 unidades al día" },
          { peso: "10 a 20 kg", racion: "6 – 8 unidades al día" },
          { peso: "Más de 20 kg", racion: "10 – 12 unidades al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco, protegido de la luz y a temperatura ambiente.",
        uso:
          "Producto de consumo animal. No sustituye una dieta balanceada. Mantener fuera del alcance de los niños.",
        fabricante: "Qingdao Yalute Food Co., Ltd. — Qingdao, China",
        importador: "Comercial Aquamarina Perú SAC / Grupo MOR"
      }
    },
    {
      id: "naturalistic-grill-beef-burger-bbq",
      categoria: "snacks",
      categoriaTexto: "Naturalistic · Grill",
      titulo: "Tasty Beef Burger con BBQ (hamburguesas)",
      imagen: "../images/productos/naturalistic-grill-beef-burger-bbq-frente.jpg",
      imagenReverso:
        "../images/productos/naturalistic-grill-beef-burger-bbq-reverso.jpg",
      precio: 19.0,
      precioAntes: 25.00,   // precio regular antes de la oferta
      variantes: [
        {
          nombre: "Presentación",
          opciones: [
            { label: "1 bolsa de 120 g (3 unidades)", extra: 0 },
            { label: "Pack x3 bolsas", extra: 35 },
            { label: "Pack x6 bolsas", extra: 66 }
          ]
        },
        {
          nombre: "Peso de tu mascota",
          opciones: [
            { label: "Menos de 5 kg", extra: 0 },
            { label: "5 a 10 kg", extra: 0 },
            { label: "10 a 20 kg", extra: 0 },
            { label: "Más de 20 kg", extra: 0 }
          ]
        }
      ],
      ficha: {
        marca: "Naturalistic — Grill (Grupo MOR)",
        presentacion: "Bolsa de 120 g · 3 hamburguesas",
        descripcion:
          "Hamburguesas para perros altas en proteína, elaboradas con 88 % de carne de res y humo natural, que les da un sabor a barbecue. Deshidratadas a baja temperatura para conservar sus nutrientes.",
        sellos: ["Grain Free", "Real Meat", "Additive Free"],
        ingredientes: [
          {
            titulo: "Composición",
            detalle:
              "Carne de res 88 %, almidón de papa, glicerina vegetal, humo natural."
          }
        ],
        analisisNota:
          "Los porcentajes del análisis garantizado no son legibles en la etiqueta fotografiada. Confírmalos con el envase físico antes de publicarlos.",
        porciones: [
          { peso: "Menos de 5 kg", racion: "1 – 10 g al día" },
          { peso: "5 a 10 kg", racion: "10 – 20 g al día" },
          { peso: "10 a 20 kg", racion: "20 – 30 g al día" },
          { peso: "Más de 20 kg", racion: "30 – 40 g al día" }
        ],
        conservacion:
          "Mantener el envase bien cerrado, en un lugar fresco y seco. Deja siempre agua fresca disponible para tu mascota.",
        uso: "Uso veterinario. Usar siempre como suplemento del alimento principal.",
        importador: "Comercial Aquamundo Perú SAC / Grupo MOR"
      }
    }
  ];

  global.PELITOS_CATALOGO = Object.freeze({
    moneda: "S/",
    productos: PRODUCTOS
  });
})(window);
