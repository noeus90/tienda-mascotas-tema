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

Situación el 19/11/2026: el formulario de reservas (`grooming-booking`, página "Reservar cita") funciona para el cliente, pero **las citas solo se guardan en el navegador de quien reserva** (`localStorage`). La peluquería no las recibe, el calendario (`grooming-calendar`) solo ve las de su propio navegador, puede haber dos citas a la misma hora, ninguna página muestra el calendario y su PIN (`1234`) está en el HTML. Servicios, extras y horario ya se editan en *Contenido → Metaobjetos*.

**Decisión (19/11/2026): app propia de Shopify** (opción 3). Las citas se guardan como metaobjetos de Shopify, el formulario de la web habla con la app por un *app proxy* (`/apps/...`) y el calendario va dentro del admin. Coste cero en desarrollo: `shopify app dev` sirve la app desde el ordenador; el servidor de pago (≈5–10 €/mes, por confirmar) solo hace falta en producción. Es una app sin Shopify Functions, así que no necesita Shopify Plus.

Cada fase deja algo que funciona.

### Fase 0. Preparación
- [x] 🔴 **Quitar la suscripción a la newsletter del formulario** (hecho el 19/11/2026; falta probar el formulario entero en Chrome cuando CLAUDIA vuelva a tener la contraseña de la tienda). Se borró `grooming-booking-customer-sync.liquid` y sus llamadas en `grooming-booking.js`. Antes: `grooming-booking-customer-sync.liquid` usa el formulario de suscripción de Shopify: cada reserva da de alta al cliente como suscrito al marketing sin pedirle permiso (RGPD), y el teléfono y la nota probablemente no se guardan.
- [x] **Crear la app** (hecho el 19/11/2026): `../peluqueria-reservas` (plantilla React Router de Shopify, JavaScript), instalada en la tienda de desarrollo. Se arranca con `shopify app dev --store brudabrey.myshopify.com` desde esa carpeta; en el admin sale en *Apps → peluqueria-reservas*. Falta subirla a su propio repositorio de GitHub.
- [x] **Definir el metaobjeto "Cita de peluquería"** (hecho el 19/11/2026, `$app:appointment` en `shopify.app.toml`; solo admin, no se ve en la tienda). Campos: resumen, fecha, hora, duración, servicio, tamaño, extras, precio, perro (nombre, raza, edad, cuidados), tutor (nombre, teléfono, email), estado (pending, confirmed, completed, cancelled), canal y notas. El enlace a la ficha del cliente se añade en la fase 4 (necesita permisos de clientes).

### Fase 1. La peluquería recibe las citas
- [x] **Guardar la cita en Shopify** (hecho el 19/11/2026): `POST /apps/reservas/citas` (app proxy, ruta `app/routes/proxy.citas.jsx` de la app) comprueba la firma de Shopify, valida los datos (`app/lib/appointments.server.js`: fecha entre hoy y 120 días, hora, teléfono de 9 a 15 cifras, email, campo trampa para bots) y crea la cita en estado "pendiente". Probado con una petición firmada: la válida se guarda y sale en el admin; la inválida devuelve qué campos fallan.
- [x] **El formulario envía la cita** (hecho y probado en Chrome el 19/11/2026): botón "Confirmar reserva" en el paso 4; con doble clic sale una sola petición y una sola cita; mensaje "¡Reserva recibida!" y después WhatsApp, calendario y "Cómo llegar"; ya no deja volver a editar. Si falla, dice qué revisar y deja WhatsApp como alternativa. El paso 3 no deja seguir con un teléfono de menos de 9 cifras ni con un email mal escrito (el email sigue siendo opcional). Arreglado de paso: el aviso "¡Solicitud generada con éxito!" salía siempre, antes de enviar nada, porque el CSS le ganaba a `hidden`. Citas de prueba guardadas: "Toby (PRUEBA)", "Luna (PRUEBA WEB)" y "Rocky (PRUEBA OTRA PERSONA)" y "Horario (PRUEBA)": se pueden borrar desde la agenda de la app.
- [x] **Lista de citas en el admin** (hecho el 19/11/2026): *Apps → peluqueria-reservas* muestra fecha, hora, servicio, perro, tutor y estado. Hay una cita de prueba ("Toby (PRUEBA)", 22/11/2026).

- [ ] 🟠 **Tamaños del CSS del formulario** (`section-grooming-booking.css`): parece escrito para 1rem = 16 px, como pasaba en la barra de catálogo, así que los textos salen al 62,5 %. Revisar y pasar a la escala de Dawn.

### Fase 2. Sin citas a la misma hora
- [x] **Horas ocupadas reales** (hecho el 19/11/2026): `GET /apps/reservas/disponibilidad?from=&to=` devuelve los tramos ocupados de cada día (solo horas, sin datos personales), contando la duración de cada cita y sin las canceladas.
- [x] **El formulario usa esas horas** (hecho el 19/11/2026): las carga al abrir la página y cada vez que se entra al paso 2; una hora está ocupada si se solapa con una cita, teniendo en cuenta también la duración de la cita que se está pidiendo. Ya no guarda nada en el navegador (se quitó la agenda en `localStorage` y el ajuste "Sincronizar agenda"). Si la app no responde, se muestran todas las horas y la app comprueba al guardar.
- [x] **Comprobación al guardar** (hecho el 19/11/2026): si la hora se solapa con otra cita, la app responde 409 y el formulario vuelve al paso 2 con "Vaya, alguien acaba de reservar esa hora" y la hora ya marcada como ocupada. Probado en Chrome reservando la misma hora desde otro sitio mientras el formulario estaba en el paso 4. Dos peticiones en el mismo instante podrían pasar las dos: aceptable para un solo salón por ahora.
- [x] 🟠 **La app comprueba el horario del salón** (hecho el 19/11/2026, `app/lib/schedule.server.js`): lee el metaobjeto *Horario de peluquería* con las mismas reglas y valores por defecto que el formulario (días abiertos, horas de mañana y tarde, horas de sábado y días cerrados) y rechaza lo demás. Probado: rechaza domingos, el festivo del 8 de diciembre, las 12:00 de un sábado y las 13:00 de un lunes; acepta las 19:00 de un martes (cita de prueba "Horario (PRUEBA)", 24/11/2026). La cita de prueba "Toby" (domingo) se guardó antes de este cambio.

### Fase 3. Calendario en el admin
- [x] **Vista de mes y de semana** (hecho el 19/11/2026): *Apps → peluqueria-reservas* abre la agenda (mes por defecto; en semana se ve hora de inicio y fin, perro y servicio), con colores por estado y la lista "Pendientes de confirmar".
- [x] **Gestionar citas** (hecho el 19/11/2026): cada cita tiene su página con todos los datos, teléfono y email con enlace, y botones para confirmar, completar, cancelar (libera la hora) y reabrir (solo si la hora sigue libre); se puede editar y eliminar (con ventana de confirmación). "Nueva cita" sirve para las citas por teléfono: elige canal y estado, y avisa si la hora se solapa. Desde el admin no se aplica el horario del salón (el personal puede dar citas fuera de horario), pero sí la comprobación de solapes. Probado en Chrome: confirmar, editar notas, crear con solape (lo rechaza) y sin solape, y eliminar.
- [x] **Quitar el calendario del tema** (hecho el 19/11/2026): borrados la sección `grooming-calendar` (con el PIN en el HTML y `RESET_FLAG`), sus 4 fragmentos, JS, CSS, las plantillas `page.bookings.json` y `page.grooming-calendar.json` y sus textos del editor. En el tema de desarrollo de Shopify siguen los archivos antiguos (el push no borra), pero no los usa ninguna página.

### Fase 4. Cliente y avisos
- [x] **Ficha del cliente** (hecho el 19/11/2026, `app/lib/customers.server.js`): cada cita, de la web o del admin, busca al cliente por email o teléfono, o lo crea (etiqueta `peluqueria-canina`, nota con el perro, teléfono con +34, idioma de la página de reserva) y queda enlazado en la cita ("Ver en Clientes"). No se suscribe a nadie: el paso 3 tiene una casilla opcional, desmarcada, para recibir novedades por email. Hizo falta declarar en el *Dev Dashboard → peluqueria-reservas → Configuración → Datos protegidos de clientes* el nivel 1 y nombre, email y teléfono (motivos: atención al cliente y funcionalidad de la app); las preguntas de protección de datos solo son obligatorias para publicar en la App Store. Probado: cliente nuevo sin suscripción, segunda reserva con el mismo email sin duplicar, casilla marcada suscribe, cliente nuevo en español.
- [x] **Emails con Brevo** (hecho y probado el 19/11/2026, `app/lib/email.server.js` y `app/lib/appointment-emails.server.js`; los 5 emails llegaron como «Entregado» en Brevo): al cliente cuando llega la solicitud desde la web, cuando se confirma y cuando se cancela (desde la página de la cita); aviso al salón de cada reserva de la web (`SALON_NOTIFY_EMAIL`). En español o inglés según el idioma de la reserva, y con respuesta al email del salón. Sin clave no se envía nada y la cita se guarda igual. Clave en el `.env` de la app (no se sube a git). El remitente es un Gmail: Brevo lo envía como `…@brevosend.com` y puede caer en spam; con dominio propio, autenticarlo en Brevo → Dominios y cambiar `BREVO_SENDER_EMAIL`.
- [x] **Recordatorio** el día antes (hecho y probado el 19/11/2026, `app/lib/reminders.server.js`): mientras la app está en marcha, cada 30 minutos desde las 10:00 envía el recordatorio de las citas **confirmadas** de mañana con email, y lo apunta en la cita para no repetirlo. También hay un botón "Enviar recordatorios de mañana" en la agenda. En producción necesita que el servidor esté siempre encendido. WhatsApp automático, solo si se decide en producción (la API cobra por mensaje).
- [ ] **Enlaces a Google Calendar y mapas** (`grooming-booking.js:1289`, `:1813`, `:1822`): comprobar las zonas horarias y que la dirección sale bien codificada.

### Fase 5. Valor añadido
- **Ficha del perro**, en 4 fases (la tienda usa las cuentas de cliente nuevas, así que «Mi cuenta» se amplía con una extensión de la app, no con Liquid):
  - [x] **2a. Fichas en la agenda** (hecho y probado el 19/11/2026, `app/lib/dogs.server.js`): metaobjeto `$app:dog` (nombre, raza, tamaño, edad, cuidados, notas del salón, tutor). Cada reserva se vincula al perro del mismo nombre y tutor (cliente de Shopify o teléfono) o crea su ficha, y la actualiza con lo último que indique el tutor. Páginas **Perros** y ficha del perro en la app; en cada cita, la ficha con notas del salón editables y el historial. Las 11 citas antiguas ya tienen ficha.
  - [ ] **2b. «Mis perros» en la cuenta del cliente**: sus perros, próximas citas e historial (con los códigos del 5 % aún válidos). Comprobar si la extensión necesita permiso de acceso a red; si no, guardar un resumen en la ficha del cliente.
  - [ ] **2c. Reserva más rápida**: con la sesión iniciada, el formulario rellena los datos del tutor y deja elegir uno de sus perros.
  - [ ] **2d. Editar desde la cuenta**: el cliente corrige los datos de su perro o añade otro.
- [ ] **Historial de citas** en la cuenta del cliente.
- [x] **5 % en higiene** después de la cita (hecho y probado el 19/11/2026, `app/lib/discounts.server.js`): al marcar la cita como **completada** se crea un código único `PELU5-XXXXXX` (un uso, 30 días, combinable con envío gratis) para la colección automática «Higiene» (handle `pack-de-higiene`, etiqueta `higiene`). Se guarda en la cita y se envía en un email de agradecimiento con un enlace que aplica el código. Si el cliente no tiene email, la agenda lo muestra para dárselo en persona. La colección se renombró de «Pack de higiene» a «Higiene» el mismo día; el handle no cambia porque lo usa la app. Los productos de higiene nuevos deben llevar la etiqueta `higiene`.
- [ ] **Señal o pago por adelantado** en el checkout, para reducir las citas a las que no viene nadie.
- [ ] **Capacidad por peluquero** (varias citas a la misma hora si hay varios).

### Fase 6. Producción
- [ ] Servidor de pago para la app, pruebas completas y datos reales del salón (WhatsApp y dirección: ahora son de ejemplo, `+34 612 345 678` y `Calle Amor de Mascota 12`).

## 2. Rendimiento

- [x] 🔴 **Peso del JavaScript de peluquería** (hecho el 18/11/2026). La portada cargaba el formulario de reservas completo (`grooming-booking.js` 82 KB + `section-grooming-booking.css` 33 KB). Ahora el formulario está solo en la página "Bookings" (`/pages/bookings`, en español `/es/pages/bookings`): va en la plantilla de página normal (`templates/page.json`) y la sección solo se pinta en esa página, porque el admin solo deja asignar plantillas del tema publicado. De paso se arregló el botón "Reservar cita": en español llevaba a `/es/pages/reservas`, que daba 404, y en inglés a una página vacía. El calendario (`grooming-calendar.js`) no lo carga ninguna página: `/pages/grooming-calendar` no existe (va con la revisión del calendario). El título de la página se tradujo al español ("Reservar cita") con Translate & Adapt; la dirección sigue siendo `bookings` en los dos idiomas.
- [x] 🟠 **`pet-cro.js` (41 KB) y `component-pet-cro.css` (18 KB).** Hecho: se cargan una sola vez desde `theme.liquid` y `pet-cro.js` pesa ahora 12,5 KB. Se cargan desde 6 sitios distintos (carrito, cajón del carrito, producto…). Comprobar que no se descargan dos veces en la misma página y valorar partirlos por funcionalidad.
- [x] 🟠 **CSS de peluquería** (revisado el 18/11/2026): casi todas las clases se usan. Las 7 que no aparecen en el código (`is-mixed`, `status-pending`…) se forman en JavaScript. Ahora solo se cargan en su página, así que no hay nada que quitar.
- [x] 🟠 **Medir con Lighthouse** la portada, una colección, una ficha de producto y el carrito, en móvil. Anotar LCP, CLS y TBT para tener una referencia antes de optimizar.
- [x] 🟢 **Imágenes de las secciones nuevas** (revisado el 18/11/2026): los pasos de peluquería y el escaparate de colección usan `image_url` con `srcset`, `sizes`, `width`/`height` y `loading="lazy"` salvo en la primera sección. Los sellos de confianza son SVG y el banner promocional, un emoji.

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
  - [x] **Botones de mascota** (hecho el 18/11/2026). Son enlaces a `/collections/perros`, `/collections/gatos` y `/collections/all`, y conservan la categoría elegida al cambiar de mascota.
  - [x] **Botones de categoría** (hecho el 18/11/2026). Salen del filtro "Tipo de producto" de la colección, con el número real de productos, y solo los que tienen alguno. Cambian la rejilla sin recargar la página.
  - [x] **Recuento y "sin resultados"** (hecho el 18/11/2026). El texto usa `collection.products_count` y el mensaje vacío es el de Dawn. `pet-catalog-bar.js` ya no filtra tarjetas: ha pasado de 478 a unas 120 líneas.
  - [x] **Convivencia con los filtros de Dawn** (hecho el 18/11/2026). La barra se vuelve a pintar cada vez que `facets.js` recarga la rejilla, también con el botón Atrás.
  - [x] **Mega menú y menú del móvil** (hecho el 18/11/2026). Enlazan a `/collections/perros?filter.p.product_type=Pienso` y similares, y las necesidades a `filter.p.tag=cachorro`. Es igual en español y en inglés.
  - [x] **Enlaces antiguos** (hecho el 18/11/2026). `pet-catalog-bar.js` redirige `?mascota=perro&categoria=juguetes` (y `?pet=dog&category=toys`) a la URL nueva. Probado.
  - [ ] **Inglés y necesidades.** Shopify no muestra el filtro de etiquetas ("Necesidad") en las páginas traducidas (`/es/`), aunque `filter.p.tag` sí filtra. Por eso la barra tiene su propia fila "Por etapa o necesidad" con las etiquetas de la colección. En inglés sí sale también el filtro lateral, y solo con las necesidades (ajuste "Etiquetas del filtro Necesidad"). Pendiente:
    - los tipos de producto y las etiquetas no se traducen; en la barra sí, porque usa los textos del tema;
    - ~~ningún producto tenía las etiquetas `gatito`, `senior`, `sensible` ni `bolas de pelo`~~: resuelto el 18/11/2026 con 20 productos de prueba más (37 en total), que las tienen. Se añadieron las necesidades `hipoalergenico`, `sin cereales` y `control de peso` (ajuste, barra, filtro y menús, en español e inglés). La etiqueta `sensible` se llamaba "Hipoalergénico" en el menú; ahora es "Sensible" y la nueva `hipoalergenico` es "Hipoalergénico". Los nombres, precios y descripciones de prueba son inventados: hay que cambiarlos por los del proveedor antes de publicar.
  - [ ] **Pruebas en Chrome (perfil CLAUDIA).** Hecho el 18/11/2026 en escritorio: con 17 productos (16 por página), "Pienso" encuentra los 2 piensos, cada mascota da su número, mascota + categoría + necesidad se combinan, se quita cada filtro, el botón Atrás funciona y la redirección de enlaces antiguos también. Móvil probado el 18/11/2026 en una ventana de 390 px: la página no se sale de ancho y los filtros funcionan. Se corrigió que todos los tamaños de la barra estaban escritos para 1rem = 16 px, cuando en Dawn 1rem = 10 px: los textos medían 8,5 px. Ahora miden 13–15 px, en móvil cada botón mide 44 px de alto, cada fila cabe en una línea que se desplaza de lado y la barra ocupa 286 px en vez de 408. Falta repetir Lighthouse en la colección: `shopify theme dev` pierde la sesión de la tienda al poco de arrancar y redirige a la página de contraseña.
- [x] 🟠 **Constructor de packs** (probado el 18/11/2026 con la colección Perros). Añade varios productos de una vez y el total es correcto (38,30 € − 15 % = 32,55 €). Corregido:
  - sin colección enseñaba 6 productos inventados y simulaba añadirlos; ahora en ese caso solo se ve en el editor del tema;
  - los productos agotados salen con el botón desactivado;
  - si Shopify rechaza el pack (por ejemplo, un producto agotado) se muestra su mensaje en vez de "añadido correctamente";
  - el aviso del carrito no se abría y daba error;
  - se ha quitado "Fórmula 100% natural aprobada por veterinarios", que salía en cualquier producto sin datos.
  Pendiente: **el carrito no aplica el 10 % / 15 %**, porque no hay ningún descuento automático en Shopify. El cliente ve 32,55 € en el pack y paga 38,30 €.
- [x] 🟠 **Se suelen comprar juntos** (`pet-bought-together.liquid`) (hecho el 18/11/2026). Bloque nuevo de la ficha, debajo del botón de compra: el producto con hasta 2 complementarios, con casillas, desplegable de opciones y un botón "Añadir N a la cesta · total" que los añade a la vez. Sin descuento. Las parejas se eligen en *Search & Discovery → Recomendaciones*; están puestas en los 37 productos (los 20 de prueba nuevos se añadieron el mismo día). Los productos agotados no salen y, si un producto no tiene complementarios disponibles, el bloque no se muestra. Probado en Chrome (CLAUDIA) en español, inglés y a 390 px: total, desplegable, cambio de opción del producto principal y carrito (2 líneas, 22,40 €).
- [x] 🟢 **Filtros activos** (`facets-active-pills.liquid`) (revisado el 17/11/2026). La extracción es igual al código de Dawn en los cuatro sitios (vertical, horizontal, cajón y móvil), incluido el rango de precio y "Borrar todo". Probado en la colección: las píldoras de disponibilidad y precio aparecen, se quitan sin recargar y el mensaje de "sin productos" sale una vez.
- [ ] 🟠 **Packs temáticos para quitar stock** (decidido el 18/11/2026; el Pack BARF está terminado, solo queda el envío refrigerado). Sustituyen al constructor de packs: packs cerrados con un 10 % de descuento, hechos con la app gratuita Shopify Bundles (el pack es un producto con su precio y descuenta el stock de cada producto). Primer pack: **Pack BARF iniciación**.
  - [x] **4 productos BARF** de prueba (hechos el 18/11/2026, 20 unidades de cada uno): menú pollo y verduras (8,90 €), menú ternera y cordero (10,90 €), cuellos de pollo (6,90 €) y mezcla de verduras y algas (9,90 €), con el tipo nuevo "Dieta BARF".
  - [x] **Tipo "Dieta BARF" en el tema** (hecho el 18/11/2026): botón en la barra de catálogo y enlace en el menú de perros, en español e inglés.
  - [x] **Comprados juntos** entre los 4 productos BARF (hecho el 18/11/2026: cada menú con la mezcla y los cuellos; la mezcla y los cuellos con los dos menús).
  - [x] *(tú, OK)* **Instalar Shopify Bundles** (instalada el 18/11/2026).
  - [x] **Crear el pack** con los 4 productos (hecho el 18/11/2026): "Pack BARF iniciación", 32,90 €, tipo "Pack", etiquetas perro, barf y pack, en la colección automática nueva "Packs" (etiqueta = pack). El carrito cobra 32,90 €. **Pendiente de decidir:** el precio de comparación (36,60 €) está guardado pero no se ve, porque el mercado España tiene "Precio de comparación: oculto" (Mercados → españa). Mostrarlo es decisión de la tienda: en la UE, anunciar una rebaja exige como precio anterior el más bajo de los últimos 30 días.
  - [x] **Portada y textos** (hecho el 18/11/2026): sección nueva `pet-packs` en la portada en lugar del constructor, que se ha borrado del tema. Los packs muestran "Ahorras X frente a comprarlos por separado" con el metacampo nuevo `custom.precio_por_separado` (decimal; se rellena en cada pack), en vez del precio tachado. El banner de peluquería dice "Ver packs (-10 %)" y enlaza a la colección Packs. El menú de escritorio que usa la tienda (`header-species-subnav.liquid`, tipo "desplegable") seguía con enlaces antiguos `?mascota=`: ahora usa las colecciones y filtros de Shopify, y tiene "Dieta BARF" y "Packs -10 %" (solo si hay packs de esa mascota). La tarjeta destacada del mega menú (solo con el tipo "mega menú") enseña el primer pack en vez de un producto inventado.
  - [x] **Pruebas en Chrome (CLAUDIA)** (hechas el 18/11/2026): el carrito cobra 32,90 €; ficha, portada, banner y menú en español e inglés; en móvil (390 px) todo cabe. Pedido de prueba #1001 desde el admin (borrador marcado como pagado, sin tarjeta): el pack sale como sus 4 productos ("Parte de: Pack BARF iniciación", con los 32,90 € repartidos) y cada uno pasa de 20 a 19 disponibles. Se canceló con reembolso manual y reponiendo inventario: vuelven a 20.
  - [ ] *(antes de vender BARF de verdad)* **Envío refrigerado** para los congelados: la tarifa Standard no lo cubre.

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
