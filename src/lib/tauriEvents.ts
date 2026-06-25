/**
 * Safe wrapper for Tauri event listening and emitting.
 * Automatically detects non-Tauri/browser environments to prevent crash failures during visual testing.
 */

const isTauri = typeof window !== 'undefined' && 
  ((window as any).__TAURI_METADATA__ !== undefined || (window as any).__TAURI__ !== undefined);

/**
 * Listens to a custom backend automation engine event.
 * Returns an unlisten cleanup function promise.
 */
export async function listenToEvent<T>(
  eventName: string, 
  callback: (payload: T) => void
): Promise<() => void> {
  if (isTauri) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const unlisten = await listen<T>(eventName, (event) => {
        callback(event.payload);
      });
      return unlisten;
    } catch (e) {
      console.warn(`[TauriEvents] Failed to register native event listener for: ${eventName}`, e);
    }
  } else {
    // Browser Developer mock console log
    console.log(`[TauriEvents] Browser simulated listener registered for: "${eventName}"`);
  }
  return () => {
    if (!isTauri) {
      console.log(`[TauriEvents] Browser simulated unlisten triggered for: "${eventName}"`);
    }
  };
}

/**
 * Emits a frontend trigger event to the Tauri Rust core.
 */
export async function emitEvent<T>(eventName: string, payload?: T): Promise<void> {
  if (isTauri) {
    try {
      const { emit } = await import('@tauri-apps/api/event');
      await emit(eventName, payload);
    } catch (e) {
      console.error(`[TauriEvents] Failed to emit native event: ${eventName}`, e);
    }
  } else {
    console.log(`[TauriEvents] Browser simulated emit: "${eventName}" with payload:`, payload);
  }
}
