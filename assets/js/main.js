
// GHL Config
const GHL_TOKEN = 'pit-6e10658c-8903-4db0-9f7f-c6ec2d4a3728';
const GHL_LOC   = 'mfjOQXgc3G64dTDYevkh';
const GHL_WF    = '04f882c6-ce3c-4c04-b3cd-72637be2ac9d';
// Surrey Homes — Main JS

// Header scroll
const hdr = document.getElementById('hdr');
const stb = document.getElementById('stb');
window.addEventListener('scroll', () => {
  const s = window.scrollY > 60;
  hdr && (s ? hdr.classList.add('scrolled') : hdr.classList.remove('scrolled'));
  stb && (s ? stb.classList.add('vis') : stb.classList.remove('vis'));
}, { passive: true });

// Mobile nav
const ham = document.getElementById('ham');
const mob = document.getElementById('mob');
const mc  = document.getElementById('mc');
function openMob()  { mob && mob.classList.add('open'); ham && ham.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeMob() { mob && mob.classList.remove('open'); ham && ham.classList.remove('active'); document.body.style.overflow = ''; }
ham && ham.addEventListener('click', () => mob && mob.classList.contains('open') ? closeMob() : openMob());
mc  && mc.addEventListener('click', closeMob);
mob && mob.addEventListener('click', (e) => { if (e.target === mob) closeMob(); });

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

// Scroll to top
stb && (stb.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// Intersection Observer — fade in elements
const obs = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.style.opacity = '1';
      el.target.style.transform = 'translateY(0)';
      obs.unobserve(el.target);
    }
  });
}, { threshold: 0.08 });

// Only animate elements that are NOT in the initial viewport
const allAnimatable = document.querySelectorAll('.card, .step-card, .testi, .city-card, .prop-card');
allAnimatable.forEach(el => {
  const rect = el.getBoundingClientRect();
  // Skip elements already visible on page load
  if (rect.top > window.innerHeight) {
    el.style.cssText = 'opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease';
    obs.observe(el);
  }
});

// NOTE: Form submissions handled by ghl-forms.js — DO NOT add form handlers here
