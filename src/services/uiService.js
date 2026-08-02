import { UI_CONFIG, MESSAGES } from '../config/constants.js';
import { TOAST_ICONS } from '../config/icons.js';
import { escapeHtml } from '../utils/domHelpers.js';
import { truncatePassword } from '../utils/formatters.js';
import { getPasswordHistory, removePasswordFromHistory, getPasswordFromHistory } from './passwordService.js';

export function showToast(message, type = 'success', container) {
  if (!container) {
    console.warn('[UIService] Toast container not found, using alert');
    alert(message);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = TOAST_ICONS[type] || TOAST_ICONS.success;
  toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    setTimeout(() => {
      toast.remove();
    }, UI_CONFIG.ANIMATION_DURATION);
  }, UI_CONFIG.TOAST_DURATION);
}

export function toggleModal(modal, show) {
  if (!modal) return;

  if (show) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    const focusable = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  } else {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function closeAllModals(modals) {
  modals.forEach(modal => toggleModal(modal, false));
}

export function updateHistoryTable(tableBody, emptyState, historyIcon, historyModal) {
  if (!tableBody) return;

  tableBody.innerHTML = '';
  const history = getPasswordHistory();

  if (history.length === 0) {
    emptyState?.classList.remove('hidden');
    historyIcon?.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  historyIcon?.classList.remove('hidden');

  history.forEach((entry, index) => {
    tableBody.appendChild(createHistoryRow(entry, index));
  });
}

function createHistoryRow(entry, index) {
  const row = document.createElement('tr');

  const displayPassword = entry.password
    ? truncatePassword(entry.password, 20)
    : `<em style="color: var(--color-slate-500);">${MESSAGES.DEFAULTS.ENCRYPTED_INDICATOR}</em>`;

  row.innerHTML = `
    <td><strong>${escapeHtml(entry.name)}</strong></td>
    <td dir="ltr" style="font-family: monospace;">${displayPassword}</td>
    <td>${entry.timestamp}</td>
    <td>
      <button class="history-icon-btn" data-action="copy" data-index="${index}" aria-label="کپی رمز ${escapeHtml(entry.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="#d4a84b" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </button>
      <button class="history-icon-btn" data-action="delete" data-index="${index}" aria-label="حذف رمز ${escapeHtml(entry.name)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="#bf5b5b" stroke-width="2">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
    </td>
  `;

  return row;
}

export async function handleHistoryAction(event, toastContainer) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return false;

  const index = Number(actionEl.getAttribute('data-index'));
  const action = actionEl.getAttribute('data-action');

  if (Number.isNaN(index)) return false;

  switch (action) {
    case 'copy':
      return handleCopyAction(index, toastContainer);
    case 'delete':
      return handleDeleteAction(index, toastContainer);
    default:
      return false;
  }
}

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
    }

    showToast(MESSAGES.WARNING.HTTPS_REQUIRED, 'warning', toastContainer);
    return false;
  } catch (error) {
    console.error('[UIService] Copy action failed:', error);
    showToast(error.message || MESSAGES.ERROR.COPY_RESTRICTED, 'error', toastContainer);
    return false;
  }
}

function handleDeleteAction(index, toastContainer) {
  const success = removePasswordFromHistory(index);

  if (success) {
    showToast(MESSAGES.SUCCESS.ITEM_DELETED, 'warning', toastContainer);
  }

  return success;
}

export function updateStrengthBadge(lengthRange, lengthValue, strengthBadge, options) {
  if (!lengthRange || !lengthValue || !strengthBadge) return;

  const length = parseInt(lengthRange.value, 10) || 12;
  const typesSelected = Object.values(options).filter(Boolean).length;

  lengthValue.textContent = length;

  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  score += Math.max(0, typesSelected - 1);

  let label;
  let className;
  if (score <= 2) {
    label = MESSAGES.DEFAULTS.STRENGTH_WEAK;
    className = 'strength-weak';
  } else if (score <= 4) {
    label = MESSAGES.DEFAULTS.STRENGTH_MEDIUM;
    className = 'strength-medium';
  } else {
    label = MESSAGES.DEFAULTS.STRENGTH_STRONG;
    className = 'strength-strong';
  }

  strengthBadge.textContent = label;
  strengthBadge.className = `strength-badge ${className}`;
}

export function toggleAdvancedSettings(panel, toggleBtn, icon) {
  if (!panel) return false;

  const isHidden = panel.classList.contains('hidden');

  if (isHidden) {
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
  } else {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  }

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  }

  if (icon) {
    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }

  return isHidden;
}

export function updateFormForDifficulty(difficulty, lengthRange, checkboxes, difficultyLevels) {
  const settings = difficultyLevels[difficulty];
  if (!settings) return;

  if (lengthRange) {
    lengthRange.value = settings.length;
    lengthRange.dispatchEvent(new Event('input'));
  }

  if (checkboxes.uppercase) checkboxes.uppercase.checked = settings.uppercase;
  if (checkboxes.lowercase) checkboxes.lowercase.checked = settings.lowercase;
  if (checkboxes.numbers) checkboxes.numbers.checked = settings.numbers;
  if (checkboxes.symbols) checkboxes.symbols.checked = settings.symbols;
}
