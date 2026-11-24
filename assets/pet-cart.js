/**
 * One "add to cart" for the theme's own blocks (CODE-06): the hygiene routine on the home page
 * (sections/pet-grooming-steps.liquid), the cart suggestions (snippets/cart-upsell.liquid) and
 * "bought together" (assets/pet-bought-together.js).
 *
 * petCart.add(items, options) posts to /cart/add.js and:
 * - disables the button and marks it busy while it works;
 * - refreshes and opens Dawn's cart drawer or cart notification, when the theme has one, and
 *   publishes PUB_SUB_EVENTS.cartUpdate like Dawn's product form;
 * - resolves { ok: true, data } or { ok: false, message }, where message is Shopify's reason for a
 *   422 (sold out, no more stock…, in the shop language) or null for any other failure.
 *
 * @param {{ id: number|string, quantity?: number }[]} items
 * @param {{ button?: HTMLElement, source?: string, render?: boolean }} [options]
 *   render: false skips the drawer/notification (e.g. the cart page reloads itself).
 */
(() => {
  if (window.petCart) return;

  const cartUi = () => document.querySelector('cart-notification') || document.querySelector('cart-drawer');

  async function add(items, { button = null, source = 'pet-cart', render = true } = {}) {
    const cart = render ? cartUi() : null;
    const body = { items: items.map((item) => ({ id: Number(item.id), quantity: item.quantity || 1 })) };
    if (cart) {
      body.sections = cart.getSectionsToRender().map((section) => section.id);
      body.sections_url = window.location.pathname;
    }
    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    }
    try {
      const response = await fetch(`${window.routes.cart_add_url}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status !== 200) {
        // 422: Shopify says why in the shop language. Anything else: the caller's own message.
        return { ok: false, message: response.status === 422 ? data.description || null : null };
      }
      if (cart && data.sections) {
        try {
          cart.classList.remove('is-empty');
          if (button && typeof cart.setActiveElement === 'function') cart.setActiveElement(button);
          // Several lines can be added; Dawn's notification shows one, picked by `key`.
          const first = data.items && data.items[0];
          cart.renderContents({ ...data, key: first && first.key, id: first && first.variant_id });
        } catch (error) {
          // The products are already in the cart: a failed preview is not an error.
        }
      }
      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.cartUpdate, { source, cartData: data });
      }
      return { ok: true, data, hasCartUi: Boolean(cart) };
    } catch (error) {
      return { ok: false, message: null };
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    }
  }

  window.petCart = { add };
})();
