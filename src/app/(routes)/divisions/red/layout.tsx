import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RED",
  description: "RED application format builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
