/* ==========================================================================
   Skin & Beauty — collection & search filtering (Shopify storefront filters)
   Uses the Section Rendering API so filtering never reloads the page.
   ========================================================================== */
(() => {
  'use strict';

  const theme = window.theme || {};
  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const cache = new Map();

  class FacetFilters extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.sectionId = this.dataset.section;
      this.form = qs('form', this);
      if (!this.form) return;
      this.root = this.closest('[data-facets-root]') || document;

      let priceTimer;
      this.form.addEventListener('change', (event) => {
        if (event.target.matches('[data-price-input]')) return;
        this.submit();
      });
      this.form.addEventListener('input', (event) => {
        if (!event.target.matches('[data-price-input]')) return;
        clearTimeout(priceTimer);
        priceTimer = setTimeout(() => this.submit(), 650);
      });
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.submit();
      });

      qsa(`[form="${this.form.id}"]`).forEach((field) => {
        field.addEventListener('change', () => this.submit());
      });

      this.root.addEventListener('click', (event) => {
        const link = event.target.closest('[data-facet-link]');
        if (!link) return;
        event.preventDefault();
        const url = new URL(link.href, window.location.origin);
        url.searchParams.delete('section_id');
        const isPagination = Boolean(link.closest('.pagination'));
        this.render(url.searchParams.toString()).then(() => {
          if (!isPagination) return;
          const grid = document.getElementById('ProductGridContainer');
          if (grid) {
            const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 0;
            const top = grid.getBoundingClientRect().top + window.scrollY - offset - 24;
            window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
          }
        });
      });

      window.addEventListener('popstate', (event) => {
        const params = event.state && typeof event.state.facets === 'string' ? event.state.facets : window.location.search.slice(1);
        this.render(params, false);
      });
    }

    params() {
      const formData = new FormData(this.form);
      const params = new URLSearchParams();
      formData.forEach((value, key) => {
        if (value !== '') params.append(key, value);
      });
      return params.toString();
    }

    submit() {
      this.render(this.params());
    }

    async render(params, pushState = true) {
      const grid = document.getElementById('ProductGridContainer');
      if (grid) grid.classList.add('is-loading');
      const activeId = document.activeElement ? document.activeElement.id : null;
      const url = `${window.location.pathname}?section_id=${this.sectionId}${params ? `&${params}` : ''}`;

      try {
        let html = cache.get(url);
        if (!html) {
          const response = await fetch(url);
          html = await response.text();
          cache.set(url, html);
        }
        const doc = new DOMParser().parseFromString(html, 'text/html');

        qsa('[data-facets-render]', doc).forEach((fresh) => {
          const key = fresh.dataset.facetsRender;
          qsa(`[data-facets-render="${key}"]`).forEach((current) => {
            if (current.contains(document.activeElement) && document.activeElement.matches('[data-price-input]')) return;
            current.innerHTML = fresh.innerHTML;
          });
        });

        if (pushState) {
          const next = `${window.location.pathname}${params ? `?${params}` : ''}`;
          window.history.pushState({ facets: params }, '', next);
        }

        if (activeId) {
          const el = document.getElementById(activeId);
          if (el) el.focus({ preventScroll: true });
        }
        if (theme.initReveal && grid) theme.initReveal(grid);
      } catch (error) {
        window.location.href = `${window.location.pathname}${params ? `?${params}` : ''}`;
      } finally {
        if (grid) grid.classList.remove('is-loading');
      }
    }
  }
  customElements.define('facet-filters', FacetFilters);
})();
