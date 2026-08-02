import { ENCRYPTION_CONFIG, MESSAGES } from '../config/constants.js';

export class CryptoError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'CryptoError';
    this.code = code;
    this.originalError = originalError;
  }
}

let cachedMasterKey = null;

export function getCachedMasterKey() {
  return cachedMasterKey;
}

export function setCachedMasterKey(key) {
  cachedMasterKey = key;
}

export function clearCachedMasterKey() {
  cachedMasterKey = null;
}

export async function ensureMasterKey({ forceSet = false } = {}) {
  if (cachedMasterKey && !forceSet) {
    return cachedMasterKey;
  }

  const hint = localStorage.getItem(ENCRYPTION_CONFIG.STORAGE_KEYS.MASTER_KEY_HINT);
  let passphrase = null;

  if (!hint || forceSet) {
    passphrase = prompt('کلید اصلی را تعیین کنید (فراموش نکنید):');
    if (!passphrase) {
      throw new CryptoError(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'MASTER_KEY_CANCELLED');
    }
    localStorage.setItem(ENCRYPTION_CONFIG.STORAGE_KEYS.MASTER_KEY_HINT, 'set');
  } else {
    passphrase = prompt('کلید اصلی را وارد کنید:');
    if (!passphrase) {
      throw new CryptoError(MESSAGES.ERROR.MASTER_KEY_NOT_SET, 'MASTER_KEY_CANCELLED');
    }
  }

  cachedMasterKey = await deriveKeyFromPassphrase(passphrase);
  return cachedMasterKey;
}

export async function deriveKeyFromPassphrase(passphrase) {
  try {
    if (!passphrase || typeof passphrase !== 'string') {
      throw new CryptoError('Passphrase must be a non-empty string', 'INVALID_PASSPHRASE');
    }

    const encoder = new TextEncoder();
    const saltBytes = encoder.encode(ENCRYPTION_CONFIG.STATIC_SALT);

    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: ENCRYPTION_CONFIG.PBKDF2_ITERATIONS,
        hash: ENCRYPTION_CONFIG.PBKDF2_HASH
      },
      baseKey,
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        length: ENCRYPTION_CONFIG.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError('Failed to derive encryption key', 'DERIVATION_FAILED', error);
  }
}

export async function encryptString(plainText, key) {
  try {
    if (!plainText || typeof plainText !== 'string') {
      throw new CryptoError('Plain text must be a non-empty string', 'INVALID_INPUT');
    }

    if (!key) {
      throw new CryptoError('Encryption key is required', 'MISSING_KEY');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH));

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: ENCRYPTION_CONFIG.ALGORITHM, iv },
      key,
      encoder.encode(plainText)
    );

    const output = new Uint8Array(iv.length + cipherBuffer.byteLength);
    output.set(iv, 0);
    output.set(new Uint8Array(cipherBuffer), iv.length);

    return btoa(String.fromCharCode(...output));
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError(MESSAGES.ERROR.ENCRYPTION_FAILED, 'ENCRYPTION_FAILED', error);
  }
}

export async function decryptString(base64Cipher, key) {
  try {
    if (!base64Cipher || typeof base64Cipher !== 'string') {
      throw new CryptoError('Cipher text must be a non-empty string', 'INVALID_INPUT');
    }

    if (!key) {
      throw new CryptoError('Decryption key is required', 'MISSING_KEY');
    }

    const rawData = Uint8Array.from(atob(base64Cipher), char => char.charCodeAt(0));
    const iv = rawData.slice(0, ENCRYPTION_CONFIG.IV_LENGTH);
    const cipherData = rawData.slice(ENCRYPTION_CONFIG.IV_LENGTH);

    const plainBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_CONFIG.ALGORITHM, iv },
      key,
      cipherData
    );

    return new TextDecoder().decode(plainBuffer);
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError(MESSAGES.ERROR.MASTER_KEY_INCORRECT, 'DECRYPTION_FAILED', error);
  }
}

export async function hashPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      throw new CryptoError('Password must be a non-empty string', 'INVALID_INPUT');
    }

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new CryptoError('Failed to hash password', 'HASHING_FAILED', error);
  }
}

export function isCryptoSupported() {
  return !!(window.crypto && window.crypto.subtle);
}
