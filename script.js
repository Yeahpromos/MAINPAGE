const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress span');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

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
  revealObserver.observe(element);
});

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

document.querySelectorAll('[data-count]').forEach((item) => countObserver.observe(item));

const processSteps = [...document.querySelectorAll('[data-process-step]')];
let activeProcess = 0;
const advanceProcess = () => {
  activeProcess = (activeProcess + 1) % processSteps.length;
  processSteps.forEach((step, index) => step.classList.toggle('active', index === activeProcess));
};
setInterval(advanceProcess, 4000);

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
    this.color = options.color || '#ff3951';
    this.count = options.count || 520;
    this.glyphs = options.glyphs || ['·', '+', '▪', 'I'];
    this.pointer = { x: 0, y: 0 };
    this.points = this.createPoints();
    this.rotation = 0;
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', (event) => {
      this.pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.65;
      this.pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.42;
    }, { passive: true });
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
      points.push({
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
        glyph: this.glyphs[index % this.glyphs.length],
      });
    }
    return points;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw() {
    const ctx = this.ctx;
    const size = Math.min(this.width, this.height);
    const radius = size * 0.42;
    const cx = this.width * 0.53;
    const cy = this.height * 0.5;
    const scrollRotation = window.scrollY * 0.0007;
    this.rotation += 0.0022;
    ctx.clearRect(0, 0, this.width, this.height);

    const cosY = Math.cos(this.rotation + scrollRotation + this.pointer.x);
    const sinY = Math.sin(this.rotation + scrollRotation + this.pointer.x);
    const cosX = Math.cos(-0.12 + this.pointer.y);
    const sinX = Math.sin(-0.12 + this.pointer.y);

    const projected = this.points.map((point) => {
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const perspective = 1 / (1.85 - z2 * 0.48);
      return { x: cx + x1 * radius * perspective, y: cy + y1 * radius * perspective, z: z2, p: perspective, glyph: point.glyph };
    }).sort((a, b) => a.z - b.z);

    projected.forEach((point) => {
      const alpha = Math.max(0.08, Math.min(0.76, 0.13 + (point.z + 1) * 0.25));
      const fontSize = 7 + point.p * 8;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = point.z > 0.45 ? this.color : '#6f6863';
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillText(point.glyph, point.x, point.y);
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(this.draw);
  }
}

const heroCanvas = document.querySelector('#particle-sphere');
const contactCanvas = document.querySelector('#contact-canvas');
if (heroCanvas) new ParticleSphere(heroCanvas, { count: 680 });
if (contactCanvas) new ParticleSphere(contactCanvas, { count: 390, color: '#ff3951', glyphs: ['·', '+', 'Y', 'P'] });
