import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Quick Links",
  description: "Quick Links for the GOV website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
