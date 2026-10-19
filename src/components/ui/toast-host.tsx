"use client";

import { useTheme } from "next-themes";
import { ToastContainer } from "react-toastify";

/**
 * The app's only toast container.
 *
 * It used to be mounted by 33 feature components, each with its own
 * autoClose/theme/transition - so two toasts from different panels on the same
 * page could behave differently. One host at the root keeps every toast in the
 * same corner with the same lifetime, and its theme follows the app's own
 * light/dark switch instead of fighting it per call site.
 */
export function ToastHost() {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      theme={resolvedTheme === "light" ? "light" : "dark"}
    />
  );
}
