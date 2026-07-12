import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: window.innerWidth <= 768,
  isTablet: window.innerWidth <= 1024 && window.innerWidth > 768,
  isDesktop: window.innerWidth > 1024,
  lowEndDevice: navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4,
  threeLoaded: false,
  webgl2: false,
};

const COLORS = {
  cyan: 0x00ffff,
  violet: 0x7c3aed,
  white: 0xffffff,
  space: 0x030307,
};

const SELECTORS = {
  ambientCanvas: '#ambientCanvas',
  heroCanvas: '#heroCanvas',
  heroBg: '#heroBg',
  heroTitleWord: '.hero-title-word',
  heroEyebrow: '.hero-eyebrow',
  heroSubtitle: '.hero-subtitle',
  heroCtas: '.hero-ctas',
  heroScroll: '#heroScroll',
  nav: '#nav',
  navToggle: '#navToggle',
  navLinks: '#navLinks',
  customCursor: '#customCursor',
  contactForm: '#contactForm',
  formStatus: '#formStatus',
  footerBuildTime: '#footerBuildTime',
  workTrack: '#workTrack',
  bgVideo: '#bgVideo',
};

const ELEMENTS = {};

function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function cacheElements() {
  Object.entries(SELECTORS).forEach(([key, sel]) => {
    ELEMENTS[key] = $(sel);
  });
}

function initReducedMotionListener() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    CONFIG.reducedMotion = e.matches;
    if (e.matches) {
      disableAllAnimations();
    } else {
      enableAnimations();
    }
  });
}

function disableAllAnimations() {
  document.documentElement.style.setProperty('--transition-fast', '0ms');
  document.documentElement.style.setProperty('--transition-base', '0ms');
  document.documentElement.style.setProperty('--transition-slow', '0ms');
  document.documentElement.style.setProperty('--transition-spring', '0ms');
  ScrollTrigger.getAll().forEach(st => st.disable());
  gsap.globalTimeline.timeScale(0);
}

function enableAnimations() {
  document.documentElement.style.removeProperty('--transition-fast');
  document.documentElement.style.removeProperty('--transition-base');
  document.documentElement.style.removeProperty('--transition-slow');
  document.documentElement.style.removeProperty('--transition-spring');
  ScrollTrigger.getAll().forEach(st => st.enable());
  gsap.globalTimeline.timeScale(1);
}

function detectDeviceCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  CONFIG.webgl2 = !!gl;
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    CONFIG.gpuRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
  }
  CONFIG.lowEndDevice = CONFIG.lowEndDevice || !CONFIG.webgl2;
}

async function initBootSequence() {
  const video = $('#bgVideo');
  if (video) {
    video.play().catch(() => {});
  }
  CONFIG.bootComplete = true;
  initHeroAnimations();
}

function hideBootSequence() {
  CONFIG.bootComplete = true;
  initHeroAnimations();
}

function initHeroAnimations() {
  if (CONFIG.reducedMotion) {
    $$('.hero-title-word').forEach(el => el.classList.add('resolved'));
    $$('.hero-eyebrow, .hero-subtitle, .hero-ctas, .hero-scroll').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6 })
    .to('.hero-title-word', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.12,
      ease: 'expo.out',
    }, '-=0.3')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero-ctas', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to('.hero-scroll', { opacity: 1, duration: 0.6 }, '-=0.2');

  $$('.hero-title-word').forEach(el => el.classList.add('resolved'));
}

function initAmbientCanvas() {
  const canvas = ELEMENTS.ambientCanvas;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationId = null;
  let particles = [];
  let gridOffset = 0;
  let scanlineY = 0;
  let lastTime = 0;

  const gridSize = 60;
  const particleCount = CONFIG.isMobile ? 30 : CONFIG.isTablet ? 60 : 100;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7 ? COLORS.violet : COLORS.cyan,
      });
    }
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -gridOffset; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = -gridOffset; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(124, 58, 237, 0.02)';
    ctx.beginPath();
    for (let x = -gridOffset + gridSize / 2; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = -gridOffset + gridSize / 2; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color === COLORS.cyan
        ? `rgba(0, 255, 255, ${p.opacity})`
        : `rgba(124, 58, 237, ${p.opacity})`;
      ctx.fill();

      ctx.shadowColor = p.color === COLORS.cyan ? '#00ffff' : '#7c3aed';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawScanline() {
    if (CONFIG.reducedMotion) return;

    ctx.fillStyle = 'rgba(0, 255, 255, 0.02)';
    ctx.fillRect(0, scanlineY, width, 2);

    scanlineY += 0.5;
    if (scanlineY > height) scanlineY = 0;
  }

  function drawNoise() {
    if (CONFIG.reducedMotion || CONFIG.lowEndDevice) return;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 30;
      data[i] = data[i + 1] = data[i + 2] = val;
      data[i + 3] = Math.random() * 10;
    }
    ctx.globalAlpha = 0.02;
    ctx.putImageData(imageData, 0, 0);
    ctx.globalAlpha = 1;
  }

  function animate(time) {
    if (CONFIG.reducedMotion) return;

    const delta = time - lastTime;
    lastTime = time;

    gridOffset = (gridOffset + delta * 0.005) % gridSize;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#030307';
    ctx.fillRect(0, 0, width, height);

    drawGrid();
    drawParticles();
    drawScanline();
    drawNoise();

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    resize();
    createParticles();
    animate(0);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    CONFIG.reducedMotion = e.matches;
    if (e.matches) {
      stop();
    } else {
      start();
    }
  });

  if (!CONFIG.reducedMotion) {
    start();
  }
}

async function initHeroVideo() {
  const video = $('#heroVideo');
  const wrap = $('#heroVideoWrap');
  const playBtn = $('#heroVideoPlay');

  if (!video || !wrap) return;

  if (CONFIG.reducedMotion) {
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
    return;
  }

  try {
    await video.play();
  } catch (e) {
    console.warn('Video autoplay prevented:', e);
  }

  if (playBtn) playBtn.remove();
}

function initCustomCursor() {
  if (!CONFIG.isDesktop || CONFIG.reducedMotion) return;

  const cursor = ELEMENTS.customCursor;
  if (!cursor) return;

  const ring = cursor.querySelector('.cursor-ring');
  const dot = cursor.querySelector('.cursor-dot');
  const text = cursor.querySelector('.cursor-text');

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let animationId = null;

  const interactiveElements = 'a, button, .btn, .work-panel, .glass-panel, .contact-channel, .nav-link, .work-link, .skill-node, .process-panel, .footer-link, .footer-social-link';

  function animate() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;

    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    animationId = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cursor.classList.contains('visible')) {
      cursor.classList.add('visible');
    }
  }

  function onMouseLeave() {
    cursor.classList.remove('visible');
  }

  function onMouseEnterInteractive(e) {
    const target = e.target.closest(interactiveElements);
    if (!target) return;

    cursor.classList.add('cursor-active');
    ring.style.width = '60px';
    ring.style.height = '60px';
    ring.style.borderColor = 'var(--color-cyan)';

    const cursorText = target.dataset.cursorText;
    if (cursorText) {
      text.textContent = cursorText;
      text.style.opacity = '1';
      text.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }

  function onMouseLeaveInteractive(e) {
    cursor.classList.remove('cursor-active');
    ring.style.width = '40px';
    ring.style.height = '40px';
    ring.style.borderColor = 'rgba(0, 255, 255, 0.5)';
    text.style.opacity = '0';
    text.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', () => {
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseover', onMouseEnterInteractive, { passive: true });
  document.addEventListener('mouseout', onMouseLeaveInteractive, { passive: true });

  animate();

  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('mouseover', onMouseEnterInteractive);
    document.removeEventListener('mouseout', onMouseLeaveInteractive);
    if (animationId) cancelAnimationFrame(animationId);
  };
}

function initNav() {
  const nav = ELEMENTS.nav;
  const toggle = ELEMENTS.navToggle;
  const links = ELEMENTS.navLinks;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    if (currentScroll > lastScroll && currentScroll > 200) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    links.classList.toggle('open');
  });

  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initScrollReveals() {
  if (CONFIG.reducedMotion) {
    $$('[data-reveal]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  $$('[data-reveal]').forEach((el, index) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  $$('.section-header').forEach(header => {
    gsap.fromTo(header,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });
}

function initWorkPinning() {
  if (CONFIG.reducedMotion || CONFIG.isMobile) return;

  const workPanels = $$('.work-panel');

  workPanels.forEach((panel, index) => {
    const preview = panel.querySelector('.work-preview');
    const content = panel.querySelector('.work-content');

    ScrollTrigger.create({
      trigger: panel,
      start: 'top center',
      end: 'bottom center',
      pin: preview,
      pinSpacing: false,
      anticipatePin: 1,
    });

    if (content) {
      gsap.fromTo(content,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: panel,
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 0.5,
          },
        }
      );
    }
  });
}

function initSkillsAnimation() {
  if (CONFIG.reducedMotion) {
    $$('.skill-ring-fg').forEach(el => {
      el.style.strokeDashoffset = '0';
    });
    return;
  }

  $$('.skill-ring').forEach(ring => {
    const progress = ring.dataset.progress;
    const circumference = 2 * Math.PI * 34;
    const offset = circumference - (progress / 100) * circumference;

    const fg = ring.querySelector('.skill-ring-fg');
    if (fg) {
      gsap.fromTo(fg,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: offset,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ring,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }
  });
}

function initContactForm() {
  const form = ELEMENTS.contactForm;
  const statusEl = ELEMENTS.formStatus;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    submitBtn.disabled = true;
    btnText.textContent = 'TRANSMITTING...';
    btnLoader.style.display = 'block';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        statusEl.className = 'form-status visible success';
        statusEl.textContent = 'MESSAGE TRANSMITTED SUCCESSFULLY';
        form.reset();
      } else {
        const data = await response.json();
        throw new Error(data.errors?.[0]?.message || 'TRANSMISSION FAILED');
      }
    } catch (err) {
      statusEl.className = 'form-status visible error';
      statusEl.textContent = `ERROR: ${err.message}`;
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'SEND MESSAGE';
      btnLoader.style.display = 'none';

      setTimeout(() => {
        statusEl.classList.remove('visible');
      }, 5000);
    }
  });
}

function initFooterBuildTime() {
  const buildTimeEl = ELEMENTS.footerBuildTime;
  if (buildTimeEl) {
    const now = new Date();
    buildTimeEl.textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} UTC`;
  }
}

async function initHeroFallingDots() {
  if (CONFIG.reducedMotion) return;

  const container = $('#heroBg');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-dots-canvas';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dots = [];
  let animationId = null;
  const dotCount = CONFIG.isMobile ? 60 : CONFIG.isTablet ? 100 : 160;

  function resize() {
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;
  }

  function createDots() {
    dots = [];
    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.7 ? COLORS.violet : COLORS.cyan,
        sway: Math.random() * Math.PI * 2,
        swayAmp: Math.random() * 15 + 5,
      });
    }
  }

  function animate() {
    if (CONFIG.reducedMotion) return;

    ctx.clearRect(0, 0, width, height);

    dots.forEach(d => {
      d.y += d.speedY;
      d.x += d.speedX + Math.sin(d.sway) * 0.15;
      d.sway += 0.01;

      if (d.y > height + 10) {
        d.y = -10;
        d.x = Math.random() * width;
      }
      if (d.x > width + 10) d.x = -10;
      if (d.x < -10) d.x = width + 10;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = d.color === COLORS.cyan
        ? `rgba(0, 255, 255, ${d.opacity})`
        : `rgba(124, 58, 237, ${d.opacity})`;
      ctx.fill();
      ctx.shadowColor = d.color === COLORS.cyan ? '#00ffff' : '#7c3aed';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Connect nearby dots with subtle lines
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.03 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    resize();
    createDots();
    animate();
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  window.addEventListener('resize', () => {
    resize();
    createDots();
  });

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    CONFIG.reducedMotion = e.matches;
    if (e.matches) stop(); else start();
  });

  start();
}

function init() {
  cacheElements();
  detectDeviceCapabilities();
  initReducedMotionListener();

  initBootSequence();
  initAmbientCanvas();
  initHeroFallingDots();
  initNav();
  initScrollReveals();
  initWorkPinning();
  initSkillsAnimation();
  initCustomCursor();
  initContactForm();
  initFooterBuildTime();

  const heroScroll = ELEMENTS.heroScroll;
  if (heroScroll) {
    heroScroll.addEventListener('click', () => {
      const aboutSection = $('#about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: CONFIG.reducedMotion ? 'auto' : 'smooth' });
      }
    });
  }

  console.log('%cDEV.SHARMA PORTFOLIO v1.0.0', 'font-family: monospace; font-size: 14px; color: #00ffff; background: #030307; padding: 4px 8px; border: 1px solid #00ffff;');
  console.log('%cBUILD COMPLETE. SYSTEMS NOMINAL.', 'font-family: monospace; font-size: 12px; color: #00ff88;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}