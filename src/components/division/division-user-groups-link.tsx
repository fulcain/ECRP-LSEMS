import Link from "next/link";
import { Users } from "lucide-react";

import { govGroupSetOf, type GovGroupKey } from "@/app/constants/gov-groups";
import { Button } from "@/components/ui/button";
import { userGroupsHref } from "@/lib/user-groups";

/**
 * A division's own way into the User Groups tool.
 *
 * A division page is where a member moves someone into the division's forum
 * groups - an instructor, a senior handler, the division itself - so the link
 * belongs in the header beside the page's other buttons rather than in a
 * separate nav entry. The division names one of its own groups
 * (`govGroupSetOf`) and the tool opens filtered to that whole set, so the
 * forum's name for the division lives in `app/constants/gov-groups.ts` and not
 * in a string here.
 */
export function DivisionUserGroupsLink({
  /** Any group in this division's set, by `GovGroupKey`. */
  group,
  label = "Forum Groups",
  className,
}: {
  group: GovGroupKey;
  label?: string;
  className?: string;
}) {
  const set = govGroupSetOf(group);

  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link
        href={userGroupsHref({ search: set?.label })}
        title={
          set
            ? `Add a member to one of the ${set.label} groups on GOV`
            : "Add a member to a forum group on GOV"
        }
      >
        <Users className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
