/**
 * =============================================================================
 * UI SERVICE
 * =============================================================================
 *
 * سرویس مدیریت رابط کاربری
 * شامل توابع برای نمایش نوتیفیکیشن‌ها، مدیریت مودال‌ها، و به‌روزرسانی UI
 *
 * @module uiService
 * @author mmdcode (محمد سجادی)
 * @version 2.0.0
 */

import { UI_CONFIG, MESSAGES, TOAST_ICONS } from '../config/constants.js';
import { escapeHtml } from '../utils/domHelpers.js';
import { truncatePassword } from '../utils/formatters.js';
import { getPasswordHistory, removePasswordFromHistory, getPasswordFromHistory } from './passwordService.js';

/**
 * ============================================
 * TOAST NOTIFICATIONS
 * ============================================
 */

/**
 * نمایش Toast Notification
 * این تابع یه پیام موقت در گوشه صفحه نمایش می‌ده
 *
 * @param {string} message - پیام برای نمایش
 * @param {'success'|'error'|'warning'|'info'} type - نوع پیام
 * @param {HTMLElement} container - کانتینر toast ها
 */
export function showToast(message, type = 'success', container) {
  // اگه کانتینر وجود نداشت، fallback به alert
  if (!container) {
    console.warn('[UIService] Toast container not found, using alert');
    alert(message);
    return;
  }

  // ایجاد عنصر toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  // محتوای toast
  const icon = TOAST_ICONS[type] || TOAST_ICONS.success;
  toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;

  // اضافه به DOM
  container.appendChild(toast);

  // حذف خودکار بعد از مدت زمان مشخص
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    // حذف از DOM بعد از انیمیشن
    setTimeout(() => {
      toast.remove();
    }, UI_CONFIG.ANIMATION_DURATION);
  }, UI_CONFIG.TOAST_DURATION);
}

/**
 * ============================================
 * MODAL MANAGEMENT
 * ============================================
 */

/**
 * مدیریت نمایش مودال
 *
 * @param {HTMLElement} modal - عنصر مودال
 * @param {boolean} show - true برای نمایش، false برای مخفی
 */
export function toggleModal(modal, show) {
  if (!modal) return;

  if (show) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    // فوکوس روی first focusable element برای accessibility
    const focusable = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  } else {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * بستن همه مودال‌ها
 *
 * @param {HTMLElement[]} modals - آرایه‌ای از مودال‌ها
 */
export function closeAllModals(modals) {
  modals.forEach(modal => toggleModal(modal, false));
}

/**
 * ============================================
 * PASSWORD HISTORY TABLE
 * ============================================
 */

/**
 * به‌روزرسانی جدول تاریخچه پسوردها
 * این تابع کل جدول رو بر اساس localStorage بازسازی می‌کنه
 *
 * @param {HTMLTableSectionElement} tableBody - tbody جدول
 * @param {HTMLElement} emptyState - پیام "تاریخچه خالی"
 * @param {HTMLElement} historyIcon - آیکون تاریخچه در هدر
 * @param {HTMLElement} historyModal - مودال تاریخچه
 */
export function updateHistoryTable(tableBody, emptyState, historyIcon, historyModal) {
  if (!tableBody) return;

  // پاک کردن محتوای فعلی
  tableBody.innerHTML = '';

  // گرفتن تاریخچه
  const history = getPasswordHistory();

  // مدیریت حالت خالی
  if (history.length === 0) {
    emptyState?.classList.remove('hidden');
    historyIcon?.classList.add('hidden');
    return;
  }

  // نمایش آیکون و پنهان کردن پیام خالی
  emptyState?.classList.add('hidden');
  historyIcon?.classList.remove('hidden');

  // ساخت ردیف‌ها
  history.forEach((entry, index) => {
    const row = createHistoryRow(entry, index);
    tableBody.appendChild(row);
  });
}

/**
 * ساخت یه ردیف جدول برای ورودی تاریخچه
 *
 * @param {Object} entry - ورودی تاریخچه
 * @param {number} index - اندیس ورودی
 * @returns {HTMLTableRowElement} - ردیف ساخته شده
 */
function createHistoryRow(entry, index) {
  const row = document.createElement('tr');

  // نمایش پسورد (truncate شده یا نشانگر رمزنگاری)
  const displayPassword = entry.password
    ? truncatePassword(entry.password, 20)
    : `<em style="color: #64748b;">${MESSAGES.DEFAULTS.ENCRYPTED_INDICATOR}</em>`;

  row.innerHTML = `
    <td><strong>${escapeHtml(entry.name)}</strong></td>
    <td dir="ltr" style="font-family: monospace;">${displayPassword}</td>
    <td>${entry.timestamp}</td>
    <td>
      <button class="history-icon-btn" data-action="copy" data-index="${index}" aria-label="کپی رمز ${escapeHtml(entry.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </button>
      <button class="history-icon-btn" data-action="delete" data-index="${index}" aria-label="حذف رمز ${escapeHtml(entry.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
    </td>
  `;

  return row;
}

/**
 * ============================================
 * HISTORY ACTIONS
 * ============================================
 */

/**
 * هندل کردن کلیک روی دکمه‌های جدول تاریخچه
 *
 * @param {Event} event - event کلیک
 * @param {HTMLElement} toastContainer - کانتینر toast ها
 * @returns {Promise<boolean>} - آیا action انجام شد؟
 */
export async function handleHistoryAction(event, toastContainer) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return false;

  const index = Number(actionEl.getAttribute('data-index'));
  const action = actionEl.getAttribute('data-action');

  if (Number.isNaN(index)) return false;

  switch (action) {
    case 'copy':
      return await handleCopyAction(index, toastContainer);

    case 'delete':
      return handleDeleteAction(index, toastContainer);

    default:
      return false;
  }
}

/**
 * کپی پسورد از تاریخچه
 *
 * @param {number} index - اندیس ورودی
 * @param {HTMLElement} toastContainer - کانتینر toast ها
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
async function handleCopyAction(index, toastContainer) {
  try {
    const password = await getPasswordFromHistory(index);

    if (!password) {
      showToast(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'error', toastContainer);
      return false;
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(password);
      showToast(MESSAGES.SUCCESS.PASSWORD_COPIED, 'success', toastContainer);
      return true;
    } else {
      showToast(MESSAGES.WARNING.HTTPS_REQUIRED, 'warning', toastContainer);
      return false;
    }

  } catch (error) {
    console.error('[UIService] Copy action failed:', error);
    showToast(
      error.message || MESSAGES.ERROR.COPY_RESTRICTED,
      'error',
      toastContainer
    );
    return false;
  }
}

/**
 * حذف ورودی از تاریخچه
 *
 * @param {number} index - اندیس ورودی
 * @param {HTMLElement} toastContainer - کانتینر toast ها
 * @returns {boolean} - موفقیت عملیات
 */
function handleDeleteAction(index, toastContainer) {
  const success = removePasswordFromHistory(index);

  if (success) {
    showToast(MESSAGES.SUCCESS.ITEM_DELETED, 'warning', toastContainer);
  }

  return success;
}

/**
 * ============================================
 * STRENGTH BADGE
 * ============================================
 */

/**
 * به‌روزرسانی نشانگر قدرت پسورد
 *
 * @param {HTMLInputElement} lengthRange - input range طول
 * @param {HTMLElement} lengthValue - span نمایش مقدار طول
 * @param {HTMLElement} strengthBadge - نشانگر قدرت
 * @param {Object} options - وضعیت چک‌باکس‌ها
 */
export function updateStrengthBadge(lengthRange, lengthValue, strengthBadge, options) {
  if (!lengthRange || !lengthValue || !strengthBadge) return;

  const length = parseInt(lengthRange.value, 10) || 12;
  const typesSelected = Object.values(options).filter(Boolean).length;

  // نمایش مقدار طول
  lengthValue.textContent = length;

  // محاسبه امتیاز
  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  score += Math.max(0, typesSelected - 1);

  // تعیین کلاس و برچسب
  let label, className;
  if (score <= 2) {
    label = 'پایه';
    className = 'strength-weak';
  } else if (score <= 4) {
    label = 'متوسط';
    className = 'strength-medium';
  } else {
    label = 'قوی';
    className = 'strength-strong';
  }

  // به‌روزرسانی UI
  strengthBadge.textContent = label;
  strengthBadge.className = `strength-badge ${className}`;
}

/**
 * ============================================
 * ADVANCED SETTINGS PANEL
 * ============================================
 */

/**
 * تغییر وضعیت پنل تنظیمات پیشرفته
 *
 * @param {HTMLElement} panel - پنل تنظیمات
 * @param {HTMLElement} toggleBtn - دکمه toggle
 * @param {HTMLElement} icon - آیکون فلش
 * @returns {boolean} - وضعیت جدید (باز=true، بسته=false)
 */
export function toggleAdvancedSettings(panel, toggleBtn, icon) {
  if (!panel) return false;

  const isHidden = panel.classList.contains('hidden');

  // تغییر visibility
  if (isHidden) {
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
  } else {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  }

  // به‌روزرسانی ARIA
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  }

  // چرخش آیکون
  if (icon) {
    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }

  return isHidden;
}

/**
 * ============================================
 * FORM STATE
 * ============================================
 */

/**
 * به‌روزرسانی چک‌باکس‌ها بر اساس سطح دشواری
 *
 * @param {string} difficulty - 'easy' | 'medium' | 'hard' | 'custom'
 * @param {HTMLInputElement} lengthRange - input range طول
 * @param {Object} checkboxes - آبجکت شامل inputهای چک‌باکس
 * @param {Object} difficultyLevels - تنظیمات سطوح دشواری از constants
 */
export function updateFormForDifficulty(difficulty, lengthRange, checkboxes, difficultyLevels) {
  const settings = difficultyLevels[difficulty];

  if (!settings) return; // custom mode - no changes

  // به‌روزرسانی طول
  if (lengthRange) {
    lengthRange.value = settings.length;
    lengthRange.dispatchEvent(new Event('input'));
  }

  // به‌روزرسانی چک‌باکس‌ها
  if (checkboxes.uppercase) checkboxes.uppercase.checked = settings.uppercase;
  if (checkboxes.lowercase) checkboxes.lowercase.checked = settings.lowercase;
  if (checkboxes.numbers) checkboxes.numbers.checked = settings.numbers;
  if (checkboxes.symbols) checkboxes.symbols.checked = settings.symbols;
}
