/**
 * GOV destinations more than one tool opens. Kept here rather than in each
 * card so a moved thread is a single edit, and so every card names the same
 * page for the same purpose.
 */

/**
 * The private-message composer. Everything the FTD email cards generate is sent
 * as a PM, so this is where they are pasted and sent from.
 */
export const GOV_PM_COMPOSE_URL =
  "https://gov.eclipse-rp.net/ucp.php?i=pm&mode=compose";

/**
 * The Staff Roster is one post that every roster change edits, so a roster step
 * opens its editor rather than the topic - the extension can fill an editor,
 * and the member lands on the field they came to change.
 */
export const GOV_STAFF_ROSTER_EDIT_URL =
  "https://gov.eclipse-rp.net/posting.php?mode=edit&p=126127";
