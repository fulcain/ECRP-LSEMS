import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  ClipboardList,
  Clock3,
  FileText,
  Link2,
  Settings2,
  Shield,
  UsersRound,
} from "lucide-react";

export type HeaderLink = {
  label: string;
  href?: string;
  icon: LucideIcon;
};

export const headerLinks: HeaderLink[] = [
  {
    label: "Staff Page",
    href: "/staff",
    icon: Settings2,
  },
  {
    label: "Division Templates",
    href: "/email-templates",
    icon: UsersRound,
  },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "RED", href: "/red-formats", icon: Shield },
  { label: "BLS", href: "/bls-formats", icon: Activity },
  { label: "Quick Links", href: "/quick-links", icon: Link2 },
  { label: "Availability", href: "/availability", icon: Clock3 },
  { label: "Supervisor", href: "/supervisor?tab=loa", icon: ClipboardList },
  { label: "Change Log", href: "/changelog", icon: BookOpen },
];
