export class DOMCache {
  constructor() {
    this.elements = {};
  }

  get(id) {
    if (!this.elements[id]) {
      this.elements[id] = document.getElementById(id);
    }
    return this.elements[id];
  }

  getAll(ids) {
    return ids.reduce((acc, id) => {
      acc[id] = this.get(id);
      return acc;
    }, {});
  }

  clear() {
    this.elements = {};
  }
}

export function safeAddEventListener(element, event, handler, options) {
  if (!element) {
    console.warn(`[DOM] Element not found for event: ${event}`);
    return;
  }
  element.addEventListener(event, handler, options);
}

export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

export function isClipboardSupported() {
  return !!(navigator.clipboard && window.isSecureContext);
}
