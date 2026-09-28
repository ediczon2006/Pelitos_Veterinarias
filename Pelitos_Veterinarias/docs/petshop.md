# Módulo PetShop — documentación técnica

Catálogo de productos con variantes, ficha de contenido, carrito y pedido por
WhatsApp. Vive en `pages/productos.html` y no necesita compilación ni backend.

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `pages/productos.html` | Estructura y marcadores `data-*`. No contiene lógica ni handlers `onclick`. |
| `js/catalogo.js` | **Solo datos.** Productos, variantes, precios y fichas. Es la fuente de verdad publicada. |
| `js/productos.js` | Toda la lógica: render, filtros, carrito, diálogos, editor de precios. |
| `css/petshop.css` | Estilos del módulo. Reutiliza las variables de `css/styles.css`. |

El orden de los `<script>` importa: `main.js` → `catalogo.js` → `productos.js`.
`main.js` aporta `SITE`, `enlaceWhatsapp()` y `abrirExterno()`, que el PetShop
reutiliza en vez de volver a escribir los enlaces de WhatsApp.

## Cómo cambiar un precio de forma definitiva

1. Abre `js/catalogo.js`.
2. Busca el producto por su `id`.
3. Cambia `precio` (precio base en soles) o el `extra` de una opción (recargo en soles).
4. Publica el archivo.

## Editor de precios (herramienta interna)

Se activa añadiendo `?admin=1` a la URL:
`https://tudominio.pe/pages/productos.html?admin=1`

Permite ajustar el precio base y los recargos, y descargar la lista en JSON.

**Qué NO es:** un panel de administración. Todo ocurre en el navegador de quien
lo abre (`localStorage`), así que los cambios no los ven los visitantes. No lleva
contraseña a propósito: cualquier clave escrita en un archivo JavaScript público
es visible para cualquiera y solo daría una falsa sensación de seguridad.

Para que varias personas cambien precios y se reflejen en la web al instante hace
falta un backend con autenticación real (por ejemplo una API propia, Firebase o
un CMS headless).

## Añadir un producto nuevo

```js
{
  id: "identificador-unico-estable",   // no cambiarlo tras publicar
  categoria: "snacks",                  // debe existir como data-filtro en el HTML
  categoriaTexto: "Naturalistic · Classic",
  titulo: "Nombre comercial",
  imagen: "../images/productos/archivo-frente.jpg",
  imagenReverso: "../images/productos/archivo-reverso.jpg", // opcional
  precio: 22.00,
  variantes: [
    { nombre: "Presentación", opciones: [
      { label: "1 bolsa de 100 g", extra: 0 },
      { label: "Pack x3 bolsas", extra: 42 }
    ]}
  ],
  ficha: { /* opcional: marca, presentacion, descripcion, sellos,
              ingredientes, analisis, porciones, conservacion,
              uso, fabricante, importador */ }
}
```

Añade `predeterminada: true` a la opción que debe venir seleccionada.
Marca `requiereAsesoria: true` si el producto se dispensa con indicación
veterinaria (muestra un aviso en el modal).
`destacado: true` lo coloca en el configurador superior; solo se espera uno.

## Decisiones de implementación

- **Importes en céntimos (enteros).** Sumar flotantes acumula errores
  (`0.1 + 0.2 !== 0.3`); con enteros el total siempre cuadra. La conversión a
  texto ocurre una sola vez, al mostrar.
- **Sin `onclick`/`onerror` en el HTML generado.** Todo va por delegación de
  eventos, así el sitio puede servirse con una Content-Security-Policy estricta
  sin `unsafe-inline`.
- **Todo dato se escapa antes de insertarse como HTML** (`esc()`), de modo que un
  texto del catálogo con `<` o `"` no pueda romper el marcado ni inyectar código.
- **El carrito guarda id + opciones, nunca el precio.** El importe se recalcula
  desde el catálogo en cada render, así un carrito guardado la semana pasada no
  puede cobrar un precio antiguo. Al cargar se descartan productos o variantes
  que ya no existen.
- **Sin `alert` / `confirm` / `prompt`.** Los avisos usan el toast (`role="status"`)
  y el botón de restablecer pide una segunda pulsación en lugar de bloquear la página.
- **Diálogos accesibles.** `aria-modal`, foco atrapado con Tab, cierre con Escape,
  devolución del foco al elemento que abrió y bloqueo del scroll de fondo.
- **`localStorage` siempre entre `try/catch`.** En modo incógnito o con la cuota
  llena la tienda sigue funcionando, solo no recuerda entre visitas.

## Pendientes conocidos

- `css/rediseno.css` está referenciado en las páginas pero no existe en el
  repositorio: hay que subirlo o quitar el `<link>`.
- Faltan las fotos de `images/productos/`: `producto-1.jpg`, `producto-arnes.jpg`,
  `producto-antipulgas.jpg`, `producto-cama.jpg`, `producto-shampoo.jpg`,
  `producto-comedero.jpg`. Mientras no estén se muestra un marcador gris.
- El análisis garantizado del *Meat Mix* y del *Beef Burger BBQ* no era legible en
  las fotos de los envases; falta transcribirlo del envase físico
  (campo `analisis` en `js/catalogo.js`).
- Los precios de los snacks Naturalistic son valores de partida: hay que
  confirmarlos con la lista real de la tienda.

## Ofertas y precios tachados

Cada producto de `js/catalogo.js` acepta un campo opcional `precioAntes`:

```js
{
  id: "naturalistic-chicken-sushi",
  precio: 19.0,        // precio vigente
  precioAntes: 20.0,   // precio anterior (opcional)
}
```

Cuando `precioAntes` es mayor que `precio`, `js/productos.js` muestra automáticamente:

- el precio anterior tachado junto al precio vigente,
- una insignia con el porcentaje de descuento (`-X%`),
- una cinta "🔥 Oferta S/ 19" sobre la foto del producto,
- el precio anterior también en el modal de detalle y en el producto destacado.

Para retirar una oferta basta con eliminar `precioAntes` del producto.

## Capa de dinamismo (`css/dinamico.css` + `js/dinamico.js`)

Se carga en las 8 páginas y agrega, sin tocar el HTML existente:

- barra de progreso de lectura y botón "volver arriba",
- revelados en cascada al hacer scroll (`.din-rev`, variable `--din-i`),
- contadores animados, luz que sigue el cursor en el hero y parallax suave,
- lightbox automático para las fotos de instalaciones, estética, servicios y equipo,
- insignia de horario en vivo (America/Lima, lunes a sábado 8:30–20:00),
- avisos tipo toast disponibles en `window.PelitosAviso("mensaje")`,
- scrollspy en el menú y pausa del ticker al pasar el cursor.

Todo respeta `prefers-reduced-motion` y está envuelto en `try/catch`, por lo que un fallo
en un bloque no rompe el resto de la página.

## Consejos Pelitos

`pages/consejos.html` incluye 9 consejos con filtros por tema (Cachorros, Nutrición,
Prevención, Estética, Emergencias), tarjetas expandibles con recomendaciones y una
calculadora de edad aproximada en años humanos según el tamaño de la mascota.

## Capa de interactividad por página (actualización)

Módulos reutilizables en `js/dinamico.js`:

- **Filtros** — un contenedor con `data-filtro-set`, `data-filtro-destino="#id"` y botones
  `data-filtro="clave"` muestra u oculta los elementos con `data-tema="clave"`. Con
  `data-filtro-contador="#id"` se actualiza el contador de resultados.
- **Plegables** — cualquier bloque `.plegable` con un botón `.plegable__toggle` se abre
  y cierra solo. El texto del botón cambia con `data-abrir` / `data-cerrar`.

Aplicaciones:

- `pages/servicios.html`: 8 servicios filtrables por tipo (Consulta, Prevención,
  Diagnóstico, Cirugía, Farmacia) y cada tarjeta despliega lo que incluye + botón de cita.
- `pages/estetica.html`: comparador antes/después arrastrable (`#comparador`), recorta la
  foto "antes" con `clip-path` según la variable `--pos`.
- `pages/contacto.html`: atajos de contacto, validación en vivo del formulario
  (`data-validar="texto|telefono|opcional"`), contador de caracteres y FAQ plegable.
- `pages/login.html`: pestañas Iniciar sesión / Crear cuenta, mostrar contraseña,
  validación en vivo y medidor de seguridad. La lógica está en `js/auth.js`
  (`window.PelitosAuth`); la sesión se guarda **solo en memoria**, sin `localStorage`.
