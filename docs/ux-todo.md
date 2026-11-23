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
- [ ] 🔴 **UX-06 · Pie de página vacío.** **(juntos)**
  - Problema: solo tiene newsletter, país e idioma.
  - Propuesta:
    - Columnas Tienda / Peluquería / Ayuda (envíos, devoluciones, preguntas frecuentes, contacto).
    - Datos del salón: dirección, horario, teléfono o WhatsApp.
    - Páginas legales.
  - Quitar el segundo selector de idioma (ya está en la cabecera).
- [ ] 🔴 **UX-07 · Página de contacto.** **(juntos)**
  - Problemas:
    - El título sale en inglés («Contact»).
    - Solo hay un formulario.
  - Propuesta: dirección, horario, mapa, teléfono o WhatsApp, botón de reservar cita y 4-5 preguntas frecuentes (envíos, devoluciones, qué incluye el baño, cancelar una cita).

## 🔴 Compra

- [ ] 🔴 **UX-08 · Precios.** **(tú en el admin + yo)**
  - Problema: salen como «€24,90 EUR».
  - En el tema: quitar el código de moneda (ajuste «Mostrar códigos de moneda»). **(yo)**
  - En el admin: en España se escribe «24,90 €», con el formato de moneda en *Configuración → General*. **(tú)**
- [ ] 🔴 **UX-09 · Botones de la ficha.** **(yo)**
  - Problemas:
    - «Agregar al carrito» va con borde y «Comprar ahora» va relleno, así que el botón principal parece el de pago rápido.
    - Se mezclan «Agregar», «Añadir», «carrito» y «cesta».
  - Propuesta: «Añadir al carrito» como botón principal y el mismo vocabulario en toda la web (carrito, añadir).
- [ ] 🔴 **UX-10 · Ficha en móvil.** **(yo)**
  - Problema: el botón de compra queda a unos 1000 px de la parte de arriba y luego desaparece al bajar.
  - Propuesta: una barra fija abajo con precio y «Añadir» cuando el botón sale de la pantalla.

## 🟠 Portada

- [ ] 🟠 **UX-11 · Orden de secciones.** **(yo)**
  - Problema: la tarjeta regalo es la segunda sección. Pesa más que la tienda y la peluquería.
  - Propuesta:
    1. Cabecera
    2. Categorías
    3. Peluquería (reserva)
    4. Rutina de higiene
    5. Más vendidos
    6. Packs
    7. Tarjeta regalo
    8. Sellos de confianza
- [ ] 🟠 **UX-12 · «Favoritos para tu mascota».** **(yo)**
  - Problema: muestra los 8 primeros de todo el catálogo por orden alfabético (aceite, árbol, bálsamo, cama…).
  - Propuesta: una colección «Más vendidos» elegida a mano o por ventas.
- [ ] 🟠 **UX-13 · Packs.** **(juntos)**
  - Problema: la sección muestra un solo pack con mucho hueco vacío.
  - Propuesta: ocultarla hasta que haya 2 o más packs, o convertirla en un banner.
- [x] 🟠 **UX-14 · Sellos de confianza en móvil.** *(hecho con UX-02 el 23/11/2026: rejilla 2 × 2, unos 700 px)*
  - Problema: son 4 tarjetas altas apiladas (unos 600 px).
  - Propuesta: rejilla 2 × 2 compacta. Va junto con UX-02.

## 🟠 Colecciones y búsqueda

- [ ] 🟠 **UX-15 · Demasiadas capas de filtro.** **(yo)**
  - Problemas:
    - Se acumulan cuatro capas: mascota, categoría, etapa o necesidad, y la barra de filtros de Dawn. Son unos 300 px antes del primer producto.
    - «Tipo de producto» duplica las categorías.
    - «Limpiar filtros» aparece sin filtros activos.
    - El número de productos sale dos veces.
  - Propuesta: una fila de categorías deslizable, las necesidades dentro de «Filtrar» y un solo contador.
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
