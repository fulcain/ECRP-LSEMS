/**
 * Who a member is told to contact when something is wrong.
 *
 * Declared once and read by the indicator itself, so the desktop sidebar, the
 * mobile sheet and anything added later can't name different people - and
 * changing it is one edit rather than a search for hardcoded handles.
 */
export const SUPPORT_CONTACT = {
  /** Written as it should be shown, handle prefix included. */
  handle: "@fulcain",
} as const;
