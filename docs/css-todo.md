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
| Tamaños de letra distintos | 42 (1,2 · 1,25 · 1,28 · 1,3 · 1,32 · 1,34 · 1,35 · 1,36 rem…) | 6 o 7 de una escala (CSS-10) |
| Radios distintos | Más de 15 (`9999px`, `999px`, `99rem`, `14px`, `12px`, `10px`, `8px`, `1,2rem`…) | 4 variables (CSS-11) |
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
- [ ] 🟠 **CSS-03 · Una sola familia de botones.** M · *necesita una decisión*
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
- [ ] 🟠 **CSS-04 · Un solo estilo de «seleccionado».** S
  - El chip activo cambia según la página:
    - verde en «Perro / Gato» del inicio;
    - negro en «Todos / Perros / Gatos» del catálogo y en las variantes de la ficha (3 kg / 12 kg);
    - azul en las categorías del catálogo.
  - Propuesta: un solo estilo activo con el color de CSS-01, y que los chips de categoría compartan forma con los de mascota.
- [ ] 🟠 **CSS-05 · Un solo antetítulo.** S
  - Hay cuatro estilos:
    - verde en mayúsculas sin fondo («✂ PELUQUERÍA CANINA»);
    - píldora verde clara («ASÍ LO HACEMOS EN LA PELUQUERÍA»);
    - píldora blanca con borde («REGALO PARA PELUDOS»);
    - rojo con emoji («📦 PACK»).
  - Propuesta: un componente `.pet-kicker` con una variante de color como mucho.
- [ ] 🟠 **CSS-06 · Títulos de sección iguales.** S
  - «Lo que te prometemos» tiene un tamaño y un grosor propios (800); el resto de títulos son los `h2` de Dawn, en peso normal.
  - En el inicio, unos títulos van a la izquierda («¿Qué estás buscando?», «Nuestros favoritos», «Packs…») y otros centrados («Su rutina…», «Lo que te prometemos»).
  - Propuesta: todas las secciones propias con las clases de Dawn (`h1`/`h2`, `inline-richtext`), el ajuste «Tamaño del título» y una alineación común, o un ajuste de alineación por sección.
- [ ] 🟠 **CSS-07 · Paneles de la ficha de producto.** M
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
- [ ] 🟠 **CSS-08 · Ancho y separación de las secciones.** S
  - «Lo que te prometemos» va de 40 a 1240 px en una pantalla de 1280, y el resto del contenido, de 90 a 1190 (`.page-width`): las tarjetas sobresalen 50 px por cada lado.
  - En móvil, «Packs con un 10 % de descuento» tiene 30 px de margen lateral y las demás secciones, 15.
  - El espacio vertical entre secciones varía mucho en el inicio: hay un hueco grande después de la rutina de peluquería y antes de los packs.
  - Propuesta: todas dentro de `.page-width`, y la separación con los ajustes de relleno superior e inferior de cada sección (los mismos valores por defecto).
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

- [ ] 🟢 **CSS-10 · Escala tipográfica.** M
  - Hay 42 tamaños de letra distintos en el CSS propio, muchos casi iguales: 1,3 · 1,32 · 1,34 · 1,35 · 1,36 rem.
  - El precio por kilo sale a 11 px y la etiqueta del buscador a 10 px.
  - Propuesta: 6 o 7 variables (`--pet-text-xs`, `-sm`, `-base`, `-lg`…), con 12 px como mínimo.
- [ ] 🟢 **CSS-11 · Radios y sombras.** S
  - Más de 15 radios distintos, incluidos tres formas de decir «píldora»: `9999px`, `999px` y `99rem`.
  - Sombras con valores sueltos en cada fichero.
  - Propuesta: `--pet-radius-sm/md/lg/pill` y dos sombras.
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
