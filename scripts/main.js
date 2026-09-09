document.documentElement.classList.add('js');
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var SEL = 'figure, .project, .cat-card, .role-grid, .section-head, .next-case, .ending-summary';
  var tries = 0;
  function init() {
    var els = document.querySelectorAll(SEL);
    if (!els.length) {
      if (tries++ < 60) { setTimeout(init, 250); }
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }
  init();
})();
