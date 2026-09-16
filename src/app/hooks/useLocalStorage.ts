import { useEffect, useState } from "react";

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
