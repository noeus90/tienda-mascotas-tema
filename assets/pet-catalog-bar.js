/**
 * Pet Catalog Interactive Quick Filters & Mascot Navigation
 * File: assets/pet-catalog-bar.js
 * Enables instant multi-tier pet and category filtering on /collections/all
 */

(function () {
  'use strict';

  // Mapping dictionaries between canonical internal values and localized URL params
  const MASCOT_URL_MAP = {
    en: {
      perro: 'dog',
      gato: 'cat',
    },
    es: {
      perro: 'perro',
      gato: 'gato',
    },
  };

  const CATEGORY_URL_MAP = {
    en: {
      pienso: 'dry-food',
      humeda: 'wet-food',
      snacks: 'snacks',
      juguetes: 'toys',
      higiene: 'hygiene',
      accesorios: 'accessories',
      suplementos: 'supplements',
    },
    es: {
      pienso: 'pienso',
      humeda: 'humeda',
      snacks: 'snacks',
      juguetes: 'juguetes',
      higiene: 'higiene',
      accesorios: 'accesorios',
      suplementos: 'suplementos',
    },
  };

  function normalizeMascotParam(val) {
    if (!val) return null;
    const v = val.toLowerCase().trim();
    if (v === 'dog' || v === 'dogs' || v === 'perro' || v === 'perros') return 'perro';
    if (v === 'cat' || v === 'cats' || v === 'gato' || v === 'gatos') return 'gato';
    return v;
  }

  function normalizeCategoryParam(val) {
    if (!val) return null;
    const v = val.toLowerCase().trim();
    if (v === 'dry-food' || v === 'dry' || v === 'kibble' || v === 'pienso') return 'pienso';
    if (v === 'wet-food' || v === 'wet' || v === 'humeda' || v === 'comida-humeda') return 'humeda';
    if (v === 'snacks' || v === 'treats' || v === 'snack') return 'snacks';
    if (v === 'toys' || v === 'toy' || v === 'juguetes' || v === 'juguete') return 'juguetes';
    if (v === 'hygiene' || v === 'grooming' || v === 'higiene') return 'higiene';
    if (v === 'accessories' || v === 'walk' || v === 'accesorios') return 'accesorios';
    if (v === 'supplements' || v === 'suplementos') return 'suplementos';
    return v;
  }

  function normalizeNeedParam(val) {
    if (!val) return null;
    const v = val.toLowerCase().trim();
    if (v === 'puppy' || v === 'puppies' || v === 'cachorro' || v === 'cachorros') return 'cachorro';
    if (v === 'kitten' || v === 'kittens' || v === 'gatito' || v === 'gatitos') return 'gatito';
    if (v === 'adult' || v === 'adulto' || v === 'adultos') return 'adulto';
    if (v === 'senior' || v === 'mayor') return 'senior';
    if (v === 'sensitive' || v === 'hipoalergenico' || v === 'hypoallergenic') return 'hipoalergenico';
    if (v === 'sterilised' || v === 'sterilized' || v === 'esterilizado' || v === 'neutered') return 'esterilizado';
    if (v === 'hairball' || v === 'bolas-de-pelo') return 'hairball';
    return v;
  }

  class PetCatalogBar {
    constructor(section) {
      this.section = section;
      this.mascotBtns = section.querySelectorAll('[data-pet-mascot]');
      this.categoryPills = section.querySelectorAll('[data-pet-category]');
      this.resetBtn = section.querySelector('[data-pet-reset]');
      this.statusBar = section.querySelector('[data-pet-status-bar]');
      this.statusText = section.querySelector('[data-pet-status-text]');

      // Textos ya traducidos por Liquid (locales/*.json)
      this.i18n = {};
      const i18nNode = section.querySelector('[data-pet-catalog-i18n]');
      if (i18nNode) {
        try {
          this.i18n = JSON.parse(i18nNode.textContent);
        } catch (e) {
          this.i18n = {};
        }
      }

      // State
      this.activeMascot = 'all';
      this.activeCategory = 'all';
      this.activeNeed = 'all';

      this.init();
    }

    isEnglish() {
      const htmlLang = (document.documentElement.lang || '').toLowerCase();
      const path = window.location.pathname.toLowerCase();
      return htmlLang.startsWith('en') || path.startsWith('/en/') || path === '/en';
    }

    init() {
      // 1. Read state from URL search params (supporting both EN and ES conventions)
      const params = new URLSearchParams(window.location.search);
      const rawMascot = params.get('mascota') || params.get('pet') || params.get('species');
      const rawCategory = params.get('categoria') || params.get('category');
      const rawNeed =
        params.get('necesidad') ||
        params.get('need') ||
        params.get('etapa') ||
        params.get('age') ||
        params.get('subfiltro');

      const normalizedMascot = normalizeMascotParam(rawMascot);
      const normalizedCategory = normalizeCategoryParam(rawCategory);
      const normalizedNeed = normalizeNeedParam(rawNeed);

      if (normalizedMascot) {
        this.activeMascot = normalizedMascot;
      }
      if (normalizedCategory) {
        this.activeCategory = normalizedCategory;
      }
      if (normalizedNeed) {
        this.activeNeed = normalizedNeed;
      }

      this.updateActiveButtonUI();
      this.bindEvents();

      // Apply initial filter if URL contained params
      if (this.activeMascot !== 'all' || this.activeCategory !== 'all' || this.activeNeed !== 'all') {
        this.applyFilter();
      }
    }

    bindEvents() {
      // Mascot switcher clicks
      this.mascotBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const mascotVal = btn.dataset.petMascot;
          const href = btn.getAttribute('href');

          // If it has an external/collection URL and not just '#' or current path, let browser navigate
          if (href && href !== '#' && href !== window.location.pathname && !href.startsWith('?')) {
            return;
          }

          e.preventDefault();
          this.activeMascot = mascotVal;
          this.updateActiveButtonUI();
          this.applyFilter();
          this.syncUrlParams();
        });
      });

      // Category pill clicks
      this.categoryPills.forEach((pill) => {
        pill.addEventListener('click', (e) => {
          const catVal = pill.dataset.petCategory;
          const href = pill.getAttribute('href');

          if (href && href !== '#' && href !== window.location.pathname && !href.startsWith('?')) {
            return;
          }

          e.preventDefault();
          // Toggle category off if clicking the active one
          if (this.activeCategory === catVal && catVal !== 'all') {
            this.activeCategory = 'all';
          } else {
            this.activeCategory = catVal;
          }

          this.updateActiveButtonUI();
          this.applyFilter();
          this.syncUrlParams();
        });
      });

      // Reset button click
      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.resetFilters();
        });
      }
    }

    updateActiveButtonUI() {
      this.mascotBtns.forEach((btn) => {
        const isMatch = btn.dataset.petMascot === this.activeMascot;
        btn.classList.toggle('is-active', isMatch);
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      this.categoryPills.forEach((pill) => {
        const isMatch = pill.dataset.petCategory === this.activeCategory;
        pill.classList.toggle('is-active', isMatch);
        pill.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });
    }

    applyFilter() {
      const productWrappers = document.querySelectorAll(
        '#product-grid .product-card-wrapper, #ProductGridContainer .product-card-wrapper, .collection .card-wrapper'
      );

      if (productWrappers.length === 0) return;

      let visibleCount = 0;

      productWrappers.forEach((wrapper) => {
        const tags = (wrapper.dataset.petTags || '').toLowerCase();
        const type = (wrapper.dataset.petType || '').toLowerCase();
        const title = (wrapper.dataset.petTitle || '').toLowerCase();
        const textToSearch = `${tags} ${type} ${title}`;

        // 1. Check Mascot match
        let mascotMatches = true;
        if (this.activeMascot === 'perro') {
          mascotMatches =
            textToSearch.includes('perro') ||
            textToSearch.includes('canino') ||
            textToSearch.includes('dog') ||
            textToSearch.includes('puppy') ||
            textToSearch.includes('cachorro') ||
            !textToSearch.includes('gato'); // Default to dog if not explicitly cat
        } else if (this.activeMascot === 'gato') {
          mascotMatches =
            textToSearch.includes('gato') ||
            textToSearch.includes('felino') ||
            textToSearch.includes('cat') ||
            textToSearch.includes('kitten');
        }

        // 2. Check Category match
        let categoryMatches = true;
        if (this.activeCategory === 'pienso') {
          categoryMatches =
            textToSearch.includes('pienso') ||
            textToSearch.includes('seco') ||
            textToSearch.includes('kibble') ||
            textToSearch.includes('croquetas') ||
            textToSearch.includes('alimento') ||
            type.includes('comida') ||
            type.includes('alimentacion');
        } else if (this.activeCategory === 'humeda') {
          categoryMatches =
            textToSearch.includes('humeda') ||
            textToSearch.includes('lata') ||
            textToSearch.includes('pouch') ||
            textToSearch.includes('wet') ||
            textToSearch.includes('paté') ||
            textToSearch.includes('pate');
        } else if (this.activeCategory === 'snacks') {
          categoryMatches =
            textToSearch.includes('snack') ||
            textToSearch.includes('premio') ||
            textToSearch.includes('treat') ||
            textToSearch.includes('hueso') ||
            textToSearch.includes('masticable') ||
            type.includes('snack');
        } else if (this.activeCategory === 'juguetes') {
          categoryMatches =
            textToSearch.includes('juguete') ||
            textToSearch.includes('pelota') ||
            textToSearch.includes('mordedor') ||
            textToSearch.includes('toy') ||
            textToSearch.includes('interactivo') ||
            type.includes('juguete');
        } else if (this.activeCategory === 'higiene') {
          categoryMatches =
            textToSearch.includes('champu') ||
            textToSearch.includes('champú') ||
            textToSearch.includes('shampoo') ||
            textToSearch.includes('higiene') ||
            textToSearch.includes('balsamo') ||
            textToSearch.includes('bálsamo') ||
            textToSearch.includes('dental') ||
            type.includes('higiene');
        } else if (this.activeCategory === 'suplementos') {
          categoryMatches =
            textToSearch.includes('aceite') ||
            textToSearch.includes('omega') ||
            textToSearch.includes('articulacion') ||
            textToSearch.includes('suplemento') ||
            textToSearch.includes('vitamin');
        } else if (this.activeCategory === 'accesorios') {
          categoryMatches =
            textToSearch.includes('correa') ||
            textToSearch.includes('collar') ||
            textToSearch.includes('arnes') ||
            textToSearch.includes('arnés') ||
            textToSearch.includes('cama') ||
            textToSearch.includes('transportin') ||
            type.includes('accesorio');
        }

        // 3. Check Need / Life Stage match
        let needMatches = true;
        if (this.activeNeed === 'cachorro') {
          needMatches =
            textToSearch.includes('cachorro') ||
            textToSearch.includes('puppy') ||
            textToSearch.includes('junior') ||
            textToSearch.includes('starter') ||
            textToSearch.includes('baby');
        } else if (this.activeNeed === 'gatito') {
          needMatches =
            textToSearch.includes('gatito') ||
            textToSearch.includes('kitten') ||
            textToSearch.includes('babycat') ||
            textToSearch.includes('junior');
        } else if (this.activeNeed === 'adulto') {
          needMatches = textToSearch.includes('adult') || textToSearch.includes('adulto');
        } else if (this.activeNeed === 'senior') {
          needMatches =
            textToSearch.includes('senior') ||
            textToSearch.includes('mayor') ||
            textToSearch.includes('+7') ||
            textToSearch.includes('mature');
        } else if (this.activeNeed === 'hipoalergenico') {
          needMatches =
            textToSearch.includes('hipoalergenico') ||
            textToSearch.includes('hypoallergenic') ||
            textToSearch.includes('sensible') ||
            textToSearch.includes('sensitive') ||
            textToSearch.includes('monoproteico') ||
            textToSearch.includes('grain free');
        } else if (this.activeNeed === 'esterilizado') {
          needMatches =
            textToSearch.includes('esterilizado') ||
            textToSearch.includes('sterilised') ||
            textToSearch.includes('sterilized') ||
            textToSearch.includes('castrado') ||
            textToSearch.includes('neutered');
        } else if (this.activeNeed === 'hairball') {
          needMatches =
            textToSearch.includes('hairball') ||
            textToSearch.includes('pelo') ||
            textToSearch.includes('malta') ||
            textToSearch.includes('bola');
        }

        const isVisible = mascotMatches && categoryMatches && needMatches;
        wrapper.classList.toggle('is-hidden-by-pet-filter', !isVisible);
        if (isVisible) visibleCount++;
      });

      // Update or render empty state in grid
      this.updateEmptyGridState(visibleCount);

      // Update status bar
      this.updateStatusText(visibleCount);
    }

    updateEmptyGridState(visibleCount) {
      const grid = document.querySelector('#product-grid') || document.querySelector('#ProductGridContainer');
      if (!grid) return;

      let emptyEl = grid.querySelector('.product-grid-empty-filter');

      if (visibleCount === 0) {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.className = 'product-grid-empty-filter';
          grid.appendChild(emptyEl);
        }
        emptyEl.innerHTML = `
          <h3>${this.i18n.empty_title || ''}</h3>
          <p>${this.i18n.empty_text || ''}</p>
          <button type="button" class="pet-catalog-btn-reset-inline button button--secondary">${this.i18n.empty_button || ''}</button>
        `;
        const inlineReset = emptyEl.querySelector('.pet-catalog-btn-reset-inline');
        if (inlineReset) {
          inlineReset.addEventListener('click', () => this.resetFilters());
        }
      } else if (emptyEl) {
        emptyEl.remove();
      }
    }

    updateStatusText(visibleCount) {
      if (!this.statusBar || !this.statusText) return;

      const isFiltered = this.activeMascot !== 'all' || this.activeCategory !== 'all';
      this.statusBar.hidden = !isFiltered;

      if (!isFiltered) return;

      let mascotLabel = '';
      if (this.activeMascot === 'perro') mascotLabel = this.i18n.status_dogs || '';
      else if (this.activeMascot === 'gato') mascotLabel = this.i18n.status_cats || '';
      else mascotLabel = this.i18n.status_all || '';

      let catLabel = '';
      if (this.activeCategory !== 'all') {
        const activePill = this.section.querySelector(`[data-pet-category="${this.activeCategory}"]`);
        if (activePill) {
          catLabel = ` · ${activePill.textContent.trim()}`;
        }
      }

      const template = (visibleCount === 1 ? this.i18n.status_one_html : this.i18n.status_other_html) || '';
      this.statusText.innerHTML = template
        .replace('__COUNT__', String(visibleCount))
        .replace('__PET__', mascotLabel)
        .replace('__CATEGORY__', catLabel);
    }

    resetFilters() {
      this.activeMascot = 'all';
      this.activeCategory = 'all';
      this.activeNeed = 'all';
      this.updateActiveButtonUI();
      this.applyFilter();
      this.syncUrlParams();
    }

    syncUrlParams() {
      const url = new URL(window.location.href);
      const isEn = this.isEnglish();
      const langKey = isEn ? 'en' : 'es';

      // Clean up all language variants to avoid param mixing
      url.searchParams.delete('mascota');
      url.searchParams.delete('categoria');
      url.searchParams.delete('pet');
      url.searchParams.delete('species');
      url.searchParams.delete('category');
      url.searchParams.delete('necesidad');
      url.searchParams.delete('need');
      url.searchParams.delete('etapa');
      url.searchParams.delete('age');
      url.searchParams.delete('subfiltro');

      const mascotParamName = isEn ? 'pet' : 'mascota';
      const categoryParamName = isEn ? 'category' : 'categoria';

      if (this.activeMascot !== 'all') {
        const mascotValue = MASCOT_URL_MAP[langKey][this.activeMascot] || this.activeMascot;
        url.searchParams.set(mascotParamName, mascotValue);
      }

      if (this.activeCategory !== 'all') {
        const categoryValue = CATEGORY_URL_MAP[langKey][this.activeCategory] || this.activeCategory;
        url.searchParams.set(categoryParamName, categoryValue);
      }

      window.history.replaceState({}, '', url.toString());
    }
  }

  function initPetCatalogBars() {
    document.querySelectorAll('[data-pet-catalog-bar]').forEach((section) => {
      if (!section.__petCatalogBar) {
        section.__petCatalogBar = new PetCatalogBar(section);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPetCatalogBars);
  } else {
    initPetCatalogBars();
  }
})();

