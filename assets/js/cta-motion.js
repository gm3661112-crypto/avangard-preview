(() => {
  'use strict';

  /*
   * CTA motion retired.
   * The current AVANGARD CTA is a static Liquid Glass component.
   * Keep this tiny compatibility file while older preview HTML may still reference it.
   */
  const obsolete = [
    '.btn-glass-shine',
    '.av-cta-ambient',
    '.av-cta-sweep',
    '.av-cta-glass-ambient',
    '.av-cta-glass-lens',
    '.av-cta-glass-rim',
    '.av-cta-glass-caustic'
  ];

  document.querySelectorAll(obsolete.join(',')).forEach(node => node.remove());
  document.querySelectorAll('.btn-appointment').forEach(button => {
    button.dataset.ctaMotion = 'off';
  });
})();
