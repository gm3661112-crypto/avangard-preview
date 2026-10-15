(() => {
  'use strict';

  /*
   * AVANGARD CTA MOTION ENGINE v2
   * ------------------------------------------------------------
   * The effect is intentionally independent from CSS keyframes,
   * pseudo-elements and Web Animations on the button itself.
   * It paints two private overlay layers and moves them with one
   * requestAnimationFrame loop using inline !important styles.
   * This makes later site CSS edits far less likely to break it.
   */

  const SELECTOR = '.btn-appointment';
  const states = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setImportant = (el, prop, value) => el.style.setProperty(prop, value, 'important');

  function makeLayer(className) {
    const el = document.createElement('span');
    el.className = className;
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  function bind(button, index = 0) {
    if (!button || states.has(button)) return;

    button.dataset.ctaMotion = 'v2';
    setImportant(button, 'position', 'relative');
    setImportant(button, 'isolation', 'isolate');
    setImportant(button, 'overflow', 'hidden');

    const label = button.querySelector('.btn-label');
    if (label) {
      setImportant(label, 'position', 'relative');
      setImportant(label, 'z-index', '6');
    }

    const ambient = makeLayer('av-cta-ambient');
    const sweep = makeLayer('av-cta-sweep');

    // Soft internal refraction. It never leaves the button.
    [
      ['position', 'absolute'], ['inset', '1px'], ['z-index', '3'],
      ['border-radius', 'inherit'], ['pointer-events', 'none'],
      ['background', 'radial-gradient(90% 145% at 18% -18%, rgba(255,255,255,.24) 0%, rgba(255,255,255,.08) 34%, transparent 62%)'],
      ['mix-blend-mode', 'screen'], ['opacity', '.24'],
      ['transform', 'translate3d(0,0,0)'], ['will-change', 'opacity,transform']
    ].forEach(([p, v]) => setImportant(ambient, p, v));

    // Broad moving caustic, deliberately not a thin "shine stripe".
    [
      ['position', 'absolute'], ['top', '-62%'], ['bottom', '-62%'], ['left', '0'],
      ['width', '54%'], ['z-index', '4'], ['border-radius', '999px'],
      ['pointer-events', 'none'],
      ['background', 'linear-gradient(108deg, transparent 0%, rgba(255,255,255,.025) 22%, rgba(255,255,255,.16) 44%, rgba(255,255,255,.26) 52%, rgba(255,255,255,.07) 65%, transparent 82%)'],
      ['filter', 'blur(9px)'], ['mix-blend-mode', 'screen'], ['opacity', '0'],
      ['transform', 'translate3d(-180px,0,0) rotate(11deg)'],
      ['will-change', 'transform,opacity']
    ].forEach(([p, v]) => setImportant(sweep, p, v));

    button.append(ambient, sweep);

    const state = {
      button,
      ambient,
      sweep,
      width: Math.max(button.getBoundingClientRect().width, 160),
      phase: index * 730
    };
    states.set(button, state);

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(entries => {
        const rect = entries[0]?.contentRect;
        if (rect?.width) state.width = rect.width;
      });
      ro.observe(button);
      state.ro = ro;
    }
  }

  function scan(root = document) {
    const own = root.matches?.(SELECTOR) ? [root] : [];
    const nested = root.querySelectorAll ? [...root.querySelectorAll(SELECTOR)] : [];
    [...own, ...nested].forEach((button, i) => bind(button, states.size + i));
  }

  scan();

  // Future CTA buttons added to new sections automatically inherit the effect.
  const mo = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) scan(node);
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function render(now) {
    const reduced = reducedMotion.matches;

    states.forEach(state => {
      const { ambient, sweep, width, phase } = state;

      if (reduced) {
        setImportant(ambient, 'opacity', '.26');
        setImportant(ambient, 'transform', 'translate3d(0,0,0)');
        setImportant(sweep, 'opacity', '0');
        return;
      }

      // 7.2 s cycle: ~3 s optical pass + a calm interval.
      const cycle = 7200;
      const p = ((now + phase) % cycle) / cycle;

      // Slow breathing of the glass depth, not of the button geometry.
      const breath = .23 + .07 * (0.5 + 0.5 * Math.sin((now + phase) / 1450));
      setImportant(ambient, 'opacity', breath.toFixed(3));
      const drift = Math.sin((now + phase) / 2100) * 5;
      setImportant(ambient, 'transform', `translate3d(${drift.toFixed(2)}px,0,0)`);

      // Broad reflection crosses once, then disappears for the rest of cycle.
      const start = .12;
      const end = .56;
      if (p < start || p > end) {
        setImportant(sweep, 'opacity', '0');
        return;
      }

      const local = (p - start) / (end - start);
      const eased = easeInOut(local);
      const from = -0.72 * width;
      const to = 1.38 * width;
      const x = from + (to - from) * eased;
      const opacity = Math.sin(Math.PI * local) * .46;

      setImportant(sweep, 'transform', `translate3d(${x.toFixed(2)}px,0,0) rotate(11deg)`);
      setImportant(sweep, 'opacity', opacity.toFixed(3));
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
