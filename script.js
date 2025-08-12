const heroImages = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1531177071257-c329398b5397?auto=format&fit=crop&w=1950&q=80'
];

let current = 0;
function cycleHero() {
  const hero = document.querySelector('.hero');
  current = (current + 1) % heroImages.length;
  hero.style.backgroundImage = `url('${heroImages[current]}')`;
}
setInterval(cycleHero, 5000);

const form = document.getElementById('applyForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('This demo does not process payments. Please integrate Stripe or PayPal.');
  });
}
