import Image from "next/image";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { TabBar, type Tab } from "@/components/ui/tab-bar";

/**
 * The heading every division page opens with, so the three of them read the
 * same: which division you are in (the emblem and its name), what you are doing
 * there (the title), and one plain sentence saying what this page is for.
 *
 * The title is the *job*, not the division's name - a member who lands on
 * `/divisions/ftd/paperwork` needs to know they are about to write paperwork,
 * and the eyebrow above tells them which division they are doing it for.
 *
 * No division module is imported here: the caller passes its own label and
 * emblem, so a client page does not pull every division's ranks and links into
 * the browser bundle.
 */
type DivisionHeaderProps<T extends string> = {
  /** The division's display name, from its module in `app/constants/divisions`. */
  label: string;
  /** The division's emblem. */
  emblem?: string;
  /** What the member is doing on this page, in the division's own words. */
  title: string;
  /** One plain sentence: what happens here. */
  purpose?: string;
  /** Page-level actions, right of the title - the Quick Links button today. */
  actions?: ReactNode;
  /** The division's jobs. Omit for a division with only one thing to do. */
  tabs?: readonly Tab<T>[];
  active?: T;
  onChange?: (value: T) => void;
  tabAriaLabel?: string;
};

export function DivisionHeader<T extends string>({
  label,
  emblem,
  title,
  purpose,
  actions,
  tabs,
  active,
  onChange,
  tabAriaLabel,
}: DivisionHeaderProps<T>) {
  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            {emblem && (
              <Image
                src={emblem}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            )}
            {label}
            <span className="text-muted-foreground/70">Division workspace</span>
          </span>
        }
        title={title}
        subtitle={purpose}
        actions={actions}
      />
      {tabs && active !== undefined && (
        <TabBar
          tabs={tabs}
          active={active}
          onChange={onChange}
          ariaLabel={tabAriaLabel ?? `${label} sections`}
        />
      )}
    </>
  );
}
