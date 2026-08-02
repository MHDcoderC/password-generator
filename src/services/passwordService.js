import {
  CHAR_SETS,
  PASSWORD_CONFIG,
  ENCRYPTION_CONFIG,
  MESSAGES
} from '../config/constants.js';

import {
  encryptString,
  decryptString,
  hashPassword,
  getCachedMasterKey,
  CryptoError
} from './cryptoService.js';

import { getPersianTimestamp } from '../utils/formatters.js';

export class PasswordError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'PasswordError';
    this.code = code;
    this.originalError = originalError;
  }
}

export function generatePassword(length, options) {
  try {
    if (length < PASSWORD_CONFIG.MIN_LENGTH || length > PASSWORD_CONFIG.MAX_LENGTH) {
      throw new PasswordError(MESSAGES.ERROR.INVALID_LENGTH, 'INVALID_LENGTH');
    }

    const selectedOptions = Object.entries(options).filter(([, value]) => value);
    if (selectedOptions.length === 0) {
      throw new PasswordError(MESSAGES.ERROR.NO_CHARACTER_SELECTED, 'NO_CHARACTER_TYPE');
    }

    if (selectedOptions.length > length) {
      throw new PasswordError(
        `طول پسورد باید حداقل ${selectedOptions.length} کاراکتر باشد`,
        'INSUFFICIENT_LENGTH'
      );
    }

    let allowedChars = '';
    for (const [key, enabled] of Object.entries(options)) {
      if (enabled && CHAR_SETS[key.toUpperCase()]) {
        allowedChars += CHAR_SETS[key.toUpperCase()];
      }
    }

    let password = '';
    const cryptoObj = window.crypto || window.msCrypto;

    if (cryptoObj?.getRandomValues) {
      for (const [key, enabled] of Object.entries(options)) {
        if (enabled && CHAR_SETS[key.toUpperCase()]) {
          const charSet = CHAR_SETS[key.toUpperCase()];
          const randomValue = new Uint32Array(1);
          cryptoObj.getRandomValues(randomValue);
          password += charSet[randomValue[0] % charSet.length];
        }
      }

      const remaining = length - password.length;
      const randomValues = new Uint32Array(remaining);
      cryptoObj.getRandomValues(randomValues);

      for (let i = 0; i < remaining; i++) {
        password += allowedChars[randomValues[i] % allowedChars.length];
      }

      password = fisherYatesShuffle(password, cryptoObj);
    } else {
      console.warn('[PasswordService] Using Math.random fallback');
      for (let i = 0; i < length; i++) {
        password += allowedChars[Math.floor(Math.random() * allowedChars.length)];
      }
    }

    const strength = calculateStrength(length, selectedOptions.length);

    return {
      password,
      score: strength.score,
      strengthLabel: strength.label
    };
  } catch (error) {
    if (error instanceof PasswordError) throw error;
    throw new PasswordError('Failed to generate password', 'GENERATION_FAILED', error);
  }
}

function fisherYatesShuffle(str, cryptoObj) {
  const arr = str.split('');
  const n = arr.length;

  for (let i = n - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1);
    cryptoObj.getRandomValues(randomValues);
    const j = randomValues[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

function calculateStrength(length, charTypes) {
  let score = 0;

  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  score += Math.max(0, charTypes - 1);

  if (score <= 2) return { score, label: 'weak' };
  if (score <= 4) return { score, label: 'medium' };
  return { score, label: 'strong' };
}

export function computeStrengthForUI(length, checkedOptions) {
  const typesSelected = Object.values(checkedOptions).filter(Boolean).length;

  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  score += Math.max(0, typesSelected - 1);

  if (score <= 2) {
    return { label: MESSAGES.DEFAULTS.STRENGTH_WEAK, className: 'strength-weak' };
  }
  if (score <= 4) {
    return { label: MESSAGES.DEFAULTS.STRENGTH_MEDIUM, className: 'strength-medium' };
  }
  return { label: MESSAGES.DEFAULTS.STRENGTH_STRONG, className: 'strength-strong' };
}

export function getPasswordHistory() {
  try {
    const history = localStorage.getItem(ENCRYPTION_CONFIG.STORAGE_KEYS.PASSWORD_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('[PasswordService] Failed to parse password history:', error);
    return [];
  }
}

export function setPasswordHistory(history) {
  try {
    localStorage.setItem(
      ENCRYPTION_CONFIG.STORAGE_KEYS.PASSWORD_HISTORY,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('[PasswordService] Failed to save password history:', error);
    throw new PasswordError('Failed to save history to localStorage', 'STORAGE_ERROR', error);
  }
}

export async function addPasswordToHistory(password, name, secureSave) {
  try {
    if (!password || typeof password !== 'string') {
      throw new PasswordError('Invalid password', 'INVALID_INPUT');
    }

    const hashedPassword = await hashPassword(password);

    const entry = {
      name: name && name.trim() ? name.trim() : MESSAGES.DEFAULTS.PASSWORD_NAME,
      password: null,
      encrypted: null,
      hashedPassword,
      timestamp: getPersianTimestamp()
    };

    if (secureSave) {
      const masterKey = getCachedMasterKey();
      if (!masterKey) {
        throw new PasswordError(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'MASTER_KEY_REQUIRED');
      }

      try {
        entry.encrypted = await encryptString(password, masterKey);
      } catch (error) {
        throw new PasswordError(MESSAGES.ERROR.ENCRYPTION_FAILED, 'ENCRYPTION_ERROR', error);
      }
    } else {
      entry.password = password;
    }

    const history = getPasswordHistory();
    history.unshift(entry);
    setPasswordHistory(history);

    return true;
  } catch (error) {
    console.error('[PasswordService] Failed to add password to history:', error);
    if (error instanceof PasswordError) throw error;
    throw new PasswordError('Failed to add password to history', 'HISTORY_ADD_FAILED', error);
  }
}

export async function getPasswordFromHistory(index) {
  const history = getPasswordHistory();

  if (index < 0 || index >= history.length) {
    throw new PasswordError('Invalid history index', 'INVALID_INDEX');
  }

  const entry = history[index];

  if (entry.password) return entry.password;

  if (entry.encrypted) {
    const masterKey = getCachedMasterKey();
    if (!masterKey) {
      throw new PasswordError(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'MASTER_KEY_REQUIRED');
    }

    try {
      return await decryptString(entry.encrypted, masterKey);
    } catch (error) {
      throw new PasswordError(MESSAGES.ERROR.MASTER_KEY_INCORRECT, 'DECRYPTION_FAILED', error);
    }
  }

  return null;
}

export function removePasswordFromHistory(index) {
  const history = getPasswordHistory();

  if (index < 0 || index >= history.length) return false;

  history.splice(index, 1);
  setPasswordHistory(history);

  return true;
}

export function clearPasswordHistory() {
  localStorage.removeItem(ENCRYPTION_CONFIG.STORAGE_KEYS.PASSWORD_HISTORY);
}

export function getDifficultySettings(difficulty) {
  return PASSWORD_CONFIG.DIFFICULTY_LEVELS[difficulty] || null;
}
