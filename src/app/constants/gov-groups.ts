/**
 * The forum's user groups a member can be added to from the app.
 *
 * Each entry is one group in GOV's UCP, and `id` is the forum's own `g=`. The
 * page that puts a member into the group is built from it by `govGroupUrl`, so
 * the page a tile opens is always the page that id belongs to - and nobody has
 * to keep a UCP link in step with a memberlist one by hand.
 *
 * The sets below are what the User Groups page lists, in order: the department,
 * its rank groups, its directors and its command posts, then a set per division. A new rank is one
 * entry in "Department ranks" and a new division is one set - nothing else in
 * the app changes, because the page renders whatever is declared here rather
 * than naming any of it.
 *
 * A tile's `label` drops the forum's own `[LSEMS][D] …` tag, because the tile
 * sits under the set that tag names; `govName` is the group's name exactly as
 * GOV writes it, shown under the label so the two can never disagree.
 *
 * `key` is what a tool names a group by when it already knows which one it
 * needs - the contract workflows add a hire to `emr`, the FTI page certifies an
 * instructor into `ftd-instructor` - so no tool ever types a group id.
 *
 * Icons repeat on purpose: a division's own group is `Users`, its command is
 * `ShieldCheck`, its instructors are `GraduationCap`, and a rank is whatever
 * carries its own ladder rung.
 */

import {
  Activity,
  Ambulance,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  Crown,
  Flame,
  GraduationCap,
  HeartPulse,
  Landmark,
  LifeBuoy,
  Megaphone,
  Mountain,
  Plane,
  Scale,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { PromotionRank } from "@/app/constants/general/ranks";

export type GovGroup = {
  /** The forum's group id, as `g=` in its manage page. */
  id: number;
  /** What a tool names this group by, without knowing its id. */
  key: GovGroupKey;
  /** The tile's title: the group without the forum's own tag. */
  label: string;
  /** The group's own name on GOV, shown under the label so the two agree. */
  govName: string;
  icon: LucideIcon;
  /**
   * The promotion-ladder rung this group carries, when it carries one. The
   * ladder runs past most of these - a Paramedic holds no group of their own -
   * so a tool promoting a member looks it up with `govGroupForRank`, and a rung
   * with no group simply has nothing to point at.
   */
  rank?: PromotionRank;
};

export type GovGroupKey =
  // The department itself.
  | "lsems"
  // Department ranks ([R]).
  | "emr"
  | "emt-basic"
  | "emt-intermediate"
  | "emt-advanced"
  | "master-emt"
  | "emt-p"
  | "senior-paramedic"
  | "supervisor-in-training"
  | "supervisor"
  | "command"
  | "high-command"
  // [R] but not a ladder rung: hired by contract rather than promoted into.
  | "external-contractor"
  // Department command ([LSEMS]).
  | "assistant-chief"
  | "consultant"
  | "deputy-chief"
  // Directors ([O]): one post per field the department answers for.
  | "director-operations"
  | "director-administration"
  | "director-special-operations"
  | "director-fire-department"
  // Advanced Medicine Unit.
  | "amu"
  | "amu-command"
  | "amu-instructor"
  | "amu-nurse"
  // Air & Rescue Division.
  | "air-rescue"
  | "air-rescue-command"
  | "air-rescue-flight-instructor"
  | "air-rescue-rescue-instructor"
  | "air-rescue-snr-flight-instructor"
  | "air-rescue-snr-rescue-instructor"
  // Audit Division.
  | "audit"
  // Basic Life Support Division.
  | "bls"
  | "bls-command"
  | "bls-senior-instructor"
  // Field Training Division.
  | "ftd"
  | "ftd-command"
  | "ftd-instructor"
  // Fire & Rescue Division.
  | "fire-rescue"
  | "fire-rescue-command"
  | "fire-rescue-instructor"
  // Internal Affairs.
  | "ia"
  | "ia-command"
  | "ia-instructor"
  // Lifeguard.
  | "lifeguard"
  // Public Relations.
  | "pr"
  | "pr-command"
  | "pr-senior-rep"
  // Recruitment and Employment Division (RED).
  | "red"
  | "red-command"
  | "red-senior-handler"
  // Supervisor Training Program.
  | "stp-command";

/** A heading the User Groups page lists a set of groups under. */
export type GovGroupSet = {
  label: string;
  /** One plain line: what these groups are for. Optional - most divisions need none. */
  hint?: string;
  groups: readonly GovGroup[];
};

/** The UCP page that adds a member to this group. */
export function govGroupUrl(group: GovGroup): string {
  return `https://gov.eclipse-rp.net/ucp.php?i=ucp_groups&mode=manage&action=list&g=${group.id}`;
}

export const GOV_GROUP_SETS: readonly GovGroupSet[] = [
  {
    label: "The department",
    hint: "Everyone in LSEMS is in this one, whatever their rank - it goes on when someone is hired.",
    groups: [
      {
        id: 100,
        key: "lsems",
        label: "LSEMS",
        govName: "[LSEMS] Los Santos Emergency Medical Services",
        icon: Building2,
      },
    ],
  },
  {
    label: "Department ranks",
    hint: "The [R] groups, lowest first - the rank a member moves into as they progress - with the ones held outside the ladder at the end.",
    groups: [
      {
        id: 101,
        key: "emr",
        label: "EMR",
        govName: "[LSEMS][R] EMR",
        icon: GraduationCap,
        rank: "emr",
      },
      {
        id: 627,
        key: "emt-basic",
        label: "EMT-Basic",
        govName: "[LSEMS][R] EMT-Basic",
        icon: Ambulance,
        rank: "emt-b",
      },
      {
        id: 628,
        key: "emt-intermediate",
        label: "EMT-Intermediate",
        govName: "[LSEMS][R] EMT-Intermediate",
        icon: Activity,
        rank: "emt-i",
      },
      {
        id: 629,
        key: "emt-advanced",
        label: "EMT-Advanced",
        govName: "[LSEMS][R] EMT-Advanced",
        icon: HeartPulse,
        rank: "emt-a",
      },
      {
        id: 630,
        key: "master-emt",
        label: "Master EMT",
        govName: "[LSEMS][R] Master EMT",
        icon: Star,
        rank: "master-emt",
      },
      {
        id: 631,
        key: "emt-p",
        label: "EMT-P",
        govName: "[LSEMS][R] EMT-P",
        icon: Stethoscope,
        rank: "emt-p",
      },
      {
        id: 634,
        key: "senior-paramedic",
        label: "Senior Paramedic",
        govName: "[LSEMS][R] Senior Paramedic",
        icon: BadgeCheck,
        rank: "senior-paramedic",
      },
      {
        id: 351,
        key: "supervisor-in-training",
        label: "Supervisor-in-training",
        govName: "[LSEMS][R] Supervisor-in-training",
        icon: ClipboardCheck,
      },
      {
        id: 98,
        key: "supervisor",
        label: "Supervisor",
        govName: "[LSEMS][R] Supervisor",
        icon: ShieldCheck,
      },
      {
        id: 97,
        key: "command",
        label: "Command",
        govName: "[LSEMS][R] Command",
        icon: Landmark,
      },
      {
        id: 96,
        key: "high-command",
        label: "High Command",
        govName: "[LSEMS][R] High Command",
        icon: Crown,
      },
      {
        id: 479,
        key: "external-contractor",
        label: "External Contractor",
        govName: "[LSEMS][R] External Contractor",
        icon: Briefcase,
      },
    ],
  },
  {
    label: "Department command",
    hint: "The chief ranks, held above the rank ladder.",
    groups: [
      {
        id: 347,
        key: "assistant-chief",
        label: "Assistant Chief of EMS",
        govName: "[LSEMS] Assistant Chief of EMS",
        icon: Landmark,
        rank: "assistant-chief",
      },
      {
        id: 348,
        key: "consultant",
        label: "Consultant",
        govName: "[LSEMS] Consultant",
        icon: Briefcase,
      },
      {
        id: 349,
        key: "deputy-chief",
        label: "Deputy Chief of EMS",
        govName: "[LSEMS] Deputy Chief of EMS",
        icon: Landmark,
        rank: "deputy-chief",
      },
    ],
  },
  {
    label: "Directors",
    hint: "The [O] director posts: one for each field the department has to answer for.",
    groups: [
      {
        id: 345,
        key: "director-operations",
        label: "Director of Operations",
        govName: "[LSEMS][O] Director of Operations",
        icon: Briefcase,
      },
      {
        id: 420,
        key: "director-administration",
        label: "Director of Administration",
        govName: "[LSEMS][O] Director of Administration",
        icon: Briefcase,
      },
      {
        id: 346,
        key: "director-special-operations",
        label: "Director of Special Operations",
        govName: "[LSEMS][O] Director of Special Operations",
        icon: Briefcase,
      },
      {
        id: 421,
        key: "director-fire-department",
        label: "Director of the Fire Department",
        govName: "[LSEMS][O] Director of the Fire Department",
        icon: Briefcase,
      },
    ],
  },
  {
    label: "Advanced Medicine Unit",
    groups: [
      {
        id: 200,
        key: "amu",
        label: "Advanced Medicine Unit",
        govName: "[LSEMS][D] Advanced Medicine Unit",
        icon: Users,
      },
      {
        id: 342,
        key: "amu-command",
        label: "Command",
        govName: "[LSEMS][D] Advanced Medicine Unit - Command",
        icon: ShieldCheck,
      },
      {
        id: 486,
        key: "amu-instructor",
        label: "Instructor",
        govName: "[LSEMS][D] Advanced Medicine Unit - Instructor",
        icon: GraduationCap,
      },
      {
        id: 672,
        key: "amu-nurse",
        label: "Nurse",
        govName: "[LSEMS][D] Advanced Medicine Unit - Nurse",
        icon: Stethoscope,
      },
    ],
  },
  {
    label: "Air & Rescue Division",
    groups: [
      {
        id: 127,
        key: "air-rescue",
        label: "Air & Rescue Division",
        govName: "[LSEMS][D] Air & Rescue Division",
        icon: Plane,
      },
      {
        id: 339,
        key: "air-rescue-command",
        label: "Command",
        govName: "[LSEMS][D] Air & Rescue Division - Command",
        icon: ShieldCheck,
      },
      {
        id: 497,
        key: "air-rescue-flight-instructor",
        label: "Flight Instructor",
        govName: "[LSEMS][D] Air & Rescue Division - Flight Instructor",
        icon: GraduationCap,
      },
      {
        id: 498,
        key: "air-rescue-rescue-instructor",
        label: "Rescue Instructor",
        govName: "[LSEMS][D] Air & Rescue Division - Rescue Instructor",
        icon: Mountain,
      },
      {
        id: 608,
        key: "air-rescue-snr-flight-instructor",
        label: "Snr Flight Instructor",
        govName: "[LSEMS][D] Air & Rescue Division - Snr Flight Instructor",
        icon: GraduationCap,
      },
      {
        id: 609,
        key: "air-rescue-snr-rescue-instructor",
        label: "Snr Rescue Instructor",
        govName: "[LSEMS][D] Air & Rescue Division - Snr Rescue Instructor",
        icon: Mountain,
      },
    ],
  },
  {
    label: "Audit Division",
    groups: [
      {
        id: 579,
        key: "audit",
        label: "Audit Division",
        govName: "[LSEMS][D] Audit Division",
        icon: BadgeCheck,
      },
    ],
  },
  {
    label: "Basic Life Support Division",
    groups: [
      {
        id: 111,
        key: "bls",
        label: "Basic Life Support Division",
        govName: "[LSEMS][D] Basic Life Support Division",
        icon: Users,
      },
      {
        id: 341,
        key: "bls-command",
        label: "Command",
        govName: "[LSEMS][D] Basic Life Support Division - Command",
        icon: ShieldCheck,
      },
      {
        id: 481,
        key: "bls-senior-instructor",
        label: "Senior Instructor",
        govName: "[LSEMS][D] Basic Life Support Division - Senior Instructor",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Field Training Division",
    groups: [
      {
        id: 99,
        key: "ftd",
        label: "Field Training Division",
        govName: "[LSEMS][D] Field Training Division",
        icon: Users,
      },
      {
        id: 337,
        key: "ftd-command",
        label: "Command",
        govName: "[LSEMS][D] Field Training Division - Command",
        icon: ShieldCheck,
      },
      {
        id: 350,
        key: "ftd-instructor",
        label: "Instructor",
        govName: "[LSEMS][D] Field Training Division - Instructor",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Fire & Rescue Division",
    groups: [
      {
        id: 153,
        key: "fire-rescue",
        label: "Fire & Rescue Division",
        govName: "[LSEMS][D] Fire & Rescue Division",
        icon: Flame,
      },
      {
        id: 338,
        key: "fire-rescue-command",
        label: "Command",
        govName: "[LSEMS][D] Fire & Rescue Division - Command",
        icon: ShieldCheck,
      },
      {
        id: 395,
        key: "fire-rescue-instructor",
        label: "Instructor",
        govName: "[LSEMS][D] Fire & Rescue Division - Instructor",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Internal Affairs",
    groups: [
      {
        id: 104,
        key: "ia",
        label: "Internal Affairs",
        govName: "[LSEMS][D] Internal Affairs",
        icon: Scale,
      },
      {
        id: 391,
        key: "ia-command",
        label: "Command",
        govName: "[LSEMS][D] Internal Affairs - Command",
        icon: ShieldCheck,
      },
      {
        id: 557,
        key: "ia-instructor",
        label: "Instructor",
        govName: "[LSEMS][D] Internal Affairs Instructor",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Lifeguard",
    groups: [
      {
        id: 434,
        key: "lifeguard",
        label: "Lifeguard",
        govName: "[LSEMS][D] Lifeguard",
        icon: LifeBuoy,
      },
    ],
  },
  {
    label: "Public Relations",
    groups: [
      {
        id: 189,
        key: "pr",
        label: "Public Relations",
        govName: "[LSEMS][D] Public Relations",
        icon: Megaphone,
      },
      {
        id: 344,
        key: "pr-command",
        label: "Command",
        govName: "[LSEMS][D] Public Relations - Command",
        icon: ShieldCheck,
      },
      {
        id: 563,
        key: "pr-senior-rep",
        label: "Senior Public Relations Rep",
        govName: "[LSEMS][D] Senior Public Relations Rep",
        icon: BadgeCheck,
      },
    ],
  },
  {
    label: "Recruitment and Employment Division",
    groups: [
      {
        id: 102,
        key: "red",
        label: "Recruitment and Employment Division",
        govName: "[LSEMS][D] Recruitment and Employment Division",
        icon: Users,
      },
      {
        id: 343,
        key: "red-command",
        label: "RED - Command",
        govName: "[LSEMS][D] RED - Command",
        icon: ShieldCheck,
      },
      {
        id: 416,
        key: "red-senior-handler",
        label: "RED - Senior Handler",
        govName: "[LSEMS][D] RED - Senior Handler",
        icon: BadgeCheck,
      },
    ],
  },
  {
    label: "Supervisor Training Program",
    hint: "The program's own command group.",
    groups: [
      {
        id: 352,
        key: "stp-command",
        label: "Command",
        govName: "[LSEMS][D] Supervisor Training Program - Command",
        icon: ShieldCheck,
      },
    ],
  },
];

/** Every group the app knows, in the order the page lists them. */
export const GOV_GROUPS: readonly GovGroup[] = GOV_GROUP_SETS.flatMap(
  (set) => set.groups,
);

/** The group a rank is added to, when the ladder gives it one. */
export function govGroupForRank(rank: PromotionRank): GovGroup | undefined {
  return GOV_GROUPS.find((group) => group.rank === rank);
}

/** The group a link names, or `undefined` when it names one this build has not got. */
export function govGroupByKey(key: string): GovGroup | undefined {
  return GOV_GROUPS.find((group) => group.key === key);
}

/**
 * The set a group belongs to, found by any group's key. A page that offers "the
 * groups this division adds to" names one of its own groups and gets the set's
 * own label back, so the forum's name for a division is written down once, in
 * this file - and a page can open the User Groups list filtered to exactly that
 * set without knowing which groups are in it.
 */
export function govGroupSetOf(key: GovGroupKey): GovGroupSet | undefined {
  return GOV_GROUP_SETS.find((set) =>
    set.groups.some((group) => group.key === key),
  );
}
