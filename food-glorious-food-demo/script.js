const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

const closeMenu = ({ restoreFocus = false } = {}) => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
  if (restoreFocus) menuButton.focus();
};

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.hidden = isOpen;
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const destination = link.getAttribute('href');
    closeMenu();
    if (!destination?.startsWith('#')) return;
    event.preventDefault();
    requestAnimationFrame(() => {
      document.querySelector(destination)?.scrollIntoView();
      window.history.pushState(null, '', destination);
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu({ restoreFocus: true });
});

window.matchMedia('(min-width: 1121px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

document.querySelectorAll('.menu-jump a').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target instanceof HTMLDetailsElement) target.open = true;
  });
});

const galleryItems = [
  {
    src: 'assets/official/bakery-cake.webp',
    alt: 'A decorated bakery cake topped with fresh strawberries',
    title: 'From the bakery',
    caption: 'A decorated cake made at Food Glorious Food',
  },
  {
    src: 'assets/official/storefront.webp',
    alt: 'The blue and red Food Glorious Food storefront on Bryant Street',
    title: '5906 Bryant Street',
    caption: 'The real Highland Park storefront',
  },
  {
    src: 'assets/official/catering-table.webp',
    alt: 'A long catered table set with flowers inside Food Glorious Food',
    title: 'Private events',
    caption: 'An on-premise table setting at the bakery',
  },
];

const galleryDialog = document.querySelector('#gallery-dialog');
const dialogImage = document.querySelector('#gallery-dialog-image');
const dialogTitle = document.querySelector('#gallery-dialog-title');
const dialogCaption = document.querySelector('#gallery-dialog-caption');
const dialogCount = document.querySelector('#gallery-dialog-count');
const dialogClose = galleryDialog.querySelector('.dialog-close');
let currentGalleryIndex = 0;
let galleryOpener = null;

const renderGalleryItem = (index) => {
  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentGalleryIndex];
  dialogImage.src = item.src;
  dialogImage.alt = item.alt;
  dialogTitle.textContent = item.title;
  dialogCaption.textContent = item.caption;
  dialogCount.textContent = `${currentGalleryIndex + 1} of ${galleryItems.length}`;
};

document.querySelectorAll('[data-gallery-index]').forEach((button) => {
  button.addEventListener('click', () => {
    galleryOpener = button;
    renderGalleryItem(Number(button.dataset.galleryIndex));
    galleryDialog.showModal();
    document.body.classList.add('dialog-open');
  });
});

galleryDialog.querySelectorAll('[data-gallery-direction]').forEach((button) => {
  button.addEventListener('click', () => {
    renderGalleryItem(currentGalleryIndex + Number(button.dataset.galleryDirection));
  });
});

dialogClose.addEventListener('click', () => galleryDialog.close());

galleryDialog.addEventListener('click', (event) => {
  if (event.target === galleryDialog) galleryDialog.close();
});

galleryDialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    galleryDialog.close();
    return;
  }
  if (event.key === 'ArrowLeft') renderGalleryItem(currentGalleryIndex - 1);
  if (event.key === 'ArrowRight') renderGalleryItem(currentGalleryIndex + 1);
});

galleryDialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  galleryOpener?.focus();
});
