import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Always initialize with `defaultValue` so the SSR/CSR first render match.
  // Reading from localStorage happens after mount via the effect below to avoid
  // a hydration mismatch that would flash "credentials incomplete" UI on every page.
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    // Skip the very first write so we never overwrite existing localStorage with
    // the empty `defaultValue` during the initial render-before-hydration window.
    if (!isHydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, value, isHydrated]);

  return [value, setValue];
}
