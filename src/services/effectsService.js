/**
 * =============================================================================
 * EFFECTS SERVICE
 * =============================================================================
 *
 * سرویس افکت‌های ویژوال - ذرات پس‌زمینه و کرسور سفارشی
 * این افکت‌ها فقط در دسکتاپ فعال می‌شن و در موبایل غیرفعالن
 *
 * @module effectsService
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

import { UI_CONFIG } from '../config/constants.js';
import { isTouchDevice } from '../utils/domHelpers.js';

/**
 * ============================================
 * PARTICLE SYSTEM
 * ============================================
 */

/**
 * ایجاد سیستم ذرات شناور در پس‌زمینه
 * هر ذره یه div هست که با CSS animation حرکت می‌کنه
 *
 * @param {HTMLElement} container - کانتینر ذرات (پس‌زمینه)
 */
export function initParticleSystem(container) {
  if (!container) return;

  // در دستگاه‌های تاچ تعداد کمتری ذره داشته باشیم (performance)
  const count = isTouchDevice()
    ? UI_CONFIG.PARTICLE_COUNT_MOBILE
    : UI_CONFIG.PARTICLE_COUNT_DESKTOP;

  // ایجاد ذرات اولیه
  for (let i = 0; i < count; i++) {
    createParticle(container);
  }
}

/**
 * ایجاد یه ذره جدید
 * هر ذره ویژگی‌های تصادفی (اندازه، موقعیت، سرعت) داره
 *
 * @param {HTMLElement} container - کانتینر ذره
 * @returns {HTMLElement} - ذره ایجاد شده
 */
export function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // اندازه تصادفی بین 4 تا 12 پیکسل
  const size = Math.random() * 8 + 4;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;

  // موقعیت تصادفی
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;

  // جهت حرکت تصادفی (-75px تا +75px)
  const tx = (Math.random() - 0.5) * 150;
  const ty = (Math.random() - 0.5) * 150;
  particle.style.setProperty('--tx', `${tx}px`);
  particle.style.setProperty('--ty', `${ty}px`);

  // سرعت و تاخیر تصادفی
  const duration = Math.random() * 12 + 10; // 10-22 ثانیه
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${Math.random() * 5}s`;

  // اضافه کردن تعامل کلیک
  particle.addEventListener('click', () => handleParticleClick(particle, container));

  container.appendChild(particle);
  return particle;
}

/**
 * هندل کردن کلیک روی ذره
 * ذره با انیمیشن "pop" ناپدید می‌شه و یه ذره جدید جایگزین می‌شه
 *
 * @param {HTMLElement} particle - ذره کلیک شده
 * @param {HTMLElement} container - کانتینر ذرات
 */
function handleParticleClick(particle, container) {
  // اضافه کردن کلاس pop برای انیمیشن
  particle.classList.add('pop');

  // حذف و ایجاد جدید بعد از اتمام انیمیشن
  setTimeout(() => {
    particle.remove();
    createParticle(container);
  }, 300);
}

/**
 * ============================================
 * CUSTOM CURSOR
 * ============================================
 */

/**
 * مدیریت کرسور سفارشی
 * فقط در دسکتاپ فعال می‌شه (موبایل: غیرفعال)
 *
 * @param {HTMLElement} cursorElement - عنصر کرسور
 */
export function initCustomCursor(cursorElement) {
  // در دستگاه‌های تاچ کرسور رو مخفی کن
  if (isTouchDevice()) {
    if (cursorElement) {
      cursorElement.style.display = 'none';
    }
    return;
  }

  if (!cursorElement) return;

  // موقعیت‌های هدف و فعلی
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  // آپدیت موقعیت هدف با حرکت موس
  document.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  // انیمیشن کرسور با lerp (linear interpolation)
  // این تکنیک حرکت نرم و روان رو ایجاد می‌کنه
  function animateCursor() {
    // interpolation factor - هرچی کمتر، حرکت نرم‌تر
    const lerpFactor = 0.15;

    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    // اعمال موقعیت
    cursorElement.style.left = `${currentX}px`;
    cursorElement.style.top = `${currentY}px`;

    // ادامه انیمیشن
    requestAnimationFrame(animateCursor);
  }

  // شروع انیمیشن
  animateCursor();

  // افکت کلیک
  document.addEventListener('mousedown', () => {
    cursorElement.classList.add('click');
  });

  document.addEventListener('mouseup', () => {
    setTimeout(() => {
      cursorElement.classList.remove('click');
    }, 100);
  });
}

/**
 * ============================================
 * LOADER
 * ============================================
 */

/**
 * مدیریت صفحه لودینگ اولیه
 * بعد از بارگذاری کامل صفحه، لودر رو مخفی می‌کنه
 *
 * @param {HTMLElement} loader - عنصر لودر
 * @param {number} [delay=400] - تاخیر به میلی‌ثانیه
 */
export function initLoader(loader, delay = 400) {
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, delay);
  });
}
