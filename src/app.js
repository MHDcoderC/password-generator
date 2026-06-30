import { DOM_IDS, MESSAGES } from './config/constants.js';
import { DOMCache } from './utils/domHelpers.js';
import { showToast, updateHistoryTable } from './services/uiService.js';
import { initParticleSystem, initCustomCursor, initLoader } from './services/effectsService.js';
import { createHandlers } from './handlers.js';

const appState = {
  currentPassword: '',
  currentPasswordTimestamp: '',
  isModalOpen: false
};

const dom = new DOMCache();

function initializeDOMCache() {
  Object.values(DOM_IDS).forEach(id => dom.get(id));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env?.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}

function initializeApp() {
  initializeDOMCache();

  initParticleSystem(dom.get(DOM_IDS.BACKGROUND));
  initCustomCursor(dom.get(DOM_IDS.CUSTOM_CURSOR));
  initLoader(dom.get(DOM_IDS.LOADER));

  const handlers = createHandlers(dom, appState);
  handlers.bindEvents();
  handlers.handleDifficultyChange();
  handlers.updateStrengthIndicator();

  updateHistoryTable(
    dom.get(DOM_IDS.HISTORY_TABLE_BODY),
    dom.get(DOM_IDS.EMPTY_HISTORY),
    dom.get(DOM_IDS.HISTORY_ICON),
    dom.get(DOM_IDS.HISTORY_MODAL)
  );

  registerServiceWorker();

  if (!window.isSecureContext && location.hostname !== 'localhost') {
    setTimeout(() => {
      showToast(MESSAGES.WARNING.NON_SECURE_CONTEXT, 'warning', dom.get(DOM_IDS.TOAST_CONTAINER));
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);

export { appState, dom };
