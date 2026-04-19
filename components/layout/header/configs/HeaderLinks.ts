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
  // { label: "RED", href: "/red-formats" }, TODO: uncomment this after the templates are fixed
  { label: "Quick Links", href: "/quick-links" },
  { label: "Upcoming Course", href: "/upcoming-course" },
  { label: "Availability", href: "/availability" },
];
