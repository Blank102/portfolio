// Typing effect for the role tag — runs once on load
const roleTags = [
  document.getElementById('roleTag'),
  document.getElementById('mobileRoleTag')
].filter(Boolean);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeRoleTag(roleTag) {
  const fullText = roleTag.getAttribute('data-text');
  if (prefersReducedMotion) {
    roleTag.textContent = fullText;
    roleTag.classList.add('typing-done');
    return;
  }
  let i = 0;
  const speed = 50; // ms per character
  (function typeChar() {
    if (i <= fullText.length) {
      roleTag.textContent = fullText.slice(0, i);
      i++;
      setTimeout(typeChar, speed);
    } else {
      roleTag.classList.add('typing-done');
    }
  })();
}

// Start typing after the intro-item fade-in delay for this element (~0.2s)
setTimeout(() => {
  roleTags.forEach(typeRoleTag);
}, 250);

// Scroll-reveal for each section panel
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.panel').forEach(panel => revealObserver.observe(panel));

// Magnetic tilt effect on project cards
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(800px) translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Mobile sidebar toggle
const toggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
const menuClose = document.getElementById('menuClose');

function setMobileMenuOpen(isOpen) {
  sidebar.classList.toggle('open', isOpen);
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', isOpen);
}

toggle.addEventListener('click', () => {
  setMobileMenuOpen(!sidebar.classList.contains('open'));
});

menuClose.addEventListener('click', () => {
  setMobileMenuOpen(false);
});

// Close mobile sidebar after clicking a nav link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    setMobileMenuOpen(false);
  });
});

document.addEventListener('click', (e) => {
  if (!sidebar.classList.contains('open')) return;
  if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
  setMobileMenuOpen(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    setMobileMenuOpen(false);
  }
});

// Highlight active nav link based on scroll position
const sections = document.querySelectorAll('.panel');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(section => observer.observe(section));

// Contact form — sends to the FastAPI backend
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

const BACKEND_URL = 'https://portfolio-backend-q4jx.onrender.com/contact';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  status.textContent = 'sending...';
  status.style.color = 'var(--text-muted)';

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        message: form.message.value,
        honeypot: form.honeypot.value
      })
    });

    if (!res.ok) throw new Error('Request failed');

    status.textContent = "message sent — thanks for reaching out! I'll get back to you soon.";
    status.style.color = 'var(--status-live)';
    form.reset();
  } catch (err) {
    status.textContent = 'something went wrong — please try emailing me directly instead.';
    status.style.color = 'var(--accent)';
  } finally {
    submitBtn.disabled = false;
  }
});