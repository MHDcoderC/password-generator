// DOM Elements
const elements = {
  form: document.getElementById('passwordForm'),
  modal: document.getElementById('modal'),
  generatedPassword: document.getElementById('generatedPassword'),
  modalMeta: document.getElementById('modalMeta'),
  saveBtn: document.getElementById('saveBtn'),
  copyBtn: document.getElementById('copyBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  historyIcon: document.getElementById('historyIcon'),
  historyModal: document.getElementById('historyModal'),
  historyTableBody: document.getElementById('historyTableBody'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  customCursor: document.getElementById('customCursor'),
  background: document.getElementById('background'),
  passwordName: document.getElementById('passwordName'),
  difficulty: document.getElementById('difficulty'),
  length: document.getElementById('length'),
  uppercase: document.getElementById('uppercase'),
  lowercase: document.getElementById('lowercase'),
  numbers: document.getElementById('numbers'),
  symbols: document.getElementById('symbols'),
  toastContainer: document.getElementById('toastContainer'),
  loader: document.getElementById('loader'),
  setMasterKeyBtn: document.getElementById('setMasterKeyBtn'),
};

// State
let currentPassword = '';
let currentPasswordTimestamp = '';

// Character Sets
const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Secure storage (AES-GCM) helpers
let cachedMasterKey = null; // CryptoKey in memory

async function importMasterKeyFromPass(passphrase) {
  const encoder = new TextEncoder();
  // For production, prefer a per-user random salt stored in localStorage
  const saltBytes = encoder.encode('pwgen-static-salt-v1');
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const derivedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: 150000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return derivedKey;
}

async function ensureMasterKey({ forceSet } = { forceSet: false }) {
  if (cachedMasterKey && !forceSet) return cachedMasterKey;
  let passphrase = null;
  const hint = localStorage.getItem('pwgen_master_key_hint');
  if (!hint || forceSet) {
    passphrase = prompt('کلید اصلی را تعیین کنید (فراموش نکنید):');
    if (!passphrase) throw new Error('کلید اصلی تعیین نشد');
    localStorage.setItem('pwgen_master_key_hint', 'set');
  } else {
    passphrase = prompt('کلید اصلی را وارد کنید:');
    if (!passphrase) throw new Error('کلید اصلی وارد نشد');
  }
  cachedMasterKey = await importMasterKeyFromPass(passphrase);
  return cachedMasterKey;
}

async function aesEncryptString(plainText, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plainText));
  const out = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(cipherBuf), iv.byteLength);
  return btoa(String.fromCharCode(...out));
}

async function aesDecryptString(base64, key) {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plainBuf);
}

// Create Particles (lightweight)
function createParticles() {
  const count = 6;
  for (let i = 0; i < count; i++) {
    createParticle();
  }
}

function createParticle() {
  const particle = document.createElement('div');
  particle.className = 'particle';
  const size = Math.random() * 5 + 5;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;
  particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`);
  particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 100}px`);
  particle.style.animationDuration = `${Math.random() * 8 + 12}s`;

  particle.addEventListener('click', () => {
    particle.classList.add('pop');
    setTimeout(() => {
      particle.remove();
      createParticle();
    }, 300);
  });

  elements.background.appendChild(particle);
}

// Custom Cursor
document.addEventListener('mousemove', (e) => {
  elements.customCursor.style.left = `${e.clientX}px`;
  elements.customCursor.style.top = `${e.clientY}px`;
});
document.addEventListener('mousedown', () => {
  elements.customCursor.classList.add('click');
  setTimeout(() => elements.customCursor.classList.remove('click'), 100);
});

// Loader
window.addEventListener('load', () => {
  setTimeout(() => {
    if (elements.loader) elements.loader.classList.add('hidden');
  }, 350);
});

// Toasts
function showToast(message, type = 'success') {
  if (!elements.toastContainer) return alert(message);
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconSvg = type === 'success'
    ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
    : type === 'error'
    ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
    : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

// Hash Password (SHA-256) using Web Crypto API
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getTimestampFa(date = new Date()) {
  return date.toLocaleString('fa-IR');
}

// Save Password (plaintext or encrypted) with hash
async function savePassword(password, name, timestamp) {
  const hashedPassword = await hashPassword(password);
  const secureChecked = document.getElementById('secureSave')?.checked;
  let storedPassword = password;
  let encrypted = null;
  if (secureChecked) {
    try {
      const key = await ensureMasterKey();
      encrypted = await aesEncryptString(password, key);
      storedPassword = null; // do not store plaintext when secure mode is on
    } catch (e) {
      showToast('کلید اصلی تنظیم نشد.', 'error');
      return;
    }
  }
  const passwordEntry = {
    name: name || 'رمز شما',
    password: storedPassword,
    encrypted, // base64 (iv||cipher)
    hashedPassword: hashedPassword,
    timestamp: timestamp || getTimestampFa(),
  };
  const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
  history.push(passwordEntry);
  localStorage.setItem('passwordHistory', JSON.stringify(history));
  updateHistoryTable();
}

// Update History Table and toggle icon visibility
function updateHistoryTable() {
  const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
  elements.historyTableBody.innerHTML = '';
  history.forEach((entry, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.name}</td>
      <td>${entry.password ? entry.password : '—'}</td>
      <td>${entry.timestamp}</td>
      <td>
        <button class="history-icon-btn" data-action="copy" data-index="${index}" aria-label="کپی">
          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6a2 2 0 002-2V9m-4-6h6m-6 0v4" />
          </svg>
        </button>
        <button class="history-icon-btn" data-action="delete" data-index="${index}" aria-label="حذف">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </td>
    `;
    elements.historyTableBody.appendChild(row);
  });
  if (history.length > 0) {
    elements.historyIcon.classList.remove('hidden');
  } else {
    elements.historyIcon.classList.add('hidden');
  }
}

// Copy History Password
// History table actions (event delegation)
elements.historyTableBody.addEventListener('click', async (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const index = Number(actionEl.getAttribute('data-index'));
  const action = actionEl.getAttribute('data-action');
  const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
  if (Number.isNaN(index) || !history[index]) return;

  if (action === 'copy') {
    let value = history[index].password || '';
    if (!value && history[index].encrypted) {
      try {
        const key = await ensureMasterKey();
        value = await aesDecryptString(history[index].encrypted, key);
      } catch (err) {
        showToast('کلید اصلی صحیح نیست.', 'error');
        return;
      }
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        showToast('رمز کپی شد', 'success');
      } else {
        showToast('کپی فقط در HTTPS/localhost پشتیبانی می‌شود.', 'warning');
        return;
      }
    } catch (err) {
      showToast('دسترسی کپی محدود است. لطفاً روی HTTPS اجرا کنید.', 'error');
    }
  }

  if (action === 'delete') {
    history.splice(index, 1);
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    updateHistoryTable();
    showToast('آیتم حذف شد', 'warning');
  }
});

// Clear History
elements.clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('passwordHistory');
  elements.historyModal.classList.add('hidden');
  updateHistoryTable();
  showToast('تاریخچه حذف شد', 'warning');
});

// Update Form Based on Difficulty
function updateFormBasedOnDifficulty() {
  const difficulty = elements.difficulty.value;
  const rangeEl = document.getElementById('lengthRange');
  if (difficulty === 'easy') {
    if (rangeEl) rangeEl.value = 8;
    elements.uppercase.checked = false;
    elements.lowercase.checked = true;
    elements.numbers.checked = true;
    elements.symbols.checked = false;
  } else if (difficulty === 'medium') {
    if (rangeEl) rangeEl.value = 12;
    elements.uppercase.checked = true;
    elements.lowercase.checked = true;
    elements.numbers.checked = true;
    elements.symbols.checked = false;
  } else if (difficulty === 'hard') {
    if (rangeEl) rangeEl.value = 16;
    elements.uppercase.checked = true;
    elements.lowercase.checked = true;
    elements.numbers.checked = true;
    elements.symbols.checked = true;
  } else if (difficulty === 'custom') {
    // Do not override user selections
  }
  // fire UI update for range & strength
  if (rangeEl) {
    const evt = new Event('input');
    rangeEl.dispatchEvent(evt);
  }
}

function computeStrengthLabel() {
  const lenEl = document.getElementById('lengthRange');
  const length = parseInt((lenEl && lenEl.value) ? lenEl.value : '0');
  const typesSelected = [
    elements.uppercase.checked,
    elements.lowercase.checked,
    elements.numbers.checked,
    elements.symbols.checked,
  ].filter(Boolean).length;
  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  score += Math.max(0, typesSelected - 1); // 0..3
  if (score <= 2) return 'پایه';
  if (score <= 4) return 'متوسط';
  return 'قوی';
}

// Generate Password
function generatePassword() {
  const lengthInput = document.getElementById('lengthRange');
  const length = parseInt(lengthInput ? lengthInput.value : (elements.length ? elements.length.value : 12));
  const options = {
    uppercase: elements.uppercase.checked,
    lowercase: elements.lowercase.checked,
    numbers: elements.numbers.checked,
    symbols: elements.symbols.checked,
  };

  if (!Object.values(options).some(Boolean)) {
    showToast('لطفاً حداقل یک نوع کاراکتر را انتخاب کنید.', 'error');
    return null;
  }

  if (length < 4 || length > 50) {
    showToast('طول پسورد باید بین 4 تا 50 کاراکتر باشد.', 'error');
    return null;
  }

  let chars = '';
  for (const [key, value] of Object.entries(options)) {
    if (value) chars += charSets[key];
  }

  let password = '';
  const cryptoObj = window.crypto || window.msCrypto;
  // Prefer secure randomness when available
  if (cryptoObj && cryptoObj.getRandomValues) {
    const randomValues = new Uint32Array(length);
    cryptoObj.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      password += chars[randomValues[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
  }

  return password;
}

// Show Modal
function showModal(password) {
  elements.generatedPassword.textContent = password;
  const nameLabel = elements.passwordName.value?.trim() || 'رمز شما';
  const strength = computeStrengthLabel();
  elements.modalMeta.textContent = `نام: ${nameLabel} — تاریخ: ${currentPasswordTimestamp} — سطح امنیت: ${strength}`;
  elements.modal.classList.remove('hidden');
}

// Initialize Particles and Form
createParticles();
updateFormBasedOnDifficulty();
updateHistoryTable();
if (!window.isSecureContext && location.hostname !== 'localhost') {
  showToast('برای تجربه کامل (دسترسی کلیپ‌بورد)، اپ را روی HTTPS اجرا کنید.', 'warning');
}

// Register Service Worker only in production (avoid dev issues with Vite HMR)
if ('serviceWorker' in navigator && (typeof import.meta !== 'undefined') && import.meta.env && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* ignore */ });
  });
}

// Event Listeners
elements.difficulty.addEventListener('change', updateFormBasedOnDifficulty);

// Range & strength live updates
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const strengthBadge = document.getElementById('strengthBadge');
if (lengthRange && lengthValue && strengthBadge) {
  const updateStrengthUI = () => {
    lengthValue.textContent = lengthRange.value;
    const label = computeStrengthLabel();
    strengthBadge.textContent = label;
    strengthBadge.classList.remove('strength-weak','strength-medium','strength-strong');
    if (label === 'پایه') strengthBadge.classList.add('strength-weak');
    else if (label === 'متوسط') strengthBadge.classList.add('strength-medium');
    else strengthBadge.classList.add('strength-strong');
  };
  lengthRange.addEventListener('input', updateStrengthUI);
  ['uppercase','lowercase','numbers','symbols'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateStrengthUI);
  });
  updateStrengthUI();
}

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = generatePassword();
  if (password) {
    currentPassword = password;
    currentPasswordTimestamp = getTimestampFa();
    showModal(password);
  }
});

// Master key setter
if (elements.setMasterKeyBtn) {
  elements.setMasterKeyBtn.addEventListener('click', async () => {
    try {
      await ensureMasterKey({ forceSet: true });
      showToast('کلید اصلی تنظیم شد', 'success');
    } catch (_) {
      showToast('تنظیم کلید لغو شد', 'warning');
    }
  });
}

elements.saveBtn.addEventListener('click', async () => {
  if (!currentPassword) return;
  const name = elements.passwordName.value?.trim() || 'رمز شما';
  await savePassword(currentPassword, name, currentPasswordTimestamp);
  elements.modal.classList.add('hidden');
  elements.passwordName.value = '';
  showToast('رمز ذخیره شد', 'success');
});

elements.copyBtn.addEventListener('click', async () => {
  const value = elements.generatedPassword.textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      showToast('پسورد کپی شد', 'success');
    } else {
      showToast('کپی فقط در HTTPS/localhost پشتیبانی می‌شود.', 'warning');
    }
  } catch (e) {
    showToast('دسترسی کپی محدود است. لطفاً روی HTTPS اجرا کنید.', 'error');
  }
});

elements.regenerateBtn.addEventListener('click', () => {
  const password = generatePassword();
  if (password) {
    currentPassword = password;
    currentPasswordTimestamp = getTimestampFa();
    showModal(password);
    showToast('پسورد جدید تولید شد', 'success');
  }
});

elements.closeModalBtn.addEventListener('click', () => {
  elements.modal.classList.add('hidden');
});

elements.historyIcon.addEventListener('click', () => {
  elements.historyModal.classList.remove('hidden');
});

elements.historyModal.addEventListener('click', (e) => {
  if (e.target === elements.historyModal) {
    elements.historyModal.classList.add('hidden');
  }
});

// Advanced settings toggle
const advancedToggleBtn = document.getElementById('advancedToggleBtn');
const advancedSettings = document.getElementById('advancedSettings');
if (advancedToggleBtn && advancedSettings) {
  advancedToggleBtn.addEventListener('click', () => {
    advancedSettings.classList.toggle('hidden');
  });
}

// Escape to close modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    elements.modal.classList.add('hidden');
    elements.historyModal.classList.add('hidden');
  }
});
