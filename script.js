/**
 * Portfólio Vitória Justino de Melo
 * Modal: imagem inteira, zoom em níveis, arrastar para movimentar
 * Seção Elaboração do PDF
 */

(function () {
  'use strict';

  var anoEl = document.getElementById('ano');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var href = anchor.getAttribute('href');
    if (href === '#') return;
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      }
    });
  });

  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  var navToggle = document.querySelector('.nav-toggle');
  var headerNav = document.querySelector('.header-nav');

  function toggleMobileMenu() {
    if (!headerNav) return;
    headerNav.classList.toggle('is-open');
    if (navToggle) navToggle.classList.toggle('is-open');
    document.body.style.overflow = headerNav.classList.contains('is-open') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (!headerNav) return;
    headerNav.classList.remove('is-open');
    if (navToggle) navToggle.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', toggleMobileMenu);
  document.addEventListener('click', function (e) {
    if (headerNav && headerNav.classList.contains('is-open') && !e.target.closest('.header')) closeMobileMenu();
  });

  // ========== Zoom + Pan para modais ==========
  function setupModalZoomPan(panEl, imgEl, zoomBtn, hintEl, closeFn) {
    if (!panEl || !imgEl) return;
    var zoomLevels = [1, 1.5, 2, 2.5];
    var currentZoomIndex = 0;
    var panX = 0, panY = 0;
    var isDragging = false;
    var startPanX, startPanY, startClientX, startClientY;

    function applyTransform() {
      var scale = zoomLevels[currentZoomIndex];
      panEl.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + scale + ')';
      if (hintEl) {
        if (scale > 1) hintEl.classList.add('visible');
        else hintEl.classList.remove('visible');
      }
      if (zoomBtn) {
        zoomBtn.setAttribute('title', scale > 1 ? 'Reduzir zoom (clique para ciclo)' : 'Zoom na imagem');
        zoomBtn.setAttribute('aria-label', scale > 1 ? 'Reduzir zoom' : 'Aumentar zoom');
      }
    }

    function resetView() {
      currentZoomIndex = 0;
      panX = 0;
      panY = 0;
      applyTransform();
    }

    if (zoomBtn) {
      zoomBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        currentZoomIndex = (currentZoomIndex + 1) % zoomLevels.length;
        if (currentZoomIndex === 0) {
          panX = 0;
          panY = 0;
        }
        applyTransform();
      });
    }

    panEl.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (zoomLevels[currentZoomIndex] <= 1) return;
      e.preventDefault();
      isDragging = true;
      startPanX = panX;
      startPanY = panY;
      startClientX = e.clientX;
      startClientY = e.clientY;
      panEl.classList.add('dragging');
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      panX = startPanX + (e.clientX - startClientX);
      panY = startPanY + (e.clientY - startClientY);
      applyTransform();
    });

    document.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        panEl.classList.remove('dragging');
      }
    });

    // Touch para mobile
    panEl.addEventListener('touchstart', function (e) {
      if (zoomLevels[currentZoomIndex] <= 1) return;
      if (e.touches.length !== 1) return;
      isDragging = true;
      startPanX = panX;
      startPanY = panY;
      startClientX = e.touches[0].clientX;
      startClientY = e.touches[0].clientY;
      panEl.classList.add('dragging');
    }, { passive: true });

    panEl.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      panX = startPanX + (e.touches[0].clientX - startClientX);
      panY = startPanY + (e.touches[0].clientY - startClientY);
      applyTransform();
    }, { passive: false });

    panEl.addEventListener('touchend', function () {
      isDragging = false;
      panEl.classList.remove('dragging');
    });

    applyTransform();
    return { resetView: resetView };
  }

  // ========== MODAL PEÇA ==========
  var modalPeca = document.getElementById('modalPeca');
  var modalPecaImg = document.getElementById('modalPecaImg');
  var modalPecaPan = document.getElementById('modalPecaPan');
  var modalPecaTitle = document.getElementById('modalPecaTitle');
  var modalPecaDesc = document.getElementById('modalPecaDesc');
  var btnZoomPeca = document.getElementById('btnZoom');
  var modalPecaZoomHint = document.getElementById('modalPecaZoomHint');
  var pecaZoomPan = null;

  function openModalPeca(src, title, desc) {
    if (!modalPeca || !modalPecaImg) return;
    modalPecaImg.src = src || '';
    modalPecaImg.alt = title || '';
    if (modalPecaTitle) modalPecaTitle.textContent = title || '';
    if (modalPecaDesc) modalPecaDesc.textContent = desc || '';
    if (pecaZoomPan) pecaZoomPan.resetView();
    modalPeca.setAttribute('aria-hidden', 'false');
    modalPeca.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModalPeca() {
    if (!modalPeca) return;
    modalPeca.classList.remove('is-open');
    modalPeca.setAttribute('aria-hidden', 'true');
    if (pecaZoomPan) pecaZoomPan.resetView();
    document.body.style.overflow = '';
  }

  pecaZoomPan = setupModalZoomPan(modalPecaPan, modalPecaImg, btnZoomPeca, modalPecaZoomHint, closeModalPeca);

  document.querySelectorAll('.portfolio-card[data-peça-title]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var img = card.querySelector('.portfolio-card-image img');
      if (!img) return;
      openModalPeca(img.getAttribute('src') || img.currentSrc, card.getAttribute('data-peça-title') || '', card.getAttribute('data-peça-desc') || '');
    });
  });

  modalPeca.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModalPeca);
  });
  modalPeca.addEventListener('click', function (e) {
    if (e.target === modalPeca || e.target.classList.contains('modal-backdrop')) closeModalPeca();
  });

  // ========== MODAL IMAGEM SIMPLES ==========
  var modalImg = document.getElementById('modalImagem');
  var modalImgEl = document.getElementById('modalImg');
  var modalImgPan = document.getElementById('modalImgPan');
  var btnZoomSimple = document.getElementById('btnZoomSimple');
  var modalImgZoomHint = document.getElementById('modalImgZoomHint');
  var simpleZoomPan = null;

  function openModalSimple(src, alt) {
    if (!modalImg || !modalImgEl) return;
    modalImgEl.src = src || '';
    modalImgEl.alt = alt || '';
    if (simpleZoomPan) simpleZoomPan.resetView();
    modalImg.setAttribute('aria-hidden', 'false');
    modalImg.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModalSimple() {
    if (!modalImg) return;
    modalImg.classList.remove('is-open');
    modalImg.setAttribute('aria-hidden', 'true');
    if (simpleZoomPan) simpleZoomPan.resetView();
    document.body.style.overflow = '';
  }

  simpleZoomPan = setupModalZoomPan(modalImgPan, modalImgEl, btnZoomSimple, modalImgZoomHint, closeModalSimple);

  document.querySelectorAll('.img-modal-simple').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModalSimple(this.getAttribute('src') || this.currentSrc, this.getAttribute('alt') || '');
    });
  });

  modalImg.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModalSimple);
  });
  modalImg.addEventListener('click', function (e) {
    if (e.target === modalImg || e.target.classList.contains('modal-backdrop')) closeModalSimple();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modalPeca && modalPeca.classList.contains('is-open')) closeModalPeca();
    else if (modalImg && modalImg.classList.contains('is-open')) closeModalSimple();
  });

  // Fade-in
  var fadeElements = document.querySelectorAll('.fade-in');
  var fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 }
  );
  fadeElements.forEach(function (el) { fadeObserver.observe(el); });
})();
