/**
 * Pet catalog bar (sections/pet-catalog-bar.liquid).
 *
 * Shopify filters the products on the server, so this file only:
 * 1. Redirects old links (?mascota=perro&categoria=pienso&necesidad=cachorro, or the English
 *    ?pet=dog&category=dry-food&need=puppy) to the collection + Search & Discovery filter URLs.
 * 2. Points the need chips (tags) at the current URL and marks the active one.
 * 3. Keeps the bar in sync with Dawn's AJAX filters (facets.js): category pills use
 *    FacetFiltersForm.renderPage instead of a full reload, and the bar is re-rendered
 *    with the Section Rendering API whenever the grid is.
 */
(() => {
  const PET_COLLECTIONS = { perro: 'perros', dog: 'perros', gato: 'gatos', cat: 'gatos' };
  const PRODUCT_TYPES = {
    pienso: 'Pienso',
    'dry-food': 'Pienso',
    kibble: 'Pienso',
    humeda: 'Comida húmeda',
    'wet-food': 'Comida húmeda',
    snacks: 'Snack',
    juguetes: 'Juguete',
    toys: 'Juguete',
    higiene: 'Higiene',
    hygiene: 'Higiene',
    grooming: 'Higiene',
    suplementos: 'Suplemento',
    supplements: 'Suplemento',
    accesorios: 'Accesorio',
    accessories: 'Accesorio',
  };
  const NEED_TAGS = {
    puppy: 'cachorro',
    kitten: 'gatito',
    adult: 'adulto',
    sensitive: 'sensible',
    hipoalergenico: 'sensible',
    sterilised: 'esterilizado',
    hairball: 'bolas de pelo',
  };

  function redirectLegacyUrl() {
    const params = new URLSearchParams(window.location.search);
    const pet = (params.get('mascota') || params.get('pet') || '').toLowerCase();
    const category = (params.get('categoria') || params.get('category') || '').toLowerCase();
    const need = (params.get('necesidad') || params.get('need') || params.get('subfiltro') || '').toLowerCase();
    if (!pet && !category && !need) return false;

    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    const handle = PET_COLLECTIONS[pet];
    const path = handle ? `${root}collections/${handle}` : window.location.pathname;

    ['mascota', 'pet', 'species', 'categoria', 'category', 'necesidad', 'need', 'subfiltro', 'etapa', 'age'].forEach(
      (key) => params.delete(key),
    );
    if (category && PRODUCT_TYPES[category]) params.append('filter.p.product_type', PRODUCT_TYPES[category]);
    if (need) params.append('filter.p.tag', NEED_TAGS[need] || need);

    const query = params.toString();
    window.location.replace(`${path}${query ? `?${query}` : ''}`);
    return true;
  }

  if (redirectLegacyUrl()) return;

  const hasFacets = () => typeof FacetFiltersForm !== 'undefined';

  // Need chips: one need at a time, kept together with the other filters of the current URL.
  function updateNeedChips(root = document) {
    const current = new URL(window.location.href);
    const activeTags = current.searchParams.getAll('filter.p.tag');
    root.querySelectorAll('[data-pet-need]').forEach((chip) => {
      const tag = chip.dataset.petNeed;
      const isActive = activeTags.includes(tag);
      const url = new URL(current);
      url.searchParams.delete('filter.p.tag');
      url.searchParams.delete('page');
      if (!isActive) url.searchParams.append('filter.p.tag', tag);
      chip.href = `${url.pathname}${url.search}`;
      chip.classList.toggle('is-active', isActive);
      if (isActive) chip.setAttribute('aria-current', 'true');
      else chip.removeAttribute('aria-current');
    });
  }

  function refreshBars(searchParams) {
    document.querySelectorAll('[data-pet-catalog-bar]').forEach((bar) => {
      const sectionId = bar.dataset.sectionId;
      if (!sectionId) return;
      fetch(`${window.location.pathname}?section_id=${encodeURIComponent(sectionId)}&${searchParams}`)
        .then((response) => response.text())
        .then((html) => {
          const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-pet-catalog-bar]');
          const current = document.getElementById(bar.id);
          if (fresh && current) {
            current.replaceWith(fresh);
            updateNeedChips(fresh);
          }
        })
        .catch(() => {});
    });
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-pet-catalog-bar] [data-pet-filter-link]');
    if (!link || !hasFacets() || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    const url = new URL(link.href, window.location.origin);
    if (url.pathname !== window.location.pathname) return;
    event.preventDefault();
    url.searchParams.delete('page');
    FacetFiltersForm.renderPage(url.searchParams.toString());
  });

  document.addEventListener('DOMContentLoaded', () => {
    updateNeedChips();
    if (!hasFacets() || FacetFiltersForm.petCatalogBarPatched) return;
    const originalRenderPage = FacetFiltersForm.renderPage;
    FacetFiltersForm.renderPage = function (searchParams, ...rest) {
      const result = originalRenderPage.call(this, searchParams, ...rest);
      refreshBars(searchParams);
      return result;
    };
    FacetFiltersForm.petCatalogBarPatched = true;
  });
})();
