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
  // Types, tags and collections of the shop: snippet pet-taxonomy, printed by the section (CODE-08).
  let taxonomy = {};
  try {
    taxonomy = JSON.parse(document.querySelector('[data-pet-taxonomy]')?.textContent || '{}');
  } catch (error) {
    taxonomy = {};
  }
  // Old URL words (Spanish and English) → pet-taxonomy keys.
  const PET_COLLECTIONS = { perro: 'collection_dogs', dog: 'collection_dogs', gato: 'collection_cats', cat: 'collection_cats' };
  const PRODUCT_TYPES = {
    pienso: 'type_kibble',
    'dry-food': 'type_kibble',
    kibble: 'type_kibble',
    humeda: 'type_wet',
    'wet-food': 'type_wet',
    snacks: 'type_snacks',
    juguetes: 'type_toys',
    toys: 'type_toys',
    higiene: 'type_grooming',
    hygiene: 'type_grooming',
    grooming: 'type_grooming',
    suplementos: 'type_supplements',
    supplements: 'type_supplements',
    accesorios: 'type_accessories',
    accessories: 'type_accessories',
  };
  const NEED_TAGS = {
    puppy: 'tag_puppy',
    kitten: 'tag_kitten',
    adult: 'tag_adult',
    sensitive: 'tag_sensitive',
    hipoalergenico: 'tag_sensitive',
    sterilised: 'tag_sterilised',
    hairball: 'tag_hairball',
  };

  function redirectLegacyUrl() {
    const params = new URLSearchParams(window.location.search);
    const pet = (params.get('mascota') || params.get('pet') || '').toLowerCase();
    const category = (params.get('categoria') || params.get('category') || '').toLowerCase();
    const need = (params.get('necesidad') || params.get('need') || params.get('subfiltro') || '').toLowerCase();
    if (!pet && !category && !need) return false;

    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    const handle = taxonomy[PET_COLLECTIONS[pet]];
    const path = handle ? `${root}collections/${handle}` : window.location.pathname;

    ['mascota', 'pet', 'species', 'categoria', 'category', 'necesidad', 'need', 'subfiltro', 'etapa', 'age'].forEach(
      (key) => params.delete(key),
    );
    const type = taxonomy[PRODUCT_TYPES[category]];
    if (type) params.append('filter.p.product_type', type);
    if (need) params.append('filter.p.tag', taxonomy[NEED_TAGS[need]] || need);

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
    // The need tag filter is not in collection.filters on translated pages: open the stage / need
    // list, name the active one in its summary and show "Clear filters".
    const activeChip = root.querySelector('[data-pet-need].is-active');
    const needs = root.querySelector('[data-pet-needs-toggle]');
    if (needs && activeChip) needs.open = true;
    const activeLabel = root.querySelector('[data-pet-needs-active]');
    if (activeLabel) activeLabel.textContent = activeChip ? `· ${activeChip.textContent.trim()}` : '';
    const reset = root.querySelector('[data-pet-reset]');
    if (reset && activeTags.length) reset.hidden = false;
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
