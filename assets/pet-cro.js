/**
 * Interactive Logic for Pet Shop & Dog Grooming CRO Components
 * File: assets/pet-cro.js
 * Includes:
 *  1. WAI-ARIA Product Tabs Navigation (switchPetTab, handlePetTabKeydown)
 *  2. Auto-Delivery Subscription Selector (selectPurchaseMode, handleSubscriptionKeydown, updateDeliveryFrequency)
 *  3. Real-Time 24/48h Dispatch & Delivery Countdown (initCroDeliveryCountdown)
 *  4. Real-Time 2-Tier Free Shipping + Free Pet Treat Progress Bar Sync (PUB_SUB_EVENTS.cartUpdate)
 *  5. Dynamic Variant Change Synchronization (PUB_SUB_EVENTS.variantChange)
 */

window.switchPetTab = function (activeBtn, panelId) {
  const wrapper = activeBtn.closest('.cro-tabs-wrapper');
  if (!wrapper) return;

  wrapper.querySelectorAll('.cro-tab-btn').forEach((btn) => {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('tabindex', '-1');
  });

  wrapper.querySelectorAll('.cro-tab-panel').forEach((panel) => {
    panel.classList.remove('is-active');
    panel.setAttribute('hidden', '');
  });

  activeBtn.classList.add('is-active');
  activeBtn.setAttribute('aria-selected', 'true');
  activeBtn.setAttribute('tabindex', '0');

  const panel = wrapper.querySelector(`#${panelId}`);
  if (panel) {
    panel.classList.add('is-active');
    panel.removeAttribute('hidden');
  }
};

window.handlePetTabKeydown = function (event, currentBtn) {
  const wrapper = currentBtn.closest('.cro-tabs-wrapper');
  if (!wrapper) return;

  const buttons = Array.from(wrapper.querySelectorAll('.cro-tab-btn'));
  const currentIndex = buttons.indexOf(currentBtn);
  if (currentIndex === -1) return;

  let nextIndex = null;
  if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % buttons.length;
  } else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = buttons.length - 1;
  }

  if (nextIndex !== null) {
    event.preventDefault();
    const targetBtn = buttons[nextIndex];
    const panelId = targetBtn.getAttribute('aria-controls');
    window.switchPetTab(targetBtn, panelId);
    targetBtn.focus();
  }
};

window.selectPurchaseMode = function (sectionId, mode, discountPct) {
  const widget = document.getElementById(`sub-widget-${sectionId}`);
  const optSub = document.getElementById(`sub-opt-recurring-${sectionId}`);
  const optOne = document.getElementById(`sub-opt-onetime-${sectionId}`);
  const propMode = document.getElementById(`sub-prop-mode-${sectionId}`);
  const propFreq = document.getElementById(`sub-prop-frequency-${sectionId}`);
  const selectFreq = document.getElementById(`sub-freq-select-${sectionId}`);

  if (!optSub || !optOne) return;

  const labelSub = (widget && widget.dataset.labelSub) || `Auto-Delivery (${discountPct}%)`;
  const labelOnetime = (widget && widget.dataset.labelOnetime) || 'One-time purchase';

  if (mode === 'sub') {
    optSub.classList.add('is-selected');
    optSub.setAttribute('aria-checked', 'true');
    optOne.classList.remove('is-selected');
    optOne.setAttribute('aria-checked', 'false');
    if (propMode) propMode.value = labelSub;
    if (propFreq && selectFreq) {
      propFreq.disabled = false;
      propFreq.value = selectFreq.value;
    }
  } else {
    optOne.classList.add('is-selected');
    optOne.setAttribute('aria-checked', 'true');
    optSub.classList.remove('is-selected');
    optSub.setAttribute('aria-checked', 'false');
    if (propMode) propMode.value = labelOnetime;
    if (propFreq) {
      propFreq.disabled = true;
    }
  }
};

window.handleSubscriptionKeydown = function (event, sectionId, mode, discountPct) {
  if (event.target && event.target.tagName === 'SELECT') return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    window.selectPurchaseMode(sectionId, mode, discountPct);
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const nextMode = mode === 'sub' ? 'onetime' : 'sub';
    window.selectPurchaseMode(sectionId, nextMode, discountPct);
    const targetId =
      nextMode === 'sub' ? `sub-opt-recurring-${sectionId}` : `sub-opt-onetime-${sectionId}`;
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.focus();
  }
};

window.updateDeliveryFrequency = function (sectionId, frequencyValue) {
  const propFreq = document.getElementById(`sub-prop-frequency-${sectionId}`);
  if (propFreq) {
    propFreq.value = frequencyValue;
  }
};

function initCroDeliveryCountdown(root = document) {
  const deliveryNodes = root.querySelectorAll('[data-cro-delivery]');
  if (!deliveryNodes.length) return;

  const now = new Date();
  const cutoffHour = 16; // 16:00h warehouse dispatch cutoff
  let remainingHours = cutoffHour - now.getHours() - 1;
  let remainingMinutes = 60 - now.getMinutes();

  if (remainingMinutes === 60) {
    remainingHours += 1;
    remainingMinutes = 0;
  }

  const daysToAdd = now.getHours() < cutoffHour ? 1 : 2;
  const deliveryDate = new Date(now);
  deliveryDate.setDate(now.getDate() + daysToAdd);

  if (deliveryDate.getDay() === 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  const locale = (document.documentElement.lang || 'es').toLowerCase().slice(0, 2);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(deliveryDate);

  deliveryNodes.forEach((deliveryEl) => {
    const tplCutoff = deliveryEl.dataset.tplCutoff || '';
    const tplExpress = deliveryEl.dataset.tplExpress || '';

    if (now.getHours() < cutoffHour && remainingHours >= 0 && tplCutoff) {
      deliveryEl.innerHTML = tplCutoff
        .replace('__TIME__', `${remainingHours}h ${remainingMinutes}m`)
        .replace('__DATE__', formattedDate);
    } else if (tplExpress) {
      deliveryEl.innerHTML = tplExpress.replace('__DATE__', formattedDate);
    }
  });
}

function formatCroMoney(cents) {
  const locale = document.documentElement.lang || 'es';
  const currency =
    (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'EUR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
}

window.updateFreeShippingBars = function (totalCents) {
  const bars = document.querySelectorAll('[data-cro-shipping-bar]');
  if (!bars.length) return;

  bars.forEach((bar) => {
    bar.dataset.currentTotal = String(totalCents);
    const shippingGoal = parseInt(bar.dataset.shippingGoal, 10) || 4500;
    const giftGoal = parseInt(bar.dataset.giftGoal, 10) || 6500;
    const tplShipping = bar.dataset.tplShipping || '';
    const tplGift = bar.dataset.tplGift || '';
    const tplComplete = bar.dataset.tplComplete || '';

    const msgEl = bar.querySelector('[data-shipping-msg]');
    const trackEl = bar.querySelector('[data-shipping-track]');
    const fillEl = bar.querySelector('[data-shipping-fill]');
    const shippingMilestone = bar.querySelector('[data-milestone="shipping"]');
    const giftMilestone = bar.querySelector('[data-milestone="gift"]');

    const pct = Math.min(100, Math.max(0, Math.round((totalCents * 100) / giftGoal)));
    if (fillEl) {
      fillEl.style.width = `${pct}%`;
    }
    if (trackEl) {
      trackEl.setAttribute('aria-valuenow', String(pct));
    }

    if (msgEl) {
      if (totalCents < shippingGoal) {
        const missing = formatCroMoney(shippingGoal - totalCents);
        msgEl.innerHTML = `<span>${tplShipping.replace('__AMOUNT__', missing)}</span>`;
      } else if (totalCents < giftGoal) {
        const missing = formatCroMoney(giftGoal - totalCents);
        msgEl.innerHTML = `<span>${tplGift.replace('__AMOUNT__', missing)}</span>`;
      } else {
        msgEl.innerHTML = `<span class="is-complete">${tplComplete}</span>`;
      }
    }

    if (shippingMilestone) {
      const reached = totalCents >= shippingGoal;
      shippingMilestone.classList.toggle('is-reached', reached);
      const dot = shippingMilestone.querySelector('[data-milestone-dot]');
      if (dot) dot.textContent = reached ? '✓' : dot.dataset.milestoneDot || '🚚';
    }

    if (giftMilestone) {
      const reached = totalCents >= giftGoal;
      giftMilestone.classList.toggle('is-reached', reached);
      const dot = giftMilestone.querySelector('[data-milestone-dot]');
      if (dot) dot.textContent = reached ? '✓' : dot.dataset.milestoneDot || '🦴';
    }
  });
};

function initCroCartListeners() {
  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, () => {
      const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      fetch(`${rootUrl}cart.js`)
        .then((res) => res.json())
        .then((cartData) => {
          if (cartData && typeof cartData.total_price === 'number') {
            window.updateFreeShippingBars(cartData.total_price);
          }
        })
        .catch(() => {});
    });

    subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      const data = event && event.data;
      if (!data || !data.sectionId || !data.html) return;

      const { sectionId, html } = data;

      const destPriceContainer = document.getElementById(`price-${sectionId}`);
      if (destPriceContainer) {
        initCroDeliveryCountdown(destPriceContainer);
      }

      const sourceSubWidget = html.getElementById(`sub-widget-${sectionId}`);
      const destSubWidget = document.getElementById(`sub-widget-${sectionId}`);

      if (sourceSubWidget && destSubWidget) {
        const currentOneTimeOpt = document.getElementById(`sub-opt-onetime-${sectionId}`);
        const wasOneTimeSelected =
          currentOneTimeOpt && currentOneTimeOpt.classList.contains('is-selected');
        const currentSelect = document.getElementById(`sub-freq-select-${sectionId}`);
        const previousFreqValue = currentSelect ? currentSelect.value : null;

        destSubWidget.innerHTML = sourceSubWidget.innerHTML;

        if (previousFreqValue) {
          const newSelect = document.getElementById(`sub-freq-select-${sectionId}`);
          if (newSelect) {
            newSelect.value = previousFreqValue;
          }
        }

        if (wasOneTimeSelected) {
          window.selectPurchaseMode(sectionId, 'onetime', 15);
        } else {
          window.selectPurchaseMode(sectionId, 'sub', 15);
        }
      }
    });
  }
}

/**
 * 6. Header ES / EN Language Switcher (Avoids POST /localization 502 Bad Gateway in shopify theme dev)
 * - Uses clean GET URL navigation when both languages are published in Shopify Markets.
 * - Provides instant client-side ES <-> EN translation when testing locally with a single-language dev store.
 */
const PET_STORE_TRANSLATIONS = [
  ['Nutrición Natural y Peluquería Canina sin Estrés', 'Natural Nutrition & Stress-Free Dog Grooming'],
  ['Ver Tienda Animal', 'Shop Pet Store'],
  ['Favoritos para tu Mascota', 'Favorites for Your Pet'],
  [' +2.400 familias perrunas felices', ' +2,400 happy pet families'],
  ['+2.400 familias perrunas felices', '+2,400 happy pet families'],
  ['Peluquería & Tienda Verificada', 'Verified Grooming Salon & Store'],
  ['Alimentación Natural y Peluquería Canina Respaldada por Expertos', 'Expert-Backed Natural Pet Food & Dog Grooming'],
  ['Todo lo que tu compañero necesita para estar sano por dentro y radiante por fuera.', 'Everything your companion needs to stay healthy inside and radiant outside.'],
  ['Nutrición 100% Natural', '100% Natural Nutrition'],
  ['Ingredientes frescos de alta palatabilidad sin cereales, subproductos ni conservantes artificiales.', 'Highly palatable fresh ingredients without grains, by-products, or artificial preservatives.'],
  ['Peluquería Amable', 'Gentle Grooming'],
  ['Sesiones de baño, corte y deslanado adaptadas al ritmo de tu perro, sin jaulas de secado.', 'Bath, haircut, and deshedding sessions adapted to your dog’s pace, with no drying cages.'],
  ['Aval Clínico', 'Clinically Vetted'],
  ['Revisado por Veterinarios', 'Veterinarian Reviewed'],
  ['Fórmulas hipoalergénicas diseñadas para cuidar articulaciones, digestión y pieles sensibles.', 'Hypoallergenic formulas designed to support joints, digestion, and sensitive skin.'],
  ['pH 7.0 Canino', 'Canine pH 7.0'],
  ['Sin Sulfatos ni Siliconas', 'Sulfate & Silicone Free'],
  ['Champús y bálsamos de peluquería profesional que respetan la barrera cutánea de tu mascota.', 'Professional grooming shampoos and balms that respect your pet’s skin barrier.'],
  ['Guía de Peluquería Canina', 'Dog Grooming Guide'],
  ['Su Rutina de Higiene y Manto en 4 Pasos', 'Their 4-Step Coat & Hygiene Routine'],
  ['Sigue el orden recomendado por nuestros peluqueros caninos y veterinarios para mantener su pelo sano, limpio y brillante.', 'Follow the order recommended by our dog groomers and veterinarians to keep their coat healthy, clean, and shiny.'],
  ['Paso 1: Cepillado y Deslanado', 'Step 1: Brushing & Deshedding'],
  ['Elimina pelo muerto y nudos antes del baño sin irritar la piel de tu perro.', 'Removes dead hair and tangles before bathing without irritating your dog’s skin.'],
  ['🐾 2-3 veces por semana', '🐾 2-3 times a week'],
  ['Carda Suave Deslanadora', 'Gentle Deshedding Slicker Brush'],
  ['Paso 2: Champú pH Neutro', 'Step 2: Neutral pH Shampoo'],
  ['Limpia en profundidad respetando el pH canino (7.0) con avena y aloe vera.', 'Deeply cleanses while respecting canine pH (7.0) with oatmeal and aloe vera.'],
  ['🛁 Cada 3-4 semanas', '🛁 Every 3-4 weeks'],
  ['Champú Natural Avena & Aloe', 'Natural Oatmeal & Aloe Shampoo'],
  ['Paso 3: Mascarilla & Brillo', 'Step 3: Coat Mask & Shine'],
  ['Hidrata el manto, facilita el peinado sin tirones y aporta suavidad duradera.', 'Moisturizes the coat, enables tangle-free brushing, and provides lasting softness.'],
  ['✨ Tras el aclarado', '✨ After rinsing'],
  ['Mascarilla Hidratante Manto', 'Hydrating Coat Mask'],
  ['Paso 4: Almohadillas y Oídos', 'Step 4: Paws & Ears Care'],
  ['Protege trufa y almohadillas frente al asfalto y mantiene oídos limpios y sanos.', 'Protects nose and paw pads from hot/cold pavement and keeps ears clean and healthy.'],
  ['🛡️ Cuidado semanal', '🛡️ Weekly care'],
  ['Loción Limpiadora Oídos y Ojos', 'Ear & Eye Cleansing Lotion'],
  ['Ver producto', 'View product'],
  ['¿Quieres llevarte el Pack de Baño Completo o reservar cita en Peluquería?', 'Want the Complete Bath Pack or to book a Grooming Appointment?'],
  ['Ahorra un 15% creando el pack de higiene de tu peludo o agenda su sesión de baño y corte con nuestros expertos.', 'Save 15% by building your pet’s hygiene pack or schedule their bath & haircut session with our experts.'],
  ['Crear Pack con 15% DTO →', 'Build Pack with 15% OFF →'],
  ['Ahorra Combinando sus Favoritos', 'Save by Mixing Their Favorites'],
  ['Crea el Pack de tu Peludo y Ahorra hasta un 15%', 'Build Your Pet’s Pack & Save up to 15%'],
  ['Elige 2 productos para obtener un 10% DTO o combina 3 o más (pienso, snacks, champú o cuidados) para desbloquear el 15% de descuento directo.', 'Pick 2 items for 10% OFF or mix 3+ (food, treats, shampoo, or care) to unlock an instant 15% discount.'],
  ['El Pack de tu Peludo', 'Your Pet’s Custom Pack'],
  ['Combina alimentación, snacks o higiene y ahorra al instante', 'Mix & match food, treats, or grooming care and save instantly'],
  ['Subtotal productos:', 'Products subtotal:'],
  ['Total Pack:', 'Pack Total:'],
  ['Elige al menos 1 producto', 'Select at least 1 product'],
  ['+ Añadir al Pack', '+ Add to Pack'],
  ['Reserva Cita de Peluquería Canina & Spa', 'Book a Dog Grooming & Spa Appointment'],
  ['Elige servicio (Baño Dermoprotector, Corte a Tijera, Stripping o Deslanado) y selecciona el día y hora que mejor se adapte a tu agenda.', 'Choose a service (Dermoprotective Bath, Scissor Cut, Hand Stripping, or Deshedding) and pick the date and time that fits your schedule.'],
  ['Configura tu agenda de Peluquería Canina (Calendly)', 'Configure your Dog Grooming Calendly link'],
  ['Paso 1', 'Step 1'],
  ['Paso 2', 'Step 2'],
  ['Paso 3', 'Step 3'],
  ['Paso 4', 'Step 4'],
  ['Paso 5', 'Step 5'],
  ['2 uds = 10% DTO', '2 pcs = 10% OFF'],
  ['3+ uds = 15% DTO', '3+ pcs = 15% OFF'],
  ['Selecciona 3 productos para tu mascota y desbloquea un 15% de descuento', 'Select 3 products for your pet to unlock your 15% discount'],
  ['Descuento pack (0%):', 'Pack discount (0%):'],
  ['Descuento pack (10%):', 'Pack discount (10%):'],
  ['Descuento pack (15%):', 'Pack discount (15%):'],
  ['Producto 1: Selecciona del catálogo', 'Item 1: Select from catalog'],
  ['Producto 2: Selecciona del catálogo', 'Item 2: Select from catalog'],
  ['Producto 3: Selecciona del catálogo', 'Item 3: Select from catalog'],
  ['Pienso Salmón & Boniato Grain-Free (3 kg)', 'Salmon & Sweet Potato Grain-Free Kibble (3 kg)'],
  ['Alta digestibilidad, pelo brillante y articulaciones fuertes', 'High digestibility, shiny coat, and strong joints'],
  ['Snacks Dentales Naturales de Ciervo', 'Natural Deer Dental Chews'],
  ['Limpia el sarro y refuerza las encías de forma natural', 'Naturally cleans tartar and strengthens gums'],
  ['Champú Dermoprotector Avena & Aloe', 'Dermoprotective Oatmeal & Aloe Shampoo'],
  ['Calma el picor y respeta el pH neutro (7.0) de su piel', 'Soothes itching and respects their skin’s neutral pH (7.0)'],
  ['Aceite de Salmón Puro Omega 3-6', 'Pure Omega 3-6 Salmon Oil'],
  ['Reduce la caída del pelo y refuerza el sistema inmune', 'Reduces shedding and strengthens the immune system'],
  ['Bálsamo Reparador Trufa y Almohadillas', 'Nose & Paw Pad Repair Balm'],
  ['Hidrata y protege las patas frente al asfalto y el frío', 'Moisturizes and protects paws from hot pavement and cold'],
  ['Juguete Mordedor Caucho Natural', 'Natural Rubber Chew Toy'],
  ['Resistente, interactivo y rellenable con premios', 'Durable, interactive, and treat-dispensing'],
  ['Nutrición', 'Nutrition'],
  ['Higiene', 'Grooming'],
  ['Suplemento', 'Supplement'],
  ['Cuidado Patas', 'Paw Care'],
  ['Enriquecimiento', 'Enrichment'],
  ['Beneficios', 'Benefits'],
  ['Composición & Nutrientes', 'Composition & Nutrients'],
  ['Guía de Uso / Ración', 'Feeding / Usage Guide'],
  ['Ideal para:', 'Ideal for:'],
  ['Perros y cachorros de todas las razas, incluso con piel o digestión sensible', 'Dogs and puppies of all breeds, including sensitive skin or digestion'],
  ['Pelo brillante y piel sana:', 'Shiny coat & healthy skin:'],
  ['Rico en ácidos grasos Omega 3 y 6 que calman el picor y reducen la caída.', 'Rich in Omega 3 & 6 fatty acids to soothe itching and reduce shedding.'],
  ['Alta digestibilidad e hipoalergénico:', 'Highly digestible & hypoallergenic:'],
  ['Formulado sin cereales ni subproductos para estómagos delicados.', 'Grain-free formula without by-products for sensitive stomachs.'],
  ['Refuerzo articular e inmunitario:', 'Joint & immune support:'],
  ['Con condroprotectores naturales y antioxidantes para mayor vitalidad.', 'Enriched with natural chondroprotectors and antioxidants for daily vitality.'],
  ['65% Ingrediente Principal', '65% Main Ingredient'],
  ['Salmón Fresco & Proteína Noble', 'Fresh Salmon & Noble Protein'],
  ['Fuente de proteína de alto valor biológico y Omega-3 para nutrir el folículo piloso y las articulaciones.', 'High biological value protein and Omega-3 source to nourish hair follicles and support joints.'],
  ['Complejo Dermoprotector', 'Dermoprotective Complex'],
  ['Biotina, Zinc & Aloe Vera', 'Biotin, Zinc & Aloe Vera'],
  ['Hidrata en profundidad la barrera cutánea canina, manteniendo el pH neutro (7.0) y evitando descamaciones.', 'Deeply hydrates the canine skin barrier while maintaining a balanced pH (7.0) and preventing flaking.'],
  ['Prebióticos Naturales', 'Natural Prebiotics'],
  ['Calabaza, Arándanos & Condroitina', 'Pumpkin, Blueberries & Chondroitin'],
  ['Favorece la flora intestinal saludable y protege cartílagos en perros activos o senior.', 'Supports healthy gut flora and protects cartilage in active or senior dogs.'],
  ['Ver composición analítica completa y aditivos', 'View full analytical constituents & additives'],
  ['🐾 Uso Diario / Mantenimiento', '🐾 Daily Care / Maintenance'],
  ['🛁 Día de Baño & Peluquería', '🛁 Bath & Grooming Day'],
  ['Ajusta según peso y actividad:', 'Adjust by weight & activity:'],
  ['Consulta el tamaño de tu peludo (Mini, Mediano o Maxi) antes de dosificar.', 'Check your dog’s size (Mini, Medium, or Maxi) before dosing.'],
  ['Sirve o aplica gradualmente:', 'Serve or apply gradually:'],
  ['En alimentación divide en 2 tomas diarias; en champú aplica sobre el manto húmedo.', 'For food, split into 2 daily meals; for shampoo, apply onto a wet coat.'],
  ['Tiempo de acción / asimilación:', 'Action / absorption time:'],
  ['Masajea suavemente de 3 a 5 minutos hasta la raíz o acompaña siempre con agua fresca.', 'Gently massage for 3–5 minutes down to the roots, or always serve with fresh water.'],
  ['Completa su rutina:', 'Complete their routine:'],
  ['Combina con cepillado regular y visita nuestra peluquería canina cada 4-6 semanas.', 'Pair with regular brushing and book a professional grooming session every 4–6 weeks.'],
  ['Elige tu modalidad de compra:', 'Choose your purchase option:'],
  ['Más Popular · Ahorra 15%', 'Most Popular · Save 15%'],
  ['Autopedido Recurrente y Ahorra', 'Auto-Delivery & Save'],
  ['Recibe su comida o higiene a tiempo sin quedarte nunca sin stock', 'Automatic refills so your pet never runs out of food or grooming essentials'],
  ['Frecuencia de entrega:', 'Delivery frequency:'],
  ['Cada 30 días (Recomendado)', 'Every 30 days (Recommended)'],
  ['Cada 45 días', 'Every 45 days'],
  ['Cada 60 días', 'Every 60 days'],
  ['Pausa, cambia de fecha o cancela online en 1 clic sin permanencia', 'Pause, skip a month, or cancel online in 1 click anytime'],
  ['Envío prioritario gratuito y snack de regalo en cada pedido', 'Free priority shipping & free natural dog treat with every order'],
  ['Compra única', 'One-time purchase'],
  ['Pedido puntual sin entregas periódicas', 'Single order without recurring deliveries'],
  ['Aval Veterinario', 'Vet Approved'],
  ['100% Natural', '100% Natural'],
  ['Testado por Vets', 'Vet Tested'],
  ['Sin Cereales / Sulfatos', 'Grain & Sulfate Free'],
  ['Envío Gratis', 'Free Shipping'],
  ['Snack Regalo', 'Free Treat'],
  ['Conservación y cuidado', 'Storage & Care Instructions'],
  ['Inicio', 'Home'],
  ['Catálogo', 'Catalog'],
  ['Contacto', 'Contact'],
  ['Reservas', 'Bookings'],
  ['Reserva', 'Booking'],
  ['Buscar', 'Search'],
  ['Correo electrónico', 'Email'],
  ['Únete al Club de Familias Perrunas y recibe un 10% DTO', 'Join our Pet Parents Club & get 10% OFF'],
  ['Suscríbete a nuestros correos electrónicos', 'Subscribe to our emails'],
  ['Enlaces rápidos', 'Quick links'],
  ['Tienda Animal & Peluquería', 'Pet Store & Grooming Salon'],
  ['Nuestra misión', 'Our mission'],
  ['🐾 Envío 24h GRATIS en pedidos +49€ · Reserva online tu cita de Peluquería Canina', '🐾 FREE 24h Shipping on orders over €49 · Book your Dog Grooming appointment online'],
  ['Alimentación Natural y Peluquería Canina Respaldada por Expertos', 'Expert-Backed Natural Pet Food & Dog Grooming'],
  ['Todo lo que tu compañero necesita para estar sano por dentro y radiante por fuera.', 'Everything your companion needs to stay healthy inside and radiant outside.'],
  ['+2.400 familias perrunas felices', '+2,400 happy pet families'],
  ['Peluquería & Tienda Verificada', 'Verified Grooming Salon & Store'],
  ['Nutrición 100% Natural', '100% Natural Nutrition'],
  ['Ingredientes frescos de alta palatabilidad sin cereales, subproductos ni conservantes artificiales.', 'Fresh, highly palatable ingredients with zero grains, by-products, or artificial preservatives.'],
  ['Peluquería Amable', 'Stress-Free Grooming'],
  ['Sesiones de baño, corte y deslanado adaptadas al ritmo de tu perro, sin jaulas de secado.', "Baths, haircuts, and deshedding sessions tailored to your dog's pace, never using drying cages."],
  ['Revisado por Veterinarios', 'Veterinary Approved'],
  ['Aval Clínico', 'Clinical Guarantee'],
  ['Fórmulas hipoalergénicas diseñadas para cuidar articulaciones, digestión y pieles sensibles.', 'Hypoallergenic formulas designed to care for sensitive skin, digestion, and joint health.'],
  ['Sin Sulfatos ni Siliconas', 'Sulfate & Silicone Free'],
  ['pH 7.0 Canino', 'Canine pH 7.0'],
  ['Champús y bálsamos de peluquería profesional que respetan la barrera cutánea de tu mascota.', "Professional grooming shampoos and balms that protect your pet's natural skin barrier."],
  ['Guía de Peluquería Canina', 'Dog Grooming Guide'],
  ['Su Rutina de Higiene y Manto en 4 Pasos', 'Their 4-Step Coat & Hygiene Routine'],
  ['Sigue el orden recomendado por nuestros peluqueros caninos y veterinarios para mantener su pelo sano, limpio y brillante.', 'Follow the order recommended by our dog groomers and veterinarians to keep their coat healthy, clean, and shiny.'],
  ['Paso 1: Cepillado y Deslanado', 'Step 1: Brushing & Deshedding'],
  ['Elimina pelo muerto y nudos antes del baño sin irritar la piel de tu perro.', "Removes dead hair and mats before bath time without irritating your dog's skin."],
  ['🐾 2-3 veces por semana', '🐾 2-3 times per week'],
  ['Paso 2: Champú pH Neutro', 'Step 2: Neutral pH Shampoo'],
  ['Limpia en profundidad respetando el pH canino (7.0) con avena y aloe vera.', 'Deep cleans while respecting canine skin pH (7.0) with soothing oatmeal and aloe vera.'],
  ['🛁 Cada 3-4 semanas', '🛁 Every 3-4 weeks'],
  ['Paso 3: Mascarilla & Brillo', 'Step 3: Mask & Shine'],
  ['Hidrata el manto, facilita el peinado sin tirones y aporta suavidad duradera.', 'Deeply hydrates the coat, detangles without pulling, and leaves long-lasting softness.'],
  ['✨ Tras el aclarado', '✨ After rinsing'],
  ['Paso 4: Almohadillas y Oídos', 'Step 4: Paws & Ears'],
  ['Protege trufa y almohadillas frente al asfalto y mantiene oídos limpios y sanos.', 'Protects nose and paw pads from rough asphalt while keeping ears clean and healthy.'],
  ['🛡️ Cuidado semanal', '🛡️ Weekly care'],
  ['Pack Rutina Completa de Manto', 'Complete Coat Routine Bundle'],
  ['Lleva los 4 pasos juntos y ahorra un 15% en el cuidado diario de tu peludo.', "Get all 4 steps together and save 15% on your pet's daily care."],
  ['Comprar rutina completa (-15%)', 'Shop complete routine (-15%)'],
  ['Reserva Cita de Peluquería Canina & Spa', 'Book a Dog Grooming & Spa Appointment'],
  ['Elige servicio (Baño Dermoprotector, Corte a Tijera, Stripping o Deslanado) y selecciona el día y hora que mejor se adapte a tu agenda.', 'Choose a service (Dermoprotective Bath, Scissor Cut, Hand Stripping, or Deshedding) and pick the date and time that fits your schedule.'],
  ['Elige servicio (Baño Dermoprotector, Corte a Tijera, Stripping o Deslanado) y selecciona el día y hora que mejor te venga.', 'Choose a service (Dermoprotective Bath, Scissor Cut, Hand Stripping, or Deshedding) and pick the date and time that fits your schedule.'],
  ['Ahorra Combinando sus Favoritos', 'Save by Mixing Their Favorites'],
  ['Crea el Pack de tu Peludo y Ahorra hasta un 15%', "Build Your Pet's Pack & Save up to 15%"],
  ['Elige 2 productos para obtener un 10% DTO o combina 3 o más (pienso, snacks, champú o cuidados) para desbloquear el 15% de descuento directo.', 'Pick 2 items for 10% OFF or mix 3+ (food, treats, shampoo, or care) to unlock an instant 15% discount.'],
  ['Top Ventas Tienda Animal', 'Top Pet Store Bestsellers'],
  ['Favoritos para tu Mascota', 'Favorites for Your Pet'],
  ['Agenda de Citas de Peluquería Canina', 'Dog Grooming Schedule'],
  ['Panel de control y gestión de citas programadas para los próximos 30 días.', 'Appointment dashboard & booking management for the next 30 days.'],
  ['Próximos 30 días', 'Next 30 days'],
  ['Todos los estados', 'All statuses'],
  ['Todos los servicios', 'All services'],
  ['Confirmada', 'Confirmed'],
  ['Pendiente', 'Pending'],
  ['Realizada', 'Completed'],
  ['Cancelada', 'Cancelled'],
  ['Confirmadas', 'Confirmed'],
  ['Pendientes', 'Pending'],
  ['Realizadas', 'Completed'],
  ['Imprimir Agenda', 'Print Schedule'],
  ['+ Nueva Cita', '+ New Appointment'],
  ['Detalle de la Cita', 'Appointment Details'],
  ['Registrar Nueva Cita de Peluquería', 'Book New Dog Grooming Appointment'],
  ['Guardar Cita', 'Save Appointment'],
  ['Baño Dermoprotector & Oídos', 'Dermoprotective Bath & Ears'],
  ['Corte a Tijera de Raza & Peinado', 'Breed Scissor Cut & Styling'],
  ['Deslanado Completo & Baño', 'Full Deshedding & Bath'],
  ['Spa Ozonoterapia & Mascarilla', 'Ozone Spa Therapy & Mask'],
  ['Higiene Express & Almohadillas', 'Express Hygiene & Paw Pads'],
  ['No hay citas programadas para este día.', 'No appointments scheduled for this day.'],
  ['Volver a vista mensual', 'Return to month view'],
  ['Zona Protegida', 'Protected Area'],
  ['Acceso exclusivo para el personal', 'Staff Access Only'],
  ['Introduce el código PIN de recepción para ver y gestionar la agenda de peluquería canina.', 'Enter the reception PIN code to view and manage the dog grooming schedule.'],
  ['Desbloquear Agenda', 'Unlock Schedule'],
  ['PIN incorrecto. Por favor, inténtalo de nuevo.', 'Incorrect PIN. Please try again.'],
  ['Bloquear Agenda', 'Lock Schedule'],
  ['PIN predeterminado de recepción:', 'Default reception PIN:'],
  ['Recordatorio WhatsApp', 'WhatsApp Reminder'],
  ['Enviar Recordatorio por WhatsApp', 'Send WhatsApp Reminder'],
  ['Servicio & Tamaño', 'Service & Size'],
  ['Fecha & Turno', 'Date & Time'],
  ['Ficha del Peludo', 'Pet Details'],
  ['Confirmación', 'Confirmation'],
  ['1. Selecciona el servicio principal', '1. Select the main grooming service'],
  ['Todos nuestros servicios incluyen cosmética natural y trato individual sin jaulas.', 'All our services feature natural cosmetics and 1-on-1 care without cages.'],
  ['Tamaño y peso aproximado de tu perro', 'Approximate dog size & weight'],
  ['Menos de 5 kg', 'Under 5 kg'],
  ['5 a 15 kg', '5 to 15 kg'],
  ['Más de 15 kg', 'Over 15 kg'],
  ['Tarifa estimada para este servicio:', 'Estimated fee for this service:'],
  ['Continuar a Fecha y Hora', 'Continue to Date & Time'],
  ['2. Elige el día y la franja horaria', '2. Choose date and preferred time slot'],
  ['Selecciona el día que mejor se adapte a tu agenda. Abrimos de Lunes a Sábado.', 'Select the day that best fits your schedule. Open Monday to Saturday.'],
  ['Fecha de la cita *', 'Appointment Date *'],
  ['Mañana', 'Tomorrow'],
  ['+2 Días', '+2 Days'],
  ['Próximo Sábado', 'Next Saturday'],
  ['Turno y hora de inicio preferida *', 'Preferred shift & start time *'],
  ['Turno y franja horaria preferida (1 hora) *', 'Preferred shift & 1-hour time slot *'],
  ['☀️ Turno de Mañana', '☀️ Morning Shift'],
  ['☀️ Turno de Mañana (10:00 - 14:00)', '☀️ Morning Shift (10:00 - 14:00)'],
  ['🌆 Turno de Tarde', '🌆 Afternoon Shift'],
  ['🌆 Turno de Tarde (17:00 - 19:00)', '🌆 Afternoon Shift (17:00 - 19:00)'],
  ['Cada reserva tiene una duración completa de 1 hora reservada en exclusiva para tu perro. Si necesitas otro horario especial, indícalo en el siguiente paso.', 'Each appointment has an exclusive 1-hour slot reserved for your dog. For custom times, mention it in the next step.'],
  ['⏱️ 1 hora', '⏱️ 1 hour'],
  ['(⏱️ 1 hora)', '(⏱️ 1 hour)'],
  ['1 hora', '1 hour'],
  ['Atrás', 'Back'],
  ['Continuar a Ficha del Peludo', 'Continue to Pet Details'],
  ['3. Cuéntanos sobre tu peludo y contacto', '3. Tell us about your dog & contact info'],
  ['Adaptamos los productos, el ritmo de secado y el cepillado a sus necesidades individuales.', 'We tailor cosmetics, drying rhythm, and brushing to their unique needs.'],
  ['🐾 Datos del Perro', '🐾 Dog Details'],
  ['Nombre del perro *', 'Dog name *'],
  ['Raza o cruce *', 'Breed or mix *'],
  ['Edad aproximada', 'Approximate age'],
  ['Particularidades caninas a tener en cuenta:', 'Special care requirements:'],
  ['👤 Datos del Tutor / Contacto', '👤 Pet Parent / Contact Info'],
  ['Tu nombre y apellidos *', 'Your full name *'],
  ['Teléfono móvil (WhatsApp) *', 'Mobile phone (WhatsApp) *'],
  ['Correo electrónico (opcional)', 'Email address (optional)'],
  ['Notas o indicaciones adicionales', 'Additional notes or requests'],
  ['Revisar Cita', 'Review Appointment'],
  ['4. Resumen de tu cita personalizada', '4. Summary of your custom appointment'],
  ['Revisa los datos antes de confirmar. Te enviaremos confirmación inmediata.', 'Review details before confirming. You will receive immediate confirmation.'],
  ['Total estimado', 'Estimated total'],
  ['Servicio contratado', 'Service booked'],
  ['Fecha y turno', 'Date & shift'],
  ['Tutor y teléfono', 'Parent & phone'],
  ['Cuidados especiales', 'Special care'],
  ['Confirmar Cita por WhatsApp', 'Confirm Booking via WhatsApp'],
  ['Modificar datos', 'Edit details'],
  ['✨ Sin esperas ni jaulas', '✨ No cages or long waits'],
  ['🧴 Cosmética natural pH 7.0', '🧴 100% natural pH 7.0 cosmetics'],
  ['💳 Pago en tienda tras el servicio', '💳 Pay at salon after session'],
  ['📅 Añadir a Google Calendar', '📅 Add to Google Calendar'],
  ['📋 Copiar datos', '📋 Copy details'],
  ['¡Solicitud generada con éxito!', 'Request generated successfully!'],
  ['Hemos abierto WhatsApp con tu mensaje redactado. La cita quedará reservada en cuanto confirmemos la hora contigo.', 'We opened WhatsApp with your message. The slot will be reserved as soon as we confirm with you.'],
];

function applyClientSideLanguage(targetLang) {
  document.documentElement.lang = targetLang;

  document.querySelectorAll('[data-lang-switcher]').forEach((switcher) => {
    switcher.querySelectorAll('[data-switch-lang]').forEach((btn) => {
      const isTarget = btn.dataset.switchLang === targetLang;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
    });
  });

  // 1. Update elements with explicit data-i18n-* attributes
  const textAttr = targetLang === 'en' ? 'i18nEn' : 'i18nEs';
  document.querySelectorAll('[data-i18n-es][data-i18n-en]').forEach((el) => {
    if (el.dataset[textAttr] !== undefined) {
      el.textContent = el.dataset[textAttr];
    }
  });

  const htmlAttr = targetLang === 'en' ? 'i18nHtmlEn' : 'i18nHtmlEs';
  document.querySelectorAll('[data-i18n-html-es][data-i18n-html-en]').forEach((el) => {
    if (el.dataset[htmlAttr] !== undefined) {
      el.innerHTML = el.dataset[htmlAttr];
    }
  });

  const placeholderAttr = targetLang === 'en' ? 'i18nPlaceholderEn' : 'i18nPlaceholderEs';
  document.querySelectorAll('[data-i18n-placeholder-es][data-i18n-placeholder-en]').forEach((el) => {
    if (el.dataset[placeholderAttr] !== undefined) {
      el.setAttribute('placeholder', el.dataset[placeholderAttr]);
    }
  });

  const ariaAttr = targetLang === 'en' ? 'i18nAriaEn' : 'i18nAriaEs';
  document.querySelectorAll('[data-i18n-aria-es][data-i18n-aria-en]').forEach((el) => {
    if (el.dataset[ariaAttr] !== undefined) {
      el.setAttribute('aria-label', el.dataset[ariaAttr]);
    }
  });

  // 2. Walk text nodes for dictionary translations
  const fromIdx = targetLang === 'en' ? 0 : 1;
  const toIdx = targetLang === 'en' ? 1 : 0;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const trimmed = node.nodeValue.trim();
    if (!trimmed) continue;
    for (let i = 0; i < PET_STORE_TRANSLATIONS.length; i++) {
      const pair = PET_STORE_TRANSLATIONS[i];
      const source = pair[fromIdx];
      const target = pair[toIdx];
      if (trimmed === source) {
        node.nodeValue = node.nodeValue.replace(source, target);
        break;
      } else if (trimmed.length > 20 && node.nodeValue.includes(source)) {
        node.nodeValue = node.nodeValue.replace(source, target);
        break;
      }
    }
  }

  initCroDeliveryCountdown();

  if (typeof window.refreshAllBundleBuilders === 'function') {
    window.refreshAllBundleBuilders();
  }

  if (typeof window.refreshAllGroomingCalendars === 'function') {
    window.refreshAllGroomingCalendars();
  }

  if (typeof window.refreshAllGroomingBookings === 'function') {
    window.refreshAllGroomingBookings();
  }

  const firstBar = document.querySelector('[data-cro-shipping-bar]');
  if (firstBar && firstBar.dataset.currentTotal !== undefined && typeof window.updateFreeShippingBars === 'function') {
    window.updateFreeShippingBars(parseInt(firstBar.dataset.currentTotal, 10) || 0);
  }
}

window.switchStoreLanguage = function (targetLang, btnEl) {
  try {
    localStorage.setItem('pet_store_lang', targetLang);
  } catch (e) {}

  const switcher = btnEl && btnEl.closest('[data-lang-switcher]');
  const isShopifyMultilang = switcher && switcher.dataset.shopifyMultilang === 'true';
  const targetUrl = btnEl && btnEl.dataset.langUrl;

  if (isShopifyMultilang && targetUrl) {
    window.location.href = targetUrl;
    return;
  }

  applyClientSideLanguage(targetLang);
};

function initLanguagePreference() {
  let savedLang = null;
  try {
    savedLang = localStorage.getItem('pet_store_lang');
  } catch (e) {}

  const switcher = document.querySelector('[data-lang-switcher]');
  const isShopifyMultilang = switcher && switcher.dataset.shopifyMultilang === 'true';

  if (!isShopifyMultilang && (savedLang === 'es' || savedLang === 'en')) {
    applyClientSideLanguage(savedLang);
  }
}

/**
 * 7. Delegated event handlers (replace inline onclick / onkeydown / onchange attributes)
 */
function initCroEventDelegation() {
  // Product tabs
  document.addEventListener('click', (event) => {
    const tabBtn = event.target.closest('.cro-tab-btn[data-tab-target]');
    if (tabBtn) {
      window.switchPetTab(tabBtn, tabBtn.dataset.tabTarget);
    }
  });

  document.addEventListener('keydown', (event) => {
    const tabBtn = event.target.closest('.cro-tab-btn[data-tab-target]');
    if (tabBtn) {
      window.handlePetTabKeydown(event, tabBtn);
    }
  });

  // Subscription selector
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-sub-freq-select]')) return;
    const option = event.target.closest('[data-sub-option]');
    if (option) {
      window.selectPurchaseMode(
        option.dataset.sectionId,
        option.dataset.mode,
        parseInt(option.dataset.discount, 10) || 0
      );
    }
  });

  document.addEventListener('keydown', (event) => {
    const option = event.target.closest('[data-sub-option]');
    if (option) {
      window.handleSubscriptionKeydown(
        event,
        option.dataset.sectionId,
        option.dataset.mode,
        parseInt(option.dataset.discount, 10) || 0
      );
    }
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-sub-freq-select]');
    if (select) {
      window.updateDeliveryFrequency(select.dataset.sectionId, select.value);
    }
  });

  // Header / footer / drawer language switcher
  document.addEventListener('click', (event) => {
    const langBtn = event.target.closest('[data-switch-lang]');
    if (langBtn) {
      window.switchStoreLanguage(langBtn.dataset.switchLang, langBtn);
    }
  });
}

if (!window.__petCroInitialized) {
  window.__petCroInitialized = true;
  initCroEventDelegation();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLanguagePreference();
      initCroDeliveryCountdown();
      initCroCartListeners();
    });
  } else {
    initLanguagePreference();
    initCroDeliveryCountdown();
    initCroCartListeners();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initCroDeliveryCountdown(event.target);
  });
}
