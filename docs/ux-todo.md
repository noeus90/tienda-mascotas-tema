# Mejoras de UX (revisión del 23/11/2026)

Revisión de la tienda como usuario, en escritorio y móvil (390 px): portada, menú, colecciones, búsqueda, ficha de producto, carrito, reserva de peluquería y contacto.

Prioridad: 🔴 afecta a la confianza o a la compra · 🟠 mejora clara · 🟢 detalle.
Quién: **(yo)** lo hago en el tema/app · **(tú)** necesita datos, fotos o una decisión tuya · **(juntos)** tú decides y yo lo monto.

Al terminar una tarea: marcarla con `[x]`, la fecha y una línea de qué se hizo.

## 🔴 Confianza y promesas

- [ ] 🔴 **UX-01 · Promesas que hoy no se cumplen.** **(juntos)**
  - Barra del carrito: «Añade X € más para tu Snack Natural Dental GRATIS» a partir de 65 €. No hay ningún descuento que lo regale.
  - Newsletter: «recibe un 10% DTO». No existe código de bienvenida ni email automático.
  - Decidir: montarlas de verdad (descuento automático «compra X, llévate Y» y un flujo de Shopify Email con código) o quitar el texto.
- [ ] 🔴 **UX-02 · Datos y sellos sin respaldo.** **(juntos)**
  - Frases afectadas:
    - Portada: «4.9 / 5 · +2.400 familias perrunas felices», «Peluquería & tienda verificada», «Aval clínico · Revisado por veterinarios», «Respaldada por expertos».
    - Fichas: «Aval veterinario», «Testado por vets», «Cruelty-free», «100% natural».
  - Riesgo: publicidad engañosa.
  - Propuesta: sustituirlas por promesas comprobables (envío 24 h en península, cita online, devolución 14 días, pago seguro) y recuperar las valoraciones cuando haya reseñas reales (Judge.me).
- [ ] 🔴 **UX-03 · Textos de prueba visibles en las fichas.** **(tú + yo)**
  - Problemas:
    - «Texto de prueba: sustituir por los beneficios reales del producto».
    - Descripciones automáticas del tipo «Perro de pienso cachorro pollo», que se usan también como meta descripción.
  - Propuesta: yo redacto borradores por producto a partir de nombre, tipo y etiquetas; tú los revisas.

## 🔴 Primera impresión y navegación

- [ ] 🔴 **UX-04 · Portada: cabecera principal.** **(juntos)**
  - Problemas:
    - La imagen es la ilustración de ejemplo de Dawn (dos personas en un lago): no hay ni perros ni tienda.
    - Un solo botón, «Ver Tienda Animal».
    - La peluquería, que os diferencia, no aparece.
  - Propuesta:
    - Una foto real (salón o perro recién arreglado).
    - Título en estilo español, por ejemplo «Comida natural y peluquería canina sin estrés».
    - Dos botones: «Comprar para mi perro / gato» y «Reservar peluquería».
- [ ] 🔴 **UX-05 · Portada: falta «comprar por categoría».** **(yo)**
  - Problema: no hay accesos directos a Pienso, Húmeda, BARF, Snacks, Higiene o Juguetes. Para llegar hay que abrir el menú.
  - Propuesta: una fila de categorías con icono, separada para perro y gato, justo debajo de la cabecera.
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
- [ ] 🟠 **UX-14 · Sellos de confianza en móvil.** **(yo)**
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
- [ ] 🟢 **UX-28 · Newsletter solo para perros.** **(yo)**
  - Problema: «Club de Familias Perrunas» deja fuera a quien tiene gato.
  - Propuesta: un nombre neutro. Va junto con UX-01.
- [ ] 🟢 **UX-29 · Título y descripción de la portada.** **(yo)**
  - Problema: el título es solo «brudabrey» y no hay meta descripción.
  - Propuesta: título y descripción para buscadores. Ya está apuntado en producción; se puede hacer ya con un texto provisional.
