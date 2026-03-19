/**
 * =============================================================================
 * CONFIGURATION CONSTANTS
 * =============================================================================
 *
 * این فایل شامل تمام ثابت‌های پیکربندی برنامه است.
 * جدا کردن ثابت‌ها از منطق برنامه، نگهداری و تست را آسان‌تر می‌کند.
 *
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

/**
 * ============================================
 * CHARACTER SETS
 * ============================================
 * مجموعه کاراکترهای مجاز برای تولید پسورد
 * هر مجموعه برای یه نوع کاراکتر خاص استفاده می‌شه
 */
export const CHAR_SETS = Object.freeze({
  /** حروف بزرگ انگلیسی A-Z */
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

  /** حروف کوچک انگلیسی a-z */
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',

  /** اعداد 0-9 */
  NUMBERS: '0123456789',

  /** نمادها و کاراکترهای خاص */
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
});

/**
 * ============================================
 * PASSWORD CONFIGURATION
 * ============================================
 * تنظیمات مربوط به تولید پسورد
 */
export const PASSWORD_CONFIG = Object.freeze({
  /** حداقل طول مجاز پسورد */
  MIN_LENGTH: 4,

  /** حداکثر طول مجاز پسورد */
  MAX_LENGTH: 50,

  /** طول پیش‌فرض پسورد */
  DEFAULT_LENGTH: 12,

  /** تنظیمات سطوح مختلف امنیتی */
  DIFFICULTY_LEVELS: Object.freeze({
    easy: Object.freeze({
      length: 8,
      uppercase: false,
      lowercase: true,
      numbers: true,
      symbols: false,
      label: 'پایه'
    }),
    medium: Object.freeze({
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      label: 'متوسط'
    }),
    hard: Object.freeze({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      label: 'قوی'
    }),
    custom: Object.freeze({
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      label: 'سفارشی'
    })
  })
});

/**
 * ============================================
 * ENCRYPTION CONFIGURATION
 * ============================================
 * تنظیمات مربوط به رمزنگاری AES-GCM
 */
export const ENCRYPTION_CONFIG = Object.freeze({
  /** نام الگوریتم رمزنگاری */
  ALGORITHM: 'AES-GCM',

  /** طول کلید به بیت */
  KEY_LENGTH: 256,

  /** طول IV (Initialization Vector) به بایت */
  IV_LENGTH: 12,

  /** تعداد تکرار برای PBKDF2 */
  PBKDF2_ITERATIONS: 150000,

  /** الگوریتم هش برای PBKDF2 */
  PBKDF2_HASH: 'SHA-256',

  /** Salt ثابت برای مشتق کردن کلید - در محیط تولید باید تصادفی باشد */
  STATIC_SALT: 'pwgen-static-salt-v1',

  /** کلیدهای localStorage */
  STORAGE_KEYS: Object.freeze({
    MASTER_KEY_HINT: 'pwgen_master_key_hint',
    PASSWORD_HISTORY: 'passwordHistory'
  })
});

/**
 * ============================================
 * UI CONFIGURATION
 * ============================================
 * تنظیمات مربوط به رابط کاربری
 */
export const UI_CONFIG = Object.freeze({
  /** مدت زمان نمایش toast به میلی‌ثانیه */
  TOAST_DURATION: 3000,

  /** مدت زمان انیمیشن‌ها به میلی‌ثانیه */
  ANIMATION_DURATION: 300,

  /** تعداد ذرات پس‌زمینه در دسکتاپ */
  PARTICLE_COUNT_DESKTOP: 8,

  /** تعداد ذرات پس‌زمینه در موبایل */
  PARTICLE_COUNT_MOBILE: 4,

  /** رنگ‌های استفاده شده در نشانگر قدرت پسورد */
  STRENGTH_COLORS: Object.freeze({
    weak: '#ef4444',
    medium: '#f59e0b',
    strong: '#10b981'
  }),

  /** برچسب‌های فارسی برای سطوح قدرت */
  STRENGTH_LABELS: Object.freeze({
    weak: 'پایه',
    medium: 'متوسط',
    strong: 'قوی'
  })
});

/**
 * ============================================
 * DOM ELEMENT IDs
 * ============================================
 * شناسه‌های عناصر DOM برای دسترسی سریع
 * نگه داشتن همه IDها در یکجا از خطای تایپی جلوگیری می‌کنه
 */
export const DOM_IDS = Object.freeze({
  // فرم اصلی
  PASSWORD_FORM: 'passwordForm',
  PASSWORD_NAME: 'passwordName',
  DIFFICULTY: 'difficulty',
  LENGTH_RANGE: 'lengthRange',
  LENGTH_VALUE: 'lengthValue',

  // مودال پسورد
  MODAL: 'modal',
  MODAL_TITLE: 'modalTitle',
  GENERATED_PASSWORD: 'generatedPassword',
  MODAL_META: 'modalMeta',
  SAVE_BTN: 'saveBtn',
  COPY_BTN: 'copyBtn',
  QUICK_COPY_BTN: 'quickCopyBtn',
  REGENERATE_BTN: 'regenerateBtn',
  CLOSE_MODAL_BTN: 'closeModalBtn',

  // تاریخچه
  HISTORY_ICON: 'historyIcon',
  HISTORY_MODAL: 'historyModal',
  HISTORY_TABLE_BODY: 'historyTableBody',
  CLEAR_HISTORY_BTN: 'clearHistoryBtn',
  EMPTY_HISTORY: 'emptyHistory',
  HISTORY_TITLE: 'historyTitle',

  // تنظیمات پیشرفته
  ADVANCED_TOGGLE_BTN: 'advancedToggleBtn',
  ADVANCED_SETTINGS: 'advancedSettings',
  TOGGLE_ICON: 'toggleIcon',
  SET_MASTER_KEY_BTN: 'setMasterKeyBtn',
  SECURE_SAVE: 'secureSave',

  // چک‌باکس‌ها
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
  NUMBERS: 'numbers',
  SYMBOLS: 'symbols',

  // سایر عناصر
  STRENGTH_BADGE: 'strengthBadge',
  TOAST_CONTAINER: 'toastContainer',
  LOADER: 'loader',
  BACKGROUND: 'background',
  CUSTOM_CURSOR: 'customCursor'
});

/**
 * ============================================
 * MESSAGES
 * ============================================
 * پیام‌های چندزبانه (فارسی) برای نمایش به کاربر
 */
export const MESSAGES = Object.freeze({
  // پیام‌های موفقیت
  SUCCESS: Object.freeze({
    PASSWORD_COPIED: 'پسورد کپی شد',
    PASSWORD_SAVED: 'رمز ذخیره شد',
    NEW_PASSWORD_GENERATED: 'پسورد جدید تولید شد',
    MASTER_KEY_SET: 'کلید اصلی تنظیم شد',
    ITEM_DELETED: 'آیتم حذف شد',
    HISTORY_CLEARED: 'تاریخچه حذف شد'
  }),

  // پیام‌های خطا
  ERROR: Object.freeze({
    NO_CHARACTER_SELECTED: 'لطفاً حداقل یک نوع کاراکتر را انتخاب کنید.',
    INVALID_LENGTH: 'طول پسورد باید بین 4 تا 50 کاراکتر باشد.',
    MASTER_KEY_NOT_SET: 'کلید اصلی تنظیم نشد.',
    MASTER_KEY_INCORRECT: 'کلید اصلی صحیح نیست.',
    COPY_RESTRICTED: 'دسترسی کپی محدود است.',
    ENCRYPTION_FAILED: 'رمزنگاری ناموفق بود.',
    DECRYPTION_FAILED: 'رمزگشایی ناموفق بود.'
  }),

  // پیام‌های هشدار
  WARNING: Object.freeze({
    HTTPS_REQUIRED: 'کپی فقط در HTTPS/localhost پشتیبانی می‌شود.',
    MASTER_KEY_CANCELLED: 'تنظیم کلید لغو شد',
    NON_SECURE_CONTEXT: 'برای تجربه کامل (دسترسی کلیپ‌بورد)، اپ را روی HTTPS اجرا کنید.',
    DELETE_CONFIRMATION: 'آیا مطمئن هستید که می‌خواهید تمام تاریخچه را پاک کنید؟'
  }),

  // متون پیش‌فرض
  DEFAULTS: Object.freeze({
    PASSWORD_NAME: 'رمز شما',
    LOADING_TEXT: 'در حال بارگذاری...',
    ENCRYPTED_INDICATOR: '🔒 رمزنگاری شده',
    STRENGTH_WEAK: 'پایه',
    STRENGTH_MEDIUM: 'متوسط',
    STRENGTH_STRONG: 'قوی'
  })
});

/**
 * ============================================
 * TOAST ICONS (SVG)
 * ============================================
 * آیکون‌های SVG برای toast notifications
 */
export const TOAST_ICONS = Object.freeze({
  success: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
  </svg>`,

  error: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>`,

  warning: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,

  info: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>`
});
