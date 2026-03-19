/**
 * =============================================================================
 * FORMATTERS
 * =============================================================================
 *
 * توابع قالب‌بندی برای نمایش داده‌ها به فرمت مناسب کاربر فارسی‌زبان
 *
 * @module formatters
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

/**
 * تنظیمات پیش‌فرض برای فرمت تاریخ فارسی
 * @type {Intl.DateTimeFormatOptions}
 */
const DEFAULT_DATE_OPTIONS = Object.freeze({
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

/**
 * Locale فارسی برای نمایش تاریخ
 * @type {string}
 */
const FA_LOCALE = 'fa-IR';

/**
 * گرفتن تاریخ و زمان فعلی به فرمت فارسی
 * این تابع برای نمایش زمان تولید پسورد استفاده می‌شه
 *
 * @param {Date} [date=new Date()] - آبجکت تاریخ (اختیاری، پیش‌فرض: الان)
 * @param {Intl.DateTimeFormatOptions} [options=DEFAULT_DATE_OPTIONS] - تنظیمات فرمت
 * @returns {string} - تاریخ فرمت شده به فارسی (مثال: ۱۴۰۳/۰۱/۱۵، ۱۴:۳۰)
 *
 * @example
 * getPersianTimestamp(); // "۱۴۰۳/۰۱/۱۵، ۱۴:۳۰"
 * getPersianTimestamp(new Date('2024-01-01')); // "۱۴۰۲/۱۰/۱۱، ۰۰:۰۰"
 */
export function getPersianTimestamp(
  date = new Date(),
  options = DEFAULT_DATE_OPTIONS
) {
  try {
    return date.toLocaleString(FA_LOCALE, options);
  } catch (error) {
    console.error('[Formatter] Error formatting date:', error);
    // Fallback به فرمت ساده
    return date.toLocaleString();
  }
}

/**
 * کوتاه کردن متن پسورد برای نمایش در جدول
 * اگه پسورد طولانی باشه، فقط بخش اولش رو نشون می‌ده
 *
 * @param {string} password - پسورد کامل
 * @param {number} [maxLength=20] - حداکثر طول مجاز برای نمایش
 * @returns {string} - پسورد کوتاه شده با ... در صورت نیاز
 *
 * @example
 * truncatePassword('abcdef123456789'); // 'abcdef123456789'
 * truncatePassword('abcdef123456789abcdef123456789', 10); // 'abcdef1234...'
 */
export function truncatePassword(password, maxLength = 20) {
  if (!password || typeof password !== 'string') {
    return '';
  }

  if (password.length <= maxLength) {
    return password;
  }

  return `${password.slice(0, maxLength)}...`;
}

/**
 * ============================================
 * PASSWORD FORMATTING
 * ============================================
 */

/**
 * فرمت کردن پسورد برای نمایش بهتر
 * هر ۴ کاراکتر رو با فاصله جدا می‌کنه برای خوانایی بهتر
 *
 * @param {string} password - پسورد خام
 * @returns {string} - پسورد فرمت شده
 *
 * @example
 * formatPasswordDisplay('abcd1234efgh5678'); // 'abcd 1234 efgh 5678'
 */
export function formatPasswordDisplay(password) {
  if (!password || typeof password !== 'string') {
    return '';
  }

  return password.match(/.{1,4}/g)?.join(' ') || password;
}

/**
 * ============================================
 * NUMBER FORMATTING
 * ============================================
 */

/**
 * تبدیل اعداد انگلیسی به فارسی
 * برای نمایش عدد طول پسورد به فارسی
 *
 * @param {number|string} number - عدد انگلیسی
 * @returns {string} - عدد با کاراکترهای فارسی
 *
 * @example
 * toPersianNumber(12); // '۱۲'
 * toPersianNumber('50'); // '۵۰'
 */
export function toPersianNumber(number) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  return String(number)
    .split('')
    .map(char => {
      const digit = parseInt(char, 10);
      return isNaN(digit) ? char : persianDigits[digit];
    })
    .join('');
}

/**
 * تبدیل اعداد فارسی به انگلیسی
 * برای پردازش ورودی کاربر
 *
 * @param {string} text - متن با اعداد فارسی
 * @returns {string} - متن با اعداد انگلیسی
 *
 * @example
 * fromPersianNumber('۱۲'); // '12'
 */
export function fromPersianNumber(text) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    .join('');

  return String(text)
    .split('')
    .map(char => {
      const index = persianDigits.indexOf(char);
      return index !== -1 ? String(index) : char;
    })
    .join('');
}
