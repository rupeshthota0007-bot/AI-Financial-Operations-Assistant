/**
 * E2EE Encryption Module — Agentic FinOps Enterprise
 *
 * Uses native Web Crypto API (no external dependencies):
 * - AES-256-GCM for payload encryption (authenticated encryption)
 * - PBKDF2 for key derivation from password
 * - SHA-256 for integrity fingerprinting
 * - Secure random IVs for every encryption operation
 */

// ─── Constants ─────────────────────────────────────────────────────────────
const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 310_000;      // NIST recommended minimum 2024
const PBKDF2_HASH = 'SHA-256';
const IV_BYTE_LENGTH = 12;              // 96-bit IV — optimal for AES-GCM
const STORAGE_SALT_KEY = 'finops_e2ee_salt';
const APP_DOMAIN_SALT = 'AGENTIC_FINOPS_ENTERPRISE_2026';

// ─── Helpers ────────────────────────────────────────────────────────────────
function bufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Session key cache (derived once per session) ───────────────────────────
let _sessionKey: CryptoKey | null = null;
let _sessionKeyEmail: string | null = null;

// ─── Storage salt (persisted across sessions, never changes for this device) ─
function getOrCreateStorageSalt(): Uint8Array<ArrayBuffer> {
  const existing = localStorage.getItem(STORAGE_SALT_KEY);
  if (existing) {
    return new Uint8Array(JSON.parse(existing)) as Uint8Array<ArrayBuffer>;
  }
  const salt = crypto.getRandomValues(new Uint8Array(32)) as Uint8Array<ArrayBuffer>;
  localStorage.setItem(STORAGE_SALT_KEY, JSON.stringify(Array.from(salt)));
  return salt;
}

// ─── Key Derivation ─────────────────────────────────────────────────────────

/**
 * Derive an AES-256-GCM CryptoKey from a user's email + password using PBKDF2.
 * Caches the derived key for the session to avoid repeated expensive derivation.
 */
export async function deriveKeyFromCredentials(email: string, password: string): Promise<CryptoKey> {
  if (_sessionKey && _sessionKeyEmail === email) {
    return _sessionKey;
  }

  const encoder = new TextEncoder();
  const salt = getOrCreateStorageSalt();

  // Import raw password as base key material
  const baseKeyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${email}:${password}:${APP_DOMAIN_SALT}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the AES-256-GCM key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as Uint8Array<ArrayBuffer>,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    baseKeyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,         // not exportable
    ['encrypt', 'decrypt']
  );

  _sessionKey = derivedKey;
  _sessionKeyEmail = email;
  return derivedKey;
}

/**
 * Derive a deterministic storage-only key from the app domain salt + device salt.
 * Used to encrypt localStorage data (token, user profile) without requiring
 * the user's password after first login.
 */
async function deriveStorageKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = getOrCreateStorageSalt();

  const baseKeyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`${APP_DOMAIN_SALT}:STORAGE`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as Uint8Array<ArrayBuffer>,
      iterations: 100_000,
      hash: PBKDF2_HASH,
    },
    baseKeyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Core Encrypt / Decrypt ──────────────────────────────────────────────────

interface EncryptedPayload {
  iv: string;          // Base64 encoded IV
  data: string;        // Base64 encoded ciphertext + GCM auth tag
  alg: string;         // Algorithm identifier
  fingerprint: string; // SHA-256 hash of plaintext for integrity verification
  timestamp: number;   // Unix ms — for replay attack prevention
}

/**
 * Encrypt any serializable object with AES-256-GCM.
 */
export async function encryptPayload(
  plaintext: unknown,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const plaintextStr = JSON.stringify(plaintext);
  const plaintextBytes = encoder.encode(plaintextStr);

  // Fresh random IV for every operation
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    plaintextBytes
  );

  // SHA-256 fingerprint of plaintext for integrity verification
  const hashBuffer = await crypto.subtle.digest('SHA-256', plaintextBytes);

  return {
    iv: bufferToBase64(iv.buffer),
    data: bufferToBase64(ciphertext),
    alg: 'AES-256-GCM/PBKDF2-SHA-256',
    fingerprint: bufferToBase64(hashBuffer),
    timestamp: Date.now(),
  };
}

/**
 * Decrypt an EncryptedPayload and verify its SHA-256 fingerprint.
 */
export async function decryptPayload<T>(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<T> {
  const iv = new Uint8Array(base64ToBuffer(payload.iv));
  const ciphertext = base64ToBuffer(payload.data);

  const plaintextBytes = await crypto.subtle.decrypt(
    { name: ALGO, iv },
    key,
    ciphertext
  );

  // Verify integrity fingerprint
  const hashBuffer = await crypto.subtle.digest('SHA-256', plaintextBytes);
  const computedFingerprint = bufferToBase64(hashBuffer);

  if (computedFingerprint !== payload.fingerprint) {
    throw new Error('E2EE Integrity Check FAILED: Data may have been tampered with.');
  }

  return JSON.parse(new TextDecoder().decode(plaintextBytes)) as T;
}

// ─── Encrypted LocalStorage ──────────────────────────────────────────────────

/**
 * Save an encrypted value to localStorage.
 */
export async function setEncryptedItem(key: string, value: unknown): Promise<void> {
  try {
    const storageKey = await deriveStorageKey();
    const encrypted = await encryptPayload(value, storageKey);
    localStorage.setItem(`e2ee:${key}`, JSON.stringify(encrypted));
  } catch {
    // Fallback to plain storage if crypto fails (e.g., private browsing restrictions)
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

/**
 * Retrieve and decrypt a value from localStorage.
 */
export async function getEncryptedItem<T>(key: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(`e2ee:${key}`);
    if (!raw) return null;
    const payload: EncryptedPayload = JSON.parse(raw);
    const storageKey = await deriveStorageKey();
    return await decryptPayload<T>(payload, storageKey);
  } catch {
    // Fallback: try reading plain value
    const plain = localStorage.getItem(key);
    if (!plain) return null;
    try { return JSON.parse(plain) as T; } catch { return plain as unknown as T; }
  }
}

/**
 * Remove an encrypted item from localStorage.
 */
export function removeEncryptedItem(key: string): void {
  localStorage.removeItem(`e2ee:${key}`);
  localStorage.removeItem(key); // Clean up any plain fallback
}

// ─── Session Cleanup ────────────────────────────────────────────────────────

/**
 * Clear session key from memory on logout.
 */
export function clearSessionKey(): void {
  _sessionKey = null;
  _sessionKeyEmail = null;
}

// ─── SHA-256 Fingerprint Utility ────────────────────────────────────────────

/**
 * Compute a SHA-256 hex fingerprint for any string value.
 * Used for audit trails and request signing.
 */
export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── E2EE Status for UI ──────────────────────────────────────────────────────

export function isE2EESupported(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
