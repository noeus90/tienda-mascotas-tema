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
- [ ] 🟠 **`pet-cro.js` (41 KB) y `component-pet-cro.css` (18 KB).** Se cargan desde 6 sitios distintos (carrito, cajón del carrito, producto…). Comprobar que no se descargan dos veces en la misma página y valorar partirlos por funcionalidad.
- [ ] 🟠 **CSS de peluquería** (`section-grooming-booking.css` 33 KB, `section-grooming-calendar.css` 30 KB): buscar reglas sin usar.
- [ ] 🟠 **Medir con Lighthouse** la portada, una colección, una ficha de producto y el carrito, en móvil. Anotar LCP, CLS y TBT para tener una referencia antes de optimizar.
- [ ] 🟢 **Imágenes de las secciones nuevas** (promo-banner, collection-showcase, pet-trust-badges, pasos de peluquería): `image_url` con `width`, `srcset`, `loading="lazy"` fuera de la primera pantalla, y `width`/`height` para evitar saltos de diseño.

## 3. Traducciones

- [ ] 🟠 **Doble sistema de idiomas.** Hay atributos `data-i18n-es` / `data-i18n-en` en 48 ficheros, que JavaScript intercambia en el navegador, además de los ficheros de `locales/`. Decidir uno. Lo recomendable en Shopify es usar solo `locales/` con el idioma de Shopify Markets. Así el HTML llega ya traducido y no hay parpadeo ni texto incorrecto para buscadores.
- [ ] 🟢 **Claves sin traducir o que faltan** entre `es.json` y `en.default.json`, y también en los ficheros de esquema.

## 4. Ficha de producto y carrito

- [ ] 🟠 **Selector de suscripción** (`subscription-selector.liquid`): comprobar que funciona con planes de venta reales y que no se rompe si el producto no tiene ninguno.
- [ ] 🟠 **Barra de envío gratis:** que se actualice al cambiar cantidades en el carrito y en el cajón, que use la moneda correcta y que el umbral de 49 € sea configurable y no esté fijo en el código.
- [ ] 🟠 **Widget de stock** (`stock-urgency-widget.liquid`): qué se muestra sin inventario gestionado, con stock 0 y con variantes.
- [ ] 🟢 **Metacampos vacíos:** las pestañas, los cuidados y las insignias no deben dejar huecos ni títulos sueltos cuando el producto no tiene datos.
- [ ] 🟢 **Productos recomendados:** revisar el cambio de `offset: continue` a `slide_offset` en `main-product.liquid`.

## 5. Catálogo y constructor de packs

- [ ] 🟠 **Barra de catálogo por mascota** (`pet-catalog-bar.js`): filtra tarjetas en el navegador según etiquetas y tipo. Comprobar que funciona con paginación y filtros de Shopify y que no oculta productos que deberían verse.
- [ ] 🟠 **Constructor de packs:** añadir al carrito varios productos de una vez, mensajes de error si un producto se agota y precio total correcto.
- [ ] 🟢 **Filtros activos** (`facets-active-pills.liquid`): revisar que no se haya perdido nada al sustituir el bloque original de Dawn en `facets.liquid`, por ejemplo el rango de precio.

## 6. Accesibilidad y SEO

- [ ] 🟠 **Menús nuevos** (mega menú por especie, submenú, cajón móvil): navegación con teclado, foco visible, `aria-expanded` y cierre con Escape.
- [ ] 🟠 **Datos estructurados:** validar `seo-schema-product` y `seo-schema-breadcrumbs` con la prueba de resultados enriquecidos de Google. Comprobar también que `aggregateRating` no se publica sin reseñas reales.
- [ ] 🟢 **Contraste de color** de insignias, banners y botones nuevos.

## 7. Antes de publicar

- [ ] 🔴 Quitar o condicionar el aviso de "Modo Desarrollo" de `layout/theme.liquid`.
- [ ] 🟠 Revisar los textos de prueba en `templates/*.json` (portada, producto, colección).
- [ ] 🟢 Decidir qué hacer con las automatizaciones de Dawn en `.github/workflows/` (`cla.yml` y `stale.yml` no sirven aquí; `ci.yml` necesita claves de tienda para Lighthouse).
- [ ] 🟢 Repetir las pruebas en el navegador con Claude in Chrome, en el perfil CLAUDIA.
