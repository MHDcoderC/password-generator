/**
 * =============================================================================
 * PASSWORD SERVICE
 * =============================================================================
 *
 * سرویس تولید و مدیریت پسوردها
 * شامل منطق تولید پسورد تصادفی، ارزیابی قدرت، و مدیریت تاریخچه
 *
 * @module passwordService
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

import {
  CHAR_SETS,
  PASSWORD_CONFIG,
  ENCRYPTION_CONFIG,
  MESSAGES
} from '../config/constants.js';

import {
  encryptString,
  decryptString,
  hashPassword,
  getCachedMasterKey,
  CryptoError
} from './cryptoService.js';

import { getPersianTimestamp } from '../utils/formatters.js';

/**
 * ============================================
 * TYPES
 * ============================================
 */

/**
 * گزینه‌های تولید پسورد
 * @typedef {Object} PasswordOptions
 * @property {boolean} uppercase - استفاده از حروف بزرگ
 * @property {boolean} lowercase - استفاده از حروف کوچک
 * @property {boolean} numbers - استفاده از اعداد
 * @property {boolean} symbols - استفاده از نمادها
 */

/**
 * نتیجه تولید پسورد
 * @typedef {Object} PasswordGenerationResult
 * @property {string} password - پسورد تولید شده
 * @property {number} score - امتیاز قدرت (0-6)
 * @property {string} strengthLabel - برچسب قدرت
 */

/**
 * ورودی تاریخچه پسورد
 * @typedef {Object} PasswordHistoryEntry
 * @property {string} name - نام پسورد
 * @property {string|null} password - پسورد (اif not encrypted)
 * @property {string|null} encrypted - پسورد رمزنگاری شده
 * @property {string} hashedPassword - هش SHA-256 پسورد
 * @property {string} timestamp - زمان تولید به فارسی
 */

/**
 * ============================================
 * ERRORS
 * ============================================
 */

/**
 * کلاس خطا برای خطاهای مرتبط با پسورد
 */
export class PasswordError extends Error {
  /**
   * @param {string} message - پیام خطا
   * @param {string} code - کد خطا
   * @param {Error} [originalError] - خطای اصلی
   */
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'PasswordError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * ============================================
 * PASSWORD GENERATION
 * ============================================
 */

/**
 * تولید پسورد تصادفی امن
 * این تابع از Crypto API برای تولید اعداد تصادفی امن استفاده می‌کنه
 *
 * الگوریتم:
 * 1. ترکیب کاراکترهای انتخاب شده
 * 2. تضمین وجود حداقل یه کاراکتر از هر دسته انتخاب شده
 * 3. پر کردن بقیه به صورت تصادفی
 * 4. به‌هم‌ریختن (shuffle) نهایی برای تصادفی‌سازی بیشتر
 *
 * @param {number} length - طول پسورد
 * @param {PasswordOptions} options - گزینه‌های تولید
 * @returns {PasswordGenerationResult|null} - نتیجه تولید یا null در صورت خطا
 *
 * @example
 * const result = generatePassword(12, {
 *   uppercase: true,
 *   lowercase: true,
 *   numbers: true,
 *   symbols: false
 * });
 * // { password: "AbC1dE2FgH3", score: 4, strengthLabel: "strong" }
 */
export function generatePassword(length, options) {
  try {
    // اعتبارسنجی طول
    if (length < PASSWORD_CONFIG.MIN_LENGTH || length > PASSWORD_CONFIG.MAX_LENGTH) {
      throw new PasswordError(
        MESSAGES.ERROR.INVALID_LENGTH,
        'INVALID_LENGTH'
      );
    }

    // اعتبارسنجی گزینه‌ها
    const selectedOptions = Object.entries(options).filter(([_, value]) => value);
    if (selectedOptions.length === 0) {
      throw new PasswordError(
        MESSAGES.ERROR.NO_CHARACTER_SELECTED,
        'NO_CHARACTER_TYPE'
      );
    }

    // بررسی اینکه طول پسورد کافی برای همه دسته‌ها باشه
    if (selectedOptions.length > length) {
      throw new PasswordError(
        `طول پسورد باید حداقل ${selectedOptions.length} کاراکتر باشد`,
        'INSUFFICIENT_LENGTH'
      );
    }

    // ساخت مجموعه کاراکترهای مجاز
    let allowedChars = '';
    for (const [key, enabled] of Object.entries(options)) {
      if (enabled && CHAR_SETS[key.toUpperCase()]) {
        allowedChars += CHAR_SETS[key.toUpperCase()];
      }
    }

    // شروع ساخت پسورد
    let password = '';
    const cryptoObj = window.crypto || window.msCrypto;

    if (cryptoObj?.getRandomValues) {
      // استفاده از تولید کننده اعداد تصادفی امن (CSPRNG)

      // گام 1: اضافه کردن حداقل یه کاراکتر از هر دسته
      for (const [key, enabled] of Object.entries(options)) {
        if (enabled && CHAR_SETS[key.toUpperCase()]) {
          const charSet = CHAR_SETS[key.toUpperCase()];
          const randomValue = new Uint32Array(1);
          cryptoObj.getRandomValues(randomValue);
          password += charSet[randomValue[0] % charSet.length];
        }
      }

      // گام 2: پر کردن بقیه طول پسورد
      const remaining = length - password.length;
      const randomValues = new Uint32Array(remaining);
      cryptoObj.getRandomValues(randomValues);

      for (let i = 0; i < remaining; i++) {
        password += allowedChars[randomValues[i] % allowedChars.length];
      }

      // گام 3: شافل تصادفی Fisher-Yates
      password = fisherYatesShuffle(password, cryptoObj);

    } else {
      // Fallback برای مرورگرهای قدیمی - از Math.random استفاده می‌کنه
      // ⚠️ این روش برای پسوردهای واقعی توصیه نمی‌شه
      console.warn('[PasswordService] Using insecure Math.random() fallback');

      for (let i = 0; i < length; i++) {
        password += allowedChars[Math.floor(Math.random() * allowedChars.length)];
      }
    }

    // محاسبه قدرت پسورد
    const strength = calculateStrength(length, selectedOptions.length);

    return {
      password,
      score: strength.score,
      strengthLabel: strength.label
    };

  } catch (error) {
    if (error instanceof PasswordError) {
      throw error;
    }
    throw new PasswordError(
      'Failed to generate password',
      'GENERATION_FAILED',
      error
    );
  }
}

/**
 * شافل Fisher-Yates با استفاده از CSPRNG
 * این الگوریتم shuffle منصفانه و تصادفی است
 *
 * @param {string} str - رشته ورودی
 * @param {Crypto} cryptoObj - آبجکت crypto
 * @returns {string} - رشته به‌هم‌ریخته
 */
function fisherYatesShuffle(str, cryptoObj) {
  const arr = str.split('');
  const n = arr.length;

  for (let i = n - 1; i > 0; i--) {
    // تولید عدد تصادفی امن بین 0 تا i
    const randomValues = new Uint32Array(1);
    cryptoObj.getRandomValues(randomValues);
    const j = randomValues[0] % (i + 1);

    // جابجایی
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

/**
 * محاسبه قدرت پسورد
 * امتیازدهی بر اساس طول و تنوع کاراکترها
 *
 * @param {number} length - طول پسورد
 * @param {number} charTypes - تعداد انواع کاراکتر (1-4)
 * @returns {{score: number, label: string}} - امتیاز و برچسب
 */
function calculateStrength(length, charTypes) {
  let score = 0;

  // امتیازدهی بر اساس طول
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;

  // امتیازدهی بر اساس تنوع کاراکتر
  // هر چه تنوع بیشتر، پسورد سخت‌تر برای حدس زدن
  score += Math.max(0, charTypes - 1);

  // تعیین برچسب بر اساس امتیاز
  if (score <= 2) {
    return { score, label: 'weak' };
  } else if (score <= 4) {
    return { score, label: 'medium' };
  } else {
    return { score, label: 'strong' };
  }
}

/**
 * ============================================
 * STRENGTH CALCULATION (FOR UI)
 * ============================================
 */

/**
 * محاسبه قدرت پسورد برای نمایش در UI
 * این تابع مقادیر input‌های صفحه رو می‌خونه
 *
 * @param {number} length - طول پسورد
 * @param {Object} checkedOptions - وضعیت چک‌باکس‌ها
 * @param {boolean} checkedOptions.uppercase
 * @param {boolean} checkedOptions.lowercase
 * @param {boolean} checkedOptions.numbers
 * @param {boolean} checkedOptions.symbols
 * @returns {{label: string, className: string}} - برچسب و کلاس CSS
 */
export function computeStrengthForUI(length, checkedOptions) {
  const typesSelected = Object.values(checkedOptions).filter(Boolean).length;

  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  score += Math.max(0, typesSelected - 1);

  if (score <= 2) {
    return { label: MESSAGES.DEFAULTS.STRENGTH_WEAK, className: 'strength-weak' };
  } else if (score <= 4) {
    return { label: MESSAGES.DEFAULTS.STRENGTH_MEDIUM, className: 'strength-medium' };
  } else {
    return { label: MESSAGES.DEFAULTS.STRENGTH_STRONG, className: 'strength-strong' };
  }
}

/**
 * ============================================
 * PASSWORD HISTORY MANAGEMENT
 * ============================================
 */

/**
 * گرفتن تاریخچه پسوردها از localStorage
 *
 * @returns {PasswordHistoryEntry[]} - آرایه‌ای از ورودی‌های تاریخچه
 */
export function getPasswordHistory() {
  try {
    const history = localStorage.getItem(ENCRYPTION_CONFIG.STORAGE_KEYS.PASSWORD_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('[PasswordService] Failed to parse password history:', error);
    return [];
  }
}

/**
 * ذخیره تاریخچه در localStorage
 *
 * @param {PasswordHistoryEntry[]} history - آرایه تاریخچه
 */
export function setPasswordHistory(history) {
  try {
    localStorage.setItem(
      ENCRYPTION_CONFIG.STORAGE_KEYS.PASSWORD_HISTORY,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('[PasswordService] Failed to save password history:', error);
    throw new PasswordError(
      'Failed to save history to localStorage',
      'STORAGE_ERROR',
      error
    );
  }
}

/**
 * اضافه کردن پسورد جدید به تاریخچه
 * اگه secureSave فعال باشه، پسورد رمزنگاری می‌شه
 *
 * @param {string} password - پسورد برای ذخیره
 * @param {string} name - نام پسورد
 * @param {boolean} secureSave - آیا رمزنگاری شود؟
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export async function addPasswordToHistory(password, name, secureSave) {
  try {
    if (!password || typeof password !== 'string') {
      throw new PasswordError('Invalid password', 'INVALID_INPUT');
    }

    // هش کردن پسورد برای مقایسه‌های بعدی
    const hashedPassword = await hashPassword(password);

    // آماده‌سازی ورودی
    /** @type {PasswordHistoryEntry} */
    const entry = {
      name: name && name.trim() ? name.trim() : MESSAGES.DEFAULTS.PASSWORD_NAME,
      password: null,      // اگه رمزنگاری شده باشه، null می‌مونه
      encrypted: null,     // اگه رمزنگاری شده باشه، این پر می‌شه
      hashedPassword,
      timestamp: getPersianTimestamp()
    };

    // رمزنگاری در صورت فعال بودن
    if (secureSave) {
      const masterKey = getCachedMasterKey();
      if (!masterKey) {
        throw new PasswordError(
          MESSAGES.ERROR.MASTER_KEY_NOT_SET,
          'MASTER_KEY_REQUIRED'
        );
      }

      try {
        entry.encrypted = await encryptString(password, masterKey);
      } catch (error) {
        throw new PasswordError(
          MESSAGES.ERROR.ENCRYPTION_FAILED,
          'ENCRYPTION_ERROR',
          error
        );
      }
    } else {
      // ذخیره متن ساده (بدون رمزنگاری)
      entry.password = password;
    }

    // اضافه به ابتدای آرایه (جدیدترین اول)
    const history = getPasswordHistory();
    history.unshift(entry);

    // ذخیره در localStorage
    setPasswordHistory(history);

    return true;

  } catch (error) {
    console.error('[PasswordService] Failed to add password to history:', error);
    if (error instanceof PasswordError) {
      throw error;
    }
    throw new PasswordError(
      'Failed to add password to history',
      'HISTORY_ADD_FAILED',
      error
    );
  }
}

/**
 * دریافت پسورد از تاریخچه (با رمزگشایی در صورت نیاز)
 *
 * @param {number} index - اندیس در آرایه تاریخچه
 * @returns {Promise<string|null>} - پسورد یا null
 */
export async function getPasswordFromHistory(index) {
  const history = getPasswordHistory();

  if (index < 0 || index >= history.length) {
    throw new PasswordError('Invalid history index', 'INVALID_INDEX');
  }

  const entry = history[index];

  // اگه plaintext ذخیره شده، مستقیم برگردون
  if (entry.password) {
    return entry.password;
  }

  // اگه رمزنگاری شده، رمزگشایی کن
  if (entry.encrypted) {
    const masterKey = getCachedMasterKey();
    if (!masterKey) {
      throw new PasswordError(
        MESSAGES.ERROR.MASTER_KEY_NOT_SET,
        'MASTER_KEY_REQUIRED'
      );
    }

    try {
      return await decryptString(entry.encrypted, masterKey);
    } catch (error) {
      throw new PasswordError(
        MESSAGES.ERROR.MASTER_KEY_INCORRECT,
        'DECRYPTION_FAILED',
        error
      );
    }
  }

  return null;
}

/**
 * حذف یه ورودی از تاریخچه
 *
 * @param {number} index - اندیس برای حذف
 * @returns {boolean} - موفقیت عملیات
 */
export function removePasswordFromHistory(index) {
  const history = getPasswordHistory();

  if (index < 0 || index >= history.length) {
    return false;
  }

  history.splice(index, 1);
  setPasswordHistory(history);

  return true;
}

/**
 * پاک کردن کل تاریخچه
 */
export function clearPasswordHistory() {
  localStorage.removeItem(ENCRYPTION_CONFIG.STORAGE_KEYS.PASSWORD_HISTORY);
}

/**
 * ============================================
 * DIFFICULTY PRESETS
 * ============================================
 */

/**
 * گرفتن تنظیمات پیش‌فرض برای یه سطح امنیتی
 *
 * @param {string} difficulty - 'easy' | 'medium' | 'hard' | 'custom'
 * @returns {Object|null} - تنظیمات یا null
 */
export function getDifficultySettings(difficulty) {
  return PASSWORD_CONFIG.DIFFICULTY_LEVELS[difficulty] || null;
}
