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
 * 6. Delegated event handlers (replace inline onclick / onkeydown / onchange attributes)
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
}

if (!window.__petCroInitialized) {
  window.__petCroInitialized = true;
  initCroEventDelegation();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCroDeliveryCountdown();
      initCroCartListeners();
    });
  } else {
    initCroDeliveryCountdown();
    initCroCartListeners();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initCroDeliveryCountdown(event.target);
  });
}
