import { useEffect, useState } from "react";

/**
 * A value kept in localStorage, hydrated after mount (the server render has no
 * storage, so the first client render shows `defaultValue`).
 *
 * Use the returned value as the state itself. Do not mirror it into a second
 * `useState` and write that back to the setter: that state's own initial write
 * lands in the same commit as the hydration read, so it replaces the stored
 * value before anything can apply it, and the write-back then persists the
 * defaults - the stored data is gone and every reload loses it again. Derive
 * what you need from the value, and write back per field.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    try { const stored = localStorage.getItem(key); if (stored !== null) setValue(JSON.parse(stored) as T); }
    catch (error) { console.error(`Error reading localStorage key “${key}”:`, error); }
    finally { setIsHydrated(true); }
  }, [key]);
  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { console.error(`Error writing to localStorage key “${key}”:`, error); }
  }, [key, value, isHydrated]);
  return [value, setValue];
}

/** Shared string storage used by FTD communication cards. */
export function useSharedLocalStorageString(key: string, defaultValue = "") {
  return useLocalStorage<string>(`shared-${key}`, defaultValue);
}
