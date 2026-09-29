/**
 * The way into the User Groups page from a tool that knows a group has to
 * change.
 *
 * A promotion, a hire, a reinstatement or an FTD certification all end with the
 * member being moved into a forum group, and each of those tools already holds
 * the two things the page asks for: who the member is, and which group they are
 * moving to. Carrying them in the link means the supervisor does not type the
 * name twice and cannot pick the wrong group - the page opens with the name
 * filled in and the group that step needs pointed at. Nothing is submitted for
 * anyone either way: the page still opens the group's own GOV page for the
 * member to Submit.
 *
 * The page reads these back in `components/user-group-add.tsx`. Both halves go
 * through the constants here, so a link and the page cannot disagree about what
 * the query is called.
 */

import type { GovGroupKey } from "@/app/constants/gov-groups";
import { ROUTES } from "@/configs/routes";

/** The member the page is being opened for. */
export const USER_GROUP_MEMBER_PARAM = "member";

/** The group the step needs, by `GovGroupKey`. */
export const USER_GROUP_GROUP_PARAM = "group";

/**
 * What the page's search box starts on. A division page links with its own
 * set's label (`govGroupSetOf`), which filters the list to the groups that
 * division hands out - a member who came from RED should not have to scroll
 * past every other division's to find them.
 */
export const USER_GROUP_SEARCH_PARAM = "search";

export type UserGroupTarget = {
  /** The member's name, or the `{{applicantName}}` token a workflow fills later. */
  member?: string | null;
  /**
   * The group that needs the change, when the tool already knows it. Named by
   * `GovGroupKey`, so a tool cannot link to a group this build has not got.
   */
  group?: GovGroupKey | null;
  /**
   * A term for the page's search box, used to open it on one set of groups.
   * Optional: a link that names a group already marks that group's tile.
   */
  search?: string | null;
};

/**
 * A query value: encoded, unless it is a token a tool fills in later. A
 * workflow declares its link before the applicant's name is typed, so it writes
 * `{{applicantName}}` there and the renderer substitutes it (and encodes it) at
 * the point the link is drawn.
 */
function queryValue(value: string): string {
  return value.includes("{{") ? value : encodeURIComponent(value);
}

export function userGroupsHref({
  member,
  group,
  search,
}: UserGroupTarget = {}): string {
  const query: string[] = [];
  const name = member?.trim();
  const term = search?.trim();
  if (name) query.push(`${USER_GROUP_MEMBER_PARAM}=${queryValue(name)}`);
  if (group) query.push(`${USER_GROUP_GROUP_PARAM}=${encodeURIComponent(group)}`);
  if (term) query.push(`${USER_GROUP_SEARCH_PARAM}=${queryValue(term)}`);
  return query.length > 0
    ? `${ROUTES.resources.userGroups}?${query.join("&")}`
    : ROUTES.resources.userGroups;
}
