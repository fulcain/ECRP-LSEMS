import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Upcoming course",
  description: "Create a format for upcoming courses that uses the www.inyourowntime.zone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
