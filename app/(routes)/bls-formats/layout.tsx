import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECRP LSEMS | BLS",
  description: "BLS application format builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
