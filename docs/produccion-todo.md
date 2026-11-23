# Paso a producción: lista de tareas

Creada el 19/11/2026. Lo que falta para que la tienda (tema) y la app de reservas (`../peluqueria-reservas`) pasen de pruebas locales a una tienda real abierta al público.
Los detalles técnicos de cada punto del tema siguen en [`revision-todo.md`](revision-todo.md); aquí solo se enlazan.

Prioridad: 🔴 bloquea la apertura · 🟠 conviene tenerlo el primer día · 🟢 puede esperar a después

---

## 1. Cuenta de Shopify y negocio

- [ ] 🔴 **Plan de pago.** `brudabrey.myshopify.com` es una tienda de desarrollo: no puede cobrar. Elegir plan (Basic basta: la app no usa Shopify Functions ni necesita Plus) o transferir la tienda al propietario si se creó desde una cuenta de partner.
- [ ] 🔴 **Datos legales de la empresa** en *Configuración → Tienda*: razón social, NIF/CIF, dirección fiscal en España (ya está la dirección; revisar que es la real), email y teléfono de contacto.
- [ ] 🔴 **Pagos.** Activar Shopify Payments (pide datos de la empresa, cuenta bancaria y verificación de identidad; lo haces tú). Valorar Bizum/PayPal. Desactivar el modo de prueba y la "pasarela falsa" si se usó.
- [ ] 🔴 **Impuestos.** IVA de España incluido en los precios; decidir qué pasa con Canarias, Ceuta y Melilla (no llevan IVA) y con ventas a otros países de la UE (régimen OSS a partir de 10.000 €/año).
- [ ] 🔴 **Mercados.** Ahora hay mercados de EE. UU. y Canadá activos. Decidir si se vende fuera de España; si no, desactivarlos. Si sí, precios, aduanas y envíos para cada uno.
- [ ] 🔴 **Envíos.** *(20/11/2026: de momento solo península, en los dos perfiles de envío.)* Tarifas reales (peninsular, Baleares, Canarias si se vende allí), umbral de envío gratis que coincida con la barra del carrito, y transportista. **Envío refrigerado** (preparado el 20/11/2026 con importes de ejemplo; revisar precio y transportista) antes de vender BARF congelado.
- [ ] 🟠 **Stock real** en la ubicación de la tienda y política de qué hacer con los agotados ("seguir vendiendo" o no).
- [ ] 🟠 **Fotos reales de producto.** *(23/11/2026: los 42 productos tienen ilustraciones provisionales; ver `docs/imagenes-productos/`.)* Sustituirlas por fotos del envase real (fondo claro, cuadradas) y borrar la ilustración.

## 2. Dominio y correo

- [ ] 🔴 **Comprar y conectar el dominio** (p. ej. `.es` o `.com`) en *Configuración → Dominios*; que sea el principal y redirija desde `myshopify.com`. Shopify pone el HTTPS solo.
- [ ] 🔴 **Correo del dominio** (p. ej. `hola@tudominio.es`) como remitente de los emails de Shopify, con los registros DNS que Shopify indica.
- [ ] 🔴 **Brevo con dominio propio** (SPF, DKIM y DMARC). Ahora el remitente es un Gmail que Brevo reescribe a `@brevosend.com` y puede acabar en spam.
- [ ] 🟠 **Plantillas de notificación de Shopify** (confirmación de pedido, envío, reembolso…) en español y con la marca.

## 3. Legal (España / UE)

- [ ] 🔴 **Páginas legales** en *Configuración → Políticas* y enlazadas en el pie: aviso legal (LSSI, con los datos de la empresa), privacidad (RGPD), cookies, condiciones de venta, devoluciones (14 días de desistimiento y formulario de desistimiento) y envíos. Los generadores de Shopify son un punto de partida; conviene que las revise un profesional.
- [ ] 🔴 **Banner de cookies** con *Customer Privacy* de Shopify (rechazar tan fácil como aceptar) y que los píxeles de analítica respeten el consentimiento.
- [ ] 🔴 **Condiciones de la peluquería**: cancelaciones, retrasos, perros agresivos o con parásitos, responsabilidad. Enlazarlas desde el formulario de reserva y aceptar antes de confirmar.
- [ ] 🟠 **RGPD**: registro de actividades de tratamiento, contrato de encargado con Brevo y con el servidor de la app, y qué datos guarda la app (perros, teléfonos, emails) y cuánto tiempo.
- [ ] 🟠 **Newsletter** solo con consentimiento expreso (casilla sin marcar) y doble confirmación si se usa Brevo para marketing.
- [ ] 🟠 **Afirmaciones de los textos** (`revision-todo.md` §7): "4.9 / 5", "+2.400 familias", "Revisado por Veterinarios", "Aval Veterinario / 100% Natural" en todos los productos, "Reponiendo nuevo lote"… Quitar las que no sean ciertas: es publicidad engañosa.

## 4. Contenido real

- [ ] 🔴 **Sustituir los 37 productos de prueba**: nombres, precios, descripciones, fotos, pesos (para el envío), SKU, códigos de barras y etiquetas (`higiene`, necesidades, mascota). Borrar los de prueba.
- [ ] 🔴 **Datos reales del salón**: WhatsApp (ahora `+34 612 345 678`), dirección (ahora `Calle Amor de Mascota 12`), horario (metaobjeto `grooming_schedule`), servicios, extras y precios.
- [ ] 🔴 **Borrar datos de prueba**: citas "(PRUEBA)", fichas de perros de prueba, clientes de prueba, pedidos de prueba (#1001) y códigos `PELU5-` generados en las pruebas.
- [ ] 🟠 **Packs**: precio por separado (`custom.precio_por_separado`) en cada pack real; producto destacado del mega menú (ahora enseña un pack que no existe).
- [ ] 🟠 **Código del 10 % de la newsletter**: crearlo y que se envíe solo, o quitar la promesa del pie.
- [ ] 🟠 **Páginas**: Sobre nosotros, Contacto con datos reales, FAQ, y textos en inglés si se mantiene el idioma (Translate & Adapt).
- [ ] 🟢 Fotos propias del salón y del equipo (dan más confianza que las de banco de imágenes).

## 5. Tema

- [ ] 🔴 **Quitar o condicionar el banner "Modo Desarrollo Activo"** de `layout/theme.liquid` (p. ej. mostrarlo solo con `request.design_mode`).
- [x] 🟠 *(hecho el 20/11/2026, Dawn 16.2.0)* **Actualizar desde la última versión de Dawn** (`revision-todo.md` §7), con cuidado por las personalizaciones.
- [x] 🟠 *(hecho el 19/11/2026)* **CSS del formulario de reservas** a la escala de Dawn (1rem = 10 px) y **traducir sus textos fijos** (los `data-i18n-*` no los aplica nada; en inglés sale mezclado).
- [x] 🟠 *(hecho el 20/11/2026)* **Revisar los enlaces a Google Calendar y mapas** del formulario (zonas horarias y dirección codificada).
- [ ] 🟠 **Suscripción**: instalar una app de suscripciones y enviar el `selling_plan`, o dejar el selector oculto.
- [ ] 🟠 **Reseñas**: instalar una app de reseñas (Judge.me, Shopify Product Reviews…) para que salgan las valoraciones reales.
- [ ] 🟢 **Lighthouse automático en GitHub** (secretos `SHOP_STORE_OS2`, `SHOP_PASSWORD_OS2`, `SHOP_ACCESS_TOKEN`; ver `.github/workflows/ci.yml`).
- [ ] 🟢 Copia del tema publicado anterior (*Tienda online → Temas → Duplicar*) antes de publicar este, para poder volver atrás.

## 6. App de reservas (`peluqueria-reservas`)

- [x] 🔴 *(hecho el 20/11/2026)* **Repositorio en GitHub**: privado en `noeus90/peluqueria-reservas`, rama `main`. Sin `.env` ni base de datos (están en `.gitignore`).
- [ ] 🔴 **Servidor de pago siempre encendido** (Fly.io, Render, Railway… ≈5–10 €/mes; ya hay `Dockerfile`). Tiene que estar **siempre en marcha, sin "dormir"**: el temporizador de recordatorios (`app/lib/reminders.server.js`) vive dentro del proceso, y si el servidor se apaga no salen los recordatorios ni se guardan reservas.
- [ ] 🔴 **Base de datos de sesiones**: ahora es SQLite (`prisma/dev.sqlite`). En el servidor, o un disco persistente para SQLite o pasar a PostgreSQL; si no, cada despliegue borra las sesiones y la app deja de funcionar hasta reinstalarla.
- [ ] 🔴 **Variables de entorno en el servidor**: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`, las claves de Brevo y las que hay en `.env`. Nunca subir el `.env` a GitHub.
- [ ] 🔴 **`shopify.app.toml` de producción**: `application_url` (ahora `https://example.com`), URLs de redirección y app proxy apuntando al servidor real. Después, `shopify app deploy`.
- [ ] 🔴 **Acceso a red de las extensiones de cuenta** en el Dev Dashboard (lo usa "Editar datos" de *Mis perros*) antes de `shopify app deploy`.
- [ ] 🔴 **Instalar la app en la tienda real** (si la tienda de producción no es esta, como app personalizada) y aceptar los permisos.
- [ ] 🟠 **Tras desplegar**: añadir "Mis perros" al menú de la cuenta (*Configuración → Cuentas de cliente*) y colocar la tarjeta en Pedidos desde el editor de pago y cuentas.
- [ ] 🟠 **Avisos si algo falla**: monitor de disponibilidad (UptimeRobot, gratis) y registro de errores (Sentry, gratis), para enterarte si la app se cae y las reservas fallan.
- [ ] 🟠 **Protección contra abusos** del endpoint de reservas: ya hay campo trampa y, desde el 20/11/2026, máximo 3 citas pendientes por teléfono. Falta un límite de peticiones por IP en el servidor (el proxy de Shopify no garantiza la IP del cliente: mejor en el proveedor, p. ej. Cloudflare).
- [x] 🟢 *(hecho el 19/11/2026)* Pendientes de la fase 5: historial de citas en la cuenta, señal o pago por adelantado, capacidad por peluquero.

## 7. Analítica y buscadores

- [ ] 🟠 **Google Search Console** con el dominio y el `sitemap.xml` de Shopify.
- [ ] 🟠 **Google Analytics 4 / Meta** con las apps oficiales (Google & YouTube, Facebook & Instagram), respetando el consentimiento de cookies.
- [ ] 🟠 **Prueba de resultados enriquecidos de Google** con la tienda ya publicada.
- [ ] 🟢 Ficha de **Google Business Profile** del salón (las búsquedas "peluquería canina cerca de mí" vienen de ahí).
- [ ] 🟢 Títulos y descripciones SEO de productos, colecciones y páginas.

## 8. Pruebas finales (antes de quitar la contraseña)

- [ ] 🔴 **Pedido real** con tarjeta de verdad, de principio a fin (carrito, código de descuento, envío, email de confirmación, preparación) y luego **reembolsarlo**.
- [ ] 🔴 **Reserva real** desde la web publicada, con el servidor de producción: llega a la agenda, emails de recibida/confirmada/cancelada, recordatorio del día anterior, código del 5 % al completarla.
- [ ] 🔴 **Móvil**: compra y reserva en un iPhone y un Android reales.
- [ ] 🟠 Cuenta de cliente: iniciar sesión, *Mis perros*, editar un perro, reservar con la sesión iniciada.
- [ ] 🟠 Revisar en inglés si se mantiene el idioma.
- [ ] 🟠 Lighthouse en móvil de portada, colección, producto y carrito ya en producción.

## 9. Apertura

- [ ] 🔴 Publicar el tema y **quitar la contraseña** de la tienda (*Tienda online → Preferencias*).
- [ ] 🟠 Comprobar que el dominio, el HTTPS y las redirecciones funcionan.
- [ ] 🟢 Primeros días: revisar cada día pedidos, reservas, emails en spam y errores de la app.
