import { useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Tab state for a page whose tabs are addressable: the last tab is remembered,
 * `?tab=` wins on load, and the URL is kept in step so a link can point at a
 * tab.
 *
 * Four pages had this block copy-pasted verbatim (Staff, Supervisor, Templates
 * and BLS), which is four places for the precedence to drift. Pass `validTabs`
 * as a module-level constant, not an inline array: the effect keys off its
 * identity, and a new array every render would re-run it every render.
 */
export function useTabParam<T extends string>(
  storageKey: string,
  validTabs: readonly T[],
  defaultTab: T,
  /** Query keys that belong to a tab being left, e.g. another page section's
      own `?format=` - dropped when the tab changes so the URL can't lie. */
  dropParams: readonly string[] = [],
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [active, setActive] = useLocalStorage<T>(storageKey, defaultTab);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tab") as T | null;
    if (fromUrl && validTabs.includes(fromUrl)) setActive(fromUrl);
  }, [setActive, validTabs]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    dropParams.forEach((key) => params.delete(key));
    params.set("tab", active);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [active, dropParams]);

  return [active, setActive];
}
