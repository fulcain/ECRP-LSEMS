import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Availability",
  description: "Time of Availability converted from local to UTC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
