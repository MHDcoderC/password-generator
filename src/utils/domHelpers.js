/**
 * =============================================================================
 * DOM HELPERS
 * =============================================================================
 *
 * توابع کمکی برای کار با DOM - این توابع کار با عناصر HTML رو استاندارد و
 * ایمن می‌کنن و از تکرار کد جلوگیری می‌کنن.
 *
 * @module domHelpers
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

/**
 * کش کردن عناصر DOM برای دسترسی سریع‌تر
 * این کلاس یه بار عناصر رو می‌گیره و در خودش نگه می‌داره
 */
export class DOMCache {
  /**
   * سازنده کلاس - یه آبجکت خالی برای کش ایجاد می‌کنه
n   */
  constructor() {
    /** @type {Object<string, HTMLElement>} */
    this.elements = {};
  }

  /**
   * گرفتن یه عنصر بر اساس ID
   * اگه عنصر قبلاً کش شده باشه، از کش برمی‌گردونه
   *
   * @param {string} id - شناسه عنصر
   * @returns {HTMLElement|null} - عنصر مورد نظر یا null
   */
  get(id) {
    if (!this.elements[id]) {
      this.elements[id] = document.getElementById(id);
    }
    return this.elements[id];
  }

  /**
   * گرفتن چندین عنصر به صورت یک‌باره
   *
   * @param {string[]} ids - آرایه‌ای از شناسه‌ها
   * @returns {Object<string, HTMLElement|null>} - آبجکت با کلیدهای id و مقادیر عناصر
   */
  getAll(ids) {
    return ids.reduce((acc, id) => {
      acc[id] = this.get(id);
      return acc;
    }, {});
  }

  /**
   * پاک کردن کش - برای مواقعی که DOM تغییر می‌کنه
   */
  clear() {
    this.elements = {};
  }
}

/**
 * ============================================
 * DOM MANIPULATION UTILITIES
 * ============================================
 */

/**
 * اضافه/حذف کلاس hidden از یه عنصر
 * این تابع accessibility attributes رو هم به‌روز می‌کنه
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {boolean} shouldHide - true برای مخفی کردن، false برای نمایش
 * @param {string} [hiddenClass='hidden'] - نام کلاس مخفی بودن
 */
export function toggleVisibility(element, shouldHide, hiddenClass = 'hidden') {
  if (!element) return;

  element.classList.toggle(hiddenClass, shouldHide);

  // به‌روزرسانی aria-hidden برای accessibility
  element.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
}

/**
 * نمایش یه عنصر (حذف کلاس hidden)
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {string} [hiddenClass='hidden'] - نام کلاس مخفی بودن
 */
export function showElement(element, hiddenClass = 'hidden') {
  toggleVisibility(element, false, hiddenClass);
}

/**
 * مخفی کردن یه عنصر (اضافه کردن کلاس hidden)
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {string} [hiddenClass='hidden'] - نام کلاس مخفی بودن
 */
export function hideElement(element, hiddenClass = 'hidden') {
  toggleVisibility(element, true, hiddenClass);
}

/**
 * تغییر وضعیت disabled یه عنصر
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {boolean} disabled - وضعیت disabled
 */
export function setDisabled(element, disabled) {
  if (!element) return;
  element.disabled = disabled;
}

/**
 * ============================================
 * EVENT HANDLING UTILITIES
 * ============================================
 */

/**
 * افزودن event listener با بررسی null
 * این تابع خطای "cannot read property of null" رو پیشگیری می‌کنه
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {string} event - نام event
 * @param {Function} handler - تابع handler
 * @param {Object} [options] - گزینه‌های event listener
 */
export function safeAddEventListener(element, event, handler, options) {
  if (!element) {
    console.warn(`[DOM] Element not found for event: ${event}`);
    return;
  }
  element.addEventListener(event, handler, options);
}

/**
 * حذف event listener با بررسی null
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {string} event - نام event
 * @param {Function} handler - تابع handler
 * @param {Object} [options] - گزینه‌های event listener
 */
export function safeRemoveEventListener(element, event, handler, options) {
  if (!element) return;
  element.removeEventListener(event, handler, options);
}

/**
 * ============================================
 * ACCESSIBILITY UTILITIES
 * ============================================
 */

/**
 * تنظیم aria-expanded برای عناصر قابل باز/بسته شدن
 *
 * @param {HTMLElement|null} element - عنصر مورد نظر
 * @param {boolean} expanded - وضعیت باز/بسته
 */
export function setAriaExpanded(element, expanded) {
  if (!element) return;
  element.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

/**
 * تنظیم aria-controls برای عناصر کنترل‌کننده
 *
 * @param {HTMLElement|null} element - عنصر کنترل‌کننده
 * @param {string} controlledId - شناسه عنصر تحت کنترل
 */
export function setAriaControls(element, controlledId) {
  if (!element) return;
  element.setAttribute('aria-controls', controlledId);
}

/**
 * ============================================
 * HTML UTILITIES
 * ============================================
 */

/**
 * Escape کردن کاراکترهای HTML برای جلوگیری از XSS
 * این تابع متن کاربر رو به فرمت امن HTML تبدیل می‌کنه
 *
 * @param {string} text - متن ورودی
 * @returns {string} - متن escape شده
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * ============================================
 * BROWSER DETECTION
 * ============================================
 */

/**
 * بررسی اینکه آیا دستگاه موبایل/تاچ است
 *
 * @returns {boolean} - true اگر دستگاه تاچ باشد
 */
export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * بررسی اینکه آیا کانتکست امن (HTTPS/localhost) است
 *
 * @returns {boolean} - true اگر کانتکست امن باشد
 */
export function isSecureContext() {
  return window.isSecureContext;
}

/**
 * بررسی پشتیبانی از Clipboard API
 *
 * @returns {boolean} - true اگر Clipboard API پشتیبانی شود
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && window.isSecureContext);
}

/**
 * بررسی پشتیبانی از Web Crypto API
 *
 * @returns {boolean} - true اگر Web Crypto API پشتیبانی شود
 */
export function isWebCryptoSupported() {
  return !!(window.crypto && window.crypto.subtle);
}
