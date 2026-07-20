import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Email Templates",
  description: "Division Email Templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
