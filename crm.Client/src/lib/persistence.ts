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
  // Safe UTF-8 to Base64 conversion
  const utf8Str = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  );
  
  return btoa(
    utf8Str.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('')
  );
}

function deobfuscate(str: string): string {
  try {
    const decoded = atob(str);
    const XORed = decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('');
    
    return decodeURIComponent(XORed.split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
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
