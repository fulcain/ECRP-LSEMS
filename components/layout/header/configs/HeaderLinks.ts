export type HeaderLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export const headerLinks: HeaderLink[] = [
  {
    label: "Division Templates",
    href: "/email-templates",
  },
  { label: "Quick Links", href: "/quick-links" },
  { label: "Upcoming Course", href: "/upcoming-course" },
  { label: "Availability", href: "/availability" },
];
