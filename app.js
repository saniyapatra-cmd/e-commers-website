const ASSET = 'https://reel-ref-try-the-look.vercel.app/assets/';

const PRODUCT_HEIGHTS = {
  'tatum-5-orbit-copy': 400, tshirt: 563, sweatshirt: 581, 'tatum-5-orbit': 400,
  'hoodie-black': 536, 'sweatshirt-plus': 610, hoodie: 555, 'air-jordan-12-retro-copy': 400
};

const PRODUCTS = {
  'tatum-5-orbit-copy': {
    id: 'tatum-5-orbit-copy', name: 'Air Jordan 12 Retro', vendor: 'Nikey | Password: 1', price: 149, category: 'shoes', image: `${ASSET}source-tatum-5-orbit-copy.webp`, option: 'Shoe size', sizes: ['40','41','42','43','44','45','46'], url: 'https://nike-makknzjs.myshopify.com/products/tatum-5-orbit-copy'
  },
  tshirt: {
    id: 'tshirt', name: 'Tshirt', vendor: 'Nike', price: 199, category: 'tops', image: `${ASSET}source-tshirt.webp`, option: 'Size', sizes: ['S','L','M','XL'], url: 'https://nike-makknzjs.myshopify.com/products/tshirt'
  },
  sweatshirt: {
    id: 'sweatshirt', name: 'Sweatshirt', vendor: 'Nike', price: 199, category: 'layers', image: `${ASSET}source-sweatshirt.webp`, option: 'Size', sizes: ['S','L','M','XL'], url: 'https://nike-makknzjs.myshopify.com/products/sweatshirt'
  },
  'tatum-5-orbit': {
    id: 'tatum-5-orbit', name: 'Tatum 5 Orbit', vendor: 'Nikey | Password: 1', price: 149, category: 'shoes', image: `${ASSET}source-tatum-5-orbit.webp`, option: 'Shoe size', sizes: ['40','41','42','43','44','45','46'], url: 'https://nike-makknzjs.myshopify.com/products/tatum-5-orbit'
  },
  'hoodie-black': {
    id: 'hoodie-black', name: 'Hoodie Black', vendor: 'Nike', price: 199, category: 'layers', image: `${ASSET}source-hoodie-black.webp`, option: 'Size', sizes: ['S','L','M','XL'], url: 'https://nike-makknzjs.myshopify.com/products/hoodie-black'
  },
  'sweatshirt-plus': {
    id: 'sweatshirt-plus', name: 'Sweatshirt Plus', vendor: 'Nike', price: 199, category: 'layers', image: `${ASSET}source-sweatshirt-plus.webp`, option: 'Size', sizes: ['S','L','M','XL'], url: 'https://nike-makknzjs.myshopify.com/products/sweatshirt-plus'
  },
  hoodie: {
    id: 'hoodie', name: 'Hoodie', vendor: 'Nike', price: 199, category: 'layers', image: `${ASSET}source-hoodie.webp`, option: 'Size', sizes: ['S','L','M','XL'], url: 'https://nike-makknzjs.myshopify.com/products/hoodie'
  },
  'air-jordan-12-retro-copy': {
    id: 'air-jordan-12-retro-copy', name: 'Luka 5', vendor: 'Nikey | Password: 1', price: 149, category: 'shoes', image: `${ASSET}source-air-jordan-12-retro-copy.webp`, option: 'Shoe size', sizes: ['40','41','42','43','44','45','46'], url: 'https://nike-makknzjs.myshopify.com/products/air-jordan-12-retro-copy'
  }
};

const LOOKS = [
  { number: '01', name: 'The City Edit', description: 'A charcoal knit and easy denim.', model: 'model-1-640.webp', original: 'original-look-1.webp', products: ['tatum-5-orbit-copy','tshirt','sweatshirt'], pins: [[47,27],[48,58],[45,86]] },
  { number: '02', name: 'Gallery Opening', description: 'A clean white tee and relaxed denim.', model: 'model-5-640.webp', original: 'original-look-5.webp', products: ['tatum-5-orbit','hoodie-black','tshirt'], tags: [1], pins: [[50,28],[48,58],[45,84]] },
  { number: '03', name: 'Gallery Opening', description: 'Olive knitwear. A grounded palette.', model: 'model-4-640.webp', original: 'original-look-4.webp', products: ['sweatshirt-plus','tatum-5-orbit','tshirt'], tags: [1], pins: [[50,28],[48,58],[45,84]] },
  { number: '04', name: 'Studio Day', description: 'Black, white and laid-back denim.', model: 'model-6-640.webp', original: 'original-look-6.webp', products: ['hoodie-black','tatum-5-orbit-copy','tshirt'], pins: [[50,28],[48,58],[45,84]] },
  { number: '05', name: 'Studio Day', description: 'Burgundy layers. A tailored perspective.', model: 'model-3-640.webp', original: 'original-look-3.webp', products: ['sweatshirt','tatum-5-orbit','tshirt'], pins: [[50,28],[48,58],[45,84]] },
  { number: '06', name: 'Studio Day', description: 'A grey crew and your favourite denim.', model: 'model-2-640.webp', original: 'original-look-2.webp', products: ['hoodie','air-jordan-12-retro-copy','tshirt'], pins: [[50,28],[48,58],[45,84]] }
];

const money = value => `$${value.toFixed(2)}`;
const svg = (path, viewBox = '0 0 24 24', extra = '') => `<svg viewBox="${viewBox}" width="20" height="20" aria-hidden="true" ${extra}>${path}</svg>`;

class RunwaySection extends HTMLElement {
  constructor() {
    super();
    this.index = 0;
    this.playing = true;
    this.engaged = false;
    this.timer = null;
    this.drag = null;
    this.activePicker = null;
    this.bag = this.readBag();
  }

  connectedCallback() {
    this.render();
    this.cache();
    this.renderActors();
    this.bind();
    this.renderLook();
    this.updateBagCount();
    this.startAutoplay();
    this.initCatalogExplorer();
    this.renderCheckoutFromQuery();
    window.runwayApp = this;
    requestAnimationFrame(() => this.setupCursor());
  }

  cache() {
    this.stage = this.querySelector('[data-stage]');
    this.actors = this.querySelector('[data-actors]');
    this.ticks = this.querySelector('[data-ticks]');
    this.panel = this.querySelector('[data-panel]');
    this.popup = this.querySelector('[data-popup]');
    this.cursor = this.querySelector('[data-cursor]');
    this.live = this.querySelector('[data-live]');
  }

  render() {
    this.innerHTML = `
      <div class="rw__grid">
        <section class="rw__left" aria-label="Runway looks">
          <header class="rw__head">
            <div class="rw__intro">
              <h1 class="rw__title">Try the Look.</h1>
              <p class="rw__sub">Six looks, styled head to toe. Tap a pin to see the piece.</p>
            </div>
            <span class="sr-only" data-live aria-live="polite" aria-atomic="true"></span>
          </header>
          <div class="rw__stage" data-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Try the Look. — use arrow keys or swipe to change look">
            <div class="rw__actors" data-actors></div>
            <span class="rw__cursor" data-cursor><span class="rw__cursor-in"><span class="rw__cursor-label rw__cursor-drag">Drag</span><span class="rw__cursor-label rw__cursor-view">View</span></span></span>
            <span class="rw__walk" aria-hidden="true"><span class="rw__walk-line"></span></span>
          </div>
          <div class="rw__controls" aria-label="Runway controls">
            <button class="rw__icon" data-action="prev" aria-label="Previous look">${svg('<path d="M25 7H1M7 1L1 7l6 6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>', '0 0 26 14', 'width="26" height="14"')}</button>
            <div class="rw__ticks" data-ticks></div>
            <button class="rw__icon rw__auto is-playing" data-action="auto" aria-pressed="true" aria-label="Pause autoplay">
              <svg class="play-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>
              <svg class="pause-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z" fill="currentColor"/></svg>
            </button>
            <button class="rw__icon" data-action="next" aria-label="Next look">${svg('<path d="M1 7h24M19 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>', '0 0 26 14', 'width="26" height="14"')}</button>
          </div>
        </section>
        <aside class="rw__panel" data-panel aria-label="In this look">
          <div class="rw__panel-inner">
            <div class="rw__panel-head"><h2 class="rw__panel-title">In this look</h2><span class="rw__pieces" data-pieces>3 pieces</span></div>
            <div class="rw__items" data-items role="list"></div>
            <div class="rw__bundle">
              <p class="rw__msg" data-bundle-msg hidden role="status" aria-live="polite"></p>
              <div class="rw__bundle-copy"><span class="rw__bundle-title">Complete the look</span><span class="rw__bundle-note">Bundle all 3 and save 10%</span></div>
              <div class="rw__bundle-price"><s>$547.00</s><strong>$492.30</strong></div>
              <button class="rw__bundle-button" data-full-look><span class="bundle-label--desktop">Add full look to bag</span><span class="bundle-label--mobile">Add full look — $492.30</span></button>
            </div>
          </div>
        </aside>
      </div>
      <div class="look-popup" data-popup aria-hidden="true">
        <div class="look-popup__card" role="dialog" aria-modal="true" aria-labelledby="popup-title">
          <div class="look-popup__stage"><img class="look-popup__model" data-popup-model alt=""><div class="look-popup__pins" data-popup-pins></div></div>
          <div class="look-popup__side"><div class="look-popup__side-head"><div><p class="eyebrow">Look <span data-popup-number>01</span></p><h2 id="popup-title" data-popup-title>The City Edit</h2></div><button class="close-button" data-popup-close aria-label="Close look">×</button></div><p class="look-popup__copy" data-popup-copy></p><p class="look-popup__legend">Select a pin to highlight the matching piece in the styling panel.</p></div>
        </div>
      </div>`;
  }

  renderActors() {
    this.actors.innerHTML = LOOKS.map((look, i) => `<div class="rw__actor" data-actor="${i}" aria-hidden="${i !== this.index}"><img src="${ASSET}${look.model}" srcset="${ASSET}${look.model} 640w, ${ASSET}${look.original} 1080w" sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px" alt="${look.name}" loading="eager" decoding="async" width="1100" height="1956" draggable="false" data-model-image><span class="actor-label">${look.number}&nbsp;&nbsp;${look.name}</span><button data-go="${i}" aria-label="Look ${look.number}: ${look.name}" tabindex="${i === this.index ? '0' : '-1'}"></button></div>`).join('');
    this.positionActors();
  }

  positionActors() {
    this.querySelectorAll('[data-actor]').forEach(actor => {
      const i = Number(actor.dataset.actor);
      let offset = i - this.index;
      if (offset > 3) offset -= 6;
      if (offset < -3) offset += 6;
      const abs = Math.abs(offset);
      const map = {
        0: { x: 50, y: 0, scale: 1.08, opacity: 1, blur: 0, z: 10 },
        1: { x: 27, y: 3, scale: .78, opacity: .72, blur: .3, z: 7 },
        '-1': { x: 73, y: 3, scale: .78, opacity: .72, blur: .3, z: 7 },
        2: { x: 8, y: 6, scale: .58, opacity: .32, blur: 2.2, z: 4 },
        '-2': { x: 92, y: 6, scale: .58, opacity: .32, blur: 2.2, z: 4 },
        3: { x: -8, y: 8, scale: .46, opacity: .1, blur: 4.5, z: 2 },
        '-3': { x: 108, y: 8, scale: .46, opacity: .1, blur: 4.5, z: 2 }
      };
      const state = map[offset] || map[0];
      actor.classList.toggle('is-front', offset === 0);
      actor.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
      const button = actor.querySelector('button');
      button.tabIndex = offset === 0 ? 0 : -1;
      actor.style.left = `${state.x}%`;
      actor.style.transform = `translateX(-50%) translateY(${state.y}%) scale(${state.scale})`;
      actor.style.opacity = state.opacity;
      actor.style.filter = `blur(${state.blur}px)`;
      actor.style.zIndex = state.z;
    });
  }

  renderTicks() {
    this.ticks.innerHTML = LOOKS.map((look, i) => `<button class="rw__tick ${i < this.index ? 'is-past' : ''} ${this.playing && i === this.index ? 'is-playing' : ''}" data-go-tick="${i}" aria-current="${i === this.index}" aria-label="Look ${look.number}: ${look.name}"><span class="rw__tick-bar"></span><span class="rw__tick-label">${look.number}<span class="rw__tick-name">&nbsp;&nbsp;${look.name}</span></span></button>`).join('');
  }

  renderLook() {
    const look = LOOKS[this.index];
    const items = this.querySelector('[data-items]');
    items.innerHTML = look.products.map((id, position) => {
      const product = PRODUCTS[id];
      const tag = look.tags?.includes(position) ? '<span class="rw__tag"><span class="rw__tag-text">New</span></span>' : '';
      return `<article class="rw__item" data-card="${position}" data-product="${id}" data-title="${product.name}">
        ${tag}
        <a class="rw__media" href="${product.url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${product.image}" alt="" loading="lazy" decoding="async" width="400" height="${PRODUCT_HEIGHTS[id]}"><span class="rw__num">${position + 1}</span></a>
        <div class="rw__info"><span class="rw__type">${product.vendor}</span><a class="rw__name" href="${product.url}" target="_blank" rel="noopener noreferrer">${product.name}</a><span class="rw__price">${money(product.price)}</span></div>
        <button class="rw__add" data-add="${id}" aria-expanded="false" aria-label="Add to bag: ${product.name}">${svg('<path class="plus-icon" d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>')} ${svg('<path class="check-icon" d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>')} ${svg('<path class="spinner-icon" d="M12 3a9 9 0 1 1-9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>')}</button>
        <div class="rw__picker" data-picker="${id}" hidden><fieldset><legend>${product.option}</legend><div class="rw__pills">${product.sizes.map((size, n) => `<label class="rw__pill"><input type="radio" name="${id}-${this.index}" value="${size}" ${n === 0 ? 'checked' : ''}><span class="rw__pill-label">${size}</span></label>`).join('')}</div></fieldset><button class="rw__confirm" data-confirm="${id}">Add to bag <span class="sr-only">— ${product.name}</span></button></div>
      </article>`;
    }).join('');
    this.querySelector('[data-pieces]').textContent = `${look.products.length} pieces`;
    this.style.setProperty('--progress', ((this.index + 1) / LOOKS.length).toFixed(3));
    this.querySelector('[data-bundle-msg]').hidden = true;
    this.renderTicks();
    this.positionActors();
  }

  bind() {
    this.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'prev') this.go(this.index - 1);
      if (action === 'next') this.go(this.index + 1);
      if (action === 'auto') this.toggleAutoplay();
      const tick = e.target.closest('[data-go-tick]');
      if (tick) this.go(Number(tick.dataset.goTick));
      const actor = e.target.closest('[data-go]');
      if (actor) {
        const next = Number(actor.dataset.go);
        if (next === this.index) this.openPopup(); else this.go(next);
      }
      const add = e.target.closest('[data-add]');
      if (add) this.togglePicker(add.dataset.add);
      const confirm = e.target.closest('[data-confirm]');
      if (confirm) this.confirmProduct(confirm.dataset.confirm, confirm);
      if (e.target.closest('[data-full-look]')) this.addFullLook();
      if (e.target.closest('[data-popup-close]') || (e.target.matches('[data-popup]'))) this.closePopup();
      const pin = e.target.closest('[data-pin]');
      if (pin) this.highlightCard(Number(pin.dataset.pin));
      const remove = e.target.closest('[data-remove-bag]');
      if (remove) this.removeBagItem(Number(remove.dataset.removeBag));
    });
    this.addEventListener('change', e => {
      if (e.target.matches('.rw__picker input')) { e.target.closest('[data-product]')?.setAttribute('data-touched', '1'); this.engage(); }
    });
    this.panel.addEventListener('pointerenter', () => { this.panelHover = true; this.restartTimer(); });
    this.panel.addEventListener('pointerleave', () => { this.panelHover = false; this.restartTimer(); });
    this.panel.addEventListener('pointerover', e => {
      const card = e.target.closest('[data-card]');
      if (card) this.highlightCard(Number(card.dataset.card));
    });
    this.panel.addEventListener('pointerout', e => {
      if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) this.clearHot();
    });
    this.stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.go(this.index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(this.index - 1); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.openPopup(); }
      if (e.key === 'Escape' && this.popup.classList.contains('is-open')) this.closePopup();
    });
    this.stage.addEventListener('pointerdown', e => this.startDrag(e));
    this.stage.addEventListener('pointermove', e => this.moveDrag(e));
    this.stage.addEventListener('pointerup', e => this.endDrag(e));
    this.stage.addEventListener('pointercancel', e => this.endDrag(e));
    this.stage.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 25) { e.preventDefault(); this.go(this.index + (e.deltaX > 0 ? 1 : -1)); }
    }, { passive: false });
    document.getElementById('open-bag')?.addEventListener('click', () => this.openBag());
    document.getElementById('checkout-bag')?.addEventListener('click', () => this.openCheckout());
    document.querySelectorAll('[data-close-bag]').forEach(btn => btn.addEventListener('click', () => document.getElementById('bag-dialog')?.close()));
    document.getElementById('bag-dialog')?.addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
    document.getElementById('export-bag')?.addEventListener('click', () => this.exportBag());
    document.querySelectorAll('[data-close-checkout]').forEach(btn => btn.addEventListener('click', () => document.getElementById('checkout-dialog')?.close()));
    document.getElementById('checkout-dialog')?.addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
    document.querySelector('[data-simulate-checkout]')?.addEventListener('click', () => this.simulateCheckout());
    document.querySelector('[data-stripe-checkout]')?.addEventListener('click', () => this.startStripeCheckout());
    this.handleDocumentKeydown = e => { if (e.key === 'Escape' && this.popup?.classList.contains('is-open')) this.closePopup(); };
    document.addEventListener('keydown', this.handleDocumentKeydown);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clearTimer(); else this.restartTimer(); });
  }

  disconnectedCallback() {
    this.clearTimer();
    if (this.handleDocumentKeydown) document.removeEventListener('keydown', this.handleDocumentKeydown);
  }

  go(target) {
    this.engage();
    this.index = (target + LOOKS.length) % LOOKS.length;
    this.closePopup();
    this.renderLook();
    this.live.textContent = `Look ${LOOKS[this.index].number}: ${LOOKS[this.index].name}`;
    this.restartTimer();
  }

  startAutoplay() { if (this.playing) this.restartTimer(); }
  restartTimer() {
    this.clearTimer();
    this.renderTicks();
    if (!this.playing) return;
    this.timer = setTimeout(() => {
      if (!document.hidden && !this.panelHover && !this.engaged) this.go(this.index + 1);
      else this.restartTimer();
    }, 5000);
  }
  clearTimer() { if (this.timer) clearTimeout(this.timer); this.timer = null; }
  toggleAutoplay() {
    this.engaged = false;
    this.playing = !this.playing;
    const btn = this.querySelector('[data-action="auto"]');
    btn.classList.toggle('is-playing', this.playing);
    btn.setAttribute('aria-pressed', String(this.playing));
    btn.setAttribute('aria-label', this.playing ? 'Pause autoplay' : 'Play autoplay');
    this.restartTimer();
  }
  engage() { this.engaged = true; this.playing = false; const btn = this.querySelector('[data-action="auto"]'); if (btn) { btn.classList.remove('is-playing'); btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Play autoplay'); } this.clearTimer(); this.renderTicks(); }

  startDrag(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this.drag = { id: e.pointerId, x: e.clientX, lastX: e.clientX, moved: false };
    this.stage.setPointerCapture?.(e.pointerId);
  }
  moveDrag(e) {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    const dx = e.clientX - this.drag.x;
    if (Math.abs(dx) > 8) { this.drag.moved = true; this.stage.classList.add('is-dragging'); this.cursor?.classList.add('is-dragging'); }
    this.drag.lastX = e.clientX;
  }
  endDrag(e) {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    const dx = this.drag.lastX - this.drag.x;
    if (this.drag.moved && Math.abs(dx) > 30) this.go(this.index + (dx < 0 ? 1 : -1));
    this.stage.classList.remove('is-dragging'); this.cursor?.classList.remove('is-dragging'); this.drag = null;
  }

  togglePicker(id) {
    this.engage();
    const card = this.querySelector(`[data-product="${id}"]`);
    const picker = card?.querySelector(`[data-picker="${id}"]`);
    const btn = card?.querySelector('[data-add]');
    if (!picker || !btn || card.classList.contains('is-added')) return;
    const open = picker.hidden;
    picker.hidden = !open;
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) picker.querySelector('input:checked')?.focus({ preventScroll: true });
  }
  confirmProduct(id, confirm) {
    const card = this.querySelector(`[data-product="${id}"]`);
    const size = card?.querySelector('input:checked')?.value;
    if (!size) { this.toast('Pick a size before adding.'); return; }
    card.dataset.touched = '1';
    const add = card.querySelector('[data-add]');
    add.classList.add('is-loading');
    setTimeout(() => {
      this.addToBag([{ id, size }]);
      add.classList.remove('is-loading'); add.classList.add('is-added'); add.setAttribute('aria-label', `Added to bag: ${PRODUCTS[id].name}`); add.removeAttribute('aria-expanded');
      const picker = card.querySelector('[data-picker]'); if (picker) picker.hidden = true;
      this.toast('Piece saved to your styling bag');
    }, 340);
  }
  addFullLook() {
    this.engage();
    const look = LOOKS[this.index];
    const cards = look.products.map(id => this.querySelector(`[data-product="${id}"]`));
    const pending = cards.filter(card => !card.classList.contains('is-added') && card.dataset.touched !== '1');
    if (pending.length) {
      const message = `Pick a size for: ${pending.map(card => card.dataset.title).join(', ')}`;
      const msg = this.querySelector('[data-bundle-msg]');
      msg.textContent = message;
      msg.hidden = false;
      pending.forEach(card => {
        const picker = card.querySelector('[data-picker]');
        const add = card.querySelector('[data-add]');
        if (picker) picker.hidden = false;
        if (add) { add.classList.add('is-open'); add.setAttribute('aria-expanded', 'true'); }
      });
      pending[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      return;
    }
    const ready = cards.filter(card => !card.classList.contains('is-added'));
    if (!ready.length) return;
    this.addToBag(ready.map(card => ({ id: card.dataset.product, size: card.querySelector('input:checked')?.value })));
    ready.forEach(card => {
      const add = card.querySelector('[data-add]');
      add.classList.add('is-added');
      add.setAttribute('aria-label', `Added to bag: ${card.dataset.title}`);
      add.classList.remove('is-open');
      add.removeAttribute('aria-expanded');
      card.querySelector('[data-picker]')?.setAttribute('hidden', '');
    });
    const button = this.querySelector('[data-full-look]');
    button.classList.add('is-added'); button.querySelectorAll('span').forEach(label => label.textContent = 'Full look in your bag');
    this.toast('Look saved to your styling bag');
  }
  addToBag(items) {
    items.forEach(({ id, size }) => {
      const existing = this.bag.find(item => item.id === id && item.size === size);
      if (existing) existing.quantity = Math.min(20, existing.quantity + 1);
      else this.bag.push({ id, size, quantity: 1 });
    });
    this.writeBag(); this.updateBagCount(); this.renderBag();
  }
  readBag() { try { return JSON.parse(localStorage.getItem('runway-styling-bag-v3') || '[]').filter(item => PRODUCTS[item.id] && item.size && item.quantity >= 1).slice(0, 50); } catch { return []; } }
  writeBag() { try { localStorage.setItem('runway-styling-bag-v3', JSON.stringify(this.bag)); } catch {} }
  updateBagCount() { const count = this.bag.reduce((sum, item) => sum + item.quantity, 0); document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count); }
  renderBag() {
    const holder = document.getElementById('bag-items'); if (!holder) return;
    const exportButton = document.getElementById('export-bag');
    const checkoutButton = document.getElementById('checkout-bag');
    if (!this.bag.length) { holder.innerHTML = '<p class="bag-empty">Your styling bag is ready for a point of view. Add a piece or save a full look to start your shortlist.</p>'; document.getElementById('bag-total').textContent = ''; if (exportButton) exportButton.disabled = true; if (checkoutButton) checkoutButton.disabled = true; return; }
    if (exportButton) exportButton.disabled = false;
    if (checkoutButton) checkoutButton.disabled = false;
    holder.innerHTML = this.bag.map((item, index) => { const p = PRODUCTS[item.id]; return `<div class="bag-row"><img src="${p.image}" alt="${p.name}"><div><div class="bag-row__name">${p.name}</div><div class="bag-row__meta">Size ${item.size} · Quantity ${item.quantity} · ${money(p.price * item.quantity)}</div><a class="bag-row__link" href="${p.url}" target="_blank" rel="noopener noreferrer">View original piece ↗</a></div><button class="bag-row__remove" data-remove-bag="${index}" aria-label="Remove ${p.name}">×</button></div>`; }).join('');
    const total = this.bag.reduce((sum, item) => sum + PRODUCTS[item.id].price * item.quantity, 0);
    document.getElementById('bag-total').textContent = `Reference subtotal ${money(total)}`;
  }
  removeBagItem(index) { if (!this.bag[index]) return; this.bag.splice(index, 1); this.writeBag(); this.updateBagCount(); this.renderBag(); this.toast('Piece removed from your styling bag'); }
  exportBag() {
    if (!this.bag.length) return;
    const lines = ['RUNWAY — STYLING SHORTLIST', 'Reference prices; no order or payment has been placed.', '', ...this.bag.flatMap(item => { const p = PRODUCTS[item.id]; return [`${p.name} · Size ${item.size} · Quantity ${item.quantity}`, p.url]; })];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'runway-outfit-shortlist.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  openBag() { this.renderBag(); const dialog = document.getElementById('bag-dialog'); if (dialog?.showModal) dialog.showModal(); else dialog?.setAttribute('open', ''); }
  toast(message) { const el = document.getElementById('bag-status'); el.textContent = message; el.classList.add('is-visible'); clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600); }

  initCatalogExplorer() {
    const grid = document.querySelector('[data-catalog-grid]');
    if (!grid) return;
    this.catalogState = { category: 'all', query: '' };
    const render = () => {
      const query = this.catalogState.query.trim().toLowerCase();
      const products = Object.values(PRODUCTS).filter(product => (this.catalogState.category === 'all' || product.category === this.catalogState.category) && (!query || `${product.name} ${product.vendor}`.toLowerCase().includes(query)));
      grid.innerHTML = products.map(product => `<article class="catalog-card"><a class="catalog-card__media" href="${product.url}" target="_blank" rel="noopener noreferrer"><img src="${product.image}" alt="${product.name}" loading="lazy" width="400" height="${PRODUCT_HEIGHTS[product.id]}"></a><div class="catalog-card__body"><p class="catalog-card__category">${product.category === 'shoes' ? 'Footwear' : product.category === 'tops' ? 'Tops' : 'Layering'}</p><a class="catalog-card__name" href="${product.url}" target="_blank" rel="noopener noreferrer">${product.name}</a><div class="catalog-card__meta"><span>${money(product.price)}</span><label><span class="sr-only">${product.option} for ${product.name}</span><select data-catalog-size="${product.id}">${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}</select></label></div><button class="catalog-card__add" data-catalog-add="${product.id}">Add to styling bag</button></div></article>`).join('');
      document.querySelector('[data-catalog-empty]').hidden = products.length !== 0;
    };
    document.querySelectorAll('[data-category]').forEach(tab => tab.addEventListener('click', () => {
      this.catalogState.category = tab.dataset.category;
      document.querySelectorAll('[data-category]').forEach(item => { item.classList.toggle('is-active', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
      render();
    }));
    document.querySelector('[data-catalog-search]')?.addEventListener('input', e => { this.catalogState.query = e.target.value; render(); });
    grid.addEventListener('click', e => { const add = e.target.closest('[data-catalog-add]'); if (!add) return; const size = grid.querySelector(`[data-catalog-size="${add.dataset.catalogAdd}"]`)?.value; this.addCatalogItem(add.dataset.catalogAdd, size); });
    this.renderCatalog = render;
    render();
  }
  addCatalogItem(id, size) { this.addToBag([{ id, size }]); this.toast('Piece saved to your styling bag'); }
  checkoutItems() { return this.bag.map(item => ({ id: item.id, size: item.size, quantity: item.quantity })); }
  checkoutTotal() { return this.bag.reduce((sum, item) => sum + PRODUCTS[item.id].price * item.quantity, 0); }
  openCheckout() {
    if (!this.bag.length) return;
    this.renderCheckoutSummary();
    document.getElementById('bag-dialog')?.close();
    const dialog = document.getElementById('checkout-dialog');
    if (dialog?.showModal) dialog.showModal(); else dialog?.setAttribute('open', '');
  }
  renderCheckoutSummary() {
    const summary = document.querySelector('[data-checkout-summary]');
    if (!summary) return;
    summary.innerHTML = `${this.bag.map(item => `<div class="checkout-summary__row"><span>${PRODUCTS[item.id].name} · ${item.size} × ${item.quantity}</span><strong>${money(PRODUCTS[item.id].price * item.quantity)}</strong></div>`).join('')}<div class="checkout-summary__total"><span>Total</span><strong>${money(this.checkoutTotal())}</strong></div>`;
  }
  checkoutPayload() { return { items: this.checkoutItems(), email: document.querySelector('[data-checkout-email]')?.value?.trim() || '' }; }
  setCheckoutLoading(isLoading) {
    document.querySelectorAll('[data-simulate-checkout], [data-stripe-checkout]').forEach(button => { button.disabled = isLoading; button.setAttribute('aria-busy', String(isLoading)); });
  }
  async simulateCheckout() {
    if (!this.bag.length) return;
    this.setCheckoutLoading(true);
    try {
      const response = await fetch('/api/simulate-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.checkoutPayload()) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout simulation failed.');
      const orderId = data.orderId;
      this.bag = []; this.writeBag(); this.updateBagCount(); this.renderBag();
      document.getElementById('checkout-dialog')?.close();
      this.toast(`Simulation complete · ${orderId}`);
    } catch (error) { this.toast(error.message); }
    finally { this.setCheckoutLoading(false); }
  }
  async startStripeCheckout() {
    if (!this.bag.length) return;
    this.setCheckoutLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.checkoutPayload()) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Stripe checkout is unavailable.');
      const checkoutWindow = window.open(data.url, '_blank', 'noopener,noreferrer');
      if (!checkoutWindow) this.toast('Allow pop-ups to open Stripe test checkout.'); else this.toast('Opening Stripe test checkout in a new tab.');
    } catch (error) { this.toast(error.message); }
    finally { this.setCheckoutLoading(false); }
  }
  renderCheckoutFromQuery() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') setTimeout(() => this.toast('Stripe returned successfully. Payment confirmation arrives by webhook.'), 500);
    if (params.get('checkout') === 'cancelled') setTimeout(() => this.toast('Stripe checkout was cancelled. Your styling bag is still here.'), 500);
  }

  openPopup() {
    this.engage();
    const look = LOOKS[this.index];
    this.popup.querySelector('[data-popup-model]').src = `${ASSET}${look.model}`;
    this.popup.querySelector('[data-popup-model]').alt = look.name;
    this.popup.querySelector('[data-popup-number]').textContent = look.number;
    this.popup.querySelector('[data-popup-title]').textContent = look.name;
    this.popup.querySelector('[data-popup-copy]').textContent = look.description;
    this.popup.querySelector('[data-popup-pins]').innerHTML = look.pins.map(([left, top], i) => `<button class="look-popup__pin" data-pin="${i}" style="left:${left}%;top:${top}%" aria-label="${i + 1}: ${PRODUCTS[look.products[i]].name}"><span data-tip="${PRODUCTS[look.products[i]].name}">${i + 1}</span></button>`).join('');
    this.popup.classList.add('is-open'); this.popup.setAttribute('aria-hidden', 'false');
    this.popup.querySelector('[data-popup-close]').focus();
  }
  closePopup() { if (!this.popup) return; this.popup.classList.remove('is-open'); this.popup.setAttribute('aria-hidden', 'true'); }
  highlightCard(n) { this.clearHot(); const pin = this.popup.querySelector(`[data-pin="${n}"]`); const card = this.querySelector(`[data-card="${n}"]`); pin?.classList.add('is-hot'); card?.classList.add('is-hot'); card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }); }
  clearHot() { this.querySelectorAll('.is-hot').forEach(el => el.classList.remove('is-hot')); }

  setupCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) { this.cursor?.remove(); return; }
    let tx = 0, ty = 0, x = 0, y = 0, raf;
    const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; this.cursor.style.transform = `translate3d(${x}px,${y}px,0)`; if (Math.abs(tx-x) > .2 || Math.abs(ty-y) > .2) raf = requestAnimationFrame(loop); else raf = null; };
    this.stage.addEventListener('pointerenter', e => { tx = x = e.clientX - this.stage.getBoundingClientRect().left; ty = y = e.clientY - this.stage.getBoundingClientRect().top; this.cursor.classList.add('is-visible'); loop(); });
    this.stage.addEventListener('pointermove', e => { const r = this.stage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; if (!raf) loop(); const overActor = e.target.closest?.('[data-go]'); this.cursor.classList.toggle('is-view', !!overActor && overActor.closest('.is-front')); });
    this.stage.addEventListener('pointerleave', () => this.cursor.classList.remove('is-visible', 'is-view', 'is-link'));
  }
}

customElements.define('runway-section', RunwaySection);
