import Link from "next/link";
import { Link2 } from "lucide-react";
import { divisionQuickLinksHref } from "@/app/(routes)/resources/quick-links/lib/quick-links-scope";
import { Button } from "@/components/ui/button";
import type { DivisionKey } from "@/configs/roles";

/**
 * A division's own way into the Quick Links directory, scoped to that division.
 *
 * The links already live in the division that owns them
 * (`app/constants/divisions/*.ts`) and the directory stays one searchable page,
 * so all a division's section needs is this: no second copy of the list to keep
 * in step, and no nav entry per division.
 */
export function DivisionQuickLinksLink({
  division,
  label = "Quick Links",
  className,
}: {
  division: DivisionKey;
  label?: string;
  className?: string;
}) {
  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link href={divisionQuickLinksHref(division)}>
        <Link2 className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
