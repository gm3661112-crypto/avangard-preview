(() => {
  'use strict';

  /*
   * AVANGARD CTA MOTION ENGINE v3
   * Apple-like liquid-glass swipe.
   * ------------------------------------------------------------
   * The animation is isolated from site CSS: all visual layers are
   * created by this module and critical styles are inline !important.
   * A broad glass "lens" travels through the button, closer to the
   * feel of an iOS unlock control than to a classic shine stripe.
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

  function style(el, entries) {
    entries.forEach(([prop, value]) => setImportant(el, prop, value));
  }

  function bind(button, index = 0) {
    if (!button || states.has(button)) return;

    button.dataset.ctaMotion = 'v3';
    style(button, [
      ['position', 'relative'],
      ['isolation', 'isolate'],
      ['overflow', 'hidden']
    ]);

    const label = button.querySelector('.btn-label');
    if (label) style(label, [
      ['position', 'relative'],
      ['z-index', '7']
    ]);

    const ambient = makeLayer('av-cta-glass-ambient');
    const lens = makeLayer('av-cta-glass-lens');
    const rim = makeLayer('av-cta-glass-rim');
    const caustic = makeLayer('av-cta-glass-caustic');

    // Quiet permanent glass depth.
    style(ambient, [
      ['position', 'absolute'], ['inset', '1px'], ['z-index', '2'],
      ['border-radius', 'inherit'], ['pointer-events', 'none'],
      ['background', 'radial-gradient(115% 170% at 18% -48%, rgba(255,255,255,.28) 0%, rgba(255,255,255,.08) 36%, transparent 59%), linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,0) 52%, rgba(77,0,7,.045))'],
      ['box-shadow', 'inset 0 1px 0 rgba(255,255,255,.38), inset 0 -1px 0 rgba(91,0,8,.09)'],
      ['opacity', '.92'], ['transform', 'translate3d(0,0,0)'],
      ['will-change', 'opacity,transform']
    ]);

    // Moving liquid-glass puck / lens.
    style(lens, [
      ['position', 'absolute'], ['top', '5px'], ['bottom', '5px'], ['left', '0'],
      ['width', '54px'], ['z-index', '4'], ['border-radius', '999px'],
      ['pointer-events', 'none'],
      ['background', 'radial-gradient(110% 120% at 26% 18%, rgba(255,255,255,.42) 0%, rgba(255,255,255,.17) 24%, rgba(255,255,255,.055) 52%, rgba(255,255,255,.015) 72%, transparent 100%)'],
      ['border', '1px solid rgba(255,255,255,.38)'],
      ['box-shadow', 'inset 0 1px 0 rgba(255,255,255,.72), inset 0 -1px 0 rgba(113,0,8,.10), 0 4px 14px rgba(93,0,8,.10), 0 0 18px rgba(255,255,255,.07)'],
      ['backdrop-filter', 'blur(3px) saturate(1.16) brightness(1.07)'],
      ['-webkit-backdrop-filter', 'blur(3px) saturate(1.16) brightness(1.07)'],
      ['opacity', '0'], ['transform', 'translate3d(-72px,0,0) scale(.96)'],
      ['will-change', 'transform,opacity']
    ]);

    // Bright edge on the lens, gives the rounded Apple-like glass contour.
    style(rim, [
      ['position', 'absolute'], ['top', '8px'], ['left', '0'], ['width', '49px'], ['height', '18px'],
      ['z-index', '5'], ['border-radius', '999px'], ['pointer-events', 'none'],
      ['background', 'linear-gradient(180deg, rgba(255,255,255,.58), rgba(255,255,255,.08) 62%, transparent)'],
      ['filter', 'blur(1.2px)'], ['opacity', '0'],
      ['transform', 'translate3d(-72px,0,0) scaleX(.92)'],
      ['will-change', 'transform,opacity']
    ]);

    // Secondary soft refraction trailing the glass puck. This is not a stripe.
    style(caustic, [
      ['position', 'absolute'], ['top', '-35%'], ['bottom', '-35%'], ['left', '0'],
      ['width', '76px'], ['z-index', '3'], ['border-radius', '999px'], ['pointer-events', 'none'],
      ['background', 'radial-gradient(ellipse at center, rgba(255,255,255,.18) 0%, rgba(255,255,255,.055) 42%, transparent 74%)'],
      ['filter', 'blur(10px)'], ['mix-blend-mode', 'screen'], ['opacity', '0'],
      ['transform', 'translate3d(-90px,0,0)'], ['will-change', 'transform,opacity']
    ]);

    button.append(ambient, caustic, lens, rim);

    const rect = button.getBoundingClientRect();
    const state = {
      button, ambient, lens, rim, caustic,
      width: Math.max(rect.width, 160),
      height: Math.max(rect.height, 46),
      phase: index * 840
    };
    states.set(button, state);

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(entries => {
        const rect = entries[0]?.contentRect;
        if (!rect) return;
        if (rect.width) state.width = rect.width;
        if (rect.height) state.height = rect.height;
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

  const mo = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) scan(node);
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  const smoothstep = t => t * t * (3 - 2 * t);

  function render(now) {
    const reduced = reducedMotion.matches;

    states.forEach(state => {
      const { ambient, lens, rim, caustic, width, height, phase } = state;

      if (reduced) {
        setImportant(ambient, 'opacity', '.92');
        setImportant(lens, 'opacity', '0');
        setImportant(rim, 'opacity', '0');
        setImportant(caustic, 'opacity', '0');
        return;
      }

      // Tiny stationary optical breathing, never changes button size.
      const ambientOpacity = .88 + .06 * (0.5 + 0.5 * Math.sin((now + phase) / 1850));
      const ambientDrift = Math.sin((now + phase) / 2500) * 2.2;
      setImportant(ambient, 'opacity', ambientOpacity.toFixed(3));
      setImportant(ambient, 'transform', `translate3d(${ambientDrift.toFixed(2)}px,0,0)`);

      // Apple-style swipe: one smooth glass lens pass, then a long calm pause.
      const cycle = 7600;
      const p = ((now + phase) % cycle) / cycle;
      const start = .10;
      const end = .56;

      if (p < start || p > end) {
        setImportant(lens, 'opacity', '0');
        setImportant(rim, 'opacity', '0');
        setImportant(caustic, 'opacity', '0');
        return;
      }

      const local = (p - start) / (end - start);
      const eased = smoothstep(local);
      const lensWidth = Math.max(50, Math.min(62, height * 1.02));
      const from = -lensWidth - 12;
      const to = width + 12;
      const x = from + (to - from) * eased;

      // Fade in/out softly so the lens feels like a moving optical object.
      const envelope = Math.sin(Math.PI * local);
      const lensOpacity = Math.pow(envelope, .72) * .88;
      const rimOpacity = Math.pow(envelope, .9) * .62;
      const causticOpacity = Math.pow(envelope, .78) * .36;

      const squash = 0.96 + 0.055 * Math.sin(Math.PI * local);
      const y = Math.sin(local * Math.PI) * -0.7;

      setImportant(lens, 'width', `${lensWidth.toFixed(1)}px`);
      setImportant(lens, 'transform', `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${squash.toFixed(3)})`);
      setImportant(lens, 'opacity', lensOpacity.toFixed(3));

      setImportant(rim, 'width', `${(lensWidth - 5).toFixed(1)}px`);
      setImportant(rim, 'transform', `translate3d(${(x + 2.5).toFixed(2)}px,${(y + 1).toFixed(2)}px,0) scaleX(${(0.92 + .06 * envelope).toFixed(3)})`);
      setImportant(rim, 'opacity', rimOpacity.toFixed(3));

      const trailX = x - lensWidth * .34;
      setImportant(caustic, 'transform', `translate3d(${trailX.toFixed(2)}px,0,0)`);
      setImportant(caustic, 'opacity', causticOpacity.toFixed(3));
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
