import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_NAME = 'assetguard.storage.encryption.key';
const ENCRYPTED_VALUE_PREFIX = 'enc:v1:';
const IV_BYTE_LENGTH = 16;

let encryptionKeyPromise: Promise<string> | null = null;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createEncryptionKey() {
  const bytes = await Crypto.getRandomBytesAsync(32);

  return bytesToHex(bytes);
}

function parseHexWordArray(value: string) {
  return CryptoJS.enc.Hex.parse(value);
}

async function getOrCreateEncryptionKey() {
  if (!encryptionKeyPromise) {
    encryptionKeyPromise = (async () => {
      const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

      if (existingKey) {
        return existingKey;
      }

      const nextKey = await createEncryptionKey();

      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, nextKey);

      return nextKey;
    })();
  }

  return encryptionKeyPromise;
}

export function isEncryptedStorageValue(value: string) {
  return value.startsWith(ENCRYPTED_VALUE_PREFIX);
}

export async function encryptValueWithKey(value: string, key: string) {
  if (isEncryptedStorageValue(value)) {
    return value;
  }

  const ivBytes = await Crypto.getRandomBytesAsync(IV_BYTE_LENGTH);
  const ivHex = bytesToHex(ivBytes);
  const encrypted = CryptoJS.AES.encrypt(value, parseHexWordArray(key), {
    iv: parseHexWordArray(ivHex),
  });
  const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

  return `${ENCRYPTED_VALUE_PREFIX}${ivHex}.${ciphertext}`;
}

export function decryptValueWithKey(value: string, key: string) {
  if (!isEncryptedStorageValue(value)) {
    return value;
  }

  const encryptedPayload = value.slice(ENCRYPTED_VALUE_PREFIX.length);
  const separatorIndex = encryptedPayload.indexOf('.');

  if (separatorIndex === -1) {
    const legacyPlaintext = CryptoJS.AES.decrypt(encryptedPayload, key).toString(CryptoJS.enc.Utf8);

    if (!legacyPlaintext) {
      throw new Error('Failed to decrypt stored value.');
    }

    return legacyPlaintext;
  }

  const ivHex = encryptedPayload.slice(0, separatorIndex);
  const ciphertextBase64 = encryptedPayload.slice(separatorIndex + 1);
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertextBase64),
  });
  const decrypted = CryptoJS.AES.decrypt(
    cipherParams,
    parseHexWordArray(key),
    { iv: parseHexWordArray(ivHex) },
  );
  const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

  if (!plaintext) {
    throw new Error('Failed to decrypt stored value.');
  }

  return plaintext;
}

export async function encryptStorageValue(value: string | number | boolean) {
  const key = await getOrCreateEncryptionKey();

  return await encryptValueWithKey(String(value), key);
}

export async function decryptStorageValue(value: string | number) {
  const key = await getOrCreateEncryptionKey();

  return decryptValueWithKey(String(value), key);
}

export async function decryptStorageNumber(value: string | number) {
  const plaintext = await decryptStorageValue(value);
  const parsedValue = Number(plaintext);

  if (Number.isNaN(parsedValue)) {
    throw new Error('Stored value could not be converted into a number.');
  }

  return parsedValue;
}