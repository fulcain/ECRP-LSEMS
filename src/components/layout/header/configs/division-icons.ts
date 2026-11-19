import {
  Activity,
  Ambulance,
  BookOpen,
  BriefcaseMedical,
  ClipboardList,
  Cross,
  FileHeart,
  FileText,
  GraduationCap,
  HeartPulse,
  Hospital,
  Megaphone,
  Pill,
  Plane,
  Shield,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons a division's sidebar entry may use, by the name the maker writes.
 *
 * A name and not a component, because the icon travels as data in
 * `configs/generated/divisions.ts` and the sidebar is the only place that can
 * turn it back into one. Adding an icon is one entry here; a name that is not
 * listed falls back to the file icon rather than breaking the entry.
 */
export const DIVISION_ICONS = {
  Activity,
  Ambulance,
  BookOpen,
  BriefcaseMedical,
  ClipboardList,
  Cross,
  FileHeart,
  FileText,
  GraduationCap,
  HeartPulse,
  Hospital,
  Megaphone,
  Pill,
  Plane,
  Shield,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UserCog,
  UsersRound,
} as const satisfies Record<string, LucideIcon>;

export type DivisionIconName = keyof typeof DIVISION_ICONS;

/** Every name a maker may offer, in declaration order. */
export const DIVISION_ICON_NAMES = Object.keys(
  DIVISION_ICONS,
) as DivisionIconName[];

export function divisionIcon(name: string | undefined): LucideIcon {
  return name && name in DIVISION_ICONS
    ? DIVISION_ICONS[name as DivisionIconName]
    : FileText;
}
