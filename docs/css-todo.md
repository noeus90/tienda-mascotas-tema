# Revisión del CSS (25/11/2026)

Revisión del CSS propio del tema: lo que se ha añadido o cambiado desde Dawn 16.0.0 (commit `258f00f6`). Son 5.691 líneas en 23 ficheros, más los `{% style %}` de las secciones propias. El CSS de Dawn no se toca salvo donde el propio lo pisa.

Cómo se revisó:
- **Estático:** colores fijos, `!important`, puntos de corte, tamaños de letra, radios, transiciones, foco, movimiento y clases sin uso.
- **Medido en CLAUDIA:** 7 páginas (inicio, colección, ficha, carrito, reserva, búsqueda y contacto) a 1280 y a 390 px. Se midieron desbordes, letra de menos de 12 px y contraste.
- **A ojo:** inicio, colección y ficha, en escritorio y en móvil.

Lo que ya está bien:
- Ninguna página desborda en horizontal a 390 px.
- No hay texto con poco contraste en las 7 páginas medidas.
- Casi no queda CSS sin usar: CODE-15 ya lo limpió.
- La reserva ya tiene sus colores en variables (CODE-14).

Prioridad: 🔴 se ve mal o falla para alguien · 🟠 incoherencia que se nota en la tienda · 🟢 mantenimiento.
Tamaño: **S** menos de una hora · **M** unas horas · **L** un día o más.

Al terminar una tarea: marcarla con `[x]`, la fecha y una línea de qué se hizo. Una tarea = un commit. Antes de subir: Theme Check y comprobar en CLAUDIA a 390 y 1280 px. Si no cambia nada visible, comparar los estilos calculados antes y después, como en CODE-14.

## Cifras

| Medida | Ahora | Objetivo |
|---|---|---|
| Colores fijos (hex y `rgb()`) fuera de la reserva | ~~227 hex y 64 `rgb()`~~ ✅ 61 variables `--pet-*` (quedan blanco, negro y el aviso de desarrollo) | Variables de marca en un solo sitio (CSS-01) |
| `!important` | 61 (29 en `component-list-menu.css`, 19 en `component-menu-drawer.css`, 11 en `component-mega-menu.css`) | Casi ninguno (CSS-12) |
| Tamaños de letra distintos | ~~42~~ ✅ 9 variables `--pet-text-*`, 12 px como mínimo | 6 o 7 de una escala (CSS-10) |
| Radios distintos | ~~22~~ ✅ 6 variables `--pet-radius-*` (más los círculos) | 4 variables (CSS-11) |
| `transition: all` | 36 | 0 (CSS-14) |
| Animaciones propias con alternativa sin movimiento | ~~1 de 8~~ ✅ todas (regla común) | Todas (CSS-13) |
| Puntos de corte fuera de los de Dawn | 750, 480, 1150 y 1200 px | 749 y 989 px (CSS-16) |

## 🔴 Se ve mal o falla para alguien

- [x] 🔴 **CSS-02 · Colores fijos en secciones con esquema de color.** M *(hecho el 25/11/2026)*
  - Hay 9 secciones propias con el ajuste «Esquema de color»: categorías, catálogo, contacto, CTA y pasos de peluquería, promesas, packs, tarjeta regalo y reserva.
  - Pero su CSS pone fondos `#ffffff` y textos `#0f172a`, `#1e293b` o `#475569` fijos. Con un esquema oscuro, las tarjetas quedan blancas y el texto, oscuro sobre oscuro. Lo mismo pasa en los menús y la ficha.
    - Sitios: `component-pet-cro.css:21, 74, 97`; `section-pet-catalog-bar.css:47`; `section-gift-card-promo.css:36, 66`; `component-pet-product.css:305, 309, 344, 383, 427, 430, 453, 615, 677`; `component-list-menu.css:154, 216`; `component-mega-menu.css:163, 281, 306`; `component-menu-drawer.css:247`; `component-card.css:661`.
  - Propuesta:
    - fondos con `rgb(var(--color-background))`;
    - textos con `rgb(var(--color-foreground))` y su opacidad (`0.75`, `0.6`);
    - los acentos, con las variables de CSS-01.
  - Probar cada sección con el esquema 1 y con uno oscuro.
  - Medido antes del cambio, con las secciones propias, la cabecera y la ficha en el esquema 4 (fondo casi negro):
    - texto blanco sobre fondos pastel fijos, con contraste 1,0–1,1: lista del bloque de peluquería, calculadora de ración, pack, emojis de categorías;
    - texto verde de marca sobre negro, con contraste 3,4: precios, «Añadir», «desde 15 €», iconos de la cabecera, reserva;
    - cajas blancas: categorías, importes y antetítulo de la tarjeta regalo, círculos de iconos, banner del pack, chips de mascota.
  - Hecho: las variables de CSS-01 dependen ahora del esquema (`snippets/pet-tokens.liquid`).
    - En los esquemas claros (1 y 2) valen lo mismo que antes.
    - Para cada esquema oscuro (3, 4 y 5, según `color_brightness` del fondo), Liquid las recalcula con `color_mix`:
      - los fondos pastel pasan a un tinte oscuro de su color (verde, rojo, ámbar, azul, morado…) mezclado con el fondo del esquema;
      - los bordes se suavizan igual;
      - el texto gris pasa al color de texto del esquema;
      - el texto de color se aclara (verde menta, rojo claro, ámbar claro…).
    - Variables nuevas:
      - `--pet-card` para las cajas blancas (blanco en claro, un gris un poco más claro que el fondo en oscuro);
      - `--pet-text-*` para el color de texto de las variables que también se usan de fondo: los botones verdes siguen verdes y su texto, blanco.
      - La reserva tiene sus `--booking-text-*`.
    - En 18 hojas: los `color:` con esas variables pasan a `--pet-text-*` y los fondos `#ffffff` a `--pet-card`. Las líneas de Dawn no se tocan.
    - Arreglo de paso: la etiqueta «online» del botón de reservar de la cabecera era verde claro sobre verde en la página de reservas (contraste 4,3). Ahora es blanca.
  - Comprobado:
    - **Esquema oscuro**, con las plantillas cambiadas solo en el tema de desarrollo y restauradas después: cero textos con poco contraste en inicio, ficha, colección y reserva, a 1280 y 390 px. Solo quedan blancos los botones de Dawn, que en el esquema 4 lo son a propósito.
    - **Esquema claro:** huella de colores calculados con el código anterior y el nuevo en 12 vistas (inicio, ficha, colección, carrito, reserva, contacto, búsqueda). Sale idéntica salvo la etiqueta «online».
    - Theme Check sin avisos.
- [x] 🔴 **CSS-13 · Movimiento reducido.** S *(hecho el 25/11/2026)*
  - Hay animaciones sin alternativa para quien pide menos movimiento en el sistema:
    - la entrada de cada paso y la sacudida del campo con error (`section-grooming-booking.css`);
    - las de `grooming-booking-step-1.css` y `-step-4.css`;
    - 3 de las 4 de `component-pet-product.css`, entre ellas los dos puntos que laten sin parar junto al stock (`croPulseGreen`, `croPulseAmber`).
  - Solo tres ficheros tienen `prefers-reduced-motion`. En `component-pet-product.css` solo cubre la barra fija de compra; en `section-pet-categories.css` y `section-pet-grooming-steps.css`, sus transiciones.
  - Propuesta: una regla común en `@media (prefers-reduced-motion: reduce)` que quite animaciones y transformaciones del CSS propio, como hace `base.css` con lo de Dawn.
  - Hecho:
    - `component-pet-cro.css` (sección 12), que se carga en todas las páginas, tiene una regla en `@media (prefers-reduced-motion: reduce)`. Cubre los componentes propios y todo lo que llevan dentro, incluidos `::before` y `::after`.
      - Los reconoce por los fragmentos de clase `pet-`, `cro-`, `booking-`, `grooming-`, `cta-booking`, `mega-menu-pet`, `header__species`, `sticky-atc`, `trust-badge`, `gift-card-promo`…; se comprobó que ninguna clase de Dawn los contiene.
      - Las animaciones y transiciones pasan a durar 0,01 ms, y los puntos que laten se paran tras un ciclo.
      - No se usa `animation: none` por dos motivos: los fundidos terminarían ocultos, y el JS de Dawn (cajones del carrito) espera el evento `transitionend`, que con `none` no llega.
    - `grooming-booking.js`: los dos `scrollIntoView` de la reserva usan desplazamiento suave solo si el sistema no pide menos movimiento.
  - Comprobado en CLAUDIA en el inicio, la ficha y la reserva:
    - El navegador acepta la regla: aparece en el CSSOM. Un primer intento con un pseudoelemento dentro de `:is()` era inválido y se habría ignorado entero.
    - Aplicada sin la condición de media, detiene los 96 a 192 elementos animados propios de cada página; no queda ninguno moviéndose.
    - En 5 páginas, lo animado que queda fuera son piezas de Dawn (botones, campos, filtros) con transiciones de color cortas.
    - No se pudo activar «reducir movimiento» del sistema desde la extensión: la comprobación es sobre la regla, no con la preferencia real.
- [x] 🔴 **CSS-15 · Foco visible en la reserva y en las píldoras.** S *(hecho el 25/11/2026)*
  - Los pasos 1 a 3 de la reserva no tienen ningún `:focus-visible` propio: tarjetas de servicio, tamaños, extras, días, horas y peluqueras.
  - Muchas píldoras tienen `:hover` pero no foco: «Perro / Gato», categorías, importes de la tarjeta regalo y «Añadir» de la rutina.
  - Hay que recorrer con el teclado y comprobar que siempre se ve dónde está el foco.
  - Propuesta: un anillo de foco común (`--pet-focus-ring`) aplicado a todos los controles propios.
  - Revisado con el teclado de verdad en CLAUDIA (Tab y flechas). Las mediciones con `focus()` desde un script no sirven para el contorno: daban valores que no cuadran con ninguna regla.
    - **Sin foco visible:** las tarjetas de servicio (4), tamaño (3), extras (5) y horas de la reserva. Su casilla está oculta (`visually-hidden`) y la tarjeta no cambiaba.
    - **Bien:** la cabecera («Contacto» con el recuadro de Dawn y «Reservar cita» con su anillo), las píldoras de categoría y mascota (contorno de Dawn), el buscador de raza (borde verde), los botones de días, peluqueras y «mis perros», y las casillas visibles de cuidados y privacidad.
  - Hecho:
    - `--pet-focus-outline` y `--pet-focus-offset` en `pet-tokens.liquid`: contorno de 2 px en el verde de texto de la marca (`--pet-text-accent`), que se aclara en los esquemas oscuros (CSS-02).
    - Reserva: las tarjetas de servicio, tamaño, extra y hora muestran ese anillo cuando su casilla tiene el foco de teclado (`:has(> input:focus-visible)`). Las horas, que pinta el JS, tienen la misma estructura.
    - Los cuatro contornos propios que ya había pasan a la misma variable, en lugar de tres verdes y dos grosores distintos: botón de reservar de la cabecera, idioma, menú desplegable de mascotas, y pestañas y opciones de la ficha.
  - Comprobado con el teclado: Tab hasta los servicios (anillo en «Baño y aseo»), flecha a «Corte a tijera» (el anillo se mueve con la selección), Tab a tamaños («Mini») y Tab al primer extra. Theme Check sin avisos.

## 🟠 Incoherencias que se notan

- [x] 🟠 **CSS-01 · Paleta de marca en un solo sitio.** M · *base de CSS-02 a CSS-07* *(hecho el 25/11/2026)*
  - El verde de la marca está escrito a mano 53 veces (`#047857`), junto con otros 10 tonos de verde y `rgba(4, 120, 87, …)` en 8 opacidades.
  - Las variables `--booking-*` de CODE-14 solo existen dentro de la reserva.
  - El chip «Ver todo» del catálogo usa un azul (`#0369a1`) que no aparece en ningún otro sitio.
  - Propuesta:
    - subir la paleta a `:root`, en un fichero propio que cargue `theme.liquid` (por ejemplo `pet-tokens.css`), con acento, acento suave, aviso, error, información y los tintes de las tarjetas;
    - hacer que la reserva use esas variables;
    - cambiar los hex de `component-pet-product.css` (48), `component-pet-cro.css` (29), `component-mega-menu.css` (25), `component-list-menu.css` (24), `component-card.css` (24), `section-gift-card-promo.css` (19), `section-pet-grooming-steps.css` (14), `component-menu-drawer.css` (12) y `section-pet-catalog-bar.css` (10).
  - Hecho:
    - `snippets/pet-tokens.liquid` define en `:root` 61 variables `--pet-*`, en formato `r, g, b` para usarlas con `rgb()` y `rgba(…, opacidad)`.
      - Se agrupan en marca (verdes), texto y neutros, aviso, error, información, etiquetas de las tarjetas y otros (crema del bloque de peluquería, WhatsApp).
      - `theme.liquid` lo carga antes de `base.css`, sin petición extra.
    - En 14 ficheros, los 227 hex y 64 `rgb()`/`rgba()` de color pasan a 224 usos de esas variables. Las líneas de Dawn no se tocan.
    - La reserva conserva sus nombres `--booking-*`, que ahora apuntan a las globales: el verde se cambia en un solo sitio para toda la tienda.
    - Se dejan fijos el blanco y el negro puros (fondos y sombras), que cambia CSS-02 por los del esquema, y el rosa del aviso «Modo desarrollo», que se quita al publicar.
    - Los tonos se mantienen exactos: juntar los parecidos (hay 14 verdes) cambiaría el aspecto y queda para cuando se decida CSS-03 y CSS-04.
  - Comprobado:
    - Huella de los colores calculados de todos los elementos y sus `::before`/`::after` en 8 páginas a 1280 y 390 px (inicio, colecciones de perros y gatos, ficha, carrito con un producto, reserva, búsqueda y contacto) y una en inglés. Son 15 vistas y salen idénticas antes y después; solo se descartan los dos puntos que laten, porque su sombra está animada.
    - Los menús y el cajón cuentan aunque estén cerrados.
    - Las 61 variables usadas están definidas y no sobra ninguna, así que los `:hover` también resuelven. Theme Check sin avisos.
- [x] 🟠 **CSS-03 · Una sola familia de botones.** M · *necesita una decisión* *(hecho el 25/11/2026)*
  - Hoy conviven cuatro:
    - **negro rectangular** de Dawn: «Ver la tienda», «Reservar cita», «Añadir la rutina al carrito», «Añadir al carrito» del pack;
    - **verde relleno:** «Regalar una tarjeta»;
    - **verde en píldora con borde:** «Añadir» en los pasos de peluquería;
    - **oscuro en píldora:** «Reservar cita ONLINE» en la cabecera.
  - Las tarjetas de producto usan el rectangular con borde de Dawn.
  - Decisión: ¿el botón principal es negro, como ahora el esquema de Dawn, o verde de la marca? Si es verde, basta cambiar el color de botón del esquema en el editor y quitar los verdes a mano.
  - Propuesta:
    - principal y secundario de Dawn (`.button`, `.button--secondary`) en todo;
    - la píldora, solo para chips de filtro;
    - el CTA de la cabecera puede ser una excepción, si se quiere destacar.
  - Decisión de la dueña: **botón principal verde**.
  - Hecho:
    - Esquemas claros 1 y 2 (`config/settings_data.json`):
      - botón principal `#047857` con texto blanco (contraste 5,5:1);
      - secundario con texto y borde `#047857`.
      - Los esquemas oscuros 3–5 mantienen sus botones blancos.
      - Al ser el color del esquema, cambian a la vez todos los `.button` de Dawn y los de las secciones propias: banner, peluquería, rutina, packs, fichas, carrito y tarjetas de producto.
    - «Regalar una tarjeta»: ya era `.button` y llevaba el verde puesto a mano. Se quita, y ahora es el principal del esquema.
    - «Añadir» de la rutina de peluquería: era una píldora propia con borde verde y pasa a `button button--secondary`. Solo queda un ajuste de tamaño para que quepa junto al precio.
    - Se mantiene como excepción el botón «Reservar cita» de la cabecera (píldora oscura con «ONLINE»), para que destaque, como decía la propuesta.
    - Los botones de la reserva ya eran verdes y no se tocan.
  - Comprobado a ojo en CLAUDIA, en el inicio y la ficha: todos los botones principales en verde relleno y los secundarios con borde verde.
  - Pendiente, que es CSS-04: la variante elegida (3 kg / 12 kg) y otros chips activos siguen en negro.
- [x] 🟠 **CSS-04 · Un solo estilo de «seleccionado».** S *(hecho el 25/11/2026)*
  - El chip activo cambia según la página:
    - verde en «Perro / Gato» del inicio;
    - negro en «Todos / Perros / Gatos» del catálogo y en las variantes de la ficha (3 kg / 12 kg);
    - azul en las categorías del catálogo.
  - Propuesta: un solo estilo activo con el color de CSS-01, y que los chips de categoría compartan forma con los de mascota.
  - Hecho: toda píldora o chip elegido es **verde de la marca con texto blanco**, como el botón principal de CSS-03.
    - «Todos / Perros / Gatos» del catálogo: de negro a verde.
    - Categorías del catálogo («Pienso seco»…): de azul a verde, con su sombra en verde. `--pet-sky-600` deja de usarse y se quita.
    - Variantes de la ficha y de la compra rápida (3 kg / 12 kg): Dawn las rellenaba con el color del texto (negro). `component-pet-cro.css`, sección 14, las pone en verde con un selector de dos clases, porque el CSS de Dawn se carga después.
    - Ya eran verdes y no se tocan: «Perro / Gato» del inicio, idioma, horas de la reserva y el botón de reservar del cajón móvil.
    - Las **tarjetas** elegidas (servicio, tamaño, extras, suscripción, «mis perros») siguen con tinte verde y borde verde. Es la otra forma de «seleccionado», para bloques grandes, y ya era coherente.
  - No se ha cambiado la forma: las píldoras de mascota y de categoría siguen como estaban (redonda y algo cuadrada). Unificarla entra mejor en CSS-11 o CSS-05, si se quiere.
  - Comprobado en CLAUDIA: «Perros» y «Pienso seco» activos en `rgb(4, 120, 87)` con texto blanco, «3 kg» en verde en la ficha, y «Perro» del inicio igual que antes. Theme Check sin avisos.
- [x] 🟠 **CSS-05 · Un solo antetítulo.** S *(hecho el 25/11/2026)*
  - Hay cuatro estilos:
    - verde en mayúsculas sin fondo («✂ PELUQUERÍA CANINA»);
    - píldora verde clara («ASÍ LO HACEMOS EN LA PELUQUERÍA»);
    - píldora blanca con borde («REGALO PARA PELUDOS»);
    - rojo con emoji («📦 PACK»).
  - Propuesta: un componente `.pet-kicker` con una variante de color como mucho.
  - Hecho: `.pet-kicker` en `component-pet-cro.css` (sección 15), que se carga en todas las páginas. Es una píldora verde suave con texto verde en mayúsculas, de 12 px y peso 700.
    - Tiene una sola variante, `--on-tint`, con el fondo de tarjeta (blanco), para cuando el antetítulo va sobre un bloque ya teñido.
    - Se aplica a los cinco antetítulos:
      - «Así lo hacemos en la peluquería» (pasos) y «🐾 Peluquería canina» de la reserva: normal;
      - «✂️ Peluquería canina» (bloque de peluquería), «📦 Pack» y «Regalo para peludos»: `--on-tint`.
    - El del pack deja el rojo y pasa a verde, como el resto. El de peluquería pasa de texto suelto a píldora.
    - Se borran las cinco reglas propias que había (`grooming-steps__kicker`, `grooming-cta__kicker`, `gift-card-promo__kicker`, `pack-banner__kicker`, `grooming-booking-badge`).
    - Los emojis siguen en el texto de cada sección.
  - Comprobado a ojo en CLAUDIA, en el inicio (peluquería, pasos, pack y tarjeta regalo) y en la reserva: los cinco iguales; sobre los paneles verde y rosa la píldora blanca destaca. Theme Check sin avisos.
- [x] 🟠 **CSS-06 · Títulos de sección iguales.** S *(hecho el 25/11/2026)*
  - «Lo que te prometemos» tiene un tamaño y un grosor propios (800); el resto de títulos son los `h2` de Dawn, en peso normal.
  - En el inicio, unos títulos van a la izquierda («¿Qué estás buscando?», «Nuestros favoritos», «Packs…») y otros centrados («Su rutina…», «Lo que te prometemos»).
  - Propuesta: todas las secciones propias con las clases de Dawn (`h1`/`h2`, `inline-richtext`), el ajuste «Tamaño del título» y una alineación común, o un ajuste de alineación por sección.
  - Decisión de la dueña: **todos los títulos a la izquierda**, como las secciones de Dawn. La cabecera de la reserva sigue centrada, porque es la cabecera de la página.
  - Hecho:
    - **«Tamaño del título»**, el mismo ajuste de Dawn (h2, h1, h0; por defecto h2), en categorías, rutina, promesas y packs. El `h2` usa esa clase en vez de una fija.
    - **«Alineación del título»** (izquierda o centrado; por defecto izquierda) en la rutina y las promesas, que eran las centradas. Al centrar se aplica `.pet-section-header--center` (`component-pet-cro.css`, sección 16) a la cabecera: antetítulo, título y subtítulo.
      - Categorías y packs no lo llevan, porque tienen el selector Perro/Gato o el enlace «Ver todos» a la derecha.
    - «Lo que te prometemos» deja su tamaño de 32 px y su negrita y pasa al `h2` de Dawn (24 px, peso normal), alineado a la izquierda.
    - La rutina de peluquería pasa de centrada a la izquierda.
    - El título de la reserva deja su tamaño fluido de 28–36 px y peso 800, y pasa al `h1` de Dawn (40 px, peso normal), como la ficha y el contacto.
  - Comprobado a ojo en CLAUDIA, en el inicio (rutina y promesas) y en la reserva. Theme Check sin avisos.
  - Se ve que la sección de promesas empieza más a la izquierda que el resto: es el ancho de más de CSS-08.
- [x] 🟠 **CSS-07 · Paneles de la ficha de producto.** M *(hecho el 25/11/2026)*
  - En móvil se apilan siete cajas, cada una con un estilo:
    - stock y envío: blanca con borde;
    - barra de envío gratis: verde;
    - «¿Cuánto le doy al día?»: amarilla;
    - garantías: gris;
    - «Se suelen comprar juntos»: blanca con borde;
    - «Conservación y cuidado»: gris con borde izquierdo negro;
    - «Beneficios»: pestañas con una sola pestaña.
  - Propuesta:
    - un `.pet-panel` común, con un radio, un borde, un relleno y dos tintes (neutro y acento);
    - «Beneficios» sin pestañas cuando solo hay una;
    - las casillas de «Comprar juntos» con `accent-color` de la marca (hoy salen negras).
  - Hecho:
    - `.pet-panel` en `component-pet-cro.css` (sección 17): fondo de tarjeta, borde de 1 px del color de texto al 12 %, radio `--pet-radius-md`, relleno de 1,6 × 2 rem y 1,6 rem de margen arriba y abajo.
      - `--accent` (fondo y borde verdes) solo para la barra de envío gratis.
      - Las casillas y radios de dentro llevan `accent-color` verde.
    - Se aplica a los siete paneles: stock y envío, barra de envío gratis (`--accent`), calculadora de ración, garantías, «Se suelen comprar juntos», «Conservación y cuidado» y las pestañas de producto.
    - Se quitan de sus reglas propias el fondo, el borde, el radio, el relleno y los márgenes, que eran distintos en cada una.
      - La calculadora deja el amarillo y las garantías el gris translúcido.
      - «Conservación» deja su barra negra a la izquierda.
      - La barra de envío conserva el espacio inferior para las etiquetas.
    - **Una sola pestaña:** `pet-product-tabs.liquid` pinta un título con icono («♡ Beneficios») en vez de una barra con una pestaña, y el contenido no lleva los roles de pestaña. Con dos o más pestañas todo sigue igual.
  - Comprobado en CLAUDIA a 390 px:
    - los siete paneles con el mismo radio (12 px), relleno (16 × 20 px) y fondo blanco, y la barra de envío en verde;
    - «Beneficios» sin barra de pestañas y sin espacio sobrante;
    - las casillas de «Comprar juntos» en verde.
  - Theme Check sin avisos. La barra de envío del carrito también usa el panel, así que gana 1,6 rem de margen arriba.
- [x] 🟠 **CSS-08 · Ancho y separación de las secciones.** S *(hecho el 25/11/2026)*
  - «Lo que te prometemos» va de 40 a 1240 px en una pantalla de 1280, y el resto del contenido, de 90 a 1190 (`.page-width`): las tarjetas sobresalen 50 px por cada lado.
  - En móvil, «Packs con un 10 % de descuento» tiene 30 px de margen lateral y las demás secciones, 15.
  - El espacio vertical entre secciones varía mucho en el inicio: hay un hueco grande después de la rutina de peluquería y antes de los packs.
  - Propuesta: todas dentro de `.page-width`, y la separación con los ajustes de relleno superior e inferior de cada sección (los mismos valores por defecto).
  - Medido antes, en el inicio:
    - el relleno vertical de cada sección era 40/24, 32/32, 60/60, 44/36, 44/44, 36/36 y 52/52 px;
    - las promesas usaban su propio contenedor, con 1200 px de ancho máximo y 2,4 rem de relleno;
    - «Packs», en móvil, llevaba `title-wrapper--self-padded-mobile`, que suma 15 px de margen.
  - Hecho:
    - **Relleno:** 36/36 px (el de Dawn) como valor por defecto en las seis secciones propias. En `templates/index.json`, categorías, bloque de peluquería y favoritos pasan también a 36/36. Sigue siendo un ajuste de cada sección.
    - **Promesas:** su contenedor pasa a `.page-width`. Se quitan el ancho máximo y el relleno propios.
    - **«Packs»:** fuera la clase del margen extra en móvil.
  - Comprobado en CLAUDIA, inicio:
    - las siete secciones bajo el banner con relleno 36/36 en escritorio y 27/27 en móvil;
    - contenido entre 90 y 1190 px a 1280 (15–375 a 390);
    - los títulos de promesas y packs empiezan en el mismo borde que los demás;
    - a ojo, las tarjetas de las promesas se alinean con las columnas del pie.
  - Theme Check sin avisos.
- [ ] 🟠 **CSS-09 · Botones alineados en las tarjetas de producto.** S
  - En «Nuestros favoritos» y en las colecciones, el botón «Añadir al carrito» queda a alturas distintas en una misma fila, según el título ocupe una o dos líneas y haya o no precio por kilo.
  - Propuesta: la tarjeta como columna flexible, con el botón empujado abajo (`margin-top: auto`).
- [ ] 🟠 **CSS-12 · `!important` en los menús.** M
  - `component-list-menu.css` (29), `component-menu-drawer.css` (19) y `component-mega-menu.css` (11) pisan a Dawn a base de `!important`. Por ejemplo: relleno, `display`, colores blancos y `color: #0f172a !important`.
  - Propuesta: selectores con una clase propia de la cabecera, y orden de carga, igual que se hizo en la reserva con CODE-14. Comprobar con huella de estilos calculados en escritorio y en el cajón de móvil.
- [ ] 🟠 **CSS-18 · Detalles en móvil.** S
  - En el banner principal, la ilustración se recorta a 390 px y el gato queda cortado por la derecha. Hay que ajustar `object-position` o usar una imagen para móvil.
  - En el carrusel de pasos de peluquería, la línea discontinua entre los números queda colgando, porque une pasos que no se ven a la vez.
  - «Regalar una tarjeta» no ocupa todo el ancho, y los demás botones principales en móvil sí.
- [ ] 🟠 **CSS-19 · Fuente del botón «Compartir».** S
  - «Compartir este producto» sale en Arial, no en la fuente del tema: `.share-button__button` no hereda la fuente (comprobado con el estilo calculado).
  - Propuesta: `font-family: inherit` y revisar otros `<button>` propios.

## 🟢 Mantenimiento

- [x] 🟢 **CSS-10 · Escala tipográfica.** M *(hecho el 25/11/2026)*
  - Hay 42 tamaños de letra distintos en el CSS propio, muchos casi iguales: 1,3 · 1,32 · 1,34 · 1,35 · 1,36 rem.
  - El precio por kilo sale a 11 px y la etiqueta del buscador a 10 px.
  - Propuesta: 6 o 7 variables (`--pet-text-xs`, `-sm`, `-base`, `-lg`…), con 12 px como mínimo.
  - Hecho:
    - `--pet-text-*` en `pet-tokens.liquid`, con nueve tamaños: cinco de texto (`xs` 12, `sm` 13, `base` 14, `md` 15, `lg` 16 px) y cuatro de título (`xl` 18, `2xl` 22, `3xl` 24, `4xl` 32 px). Son más de los 6–7 previstos, porque los cinco de texto se usan mucho y juntarlos cambiaría bastante el aspecto.
    - 237 `font-size` de 42 valores pasan al más cercano. Casi todos cambian 0,5 px o menos.
      - Los que estaban por debajo de 12 px (de 10 a 11,5) suben a 12: «Más vendido», «-10 %», «Más popular», «Ocupada» y subtítulos del menú.
      - Se dejan como estaban los que no son texto (el emoji del camión en su círculo, la barra entre ES y EN, iconos de 3 y 4 rem), los títulos fluidos con `clamp()`, los `em` y los que dependen de la escala de títulos de Dawn.
    - En los ficheros de Dawn con añadidos propios solo se tocan las líneas propias. Un primer intento cambió también líneas de Dawn, se vio al comparar con Dawn y se deshizo.
    - Mínimo de 12 px también en tres textos de Dawn que se ven en toda la tienda (`component-pet-cro.css`, sección 13):
      - el precio por kilo (11 px);
      - la etiqueta flotante de los campos rellenos, como «Búsqueda» (10 px);
      - el copyright y los enlaces legales del pie (11 px).
  - Comprobado en CLAUDIA en inicio, colección, búsqueda, ficha y reserva, a 1280 y 390 px:
    - no queda ningún texto de menos de 12 px, salvo el emoji del camión;
    - el CSS propio usa 12, 13, 14, 15, 16, 18, 22 y 24 px, más los títulos fluidos y los botones de Dawn;
    - a ojo, la etiqueta «Búsqueda» no pisa el texto y el pie se lee bien.
  - Theme Check sin avisos.
- [x] 🟢 **CSS-11 · Radios y sombras.** S *(hecho el 25/11/2026)*
  - Más de 15 radios distintos, incluidos tres formas de decir «píldora»: `9999px`, `999px` y `99rem`.
  - Sombras con valores sueltos en cada fichero.
  - Propuesta: `--pet-radius-sm/md/lg/pill` y dos sombras.
  - Hecho, con las variables en `pet-tokens.liquid`:
    - **Radios:** `--pet-radius-xs` 4 px, `-sm` 8, `-md` 12, `-lg` 16, `-xl` 20 y `-pill`.
      - Los 22 valores distintos pasan a esos seis: 5→4; 6, 7 y 8 px (0,6 y 0,8 rem)→8; 10, 12 y 14 px (1 a 1,4 rem)→12; 16→16; 20→20.
      - `9999px`, `999px` y `99rem` pasan a la píldora.
      - En total son 123 radios. Siguen igual los círculos (`50%`), los `0` y los radios de Dawn.
    - **Sombras:** `--pet-shadow-sm`, `-md` y `-lg` (tinta de la marca al 6, 8 y 12 %) y `-overlay` para los menús desplegables.
      - Pasan a ellas las 17 sombras de elevación neutras, que eran 16 casi iguales con negro o tinta del 3 al 18 %.
      - Se dejan como estaban los anillos de foco y de error, los pulsos animados, los brillos de color de los botones al pasar el ratón y las sombras interiores. Tienen su propio sentido.
    - El cambio máximo es de 2 px en un radio. Las sombras muy suaves (3–5 %) quedan algo más visibles y las de 16–18 %, algo más suaves.
  - Comprobado: capturas del inicio (categorías, bloque de peluquería) y de la reserva (tarjetas de servicio y tamaño) antes y después, sin diferencia apreciable. Los valores calculados confirman el cambio: tarjetas de la reserva de 10→12 px, caja de la reserva con `--pet-shadow-lg`, botón de la cabecera en píldora. Las líneas de Dawn no se tocan. Theme Check sin avisos.
- [ ] 🟢 **CSS-14 · `transition: all`.** S
  - 36 transiciones `all`: animan cualquier propiedad que cambie, también el ancho o el relleno, y obligan al navegador a recalcular la maquetación.
  - Propuesta: poner las propiedades concretas (`color`, `background-color`, `border-color`, `transform`, `box-shadow`).
- [ ] 🟢 **CSS-16 · Puntos de corte rezagados.** S
  - Aún quedan 750 px (×2), 480, 1150 y 1200 px.
  - Propuesta: 749 y 989 px, como Dawn y la reserva (CODE-14).
- [ ] 🟢 **CSS-17 · Bloque de relleno repetido.** S
  - 7 secciones propias repiten el mismo `{% style %}` de 11 líneas para el relleno superior e inferior.
  - Es el patrón de Dawn, pero aquí está copiado: un snippet `section-padding-style` lo deja en una línea por sección.
- [ ] 🟢 **CSS-20 · `:hover` en pantallas táctiles.** S
  - Hay 64 `:hover` propios y ninguno va dentro de `@media (hover: hover)`. En el móvil, el estado de hover se queda pegado tras tocar: píldoras resaltadas, tarjetas levantadas.
  - Propuesta: envolver los cambios de color y `transform` de hover en esa media query.

## Orden propuesto

1. **Fallos:** CSS-02, CSS-13 y CSS-15. Antes de CSS-02 conviene CSS-01, que le da las variables.
2. **Base:** CSS-01 paleta, CSS-11 radios y CSS-10 tipografía.
3. **Coherencia visible:**
   - CSS-03 botones (primero, decidir negro o verde);
   - CSS-04 seleccionado;
   - CSS-05 antetítulos;
   - CSS-06 títulos;
   - CSS-07 paneles de la ficha;
   - CSS-08 anchos;
   - CSS-09 tarjetas.
4. **Detalles:** CSS-18 móvil y CSS-19 fuente de «Compartir».
5. **Limpieza:** CSS-12 `!important`, CSS-14 `transition: all`, CSS-16 puntos de corte, CSS-17 relleno repetido y CSS-20 hover.
