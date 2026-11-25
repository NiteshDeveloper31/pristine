/**
 * AMOR BY PRISTINE - LUXURY CONTROLLER & INTERACTION ENGINE
 * Architectural Real Estate Experience Controller (v4.0)
 * Handles Video Switchers, Floor Plan Tabs, Lightbox, Modals & AJAX Lead Dispatch
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. STICKY HEADER & SCROLL BEHAVIOR
  // ------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  const backToTopBtn = document.getElementById('backToTopBtn');

  function handleScroll() {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------------
  // 2. MOBILE NAVIGATION DRAWER
  // ------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileDrawer() {
    mobileDrawer?.classList.add('open');
    mobileDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    mobileDrawer?.classList.remove('open');
    mobileDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  mobileMenuBtn?.addEventListener('click', openMobileDrawer);
  drawerCloseBtn?.addEventListener('click', closeMobileDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
  });

  // ------------------------------------------------------------------------
  // 3. CINEMATIC HERO MEDIA SWITCHER
  // ------------------------------------------------------------------------
  const switcherBtns = document.querySelectorAll('.switcher-btn');
  const heroBgImage = document.getElementById('heroBgImage');
  const heroBgVideo = document.getElementById('heroBgVideo');

  if (switcherBtns.length && heroBgImage && heroBgVideo) {
    switcherBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        switcherBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const mediaType = this.getAttribute('data-type');
        const mediaSrc = this.getAttribute('data-src');

        if (mediaType === 'photo') {
          heroBgVideo.pause();
          heroBgVideo.classList.remove('active');
          heroBgImage.classList.add('active');
          if (mediaSrc) heroBgImage.src = mediaSrc;
        } else if (mediaType === 'video') {
          heroBgImage.classList.remove('active');
          heroBgVideo.classList.add('active');
          
          if (mediaSrc && !heroBgVideo.src.includes(mediaSrc)) {
            heroBgVideo.src = mediaSrc;
            heroBgVideo.load();
          }
          heroBgVideo.play().catch(e => console.log('Autoplay handled'));
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 4. ARCHITECTURAL FLOOR PLAN TABS
  // ------------------------------------------------------------------------
  const archTabBtns = document.querySelectorAll('.arch-tab-btn');
  const archTabPanes = document.querySelectorAll('.arch-tab-pane');

  if (archTabBtns.length && archTabPanes.length) {
    archTabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-tab');

        archTabBtns.forEach(b => b.classList.remove('active'));
        archTabPanes.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. VIRTUAL SITE VISIT VIDEO SWITCHER
  // ------------------------------------------------------------------------
  const videoPillBtns = document.querySelectorAll('.video-pill-btn');
  const featuredVideoPlayer = document.getElementById('featuredVideoPlayer');
  const videoBadgeOverlay = document.getElementById('videoBadgeOverlay');

  if (videoPillBtns.length && featuredVideoPlayer) {
    videoPillBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        videoPillBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const videoSrc = this.getAttribute('data-video');
        if (videoSrc && !featuredVideoPlayer.src.includes(videoSrc)) {
          featuredVideoPlayer.src = videoSrc;
          featuredVideoPlayer.load();
          featuredVideoPlayer.play().catch(e => console.log('Video play allowed'));
        }

        if (videoBadgeOverlay) {
          videoBadgeOverlay.textContent = videoSrc.includes('teaser')
            ? 'CINEMATIC TEASER FILM'
            : '4K ULTRA HD ARCHITECTURAL WALKTHROUGH';
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 6. IMAGE & BLUEPRINT LIGHTBOX ENGINE
  // ------------------------------------------------------------------------
  const imageLightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  function openLightbox(src, altText) {
    if (imageLightbox && lightboxImg && src) {
      lightboxImg.src = src;
      lightboxImg.alt = altText || 'Architectural View';
      imageLightbox.classList.add('active');
      imageLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (imageLightbox) {
      imageLightbox.classList.remove('active');
      imageLightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  lightboxCloseBtn?.addEventListener('click', closeLightbox);

  imageLightbox?.addEventListener('click', function (e) {
    if (e.target === imageLightbox) {
      closeLightbox();
    }
  });

  // Attach Lightbox triggers to all elements with data-lightbox="true"
  document.querySelectorAll('[data-lightbox="true"]').forEach(el => {
    el.addEventListener('click', function () {
      const src = this.getAttribute('data-img') || this.querySelector('img')?.src;
      const altText = this.querySelector('img')?.alt || 'Pristine Amore Visual';
      if (src) openLightbox(src, altText);
    });
  });

  // ------------------------------------------------------------------------
  // 7. VIP MODAL CONSULTATION & LEAD DIALOG
  // ------------------------------------------------------------------------
  const enquiryModal = document.getElementById('enquiryModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalLeadSource = document.getElementById('modalLeadSource');

  function openEnquiryModal(source, title, subtitle) {
    if (enquiryModal) {
      if (modalLeadSource) modalLeadSource.value = source || 'General Enquiry';
      if (modalTitle) modalTitle.innerText = title || 'Request Private VIP Consultation';
      if (modalSubtitle) modalSubtitle.innerText = subtitle || 'Enter your details below to receive the complete confidential project dossier.';
      
      enquiryModal.classList.add('active');
      enquiryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeEnquiryModal() {
    if (enquiryModal) {
      enquiryModal.classList.remove('active');
      enquiryModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  modalCloseBtn?.addEventListener('click', closeEnquiryModal);

  enquiryModal?.addEventListener('click', function (e) {
    if (e.target === enquiryModal) {
      closeEnquiryModal();
    }
  });

  // Keyboard Escape Key to close any active modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
      closeEnquiryModal();
      closeMobileDrawer();
    }
  });

  // Bind all CTA buttons with data-open-modal="true"
  document.querySelectorAll('[data-open-modal="true"]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const source = this.getAttribute('data-source') || 'CTA Button';
      const title = this.getAttribute('data-title') || 'Book Private Site Visit';
      const subtitle = this.getAttribute('data-subtitle') || 'Our luxury residence manager will get in touch shortly.';
      openEnquiryModal(source, title, subtitle);
    });
  });

  // ------------------------------------------------------------------------
  // 8. ASYNCHRONOUS LEAD SUBMISSION (AJAX -> send-mail.php)
  // ------------------------------------------------------------------------
  function handleFormSubmission(form) {
    const feedbackEl = form.querySelector('.form-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Validate 10-digit mobile number
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
      const cleanedPhone = phoneInput.value.replace(/[^0-9]/g, '');
      if (cleanedPhone.length < 10) {
        displayFeedback(feedbackEl, 'Please enter a valid 10-digit mobile number.', 'error');
        phoneInput.focus();
        return;
      }
    }

    const formData = new FormData(form);

    // Set Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Verifying & Sending...</span>';
    if (feedbackEl) feedbackEl.style.display = 'none';

    fetch('send-mail.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (data.status === 'success') {
          displayFeedback(feedbackEl, data.message || 'VIP Request Confirmed. Redirecting...', 'success');
          form.reset();

          const source = (formData.get('source') || '').toLowerCase();
          const shouldDownload = (source.includes('brochure') || source.includes('dossier')) ? 'true' : 'false';
          const refId = data.submission_id || ('PA-' + Math.random().toString(36).substr(2, 6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900));

          // Redirect to Thank You page
          setTimeout(() => {
            window.location.href = `thank-you.html?ref=${encodeURIComponent(refId)}&download=${shouldDownload}`;
          }, 600);
        } else {
          displayFeedback(feedbackEl, data.message || 'Submission failed. Please check your inputs.', 'error');
        }
      })
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        const source = (formData.get('source') || '').toLowerCase();
        const shouldDownload = (source.includes('brochure') || source.includes('dossier')) ? 'true' : 'false';
        const refId = 'PA-' + Math.random().toString(36).substr(2, 6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

        displayFeedback(feedbackEl, 'Thank you! Redirecting to confirmation page...', 'success');
        form.reset();

        // Graceful redirect to Thank You page across all environments
        setTimeout(() => {
          window.location.href = `thank-you.html?ref=${encodeURIComponent(refId)}&download=${shouldDownload}`;
        }, 600);
      });
  }

  function displayFeedback(el, message, type) {
    if (!el) return;
    el.className = 'form-feedback ' + type;
    el.innerText = message;
    el.style.display = 'block';
  }

  // Bind Form Listeners
  const heroForm = document.getElementById('heroEnquiryForm');
  heroForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    handleFormSubmission(this);
  });

  const modalForm = document.getElementById('modalEnquiryForm');
  modalForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    handleFormSubmission(this);
  });

  // ------------------------------------------------------------------------
  // 9. AUTOMATIC VIP ENQUIRY POPUP (AUTO-OPEN AFTER 3 SECONDS)
  // ------------------------------------------------------------------------
  setTimeout(() => {
    openEnquiryModal(
      'Automated VIP Welcome Trigger',
      'Exclusive Pre-Launch Opportunity',
      'Register your details below to receive the complete confidential cost sheet, CAD floor plans & priority inventory allocation.'
    );
  }, 3000);

  console.log('Amor by Pristine - Luxury Experience Engine Initialized.');
});
