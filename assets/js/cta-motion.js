(() => {
  'use strict';

  // AVANGARD CTA MOTION ENGINE v1
  // Web Animations API owns the motion, isolated from the site's CSS.
  const buttons = [...document.querySelectorAll('.btn-appointment')];
  if (!buttons.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('animate' in Element.prototype)) return;

  buttons.forEach(button => {
    if (button.dataset.ctaMotionReady === '1') return;
    button.dataset.ctaMotionReady = '1';

    const shine = document.createElement('span');
    shine.setAttribute('aria-hidden', 'true');
    Object.assign(shine.style, {
      position:'absolute', zIndex:'4', top:'-70%', bottom:'-70%', left:'-55%', width:'42%',
      borderRadius:'999px', pointerEvents:'none',
      background:'linear-gradient(105deg,transparent 0%,rgba(255,255,255,.02) 24%,rgba(255,255,255,.24) 50%,rgba(255,255,255,.035) 67%,transparent 100%)',
      filter:'blur(9px)', opacity:'0', transform:'translate3d(-30%,0,0) rotate(10deg)',
      willChange:'transform,opacity'
    });
    button.appendChild(shine);

    shine.animate([
      {transform:'translate3d(-30%,0,0) rotate(10deg)',opacity:0},
      {transform:'translate3d(25%,0,0) rotate(10deg)',opacity:.08,offset:.27},
      {transform:'translate3d(250%,0,0) rotate(10deg)',opacity:.22,offset:.53},
      {transform:'translate3d(310%,0,0) rotate(10deg)',opacity:0}
    ],{duration:6800,iterations:Infinity,easing:'cubic-bezier(.37,0,.63,1)',delay:900});

    button.animate([
      {boxShadow:'0 10px 28px rgba(185,13,21,.18), inset 0 1px 0 rgba(255,255,255,.66)'},
      {boxShadow:'0 13px 32px rgba(185,13,21,.25), inset 0 1px 0 rgba(255,255,255,.80)',offset:.48},
      {boxShadow:'0 10px 28px rgba(185,13,21,.18), inset 0 1px 0 rgba(255,255,255,.66)'}
    ],{duration:5200,iterations:Infinity,easing:'ease-in-out'});
  });
})();