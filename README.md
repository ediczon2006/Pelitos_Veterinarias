# Pelitos Veterinaria — Sitio web

Sitio web de **Pelitos Veterinaria** (Jr. Leoncio Prado N.° 1336, Huánuco).

Está hecho con **HTML, CSS y JavaScript puros**: no necesita instalar programas,
no necesita servidores ni bases de datos. Se abre haciendo doble clic en
`index.html` y se publica copiando la carpeta completa a cualquier hosting.

Este documento está escrito para que **cualquier persona del equipo** pueda
cambiar textos, precios, fotos y números de contacto sin ayuda de un programador.

---

## 1. Estructura de carpetas

```
pelitos-veterinaria/
│
├── index.html              ← Página de inicio
│
├── pages/                  ← Las demás páginas
│   ├── servicios.html
│   ├── estetica.html
│   ├── productos.html      ← PetShop (catálogo y carrito)
│   ├── nosotros.html
│   ├── consejos.html
│   ├── contacto.html
│   └── login.html          ← Acceso de clientes (demostración)
│
├── css/
│   └── styles.css          ← TODO el diseño del sitio (un solo archivo)
│
├── js/
│   └── main.js             ← TODO el comportamiento del sitio (un solo archivo)
│
├── images/
│   ├── logo/               ← Logotipo y favicon
│   ├── servicios/          ← Fotos de los servicios
│   ├── estetica/           ← Fotos de Pelitos Estética
│   ├── equipo/             ← Fotos del personal
│   ├── instalaciones/      ← Fotos del local
│   └── productos/          ← Fotos del PetShop
│
└── README.md               ← Este manual
```

Reglas simples para no romper nada:

- **No cambie el nombre de las carpetas ni de los archivos.**
- Solo hay **un CSS** (`css/styles.css`) y **un JS** (`js/main.js`). No cree
  archivos nuevos: agregue lo que necesite dentro del bloque que corresponda.
- Antes de modificar, **haga una copia de seguridad** de la carpeta completa.

---

## 2. Cómo están ordenados los dos archivos grandes

Ambos archivos están divididos en **bloques numerados** con un título en
mayúsculas. Para llegar rápido, abra el archivo y busque (Ctrl+F / Cmd+F)
la palabra `BLOQUE` seguida del número.

### `css/styles.css` — el diseño

| Bloque | Qué contiene |
|---|---|
| 1 · BASE DEL SITIO | Colores de marca, tipografías, cabecera, pie, botones, tarjetas, versión móvil |
| 2 · PETSHOP | Estilos que solo se aplican a `pages/productos.html` |
| 3 · NOSOTROS | Estilos que solo se aplican a `pages/nosotros.html` |
| 4 · ANIMACIONES Y EFECTOS | Apariciones al bajar la página, visor de fotos, botón de volver arriba |

Los bloques 2 y 3 están "encerrados" para su página, así que un cambio ahí
**no afecta al resto del sitio**.

### `js/main.js` — el comportamiento

| Bloque | Qué contiene |
|---|---|
| 1 · DATOS DEL NEGOCIO Y FUNCIONES COMUNES | Números de WhatsApp, menú móvil, año del pie |
| 2 · ACCESO DE CLIENTES | Guarda la sesión en el navegador (es una demostración) |
| 3 · CATÁLOGO DEL PETSHOP (SOLO DATOS) | **Aquí están los productos y sus precios** |
| 4 · PETSHOP: CATÁLOGO, FICHAS Y CARRITO | La lógica de la tienda (normalmente no se toca) |
| 5 · PÁGINA INICIO | Contadores animados y cabecera |
| 6 · PÁGINA NOSOTROS | Botón "Ver qué hace" de cada integrante |
| 7 · PÁGINA CONSEJOS | Filtros por tema |
| 8 · PÁGINA CONTACTO | Validación del formulario de citas |
| 9 · PÁGINA ESTÉTICA: COTIZADOR | **Aquí están las tarifas de estética** |
| 10 · PÁGINA ESTÉTICA: ANTES / DESPUÉS | Barra deslizante de comparación |
| 11 · PÁGINA ACCESO DE CLIENTES | Botones del formulario de acceso |
| 12 · ANIMACIONES Y EFECTOS | Efectos comunes a todas las páginas |

Cada página ejecuta **solo su bloque**. Eso lo decide el atributo
`data-pagina` que está en la etiqueta `<body>` de cada archivo HTML:

| Archivo | `data-pagina` |
|---|---|
| `index.html` | `inicio` |
| `pages/servicios.html` | `servicios` |
| `pages/estetica.html` | `estetica` |
| `pages/productos.html` | `petshop` |
| `pages/nosotros.html` | `nosotros` |
| `pages/consejos.html` | `consejos` |
| `pages/contacto.html` | `contacto` |
| `pages/login.html` | `acceso` |

No borre ese atributo: si lo quita, la página pierde sus funciones.

---

## 3. Si quiere cambiar… vaya aquí

| Quiero cambiar | Archivo | Dónde exactamente |
|---|---|---|
| Números de WhatsApp | `js/main.js` | Bloque 1, objeto `SITE` (al inicio del archivo) |
| Dirección y horario | Los archivos HTML | Pie de página de cada HTML (repetir el cambio en cada página) |
| Colores de la marca | `css/styles.css` | Bloque 1, variables `:root` (`--morado`, `--naranja`, …) |
| Precios y productos del PetShop | `js/main.js` | Bloque 3, lista `PRODUCTOS` |
| Tarifas de estética (cotizador) | `js/main.js` | Bloque 9, objeto `TARIFAS` |
| Textos de una página | El HTML de esa página | Busque el texto con Ctrl+F |
| Integrantes del equipo | `pages/nosotros.html` | Sección del equipo, tarjetas `equipo-card` |
| Consejos publicados | `pages/consejos.html` | Tarjetas de consejo en el HTML |
| Menú de navegación | Todos los HTML | Bloque `<nav>` de la cabecera (repetir el cambio en cada página) |
| Logotipo o favicon | `images/logo/` | Reemplace el archivo conservando el mismo nombre |

---

## 4. Tareas frecuentes, paso a paso

### Cambiar un número de WhatsApp

1. Abra `js/main.js`.
2. Al inicio verá:

```js
const SITE = {
  nombre: "Pelitos Veterinaria",
  whatsapp: {
    consultorio: "51939356376",   // consultas, citas médicas y PetShop
    estetica: "51948426656",      // Pelitos Estética y Spa Canino
  },
};
```

3. Cambie solo los números, **sin espacios, sin `+` y con el código 51 al inicio**.
4. Guarde. Todos los botones de WhatsApp del sitio se actualizan solos.

### Cambiar el precio de un producto del PetShop

1. Abra `js/main.js` y busque `BLOQUE 3`.
2. Busque el producto por su título (por ejemplo `Arnés y Correas para Mascotas`).
3. Cambie el número que está en `precio:`. Se escribe con punto decimal: `48.0`.
4. Si el producto tiene presentaciones (`variantes`), cada opción tiene su propio
   precio o su `delta` (lo que suma o resta al precio base). Cambie solo el número.
5. Guarde y recargue la página con Ctrl+F5.

### Agregar un producto nuevo al PetShop

1. Ponga la foto en `images/productos/`.
2. En `js/main.js`, Bloque 3, copie un bloque completo `{ ... },` de un producto
   parecido y péguelo debajo.
3. Cambie `id` (sin espacios ni tildes, único), `titulo`, `resumen`, `precio`,
   `categoria` e `imagen` (`"../images/productos/su-foto.jpg"`).
4. Guarde y recargue.

### Cambiar las tarifas de estética

1. Abra `js/main.js` y busque `BLOQUE 9`.
2. El objeto `TARIFAS` está organizado por servicio y por rango de peso:

```js
const TARIFAS = {
  clasico: { "0-5": 40, "6-10": 40, "11-20": 45, "20+": 55, tiempo: "~60 a 75 min" },
  express:  { ... },
};
```

3. Cambie solo los números y guarde.

### Agregar un integrante al equipo

1. Ponga la foto en `images/equipo/` (recomendado: cuadrada, 800 × 800 px).
2. Abra `pages/nosotros.html` y busque `equipo-card`.
3. Copie una tarjeta completa `<article class="equipo-card" ...>...</article>`
   y péguela después de la última.
4. En la copia cambie: el número de `style="--din-i:N"` (siga la secuencia),
   el nombre, el cargo, el área, el resumen, los tres `<li>` de tareas y la foto.
5. Si todavía no tiene la foto, deje el avatar con iniciales tal como está en la
   tarjeta de Alex Dionisio Modesto y ponga las iniciales en `data-inicial`.

### Cambiar una foto

Reemplace el archivo dentro de la carpeta que le corresponde **conservando el
mismo nombre**. Así no hay que tocar el código. Si usa otro nombre, busque el
nombre antiguo en los archivos HTML y reemplácelo.

---

## 5. Equipo publicado en el sitio

| Nombre | Cargo |
|---|---|
| Dra. Esther Jannet García Alegre | Gerente General |
| Julia Alegre Fernández | Médico Veterinario |
| Antonella Aseijas Fores | Grooming Certificada |
| Diego Paul Ponce de León Cadillo | Asistente Veterinario |
| Alex Dionisio Modesto | Diseño Gráfico y Marketing |

Alex Dionisio Modesto aparece con un avatar de iniciales (`AD`). Para poner su
foto: guarde `images/equipo/alex.jpg` y en `pages/nosotros.html` siga el
comentario que está justo arriba de su avatar.

---

## 6. Datos del negocio en el sitio

- Dirección: Jr. Leoncio Prado N.° 1336, Huánuco
- Horario: lunes a sábado, 8:30 a 20:00
- WhatsApp consultorio: +51 939 356 376
- WhatsApp Pelitos Estética: +51 948 426 656

---

## 7. Sobre el acceso de clientes (`pages/login.html`)

Es una **demostración visual**. Guarda la sesión en el propio navegador y no
verifica contra ningún servidor, así que **no sirve para datos reales de
clientes**. Si más adelante quiere un portal de verdad, hará falta un servicio
de autenticación; el diseño ya está listo para conectarlo.

Igual pasa con el carrito del PetShop: calcula un **total referencial** y envía
el pedido por WhatsApp. No cobra ni procesa pagos.

---

## 8. Antes de publicar (lista de revisión)

1. Abra las 8 páginas y revise que se vean bien en computadora y en celular.
2. Revise que todas las fotos carguen (no debe salir el ícono de imagen rota).
3. Pruebe los botones de WhatsApp: deben abrir el número correcto.
4. Pruebe el formulario de contacto y el cotizador de estética.
5. Revise que los precios del PetShop y de estética estén vigentes.
6. Suba la carpeta completa al hosting, manteniendo la misma estructura.

Si algo se ve raro después de un cambio, recargue con **Ctrl+F5** (o Cmd+Shift+R):
el navegador suele guardar la versión anterior del CSS.
