/**
 * EMXplore — Main JavaScript
 * ==========================
 * Lightweight, dependency-free scripts for navigation,
 * hero animation, and optional wave visualiser.
 * No tracking, no analytics, no external requests.
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Mobile Navigation ──────────────────────────────────── */

  const navToggle = document.querySelector('.nav-toggle');
  const siteNav   = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open');
    });

    // Close nav when a link is clicked
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      });
    });

    // Close nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
        navToggle.focus();
      }
    });
  }

  /* ── Hero Subtle Animation ──────────────────────────────── */

  if (!prefersReducedMotion.matches) {
    const heroMedia = document.querySelector('.hero-media');
    if (heroMedia) {
      heroMedia.classList.add('animate-drift');
    }
  }

  // Listen for changes to reduced-motion preference
  prefersReducedMotion.addEventListener('change', function (e) {
    const heroMedia = document.querySelector('.hero-media');
    if (heroMedia) {
      if (e.matches) {
        heroMedia.classList.remove('animate-drift');
      } else {
        heroMedia.classList.add('animate-drift');
      }
    }
  });

  /* ── Footer Year ────────────────────────────────────────── */

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
