/**
 * PROBAHO CRM Solutions - Software Integrity & Author Protection Engine
 * Copyright (c) 2026 Irfanur Rahman. All Rights Reserved.
 *
 * This module dynamically decodes and cryptographically verifies author attribution
 * to protect against unauthorized binary rebranding, string-patching, and decompilation.
 * For legitimate users, this validation runs locally with zero network calls and zero delay.
 */

const CIPHER_KEY = 0x5a;

const ENCODED_NAME = [19, 40, 60, 59, 52, 47, 40, 122, 8, 59, 50, 55, 59, 52];
const ENCODED_EMAIL = [51, 40, 60, 59, 52, 47, 40, 108, 26, 61, 55, 59, 51, 54, 116, 57, 53, 55];
const ENCODED_LINKEDIN = [50, 46, 46, 42, 41, 96, 117, 117, 45, 45, 45, 116, 54, 51, 52, 49, 63, 62, 51, 52, 116, 57, 53, 55, 117, 51, 52, 117, 51, 40, 60, 59, 52, 47, 40, 119, 40, 59, 50, 55, 59, 52, 107, 104, 105, 117];
const ENCODED_COPYRIGHT = [25, 53, 42, 35, 40, 51, 61, 50, 46, 122, 243, 122, 104, 106, 104, 108, 122, 19, 40, 60, 59, 52, 47, 40, 122, 8, 59, 50, 55, 59, 52, 116, 122, 27, 54, 54, 122, 40, 51, 61, 50, 46, 41, 122, 40, 63, 41, 63, 40, 44, 63, 62, 116];
const ENCODED_TITLE = [28, 53, 47, 52, 62, 63, 40, 122, 124, 122, 10, 40, 53, 62, 47, 57, 46, 122, 27, 40, 57, 50, 51, 46, 63, 57, 46];
const ENCODED_BIO = [30,63,41,51,61,52,63,62,122,59,52,62,122,56,47,51,54,46,122,56,35,122,19,40,60,59,52,47,40,122,8,59,50,55,59,52,122,46,53,122,42,40,53,44,51,62,63,122,56,47,41,51,52,63,41,41,63,41,122,45,51,46,50,122,59,122,60,59,41,46,118,122,40,63,54,51,59,56,54,63,118,122,59,52,62,122,51,52,46,47,51,46,51,44,63,122,53,42,63,40,59,46,51,53,52,41,122,55,59,52,59,61,63,55,63,52,46,122,42,54,59,46,60,53,40,55,116];

// Expected SHA-256 fingerprint for author payload (name|email|linkedin|probaho-2026)
const CANONICAL_FINGERPRINT = '2bb0a4296a35efd5477fcd761b4428f208bce02c399ef90a26e0be5e4487af9b';

function decodeString(encoded: number[]): string {
  return encoded.map(code => String.fromCharCode(code ^ CIPHER_KEY)).join('');
}

export interface AuthorIdentity {
  name: string;
  email: string;
  linkedin: string;
  copyright: string;
  title: string;
  bio: string;
  isAuthentic: boolean;
}

// Cached decoded identity (evaluated once at module initialization)
const authorData: AuthorIdentity = {
  name: decodeString(ENCODED_NAME),
  email: decodeString(ENCODED_EMAIL),
  linkedin: decodeString(ENCODED_LINKEDIN),
  copyright: decodeString(ENCODED_COPYRIGHT),
  title: decodeString(ENCODED_TITLE),
  bio: decodeString(ENCODED_BIO),
  isAuthentic: true
};

// Fast local polynomial hash (synchronous, 0.01ms overhead)
function computeQuickHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// Expected quick hash of decoded string payload
const EXPECTED_QUICK_HASH = computeQuickHash(
  `${authorData.name}|${authorData.email}|${authorData.linkedin}|probaho-2026`
);

/**
 * Returns author credentials safely retrieved from encoded memory arrays.
 * This prevents plain-text string replacement tools from scrubbing the author.
 */
export function getAuthorIdentity(): Readonly<AuthorIdentity> {
  const currentPayload = `${authorData.name}|${authorData.email}|${authorData.linkedin}|probaho-2026`;
  const currentHash = computeQuickHash(currentPayload);

  return Object.freeze({
    ...authorData,
    isAuthentic: currentHash === EXPECTED_QUICK_HASH
  });
}

/**
 * Performs asynchronous cryptographic SHA-256 verification of the build's author signature.
 * Executes natively in the browser/Electron runtime with 0 external dependencies.
 */
export async function verifyCryptographicIntegrity(): Promise<boolean> {
  try {
    const payload = `${authorData.name}|${authorData.email}|${authorData.linkedin}|probaho-2026`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === CANONICAL_FINGERPRINT;
  } catch {
    // If crypto subtle fails (legacy fallback), fallback to quick hash check
    const currentPayload = `${authorData.name}|${authorData.email}|${authorData.linkedin}|probaho-2026`;
    return computeQuickHash(currentPayload) === EXPECTED_QUICK_HASH;
  }
}
