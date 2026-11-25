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
        if (window.PetCro) return window.PetCro.formatMoney(cents, this.dataset.moneyFormat);
        return (cents / 100).toFixed(2);
      }

      addToCart() {
        const selected = this.selectedItems();
        if (!selected.length) return;

        this.status.textContent = '';
        // assets/pet-cart.js: refreshes the cart drawer / notification and publishes cartUpdate.
        window.petCart
          .add(selected.map((item) => ({ id: item.dataset.variantId })), { button: this.button, source: 'bought-together' })
          .then((result) => {
            this.status.textContent = result.ok ? this.dataset.added : result.message || this.dataset.error;
            this.update();
          });
      }
    }
  );
}
