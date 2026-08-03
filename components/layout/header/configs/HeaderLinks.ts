export type HeaderLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export const headerLinks: HeaderLink[] = [
  {
    label: "Staff Page",
    href: "/staff",
  },
  {
    label: "Division Templates",
    href: "/email-templates",
  },
 { label: "RED", href: "/red-formats" },
  { label: "BLS", href: "/bls-formats" },
  { label: "Quick Links", href: "/quick-links" },
  { label: "Availability", href: "/availability" },
  {
    label: "Supervisor",
    href: "/supervisor?tab=loa",
  },
  { label: "Change Log", href: "/changelog" },
];
