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

- [ ] 🟠 **Selector de suscripción** (`subscription-selector.liquid`): comprobar que funciona con planes de venta reales y que no se rompe si el producto no tiene ninguno.
- [x] 🟠 **Barra de envío gratis** (hecho el 17/11/2026). El umbral (50 €) y el del regalo (65 €) son ajustes del tema en *Configuración del tema → Carrito*. El aviso superior y el menú toman el mismo importe. La parte de JavaScript usa el formato de moneda de la tienda, igual que Liquid. Probado simulando importes; falta probarlo con un carrito real cuando haya productos disponibles. Con varias monedas (Markets) el umbral no se convierte: está en la moneda de la tienda.
- [x] 🟠 **Widget de stock** (`stock-urgency-widget.liquid`) (revisado el 17/11/2026). Los cuatro estados (en stock, pocas unidades, reserva y agotado) salen bien y se actualiza al cambiar de variante. Corregida la barra de escasez, que con 1 unidad se pintaba más llena que con 2. Pendiente de decidir: la fecha de entrega usa la hora del ordenador del cliente y no la de España, y solo salta los domingos (no los sábados ni los festivos).
- [x] 🟢 **Metacampos vacíos** (hecho el 17/11/2026). Las pestañas de producto mostraban beneficios, composición ("65 % salmón fresco") y raciones inventados en cualquier producto sin datos. Ahora cada pestaña solo aparece si su metacampo tiene contenido, y si no hay ninguno no se muestra el bloque. Los cuidados y las insignias ya se ocultaban solos.
- [ ] 🟢 **Productos recomendados:** revisar el cambio de `offset: continue` a `slide_offset` en `main-product.liquid`.

## 5. Catálogo y constructor de packs

- [ ] 🟠 **Barra de catálogo por mascota** (`pet-catalog-bar.js`): filtra tarjetas en el navegador según etiquetas y tipo. Comprobar que funciona con paginación y filtros de Shopify y que no oculta productos que deberían verse.
- [ ] 🟠 **Constructor de packs:** añadir al carrito varios productos de una vez, mensajes de error si un producto se agota y precio total correcto.
- [ ] 🟢 **Filtros activos** (`facets-active-pills.liquid`): revisar que no se haya perdido nada al sustituir el bloque original de Dawn en `facets.liquid`, por ejemplo el rango de precio.

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
  - Producto agotado: "Reponiendo nuevo lote fresco de fábrica" sale en todos los agotados, también en los que no se van a reponer.
  - Mega menú: sin un producto destacado elegido, enseña un "Pack Bienestar & Digestión Saludable" de 29,70 € que no existe. Elegir un producto en el editor o quitar la tarjeta.
- [ ] 🟠 **Actualizar desde la versión nueva de Dawn.** `upstream/main` trae correcciones que este tema no tiene. Por ejemplo, el nombre de la variante elegida se pinta con `innerHTML` en vez de `textContent` en `global.js`, y la cesta rápida de varios productos se ha reescrito. Hay que revisar el cambio con cuidado porque el tema tiene muchas personalizaciones.
- [x] 🟢 Decidir qué hacer con las automatizaciones de Dawn en `.github/workflows/` (`cla.yml` y `stale.yml` no sirven aquí; `ci.yml` necesita claves de tienda para Lighthouse).
- [ ] 🟢 Repetir las pruebas en el navegador con Claude in Chrome, en el perfil CLAUDIA.
