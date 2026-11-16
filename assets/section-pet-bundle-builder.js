/**
 * Interactive Logic for Pet Bundle Builder ("Crea el Pack de tu Peludo")
 * File: assets/section-pet-bundle-builder.js
 * Supports multiple instances per page, bilingual i18n (ES/EN), and Theme Editor events (shopify:section:load).
 */

function initBundleBuilder(rootEl) {
  if (!rootEl || rootEl.dataset.bundleInitialized === 'true') return;
  rootEl.dataset.bundleInitialized = 'true';

  const sectionId = rootEl.dataset.sectionId;
  const goalUnits = parseInt(rootEl.dataset.goal, 10) || 3;
  const tier1Discount = parseInt(rootEl.dataset.tier1, 10) || 10;
  const tier2Discount = parseInt(rootEl.dataset.tier2, 10) || 15;

  let i18nBundle = {};
  const i18nNode = rootEl.querySelector('[data-bundle-i18n]');
  if (i18nNode) {
    try {
      i18nBundle = JSON.parse(i18nNode.textContent);
    } catch (e) {
      i18nBundle = {};
    }
  }

  const slotsEl = document.getElementById(`bundle-slots-${sectionId}`);
  const trackEl = document.getElementById(`bundle-track-${sectionId}`);
  const barEl = document.getElementById(`bundle-bar-${sectionId}`);
  const msgEl = document.getElementById(`bundle-msg-${sectionId}`);
  const tier1El = document.getElementById(`tier-1-${sectionId}`);
  const tier2El = document.getElementById(`tier-2-${sectionId}`);

  const subtotalEl = document.getElementById(`bundle-subtotal-${sectionId}`);
  const discountLabelEl = document.getElementById(`bundle-discount-label-${sectionId}`);
  const discountAmountEl = document.getElementById(`bundle-discount-amount-${sectionId}`);
  const oldTotalEl = document.getElementById(`bundle-old-total-${sectionId}`);
  const finalTotalEl = document.getElementById(`bundle-final-total-${sectionId}`);
  const submitBtn = document.getElementById(`bundle-submit-${sectionId}`);
  const feedbackEl = document.getElementById(`bundle-feedback-${sectionId}`);

  if (!slotsEl || !barEl || !submitBtn) return;

  let bundleItems = [];

  function formatCurrency(cents) {
    const locale = document.documentElement.lang || 'es';
    const currency =
      (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'EUR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  }

  function addItemFromCard(card) {
    if (!card) return;
    const id = card.dataset.id;
    const title = card.dataset.title;
    const price = parseInt(card.dataset.price, 10) || 0;

    bundleItems.push({
      uid: String(Date.now() + Math.random()),
      id,
      title,
      price,
    });

    card.classList.add('is-in-bundle');
    updateBundleUI();
  }

  function removeItemByUid(uid) {
    bundleItems = bundleItems.filter((item) => String(item.uid) !== String(uid));

    rootEl.querySelectorAll('.bundle-prod-card').forEach((card) => {
      const stillInBundle = bundleItems.some((i) => i.id === card.dataset.id);
      card.classList.toggle('is-in-bundle', stillInBundle);
    });

    updateBundleUI();
  }

  function updateBundleUI() {
    const itemCount = bundleItems.length;
    const activeLang = (document.documentElement.lang || 'es').toLowerCase().slice(0, 2);
    const dict = (i18nBundle && i18nBundle[activeLang]) || i18nBundle;

    // 1. Progress bar and status messages
    const progressPct = Math.min(100, Math.round((itemCount / goalUnits) * 100));
    barEl.style.width = `${progressPct}%`;
    if (trackEl) {
      trackEl.setAttribute('aria-valuenow', String(Math.min(goalUnits, itemCount)));
    }

    if (tier1El) tier1El.classList.toggle('is-unlocked', itemCount >= 2);
    if (tier2El) tier2El.classList.toggle('is-unlocked', itemCount >= goalUnits);

    let discountPct = 0;
    if (itemCount >= goalUnits) {
      discountPct = tier2Discount;
      if (msgEl && dict.msgCompleted) msgEl.textContent = dict.msgCompleted;
    } else if (itemCount === 2) {
      discountPct = tier1Discount;
      const missingCount = goalUnits - itemCount;
      if (msgEl && dict.msgTier1) {
        msgEl.textContent = dict.msgTier1.replace('__MISSING__', missingCount);
      }
    } else if (itemCount === 1) {
      if (msgEl && dict.msgMissing1) msgEl.textContent = dict.msgMissing1;
    } else {
      if (msgEl && dict.msgInitial) msgEl.textContent = dict.msgInitial;
    }

    // 2. Render pack slots
    slotsEl.innerHTML = '';
    const totalSlots = Math.max(goalUnits, itemCount);

    for (let i = 0; i < totalSlots; i++) {
      const item = bundleItems[i];
      const slotDiv = document.createElement('div');

      if (item) {
        const displayTitle = item.title;
        slotDiv.className = 'bundle-slot-item is-filled';
        slotDiv.innerHTML = `
          <div class="bundle-slot-info">
            <span class="bundle-slot-name">${i + 1}. ${displayTitle}</span>
            <span class="bundle-slot-price">${formatCurrency(item.price)}</span>
          </div>
          <button type="button" class="bundle-slot-remove" aria-label="Remove" data-remove-uid="${item.uid}">
            &times;
          </button>
        `;
      } else {
        slotDiv.className = 'bundle-slot-item';
        const emptyText = (dict.emptyStep || 'Step __NUM__').replace('__NUM__', i + 1);
        slotDiv.innerHTML = `<span>${emptyText}</span>`;
      }

      slotsEl.appendChild(slotDiv);
    }

    // 3. Real-time financial breakdown
    const subtotal = bundleItems.reduce((acc, item) => acc + item.price, 0);
    const savingsAmount = Math.round(subtotal * (discountPct / 100));
    const finalTotal = subtotal - savingsAmount;

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (discountLabelEl && dict.discountLabel) {
      discountLabelEl.textContent = dict.discountLabel.replace('__PCT__', discountPct);
    }
    if (discountAmountEl) discountAmountEl.textContent = `-${formatCurrency(savingsAmount)}`;
    if (finalTotalEl) finalTotalEl.textContent = formatCurrency(finalTotal);

    if (oldTotalEl) {
      oldTotalEl.classList.toggle('is-visible', savingsAmount > 0);
      if (savingsAmount > 0) oldTotalEl.textContent = formatCurrency(subtotal);
    }

    // 4. Submit CTA state
    if (itemCount === 0) {
      submitBtn.disabled = true;
      if (dict.selectAtLeast) submitBtn.textContent = dict.selectAtLeast;
    } else {
      submitBtn.disabled = false;
      if (dict.addPackCta) {
        submitBtn.textContent = dict.addPackCta
          .replace('__COUNT__', itemCount)
          .replace('__TOTAL__', formatCurrency(finalTotal));
      }
    }
  }

  // Event delegation for adding or removing items from the pack
  rootEl.addEventListener('click', (event) => {
    const addBtn = event.target.closest('.bundle-add-btn');
    if (addBtn) {
      const card = addBtn.closest('.bundle-prod-card');
      addItemFromCard(card);
      return;
    }

    const removeBtn = event.target.closest('[data-remove-uid]');
    if (removeBtn) {
      removeItemByUid(removeBtn.dataset.removeUid);
    }
  });

  // Submit pack to Cart (Shopify Ajax Cart API + Section Rendering API)
  submitBtn.addEventListener('click', () => {
    if (bundleItems.length === 0) return;

    const hasRealVariantIds = bundleItems.every((item) => !String(item.id).startsWith('demo-'));

    if (hasRealVariantIds && window.Shopify && window.Shopify.routes) {
      const cart =
        document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      const sectionsToRender = cart
        ? cart.getSectionsToRender().map((section) => section.id)
        : [];

      const itemsPayload = bundleItems.map((item) => ({
        id: parseInt(item.id, 10),
        quantity: 1,
        properties: {
          _Pet_Pack: `Custom Pet Pack (${bundleItems.length} pcs)`,
        },
      }));

      submitBtn.disabled = true;

      fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          items: itemsPayload,
          sections: sectionsToRender,
          sections_url: window.location.pathname,
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          showConfirmation();

          if (cart && response && response.sections) {
            if (typeof cart.setActiveElement === 'function') {
              cart.setActiveElement(submitBtn);
            }
            if (cart.classList.contains('is-empty')) {
              cart.classList.remove('is-empty');
            }
            if (typeof cart.renderContents === 'function') {
              cart.renderContents(response);
            }
          }

          if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'bundle-builder',
              cartData: response,
            });
          }
        })
        .catch(() => {
          showConfirmation();
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    } else {
      // Local demo mode: simulate cart progress bar update on the page
      const totalPackCents = bundleItems.reduce((acc, item) => acc + item.price, 0);
      if (typeof window.updateFreeShippingBars === 'function') {
        window.updateFreeShippingBars(totalPackCents);
      }
      showConfirmation();
    }
  });

  function showConfirmation() {
    if (!feedbackEl) return;
    feedbackEl.classList.add('is-visible');
    setTimeout(() => {
      feedbackEl.classList.remove('is-visible');
    }, 4000);
  }

  rootEl.__refreshBundleUI = updateBundleUI;
  updateBundleUI();
}

window.refreshAllBundleBuilders = function () {
  document.querySelectorAll('.bundle-builder-root').forEach((el) => {
    if (typeof el.__refreshBundleUI === 'function') {
      el.__refreshBundleUI();
    }
  });
};

function initAllBundleBuilders(scope = document) {
  scope.querySelectorAll('.bundle-builder-root').forEach((el) => initBundleBuilder(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initAllBundleBuilders());
} else {
  initAllBundleBuilders();
}

document.addEventListener('shopify:section:load', (event) => {
  initAllBundleBuilders(event.target);
});

