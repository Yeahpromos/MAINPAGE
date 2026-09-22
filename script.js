import { gsap } from 'gsap';

const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress span');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const visualQa = new URLSearchParams(window.location.search).has('visual-qa');

if (visualQa) document.documentElement.classList.add('visual-qa');

const updateScrollUI = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('scrolled', y > 48);
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  document.documentElement.style.setProperty('--page-scroll', `${y}px`);
};

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

menuToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  mobileMenu.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  mobileMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  if (visualQa) element.classList.add('visible');
  else revealObserver.observe(element);
});

const wordRotator = document.querySelector('[data-word-rotator]');
if (wordRotator) {
  const words = (wordRotator.dataset.words || wordRotator.textContent || 'move').split('|').filter(Boolean);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let wordIndex = 0;

  const makeWordLayer = (word) => {
    const layer = document.createElement('span');
    layer.className = 'word-layer';
    layer.setAttribute('aria-label', word);
    [...word].forEach((character, index) => {
      const span = document.createElement('span');
      span.className = 'word-char';
      span.style.setProperty('--char-index', index);
      span.textContent = character;
      layer.appendChild(span);
    });
    return layer;
  };

  // The reference page remounts one lightweight character row per word.
  // Keeping a single layer avoids overlapping transforms, layout thrash, and
  // the mid-transition DOM cleanup that made the previous version hitch.
  const showWord = (word, animate = true) => {
    const layer = makeWordLayer(word);
    wordRotator.replaceChildren(layer);
    wordRotator.classList.toggle('is-entering', animate && !reducedMotion);
    requestAnimationFrame(() => {
      // The underline is measured once per word, after the browser has laid out
      // the new row. It no longer participates in the character animation.
      const width = Math.max(44, Math.round(layer.getBoundingClientRect().width * 0.76));
      wordRotator.style.setProperty('--underline-width', `${width}px`);
    });
  };

  showWord(words[0], !visualQa);
  if (!visualQa && !reducedMotion && words.length > 1) {
    window.setInterval(() => {
      wordIndex = (wordIndex + 1) % words.length;
      showWord(words[wordIndex]);
    }, 2500);
  }
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const duration = 1300;
    const start = performance.now();
    const tick = (time) => {
      const p = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      element.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(element);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((item) => {
  if (visualQa) item.textContent = Number(item.dataset.count).toLocaleString('en-US');
  else countObserver.observe(item);
});

const processSteps = [...document.querySelectorAll('[data-process-step]')];
let activeProcess = 0;
const advanceProcess = () => {
  if (processSteps.length < 2) return;
  activeProcess = (activeProcess + 1) % processSteps.length;
  processSteps.forEach((step, index) => step.classList.toggle('active', index === activeProcess));
};

const makeCardSlot = (index, distanceX, distanceY, total) => ({
  x: index * distanceX,
  y: -index * distanceY,
  z: -index * distanceX * 1.5,
  zIndex: total - index,
});

const setupCardSwap = (container) => {
  const cards = [...container.querySelectorAll('[data-card-swap-card]')];
  if (cards.length < 2) return 0;

  const distanceX = Number(container.dataset.cardDistance) || 60;
  const distanceY = Number(container.dataset.verticalDistance) || 70;
  const delay = Number(container.dataset.delay) || 5000;
  const skewAmount = Number(container.dataset.skewAmount) || 6;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const config = {
    ease: 'elastic.out(0.6,0.9)',
    durDrop: 2,
    durMove: 2,
    durReturn: 2,
    promoteOverlap: 0.9,
    returnDelay: 0.05,
  };
  const order = cards.map((_, index) => index);
  let timeline = null;
  let intervalId = null;

  cards.forEach((card, index) => {
    gsap.set(card, {
      ...makeCardSlot(index, distanceX, distanceY, cards.length),
      xPercent: -50,
      yPercent: -50,
      skewY: skewAmount,
      transformOrigin: 'center center',
      force3D: true,
    });
  });

  const swap = () => {
    if (order.length < 2) return;

    const [front, ...rest] = order;
    const frontCard = cards[front];
    timeline?.kill();
    timeline = gsap.timeline({ onComplete: () => { order.splice(0, order.length, ...rest, front); } });

    timeline.to(frontCard, {
      y: '+=500',
      duration: config.durDrop,
      ease: config.ease,
    });
    timeline.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

    rest.forEach((cardIndex, index) => {
      const card = cards[cardIndex];
      const slot = makeCardSlot(index, distanceX, distanceY, cards.length);
      timeline.set(card, { zIndex: slot.zIndex }, 'promote');
      timeline.to(card, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        duration: config.durMove,
        ease: config.ease,
      }, `promote+=${index * 0.15}`);
    });

    const backSlot = makeCardSlot(cards.length - 1, distanceX, distanceY, cards.length);
    timeline.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    timeline.call(() => gsap.set(frontCard, { zIndex: backSlot.zIndex }), undefined, 'return');
    timeline.to(frontCard, {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      duration: config.durReturn,
      ease: config.ease,
    }, 'return');
  };

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
    timeline?.pause();
  };

  const start = () => {
    if (reducedMotion || visualQa) return;
    timeline?.play();
    clearInterval(intervalId);
    intervalId = window.setInterval(swap, delay);
  };

  if (!reducedMotion && !visualQa) {
    swap();
    intervalId = window.setInterval(swap, delay);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  return delay;
};

const cardSwapDelay = setupCardSwap(document.querySelector('[data-card-swap]')) || 4000;
if (!visualQa && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(advanceProcess, cardSwapDelay);
}

const clock = document.querySelector('[data-clock]');
const updateClock = () => {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
};
updateClock();
setInterval(updateClock, 1000);

const rail = document.querySelector('[data-drag-rail]');
let dragging = false;
let dragStart = 0;
let scrollStart = 0;
rail.addEventListener('pointerdown', (event) => {
  dragging = true;
  dragStart = event.clientX;
  scrollStart = rail.scrollLeft;
  rail.classList.add('dragging');
  rail.setPointerCapture(event.pointerId);
});
rail.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  rail.scrollLeft = scrollStart - (event.clientX - dragStart) * 1.35;
});
const stopDragging = () => { dragging = false; rail.classList.remove('dragging'); };
rail.addEventListener('pointerup', stopDragging);
rail.addEventListener('pointercancel', stopDragging);
rail.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) rail.scrollLeft += event.deltaY;
}, { passive: true });

class ParticleSphere {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.color = options.color || '#ff312e';
    this.mutedColor = options.mutedColor || '#6f6863';
    this.backColor = options.backColor || '#322b28';
    this.count = options.count || 520;
    this.glyphs = options.glyphs || ['·', '+', '▪', 'I'];
    this.radiusScale = options.radiusScale || 0.42;
    this.ringMode = options.ringMode || false;
    this.edgeBias = options.edgeBias || 1.8;
    this.maxDpr = options.maxDpr || 1.15;
    this.maxPixels = options.maxPixels || 880;
    this.points = this.createPoints();
    this.rotation = 0;
    this.lastFrame = 0;
    this.rotationRate = options.loopDuration
      ? (Math.PI * 2) / (options.loopDuration * 1000)
      : options.rotationRate || 0.00012;
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    requestAnimationFrame(this.draw);
  }

  createPoints() {
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let index = 0; index < this.count; index += 1) {
      const y = 1 - (index / (this.count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * index;
      const seed = Math.abs(Math.sin(index * 12.9898 + 78.233) * 43758.5453) % 1;
      points.push({
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
        glyph: this.glyphs[Math.floor(seed * this.glyphs.length) % this.glyphs.length],
        scale: 0.72 + seed * 0.72,
        tone: Math.abs(Math.sin(index * 7.173 + 1.9)),
      });
    }
    return points;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    // The target deliberately renders its 800px hero canvas at DPR 1. A
    // capped backing store keeps text rasterisation cheap on retina screens
    // while the CSS size still gives us the large, soft halo.
    const dpr = Math.max(
      0.75,
      Math.min(window.devicePixelRatio || 1, this.maxDpr, this.maxPixels / Math.max(rect.width, rect.height)),
    );
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw(timestamp = 0) {
    const ctx = this.ctx;
    const size = Math.min(this.width, this.height);
    const radius = size * this.radiusScale;
    const cx = this.width * 0.53;
    const cy = this.height * 0.5;
    const elapsed = this.lastFrame ? Math.min(timestamp - this.lastFrame, 40) : 16.67;
    this.lastFrame = timestamp;
    this.rotation = (this.rotation + elapsed * this.rotationRate) % (Math.PI * 2);
    const pathTilt = -0.12 + Math.sin(this.rotation) * 0.035;
    ctx.clearRect(0, 0, this.width, this.height);

    const cosY = Math.cos(this.rotation);
    const sinY = Math.sin(this.rotation);
    const cosX = Math.cos(pathTilt);
    const sinX = Math.sin(pathTilt);

    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw in a single allocation-free pass. Glyphs are transparent and do
    // not need depth sorting; removing the per-frame map/sort/forEach chain is
    // the main difference between a steady 60fps loop and intermittent GC
    // pauses on large canvases.
    for (let index = 0; index < this.points.length; index += 1) {
      const point = this.points[index];
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const perspective = 1 / (1.85 - z2 * 0.48);
      const x = cx + x1 * radius * perspective;
      const y = cy + y1 * radius * perspective;
      // A perspective-projected sphere reaches roughly 70% of its model radius
      // on screen; normalize against that silhouette so the outer halo remains visible.
      // Keep this branch square-only: sqrt + pow for every glyph was visible as
      // a periodic frame spike on large screens.
      const radialPosition = Math.min(
        1,
        ((x - cx) ** 2 + (y - cy) ** 2) / (radius * radius * 0.49),
      );
      const edgeWeight = this.ringMode
        ? 0.25 + 0.75 * radialPosition
        : 1;
      const alpha = this.ringMode
        ? Math.max(0.16, Math.min(0.9, 0.18 + (z2 + 1) * 0.32))
        : Math.max(0.14, Math.min(0.9, 0.16 + (z2 + 1) * 0.31));
      const isBrandGlyph = point.glyph === 'Y' || point.glyph === 'P';
      const depthWeight = z2 < -0.15 ? (this.ringMode ? 0.62 : 0.52) : 1;
      ctx.globalAlpha = alpha * edgeWeight * depthWeight;
      ctx.fillStyle = isBrandGlyph && point.tone > (this.ringMode ? 0.66 : 0.28)
        ? this.color
        : z2 > 0.18 ? this.mutedColor : this.backColor;
      ctx.fillText(point.glyph, x, y);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(this.draw);
  }
}

const heroCanvas = document.querySelector('#particle-sphere');
const contactCanvas = document.querySelector('#contact-canvas');
if (heroCanvas) {
  new ParticleSphere(heroCanvas, {
    count: 840,
    color: '#ff4a46',
    mutedColor: '#96918d',
    backColor: '#bdb9b5',
    glyphs: ['Y', 'P', '+', '·', '▪', '—', '╱', 'Y', 'P'],
    radiusScale: 0.5,
    loopDuration: 6,
    ringMode: true,
    edgeBias: 1.55,
    maxDpr: 1.15,
    maxPixels: 880,
  });
}
if (contactCanvas) new ParticleSphere(contactCanvas, { count: 300, color: '#ff312e', glyphs: ['·', '+', 'Y', 'P'], maxDpr: 1.15, maxPixels: 880 });
