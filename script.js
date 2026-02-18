/* ===================== NAVBAR ===================== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Overlay for mobile menu
const overlay = document.createElement('div');
overlay.className = 'nav-overlay';
document.body.appendChild(overlay);

// Sticky nav
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// Hamburger toggle
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

// Close on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMobileMenu);
});

/* ===================== ACTIVE NAV LINK ===================== */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* ===================== SCROLL REVEAL ===================== */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ===================== PACKAGE SELECTION ===================== */
function selectPackage(pkgName) {
  const paqueteSelect = document.getElementById('paquete');
  if (paqueteSelect) {
    paqueteSelect.value = pkgName;
  }
  // Smooth scroll to contact
  document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  // Highlight the select briefly
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
  ['empresa', 'responsable', 'email', 'tipo', 'empleados', 'problema'].forEach(id => {
    showError(id, '');
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', (e) => {
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
  if (!email) {
    showError('email', 'Por favor ingresa tu correo electrónico.');
    valid = false;
  } else if (!validateEmail(email)) {
    showError('email', 'Por favor ingresa un correo válido.');
    valid = false;
  }
  if (!tipo) { showError('tipo', 'Por favor selecciona el tipo de negocio.'); valid = false; }
  if (!empleados) { showError('empleados', 'Por favor selecciona el número de empleados.'); valid = false; }
  if (!problema) { showError('problema', 'Por favor describe tu reto principal.'); valid = false; }

  if (valid) {
    // Simulate submission
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.classList.add('hidden');
      successDiv.classList.add('show');
    }, 900);
  }
});

// Live validation clear on input
['empresa', 'responsable', 'email', 'tipo', 'empleados', 'problema'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => showError(id, ''));
    el.addEventListener('change', () => showError(id, ''));
  }
});
