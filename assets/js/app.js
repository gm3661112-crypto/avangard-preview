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
  // CTA glass highlight — JS fallback for mobile browsers that do not animate CSS layers reliably.
  const ctaButtons = [...document.querySelectorAll('.btn-appointment')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (ctaButtons.length && !reduceMotion.matches) {
    ctaButtons.forEach(btn => {
      if (btn.querySelector('.btn-glass-shine')) return;
      const shine = document.createElement('span');
      shine.className = 'btn-glass-shine';
      shine.setAttribute('aria-hidden', 'true');
      Object.assign(shine.style, {
        position: 'absolute',
        zIndex: '3',
        top: '-55%',
        bottom: '-55%',
        left: '-28%',
        width: '24%',
        borderRadius: '999px',
        pointerEvents: 'none',
        background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,.10) 18%, rgba(255,255,255,.98) 50%, rgba(255,255,255,.18) 78%, transparent 100%)',
        filter: 'blur(4px)',
        opacity: '0',
        transform: 'translate3d(-180%,0,0) skewX(-16deg)',
        willChange: 'transform,opacity'
      });
      btn.appendChild(shine);
    });
    const started = performance.now();
    const animateCta = now => {
      const cycle = 3600;
      const p = ((now - started) % cycle) / cycle;
      let x = -180, opacity = 0;
      if (p > .20 && p < .60) {
        const q = (p - .20) / .40;
        x = -180 + q * 610;
        opacity = q < .55 ? q / .55 * .82 : (1 - (q - .55) / .45) * .82;
      }
      ctaButtons.forEach(btn => {
        const shine = btn.querySelector('.btn-glass-shine');
        if (shine) {
          shine.style.transform = `translate3d(${x}%,0,0) skewX(-16deg)`;
          shine.style.opacity = String(Math.max(0, opacity));
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
