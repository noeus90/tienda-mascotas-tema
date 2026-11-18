/* "Frequently bought together" block (snippets/pet-bought-together.liquid).
 * Loads the complementary products of the product, keeps the total and the button
 * up to date, and adds the selected products to the cart in one request.
 */
if (!customElements.get('bought-together')) {
  customElements.define(
    'bought-together',
    class BoughtTogether extends HTMLElement {
      connectedCallback() {
        this.list = this.querySelector('[data-bt-list]');
        this.button = this.querySelector('[data-bt-add]');
        this.status = this.querySelector('[data-bt-status]');
        this.current = this.querySelector('[data-bt-current]');

        this.addEventListener('change', (event) => this.onChange(event));
        this.button.addEventListener('click', () => this.addToCart());

        if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
          this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
            if (event.data.sectionId !== this.dataset.sectionId) return;
            this.onVariantChange(event.data.variant);
          });
        }

        this.load();
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      load() {
        fetch(this.dataset.url)
          .then((response) => response.text())
          .then((text) => {
            const html = new DOMParser().parseFromString(text, 'text/html');
            const recs = html.querySelector(`[data-bt-recs="${this.dataset.blockId}"]`);
            const items = recs ? [...recs.querySelectorAll('[data-bt-item]')] : [];
            if (!items.length) return;
            items.forEach((item) => this.list.appendChild(document.importNode(item, true)));
            this.hidden = false;
            this.update();
          })
          .catch(() => {
            // Without complementary products the block stays hidden.
          });
      }

      onChange(event) {
        const select = event.target.closest('[data-bt-variant]');
        if (select) {
          const item = select.closest('[data-bt-item]');
          const option = select.selectedOptions[0];
          item.dataset.variantId = option.value;
          item.dataset.price = option.dataset.price;
          item.querySelector('[data-bt-price]').textContent = this.formatMoney(Number(option.dataset.price));
        }
        this.status.textContent = '';
        this.update();
      }

      onVariantChange(variant) {
        if (!this.current) return;
        const check = this.current.querySelector('[data-bt-check]');
        if (!variant || !variant.available) {
          check.checked = false;
          check.disabled = true;
        } else {
          this.current.dataset.variantId = variant.id;
          this.current.dataset.price = variant.price;
          this.current.querySelector('[data-bt-price]').textContent = this.formatMoney(variant.price);
          if (check.disabled) {
            check.disabled = false;
            check.checked = true;
          }
        }
        this.update();
      }

      selectedItems() {
        return [...this.list.querySelectorAll('[data-bt-item]')].filter(
          (item) => item.querySelector('[data-bt-check]').checked
        );
      }

      update() {
        const selected = this.selectedItems();
        const total = selected.reduce((sum, item) => sum + Number(item.dataset.price), 0);
        this.button.disabled = selected.length === 0;
        this.button.textContent = selected.length
          ? this.dataset.cta.replace('__COUNT__', selected.length).replace('__TOTAL__', this.formatMoney(total))
          : this.dataset.selectOne;
      }

      formatMoney(cents) {
        if (typeof formatCroMoney === 'function') return formatCroMoney(cents, this.dataset.moneyFormat);
        return (cents / 100).toFixed(2);
      }

      addToCart() {
        const selected = this.selectedItems();
        if (!selected.length) return;

        const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        const sections = cart ? cart.getSectionsToRender().map((section) => section.id) : [];

        this.button.disabled = true;
        this.button.setAttribute('aria-busy', 'true');
        this.status.textContent = '';

        fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            items: selected.map((item) => ({ id: Number(item.dataset.variantId), quantity: 1 })),
            sections,
            sections_url: window.location.pathname,
          }),
        })
          .then((response) => response.json())
          .then((response) => {
            // /cart/add.js answers 422 with { status, description }, for example when a product is sold out.
            if (!response || response.status) {
              this.status.textContent = (response && response.description) || this.dataset.error;
              return;
            }

            this.status.textContent = this.dataset.added;

            if (cart && response.sections) {
              try {
                cart.classList.remove('is-empty');
                if (typeof cart.setActiveElement === 'function') cart.setActiveElement(this.button);
                // Several lines are added; Dawn's cart notification shows one, picked by `key`.
                const first = response.items && response.items[0];
                cart.renderContents({ ...response, key: first && first.key, id: first && first.variant_id });
              } catch (error) {
                // The products are already in the cart: a failed preview must not report an error.
              }
            }

            if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
              publish(PUB_SUB_EVENTS.cartUpdate, { source: 'bought-together', cartData: response });
            }
          })
          .catch(() => {
            this.status.textContent = this.dataset.error;
          })
          .finally(() => {
            this.button.removeAttribute('aria-busy');
            this.update();
          });
      }
    }
  );
}
