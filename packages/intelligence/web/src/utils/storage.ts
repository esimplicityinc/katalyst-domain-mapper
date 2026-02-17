/**
 * localStorage utilities for persistent client-side state
 *
 * Provides type-safe helpers for storing and retrieving application state
 * with support for multi-tab synchronization via storage events.
 */

/**
 * Storage keys used by the application
 *
 * Namespaced with "foe:" prefix to avoid conflicts with other applications
 */
export const STORAGE_KEYS = {
  /** Currently selected project/repository ID */
  SELECTED_PROJECT_ID: "foe:selectedProjectId",
} as const;

/**
 * Get the currently selected project ID from localStorage
 *
 * @returns The project ID, or null if not set
 *
 * @example
 * ```typescript
 * const projectId = getSelectedProjectId();
 * if (projectId) {
 *   // Load project details
 * }
 * ```
 */
export function getSelectedProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
  } catch (error) {
    // localStorage might be unavailable (private browsing, permissions, etc.)
    console.warn("Failed to read from localStorage:", error);
    return null;
  }
}

/**
 * Set the currently selected project ID in localStorage
 *
 * @param id - The project/repository ID to store
 *
 * @example
 * ```typescript
 * setSelectedProjectId("repo-123");
 * ```
 */
export function setSelectedProjectId(id: string): void {
  if (!id) {
    console.warn("Attempted to set empty project ID");
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT_ID, id);
  } catch (error) {
    // localStorage might be full or unavailable
    console.error("Failed to write to localStorage:", error);
  }
}

/**
 * Clear the currently selected project ID from localStorage
 *
 * @example
 * ```typescript
 * clearSelectedProjectId();
 * ```
 */
export function clearSelectedProjectId(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT_ID);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
}

/**
 * Storage event handler for multi-tab synchronization
 *
 * Call this function to handle storage events and synchronize state
 * across multiple browser tabs/windows.
 *
 * @param callback - Function to call when selected project changes in another tab
 * @returns Cleanup function to remove the event listener
 *
 * @example
 * ```typescript
 * // In a React component
 * useEffect(() => {
 *   const cleanup = onSelectedProjectChange((newProjectId) => {
 *     if (newProjectId) {
 *       loadProject(newProjectId);
 *     } else {
 *       clearProject();
 *     }
 *   });
 *
 *   return cleanup;
 * }, []);
 * ```
 */
export function onSelectedProjectChange(
  callback: (projectId: string | null) => void,
): () => void {
  const handler = (event: StorageEvent) => {
    // Only handle changes to our specific key
    if (event.key === STORAGE_KEYS.SELECTED_PROJECT_ID) {
      // event.newValue will be null if the key was removed
      callback(event.newValue);
    }
  };

  // Listen for storage events (fired when localStorage changes in other tabs)
  window.addEventListener("storage", handler);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handler);
  };
}

/**
 * Check if localStorage is available
 *
 * Useful for graceful degradation in environments where localStorage
 * might be disabled (private browsing, permissions, etc.)
 *
 * @returns True if localStorage is available and writable
 *
 * @example
 * ```typescript
 * if (isLocalStorageAvailable()) {
 *   setSelectedProjectId("repo-123");
 * } else {
 *   // Fall back to in-memory state
 * }
 * ```
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__foe_storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all FOE-namespaced keys from localStorage
 *
 * Useful for debugging or clearing all application data
 *
 * @returns Array of all keys starting with "foe:"
 *
 * @example
 * ```typescript
 * const keys = getAllFoeKeys();
 * console.log("FOE storage keys:", keys);
 * ```
 */
export function getAllFoeKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("foe:")) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.warn("Failed to read localStorage keys:", error);
    return [];
  }
}

/**
 * Clear all FOE-namespaced data from localStorage
 *
 * Useful for logout or reset functionality
 *
 * @example
 * ```typescript
 * clearAllFoeData();
 * ```
 */
export function clearAllFoeData(): void {
  const keys = getAllFoeKeys();
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove key ${key}:`, error);
    }
  });
}
