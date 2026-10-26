/* ==========================================================================
   Skin & Beauty — core theme scripts
   Vanilla JS, no dependencies. Progressive enhancement: every form still
   works without JavaScript; these modules make it faster and smoother.
   ========================================================================== */
(() => {
  'use strict';

  const theme = window.theme || (window.theme = {});
  theme.routes = theme.routes || {};
  theme.strings = theme.strings || {};

  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const debounce = (fn, wait = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };
  const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  const toast = (message) => {
    const el = document.getElementById('ThemeToast');
    if (!el || !message) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-visible'), 3400);
  };
  theme.toast = toast;

  /* ------------------------------------------------------------------
     Focus trap + scroll lock
     ------------------------------------------------------------------ */
  const FOCUSABLE =
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary, iframe';
  let releaseTrap = null;

  const trapFocus = (container, elementToFocus) => {
    if (releaseTrap) releaseTrap();
    const focusables = () => qsa(FOCUSABLE, container).filter((el) => el.offsetWidth || el.offsetHeight || el === document.activeElement);
    const onKeydown = (event) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeydown);
    releaseTrap = () => {
      document.removeEventListener('keydown', onKeydown);
      releaseTrap = null;
    };
    const target = elementToFocus || container;
    window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
  };

  const removeTrapFocus = (elementToFocus) => {
    if (releaseTrap) releaseTrap();
    if (elementToFocus && typeof elementToFocus.focus === 'function') elementToFocus.focus({ preventScroll: true });
  };

  let scrollLocks = 0;
  const lockScroll = () => {
    if (scrollLocks++ === 0) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbar}px`);
      document.documentElement.classList.add('scroll-locked');
    }
  };
  const unlockScroll = () => {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) document.documentElement.classList.remove('scroll-locked');
  };

  theme.trapFocus = trapFocus;
  theme.removeTrapFocus = removeTrapFocus;
  theme.lockScroll = lockScroll;
  theme.unlockScroll = unlockScroll;
  theme.debounce = debounce;

  /* ------------------------------------------------------------------
     Side drawer (menu, search, cart, filters)
     ------------------------------------------------------------------ */
  class SideDrawer extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-drawer-close]')) {
          event.preventDefault();
          this.close();
        }
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isOpen) {
          event.stopPropagation();
          this.close();
        }
      });
    }

    get panel() {
      return qs('.drawer__panel', this) || this;
    }

    get isOpen() {
      return this.classList.contains('is-open');
    }

    open(opener) {
      if (this.isOpen) return;
      this.opener = opener || document.activeElement;
      this.classList.add('is-open');
      this.setAttribute('aria-hidden', 'false');
      if (this.opener && this.opener.hasAttribute && this.opener.hasAttribute('aria-expanded')) this.opener.setAttribute('aria-expanded', 'true');
      lockScroll();
      trapFocus(this.panel, qs('[data-drawer-autofocus]', this) || this.panel);
      this.dispatchEvent(new CustomEvent('drawer:open', { bubbles: true }));
    }

    close() {
      if (!this.isOpen) return;
      this.classList.remove('is-open');
      this.setAttribute('aria-hidden', 'true');
      if (this.opener && this.opener.hasAttribute && this.opener.hasAttribute('aria-expanded')) this.opener.setAttribute('aria-expanded', 'false');
      unlockScroll();
      removeTrapFocus(this.opener);
      this.dispatchEvent(new CustomEvent('drawer:close', { bubbles: true }));
    }
  }
  customElements.define('side-drawer', SideDrawer);

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-drawer-open]');
    if (!opener) return;
    const drawer = document.getElementById(opener.dataset.drawerOpen);
    if (!drawer || typeof drawer.open !== 'function') return;
    event.preventDefault();
    qsa('side-drawer.is-open').forEach((open) => open !== drawer && open.close());
    drawer.open(opener);
  });

  /* ------------------------------------------------------------------
     Cart API + Section Rendering
     ------------------------------------------------------------------ */
  const Cart = {
    sectionIds() {
      const ids = new Set(['cart-icon-bubble']);
      if (document.getElementById('CartDrawer')) ids.add('cart-drawer');
      qsa('[data-cart-section]').forEach((el) => ids.add(el.dataset.cartSection));
      return Array.from(ids);
    },

    render(sections) {
      if (!sections) return;
      const active = document.activeElement;
      const focusKey = active && active.dataset ? active.dataset.focusKey : null;

      Object.values(sections).forEach((html) => {
        if (!html) return;
        const doc = parseHTML(html);
        qsa('[data-cart-render]', doc).forEach((fresh) => {
          const key = fresh.dataset.cartRender;
          qsa(`[data-cart-render="${key}"]`).forEach((current) => {
            current.innerHTML = fresh.innerHTML;
            Array.from(fresh.attributes).forEach((attr) => {
              if (attr.name === 'class' || attr.name === 'style') current.setAttribute(attr.name, attr.value);
            });
          });
        });
      });

      if (focusKey) {
        const next = qs(`[data-focus-key="${focusKey}"]`);
        if (next) next.focus({ preventScroll: true });
        else {
          const drawer = document.getElementById('CartDrawer');
          if (drawer && drawer.isOpen) drawer.panel.focus({ preventScroll: true });
        }
      }

      qsa('.cart-count').forEach((count) => {
        count.classList.remove('is-bumped');
        void count.offsetWidth;
        count.classList.add('is-bumped');
      });
    },

    async request(url, body) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || data.status) throw data;
      return data;
    },

    async addItems(items) {
      const data = await this.request(`${theme.routes.cartAdd}.js`, {
        items,
        sections: this.sectionIds(),
        sections_url: window.location.pathname,
      });
      this.render(data.sections);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { source: 'add', data } }));
      return data;
    },

    async addForm(formData) {
      formData.append('sections', this.sectionIds().join(','));
      formData.append('sections_url', window.location.pathname);
      const response = await fetch(`${theme.routes.cartAdd}.js`, {
        method: 'POST',
        headers: { Accept: 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.status) throw data;
      this.render(data.sections);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { source: 'add', data } }));
      return data;
    },

    async change(key, quantity) {
      const data = await this.request(`${theme.routes.cartChange}.js`, {
        id: key,
        quantity,
        sections: this.sectionIds(),
        sections_url: window.location.pathname,
      });
      this.render(data.sections);
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { source: 'change', data } }));
      return data;
    },

    async refresh() {
      const response = await fetch(`${window.location.pathname}?sections=${this.sectionIds().join(',')}`);
      this.render(await response.json());
    },

    openDrawer(opener) {
      const drawer = document.getElementById('CartDrawer');
      if (drawer && typeof drawer.open === 'function') {
        drawer.open(opener);
        return true;
      }
      return false;
    },
  };
  theme.cart = Cart;

  const cartErrorMessage = (error) => (error && (error.description || error.message)) || theme.strings.cartError;

  const afterAdd = (opener) => {
    if (Cart.openDrawer(opener)) return;
    if (qs('[data-cart-section]')) {
      toast(theme.strings.added);
      return;
    }
    window.location.href = theme.routes.cart;
  };

  /* ------------------------------------------------------------------
     Product form (product page, quick add, spotlight, sticky bar)
     ------------------------------------------------------------------ */
  class ProductForm extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.form = qs('form', this);
      if (!this.form) return;
      this.errorEl = qs('[data-form-error]', this);
      this.form.addEventListener('submit', (event) => this.onSubmit(event));
    }

    async onSubmit(event) {
      const canAjax = document.getElementById('CartDrawer') || qs('[data-cart-section]') || theme.cartType === 'drawer';
      if (!canAjax) return;
      event.preventDefault();

      const submitter = event.submitter || qs('[type="submit"]', this.form);
      if (submitter && submitter.getAttribute('aria-disabled') === 'true') return;

      const formData = new FormData(this.form);
      if (submitter && submitter.name && submitter.value) formData.set(submitter.name, submitter.value);
      if (!formData.get('id')) return;

      this.setError();
      this.setLoading(true, submitter);
      try {
        await Cart.addForm(formData);
        const details = this.closest('details');
        if (details) details.removeAttribute('open');
        afterAdd(submitter);
      } catch (error) {
        const message = cartErrorMessage(error);
        if (this.errorEl) this.setError(message);
        else toast(message);
      } finally {
        this.setLoading(false, submitter);
      }
    }

    setLoading(loading, submitter) {
      const buttons = qsa('[type="submit"]', this.form);
      if (submitter && !buttons.includes(submitter)) buttons.push(submitter);
      buttons.forEach((button) => {
        if (loading) {
          button.setAttribute('aria-disabled', 'true');
        } else {
          button.removeAttribute('aria-disabled');
        }
      });
      if (submitter) submitter.classList.toggle('is-loading', loading);
    }

    setError(message) {
      if (!this.errorEl) return;
      this.errorEl.hidden = !message;
      const text = qs('[data-form-error-text]', this.errorEl);
      if (text) text.textContent = message || '';
    }
  }
  customElements.define('product-form', ProductForm);

  /* Buttons that add one or several known variants (ritual, mini recs) */
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-add-variants]');
    if (!button) return;
    event.preventDefault();
    const ids = button.dataset.addVariants.split(',').map((id) => Number(id)).filter(Boolean);
    if (!ids.length) return;
    button.classList.add('is-loading');
    button.setAttribute('aria-disabled', 'true');
    try {
      await Cart.addItems(ids.map((id) => ({ id, quantity: 1 })));
      afterAdd(button);
    } catch (error) {
      toast(cartErrorMessage(error));
    } finally {
      button.classList.remove('is-loading');
      button.removeAttribute('aria-disabled');
    }
  });

  /* Close quick add panels on outside click / Escape */
  document.addEventListener('click', (event) => {
    qsa('details.quick-add[open]').forEach((details) => {
      if (!details.contains(event.target)) details.removeAttribute('open');
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    qsa('details.quick-add[open]').forEach((details) => {
      details.removeAttribute('open');
      const summary = qs('summary', details);
      if (summary) summary.focus();
    });
  });

  /* ------------------------------------------------------------------
     Quantity input
     ------------------------------------------------------------------ */
  class QuantityInput extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.input = qs('input', this);
      if (!this.input) return;
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-quantity]');
        if (!button) return;
        event.preventDefault();
        const step = Number(this.input.step) || 1;
        const min = Number(this.input.min) || 0;
        const max = this.input.max ? Number(this.input.max) : Infinity;
        const current = Number(this.input.value) || min;
        let next = button.dataset.quantity === 'plus' ? current + step : current - step;
        next = Math.min(Math.max(next, min), max);
        if (next === current) return;
        this.input.value = next;
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
        this.updateButtons();
      });
      this.input.addEventListener('change', () => this.updateButtons());
      this.updateButtons();
    }

    updateButtons() {
      const value = Number(this.input.value);
      const min = Number(this.input.min) || 0;
      const max = this.input.max ? Number(this.input.max) : Infinity;
      const minus = qs('[data-quantity="minus"]', this);
      const plus = qs('[data-quantity="plus"]', this);
      if (minus) minus.disabled = value <= min && !this.hasAttribute('data-allow-zero');
      if (plus) plus.disabled = value >= max;
    }
  }
  customElements.define('quantity-input', QuantityInput);

  /* ------------------------------------------------------------------
     Cart line items (drawer + cart page)
     ------------------------------------------------------------------ */
  class CartItems extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.pending = new Map();
      this.addEventListener('change', (event) => {
        const input = event.target.closest('[data-line-quantity]');
        if (!input) return;
        const key = input.dataset.key;
        clearTimeout(this.pending.get(key));
        this.pending.set(
          key,
          setTimeout(() => this.update(key, Number(input.value), input), 380)
        );
      });
      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-line-remove]');
        if (!remove) return;
        event.preventDefault();
        this.update(remove.dataset.key, 0, remove);
      });
    }

    async update(key, quantity, element) {
      const line = element.closest('[data-line-item]');
      if (line) line.classList.add('is-loading');
      try {
        await Cart.change(key, quantity);
      } catch (error) {
        toast(cartErrorMessage(error));
        if (line) line.classList.remove('is-loading');
        Cart.refresh().catch(() => {});
      }
    }
  }
  customElements.define('cart-items', CartItems);

  /* Cart note (cart page) */
  document.addEventListener(
    'input',
    debounce((event) => {
      const note = event.target.closest('[data-cart-note]');
      if (!note) return;
      fetch(`${theme.routes.cartUpdate}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ note: note.value }),
      });
    }, 500)
  );

  /* ------------------------------------------------------------------
     Variant picker
     ------------------------------------------------------------------ */
  class VariantPicker extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const data = qs('script[data-variants]', this);
      this.variants = data ? JSON.parse(data.textContent) : [];
      this.sectionId = this.dataset.section;
      this.scope = this.closest('[data-product-scope]') || document;
      this.addEventListener('change', () => this.onChange());
      this.updateAvailability();
    }

    selectedOptions() {
      return qsa('[data-option-position]', this).map((group) => {
        const select = qs('select', group);
        if (select) return select.value;
        const checked = qs('input:checked', group);
        return checked ? checked.value : null;
      });
    }

    onChange() {
      const options = this.selectedOptions();
      const variant = this.variants.find((item) => item.options.every((value, index) => value === options[index]));
      this.updateLabels();
      this.updateAvailability();
      this.applyVariant(variant);
      document.dispatchEvent(new CustomEvent('variant:change', { detail: { sectionId: this.sectionId, variant } }));
    }

    updateLabels() {
      qsa('[data-option-position]', this).forEach((group) => {
        const label = qs('[data-selected-value]', group);
        if (!label) return;
        const select = qs('select', group);
        const checked = qs('input:checked', group);
        label.textContent = select ? select.value : checked ? checked.value : '';
      });
    }

    updateAvailability() {
      const selected = this.selectedOptions();
      qsa('[data-option-position]', this).forEach((group) => {
        const position = Number(group.dataset.optionPosition);
        qsa('input, option', group).forEach((input) => {
          const value = input.value;
          const available = this.variants.some(
            (variant) =>
              variant.available &&
              variant.options[position] === value &&
              variant.options.every((optionValue, index) => index === position || index > position || optionValue === selected[index])
          );
          if (input.tagName === 'OPTION') {
            input.textContent = available ? value : `${value} — ${theme.strings.unavailable}`;
          } else {
            const label = input.nextElementSibling;
            if (label) label.classList.toggle('is-unavailable', !available);
          }
        });
      });
    }

    applyVariant(variant) {
      const scope = this.scope;
      qsa(`[data-variant-input="${this.sectionId}"]`).forEach((input) => {
        input.value = variant ? variant.id : '';
      });

      const template = variant ? qs(`template[data-variant-template="${variant.id}"]`, scope) : null;
      if (template) {
        qsa('[data-variant-slot]', scope).forEach((slot) => {
          const fresh = qs(`[data-slot="${slot.dataset.variantSlot}"]`, template.content);
          if (fresh) slot.innerHTML = fresh.innerHTML;
        });
      }

      qsa(`[data-atc="${this.sectionId}"]`).forEach((button) => {
        const label = qs('[data-atc-label]', button);
        let text = theme.strings.addToCart;
        let disabled = false;
        if (!variant) {
          text = theme.strings.unavailable;
          disabled = true;
        } else if (!variant.available) {
          text = theme.strings.soldOut;
          disabled = true;
        }
        button.disabled = disabled;
        if (label) label.textContent = text;
      });

      qsa('.product-form__dynamic', scope).forEach((wrapper) => {
        wrapper.hidden = !variant || !variant.available;
      });

      if (variant && this.dataset.updateUrl === 'true') {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({ path: url.toString() }, '', url.toString());
      }

      if (variant && variant.featured_media) {
        document.dispatchEvent(
          new CustomEvent('gallery:select', { detail: { sectionId: this.sectionId, mediaId: variant.featured_media.id } })
        );
      }
    }
  }
  customElements.define('variant-picker', VariantPicker);

  /* ------------------------------------------------------------------
     Header: sticky behaviour + dropdowns
     ------------------------------------------------------------------ */
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.wrapper = this.closest('.header-section');
      this.mode = this.dataset.sticky || 'always';
      this.lastY = window.scrollY;
      this.ticking = false;

      if (this.wrapper && this.mode !== 'none') this.wrapper.classList.add('header-section--sticky');

      window.addEventListener('scroll', () => {
        if (this.ticking) return;
        this.ticking = true;
        window.requestAnimationFrame(() => {
          this.onScroll();
          this.ticking = false;
        });
      }, { passive: true });

      this.fitNav();
      this.setHeight();
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => {
          this.fitNav();
          this.setHeight();
        }).observe(this);
      }

      this.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-submenu-toggle]');
        if (!toggle) return;
        event.preventDefault();
        const item = toggle.closest('.menu__item');
        const willOpen = !item.classList.contains('is-open');
        this.closeMenus();
        if (willOpen) {
          item.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      this.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const open = qs('.menu__item.is-open', this);
        if (!open) return;
        this.closeMenus();
        const toggle = qs('[data-submenu-toggle]', open);
        if (toggle) toggle.focus();
      });

      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.closeMenus();
      });

      document.addEventListener('click', (event) => {
        if (!this.contains(event.target)) this.closeMenus();
      });

      qsa('.menu__item.has-dropdown', this).forEach((item) => {
        item.addEventListener('mouseleave', () => {
          if (item.classList.contains('is-open')) {
            item.classList.remove('is-open');
            const toggle = qs('[data-submenu-toggle]', item);
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    closeMenus() {
      qsa('.menu__item.is-open', this).forEach((item) => {
        item.classList.remove('is-open');
        const toggle = qs('[data-submenu-toggle]', item);
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Centred logo: when the menu is too wide to sit beside it, the menu moves to its own row below
    fitNav() {
      if (this.classList.contains('header--logo-left')) return;
      const inner = qs('.header__inner', this);
      const logo = qs('.header__logo', this);
      const menu = qs('.header__nav .menu', this);
      if (!inner || !logo || !menu) return;
      const desktop = window.matchMedia('(min-width: 990px)').matches;
      const items = Array.from(menu.children);
      const menuGap = parseFloat(getComputedStyle(menu).columnGap) || 0;
      const needed = items.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0) + menuGap * Math.max(items.length - 1, 0);
      const room = (inner.clientWidth - logo.offsetWidth) / 2 - (parseFloat(getComputedStyle(inner).columnGap) || 0);
      this.classList.toggle('header--stacked', desktop && needed > room);
    }

    setHeight() {
      document.documentElement.style.setProperty('--header-height', `${this.offsetHeight}px`);
    }

    onScroll() {
      const y = window.scrollY;
      this.classList.toggle('is-scrolled', y > 4);
      if (this.wrapper && this.mode === 'scroll-up') {
        const hide = y > this.lastY && y > this.offsetHeight * 2 && !qs('.menu__item.is-open', this);
        this.wrapper.classList.toggle('is-hidden', hide);
      }
      this.lastY = y;
    }
  }
  customElements.define('site-header', SiteHeader);

  /* ------------------------------------------------------------------
     Announcement bar rotation
     ------------------------------------------------------------------ */
  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.slides = qsa('[data-announcement]', this);
      if (this.slides.length < 2) return;
      this.index = Math.max(0, this.slides.findIndex((slide) => slide.classList.contains('is-active')));
      this.delay = Number(this.dataset.speed || 5) * 1000;

      this.addEventListener('click', (event) => {
        const nav = event.target.closest('[data-announcement-nav]');
        if (!nav) return;
        this.show(this.index + (nav.dataset.announcementNav === 'next' ? 1 : -1));
        this.restart();
      });
      ['mouseenter', 'focusin'].forEach((type) => this.addEventListener(type, () => this.stop()));
      ['mouseleave', 'focusout'].forEach((type) => this.addEventListener(type, () => this.start()));
      this.start();
    }

    show(index) {
      const count = this.slides.length;
      this.slides[this.index].classList.remove('is-active');
      this.slides[this.index].setAttribute('aria-hidden', 'true');
      this.index = (index + count) % count;
      this.slides[this.index].classList.add('is-active');
      this.slides[this.index].setAttribute('aria-hidden', 'false');
    }

    start() {
      if (this.dataset.autoplay !== 'true' || reducedMotion() || theme.designMode) return;
      this.stop();
      this.timer = setInterval(() => this.show(this.index + 1), this.delay);
    }

    stop() {
      clearInterval(this.timer);
    }

    restart() {
      this.stop();
      this.start();
    }
  }
  customElements.define('announcement-bar', AnnouncementBar);

  /* ------------------------------------------------------------------
     Predictive search
     ------------------------------------------------------------------ */
  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.input = qs('input[type="search"]', this);
      this.results = qs('[data-predictive-results]', this);
      this.status = qs('[data-predictive-status]', this);
      this.defaultContent = qs('[data-predictive-default]', this);
      this.cache = new Map();
      if (!this.input || !this.results || this.dataset.enabled !== 'true') return;
      this.input.addEventListener('input', debounce(() => this.onInput(), 260));
      this.input.addEventListener('keydown', (event) => this.onKeydown(event));
      this.results.addEventListener('keydown', (event) => this.onKeydown(event));
    }

    async onInput() {
      const query = this.input.value.trim();
      if (!query.length) {
        this.reset();
        return;
      }
      if (this.cache.has(query)) {
        this.render(this.cache.get(query));
        return;
      }
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      this.setAttribute('loading', '');
      try {
        const url = `${theme.routes.predictiveSearch}?q=${encodeURIComponent(query)}&section_id=predictive-search&resources[type]=product,collection,article,page,query&resources[limit]=8&resources[limit_scope]=each`;
        const response = await fetch(url, { signal: this.controller.signal });
        if (!response.ok) throw new Error(String(response.status));
        const doc = parseHTML(await response.text());
        const markup = qs('#shopify-section-predictive-search', doc);
        const html = markup ? markup.innerHTML : '';
        this.cache.set(query, html);
        this.render(html);
      } catch (error) {
        if (error.name !== 'AbortError') this.reset();
      } finally {
        this.removeAttribute('loading');
      }
    }

    render(html) {
      this.results.innerHTML = html;
      this.results.hidden = false;
      if (this.defaultContent) this.defaultContent.hidden = true;
      const count = qs('[data-predictive-count]', this.results);
      if (this.status) this.status.textContent = count ? count.textContent.trim() : '';
    }

    reset() {
      this.results.innerHTML = '';
      this.results.hidden = true;
      if (this.defaultContent) this.defaultContent.hidden = false;
      if (this.status) this.status.textContent = '';
    }

    // Arrow keys move focus between the results; Up from the first result returns to the search field
    onKeydown(event) {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      const links = qsa('[data-predictive-link]', this.results);
      if (!links.length || this.results.hidden) return;
      event.preventDefault();
      const index = links.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') {
        links[Math.min(index + 1, links.length - 1)].focus();
      } else if (index <= 0) {
        this.input.focus();
      } else {
        links[index - 1].focus();
      }
    }
  }
  customElements.define('predictive-search', PredictiveSearch);

  /* ------------------------------------------------------------------
     Product recommendations (lazy, Section Rendering API)
     ------------------------------------------------------------------ */
  const recommendationCache = new Map();

  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (this._started) return;
      this._started = true;

      const drawer = this.closest('side-drawer');
      if (drawer) {
        if (drawer.classList.contains('is-open')) this.load();
        else drawer.addEventListener('drawer:open', () => this.load(), { once: true });
        return;
      }

      const wrapper = this.closest('[data-recommendations-wrapper]');
      if (this.dataset.load === 'eager' || (wrapper && wrapper.hidden) || !('IntersectionObserver' in window)) {
        this.load();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          this.load();
        },
        { rootMargin: '0px 0px 500px 0px' }
      );
      observer.observe(this);
    }

    async load() {
      if (this._loading) return;
      this._loading = true;
      const intents = (this.dataset.intents || 'related').split(',');
      for (const intent of intents) {
        const url = `${theme.routes.productRecommendations}?section_id=${this.dataset.sectionId}&product_id=${this.dataset.productId}&limit=${this.dataset.limit || 4}&intent=${intent.trim()}`;
        try {
          let html = recommendationCache.get(url);
          if (html === undefined) {
            const response = await fetch(url);
            const doc = parseHTML(await response.text());
            const found = qs('product-recommendations', doc);
            html = found && qs('[data-recommendation-item]', found) ? found.innerHTML : '';
            recommendationCache.set(url, html);
          }
          if (html) {
            this.innerHTML = html;
            this.classList.add('is-loaded');
            const wrapper = this.closest('[data-recommendations-wrapper]');
            if (wrapper) wrapper.hidden = false;
            initReveal(this);
            return;
          }
        } catch (error) {
          /* try next intent */
        }
      }
      const wrapper = this.closest('[data-recommendations-wrapper]');
      if (wrapper) wrapper.hidden = true;
    }
  }
  customElements.define('product-recommendations', ProductRecommendations);

  /* ------------------------------------------------------------------
     Slider arrows (desktop) for swipe rows
     ------------------------------------------------------------------ */
  class SliderComponent extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.track = qs('[data-slider-track]', this);
      this.prev = qs('[data-slider-prev]', this);
      this.next = qs('[data-slider-next]', this);
      if (!this.track) return;
      const step = () => {
        const item = this.track.firstElementChild;
        if (!item) return this.track.clientWidth;
        const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
        return item.getBoundingClientRect().width + gap;
      };
      if (this.prev) this.prev.addEventListener('click', () => this.track.scrollBy({ left: -step(), behavior: reducedMotion() ? 'auto' : 'smooth' }));
      if (this.next) this.next.addEventListener('click', () => this.track.scrollBy({ left: step(), behavior: reducedMotion() ? 'auto' : 'smooth' }));
      this.track.addEventListener('scroll', debounce(() => this.update(), 60), { passive: true });
      window.addEventListener('resize', debounce(() => this.update(), 150));
      this.update();
    }

    update() {
      if (!this.track) return;
      const max = this.track.scrollWidth - this.track.clientWidth - 2;
      if (this.prev) this.prev.disabled = this.track.scrollLeft <= 2;
      if (this.next) this.next.disabled = this.track.scrollLeft >= max;
      const controls = qs('.slider-controls', this);
      if (controls) controls.hidden = max <= 0;
    }
  }
  customElements.define('slider-component', SliderComponent);

  /* ------------------------------------------------------------------
     Before / after comparison
     ------------------------------------------------------------------ */
  class BeforeAfter extends HTMLElement {
    connectedCallback() {
      const range = qs('input[type="range"]', this);
      const frame = qs('.ba', this);
      if (!range || !frame) return;
      const update = () => frame.style.setProperty('--pos', `${range.value}%`);
      range.addEventListener('input', update);
      update();
    }
  }
  customElements.define('before-after', BeforeAfter);

  /* ------------------------------------------------------------------
     Accordions: smooth height animation for <details data-accordion>
     ------------------------------------------------------------------ */
  document.addEventListener('click', (event) => {
    const summary = event.target.closest('details[data-accordion] > summary');
    if (!summary) return;
    const details = summary.parentElement;
    const content = qs(':scope > [data-accordion-content]', details);
    if (!content || reducedMotion() || !content.animate) return;
    event.preventDefault();
    if (details.dataset.animating) return;
    details.dataset.animating = 'true';
    const easing = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
    // Clip while the height animates so nested content never spills over the items below
    content.style.overflow = 'hidden';
    const done = () => {
      content.style.overflow = '';
      delete details.dataset.animating;
    };

    if (details.open) {
      const height = content.offsetHeight;
      const animation = content.animate(
        [{ height: `${height}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
        { duration: 320, easing }
      );
      animation.onfinish = () => {
        details.open = false;
        done();
      };
    } else {
      const group = details.dataset.accordionGroup;
      if (group) {
        qsa(`details[data-accordion-group="${group}"][open]`).forEach((other) => {
          if (other !== details) other.open = false;
        });
      }
      details.open = true;
      const height = content.offsetHeight;
      const animation = content.animate(
        [{ height: '0px', opacity: 0 }, { height: `${height}px`, opacity: 1 }],
        { duration: 380, easing }
      );
      animation.onfinish = done;
    }
  });

  /* Footer link lists collapse into accordions on mobile */
  const footerQuery = window.matchMedia('(min-width: 750px)');
  const syncFooterAccordions = () => {
    qsa('details[data-footer-accordion]').forEach((details) => {
      if (footerQuery.matches) {
        details.setAttribute('open', '');
        const summary = qs('summary', details);
        if (summary) summary.setAttribute('tabindex', '-1');
      } else {
        details.removeAttribute('open');
        const summary = qs('summary', details);
        if (summary) summary.removeAttribute('tabindex');
      }
    });
  };
  if (footerQuery.addEventListener) footerQuery.addEventListener('change', syncFooterAccordions);

  /* ------------------------------------------------------------------
     Share button
     ------------------------------------------------------------------ */
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-share]');
    if (!button) return;
    event.preventDefault();
    const url = button.dataset.url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (error) {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(theme.strings.linkCopied);
    } catch (error) {
      window.prompt('', url);
    }
  });

  /* ------------------------------------------------------------------
     Reveal on scroll (never hides content that is already visible)
     ------------------------------------------------------------------ */
  let revealObserver = null;
  function initReveal(root = document) {
    if (theme.designMode || !document.documentElement.classList.contains('motion-ok') || !('IntersectionObserver' in window)) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target;
            if (!el.dataset.revealState) {
              if (entry.isIntersecting) {
                el.dataset.revealState = 'done';
                revealObserver.unobserve(el);
              } else {
                el.dataset.revealState = 'pending';
                el.classList.add('reveal--pending');
              }
              return;
            }
            if (entry.isIntersecting) {
              el.classList.add('reveal--in');
              el.classList.remove('reveal--pending');
              el.dataset.revealState = 'done';
              revealObserver.unobserve(el);
            }
          });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
      );
    }
    qsa('[data-reveal]:not([data-reveal-state])', root).forEach((el) => revealObserver.observe(el));
  }
  theme.initReveal = initReveal;

  /* ------------------------------------------------------------------
     Video: YouTube / Vimeo load only after the visitor presses play
     ------------------------------------------------------------------ */
  class DeferredVideo extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const button = qs('[data-video-play]', this);
      if (button) button.addEventListener('click', () => this.load());
    }

    load() {
      const iframe = document.createElement('iframe');
      iframe.src = this.dataset.src;
      iframe.title = this.dataset.title || '';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      this.replaceChildren(iframe);
      iframe.focus();
    }
  }
  customElements.define('deferred-video', DeferredVideo);

  const pauseMotionVideos = (root = document) => {
    if (!reducedMotion()) return;
    qsa('video[data-reduced-motion-pause]', root).forEach((video) => {
      video.removeAttribute('autoplay');
      video.pause();
      video.setAttribute('controls', '');
    });
  };

  /* ------------------------------------------------------------------
     Theme editor support
     ------------------------------------------------------------------ */
  document.addEventListener('shopify:section:load', (event) => {
    initReveal(event.target);
    syncFooterAccordions();
    pauseMotionVideos(event.target);
  });
  document.addEventListener('shopify:block:select', (event) => {
    const slide = event.target.closest('[data-announcement]');
    const bar = slide && slide.closest('announcement-bar');
    if (bar && bar.slides) bar.show(bar.slides.indexOf(slide));
  });
  document.addEventListener('shopify:section:select', (event) => {
    const drawer = qs('side-drawer', event.target);
    if (drawer && drawer.id === 'CartDrawer') drawer.open();
  });

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  const init = () => {
    initReveal();
    syncFooterAccordions();
    pauseMotionVideos();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
