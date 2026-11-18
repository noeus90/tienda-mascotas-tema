# Revisión del tema: tareas pendientes

Lista de tareas para buscar fallos y mejoras de rendimiento en el código personalizado del tema (todo lo que no es Dawn original).
Creada el 16/11/2026. Marca cada tarea con `[x]` al terminarla y anota debajo lo que se encontró.

**Punto de partida:** `shopify theme check` pasa sin avisos (193 ficheros, 0 errores). Lo que queda son fallos de lógica, de comportamiento y de rendimiento que esa herramienta no detecta.

Prioridad: 🔴 alta · 🟠 media · 🟢 baja

## Medición de referencia (Lighthouse 13.6, móvil)

Medido el 16/11/2026 sobre la vista previa del tema de desarrollo (#189706305839) en los servidores de Shopify. Se tomaron 3 pasadas por página. "Primera visita" es la pasada sin caché; las otras dos ya tenían los ficheros guardados.

| Página | Rendimiento (1.ª visita) | Rendimiento (mediana) | LCP | TBT (1.ª visita) | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|---|---|
| Portada | 77 | 95 | 2,1 s | 796 ms | 91 | 77 | 92 |
| Colección (`/collections/all`) | 66 | 96 | 2,5 s (3,3 s en 1.ª) | 1.496 ms | 87 | 77 | 92 |
| Producto | 96 | 96 | 1,5 s | 70 ms | 88 | 73 | 100 |
| Carrito | 100 | 99 | 1,8 s | 15 ms | 90 | 73 | 92 |

El diseño no salta en ninguna página (CLS ≈ 0).

**Repetición del 17/11/2026** (después de los arreglos de accesibilidad, misma forma de medir):

| Página | Accesibilidad | Buenas prácticas | Rendimiento (mediana) |
|---|---|---|---|
| Portada | 91 (=) | 77 (=) | 97 |
| Colección | 91 (+4) | 77 (=) | 86 |
| Producto | 92 (+4) | 77 (+4) | 95 |
| Carrito | 94 (+4) | 77 (+4) | 100 |

Lo que sigue marcando: el iframe de la barra de vista previa de Shopify (solo lo ven administradores), textos en "blanco sobre blanco" que son falsos positivos de la animación de aparición al desplazarse de Dawn, y el botón de idioma del pie en móvil (tapado en parte, probablemente por la barra de vista previa).

**Hallazgos:**
- 🔴 **Error de JavaScript en producto y carrito:** `SyntaxError: Identifier 'PET_STORE_TRANSLATIONS' has already been declared`. Lo provoca cargar `pet-cro.js` dos veces. Baja la nota de buenas prácticas.
- 🟠 **La primera visita a la colección bloquea la página 1,5 s.** La mayor parte la causa `shopify-perf-kit` (de Shopify, no del tema). El resto es el propio HTML de la colección y `pet-catalog-bar.js`.
- 🟠 **La portada carga `grooming-booking.js` (82 KB) y el constructor de packs**, porque las dos secciones están en `index.json`.
- 🟠 **Contraste insuficiente:** aviso de desarrollo, botones de idioma, etiqueta de la guía de peluquería, "Ver producto"/"Ver todo" e insignias de suscripción.
- 🟢 **Al campo de cantidad del producto le falta una etiqueta accesible.**
- 🟢 **Falta la meta descripción de la tienda.** Se configura en Preferencias de Shopify.

---

## 1. Peluquería: reservas y calendario

- [ ] 🔴 **Dónde se guardan las reservas.** `grooming-booking.js` y `grooming-calendar.js` guardan las citas en `localStorage`, es decir, en el navegador de quien reserva. El calendario del administrador no verá las reservas hechas desde otro móvil u ordenador. Revisar el flujo completo (Calendly → confirmación → calendario) y decidir dónde deben vivir los datos de verdad (Calendly, metaobjetos de Shopify, una app…).
- [ ] 🔴 **Acceso al calendario solo para el administrador.** Sustituir el PIN de JavaScript (`sections/grooming-calendar.liquid:48`, por defecto `1234`, visible en el HTML) por una comprobación en Liquid: cliente con sesión iniciada y etiqueta `staff`. A los demás no debe llegarles ni el HTML.
- [ ] 🟠 **Reinicio de datos.** `grooming-calendar.js:147` borra datos guardados según una marca `RESET_FLAG`. Confirmar que no puede borrar citas reales.
- [ ] 🟠 **Validación del formulario de reserva** (pasos 1 a 4): campos obligatorios, fechas pasadas, teléfonos y correos no válidos, doble clic en "confirmar".
- [ ] 🟢 **Enlaces a Google Calendar y mapas** (`grooming-booking.js:1289`, `:1813`, `:1822`): comprobar las zonas horarias de las fechas y que la dirección sale bien codificada.

## 2. Rendimiento

- [ ] 🔴 **Peso del JavaScript de peluquería.** `grooming-booking.js` ocupa 82 KB y `grooming-calendar.js` 52 KB, sin minificar. Comprobar que solo se cargan en sus páginas (`page.bookings`, `page.grooming-calendar`) y con `defer`. Buscar código muerto o duplicado entre los dos.
- [x] 🟠 **`pet-cro.js` (41 KB) y `component-pet-cro.css` (18 KB).** Hecho: se cargan una sola vez desde `theme.liquid` y `pet-cro.js` pesa ahora 12,5 KB. Se cargan desde 6 sitios distintos (carrito, cajón del carrito, producto…). Comprobar que no se descargan dos veces en la misma página y valorar partirlos por funcionalidad.
- [ ] 🟠 **CSS de peluquería** (`section-grooming-booking.css` 33 KB, `section-grooming-calendar.css` 30 KB): buscar reglas sin usar.
- [x] 🟠 **Medir con Lighthouse** la portada, una colección, una ficha de producto y el carrito, en móvil. Anotar LCP, CLS y TBT para tener una referencia antes de optimizar.
- [ ] 🟢 **Imágenes de las secciones nuevas** (promo-banner, collection-showcase, pet-trust-badges, pasos de peluquería): `image_url` con `width`, `srcset`, `loading="lazy"` fuera de la primera pantalla, y `width`/`height` para evitar saltos de diseño.

## 3. Traducciones

- [x] 🟠 **Doble sistema de idiomas** (hecho el 16/11/2026, salvo reservas y calendario de peluquería). Se han quitado los `data-i18n-*`, el diccionario y el traductor de `pet-cro.js` (de 41 KB a 12,5 KB). El selector de idioma son ahora enlaces normales. Peluquería conserva 91 atributos y condiciones de idioma en su JS, que se rehará con el módulo. Texto original de la tarea: Hay atributos `data-i18n-es` / `data-i18n-en` en 48 ficheros, que JavaScript intercambia en el navegador, además de los ficheros de `locales/`. Decidir uno. Lo recomendable en Shopify es usar solo `locales/` con el idioma de Shopify Markets. Así el HTML llega ya traducido y no hay parpadeo ni texto incorrecto para buscadores.
- [x] 🟢 **Claves sin traducir o que faltan** entre `es.json` y `en.default.json`, y también en los ficheros de esquema (revisado el 17/11/2026). No falta ninguna clave en ningún idioma y todas las que usa el código existen. Quedan textos fijos solo en el módulo de peluquería, que se rehará.

## 4. Ficha de producto y carrito

- [ ] 🟠 **Selector de suscripción** (`subscription-selector.liquid`). Probado el 18/11/2026 con un carrito real: la opción marcada por defecto, "Autopedido Recurrente y Ahorra (15%)", solo añadía dos propiedades a la línea. El cliente pagaba el precio completo y el pedido no se repetía. Ahora el selector no se muestra si el producto no tiene planes de venta. Pendiente: cuando haya una app de suscripciones, enviar el `selling_plan` elegido y tomar el descuento del plan, no un 15 % fijo.
- [x] 🟠 **Barra de envío gratis** (hecho el 17/11/2026). El umbral (50 €) y el del regalo (65 €) son ajustes del tema en *Configuración del tema → Carrito*. El aviso superior y el menú toman el mismo importe. La parte de JavaScript usa el formato de moneda de la tienda, igual que Liquid. Probado el 18/11/2026 con un carrito real (12,90 €, 51,60 €, 64,50 € y 77,40 €): los importes, la barra y los mensajes son correctos en la ficha y en el carrito, y coinciden con la tarifa Standard de Shopify (8 €, gratis desde 50 €). Pendiente de decidir: el mensaje promete "Envío 24h" pero la tarifa Standard tarda de 3 a 5 días hábiles, y el snack de regalo de 65 € no lo añade ningún descuento de Shopify. Con varias monedas (Markets) el umbral no se convierte: está en la moneda de la tienda.
- [x] 🟠 **Widget de stock** (`stock-urgency-widget.liquid`) (revisado el 17/11/2026). Los cuatro estados (en stock, pocas unidades, reserva y agotado) salen bien y se actualiza al cambiar de variante. Corregida la barra de escasez, que con 1 unidad se pintaba más llena que con 2. Pendiente de decidir: la fecha de entrega usa la hora del ordenador del cliente y no la de España, y solo salta los domingos (no los sábados ni los festivos).
- [x] 🟢 **Metacampos vacíos** (hecho el 17/11/2026). Las pestañas de producto mostraban beneficios, composición ("65 % salmón fresco") y raciones inventados en cualquier producto sin datos. Ahora cada pestaña solo aparece si su metacampo tiene contenido, y si no hay ninguno no se muestra el bloque. Los cuidados y las insignias ya se ocultaban solos.
- [x] 🟢 **Productos recomendados** (revisado el 17/11/2026). `slide_offset` (número de diapositiva × productos por diapositiva) reparte los productos igual que el `offset: continue` de Dawn, sin repetir ni saltarse ninguno. El bloque de productos complementarios no está puesto en la plantilla de producto. Probado el 18/11/2026 con productos reales: salen 4 productos distintos de la misma mascota, sin repetir. Corregidas de paso las insignias de mascota: un producto de perro y gato (aceite de salmón) solo mostraba "Gato"; ahora muestra las dos.

## 5. Catálogo y constructor de packs

- [ ] 🟠 **Barra de catálogo por mascota** (`pet-catalog-bar.js`): filtra tarjetas en el navegador según etiquetas y tipo. Probado el 18/11/2026 con 17 productos: **no funciona con paginación**. Solo filtra los 16 de la primera página, y el recuento cuenta solo esos. Además, "Perros" incluye cualquier producto que no diga "gato", y "Higiene" incluye el snack dental. Propuesta: que filtre Shopify en el servidor. Las mascotas enlazarían a las colecciones Perros y Gatos, y las categorías al filtro "Tipo de producto" de Search & Discovery, que hay que activar. También hay que cambiar los enlaces `?mascota=` del mega menú y del menú del móvil.
  Tareas para que funcione con paginación (creadas el 18/11/2026). Las marcadas *(tú)* se hacen en el admin de Shopify:
  - [x] **Datos de los productos** (revisado el 18/11/2026). Los 17 productos ya tienen tipo: Pienso, Comida húmeda, Snack, Juguete, Higiene, Suplemento y Accesorio. Las necesidades ya son etiquetas sin prefijo: `cachorro`, `adulto`, `esterilizado` y `dental`.
  - [x] **Colecciones Perros y Gatos** (revisado el 18/11/2026). Cada producto está en la suya y el aceite de salmón está en las dos.
  - [x] **Search & Discovery** (hecho el 18/11/2026). La app no estaba instalada; ahora sí. Filtros nuevos: "Product type" (tipo de producto) y "Necesidad" (etiquetas), además de disponibilidad y precio. Comprobado en la tienda: `filter.p.product_type=Pienso` da 2 productos, `filter.p.tag=cachorro` da 1 y `/collections/perros?filter.p.product_type=Juguete` da 1. La app no deja ocultar etiquetas, así que "Necesidad" enseña también `perro`, `gato`, `higiene`…; el tema tendrá que mostrar solo las necesidades. La etiqueta "Product type" está en inglés porque es el idioma principal: hay que traducirla.
  - [ ] **Botones de mascota**. Pasan a ser enlaces a `/collections/perros`, `/collections/gatos` y `/collections/all`. El activo se marca con `collection.handle`, sin JavaScript.
  - [ ] **Botones de categoría**. Se crean desde `collection.filters` (el filtro de tipo de producto) y enlazan con `filter.p.product_type=…` sobre la colección actual. Así solo salen las categorías que tienen productos y el número es el de toda la colección. El activo se marca con los valores activos del filtro.
  - [ ] **Recuento y "sin resultados"**. Usar `collection.products_count` y el mensaje vacío de Dawn. Quitar de `pet-catalog-bar.js` el filtrado de tarjetas por texto, que es el que falla con la paginación y con "Perros" / "Higiene".
  - [ ] **Convivencia con los filtros de Dawn**. Los filtros laterales recargan la rejilla por AJAX (`facets.js`) y la barra se quedaría desfasada. Hay que volver a pintarla en esa recarga o dejar que sus enlaces recarguen la página.
  - [ ] **Mega menú y menú del móvil** (`header-mega-menu-species.liquid`, `header-drawer.liquid`). Cambiar `?mascota=perro&categoria=pienso` por `/collections/perros?filter.p.product_type=Pienso`, y las necesidades por `filter.p.tag=cachorro` (y las demás etiquetas). Incluye la rama en inglés (`?pet=dog`).
  - [ ] **Enlaces antiguos**. Redirigir a la URL nueva los enlaces con `?mascota=` que ya circulen (marcadores, redes), o decidir que no hace falta.
  - [ ] **Inglés**. Los tipos de producto y las etiquetas se muestran tal como están escritos. Revisar cómo se ven en la tienda en inglés y si Translate & Adapt los traduce.
  - [ ] **Pruebas en Chrome (perfil CLAUDIA)**. Con más de 16 productos: que cada filtro encuentre productos de la página 2, que el recuento cuadre, combinaciones de mascota, categoría y filtros laterales, móvil, inglés y "Borrar filtros". Repetir Lighthouse en la colección para ver cuánto baja el JavaScript.
- [x] 🟠 **Constructor de packs** (probado el 18/11/2026 con la colección Perros). Añade varios productos de una vez y el total es correcto (38,30 € − 15 % = 32,55 €). Corregido:
  - sin colección enseñaba 6 productos inventados y simulaba añadirlos; ahora en ese caso solo se ve en el editor del tema;
  - los productos agotados salen con el botón desactivado;
  - si Shopify rechaza el pack (por ejemplo, un producto agotado) se muestra su mensaje en vez de "añadido correctamente";
  - el aviso del carrito no se abría y daba error;
  - se ha quitado "Fórmula 100% natural aprobada por veterinarios", que salía en cualquier producto sin datos.
  Pendiente: **el carrito no aplica el 10 % / 15 %**, porque no hay ningún descuento automático en Shopify. El cliente ve 32,55 € en el pack y paga 38,30 €.
- [x] 🟢 **Filtros activos** (`facets-active-pills.liquid`) (revisado el 17/11/2026). La extracción es igual al código de Dawn en los cuatro sitios (vertical, horizontal, cajón y móvil), incluido el rango de precio y "Borrar todo". Probado en la colección: las píldoras de disponibilidad y precio aparecen, se quitan sin recargar y el mensaje de "sin productos" sale una vez.

## 6. Accesibilidad y SEO

- [x] 🟠 **Menús nuevos** (revisado el 17/11/2026). En escritorio, Intro abre el desplegable, el foco se ve, `aria-expanded` cambia, Escape cierra y devuelve el foco, y al salir con Tab se cierra. El cajón móvil usa el mismo código de Dawn; no se ha podido probar en pantalla de móvil.
- [x] 🟠 **Datos estructurados** (hecho el 17/11/2026). El producto publicaba siempre una valoración inventada (4,9 con 348 reseñas), y la ficha la enseñaba a los clientes. Ahora solo salen valoraciones de una app de reseñas real, en el schema, en la ficha y en el mega menú. El schema de producto ya no se repite en la portada y las migas solo salen donde tienen sentido. Falta pasar la prueba de resultados enriquecidos de Google con la tienda publicada.
- [x] 🟢 **Contraste de color** de insignias, banners y botones nuevos (hecho el 17/11/2026). El verde `#059669` pasa a `#047857` en textos y fondos con texto blanco, el azul de "Ver todo" a `#0369a1`, y se oscurecen el precio tachado de la suscripción, la duración de los extras de peluquería y el aviso de desarrollo. Todo queda por encima de 4,5:1. El "blanco sobre blanco" que marcaba Lighthouse en títulos y precios era un falso positivo de la animación de entrada.
- [x] 🟢 **Fallos de accesibilidad de Lighthouse** (hecho el 17/11/2026): el campo de cantidad tiene nombre accesible (fallo heredado de Dawn), los filtros de la barra de catálogo son botones con `aria-pressed` en vez de pestañas, y los botones de idioma miden al menos 24 px. El aviso de iframe sin título es la barra de vista previa de Shopify y no se puede tocar. Falta repetir Lighthouse para ver la nota nueva.

## 7. Antes de publicar

- [ ] 🔴 Quitar o condicionar el aviso de "Modo Desarrollo" de `layout/theme.liquid`.
- [ ] 🟠 **Confirmar que son ciertas las afirmaciones de los textos** (revisado el 17/11/2026; se cambian en el editor del tema, no en el código):
  - Portada, sello de confianza: "4.9 / 5", "+2.400 familias perrunas felices", "Peluquería & Tienda Verificada" y "Revisado por Veterinarios".
  - Pie: "recibe un 10% DTO" al suscribirse. ¿Existe el código de descuento y se envía solo?
  - Packs: "Ahorra hasta un 15%" y "2 productos 10% DTO". Tiene que coincidir con el descuento real del carrito.
  - Pasos de peluquería: "pH canino (7.0)", "sin jaulas de secado" y el resto de datos de los productos.
  - Ficha de producto, sellos debajo del botón de compra: "Aval Veterinario", "100% Natural", "Cruelty-Free", "Testado por Vets" y "Sin Cereales / Sulfatos" salen en **todos** los productos, sea cual sea (también en un juguete o una correa). Habría que mostrarlos solo en los productos que lo cumplan, por ejemplo con un metacampo o una etiqueta.
  - Producto agotado: "Reponiendo nuevo lote fresco de fábrica" sale en todos los agotados, también en los que no se van a reponer.
  - Mega menú: sin un producto destacado elegido, enseña un "Pack Bienestar & Digestión Saludable" de 29,70 € que no existe. Elegir un producto en el editor o quitar la tarjeta.
- [ ] 🟠 **Actualizar desde la versión nueva de Dawn.** `upstream/main` trae correcciones que este tema no tiene. Por ejemplo, el nombre de la variante elegida se pinta con `innerHTML` en vez de `textContent` en `global.js`, y la cesta rápida de varios productos se ha reescrito. Hay que revisar el cambio con cuidado porque el tema tiene muchas personalizaciones.
- [x] 🟢 Decidir qué hacer con las automatizaciones de Dawn en `.github/workflows/` (`cla.yml` y `stale.yml` no sirven aquí; `ci.yml` necesita claves de tienda para Lighthouse).
- [ ] 🟢 Repetir las pruebas en el navegador con Claude in Chrome, en el perfil CLAUDIA.
