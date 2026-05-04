import { decryptValueWithKey, encryptValueWithKey, isEncryptedStorageValue } from '../src/storage/storageCrypto';

describe('storage encryption helpers', () => {
  const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('encrypts plaintext values before storage and decrypts them for the app', async () => {
    const encryptedValue = await encryptValueWithKey('1234', key);

    expect(encryptedValue).not.toBe('1234');
    expect(isEncryptedStorageValue(encryptedValue)).toBe(true);
    expect(decryptValueWithKey(encryptedValue, key)).toBe('1234');
  });

  it('leaves plaintext values readable for migration checks until they are re-saved', () => {
    expect(decryptValueWithKey('pending', key)).toBe('pending');
    expect(isEncryptedStorageValue('pending')).toBe(false);
  });
});