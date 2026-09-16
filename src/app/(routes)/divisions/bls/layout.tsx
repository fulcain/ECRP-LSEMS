import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LSEMS | BLS",
  description: "BLS application format builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
