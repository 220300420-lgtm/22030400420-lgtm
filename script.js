/* ===================== SCROLL PROGRESS BAR ===================== */
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
}, { passive: true });

/* ===================== NAVBAR ===================== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  overlay.classList.toggle('show', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

overlay.addEventListener('click', closeMobileMenu);

function closeMobileMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

/* ===================== ACTIVE NAV LINK ===================== */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 }).observe
? (() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => obs.observe(s));
})() : null;

/* ===================== SCROLL REVEAL ===================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===================== WORD-BY-WORD REVEAL ===================== */
const heroH1 = document.querySelector('.hero-text h1');
if (heroH1) {
  const html = heroH1.innerHTML;
  const parts = html.split(/(<em>.*?<\/em>|<br\s*\/?>|\s+)/gi);
  heroH1.innerHTML = parts.map(part => {
    if (!part.trim() || part.match(/^<br/i)) return part;
    if (part.match(/^<em>/i)) return `<span class="word-wrap"><em class="word">${part.replace(/<\/?em>/gi,'')}</em></span>`;
    return `<span class="word-wrap"><span class="word">${part}</span></span>`;
  }).join('');

  setTimeout(() => {
    heroH1.querySelectorAll('.word').forEach((word, i) => {
      setTimeout(() => word.classList.add('word-visible'), i * 90);
    });
  }, 150);
}

/* ===================== ANIMATED COUNTERS ===================== */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(tick);
}

// Assign counter data to stat cards
const counterConfigs = [
  { target: '128', prefix: '', suffix: '' },
  { target: '94', prefix: '', suffix: '%' },
  { target: '347', prefix: '', suffix: '' },
  { target: '31', prefix: '+', suffix: '%' },
];
document.querySelectorAll('.stat-num').forEach((el, i) => {
  if (counterConfigs[i]) {
    Object.assign(el.dataset, counterConfigs[i]);
    el.classList.add('counter');
    el.textContent = counterConfigs[i].prefix + '0' + counterConfigs[i].suffix;
  }
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ===================== PARALLAX HERO ===================== */
const heroBg = document.querySelector('.hero-bg');
const heroMockup = document.querySelector('.hero-mockup');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight * 1.5) {
    if (heroBg) heroBg.style.transform = `translateY(${y * 0.22}px)`;
    if (heroMockup) heroMockup.style.transform = `translateY(${y * 0.07}px)`;
  }
}, { passive: true });

/* ===================== 3D TILT ON CARDS ===================== */
function addTilt(selector, intensity = 6) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / (width / 2);
      const y = (e.clientY - top - height / 2) / (height / 2);
      card.style.transform = `perspective(800px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateY(-4px) scale(1.01)`;
      card.style.transition = 'transform 0.08s ease';
      card.style.boxShadow = '0 16px 40px rgba(0,114,255,0.18)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.45s ease, box-shadow 0.45s ease';
      card.style.boxShadow = '';
    });
  });
}

addTilt('.benefit-card', 5);
addTilt('.pkg-card', 4);
addTilt('.value-card', 5);
addTilt('.tool-card', 3);

/* ===================== WHATSAPP FLOATING BUTTON ===================== */
// ⚠️ IMPORTANTE: Cambia este número por el tuyo real
// Formato: código de país + número sin espacios ni + (ej. México: 521 + número)
const WHATSAPP_NUMBER = '5215512345678';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola Adaptia, me interesa conocer más sobre sus servicios de consultoría digital.');

const waBtn = document.createElement('a');
waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
waBtn.target = '_blank';
waBtn.rel = 'noopener noreferrer';
waBtn.id = 'whatsapp-btn';
waBtn.setAttribute('aria-label', 'Contactar por WhatsApp');
waBtn.innerHTML = `
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
  <span class="wa-tooltip">¿Hablamos?</span>
  <span class="wa-pulse"></span>
`;
document.body.appendChild(waBtn);

window.addEventListener('scroll', () => {
  waBtn.classList.toggle('wa-visible', window.scrollY > 400);
}, { passive: true });

/* ===================== PACKAGE SELECTION ===================== */
function selectPackage(pkgName) {
  const paqueteSelect = document.getElementById('paquete');
  if (paqueteSelect) paqueteSelect.value = pkgName;
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    paqueteSelect.style.transition = 'box-shadow .3s';
    paqueteSelect.style.boxShadow = '0 0 0 3px rgba(0,114,255,0.35)';
    setTimeout(() => { paqueteSelect.style.boxShadow = ''; }, 1500);
  }, 700);
}

/* ===================== FORM VALIDATION ===================== */
const form = document.getElementById('contact-form');
const successDiv = document.getElementById('form-success');

function showError(fieldId, msg) {
  const errEl = document.getElementById(`err-${fieldId}`);
  const field = document.getElementById(fieldId);
  if (errEl) errEl.textContent = msg;
  if (field) field.classList.toggle('invalid', !!msg);
}

function clearErrors() {
  ['empresa', 'responsable', 'email', 'tipo', 'empleados', 'problema'].forEach(id => showError(id, ''));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();
  let valid = true;

  const empresa = document.getElementById('empresa').value.trim();
  const responsable = document.getElementById('responsable').value.trim();
  const email = document.getElementById('email').value.trim();
  const tipo = document.getElementById('tipo').value;
  const empleados = document.getElementById('empleados').value;
  const problema = document.getElementById('problema').value.trim();

  if (!empresa) { showError('empresa', 'Por favor ingresa el nombre de tu empresa.'); valid = false; }
  if (!responsable) { showError('responsable', 'Por favor ingresa tu nombre.'); valid = false; }
  if (!email) { showError('email', 'Por favor ingresa tu correo.'); valid = false; }
  else if (!validateEmail(email)) { showError('email', 'Ingresa un correo válido.'); valid = false; }
  if (!tipo) { showError('tipo', 'Selecciona el tipo de negocio.'); valid = false; }
  if (!empleados) { showError('empleados', 'Selecciona el número de empleados.'); valid = false; }
  if (!problema) { showError('problema', 'Describe tu reto principal.'); valid = false; }

  if (valid) {
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Enviando…';
    btn.disabled = true;
    setTimeout(() => {
      form.classList.add('hidden');
      successDiv.classList.add('show');
    }, 900);
  }
});

['empresa', 'responsable', 'email', 'tipo', 'empleados', 'problema'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => showError(id, ''));
    el.addEventListener('change', () => showError(id, ''));
  }
});
