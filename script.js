/* =============================================
   ORENA — Mine the Markets
   JavaScript: Animations, Particles, Interactivity
   ============================================= */

// ─── Navbar Scroll Effect ────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ─── Mobile Menu ─────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── Particle System ─────────────────────────────────────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.opacitySpeed = (Math.random() - 0.5) * 0.01;

    // Color: purple or cyan
    const colors = [
      `rgba(139, 92, 246, ${this.opacity})`,
      `rgba(6, 182, 212, ${this.opacity})`,
      `rgba(245, 158, 11, ${this.opacity * 0.5})`,
      `rgba(255, 255, 255, ${this.opacity * 0.3})`,
    ];
    this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    this.colorIndex = Math.floor(Math.random() * colors.length);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity += this.opacitySpeed;

    if (this.opacity <= 0.05 || this.opacity >= 0.6) {
      this.opacitySpeed *= -1;
    }

    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.colorBase;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Initialize particles
function initParticles() {
  const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

// Draw connecting lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        const opacity = (1 - dist / 120) * 0.15;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = 'rgba(139, 92, 246, 1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  drawConnections();
  animationId = requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ─── Counter Animation ────────────────────────────────────────────────────────
function animateCounter(el, target, duration = 1500) {
  const start = Date.now();
  const initial = 0;

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = Math.round(initial + (target - initial) * eased);
    el.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ─── Intersection Observer for Scroll Reveals ────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Trigger counters if applicable
      const counters = entry.target.querySelectorAll('[data-target]');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
      });

      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

// Observe all elements with .reveal class
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Observe hero stats for counter
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('[data-target]').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        animateCounter(el, target);
      });
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

// ─── Add Reveal Classes Dynamically ──────────────────────────────────────────
function addRevealClasses() {
  const selectors = [
    { sel: '.section-header', delay: '' },
    { sel: '.about-card', delay: true },
    { sel: '.feature-card', delay: true },
    { sel: '.step-card', delay: true },
    { sel: '.post-card', delay: true },
    { sel: '.cta-content', delay: '' },
  ];

  selectors.forEach(({ sel, delay }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (delay && i < 6) {
        el.classList.add(`reveal-delay-${i + 1}`);
      }
      revealObserver.observe(el);
    });
  });
}

addRevealClasses();

// ─── Smooth Scroll for Anchor Links ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  });
});

// ─── Crystal Parallax Effect ─────────────────────────────────────────────────
const crystals = document.querySelectorAll('.crystal');

window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  crystals.forEach((crystal, i) => {
    const factor = (i + 1) * 8;
    const dx = x * factor;
    const dy = y * factor;
    crystal.style.transform = `translate(${dx}px, ${dy}px)`;
  });
}, { passive: true });

// ─── Active Nav Link on Scroll ────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--clr-primary-light)';
        }
      });
    }
  });
}, { passive: true });

// ─── Glowing Crystal on Hover ─────────────────────────────────────────────────
crystals.forEach(crystal => {
  crystal.addEventListener('mouseenter', () => {
    crystal.querySelector('.crystal-glow').style.opacity = '0.9';
    crystal.querySelector('.crystal-glow').style.filter = 'blur(4px)';
  });

  crystal.addEventListener('mouseleave', () => {
    crystal.querySelector('.crystal-glow').style.opacity = '0.5';
    crystal.querySelector('.crystal-glow').style.filter = 'blur(8px)';
  });
});

// ─── Console Easter Egg ───────────────────────────────────────────────────────
console.log(`%c
  ██████╗ ██████╗ ███████╗███╗   ██╗ █████╗ 
 ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗
 ██║   ██║██████╔╝█████╗  ██╔██╗ ██║███████║
 ██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
 ╚██████╔╝██║  ██║███████╗██║ ╚████║██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝
`, 'color: #8b5cf6; font-family: monospace;');
console.log('%cMine the Markets. 💎 | @OrenaLiquid', 'color: #06b6d4; font-size: 14px; font-weight: bold;');
console.log('%cThe first gamified liquidity layer for tokenized stocks on Robinhood Chain.', 'color: #a78bfa; font-size: 12px;');
