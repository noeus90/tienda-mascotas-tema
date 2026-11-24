# Revisión del código (24/11/2026)

Revisión del código propio, sin contar el que viene de Dawn: el que se añadió desde el commit `258f00f6` (Dawn 16.0.0) del tema, y la app `peluqueria-reservas`. Solo se leyó el código; los fallos de prioridad alta se comprobaron uno a uno.

Prioridad: 🔴 puede dar un fallo real (envíos dobles, citas solapadas, datos falsos) · 🟠 mantenimiento o rendimiento claro · 🟢 limpieza.
Tamaño: **S** menos de una hora · **M** unas horas · **L** un día o más.

Al terminar una tarea: marcarla con `[x]`, la fecha y una línea de qué se hizo. Una tarea = un commit; Theme Check, o lint y build en la app, antes de subir.

## Ficheros más largos

| Fichero | Líneas | Propuesta |
|---|---|---|
| tema `assets/grooming-booking.js` | 2461 | Separar razas, API de la app, compartir/calendario y núcleo del asistente (CODE-09) |
| tema `assets/section-grooming-booking.css` | 1952 | Un archivo por paso y repartir el bloque de parches del final (CODE-14) |
| tema `assets/component-pet-cro.css` | 1540 | Hoy se carga en **todas** las páginas; dividir en global, ficha y carrito (CODE-05) |
| tema `snippets/grooming-booking-step-1.liquid` | 471 | Servicios, tamaño/raza y extras en snippets propios (CODE-12) |
| app `app/routes/app.citas.$id.jsx` | 669 | Una función por `intent` en `lib/appointment-actions.server.js` y componentes aparte (CODE-24) |
| app `app/lib/appointments.server.js` | 611 | Hora del salón, validación, disponibilidad y acceso a metaobjetos por separado (CODE-24) |
| app `app/routes/app.ajustes.jsx` | 448 | Un componente por formulario (CODE-24) |

## Tema · 🔴 fallos y datos falsos

- [x] 🔴 **CODE-01 · Datos de ejemplo en la reserva.** S *(hecho el 24/11/2026)*
  - `grooming-booking.js:97-98, 2323, 2403, 2412`: si faltan datos, usa el teléfono `+34 612 345 678` y la dirección «Calle Amor de Mascota 12, Madrid», que acaban en enlaces reales de WhatsApp y Google Maps.
  - Propuesta: sin dato, ocultar el botón. Ligado a los datos del salón que faltan.
  - Hecho: fuera los datos de ejemplo del JS, de la sección y de su esquema.
    - La sección calcula los datos una vez y se los pasa al paso 4:
      - WhatsApp y email: los de la sección o, si no hay, los de *Datos del salón*;
      - dirección: la de la sección o, si no hay, la de la tienda.
    - Sin WhatsApp no salen WhatsApp ni SMS; sin email, no sale «Enviar por email»; sin dirección, no salen la ubicación ni «Cómo llegar».
    - El email ya no cae en `shop.email` (el Gmail personal).
    - Probado en CLAUDIA con WhatsApp vacío y con un número de prueba (que luego se quitó), sin errores en la consola.
- [x] 🔴 **CODE-02 · Precios inventados si no llegan los servicios.** M *(hecho el 24/11/2026)*
  - `grooming-booking.js:183-195, 1333-1345`: cuatro servicios fijos con precio (28/34/42 €) y estado inicial «Baño Dermoprotector… 28,00 €».
  - Propuesta: los precios los decide la app; si no hay servicios, mostrar un error y no un precio.
  - Hecho: fuera los servicios y extras de ejemplo, y los precios por defecto, de la sección, del paso 1, del paso 4 y del JS.
    - Un servicio se ofrece si está activo y tiene sus tres precios; un extra, si está activo y tiene precio.
    - Sin servicios que cumplan eso, en lugar del formulario sale «Ahora mismo no se puede reservar cita online…» con un botón a contacto, y el JS no se inicia.
    - Probado en CLAUDIA:
      - con los 4 servicios reales y 5 extras: 15/25/40 €, y 45 € con uñas, sin errores;
      - forzando el caso sin servicios, que se quitó después.
    - Queda: en el aviso, la subcabecera sigue diciendo «Elige el servicio…».
- [x] 🔴 **CODE-03 · Sugerencias del carrito con solo 50 productos.** S *(hecho el 24/11/2026)*
  - `cart-upsell.liquid:46`: `collections['all'].products` solo trae los 50 primeros, así que con más catálogo se pierden candidatos. Además, si el añadir falla (por ejemplo un 422 por agotado), recarga sin avisar.
  - Propuesta: una colección «complementos» elegida en ajustes, y mirar `response.ok`.
  - Hecho:
    - Nuevo ajuste del tema *Sugerencias del carrito: colección* (en el grupo del envío gratis). Vacío: todo el catálogo, como antes. Con más de 50 productos, conviene una colección ordenada por precio de menor a mayor.
    - Si no se puede añadir, sale un aviso bajo las sugerencias y el botón vuelve a estar activo. Con un 422 (por ejemplo, agotado) se muestra el motivo que da Shopify, en el idioma de la tienda; si no, «No se ha podido añadir. Prueba otra vez.».
    - Probado en CLAUDIA: carrito con oreja de cerdo y 4 sugerencias. Con una variante agotada sale «El artículo 'Pelota mordedora perro' ya está agotado.». Se vació el carrito al acabar.
- [x] 🔴 **CODE-04 · Arreglo del pie que solo carga en la reserva.** S *(hecho el 24/11/2026)*
  - `section-grooming-booking.css:1860-1867`: la regla `.footer__localization .header-lang-switcher-form` es del pie, pero el CSS solo se carga en /pages/bookings, así que en el resto de páginas no se aplica.
  - Propuesta: moverla al CSS global.
  - Hecho: la regla pasa a `component-pet-cro.css` (global) y sale de la CSS de la reserva.
    - Hoy el selector de idioma del pie está desactivado, así que no se notaba. Si se activa, en móvil sale en su propia línea, bajo el país.
    - Probado en CLAUDIA a 390 px en la portada, activándolo un momento (luego se volvió a desactivar).

## Tema · 🟠 rendimiento y estructura

- [x] 🟠 **CODE-05 · Dividir `component-pet-cro.css`.** M *(hecho el 24/11/2026)*
  - Son 1540 líneas que bloquean el pintado en todas las páginas.
  - Propuesta:
    - global, unas 300 líneas: insignias, selector de idioma, banner de desarrollo y columnas del pie;
    - `component-pet-product.css`, cargado desde main-product: pestañas, sellos, suscripción, stock, ración, aviso de reposición y barra fija;
    - `component-pet-cart.css`: barra de envío gratis, sugerencias y extras del carrito.
  - De paso, quitar los selectores sin uso (CODE-15).
  - Hecho: las mismas reglas, solo repartidas (comprobado línea a línea):
    - `component-pet-cro.css`, global: 1560 → 467 líneas. Barra de envío gratis (también en el cajón del carrito), avisos de congelado y península, selector de idioma, banner de desarrollo, ahorro de packs, newsletter, portada, columnas del pie, pack único y búsqueda.
    - `component-pet-product.css`: 946 líneas. Se carga en `main-product` y `featured-product`, antes del CSS de Dawn, en el mismo orden que antes.
    - `component-pet-cart.css`: 157 líneas, en `main-cart-items` y `main-cart-footer`.
  - Probado en CLAUDIA comparando los estilos calculados de todos los elementos, antes y después, a 390 y 1280 px. Páginas: portada, dos fichas, carrito con producto normal y congelado, búsqueda y colección. Salen las mismas diferencias que dos capturas sin cambios (ruido de imágenes).
    - El modal de «añadir rápido» de las colecciones también carga el CSS de la ficha.
  - Los selectores sin uso siguen ahí; se quitan en CODE-15.

- [x] 🟠 **CODE-06 · Un solo «añadir al carrito».** M *(hecho el 24/11/2026)*
  - Hay tres versiones:
    - `pet-grooming-steps.liquid:219` (script en línea);
    - `cart-upsell.liquid:104` (script en línea);
    - `pet-bought-together.js:111`.
  - Propuesta: `petCart.add(items, button)` en un asset, que actualice el cajón del carrito, publique `cartUpdate` y muestre los errores. Los scripts en línea pasan a assets.
  - Hecho: `assets/pet-cart.js` (cargado en todas las páginas, con `defer`) con `petCart.add(items, { button, source, render })`.
    - Bloquea el botón mientras trabaja y abre el aviso o el cajón del carrito de Dawn.
    - Publica `cartUpdate` y devuelve el motivo de Shopify si hay un 422 (agotado…).
    - Lo usan la rutina de higiene, las sugerencias del carrito y «comprados juntos». Los dos scripts en línea quedan en unas pocas líneas.
  - Mejora de paso: con el carrito tipo «notificación» (el de la tienda), la rutina ya no lleva a la página del carrito; muestra el aviso como el resto de la tienda.
  - Probado en CLAUDIA:
    - rutina: un producto y la rutina entera; aviso abierto y contador a 5;
    - comprados juntos: 3 productos, aviso y contador a 3;
    - sugerencias del carrito: se añade y recarga; con una variante agotada sale el motivo en español.
    - Carrito vaciado al acabar.

- [ ] 🟠 **CODE-07 · Ajustes repetidos en muchos ficheros.** M
  - `settings.free_shipping_threshold | default: 50` se repite 11 veces, más `5000` en `pet-cro.js:263`. Propuesta: valor por defecto en settings_schema y quitar los `default:`.
  - La URL de reservas está en 8 ficheros. Propuesta: snippet `booking-url`. En `header-mega-menu-species.liquid:34-38` las dos ramas del `if` son iguales.
  - El producto tarjeta regalo se busca de dos formas: con un bucle sobre `collections.all`, que además mete un `stylesheet_tag` dentro del bucle (`grooming-booking.liquid:277`), o con el handle fijo. Propuesta: un ajuste de tipo producto.
- [ ] 🟠 **CODE-08 · Tipos y etiquetas de producto escritos a mano.** M
  - «Comida húmeda», «Snack», «perro», «gato»… aparecen en 9 ficheros: mega menú, cart-upsell, barra de catálogo, cajón del menú, categorías, relacionados, búsqueda, subnav y `pet-catalog-bar.js`.
  - Propuesta: una sola lista en un snippet o en ajustes.
- [ ] 🟠 **CODE-09 · Partir `grooming-booking.js`.** L
  - `grooming-breeds.js`: razas (l.17-89) y `resolveBreedInfo`.
  - `grooming-booking-api.js`: llamadas a `/apps/reservas/*`.
  - `grooming-booking-share.js`: ICS, Google Calendar, WhatsApp, SMS, mapas y copiar (l.2056-2430).
  - Núcleo: pasos, calendario y precio.
  - Hacerlo después de CODE-10 y CODE-11.
- [ ] 🟠 **CODE-10 · Código muerto en `grooming-booking.js`.** S
  - `prepareCustomerPayload` (l.1788), `getAddonPrice` (l.1460), `getBreedsCatalog` (l.622) y `window.refreshAllGroomingBookings` (l.2435) no se usan.
  - `bookingId` es de la agenda antigua; el UID del ICS debería usar `savedReference`.
  - `msSaveOrOpenBlob` es de Internet Explorer.
  - Las tres escuchas iguales de l.951-978 pueden ser una sola delegada.
- [ ] 🟠 **CODE-11 · Textos de la reserva fuera de las traducciones.** L
  - Hay unos 170 `{% if booking_en %}…{% else %}…` en los pasos 1-4 y el stepper, y 17 `isEn ? … : …` en el JS.
  - El JS usa `alert()` (l.2082 y 2085) y formatea el dinero a mano (`${n},00 €` 7 veces). También fija la hora en `'es-ES'` y escribe `'Europe/Madrid'` aunque ya existe `SALON_TIME_ZONE`.
  - Propuesta:
    - claves `pet_cro.booking.*`;
    - los textos del JS en un `<script type="application/json">` generado con `| t`;
    - el dinero con `formatCroMoney`;
    - los avisos en `submitStatus` en vez de `alert()`.
- [ ] 🟠 **CODE-12 · Partir `grooming-booking-step-1.liquid`.** M
  - 471 líneas. Propuesta: snippets de servicios, tamaño/raza y extras. Hacerlo junto con CODE-11.
- [ ] 🟠 **CODE-13 · Textos por defecto comparados con literales.** L
  - Hay unas 40 comparaciones del tipo `raw == 'Texto' or raw == 'Text'` (footer, cajón del menú, relacionados, aviso superior, colecciones…). Basta un espacio o una tilde cambiada en el editor para que deje de traducirse, y cada texto nuevo obliga a tocar el código.
  - Propuesta: ajustes vacíos por defecto, con la nota «vacío = texto traducido», y `section.settings.x | default: ('clave' | t)`. Después, vaciar esos valores en las plantillas.
- [ ] 🟠 **CODE-14 · Ordenar `section-grooming-booking.css`.** M
  - Hay 18 `!important`, de los que unos 10 son `[hidden]{display:none!important}` repetidos; basta una sola regla. Hay además una regla vacía (l.1799-1801).
  - Tiene 120 colores fijos; pasarlos a las variables del esquema de color.
  - Los puntos de corte van por libre (480, 520, 600, 680, 800); unificarlos con los de Dawn: 750 y 990.
  - Partir el fichero por pasos.

## Tema · 🟢 limpieza

- [x] 🟢 **CODE-15 · Ficheros y selectores sin uso.** S *(hecho el 24/11/2026)*
  - Ninguna plantilla usa `sections/collection-showcase.liquid` ni `sections/promo-banner.liquid`; borrarlas junto con su CSS.
  - Selectores sin uso:
    - los `.cro-benefits-list`, `.cro-actives-*` y `.cro-routine-*`, restos de cosmética, en `component-pet-cro.css` (l.165-310);
    - `.bundle-old-total`;
    - `.pet-mascot-count`;
    - `.mega-menu-pet__price-compare`.
  - Los comentarios de `component-pet-cro.css` nombran snippets que ya no existen.
  - Hecho (230 líneas menos):
    - borradas las secciones `collection-showcase` y `promo-banner`, su CSS y sus textos del editor (`es.schema.json`, `en.default.schema.json`);
    - borrado `snippets/custom-badge.liquid` y su regla: solo lo usaba `collection-showcase`;
    - quitadas las reglas de cosmética (`cro-benefits-list`, `cro-check-icon`, `cro-active*`, `cro-routine-*`, `cro-timing-tag`, `cro-step-num`), `bundle-old-total`, `pet-mascot-count` y `mega-menu-pet__price-compare`;
    - corregidos los comentarios con nombres de snippets antiguos.
  - Comprobado con un script que busca cada clase de los CSS propios en Liquid, JS y JSON. Las que se forman con una variable (`is-{{ stock_state }}`, `banner__content--{{ … }}`, `is-${…}`) se quedan.
  - Theme Check sin avisos. En CLAUDIA: portada, colección y ficha cargan todos sus CSS sin 404 y con los estilos de siempre.
- [ ] 🟢 **CODE-16 · Funciones globales en `pet-cro.js`.** S
  - `window.switchPetTab`, `selectPurchaseMode`, `updateDeliveryFrequency`… ya no hacen falta, porque hay delegación de eventos.
  - Propuesta: meterlo todo en un módulo y leer el 15 % de la suscripción del `data-` del widget (l.337 y 339).
- [ ] 🟢 **CODE-17 · Detalles de la reserva.** S
  - Los nombres de los extras se pintan con `innerHTML` (~l.1710); usar `textContent`.
  - No escucha `shopify:section:load`, así que en el editor no se reinicia.
  - Detectar Mac por el user agent manda a Apple Maps a todos los Mac.

## App · 🔴 fallos

- [x] 🔴 **CODE-18 · Emails duplicados del programador.** M *(hecho el 24/11/2026, app `4ee2156`)*
  - `reminders.server.js:105-116`: los `setInterval` viven en el proceso web. Con dos instancias, o al redesplegar, se envía dos veces, porque primero se envía y luego se marca.
  - `runReleases` puede solaparse consigo mismo si tarda más de 10 minutos.
  - Propuesta:
    - un candado en Prisma (`JobLock`: shop, job, lockedUntil) y una bandera `running` por tarea;
    - marcar «enviando» antes de llamar a Brevo;
    - un `try` por paso, para que un fallo en «rebook» no salte «reorder» ni «stock».
  - Hecho:
    - Tabla `JobLock` (migración `20261124140000_job_lock`) y `lib/job-lock.server.js` con `withJobLock(shop, tarea, minutos, fn)`.
    - Cada tarea corre con su candado por tienda: recordatorios, rebook, reposición, stock, bienvenida, señales, lista de espera y resúmenes. El candado dura como mucho 20 minutos y caduca solo si el proceso muere.
    - Los botones de «enviar ahora» del admin usan el mismo candado. Si está ocupado: «Ya se está enviando ahora mismo…».
    - Un fallo en una tarea ya no salta las demás, y se registra el error completo.
    - Una pasada lenta no se solapa con la siguiente del mismo temporizador.
  - Probado:
    - de 5 llamadas a la vez se ejecuta 1;
    - se libera tras un error y caduca solo;
    - en local, las 8 tareas del programador pasan y liberan el candado sin errores;
    - el botón de avisos de stock con el candado libre y ocupado.
  - No hecho: marcar «enviando» antes de llamar a Brevo. Con el candado, el único caso de envío doble que queda es que el proceso muera justo entre enviar y marcar, y sería una sola vez.

- [x] 🔴 **CODE-19 · Tope de 1000 citas.** S *(hecho el 24/11/2026, app `6106080`)*
  - `appointments.server.js:194 y 388`: 4 páginas de 250 sin filtrar por fecha, así que también cuentan las citas antiguas. Al pasar de 1000, la disponibilidad deja de ver citas y puede dar citas solapadas.
  - Propuesta: consultar solo desde hoy y paginar sin tope, o dar un error si quedan más páginas.
  - Hecho: nuevo `lib/metaobjects.server.js` con `listAllMetaobjects`, que lee hasta la última página.
    - Si la consulta falla, da un error claro. Si pasara de 25.000 elementos, también da error en vez de cortar sin avisar.
    - Lo usan las citas (disponibilidad y lista) y los perros, que tenían el mismo tope.
    - El filtro por fecha no se puede usar: Shopify ignora `fields.date:>=…` en estos metaobjetos (comprobado, devuelve también las pasadas), así que se leen todas.
  - Probado en local: disponibilidad general y por peluquera, agenda del admin y lista de perros, sin errores.
  - Siguen con su propio tope: `waitlist` (10 × 100), `stock-alerts` (20 × 100) y `reorder` (5 × 100). Se pueden pasar a este helper en CODE-25.

- [x] 🔴 **CODE-20 · Bienvenidas que se pueden perder.** S *(hecho el 24/11/2026, app `187bb7d`)*
  - `welcome.server.js:86-110`: `customers(first: 100)` sin paginar, y el filtro «no enviado» se aplica después. Con más de 100 clientes actualizados, los nuevos se quedan sin email.
  - Propuesta: paginar, o filtrar en la consulta.
  - Hecho: `pendingWelcomes` lee todas las páginas de 100 clientes con la etiqueta `newsletter` actualizados desde que se activó la bienvenida, y filtra después.
    - Pasados 5.000, da un error en vez de dejar gente sin email.
    - No se filtra en la consulta por «no enviado» porque el metacampo de la app no se puede buscar.
  - Probado: la consulta paginada (de 1 en 1) devuelve los mismos clientes que la lectura de una vez, sin repetidos. Hoy solo hay un suscriptor, que ya recibió su email.

- [x] 🔴 **CODE-21 · Aviso de stock que se repite.** S *(hecho el 24/11/2026, app `5f2c6d5`)*
  - `stock-alerts.server.js:131-139`: `markNotified` no mira `userErrors`. Si la actualización falla, el aviso se vuelve a enviar cada 30 minutos.
  - Hecho:
    - El aviso se marca como «avisado» antes de enviar el email. Si Shopify rechaza el cambio (`userErrors`), no se envía nada y se deja en el log.
    - Si el email falla, el aviso vuelve a «esperando».
    - Los borrados también comprueban `userErrors`; un fallo en uno no corta la pasada.
    - La lista usa `listAllMetaobjects` (sin el tope de 20 páginas).
  - Probado en local: el aviso de prueba, en espera para la oreja de cerdo (disponible), da «Enviados 1 de 1» y queda «Avisado»; al pulsar otra vez, no se repite. Además, un cambio rechazado por Shopify devuelve `userErrors`, que es lo que ahora corta el envío.

- [x] 🔴 **CODE-22 · Firma de los enlaces de baja.** S *(hecho el 24/11/2026, app `b0cbb9f`)*
  - Hay tres copias iguales: `rebook:92`, `reorder:192` y `welcome:113`.
  - Con `SHOPIFY_API_SECRET || ""`, si falta la variable se firma con una clave vacía y los enlaces se pueden falsificar.
  - Propuesta: `lib/signed-links.server.js` que dé error si falta el secreto.
  - Hecho: `lib/signed-links.server.js` con `signLink(propósito, id)` y `checkLink(…)`. Lo usan rebook, reposición y newsletter (sus funciones de antes llaman a este módulo).
    - Sin `SHOPIFY_API_SECRET`, firmar da error (no sale el email) y ningún enlace se da por válido.
    - El token tiene el mismo formato, así que los enlaces ya enviados siguen valiendo.
  - Probado:
    - el token nuevo es igual al antiguo;
    - no vale para otro propósito ni para otro id;
    - sin secreto, firmar da error;
    - en la tienda, la página de baja con un token válido pide confirmar y con uno falso dice «Enlace no válido» (no se pulsó confirmar).
  - No hecho: que caduquen. Cambiaría el formato y dejaría sin valer los enlaces ya enviados; se puede añadir más adelante aceptando los dos formatos durante un tiempo.
  - Nota: en local la CLI de Shopify pone el secreto; en producción hay que definir `SHOPIFY_API_SECRET` (ver CODE-28).

- [x] 🔴 **CODE-23 · Sin tests.** M *(hecho el 24/11/2026, app `3c013f0`)*
  - No hay ninguno. Empezar con Vitest por las funciones puras:
    - `salonInstant`, con el cambio de hora;
    - `validateAppointment`, `rebookPlan`, `refundPolicy`, `depositDueAt` y `priceBooking`;
    - la firma de los enlaces.
  - Añadir un script `check` (lint + test + build) para CI.
  - Hecho: Vitest (`vitest.config.js`, aparte de `vite.config.js`) con 50 tests en `app/lib/__tests__/`:
    - `salonInstant`: invierno, verano y los dos días de cambio de hora de 2026;
    - `validateAppointment`: con la fecha fijada; hoy y el día 120 valen, el 121 no; teléfono, email, campo anti-bots…;
    - `rebookPlan`: due, upcoming, booked, sent, no_email, off y old;
    - `depositDueAt`, `depositAmount` y `refundPolicy`;
    - `priceBooking`;
    - firma de enlaces.
  - Scripts `npm test` y `npm run check` (lint + tests + build), y el workflow `.github/workflows/ci.yml`, que lo ejecuta en cada push (verde).
  - ESLint ya no revisa `extensions/*/shopify.d.ts`, que genera la CLI.
  - Encontrado: `priceBooking` aún pone 28/34/42 € a un servicio sin precio para ese tamaño, y 5 € a un extra sin precio (el tema ya no los ofrece desde CODE-02). Queda documentado en un test; ver CODE-32.

## App · 🟠 estructura y robustez

- [x] 🟠 **CODE-32 · Precio de ejemplo en `priceBooking`.** S *(hecho el 24/11/2026, app `8b69e49`)*
  - `prices.server.js`: si un servicio no tiene precio para un tamaño, usa 28/34/42 €; si un extra no tiene precio, 5 €. Es la versión del servidor de lo que se quitó del tema en CODE-02.
  - Propuesta: devolver `{ error: "service" }` o `{ error: "addons" }` y cambiar el test que lo documenta.
  - Hecho: sin precio para el tamaño elegido se devuelve `{ error: "service" }`; un extra sin precio da `{ error: "addons" }`, y uno de 0 € sigue valiendo. La reserva responde 422 sin crear la cita.
  - Comprobado: los 4 servicios activos tienen sus tres precios y los 5 extras tienen precio, así que no se bloquea ninguna reserva real.
  - Probado: 51 tests en verde y, en local, una reserva con un servicio inexistente da 422 `fields: ["service"]`.

- [ ] 🟠 **CODE-24 · Partir los ficheros grandes.** L
  - `app.citas.$id.jsx` (669 líneas): 9 `intent` en una acción y las secciones de tarjeta regalo y fidelidad dentro.
  - `appointments.server.js` (611 líneas).
  - `app.ajustes.jsx` (448 líneas).
  - Ver la tabla del principio.
- [ ] 🟠 **CODE-25 · Código repetido entre módulos.** M
  - `gql()` está 3 veces, `setMetafields` 2, `storeInfo` 5, `escape` 5 y `addDays` 4.
  - La plantilla HTML de email está copiada en 5 módulos.
  - Propuesta:
    - `lib/shopify-gql.server.js` y `lib/dates.js`, con Europe/Madrid en un solo sitio;
    - `lib/email-layout.js`, con `layout()` y `button()`;
    - `lib/http.server.js` para el helper `json` de los proxys.
- [ ] 🟠 **CODE-26 · Abusos en los formularios públicos.** M
  - No hay límite de peticiones por IP en ningún endpoint del proxy.
  - El aviso de stock no confirma el email, así que se pueden apuntar direcciones ajenas.
  - `proxy.citas.jsx:66`: dos reservas a la vez pueden pisarse. Propuesta: un candado por tienda y día.
- [ ] 🟠 **CODE-27 · Emails de marketing y entregabilidad.** S
  - Faltan las cabeceras `List-Unsubscribe` y `List-Unsubscribe-Post` en bienvenida, rebook y reorder (Gmail y Yahoo las piden).
  - Faltan `<title>` y texto de previsualización.
  - Los grises `#888`/`#666` tienen poco contraste.
- [ ] 🟠 **CODE-28 · Producción.** M
  - SQLite en un fichero: con varias instancias no se comparten sesiones ni candados. Propuesta: Postgres.
  - El `Dockerfile` instala con `--omit=dev`, pero compila con `vite`, que está en devDependencies; comprobar si la build funciona.
  - Validar las variables de entorno al arrancar, en vez de cargar `.env` a mano en `email.server.js`.

## App · 🟢 limpieza

- [ ] 🟢 **CODE-29 · Herramientas.** S
  - ESLint 8 y `@typescript-eslint` 6 ya no tienen soporte.
  - Prettier está instalado, pero no hay ni configuración ni script `format`.
  - Hay varios `eslint-disable no-undef` por `process`.
- [ ] 🟢 **CODE-30 · Logs.** M
  - Hay 51 `console.*` sueltos. Propuesta: un logger mínimo con `shop` y `job`, que guarde la pila del error.
- [ ] 🟢 **CODE-31 · Baja de emails repetida.** S
  - `proxy.sin-recordatorios.jsx`: tres lectores de id y token y tres páginas casi iguales. Propuesta: una tabla de casos.

## Orden propuesto

1. Fallos con efecto real: CODE-18, 19, 20, 21, 22 (app) y CODE-01, 03, 04 (tema).
2. Tests de la app (CODE-23), antes de tocar su estructura.
3. Rendimiento del tema: CODE-05, 06 y 15.
4. Reserva: CODE-10, después 11 y 12, y al final 09 y 14.
5. El resto, poco a poco.
