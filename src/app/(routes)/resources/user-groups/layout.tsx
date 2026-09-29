import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Groups",
  description: "Add a member to one of the forum's own user groups",
};

export default function UserGroupsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
