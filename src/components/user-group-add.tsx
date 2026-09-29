"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ExternalLink,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import {
  GOV_GROUP_SETS,
  govGroupUrl,
  type GovGroup,
} from "@/app/constants/gov-groups";
import {
  forumPostToast,
  handOffAndOpenForumPost,
  isVersionOlder,
  onForumPosterReady,
} from "@/app/helpers/forumHandoff";
import {
  BuilderField,
  BuilderRequirement,
  BuilderSection,
} from "@/components/builder/builder-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  USER_GROUP_GROUP_PARAM,
  USER_GROUP_MEMBER_PARAM,
  USER_GROUP_SEARCH_PARAM,
} from "@/lib/user-groups";
import { ROUTES } from "@/configs/routes";
import { cn } from "@/lib/utils";

/**
 * Puts a member into one of the forum's user groups, without hunting the UCP
 * for the right page: type their name, pick the group, and that group's page
 * opens with the name already in its member box - press Submit and it is done.
 *
 * Every group the app knows is here, in the sets declared in
 * `app/constants/gov-groups.ts`, because the job is the same one whoever is
 * doing it: the department's groups and every division's are one list, and a new
 * rank or division is one entry there rather than a new page. There are enough
 * groups now that a member who knows the name they want should not have to read
 * thirteen headings to find it, so the search box filters the tiles the way the
 * paperwork picker's does - matching the tile, the group's forum name and the
 * set it sits in.
 *
 * The tile *is* the button, and the name is handed over rather than typed for
 * them: the extension fills the group page's member box as it opens, and a
 * browser without the extension gets the name on the clipboard instead. Nothing
 * submits itself - the last click is always the member's.
 *
 * The tools whose step needs a group change link here with the member and the
 * group already in the query (`lib/user-groups.ts`), so nobody is asked for a
 * name the page they came from already has.
 *
 * An older copy of the extension fills a post happily but knows nothing about a
 * group's member box, which landed in 1.6.0. It answers the app all the same, so
 * "the extension is installed" is not the same as "it will fill this box" - the
 * version it reports is compared with the one this app ships, and a copy behind
 * it is told so instead of being promised a fill that never arrives.
 */
export function UserGroupAdd({
  /** The extension version this deployment hands out, from `/api/extension`. */
  shippedVersion,
}: {
  shippedVersion: string | null;
}) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  // The group a link pointed at, held by key only - a stale one simply matches
  // no tile and nothing is marked.
  const [suggested, setSuggested] = useState<string | null>(null);
  // Whether the link brought anything with it, so the page can say so.
  const [carried, setCarried] = useState(false);
  // The term a link opened the list on, which is the division it came from.
  const [carriedSearch, setCarriedSearch] = useState("");
  // The extension's own report of itself, which arrives a moment after mount.
  const [posterVersion, setPosterVersion] = useState<string | null>(null);
  const member = name.trim();
  const outdated =
    posterVersion !== null &&
    shippedVersion !== null &&
    isVersionOlder(posterVersion, shippedVersion);

  useEffect(() => onForumPosterReady(setPosterVersion), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromLink = params.get(USER_GROUP_MEMBER_PARAM)?.trim();
    // Never over what the member has typed themselves.
    if (fromLink) setName((current) => current || fromLink);
    const group = params.get(USER_GROUP_GROUP_PARAM);
    setSuggested(group);
    const term = params.get(USER_GROUP_SEARCH_PARAM)?.trim() ?? "";
    if (term) setQuery((current) => current || term);
    setCarriedSearch(term);
    setCarried(Boolean(fromLink) || Boolean(group) || Boolean(term));
  }, []);

  const total = useMemo(
    () => GOV_GROUP_SETS.reduce((count, set) => count + set.groups.length, 0),
    [],
  );
  const term = query.trim().toLowerCase();
  const visibleSets = useMemo(() => {
    if (!term) return GOV_GROUP_SETS;
    return GOV_GROUP_SETS.map((set) => ({
      ...set,
      groups: set.groups.filter((group) =>
        [group.label, group.govName, group.key, set.label].some((text) =>
          text.toLowerCase().includes(term),
        ),
      ),
    })).filter((set) => set.groups.length > 0);
  }, [term]);
  const matches = visibleSets.reduce(
    (count, set) => count + set.groups.length,
    0,
  );

  async function addTo(group: GovGroup) {
    // Both go before the first await: a click's permission to open a tab does
    // not survive the clipboard write on every browser - the same rule the
    // Copy & Open buttons follow.
    const url = govGroupUrl(group);
    const handedOff = handOffAndOpenForumPost(
      { url, feature: "the User Groups page" },
      member,
    );
    const opened = window.open(url, "_blank");
    try {
      await navigator.clipboard.writeText(member);
      if (!opened) {
        toast.success(
          `Copied ${member} - your browser blocked the tab, so open ${group.govName} on GOV and paste it in.`,
        );
      } else if (handedOff && outdated) {
        toast.warn(
          `Copied ${member} - but not handed over: the extension in this browser is v${posterVersion}, older than the v${shippedVersion} this app ships, and only the newer one fills GOV's member box. Update it on the Browser Extension page, then try again.`,
        );
      } else {
        toast.success(
          forumPostToast(
            handedOff,
            `Copied ${member} - paste it into ${group.label} and submit.`,
            true,
          ),
        );
      }
    } catch {
      toast.error(
        "The name could not be copied - type it into the group page instead.",
      );
    }
  }

  const marked = GOV_GROUP_SETS.flatMap((set) => set.groups).find(
    (group) => group.key === suggested,
  );

  return (
    <div className="space-y-6">
      <BuilderSection
        icon={UserPlus}
        title="Who are you adding?"
        hint="Pick their group below and its page on GOV opens in a new tab. With the browser extension installed the name is already in the page's member box; without it the name is on your clipboard to paste. Nothing is submitted for you - that last click is yours."
      >
        <BuilderField
          label="Member name"
          htmlFor="user-group-member"
          hint="Spelled as it is on GOV: the group page looks the member up by it."
        >
          <Input
            id="user-group-member"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Firstname Lastname"
            autoComplete="off"
          />
        </BuilderField>
        {!member && (
          <BuilderRequirement>
            Type a name first - the groups below open once it is filled in.
          </BuilderRequirement>
        )}
        {carried && (
          <p className="text-xs text-muted-foreground">
            Carried over from the page you came from
            {marked ? ` - the ${marked.label} group is marked below` : ""}
            {carriedSearch
              ? `${marked ? ", and" : " -"} the list is filtered to ${carriedSearch}`
              : ""}
            .
          </p>
        )}
        {outdated && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/30 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1 text-xs text-muted-foreground">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                The extension in this browser is v{posterVersion}, older than
                the v{shippedVersion} this app ships
              </p>
              <p className="mt-1">
                An older copy cannot fill GOV&apos;s member box, so the page may
                open with it empty and the name on your clipboard only. Update
                the extension on the{" "}
                <Link
                  href={ROUTES.resources.browserExtension}
                  className="underline underline-offset-2"
                >
                  Browser Extension page
                </Link>{" "}
                and try again.
              </p>
            </div>
          </div>
        )}
      </BuilderSection>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-muted-foreground">Pick a group</p>
        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  setQuery("");
                }
              }}
              aria-label="Search groups"
              placeholder="Search groups..."
              className="h-10 pr-10 pl-9"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {term && (
            <p role="status" className="mt-1 text-xs text-muted-foreground">
              {matches} of {total} groups
            </p>
          )}
        </div>
      </div>

      {term && visibleSets.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Nothing matches “{query.trim()}”
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try part of the group&apos;s name, or clear the search to see every
            one.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuery("")}
            className="mt-3"
          >
            Clear search
          </Button>
        </div>
      )}

      {visibleSets.map((set) => (
        <section key={set.label} className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {set.label}
            </h2>
            {set.hint && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {set.hint}
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {set.groups.map((group) => {
              const isMarked = group.key === suggested;
              return (
                <button
                  key={group.key}
                  type="button"
                  disabled={!member}
                  aria-current={isMarked ? "true" : undefined}
                  onClick={() => void addTo(group)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                    isMarked
                      ? "border-primary/70 bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                      isMarked
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    <group.icon className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isMarked ? "text-primary" : "text-foreground",
                      )}
                    >
                      {group.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {group.govName}
                    </span>
                  </span>
                  {isMarked ? (
                    <span className="chip ml-auto shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                      This step
                    </span>
                  ) : (
                    <ExternalLink className="mt-1 ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
