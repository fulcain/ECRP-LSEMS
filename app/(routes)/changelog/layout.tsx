import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | Change Log",
  description: "A history of updates and improvements to the LSEMS tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
