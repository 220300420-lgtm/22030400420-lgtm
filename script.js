/* ===================== SCROLL PROGRESS BAR ===================== */
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

function pushDataLayer(eventName, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}

function setAttributionHiddenFields() {
  const params = new URLSearchParams(window.location.search);
  const fields = {
    'utm-source': params.get('utm_source') || '',
    'utm-medium': params.get('utm_medium') || '',
    'utm-campaign': params.get('utm_campaign') || '',
    'utm-content': params.get('utm_content') || '',
    'utm-term': params.get('utm_term') || '',
    'gclid-hidden': params.get('gclid') || '',
    'fbclid-hidden': params.get('fbclid') || '',
    'referrer-hidden': document.referrer || 'direct',
    'landing-hidden': window.location.href,
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

setAttributionHiddenFields();

/* ===================== NAVBAR ===================== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  overlay.classList.toggle('show', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
overlay.addEventListener('click', closeMobileMenu);
function closeMobileMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

/* ===================== ACTIVE NAV ===================== */
const navLinkEls = document.querySelectorAll('.nav-link');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
  });
}, { threshold: 0.35 }).observe
? (() => {
  const o = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('section[id]').forEach(s => o.observe(s));
})() : null;

/* ===================== SCROLL REVEAL ===================== */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ===================== WORD-BY-WORD REVEAL ===================== */
const heroH1 = document.querySelector('.hero-text h1');
if (heroH1) {
  const html = heroH1.innerHTML;
  const parts = html.split(/(<em>.*?<\/em>|<br\s*\/?>|\s+)/gi);
  heroH1.innerHTML = parts.map(p => {
    if (!p.trim() || p.match(/^<br/i)) return p;
    if (p.match(/^<em>/i)) return `<span class="word-wrap"><em class="word">${p.replace(/<\/?em>/gi,'')}</em></span>`;
    return `<span class="word-wrap"><span class="word">${p}</span></span>`;
  }).join('');
  setTimeout(() => {
    heroH1.querySelectorAll('.word').forEach((w, i) => setTimeout(() => w.classList.add('word-visible'), i * 90));
  }, 200);
}

/* ===================== TYPEWRITER ===================== */
const phrases = [
  'Digitalizamos tu taller…',
  'Optimizamos tu inventario…',
  'Medimos tus resultados…',
  'Transformamos tu operación…'
];
const twEl = document.getElementById('typewriter');
if (twEl) {
  let pi = 0, ci = 0, deleting = false;
  function typeLoop() {
    const phrase = phrases[pi];
    if (!deleting) {
      twEl.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
    } else {
      twEl.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typeLoop, 400); return; }
    }
    setTimeout(typeLoop, deleting ? 45 : 75);
  }
  setTimeout(typeLoop, 800);
}

/* ===================== PARTICLES ===================== */
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 114, 255, ${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 114, 255, ${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

/* ===================== ANIMATED COUNTERS ===================== */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.floor(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.animated) {
      e.target.dataset.animated = 'true';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target], .impact-num[data-target]').forEach(el => counterObs.observe(el));

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

/* ===================== CONNECTOR LINE ANIMATION ===================== */
const connectorObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.connector-path').forEach(p => p.classList.add('drawn'));
      e.target.querySelectorAll('.connector-arrow').forEach(a => a.classList.add('drawn'));
      connectorObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.steps-row').forEach(el => connectorObs.observe(el));

/* ===================== 3D TILT ===================== */
function addTilt(selector, intensity = 5) {
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
addTilt('.benefit-card'); addTilt('.pkg-card', 4); addTilt('.value-card'); addTilt('.case-card');

/* ===================== WHATSAPP BUTTON ===================== */
// ⚠️ Cambia este número por el tuyo real
const WA_NUM = '5219983909502';
const WA_MSG = encodeURIComponent('Hola Adaptia, me interesa conocer más sobre sus servicios de consultoría digital.');
const waBtn = document.createElement('a');
waBtn.href = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;
waBtn.target = '_blank'; waBtn.rel = 'noopener noreferrer';
waBtn.id = 'whatsapp-btn'; waBtn.setAttribute('aria-label', 'Contactar por WhatsApp');
waBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span class="wa-tooltip">¿Hablamos?</span><span class="wa-pulse"></span>`;
document.body.appendChild(waBtn);
waBtn.addEventListener('click', () => pushDataLayer('whatsapp_click', { placement: 'floating_button' }));
window.addEventListener('scroll', () => waBtn.classList.toggle('wa-visible', window.scrollY > 400), { passive: true });

/* ===================== PACKAGE SELECTION ===================== */
function selectPackage(pkgName) {
  const sel = document.getElementById('paquete');
  if (sel) sel.value = pkgName;
  pushDataLayer('package_selected', { package_name: pkgName });
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => { sel.style.boxShadow = '0 0 0 3px rgba(0,114,255,0.35)'; setTimeout(() => sel.style.boxShadow = '', 1500); }, 700);
}

/* ===================== FORM VALIDATION ===================== */
const form = document.getElementById('contact-form');
const successDiv = document.getElementById('form-success');
const statusMsg = document.getElementById('form-status');
function showError(id, msg) {
  const e = document.getElementById(`err-${id}`), f = document.getElementById(id);
  if (e) e.textContent = msg; if (f) f.classList.toggle('invalid', !!msg);
}
function clearErrors() { ['empresa','responsable','email','tipo','empleados','problema'].forEach(id => showError(id,'')); }
function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function showFormStatus(message = '', type = '') {
  if (!statusMsg) return;
  statusMsg.textContent = message;
  statusMsg.className = 'form-status';
  if (message) {
    statusMsg.classList.add('show');
    if (type) statusMsg.classList.add(type);
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();
  let valid = true;

  const v = id => document.getElementById(id).value.trim();
  if (!v('empresa')) { showError('empresa', 'Ingresa el nombre de tu empresa.'); valid = false; }
  if (!v('responsable')) { showError('responsable', 'Ingresa tu nombre.'); valid = false; }
  if (!v('email')) { showError('email', 'Ingresa tu correo.'); valid = false; }
  else if (!validEmail(v('email'))) { showError('email', 'Correo inválido.'); valid = false; }
  if (!document.getElementById('tipo').value) { showError('tipo', 'Selecciona el tipo de negocio.'); valid = false; }
  if (!document.getElementById('empleados').value) { showError('empleados', 'Selecciona el número de empleados.'); valid = false; }
  if (!v('problema')) { showError('problema', 'Describe tu reto principal.'); valid = false; }

  if (!valid) { return; }

  // Set date before submit
  document.getElementById('fecha-hidden').value = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

  // Show loading state
  const btn = form.querySelector('[type="submit"]');
  btn.textContent = 'Enviando…';
  btn.disabled = true;
  showFormStatus('Estamos enviando tu solicitud…');

  // Submit via AJAX — show success message without redirecting
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    form.classList.add('hidden');
    successDiv.classList.add('show');
    showFormStatus('');
    pushDataLayer('lead_form_submit_success', { form_id: 'contact-form' });
  })
  .catch(() => {
    showFormStatus('No pudimos enviar tu solicitud en este momento. Intenta de nuevo en unos minutos.', 'error');
    pushDataLayer('lead_form_submit_error', { form_id: 'contact-form' });
    btn.textContent = 'Solicitar diagnóstico';
    btn.disabled = false;
  });
});
['empresa','responsable','email','tipo','empleados','problema'].forEach(id => {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', () => showError(id,'')); el.addEventListener('change', () => showError(id,'')); }
});
