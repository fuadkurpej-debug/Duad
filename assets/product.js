/* ==========================================================================
   Skin & Beauty — product page: gallery, zoom lightbox, sticky add to cart
   ========================================================================== */
(() => {
  'use strict';

  const theme = window.theme || {};
  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = () => (reducedMotion() ? 'auto' : 'smooth');

  /* ------------------------------------------------------------------
     Gallery: swipe slider on mobile, editorial grid on desktop
     ------------------------------------------------------------------ */
  class ProductGallery extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.sectionId = this.dataset.section;
      this.track = qs('[data-gallery-track]', this);
      if (!this.track) return;
      this.dots = qsa('[data-gallery-dot]', this);
      this.counter = qs('[data-gallery-current]', this);

      let scrollTimer;
      this.track.addEventListener(
        'scroll',
        () => {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => this.syncActive(), 60);
        },
        { passive: true }
      );

      this.dots.forEach((dot) => dot.addEventListener('click', () => this.goTo(Number(dot.dataset.index))));

      this.track.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-zoom-index]');
        if (!trigger || this.dataset.zoom !== 'true') return;
        event.preventDefault();
        const lightbox = document.getElementById(`Lightbox-${this.sectionId}`);
        if (lightbox) lightbox.open(Number(trigger.dataset.zoomIndex), trigger);
      });

      document.addEventListener('gallery:select', (event) => {
        if (event.detail.sectionId === this.sectionId) this.selectMedia(event.detail.mediaId);
      });

      this.limit = Number(this.dataset.limit) || 0;
      this.moreButton = qs('[data-gallery-more]', this);
      if (this.moreButton) this.moreButton.addEventListener('click', () => this.expand());
    }

    // Desktop grid shows the first images only; "Show all" reveals the rest
    expand() {
      this.classList.add('is-expanded');
      if (this.moreButton) {
        this.moreButton.setAttribute('aria-expanded', 'true');
        this.moreButton.hidden = true;
      }
      const next = this.items[this.limit];
      if (next) {
        const focusable = qs('button, a, video, iframe', next);
        if (focusable) focusable.focus({ preventScroll: true });
      }
    }

    markExtras() {
      if (!this.limit || this.classList.contains('is-expanded')) return;
      this.items.forEach((item, i) => item.classList.toggle('is-extra', i >= this.limit));
    }

    get items() {
      return qsa('[data-media-id]', this.track);
    }

    isSlider() {
      return this.track.scrollWidth > this.track.clientWidth + 4 && getComputedStyle(this.track).overflowX !== 'visible';
    }

    syncActive() {
      if (!this.isSlider()) return;
      const left = this.track.scrollLeft;
      let index = 0;
      let best = Infinity;
      this.items.forEach((item, i) => {
        const distance = Math.abs(item.offsetLeft - this.track.offsetLeft - left);
        if (distance < best) {
          best = distance;
          index = i;
        }
      });
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', String(i === index));
      });
      if (this.counter) this.counter.textContent = String(index + 1);
    }

    goTo(index) {
      const item = this.items[index];
      if (!item) return;
      if (this.isSlider()) {
        this.track.scrollTo({ left: item.offsetLeft - this.track.offsetLeft, behavior: behavior() });
      } else {
        item.scrollIntoView({ behavior: behavior(), block: 'nearest' });
      }
    }

    selectMedia(mediaId) {
      const items = this.items;
      const index = items.findIndex((item) => item.dataset.mediaId === String(mediaId));
      if (index < 0) return;
      if (this.isSlider()) {
        this.goTo(index);
        return;
      }
      if (index !== 0) {
        this.track.prepend(items[index]);
        this.markExtras();
      }
      const rect = this.track.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight * 0.5) {
        window.scrollTo({ top: window.scrollY + rect.top - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 0) - 16, behavior: behavior() });
      }
    }
  }
  customElements.define('product-gallery', ProductGallery);

  /* ------------------------------------------------------------------
     Lightbox with click-to-zoom and pan
     ------------------------------------------------------------------ */
  class ProductLightbox extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.track = qs('[data-lightbox-track]', this);
      this.counter = qs('[data-lightbox-current]', this);
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-lightbox-close]')) this.close();
        else if (event.target.closest('[data-lightbox-prev]')) this.step(-1);
        else if (event.target.closest('[data-lightbox-next]')) this.step(1);
        else {
          const slide = event.target.closest('.lightbox__slide');
          if (slide && event.target.tagName === 'IMG') this.toggleZoom(slide, event);
        }
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') this.close();
        if (event.key === 'ArrowRight') this.step(1);
        if (event.key === 'ArrowLeft') this.step(-1);
      });
      this.addEventListener('pointermove', (event) => {
        const slide = event.target.closest('.lightbox__slide.is-zoomed');
        if (slide) this.pan(slide, event);
      });
      this.track.addEventListener('scroll', () => {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
          const index = Math.round(this.track.scrollLeft / this.track.clientWidth);
          if (index !== this.index) {
            qsa('.lightbox__slide.is-zoomed', this).forEach((slide) => slide.classList.remove('is-zoomed'));
            this.index = index;
            this.updateCounter();
          }
        }, 80);
      }, { passive: true });
    }

    get slides() {
      return qsa('.lightbox__slide', this.track);
    }

    open(index = 0, opener) {
      this.opener = opener;
      this.hidden = false;
      this.slides.forEach((slide) => {
        const img = qs('img[data-src]', slide);
        if (img && !img.src) {
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        }
      });
      if (theme.lockScroll) theme.lockScroll();
      window.requestAnimationFrame(() => {
        this.classList.add('is-open');
        this.index = index;
        this.track.scrollTo({ left: this.track.clientWidth * index, behavior: 'auto' });
        this.updateCounter();
        if (theme.trapFocus) theme.trapFocus(this, qs('[data-lightbox-close]', this));
      });
    }

    close() {
      this.classList.remove('is-open');
      qsa('.lightbox__slide.is-zoomed', this).forEach((slide) => slide.classList.remove('is-zoomed'));
      if (theme.unlockScroll) theme.unlockScroll();
      if (theme.removeTrapFocus) theme.removeTrapFocus(this.opener);
      setTimeout(() => {
        this.hidden = true;
      }, reducedMotion() ? 0 : 300);
    }

    step(delta) {
      const count = this.slides.length;
      this.index = (this.index + delta + count) % count;
      this.track.scrollTo({ left: this.track.clientWidth * this.index, behavior: behavior() });
      this.updateCounter();
    }

    updateCounter() {
      if (this.counter) this.counter.textContent = String((this.index || 0) + 1);
    }

    toggleZoom(slide, event) {
      const zoomed = slide.classList.toggle('is-zoomed');
      if (zoomed) this.pan(slide, event);
    }

    pan(slide, event) {
      const img = qs('img', slide);
      if (!img) return;
      const rect = slide.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    }
  }
  customElements.define('product-lightbox', ProductLightbox);

  /* ------------------------------------------------------------------
     Sticky add to cart bar
     ------------------------------------------------------------------ */
  class StickyAtc extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.target = document.getElementById(this.dataset.target);
      if (!this.target) return;
      this.footer = qs('.footer');
      this.visible = null;
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          this.update();
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      this.update();
    }

    // Visible once the main buy buttons have scrolled above the viewport, hidden near the footer
    update() {
      const pastTarget = this.target.getBoundingClientRect().bottom < 0;
      const footerVisible = this.footer ? this.footer.getBoundingClientRect().top < window.innerHeight : false;
      this.setVisible(pastTarget && !footerVisible);
    }

    setVisible(visible) {
      if (visible === this.visible) return;
      this.visible = visible;
      this.classList.toggle('is-visible', visible);
      this.setAttribute('aria-hidden', String(!visible));
      qsa('a, button, select, input', this).forEach((el) => {
        if (visible) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
      document.body.classList.toggle('has-sticky-atc', visible);
    }
  }
  customElements.define('sticky-atc', StickyAtc);

  /* ------------------------------------------------------------------
     Read more: shortens long product descriptions (often imported from
     suppliers) so the buy buttons stay close. Without JavaScript the full
     text simply shows.
     ------------------------------------------------------------------ */
  class ReadMore extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.content = qs('[data-read-more-content]', this);
      this.toggle = qs('[data-read-more-toggle]', this);
      this.label = qs('[data-read-more-label]', this);
      if (!this.content || !this.toggle || !this.label) return;
      this.labelMore = this.label.textContent;
      this.labelLess = this.toggle.dataset.labelLess || this.labelMore;
      this.maxHeight = Number(this.dataset.maxHeight) || 240;
      this.toggle.addEventListener('click', () => this.setExpanded(!this.expanded));
      // Images in the description change its height once they load
      qsa('img', this.content).forEach((img) => {
        if (!img.complete) img.addEventListener('load', () => this.measure(), { once: true });
      });
      this.measure();
    }

    measure() {
      if (this.expanded) return;
      // Only shorten when it saves a meaningful amount of space
      const collapsible = this.content.scrollHeight > this.maxHeight + 80;
      this.classList.toggle('is-collapsible', collapsible);
      this.style.setProperty('--read-more-height', `${this.maxHeight}px`);
      this.toggle.hidden = !collapsible;
    }

    setExpanded(expanded) {
      this.expanded = expanded;
      this.classList.toggle('is-expanded', expanded);
      this.toggle.setAttribute('aria-expanded', String(expanded));
      this.label.textContent = expanded ? this.labelLess : this.labelMore;
      if (!expanded) {
        const top = this.getBoundingClientRect().top;
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 0;
        if (top < headerOffset) window.scrollTo({ top: window.scrollY + top - headerOffset - 16, behavior: behavior() });
      }
    }
  }
  customElements.define('read-more', ReadMore);
})();
