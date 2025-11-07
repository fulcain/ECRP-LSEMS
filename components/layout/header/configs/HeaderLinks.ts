export type HeaderLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export const headerLinks: HeaderLink[] = [
  {
    label: "Email Templates",
    children: [
      { label: "Division Templates", href: "/email-templates" },
      {
        label: "Communication Update Form",
        href: "/communication-update-form",
      },
    ],
  },
  { label: "Quick Links", href: "/quick-links" },
  { label: "Upcoming Course", href: "/upcoming-course" },
  { label: "Availability", href: "/availability" },
];
