/**
 * Secure storage interface supporting Tauri secure store-api with browser development fallbacks.
 * Credentials and tokens are obfuscated in standard localStorage to prevent raw credentials leaks.
 */

// Dynamically resolved reference to Tauri's store module
let tauriStoreInstance: any = null;

async function getTauriStore() {
  if (tauriStoreInstance) return tauriStoreInstance;
  
  const isTauri = typeof window !== 'undefined' && 
    ((window as any).__TAURI_METADATA__ !== undefined || (window as any).__TAURI__ !== undefined);

  if (isTauri) {
    try {
      // Dynamic import prevents module resolution crashes in pure browser environments
      const { Store } = await import('tauri-plugin-store-api');
      tauriStoreInstance = new Store('.secure_vfs_config.bin');
      return tauriStoreInstance;
    } catch (e) {
      console.warn('[SecureStorage] Native tauri-plugin-store-api loading failed, using fallback.', e);
    }
  }
  return null;
}

/**
 * Safely saves an encrypted or obfuscated key-value token.
 */
export async function saveEncryptedToken(key: string, value: string): Promise<void> {
  const store = await getTauriStore();
  if (store) {
    await store.set(key, value);
    await store.save();
  } else {
    // Obfuscate local-storage fallback values using base64 representation to block raw credential scraping
    const obfuscated = btoa(value);
    localStorage.setItem(`_vfs_sec_${key}`, obfuscated);
  }
}

/**
 * Retrieves a securely saved token.
 */
export async function getEncryptedToken(key: string): Promise<string | null> {
  const store = await getTauriStore();
  if (store) {
    const val = await store.get(key);
    return typeof val === 'string' ? val : null;
  } else {
    const obfuscated = localStorage.getItem(`_vfs_sec_${key}`);
    if (!obfuscated) return null;
    try {
      return atob(obfuscated);
    } catch {
      return null;
    }
  }
}

/**
 * Flags the onboarding lifecycle configuration as complete.
 */
export async function setOnboardingComplete(): Promise<void> {
  const store = await getTauriStore();
  if (store) {
    await store.set('onboardingComplete', 'true');
    await store.save();
  } else {
    localStorage.setItem('onboardingComplete', 'true');
  }
}

/**
 * Reads the onboarding status flag.
 */
export async function isOnboardingComplete(): Promise<boolean> {
  const store = await getTauriStore();
  if (store) {
    const val = await store.get('onboardingComplete');
    return val === 'true';
  } else {
    return localStorage.getItem('onboardingComplete') === 'true';
  }
}
