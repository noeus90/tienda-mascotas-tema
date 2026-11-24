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

- [ ] 🔴 **CODE-01 · Datos de ejemplo en la reserva.** S
  - `grooming-booking.js:97-98, 2323, 2403, 2412`: si faltan datos, usa el teléfono `+34 612 345 678` y la dirección «Calle Amor de Mascota 12, Madrid», que acaban en enlaces reales de WhatsApp y Google Maps.
  - Propuesta: sin dato, ocultar el botón. Ligado a los datos del salón que faltan.
- [ ] 🔴 **CODE-02 · Precios inventados si no llegan los servicios.** M
  - `grooming-booking.js:183-195, 1333-1345`: cuatro servicios fijos con precio (28/34/42 €) y estado inicial «Baño Dermoprotector… 28,00 €».
  - Propuesta: los precios los decide la app; si no hay servicios, mostrar un error y no un precio.
- [ ] 🔴 **CODE-03 · Sugerencias del carrito con solo 50 productos.** S
  - `cart-upsell.liquid:46`: `collections['all'].products` solo trae los 50 primeros, así que con más catálogo se pierden candidatos. Además, si el añadir falla (por ejemplo un 422 por agotado), recarga sin avisar.
  - Propuesta: una colección «complementos» elegida en ajustes, y mirar `response.ok`.
- [ ] 🔴 **CODE-04 · Arreglo del pie que solo carga en la reserva.** S
  - `section-grooming-booking.css:1860-1867`: la regla `.footer__localization .header-lang-switcher-form` es del pie, pero el CSS solo se carga en /pages/bookings, así que en el resto de páginas no se aplica.
  - Propuesta: moverla al CSS global.

## Tema · 🟠 rendimiento y estructura

- [ ] 🟠 **CODE-05 · Dividir `component-pet-cro.css`.** M
  - Son 1540 líneas que bloquean el pintado en todas las páginas.
  - Propuesta:
    - global, unas 300 líneas: insignias, selector de idioma, banner de desarrollo y columnas del pie;
    - `component-pet-product.css`, cargado desde main-product: pestañas, sellos, suscripción, stock, ración, aviso de reposición y barra fija;
    - `component-pet-cart.css`: barra de envío gratis, sugerencias y extras del carrito.
  - De paso, quitar los selectores sin uso (CODE-15).
- [ ] 🟠 **CODE-06 · Un solo «añadir al carrito».** M
  - Hay tres versiones:
    - `pet-grooming-steps.liquid:219` (script en línea);
    - `cart-upsell.liquid:104` (script en línea);
    - `pet-bought-together.js:111`.
  - Propuesta: `petCart.add(items, button)` en un asset, que actualice el cajón del carrito, publique `cartUpdate` y muestre los errores. Los scripts en línea pasan a assets.
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

- [ ] 🟢 **CODE-15 · Ficheros y selectores sin uso.** S
  - Ninguna plantilla usa `sections/collection-showcase.liquid` ni `sections/promo-banner.liquid`; borrarlas junto con su CSS.
  - Selectores sin uso:
    - los `.cro-benefits-list`, `.cro-actives-*` y `.cro-routine-*`, restos de cosmética, en `component-pet-cro.css` (l.165-310);
    - `.bundle-old-total`;
    - `.pet-mascot-count`;
    - `.mega-menu-pet__price-compare`.
  - Los comentarios de `component-pet-cro.css` nombran snippets que ya no existen.
- [ ] 🟢 **CODE-16 · Funciones globales en `pet-cro.js`.** S
  - `window.switchPetTab`, `selectPurchaseMode`, `updateDeliveryFrequency`… ya no hacen falta, porque hay delegación de eventos.
  - Propuesta: meterlo todo en un módulo y leer el 15 % de la suscripción del `data-` del widget (l.337 y 339).
- [ ] 🟢 **CODE-17 · Detalles de la reserva.** S
  - Los nombres de los extras se pintan con `innerHTML` (~l.1710); usar `textContent`.
  - No escucha `shopify:section:load`, así que en el editor no se reinicia.
  - Detectar Mac por el user agent manda a Apple Maps a todos los Mac.

## App · 🔴 fallos

- [ ] 🔴 **CODE-18 · Emails duplicados del programador.** M
  - `reminders.server.js:105-116`: los `setInterval` viven en el proceso web. Con dos instancias, o al redesplegar, se envía dos veces, porque primero se envía y luego se marca.
  - `runReleases` puede solaparse consigo mismo si tarda más de 10 minutos.
  - Propuesta:
    - un candado en Prisma (`JobLock`: shop, job, lockedUntil) y una bandera `running` por tarea;
    - marcar «enviando» antes de llamar a Brevo;
    - un `try` por paso, para que un fallo en «rebook» no salte «reorder» ni «stock».
- [ ] 🔴 **CODE-19 · Tope de 1000 citas.** S
  - `appointments.server.js:194 y 388`: 4 páginas de 250 sin filtrar por fecha, así que también cuentan las citas antiguas. Al pasar de 1000, la disponibilidad deja de ver citas y puede dar citas solapadas.
  - Propuesta: consultar solo desde hoy y paginar sin tope, o dar un error si quedan más páginas.
- [ ] 🔴 **CODE-20 · Bienvenidas que se pueden perder.** S
  - `welcome.server.js:86-110`: `customers(first: 100)` sin paginar, y el filtro «no enviado» se aplica después. Con más de 100 clientes actualizados, los nuevos se quedan sin email.
  - Propuesta: paginar, o filtrar en la consulta.
- [ ] 🔴 **CODE-21 · Aviso de stock que se repite.** S
  - `stock-alerts.server.js:131-139`: `markNotified` no mira `userErrors`. Si la actualización falla, el aviso se vuelve a enviar cada 30 minutos.
- [ ] 🔴 **CODE-22 · Firma de los enlaces de baja.** S
  - Hay tres copias iguales: `rebook:92`, `reorder:192` y `welcome:113`.
  - Con `SHOPIFY_API_SECRET || ""`, si falta la variable se firma con una clave vacía y los enlaces se pueden falsificar.
  - Propuesta: `lib/signed-links.server.js` que dé error si falta el secreto.
- [ ] 🔴 **CODE-23 · Sin tests.** M
  - No hay ninguno. Empezar con Vitest por las funciones puras:
    - `salonInstant`, con el cambio de hora;
    - `validateAppointment`, `rebookPlan`, `refundPolicy`, `depositDueAt` y `priceBooking`;
    - la firma de los enlaces.
  - Añadir un script `check` (lint + test + build) para CI.

## App · 🟠 estructura y robustez

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
