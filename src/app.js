/**
 * =============================================================================
 * PASSWORD GENERATOR - MAIN APPLICATION
 * =============================================================================
 *
 * نقطه ورود اصلی برنامه سازنده پسورد
 * این فایل همه ماژول‌ها رو کنار هم می‌ذاره و اپلیکیشن رو راه‌اندازی می‌کنه
 *
 * معماری:
 * - Config: ثابت‌ها و تنظیمات
 * - Utils: توابع کمکی
 * - Services: منطق تجاری (crypto, password, ui, effects)
 * - DOMCache: کش کردن عناصر DOM
 *
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

import { DOM_IDS, PASSWORD_CONFIG, MESSAGES } from './config/constants.js';
import { DOMCache, safeAddEventListener, isClipboardSupported } from './utils/domHelpers.js';
import { getPersianTimestamp } from './utils/formatters.js';

import {
  generatePassword,
  addPasswordToHistory,
  getPasswordHistory,
  clearPasswordHistory,
  getDifficultySettings
} from './services/passwordService.js';

import {
  ensureMasterKey,
  setCachedMasterKey,
  clearCachedMasterKey,
  getCachedMasterKey
} from './services/cryptoService.js';

import {
  showToast,
  toggleModal,
  updateHistoryTable,
  handleHistoryAction,
  updateStrengthBadge,
  toggleAdvancedSettings,
  updateFormForDifficulty
} from './services/uiService.js';

import {
  initParticleSystem,
  initCustomCursor,
  initLoader
} from './services/effectsService.js';

/**
 * ============================================
 * APPLICATION STATE
 * ============================================
 */

/**
 * وضعیت فعلی اپلیکیشن
 * این آبجکت اطلاعات موقت رو نگه می‌داره
 */
const appState = {
  /** پسورد فعلی تولید شده */
  currentPassword: '',

  /** زمان تولید پسورد فعلی */
  currentPasswordTimestamp: '',

  /** آیا مودال باز است؟ */
  isModalOpen: false
};

/**
 * ============================================
 * DOM CACHE
 * ============================================
 */

/** کش عناصر DOM */
const dom = new DOMCache();

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * گرفتن همه عناصر مورد نیاز از DOM
 * این تابع یه بار اجرا می‌شه و همه چیز رو کش می‌کنه
 */
function initializeDOMCache() {
  // عناصر اصلی فرم
  dom.get(DOM_IDS.PASSWORD_FORM);
  dom.get(DOM_IDS.PASSWORD_NAME);
  dom.get(DOM_IDS.DIFFICULTY);
  dom.get(DOM_IDS.LENGTH_RANGE);
  dom.get(DOM_IDS.LENGTH_VALUE);

  // چک‌باکس‌ها
  dom.get(DOM_IDS.UPPERCASE);
  dom.get(DOM_IDS.LOWERCASE);
  dom.get(DOM_IDS.NUMBERS);
  dom.get(DOM_IDS.SYMBOLS);

  // مودال پسورد
  dom.get(DOM_IDS.MODAL);
  dom.get(DOM_IDS.GENERATED_PASSWORD);
  dom.get(DOM_IDS.MODAL_META);
  dom.get(DOM_IDS.SAVE_BTN);
  dom.get(DOM_IDS.COPY_BTN);
  dom.get(DOM_IDS.QUICK_COPY_BTN);
  dom.get(DOM_IDS.REGENERATE_BTN);
  dom.get(DOM_IDS.CLOSE_MODAL_BTN);

  // مودال تاریخچه
  dom.get(DOM_IDS.HISTORY_ICON);
  dom.get(DOM_IDS.HISTORY_MODAL);
  dom.get(DOM_IDS.HISTORY_TABLE_BODY);
  dom.get(DOM_IDS.CLEAR_HISTORY_BTN);
  dom.get(DOM_IDS.EMPTY_HISTORY);

  // تنظیمات پیشرفته
  dom.get(DOM_IDS.ADVANCED_TOGGLE_BTN);
  dom.get(DOM_IDS.ADVANCED_SETTINGS);
  dom.get(DOM_IDS.TOGGLE_ICON);
  dom.get(DOM_IDS.SET_MASTER_KEY_BTN);
  dom.get(DOM_IDS.SECURE_SAVE);

  // سایر عناصر
  dom.get(DOM_IDS.STRENGTH_BADGE);
  dom.get(DOM_IDS.TOAST_CONTAINER);
  dom.get(DOM_IDS.LOADER);
  dom.get(DOM_IDS.BACKGROUND);
  dom.get(DOM_IDS.CUSTOM_CURSOR);
}

/**
 * گرفتن وضعیت چک‌باکس‌ها به صورت آبجکت
 * @returns {{uppercase: boolean, lowercase: boolean, numbers: boolean, symbols: boolean}}
 */
function getCheckboxStates() {
  return {
    uppercase: dom.get(DOM_IDS.UPPERCASE)?.checked ?? true,
    lowercase: dom.get(DOM_IDS.LOWERCASE)?.checked ?? true,
    numbers: dom.get(DOM_IDS.NUMBERS)?.checked ?? true,
    symbols: dom.get(DOM_IDS.SYMBOLS)?.checked ?? true
  };
}

/**
 * کپی متن به کلیپ‌بورد
 * @param {string} text - متن برای کپی
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
  if (!isClipboardSupported()) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('[App] Clipboard copy failed:', error);
    return false;
  }
}

/**
 * ============================================
 * EVENT HANDLERS
 * ============================================
 */

/**
 * هندل submit فرم - تولید پسورد جدید
 * @param {Event} event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const length = parseInt(dom.get(DOM_IDS.LENGTH_RANGE)?.value, 10) || 12;
  const options = getCheckboxStates();

  try {
    const result = generatePassword(length, options);

    if (result) {
      // ذخیره در state
      appState.currentPassword = result.password;
      appState.currentPasswordTimestamp = getPersianTimestamp();

      // نمایش مودال
      showPasswordModal(result);
    }
  } catch (error) {
    showToast(error.message, 'error', dom.get(DOM_IDS.TOAST_CONTAINER));
  }
}

/**
 * نمایش مودال پسورد با اطلاعات کامل
 * @param {{password: string, score: number, strengthLabel: string}} result
 */
function showPasswordModal(result) {
  const modal = dom.get(DOM_IDS.MODAL);
  const passwordEl = dom.get(DOM_IDS.GENERATED_PASSWORD);
  const metaEl = dom.get(DOM_IDS.MODAL_META);

  if (!modal || !passwordEl) return;

  // نمایش پسورد
  passwordEl.textContent = result.password;

  // اطلاعات متا
  const nameLabel = dom.get(DOM_IDS.PASSWORD_NAME)?.value?.trim() || MESSAGES.DEFAULTS.PASSWORD_NAME;
  const strengthColor = result.strengthLabel === 'strong'
    ? '#10b981'
    : result.strengthLabel === 'medium'
      ? '#f59e0b'
      : '#ef4444';

  if (metaEl) {
    metaEl.innerHTML = `
      <span style="color: #64748b;">نام:</span> ${nameLabel}
      <span style="margin: 0 0.5rem; color: #334155;">|</span>
      <span style="color: #64748b;">تاریخ:</span> ${appState.currentPasswordTimestamp}
      <span style="margin: 0 0.5rem; color: #334155;">|</span>
      <span style="color: #64748b;">سطح:</span>
      <strong style="color: ${strengthColor};">${result.strengthLabel === 'strong' ? 'قوی' : result.strengthLabel === 'medium' ? 'متوسط' : 'پایه'}</strong>
    `;
  }

  // باز کردن مودال
  toggleModal(modal, true);
  appState.isModalOpen = true;

  // سلکت کردن متن برای کپی راحت‌تر
  setTimeout(() => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(passwordEl);
    selection.removeAllRanges();
    selection.addRange(range);
  }, 100);
}

/**
 * هندل کپی پسورد
 */
async function handleCopyPassword() {
  if (!appState.currentPassword) return;

  const success = await copyToClipboard(appState.currentPassword);

  if (success) {
    showToast(MESSAGES.SUCCESS.PASSWORD_COPIED, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
  } else {
    showToast(MESSAGES.WARNING.HTTPS_REQUIRED, 'warning', dom.get(DOM_IDS.TOAST_CONTAINER));
  }
}

/**
 * هندل ذخیره پسورد در تاریخچه
 */
async function handleSavePassword() {
  if (!appState.currentPassword) return;

  const name = dom.get(DOM_IDS.PASSWORD_NAME)?.value?.trim() || MESSAGES.DEFAULTS.PASSWORD_NAME;
  const secureSave = dom.get(DOM_IDS.SECURE_SAVE)?.checked ?? false;

  // اگه ذخیره امن فعال باشه و کلید تنظیم نشده باشه، از کاربر بخواه
  if (secureSave && !getCachedMasterKey()) {
    try {
      const key = await ensureMasterKey();
      setCachedMasterKey(key);
    } catch (error) {
      showToast(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'error', dom.get(DOM_IDS.TOGGLE_ICON));
      return;
    }
  }

  try {
    const success = await addPasswordToHistory(
      appState.currentPassword,
      name,
      secureSave
    );

    if (success) {
      // پاک کردن input نام
      const nameInput = dom.get(DOM_IDS.PASSWORD_NAME);
      if (nameInput) nameInput.value = '';

      // بستن مودال
      toggleModal(dom.get(DOM_IDS.MODAL), false);
      appState.isModalOpen = false;

      // نمایش پیام موفقیت
      showToast(MESSAGES.SUCCESS.PASSWORD_SAVED, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));

      // به‌روزرسانی جدول تاریخچه (اگه باز باشه)
      updateHistoryTable(
        dom.get(DOM_IDS.HISTORY_TABLE_BODY),
        dom.get(DOM_IDS.EMPTY_HISTORY),
        dom.get(DOM_IDS.HISTORY_ICON),
        dom.get(DOM_IDS.HISTORY_MODAL)
      );
    }
  } catch (error) {
    showToast(error.message, 'error', dom.get(DOM_IDS.TOAST_CONTAINER));
  }
}

/**
 * هندل تولید مجدد پسورد
 */
function handleRegeneratePassword() {
  const length = parseInt(dom.get(DOM_IDS.LENGTH_RANGE)?.value, 10) || 12;
  const options = getCheckboxStates();

  try {
    const result = generatePassword(length, options);

    if (result) {
      appState.currentPassword = result.password;
      appState.currentPasswordTimestamp = getPersianTimestamp();

      // به‌روزرسانی مودال
      showPasswordModal(result);

      showToast(MESSAGES.SUCCESS.NEW_PASSWORD_GENERATED, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
    }
  } catch (error) {
    showToast(error.message, 'error', dom.get(DOM_IDS.TOAST_CONTAINER));
  }
}

/**
 * هندل تغییر سطح دشواری
 */
function handleDifficultyChange() {
  const difficulty = dom.get(DOM_IDS.DIFFICULTY)?.value;

  const checkboxes = {
    uppercase: dom.get(DOM_IDS.UPPERCASE),
    lowercase: dom.get(DOM_IDS.LOWERCASE),
    numbers: dom.get(DOM_IDS.NUMBERS),
    symbols: dom.get(DOM_IDS.SYMBOLS)
  };

  updateFormForDifficulty(
    difficulty,
    dom.get(DOM_IDS.LENGTH_RANGE),
    checkboxes,
    PASSWORD_CONFIG.DIFFICULTY_LEVELS
  );

  // به‌روزرسانی نشانگر قدرت
  updateStrengthIndicator();
}

/**
 * هندل تغییر مقدار طول یا چک‌باکس‌ها
 */
function updateStrengthIndicator() {
  const options = getCheckboxStates();

  updateStrengthBadge(
    dom.get(DOM_IDS.LENGTH_RANGE),
    dom.get(DOM_IDS.LENGTH_VALUE),
    dom.get(DOM_IDS.STRENGTH_BADGE),
    options
  );
}

/**
 * هندل باز/بسته کردن تنظیمات پیشرفته
 */
function handleToggleAdvanced() {
  toggleAdvancedSettings(
    dom.get(DOM_IDS.ADVANCED_SETTINGS),
    dom.get(DOM_IDS.ADVANCED_TOGGLE_BTN),
    dom.get(DOM_IDS.TOGGLE_ICON)
  );
}

/**
 * هندل تنظیم کلید اصلی
 */
async function handleSetMasterKey() {
  try {
    const key = await ensureMasterKey({ forceSet: true });
    setCachedMasterKey(key);
    showToast(MESSAGES.SUCCESS.MASTER_KEY_SET, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
  } catch (error) {
    showToast(MESSAGES.WARNING.MASTER_KEY_CANCELLED, 'warning', dom.get(DOM_IDS.TOAST_CONTAINER));
  }
}

/**
 * هندل نمایش تاریخچه
 */
function handleShowHistory() {
  updateHistoryTable(
    dom.get(DOM_IDS.HISTORY_TABLE_BODY),
    dom.get(DOM_IDS.EMPTY_HISTORY),
    dom.get(DOM_IDS.HISTORY_ICON),
    dom.get(DOM_IDS.HISTORY_MODAL)
  );

  toggleModal(dom.get(DOM_IDS.HISTORY_MODAL), true);
}

/**
 * هندل پاک کردن تاریخچه
 */
function handleClearHistory() {
  if (confirm(MESSAGES.WARNING.DELETE_CONFIRMATION)) {
    clearPasswordHistory();
    updateHistoryTable(
      dom.get(DOM_IDS.HISTORY_TABLE_BODY),
      dom.get(DOM_IDS.EMPTY_HISTORY),
      dom.get(DOM_IDS.HISTORY_ICON),
      dom.get(DOM_IDS.HISTORY_MODAL)
    );
    showToast(MESSAGES.SUCCESS.HISTORY_CLEARED, 'warning', dom.get(DOM_IDS.TOAST_CONTAINER));
  }
}

/**
 * هندل کلیک در جدول تاریخچه
 */
async function handleHistoryTableClick(event) {
  const handled = await handleHistoryAction(event, dom.get(DOM_IDS.TOAST_CONTAINER));

  if (handled) {
    // به‌روزرسانی جدول بعد از حذف
    updateHistoryTable(
      dom.get(DOM_IDS.HISTORY_TABLE_BODY),
      dom.get(DOM_IDS.EMPTY_HISTORY),
      dom.get(DOM_IDS.HISTORY_ICON),
      dom.get(DOM_IDS.HISTORY_MODAL)
    );
  }
}

/**
 * هندل بستن مودال با Escape
 */
function handleKeyDown(event) {
  if (event.key === 'Escape') {
    // بستن مودال‌ها
    toggleModal(dom.get(DOM_IDS.MODAL), false);
    toggleModal(dom.get(DOM_IDS.HISTORY_MODAL), false);
    appState.isModalOpen = false;
  }

  // Ctrl/Cmd + Enter برای تولید پسورد
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    const form = dom.get(DOM_IDS.PASSWORD_FORM);
    if (form) {
      form.dispatchEvent(new Event('submit'));
    }
  }
}

/**
 * ============================================
* SERVICE WORKER
 * ============================================
 */

/**
 * ثبت Service Worker برای PWA
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // فقط در محیط production
    const isProd = import.meta.env?.PROD;

    if (isProd) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then(registration => {
            console.log('[App] SW registered:', registration.scope);
          })
          .catch(error => {
            console.warn('[App] SW registration failed:', error);
          });
      });
    }
  }
}

/**
 * ============================================
 * INITIALIZATION
 * ============================================
 */

/**
* اضافه کردن همه event listeners
 */
function initializeEventListeners() {
  // فرم اصلی
  safeAddEventListener(
    dom.get(DOM_IDS.PASSWORD_FORM),
    'submit',
    handleFormSubmit
  );

  // تغییر سطح دشواری
  safeAddEventListener(
    dom.get(DOM_IDS.DIFFICULTY),
    'change',
    handleDifficultyChange
  );

  // تغییر طول
  safeAddEventListener(
    dom.get(DOM_IDS.LENGTH_RANGE),
    'input',
    updateStrengthIndicator
  );

  // تغییر چک‌باکس‌ها
  [DOM_IDS.UPPERCASE, DOM_IDS.LOWERCASE, DOM_IDS.NUMBERS, DOM_IDS.SYMBOLS].forEach(id => {
    safeAddEventListener(
      dom.get(id),
      'change',
      updateStrengthIndicator
    );
  });

  // دکمه‌های مودال
  safeAddEventListener(dom.get(DOM_IDS.SAVE_BTN), 'click', handleSavePassword);
  safeAddEventListener(dom.get(DOM_IDS.COPY_BTN), 'click', handleCopyPassword);
  safeAddEventListener(dom.get(DOM_IDS.QUICK_COPY_BTN), 'click', handleCopyPassword);
  safeAddEventListener(dom.get(DOM_IDS.REGENERATE_BTN), 'click', handleRegeneratePassword);
  safeAddEventListener(
    dom.get(DOM_IDS.CLOSE_MODAL_BTN),
    'click',
    () => {
      toggleModal(dom.get(DOM_IDS.MODAL), false);
      appState.isModalOpen = false;
    }
  );

  // دکمه toggle تنظیمات پیشرفته
  safeAddEventListener(
    dom.get(DOM_IDS.ADVANCED_TOGGLE_BTN),
    'click',
    handleToggleAdvanced
  );

  // دکمه تنظیم کلید اصلی
  safeAddEventListener(
    dom.get(DOM_IDS.SET_MASTER_KEY_BTN),
    'click',
    handleSetMasterKey
  );

  // آیکون و مودال تاریخچه
  safeAddEventListener(dom.get(DOM_IDS.HISTORY_ICON), 'click', handleShowHistory);
  safeAddEventListener(dom.get(DOM_IDS.CLEAR_HISTORY_BTN), 'click', handleClearHistory);
  safeAddEventListener(
    dom.get(DOM_IDS.HISTORY_TABLE_BODY),
    'click',
    handleHistoryTableClick
  );

  // بستن مودال با کلیک روی بک‌دراپ
  safeAddEventListener(
    dom.get(DOM_IDS.HISTORY_MODAL),
    'click',
    (e) => {
      if (e.target === dom.get(DOM_IDS.HISTORY_MODAL)) {
        toggleModal(dom.get(DOM_IDS.HISTORY_MODAL), false);
      }
    }
  );

  // کیبورد shortcuts
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * به‌روزرسانی اولیه UI
 */
function initializeUI() {
  // تنظیم سطح دشواری اولیه
  handleDifficultyChange();

  // به‌روزرسانی نشانگر قدرت
  updateStrengthIndicator();

  // به‌روزرسانی جدول تاریخچه (اگه چیزی باشه، آیکون نشون داده می‌شه)
  updateHistoryTable(
    dom.get(DOM_IDS.HISTORY_TABLE_BODY),
    dom.get(DOM_IDS.EMPTY_HISTORY),
    dom.get(DOM_IDS.HISTORY_ICON),
    dom.get(DOM_IDS.HISTORY_MODAL)
  );
}

/**
 * نمایش هشدار امنیتی در کانتکست‌های غیر HTTPS
 */
function showSecurityWarning() {
  if (!window.isSecureContext && location.hostname !== 'localhost') {
    setTimeout(() => {
      showToast(
        MESSAGES.WARNING.NON_SECURE_CONTEXT,
        'warning',
        dom.get(DOM_IDS.TOAST_CONTAINER)
      );
    }, 2000);
  }
}

/**
 * ============================================
 * MAIN ENTRY POINT
 * ============================================
 */

/**
 * راه‌اندازی اپلیکیشن
 * این تابع وقتی DOM آماده شد، اجرا می‌شه
 */
function initializeApp() {
  console.log('[App] Initializing Password Generator v2.0.0...');

  // کش کردن عناصر DOM
  initializeDOMCache();

  // راه‌اندازی افکت‌ها
  initParticleSystem(dom.get(DOM_IDS.BACKGROUND));
  initCustomCursor(dom.get(DOM_IDS.CUSTOM_CURSOR));
  initLoader(dom.get(DOM_IDS.LOADER));

  // اضافه کردن event listeners
  initializeEventListeners();

  // به‌روزرسانی اولیه UI
  initializeUI();

  // ثبت Service Worker
  registerServiceWorker();

  // هشدار امنیتی (اگه HTTPS نباشه)
  showSecurityWarning();

  console.log('[App] Application initialized successfully!');
}

// شروع اپلیکیشن وقتی DOM آماده است
document.addEventListener('DOMContentLoaded', initializeApp);

// اکسپورت برای تست
export { appState, dom };
