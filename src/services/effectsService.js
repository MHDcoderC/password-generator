import { UI_CONFIG } from '../config/constants.js';
import { isTouchDevice } from '../utils/domHelpers.js';

export function initParticleSystem(container) {
  if (!container) return;

  const count = isTouchDevice()
    ? UI_CONFIG.PARTICLE_COUNT_MOBILE
    : UI_CONFIG.PARTICLE_COUNT_DESKTOP;

  for (let i = 0; i < count; i++) {
    createParticle(container);
  }
}

export function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  const size = Math.random() * 8 + 4;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;

  const tx = (Math.random() - 0.5) * 150;
  const ty = (Math.random() - 0.5) * 150;
  particle.style.setProperty('--tx', `${tx}px`);
  particle.style.setProperty('--ty', `${ty}px`);

  const duration = Math.random() * 12 + 10;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${Math.random() * 5}s`;

  particle.addEventListener('click', () => handleParticleClick(particle, container));

  container.appendChild(particle);
  return particle;
}

function handleParticleClick(particle, container) {
  particle.classList.add('pop');

  setTimeout(() => {
    particle.remove();
    createParticle(container);
  }, 300);
}

export function initCustomCursor(cursorElement) {
  if (isTouchDevice()) {
    if (cursorElement) cursorElement.style.display = 'none';
    return;
  }

  if (!cursorElement) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  function animateCursor() {
    const lerpFactor = 0.15;
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    cursorElement.style.left = `${currentX}px`;
    cursorElement.style.top = `${currentY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  document.addEventListener('mousedown', () => {
    cursorElement.classList.add('click');
  });

  document.addEventListener('mouseup', () => {
    setTimeout(() => {
      cursorElement.classList.remove('click');
    }, 100);
  });
}

export function initLoader(loader, delay = 400) {
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, delay);
  });
}
