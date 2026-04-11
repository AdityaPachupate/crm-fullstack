import { get, set, del } from 'idb-keyval';
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * SECURITY NOTE: 
 * This is a basic obfuscation layer to prevent plain-text reading of sensitive lead data in IndexedDB.
 * In a highly sensitive environment, this should be replaced with a proper AES encryption 
 * implementation using the Web Crypto API, with the key retrieved after user authentication.
 */
const SECRET_KEY = 'parasnath-crm-secure-storage-key';

function obfuscate(str: string): string {
  return btoa(
    str.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('')
  );
}

function deobfuscate(str: string): string {
  try {
    const decoded = atob(str);
    return decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('');
  } catch (e) {
    return '';
  }
}

export const createIndexedDBPersister = (idbKey: string = 'react-query-cache'): Persister => {
  return {
    persistClient: async (client: PersistedClient) => {
      const data = JSON.stringify(client);
      const encryptedData = obfuscate(data);
      await set(idbKey, encryptedData);
    },
    restoreClient: async () => {
      const encryptedData = await get<string>(idbKey);
      if (!encryptedData) return undefined;
      
      const decryptedData = deobfuscate(encryptedData);
      if (!decryptedData) return undefined;

      return JSON.parse(decryptedData) as PersistedClient;
    },
    removeClient: async () => {
      await del(idbKey);
    },
  };
};
