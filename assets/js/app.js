(() => {
  const root = document.documentElement;
  root.classList.add('motion');
  const menu = document.querySelector('[data-mobile-menu]');
  if (menu) {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (menu.open) menu.open = false; }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        const summary = menu.querySelector('summary');
        if (summary) summary.focus();
      }
    });
  }
  // CTA glass highlight — subtle JS fallback for touch browsers.
  // It adds only a broad, low-contrast reflection; no visible "beam".
  const ctaButtons = [...document.querySelectorAll('.btn-appointment')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (ctaButtons.length && !reduceMotion.matches) {
    ctaButtons.forEach(btn => {
      if (btn.querySelector('.btn-glass-shine')) return;
      const shine = document.createElement('span');
      shine.className = 'btn-glass-shine';
      shine.setAttribute('aria-hidden', 'true');
      Object.assign(shine.style, {
        position:'absolute', zIndex:'3', top:'-40%', bottom:'-40%', left:'-18%', width:'58%',
        borderRadius:'999px', pointerEvents:'none',
        background:'linear-gradient(105deg,transparent 0%,rgba(255,255,255,.035) 35%,rgba(255,255,255,.12) 50%,rgba(255,255,255,.035) 65%,transparent 100%)',
        filter:'blur(12px)', opacity:'0', transform:'translate3d(-20%,0,0)',
        willChange:'transform,opacity'
      });
      btn.appendChild(shine);
    });
    const started = performance.now();
    const animateCta = now => {
      const cycle = 6200;
      const p = ((now - started) % cycle) / cycle;
      const q = (p < .62) ? p / .62 : 1;
      const x = -20 + q * 75;
      const opacity = p > .10 && p < .62 ? Math.sin((p-.10)/.52*Math.PI) * .12 : 0;
      ctaButtons.forEach(btn => {
        const shine = btn.querySelector('.btn-glass-shine');
        if (shine) {
          shine.style.transform = `translate3d(${x}%,0,0)`;
          shine.style.opacity = String(opacity);
        }
      });
      requestAnimationFrame(animateCta);
    };
    requestAnimationFrame(animateCta);
  }

  const items = [...document.querySelectorAll('[data-reveal]')];
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('before-reveal'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    requestAnimationFrame(() => items.forEach(el => io.observe(el)));
    setTimeout(() => items.forEach(el => el.classList.add('is-visible')), 1400);
  }
})();
