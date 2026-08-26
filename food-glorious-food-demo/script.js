const toggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.hidden = isOpen;
});

mobileMenu?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  toggle.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || mobileMenu?.hidden) return;
  toggle.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
  toggle.focus();
});

const desktopBreakpoint = window.matchMedia('(min-width: 841px)');
desktopBreakpoint.addEventListener('change', ({ matches }) => {
  if (!matches) return;
  toggle.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
});
