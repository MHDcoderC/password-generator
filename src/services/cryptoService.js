/**
 * =============================================================================
 * CRYPTO SERVICE
 * =============================================================================
 *
 * سرویس رمزنگاری با استفاده از Web Crypto API
 * این سرویس عملیات AES-GCM encryption/decryption رو انجام می‌ده
 * برای ذخیره امن پسوردها در localStorage استفاده می‌شه
 *
 * @module cryptoService
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

import { ENCRYPTION_CONFIG, MESSAGES } from '../config/constants.js';

/**
 * ============================================
 * ERRORS
 * ============================================
 */

/**
 * کلاس خطای اختصاصی برای خطاهای رمزنگاری
 * این کلاس کمک می‌کنه خطاها رو بهتر مدیریت کنیم
 */
export class CryptoError extends Error {
  /**
   * @param {string} message - پیام خطا
   * @param {string} code - کد خطا برای دسته‌بندی
   * @param {Error} [originalError] - خطای اصلی (در صورت wrapper)
   */
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'CryptoError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * ============================================
 * KEY MANAGEMENT
 * ============================================
 */

/**
 * کش برای master key - برای جلوگیری از درخواست مکرر از کاربر
 * @type {CryptoKey|null}
 */
let cachedMasterKey = null;

/**
* دریافت Master Key کش شده
 * @returns {CryptoKey|null}
 */
export function getCachedMasterKey() {
  return cachedMasterKey;
}

/**
 * تنظیم Master Key کش شده
 * @param {CryptoKey|null} key
 */
export function setCachedMasterKey(key) {
  cachedMasterKey = key;
}

/**
 * پاک کردن Master Key کش شده
 * برای مواقعی که کاربر می‌خواد خارج بشه یا کلید جدید بده
 */
export function clearCachedMasterKey() {
  cachedMasterKey = null;
}

/**
 * اطمینان از وجود Master Key
 * این تابع چک می‌کنه که آیا کلید کش شده، و اگر نه، از کاربر می‌خواد passphrase وارد کنه
 *
 * @param {Object} options - گزینه‌ها
 * @param {boolean} [options.forceSet=false] - اجبار به تنظیم کلید جدید
 * @returns {Promise<CryptoKey>} - کلید Master
 * @throws {CryptoError} - اگه کاربر لغو کنه
 */
export async function ensureMasterKey({ forceSet = false } = {}) {
  // اگه کلید کش شده و نیاز به force نیست، از کش استفاده کن
  if (cachedMasterKey && !forceSet) {
    return cachedMasterKey;
  }

  const hint = localStorage.getItem(ENCRYPTION_CONFIG.STORAGE_KEYS.MASTER_KEY_HINT);
  let passphrase = null;

  // اگه کلید قبلاً تنظیم نشده یا forceSet فعال باشه
  if (!hint || forceSet) {
    passphrase = prompt('کلید اصلی را تعیین کنید (فراموش نکنید):');
    if (!passphrase) {
      throw new CryptoError(
        MESSAGES.ERROR.MASTER_KEY_NOT_SET,
        'MASTER_KEY_CANCELLED'
      );
    }
    // ذخیره hint که کلید تنظیم شده
    localStorage.setItem(ENCRYPTION_CONFIG.STORAGE_KEYS.MASTER_KEY_HINT, 'set');
  } else {
    // کلید قبلاً تنظیم شده، فقط از کاربر بخواه وارد کنه
    passphrase = prompt('کلید اصلی را وارد کنید:');
    if (!passphrase) {
      throw new CryptoError(
        MESSAGES.ERROR.MASTER_KEY_NOT_SET,
        'MASTER_KEY_CANCELLED'
      );
    }
  }

  // مشتق کردن کلید از passphrase
  cachedMasterKey = await deriveKeyFromPassphrase(passphrase);
  return cachedMasterKey;
}

/**
 * مشتق کردن کلید رمزنگاری از passphrase کاربر
 * این تابع با استفاده از PBKDF2 یه کلید AES-256 تولید می‌کنه
 *
 * @param {string} passphrase - عبارت عبور کاربر
 * @returns {Promise<CryptoKey>} - کلید مشتق شده
 * @throws {CryptoError} - در صورت خطا در عملیات رمزنگاری
 *
 * @example
 * const key = await deriveKeyFromPassphrase('my-secret-password');
 */
export async function deriveKeyFromPassphrase(passphrase) {
  try {
    if (!passphrase || typeof passphrase !== 'string') {
      throw new CryptoError(
        'Passphrase must be a non-empty string',
        'INVALID_PASSPHRASE'
      );
    }

    const encoder = new TextEncoder();

    // استفاده از salt ثابت - در محیط تولید باید salt تصادفی و ذخیره شده باشه
    // TODO: تغییر به salt تصادفی در نسخه بعدی
    const saltBytes = encoder.encode(ENCRYPTION_CONFIG.STATIC_SALT);

    // import passphrase به عنوان base key
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false, // extractable
      ['deriveKey']
    );

    // مشتق کردن کلید AES-256 با PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: ENCRYPTION_CONFIG.PBKDF2_ITERATIONS,
        hash: ENCRYPTION_CONFIG.PBKDF2_HASH
      },
      baseKey,
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        length: ENCRYPTION_CONFIG.KEY_LENGTH
      },
      false, // extractable
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError(
      'Failed to derive encryption key',
      'DERIVATION_FAILED',
      error
    );
  }
}

/**
 * ============================================
 * ENCRYPTION
 * ============================================
 */

/**
 * رمزنگاری رشته با AES-GCM
 * خروجی به صورت base64 encoded است
 *
 * فرمت خروجی: IV (12 bytes) + CipherText (remaining)
 * IV برای هر رمزنگاری تصادفی و یکتا است
 *
 * @param {string} plainText - متن رمزنگاری نشده
 * @param {CryptoKey} key - کلید AES
 * @returns {Promise<string>} - متن رمزنگاری شده به صورت base64
 * @throws {CryptoError} - در صورت خطا در رمزنگاری
 *
 * @example
 * const key = await deriveKeyFromPassphrase('password');
 * const encrypted = await encryptString('secret data', key);
 * // Result: "base64-encoded-string..."
 */
export async function encryptString(plainText, key) {
  try {
    if (!plainText || typeof plainText !== 'string') {
      throw new CryptoError(
        'Plain text must be a non-empty string',
        'INVALID_INPUT'
      );
    }

    if (!key) {
      throw new CryptoError(
        'Encryption key is required',
        'MISSING_KEY'
      );
    }

    const encoder = new TextEncoder();

    // تولید IV تصادفی (Initialization Vector)
    // IV برای هر رمزنگاری باید یکتا باشه اما نیازی به مخفی بودن نداره
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH));

    // رمزنگاری
    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv
      },
      key,
      encoder.encode(plainText)
    );

    // ترکیب IV + CipherText
    const output = new Uint8Array(iv.length + cipherBuffer.byteLength);
    output.set(iv, 0);
    output.set(new Uint8Array(cipherBuffer), iv.length);

    // تبدیل به base64 برای ذخیره در localStorage
    return btoa(String.fromCharCode(...output));
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError(
      MESSAGES.ERROR.ENCRYPTION_FAILED,
      'ENCRYPTION_FAILED',
      error
    );
  }
}

/**
 * ============================================
 * DECRYPTION
 * ============================================
 */

/**
 * رمزگشایی رشته با AES-GCM
 * ورودی باید به فرمت خروجی encryptString باشه
 *
 * @param {string} base64Cipher - متن رمزنگاری شده به صورت base64
 * @param {CryptoKey} key - کلید AES
 * @returns {Promise<string>} - متن رمزگشایی شده
 * @throws {CryptoError} - در صورت خطا در رمزگشایی یا کلید اشتباه
 *
 * @example
 * const key = await deriveKeyFromPassphrase('password');
 * const decrypted = await decryptString(encryptedData, key);
 * // Result: "secret data"
 */
export async function decryptString(base64Cipher, key) {
  try {
    if (!base64Cipher || typeof base64Cipher !== 'string') {
      throw new CryptoError(
        'Cipher text must be a non-empty string',
        'INVALID_INPUT'
      );
    }

    if (!key) {
      throw new CryptoError(
        'Decryption key is required',
        'MISSING_KEY'
      );
    }

    // تبدیل base64 به Uint8Array
    const rawData = Uint8Array.from(atob(base64Cipher), char => char.charCodeAt(0));

    // جدا کردن IV (12 بایت اول) از CipherText
    const iv = rawData.slice(0, ENCRYPTION_CONFIG.IV_LENGTH);
    const cipherData = rawData.slice(ENCRYPTION_CONFIG.IV_LENGTH);

    // رمزگشایی
    const plainBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv
      },
      key,
      cipherData
    );

    // تبدیل به رشته
    return new TextDecoder().decode(plainBuffer);
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }

    // بررسی خطای کلید اشتباه
    // در AES-GCM اگه کلید اشتباه باشه یا دیتا خراب شده باشه، خطا می‌ده
    throw new CryptoError(
      MESSAGES.ERROR.MASTER_KEY_INCORRECT,
      'DECRYPTION_FAILED',
      error
    );
  }
}

/**
 * ============================================
 * HASHING
 * ============================================
 */

/**
 * هش کردن پسورد با SHA-256
 * این تابع برای مقایسه پسوردها بدون ذخیره خود پسورد استفاده می‌شه
 *
 * @param {string} password - پسورد برای هش کردن
 * @returns {Promise<string>} - هش SHA-256 به صورت hex string
 *
 * @example
 * const hash = await hashPassword('my-password');
 * // Result: "a3f5... (64 chars)"
 */
export async function hashPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      throw new CryptoError(
        'Password must be a non-empty string',
        'INVALID_INPUT'
      );
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // تبدیل به hex
    return hashArray
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    throw new CryptoError(
      'Failed to hash password',
      'HASHING_FAILED',
      error
    );
  }
}

/**
 * ============================================
 * UTILITY
 * ============================================
 */

/**
 * بررسی پشتیبانی مرورگر از Web Crypto API
 *
 * @returns {boolean} - true اگر پشتیبانی شود
 */
export function isCryptoSupported() {
  return !!(window.crypto && window.crypto.subtle);
}
