# Mejoras de UX (revisión del 23/11/2026)

Revisión de la tienda como usuario, en escritorio y móvil (390 px): portada, menú, colecciones, búsqueda, ficha de producto, carrito, reserva de peluquería y contacto.

Prioridad: 🔴 afecta a la confianza o a la compra · 🟠 mejora clara · 🟢 detalle.
Quién: **(yo)** lo hago en el tema/app · **(tú)** necesita datos, fotos o una decisión tuya · **(juntos)** tú decides y yo lo monto.

Al terminar una tarea: marcarla con `[x]`, la fecha y una línea de qué se hizo.

## 🔴 Confianza y promesas

- [x] 🔴 **UX-01 · Promesas que hoy no se cumplen.** *(hecho el 23/11/2026)*
  - **Snack de regalo a partir de 65 €:** quitado. La barra de la ficha y del carrito solo marca el envío gratis (50 €). También se quitó el ajuste «Importe para el regalo».
  - **Envío en 24 h:** no existe, así que se quitó de los envíos normales.
    - Ahora: aviso superior «Envío GRATIS en pedidos de más de 50 €», barra «Te faltan X para el envío GRATIS» y en stock «Listo para enviar».
    - La ficha calcula «Recíbelo entre el X y el Y» con días laborables. Ajustes del tema *Plazo de entrega*: 3-5 días; deben coincidir con la tarifa de Shopify.
    - Los congelados BARF mantienen su envío refrigerado de 24 h (tarifa propia).
  - **10 % de la newsletter:** existe el código `BIENVENIDA10` (10 % en todo el pedido, una vez por cliente; se suma al envío gratis pero no a otros descuentos).
    - **Solo se envía por email.** La web dice «Te hemos enviado por email tu código del 10 %…».
    - El email lo envía la app de reservas (Brevo) a quien se suscribe en el pie: cada 10 minutos, una sola vez, en su idioma, con el código, un botón que lo deja aplicado en el carrito y un enlace para darse de baja de la newsletter (retira el consentimiento en Shopify).
    - Se configura en la app, *Ajustes → Bienvenida de la newsletter* (activar, código, %). Si el código no existe o caduca, avisa y no envía nada.
    - Shopify Messaging no se usa porque no está instalada (pide verificar la identidad).
    - Nuevo título del pie: «Suscríbete y llévate un 10 % en tu primer pedido» (sirve también para gatos, UX-28), con nota de qué se envía y enlace a la política de privacidad.
    - Probado el 23/11/2026: suscripción con `noeus90+newsletter@gmail.com`, email enviado y página de baja con firma válida (y rechazo de una firma falsa).
- [x] 🔴 **UX-02 · Datos y sellos sin respaldo.** *(hecho el 23/11/2026)* Se quitó todo lo que no se puede demostrar y se pusieron promesas que la tienda cumple hoy.
  - **Portada, nueva sección «Lo que te prometemos»:**
    - Envío gratis desde 50 €, a la península en 3-5 días laborables (BARF aparte, refrigerado).
    - 14 días para devolver los productos sin abrir (salvo congelados).
    - Cita de peluquería online con confirmación y recordatorio.
    - Cada 10 visitas, un baño de regalo.
    - Fuera las valoraciones inventadas (4.9 / 5, +2.400 familias), «Verificada», «Respaldada por expertos», «Revisado por veterinarios», «Sin sulfatos», «Grain-free», «Zero stress».
    - Los textos aceptan `[importe]` y `[dias]`, que salen de los ajustes del tema y no se desfasan.
  - **Ficha:**
    - Fuera «Aval veterinario», «100% natural», «Cruelty-free», «Testado por vets» y «Sin cereales / sulfatos».
    - Ahora: envío gratis desde 50 € (60 € en congelados), 14 días para devolver (en congelados: viaja refrigerado), pago seguro y enlace a la cita de peluquería.
    - Las estrellas solo salen si una app de reseñas da valoraciones reales.
  - **Reserva:** «sin jaulas» y «cosmética natural pH 7.0» cambiados por «confirmación por email» y «recordatorio el día antes».
  - **Tarjetas de producto:** la etiqueta «100% Natural» pasa a «Natural» (sale solo si el producto lo dice).
  - Si en el futuro hay datos reales (reseñas, un veterinario que revise productos, certificados del fabricante), se pueden volver a añadir.
- [x] 🔴 **UX-03 · Textos de prueba visibles en las fichas.** *(hecho el 23/11/2026)*
  - **Textos de prueba borrados:** los metacampos «Texto de prueba: sustituir…» (beneficios, ingredientes, composición y modo de uso) del pienso de cachorro y del champú de avena. Las pestañas vacías se ocultan solas.
  - **Descripción nueva y meta descripción para buscadores** en los 42 productos:
    - solo con lo que sabemos (qué es, para qué mascota, tamaño) y un consejo práctico;
    - sin ingredientes, porcentajes ni beneficios de salud inventados.
  - Textos en [`textos-productos/`](textos-productos/README.md). `textos.py` es el origen y `subir.py` los vuelve a subir (no toca datos reales, solo borra metacampos que digan «Texto de prueba»).
  - Pendiente aparte:
    - cuando lleguen los productos reales, completar ingredientes, composición y ración con el envase;
    - las versiones en inglés de los productos irán con Translate & Adapt.

## 🔴 Primera impresión y navegación

- [x] 🔴 **UX-04 · Portada: cabecera principal.** *(hecho el 23/11/2026 con una ilustración provisional; falta la foto real)*
  - **Imagen:** nueva ilustración provisional (perro recién bañado, gato, saco de pienso y útiles de peluquería) en lugar de la de ejemplo de Dawn.
    - Generada con [`imagenes-productos/portada.py`](imagenes-productos/portada.py) y subida a *Contenido → Archivos* como `portada-provisional.png`.
    - En escritorio el texto va sobre la parte lisa de la izquierda; en móvil, debajo, con la imagen encuadrada en los personajes.
  - **Textos:**
    - Título: «Su comida, sus cuidados y su peluquería» (en estilo español).
    - Texto: «Pienso, BARF, snacks e higiene para perro y gato, con envío gratis desde 50 €. Y cita de peluquería canina online en un par de minutos.».
  - **Botones:** «Ver la tienda» (principal) y «Reservar peluquería». En inglés: «Their food, their care and their grooming», «Shop now» y «Book grooming».
  - **Pendiente (tú):** cambiarla por una foto real del salón o de un perro arreglado. Que el sujeto quede a la derecha, porque el texto va a la izquierda. Se cambia en el editor del tema, sección «Banner con imagen».
- [x] 🔴 **UX-05 · Portada: «comprar por categoría».** *(hecho el 23/11/2026)*
  - Nueva sección «¿Qué estás buscando?» (`sections/pet-categories.liquid`) justo debajo de la cabecera.
  - Selector Perro / Gato (recuerda la última elección en el dispositivo) y una baldosa por categoría con la imagen de un producto de ese tipo y cuántos hay. Perro: pienso, comida húmeda, BARF, snacks, suplementos, higiene, juguetes, accesorios, packs y ver todo.
  - Sale sola de las colecciones Perros y Gatos: las categorías vacías no aparecen y los productos nuevos se suman solos. Enlaza con los mismos filtros que el menú.
  - Escritorio: dos filas iguales (5 + 5 en perro, 4 + 4 en gato). Móvil: dos filas que se deslizan de lado. En español e inglés.
- [x] 🔴 **UX-06 · Pie de página vacío.** *(hecho el 23/11/2026; faltan datos tuyos)*
  - **Cuatro columnas nuevas** (`snippets/footer-pet-columns.liquid`), traducidas con los archivos de idioma y sin menús que montar en el admin:
    - **El salón:** dirección de *Configuración → Detalles de la tienda* y, si se rellenan, teléfono, horario, WhatsApp y email público.
    - **Tienda:** perros, gatos, packs, todos los productos y tarjeta regalo.
    - **Peluquería:** reservar cita, mis perros y citas, regalar peluquería.
    - **Ayuda:** contacto, mi cuenta y todas las políticas publicadas.
  - **Datos que no se publican solos:** el email de la tienda (es un Gmail personal) no se muestra; el email público es un ajuste aparte.
  - **Quitado el segundo selector de idioma** (ya está en la cabecera).
  - **Pendiente (tú):**
    - teléfono en *Detalles de la tienda*;
    - horario, WhatsApp y email público en *Configuración del tema → Datos del salón*;
    - publicar las políticas de envíos, devoluciones, términos y aviso legal en *Configuración → Políticas* (aparecerán solas en «Ayuda»).
  - **Ojo:** la sección de reserva tiene un WhatsApp de ejemplo (+34 612 345 678) en sus ajustes; hay que poner el real o quitarlo.
- [x] 🔴 **UX-07 · Página de contacto.** *(hecho el 23/11/2026)*
  - Nueva sección `pet-contact` en la plantilla de contacto:
    - título «Contacto» en español (también en la pestaña del navegador) y «Contact» en inglés;
    - tarjetas del salón: dirección con «Cómo llegar» (Google Maps), horario, teléfono, WhatsApp y email público cuando estén rellenos;
    - acceso a «Reservar cita»;
    - 6 preguntas frecuentes: envío y plazos, islas, devoluciones, cómo reservar, cambiar o cancelar cita, tarjeta de fidelidad;
    - el formulario debajo, con el ancla `#escribenos`.
  - Las respuestas toman importes y días de los ajustes del tema, así que no se desfasan. Solo dicen lo que es cierto: por ejemplo, cancelar una cita se pide respondiendo al email, porque no hay botón para cancelar.
  - Faltan los mismos datos que en UX-06: teléfono, horario y WhatsApp.

## 🔴 Compra

- [x] 🔴 **UX-08 · Precios.** *(hecho el 23/11/2026)*
  - **Tema:** quitado el código de moneda (ajuste «Mostrar códigos de moneda» desactivado).
  - **Admin:** formato de moneda cambiado en *Configuración → General → Visualización de la moneda → Cambiar formato de moneda*: `{{amount_with_comma_separator}} €`, y `… EUR` en los formatos «con moneda» (web y emails).
  - Antes «€24,90 EUR», ahora «24,90 €» en la web, en lo que calcula JavaScript (barra de envío gratis, «Se suelen comprar juntos», rutina de higiene) y en los emails de Shopify.
- [x] 🔴 **UX-09 · Botones de la ficha.** *(hecho el 23/11/2026)*
  - «Añadir al carrito» es siempre el botón principal (relleno) y «Comprar ahora» de Shopify pasa a secundario (con borde).
  - Vocabulario de España en `es.json`: «Añadir» en lugar de «Agregar» (carrito, direcciones, Apple Wallet, cantidades) y «carrito» en lugar de «cesta» («Añadir 3 al carrito · 39,70 €»).
  - Probado: añade el producto y sale «Artículo añadido a tu carrito».
- [x] 🔴 **UX-10 · Ficha en móvil.** *(hecho el 23/11/2026)*
  - Barra fija abajo (`snippets/sticky-add-to-cart.liquid`) con nombre, precio y «Añadir al carrito». Solo en móvil, y solo cuando los botones de compra ya han quedado por encima de la pantalla.
  - Pulsa el botón real, así que respeta variante y cantidad. Copia su estado («Agotado» desactivado) y el precio sigue al selector de variantes.
  - Probado: aparece al bajar y se oculta al volver arriba; al elegir 12 kg muestra 69,90 € y añade esa variante; en la pelota agotada sale «Agotado» desactivado.

## 🟠 Portada

- [x] 🟠 **UX-11 · Orden de secciones.** *(hecho el 23/11/2026)*
  - **Nuevo orden de la portada:**
    1. Cabecera
    2. Categorías
    3. Peluquería
    4. Rutina de higiene
    5. Favoritos
    6. Packs
    7. Tarjeta regalo
    8. «Lo que te prometemos»
  - **Nueva sección de peluquería** (`sections/pet-grooming-cta.liquid`):
    - título «Su baño y su corte, con cita online», con tres puntos sobre cómo funciona la reserva;
    - botones «Reservar cita» y «Regalar peluquería»;
    - los servicios activos del formulario de reserva con su precio «desde» (el menor de los tres tamaños), leídos de los metaobjetos: siempre son los reales.
  - **Nota:** la sección `promo-banner` (sin usar) anuncia «-20 % en tu 1.ª sesión», que no existe. No ponerla en ninguna página sin cambiar ese texto.
- [x] 🟠 **UX-12 · «Favoritos para tu mascota».** *(hecho el 23/11/2026)*
  - **Nueva colección manual «Favoritos»** (`/collections/favoritos`, publicada en la Tienda online) con 8 productos variados:
    - pienso cachorro y pienso gato esterilizado;
    - menú BARF;
    - snack dental y champú de avena;
    - rascador, cuerda y cama.
  - **Portada:** la sección pasa a «Nuestros favoritos» («Our favourites» en inglés) y muestra esa colección en lugar de los 8 primeros por orden alfabético.
  - **Para cambiarlos:** en *Productos → Colecciones → Favoritos*, añadir, quitar o reordenar (orden manual). Cuando haya ventas, se puede ordenar por «Más vendidos».
- [x] 🟠 **UX-13 · Packs.** *(hecho el 23/11/2026)*
  - Con **un solo pack**, la sección lo muestra como banner:
    - imagen, título, lo que incluye (sacado de su descripción) y precio con «Ahorras 3,70 € frente a comprarlos por separado»;
    - botones «Añadir al carrito» y «Ver el pack».
  - Con **dos o más**, vuelve sola a la rejilla de tarjetas de siempre.
  - Probado: el banner añade el pack al carrito; se ve bien en móvil y en inglés.
- [x] 🟠 **UX-14 · Sellos de confianza en móvil.** *(hecho con UX-02 el 23/11/2026: rejilla 2 × 2, unos 700 px)*
  - Problema: son 4 tarjetas altas apiladas (unos 600 px).
  - Propuesta: rejilla 2 × 2 compacta. Va junto con UX-02.

## 🟠 Colecciones y búsqueda

- [x] 🟠 **UX-15 · Demasiadas capas de filtro.** *(hecho el 23/11/2026)*
  - **Filtros de Dawn:** fuera «Tipo de producto» en las colecciones, porque ya están las pastillas de categoría. Se oculta con la hoja de estilos de la barra de catálogo, que solo se carga en las colecciones; la búsqueda lo conserva.
  - **Etapa o necesidad:** plegado en «Por etapa o necesidad ▾». Se abre solo si hay una marcada y la muestra en el resumen («· Cachorros»).
  - **Contador:** fuera «Mostrando 27 productos para Perros», porque Dawn ya da el número de productos.
  - **«Limpiar filtros»:** solo aparece con algún filtro activo (también la necesidad, aunque Shopify no la cuente en `/es/`) y vuelve a la colección de la mascota, no a todo el catálogo.
  - **Resultado:** los productos empiezan unos 100-150 px más arriba (escritorio y móvil). Probado sin filtros, con categoría (por AJAX) y con necesidad.
- [ ] 🟠 **UX-16 · Añadir desde la colección.** **(yo)**
  - Problema: las tarjetas no tienen botón de compra.
  - Propuesta: activar el «Añadir» rápido de Dawn y mostrar el precio por kg en los piensos.
- [ ] 🟠 **UX-17 · Nombres de producto.** **(yo, con tu visto bueno)**
  - Problemas:
    - Mayúsculas y nombres poco claros: «Arbol» (sin tilde y sin decir que es rascador), «cama con pelo», «cortauñas», «juguete ratón», «malta».
    - Tallas sin espacio: «3kg».
  - Propuesta: nombres claros y homogéneos («Árbol rascador para gato», «3 kg»).
- [ ] 🟠 **UX-18 · «También te puede gustar».** **(yo)**
  - Problema: en un pienso de cachorro recomienda BARF congelado.
  - Propuesta: recomendar por mascota y tipo (otros piensos y snacks de perro), o configurar los productos complementarios en Search & Discovery.
- [ ] 🟢 **UX-19 · Búsqueda.** **(yo)**
  - Problema: «pienso perro» devuelve también piensos de gato.
  - Propuesta: sinónimos y filtros en Search & Discovery, y mostrar la búsqueda predictiva con precio.

## 🟠 Ficha de producto

- [ ] 🟠 **UX-20 · Calculadora de ración.** **(yo)**
  - Problema: en un pienso de cachorro arranca en «Adulto».
  - Propuesta: preseleccionar la edad según la etiqueta (cachorro, gatito, senior).
- [ ] 🟠 **UX-21 · Orden de la columna derecha.** **(yo)**
  - Problema: entre el precio y la descripción hay 9 bloques: stock, envío, tallas, cantidad, barra de envío, botones, calculadora, sellos y «se suelen comprar juntos».
  - Propuesta:
    - subir el resumen del producto y los beneficios junto al título;
    - agrupar envío y stock en un solo bloque;
    - llevar sellos y complementarios debajo.

## 🟠 Carrito

- [ ] 🟠 **UX-22 · Carrito más útil.** **(yo)**
  - Problemas:
    - No hay sugerencias para llegar al envío gratis (snacks, latas).
    - No se ve la fecha de entrega estimada.
    - No hay campo de código de tarjeta o descuento visible.
  - Propuesta: añadir esas tres cosas. Valorar además un carrito lateral en lugar de la notificación que salta al añadir.

## 🟠 Reserva de peluquería

- [ ] 🟠 **UX-23 · Cabecera de la reserva.** **(yo)**
  - Problemas:
    - Hay dos títulos: «Reservar cita» y «Reserva Cita de Peluquería Canina & Spa».
    - El texto nombra servicios que no coinciden con los reales («Baño Dermoprotector»).
  - Propuesta: un solo título, un texto corto y una línea con dirección, horario y la política de cancelación.
- [ ] 🟠 **UX-24 · Servicios.** **(juntos)**
  - Problemas:
    - Todos duran «1 hora» y llevan el mismo icono.
    - «Corte de uñas» es a la vez servicio y extra.
    - El primer servicio y el tamaño vienen ya marcados, y es fácil reservar sin darse cuenta.
  - Propuesta:
    - duraciones reales;
    - un icono por servicio;
    - decidir si las uñas son servicio o extra;
    - no preseleccionar nada.

## 🟢 Estilo y detalles

- [ ] 🟢 **UX-25 · Mayúsculas al estilo inglés.** **(yo)**
  - Problema: títulos como «Nutrición Natural y Peluquería Canina sin Estrés» o «Favoritos para tu Mascota».
  - Propuesta: en español solo va en mayúscula la primera palabra; revisar los títulos de todo el tema.
- [ ] 🟢 **UX-26 · Inglés en la versión española.** **(yo)**
  - Problema: etiquetas como «GRAIN-FREE», «ZERO STRESS» o «Cruelty-Free».
  - Propuesta: pasarlas al español o quitarlas (ver UX-02).
- [ ] 🟢 **UX-27 · Cabecera en móvil.** **(juntos)**
  - Problemas:
    - El nombre «brudabrey» se parte en dos líneas.
    - El selector de idioma ocupa sitio.
  - Propuesta: un logo en imagen (tú) y el idioma dentro del menú (yo).
- [x] 🟢 **UX-28 · Newsletter solo para perros.** *(hecho con UX-01 el 23/11/2026)*
  - Problema: «Club de Familias Perrunas» deja fuera a quien tiene gato.
  - Propuesta: un nombre neutro. Va junto con UX-01.
- [ ] 🟢 **UX-29 · Título y descripción de la portada.** **(yo)**
  - Problema: el título es solo «brudabrey» y no hay meta descripción.
  - Propuesta: título y descripción para buscadores. Ya está apuntado en producción; se puede hacer ya con un texto provisional.
