/**
 * Interactive Logic for Pet Shop & Dog Grooming CRO Components
 * File: assets/pet-cro.js
 * Includes:
 *  1. WAI-ARIA Product Tabs Navigation (switchPetTab, handlePetTabKeydown)
 *  2. Auto-Delivery Subscription Selector (selectPurchaseMode, handleSubscriptionKeydown, updateDeliveryFrequency)
 *  3. Estimated delivery dates; frozen products: dispatch countdown (initDeliveryCountdown)
 *  4. Free Shipping Progress Bar Sync (PUB_SUB_EVENTS.cartUpdate)
 *  5. Dynamic Variant Change Synchronization (PUB_SUB_EVENTS.variantChange)
 *
 * Everything lives inside this module and works by event delegation (CODE-16). The only global is
 * window.PetCro: formatMoney, initDeliveryCountdown and updateFreeShippingBars, used by other files.
 */

(() => {
  if (window.PetCro) return;

  function switchPetTab(activeBtn, panelId) {
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
  }

  function handlePetTabKeydown(event, currentBtn) {
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
      switchPetTab(targetBtn, panelId);
      targetBtn.focus();
    }
  }

  function selectPurchaseMode(sectionId, mode, discountPct) {
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
  }

  function handleSubscriptionKeydown(event, sectionId, mode, discountPct) {
    if (event.target && event.target.tagName === 'SELECT') return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPurchaseMode(sectionId, mode, discountPct);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextMode = mode === 'sub' ? 'onetime' : 'sub';
      selectPurchaseMode(sectionId, nextMode, discountPct);
      const targetId =
        nextMode === 'sub' ? `sub-opt-recurring-${sectionId}` : `sub-opt-onetime-${sectionId}`;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.focus();
    }
  }

  function updateDeliveryFrequency(sectionId, frequencyValue) {
    const propFreq = document.getElementById(`sub-prop-frequency-${sectionId}`);
    if (propFreq) {
      propFreq.value = frequencyValue;
    }
  }

  // Date and hour in the warehouse's time zone (Madrid), not the visitor's computer.
  function croMadridNow() {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
        .formatToParts(new Date())
        .map((p) => [p.type, p.value])
    );
    // A UTC date that holds Madrid's calendar day: only used for day arithmetic and weekday names.
    const day = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day, 12));
    return { day, hour: +parts.hour, minute: +parts.minute };
  }

  function croAddDays(date, days) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  // ISO weekday: 1 = Monday … 7 = Sunday.
  const croWeekday = (date) => date.getUTCDay() || 7;

  function initDeliveryCountdown(root = document) {
    const deliveryNodes = root.querySelectorAll('[data-cro-delivery]');
    if (!deliveryNodes.length) return;

    const cutoffHour = 16; // 16:00h warehouse dispatch cutoff (Madrid time)
    const { day: today, hour, minute } = croMadridNow();
    const beforeCutoff = hour < cutoffHour;
    let remainingHours = cutoffHour - hour - 1;
    let remainingMinutes = 60 - minute;
    if (remainingMinutes === 60) {
      remainingHours += 1;
      remainingMinutes = 0;
    }
    const countdown = `${remainingHours}h ${remainingMinutes}m`;

    const locale = (document.documentElement.lang || 'es').toLowerCase().slice(0, 2);
    const formatDate = (date) =>
      new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
    const formatWeekday = (date) => new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(date);

    deliveryNodes.forEach((deliveryEl) => {
      const shipDays = (deliveryEl.dataset.shipDays || '')
        .split(',')
        .map((n) => parseInt(n, 10))
        .filter((n) => n >= 1 && n <= 7);

      if (shipDays.length) {
        // Frozen products: they leave on the next dispatch day (today if before the cutoff) and
        // arrive the next working day (Monday to Friday).
        let dispatch = today;
        if (!(shipDays.includes(croWeekday(today)) && beforeCutoff)) {
          dispatch = croAddDays(today, 1);
          for (let i = 0; i < 7 && !shipDays.includes(croWeekday(dispatch)); i += 1) dispatch = croAddDays(dispatch, 1);
        }
        let arrival = croAddDays(dispatch, 1);
        while (croWeekday(arrival) > 5) arrival = croAddDays(arrival, 1);

        const sameDay = dispatch.getTime() === today.getTime();
        const tpl = sameDay ? deliveryEl.dataset.tplCutoffFrozen : deliveryEl.dataset.tplNextFrozen;
        if (tpl) {
          deliveryEl.innerHTML = tpl
            .replace('__TIME__', countdown)
            .replace('__DISPATCH__', formatWeekday(dispatch))
            .replace('__DATE__', formatDate(arrival));
        }
        return;
      }

      // Other products: standard shipping, delivered between delivery_days_min and delivery_days_max
      // business days (Monday to Friday) after the order; after the cutoff or at the weekend the
      // count starts on the next business day.
      const daysMin = parseInt(deliveryEl.dataset.daysMin, 10) || 3;
      const daysMax = Math.max(daysMin, parseInt(deliveryEl.dataset.daysMax, 10) || 5);
      let start = today;
      if (!(beforeCutoff && croWeekday(today) <= 5)) {
        start = croAddDays(today, 1);
        while (croWeekday(start) > 5) start = croAddDays(start, 1);
      }
      const addBusinessDays = (date, days) => {
        let next = date;
        for (let added = 0; added < days; ) {
          next = croAddDays(next, 1);
          if (croWeekday(next) <= 5) added += 1;
        }
        return next;
      };
      const tplWindow = deliveryEl.dataset.tplWindow || '';
      if (tplWindow) {
        deliveryEl.innerHTML = tplWindow
          .replace('__FROM__', formatDate(addBusinessDays(start, daysMin)))
          .replace('__TO__', formatDate(addBusinessDays(start, daysMax)));
      }
    });
  }

  // Usa el formato de moneda de la tienda (shop.money_format) para que el
  // importe salga igual que el que pinta Liquid. Si no llega, usa Intl.
  function formatMoney(cents, moneyFormat) {
    const match = moneyFormat && moneyFormat.match(/\{\{\s*(\w+)\s*\}\}/);
    if (match) {
      const group = (value, thousands, decimal, decimals) => {
        const [int, frac] = (value / 100).toFixed(decimals).split('.');
        const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
        return frac ? intGrouped + decimal + frac : intGrouped;
      };
      const formats = {
        amount: () => group(cents, ',', '.', 2),
        amount_no_decimals: () => group(cents, ',', '.', 0),
        amount_with_comma_separator: () => group(cents, '.', ',', 2),
        amount_no_decimals_with_comma_separator: () => group(cents, '.', ',', 0),
        amount_with_apostrophe_separator: () => group(cents, "'", '.', 2),
        amount_with_space_separator: () => group(cents, ' ', ',', 2),
      };
      if (formats[match[1]]) return moneyFormat.replace(match[0], formats[match[1]]());
    }
    const locale = document.documentElement.lang || 'es';
    const currency =
      (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'EUR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  }

  function updateFreeShippingBars(totalCents) {
    const bars = document.querySelectorAll('[data-cro-shipping-bar]');
    if (!bars.length) return;

    bars.forEach((bar) => {
      bar.dataset.currentTotal = String(totalCents);
      // The goal always comes from Liquid (snippet free-shipping-goal); without it, the bar is left alone.
      const shippingGoal = parseInt(bar.dataset.shippingGoal, 10);
      if (!shippingGoal) return;
      const msgEl = bar.querySelector('[data-shipping-msg]');
      const trackEl = bar.querySelector('[data-shipping-track]');
      const fillEl = bar.querySelector('[data-shipping-fill]');
      const milestone = bar.querySelector('[data-milestone="shipping"]');
      const reached = totalCents >= shippingGoal;

      const pct = Math.min(100, Math.max(0, Math.round((totalCents * 100) / shippingGoal)));
      if (fillEl) fillEl.style.width = `${pct}%`;
      if (trackEl) trackEl.setAttribute('aria-valuenow', String(pct));

      if (msgEl) {
        if (reached) {
          msgEl.innerHTML = `<span class="is-complete">${bar.dataset.tplComplete || ''}</span>`;
        } else {
          const missing = formatMoney(shippingGoal - totalCents, bar.dataset.moneyFormat);
          msgEl.innerHTML = `<span>${(bar.dataset.tplShipping || '').replace('__AMOUNT__', missing)}</span>`;
        }
      }

      if (milestone) {
        milestone.classList.toggle('is-reached', reached);
        const dot = milestone.querySelector('[data-milestone-dot]');
        if (dot) dot.textContent = reached ? '✓' : dot.dataset.milestoneDot || '🚚';
      }
    });
  }

  function initCroCartListeners() {
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.cartUpdate, () => {
        const rootUrl = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        fetch(`${rootUrl}cart.js`)
          .then((res) => res.json())
          .then((cartData) => {
            if (cartData && typeof cartData.total_price === 'number') {
              updateFreeShippingBars(cartData.total_price);
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
          initDeliveryCountdown(destPriceContainer);
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

          const discountPct = parseInt(sourceSubWidget.dataset.discount, 10) || 0;
          selectPurchaseMode(sectionId, wasOneTimeSelected ? 'onetime' : 'sub', discountPct);
        }
      });
    }
  }

  /**
   * 6. Delegated event handlers (replace inline onclick / onkeydown / onchange attributes)
   */
  function initCroEventDelegation() {
    // Product tabs
    document.addEventListener('click', (event) => {
      const tabBtn = event.target.closest('.cro-tab-btn[data-tab-target]');
      if (tabBtn) {
        switchPetTab(tabBtn, tabBtn.dataset.tabTarget);
      }
    });

    document.addEventListener('keydown', (event) => {
      const tabBtn = event.target.closest('.cro-tab-btn[data-tab-target]');
      if (tabBtn) {
        handlePetTabKeydown(event, tabBtn);
      }
    });

    // Subscription selector
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-sub-freq-select]')) return;
      const option = event.target.closest('[data-sub-option]');
      if (option) {
        selectPurchaseMode(
          option.dataset.sectionId,
          option.dataset.mode,
          parseInt(option.dataset.discount, 10) || 0
        );
      }
    });

    document.addEventListener('keydown', (event) => {
      const option = event.target.closest('[data-sub-option]');
      if (option) {
        handleSubscriptionKeydown(
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
        updateDeliveryFrequency(select.dataset.sectionId, select.value);
      }
    });
  }

  window.PetCro = { formatMoney, initDeliveryCountdown, updateFreeShippingBars };
  initCroEventDelegation();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDeliveryCountdown();
      initCroCartListeners();
    });
  } else {
    initDeliveryCountdown();
    initCroCartListeners();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initDeliveryCountdown(event.target);
  });
})();
