# Arquitectura Técnica y Componentes CRO: Tienda Animal & Peluquería Canina (Shopify OS 2.0)

Esta guía documenta todos los componentes de optimización de conversión (**CRO**), secciones modulares, **Metafields** y buenas prácticas de **Shopify Online Store 2.0** implementados en el tema para una **Tienda de Mascotas (Pet Shop) y Peluquería Canina**, utilizando nomenclatura de archivos en inglés según el estándar oficial de Shopify Dawn.

---

## 1. Inventario de Snippets y Sections Personalizados

### A. Snippets (`snippets/`)
| Archivo | Propósito CRO | Dónde se renderiza |
| :--- | :--- | :--- |
| [`snippets/pet-product-tabs.liquid`](../snippets/pet-product-tabs.liquid) | Pestañas accesibles (WAI-ARIA) con **Beneficios**, **Composición & Nutrientes** (con acordeón de composición analítica) y **Guía de Uso / Ración**. | `sections/main-product.liquid` |
| [`snippets/pet-product-trust.liquid`](../snippets/pet-product-trust.liquid) | Barra de reseñas verificadas (`4.9/5`), sello **Aval Veterinario** y 4 garantías (*100% Natural*, *Cruelty-Free*, *Testado por Vets*, *Sin Cereales / Sulfatos*). | `sections/main-product.liquid`, `sections/featured-product.liquid` |
| [`snippets/subscription-selector.liquid`](../snippets/subscription-selector.liquid) | Selector **Compra única vs. Autopedido Recurrente y Ahorra (15% DTO)** con frecuencia cada 30, 45 o 60 días. | `sections/main-product.liquid`, `sections/featured-product.liquid` |
| [`snippets/free-shipping-bar.liquid`](../snippets/free-shipping-bar.liquid) | Barra gamificada de **2 escalones**: *Envío 24h Gratis* (45 €) + *Snack Natural Dental de Regalo* (65 €). | `sections/main-product.liquid`, `sections/featured-product.liquid`, `snippets/cart-drawer.liquid`, `sections/main-cart-items.liquid` |
| [`snippets/stock-urgency-widget.liquid`](../snippets/stock-urgency-widget.liquid) | Estado real de inventario en almacén + cuenta atrás dinámica de envío urgente 24/48h. | `sections/main-product.liquid`, `sections/featured-product.liquid` |
| [`snippets/savings-badge.liquid`](../snippets/savings-badge.liquid) | Píldora automática de ahorro en moneda y porcentaje (`% DTO` / `% OFF`). | `sections/main-product.liquid`, `sections/featured-product.liquid` |
| [`snippets/product-care-metafield.liquid`](../snippets/product-care-metafield.liquid) | Recuadro de conservación y lavado desde metafield. | `sections/main-product.liquid` |
| [`snippets/custom-badge.liquid`](../snippets/custom-badge.liquid) | Etiqueta personalizable (*Nuevo*, *Exclusivo*, *Agotado*). | `sections/promo-banner.liquid` |
| [`snippets/seo-schema-product.liquid`](../snippets/seo-schema-product.liquid) | Datos estructurados `JSON-LD` (`Product` + `aggregateRating` + propiedades para mascotas). | `sections/main-product.liquid`, `sections/featured-product.liquid` |
| [`snippets/seo-schema-breadcrumbs.liquid`](../snippets/seo-schema-breadcrumbs.liquid) | Esquema `BreadcrumbList` global para buscadores. | `layout/theme.liquid` |

### B. Sections (`sections/`)
| Archivo | Propósito CRO |
| :--- | :--- |
| [`sections/grooming-booking.liquid`](../sections/grooming-booking.liquid) | **Reserva de Cita de Peluquería Canina & Spa** con widget oficial de Calendly embebido. |
| [`sections/pet-grooming-steps.liquid`](../sections/pet-grooming-steps.liquid) | **Rutina de Higiene y Manto en 4-5 Pasos** con línea de tiempo numerada y esquema SEO `HowTo`. |
| [`sections/pet-packs.liquid`](../sections/pet-packs.liquid) | **Packs temáticos**: muestra los packs de la colección "Packs" (productos hechos con la app Shopify Bundles, un 10 % más baratos que por separado). Sustituye al antiguo constructor de packs, quitado el 18/11/2026. |
| [`sections/pet-trust-badges.liquid`](../sections/pet-trust-badges.liquid) | **Garantías Veterinarias y Reseñas de Familias Perrunas** configurable por bloques. |
| [`sections/collection-showcase.liquid`](../sections/collection-showcase.liquid) | **Vitrina de Colección de Mascotas** con formatos/pesos disponibles y esquema SEO `ItemList`. |
| [`sections/promo-banner.liquid`](../sections/promo-banner.liquid) | **Banner Promocional** para campañas de peluquería o desparasitación. |

---

## 2. Configuración de Metafields de Producto (`custom.*`)

En **Configuración > Datos personalizados (Custom data) > Productos**, puedes crear los siguientes Metafields opcionales (si un producto no los tiene rellenos, los snippets muestran contenido demostrativo optimizado para tienda animal):

| Nombre | Namespace y Clave (Inglés o Español soportados) | Tipo | Uso |
| :--- | :--- | :--- | :--- |
| **Tipo de mascota / raza ideal** | `custom.pet_suitability` *(o `custom.tipo_piel`)* | Texto de una línea | Badge verde en Pestaña 1 y propiedad SEO JSON-LD. |
| **Beneficios clave** | `custom.key_benefits` *(o `custom.beneficios_clave`)* | Texto enriquecido / Multilínea | Contenido de la Pestaña 1 (*Beneficios*). |
| **Nutrientes / Ingredientes** | `custom.active_ingredients` *(o `custom.ingredientes_activos`)* | Texto enriquecido / Multilínea | Contenido principal de la Pestaña 2 (*Composición & Nutrientes*). |
| **Composición Analítica** | `custom.analytical_composition` *(o `custom.lista_inci`)* | Texto multilínea | Desplegable de composición analítica y aditivos en Pestaña 2. |
| **Guía de uso / Ración** | `custom.usage_guide` *(o `custom.modo_de_uso`)* | Texto enriquecido / Multilínea | Contenido de la Pestaña 3 (*Guía de Uso / Ración*). |
| **Conservación y lavado** | `custom.care_instructions` *(o `custom.instrucciones_cuidado`)* | Texto multilínea | Recuadro de conservación en `snippets/product-care-metafield.liquid`. |

---

## 3. Arquitectura de Assets Modulares (`assets/`)

| Archivo en `assets/` | Rol y Componentes que Alimenta |
| :--- | :--- |
| [`assets/component-pet-cro.css`](../assets/component-pet-cro.css) | Estilos de los 8 snippets CRO con variables dinámicas de Dawn (`--color-foreground`, `--color-background`) y foco accesible `:focus-visible`. |
| [`assets/pet-cro.js`](../assets/pet-cro.js) | Lógica de pestañas (`switchPetTab`, `handlePetTabKeydown`), suscripción (`selectPurchaseMode`, `handleSubscriptionKeydown`, `updateDeliveryFrequency`), cuenta atrás 24h (`initCroDeliveryCountdown`) y suscriptores `PUB_SUB_EVENTS.cartUpdate` y `PUB_SUB_EVENTS.variantChange`. |
| [`assets/section-pet-grooming-steps.css`](../assets/section-pet-grooming-steps.css) | Estilos de [`sections/pet-grooming-steps.liquid`](../sections/pet-grooming-steps.liquid). |
| [`assets/section-pet-trust-badges.css`](../assets/section-pet-trust-badges.css) | Estilos de [`sections/pet-trust-badges.liquid`](../sections/pet-trust-badges.liquid). |
| [`assets/section-grooming-booking.css`](../assets/section-grooming-booking.css) | Estilos de [`sections/grooming-booking.liquid`](../sections/grooming-booking.liquid). |
| [`assets/section-collection-showcase.css`](../assets/section-collection-showcase.css) | Estilos de [`sections/collection-showcase.liquid`](../sections/collection-showcase.liquid). |
| [`assets/section-promo-banner.css`](../assets/section-promo-banner.css) | Estilos de [`sections/promo-banner.liquid`](../sections/promo-banner.liquid). |

---

## 4. Las 7 Buenas Prácticas de Shopify Online Store 2.0 Implementadas

1. **Desacoplamiento de CSS y JS en `assets/`:** Cero bloques `<style>` o `<script>` estáticos inline; carga diferida (`defer="defer"`) y soporte del Theme Editor (`shopify:section:load`).
2. **Imágenes Responsivas y Core Web Vitals (`LCP` & `CLS = 0`):** Uso de `image_tag` con `widths`, `sizes`, `width`/`height` explícitos y carga `eager` + `fetchpriority="high"` en las 2 primeras imágenes de la primera sección (`section.index == 1`).
3. **Section Rendering API y Sincronización Reactiva del Carrito:** El bloque "Se suelen comprar juntos" (`pet-bought-together.js`) inyecta el HTML del `cart-drawer` al vuelo tras `POST /cart/add.js` y actualiza la barra de envío gratis + snack de regalo vía `PUB_SUB_EVENTS.cartUpdate`.
4. **Sincronización Dinámica de Cambio de Variante (`PUB_SUB_EVENTS.variantChange`):** Actualiza precios de suscripción, ahorro, estado de stock y contador 24h al cambiar de tamaño/formato de saco sin recargar la página.
5. **Accesibilidad WCAG 2.1 Nivel AA:** Patrón WAI-ARIA Tabs con *roving `tabindex`*, `radiogroup` navegable por teclado, `role="progressbar"` con `aria-valuenow` y regiones `aria-live="polite"`.
6. **Esquemas de Color Nativos (`color_scheme`):** Todas las secciones personalizadas integran `"type": "color_scheme"` y variables CSS de Dawn.
7. **SEO Estructurado `JSON-LD` Enriquecido:** Esquemas `Product` con `aggregateRating`, `BreadcrumbList`, `Organization`, `WebSite`, `ItemList` y `HowTo`.
