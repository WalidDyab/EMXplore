
(function () {
  'use strict';
  document.documentElement.classList.add('ra-js');
  const slides = Array.from(document.querySelectorAll('.ra-slide'));
  const links = Array.from(document.querySelectorAll('.ra-toc a[href^="#slide-"]'));
  const progress = document.querySelector('[data-progress]');
  function setActive(slide) {
    if (!slide) return;
    const n = Number(slide.dataset.slide || '1');
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + slide.id));
    if (progress) progress.textContent = 'Slide ' + n + ' / ' + slides.length;
  }

  const toc = document.querySelector('.ra-toc');
  const tocToggle = document.querySelector('.ra-mobile-toc-toggle');
  if (toc && tocToggle) {
    tocToggle.addEventListener('click', () => {
      const open = toc.classList.toggle('is-open');
      tocToggle.setAttribute('aria-expanded', String(open));
    });
    toc.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toc.classList.remove('is-open');
        tocToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('.ra-chapter button').forEach((button) => {
    button.addEventListener('click', () => {
      const chapter = button.closest('.ra-chapter');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      chapter.classList.toggle('is-collapsed', expanded);
      button.setAttribute('aria-expanded', String(!expanded));
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target);
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.35, 0.6] });
    slides.forEach((slide) => observer.observe(slide));
  }
  setActive(document.querySelector(location.hash) || slides[0]);
})();
