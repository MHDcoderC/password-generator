export const CHAR_SETS = Object.freeze({
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
});

export const PASSWORD_CONFIG = Object.freeze({
  MIN_LENGTH: 4,
  MAX_LENGTH: 50,
  DEFAULT_LENGTH: 12,
  DIFFICULTY_LEVELS: Object.freeze({
    easy: Object.freeze({ length: 8, uppercase: false, lowercase: true, numbers: true, symbols: false, label: 'پایه' }),
    medium: Object.freeze({ length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false, label: 'متوسط' }),
    hard: Object.freeze({ length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, label: 'قوی' }),
    custom: Object.freeze({ length: 12, uppercase: true, lowercase: true, numbers: true, symbols: true, label: 'سفارشی' })
  })
});

export const ENCRYPTION_CONFIG = Object.freeze({
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  IV_LENGTH: 12,
  PBKDF2_ITERATIONS: 150000,
  PBKDF2_HASH: 'SHA-256',
  STATIC_SALT: 'pwgen-static-salt-v1',
  STORAGE_KEYS: Object.freeze({
    MASTER_KEY_HINT: 'pwgen_master_key_hint',
    PASSWORD_HISTORY: 'passwordHistory'
  })
});

export const UI_CONFIG = Object.freeze({
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  PARTICLE_COUNT_DESKTOP: 8,
  PARTICLE_COUNT_MOBILE: 4,
  STRENGTH_COLORS: Object.freeze({ weak: '#bf5b5b', medium: '#d4a84b', strong: '#7a9e7e' }),
  STRENGTH_LABELS: Object.freeze({ weak: 'پایه', medium: 'متوسط', strong: 'قوی' })
});

export const DOM_IDS = Object.freeze({
  PASSWORD_FORM: 'passwordForm',
  PASSWORD_NAME: 'passwordName',
  DIFFICULTY: 'difficulty',
  LENGTH_RANGE: 'lengthRange',
  LENGTH_VALUE: 'lengthValue',
  MODAL: 'modal',
  MODAL_TITLE: 'modalTitle',
  GENERATED_PASSWORD: 'generatedPassword',
  MODAL_META: 'modalMeta',
  SAVE_BTN: 'saveBtn',
  COPY_BTN: 'copyBtn',
  QUICK_COPY_BTN: 'quickCopyBtn',
  REGENERATE_BTN: 'regenerateBtn',
  CLOSE_MODAL_BTN: 'closeModalBtn',
  HISTORY_ICON: 'historyIcon',
  HISTORY_MODAL: 'historyModal',
  HISTORY_TABLE_BODY: 'historyTableBody',
  CLEAR_HISTORY_BTN: 'clearHistoryBtn',
  EMPTY_HISTORY: 'emptyHistory',
  HISTORY_TITLE: 'historyTitle',
  ADVANCED_TOGGLE_BTN: 'advancedToggleBtn',
  ADVANCED_SETTINGS: 'advancedSettings',
  TOGGLE_ICON: 'toggleIcon',
  SET_MASTER_KEY_BTN: 'setMasterKeyBtn',
  SECURE_SAVE: 'secureSave',
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
  NUMBERS: 'numbers',
  SYMBOLS: 'symbols',
  STRENGTH_BADGE: 'strengthBadge',
  TOAST_CONTAINER: 'toastContainer',
  LOADER: 'loader',
  BACKGROUND: 'background',
  CUSTOM_CURSOR: 'customCursor'
});

export const MESSAGES = Object.freeze({
  SUCCESS: Object.freeze({
    PASSWORD_COPIED: 'پسورد کپی شد',
    PASSWORD_SAVED: 'رمز ذخیره شد',
    NEW_PASSWORD_GENERATED: 'پسورد جدید تولید شد',
    MASTER_KEY_SET: 'کلید اصلی تنظیم شد',
    ITEM_DELETED: 'آیتم حذف شد',
    HISTORY_CLEARED: 'تاریخچه حذف شد'
  }),
  ERROR: Object.freeze({
    NO_CHARACTER_SELECTED: 'لطفاً حداقل یک نوع کاراکتر را انتخاب کنید.',
    INVALID_LENGTH: 'طول پسورد باید بین 4 تا 50 کاراکتر باشد.',
    MASTER_KEY_NOT_SET: 'کلید اصلی تنظیم نشد.',
    MASTER_KEY_INCORRECT: 'کلید اصلی صحیح نیست.',
    COPY_RESTRICTED: 'دسترسی کپی محدود است.',
    ENCRYPTION_FAILED: 'رمزنگاری ناموفق بود.',
    DECRYPTION_FAILED: 'رمزگشایی ناموفق بود.'
  }),
  WARNING: Object.freeze({
    HTTPS_REQUIRED: 'کپی فقط در HTTPS/localhost پشتیبانی می‌شود.',
    MASTER_KEY_CANCELLED: 'تنظیم کلید لغو شد',
    NON_SECURE_CONTEXT: 'برای تجربه کامل (دسترسی کلیپ‌بورد)، اپ را روی HTTPS اجرا کنید.',
    DELETE_CONFIRMATION: 'آیا مطمئن هستید که می‌خواهید تمام تاریخچه را پاک کنید؟'
  }),
  DEFAULTS: Object.freeze({
    PASSWORD_NAME: 'رمز شما',
    LOADING_TEXT: 'در حال بارگذاری...',
    ENCRYPTED_INDICATOR: '🔒 رمزنگاری شده',
    STRENGTH_WEAK: 'پایه',
    STRENGTH_MEDIUM: 'متوسط',
    STRENGTH_STRONG: 'قوی'
  })
});
