import { DOM_IDS, PASSWORD_CONFIG, MESSAGES } from './config/constants.js';
import { safeAddEventListener } from './utils/domHelpers.js';
import { getPersianTimestamp } from './utils/formatters.js';
import { generatePassword, addPasswordToHistory, clearPasswordHistory } from './services/passwordService.js';
import { ensureMasterKey, setCachedMasterKey, getCachedMasterKey } from './services/cryptoService.js';
import { showToast, toggleModal, updateHistoryTable, handleHistoryAction, updateStrengthBadge, toggleAdvancedSettings, updateFormForDifficulty } from './services/uiService.js';

export function createHandlers(dom, appState) {
  function getCheckboxStates() {
    return {
      uppercase: dom.get(DOM_IDS.UPPERCASE)?.checked ?? true,
      lowercase: dom.get(DOM_IDS.LOWERCASE)?.checked ?? true,
      numbers: dom.get(DOM_IDS.NUMBERS)?.checked ?? true,
      symbols: dom.get(DOM_IDS.SYMBOLS)?.checked ?? true
    };
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function showPasswordModal(result) {
    const modal = dom.get(DOM_IDS.MODAL);
    const passwordEl = dom.get(DOM_IDS.GENERATED_PASSWORD);
    const metaEl = dom.get(DOM_IDS.MODAL_META);
    if (!modal || !passwordEl) return;

    passwordEl.textContent = result.password;

    const nameLabel = dom.get(DOM_IDS.PASSWORD_NAME)?.value?.trim() || MESSAGES.DEFAULTS.PASSWORD_NAME;
    const strengthColor = result.strengthLabel === 'strong' ? '#7a9e7e'
      : result.strengthLabel === 'medium' ? '#d4a84b' : '#bf5b5b';

    if (metaEl) {
      metaEl.innerHTML = `
        <span style="color: var(--color-slate-500);">نام:</span> ${nameLabel}
        <span style="margin: 0 0.5rem; color: var(--color-slate-700);">|</span>
        <span style="color: var(--color-slate-500);">تاریخ:</span> ${appState.currentPasswordTimestamp}
        <span style="margin: 0 0.5rem; color: var(--color-slate-700);">|</span>
        <span style="color: var(--color-slate-500);">سطح:</span>
        <strong style="color: ${strengthColor};">${result.strengthLabel === 'strong' ? 'قوی' : result.strengthLabel === 'medium' ? 'متوسط' : 'پایه'}</strong>
      `;
    }

    toggleModal(modal, true);
    appState.isModalOpen = true;

    setTimeout(() => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(passwordEl);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 100);
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const length = parseInt(dom.get(DOM_IDS.LENGTH_RANGE)?.value, 10) || 12;
    const options = getCheckboxStates();

    try {
      const result = generatePassword(length, options);
      if (result) {
        appState.currentPassword = result.password;
        appState.currentPasswordTimestamp = getPersianTimestamp();
        showPasswordModal(result);
      }
    } catch (error) {
      showToast(error.message, 'error', dom.get(DOM_IDS.TOAST_CONTAINER));
    }
  }

  async function handleCopyPassword() {
    if (!appState.currentPassword) return;
    const success = await copyToClipboard(appState.currentPassword);
    if (success) {
      showToast(MESSAGES.SUCCESS.PASSWORD_COPIED, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
    } else {
      showToast(MESSAGES.WARNING.HTTPS_REQUIRED, 'warning', dom.get(DOM_IDS.TOAST_CONTAINER));
    }
  }

  async function handleSavePassword() {
    if (!appState.currentPassword) return;
    const name = dom.get(DOM_IDS.PASSWORD_NAME)?.value?.trim() || MESSAGES.DEFAULTS.PASSWORD_NAME;
    const secureSave = dom.get(DOM_IDS.SECURE_SAVE)?.checked ?? false;

    if (secureSave && !getCachedMasterKey()) {
      try {
        const key = await ensureMasterKey();
        setCachedMasterKey(key);
      } catch {
        showToast(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'error', dom.get(DOM_IDS.TOGGLE_ICON));
        return;
      }
    }

    try {
      const success = await addPasswordToHistory(appState.currentPassword, name, secureSave);
      if (success) {
        const nameInput = dom.get(DOM_IDS.PASSWORD_NAME);
        if (nameInput) nameInput.value = '';
        toggleModal(dom.get(DOM_IDS.MODAL), false);
        appState.isModalOpen = false;
        showToast(MESSAGES.SUCCESS.PASSWORD_SAVED, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
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

  function handleRegeneratePassword() {
    const length = parseInt(dom.get(DOM_IDS.LENGTH_RANGE)?.value, 10) || 12;
    const options = getCheckboxStates();
    try {
      const result = generatePassword(length, options);
      if (result) {
        appState.currentPassword = result.password;
        appState.currentPasswordTimestamp = getPersianTimestamp();
        showPasswordModal(result);
        showToast(MESSAGES.SUCCESS.NEW_PASSWORD_GENERATED, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
      }
    } catch (error) {
      showToast(error.message, 'error', dom.get(DOM_IDS.TOAST_CONTAINER));
    }
  }

  function updateStrengthIndicator() {
    updateStrengthBadge(
      dom.get(DOM_IDS.LENGTH_RANGE),
      dom.get(DOM_IDS.LENGTH_VALUE),
      dom.get(DOM_IDS.STRENGTH_BADGE),
      getCheckboxStates()
    );
  }

  function handleDifficultyChange() {
    const difficulty = dom.get(DOM_IDS.DIFFICULTY)?.value;
    const checkboxes = {
      uppercase: dom.get(DOM_IDS.UPPERCASE),
      lowercase: dom.get(DOM_IDS.LOWERCASE),
      numbers: dom.get(DOM_IDS.NUMBERS),
      symbols: dom.get(DOM_IDS.SYMBOLS)
    };
    updateFormForDifficulty(difficulty, dom.get(DOM_IDS.LENGTH_RANGE), checkboxes, PASSWORD_CONFIG.DIFFICULTY_LEVELS);
    updateStrengthIndicator();
  }

  function handleToggleAdvanced() {
    toggleAdvancedSettings(
      dom.get(DOM_IDS.ADVANCED_SETTINGS),
      dom.get(DOM_IDS.ADVANCED_TOGGLE_BTN),
      dom.get(DOM_IDS.TOGGLE_ICON)
    );
  }

  async function handleSetMasterKey() {
    try {
      const key = await ensureMasterKey({ forceSet: true });
      setCachedMasterKey(key);
      showToast(MESSAGES.SUCCESS.MASTER_KEY_SET, 'success', dom.get(DOM_IDS.TOAST_CONTAINER));
    } catch {
      showToast(MESSAGES.WARNING.MASTER_KEY_CANCELLED, 'warning', dom.get(DOM_IDS.TOAST_CONTAINER));
    }
  }

  function handleShowHistory() {
    updateHistoryTable(
      dom.get(DOM_IDS.HISTORY_TABLE_BODY),
      dom.get(DOM_IDS.EMPTY_HISTORY),
      dom.get(DOM_IDS.HISTORY_ICON),
      dom.get(DOM_IDS.HISTORY_MODAL)
    );
    toggleModal(dom.get(DOM_IDS.HISTORY_MODAL), true);
  }

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

  async function handleHistoryTableClick(event) {
    const handled = await handleHistoryAction(event, dom.get(DOM_IDS.TOAST_CONTAINER));
    if (handled) {
      updateHistoryTable(
        dom.get(DOM_IDS.HISTORY_TABLE_BODY),
        dom.get(DOM_IDS.EMPTY_HISTORY),
        dom.get(DOM_IDS.HISTORY_ICON),
        dom.get(DOM_IDS.HISTORY_MODAL)
      );
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      toggleModal(dom.get(DOM_IDS.MODAL), false);
      toggleModal(dom.get(DOM_IDS.HISTORY_MODAL), false);
      appState.isModalOpen = false;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      const form = dom.get(DOM_IDS.PASSWORD_FORM);
      if (form) form.dispatchEvent(new Event('submit'));
    }
  }

  function bindEvents() {
    safeAddEventListener(dom.get(DOM_IDS.PASSWORD_FORM), 'submit', handleFormSubmit);
    safeAddEventListener(dom.get(DOM_IDS.DIFFICULTY), 'change', handleDifficultyChange);
    safeAddEventListener(dom.get(DOM_IDS.LENGTH_RANGE), 'input', updateStrengthIndicator);

    [DOM_IDS.UPPERCASE, DOM_IDS.LOWERCASE, DOM_IDS.NUMBERS, DOM_IDS.SYMBOLS].forEach(id => {
      safeAddEventListener(dom.get(id), 'change', updateStrengthIndicator);
    });

    safeAddEventListener(dom.get(DOM_IDS.SAVE_BTN), 'click', handleSavePassword);
    safeAddEventListener(dom.get(DOM_IDS.COPY_BTN), 'click', handleCopyPassword);
    safeAddEventListener(dom.get(DOM_IDS.QUICK_COPY_BTN), 'click', handleCopyPassword);
    safeAddEventListener(dom.get(DOM_IDS.REGENERATE_BTN), 'click', handleRegeneratePassword);
    safeAddEventListener(dom.get(DOM_IDS.CLOSE_MODAL_BTN), 'click', () => {
      toggleModal(dom.get(DOM_IDS.MODAL), false);
      appState.isModalOpen = false;
    });

    safeAddEventListener(dom.get(DOM_IDS.ADVANCED_TOGGLE_BTN), 'click', handleToggleAdvanced);
    safeAddEventListener(dom.get(DOM_IDS.SET_MASTER_KEY_BTN), 'click', handleSetMasterKey);

    safeAddEventListener(dom.get(DOM_IDS.HISTORY_ICON), 'click', handleShowHistory);
    safeAddEventListener(dom.get(DOM_IDS.CLEAR_HISTORY_BTN), 'click', handleClearHistory);
    safeAddEventListener(dom.get(DOM_IDS.HISTORY_TABLE_BODY), 'click', handleHistoryTableClick);

    safeAddEventListener(dom.get(DOM_IDS.HISTORY_MODAL), 'click', (e) => {
      if (e.target === dom.get(DOM_IDS.HISTORY_MODAL)) {
        toggleModal(dom.get(DOM_IDS.HISTORY_MODAL), false);
      }
    });

    document.addEventListener('keydown', handleKeyDown);
  }

  return {
    handleDifficultyChange,
    updateStrengthIndicator,
    bindEvents
  };
}
